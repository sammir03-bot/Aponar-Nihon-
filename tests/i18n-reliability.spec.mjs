import { expect, test } from '@playwright/test';

const locales = ['bn', 'en', 'ja', 'vi', 'ne', 'hi', 'ur', 'my', 'zh', 'si', 'fil'];
const fixturePath = '/i18n-reliability-fixture.html';
const defaultMarkup = `<h1 id="ui">CV Builder</h1><p id="copy">মূল লেখা</p>
  <textarea id="notes" placeholder="এখানে লিখুন">নিজের ব্যক্তিগত তথ্য</textarea>
  <div id="paperArea">ব্যক্তিগত জীবনবৃত্তান্ত</div><p lang="ja">日本語を勉強します。</p>`;

async function fixture(page, language = 'en', markup = defaultMarkup) {
  await page.addInitScript(language => {
    window.__APONAR_I18N_RUNTIME__ = true;
    localStorage.setItem('aponarNihonLanguage', language);
  }, language);
  await page.route(`**${fixturePath}`, route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>日本語</title>
      <link rel="stylesheet" href="/assets/css/i18n.css">
      <script src="/assets/js/i18n.js"></script><script defer src="/assets/js/i18n-ui.js"></script>
      <script defer src="/assets/js/i18n-content.js"></script></head><body>${markup}</body></html>`
  }));
  await page.route('**/assets/i18n/pages/**', route => route.fulfill({ status: 404, body: '' }));
}

function response(body) {
  const copy = {
    en: { 'মূল লেখা': 'Original content', 'এখানে লিখুন': 'Type here', 'নতুন লেখা': 'New content' },
    ja: { 'মূল লেখা': '元の内容', 'এখানে লিখুন': 'ここに入力', 'নতুন লেখা': '新しい内容' }
  };
  return { ok: true, translations: body.items.map(item => ({
    id: item.id, text: copy[body.targetLanguage]?.[item.text] || `${body.targetLanguage} translated ${item.id}`
  })) };
}

test('all eleven language choices survive navigation and reload', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  for (const language of locales) {
    await page.locator('#aponarLanguageButton').click();
    await page.locator(`[data-language-option="${language}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('#aponarLanguageButton [data-language-code]')).toHaveText(language.toUpperCase());
    await page.goto('/privacy-policy.html');
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('html')).toHaveAttribute('dir', language === 'ur' ? 'rtl' : 'ltr');
    await page.goto('/');
    await expect(page.locator('#aponarLanguageButton [data-language-code]')).toHaveText(language.toUpperCase());
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fil');
});

test('late responses cannot overwrite a newer language or its cache', async ({ page }) => {
  await fixture(page);
  let releaseEnglish;
  const englishGate = new Promise(resolve => { releaseEnglish = resolve; });
  let englishStarted = false;
  await page.route('**/api/i18n/translate', async route => {
    const body = route.request().postDataJSON();
    if (body.targetLanguage === 'en') {
      englishStarted = true;
      await englishGate;
    }
    // The runtime aborts obsolete requests; fulfilling an aborted mock may fail.
    await route.fulfill({ json: response(body) }).catch(() => {});
  });
  await page.goto(fixturePath);
  await expect.poll(() => englishStarted).toBe(true);
  await page.evaluate(() => window.AponarI18n.setLanguage('ja'));
  await expect(page.locator('#copy')).toHaveText('元の内容');
  releaseEnglish();
  await expect(page.locator('html')).toHaveAttribute('data-i18n-ready', 'true');
  await expect(page.locator('#notes')).toHaveAttribute('placeholder', 'ここに入力');
  expect(await page.evaluate(() => window.AponarI18nContent.translateText('মূল লেখা'))).toBe('元の内容');
  await page.evaluate(() => window.AponarI18n.setLanguage('en'));
  await expect(page.locator('#copy')).toHaveText('Original content');
});

test('partial failure stays incomplete, keeps controls visible, and retries missing batches', async ({ page }) => {
  const markup = Array.from({ length: 14 }, (_, i) => `<p id="part${i}">অনুচ্ছেদ ${i}</p>`).join('')
    + '<button id="usable" type="button">CV Builder</button>';
  await fixture(page, 'en', markup);
  let fail = true;
  const requests = [];
  await page.route('**/api/i18n/translate', async route => {
    const body = route.request().postDataJSON();
    requests.push(body.items.map(item => item.text));
    if (fail && body.items.some(item => item.text === 'অনুচ্ছেদ 0')) {
      await route.fulfill({ status: 502, json: { ok: false, error: 'translation_failed' } });
    } else await route.fulfill({ json: response(body) });
  });
  await page.goto(fixturePath);
  await expect(page.locator('#aponarI18nStatus.error.compact')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-i18n-ready', 'false');
  await expect(page.locator('#part13')).toContainText('en translated');
  await expect(page.locator('#usable')).toBeVisible();
  await expect(page.locator('#usable')).toHaveCSS('opacity', '1');
  const beforeRetry = requests.length;
  fail = false;
  await page.locator('[data-i18n-retry]').click();
  await expect(page.locator('html')).toHaveAttribute('data-i18n-ready', 'true');
  await expect(page.locator('#aponarI18nStatus')).toBeHidden();
  expect(requests.slice(beforeRetry).flat()).not.toContain('অনুচ্ছেদ 13');
  await expect(page.locator('#part0')).toContainText('en translated');
});

test('slow and dynamic translations finish without hiding inputs or sending private values', async ({ page }) => {
  await fixture(page);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const requestedText = [];
  await page.route('**/api/i18n/translate', async route => {
    const body = route.request().postDataJSON();
    requestedText.push(...body.items.map(item => item.text));
    await gate;
    await route.fulfill({ json: response(body) });
  });
  await page.goto(fixturePath);
  await expect(page.locator('#aponarI18nStatus.compact')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-i18n-ready', 'false');
  await page.locator('#notes').fill('আমার নিজের লেখা');
  await page.evaluate(() => {
    const p = document.createElement('p'); p.id = 'dynamic'; p.textContent = 'নতুন লেখা';
    document.body.appendChild(p);
  });
  release();
  await expect(page.locator('#copy')).toHaveText('Original content');
  await expect(page.locator('#dynamic')).toHaveText('New content');
  await expect(page.locator('#notes')).toHaveAttribute('placeholder', 'Type here');
  await expect(page.locator('#notes')).toHaveValue('আমার নিজের লেখা');
  await expect(page.locator('#paperArea')).toHaveText('ব্যক্তিগত জীবনবৃত্তান্ত');
  expect(requestedText.join(' ')).not.toMatch(/ব্যক্তিগত|আমার নিজের|日本語を/);
  await expect(page.locator('html')).toHaveAttribute('data-i18n-ready', 'true');
});

test('shared Japanese and Chinese UI labels translate while study examples stay intact', async ({ page }) => {
  await fixture(page, 'en', '<h1>氏名</h1><button>制作简历</button><p lang="ja">氏名</p>');
  let requests = 0;
  await page.route('**/api/i18n/translate', async route => { requests++; await route.abort(); });
  await page.goto(fixturePath);
  await expect(page.locator('h1')).toHaveText('Full name');
  await expect(page.locator('body > button')).toHaveText('CV Builder');
  await expect(page.locator('p[lang="ja"]')).toHaveText('氏名');
  expect(requests).toBe(0);
});
