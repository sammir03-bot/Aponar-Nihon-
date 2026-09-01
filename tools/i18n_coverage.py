#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

from i18n_ai_pipeline import LANGUAGES, normalize, source_catalog
from i18n_extract import VisibleBanglaParser, page_key


ROOT = Path(__file__).resolve().parents[1]
PACK_DIR = ROOT / "assets" / "i18n" / "pages"
MEMORY_DIR = ROOT / "translations"
SUPPORTED = tuple(LANGUAGES)
PACK_RE = re.compile(r"^(?P<page>.+)\.(?P<language>ja|en|vi|ne|hi|ur|my|zh|si|fil)\.json$")
EXCLUDED_PAGES = {"refresh-site.html", "admin.html"}


def source_strings(path: Path) -> set[str]:
    parser = VisibleBanglaParser()
    parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
    return {normalize(value) for value in parser.items if normalize(value)}


def reviewed_page_sources() -> dict[tuple[str, str], set[str]]:
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
            source = normalize(entry.get("source", ""))
            target = str(entry.get("target", "")).strip()
            if source and target:
                result[key].add(source)
    return result


def reviewed_global_sources() -> tuple[dict[str, set[str]], dict[str, bool]]:
    reviewed: dict[str, set[str]] = defaultdict(set)
    publishable: dict[str, bool] = {}
    for language in SUPPORTED:
        path = MEMORY_DIR / f"{language}.json"
        if not path.exists():
            publishable[language] = False
            continue
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError):
            publishable[language] = False
            continue
        if payload.get("sourceLanguage") != "bn" or payload.get("targetLanguage") != language:
            publishable[language] = False
            continue
        complete = payload.get("reviewed") is True
        publishable[language] = complete
        for entry in payload.get("entries", []):
            if not isinstance(entry, dict):
                continue
            source = normalize(entry.get("source", ""))
            target = str(entry.get("target", "")).strip()
            entry_reviewed = complete or entry.get("reviewed") is True
            if source and target and entry_reviewed:
                reviewed[language].add(source)
    return reviewed, publishable


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Report full public-string localization coverage.")
    parser.add_argument("--page", action="append", default=[], help="Optional page key; repeat as needed")
    parser.add_argument(
        "--fail-under",
        type=float,
        default=None,
        help="Fail when any reported language is below this reviewed percentage",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    selected = set(args.page)
    global_catalog = {str(row["source"]) for row in source_catalog()}
    global_reviewed, publishable = reviewed_global_sources()
    page_reviewed = reviewed_page_sources()
    legacy_by_language: dict[str, set[str]] = defaultdict(set)
    for (_page, language), sources in page_reviewed.items():
        legacy_by_language[language].update(sources)
    rows: list[tuple[float, str, int, int, bool]] = []

    for language in SUPPORTED:
        reviewed_sources = global_reviewed.get(language, set()) | legacy_by_language.get(language, set())
        matched = len(global_catalog & reviewed_sources)
        total = len(global_catalog)
        percent = (matched / total) * 100 if total else 100.0
        rows.append((percent, language, matched, total, publishable.get(language, False)))
        state = "publishable" if publishable.get(language, False) else "checkpoint/not published"
        print(f"global.{language}: {matched}/{total} reviewed ({percent:.1f}%) — {state}")

    if selected:
        print("\nSelected page coverage (global memory + reviewed legacy page pack):")
        for path in sorted(ROOT.glob("*.html")):
            if path.name in EXCLUDED_PAGES:
                continue
            key = page_key(path)
            if key not in selected:
                continue
            sources = source_strings(path)
            for language in SUPPORTED:
                available = global_reviewed.get(language, set()) | page_reviewed.get((key, language), set())
                matched = len(sources & available)
                percent = (matched / len(sources)) * 100 if sources else 100.0
                print(f"{key}.{language}: {matched}/{len(sources)} ({percent:.1f}%)")

    translated = sum(row[2] for row in rows)
    possible = sum(row[3] for row in rows)
    complete = sum(1 for row in rows if row[0] == 100 and row[4])
    print(
        f"Coverage: {translated}/{possible} globally reviewed language-strings; "
        f"{complete}/{len(rows)} complete memories publishable"
    )

    if args.fail_under is not None:
        failing = [row for row in rows if row[0] < args.fail_under or not row[4]]
        if failing:
            names = ", ".join(row[1] for row in failing)
            print(f"FAIL: below {args.fail_under:.1f}% or not publishable: {names}")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
