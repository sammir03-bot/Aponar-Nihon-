from __future__ import annotations

import html as html_lib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit, urlunsplit


PRODUCTION_ORIGIN = "https://app.aponar-nihon.workers.dev"
DEFAULT_LANGUAGE = "bn"
SUPPORTED_LANGUAGES = ("ja", "en", "vi", "ne", "hi", "ur", "my", "zh", "si", "fil")
RTL_LANGUAGES = {"ur"}
BRAND_NAMES = {"ja": "あなたの日本"}

LANGUAGE_PATTERN = "|".join(
    sorted((re.escape(code) for code in SUPPORTED_LANGUAGES), key=len, reverse=True)
)
PACK_NAME_RE = re.compile(
    rf"^(?P<page>.+)\.(?P<language>{LANGUAGE_PATTERN})\.json$"
)
ALTERNATE_RE = re.compile(
    r'<link\b(?=[^>]*\brel=["\'][^"\']*\balternate\b[^"\']*["\'])'
    r'(?=[^>]*\bhreflang=["\'][^"\']+["\'])[^>]*>\s*',
    flags=re.IGNORECASE,
)
DESCRIPTION_RE = re.compile(
    r'<meta\b(?=[^>]*\bname=["\']description["\'])[^>]*>',
    flags=re.IGNORECASE,
)
TITLE_RE = re.compile(r"(<title\b[^>]*>)(.*?)(</title\s*>)", re.IGNORECASE | re.DOTALL)
HTML_TAG_RE = re.compile(r"<html\b([^>]*)>", re.IGNORECASE)
URL_ATTRIBUTE_RE = re.compile(
    r"(?P<prefix>\b(?:href|src|action)\s*=\s*)(?P<quote>[\"'])(?P<value>.*?)(?P=quote)",
    flags=re.IGNORECASE | re.DOTALL,
)

FIXED_BRAND_TEXT = {"আপনার নিহোন", "APONAR NIHON", "Aponar Nihon", "JAPANESE LEARNING HUB"}
EXCLUDED_LOCALIZED_PAGES = {"admin.html", "refresh-site.html"}
TRANSLATABLE_ATTRIBUTES = {"aria-label", "placeholder", "title", "alt"}
BUTTON_INPUT_TYPES = {"button", "submit", "reset"}
ATTRIBUTE_VALUE_RE = re.compile(
    r"""(?P<prefix>\s+(?P<name>aria-label|placeholder|title|alt|value|content)\s*=\s*)"""
    r"""(?P<quote>["'])(?P<value>.*?)(?P=quote)""",
    flags=re.IGNORECASE | re.DOTALL,
)

SKIP_TEXT_TAGS = {
    "script",
    "style",
    "noscript",
    "template",
    "code",
    "pre",
    "textarea",
    "svg",
    "ruby",
    "rt",
}
VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}


def _normalize(value: str) -> str:
    return " ".join(value.split())


