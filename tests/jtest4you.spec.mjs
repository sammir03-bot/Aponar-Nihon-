import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

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
  await expect(page.locator('.question-kind').filter({hasText:'文の組み立て'})).toHaveCount(level==='n3'?5:4);
  await expect(page.locator('.question-prompt').filter({hasText:/[★☆]/})).toHaveCount(level==='n3'?5:4);
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

test('practice audio can replay and historical v5 state is not resumed',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('aponarNihonExam-v5-n4-1',JSON.stringify({version:5,level:'n4',test:1,sectionIndex:2}));
  window.Audio=class{constructor(){this.duration=60;this.currentTime=0}pause(){}play(){this.onplaying?.();queueMicrotask(()=>this.onended?.());return Promise.resolve()}};
 });
 page.on('dialog',dialog=>dialog.accept());
 await page.goto('/jlpt-exam.html?level=n4&test=1');await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
 await expect(page.locator('#resumeBtn')).toBeHidden();await page.locator('label').filter({has:page.locator('input[value="practice"]')}).click();await page.locator('#startBtn').click();
 for(let i=0;i<2;i++){await page.locator('#submitPartBtn').click();await page.locator('#nextPartBtn').click()}
 const first=page.locator('[data-audio]').first();await first.click();await expect(first).toBeEnabled();await first.click();await expect(first).toBeEnabled();
});

test('answered listening explains remaining recordings and offers a working next-audio action',async({page})=>{
 await page.addInitScript(()=>{
  window.__audioInstances=[];
  window.Audio=class{constructor(src){this.src=src;this.currentTime=0;this.duration=60;window.__audioInstances.push(this)}pause(){}play(){this.onplaying?.();return Promise.resolve()}};
 });
 await page.goto('/jlpt-exam.html?level=n4&test=1');await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
 await page.evaluate(()=>{
  const bank=window.JLPT_FULL_GENERATOR('n4',1),all=[...bank.vocab,...bank.grammarReading,...bank.listening];
  localStorage.setItem('aponarNihonExam-v7-n4-1',JSON.stringify({version:7,level:'n4',test:1,mode:'full',sectionIndex:2,completed:[0,1],sectionEnd:Date.now()+35*60000,answers:Object.fromEntries(all.map(q=>[q.id+'-m1',q.answer])),audioDone:[],audioProgress:{},audioPlays:{}}));
 });
 await page.reload();await page.locator('#resumeBtn').click();
 await expect(page.locator('#submitPartBtn')).toBeDisabled();
 await expect(page.locator('#endCardTitle')).toHaveText('আরও ২৮টি অডিও বাকি');
 await expect(page.locator('#endCardText')).not.toContainText('এখন “পার্ট জমা দিন”');
 await expect(page.locator('#unansweredJump')).toHaveText('বাকি অডিও শুনুন →');
 await expect(page.locator('#dockStatus')).toContainText('০/২৮ অডিও শেষ');
 await page.locator('#unansweredJump').click();
 await expect(page.locator('[data-audio-status]').first()).toHaveText('অডিও চলছে…');
 await page.evaluate(()=>window.__audioInstances.at(-1).onended());
 await expect(page.locator('#dockStatus')).toContainText('১/২৮ অডিও শেষ');
});

test('unavailable set does not wrap back to previously used questions',async({page})=>{
 await page.goto('/jlpt-exam.html?level=n4&test=10');
 await expect(page.locator('#introTitle')).toHaveText('সেটটি এখনও প্রস্তুত নয়');
 await expect(page.locator('#startBtn')).toBeDisabled();await expect(page.locator('.question-card')).toHaveCount(0);
 await expect(page.locator('#introBack')).toHaveAttribute('href','n4-mock-tests.html');
});

test('hubs publish only disjoint sets and explicitly label a deliberate retake',async({page})=>{
 const catalog=await (await page.request.get('/assets/data/jtest4you/catalog.json')).json();
 await page.addInitScript(()=>localStorage.setItem('aponarNihonMockResults',JSON.stringify({'n4-1':{bankVersion:7,score:180,passed:true},'n5-1':{bankVersion:5,score:180,passed:true}})));
 for(const level of ['n5','n4','n3']){
  await page.goto(`/${level}-mock-tests.html`);await expect(page.locator('.exam-card[data-ready="true"]')).toHaveCount(catalog.levels[level].availableSets);
  await expect(page.locator('#heroTitle')).not.toContainText('১০টি');
  if(level==='n4')await expect(page.locator('#start-1')).toContainText('একই সেট আবার দিন');
  if(level==='n5')await expect(page.locator('#start-1')).toContainText('পরীক্ষা শুরু করুন');
 }
 await page.goto('/mock-test.html');await expect(page.locator('.hero-meta')).toContainText('৩টি চালু পূর্ণ পরীক্ষা');
 await expect(page.locator('[data-level="n5"] .facts')).toContainText('21 + 22 + 24 = 67');
});

