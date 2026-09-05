#!/usr/bin/env python3
"""Build native-mobile JSON from the verified static site without changing visible content.

The React Native app uses these files to render existing educational pages with native
Text/Image/View components instead of a WebView. This keeps website content as the
single source of truth and gives the app automatic feature/content parity.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

SKIP_DIRS = {"admin", "node_modules", ".git", "_site", "mobile", "playwright-report", "test-results"}
SKIP_FILES = {"404.html", "offline.html"}
SKIP_TAGS = {"script", "style", "svg", "template", "noscript", "header", "nav", "footer", "aside"}
BLOCK_TAGS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li"}
SPACE_RE = re.compile(r"\s+")


def clean(value: str) -> str:
    return SPACE_RE.sub(" ", value).strip()


def content_id(relative_path: str) -> str:
    return hashlib.sha1(relative_path.encode("utf-8")).hexdigest()[:16]


@dataclass
class ActiveBlock:
    tag: str
    chunks: list[str]
    ordered: bool = False


class VisibleContentParser(HTMLParser):
    def __init__(self, require_main: bool) -> None:
        super().__init__(convert_charrefs=True)
        self.require_main = require_main
        self.main_depth = 0
        self.body_depth = 0
        self.skip_depth = 0
        self.list_stack: list[str] = []
        self.active: ActiveBlock | None = None
        self.blocks: list[dict[str, Any]] = []
        self.title_chunks: list[str] = []
        self.h1_title = ""
        self.in_title = False
        self.table_row: list[str] | None = None
        self.table_cell_chunks: list[str] | None = None

    def eligible(self) -> bool:
        if self.skip_depth:
            return False
        return self.main_depth > 0 if self.require_main else self.body_depth > 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = True
        if tag == "body":
            self.body_depth += 1
        if tag == "main":
            self.main_depth += 1
        if tag in SKIP_TAGS:
            self.skip_depth += 1
            return
        if tag in {"ol", "ul"} and self.eligible():
            self.list_stack.append(tag)
        if tag == "tr" and self.eligible():
            self.table_row = []
        if tag in {"td", "th"} and self.table_row is not None and self.eligible():
            self.table_cell_chunks = []
        if tag == "img" and self.eligible():
            data = dict(attrs)
            src = (data.get("src") or "").strip()
            if src and not src.startswith("data:"):
                self.blocks.append({"type": "image", "src": src, "alt": clean(data.get("alt") or "")})
        if tag in BLOCK_TAGS and self.eligible():
            if self.active is not None:
                self.finish_active()
            self.active = ActiveBlock(tag=tag, chunks=[], ordered=bool(self.list_stack and self.list_stack[-1] == "ol"))

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
        if tag in BLOCK_TAGS and self.active and self.active.tag == tag:
            self.finish_active()
        if tag in {"td", "th"} and self.table_row is not None and self.table_cell_chunks is not None:
            value = clean("".join(self.table_cell_chunks))
            self.table_row.append(value)
            self.table_cell_chunks = None
        if tag == "tr" and self.table_row is not None:
            cells = [value for value in self.table_row if value]
            if cells:
                self.blocks.append({"type": "table_row", "cells": cells})
            self.table_row = None
            self.table_cell_chunks = None
        if tag in {"ol", "ul"} and self.list_stack:
            self.list_stack.pop()
        if tag in SKIP_TAGS and self.skip_depth:
            self.skip_depth -= 1
            return
        if tag == "main" and self.main_depth:
            self.main_depth -= 1
        if tag == "body" and self.body_depth:
            self.body_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_chunks.append(data)
        if not self.eligible():
            return
        if self.table_cell_chunks is not None:
            self.table_cell_chunks.append(data)
        if self.active is not None:
            self.active.chunks.append(data)

    def finish_active(self) -> None:
        if not self.active:
            return
        text = clean("".join(self.active.chunks))
        tag = self.active.tag
        ordered = self.active.ordered
        self.active = None
        if not text:
            return
        if tag.startswith("h"):
            level = int(tag[1])
            self.blocks.append({"type": "heading", "level": level, "text": text})
            if tag == "h1" and not self.h1_title:
                self.h1_title = text
        elif tag == "li":
            self.blocks.append({"type": "list_item", "text": text, "ordered": ordered})
        else:
            self.blocks.append({"type": "paragraph", "text": text})

    def finish(self) -> None:
        self.finish_active()

    @property
    def document_title(self) -> str:
        return self.h1_title or clean("".join(self.title_chunks))


def should_include(path: Path, root: Path) -> bool:
    rel = path.relative_to(root)
    if path.name in SKIP_FILES:
        return False
    if any(part in SKIP_DIRS or part.startswith(".") for part in rel.parts[:-1]):
        return False
    return True


def parse_page(path: Path, root: Path) -> dict[str, Any] | None:
    try:
        source = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    require_main = bool(re.search(r"<main(?:\s|>)", source, re.I))
    parser = VisibleContentParser(require_main=require_main)
    try:
        parser.feed(source)
        parser.close()
        parser.finish()
    except Exception:
        return None
    rel = path.relative_to(root).as_posix()
    blocks = parser.blocks
    if not blocks:
        return None
    title = parser.document_title or path.stem.replace("-", " ").replace("_", " ").strip().title()
    return {"id": content_id(rel), "path": rel, "title": title, "blocks": blocks}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default="_site")
    ap.add_argument("--out", default="_site/assets/data/mobile-content")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    root = Path(args.site).resolve()
    out = Path(args.out).resolve()
    if not root.exists():
        raise SystemExit(f"site directory not found: {root}")
    pages: list[dict[str, Any]] = []
    for html in sorted(root.rglob("*.html")):
        if not should_include(html, root):
            continue
        page = parse_page(html, root)
        if page:
            pages.append(page)
    if args.check:
        if not pages:
            raise SystemExit("mobile content build found 0 pages")
        print(f"mobile content check: {len(pages)} pages")
        return 0
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("*.json"):
        old.unlink()
    index_pages = []
    for page in pages:
        payload = {**page, "generated_from": "verified-static-html"}
        (out / f"{page['id']}.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        index_pages.append({"id": page["id"], "path": page["path"], "title": page["title"], "block_count": len(page["blocks"])})
    index = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "Aponar Nihon verified static site",
        "page_count": len(index_pages),
        "pages": index_pages,
    }
    (out / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"mobile content: wrote {len(index_pages)} pages to {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