class _ReviewedTranslationParser(HTMLParser):
    """Translate only exact reviewed text nodes while preserving Japanese study text."""

    def __init__(self, entries: dict[str, str]) -> None:
        super().__init__(convert_charrefs=False)
        self.entries = entries
        self.parts: list[str] = []
        self.stack: list[tuple[str, bool]] = []
        self.skip_depth = 0
        self.translation_count = 0

    @staticmethod
    def _must_preserve(tag: str, attrs: list[tuple[str, str | None]]) -> bool:
        if tag in SKIP_TEXT_TAGS:
            return True
        attributes = {name.lower(): (value or "") for name, value in attrs}
        if attributes.get("lang", "").lower().startswith("ja"):
            return True
        classes = set(attributes.get("class", "").split())
        return "jp" in classes or "data-i18n-no-content" in attributes

    def _translate_attributes(
        self,
        raw: str,
        tag: str,
        attrs: list[tuple[str, str | None]],
        skip_here: bool,
    ) -> str:
        if self.skip_depth or skip_here:
            return raw
        attributes = {name.lower(): (value or "") for name, value in attrs}
        allowed = set(TRANSLATABLE_ATTRIBUTES)
        if tag == "input" and attributes.get("type", "").lower() in BUTTON_INPUT_TYPES:
            allowed.add("value")
        if tag == "meta" and attributes.get("name", "").lower() == "description":
            allowed.add("content")

        def replace(match: re.Match[str]) -> str:
            name = match.group("name").lower()
            if name not in allowed:
                return match.group(0)
            source = _normalize(html_lib.unescape(match.group("value")))
            if not source or source in FIXED_BRAND_TEXT:
                return match.group(0)
            target = self.entries.get(source)
            if target is None:
                return match.group(0)
            self.translation_count += 1
            escaped = html_lib.escape(target, quote=True)
            return f"{match.group('prefix')}{match.group('quote')}{escaped}{match.group('quote')}"

        return ATTRIBUTE_VALUE_RE.sub(replace, raw)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        lower = tag.lower()
        skip_here = self._must_preserve(lower, attrs)
        raw = self.get_starttag_text()
        self.parts.append(self._translate_attributes(raw, lower, attrs, skip_here))
        if lower not in VOID_TAGS:
            self.stack.append((lower, skip_here))
            if skip_here:
                self.skip_depth += 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        lower = tag.lower()
        skip_here = self._must_preserve(lower, attrs)
        self.parts.append(
            self._translate_attributes(self.get_starttag_text(), lower, attrs, skip_here)
        )

    def handle_endtag(self, tag: str) -> None:
        lower = tag.lower()
        self.parts.append(f"</{tag}>")
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] != lower:
                continue
            removed = self.stack[index:]
            del self.stack[index:]
            self.skip_depth -= sum(1 for _name, skipped in removed if skipped)
            self.skip_depth = max(0, self.skip_depth)
            break

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            self.parts.append(data)
            return
        source = _normalize(data)
        if source in FIXED_BRAND_TEXT:
            self.parts.append(data)
            return
        target = self.entries.get(source)
        if not source or target is None:
            self.parts.append(data)
            return
        leading = re.match(r"^\s*", data).group(0)
        trailing = re.search(r"\s*$", data).group(0)
        self.parts.append(f"{leading}{target}{trailing}")
        self.translation_count += 1

    def handle_entityref(self, name: str) -> None:
        self.parts.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.parts.append(f"&#{name};")

    def handle_comment(self, data: str) -> None:
        self.parts.append(f"<!--{data}-->")

    def handle_decl(self, decl: str) -> None:
        self.parts.append(f"<!{decl}>")

    def handle_pi(self, data: str) -> None:
        self.parts.append(f"<?{data}>")

    def unknown_decl(self, data: str) -> None:
        self.parts.append(f"<![{data}]>")

    def document(self) -> str:
        return "".join(self.parts)


def page_key(path: Path, root: Path) -> str:
    rel = path.relative_to(root).as_posix()
    if rel == "index.html":
        return "index"
    if rel.lower().endswith(".html"):
        rel = rel[:-5]
    return re.sub(r"[^a-zA-Z0-9._-]+", "__", rel.strip("/")) or "index"


def localized_route_for_page(page: Path, root: Path) -> Path:
    rel = page.relative_to(root)
    if rel.as_posix() == "index.html":
        return Path()

    stem = rel.with_suffix("").as_posix()
    basename = Path(stem).name
    parent = Path(stem).parent

    hub_section = re.fullmatch(
        r"(?P<level>n[345])-(?P<section>grammar|kanji|reading|vocabulary|vocab)",
        basename,
        flags=re.IGNORECASE,
    )
    if hub_section:
        section = hub_section.group("section").lower().replace("vocab", "vocabulary")
        return parent / hub_section.group("level").lower() / section

    lesson = re.fullmatch(
        r"(?P<level>n[345])-(?P<section>grammar|vocab)-lesson-(?P<number>\d+)-real",
        basename,
        flags=re.IGNORECASE,
    )
    if lesson:
        section = lesson.group("section").lower().replace("vocab", "vocabulary")
        return (
            parent
            / lesson.group("level").lower()
            / section
            / f"lesson-{int(lesson.group('number')):02d}"
        )

    matome = re.fullmatch(r"(?P<level>n[345])-matome-(?P<section>.+)", basename, re.IGNORECASE)
    if matome:
        return parent / matome.group("level").lower() / f"matome-{matome.group('section').lower()}"

    return Path(stem)


