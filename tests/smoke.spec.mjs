import { test, expect } from '@playwright/test';

const criticalPages = [
  '/',
  '/n5-grammar.html',
  '/n5-vocabulary.html',
  '/n4-grammar.html',
  '/n4-vocabulary.html',
  '/n3-grammar.html',
  '/n3-matome-grammar.html',
  '/n3-vocabulary.html',
  '/mock-test.html',
  '/profile.html',
  '/auth.html',
  '/ssw.html',
];

for (const path of criticalPages) {
  test(`critical page renders: ${path}`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response, `No response for ${path}`).not.toBeNull();
    expect(response.status(), `${path} should load`).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
    await expect(page.locator('body')).toBeVisible();
    const title = await page.title();
    expect(title.trim().length, `${path} needs a title`).toBeGreaterThan(0);
  });
}

test('home page has professional platform runtime', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const version = await page.locator('html').getAttribute('data-aponar-platform');
  expect(version).toBeTruthy();
});

test('home page has no duplicate ids', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const duplicates = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
    return ids.filter((id, index) => id && ids.indexOf(id) !== index);
  });
  expect([...new Set(duplicates)]).toEqual([]);
});

test('high-value home links resolve locally', async ({ page, request }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const expected = [
    '/n5-grammar.html',
    '/n4-grammar.html',
    '/n3-grammar.html',
    '/n3-matome-grammar.html',
    '/cv-builder.html',
    '/mock-test.html',
    '/profile.html',
  ];

  for (const path of expected) {
    const response = await request.get(path);
    expect(response.status(), `${path} should resolve`).toBeLessThan(400);
  }
});

test('generated browser assets are available', async ({ request }) => {
  for (const path of [
    '/assets/css/pro-core.css',
    '/assets/css/n3-grammar-deep.css',
    '/assets/css/n3-matome.css',
    '/assets/js/pro-core.js',
    '/assets/js/n3-grammar-deep.js',
    '/assets/js/n3-matome-app.js',
    '/assets/js/n3-matome-data.js',
    '/assets/js/ts/platform.js',
    '/assets/data/search-index.json',
    '/assets/data/site-audit.json',
  ]) {
    const response = await request.get(path);
    expect(response.status(), `${path} should exist`).toBe(200);
  }
});

test('mobile home dock stays compact and content-safe', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-specific layout check');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const dock = page.locator('.app-bottom-nav');
  await expect(dock).toBeVisible();

  const metrics = await page.evaluate(() => {
    const nav = document.querySelector('.app-bottom-nav');
    if (!nav) return null;
    const navRect = nav.getBoundingClientRect();
    const bodyStyle = getComputedStyle(document.body);
    return {
      height: navRect.height,
      bottomPadding: Number.parseFloat(bodyStyle.paddingBottom) || 0,
      viewportHeight: window.innerHeight,
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics.height).toBeLessThanOrEqual(82);
  expect(metrics.bottomPadding).toBeGreaterThanOrEqual(60);
  expect(metrics.height).toBeLessThan(metrics.viewportHeight * 0.16);
});

test('mobile Matome week cards stay readable without text overlap', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-specific layout check');
  await page.addInitScript(() => localStorage.setItem('n3MatomeTheme', 'dark'));
  await page.goto('/n3-matome-grammar.html', { waitUntil: 'domcontentloaded' });

  const cards = page.locator('.week-card');
  await expect(cards).toHaveCount(7);
  const issues = await cards.evaluateAll((weekCards) => weekCards.flatMap((card, index) => {
    const title = card.querySelector('b');
    const description = card.querySelector('p');
    const count = card.querySelector('small');
    if (!title || !description || !count) return [`card ${index}: missing content`];

    const titleColor = getComputedStyle(title).color.match(/\d+/g)?.slice(0, 3).map(Number) || [];
    const titleIsDark = titleColor.length === 3 && titleColor.every(channel => channel < 80);
    const descriptionBottom = description.getBoundingClientRect().bottom;
    const countTop = count.getBoundingClientRect().top;
    const result = [];
    if (titleIsDark) result.push(`card ${index}: dark title on dark surface`);
    if (descriptionBottom > countTop + 1) result.push(`card ${index}: description/count overlap`);
    return result;
  }));

  expect(issues).toEqual([]);
});
