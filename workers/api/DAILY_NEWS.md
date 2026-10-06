# Daily news

The live client merges `/api/public/news` with the existing curated JSON archive.
The Worker reads NHK's public RSS at `https://www.nhk.or.jp/rss/news/cat0.xml`;
it does not scrape full stories or the authenticated Easy News endpoints.

`DailyNewsFeed` is one SQLite-backed Durable Object. A Cron Trigger checks the
source every three hours (`23 */3 * * *`, UTC). Page views also revalidate a feed
older than three hours. Concurrent refreshes share one promise; successful
cards persist across instances and visitors. Upstream failures back off for
15 minutes and retain the last good feed. The archive is bounded to 300 cards,
with at most six source stories per publication day and three additions per
refresh. Dates come from the source and use Asia/Tokyo; future stories are rejected.

The existing server-side Gemini credential produces short original Japanese
learning sentences, Bengali paraphrases, ruby and vocabulary from RSS facts.
It cannot choose source links, article IDs or publication dates. Malformed,
untranslated or incomplete output is rejected. If enrichment fails, source
headlines remain available with an explicit Bengali pending notice, rather
than invented details. Full stories always link to NHK. No credential reaches
the browser, and old curated lessons remain available independently.

Language generation uses a JSON schema, a low thinking budget and a separate
15-minute retry window. Pending lessons retry without refetching the RSS or
waiting for the three-hour source interval. The persistent `learning_checked`
timestamp bounds retries across requests; `learning_error` exposes only a short
non-secret status code for diagnostics.

Gemini REST uses the uppercase `MINIMAL` thinking enum. If it fails or leaves
invalid cards, one bounded fallback request uses the existing Workers AI
`@cf/openai/gpt-oss-120b` binding with JSON output. The same content validation
applies to both providers. Valid primary cards survive a fallback outage.
`learning_version` allows one immediate retry after a generator fix, then
restores the shared 15-minute backoff. Each provider has a 25-second timeout.

Public API responses bypass the service worker's asset cache. The browser
keeps its last feed for offline reading, labels saved data, refreshes on
returning to the page, and offers an archive refresh button.

Verify with `node tools/check_daily_news.mjs`, `npm run verify`, the news browser
tests and `wrangler deploy --dry-run`. For a source/model incident, filter
Worker logs for `daily_news_refresh_failed` or `news_learning_unavailable`.
