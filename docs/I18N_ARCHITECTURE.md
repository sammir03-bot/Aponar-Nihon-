# Aponar Nihon localization architecture

## Goal

Bengali (`bn`) is the canonical source and default language for Aponar Nihon. Core learning and Japan-life content must not depend on live full-page machine translation. When a user selects another language, a core page should load a separately generated static HTML route for that language instead of translating the Bengali DOM at runtime.

The existing page design, JavaScript behavior, progress storage, Japanese text, kanji, kana, furigana, exercise IDs, and learning logic stay shared across languages.

## Two localization modes

### 1. Core content: direct static HTML

Core pages use `direct-static-html`.

This includes:

- JLPT N5, N4, N3 hubs and their Vocabulary, Kanji, Grammar, Reading, Listening, lesson, quiz and mock-test pages
- JLPT quiz, revision and Grammar VS
- Student Toolkit
- Kanji Flash Cards
- CV builders
- Interview preparation
- Jobs in Japan / part-time job guides
- Japan Life and practical daily-life guides

The authoritative classification lives in `assets/i18n/core-localization-manifest.json`.

For these pages:

1. Bengali source HTML remains the canonical source copy.
2. Authored locale content lives in `assets/i18n/pages/<page>.<language>.json`.
3. `tools/sitecore/locales.py` renders locale packs into separate routes such as `/ne/n5/` and `/ne/n5/vocabulary/` while reusing the same page implementation.
4. Localized links are rewritten to the same selected language whenever the destination page also has an authored pack.
5. The build marks core pages with `data-i18n-preserve`, `data-i18n-mode="static-core"`, and `data-i18n-source="bn"`.
6. Core pages do **not** use `data-i18n-fallback` and do **not** fall back to Bengali after a user has selected another language.
7. `assets/js/i18n-static-core.js` follows `hreflang` alternate links to the selected language's static route. If that route has not been authored yet, it records `data-i18n-missing-static-language` instead of silently sending the user to Bengali or machine-translating the body.
8. `assets/js/i18n-content.js` does not scan or machine-translate the core document body.
9. `tools/sitecore/localized_literals.py` applies authored replacements to user-facing strings outside normal HTML text nodes, including attributes, inline JavaScript messages, search data, and encoded URL prompts.

A core route is only listed under `completeLocalizedPages` after its authored output is expected to contain no Bengali UI copy other than the preserved Aponar Nihon brand. `tools/check_authored_static_locales.py` enforces this in CI.

### 2. Generic UI and non-core pages

Generic interface strings and non-core pages may continue using the existing shared dictionaries and runtime translation behavior. This keeps generic surfaces flexible without allowing runtime machine translation to rewrite core learning content.

## Japanese study text

Japanese study material is never treated as a translation target. Existing locale rendering rules preserve elements such as:

- `lang="ja"`
- `.jp`
- `.japanese`
- `.kanji`
- `.kana`
- ruby/furigana markup

Translations should change only surrounding meaning, explanation, instructions, answer review, guidance, accessibility labels, search text, and other localized prose.

## Locale pack format and review status

A locale pack currently uses the existing `reviewed: true` build gate:

```json
{
  "sourceLanguage": "bn",
  "targetLanguage": "ne",
  "page": "n5",
  "reviewed": true,
  "reviewStatus": "assistant-authored-pending-native-review",
  "entries": [
    { "source": "আপনার N5 অগ্রগতি", "target": "तपाईंको N5 प्रगति" }
  ]
}
```

`reviewed: true` means the pack is intentionally enabled for static generation and passes the repository's structural checks; it should not be interpreted by itself as proof of native-speaker review. Use `reviewStatus` when provenance or linguistic review is still pending. High-impact learning, interview, employment, legal-life, and safety guidance should receive native/domain review before being treated as final editorial copy.

`tools/check_i18n_packs.py` rejects empty, malformed, duplicated, or mismatched enabled packs.

## Supported languages

- Bengali (`bn`) — canonical source/default
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

1. Write and verify the Bengali source page first.
2. Keep Japanese examples, answer IDs, storage keys, and learning logic stable.
3. If the page belongs to an existing core prefix (`n5-`, `n4-`, `n3-`, `japan-`), no classification change is normally needed.
4. Otherwise add its page key to `exactPages` in `core-localization-manifest.json`.
5. Create an authored locale pack for each target language you are ready to serve.
6. Include visible copy plus user-facing attribute, search, dynamic JavaScript, and encoded-link strings that can appear after interaction.
7. Confirm internal links stay in the selected language when both source and destination have authored packs.
8. Only add a page to `completeLocalizedPages` once its generated localized route is intended to be complete.
9. Run `npm run verify` and `npm run test:browser`.
10. Confirm layout, progress behavior, Japanese text, answer correctness, accessibility labels, search behavior, and metadata.

## Review rules for learning content

Before editorial sign-off, reviewers should check:

- grammar terminology and JLPT level accuracy
- correct answer/explanation alignment
- vocabulary meaning in context
- Japanese examples unchanged
- numbers, counters, dates, particles and conjugation notes
- interview/job/legal-life guidance for misleading wording
- RTL layout for Urdu
- mobile overflow and long labels
- dynamic text that appears only after clicks, progress changes, filtering, quizzes, or saved-state restoration

## Missing-language behavior

Missing authored localization is expected during migration. Do not restore full-page runtime translation or Bengali fallback on selected-language core pages to hide missing coverage. A missing static language route must remain explicit so coverage can be completed deliberately.

The language picker may still serve a language on non-core pages through the generic runtime system; the stricter no-fallback rule applies to core learning/life routes classified by the manifest.

## Quality gates

`npm run quality` verifies:

- existing translation/runtime checks
- core static policy and source markers
- absence of obsolete fallback markers
- existence of declared completed locale routes
- zero Bengali UI leakage on completed localized routes (brand exception only)

Browser regression tests verify that core pages make no full-page `/api/i18n/translate` requests, selected-language alternates use separate HTML routes, same-language nested navigation is preserved, and non-core pages retain runtime behavior.
