from __future__ import annotations

import datetime
import html as html_lib
import os
import re
from pathlib import Path
from urllib.parse import quote

from sitecore.htmltools import visible_text_hash
from sitecore.locales import SUPPORTED_LANGUAGES, localized_route_for_page, page_key
from sitecore.search_index import should_index


PRODUCTION_ORIGIN = "https://app.aponar-nihon.workers.dev"
VERIFICATION_FILE = Path(__file__).resolve().parents[1] / "google-site-verification.txt"


def _clean_public_path(path: Path, root: Path) -> str:
    """Return the URL path Cloudflare Static Assets actually serves.

    wrangler.toml uses html_handling = "auto-trailing-slash", so public HTML
    files are exposed as clean URLs (for example /n5-grammar, not
    /n5-grammar.html). Canonicals and the sitemap must match that final URL.
    """
    rel = path.relative_to(root).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        rel = rel[: -len("index.html")]
    elif rel.endswith(".html"):
        rel = rel[:-5]
    return "/" + quote(rel, safe="/-._~")


def _url_for(path: Path, root: Path) -> str:
    return f"{PRODUCTION_ORIGIN}{_clean_public_path(path, root)}"


def _load_verification_token() -> str:
    raw = os.environ.get("GOOGLE_SITE_VERIFICATION", "").strip()
    if not raw and VERIFICATION_FILE.exists():
        for line in VERIFICATION_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                raw = line
                break
    if not raw:
        return ""

    match = re.search(
        r'name=["\']google-site-verification["\'][^>]*content=["\']([^"\']+)["\']',
        raw,
        flags=re.IGNORECASE,
    )
    if not match:
        match = re.search(
            r'content=["\']([^"\']+)["\'][^>]*name=["\']google-site-verification["\']',
            raw,
            flags=re.IGNORECASE,
        )
    return (match.group(1) if match else raw).strip()


def _inject_head_snippet(document: str, snippet: str) -> str:
    if snippet in document or "</head" not in document.lower():
        return document
    return re.sub(
        r"</head\s*>",
        "\n" + snippet + "\n</head>",
        document,
        count=1,
        flags=re.IGNORECASE,
    )


def apply_seo_metadata(root: Path) -> tuple[int, int, int, bool]:
    """Inject non-visible SEO metadata while proving visible content is unchanged."""
    canonical_count = noindex_count = checked = 0
    token = _load_verification_token()
    verification_injected = False

    for page in sorted(root.rglob("*.html")):
        document = page.read_text(encoding="utf-8")
        before_hash = visible_text_hash(document)
        updated = document

        if should_index(page, root):
            canonical = _url_for(page, root)
            canonical_tag = re.compile(
                r'<link\b(?=[^>]*\brel=["\']canonical["\'])[^>]*>',
                flags=re.IGNORECASE,
            )
            snippet = f'<link rel="canonical" href="{html_lib.escape(canonical, quote=True)}">'
            if canonical_tag.search(updated):
                prior = updated
                updated = canonical_tag.sub(snippet, updated, count=1)
                if updated != prior:
                    canonical_count += 1
            else:
                prior = updated
                updated = _inject_head_snippet(updated, snippet)
                if updated != prior:
                    canonical_count += 1
        elif not re.search(
            r'<meta\b[^>]*name=["\']robots["\'][^>]*>', updated, flags=re.IGNORECASE
        ):
            prior = updated
            updated = _inject_head_snippet(
                updated,
                '<meta name="robots" content="noindex,nofollow">',
            )
            if updated != prior:
                noindex_count += 1

        if page.name == "index.html" and page.parent == root and token:
            verification = (
                '<meta name="google-site-verification" content="'
                + html_lib.escape(token, quote=True)
                + '">'
            )
            prior = updated
            updated = _inject_head_snippet(updated, verification)
            if updated != prior:
                verification_injected = True

        if updated != document:
            checked += 1
            if visible_text_hash(updated) != before_hash:
                raise RuntimeError(
                    f"Content integrity failure in {page.relative_to(root)}: "
                    "SEO metadata changed visible educational text"
                )
            page.write_text(updated, encoding="utf-8", newline="\n")

    return canonical_count, noindex_count, checked, verification_injected


_ALTERNATE_TAG_RE = re.compile(
    r'<link\b(?=[^>]*\brel=["\']alternate["\'])[^>]*>',
    flags=re.IGNORECASE,
)
_HREFLANG_ATTR_RE = re.compile(r'\bhreflang=["\']([^"\']+)["\']', flags=re.IGNORECASE)
_HREF_ATTR_RE = re.compile(r'\bhref=["\']([^"\']+)["\']', flags=re.IGNORECASE)


