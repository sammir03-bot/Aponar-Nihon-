#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
PRODUCTION_ORIGIN = "https://app.aponar-nihon.workers.dev"
LEGACY_ORIGINS = (
    "https://sammir03-bot.github.io/Aponar-Nihon-/",
    "https://sammir03-bot.github.io/Aponar-Nihon/",
    "https://aponar-nihon.eu.cc",
    "http://aponar-nihon.eu.cc",
)
EXCLUDED_DIRS = {
    ".git", ".github", "_site", "android", "play-store", "node_modules",
    "tools", "src", "tests", "workers", ".venv", "venv", "__pycache__",
    "playwright-report", "test-results",
}
TEXT_SUFFIXES = {".html", ".js", ".json", ".xml", ".txt", ".webmanifest"}
SKIP_NAMES = {
    "404.html", "admin.html", "auth.html", "register.html", "profile.html",
    "delete-account.html", "refresh-site.html",
}
CANONICAL_RE = re.compile(
    r"<link\b(?=[^>]*\brel\s*=\s*[\"']canonical[\"'])[^>]*>", re.I
)
ROBOTS_RE = re.compile(
    r"<meta\b(?=[^>]*\bname\s*=\s*[\"']robots[\"'])[^>]*>", re.I
)
REDIRECT_MARKER = "legacy-origin-redirect"
REDIRECT_SCRIPT = f'''<script id="{REDIRECT_MARKER}">\n(function(){{\n  var h = location.hostname;\n  if (h !== "sammir03-bot.github.io" && h !== "aponar-nihon.eu.cc") return;\n  var p = location.pathname || "/";\n  if (h === "sammir03-bot.github.io") {{\n    var bases = ["/Aponar-Nihon-", "/Aponar-Nihon"];\n    for (var i = 0; i < bases.length; i++) {{\n      var base = bases[i];\n      if (p === base || p === base + "/") {{ p = "/"; break; }}\n      if (p.indexOf(base + "/") === 0) {{ p = p.slice(base.length) || "/"; break; }}\n    }}\n  }}\n  location.replace("{PRODUCTION_ORIGIN}" + p + location.search + location.hash);\n}})();\n</script>'''


def is_public_path(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    return not any(part in EXCLUDED_DIRS for part in rel.parts)


def should_index(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    if "archive" in rel.parts:
        return False
    if path.name in SKIP_NAMES or path.name.startswith("google"):
        return False
    return True


def url_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return PRODUCTION_ORIGIN + "/"
    return PRODUCTION_ORIGIN + "/" + quote(rel, safe="/-._~")


def inject_before_head_close(text: str, snippet: str) -> str:
    if re.search(r"</head\s*>", text, re.I):
        return re.sub(r"</head\s*>", "\n" + snippet + "\n</head>", text, count=1, flags=re.I)
    return text


def rewrite_legacy_origins(text: str) -> tuple[str, int]:
    count = 0
    for old in LEGACY_ORIGINS:
        occurrences = text.count(old)
        if occurrences:
            replacement = PRODUCTION_ORIGIN + "/" if old.endswith("/") else PRODUCTION_ORIGIN
            text = text.replace(old, replacement)
            count += occurrences
    return text, count


def canonicalize_html(path: Path, text: str) -> tuple[str, bool, bool]:
    changed_canonical = False
    changed_redirect = False

    if should_index(path):
        tag = f'<link rel="canonical" href="{url_for(path)}">'
        without = CANONICAL_RE.sub("", text)
        text = inject_before_head_close(without, tag)
        changed_canonical = text != without or bool(CANONICAL_RE.search(text))
    else:
        if not ROBOTS_RE.search(text):
            updated = inject_before_head_close(text, '<meta name="robots" content="noindex,nofollow">')
            changed_canonical = updated != text
            text = updated

    if REDIRECT_MARKER not in text:
        updated = inject_before_head_close(text, REDIRECT_SCRIPT)
        changed_redirect = updated != text
        text = updated

    return text, changed_canonical, changed_redirect


def rewrite_public_files() -> tuple[int, int, int, int]:
    changed_files = replacements = canonical_pages = redirect_pages = 0
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or not is_public_path(path) or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            original = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        updated, count = rewrite_legacy_origins(original)
        replacements += count
        if path.suffix.lower() == ".html":
            before = updated
            updated, canonical_changed, redirect_changed = canonicalize_html(path, updated)
            if canonical_changed and updated != before:
                canonical_pages += 1
            if redirect_changed:
                redirect_pages += 1
        if updated != original:
            path.write_text(updated, encoding="utf-8", newline="\n")
            changed_files += 1
    return changed_files, replacements, canonical_pages, redirect_pages


def rebuild_sitemap() -> int:
    pages = [p for p in sorted(ROOT.rglob("*.html")) if is_public_path(p) and should_index(p)]
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    lines.extend(f"  <url><loc>{url_for(p)}</loc></url>" for p in pages)
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return len(pages)


def rebuild_robots() -> None:
    (ROOT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nDisallow: /archive/\n\n"
        f"Sitemap: {PRODUCTION_ORIGIN}/sitemap.xml\n",
        encoding="utf-8",
    )


def main() -> int:
    changed, replacements, canonicals, redirects = rewrite_public_files()
    sitemap_count = rebuild_sitemap()
    rebuild_robots()
    cname = ROOT / "CNAME"
    if cname.exists():
        cname.unlink()
        print("Removed legacy GitHub Pages CNAME")
    print(f"Changed public files: {changed}")
    print(f"Legacy origin replacements: {replacements}")
    print(f"Canonical pages updated: {canonicals}")
    print(f"Legacy-host redirect pages injected: {redirects}")
    print(f"Sitemap URLs: {sitemap_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
