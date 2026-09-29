#!/usr/bin/env python3
"""Verify that every website-backed mobile feature points to a real site page."""
from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "mobile" / "src" / "registry.ts"
WEB_PATH_RE = re.compile(r"\bwebPath:\s*['\"]([^'\"]+)['\"]")


def local_page(value: str) -> Path | None:
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
        return None
    path = unquote(parsed.path).lstrip("/")
    if not path:
        return None
    return ROOT / path


def main() -> int:
    source = REGISTRY.read_text(encoding="utf-8")
    routes = WEB_PATH_RE.findall(source)
    if not routes:
        raise SystemExit("mobile route check: no webPath entries found")

    missing: list[str] = []
    for route in routes:
        target = local_page(route)
        if target is not None and not target.is_file():
            missing.append(f"{route} -> {target.relative_to(ROOT).as_posix()}")

    if missing:
        print("mobile route check failed; these App routes do not exist in the website source:")
        for item in missing:
            print(f"  - {item}")
        return 1

    print(f"mobile route check: {len(routes)} website-backed feature routes verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
