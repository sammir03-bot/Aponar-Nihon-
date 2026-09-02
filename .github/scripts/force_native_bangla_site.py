#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SUPPORTED_LOCALES = {"ja", "en", "vi", "ne", "hi", "ur", "my", "zh", "si", "fil"}
EXCLUDED_DIRS = {
    ".git", ".github", "_site", "node_modules", "android", "play-store",
    "workers", "tools", "src", "tests", ".venv", "venv", "__pycache__",
    "playwright-report", "test-results",
}
HTML_TAG_RE = re.compile(r"<html\b([^>]*)>", re.IGNORECASE)
VERSION = "20260902.7"
CACHE_VERSION = "20260902.5"


def write_if_changed(path: Path, text: str) -> bool:
    old = path.read_text(encoding="utf-8")
    if old == text:
        return False
    path.write_text(text, encoding="utf-8", newline="\n")
    return True


def force_bangla_html_tag(text: str) -> str:
    def replace(match: re.Match[str]) -> str:
        attrs = match.group(1)
        attrs = re.sub(
            r"\s+(?:lang|dir|data-language-preset|data-source-language)\s*=\s*([\"']).*?\1",
            "",
            attrs,
            flags=re.IGNORECASE | re.DOTALL,
        )
        return (
            f'<html{attrs} lang="bn" dir="ltr" '
            'data-language-preset="bn" data-source-language="bn">'
        )
    return HTML_TAG_RE.sub(replace, text, count=1)


def normalize_source_html() -> int:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if path.name.startswith("google") or any(part in EXCLUDED_DIRS for part in rel.parts):
            continue
        if rel.parts and rel.parts[0] in SUPPORTED_LOCALES:
            continue
        text = path.read_text(encoding="utf-8", errors="strict")
        updated = force_bangla_html_tag(text)
        if updated != text:
            path.write_text(updated, encoding="utf-8", newline="\n")
            changed += 1
    return changed


def patch_runtime() -> list[str]:
    changed: list[str] = []

    p = ROOT / "assets/js/i18n.js"
    s = p.read_text(encoding="utf-8")
    s = s.replace(
        '  function readLanguage() {\n    // Native HTML is Bangla. Only an explicit locale route/preset may override it.\n    return languageFromPath() || DEFAULT_LANGUAGE;\n  }',
        '  function readLanguage() {\n    return languageFromPath() || storedLanguage() || DEFAULT_LANGUAGE;\n  }',
    )
    if write_if_changed(p, s):
        changed.append(str(p.relative_to(ROOT)))

    p = ROOT / "assets/js/i18n-content.js"
    s = p.read_text(encoding="utf-8")
    s = re.sub(r'var RUNTIME_VERSION = "[^"]+";', f'var RUNTIME_VERSION = "{VERSION}";', s, count=1)
    s = re.sub(r'var CACHE_VERSION = "[^"]+";', f'var CACHE_VERSION = "{CACHE_VERSION}";', s, count=1)

    old = '  function observeDynamicContent() {\n    if (typeof MutationObserver === "undefined" || !document.documentElement) return;'
    new = '  function observeDynamicContent() {\n    if (observer || typeof MutationObserver === "undefined" || !document.documentElement) return;'
    if old in s:
        s = s.replace(old, new, 1)

    old = '''  captureOriginals(document.documentElement);
  window.AponarI18nContent = {
    pageKey: pageKey, reload: function () { return sync(true); }, restore: restoreCaptured, translateText: translateText,
    alert: function (message) { return localizedDialog(message, false); }, confirm: function (message) { return localizedDialog(message, true); },
    attributes: TRANSLATABLE_ATTRIBUTES.slice(), runtimeVersion: RUNTIME_VERSION
  };
  window.alert = function (message) { window.AponarI18nContent.alert(message); };
  document.addEventListener("DOMContentLoaded", function () { captureOriginals(document.documentElement); observeDynamicContent(); sync(true); });
  window.addEventListener("aponar:languagechange", function () { window.requestAnimationFrame(function () { sync(true); }); });
})();'''
    new = '''  if (window.AponarI18n.getLanguage() !== "bn") captureOriginals(document.documentElement);
  window.AponarI18nContent = {
    pageKey: pageKey, reload: function () { return sync(true); }, restore: restoreCaptured, translateText: translateText,
    alert: function (message) { return localizedDialog(message, false); }, confirm: function (message) { return localizedDialog(message, true); },
    attributes: TRANSLATABLE_ATTRIBUTES.slice(), runtimeVersion: RUNTIME_VERSION
  };
  window.alert = function (message) { window.AponarI18nContent.alert(message); };

  function startRuntime(blocking) {
    if (window.AponarI18n.getLanguage() === "bn") {
      restoreCaptured();
      clearPending();
      hideStatus();
      return;
    }
    captureOriginals(document.documentElement);
    observeDynamicContent();
    sync(blocking);
  }

  document.addEventListener("DOMContentLoaded", function () { startRuntime(true); });
  window.addEventListener("aponar:languagechange", function () {
    window.requestAnimationFrame(function () { startRuntime(false); });
  });
})();'''
    if old in s:
        s = s.replace(old, new, 1)
    if write_if_changed(p, s):
        changed.append(str(p.relative_to(ROOT)))

    return changed


