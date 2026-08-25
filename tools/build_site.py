#!/usr/bin/env python3
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from sitecore.htmltools import inject_assets, visible_text_hash
from sitecore.linkcheck import find_broken_page_links
from sitecore.search_index import build_search_index


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {
    ".git",
    ".github",
    "_site",
    "android",
    "play-store",
    "node_modules",
    "tools",
    ".venv",
    "venv",
    "__pycache__",
}

PRO_CSS = '<link rel="stylesheet" href="/assets/css/pro-core.css?v=20260825">'
PRO_JS = '<script defer src="/assets/js/pro-core.js?v=20260825"></script>'


def copy_static_tree(destination: Path) -> int:
    copied = 0
    destination.mkdir(parents=True, exist_ok=True)

    for source in ROOT.rglob("*"):
        rel = source.relative_to(ROOT)
        if any(part in EXCLUDED_DIRS for part in rel.parts):
            continue
        if source.is_dir():
            (destination / rel).mkdir(parents=True, exist_ok=True)
            continue

        target = destination / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied += 1

    return copied


def inject_professional_assets(destination: Path) -> tuple[int, int]:
    changed = 0
    checked = 0

    for page in sorted(destination.rglob("*.html")):
        html = page.read_text(encoding="utf-8")
        before_hash = visible_text_hash(html)
        enhanced = inject_assets(html, (PRO_CSS, PRO_JS))

        if enhanced == html:
            continue

        # Core rule: build-time architecture may add code, but it must not
        # delete, rewrite or insert any human-facing page text.
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

    copied = copy_static_tree(destination)
    injected, integrity_checked = inject_professional_assets(destination)
    indexed = build_search_index(
        destination,
        destination / "assets" / "data" / "search-index.json",
    )

    print(f"Copied files: {copied}")
    print(f"HTML pages enhanced: {injected}")
    print(f"Content-integrity checks passed: {integrity_checked}")
    print(f"Search-index pages: {indexed}")

    if check_links:
        broken = find_broken_page_links(destination)
        if broken:
            print(f"Internal page-link warnings: {len(broken)}")
            for page, href in broken[:60]:
                print(f"  WARN {page} -> {href}")
            if len(broken) > 60:
                print(f"  ... and {len(broken) - 60} more")
        else:
            print("Internal page-link warnings: 0")

    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build Aponar Nihon as a safe, optimized static site."
    )
    parser.add_argument(
        "--out",
        default="_site",
        help="Output directory relative to repository root (default: _site)",
    )
    parser.add_argument(
        "--check-links",
        action="store_true",
        help="Report broken internal HTML page links without blocking the build",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    out = Path(args.out)
    if not out.is_absolute():
        out = ROOT / out
    return build(out.resolve(), check_links=args.check_links)


if __name__ == "__main__":
    raise SystemExit(main())
