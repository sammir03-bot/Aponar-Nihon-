import { test, expect } from '@playwright/test';

const criticalPages = [
  '/',
  '/n5.html',
  '/n4.html',
  '/n4-reading.html',
  '/n3.html',
  '/quiz.html',
  '/interview.html',
  '/japan-life.html',
  '/essential-phrases.html',
  '/study-guide.html',
  '/tutor-section.html',
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
    '/n5.html',
    '/n4.html',
    '/n4-reading.html',
    '/n3.html',
    '/quiz.html',
    '/interview.html',
    '/japan-life.html',
    '/essential-phrases.html',
    '/study-guide.html',
    '/tutor-section.html',
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
    '/assets/css/learning-hub-pro.css',
    '/assets/css/app-menu.css',
    '/assets/js/learning-hub-pro.js',
    '/assets/js/app-menu.js',
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
  const dock = page.locator('.app-dock');
  await expect(dock).toBeVisible();

  const metrics = await page.evaluate(() => {
    const nav = document.querySelector('.app-dock');
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

test('AI Tutor exposes level, mode, and depth controls', async ({ page }) => {
  await page.goto('/tutor-section.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#activeLevelLabel')).toBeVisible();
  await expect(page.locator('[data-mode="conversation"]').first()).toBeAttached();
  await expect(page.locator('[data-mode="interview"]').first()).toBeAttached();
  await page.locator('#settingsButton').click();
  await expect(page.locator('#settingsDialog')).toBeVisible();
  await expect(page.locator('input[name="settingsDepth"][value="deep"]')).toBeAttached();
});

test('premium learning hubs expose dedicated resources and saved progress', async ({ page }) => {
  for (const path of ['/n5.html', '/n4.html', '/n3.html', '/quiz.html', '/interview.html']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-learning-hub]')).toBeAttached();
    await expect(page.locator('.lh-hero')).toBeVisible();
    await expect(page.locator('[data-progress-value]')).toBeVisible();
    expect(await page.locator('[data-track]').count(), `${path} needs dedicated subpage actions`).toBeGreaterThanOrEqual(3);
  }
});

test('shared app menu opens, highlights the section, and closes accessibly', async ({ page }) => {
  const menuPages = ['/n5.html', '/n4.html', '/n4-reading.html', '/n3.html', '/quiz.html', '/interview.html', '/tutor-section.html'];

  for (const path of menuPages) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-app-menu-open]')).toBeAttached();
    await expect(page.locator('#appMenu')).toBeAttached();
  }

  await page.goto('/n5.html', { waitUntil: 'domcontentloaded' });
  const opener = page.locator('[data-app-menu-open]');
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
  await opener.click();
  await expect(page.locator('#appMenu')).toBeVisible();
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.app-menu-link[aria-current="page"] .app-menu-link-copy strong')).toHaveText('JLPT N5');
  expect(await page.locator('.app-menu-link').count()).toBeGreaterThanOrEqual(12);

  await page.keyboard.press('Escape');
  await expect(page.locator('#appMenu')).toBeHidden();
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
});

test('mobile AI Tutor reserves independent rows for controls, chat, and composer', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-specific layout check');
  await page.goto('/tutor-section.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.tutor-mobile-levels')).toBeVisible();

  const metrics = await page.evaluate(() => {
    const stage = document.querySelector('.tutor-stage');
    const chat = document.querySelector('.tutor-chat');
    const composer = document.querySelector('.tutor-composer-area');
    if (!stage || !chat || !composer) return null;
    const stageRect = stage.getBoundingClientRect();
    const chatRect = chat.getBoundingClientRect();
    const composerRect = composer.getBoundingClientRect();
    return {
      rows: getComputedStyle(stage).gridTemplateRows.split(' ').length,
      chatHeight: chatRect.height,
      chatBottom: chatRect.bottom,
      composerTop: composerRect.top,
      composerBottom: composerRect.bottom,
      stageBottom: stageRect.bottom,
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics.rows).toBeGreaterThanOrEqual(4);
  expect(metrics.chatHeight).toBeGreaterThan(120);
  expect(metrics.chatBottom).toBeLessThanOrEqual(metrics.composerTop + 1);
  expect(metrics.composerBottom).toBeLessThanOrEqual(metrics.stageBottom + 1);
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
