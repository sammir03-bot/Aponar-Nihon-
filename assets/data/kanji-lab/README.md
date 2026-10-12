# Level-separated Kanji Lab

The learner-facing companion contains 79 N5 targets and 166 new N4 targets.
No higher-level glyph is used in those targets, contextual words, example
sentences, mnemonics or spelling distractors. N4 words may use already-learned
N5 characters. Course levels are editorial study classifications, not a claim
that the JLPT publishes an exhaustive official post-2010 kanji syllabus.

The order is based on factual character/unit associations in 3A's publicly
available Minna no Nihongo Second Edition practice sheets. The complete
reference corpus has 220 characters from book I, 316 from book II, and 132
additional existing characters. Only the selected exact level is projected
into the learner's course. Empty higher-level units are omitted. Book II's
printed units 24 and 25 are preparatory units; its other unit labels are 26–50.
No textbook worksheets, original illustrations or textbook sentences are
republished. The missing text extraction for book I character 17 (七) was
verified against rendered page 9.

Sources checked 2026-10-12:

- Book I: https://www.3anet.co.jp/np/en/books/2358/
- Book II: https://www.3anet.co.jp/np/en/books/2458/
- Sequence: https://www.3anet.co.jp/np/resrcs/235800/ and https://www.3anet.co.jp/np/resrcs/245800/
- Classification: https://github.com/davidluzgouveia/kanji-data, `jlpt_new`
- Readings: KANJIDIC2, Electronic Dictionary Research and Development Group,
  https://www.edrdg.org/wiki/KANJIDIC_Project.html and https://www.edrdg.org/edrdg/licence.html
- Stroke paths and decomposition: KanjiVG, Ulrich Apel,
  https://kanjivg.tagaini.net/ — CC BY-SA 3.0. The adapted stroke dataset remains
  CC BY-SA 3.0; the full license is in `KanjiVG-LICENSE.txt`.

Course glosses supplement the existing Bengali corpus with newly authored
glosses in `tools/content/kanji-lab/meanings.tsv` and `words.tsv`. KANJIDIC2
reading data and their adapted data retain the EDRDG attribution/share-alike
terms. Memory stories are original teaching devices rather than etymologies.

Production uses committed JSON and needs no dictionary or public API calls.
To rebuild, install beautifulsoup4 and run `tools/content/build-kanji-lab.py`
with `--kanjidic <downloaded XML>` and `--kanjivg <source checkout>`.
Run `node tools/check_kanji_lab.mjs` and `npm run verify` before publication.

Browser-local progress uses `aponarKanjiLabV2`; prior numeric N5/N4 learned IDs
are mapped to character identities without awarding tested mastery. Separate
N5/N4 studied arrays keep hub progress counts isolated. Correct answers are
locked once per question. Mastery requires successful meaning and reading
retrieval on multiple dates. Mistakes are due again after ten minutes; later
reviews use 1/3/7/14/30-day intervals. Writing feedback measures proximity,
length and stroke direction rather than claiming handwriting recognition.