def _public_path(path: Path, root: Path) -> str:
    rel = path.relative_to(root).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        rel = rel[: -len("index.html")]
    elif rel.endswith(".html"):
        rel = rel[:-5]
    return "/" + quote(rel, safe="/-._~")


def _url_for(path: Path, root: Path) -> str:
    return f"{PRODUCTION_ORIGIN}{_public_path(path, root)}"


def _set_document_locale(document: str, language: str, key: str) -> str:
    direction = "rtl" if language in RTL_LANGUAGES else "ltr"

    def replace(match: re.Match[str]) -> str:
        attrs = match.group(1)
        attrs = re.sub(
            r"\s+(?:lang|dir|data-language-preset|data-i18n-page)\s*=\s*([\"']).*?\1",
            "",
            attrs,
            flags=re.IGNORECASE | re.DOTALL,
        )
        return (
            f'<html{attrs} lang="{language}" dir="{direction}" '
            f'data-language-preset="{language}" data-i18n-page="{html_lib.escape(key, quote=True)}">'
        )

    return HTML_TAG_RE.sub(replace, document, count=1)


def _rewrite_relative_urls(document: str, source_page: Path, root: Path) -> str:
    root_resolved = root.resolve()

    def replace(match: re.Match[str]) -> str:
        value = match.group("value").strip()
        if not value or value.startswith(("/", "#", "?", "//")):
            return match.group(0)
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc or not parsed.path:
            return match.group(0)
        candidate = (source_page.parent / unquote(parsed.path)).resolve()
        try:
            rel = candidate.relative_to(root_resolved).as_posix()
        except ValueError:
            return match.group(0)
        rewritten = urlunsplit(("", "", "/" + quote(rel, safe="/-._~"), parsed.query, parsed.fragment))
        return f"{match.group('prefix')}{match.group('quote')}{rewritten}{match.group('quote')}"

    return URL_ATTRIBUTE_RE.sub(replace, document)


def _truncate_description(value: str, limit: int = 165) -> str:
    text = _normalize(value)
    if len(text) <= limit:
        return text
    shortened = text[: limit - 1]
    if " " in shortened:
        shortened = shortened.rsplit(" ", 1)[0]
    return shortened.rstrip(" ,.;:—-") + "…"


def _localize_metadata(document: str, language: str, entries: dict[str, str]) -> str:
    """Text and description metadata are translated by the exact-match HTML parser."""
    return document


def _inject_alternates(document: str, alternates: list[tuple[str, str]]) -> str:
    cleaned = ALTERNATE_RE.sub("", document)
    tags = "\n".join(
        f'<link rel="alternate" hreflang="{html_lib.escape(language, quote=True)}" '
        f'href="{html_lib.escape(url, quote=True)}">'
        for language, url in alternates
    )
    return re.sub(r"</head\s*>", f"\n{tags}\n</head>", cleaned, count=1, flags=re.IGNORECASE)


def _load_reviewed_packs(root: Path) -> dict[str, dict[str, dict[str, object]]]:
    pack_dir = root / "assets" / "i18n" / "pages"
    packs: dict[str, dict[str, dict[str, object]]] = {}
    for path in sorted(pack_dir.glob("*.json")):
        match = PACK_NAME_RE.match(path.name)
        if not match:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        language = match.group("language")
        key = match.group("page")
        if (
            payload.get("reviewed") is not True
            or payload.get("sourceLanguage") != DEFAULT_LANGUAGE
            or payload.get("targetLanguage") != language
            or payload.get("page") != key
        ):
            continue
        packs.setdefault(key, {})[language] = payload
    return packs


def _load_reviewed_memories(root: Path) -> dict[str, dict[str, str]]:
    memory_dir = root / "translations"
    memories: dict[str, dict[str, str]] = {}
    for language in SUPPORTED_LANGUAGES:
        path = memory_dir / f"{language}.json"
        if not path.exists():
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
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


