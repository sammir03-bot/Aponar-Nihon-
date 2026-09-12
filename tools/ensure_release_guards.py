#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {
    ".git", ".github", "_site", "android", "archive", "node_modules",
    "play-store", "playwright-report", "test-results",
}
MARKER = 'id="legacy-origin-redirect"'
LEGACY_HOST = "sammir03-bot.github.io"
PRODUCTION_ORIGIN = "https://app.aponar-nihon.workers.dev"
ACTIVITY_VERSION = "20260911.4"

LEGACY_GUARD = '''
  <script id="legacy-origin-redirect">
  (function(){
    var h = location.hostname;
    if (h !== "sammir03-bot.github.io" && h !== "aponar-nihon.eu.cc") return;
    var p = location.pathname || "/";
    if (h === "sammir03-bot.github.io") {
      var bases = ["/Aponar-Nihon-", "/Aponar-Nihon"];
      for (var i = 0; i < bases.length; i++) {
        var base = bases[i];
        if (p === base || p === base + "/") { p = "/"; break; }
        if (p.indexOf(base + "/") === 0) { p = p.slice(base.length) || "/"; break; }
      }
    }
    if (p === "/index.html") p = "/";
    else if (p.endsWith("/index.html")) p = p.slice(0, -10);
    else if (p.endsWith(".html")) p = p.slice(0, -5);
    location.replace("https://app.aponar-nihon.workers.dev" + p + location.search + location.hash);
  })();
  </script>'''

HOME_CARDS = '''
        <a class="app-tool app-tool-flashcards" href="/jlpt-revision#flash" data-kanji-flashcards-entry="1" data-label="Kanji Flashcards" data-search="kanji flashcards flash card n5 n4 n3 漢字 কাঞ্জি ফ্ল্যাশকার্ড review spaced repetition weak ভুল" data-search-icon="fa-layer-group">
          <span class="app-tool-icon"><i class="fa-solid fa-layer-group" aria-hidden="true"></i></span><b>Kanji Flashcards</b><small>N5 · N4 · N3 স্মার্ট রিভিউ</small>
        </a>
        <a class="app-tool app-tool-revision" href="/jlpt-revision#revision" data-full-revision-entry="1" data-label="Full Revision" data-search="full revision jlpt n5 n4 n3 exam grammar vocabulary kanji reading listening mock quick weak রিভিশন পরীক্ষা" data-search-icon="fa-rotate">
          <span class="app-tool-icon"><i class="fa-solid fa-rotate" aria-hidden="true"></i></span><b>Full Revision</b><small>পরীক্ষার আগে সব একসাথে</small>
        </a>
        <a class="app-tool app-tool-listening" href="/listening-lab.html" data-listening-lab-entry="1" data-label="Listening Lab" data-search="listening lab jlpt n5 n4 n3 audio listening শুনুন লিসিনিং furigana grammar weak exam" data-search-icon="fa-headphones">
          <span class="app-tool-icon"><i class="fa-solid fa-headphones" aria-hidden="true"></i></span><b>Listening Lab</b><small>শুনুন · উত্তর দিন · ভেঙে শিখুন</small>
        </a>'''


def public_html(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    return not path.name.startswith("google") and not any(part in EXCLUDED_DIRS for part in rel.parts)


def ensure_legacy_guard(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if "<html" not in text.lower():
        return False
    if MARKER in text and LEGACY_HOST in text and PRODUCTION_ORIGIN in text:
        return False
    updated, count = re.subn(r"(<head\b[^>]*>)", r"\1" + LEGACY_GUARD, text, count=1, flags=re.I)
    if not count:
        return False
    path.write_text(updated, encoding="utf-8", newline="\n")
    return True


def ensure_home_cards() -> bool:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    updated = text

    old_to_new = {
        'href="/kanji-flashcards.html"': 'href="/jlpt-revision#flash"',
        'href="/revision.html"': 'href="/jlpt-revision#revision"',
    }
    for old, new in old_to_new.items():
        updated = updated.replace(old, new)

    required_hrefs = (
        'href="/jlpt-revision#flash"',
        'href="/jlpt-revision#revision"',
        'href="/listening-lab.html"',
    )
    missing = all(href not in updated for href in required_hrefs)
    if missing:
        pattern = r'(<a class="app-tool" href="/n3\.html"[\s\S]*?</a>)'
        updated, count = re.subn(pattern, r"\1\n" + HOME_CARDS, updated, count=1)
        if not count:
            raise SystemExit("Could not locate the JLPT N3 Home card for learning-card injection")

    updated = re.sub(
        r'src="/activity-tracker\.js(?:\?v=[^"]*)?"',
        f'src="/activity-tracker.js?v={ACTIVITY_VERSION}"',
        updated,
    )

    if updated == text:
        return False
    path.write_text(updated, encoding="utf-8", newline="\n")
    return True


def verify() -> None:
    failures: list[str] = []
    for path in sorted(ROOT.rglob("*.html")):
        if not public_html(path):
            continue
        text = path.read_text(encoding="utf-8")
        if "<html" not in text.lower():
            continue
        missing = [needle for needle in (MARKER, LEGACY_HOST, PRODUCTION_ORIGIN) if needle not in text]
        if missing:
            failures.append(path.relative_to(ROOT).as_posix())
    if failures:
        raise SystemExit("Legacy guards still missing: " + ", ".join(failures[:20]))

    home = (ROOT / "index.html").read_text(encoding="utf-8")
    for href in ("/jlpt-revision#flash", "/jlpt-revision#revision", "/listening-lab.html"):
        if f'href="{href}"' not in home:
            raise SystemExit(f"Home learning card missing: {href}")
    if '/kanji-flashcards.html' in home or '/revision.html' in home:
        raise SystemExit("Home still contains legacy redirect-stub links")
    if f'/activity-tracker.js?v={ACTIVITY_VERSION}' not in home:
        raise SystemExit("Home activity tracker is not cache-busted")


def main() -> int:
    guards = 0
    for path in sorted(ROOT.rglob("*.html")):
        if public_html(path) and ensure_legacy_guard(path):
            guards += 1
    home_changed = ensure_home_cards()
    verify()
    print(f"Release repair complete: {guards} legacy guards injected; Home changed={home_changed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
