from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import quote

from sitecore.htmltools import extract_page_meta


SKIP_NAMES = {
    "404.html",
    "admin.html",
    "auth.html",
    "register.html",
    "profile.html",
    "delete-account.html",
    "refresh-site.html",
}


def should_index(path: Path, root: Path) -> bool:
    rel = path.relative_to(root)
    if "archive" in rel.parts:
        return False
    if path.name in SKIP_NAMES or path.name.startswith("google"):
        return False
    return True


def public_url(path: Path, root: Path) -> str:
    rel = path.relative_to(root).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        rel = rel[: -len("index.html")]
    elif rel.endswith(".html"):
        rel = rel[:-5]
    return "/" + quote(rel, safe="/-._~")


def build_search_index(root: Path, output: Path) -> int:
    records: list[dict[str, object]] = []

    for path in sorted(root.rglob("*.html")):
        if not should_index(path, root):
            continue
        html = path.read_text(encoding="utf-8")
        title, description, headings = extract_page_meta(html)
        if not (title or headings):
            continue

        records.append(
            {
                "url": public_url(path, root),
                "title": title or (headings[0] if headings else path.stem),
                "description": description,
                "headings": headings[:24],
            }
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(
            {
                "version": 1,
                "count": len(records),
                "pages": records,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ) + "\n",
        encoding="utf-8",
    )
    return len(records)
