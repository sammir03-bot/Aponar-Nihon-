import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{},fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('.'+url.split('?')[0],'utf8'))})};
vm.createContext(context);vm.runInContext(fs.readFileSync('jlpt-level-generators.js','utf8'),context);
const catalog={version:6,levels:{},officialTimeSource:'https://www.jlpt.jp/e/guideline/testsections.html',officialCountSource:'https://www.jlpt.jp/e/topics/202009091599642827.html',officialScoreSource:'https://www.jlpt.jp/e/guideline/results.html',scoreMethod:'raw practice conversion; not official IRT scaled score'};
let total=0;
for(const level of ['n5','n4','n3']){
 await context.window.JLPT_LOAD_BANK(level);
 const data=JSON.parse(fs.readFileSync(`assets/data/jtest4you/${level}.json`,'utf8'));
 for(const q of data.questions){
  if(q.prompt.includes('そういうふうに受け入れた'))assert.equal(q.category,'reading','Reading comprehension must not be classified as passage cloze');
  assert.ok(q.sourceQuestion>0);assert.ok(q.options.every(o=>o.trim()));
  assert.equal(new Set(q.options).size,q.options.length,`Ambiguous repeated options ${q.id}`);
  for(const html of [q.prompt,q.passage,q.questionImage,...q.options])if(html?.includes('<img'))assert.ok(!/<img(?![^>]*referrerpolicy="no-referrer")[^>]*>/i.test(html));
  for(const value of [q.prompt,q.passage,q.questionImage,...q.options])if(value)assert.ok(!/<(?:script|iframe|input)|\son\w+=|javascript:/i.test(value));
 }
 const availability=context.window.JLPT_BANK_AVAILABILITY(level);
 assert.equal(availability.limit,15);
 assert.ok(availability.availableSets>0);
 const crossSetIds=new Set(),crossSetContent=new Set(),crossSetPassages=new Set();
 const passageKey=q=>(q.passage||'').replace(/<[^>]*>/g,'').replace(/&(?:nbsp|#160);/g,' ').replace(/[\s　]+/g,'').normalize('NFKC');
 for(let test=1;test<=availability.availableSets;test++){
  const bank=context.window.JLPT_FULL_GENERATOR(level,test),all=[...bank.vocab,...bank.grammarReading,...bank.listening];
  assert.deepEqual(Array.from([bank.vocab.length,bank.grammarReading.length,bank.listening.length]),Array.from(bank.meta.counts));
  const passages=new Set();
  for(const q of all){
   assert.ok(!crossSetIds.has(q.id),`${level}: repeated question across sets ${q.id}`);crossSetIds.add(q.id);
   const key=context.window.JLPT_QUESTION_SIGNATURE(q);assert.ok(!crossSetContent.has(key),`${level}: repeated content or recording`);crossSetContent.add(key);
   if(q.passage){const p=passageKey(q);assert.ok(!crossSetPassages.has(p),`${level}: reused passage across sets`);passages.add(p)}
  }
  for(const p of passages)crossSetPassages.add(p);
  assert.equal(new Set(bank.listening.map(q=>q.audioUrl)).size,bank.listening.length);
  assert.ok(bank.grammarReading.filter(q=>q.kind==='文の組み立て').every(q=>/[★☆]/.test(q.prompt)));
  assert.ok(bank.grammarReading.some(q=>q.kind==='文章文法'&&q.passage));
  for(const kind of level==='n3'?['short','mid','long','information']:['short','mid','information'])assert.ok(bank.grammarReading.some(q=>q.category==='reading'&&q.readingKind===kind));
  assert.ok(bank.listening.every(q=>q.fixedOptions&&q.audioUrl&&!q.audioText));
  const clone=context.window.JLPT_FULL_GENERATOR(level,test);clone.vocab[0].options[0]='edited';assert.notEqual(context.window.JLPT_FULL_GENERATOR(level,test).vocab[0].options[0],'edited');
  total+=all.length;
 }
 if(availability.availableSets<availability.limit)assert.throws(()=>context.window.JLPT_FULL_GENERATOR(level,availability.availableSets+1),e=>e.code==='NO_NEW_SET');
 catalog.levels[level]=JSON.parse(JSON.stringify({...availability,pass:context.window.JLPT_MOCK_CONFIG[level].pass,groups:context.window.JLPT_MOCK_CONFIG[level].groups}));
 console.log(level,data.questions.length,'source questions;',availability.availableSets,'disjoint sets validated');
}
assert.throws(()=>context.window.JLPT_FULL_GENERATOR('n4',0));assert.throws(()=>context.window.JLPT_FULL_GENERATOR('n3',1.2));
const path='assets/data/jtest4you/catalog.json';
if(process.argv.includes('--write-catalog'))fs.writeFileSync(path,JSON.stringify(catalog,null,2)+'\n');
else assert.deepEqual(JSON.parse(fs.readFileSync(path,'utf8')),catalog,'Catalog must match assembled disjoint sets');
console.log(total,'unique exam slots; no question, passage or recording recycled between sets');
// More rows of already-used content must never manufacture additional sets.
for(const level of ['n5','n4','n3']){
 const original=JSON.parse(fs.readFileSync(`assets/data/jtest4you/${level}.json`,'utf8'));
 const doubled={...original,questions:[...original.questions,...original.questions.map(q=>({...q,id:q.id+'-mirror',options:[...q.options].reverse(),answer:q.options.length-1-q.answer}))]};
 const c={window:{},fetch:async()=>({ok:true,json:async()=>doubled})};vm.createContext(c);vm.runInContext(fs.readFileSync('jlpt-level-generators.js','utf8'),c);await c.window.JLPT_LOAD_BANK(level);
 assert.equal(c.window.JLPT_BANK_AVAILABILITY(level).availableSets,catalog.levels[level].availableSets,'Duplicate content must not increase capacity');
}
console.log('Duplicate rows and reordered options cannot create fake new sets');

// With sixteen complete independent fixture sets, publish exactly fifteen.
for(const level of ['n5','n4','n3']){
 const first=context.window.JLPT_FULL_GENERATOR(level,1);
 const base=[...first.vocab,...first.grammarReading,...first.listening];
 const questions=Array.from({length:16},(_,i)=>base.map(q=>({...q,id:q.id+'-fixture-'+i,prompt:q.prompt+' fixture '+i,passage:q.passage?q.passage+' fixture '+i:undefined,audioUrl:q.audioUrl?q.audioUrl+'-fixture-'+i:undefined}))).flat();
 const c={window:{},fetch:async()=>({ok:true,json:async()=>({version:6,level,questions})})};
 vm.createContext(c);vm.runInContext(fs.readFileSync('jlpt-level-generators.js','utf8'),c);await c.window.JLPT_LOAD_BANK(level);
 assert.equal(c.window.JLPT_BANK_AVAILABILITY(level).availableSets,15);
 assert.ok(c.window.JLPT_FULL_GENERATOR(level,15).vocab[0].id.endsWith('-fixture-14'));
 assert.throws(()=>c.window.JLPT_FULL_GENERATOR(level,16),/Invalid mock selection/);
}
console.log('Fifteen independent sets per level supported; extra sets remain out of range');
