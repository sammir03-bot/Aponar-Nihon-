# Licensed JapaneseTest4You mock bank

The site owner explicitly confirmed republication permission/licensing in the
2026-10-05 implementation request. The importer is an opt-in maintenance tool;
normal builds and browser sessions do not scrape the source. Verify that the
owner's permission continues to cover the intended hosting and media use before
future imports. No license is granted to unrelated downstream users by this repo.

`tools/import_jtest4you.py` discovers N5, N4 and N3 exercise pages, records each
source URL/question number, and accepts only explicit answer keys and complete
three/four-option questions. Source HTML is reduced to a safe display allowlist.
Malformed or ambiguous pages are quarantined in the import cache. Imported
question/options/passage content is preserved; ordering and audio-numbered choices
are never shuffled. Recorded audio and diagrams are served from the licensed
source URLs, so availability requires the source host and an internet connection.

The generated JSON files under `assets/data/jtest4you/` are committed snapshots.
The runtime assembles 10 deterministic sets per level with no identical items or
repeated recordings within a set. Some questions are shared across sets; these
are practice sets, not 30 independent released official exam papers. Raw item
accuracy is converted to practice points; it does not reproduce JLPT's scaled
scoring. A JLPT pass is not guaranteed by a practice score.

Full mode uses JLPT section times, locked submitted sections, recorded listening
in order with no replay of completed items, and permits unanswered questions.
Practice mode permits recording replay. An interrupted current recording resumes
from its saved position. A network/playback error permits retry without replacing
the source audio with synthesized speech. Question-bank version 5 invalidates
version-4 resume state and the hubs don't count those historical scores as results
for this new bank.

Validation: `node tools/check_jtest4you.mjs`, `npm run verify`, and
`tests/jtest4you.spec.mjs`. The bank validator checks every assembled set, unique
items/audio, source references, answer bounds and the actual ★/passage structure.
Browser tests cover recorded-media failures, numbering, unanswered submission,
resume, version migration and mobile overflow.
