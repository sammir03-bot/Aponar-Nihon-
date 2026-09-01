#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

from sitecore.locales import localized_route_for_page

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
    content_source = content_runtime.read_text(encoding="utf-8")
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
    if 'if (!isHomeRoute()) return;' in source:
        raise SystemExit("The language picker must be available on every page")

    required_runtime_contracts = (
        '"placeholder"',
        '"aria-label"',
        '"aria-description"',
        '"alt"',
        '"title"',
        '"content"',
        "document.documentElement",
        "MutationObserver",
        "characterData: true",
        "attributeFilter: OBSERVED_ATTRIBUTES",
        "window.alert",
        "localizedDialog",
        'API_PATH = "/api/i18n/translate"',
        "translation_coverage_incomplete",
        "data-aponar-i18n-pending",
    )
    missing_contracts = [value for value in required_runtime_contracts if value not in content_source]
    if missing_contracts:
        raise SystemExit("Incomplete full-page i18n runtime: " + ", ".join(missing_contracts))

    worker_source = (ROOT / "workers" / "api" / "src" / "index.ts").read_text(encoding="utf-8")
    for required_worker_value in (
        'url.pathname === "/api/i18n/translate"',
        "parseTranslationRequest",
        "translationInstruction",
        "MAX_TRANSLATION_ITEMS",
        "I18N_RATE_LIMITER",
        "defaultWorkerCache",
    ):
        if required_worker_value not in worker_source:
            raise SystemExit(f"Missing translation API contract: {required_worker_value}")

    pages = list(site.rglob("*.html"))
    if not pages:
        raise SystemExit("No built HTML pages found")

    required = (
        "/assets/css/i18n.css?v=20260901.1",
        "/assets/css/home-brand.css?v=20260831.1",
        "/assets/js/i18n.js?v=20260901.1",
        "/assets/js/i18n-content.js?v=20260901.1",
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

    print(
        f"i18n OK: {len(SUPPORTED)} languages, Bangla default, "
        f"reviewed packs plus full-page runtime enabled, {checked} HTML pages wired, "
        f"{localized_checked} localized core routes checked"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
