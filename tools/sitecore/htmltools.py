from __future__ import annotations

import hashlib
import re
from html.parser import HTMLParser
from typing import Iterable


class VisibleTextParser(HTMLParser):
    """Collect human-facing text while ignoring CSS and JavaScript bodies."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._ignored_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() in {"script", "style"}:
            self._ignored_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in {"script", "style"} and self._ignored_depth:
            self._ignored_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self._ignored_depth:
            text = " ".join(data.split())
            if text:
                self.parts.append(text)


class PageMetaParser(HTMLParser):
    """Extract compact metadata for the generated local search index."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.description = ""
        self.headings: list[str] = []
        self._capture_title = False
        self._heading_depth = 0
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        lower = tag.lower()
        attr = {k.lower(): (v or "") for k, v in attrs}
        if lower == "title":
            self._capture_title = True
            self._buffer = []
        elif lower in {"h1", "h2", "h3"}:
            self._heading_depth += 1
            self._buffer = []
        elif lower == "meta" and attr.get("name", "").lower() == "description":
            self.description = " ".join(attr.get("content", "").split())

    def handle_endtag(self, tag: str) -> None:
        lower = tag.lower()
        if lower == "title" and self._capture_title:
            self.title = " ".join("".join(self._buffer).split())
            self._capture_title = False
            self._buffer = []
        elif lower in {"h1", "h2", "h3"} and self._heading_depth:
            heading = " ".join("".join(self._buffer).split())
            if heading:
                self.headings.append(heading)
            self._heading_depth -= 1
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._capture_title or self._heading_depth:
            self._buffer.append(data)


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        for key, value in attrs:
            if key.lower() == "href" and value:
                self.hrefs.append(value.strip())


def visible_text(html: str) -> str:
    parser = VisibleTextParser()
    parser.feed(html)
    parser.close()
    return "\n".join(parser.parts)


def visible_text_hash(html: str) -> str:
    return hashlib.sha256(visible_text(html).encode("utf-8")).hexdigest()


def extract_page_meta(html: str) -> tuple[str, str, list[str]]:
    parser = PageMetaParser()
    parser.feed(html)
    parser.close()
    return parser.title, parser.description, parser.headings


def extract_links(html: str) -> list[str]:
    parser = LinkParser()
    parser.feed(html)
    parser.close()
    return parser.hrefs


def inject_assets(html: str, snippets: Iterable[str]) -> str:
    """Insert external assets before </head> without touching visible text."""
    if "</head" not in html.lower():
        return html

    additions = [snippet for snippet in snippets if snippet not in html]
    if not additions:
        return html

    payload = "\n" + "\n".join(additions) + "\n"
    return re.sub(r"</head\s*>", payload + "</head>", html, count=1, flags=re.IGNORECASE)
