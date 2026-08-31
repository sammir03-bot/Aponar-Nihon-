import { expect, test } from '@playwright/test';

const languageButton = '#aponarLanguageButton';

test('Bangla is default and language choice persists', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('aponarNihonLanguage'));
  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.locator(languageButton)).toBeVisible();
  await expect(page.locator(`${languageButton} [data-language-code]`)).toHaveText('BN');

  await page.locator(languageButton).click();
  await page.locator('[data-language-option="en"]').click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#all-sections-title')).toHaveText('All important sections');
  await expect(page.locator(`${languageButton} [data-language-code]`)).toHaveText('EN');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('aponarNihonLanguage'))).toBe('en');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#all-sections-title')).toHaveText('All important sections');
});

test('reviewed page packs translate content while preserving preference', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aponarNihonLanguage', 'vi'));
  await page.goto('/about.html');

  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('h1')).toHaveText('Về chúng tôi');
  await expect(page.locator('h2').first()).toHaveText('Mục đích của chúng tôi');
  await expect(page.getByText('Chúng tôi cung cấp gì')).toBeVisible();
});

test('N5 hub loads reviewed English copy and preserves Japanese study text', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aponarNihonLanguage', 'en'));
  await page.goto('/n5.html');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const heroHeading = page.locator('.lh-hero h1');
  await expect(heroHeading).toContainText('Build a strong Japanese foundation');
  await expect(heroHeading.locator('em')).toHaveText('Start with N5');
  await expect(page.locator('[data-continue]')).toContainText('Start the first lesson');
  await expect(page.locator('.lh-brand-copy small')).toHaveText('BEGINNER · 日本語能力試験');
});

test('Urdu switches the document to RTL and loads Urdu content', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aponarNihonLanguage', 'ur'));
  await page.goto('/about.html');

  await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('h1')).toHaveText('ہمارے بارے میں');
  await expect(page.getByText('ہمارا مقصد')).toBeVisible();
});