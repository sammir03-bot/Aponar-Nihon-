import { test, expect } from '@playwright/test';

const pages = [
  ['/', '/'],
  ['/n3.html', null],
  ['/quiz.html', null],
  ['/mock-test.html', '/mock-test.html'],
  ['/n5-mock-tests.html', null],
  ['/interview.html', null],
  ['/shop-food-phrases.html', null],
];

for (const [path, activeHref] of pages) {
  test(`compact dark navigation with usable content: ${path}`, async ({ page }) => {
    await page.goto(path);
    const nav = page.locator('[data-an-bottom-nav]');
    await expect(nav).toHaveCount(1);
    await expect(nav).toHaveCSS('background-color', 'rgb(11, 23, 43)');
    const box = await nav.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(64);
    expect(box.height).toBeLessThan(90);
    const links = nav.locator(':scope > a');
    for (const link of await links.all()) {
      const item = await link.boundingBox();
      expect(item.width).toBeGreaterThanOrEqual(44);
      expect(item.height).toBeGreaterThanOrEqual(44);
    }
    // Learning hubs must not inherit Home's active state or light dock.
    if (path === '/n3.html' || path === '/quiz.html') {
      await expect(nav.locator('[aria-current]')).toHaveCount(0);
      await expect(page.locator('body')).not.toHaveAttribute('data-page', 'home');
    }
    if (activeHref) {
      await expect(nav.locator('[aria-current]')).toHaveCount(1);
      expect(new URL(await nav.locator('[aria-current]').getAttribute('href'), page.url()).pathname).toBe(activeHref);
    }
    expect(await page.evaluate(() => {
      const dock = document.querySelector('[data-an-bottom-nav]').getBoundingClientRect();
      return parseFloat(getComputedStyle(document.body).paddingBottom) >= innerHeight - dock.top + 12;
    })).toBe(true);
    await page.locator('body').press('End');
    await expect.poll(() => page.evaluate(() => {
      const dock = document.querySelector('[data-an-bottom-nav]').getBoundingClientRect();
      const footer = document.querySelector('footer');
      return !footer || footer.getBoundingClientRect().bottom <= dock.top;
    })).toBe(true);
  });
}

test('eight legacy shortcuts remain reachable on a 320px phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/shop-food-phrases.html');
  const nav = page.locator('[data-an-bottom-nav]');
  await expect(nav.locator(':scope > a')).toHaveCount(8);
  await nav.locator('a[href="mock-test.html"]').focus();
  expect(await nav.evaluate(node => node.scrollLeft > 0)).toBe(true);
  const link = await nav.locator('a[href="mock-test.html"]').boundingBox();
  const box = await nav.boundingBox();
  expect(link.x + link.width).toBeLessThanOrEqual(box.x + box.width);
});

test('dark compact navigation is present before scripts run', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 720 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/n3.html');
  const nav = page.locator('[data-an-bottom-nav]');
  await expect(nav).toHaveCSS('background-color', 'rgb(11, 23, 43)');
  expect((await nav.boundingBox()).height).toBeLessThan(90);
  await context.close();
});
