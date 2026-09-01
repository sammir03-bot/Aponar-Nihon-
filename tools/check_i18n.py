#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

from i18n_ai_pipeline import HtmlSourceParser
from sitecore.locales import (
    EXCLUDED_LOCALIZED_PAGES,
    RTL_LANGUAGES,
    localized_route_for_page,
    localized_route_plan,
)

ROOT = Path(__file__).resolve().parents[1]
SUPPORTED = ("bn", "ja", "en", "vi", "ne", "hi", "ur", "my", "zh", "si", "fil")


def main() -> int:
    site = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "_site"
    if not site.is_absolute():
        site = (ROOT / site).resolve()

    runtime = ROOT / "assets" / "js" / "i18n.js"
    content_runtime = ROOT / "assets" / "js" / "i18n-content.js"
    styles = ROOT / "assets" / "css" / "i18n.css"
    if not runtime.exists() or not content_runtime.exists() or not styles.exists():
        raise SystemExit("Missing multilingual runtime assets")

    source = runtime.read_text(encoding="utf-8")
    if 'DEFAULT_LANGUAGE = "bn"' not in source:
        raise SystemExit("Bangla must remain the default language")
    if "normalizeLanguage" not in source:
        raise SystemExit("Legacy profile language values must normalize to locale codes")
    for code in SUPPORTED:
        if f"{code}: {{" not in source:
            raise SystemExit(f"Missing supported language: {code}")

    tutor_client = (ROOT / "assets" / "js" / "tutor-pro.js").read_text(encoding="utf-8")
    tutor_worker = (ROOT / "workers" / "api" / "src" / "index.ts").read_text(encoding="utf-8")
    if "window.AponarI18n.getLanguage()" not in tutor_client:
        raise SystemExit("AI Tutor client is not sending the active explanation language")
    for code in SUPPORTED:
        if f'"{code}"' not in tutor_worker:
            raise SystemExit(f"AI Tutor does not accept language: {code}")

    if "mountProfileLanguageSelect" not in source:
        raise SystemExit("Profile language preference must use the shared language registry")

    pages = list(site.rglob("*.html"))
    if not pages:
        raise SystemExit("No built HTML pages found")

    required = (
        "/assets/css/i18n.css?v=20260831.3",
        "/assets/css/home-brand.css?v=20260831.1",
        "/assets/js/i18n.js?v=20260831.3",
        "/assets/js/i18n-content.js?v=20260831.3",
    )
    checked = 0
    missing: list[str] = []
    for page in pages:
        rel = page.relative_to(site).as_posix()
        if page.name.startswith("google"):
            continue
        checked += 1
        html = page.read_text(encoding="utf-8", errors="ignore")
        if any(asset not in html for asset in required):
            missing.append(rel)

    if missing:
        sample = ", ".join(missing[:12])
        raise SystemExit(f"Multilingual assets missing from {len(missing)} pages: {sample}")

    if localized_route_for_page(site / "n3-grammar.html", site).as_posix() != "n3/grammar":
        raise SystemExit("Localized route contract is broken for /<language>/n3/grammar/")

    localized_checked = 0
    for code in SUPPORTED[1:]:
        direction = "rtl" if code == "ur" else "ltr"
        for route in ("about", "n5"):
            localized = site / code / route / "index.html"
            if not localized.exists():
                raise SystemExit(f"Missing localized core route: {code}/{route}/index.html")
            html = localized.read_text(encoding="utf-8")
            if f'lang="{code}"' not in html or f'dir="{direction}"' not in html:
                raise SystemExit(f"Wrong document locale on {localized.relative_to(site)}")
            if f'data-language-preset="{code}"' not in html:
                raise SystemExit(f"Missing locale bootstrap on {localized.relative_to(site)}")
            if f'hreflang="{code}"' not in html or 'hreflang="x-default"' not in html:
                raise SystemExit(f"Missing hreflang cluster on {localized.relative_to(site)}")
            localized_checked += 1

    english_n5 = (site / "en" / "n5" / "index.html").read_text(encoding="utf-8")
    if "Build a strong Japanese foundation" not in english_n5:
        raise SystemExit("Reviewed English N5 copy was not rendered at build time")
    if "BEGINNER · 日本語能力試験" not in english_n5:
        raise SystemExit("Japanese study text changed in the localized N5 page")

    memory_states: dict[str, bool] = {}
    memory_present = False
    for code in SUPPORTED[1:]:
        path = site / "translations" / f"{code}.json"
        if not path.exists():
            memory_states[code] = False
            continue
        memory_present = True
        payload = json.loads(path.read_text(encoding="utf-8"))
        memory_states[code] = (
            payload.get("reviewed") is True
            and payload.get("sourceLanguage") == "bn"
            and payload.get("targetLanguage") == code
        )

    full_route_count = 0
    if memory_present:
        missing_memories = [code for code, ready in memory_states.items() if not ready]
        if missing_memories:
            raise SystemExit("Partial global translation memories reached the build: " + ", ".join(missing_memories))

        base_pages = [
            page
            for page in sorted(site.rglob("*.html"))
            if page.relative_to(site).parts
            and page.relative_to(site).parts[0] not in SUPPORTED[1:]
            and page.name not in EXCLUDED_LOCALIZED_PAGES
            and not page.name.startswith("google")
        ]
        route_plan = localized_route_plan(base_pages, site)
        for code in SUPPORTED[1:]:
            direction = "rtl" if code in RTL_LANGUAGES else "ltr"
            for source_page, route in route_plan.items():
                localized = site / code / route / "index.html"
                if not localized.exists():
                    raise SystemExit(f"Missing full localized route: {localized.relative_to(site)}")
                document = localized.read_text(encoding="utf-8", errors="ignore")
                if f'lang="{code}"' not in document or f'dir="{direction}"' not in document:
                    raise SystemExit(f"Wrong full-route locale on {localized.relative_to(site)}")
                parser = HtmlSourceParser()
                parser.feed(document)
                parser.close()
                if parser.items:
                    sample = " | ".join(parser.items[:3])
                    raise SystemExit(
                        f"Visible Bangla remains on {localized.relative_to(site)}: {sample[:300]}"
                    )
                full_route_count += 1

    print(
        f"i18n OK: {len(SUPPORTED)} languages, Bangla default, "
        f"content-pack loader enabled, {checked} HTML pages wired, "
        f"{localized_checked} localized core routes checked, "
        f"{full_route_count} full-memory routes checked"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
