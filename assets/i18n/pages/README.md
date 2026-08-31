# Aponar Nihon page translation packs

Bangla (`bn`) is the source/default language. The shared UI is translated by `assets/js/i18n.js`. Long lesson/content translations live here as reviewed per-page JSON packs so Japanese study text is never blindly machine-translated in the browser.

## Supported languages

- `ja` — 日本語
- `en` — English
- `vi` — Tiếng Việt
- `ne` — नेपाली
- `hi` — हिन्दी
- `ur` — اردو
- `my` — မြန်မာ
- `zh` — 中文

## File naming

The browser converts the page path into a page key:

- `/n5-grammar-lesson-01-real.html` → `n5-grammar-lesson-01-real`
- `/n3/lesson.html` → `n3__lesson`

A Vietnamese pack for the first example is:

`n5-grammar-lesson-01-real.vi.json`

## JSON format

```json
{
  "sourceLanguage": "bn",
  "targetLanguage": "vi",
  "page": "n5-grammar-lesson-01-real",
  "reviewed": true,
  "entries": [
    {
      "source": "সহজ বাংলা ব্যাখ্যা",
      "target": "Giải thích đơn giản bằng tiếng Việt"
    }
  ]
}
```

## Content safety rules

1. Keep Japanese sentences, grammar patterns, kanji, kana, furigana and readings unchanged unless a translation entry is explicitly meant to translate an explanation around them.
2. Translate learner-facing explanations, meanings, tips, warnings, examples' meaning, navigation copy and common-mistake guidance.
3. Do not invent grammar rules or alter formation tables to make a translation sound smoother.
4. Preserve placeholders, numbers, JLPT level names and code-like tokens when they carry meaning.
5. Urdu packs may use normal Urdu text; the runtime applies direction handling without changing Japanese source text.
6. A missing pack is safe: the page stays in Bangla rather than showing an unreviewed translation.
7. Prefer one reviewed pack per page/language. Do not use browser auto-translation as the source of truth for educational material.

## Workflow

Use `python3 tools/i18n_extract.py <page.html> --language <code>` to generate a starter pack containing the page's translatable visible text. Fill the `target` fields, review the Japanese-learning accuracy, set `reviewed` to `true`, and save the file under this directory.
