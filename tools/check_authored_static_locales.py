#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

from sitecore.locales import SUPPORTED_LANGUAGES, localized_route_for_page, page_key


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
BENGALI_RE = re.compile(r"[\u0980-\u09FF]")
BENGALI_DIGITS_RE = re.compile(r"[০-৯]+")
BRAND_RE = re.compile(r"আপনার নিহোন")
HTML_LANG_RE = re.compile(r"<html\b[^>]*\blang=[\"'](?P<lang>[^\"']+)[\"']", re.IGNORECASE)
PRESET_RE = re.compile(
    r"<html\b[^>]*\bdata-language-preset=[\"'](?P<lang>[^\"']+)[\"']",
    re.IGNORECASE,
)
SKIP_TAGS = {"style", "noscript", "template", "code", "pre", "svg"}
CHECK_ATTRIBUTES = {"alt", "aria-label", "data-search", "href", "placeholder", "title"}


class LocalizedSurfaceParser(HTMLParser):
    """Collect visible, accessibility, navigation and inline-script locale surfaces."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.stack: list[tuple[str, bool]] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        lower = tag.lower()
        skip_here = lower in SKIP_TAGS
        if lower not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append((lower, skip_here))
            if skip_here:
                self.skip_depth += 1
        for name, value in attrs:
            if name.lower() in CHECK_ATTRIBUTES and value:
                self.parts.append(value)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name.lower() in CHECK_ATTRIBUTES and value:
                self.parts.append(value)

    def handle_endtag(self, tag: str) -> None:
        lower = tag.lower()
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] != lower:
                continue
            removed = self.stack[index:]
            del self.stack[index:]
            self.skip_depth -= sum(1 for _name, skipped in removed if skipped)
            self.skip_depth = max(0, self.skip_depth)
            break

    def handle_data(self, data: str) -> None:
        if not self.skip_depth and data.strip():
            self.parts.append(data)

    def text(self) -> str:
        return "\n".join(self.parts)


def fail(message: str) -> None:
    raise SystemExit(message)


def snippets(value: str, limit: int = 8) -> list[str]:
    results: list[str] = []
    for line in value.splitlines():
        # Keep the Aponar Nihon Bengali brand and Bengali digit lookup tables available;
        # neither is fallback UI copy. All other Bengali script on a completed locale page
        # is treated as a localization leak, including inline JavaScript messages.
        cleaned = BRAND_RE.sub("", line)
        cleaned = BENGALI_DIGITS_RE.sub("", cleaned).strip()
        if not cleaned or not BENGALI_RE.search(cleaned):
            continue
        compact = " ".join(cleaned.split())
        if compact not in results:
            results.append(compact[:180])
        if len(results) >= limit:
            break
    return results


def main() -> int:
    if not SITE.exists():
        fail("Built site is missing; run npm run build first")

    manifest_path = SITE / "assets" / "i18n" / "core-localization-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    completed = manifest.get("completeLocalizedPages")
    if not isinstance(completed, dict) or not completed:
        fail("completeLocalizedPages must declare at least one finished locale route")

    source_pages = [
        page
        for page in sorted(SITE.rglob("*.html"))
        if not page.relative_to(SITE).parts
        or page.relative_to(SITE).parts[0] not in SUPPORTED_LANGUAGES
    ]
    page_by_key = {page_key(page, SITE): page for page in source_pages}
    checked = 0

    for language, keys in sorted(completed.items()):
        if language not in SUPPORTED_LANGUAGES:
            fail(f"Unsupported completed locale language: {language}")
        if not isinstance(keys, list) or not keys:
            fail(f"completeLocalizedPages[{language!r}] must be a non-empty list")

        for raw_key in keys:
            key = str(raw_key)
            source_page = page_by_key.get(key)
            if source_page is None:
                fail(f"Completed locale page has no Bengali source page: {language}:{key}")

            pack = SITE / "assets" / "i18n" / "pages" / f"{key}.{language}.json"
            if not pack.exists():
                fail(f"Completed locale page is missing authored pack: {pack.relative_to(SITE)}")

            output = SITE / language / localized_route_for_page(source_page, SITE) / "index.html"
            if not output.exists():
                fail(f"Completed locale route was not generated: {output.relative_to(SITE)}")

            document = output.read_text(encoding="utf-8")
            html_lang = HTML_LANG_RE.search(document)
            preset = PRESET_RE.search(document)
            if not html_lang or html_lang.group("lang") != language:
                fail(f"Completed locale route has wrong html lang: {output.relative_to(SITE)}")
            if not preset or preset.group("lang") != language:
                fail(f"Completed locale route has wrong language preset: {output.relative_to(SITE)}")
            if "data-i18n-fallback" in document:
                fail(f"Completed locale route still has fallback marker: {output.relative_to(SITE)}")

            parser = LocalizedSurfaceParser()
            parser.feed(document)
            parser.close()
            leaked = snippets(parser.text())
            if leaked:
                fail(
                    f"Completed locale route leaks Bengali authored copy: {output.relative_to(SITE)}\n"
                    + "\n".join(f"  - {item}" for item in leaked)
                )
            checked += 1

    print(
        f"authored static locale quality OK: {checked} completed locale HTML routes "
        "have no Bengali UI or dynamic-script leakage"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
