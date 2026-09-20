from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from sitecore.locales import (
    DEFAULT_LANGUAGE,
    PACK_NAME_RE,
    SUPPORTED_LANGUAGES,
    _candidate_source_page,
    _public_path,
    localized_route_for_page,
    page_key,
)


BRAND_RE = re.compile(r"আপনার নিহোন|Aponar Nihon|あなたの日本(?!語)", re.IGNORECASE)
DATA_HREF_RE = re.compile(
    r"(?P<prefix>\bdata-href\s*=\s*)(?P<quote>[\"'])(?P<value>.*?)(?P=quote)",
    re.IGNORECASE | re.DOTALL,
)


def _preserve_brand(source: str, target: str) -> str:
    originals = BRAND_RE.findall(source)
    if not originals:
        return target
    cursor = 0

    def replace(_match: re.Match[str]) -> str:
        nonlocal cursor
        value = originals[min(cursor, len(originals) - 1)]
        cursor += 1
        return value

    preserved, count = BRAND_RE.subn(replace, target)
    if count == 0 and BRAND_RE.fullmatch(" ".join(source.split())):
        return originals[0]
    return preserved


def _literal_variants(source: str, target: str) -> list[tuple[str, str]]:
    """Return authored raw and common URL-space encoded forms."""

    variants = [(source, target)]
    for marker in ("%20", "+"):
        encoded_source = source.replace(" ", marker)
        encoded_target = target.replace(" ", marker)
        if encoded_source != source:
            variants.append((encoded_source, encoded_target))
    return variants


def _replace_json_const(
    document: str,
    variable: str,
    config: object,
    *,
    pack_name: str,
) -> tuple[str, int]:
    """Merge authored locale fields into a JSON-valued inline JS constant.

    Lesson pages often keep structured learning data in an inline constant such as
    `const WORDS = [...]`. A locale pack can patch only the language-specific fields while
    preserving Japanese, romaji, IDs and application logic byte-for-byte in meaning.

    Pack shape:
      "scriptData": {
        "WORDS": {
          "key": "no",
          "rows": [{"no": 1, "bn": "…", "cat": "…", "ex_bn": "…"}]
        }
      }
    """

    if not isinstance(config, dict):
        raise RuntimeError(f"{pack_name}: scriptData.{variable} must be an object")
    key_name = config.get("key")
    rows = config.get("rows")
    if not isinstance(key_name, str) or not key_name:
        raise RuntimeError(f"{pack_name}: scriptData.{variable}.key must be a non-empty string")
    if not isinstance(rows, list) or not rows:
        raise RuntimeError(f"{pack_name}: scriptData.{variable}.rows must be a non-empty list")

    marker = re.search(rf"\bconst\s+{re.escape(variable)}\s*=\s*", document)
    if marker is None:
        raise RuntimeError(f"{pack_name}: inline const {variable} was not found in generated HTML")

    start = marker.end()
    try:
        source_data, consumed = json.JSONDecoder().raw_decode(document[start:])
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{pack_name}: const {variable} is not JSON-compatible: {exc}") from exc
    if not isinstance(source_data, list):
        raise RuntimeError(f"{pack_name}: const {variable} must decode to a JSON array")

    by_key: dict[object, dict[str, object]] = {}
    for item in source_data:
        if not isinstance(item, dict) or key_name not in item:
            raise RuntimeError(f"{pack_name}: const {variable} contains a row without {key_name}")
        by_key[item[key_name]] = item

    field_updates = 0
    seen_keys: set[object] = set()
    for patch in rows:
        if not isinstance(patch, dict) or key_name not in patch:
            raise RuntimeError(f"{pack_name}: scriptData.{variable} row is missing {key_name}")
        row_key = patch[key_name]
        if row_key in seen_keys:
            raise RuntimeError(f"{pack_name}: duplicate scriptData.{variable} key {row_key!r}")
        seen_keys.add(row_key)
        target = by_key.get(row_key)
        if target is None:
            raise RuntimeError(
                f"{pack_name}: scriptData.{variable} key {row_key!r} has no source row"
            )
        for field, value in patch.items():
            if field == key_name:
                continue
            if field not in target:
                raise RuntimeError(
                    f"{pack_name}: scriptData.{variable}[{row_key!r}] source has no field {field!r}"
                )
            if not isinstance(value, (str, int, float, bool)) and value is not None:
                raise RuntimeError(
                    f"{pack_name}: scriptData.{variable}[{row_key!r}].{field} has unsupported value"
                )
            if target[field] != value:
                target[field] = value
                field_updates += 1

    encoded = json.dumps(source_data, ensure_ascii=False, separators=(",", ":"))
    end = start + consumed
    return document[:start] + encoded + document[end:], field_updates


