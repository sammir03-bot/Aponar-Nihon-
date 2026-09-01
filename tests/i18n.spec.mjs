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

  const profileLanguage = await page.evaluate(() => {
    const field = document.createElement('div');
    field.className = 'field';
    const select = document.createElement('select');
    select.id = 'language';
    select.dataset.aponarLanguageProfile = 'true';
    field.appendChild(select);
    document.body.appendChild(field);
    window.AponarI18n.mountProfileLanguageSelect('English');
    select.value = 'vi';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return {
      hidden: field.hidden,
      count: select.options.length,
      value: select.value
    };
  });
  expect(profileLanguage).toEqual({ hidden: true, count: 11, value: 'vi' });
  await expect.poll(() => page.evaluate(() => localStorage.getItem('aponarNihonLanguage'))).toBe('vi');
});

test('the language picker is available sitewide and the saved choice applies everywhere', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(languageButton)).toBeVisible();
  await page.locator(languageButton).click();
  await page.locator('[data-language-option="vi"]').click();

  await page.goto('/about.html');
  await expect(page.locator(languageButton)).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('h1')).toHaveText('Về chúng tôi');

  await page.goto('/tutor-section.html');
  await expect(page.locator(languageButton)).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
});

test('header layout stays stable when Urdu is selected', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aponarNihonLanguage', 'ur'));
  await page.goto('/');

  await expect(page.locator('.app-topbar-inner')).toHaveCSS('direction', 'ltr');
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

test('runtime localization covers title, attributes, dynamic text, and dialogs', async ({ page }) => {
  const translations = {
    'ডাইনামিক লেখা': 'Dynamic text',
    'এখানে লিখুন': 'Type here',
    'উদাহরণ ছবি': 'Example image',
    'ডাইনামিক অংশ': 'Dynamic section',
    'ব্র্যান্ড সাবটাইটেল': 'Brand subtitle',
    'পরীক্ষার শিরোনাম': 'Localized page title',
    'সতর্কতা বার্তা': 'Alert message'
  };

  await page.addInitScript(() => {
    window.__APONAR_I18N_RUNTIME__ = true;
    localStorage.setItem('aponarNihonLanguage', 'en');
  });
  await page.route('**/api/i18n/translate', async route => {
    const body = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        translations: body.items.map(item => ({
          id: item.id,
          text: translations[item.text] || `English text ${item.id}`
        }))
      })
    });
  });

  await page.goto('/privacy-policy.html');
  await expect(page.locator('html')).toHaveAttribute('data-i18n-ready', 'true');
  await page.evaluate(() => {
    document.title = 'পরীক্ষার শিরোনাম';
    const section = document.createElement('section');
    section.id = 'runtimeI18nFixture';
    section.setAttribute('aria-label', 'ডাইনামিক অংশ');
    section.innerHTML = '<h2>ডাইনামিক লেখা</h2><div data-i18n-no-content>ব্র্যান্ড সাবটাইটেল</div><input placeholder="এখানে লিখুন"><img alt="উদাহরণ ছবি">';
    document.body.appendChild(section);
  });

  const fixture = page.locator('#runtimeI18nFixture');
  await expect(fixture.locator('h2')).toHaveText('Dynamic text');
  await expect(fixture.locator('[data-i18n-no-content]')).toHaveText('Brand subtitle');
  await expect(fixture.locator('input')).toHaveAttribute('placeholder', 'Type here');
  await expect(fixture.locator('img')).toHaveAttribute('alt', 'Example image');
  await expect(fixture).toHaveAttribute('aria-label', 'Dynamic section');
  await expect.poll(() => page.title()).toBe('Localized page title');

  await page.evaluate(() => window.AponarI18nContent.alert('সতর্কতা বার্তা'));
  await expect(page.locator('.aponar-i18n-dialog-card p')).toHaveText('Alert message');
  await page.locator('.aponar-i18n-dialog [data-dialog-ok]').click();
  await expect(page.locator('.aponar-i18n-dialog')).toHaveCount(0);
});

test('selecting a reviewed language opens its canonical locale route', async ({ page }) => {
  await page.goto('/');
  await page.locator(languageButton).click();
  await page.locator('[data-language-option="fil"]').click();

  await page.goto('/n5.html');

  await page.waitForURL('**/fil/n5/');
  await expect(page.locator(languageButton)).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fil');
  await expect(page.locator('.lh-hero h1')).toContainText('Bumuo ng matibay na pundasyon sa Japanese');
  await expect(page.locator('.lh-brand-copy small')).toHaveText('BEGINNER · 日本語能力試験');
});
