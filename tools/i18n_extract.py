#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUPPORTED = {"ja", "en", "vi", "ne", "hi", "ur", "my", "zh", "si", "fil"}
BANGLA_RE = re.compile(r"[\u0980-\u09ff]")
WHITESPACE_RE = re.compile(r"\s+")
SKIP_TAGS = {"script", "style", "noscript", "template", "code", "pre", "textarea", "svg"}


class VisibleBanglaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.items: list[str] = []
        self.seen: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() in SKIP_TAGS:
            self.skip_depth += 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        return

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in SKIP_TAGS and self.skip_depth:
            self.skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        text = WHITESPACE_RE.sub(" ", data).strip()
        if not text or not BANGLA_RE.search(text) or text in self.seen:
            return
        self.seen.add(text)
        self.items.append(text)


def page_key(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return "index"
    if rel.lower().endswith(".html"):
        rel = rel[:-5]
    return re.sub(r"[^a-zA-Z0-9._-]+", "__", rel.strip("/")) or "index"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract visible Bangla strings from one HTML page into an Aponar Nihon translation-pack skeleton."
    )
    parser.add_argument("page", help="HTML page path relative to the repository root")
    parser.add_argument("--language", required=True, choices=sorted(SUPPORTED))
    parser.add_argument("--out", help="Output JSON path; defaults to stdout")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    page = (ROOT / args.page).resolve()
    try:
        page.relative_to(ROOT)
    except ValueError as exc:
        raise SystemExit("Page must be inside the repository") from exc
    if not page.exists() or page.suffix.lower() != ".html":
        raise SystemExit(f"HTML page not found: {args.page}")

    parser = VisibleBanglaParser()
    parser.feed(page.read_text(encoding="utf-8"))

    key = page_key(page)
    payload = {
        "sourceLanguage": "bn",
        "targetLanguage": args.language,
        "page": key,
        "reviewed": False,
        "entries": [{"source": text, "target": ""} for text in parser.items],
    }
    output = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"

    if args.out:
        destination = (ROOT / args.out).resolve()
        try:
            destination.relative_to(ROOT)
        except ValueError as exc:
            raise SystemExit("Output must be inside the repository") from exc
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(output, encoding="utf-8")
        print(f"Wrote {len(parser.items)} strings to {destination.relative_to(ROOT)}")
    else:
        print(output, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
