# Shin Bunka II companion

`shin_bunka.py` contains original Bengali explanations, Japanese examples, and
self-study prompts for lessons 19–36. The source book determines the lesson
sequence; its printed page ranges are recorded in each lesson. The scan repeats
printed page 87. No PDF, book illustrations, or copied exercise sets are shipped.

Each grammar row has eight `|~|`-separated fields: title, formation, explanation,
usage note, Japanese example, Bengali translation, practice prompt, and model
answer. Annotate example/answer kanji with `[漢字|かな]` for semantic ruby markup.

Edit the data or `tools/build_shin_bunka.py`, then run:

```
python3 tools/build_shin_bunka.py
python3 tools/build_shin_bunka.py --check
npm run verify
npx playwright test tests/shin-bunka.spec.mjs
```

Commit the generated root HTML alongside data changes. The site build also
regenerates it before indexing and generating the mobile content bundle.
Completion and furigana preferences use a separate, browser-local key:
`aponar-nihon:shin-bunka-ii:v1`. Model answers remain available without JavaScript.
