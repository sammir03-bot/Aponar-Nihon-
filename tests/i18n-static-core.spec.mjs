import { expect, test } from '@playwright/test';

const CORE_ECOSYSTEM_ROUTES = [
  '/Hiragana-Katagana.html',
  '/n5.html',
  '/n4.html',
  '/n3.html',
  '/grammar-vs.html',
  '/jlpt-quiz.html',
  '/jlpt-revision.html',
  '/mock-test.html',
  '/student-tools.html',
  '/kanji-flashcards.html',
  '/cv-builder.html',
  '/interview.html',
  '/jobs-in-japan.html',
  '/japan-life.html'
];

async function enableRuntimeLanguage(page, language) {
  await page.addInitScript(lang => {
    window.__APONAR_I18N_RUNTIME__ = true;
    localStorage.setItem('aponarNihonLanguage', lang);
  }, language);
}

test('representative learning, job, and life routes are protected from runtime body translation', async ({ page }) => {
  for (const route of CORE_ECOSYSTEM_ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html'), route).toHaveAttribute('data-i18n-mode', 'static-core');
    await expect(page.locator('html'), route).toHaveAttribute('data-i18n-source', 'bn');
    await expect(page.locator('html'), route).toHaveAttribute('data-i18n-preserve', '');
    await expect(page.locator('html'), route).not.toHaveAttribute('data-i18n-fallback', /.+/);
  }
});

test('core learning pages never call the full-page translation API', async ({ page }) => {
  await enableRuntimeLanguage(page, 'bn');
  let runtimeRequests = 0;
  await page.route('**/api/i18n/translate', async route => {
    runtimeRequests += 1;
    await route.fulfill({
      json: {
        ok: true,
        translations: (route.request().postDataJSON()?.items || []).map(item => ({
          id: item.id,
          text: `MACHINE:${item.text}`
        }))
      }
    });
  });

  await page.goto('/n4.html');
  await expect(page.locator('html')).toHaveAttribute('data-i18n-mode', 'static-core');
  await page.waitForTimeout(300);
  expect(runtimeRequests).toBe(0);
  await expect(page.locator('body')).not.toContainText('MACHINE:');
});

test('Nepali N5 is a direct static HTML page, not a runtime translation', async ({ page }) => {
  await enableRuntimeLanguage(page, 'ne');
  let runtimeRequests = 0;
  await page.route('**/api/i18n/translate', async route => {
    runtimeRequests += 1;
    await route.fulfill({ status: 500, json: { ok: false, error: 'should_not_run' } });
  });

  await page.goto('/ne/n5/');
  await expect(page).toHaveURL(/\/ne\/n5\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ne');
  await expect(page.locator('html')).toHaveAttribute('data-language-preset', 'ne');
  await expect(page.locator('html')).toHaveAttribute('data-i18n-mode', 'static-core');
  await expect(page.locator('body')).toContainText('तपाईंको N5 प्रगति');
  await page.waitForTimeout(300);
  expect(runtimeRequests).toBe(0);
});

test('core language alternates point at separate HTML routes', async ({ page }) => {
  await enableRuntimeLanguage(page, 'bn');
  await page.goto('/n5.html');
  const nepali = page.locator('link[rel~="alternate"][hreflang="ne"]');
  await expect(nepali).toHaveAttribute('href', /\/ne\/n5\/?$/);
});

test('non-core pages retain runtime translation behavior', async ({ page }) => {
  await enableRuntimeLanguage(page, 'en');
  let translated = false;
  await page.route('**/api/i18n/translate', async route => {
    translated = true;
    const body = route.request().postDataJSON();
    await route.fulfill({
      json: {
        ok: true,
        translations: body.items.map(item => ({ id: item.id, text: `EN:${item.text}` }))
      }
    });
  });

  await page.goto('/privacy-policy.html?i18nRuntime=1');
  await expect(page.locator('html')).not.toHaveAttribute('data-i18n-mode', 'static-core');
  await expect.poll(() => translated).toBe(true);
});
