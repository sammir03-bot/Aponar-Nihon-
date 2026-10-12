import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const course = JSON.parse(readFileSync(new URL('../assets/data/kanji-lab/course.json', import.meta.url)));

for (const level of ['n5', 'n4']) test(`${level} course keeps exact level boundaries and a complete study session works`, async ({page}) => {
  await page.goto(`/kanji-lab.html?level=${level}`);
  await expect(page.locator('#continueButton')).toBeEnabled();
  await expect(page.locator('#levelName')).toHaveText(level.toUpperCase());
  await page.locator('[data-view="library"]').click();
  const actual = await page.locator('[data-open]').evaluateAll(nodes => nodes.map(n => n.dataset.open));
  const expected = course.kanji.filter(r => r.level === level).map(r => r.k);
  expect(actual.sort()).toEqual(expected.sort());
  const first = course.lessons.find(l => l.level === level).kanji[0];
  const row = course.kanji.find(r => r.k === first);
  await page.locator(`[data-open="${first}"]`).click();
  await expect(page.locator('#studyDialog')).toBeVisible();
  await page.locator('#nextStep').click();
  await expect(page.locator('.kl-word')).toHaveCount(row.words.length);
  await page.locator('#nextStep').click();
  await expect(page.locator('#restartWriting')).toBeEnabled();
  const path = page.locator('.kl-stroke').first();
  const points = await path.evaluate(p => {
    const box = p.ownerSVGElement.getBoundingClientRect(); const length = p.getTotalLength();
    return Array.from({length: 25}, (_, i) => {const point = p.getPointAtLength(length * i / 24); return {x: box.left + point.x * box.width / 109, y: box.top + point.y * box.height / 109};});
  });
  await page.mouse.move(points[0].x, points[0].y); await page.mouse.down();
  for (const p of points.slice(1)) await page.mouse.move(p.x, p.y);
  await page.mouse.up();
  await expect(page.locator('#sessionFeedback')).toContainText('মিলে গেছে');
  await page.locator('#hideGuide').click();
  await expect(page.locator('#hideGuide')).toHaveText('গাইড দেখান');
  await page.locator('#nextStep').click();
  await expect(page.locator('#nextStep')).toBeDisabled();
  const answer = page.locator('[data-choice]').filter({hasText: row.bn});
  await answer.click();
  await expect(page.locator('#answerExplanation')).toContainText('সঠিক উত্তর');
  const savedOnce = await page.evaluate(() => localStorage.getItem('aponarKanjiLabV2'));
  await answer.evaluate(button => button.dispatchEvent(new MouseEvent('click', {bubbles: true})));
  expect(await page.evaluate(() => localStorage.getItem('aponarKanjiLabV2'))).toBe(savedOnce);
  await page.locator('#nextStep').click();
  await page.locator('[data-choice]').filter({hasText: row.words[0].reading}).click();
  await page.locator('#nextStep').click();
  await expect(page.locator('.kl-result')).toContainText('২ / ২');
  await page.locator('#nextStep').click();
  await expect(page.locator('#masterCount')).toHaveText('০');
  await page.reload();
  await expect(page.locator('#seenCount')).toHaveText('১');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('a failed download offers retry and malformed storage does not block a lesson', async ({page}) => {
  let fail = true;
  await page.route('**/assets/data/kanji-lab/n5.json*', route => fail ? route.fulfill({status: 503, body: ''}) : route.fulfill({contentType: 'application/json', body: JSON.stringify(course)}));
  await page.addInitScript(() => localStorage.setItem('aponarKanjiLabV2', '{broken'));
  await page.goto('/kanji-lab.html?level=n5');
  await expect(page.locator('#retryCourse')).toBeVisible();
  fail = false; await page.locator('#retryCourse').click();
  await expect(page.locator('#continueButton')).toBeEnabled();
  await page.locator('#continueButton').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#studyDialog')).toBeHidden();
  await expect(page.locator('#continueButton')).toBeFocused();
});

test('old N5 and N4 links open the matching new course', async ({page}) => {
  for (const level of ['n5', 'n4']) {
    await page.goto(`/${level}-kanji.html`);
    await expect(page).toHaveURL(new RegExp(`kanji-lab.*level=${level}`));
    await expect(page.locator('#levelName')).toHaveText(level.toUpperCase());
  }
});
