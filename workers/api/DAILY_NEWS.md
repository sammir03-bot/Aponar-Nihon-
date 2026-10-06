# Daily news

The client merges `/api/public/news` with the unchanged curated archive.
One SQLite-backed `DailyNewsFeed` Durable Object checks NHK's public RSS every
three hours (`23 */3 * * *`, UTC). Page views revalidate stale feeds. Source
publication times use Asia/Tokyo, and future stories or foreign links are
rejected. At most six stories per publication day and three per refresh enter
an archive bounded to 300 cards. Source outages retain existing cards and back
off for 15 minutes.

New lessons use the exact source headline and open dictionary readings.
`assets/data/news-source-lessons.json` contains reviewed Bengali vocabulary
(including the existing archive's vocabulary) and source-matched headline
summaries. The reader selects up to five non-overlapping compounds in source
order. A reviewed summary is shown only when the complete headline matches;
otherwise it explicitly provides a reading guide, not a full Bengali translation.
No model or machine translation supplies names, quantities, meanings or facts.
Missing dictionary readings or fewer than three reviewed vocabulary items leave
the source-backed card pending. Successful siblings remain available. Source IDs,
links and dates always come from RSS.

`tools/content/build-news-readings.py` creates a 1.9 MB compressed lexicon with
249,261 word forms from kuromoji 0.1.2's open IPADIC data. Both the upstream
package and generated table have pinned SHA-256 checksums. The build publishes
only the compact data and its full attribution notice. The server verifies the
table checksum and limits decompressed data to 8 MiB. Visitors do not download
the dictionary. Polyphonic names should still be checked against the source.

`reading_version` retires earlier generated readings. A generator change permits
one immediate retry; the persistent 15-minute language retry window then bounds
requests independently of the three-hour source interval. Only short non-secret
status codes appear in diagnostics. Older curated articles remain unchanged.

Public news bypasses the service-worker asset cache. The browser preserves its
last feed for offline reading, labels cached data, revalidates on return and
provides a refresh button.

Verify with `node tools/check_daily_news.mjs`, `npm run verify`, the news browser
tests and `wrangler deploy --dry-run`. The audit includes trusted dates, dictionary
integrity, the actual problematic readings, exact source text, insufficient reviewed meanings, Bengali quantities,
independent cards, deduplication and immutable subresponse headers.
