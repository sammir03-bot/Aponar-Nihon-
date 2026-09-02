from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        if new in text:
            return text
        raise SystemExit(f"{label} pattern not found")
    return text.replace(old, new, 1)


# Root/non-localized pages are native Bangla for first-time visitors. A language
# explicitly selected on Home remains authoritative across later page loads.
p = Path("assets/js/i18n.js")
s = p.read_text(encoding="utf-8")

s = replace_once(
    s,
    """  function readLanguage() {
    // Bangla is the source language. Only an explicit locale URL may override it.
    return languageFromPath() || DEFAULT_LANGUAGE;
  }""",
    """  function readLanguage() {
    return languageFromPath() || storedLanguage() || DEFAULT_LANGUAGE;
  }""",
    "readLanguage",
)

s = replace_once(
    s,
    """      // Remember profile preferences, but never auto-translate the native Bangla root.
      // Only /en/, /ja/, or another explicit locale path is authoritative on page load.
      var local = languageFromPath();
      if (local && rawPreferred !== local && typeof window.AN.updateProfile === \"function\") {
        await window.AN.updateProfile({ preferred_language: local });
      }""",
    """      var local = languageFromPath() || storedLanguage();
      if (local && rawPreferred !== local && typeof window.AN.updateProfile === \"function\") {
        await window.AN.updateProfile({ preferred_language: local });
      } else if (!local && preferred) {
        setLanguage(preferred, { persistProfile: false });
        navigateToLanguage(preferred, true);
      }""",
    "profile startup language",
)

s = replace_once(
    s,
    """    translateAnnotated(document);
    if (currentLanguage !== DEFAULT_LANGUAGE || languageFromPath()) {""",
    """    if (currentLanguage !== DEFAULT_LANGUAGE) translateAnnotated(document);
    if (currentLanguage !== DEFAULT_LANGUAGE || languageFromPath()) {""",
    "annotated startup translation",
)

p.write_text(s, encoding="utf-8")


# The full-page runtime translator must not do any work for Bangla because
# the HTML itself is already Bangla.
p = Path("assets/js/i18n-content.js")
s = p.read_text(encoding="utf-8")

bn_block = re.compile(
    r'''    if \(language === "bn"\) \{\n'''
    r'''      if \(/\[A-Za-z\]/\.test\(text\)\) return true;\n'''
    r'''      var nonBangla = text\.replace\(/\[\\u0980-\\u09ff\\u3040-\\u30ff\\u3400-\\u9fff\]/g, ""\)\.replace\(/\[\\d\\s\\p\{P\}\\p\{S\}\]/gu, ""\);\n'''
    r'''      return containsLetters\(nonBangla\);\n'''
    r'''    \}'''
)

if 'if (language === "bn") return false;' not in s:
    s, count = bn_block.subn(
        '    // Bangla is the native/source language. Never translate it at runtime.\n'
        '    if (language === "bn") return false;',
        s,
        count=1,
    )
    if count != 1:
        raise SystemExit("Bangla needsTranslation pattern not found")

sync_marker = """  async function sync(blocking) {
    var language = window.AponarI18n.getLanguage(), serial = ++requestSerial;
    activeLanguage = language;
    if (blocking !== false) restoreCaptured();
    else captureOriginals(document.documentElement);"""

sync_replacement = sync_marker + """
    // Bangla is already the source HTML: no scan, loading overlay, cache lookup, or API request.
    if (language === "bn") {
      clearPending();
      hideStatus();
      return;
    }"""

if "Bangla is already the source HTML" not in s:
    if sync_marker not in s:
        raise SystemExit("sync startup pattern not found")
    s = s.replace(sync_marker, sync_replacement, 1)

s = re.sub(r'var RUNTIME_VERSION = "[^"]+";', 'var RUNTIME_VERSION = "20260902.6";', s, count=1)
s = re.sub(r'var CACHE_VERSION = "[^"]+";', 'var CACHE_VERSION = "20260902.5";', s, count=1)

p.write_text(s, encoding="utf-8")

print("Bangla default and saved language startup patch applied")
