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
BRAND_RE = re.compile(r"আপনার নিহোন|Aponar Nihon|あなたの日本(?!語)", re.IGNORECASE)
BENGALI_RE = re.compile(r"[\u0980-\u09FF]")

# Run 20 (2026-11-21): pages audited (Run 17 + the Run 19/20 inventories) for
# text the authoring serializer wrote with HTML entities (&darr;, &#9997;,
# &amp;) while the reviewed pack sources hold the decoded characters, so the
# entries never matched. On these pages only, a text run containing an
# entity/character reference is also matched in entity-decoded form. The same
# matching gap exists on unaudited pages (N3, SSW, legacy vocabulary) and is
# deliberately NOT changed here; widening this set is a separate decision.
ENTITY_DECODE_PAGES = {
    "n5-kanji",
    "n4-kanji",
    "n4-grammar-lesson-41-real",
    "n4-grammar-lesson-42-real",
    "n4-grammar-lesson-43-real",
}

LANGUAGE_PATTERN = "|".join(
    sorted((re.escape(code) for code in SUPPORTED_LANGUAGES), key=len, reverse=True)
)


def _preserve_brand_names(source: str, target: str) -> str:
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
    if count == 0 and BRAND_RE.fullmatch(_normalize(source)):
        return originals[0]
    return preserved
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
    """Translate only exact reviewed text nodes while preserving Japanese study text.

    Character content is buffered into text runs (data + entity/character
    references, exactly the spans the pack extractor collected with
    convert_charrefs=True) and flushed at every markup boundary.

    Preserve kinds: "hard" elements (script/style/ruby/rt, lang="ja" blocks,
    data-i18n-no-content) are emitted byte-for-byte. "soft" elements — the
    site's class="jp" Japanese-study blocks — are also preserved, EXCEPT that
    a whole run whose decoded, normalized form contains Bengali and exactly
    matches a reviewed pack source is replaced by its reviewed target (Run 20:
    the N4-grammar formation fragments inside jp blocks; Japanese-only runs
    never match, so Japanese text stays byte-identical).

    On ENTITY_DECODE_PAGES, an unpreserved run containing at least one
    entity/character reference is additionally matched in decoded form (the
    kanji hero buttons and the lesson 41-43 heading). A whole-run match whose
    brand-preserved target equals the source is an identity translation and
    falls through to the legacy per-chunk behaviour, so no-op entries never
    change bytes. Everywhere else the legacy per-chunk matching applies
    unchanged.
    """

    def __init__(self, entries: dict[str, str], decode_entities: bool = False) -> None:
        super().__init__(convert_charrefs=False)
        self.entries = entries
        self.decode_entities = decode_entities
        self.parts: list[str] = []
        self.stack: list[tuple[str, str | None]] = []
        self.preserve_kinds: list[str] = []
        self.translation_count = 0
        # Buffered character-content run: (raw, decoded, is_data).
        self._run: list[tuple[str, str, bool]] = []

    @property
    def skip_depth(self) -> int:
        return len(self.preserve_kinds)

    @staticmethod
    def _preserve_kind(tag: str, attrs: list[tuple[str, str | None]]) -> str | None:
        if tag in SKIP_TEXT_TAGS:
            return "hard"
        attributes = {name.lower(): (value or "") for name, value in attrs}
        classes = set(attributes.get("class", "").split())
        if "jp" in classes:
            return "soft"
        if attributes.get("lang", "").lower().startswith("ja"):
            return "hard"
        if "data-i18n-no-content" in attributes:
            return "hard"
        return None

    def _replace(self, raw_text: str, source: str, target: str) -> None:
        """Legacy replacement: brand-preserved target wrapped in the raw
        text's own leading/trailing whitespace."""
        target = _preserve_brand_names(source, target)
        leading = re.match(r"^\s*", raw_text).group(0)
        trailing = re.search(r"\s*$", raw_text).group(0)
        self.parts.append(f"{leading}{target}{trailing}")
        self.translation_count += 1

    def _try_whole_run(self, raw_text: str, decoded_text: str) -> bool:
        """Emit the run via an exact decoded pack match. Returns False
        (emitting nothing) when there is no match, when the run carries the
        brand (brand-bearing text stays on the legacy path: a few pack
        entries render the brand in another script, which the site never
        applies), or when the match is an identity translation — those fall
        through to the legacy behaviour so bytes never change for a no-op."""
        source = _normalize(decoded_text)
        if not source or BRAND_RE.search(source):
            return False
        target = self.entries.get(source)
        if target is None:
            return False
        if _preserve_brand_names(source, target) == source:
            return False
        self._replace(raw_text, source, target)
        return True

    def _flush_run(self) -> None:
        if not self._run:
            return
        run, self._run = self._run, []
        kind = self.preserve_kinds[-1] if self.preserve_kinds else None
        raw_text = "".join(raw for raw, _decoded, _is_data in run)
        if kind == "hard":
            self.parts.extend(raw for raw, _decoded, _is_data in run)
            return
        if kind == "soft":
            decoded_text = "".join(decoded for _raw, decoded, _is_data in run)
            source = _normalize(decoded_text)
            if source and BENGALI_RE.search(source):
                if self._try_whole_run(raw_text, decoded_text):
                    return
            self.parts.extend(raw for raw, _decoded, _is_data in run)
            return
        if self.decode_entities and any(not is_data for _raw, _dec, is_data in run):
            decoded_text = "".join(decoded for _raw, decoded, _is_data in run)
            if self._try_whole_run(raw_text, decoded_text):
                return
        # Legacy per-chunk behaviour, unchanged.
        for raw, _decoded, is_data in run:
            if not is_data:
                self.parts.append(raw)
                continue
            source = _normalize(raw)
            target = self.entries.get(source)
            if not source or target is None:
                self.parts.append(raw)
            else:
                self._replace(raw, source, target)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._flush_run()
        lower = tag.lower()
        self.parts.append(self.get_starttag_text())
        kind = self._preserve_kind(lower, attrs)
        if lower not in VOID_TAGS:
            self.stack.append((lower, kind))
            if kind is not None:
                self.preserve_kinds.append(kind)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._flush_run()
        self.parts.append(self.get_starttag_text())

    def handle_endtag(self, tag: str) -> None:
        self._flush_run()
        lower = tag.lower()
        self.parts.append(f"</{tag}>")
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] != lower:
                continue
            removed = self.stack[index:]
            del self.stack[index:]
            preserved = sum(1 for _name, kind in removed if kind is not None)
            if preserved:
                del self.preserve_kinds[-preserved:]
            break

    def handle_data(self, data: str) -> None:
        self._run.append((data, data, True))

    def handle_entityref(self, name: str) -> None:
        raw = f"&{name};"
        self._run.append((raw, html_lib.unescape(raw), False))

    def handle_charref(self, name: str) -> None:
        raw = f"&#{name};"
        self._run.append((raw, html_lib.unescape(raw), False))

    def handle_comment(self, data: str) -> None:
        self._flush_run()
        self.parts.append(f"<!--{data}-->")

    def handle_decl(self, decl: str) -> None:
        self._flush_run()
        self.parts.append(f"<!{decl}>")

    def handle_pi(self, data: str) -> None:
        self._flush_run()
        self.parts.append(f"<?{data}>")

    def unknown_decl(self, data: str) -> None:
        self._flush_run()
        self.parts.append(f"<![{data}]>")

    def document(self) -> str:
        self._flush_run()
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
        # Phase-1 fix (2026-11-19): "vocabulary".replace("vocab", "vocabulary")
        # produced "vocabularyulary", and the capitalised legacy page
        # N5-Vocabulary.html collided with n5-vocabulary.html on the same
        # route. Keep the legacy capitalised page on its own stem route;
        # map "vocab" -> "vocabulary" only when the section is exactly "vocab".
        if basename != basename.lower():
            return Path(stem)
        section_raw = hub_section.group("section").lower()
        section = "vocabulary" if section_raw == "vocab" else section_raw
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
    def replace_title(match: re.Match[str]) -> str:
        source_title = match.group(2)
        title = source_title
        for source, target in sorted(entries.items(), key=lambda item: len(item[0]), reverse=True):
            title = title.replace(source, target)
        title = _preserve_brand_names(source_title, title)
        return f"{match.group(1)}{title}{match.group(3)}"

    document = TITLE_RE.sub(replace_title, document, count=1)
    candidates = [target for target in entries.values() if len(_normalize(target)) >= 55]
    if not candidates:
        return document
    description = _truncate_description(max(candidates, key=lambda item: len(_normalize(item))))
    snippet = f'<meta name="description" content="{html_lib.escape(description, quote=True)}">'
    if DESCRIPTION_RE.search(document):
        return DESCRIPTION_RE.sub(snippet, document, count=1)
    return re.sub(r"</head\s*>", f"\n{snippet}\n</head>", document, count=1, flags=re.IGNORECASE)


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