for(const level of ['n4','n3']){
 test(`${level}: practice scoring uses official section ranges and requires every sectional minimum`,async({page})=>{
  await page.goto(`/jlpt-exam.html?level=${level}&test=1`);await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
  await page.evaluate(level=>{
   const bank=window.JLPT_FULL_GENERATOR(level,1),all=[...bank.vocab,...bank.grammarReading,...bank.listening];
   localStorage.setItem(`aponarNihonExam-v7-${level}-1`,JSON.stringify({version:7,level,test:1,mode:'full',sectionIndex:2,completed:[0,1],sectionEnd:Date.now()+40*60000,answers:Object.fromEntries(all.map(q=>[q.id+'-m1',q.category==='listening'?(q.answer+1)%q.options.length:q.answer])),audioDone:bank.listening.map(q=>q.id+'-m1')}));
  },level);
  await page.reload();await page.locator('#resumeBtn').click();await page.locator('#submitPartBtn').click();await page.locator('#nextPartBtn').click();
  await expect(page.locator('.result-status')).toHaveText('আরও প্র্যাকটিস প্রয়োজন');
  await expect(page.locator('.score-card').filter({hasText:'লিসেনিং'})).toContainText('০ / ৬০');
  const result=await page.evaluate(level=>JSON.parse(localStorage.getItem('aponarNihonMockResults'))[`${level}-1`],level);
  expect(result.score).toBe(120);expect(result.passed).toBe(false);expect(Object.values(result.groups).map(g=>g.max)).toEqual(level==='n3'?[60,60,60]:[120,60]);
 });
}

test('set ten keeps its own route, questions and saved attempt',async({page})=>{
 await page.goto('/jlpt-exam.html?level=n4&test=1');await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
 const first=await page.evaluate(()=>window.JLPT_FULL_GENERATOR('n4',1));
 const base=[...first.vocab,...first.grammarReading,...first.listening];
 const questions=Array.from({length:11},(_,i)=>base.map(q=>({...q,id:q.id+'-fixture-'+i,prompt:q.prompt+' fixture '+i,passage:q.passage?q.passage+' fixture '+i:undefined,audioUrl:q.audioUrl?q.audioUrl+'-fixture-'+i:undefined}))).flat();
 const review=await(await page.request.get('/assets/data/jtest4you/bn-review.json')).json();
 const fixtureReview={...review,levels:{...review.levels,n4:{}}};
 for(let i=0;i<11;i++)for(const q of base)fixtureReview.levels.n4[q.id+'-fixture-'+i]={...review.levels.n4[q.id]};
 await page.route('**/assets/data/jtest4you/bn-review.json*',route=>route.fulfill({json:fixtureReview}));
 await page.route('**/assets/data/jtest4you/n4.json*',route=>route.fulfill({json:{version:7,level:'n4',questions}}));
 await page.goto('/jlpt-exam.html?level=n4&test=10');
 await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
 await expect(page.locator('#introTitle')).toHaveText('N4 Mock Test ১০');
 await page.locator('#startBtn').click();await expect(page.locator('.question-card')).toHaveCount(28);
 await expect(page.locator('.question-prompt').first()).toContainText('fixture 9');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('aponarNihonExam-v7-n4-10')));
 expect(saved.test).toBe(10);
});
test('mock center stays on Aponar Nihon and accurately labels ten planned sets',async({page})=>{
 const catalog=await(await page.request.get('/assets/data/jtest4you/catalog.json')).json();
 for(const level of ['n5','n4','n3']){
  await page.goto(`/${level}-mock-tests.html`);
  await expect(page.locator('.exam-card[data-test]')).toHaveCount(10);
  await expect(page.locator('.exam-card[data-ready="true"]')).toHaveCount(catalog.levels[level].availableSets);
  await expect(page.locator('.pending-set button')).toHaveCount(10-catalog.levels[level].availableSets);
  await expect(page.locator('a[href*="bunpro.jp"]')).toHaveCount(0);
  await expect(page.locator('#heroDesc')).toContainText('সব এখানেই');
 }
 await page.goto('/mock-test.html');
 await expect(page.locator('a[href*="bunpro.jp"]')).toHaveCount(0);
 await expect(page.locator('.hero-meta')).toContainText('লক্ষ্য ৩০টি');
});

