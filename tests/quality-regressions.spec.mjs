import {test,expect} from '@playwright/test';

test('Bangla home labels survive tracker initialization and scanner starts row two',async({page})=>{
 await page.goto('/');
 const grid=page.locator('.app-tools-grid');
 await expect(grid.locator('a[href="/quiz.html"] b')).toHaveText('কুইজ');
 await expect(grid.locator('a[href="/n5.html"] small')).toHaveText('বেসিক কোর্স');
 const scanner=grid.locator('a[href="/halal-scanner.html"]');
 await expect(scanner).toHaveClass(/app-tool-halal/);
 await expect(scanner).toHaveCSS('grid-row-start','2');
 await expect(scanner).toHaveCSS('grid-column-start','1');
 await expect(scanner.locator('small')).toContainText('উপাদান');
 await expect(page.locator('.app-quick-item[href="/n5.html"]')).toHaveText('JLPT N5');
});

test('N4 inflected vocabulary gives a grammatical sentence and persists progress',async({page})=>{
 await page.goto('/jlpt-quiz.html?level=n4&category=vocabulary&part=1');
 const question=page.locator('.card[data-i="5"]');
 await question.getByRole('button',{name:'拾い',exact:true}).click();
 await expect(question.locator('.explain')).toContainText('拾いました');
 await expect(page.locator('#scoreText')).toContainText('1 / 8');
 await page.reload();
 await expect(page.locator('#scoreText')).toContainText('1 / 8');
 await expect(page.locator('.card[data-i="5"] .correct')).toHaveText('拾い');
});

test('fractional quiz part cannot crash the reading page',async({page})=>{
 await page.goto('/jlpt-quiz.html?level=n3&category=reading&part=1.5');
 await expect(page.locator('#passageHost .passage')).toBeVisible();
 await expect(page.locator('#quizHost .card')).toHaveCount(3);
});

test('CV wizard labels stay visible at the current screen width',async({page})=>{
 await page.goto('/cv-builder.html');
 for (const button of await page.locator('.wizard .wiz').all()) {
  await expect(button.locator('span')).toBeVisible();
  await expect(button).toHaveAccessibleName(/.+/);
 }
 await page.locator('.wizard [data-step="1"]').click();
 await expect(page.locator('[data-form="1"]')).toBeVisible();
});

test('news uses the article image with a clear archival credit',async({page})=>{
 await page.goto('/daily-news-reader.html?id=2026-09-08-kura-sushi-chiikawa-campaign');
 const image=page.locator('.news-reader-figure img');
 await expect(image).toBeVisible();
 await expect.poll(()=>image.evaluate(node=>node.complete && node.naturalWidth>0)).toBe(true);
 await expect(page.locator('.news-reader-figure figcaption')).toContainText('২০১৬');
 await expect(page.locator('.news-reader-figure figcaption')).toContainText('CC0');
});
