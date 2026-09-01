# Aponar Nihon page translation packs

Bangla (`bn`) is the source/default language. The shared UI is translated by `assets/js/i18n.js`. Reviewed long-form lesson translations live here and always take priority. `assets/js/i18n-content.js` then completes any missing page text through the rate-limited `/api/i18n/translate` service, including user-facing attributes and content added dynamically after load.

## Supported languages

- `ja` — 日本語
- `en` — English
- `vi` — Tiếng Việt
- `ne` — नेपाली
- `hi` — हिन्दी
- `ur` — اردو
- `my` — မြန်မာ
- `zh` — 中文
- `si` — සිංහල (Sri Lanka)
- `fil` — Filipino (Philippines)

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
6. A missing pack is completed by the runtime translation service. The opaque localized loading surface stays in place until every collected string has a translation, so mixed-language content is not exposed.
7. Prefer one reviewed pack per page/language. Do not use browser auto-translation as the source of truth for educational material.
8. Reviewed packs are also rendered into crawlable locale routes at build time (for example `/en/n5/`). The Bangla source remains at the unprefixed URL.
9. Runtime coverage includes visible text, document title and description metadata, `placeholder`, `title`, `alt`, `aria-label`, `aria-description`, button values, data-backed labels, dynamic DOM updates, alerts and confirmation dialogs. User-entered text and protected Japanese study elements are never sent for translation.

## Workflow

Use `python3 tools/i18n_extract.py <page.html> --language <code>` to generate a starter pack containing the page's translatable visible text. Fill the `target` fields, review the Japanese-learning accuracy, set `reviewed` to `true`, and save the file under this directory.
