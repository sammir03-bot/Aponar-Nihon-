import { expect, test } from '@playwright/test';

test('QUARTET opens from N3 Grammar with six chapters and furigana', async ({ page }) => {
  await page.goto('/n3-grammar.html');
  await page.getByRole('link', { name: 'QUARTET I পড়ুন →' }).click();
  await expect(page.locator('#study-workspace')).toBeVisible();
  await expect(page.locator('#chapter-select option')).toHaveCount(6);
  await expect(page.locator('#panel .example')).toHaveCount(2);
  expect(await page.locator('#panel .example ruby rt').count()).toBeGreaterThan(0);
  await expect(page.locator('#aponarLanguageButton')).toHaveCount(0);
  await page.locator('#chapter-select').selectOption('3');
  await page.getByRole('tab', { name: 'রিভিশন', exact: true }).click();
  await expect(page.locator('.revision-row')).toHaveCount(10);
  await page.getByRole('tab', { name: 'অনুশীলন', exact: true }).click();
  await expect(page.locator('.quiz-item')).toHaveCount(10);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('QUARTET learning progress and quiz attempts survive reload and reach the hub', async ({ page }) => {
  await page.goto('/n3-quartet-grammar.html');
  await page.getByRole('button', { name: 'শেখা হয়েছে চিহ্ন দিন', exact: true }).click();
  await expect(page.locator('#progress-text')).toHaveText('১ / ৫৫টি শেখা');
  await page.getByRole('tab', { name: 'অনুশীলন', exact: true }).click();
  await page.locator('.quiz-item').first().getByRole('button').first().click();
  await expect(page.locator('.feedback')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.feedback')).toHaveCount(1);
  await expect(page.locator('#quiz-summary')).toContainText('উত্তর দিয়েছেন ১ / ৯');
  await page.getByRole('button', { name: 'এই অধ্যায় আবার চেষ্টা করুন', exact: true }).click();
  await expect(page.locator('.feedback')).toHaveCount(0);
  await page.goto('/n3.html');
  await expect(page.locator('[data-track="quartet-grammar"] [data-card-status]')).toContainText('1/55');
});

test('QUARTET reports missing data and retries without a blank page', async ({ page }) => {
  await page.route('**/assets/data/n3-quartet.json*', route => route.fulfill({ status: 503, body: '' }));
  await page.goto('/n3-quartet-grammar.html');
  await expect(page.locator('#load-message')).toContainText('পাঠগুলো খোলা যায়নি');
  await expect(page.getByRole('link', { name: 'Grammar', exact: true })).toBeVisible();
  await page.unroute('**/assets/data/n3-quartet.json*');
  await page.getByRole('button', { name: 'আবার চেষ্টা করুন', exact: true }).click();
  await expect(page.locator('#study-workspace')).toBeVisible();
});
