from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import unquote, urlsplit, urlunsplit

from sitecore.htmltools import visible_text_hash


ANCHOR_RE = re.compile(r"<a\b[^>]*>", re.IGNORECASE)
HREF_RE = re.compile(r"\bhref\s*=\s*([\"'])(.*?)\1", re.IGNORECASE | re.DOTALL)
TARGET_BLANK_RE = re.compile(r"\btarget\s*=\s*([\"'])_blank\1", re.IGNORECASE)
REL_RE = re.compile(r"\brel\s*=\s*([\"'])(.*?)\1", re.IGNORECASE | re.DOTALL)
VOCAB_SOURCE_RE = re.compile(r"^Vocabulary-lesson\d+\.html$", re.IGNORECASE)
VOCAB_TARGET_RE = re.compile(r"^lesson-(\d+)\.html$", re.IGNORECASE)
N4_QUIZ_PART_RE = re.compile(
    r"^N4-(Vocabulary|Kanji|Grammar|Reading)-part(\d+)\.html$", re.IGNORECASE
)

ALIASES = {
    "disclaimer.html": "Disclaimer",
    "login.html": "auth.html",
    "help.html": "contact.html",
}

IGNORED_SCHEMES = {"http", "https", "mailto", "tel", "sms", "javascript", "data"}


def _candidate_rewrite(href: str, page: Path, root: Path) -> str | None:
    parsed = urlsplit(href.strip())
    if parsed.scheme.lower() in IGNORED_SCHEMES or parsed.netloc or not parsed.path:
        return None

    raw_path = unquote(parsed.path)
    if raw_path.startswith("/"):
        target = (root / raw_path.lstrip("/")).resolve()
    else:
        target = (page.parent / raw_path).resolve()

    if target.exists():
        return None

    source_name = page.name
    basename = Path(raw_path).name

    quiz_match = N4_QUIZ_PART_RE.match(basename)
    if quiz_match and (root / "jlpt-quiz.html").exists():
        category = quiz_match.group(1).lower()
        part = max(1, min(10, int(quiz_match.group(2))))
        fragment = f"#{parsed.fragment}" if parsed.fragment else ""
        return f"/jlpt-quiz.html?level=n4&category={category}&part={part}{fragment}"

    replacement: str | None = None
    alias = ALIASES.get(basename.lower())
    if alias and (root / alias).exists():
        replacement = "/" + alias

    if replacement is None and VOCAB_SOURCE_RE.match(source_name):
        vocab_match = VOCAB_TARGET_RE.match(basename)
        if vocab_match:
            candidate_name = f"Vocabulary-lesson{int(vocab_match.group(1))}.html"
            if (root / candidate_name).exists():
                replacement = "/" + candidate_name

    if replacement is None:
        root_candidate = (root / raw_path.lstrip("./")).resolve()
        try:
            root_candidate.relative_to(root.resolve())
        except ValueError:
            root_candidate = root / "__outside__"
        if root_candidate.exists():
            replacement = "/" + root_candidate.relative_to(root).as_posix()

    if replacement is None:
        return None

    return urlunsplit(("", "", replacement, parsed.query, parsed.fragment))


def _secure_blank_target(tag: str) -> str:
    if not TARGET_BLANK_RE.search(tag):
        return tag

    rel_match = REL_RE.search(tag)
    if rel_match:
        tokens = [token for token in rel_match.group(2).split() if token]
        lower = {token.lower() for token in tokens}
        if "noopener" not in lower:
            tokens.append("noopener")
        if "noreferrer" not in lower:
            tokens.append("noreferrer")
        quote = rel_match.group(1)
        value = " ".join(tokens)
        return tag[: rel_match.start()] + f"rel={quote}{value}{quote}" + tag[rel_match.end() :]

    insert_at = tag.rfind(">")
    if insert_at < 0:
        return tag
    return tag[:insert_at].rstrip() + ' rel="noopener noreferrer"' + tag[insert_at:]


def enhance_html(html: str, page: Path, root: Path) -> tuple[str, int, int]:
    repaired = 0
    secured = 0

    def replace_anchor(match: re.Match[str]) -> str:
        nonlocal repaired, secured
        tag = match.group(0)
        original = tag
        href_match = HREF_RE.search(tag)
        if href_match:
            new_href = _candidate_rewrite(href_match.group(2), page, root)
            if new_href:
                quote = href_match.group(1)
                tag = tag[: href_match.start()] + f"href={quote}{new_href}{quote}" + tag[href_match.end() :]
                repaired += 1

        hardened = _secure_blank_target(tag)
        if hardened != tag:
            secured += 1
            tag = hardened

        return tag if tag != original else original

    return ANCHOR_RE.sub(replace_anchor, html), repaired, secured


def postprocess_site(root: Path) -> tuple[int, int, int, int]:
    changed_pages = 0
    checked_pages = 0
    repaired_links = 0
    secured_links = 0

    for page in sorted(root.rglob("*.html")):
        try:
            html = page.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        before_hash = visible_text_hash(html)
        enhanced, repaired, secured = enhance_html(html, page, root)
        if enhanced == html:
            continue

        checked_pages += 1
        if visible_text_hash(enhanced) != before_hash:
            raise RuntimeError(
                f"Content integrity failure in {page.relative_to(root)}: "
                "visible text changed during HTML post-processing"
            )

        page.write_text(enhanced, encoding="utf-8", newline="\n")
        changed_pages += 1
        repaired_links += repaired
        secured_links += secured

    return changed_pages, checked_pages, repaired_links, secured_links
