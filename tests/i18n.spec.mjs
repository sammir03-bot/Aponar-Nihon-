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

test('language picker exposes all eleven native languages with flags', async ({ page }) => {
  await page.goto('/');
  await page.locator(languageButton).click();

  await expect(page.locator('[data-language-option]')).toHaveCount(11);
  await expect(page.locator('[data-language-option="si"]')).toContainText('සිංහල');
  await expect(page.locator('[data-language-option="si"] .aponar-language-flag')).toHaveText('🇱🇰');
  await expect(page.locator('[data-language-option="fil"]')).toContainText('Filipino');
  await expect(page.locator('[data-language-option="fil"] .aponar-language-flag')).toHaveText('🇵🇭');
});

test('legacy profile language labels normalize to locale codes', async ({ page }) => {
  await page.goto('/');

  await expect.poll(() => page.evaluate(() => window.AponarI18n?.normalizeLanguage('বাংলা'))).toBe('bn');
  await expect.poll(() => page.evaluate(() => window.AponarI18n?.normalizeLanguage('English'))).toBe('en');
  await expect.poll(() => page.evaluate(() => window.AponarI18n?.normalizeLanguage('Tagalog'))).toBe('fil');

  await page.evaluate(() => {
    const select = document.createElement('select');
    select.id = 'language';
    select.dataset.aponarLanguageProfile = 'true';
    document.body.appendChild(select);
    window.AponarI18n.mountProfileLanguageSelect('English');
  });
  await expect(page.locator('#language option')).toHaveCount(11);
  await expect(page.locator('#language')).toHaveValue('en');
  await page.locator('#language').selectOption('vi');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('aponarNihonLanguage'))).toBe('vi');
});

test('Sinhala and Filipino shared UI preferences are supported', async ({ page }) => {
  await page.goto('/');
  await page.locator(languageButton).click();
  await page.locator('[data-language-option="si"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'si');
  await expect(page.locator('#all-sections-title')).toHaveText('සියලු වැදගත් කොටස්');

  await page.locator(languageButton).click();
  await page.locator('[data-language-option="fil"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fil');
  await expect(page.locator('#all-sections-title')).toHaveText('Lahat ng mahalagang seksyon');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('aponarNihonLanguage'))).toBe('fil');
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

test('reviewed packs have crawlable locale URLs and hreflang metadata', async ({ page }) => {
  await page.goto('/en/n5/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.lh-hero h1')).toContainText('Build a strong Japanese foundation');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://app.aponar-nihon.workers.dev/en/n5/'
  );
  await expect(page.locator('link[rel="alternate"][hreflang="bn"]')).toHaveAttribute(
    'href',
    'https://app.aponar-nihon.workers.dev/n5'
  );
  await expect(page.locator('link[rel="alternate"][hreflang="fil"]')).toHaveAttribute(
    'href',
    'https://app.aponar-nihon.workers.dev/fil/n5/'
  );
});

test('selecting a reviewed language opens its canonical locale route', async ({ page }) => {
  await page.goto('/n5.html');
  await page.locator(languageButton).click();
  await page.locator('[data-language-option="fil"]').click();

  await page.waitForURL('**/fil/n5/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fil');
  await expect(page.locator('.lh-hero h1')).toContainText('Bumuo ng matibay na pundasyon sa Japanese');
  await expect(page.locator('.lh-brand-copy small')).toHaveText('BEGINNER · 日本語能力試験');
});
