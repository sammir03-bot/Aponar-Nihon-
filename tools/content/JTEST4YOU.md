# Licensed JapaneseTest4You mock bank

The site owner confirmed republication permission/licensing on 2026-10-05.
Normal builds and browsers use committed snapshots, without scraping the source.
Audio and diagrams use the licensed source URLs; diagrams send no referrer to
avoid the source's hotlink rejection. Playback and media require the source host.

The importer keeps explicit answer keys, original options and full passages,
sanitizes HTML, and quarantines malformed exercises. Some passage-cloze questions
are filed under Reading by the source; these are classified as text grammar.
Reading images alone do not establish an information-retrieval question: use the
passage's text/table instead. Vocabulary is divided by the source instruction into context, paraphrase and
usage. N5 now includes the source's same-meaning questions (6 context + 3
paraphrase). Kana instructions such as おなじいみ are classified correctly. These are source-based practice questions, not official
released papers or a verified complete reproduction of every listening item type.

## Version 7: reviewed local papers without recycling

The assembler allocates questions without wrapping offsets. Question IDs,
normalized content, passages and recording URLs cannot recur in another published
set at the same level. A partial next set is discarded. The catalog publishes only
complete available sets, currently one per level. The requested target is ten
full sets per level (30 total); the assembler, catalog and exam routes now support
that limit. Extra sets stay unavailable until enough distinct verified source
questions, passages, answer keys and listening recordings are supplied. More sets require additional
verified source questions; a large total bank alone is insufficient when a required
item type or passage pool runs out. There is no synthesized-question fallback.
A deliberate retake uses the same set and is labeled "একই সেট আবার দিন". Version 5/6
resume/results are not applied to the version-7 papers. Existing version-7
answers and results remain compatible with the new question navigation.

Official times: N5 20/40/30, N4 25/55/35, N3 30/70/40 minutes. Approximate practice
counts: N5 21/22/24, N4 28/29/28, N3 35/39/28. N5/N4 grammar and reading quotas
follow the official revision effective December 2020. Exact official question
counts can vary by session.

Official scoring sections and pass marks are used as practice reference ranges:
N5 total 80, N4 total 90, combined language/reading minimum 38/120 and listening
19/60. N3 total 95, language/reading/listening each minimum 19/60. Displayed scores
are linear raw-accuracy practice conversions, not official IRT scaled scores.

Full-mode listening is sequential and completed recordings cannot replay. All
answers alone do not enable submission until the recordings finish. The UI shows
remaining recordings, recording progress, and a button to reach/play the next
eligible item. An error enables retry; interrupted playback resumes. Practice
mode permits replay. The official timer can submit unanswered/unheard items when
it expires; gaps are scored as incorrect in this practice conversion.

Sources:
- https://www.jlpt.jp/e/guideline/testsections.html
- https://www.jlpt.jp/e/topics/202009091599642827.html
- https://www.jlpt.jp/e/guideline/results.html
- https://www.jlpt.jp/e/faq/

Maintenance: run `python tools/import_jtest4you.py`, then
`node tools/check_jtest4you.mjs --write-catalog`. Validate with
`node tools/check_jtest4you.mjs`, `npm run verify`, and `tests/jtest4you.spec.mjs`.
The validator checks every published set against every other set, not just
uniqueness within one set. Browser tests cover the reported listening state,
retakes, unavailable sets, official score ranges/sectional minimums, all levels,
numbering, playback failure, retry, replay, migration and mobile layout.

## Bengali answer review and local certificates

External provider exam cards were removed at the owner's request. All exam
navigation, timers, results, Bengali explanations and certificates stay on
Aponar Nihon. Ten slots appear per level; only complete, disjoint, reviewed
papers open. Currently one full paper is available per level. Pending slots
require additional verified source questions and recordings.

The `bn-review.json` snapshot contains individually authored Bengali meanings
and rationales, and listening transcripts from licensed source PDFs. A complete
paper must have a Bengali explanation for every question and a transcript for
every listening recording. N3 Reading Exercise 07 question 4 is quarantined
because its source answer conflicts with the passage and question.

The exam presents one question at a time, previous/next controls, numbered
navigation, answered/flagged states and an optional all-question view. The
current position is saved alongside answers. A shared passage appears with its
active question; sentence-order instructions are not shown as reading passages.
Full-mode answers remain hidden until the result. Quick practice can reveal the
answer meaning and explanation explicitly after the learner chooses an answer.

Named PDF certificates use the site's own branding, level, scores, sectional
thresholds, completion/pass status, date and stable local record ID. They label
the result as mock/practice and never impersonate an official JLPT credential.
Bengali and Japanese fonts are served locally; PDFs are generated on the device.
Certificates and result scores remain browser-local practice records.

Browser coverage includes mobile and desktop navigation/resume, practice
feedback, reading-passage visibility, source audio retry/replay, official timer
and practice score ranges, Bengali review, and named certificate PDF downloads.
