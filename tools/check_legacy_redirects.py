#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {
    ".git",
    ".github",
    "_site",
    "android",
    "archive",
    "node_modules",
    "play-store",
    "playwright-report",
    "test-results",
}
MARKER = 'id="legacy-origin-redirect"'
LEGACY_HOST = "sammir03-bot.github.io"
PRODUCTION_ORIGIN = "https://app.aponar-nihon.workers.dev"


def is_public_page(path: Path) -> bool:
    relative = path.relative_to(ROOT)
    return (
        not any(part in EXCLUDED_DIRS for part in relative.parts)
        and not path.name.startswith("google")
    )


def main() -> int:
    failures: list[str] = []
    checked = 0

    for path in sorted(ROOT.rglob("*.html")):
        if not is_public_page(path):
            continue
        text = path.read_text(encoding="utf-8")
        if "<html" not in text.lower():
            continue
        checked += 1
        missing = [
            label
            for label, value in (
                ("redirect marker", MARKER),
                ("legacy host guard", LEGACY_HOST),
                ("production target", PRODUCTION_ORIGIN),
            )
            if value not in text
        ]
        if missing:
            failures.append(f"{path.relative_to(ROOT)}: missing {', '.join(missing)}")

    if failures:
        for failure in failures:
            print(f"FAIL {failure}")
        return 1

    print(f"Legacy redirect guard passed: {checked} public HTML pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
