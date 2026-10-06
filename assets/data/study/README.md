# Learning workspaces — 2026-10-06

The interview guides contain 125 part-time, 93 school/online and 87 embassy
practice questions with newly written sample answers. Every question and answer
has a Bengali meaning, Bengali-script pronunciation aid and Japanese ruby.
Personal facts use placeholders. The embassy guide is language practice, not an
official question list. Official sources are linked inside each guide.

The revision bank exports the exact 2,540 reviewed questions used in the 30
published mock tests. Listening exposes the 800 listening questions from that
same bank: 208 JapaneseTest4You source recordings and 592 original recorded
VOICEVOX questions. These are additional ways to study the existing questions,
not newly claimed independent mock questions. Existing source data, audio and
answer keys remain intact. Republication authorization is recorded in
`tools/content/jtest4you-expansion-audit.json`.

Source listening rows include Japanese transcripts and Bengali answer/reason
explanations. Original listening rows also include complete Bengali transcripts.
Missing diagrams and the N3 exercise 12 menu are restored in this derived bank.

To rebuild from authored files:

1. `node tools/content/export-study-bank.mjs`
2. Install `Janome==0.5.0` in your local Python environment, then run
   `python tools/content/build-study-data.py` (`STUDY_JANOME_PATH` can point to an
   isolated pip target).
3. `python tools/content/build-study-pages.py`
4. `npm run verify`

Deploy serves committed static data and does not require Janome. Kanji reading
prompts keep the tested readings hidden until answers are checked. Progress and
drafts are local to the browser; prior Kanji flashcard progress is reused.
