#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACK_DIR = ROOT / "assets" / "i18n" / "pages"
SUPPORTED = {"ja", "en", "vi", "ne", "hi", "ur", "my", "zh", "si", "fil"}
LANGUAGE_PATTERN = "|".join(sorted((re.escape(code) for code in SUPPORTED), key=len, reverse=True))
PACK_NAME_RE = re.compile(rf"^(?P<page>.+)\.(?P<language>{LANGUAGE_PATTERN})\.json$")


def fail(message: str) -> None:
    raise SystemExit(message)


def main() -> int:
    if not PACK_DIR.exists():
        fail("Translation pack directory is missing")

    checked = 0
    reviewed_entries = 0
    available: set[tuple[str, str]] = set()
    for path in sorted(PACK_DIR.glob("*.json")):
        match = PACK_NAME_RE.match(path.name)
        if not match:
            fail(f"Invalid translation pack filename: {path.relative_to(ROOT)}")
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            fail(f"Invalid JSON pack {path.relative_to(ROOT)}: {exc}")

        language = match.group("language")
        page = match.group("page")
        if payload.get("sourceLanguage") != "bn":
            fail(f"Pack sourceLanguage must be bn: {path.relative_to(ROOT)}")
        if payload.get("targetLanguage") != language or language not in SUPPORTED:
            fail(f"Pack targetLanguage mismatch: {path.relative_to(ROOT)}")
        if payload.get("page") != page:
            fail(f"Pack page key mismatch: {path.relative_to(ROOT)}")
        if payload.get("reviewed") is not True:
            fail(f"Only reviewed packs may be committed: {path.relative_to(ROOT)}")
        available.add((page, language))

        entries = payload.get("entries")
        if not isinstance(entries, list) or not entries:
            fail(f"Pack must contain entries: {path.relative_to(ROOT)}")

        seen: set[str] = set()
        for index, entry in enumerate(entries, start=1):
            if not isinstance(entry, dict):
                fail(f"Invalid entry #{index}: {path.relative_to(ROOT)}")
            source = entry.get("source")
            target = entry.get("target")
            if not isinstance(source, str) or not source.strip():
                fail(f"Missing source in entry #{index}: {path.relative_to(ROOT)}")
            if not isinstance(target, str) or not target.strip():
                fail(f"Missing target in entry #{index}: {path.relative_to(ROOT)}")
            normalized = " ".join(source.split())
            if normalized in seen:
                fail(f"Duplicate source text in {path.relative_to(ROOT)}: {normalized[:80]}")
            seen.add(normalized)
            reviewed_entries += 1
        checked += 1

    missing_core = sorted(
        f"{page}.{language}.json"
        for page in {"about", "n5"}
        for language in SUPPORTED
        if (page, language) not in available
    )
    if missing_core:
        fail("Missing core translation packs: " + ", ".join(missing_core))

    print(f"i18n packs OK: {checked} reviewed packs, {reviewed_entries} translated entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