def build_localized_pages(root: Path) -> tuple[int, int, int]:
    """Render reviewed packs into locale routes and add canonical hreflang clusters."""
    base_pages = [
        page
        for page in sorted(root.rglob("*.html"))
        if not page.relative_to(root).parts
        or page.relative_to(root).parts[0] not in SUPPORTED_LANGUAGES
    ]
    page_by_key: dict[str, Path] = {}
    for page in base_pages:
        key = page_key(page, root)
        # Every native/base document is explicitly Bangla. Locale copies override this below.
        source_document = page.read_text(encoding="utf-8")
        native_document = _set_document_locale(source_document, DEFAULT_LANGUAGE, key)
        if native_document != source_document:
            page.write_text(native_document, encoding="utf-8", newline="\n")
        if key in page_by_key:
            raise RuntimeError(f"Duplicate i18n page key: {key}")
        page_by_key[key] = page

    packs = _load_reviewed_packs(root)
    clusters: dict[Path, dict[str, Path]] = {}
    generated = translated_nodes = 0

    for key, language_packs in sorted(packs.items()):
        source_page = page_by_key.get(key)
        if source_page is None:
            raise RuntimeError(f"Translation pack has no source HTML page: {key}")
        source_document = source_page.read_text(encoding="utf-8")
        route = localized_route_for_page(source_page, root)

        for language in SUPPORTED_LANGUAGES:
            payload = language_packs.get(language)
            if payload is None:
                continue
            entries = {
                _normalize(str(entry["source"])): str(entry["target"]).strip()
                for entry in payload["entries"]
                if isinstance(entry, dict) and entry.get("source") and entry.get("target")
            }
            parser = _ReviewedTranslationParser(
                entries, decode_entities=key in ENTITY_DECODE_PAGES
            )
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
