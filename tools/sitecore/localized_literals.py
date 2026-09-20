from __future__ import annotations

import json
import re
from pathlib import Path

from sitecore.locales import (
    DEFAULT_LANGUAGE,
    PACK_NAME_RE,
    SUPPORTED_LANGUAGES,
    localized_route_for_page,
    page_key,
)


BRAND_RE = re.compile(r"আপনার নিহোন|Aponar Nihon|あなたの日本(?!語)", re.IGNORECASE)


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


def apply_reviewed_literal_replacements(root: Path) -> tuple[int, int]:
    """Apply authored locale entries to literals the HTML parser intentionally skips.

    The normal locale renderer translates reviewed visible text nodes. Static pages also
    contain user-facing strings in attributes and inline JavaScript (for example search
    labels and progress messages). Those strings must be authored in the selected language
    too, otherwise interaction can re-introduce Bengali after page load.

    This pass only uses entries from reviewed locale packs and only touches the generated
    locale HTML file for that pack. There is no machine translation or network fallback.
    """

    base_pages = [
        page
        for page in sorted(root.rglob("*.html"))
        if not page.relative_to(root).parts
        or page.relative_to(root).parts[0] not in SUPPORTED_LANGUAGES
    ]
    page_by_key = {page_key(page, root): page for page in base_pages}
    pack_dir = root / "assets" / "i18n" / "pages"
    changed_files = replacements = 0

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

        source_page = page_by_key.get(key)
        if source_page is None:
            continue
        output = root / language / localized_route_for_page(source_page, root) / "index.html"
        if not output.exists():
            continue

        document = output.read_text(encoding="utf-8")
        updated = document
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
            count = updated.count(source)
            if not count:
                continue
            updated = updated.replace(source, target)
            replacements += count

        if updated == document:
            continue
        output.write_text(updated, encoding="utf-8", newline="\n")
        changed_files += 1

    return changed_files, replacements
