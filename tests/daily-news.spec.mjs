import { test, expect } from '@playwright/test';

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
  await expect(archive).toContainText('日本のサービス業');
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

test('daily news data asset is available', async ({ request }) => {
  const response = await request.get('/assets/data/daily-news.json');
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(Array.isArray(data.articles)).toBe(true);
  expect(data.articles.length).toBeGreaterThanOrEqual(4);
});
