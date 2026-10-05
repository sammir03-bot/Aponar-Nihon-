import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{},fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('.'+url.split('?')[0],'utf8'))})};
vm.createContext(context);vm.runInContext(fs.readFileSync('jlpt-level-generators.js','utf8'),context);
let total=0;
for(const level of ['n5','n4','n3']){
 await context.window.JLPT_LOAD_BANK(level);
 const data=JSON.parse(fs.readFileSync(`assets/data/jtest4you/${level}.json`,'utf8'));
 for(const q of data.questions){
  assert.ok(q.sourceQuestion>0);
  assert.ok(q.options.every(o=>o.trim()));
  assert.ok(new Set(q.options).size===q.options.length,`Ambiguous repeated options ${q.id}`);
  for(const value of [q.prompt,q.passage,q.questionImage,...q.options])if(value)assert.ok(!/<(?:script|iframe|input)|\son\w+=|javascript:/i.test(value));
 }
 for(let test=1;test<=10;test++){
  const bank=context.window.JLPT_FULL_GENERATOR(level,test),all=[...bank.vocab,...bank.grammarReading,...bank.listening];
  assert.deepEqual(Array.from([bank.vocab.length,bank.grammarReading.length,bank.listening.length]),Array.from(bank.meta.counts));
  assert.equal(new Set(all.map(q=>q.id)).size,all.length);
  const signature=q=>JSON.stringify([q.prompt,q.options,q.passage||'',q.audioUrl||'',q.questionImage||'']);
  assert.equal(new Set(all.map(signature)).size,all.length,`${level} ${test} repeated content`);
  assert.equal(new Set(bank.listening.map(q=>q.audioUrl)).size,bank.listening.length,`${level} ${test} repeated audio`);
  assert.ok(bank.grammarReading.filter(q=>q.kind==='文の組み立て').every(q=>/[★☆]/.test(q.prompt)));
  assert.ok(bank.grammarReading.some(q=>q.kind==='文章文法'&&q.passage));
  assert.ok(bank.listening.every(q=>q.fixedOptions&&q.audioUrl&&!q.audioText));
  total+=all.length;
 }
 console.log(level, data.questions.length, 'source questions; 10 sets validated');
}
assert.throws(()=>context.window.JLPT_FULL_GENERATOR('n4',0));
assert.throws(()=>context.window.JLPT_FULL_GENERATOR('n3',1.2));
console.log(total,'exam slots validated; answer indexes, source links, unique content and recorded audio checked');
