# Quiz practice bank

`npm run build:site` derives N5, N4 and N3 JSON from the committed, reviewed
`assets/data/study/questions-*.json` banks. Each level contains four subjects
and ten disjoint parts per subject: 120 sets / 930 questions in this version.
N5 reading has five questions per part; the other tracks have eight.

These are practice views of questions already used by the site's published mock
tests. Source answer keys, Japanese ruby, Bengali answers/reasons and provenance
are retained. Source republication authorization is recorded in
`tools/content/jtest4you-expansion-audit.json`. The prior original quiz remains
in `archive/jlpt-quiz-pre-repair-20261007.html`.

Generated JSON is deliberately excluded from git. Deploy builds it before
copying the site. Bank changes must bump the version in the builder, quiz
loader, hub completion check and audit so saved answers cannot be applied to
different questions.
