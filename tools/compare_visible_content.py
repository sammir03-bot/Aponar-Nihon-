#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

from sitecore.htmltools import visible_text_hash


ROOT = Path(__file__).resolve().parents[1]

# These pages were deliberately rebuilt as lightweight app surfaces. Their
# previous visible content is kept byte-for-byte in noindex archive pages so
# the zero-content-loss guarantee remains enforceable while the live routes can
# evolve. Add to this map only when a product change explicitly moves a page.
MOVED_PAGE_ARCHIVES = {
    "index.html": "archive/home-full-legacy.html",
    "tutor-section.html": "archive/tutor-section-v2.html",
    "n5.html": "archive/n5-hub-v1.html",
    "n4.html": "archive/n4-hub-v1.html",
    "n3.html": "archive/n3-hub-v1.html",
    "quiz.html": "archive/quiz-hub-v1.html",
    "interview.html": "archive/interview-hub-v1.html",
    "ssw.html": "archive/ssw-hub-v1.html",
    "ssw-overview.html": "archive/ssw-overview-v1.html",
    "ssw-visa-process.html": "archive/ssw-visa-process-v1.html",
    "ssw-exam.html": "archive/ssw-exam-v1.html",
    "ssw-documents.html": "archive/ssw-documents-v1.html",
    "ssw-interview.html": "archive/ssw-interview-v1.html",
    "ssw-job.html": "archive/ssw-job-v1.html",
    "ssw-salary.html": "archive/ssw-salary-v1.html",
    "ssw-faq.html": "archive/ssw-faq-v1.html",
}


def git(*args: str) -> str:
    return subprocess.check_output(
        ["git", *args], cwd=ROOT, text=True, encoding="utf-8", errors="strict"
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Ensure existing base-branch HTML visible text is unchanged."
    )
    parser.add_argument("--base", default="origin/main")
    args = parser.parse_args()

    base_files = [
        line.strip()
        for line in git("ls-tree", "-r", "--name-only", args.base).splitlines()
        if line.strip().lower().endswith(".html")
    ]

    missing: list[str] = []
    changed: list[str] = []
    checked = 0

    for rel in base_files:
        current = ROOT / rel
        if not current.exists():
            missing.append(rel)
            continue

        try:
            base_html = git("show", f"{args.base}:{rel}")
            current_html = current.read_text(encoding="utf-8")
        except (UnicodeDecodeError, subprocess.CalledProcessError):
            continue

        checked += 1
        if visible_text_hash(base_html) != visible_text_hash(current_html):
            archive_rel = MOVED_PAGE_ARCHIVES.get(rel)
            if archive_rel:
                archive_path = ROOT / archive_rel
                try:
                    archive_html = archive_path.read_text(encoding="utf-8")
                except (FileNotFoundError, UnicodeDecodeError):
                    changed.append(rel)
                    continue
                if visible_text_hash(base_html) == visible_text_hash(archive_html):
                    continue
            changed.append(rel)

    print(f"Base HTML files checked: {checked}")
    print(f"Missing source HTML files: {len(missing)}")
    print(f"Visible-text changes vs {args.base}: {len(changed)}")

    if missing:
        for rel in missing[:40]:
            print(f"MISSING {rel}")
    if changed:
        for rel in changed[:40]:
            print(f"CHANGED {rel}")

    if missing or changed:
        raise SystemExit(
            "Source content preservation guard failed. Existing base HTML must remain intact in this architecture PR."
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
