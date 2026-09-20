from __future__ import annotations

import json
import re
from pathlib import Path


HTML_RE = re.compile(r"<html\b(?P<attrs>[^>]*)>", re.IGNORECASE | re.DOTALL)
PAGE_RE = re.compile(
    r"\bdata-i18n-page\s*=\s*([\"'])(?P<page>.*?)\1",
    re.IGNORECASE | re.DOTALL,
)
PRESERVE_RE = re.compile(r"\bdata-i18n-preserve(?:\s*=|\s|$)", re.IGNORECASE)
MODE_RE = re.compile(r"\bdata-i18n-mode\s*=", re.IGNORECASE)
FALLBACK_RE = re.compile(r"\bdata-i18n-fallback\s*=", re.IGNORECASE)


def normalize_page_key(page_key: str) -> str:
    key = (page_key or "").replace("\\", "/").strip()
    while key.startswith("./"):
        key = key[2:]
    return key.strip("/").lower()


def load_core_policy(root: Path) -> dict[str, object]:
    path = root / "assets" / "i18n" / "core-localization-manifest.json"
    if not path.exists():
        raise RuntimeError(f"Core localization manifest is missing: {path}")
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Invalid core localization manifest: {exc}") from exc

    if payload.get("defaultLanguage") != "bn" or payload.get("fallbackLanguage") != "bn":
        raise RuntimeError("Core localization must use Bengali (bn) as both master and fallback")
    if payload.get("coreMode") != "reviewed-static-with-bn-fallback":
        raise RuntimeError("Unsupported core localization mode")

    exact = payload.get("exactPages")
    prefixes = payload.get("pagePrefixes")
    required = payload.get("requiredCorePages")
    languages = payload.get("supportedLanguages")
    if not isinstance(exact, list) or not all(isinstance(value, str) and value for value in exact):
        raise RuntimeError("core-localization-manifest exactPages must be a non-empty string list")
    if not isinstance(prefixes, list) or not all(isinstance(value, str) and value for value in prefixes):
        raise RuntimeError("core-localization-manifest pagePrefixes must be a non-empty string list")
    if not isinstance(required, list) or not all(isinstance(value, str) and value for value in required):
        raise RuntimeError("core-localization-manifest requiredCorePages must be a non-empty string list")
    if not isinstance(languages, list) or "bn" not in languages:
        raise RuntimeError("core-localization-manifest supportedLanguages must include bn")
    return payload


def is_static_core_page(page_key: str, policy: dict[str, object]) -> bool:
    key = normalize_page_key(page_key)
    exact = {normalize_page_key(str(value)) for value in policy.get("exactPages", [])}
    prefixes = tuple(normalize_page_key(str(value)) for value in policy.get("pagePrefixes", []))
    return key in exact or any(key.startswith(prefix) for prefix in prefixes)


def _mark_html_tag(match: re.Match[str], fallback: str) -> str:
    attrs = match.group("attrs")
    additions: list[str] = []
    if not PRESERVE_RE.search(attrs):
        additions.append("data-i18n-preserve")
    if not MODE_RE.search(attrs):
        additions.append('data-i18n-mode="static-core"')
    if not FALLBACK_RE.search(attrs):
        additions.append(f'data-i18n-fallback="{fallback}"')
    if not additions:
        return match.group(0)
    spacer = " " if not attrs else ("" if attrs.endswith((" ", "\n", "\t")) else " ")
    return f"<html{attrs}{spacer}{' '.join(additions)}>"


def mark_static_core_pages(root: Path) -> tuple[int, int]:
    """Prevent full-page runtime translation on reviewed/static core learning pages.

    Core content is rendered from Bengali source HTML plus reviewed locale packs at build
    time. Missing reviewed text intentionally remains Bengali. The existing i18n runtime
    still handles annotated/shared UI and explicit dynamic helpers because this marker is
    consumed only by the full-page DOM content scanner.
    """

    policy = load_core_policy(root)
    fallback = str(policy["fallbackLanguage"])
    changed = core_pages = 0

    for page in sorted(root.rglob("*.html")):
        try:
            document = page.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        html_match = HTML_RE.search(document)
        if not html_match:
            continue
        page_match = PAGE_RE.search(html_match.group("attrs"))
        if not page_match:
            continue
        key = page_match.group("page")
        if not is_static_core_page(key, policy):
            continue

        core_pages += 1
        updated = HTML_RE.sub(lambda match: _mark_html_tag(match, fallback), document, count=1)
        if updated == document:
            continue
        page.write_text(updated, encoding="utf-8", newline="\n")
        changed += 1

    return changed, core_pages
