import {test,expect} from '@playwright/test';

for(const level of ['n5','n4','n3']){
 test(`${level}: licensed bank opens with fixed source numbering`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`/jlpt-exam.html?level=${level}&test=1`);
  await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
  await expect(page.locator('#sourceText')).toContainText('JapaneseTest4You');
  const bank=await page.evaluate(level=>window.JLPT_FULL_GENERATOR(level,1),level);
  await page.locator('#startBtn').click();
  await expect(page.locator('.question-card')).toHaveCount(bank.vocab.length);
  const options=page.locator('.question-card').first().locator('.option-text');
  for(let i=0;i<bank.vocab[0].options.length;i++)await expect(options.nth(i)).toHaveText(bank.vocab[0].options[i].replace(/<[^>]+>/g,''));
  page.on('dialog',dialog=>dialog.accept());
  await page.locator('#submitPartBtn').click();
  await expect(page.locator('#partSheet')).toBeVisible();
  await page.locator('#nextPartBtn').click();
  await expect(page.locator('.question-kind').filter({hasText:'文の組み立て'})).toHaveCount(5);
  await expect(page.locator('.question-prompt').filter({hasText:/[★☆]/})).toHaveCount(5);
  await expect(page.locator('.passage-text').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  expect(errors).toEqual([]);
 });
}

test('bank HTTP failure offers retry and never falls back to generated questions',async({page})=>{
 let broken=true;
 await page.route('**/assets/data/jtest4you/n4.json*',route=>broken?route.fulfill({status:503,body:'Unavailable'}):route.continue());
 await page.goto('/jlpt-exam.html?level=n4&test=1');
 await expect(page.locator('#startBtn')).toHaveText('আবার লোড করুন →');
 await expect(page.locator('.question-card')).toHaveCount(0);
 broken=false;await page.locator('#startBtn').click();
 await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
});

test('recorded listening retains image/number choices, retries errors and locks replay',async({page})=>{
 await page.addInitScript(()=>{
  window.__audioCalls=[];window.__failAudio=true;window.__audioInstances=[];
  window.Audio=class{
   constructor(url){this.src=url;this.duration=60;this.currentTime=0;window.__audioInstances.push(this)}
   pause(){} play(){window.__audioCalls.push(this.src);if(window.__failAudio){this.onerror?.();return Promise.reject(new Error('network'))}this.onloadedmetadata?.();this.onplaying?.();return Promise.resolve()}
  };
 });
 page.on('dialog',dialog=>dialog.accept());
 await page.goto('/jlpt-exam.html?level=n5&test=1');
 await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');await page.locator('#startBtn').click();
 for(let i=0;i<2;i++){await page.locator('#submitPartBtn').click();await page.locator('#nextPartBtn').click()}
 const first=page.locator('[data-audio]').first();
 await expect(first).toBeEnabled();await expect(page.locator('[data-audio]').nth(1)).toBeDisabled();
 await first.click();await expect(first).toBeEnabled();
 await expect(page.locator('[data-audio-status]').first()).toContainText('আবার চেষ্টা');
 await page.evaluate(()=>window.__failAudio=false);await first.click();
 expect(await page.evaluate(()=>window.__audioCalls.every(url=>url.startsWith('https://japanesetest4you.com/')))).toBe(true);
 const choices=await page.locator('.question-card').first().locator('.option-text').allTextContents();expect(choices).toEqual(['1','2','3','4']);
 await expect(page.locator('.question-card').first().locator('img')).toHaveAttribute('src',/japanesetest4you\.com/);
 await page.evaluate(()=>window.__audioInstances.at(-1).onended());
 await expect(first).toBeDisabled();await expect(first).toHaveText('✓');
 await expect(page.locator('[data-audio]').nth(1)).toBeEnabled();
 await page.reload();await expect(page.locator('#resumeBtn')).toBeVisible();await page.locator('#resumeBtn').click();
 await expect(page.locator('[data-audio]').first()).toBeDisabled();await expect(page.locator('[data-audio]').nth(1)).toBeEnabled();
});

test('practice audio can replay and historical v4 state is not resumed',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('aponarNihonExam-v4-n4-1',JSON.stringify({version:4,level:'n4',test:1,sectionIndex:2}));
  window.Audio=class{constructor(){this.duration=60;this.currentTime=0}pause(){}play(){this.onplaying?.();queueMicrotask(()=>this.onended?.());return Promise.resolve()}};
 });
 page.on('dialog',dialog=>dialog.accept());
 await page.goto('/jlpt-exam.html?level=n4&test=1');await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
 await expect(page.locator('#resumeBtn')).toBeHidden();await page.locator('label').filter({has:page.locator('input[value="practice"]')}).click();await page.locator('#startBtn').click();
 for(let i=0;i<2;i++){await page.locator('#submitPartBtn').click();await page.locator('#nextPartBtn').click()}
 const first=page.locator('[data-audio]').first();await first.click();await expect(first).toBeEnabled();await first.click();await expect(first).toBeEnabled();
});
