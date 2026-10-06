import {test, expect} from '@playwright/test';
import fs from 'node:fs';
const bank = JSON.parse(fs.readFileSync('assets/data/quiz/n3.json', 'utf8'));
const vocab = bank.categories.vocabulary[0];
test.use({serviceWorkers:'block'});

test('N3 has all four subjects and different questions in adjacent parts', async ({page}) => {
  await page.goto('/jlpt-quiz.html?level=n3&category=vocabulary&part=1');
  await expect(page.locator('#categoryTabs button')).toHaveCount(4);
  await expect(page.locator('#quizHost .card')).toHaveCount(8);
  await expect(page.locator('#title')).toContainText('Vocabulary');
  const ids = await page.locator('#quizHost .card').evaluateAll(nodes=>nodes.map(n=>n.dataset.id));
  await page.locator('[data-p="2"]').click();
  await expect(page.locator('#badge')).toContainText('Part 2');
  const next = await page.locator('#quizHost .card').evaluateAll(nodes=>nodes.map(n=>n.dataset.id));
  expect(next.every(id=>!ids.includes(id))).toBe(true);
  await page.locator('[data-c="grammar"]').click();
  await expect(page.locator('#title')).toContainText('Grammar');
  await expect(page.locator('#quizHost .card')).toHaveCount(8);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('answer grading survives furigana, reload and a wrong-answer retry', async ({page}) => {
  await page.goto('/jlpt-quiz.html?level=n3&category=vocabulary');
  const first = page.locator(`.card[data-id="${vocab[0].id}"]`);
  const choices = await first.locator('button.opt').evaluateAll(nodes=>nodes.map(n=>n.dataset.choice));
  await page.locator('#furiganaBtn').click();
  expect(await first.locator('button.opt').evaluateAll(nodes=>nodes.map(n=>n.dataset.choice))).toEqual(choices);
  await first.locator(`[data-choice="${vocab[0].answer}"]`).click();
  await expect(first.locator('.explain')).toContainText('নদীর জল');
  const second = page.locator(`.card[data-id="${vocab[1].id}"]`);
  await second.locator(`[data-choice="${(vocab[1].answer+1)%4}"]`).click();
  await expect(page.locator('#scoreText')).toHaveText('স্কোর 1 / 8');
  await page.reload();
  await expect(page.locator('#statusText')).toContainText('2 / 8');
  await expect(page.locator('#scoreText')).toHaveText('স্কোর 1 / 8');
  await page.locator('#retryWrongBtn').click();
  await expect(page.locator('#quizHost .card')).toHaveCount(1);
  await page.locator(`#quizHost [data-choice="${vocab[1].answer}"]`).click();
  await expect(page.locator('#scoreText')).toHaveText('স্কোর 2 / 8');
});
test('kanji readings and spellings remain hidden until answering', async ({page}) => {
  await page.goto('/jlpt-quiz.html?level=n3&category=kanji');
  const q = bank.categories.kanji[0][0], card = page.locator(`.card[data-id="${q.id}"]`);
  await expect(card.locator('.q')).toContainText('物事');
  await expect(card.locator('.q rt, .opt rt')).toHaveCount(0);
  await card.locator(`[data-choice="${q.answer}"]`).click();
  await expect(card.locator('.q rt').first()).toBeVisible();
  await expect(card.locator('.explain')).toContainText('বাংলা উত্তর');
  await page.locator('#furiganaBtn').click();
  await expect(card.locator('.q rt').first()).toBeHidden();
  await expect(page.locator('#scoreText')).toHaveText('স্কোর 1 / 8');
});
test('incomplete attempts are not completed sets and completed sets appear in the hub', async ({page}) => {
  await page.goto('/jlpt-quiz.html?level=n3&category=vocabulary');
  await page.locator(`.card[data-id="${vocab[0].id}"] [data-choice="${vocab[0].answer}"]`).click();
  await page.goto('/quiz.html');
  await expect(page.locator('[data-progress-label]')).toContainText('0 সম্পূর্ণ quiz');
  await page.goto('/jlpt-quiz.html?level=n3&category=vocabulary');
  for (const q of vocab.slice(1)) await page.locator(`.card[data-id="${q.id}"] [data-choice="${q.answer}"]`).click();
  await expect(page.locator('#resultText')).toContainText('8/8');
  await page.goto('/quiz.html');
  await expect(page.locator('[data-progress-label]')).toContainText('1 সম্পূর্ণ quiz');
});
test('corrupt saved choices and blocked storage cannot crash practice', async ({page}) => {
  await page.addInitScript(id=>{
    localStorage.setItem('aponarQuizV2:n3:vocabulary:1',JSON.stringify({version:2,bankVersion:'20261007.quiz2',answers:{[id]:99,'unknown-id':0}}));
    Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};
  }, vocab[0].id);
  await page.goto('/jlpt-quiz.html?level=n3&category=vocabulary');
  await expect(page.locator('#statusText')).toHaveText('0 / 8 উত্তর');
  await page.locator(`.card[data-id="${vocab[0].id}"] [data-choice="${vocab[0].answer}"]`).click();
  await expect(page.locator('#scoreText')).toHaveText('স্কোর 1 / 8');
  await expect(page.locator('#studyToast')).toContainText('অগ্রগতি রাখা যাচ্ছে না');
});
test('a failed bank load offers a working retry', async ({page}) => {
  let calls=0;
  await page.route('**/assets/data/quiz/n3.json?*',route=>++calls===1?route.fulfill({status:503,body:''}):route.continue());
  await page.goto('/jlpt-quiz.html?level=n3');
  await expect(page.locator('#quizLoadRetry')).toBeVisible();
  await page.locator('#quizLoadRetry').click();
  await expect(page.locator('#quizHost .card')).toHaveCount(8);
});