def _declared_alternates(document: str) -> list[tuple[str, str]]:
    """The hreflang cluster a built page declares about itself, in order."""
    alternates: list[tuple[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for tag in _ALTERNATE_TAG_RE.findall(document):
        language = _HREFLANG_ATTR_RE.search(tag)
        href = _HREF_ATTR_RE.search(tag)
        if not language or not href:
            continue
        pair = (language.group(1), href.group(1))
        if pair not in seen and pair[1].startswith(PRODUCTION_ORIGIN):
            seen.add(pair)
            alternates.append(pair)
    return alternates


def _lastmod_map(root: Path, source_root: Path) -> dict[Path, str]:
    """Honest lastmod per built page, derived from source-file mtimes.

    A page's content changes when its sources change: for a Bangla page that
    is the master HTML file itself; for a localized page it is the master or
    that language's reviewed pack, whichever changed most recently. Build
    timestamps are never used — localized files are rewritten on every build,
    so their own mtimes would claim a change that did not happen.
    """

    def stamp(path: Path) -> float:
        try:
            return path.stat().st_mtime
        except OSError:
            return 0.0

    route_master: dict[str, tuple[Path, str]] = {}
    for page in sorted(source_root.rglob("*.html")):
        rel = page.relative_to(source_root)
        if rel.parts and rel.parts[0] in SUPPORTED_LANGUAGES:
            continue
        route = localized_route_for_page(page, source_root).as_posix()
        if route == ".":
            route = ""
        route_master.setdefault(route, (page, page_key(page, source_root)))

    lastmods: dict[Path, str] = {}
    for page in sorted(root.rglob("*.html")):
        rel = page.relative_to(root)
        candidates: list[Path] = []
        if (
            rel.parts
            and rel.parts[0] in SUPPORTED_LANGUAGES
            and page.name == "index.html"
        ):
            language = rel.parts[0]
            route = "/".join(rel.parts[1:-1])
            master = route_master.get(route)
            if master is not None:
                master_path, key = master
                candidates.append(master_path)
                pack = (
                    source_root
                    / "assets"
                    / "i18n"
                    / "pages"
                    / f"{key}.{language}.json"
                )
                if pack.exists():
                    candidates.append(pack)
        else:
            candidates.append(source_root / rel)
        mtimes = [stamp(candidate) for candidate in candidates]
        mtimes = [mtime for mtime in mtimes if mtime > 0]
        if mtimes:
            lastmods[page] = datetime.date.fromtimestamp(max(mtimes)).isoformat()
    return lastmods


def build_sitemap(root: Path, source_root: Path | None = None) -> int:
    pages = [
        page
        for page in sorted(root.rglob("*.html"))
        if should_index(page, root)
    ]
    lastmods = _lastmod_map(root, source_root) if source_root is not None else {}
    body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]
    for page in pages:
        url = _url_for(page, root)
        lines = [f"    <loc>{html_lib.escape(url)}</loc>"]
        if page in lastmods:
            lines.append(f"    <lastmod>{lastmods[page]}</lastmod>")
        # Mirror the page's own hreflang cluster into the sitemap so Google
        # sees the full language cluster even for pages it has not crawled.
        for language, href in _declared_alternates(page.read_text(encoding="utf-8")):
            lines.append(
                '    <xhtml:link rel="alternate" '
                f'hreflang="{html_lib.escape(language, quote=True)}" '
                f'href="{html_lib.escape(href, quote=True)}"/>'
            )
        body.append("  <url>\n" + "\n".join(lines) + "\n  </url>")
    body.append("</urlset>")
    (root / "sitemap.xml").write_text("\n".join(body) + "\n", encoding="utf-8")
    return len(pages)


def build_robots(root: Path) -> None:
    (root / "robots.txt").write_text(
        "User-agent: *\n"
        "Allow: /\n"
        f"Sitemap: {PRODUCTION_ORIGIN}/sitemap.xml\n",
        encoding="utf-8",
    )


def prepare_search_engine_files(
    root: Path, source_root: Path | None = None
) -> tuple[int, int, int, bool, int]:
    canonicals, noindex, checked, verified = apply_seo_metadata(root)
    sitemap_urls = build_sitemap(root, source_root)
    build_robots(root)
    return canonicals, noindex, checked, verified, sitemap_urls
