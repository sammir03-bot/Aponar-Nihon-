#!/usr/bin/env python3
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from sitecore.htmltools import inject_assets, visible_text_hash
from sitecore.linkcheck import find_broken_page_links
from sitecore.locales import build_localized_pages
from sitecore.postprocess import postprocess_site
from sitecore.search_index import build_search_index
from sitecore.seo import prepare_search_engine_files


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {
    ".git", ".github", "_site", "android", "play-store", "node_modules",
    "tools", "src", "tests", "workers", ".venv", "venv", "__pycache__",
    "playwright-report", "test-results",
}
EXCLUDED_FILES = {
    ".gitignore", "package.json", "tsconfig.web.json", "tsconfig.worker.json",
    "tsconfig.types.json", "playwright.config.mjs", "lighthouserc.cjs",
    "wrangler.toml", "ARCHITECTURE.md", "SECURITY.md", "CNAME",
    "archive/home-full-legacy.html", "archive/tutor-section-legacy.html",
}

I18N_CSS = '<link rel="stylesheet" href="/assets/css/i18n.css?v=20260901.2">'
HOME_BRAND_CSS = '<link rel="stylesheet" href="/assets/css/home-brand.css?v=20260901.2">'
I18N_JS = '<script src="/assets/js/i18n.js?v=20260902.6"></script>'
I18N_CONTENT_JS = '<script defer src="/assets/js/i18n-content.js?v=20260902.6"></script>'
PRO_CSS = '<link rel="stylesheet" href="/assets/css/pro-core.css?v=20260825">'
PRO_JS = '<script defer src="/assets/js/pro-core.js?v=20260825"></script>'
PLATFORM_TS = '<script type="module" src="/assets/js/ts/platform.js?v=20260825"></script>'
LEGACY_ORIGIN = "https://aponar-nihon.eu.cc"
PRODUCTION_ORIGIN = "https://app.aponar-nihon.workers.dev"
ORIGIN_REWRITE_SUFFIXES = {".html", ".js", ".json", ".xml", ".txt", ".webmanifest"}


def copy_static_tree(destination: Path) -> int:
    copied = 0
    destination.mkdir(parents=True, exist_ok=True)
    for source in ROOT.rglob("*"):
        rel = source.relative_to(ROOT)
        if any(part in EXCLUDED_DIRS for part in rel.parts):
            continue
        if source.is_file() and rel.as_posix() in EXCLUDED_FILES:
            continue
        if source.is_dir():
            (destination / rel).mkdir(parents=True, exist_ok=True)
            continue
        target = destination / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied += 1
    return copied


def rewrite_production_origin(destination: Path) -> tuple[int, int, int]:
    changed_files = replacements = html_checks = 0
    for target in sorted(destination.rglob("*")):
        if not target.is_file() or target.suffix.lower() not in ORIGIN_REWRITE_SUFFIXES:
            continue
        try:
            text = target.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if LEGACY_ORIGIN not in text:
            continue

        before_hash = visible_text_hash(text) if target.suffix.lower() == ".html" else None
        count = text.count(LEGACY_ORIGIN)
        updated = text.replace(LEGACY_ORIGIN, PRODUCTION_ORIGIN)

        if before_hash is not None:
            html_checks += 1
            if visible_text_hash(updated) != before_hash:
                raise RuntimeError(
                    f"Content integrity failure in {target.relative_to(destination)}: "
                    "production-origin rewrite changed visible educational text"
                )

        target.write_text(updated, encoding="utf-8", newline="\n")
        changed_files += 1
        replacements += count

    return changed_files, replacements, html_checks


def inject_professional_assets(destination: Path) -> tuple[int, int]:
    changed = checked = 0
    for page in sorted(destination.rglob("*.html")):
        html = page.read_text(encoding="utf-8")
        before_hash = visible_text_hash(html)
        enhanced = inject_assets(
            html,
            (I18N_CSS, HOME_BRAND_CSS, I18N_JS, I18N_CONTENT_JS, PRO_CSS, PRO_JS, PLATFORM_TS),
        )
        if enhanced == html:
            continue
        after_hash = visible_text_hash(enhanced)
        checked += 1
        if before_hash != after_hash:
            raise RuntimeError(
                f"Content integrity failure in {page.relative_to(destination)}: "
                "visible text changed during asset injection"
            )
        page.write_text(enhanced, encoding="utf-8", newline="\n")
        changed += 1
    return changed, checked


def build(destination: Path, check_links: bool = False) -> int:
    if destination.exists():
        shutil.rmtree(destination)

    compiled = ROOT / "assets" / "js" / "ts" / "platform.js"
    if not compiled.exists():
        raise RuntimeError(
            "TypeScript runtime missing. Run npm run build:ts before the Python site build."
        )

    copied = copy_static_tree(destination)
    origin_files, origin_replacements, origin_html_checks = rewrite_production_origin(destination)
    injected, injection_checked = inject_professional_assets(destination)
    changed, post_checked, repaired, secured = postprocess_site(destination)
    localized_pages, localized_clusters, localized_nodes = build_localized_pages(destination)
    canonicals, noindex, seo_checked, verification, sitemap_urls = prepare_search_engine_files(destination)
    indexed = build_search_index(
        destination,
        destination / "assets" / "data" / "search-index.json",
    )

    print(f"Copied files: {copied}")
    print(f"Production-origin files rewritten: {origin_files}")
    print(f"Production-origin references rewritten: {origin_replacements}")
    print(f"HTML pages enhanced: {injected}")
    print(
        "Content-integrity checks passed: "
        f"{origin_html_checks + injection_checked + post_checked + seo_checked}"
    )
    print(f"HTML pages post-processed: {changed}")
    print(f"Internal links repaired safely: {repaired}")
    print(f"_blank links hardened: {secured}")
    print(f"Localized HTML pages: {localized_pages}")
    print(f"Localized hreflang clusters: {localized_clusters}")
    print(f"Reviewed text nodes localized at build time: {localized_nodes}")
    print(f"SEO canonical pages: {canonicals}")
    print(f"SEO noindex pages: {noindex}")
    print(f"Search Console verification injected: {'yes' if verification else 'no'}")
    print(f"Sitemap URLs: {sitemap_urls}")
    print(f"Search-index pages: {indexed}")

    if check_links:
        broken = find_broken_page_links(destination)
        print(f"Internal page-link warnings: {len(broken)}")
        for page, href in broken[:60]:
            print(f"  WARN {page} -> {href}")

    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build Aponar Nihon as a safe, optimized static site."
    )
    parser.add_argument("--out", default="_site")
    parser.add_argument("--check-links", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    out = Path(args.out)
    if not out.is_absolute():
        out = ROOT / out
    return build(out.resolve(), check_links=args.check_links)


if __name__ == "__main__":
    raise SystemExit(main())
