import { expect, test } from '@playwright/test';

test('QUARTET study guide opens from N3 with translated practice texts and mobile navigation', async ({ page }) => {
  await page.goto('/n3.html');
  await page.locator('[data-track="quartet-study"]').click();
  await expect(page.locator('#study-chapter-select option')).toHaveCount(8);
  await expect(page.locator('.sentence-note')).toHaveCount(24);
  await expect(page.locator('.sentence')).toHaveCount(51);
  await expect(page.locator('.dialogue-meaning')).toHaveCount(27);
  await expect(page.locator('#aponarLanguageButton')).toHaveCount(0);
  for (let chapter = 0; chapter < 8; chapter++) {
    await page.getByLabel('অধ্যায় বেছে নিন').selectOption(String(chapter));
    await expect(page.locator('.study-chapter:visible')).toHaveCount(1);
    await expect(page.locator('#guide-' + chapter)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.getByLabel('অধ্যায় বেছে নিন').selectOption('3');
  await page.locator('#guide-3').getByRole('link', { name: /^Reading Lab/ }).click();
  await expect(page).toHaveURL(/#guide-3-part-6$/);
  await expect(page.locator('#guide-3 .sentence-note')).toHaveCount(4);
  expect(await page.locator('#guide-3 .sentence .jp ruby rt').count()).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator('#guide-3')).toBeVisible();
  await page.goto('/n3-quartet-study-guide.html');
  await expect(page.getByLabel('অধ্যায় বেছে নিন')).toHaveValue('3');
  await page.goto('/n3-quartet-study-guide.html#guide-2');
  await expect(page.getByLabel('অধ্যায় বেছে নিন')).toHaveValue('2');
  await page.getByLabel('অধ্যায় বেছে নিন').selectOption('4');
  await expect(page.locator('#guide-4')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#guide-2')).toBeVisible();
});

test('QUARTET study guide remains readable when preference storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('/n3-quartet-study-guide.html#guide-6-part-6');
  await expect(page.locator('#guide-6')).toBeVisible();
  await page.getByLabel('অধ্যায় বেছে নিন').selectOption('1');
  await expect(page.locator('#guide-1')).toBeVisible();
  await expect(page.locator('#guide-1 .sentence')).toHaveCount(9);
});
