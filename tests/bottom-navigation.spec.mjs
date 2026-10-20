import { test, expect } from '@playwright/test';

const pages = [
  ['/', '/'],
  ['/n5.html', null],
  ['/n4.html', null],
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
    const phone = page.viewportSize().width <= 800;
    expect(box.height).toBeGreaterThanOrEqual(phone ? 56 : 64);
    expect(box.height).toBeLessThan(phone ? 74 : 90);
    if (phone) {
      expect(box.y + box.height).toBeCloseTo(page.viewportSize().height, 0);
      expect(box.x).toBe(0);
    }
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

for (const level of ['n5', 'n4', 'n3']) {
  test(`${level} reading is clear of the dock and scrolling up restores shortcuts`, async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Phone reading behavior');
    await page.goto('/' + level + '.html');
    const nav = page.locator('[data-an-bottom-nav]');
    const body = page.locator('body');
    const clearance = await body.evaluate(el => getComputedStyle(el).paddingBottom);
    await page.mouse.wheel(0, 440);
    await expect(body).toHaveClass(/an-nav-reading/);
    await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().top >= innerHeight)).toBe(true);
    await expect(body).toHaveCSS('padding-bottom', clearance);
    await page.mouse.wheel(0, -90);
    await expect(body).not.toHaveClass(/an-nav-reading/);
    await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight + 1)).toBe(true);
    // End-of-page controls remain above the returned bar.
    await body.press('End');
    await expect(body).not.toHaveClass(/an-nav-reading/);
    await expect.poll(() => page.evaluate(() => {
      const footer = document.querySelector('footer').getBoundingClientRect();
      const dock = document.querySelector('[data-an-bottom-nav]').getBoundingClientRect();
      return footer.bottom <= dock.top;
    })).toBe(true);
  });
}

test('keyboard focus can recover the dock after it slides away', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/n4.html');
  const nav = page.locator('[data-an-bottom-nav]');
  await page.mouse.wheel(0, 450);
  await expect(page.locator('body')).toHaveClass(/an-nav-reading/);
  await nav.locator('a').first().focus();
  await expect(page.locator('body')).not.toHaveClass(/an-nav-reading/);
  await expect(nav.locator('a').first()).toBeFocused();
  await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight + 1)).toBe(true);
});

test('a phone keyboard hides navigation and closing it restores navigation with focus retained', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/n3.html#course');
  const search = page.getByRole('searchbox', { name: 'রিসোর্স খুঁজুন', exact: true });
  await search.fill('QUARTET');
  // Simulate the visual viewport reduction made by a phone's keyboard.
  await page.setViewportSize({ width: 390, height: 430 });
  await expect(page.locator('body')).toHaveClass(/an-nav-keyboard-open/);
  const nav = page.locator('[data-an-bottom-nav]');
  await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().top >= innerHeight)).toBe(true);
  await page.setViewportSize({ width: 390, height: 780 });
  await expect(page.locator('body')).not.toHaveClass(/an-nav-keyboard-open/);
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('QUARTET');
  await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight + 1)).toBe(true);
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