for(const level of ['n5','n4','n3']){
 test(`${level}: completed exam shows real Bengali review and downloads a named certificate`,async({page},testInfo)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`/jlpt-exam.html?level=${level}&test=1`);
  await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
  await page.locator('#candidateName').fill('সামির উদ্দিন');
  const bank=await page.evaluate(level=>window.JLPT_FULL_GENERATOR(level,1),level);
  await page.locator('#startBtn').click();
  await expect(page.locator('#reviewList .meaning-line')).toHaveCount(0);
  expect(await page.evaluate(level=>JSON.parse(localStorage.getItem(`aponarNihonExam-v7-${level}-1`)).candidateName,level)).toBe('সামির উদ্দিন');
  await page.goto('/mock-test.html');
  await page.evaluate(({level,bank})=>{
   const all=[...bank.vocab,...bank.grammarReading,...bank.listening];
   localStorage.setItem(`aponarNihonExam-v7-${level}-1`,JSON.stringify({version:7,level,test:1,mode:'full',candidateName:'সামির উদ্দিন',startedAt:Date.now()-120000,sectionStartedAt:Date.now()-60000,sectionTimes:{0:30,1:30},sectionIndex:2,completed:[0,1],sectionEnd:Date.now()+40*60000,answers:Object.fromEntries(all.map(q=>[q.id+'-m1',q.answer])),audioDone:bank.listening.map(q=>q.id+'-m1')}));
  },{level,bank});
  await page.goto(`/jlpt-exam.html?level=${level}&test=1`);await page.locator('#resumeBtn').click();await page.locator('#submitPartBtn').click();await page.locator('#nextPartBtn').click();
  await expect(page.locator('.result-status')).toHaveText('✓ PRACTICE PASS');
  const all=[...bank.vocab,...bank.grammarReading,...bank.listening];
  await expect(page.locator('.meaning-line')).toHaveCount(all.length);
  await expect(page.locator('.explanation')).toHaveCount(all.length);
  await expect(page.locator('.meaning-line').first()).toContainText(bank.vocab[0].answerBn);
  await expect(page.locator('.explanation').first()).toContainText(bank.vocab[0].explanationBn);
  await expect(page.locator('.review-audio')).toHaveCount(bank.listening.length);
  await expect(page.locator('#reviewList')).not.toContainText('উৎসের answer key অনুযায়ী');
  await page.locator('#certificateBtn').click();
  await expect(page.locator('#certificateDialog')).toBeVisible();
  await expect(page.locator('#certificateName')).toHaveValue('সামির উদ্দিন');
  await page.locator('#certificateName').fill('');
  await expect(page.locator('#downloadCertificate')).toBeDisabled();
  await page.locator('#certificateName').fill('সামির রহমান');
  await expect(page.locator('#certificateCanvas')).toHaveAttribute('aria-label',/সামির রহমান/);
  expect(await page.evaluate(()=>document.fonts.check('700 24px "Noto Sans Bengali"','বাংলা সনদ'))).toBe(true);
  expect(await page.evaluate(()=>document.fonts.check('500 24px "Aponar Mock Japanese"','日本語模擬試験'))).toBe(true);
  await page.locator('#certificateCanvas').screenshot({path:testInfo.outputPath('certificate-preview.png')});
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadCertificate').click()]);
  expect(download.suggestedFilename()).toBe(`Aponar-Nihon-${level.toUpperCase()}-Mock-01-Certificate.pdf`);
  const certificatePath=testInfo.outputPath('certificate.pdf');
  await download.saveAs(certificatePath);
  const pdf=await readFile(certificatePath);
  expect(pdf.subarray(0,8).toString()).toBe('%PDF-1.4');
  expect(pdf.length).toBeGreaterThan(10000);
  expect(pdf.subarray(-6).toString()).toBe('%%EOF\n');
  const result=await page.evaluate(level=>JSON.parse(localStorage.getItem('aponarNihonMockResults'))[level+'-1'],level);
  expect(result.score).toBe(180);expect(result.certificateName).toBe('সামির রহমান');
  expect(result.certificateId).toMatch(/^AN-N[345]-01-/);
  expect(result.elapsedSeconds).toBeGreaterThanOrEqual(120);
  await page.locator('.certificate-close').click();
  await page.goto(`/jlpt-exam.html?level=${level}&test=1&result=1`);
  await expect(page.locator('#resultView')).toBeVisible();
  await page.locator('#certificateBtn').click();
  await expect(page.locator('#certificateName')).toHaveValue('সামির রহমান');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  expect(errors).toEqual([]);
 });
}

test('Bengali review load failure offers retry and never opens incomplete exam',async({page})=>{
 let broken=true;
 await page.route('**/assets/data/jtest4you/bn-review.json*',route=>broken?route.fulfill({status:503,body:'Unavailable'}):route.continue());
 await page.goto('/jlpt-exam.html?level=n5&test=1');
 await expect(page.locator('#startBtn')).toHaveText('আবার লোড করুন →');
 await expect(page.locator('#sourceText')).toContainText('বাংলা উত্তর ও ব্যাখ্যা লোড হয়নি');
 broken=false;await page.locator('#startBtn').click();
 await expect(page.locator('#startBtn')).toHaveText('পরীক্ষা শুরু করুন →');
});
