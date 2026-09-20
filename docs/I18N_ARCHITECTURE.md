# Aponar Nihon localization architecture

## Goal

Bangla (`bn`) is the default, master, and fallback language for Aponar Nihon. Core learning and Japan-life content must not depend on live machine translation. The current page design, navigation, JavaScript behavior, progress storage, Japanese text, kanji, kana, furigana, and exercise IDs stay shared across every language.

## Two localization modes

### 1. Core content: reviewed static localization

Core pages use `reviewed-static-with-bn-fallback`.

This includes:

- JLPT N5, N4, N3 hubs and their Vocabulary, Kanji, Grammar, Reading, Listening, lesson, quiz and mock-test pages
- JLPT quiz, revision and Grammar VS
- Student Toolkit
- Kanji Flash Cards
- CV builders
- Interview preparation
- Jobs in Japan / part-time job guides
- Japan Life and practical daily-life guides

The authoritative list lives in `assets/i18n/core-localization-manifest.json`.

For these pages:

1. Bengali source HTML remains the master copy.
2. Reviewed translations live in `assets/i18n/pages/<page>.<language>.json`.
3. `tools/sitecore/locales.py` renders reviewed packs into separate locale routes such as `/en/n5/` while reusing the same HTML/CSS/JS design.
4. The build marks every core page with `data-i18n-preserve`, `data-i18n-mode="static-core"`, and `data-i18n-fallback="bn"`.
5. `assets/js/i18n-content.js` therefore does not scan or machine-translate the core document body, metadata, or newly inserted lesson content.
6. If a reviewed translation entry or entire locale pack is missing, the original Bengali source remains visible. There is no half-machine-translated lesson.
7. Shared/annotated UI (`data-i18n`) and explicit dynamic helpers such as dialogs may still use the normal UI localization runtime.

### 2. Generic UI and non-core pages

Generic interface strings may use the existing shared dictionaries and runtime translation fallback. This keeps small buttons, helper messages, menus, and non-core pages flexible without allowing machine translation to alter learning content.

## Japanese study text

Japanese study material is never treated as a translation target. Existing locale rendering and runtime rules preserve elements such as:

- `lang="ja"`
- `.jp`
- `.japanese`
- `.kanji`
- `.kana`
- ruby/furigana markup

Translations should change only surrounding meaning, explanation, instructions, answer review, guidance, and other localized prose.

## Reviewed pack format

Only human-reviewed packs may be committed to `assets/i18n/pages/`.

```json
{
  "sourceLanguage": "bn",
  "targetLanguage": "en",
  "page": "n5",
  "reviewed": true,
  "entries": [
    { "source": "আপনার N5 অগ্রগতি", "target": "Your N5 progress" }
  ]
}
```

`tools/check_i18n_packs.py` rejects unreviewed, empty, malformed, duplicated, or mismatched packs.

## Supported languages

- Bengali (`bn`) — master/default/fallback
- Japanese (`ja`)
- English (`en`)
- Vietnamese (`vi`)
- Nepali (`ne`)
- Hindi (`hi`)
- Urdu (`ur`)
- Burmese/Myanmar (`my`)
- Chinese (`zh`)
- Sinhala (`si`)
- Filipino (`fil`)

The manifest and `tools/sitecore/locales.py` must stay in sync. `tools/check_static_i18n_policy.py` enforces that in CI.

## Adding or updating a core page

1. Write and verify the Bengali page first.
2. Keep Japanese examples and exercise identifiers stable.
3. If the page belongs to an existing core prefix (`n5-`, `n4-`, `n3-`, `japan-`), no policy change is needed.
4. Otherwise add its page key to `exactPages` in `core-localization-manifest.json`.
5. Extract translatable Bengali strings using the existing i18n tooling.
6. Create one reviewed pack per target language only after its translations have been checked.
7. Run `npm run verify` and `npm run test:browser`.
8. Confirm the localized route preserves layout, progress behavior, Japanese text, and answer correctness.

## Review rules for learning content

A translation is not considered reviewed merely because a translation provider returned text. Reviewers should check:

- grammar terminology and JLPT level accuracy
- correct answer/explanation alignment
- vocabulary meaning in context
- Japanese examples unchanged
- numbers, counters, dates, particles and conjugation notes
- interview/job/legal-life guidance for misleading wording
- RTL layout for Urdu
- mobile overflow and long labels

## Fallback behavior

Missing reviewed localization is expected during migration. The safe fallback is always Bengali. Do not restore full-page runtime translation on core pages to hide missing coverage. It is better to show correct Bengali source text than an inaccurate machine-translated lesson.

## Quality gates

`npm run quality` verifies the existing translation/runtime checks plus the static-core policy. Browser regression tests also verify that core pages make no full-page `/api/i18n/translate` requests while non-core pages retain runtime behavior.