def patch_build_and_checks() -> list[str]:
    changed: list[str] = []

    p = ROOT / "tools/build_site.py"
    s = p.read_text(encoding="utf-8")
    s = re.sub(
        r'I18N_JS = \'<script src="/assets/js/i18n\.js\?v=[^\"]+"></script>\'',
        f'I18N_JS = \'<script src="/assets/js/i18n.js?v={VERSION}"></script>\'',
        s,
        count=1,
    )
    s = re.sub(
        r'I18N_CONTENT_JS = \'<script defer src="/assets/js/i18n-content\.js\?v=[^\"]+"></script>\'',
        f'I18N_CONTENT_JS = \'<script defer src="/assets/js/i18n-content.js?v={VERSION}"></script>\'',
        s,
        count=1,
    )
    if write_if_changed(p, s):
        changed.append(str(p.relative_to(ROOT)))

    p = ROOT / "tools/check_i18n.py"
    s = p.read_text(encoding="utf-8")
    s = re.sub(r'\'CACHE_VERSION = "[^"]+"\'', f'\'CACHE_VERSION = "{CACHE_VERSION}"\'', s, count=1)
    s = re.sub(r'"/assets/js/i18n\.js\?v=[^"]+"', f'"/assets/js/i18n.js?v={VERSION}"', s, count=1)
    s = re.sub(r'"/assets/js/i18n-content\.js\?v=[^"]+"', f'"/assets/js/i18n-content.js?v={VERSION}"', s, count=1)

    marker = '''    if missing:
        sample = ", ".join(missing[:12])
        raise SystemExit(f"Multilingual assets missing from {len(missing)} pages: {sample}")
'''
    native_guard = marker + '''
    native_locale_errors: list[str] = []
    for page in pages:
        if page.name.startswith("google"):
            continue
        rel_path = page.relative_to(site)
        if rel_path.parts and rel_path.parts[0] in SUPPORTED[1:]:
            continue
        html = page.read_text(encoding="utf-8", errors="ignore")
        if 'lang="bn"' not in html or 'data-language-preset="bn"' not in html:
            native_locale_errors.append(rel_path.as_posix())
    if native_locale_errors:
        sample = ", ".join(native_locale_errors[:12])
        raise SystemExit(
            f"Native HTML must be Bangla by default; invalid pages: {sample}"
        )
'''
    if marker in s and "native_locale_errors" not in s:
        s = s.replace(marker, native_guard, 1)
    if write_if_changed(p, s):
        changed.append(str(p.relative_to(ROOT)))

    p = ROOT / "tools/sitecore/locales.py"
    s = p.read_text(encoding="utf-8")
    marker = '''    page_by_key: dict[str, Path] = {}
    for page in base_pages:
        key = page_key(page, root)
        if key in page_by_key:
            raise RuntimeError(f"Duplicate i18n page key: {key}")
        page_by_key[key] = page
'''
    replacement = '''    page_by_key: dict[str, Path] = {}
    for page in base_pages:
        key = page_key(page, root)
        # Every native/base document is explicitly Bangla. Locale copies override this below.
        source_document = page.read_text(encoding="utf-8")
        native_document = _set_document_locale(source_document, DEFAULT_LANGUAGE, key)
        if native_document != source_document:
            page.write_text(native_document, encoding="utf-8", newline="\\n")
        if key in page_by_key:
            raise RuntimeError(f"Duplicate i18n page key: {key}")
        page_by_key[key] = page
'''
    if marker in s:
        s = s.replace(marker, replacement, 1)
    if write_if_changed(p, s):
        changed.append(str(p.relative_to(ROOT)))

    return changed


def verify() -> None:
    i18n = (ROOT / "assets/js/i18n.js").read_text(encoding="utf-8")
    content = (ROOT / "assets/js/i18n-content.js").read_text(encoding="utf-8")
    build = (ROOT / "tools/build_site.py").read_text(encoding="utf-8")
    checks = (ROOT / "tools/check_i18n.py").read_text(encoding="utf-8")

    assert 'return languageFromPath() || storedLanguage() || DEFAULT_LANGUAGE;' in i18n
    assert 'preset !== DEFAULT_LANGUAGE' in i18n
    assert 'if (!isHomeRoute()) return;' in i18n
    assert 'if (language === "bn") return false;' in content
    assert 'if (window.AponarI18n.getLanguage() === "bn")' in content
    assert 'if (observer || typeof MutationObserver' in content
    assert f'RUNTIME_VERSION = "{VERSION}"' in content
    assert f'CACHE_VERSION = "{CACHE_VERSION}"' in content
    assert 'MAX_BLOCKING_MS = 1800' in content
    assert 'startRuntime(false)' in content
    assert f'/assets/js/i18n.js?v={VERSION}' in build
    assert f'/assets/js/i18n-content.js?v={VERSION}' in build
    assert f'/assets/js/i18n.js?v={VERSION}' in checks
    assert f'/assets/js/i18n-content.js?v={VERSION}' in checks
    assert 'native_locale_errors' in checks

    bad = []
    total = 0
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if path.name.startswith("google") or any(part in EXCLUDED_DIRS for part in rel.parts):
            continue
        if rel.parts and rel.parts[0] in SUPPORTED_LOCALES:
            continue
        total += 1
        text = path.read_text(encoding="utf-8")
        if 'lang="bn"' not in text or 'data-language-preset="bn"' not in text:
            bad.append(rel.as_posix())
    if bad:
        raise SystemExit("Non-Bangla native HTML remains: " + ", ".join(bad[:20]))
    print(f"Verified native Bangla defaults across {total} source HTML files")


def main() -> int:
    html_changed = normalize_source_html()
    code_changed = patch_runtime() + patch_build_and_checks()
    verify()
    print(f"Source HTML normalized: {html_changed}")
    print("Code files changed: " + (", ".join(code_changed) if code_changed else "none"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
