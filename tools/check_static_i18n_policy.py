#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

from sitecore.i18n_policy import (
    HTML_RE,
    PAGE_RE,
    is_static_core_page,
    load_core_policy,
    normalize_page_key,
)
from sitecore.locales import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
PRESERVE_RE = re.compile(r"\bdata-i18n-preserve(?:\s*=|\s|$)", re.IGNORECASE)
MODE_RE = re.compile(r"\bdata-i18n-mode\s*=\s*([\"'])static-core\1", re.IGNORECASE)
FALLBACK_RE = re.compile(r"\bdata-i18n-fallback\s*=\s*([\"'])bn\1", re.IGNORECASE)


def fail(message: str) -> None:
    raise SystemExit(message)


def main() -> int:
    if not SITE.exists():
        fail("Built site is missing; run npm run build first")

    policy = load_core_policy(SITE)
    expected_languages = [DEFAULT_LANGUAGE, *SUPPORTED_LANGUAGES]
    if policy.get("supportedLanguages") != expected_languages:
        fail(
            "Core localization language list drifted from sitecore.locales: "
            f"expected {expected_languages}, got {policy.get('supportedLanguages')}"
        )

    required = {normalize_page_key(str(value)) for value in policy.get("requiredCorePages", [])}
    for key in sorted(required):
        if not is_static_core_page(key, policy):
            fail(f"Required core page is outside static-core classification: {key}")

    core_pages = marked_pages = 0
    seen_core_keys: set[str] = set()
    for page in sorted(SITE.rglob("*.html")):
        try:
            document = page.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        html_match = HTML_RE.search(document)
        if not html_match:
            continue
        attrs = html_match.group("attrs")
        page_match = PAGE_RE.search(attrs)
        if not page_match or not is_static_core_page(page_match.group("page"), policy):
            continue

        core_pages += 1
        seen_core_keys.add(normalize_page_key(page_match.group("page")))
        rel = page.relative_to(SITE)
        if not PRESERVE_RE.search(attrs):
            fail(f"Core page is not protected from full-page runtime translation: {rel}")
        if not MODE_RE.search(attrs):
            fail(f"Core page is missing data-i18n-mode=static-core: {rel}")
        if not FALLBACK_RE.search(attrs):
            fail(f"Core page is missing Bengali fallback marker: {rel}")
        marked_pages += 1

    if not core_pages:
        fail("No static-core pages were detected in the built site")
    if core_pages != marked_pages:
        fail(f"Static-core marker coverage mismatch: {marked_pages}/{core_pages}")

    missing_required = sorted(required - seen_core_keys)
    if missing_required:
        fail("Required core pages were not found/protected in the built site: " + ", ".join(missing_required))

    print(
        "static i18n policy OK: "
        f"{marked_pages} core HTML pages use reviewed-static content with bn fallback; "
        f"{len(required)} required ecosystem routes verified"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