def _apply_script_data(document: str, payload: dict[str, object], pack_name: str) -> tuple[str, int]:
    script_data = payload.get("scriptData")
    if script_data is None:
        return document, 0
    if not isinstance(script_data, dict) or not script_data:
        raise RuntimeError(f"{pack_name}: scriptData must be a non-empty object")

    updated = document
    field_updates = 0
    for variable, config in script_data.items():
        if not isinstance(variable, str) or not re.fullmatch(r"[A-Za-z_$][A-Za-z0-9_$]*", variable):
            raise RuntimeError(f"{pack_name}: invalid scriptData variable name {variable!r}")
        updated, count = _replace_json_const(updated, variable, config, pack_name=pack_name)
        field_updates += count
    return updated, field_updates


def _rewrite_data_hrefs(
    document: str,
    source_page: Path,
    root: Path,
    language: str,
    source_pages: dict[Path, Path],
    pack_languages: dict[str, set[str]],
) -> tuple[str, int]:
    """Make JS/card data-href routes agree with normal localized anchors.

    `locales.py` already rewrites regular href attributes before generated HTML is written.
    Interactive cards on some hubs navigate through `data-href`, so those values must be
    localized too. When a target has no authored pack yet we make the source path absolute
    to avoid a broken nested-relative URL; authored targets always stay in the selected
    locale route.
    """

    changed = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal changed
        value = match.group("value").strip()
        if not value or value.startswith(("#", "?", "//", "mailto:", "tel:", "javascript:")):
            return match.group(0)
        parsed = urlsplit(value)
        candidate = _candidate_source_page(value, source_page, root)
        if candidate is None:
            return match.group(0)
        target_page = source_pages.get(candidate)
        if target_page is None:
            return match.group(0)
        target_key = page_key(target_page, root)
        if language in pack_languages.get(target_key, set()):
            output = root / language / localized_route_for_page(target_page, root) / "index.html"
            target_path = _public_path(output, root)
        else:
            target_path = _public_path(target_page, root)
        rewritten = urlunsplit(("", "", target_path, parsed.query, parsed.fragment))
        if rewritten == value:
            return match.group(0)
        changed += 1
        return f"{match.group('prefix')}{match.group('quote')}{rewritten}{match.group('quote')}"

    return DATA_HREF_RE.sub(replace, document), changed


def apply_reviewed_literal_replacements(root: Path) -> tuple[int, int]:
    """Apply authored locale entries, dynamic routes and structured inline lesson data.

    The normal locale renderer translates reviewed visible text nodes. Static pages also
    contain user-facing strings in attributes, encoded URLs and inline JavaScript. Some
    lesson pages additionally keep vocabulary/quiz data in JSON-compatible JS constants.
    Locale packs can patch those structured fields through `scriptData` without cloning the
    Japanese source or application logic.

    This pass only uses authored reviewed locale packs and only touches the generated locale
    HTML file for that pack. There is no machine translation or network fallback.
    """

    base_pages = [
        page
        for page in sorted(root.rglob("*.html"))
        if not page.relative_to(root).parts
        or page.relative_to(root).parts[0] not in SUPPORTED_LANGUAGES
    ]
    page_by_key = {page_key(page, root): page for page in base_pages}
    source_pages = {page.resolve(): page for page in base_pages}
    pack_dir = root / "assets" / "i18n" / "pages"
    reviewed_packs: list[tuple[Path, str, str, dict[str, object]]] = []
    pack_languages: dict[str, set[str]] = {}

    for pack_path in sorted(pack_dir.glob("*.json")):
        match = PACK_NAME_RE.match(pack_path.name)
        if not match:
            continue
        payload = json.loads(pack_path.read_text(encoding="utf-8"))
        language = match.group("language")
        key = match.group("page")
        if (
            payload.get("reviewed") is not True
            or payload.get("sourceLanguage") != DEFAULT_LANGUAGE
            or payload.get("targetLanguage") != language
            or payload.get("page") != key
        ):
            continue
        reviewed_packs.append((pack_path, language, key, payload))
        pack_languages.setdefault(key, set()).add(language)

    changed_files = replacements = 0
    for pack_path, language, key, payload in reviewed_packs:
        source_page = page_by_key.get(key)
        if source_page is None:
            continue
        output = root / language / localized_route_for_page(source_page, root) / "index.html"
        if not output.exists():
            continue

        document = output.read_text(encoding="utf-8")
        updated, route_updates = _rewrite_data_hrefs(
            document,
            source_page,
            root,
            language,
            source_pages,
            pack_languages,
        )
        replacements += route_updates
        updated, script_updates = _apply_script_data(updated, payload, pack_path.name)
        replacements += script_updates

        for entry in sorted(
            (item for item in payload.get("entries", []) if isinstance(item, dict)),
            key=lambda item: len(str(item.get("source", ""))),
            reverse=True,
        ):
            source = str(entry.get("source", "")).strip()
            target = str(entry.get("target", "")).strip()
            if not source or not target:
                continue
            target = _preserve_brand(source, target)
            for source_variant, target_variant in _literal_variants(source, target):
                count = updated.count(source_variant)
                if not count:
                    continue
                updated = updated.replace(source_variant, target_variant)
                replacements += count

        if updated == document:
            continue
        output.write_text(updated, encoding="utf-8", newline="\n")
        changed_files += 1

    return changed_files, replacements
