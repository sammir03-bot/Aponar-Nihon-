from __future__ import annotations

import html as html_lib
import os
import re
from pathlib import Path
from urllib.parse import quote

from sitecore.htmltools import visible_text_hash
from sitecore.search_index import should_index


PRODUCTION_ORIGIN = "https://app.aponar-nihon.workers.dev"
VERIFICATION_FILE = Path(__file__).resolve().parents[1] / "google-site-verification.txt"


def _url_for(path: Path, root: Path) -> str:
    rel = path.relative_to(root).as_posix()
    if rel == "index.html":
        return f"{PRODUCTION_ORIGIN}/"
    return f"{PRODUCTION_ORIGIN}/{quote(rel, safe='/-._~')}"


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

    # Accept either Google's bare token or the complete verification meta tag.
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
            snippet = f'<link rel="canonical" href="{html_lib.escape(canonical, quote=True)}">'
            updated = _inject_head_snippet(updated, snippet)
            if updated != document:
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


def build_sitemap(root: Path) -> int:
    urls = [
        _url_for(page, root)
        for page in sorted(root.rglob("*.html"))
        if should_index(page, root)
    ]
    body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in urls:
        body.append(f"  <url><loc>{html_lib.escape(url)}</loc></url>")
    body.append("</urlset>")
    (root / "sitemap.xml").write_text("\n".join(body) + "\n", encoding="utf-8")
    return len(urls)


def build_robots(root: Path) -> None:
    (root / "robots.txt").write_text(
        "User-agent: *\n"
        "Allow: /\n"
        f"Sitemap: {PRODUCTION_ORIGIN}/sitemap.xml\n",
        encoding="utf-8",
    )


def prepare_search_engine_files(root: Path) -> tuple[int, int, int, bool, int]:
    canonicals, noindex, checked, verified = apply_seo_metadata(root)
    sitemap_urls = build_sitemap(root)
    build_robots(root)
    return canonicals, noindex, checked, verified, sitemap_urls