def localized_route_plan(pages: list[Path], root: Path) -> dict[Path, Path]:
    """Return the deterministic, collision-free locale route for every source page."""

    planned: dict[Path, Path] = {}
    used: dict[Path, Path] = {}
    for page in pages:
        route = localized_route_for_page(page, root)
        if route in used:
            route = page.relative_to(root).with_suffix("")
        candidate = route
        suffix = 2
        while candidate in used:
            candidate = route.parent / f"{route.name}-{suffix}"
            suffix += 1
        planned[page] = candidate
        used[candidate] = page
    return planned


def build_localized_pages(root: Path) -> tuple[int, int, int]:
    """Render every reviewed memory into locale routes and hreflang clusters."""
    base_pages = [
        page
        for page in sorted(root.rglob("*.html"))
        if page.relative_to(root).parts
        and page.relative_to(root).parts[0] not in SUPPORTED_LANGUAGES
        and page.name not in EXCLUDED_LOCALIZED_PAGES
        and not page.name.startswith("google")
    ]
    page_by_key: dict[str, Path] = {}
    for page in base_pages:
        key = page_key(page, root)
        if key in page_by_key:
            raise RuntimeError(f"Duplicate i18n page key: {key}")
        page_by_key[key] = page

    memories = _load_reviewed_memories(root)
    packs = _load_reviewed_packs(root)
    if memories and set(memories) != set(SUPPORTED_LANGUAGES):
        missing = sorted(set(SUPPORTED_LANGUAGES) - set(memories))
        raise RuntimeError("Missing reviewed translation memories: " + ", ".join(missing))

    route_by_page = localized_route_plan(list(page_by_key.values()), root)
    clusters: dict[Path, dict[str, Path]] = {}
    generated = translated_nodes = 0

    for key, source_page in sorted(page_by_key.items()):
        source_document = source_page.read_text(encoding="utf-8")
        route = route_by_page[source_page]
        language_packs = packs.get(key, {})

        for language in SUPPORTED_LANGUAGES:
            memory_entries = memories.get(language)
            payload = language_packs.get(language)
            if memory_entries is None and payload is None:
                continue

            if memory_entries is None:
                entries: dict[str, str] = {}
            else:
                entries = memory_entries
            if payload is not None:
                overrides = {
                    _normalize(str(entry["source"])): str(entry["target"]).strip()
                    for entry in payload["entries"]
                    if isinstance(entry, dict) and entry.get("source") and entry.get("target")
                }
                if overrides:
                    entries = dict(entries)
                    entries.update(overrides)

            parser = _ReviewedTranslationParser(entries)
            parser.feed(source_document)
            parser.close()
            localized = parser.document()
            localized = _set_document_locale(localized, language, key)
            localized = _rewrite_relative_urls(localized, source_page, root)
            localized = _localize_metadata(localized, language, entries)

            output = root / language / route / "index.html"
            if output.exists():
                raise RuntimeError(f"Localized route collision: {output.relative_to(root)}")
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(localized, encoding="utf-8", newline="\n")
            clusters.setdefault(source_page, {})[language] = output
            generated += 1
            translated_nodes += parser.translation_count

    for source_page, localized_pages in clusters.items():
        alternates = [
            ("x-default", _url_for(source_page, root)),
            (DEFAULT_LANGUAGE, _url_for(source_page, root)),
        ]
        alternates.extend(
            (language, _url_for(localized_pages[language], root))
            for language in SUPPORTED_LANGUAGES
            if language in localized_pages
        )

        source_document = source_page.read_text(encoding="utf-8")
        source_page.write_text(
            _inject_alternates(source_document, alternates),
            encoding="utf-8",
            newline="\n",
        )
        for localized_page in localized_pages.values():
            document = localized_page.read_text(encoding="utf-8")
            localized_page.write_text(
                _inject_alternates(document, alternates),
                encoding="utf-8",
                newline="\n",
            )

    return generated, len(clusters), translated_nodes
