import { test, expect } from '@playwright/test';

const hub = '/n4-shin-bunka-grammar.html';
const lesson = '/n4-shin-bunka-lesson-19.html';
const key = 'aponar-nihon:bunka-ii-revised:v2';

test('directory search, completion and furigana persist across lessons', async ({ page }) => {
  await page.goto(hub);
  await expect(page.locator('[data-sb-card]:visible')).toHaveCount(16);
  await page.locator('#sb-search').fill('৩২');
  await expect(page.locator('[data-sb-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-sb-card="32"]')).toBeVisible();
  await page.locator('#sb-search').fill('のに');
  await expect(page.locator('[data-sb-card="31"]')).toBeVisible();
  await page.locator('#sb-search').fill('no-such-grammar');
  await expect(page.locator('#sb-empty')).toBeVisible();
  await page.locator('#sb-clear').click();
  await expect(page.locator('[data-sb-card]:visible')).toHaveCount(16);
  await page.goto(lesson);
  await page.locator('#sb-ruby').click();
  await expect(page.locator('body')).toHaveClass(/sb-hide-ruby/);
  await page.locator('[data-sb-complete]').first().click();
  await expect(page.locator('[data-sb-complete]').last()).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('#sb-ruby')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-sb-complete]').first()).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.sb-answer summary:visible').first().click();
  await expect(page.locator('.sb-answer:visible').first()).toHaveAttribute('open', '');
  await page.goto(hub);
  await expect(page.locator('#sb-progress')).toHaveAttribute('value', '1');
  await expect(page.locator('#sb-resume')).toHaveAttribute('href', /lesson-20/);
  await page.locator('#sb-filter').selectOption('done');
  await expect(page.locator('[data-sb-card]:visible')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('lessons work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4173${lesson}`);
  await expect(page.locator('.sb-pattern')).toHaveCount(6);
  await page.locator('.sb-answer summary').first().click();
  await expect(page.locator('.sb-answer').first()).toHaveAttribute('open', '');
  await expect(page.locator('.sb-answer[open] ruby').first()).toBeVisible();
  await context.close();
});

test('blocked storage does not prevent reading or in-page completion', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  await page.goto(lesson);
  await page.locator('[data-sb-complete]').first().click();
  await expect(page.locator('[data-sb-complete]').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.sb-storage').first()).toContainText('অগ্রগতি রাখা যাচ্ছে না');
});

test('invalid saved data is safely normalized', async ({ page }) => {
  await page.goto(hub);
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({edition:'bunka-ii-revised-2013',done:[19,19,0,35,37,'20'],last:99})), key);
  await page.reload();
  await expect(page.locator('#sb-progress')).toHaveAttribute('value', '1');
  await expect(page.locator('#sb-resume')).toHaveAttribute('href', /lesson-20/);
});

test('old edition completion is isolated from the revised book', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aponar-nihon:shin-bunka-ii:v1', JSON.stringify({done:[19,34,36],last:36,ruby:false})));
  await page.goto(hub);
  await expect(page.locator('[data-sb-card]')).toHaveCount(16);
  await expect(page.locator('#sb-progress')).toHaveAttribute('value', '0');
  await expect(page.locator('#sb-resume')).toHaveAttribute('href', /lesson-19/);
  await expect(page.locator('body')).toHaveClass(/sb-hide-ruby/);
});

test('lesson 34 follows お祝い and restores the selected grammar', async ({ page }) => {
  await page.goto('/n4-shin-bunka-lesson-34.html');
  await expect(page.locator('h1')).toContainText('祝');
  await expect(page.locator('.sb-pattern:visible')).toHaveCount(1);
  await expect(page.locator('.sb-pattern:visible h2')).toContainText('使役受け身');
  await page.locator('.sb-forms summary').click();
  await expect(page.locator('.sb-forms table')).toContainText('させられる');
  await page.locator('[data-sb-topic="2"]').click();
  await expect(page).toHaveURL(/#grammar-2$/);
  await expect(page.locator('.sb-pattern:visible h2')).toContainText('なら');
  await page.reload();
  await expect(page.locator('#grammar-2')).toBeVisible();
  await page.locator('#sb-topic-next').click();
  await expect(page.locator('#grammar-3')).toBeVisible();
  await page.locator('#sb-text-size').click();
  await expect(page.locator('body')).toHaveClass(/sb-large-text/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
