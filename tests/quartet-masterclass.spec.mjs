import { expect, test } from '@playwright/test';
import fs from 'node:fs';

const course = JSON.parse(fs.readFileSync(new URL('../assets/data/n3-quartet.json', import.meta.url), 'utf8'));

test('all 55 QUARTET I lessons render full teaching notes and ten examples', async ({ page }) => {
  await page.goto('/n3-quartet-grammar.html');
  await expect(page.locator('#study-workspace')).toBeVisible();
  for (const lesson of course.lessons) {
    await page.goto('/n3-quartet-grammar.html#' + lesson.id + '/lesson');
    await expect(page.locator('.lesson-overline')).toContainText(String(course.lessons.indexOf(lesson) + 1).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]) + ' / ৫৫');
    await expect(page.locator('#panel .example')).toHaveCount(10);
    await expect(page.locator('.worked-example')).toHaveCount(2);
    await expect(page.locator('.example-why')).toHaveCount(8);
    await expect(page.locator('.comparison-pair article')).toHaveCount(2);
    await expect(page.locator('.teaching-steps li')).toHaveCount(3);
    await expect(page.locator('.self-check details')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.locator('.self-check summary').click();
  await expect(page.locator('.self-check details .jp')).toBeVisible();
  await expect(page.locator('[data-next]')).toBeDisabled();
});

test('reader settings persist independently of learning progress and remain usable on mobile', async ({ page, isMobile }) => {
  await page.goto('/n3-quartet-grammar.html');
  await expect(page.locator('#study-workspace')).toBeVisible();
  if (isMobile) await expect(page.locator('.course-picker')).not.toHaveAttribute('open');
  await page.getByRole('button', { name: 'অক্ষর বড় করুন', exact: true }).click();
  await page.getByRole('button', { name: 'অক্ষর বড় করুন', exact: true }).click();
  await expect(page.getByRole('button', { name: 'অক্ষর বড় করুন', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'ফুরিগানা', exact: true }).click();
  await expect(page.locator('#panel ruby rt').first()).toBeHidden();
  await page.getByRole('button', { name: 'ডার্ক মোড', exact: true }).click();
  await page.getByRole('button', { name: 'শেখা হয়েছে চিহ্ন দিন', exact: true }).click();
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-reader-theme', 'dark');
  await expect(page.locator('body')).toHaveAttribute('data-reader-size', '2');
  await expect(page.getByRole('button', { name: 'ফুরিগানা', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#progress-text')).toHaveText('১ / ৫৫টি শেখা');
  if (isMobile) await page.locator('.course-picker summary').click();
  await page.getByRole('searchbox', { name: 'গ্রামার খুঁজুন', exact: true }).fill('せっかく');
  await expect(page.locator('.lesson-link:visible')).toHaveCount(1);
  await page.locator('.lesson-link:visible').click();
  await expect(page.locator('.grammar-title')).toContainText('せっかく');
  if (isMobile) await expect(page.locator('.course-picker')).not.toHaveAttribute('open');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Form', exact: true }).click();
  await expect(page.locator('#formation')).toBeFocused();
  await page.getByRole('tab', { name: 'পাঠ', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'অনুশীলন', exact: true })).toBeFocused();
  await expect(page.locator('.quiz-item')).toHaveCount(9);
});

test('an unavailable expanded course offers retry and never silently drops to short notes', async ({ page }) => {
  await page.route('**/assets/data/n3-quartet-deep.json*', route => route.fulfill({ status: 503, body: '' }));
  await page.goto('/n3-quartet-grammar.html');
  await expect(page.locator('#load-message')).toContainText('পাঠগুলো খোলা যায়নি');
  await expect(page.locator('#study-workspace')).toBeHidden();
  await page.unroute('**/assets/data/n3-quartet-deep.json*');
  await page.getByRole('button', { name: 'আবার চেষ্টা করুন', exact: true }).click();
  await expect(page.locator('#panel .example')).toHaveCount(10);
});
