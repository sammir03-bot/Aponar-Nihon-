import { test, expect } from '@playwright/test';

const criticalPages = ['/', '/profile.html', '/ssw.html'];

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
