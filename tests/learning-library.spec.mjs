import { expect, test } from '@playwright/test';

for (const [level, total, grammarCount, kanjiTotal] of [['n4', 7, 2, 210], ['n5', 6, 1, 120]]) {
  test(`${level} library combines category filters, Bengali search and empty recovery`, async ({ page }) => {
    await page.goto(`/${level}.html#course`);
    const visible = page.locator('[data-library-grid] .lh-resource-card:visible');
    const search = page.getByRole('searchbox', { name: 'রিসোর্স খুঁজুন' });
    await expect(visible).toHaveCount(total);
    await page.getByRole('button', { name: 'শব্দ ও কানজি', exact: true }).click();
    await expect(visible).toHaveCount(2);
    await search.fill('কানজি');
    await expect(visible).toHaveCount(1);
    await expect(visible).toHaveAttribute('href', `/${level}-kanji.html`);
    await search.fill('অজানারিসোর্স');
    await expect(visible).toHaveCount(0);
    await expect(page.locator('[data-library-empty]')).toBeVisible();
    await search.fill('');
    await page.getByRole('button', { name: 'গ্রামার', exact: true }).click();
    await expect(visible).toHaveCount(grammarCount);
    await page.getByRole('button', { name: 'অনুশীলন', exact: true }).click();
    await expect(visible).toHaveCount(3);
    await expect(page.locator(`[data-track="quiz"]`)).toHaveAttribute('href', `/jlpt-quiz.html?level=${level}&category=vocabulary&part=1`);
    await page.getByRole('button', { name: 'সব রিসোর্স', exact: true }).click();
    await expect(visible).toHaveCount(total);
    if (level === 'n4') {
      await search.fill('bunka');
      await expect(visible).toHaveCount(1);
      await visible.click();
      await expect(page).toHaveURL(/n4-shin-bunka-grammar(?:\.html)?$/);
      await expect(page.locator('[data-sb-card]')).toHaveCount(16);
    }
  });

  test(`${level} library retains existing lesson progress, checklist and resume link`, async ({ page }) => {
    await page.goto(`/${level}.html`);
    await page.evaluate(({ level }) => {
      localStorage.setItem(`aponarnihon:${level}-vocabulary:1`, '1');
      localStorage.setItem(`aponarnihon-${level}-kanji-dark-learned`, JSON.stringify(['一', '二']));
      localStorage.setItem(`aponarNihonHub:${level}:v1`, JSON.stringify({
        opened: ['reading'], checks: ['vocab'], lastHref: `/${level}-vocabulary.html`
      }));
    }, { level });
    await page.reload();
    await expect(page.locator('[data-track="vocabulary"] [data-card-status]')).toHaveText('1/25 সম্পন্ন');
    await expect(page.locator('[data-track="kanji"] [data-card-status]')).toHaveText(`2/${kanjiTotal} সম্পন্ন`);
    await expect(page.locator('[data-progress-label]')).toContainText(`3/${kanjiTotal + 50}`);
    await expect(page.locator('[data-plan-check="vocab"]')).toBeChecked();
    await expect(page.locator('[data-continue]')).toHaveAttribute('href', `/${level}-vocabulary.html`);
    await page.getByRole('button', { name: 'অনুশীলন', exact: true }).click();
    await expect(page.locator('[data-track="reading"] [data-card-status]')).toHaveText('খোলা হয়েছে');
    await page.getByRole('button', { name: 'শব্দ ও কানজি', exact: true }).click();
    await expect(page.locator('[data-track="vocabulary"] [data-card-status]')).toHaveText('1/25 সম্পন্ন');
    await expect(page.locator('[data-progress-label]')).toContainText(`3/${kanjiTotal + 50}`);
  });

  test(`${level} book artwork and cards remain readable at 320px and without JavaScript`, async ({ page, browser }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(`/${level}.html#course`);
    await expect(page.locator('[data-library-grid] .lh-resource-card')).toHaveCount(total);
    for (const art of await page.locator('.library-art').all()) {
      await art.scrollIntoViewIfNeeded();
      await expect.poll(() => art.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
    const noScript = await context.newPage();
    try {
      await noScript.goto(new URL(`/${level}.html#course`, page.url()).href);
      await expect(noScript.locator('[data-library-grid] .lh-resource-card:visible')).toHaveCount(total);
      await expect(noScript.locator('[data-library-controls]')).toBeHidden();
      await expect(noScript.locator('[data-track="vocabulary"]')).toHaveAttribute('href', `/${level}-vocabulary.html`);
      expect(await noScript.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally {
      await context.close();
    }
  });
}
