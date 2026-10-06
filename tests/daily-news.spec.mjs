import { test, expect } from '@playwright/test';

test.use({serviceWorkers: 'block'});
test.beforeEach(async ({page}) => {
  // Static development has no Worker; keep the bundled-archive tests deterministic.
  await page.route('**/api/public/news', route => route.fulfill({status:503, json:{ok:false}}));
});

const sampleId = '2026-09-04-japan-budget-requests';

test('home mounts daily Japanese news below daily challenge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const dailyChallenge = page.locator('.app-home-duo');
  const news = page.locator('#dailyNewsHome');
  await expect(dailyChallenge).toBeVisible();
  await expect(news).toBeVisible();
  await expect(news.locator('.daily-news-card')).toHaveCount(3);
  await expect(news.locator('.daily-news-card h3').first()).toContainText(/[\u3040-\u30ff\u3400-\u9fff]/);
  await expect(news.locator('.daily-news-freshness')).toBeVisible();

  const orderIsCorrect = await page.evaluate(() => {
    const challenge = document.querySelector('.app-home-duo');
    const section = document.querySelector('#dailyNewsHome');
    return Boolean(challenge && section && challenge.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(orderIsCorrect).toBe(true);
});

test('daily news archive keeps previous days and supports date filters', async ({ page }) => {
  await page.goto('/daily-news.html', { waitUntil: 'networkidle' });

  const archive = page.locator('[data-news-archive-list]');
  const items = archive.locator('.news-list-item');
  await expect.poll(async () => items.count()).toBeGreaterThanOrEqual(4);
  await expect(archive).toContainText('日本のサービス業');

  const all = page.locator('[data-news-filter="all"]');
  const previous = page.locator('[data-news-filter="previous"]');
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(previous).toBeVisible();
  await previous.click();
  await expect(previous).toHaveAttribute('aria-pressed', 'true');
  expect(await items.count()).toBeGreaterThan(0);
  await expect(archive.locator('.news-date-group')).toHaveCount(1);
});

test('reader supports furigana, Bengali explanation and adjacent news navigation', async ({ page }) => {
  await page.goto(`/daily-news-reader.html?id=${sampleId}`, { waitUntil: 'networkidle' });

  await expect(page.locator('.news-reader-title')).toContainText('日本');
  await expect(page.locator('.news-japanese rt').first()).toBeVisible();

  const toggle = page.locator('[data-furigana-toggle]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.news-japanese rt').first()).toBeHidden();

  const explanation = page.locator('.news-explanation');
  await explanation.locator('summary').click();
  await expect(explanation).toHaveAttribute('open', '');
  await expect(explanation.locator('.news-explanation-body')).toContainText('জাপানের বিভিন্ন মন্ত্রণালয়');

  expect(await page.locator('.news-vocab-item').count()).toBeGreaterThanOrEqual(5);
  await expect(page.locator('.news-source a')).toHaveAttribute('href', /reuters\.com/);
  expect(await page.locator('.news-adjacent-link').count()).toBeGreaterThan(0);
});

test('reader shows a clear not-found state for an invalid news id', async ({ page }) => {
  await page.goto('/daily-news-reader.html?id=missing-news-id', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-news-reader]')).toContainText('নিউজটি পাওয়া যায়নি');
  await expect(page).toHaveTitle(/নিউজ পাওয়া যায়নি/);
});

test('daily news data asset is available and has no future Japan dates', async ({ request }) => {
  const response = await request.get('/assets/data/daily-news.json');
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(Array.isArray(data.articles)).toBe(true);
  expect(data.articles.length).toBeGreaterThanOrEqual(4);

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  const tokyoToday = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  for (const article of data.articles) expect(String(article.date || '') <= tokyoToday).toBe(true);
});

function liveArticle(id = 'fixture-live-news', headline = '学校で日本語を学びます') {
  const date = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  return {id,date,level:'ニュース',category_bn:'জাপানের খবর',headline,headline_tokens:[{t:'学校',r:'がっこう'},{t:'で'},{t:'日本語',r:'にほんご'},{t:'を'},{t:'学び',r:'まなび'},{t:'ます'}],teaser_bn:'স্কুলে জাপানি শেখার নতুন খবর।',japanese:[[{t:'学校',r:'がっこう'},{t:'で'},{t:'日本語',r:'にほんご'},{t:'を'},{t:'学び',r:'まなび'},{t:'ます。'}]],explanation_bn:['বিদ্যালয়ের নতুন ক্লাসে জাপানি ভাষা শেখা হবে।'],vocabulary:[{word:'学校',reading:'がっこう',meaning_bn:'স্কুল'},{word:'日本語',reading:'にほんご',meaning_bn:'জাপানি ভাষা'},{word:'学び',reading:'まなび',meaning_bn:'শেখা'}],source:{name:'NHK',url:'https://news.web.nhk/newsweb/na/fixture-news',published_at:new Date().toISOString()},learning_status:'ready'};
}
function liveFeed(articles) {
  return {ok:true,articles,checked_at:new Date().toISOString(),update_status:'live',refresh_interval_hours:3,editorial_note_bn:'উৎসের তথ্য থেকে সংক্ষিপ্ত শিক্ষামূলক পাঠ।'};
}
test('live news leads the archive without removing the older Bengali lessons', async ({page}) => {
  const article = liveArticle();
  await page.route('**/api/public/news',route=>route.fulfill({json:liveFeed([article])}));
  await page.goto('/daily-news.html');
  await expect(page.locator('.news-list-item h2').first()).toHaveText(article.headline);
  await expect(page.locator('[data-news-sync]')).toContainText('প্রতি ৩ ঘণ্টায়');
  await expect(page.locator('.news-list-item')).toHaveCount(26);
  await page.locator('[data-news-filter="previous"]').click();
  await expect(page.locator('[data-news-archive-list]')).toContainText('日銀');
});
test('news refresh replaces a changed story and date filters use the fresh response', async ({page}) => {
  let calls=0;const first=liveArticle(), extra=liveArticle('fixture-second','新しいニュースです');
  await page.route('**/api/public/news',route=>route.fulfill({json:liveFeed(++calls===1?[first]:[first,extra])}));
  await page.goto('/daily-news.html');
  await expect(page.locator('.news-list-item')).toHaveCount(26);
  await page.locator('[data-news-refresh]').click();
  await expect(page.locator('.news-list-item')).toHaveCount(27);
  await page.locator('[data-news-filter="latest"]').click();
  await expect(page.locator('.news-list-item')).toHaveCount(2);
  await expect(page.locator('[data-news-archive-list]')).toContainText('新しいニュース');
  expect(calls).toBe(2);
});
test('new news reader shows Bengali reasons, furigana and the genuine source link', async ({page}) => {
  const article=liveArticle();
  await page.route('**/api/public/news',route=>route.fulfill({json:liveFeed([article])}));
  await page.goto('/daily-news-reader.html?id='+article.id);
  await expect(page.locator('.news-reader-title')).toContainText('学校');
  await expect(page.locator('.news-japanese rt').first()).toBeVisible();
  await page.locator('.news-explanation summary').click();
  await expect(page.locator('.news-explanation-body')).toContainText('জাপানি ভাষা');
  await expect(page.locator('.news-vocab-item')).toHaveCount(3);
  await expect(page.locator('.news-source a')).toHaveAttribute('href',article.source.url);
  await page.locator('[data-furigana-toggle]').click();
  await expect(page.locator('.news-japanese rt').first()).toBeHidden();
});
test('a news source outage keeps saved headlines and clearly labels the fallback', async ({page}) => {
  const feed=liveFeed([liveArticle()]);
  await page.addInitScript(feed=>localStorage.setItem('aponarDailyNewsLiveV1',JSON.stringify(feed)),feed);
  await page.goto('/daily-news.html');
  await expect(page.locator('.news-list-item h2').first()).toContainText('学校');
  await expect(page.locator('[data-news-sync]')).toContainText('সংরক্ষিত খবর');
  await expect(page.locator('.news-list-item')).toHaveCount(26);
});
