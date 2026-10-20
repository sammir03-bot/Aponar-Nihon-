import { expect, test } from '@playwright/test';

test('library filters and search expose both QUARTET volumes without losing other courses', async ({ page }) => {
  await page.goto('/n3.html#course');
  const cards = page.locator('[data-library-grid] .lh-resource-card:visible');
  await expect(cards).toHaveCount(9);
  await page.getByRole('button', { name: 'QUARTET I / II', exact: true }).click();
  await expect(cards).toHaveCount(3);
  await expect(page.locator('[data-track="quartet-ii"]')).toBeVisible();
  await page.getByRole('searchbox', { name: 'রিসোর্স খুঁজুন' }).fill('II');
  await expect(cards).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'রিসোর্স খুঁজুন' }).fill('অজানারিসোর্স');
  await expect(page.locator('[data-library-empty]')).toBeVisible();
  await page.getByRole('searchbox', { name: 'রিসোর্স খুঁজুন' }).fill('');
  await page.getByRole('button', { name: 'সব রিসোর্স', exact: true }).click();
  await expect(cards).toHaveCount(9);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('QUARTET II has independent saved progress, search and all chapter quizzes', async ({ page }) => {
  await page.goto('/n2-quartet-grammar.html');
  await expect(page.locator('#study-workspace')).toBeVisible();
  await expect(page.locator('#chapter-select option')).toHaveCount(6);
  await page.getByRole('button', { name: 'শেখা হয়েছে চিহ্ন দিন', exact: true }).click();
  await expect(page.locator('#progress-text')).toHaveText('১ / ৩৬টি শেখা');
  await page.reload();
  await expect(page.locator('#progress-text')).toHaveText('১ / ৩৬টি শেখা');
  for (let chapter = 7; chapter <= 12; chapter++) {
    await page.locator('#chapter-select').selectOption(String(chapter));
    await page.getByRole('tab', { name: 'অনুশীলন', exact: true }).click();
    await expect(page.locator('.quiz-item')).toHaveCount(6);
    await page.locator('.quiz-item').first().getByRole('button').first().click();
    await expect(page.locator('.feedback')).toHaveCount(1);
    await page.getByRole('button', { name: 'এই অধ্যায় আবার চেষ্টা করুন', exact: true }).click();
    await expect(page.locator('.feedback')).toHaveCount(0);
  }
  await page.getByRole('searchbox', { name: 'গ্রামার খুঁজুন', exact: true }).fill('নির্বিশেষে');
  await expect(page.locator('.lesson-link:visible')).toHaveCount(1);
  await page.locator('.lesson-link:visible').click();
  await expect(page.locator('.grammar-title')).toContainText('にかかわらず');
  await expect(page.locator('.meta').first()).not.toContainText('undefined');
  await page.goto('/n3-quartet-grammar.html');
  await expect(page.locator('#progress-text')).toHaveText('০ / ৫৫টি শেখা');
  await page.goto('/n3.html');
  await expect(page.locator('[data-track="quartet-ii"] [data-card-status]')).toContainText('1/36');
});

test('QUARTET II companion restores its own chapter and contains readable original practice', async ({ page }) => {
  await page.goto('/n2-quartet-study-guide.html');
  await expect(page.locator('#study-chapter-select option')).toHaveCount(8);
  for (let chapter = 0; chapter < 8; chapter++) {
    await page.getByLabel('অধ্যায় বেছে নিন').selectOption(String(chapter));
    await expect(page.locator('.study-chapter:visible')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByLabel('অধ্যায় বেছে নিন').selectOption('4');
  await page.locator('#guide-4 .skill-nav').getByRole('link', { name: 'Reading Lab', exact: true }).click();
  await expect(page).toHaveURL(/#guide-4-part-5$/);
  await expect(page.locator('#guide-4 .sentence-note')).toHaveCount(5);
  await page.reload();
  await expect(page.locator('#guide-4')).toBeVisible();
  await page.goto('/n3-quartet-study-guide.html');
  await expect(page.getByLabel('অধ্যায় বেছে নিন')).toHaveValue('0');
});
