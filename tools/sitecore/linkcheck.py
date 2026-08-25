from __future__ import annotations

from pathlib import Path
from urllib.parse import unquote, urlsplit

from sitecore.htmltools import extract_links


IGNORED_SCHEMES = {"http", "https", "mailto", "tel", "sms", "javascript", "data"}


def _target_for(href: str, page: Path, root: Path) -> Path | None:
    href = href.strip()
    if not href or href.startswith("#"):
        return None

    parsed = urlsplit(href)
    if parsed.scheme.lower() in IGNORED_SCHEMES or parsed.netloc:
        return None

    raw_path = unquote(parsed.path)
    if not raw_path:
        return None

    # Only validate page-like references. Asset checking is intentionally kept
    # separate so existing optional downloads do not block deployment.
    if not (raw_path.endswith(".html") or raw_path.endswith("/")):
        return None

    if raw_path.startswith("/"):
        target = root / raw_path.lstrip("/")
    else:
        target = page.parent / raw_path

    if raw_path.endswith("/"):
        target = target / "index.html"
    return target.resolve()


def find_broken_page_links(root: Path) -> list[tuple[str, str]]:
    broken: list[tuple[str, str]] = []
    root_resolved = root.resolve()

    for page in sorted(root.rglob("*.html")):
        try:
            html = page.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        for href in extract_links(html):
            target = _target_for(href, page, root)
            if target is None:
                continue
            try:
                target.relative_to(root_resolved)
            except ValueError:
                continue
            if not target.exists():
                broken.append((page.relative_to(root).as_posix(), href))

    return broken
