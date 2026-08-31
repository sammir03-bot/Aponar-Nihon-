#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUPPORTED = ("bn", "ja", "en", "vi", "ne", "hi", "ur", "my", "zh")


def main() -> int:
    site = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "_site"
    if not site.is_absolute():
        site = (ROOT / site).resolve()

    runtime = ROOT / "assets" / "js" / "i18n.js"
    styles = ROOT / "assets" / "css" / "i18n.css"
    if not runtime.exists() or not styles.exists():
        raise SystemExit("Missing multilingual runtime assets")

    source = runtime.read_text(encoding="utf-8")
    if 'DEFAULT_LANGUAGE = "bn"' not in source:
        raise SystemExit("Bangla must remain the default language")
    for code in SUPPORTED:
        if f"{code}: {{" not in source:
            raise SystemExit(f"Missing supported language: {code}")

    pages = list(site.rglob("*.html"))
    if not pages:
        raise SystemExit("No built HTML pages found")

    checked = 0
    missing: list[str] = []
    for page in pages:
        rel = page.relative_to(site).as_posix()
        if page.name.startswith("google"):
            continue
        checked += 1
        html = page.read_text(encoding="utf-8", errors="ignore")
        if "/assets/js/i18n.js?v=20260831" not in html or "/assets/css/i18n.css?v=20260831" not in html:
            missing.append(rel)

    if missing:
        sample = ", ".join(missing[:12])
        raise SystemExit(f"Multilingual assets missing from {len(missing)} pages: {sample}")

    print(f"i18n OK: {len(SUPPORTED)} languages, Bangla default, {checked} HTML pages wired")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
