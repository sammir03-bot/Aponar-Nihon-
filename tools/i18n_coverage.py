#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

from i18n_extract import VisibleBanglaParser, page_key
from sitecore.i18n_policy import is_static_core_page, load_core_policy


ROOT = Path(__file__).resolve().parents[1]
PACK_DIR = ROOT / "assets" / "i18n" / "pages"
MEMORY_DIR = ROOT / "translations"
SUPPORTED = ("ja", "en", "vi", "ne", "hi", "ur", "my", "zh", "si", "fil")
PACK_RE = re.compile(r"^(?P<page>.+)\.(?P<language>ja|en|vi|ne|hi|ur|my|zh|si|fil)\.json$")
EXCLUDED_PAGES = {"refresh-site.html", "admin.html"}


def source_strings(path: Path) -> list[str]:
    parser = VisibleBanglaParser()
    parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
    return parser.items


def reviewed_sources() -> dict[tuple[str, str], set[str]]:
    """Return reviewed sources from page packs plus complete core memories.

    Page packs remain page-specific overrides. Reviewed global memories count only for
    pages classified as static core; non-core pages continue to use the ordinary runtime
    translator and are not falsely reported as statically complete.
    """

    result: dict[tuple[str, str], set[str]] = defaultdict(set)
    for path in sorted(PACK_DIR.glob("*.json")):
        match = PACK_RE.match(path.name)
        if not match:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        if payload.get("reviewed") is not True:
            continue
        key = (match.group("page"), match.group("language"))
        for entry in payload.get("entries", []):
            if not isinstance(entry, dict):
                continue
            source = entry.get("source")
            target = entry.get("target")
            if isinstance(source, str) and source.strip() and isinstance(target, str) and target.strip():
                result[key].add(" ".join(source.split()))

    if not MEMORY_DIR.exists():
        return result

    policy = load_core_policy(ROOT)
    core_page_keys = {
        page_key(path)
        for path in ROOT.rglob("*.html")
        if path.name not in EXCLUDED_PAGES and is_static_core_page(page_key(path), policy)
    }
    for language in SUPPORTED:
        path = MEMORY_DIR / f"{language}.json"
        if not path.exists():
            continue
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError):
            continue
        if (
            payload.get("reviewed") is not True
            or payload.get("sourceLanguage") != "bn"
            or payload.get("targetLanguage") != language
        ):
            continue
        sources = {
            " ".join(str(entry.get("source", "")).split())
            for entry in payload.get("entries", [])
            if isinstance(entry, dict) and entry.get("source") and entry.get("target")
        }
        for key in core_page_keys:
            result[(key, language)].update(sources)
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Report reviewed Bangla-to-locale static coverage.")
    parser.add_argument("--page", action="append", default=[], help="Page key to report; repeat as needed")
    parser.add_argument("--fail-under", type=float, default=None, help="Fail when a reported pack is below this percent")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    selected = set(args.page)
    translations = reviewed_sources()
    rows: list[tuple[float, str, str, int, int]] = []

    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if path.name in EXCLUDED_PAGES or (rel.parts and rel.parts[0] in SUPPORTED):
            continue
        key = page_key(path)
        if selected and key not in selected:
            continue
        sources = {" ".join(value.split()) for value in source_strings(path)}
        if not sources:
            continue
        for language in SUPPORTED:
            matched = len(sources & translations.get((key, language), set()))
            percent = (matched / len(sources)) * 100
            rows.append((percent, key, language, matched, len(sources)))

    if not rows:
        print("No matching pages with visible Bangla text.")
        return 0

    for percent, key, language, matched, total in sorted(rows, key=lambda row: (row[1], row[2])):
        if selected or matched:
            print(f"{key}.{language}: {matched}/{total} ({percent:.1f}%)")

    complete = sum(1 for percent, *_rest in rows if percent == 100)
    translated = sum(row[3] for row in rows)
    possible = sum(row[4] for row in rows)
    print(
        f"Coverage: {translated}/{possible} reviewed static page-language strings; "
        f"{complete}/{len(rows)} page-language packs complete"
    )

    if args.fail_under is not None:
        failing = [row for row in rows if row[0] < args.fail_under]
        if failing:
            print(f"FAIL: {len(failing)} pack(s) below {args.fail_under:.1f}%")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
