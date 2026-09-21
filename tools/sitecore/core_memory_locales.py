from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from sitecore.i18n_policy import is_static_core_page, load_core_policy
from sitecore.localized_literals import _literal_variants
from sitecore.locales import (
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    _ReviewedTranslationParser,
    _candidate_source_page,
    _inject_alternates,
    _load_reviewed_packs,
    _localize_metadata,
    _normalize,
    _preserve_brand_names,
    _public_path,
    _rewrite_relative_urls,
    _set_document_locale,
    _url_for,
    localized_route_for_page,
    page_key,
)


LINK_ATTRIBUTE_RE = re.compile(
    r"(?P<prefix>\b(?:href|data-href)\s*=\s*)(?P<quote>[\"'])(?P<value>.*?)(?P=quote)",
    flags=re.IGNORECASE | re.DOTALL,
)


def load_reviewed_core_memories(memory_root: Path) -> dict[str, dict[str, str]]:
    """Load complete reviewed Bengali -> target translation memories.

    Translation memories are repository build inputs, not public runtime dependencies.
    A memory is ignored until it is explicitly marked reviewed=true. This keeps partial
    AI checkpoints from leaking into production pages.
    """

    memories: dict[str, dict[str, str]] = {}
    for language in SUPPORTED_LANGUAGES:
        path = memory_root / f"{language}.json"
        if not path.exists():
            continue
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"Invalid core translation memory {path}: {exc}") from exc
        if (
            payload.get("reviewed") is not True
            or payload.get("sourceLanguage") != DEFAULT_LANGUAGE
            or payload.get("targetLanguage") != language
        ):
            continue
        entries = {
            _normalize(str(entry["source"])): str(entry["target"]).strip()
            for entry in payload.get("entries", [])
            if isinstance(entry, dict) and entry.get("source") and entry.get("target")
        }
        if entries:
            memories[language] = entries
    return memories


def _page_pack_entries(payload: dict[str, object] | None) -> dict[str, str]:
    if payload is None:
        return {}
    return {
        _normalize(str(entry["source"])): str(entry["target"]).strip()
        for entry in payload.get("entries", [])
        if isinstance(entry, dict) and entry.get("source") and entry.get("target")
    }


def _apply_memory_literals(document: str, entries: dict[str, str]) -> tuple[str, int]:
    """Translate reviewed attributes/inline JS literals missed by the HTML text parser."""

    updated = document
    replacements = 0
    for source, raw_target in sorted(entries.items(), key=lambda item: len(item[0]), reverse=True):
        if not source or not raw_target:
            continue
        target = _preserve_brand_names(source, raw_target)
        for source_variant, target_variant in _literal_variants(source, target):
            count = updated.count(source_variant)
            if not count:
                continue
            updated = updated.replace(source_variant, target_variant)
            replacements += count
    return updated, replacements


def _rewrite_core_links(
    document: str,
    source_page: Path,
    root: Path,
    language: str,
    source_pages: dict[Path, Path],
    available_by_key: dict[str, set[str]],
) -> str:
    """Keep href and JS card data-href navigation inside an authored locale."""

    def replace(match: re.Match[str]) -> str:
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
        if language not in available_by_key.get(target_key, set()):
            return match.group(0)

        output = root / language / localized_route_for_page(target_page, root) / "index.html"
        rewritten = urlunsplit(("", "", _public_path(output, root), parsed.query, parsed.fragment))
        return f"{match.group('prefix')}{match.group('quote')}{rewritten}{match.group('quote')}"

    return LINK_ATTRIBUTE_RE.sub(replace, document)


def build_core_memory_pages(root: Path, memory_root: Path) -> tuple[int, int, int, int]:
    """Render reviewed all-language memories over static-core pages.

    Order of precedence is:
      Bengali source < reviewed core memory < page-specific reviewed pack < scriptData pass.

    The ordinary page-pack renderer runs first. This renderer then fills every static-core
    page for each complete memory language and overwrites only the generated locale HTML,
    never the Bengali source. Page packs remain the authoritative override for page-specific
    wording, and the later localized-literal/scriptData pass remains authoritative for
    structured learning data.
    """

    memories = load_reviewed_core_memories(memory_root)
    if not memories:
        return 0, 0, 0, 0

    policy = load_core_policy(root)
    base_pages = [
        page
        for page in sorted(root.rglob("*.html"))
        if page.relative_to(root).parts
        and page.relative_to(root).parts[0] not in SUPPORTED_LANGUAGES
    ]
    page_by_key: dict[str, Path] = {}
    source_pages: dict[Path, Path] = {}
    for page in base_pages:
        key = page_key(page, root)
        if key in page_by_key:
            raise RuntimeError(f"Duplicate i18n page key: {key}")
        page_by_key[key] = page
        source_pages[page.resolve()] = page

    packs = _load_reviewed_packs(root)
    available_by_key: dict[str, set[str]] = {
        key: set(language_packs)
        for key, language_packs in packs.items()
    }
    for key in page_by_key:
        if is_static_core_page(key, policy):
            available_by_key.setdefault(key, set()).update(memories)

    generated = clusters = translated_nodes = literal_replacements = 0

    for key, source_page in sorted(page_by_key.items()):
        if not is_static_core_page(key, policy):
            continue
        source_document = source_page.read_text(encoding="utf-8")
        route = localized_route_for_page(source_page, root)
        language_packs = packs.get(key, {})
        localized_pages: dict[str, Path] = {}

        for language in SUPPORTED_LANGUAGES:
            memory_entries = memories.get(language)
            if memory_entries is None:
                # A page pack may already have produced this route in the first renderer.
                if language in language_packs:
                    existing = root / language / route / "index.html"
                    if existing.exists():
                        localized_pages[language] = existing
                continue

            entries = dict(memory_entries)
            entries.update(_page_pack_entries(language_packs.get(language)))

            parser = _ReviewedTranslationParser(entries)
            parser.feed(source_document)
            parser.close()
            localized = parser.document()
            localized = _set_document_locale(localized, language, key)
            localized, literal_count = _apply_memory_literals(localized, entries)
            localized = _rewrite_core_links(
                localized,
                source_page,
                root,
                language,
                source_pages,
                available_by_key,
            )
            localized = _rewrite_relative_urls(localized, source_page, root)
            localized = _localize_metadata(localized, language, entries)

            output = root / language / route / "index.html"
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(localized, encoding="utf-8", newline="\n")
            localized_pages[language] = output
            generated += 1
            translated_nodes += parser.translation_count
            literal_replacements += literal_count

        # Include pack-only languages in the hreflang cluster even before a full memory exists.
        for language in language_packs:
            output = root / language / route / "index.html"
            if output.exists():
                localized_pages.setdefault(language, output)

        if not localized_pages:
            continue
        clusters += 1
        alternates = [
            ("x-default", _url_for(source_page, root)),
            (DEFAULT_LANGUAGE, _url_for(source_page, root)),
        ]
        alternates.extend(
            (language, _url_for(localized_pages[language], root))
            for language in SUPPORTED_LANGUAGES
            if language in localized_pages
        )
        source_page.write_text(
            _inject_alternates(source_page.read_text(encoding="utf-8"), alternates),
            encoding="utf-8",
            newline="\n",
        )
        for localized_page in localized_pages.values():
            localized_page.write_text(
                _inject_alternates(localized_page.read_text(encoding="utf-8"), alternates),
                encoding="utf-8",
                newline="\n",
            )

    return generated, clusters, translated_nodes, literal_replacements
