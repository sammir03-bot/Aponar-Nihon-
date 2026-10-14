# Bunka II revised-edition companion

`shin_bunka.py` follows **文化初級日本語 II テキスト 改訂版**, lessons
19–34, ending with お祝い. This is a different syllabus from 新文化 II
(19–36). The existing `n4-shin-bunka-*` URLs remain stable for saved links.
The course has 75 core topics (including lesson 25's preparatory introduction)
and five separately marked 本文 topics. Explanations, examples and prompts are
original Bengali/Japanese companion material, not copied textbook exercises.

Source URLs are recorded in `SOURCES`: publisher contents for chapter names and
printed page ranges, publisher edition comparison, and the authoring school's
complete syllabus (Kariya 2016, appendix 2, printed pp.24–26) for 文型 order.
The legacy data remain in `shin_bunka_legacy.py` for reuse of our own writing;
public generation only imports the revised `LESSONS` list. The previous HTML
is preserved in noindex archives for the repository's content-preservation guard.

Each grammar row has eight `|~|`-separated fields: title, formation, explanation,
usage note, Japanese example, Bengali translation, practice prompt, and model
answer. Annotate example/answer kanji with `[漢字|かな]` for semantic ruby markup.

Edit the data or `tools/build_shin_bunka.py`, then run:

```
python3 tools/build_shin_bunka.py
python3 tools/build_shin_bunka.py --check
python3 tools/check_bunka_revised.py
npm run verify
npx playwright test tests/shin-bunka.spec.mjs
```

Commit the generated root HTML alongside data changes. The site build also
regenerates it before indexing and generating the mobile content bundle.
Progress uses `aponar-nihon:bunka-ii-revised:v2` and an explicit edition ID.
Only the old furigana preference is carried over. Old completion and lesson
numbers must never be migrated, because their meanings have changed. Selected
topics, larger text, completion and furigana are browser-local. All topics and
native answer disclosures remain readable without JavaScript. JavaScript adds
one-topic-at-a-time reading, hash links and topic resumption.
