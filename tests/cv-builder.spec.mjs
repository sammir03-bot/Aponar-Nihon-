import {test,expect} from '@playwright/test';

test.use({serviceWorkers:'block'});
const KEY='aponarNihonCvV5';
function draft(overrides={}) {
  return {template:'standard',outputFormat:'a4-2',created:'2026-10-01',name:'YAMADA HANAKO',furigana:'ヤマダ ハナコ',dob:'2000-01-02',address:'東京都 新宿区 1-2-3',phone:'070-1234-5678',email:'hanako@example.com',photo:'',edu:[{year:'2020',month:'3',text:'学校 卒業'}],work:[],qual:[],motive:'学んだことを活かして働きたいです。',...overrides};
}
async function seed(page,value=draft()) {
  await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(value));},{key:KEY,value});
}
async function open(page) {
  await page.goto('/cv-builder.html');await expect(page.locator('#cvValidation')).toBeAttached();
}
async function step(page,n) {await page.locator(`[data-step="${n}"]`).click();}
async function mockPrint(page) {await page.evaluate(()=>{window.cvPrintCalls=0;window.print=()=>{window.cvPrintCalls++;};});}

test('CV is readable on mobile, supports all templates and does not prefill claims',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  for(const template of ['parttime','newgrad','career','standard']) {
    await page.locator(`[data-template="${template}"]`).click();await expect(page.locator('body')).toHaveAttribute('data-cv-template',template);
  }
  await step(page,1);await expect(page.locator('#name')).toHaveCSS('font-size','16px');
  await page.locator('#name').fill('TEST USER');await expect(page.locator('#jisName')).toHaveText('TEST USER');
  await step(page,3);await expect(page.locator('#motive')).toHaveValue('');
  await page.locator('[data-motive="newgrad"]').click();await expect(page.locator('#motive')).toHaveValue(/学校/);await expect(page.locator('#cvMessage')).toContainText('নমুনার অর্থ');
  expect(errors).toEqual([]);
});
test('saved CV and manually chosen date survive reload and printing',async({page})=>{
  await seed(page);await open(page);await step(page,1);await expect(page.locator('#created')).toHaveValue('2026-10-01');
  await page.locator('#created').fill('2026-09-30');await expect(page.locator('#jisDate1')).toContainText('9月');
  await page.reload();await expect(page.locator('#jisDate1')).toContainText('30日');
  await mockPrint(page);await step(page,4);await page.locator('#printRireki').click();
  await expect.poll(()=>page.evaluate(()=>window.cvPrintCalls)).toBe(1);await expect(page.locator('#created')).toHaveValue('2026-09-30');
  await expect(page.locator('.print-jis.print-me')).toHaveCount(2);
});
test('backup restores old JSON drafts and unsafe photo markup is discarded',async({page})=>{
  await seed(page);await open(page);page.on('dialog',d=>d.accept());await step(page,4);
  const restored=draft({name:'RESTORED USER',outputFormat:'a4-1',photo:'x" onerror="window.cvInjected=true'});
  await page.locator('#backupInput').setInputFiles({name:'cv.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(restored))});
  await page.locator('[data-dialog-ok]').click();
  await expect(page.locator('#cvMessage')).toContainText('ফিরিয়ে আনা');await expect(page.locator('#jisName')).toHaveText('RESTORED USER');
  expect(await page.evaluate(()=>state.photo)).toBe('');expect(await page.evaluate(()=>window.cvInjected)).toBeUndefined();
  await expect(page.locator('#cvCompactResume')).toBeVisible();
  const download=page.waitForEvent('download');await page.locator('#backupBtn').click();const file=await download;expect(file.suggestedFilename()).toBe('aponar-nihon-cv-backup.json');
  const {readFile}=await import('node:fs/promises');const data=JSON.parse(await readFile(await file.path(),'utf8'));expect(data.cv.name).toBe('RESTORED USER');expect(data.format).toBe('aponar-cv');
});
test('invalid backups preserve the current draft',async({page})=>{
  await seed(page);await open(page);await step(page,4);
  await page.locator('#backupInput').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{bad json}')});
  await expect(page.locator('#cvMessage')).toContainText('সঠিক CV backup নয়');await expect(page.locator('#jisName')).toHaveText('YAMADA HANAKO');
});
test('CV stays usable with corrupt draft or unavailable local storage',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('aponarNihonCvV5','{"edu":null}');});await open(page);await step(page,1);await page.locator('#name').fill('NEW USER');
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});
  await page.locator('#name').fill('UNSAVED USER');await expect(page.locator('#jisName')).toHaveText('UNSAVED USER');await expect(page.locator('#cvSaveStatus')).toContainText('সংরক্ষণ হয়নি');
  await step(page,4);const download=page.waitForEvent('download');await page.locator('#backupBtn').click();expect((await download).suggestedFilename()).toContain('backup');
});
test('photo uploads are cropped locally to 3:4 and can be adjusted or removed',async({page})=>{
  await open(page);await step(page,1);
  const image=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1200;c.height=800;const g=c.getContext('2d');g.fillStyle='#ff0000';g.fillRect(0,0,600,800);g.fillStyle='#0000ff';g.fillRect(600,0,600,800);return c.toDataURL('image/png').split(',')[1];});
  await page.locator('#photoInput').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
  await expect(page.locator('#photoCrop')).toBeVisible();await expect(page.locator('#photoPreview img')).toHaveAttribute('src',/^data:image\/jpeg;/);
  expect(await page.locator('#photoPreview img').evaluate(i=>[i.naturalWidth,i.naturalHeight])).toEqual([450,600]);
  const before=await page.evaluate(()=>state.photo);await page.locator('#photoX').focus();await page.locator('#photoX').press('Home');expect(await page.evaluate(()=>state.photo)).not.toBe(before);
  expect(await page.evaluate(()=>state.photo.length)).toBeLessThan(300000);
  await page.locator('#removePhoto').click();await expect(page.locator('#photoPreview img')).toHaveCount(0);await expect(page.locator('#photoCrop')).toBeHidden();
});
test('history and qualifications continue on extra sheets without losing rows',async({page})=>{
  const work=Array.from({length:21},(_,i)=>({year:String(2000+i),month:'4',text:`会社 ${i+1} 入社`}));
  const qual=Array.from({length:8},(_,i)=>({year:'2022',month:String(i+1),text:`資格 ${i+1} 合格`}));
  await seed(page,draft({work,qual}));await open(page);await expect(page.locator('.cv-continuation')).toHaveCount(1);
  for(const row of [...work,...qual])expect(await page.locator('.print-jis').allTextContents()).toEqual(expect.arrayContaining([expect.stringContaining(row.text)]));
  await mockPrint(page);await step(page,4);await page.locator('#printRireki').click();await expect.poll(()=>page.evaluate(()=>window.cvPrintCalls)).toBe(1);await expect(page.locator('.print-jis.print-me')).toHaveCount(3);
  await page.locator('[data-preview="career"]').click();await expect(page.locator('.cv-continuation')).toBeHidden();
});
test('print review catches invalid dates, incomplete rows and a clipped compact CV',async({page})=>{
  await seed(page,draft({work:[{year:'2020',month:'13',text:'会社 入社'}]}));await open(page);await mockPrint(page);await step(page,4);await page.locator('#printRireki').click();
  await expect(page.locator('#cvIssueList')).toContainText('সাল, মাস');expect(await page.evaluate(()=>window.cvPrintCalls)).toBe(0);
  await step(page,2);await page.locator('[data-rtype="work"][data-k="month"]').fill('3');
  await step(page,0);await page.locator('[data-output-format="a4-1"]').click();
  await step(page,3);await page.locator('#motive').fill('長い志望動機です。'.repeat(150));
  await step(page,4);await page.locator('#printRireki').click();await expect(page.locator('#cvMessage')).toContainText('এক পাতায়');expect(await page.evaluate(()=>window.cvPrintCalls)).toBe(0);
});
test('A4 and A3 exports have the expected page count',async({page},testInfo)=>{
  await seed(page);await open(page);await mockPrint(page);await step(page,4);await page.locator('#printRireki').click();await expect.poll(()=>page.evaluate(()=>window.cvPrintCalls)).toBe(1);
  const a4=testInfo.outputPath('resume-a4.pdf');const pdf4=await page.pdf({path:a4,preferCSSPageSize:true,printBackground:true});expect((pdf4.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length).toBe(2);await testInfo.attach('A4 resume',{path:a4,contentType:'application/pdf'});
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));await step(page,0);await page.locator('[data-output-format="a3-1"]').click();await step(page,4);await page.locator('#printRireki').click();await expect.poll(()=>page.evaluate(()=>window.cvPrintCalls)).toBe(2);
  const a3=testInfo.outputPath('resume-a3.pdf');const pdf3=await page.pdf({path:a3,preferCSSPageSize:true,printBackground:true});expect((pdf3.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length).toBe(1);await testInfo.attach('A3 resume',{path:a3,contentType:'application/pdf'});
});
