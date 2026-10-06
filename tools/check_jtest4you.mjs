import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';

const code=fs.readFileSync('jlpt-level-generators.js','utf8');
const reviews=JSON.parse(fs.readFileSync('assets/data/jtest4you/bn-review.json','utf8'));
const makeContext=fetch=>{
  const context={window:{},fetch};vm.createContext(context);vm.runInContext(code,context);return context;
};
const context=makeContext(async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('.'+url.split('?')[0],'utf8'))}));
const catalog={
  version:9,levels:{},
  officialTimeSource:'https://www.jlpt.jp/e/guideline/testsections.html',
  officialCountSource:'https://www.jlpt.jp/e/topics/202009091599642827.html',
  officialScoreSource:'https://www.jlpt.jp/e/guideline/results.html',
  scoreMethod:'raw practice conversion; not official IRT scaled score'
};
const audioAudit=new Map(JSON.parse(fs.readFileSync('tools/content/mock-original-audio-audit.json')).recordings.map(r=>[r.id,r]));
const usedOriginalAudio=new Set();
const preserved=JSON.parse(fs.readFileSync('tools/content/mock-completion-preservation.json'));
let total=0;
for(const level of ['n5','n4','n3']){
  await context.window.JLPT_LOAD_BANK(level);
  const data=JSON.parse(fs.readFileSync(`assets/data/jtest4you/${level}.json`,'utf8'));
  assert.equal(createHash('sha256').update(JSON.stringify(data.questions)).digest('hex'),preserved.sourceQuestionHashes[level]);
  for(const q of data.questions){
    if(q.prompt.includes('そういうふうに受け入れた'))assert.equal(q.category,'reading');
    assert.ok(q.sourceQuestion>0);assert.ok(q.options.every(o=>o.trim()));
    assert.equal(new Set(q.options).size,q.options.length,`Ambiguous options ${q.id}`);
    for(const html of [q.prompt,q.passage,q.questionImage,...q.options]){
      if(html?.includes('<img'))assert.ok(!/<img(?![^>]*referrerpolicy="no-referrer")[^>]*>/i.test(html));
      if(html)assert.ok(!/<(?:script|iframe|input)|\son\w+=|javascript:/i.test(html));
    }
  }
  const availability=context.window.JLPT_BANK_AVAILABILITY(level);
  assert.equal(availability.limit,10);assert.equal(availability.availableSets,10,'All ten complete sets must be available');
  const crossIds=new Set(),crossContent=new Set(),crossPassages=new Set();
  const passageKey=q=>(q.passage||'').replace(/<[^>]*>/g,'').replace(/&(?:nbsp|#160);/g,' ').replace(/[\s　]+/g,'').normalize('NFKC')||Array.from((q.passage||'').matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi),m=>m[1]).sort().join('|');
  for(let test=1;test<=availability.availableSets;test++){
    const bank=context.window.JLPT_FULL_GENERATOR(level,test),all=[...bank.vocab,...bank.grammarReading,...bank.listening];
    assert.deepEqual(Array.from([bank.vocab.length,bank.grammarReading.length,bank.listening.length]),Array.from(bank.meta.counts));
    if(test<=preserved.preservedSets[level].length){
      const original=preserved.preservedSets[level][test-1];
      for(const part of ['vocab','grammarReading','listening'])assert.equal(createHash('sha256').update(JSON.stringify(bank[part])).digest('hex'),original[part],`Changed published ${level} set ${test} ${part}`);
    }
    const vocabTypeCounts=['context','paraphrase','usage'].map(kind=>bank.vocab.filter(q=>q.vocabularyType===kind).length);
    assert.deepEqual(vocabTypeCounts,level==='n5'?[6,3,0]:level==='n4'?[8,4,4]:[11,5,5],'Vocabulary must keep the JLPT question-type distribution');
    if(level==='n5'&&test===1)assert.ok(bank.vocab.filter(q=>q.vocabularyType==='paraphrase').every(q=>q.prompt.includes('おなじいみ')),'Recognize N5 same-meaning instructions written in kana');
    const passages=new Set();
    for(const q of all){
      assert.ok(!crossIds.has(q.id),`Repeated ID ${q.id}`);crossIds.add(q.id);
      const key=context.window.JLPT_QUESTION_SIGNATURE(q);assert.ok(!crossContent.has(key),'Repeated content or recording');crossContent.add(key);
      if(q.passage&&q.kind!=='文の組み立て'){const p=passageKey(q);assert.ok(!crossPassages.has(p),'Repeated passage');passages.add(p)}
      assert.ok(q.answerBn&&/[অ-হ]/u.test(q.answerBn),`Missing Bengali answer ${q.id}`);
      assert.ok(q.explanationBn.length>=40&&/[অ-হ]/u.test(q.explanationBn),`Missing substantive explanation ${q.id}`);
      assert.ok(!q.explanationBn.startsWith('উৎসের answer key অনুযায়ী'));
      assert.ok(!(reviews.excludedQuestionIds[level]||[]).includes(q.id),'Quarantined question selected');
      if(q.category==='listening'){
        assert.ok(q.audioText&&/[ぁ-んァ-ン一-龯]/u.test(q.audioText),'Missing listening transcript');
        assert.ok(!/正しい答えは|ただしいこたえは|The correct answer is/.test(q.audioText),'Answer-key boilerplate leaked into transcript');
        assert.ok(q.transcriptSource.startsWith(q.provenance==='aponar-original'?'/mock-content-notes.html#listening':'https://japanesetest4you.com/pdf/'));
        if(q.provenance==='aponar-original'){
          assert.ok(q.audioCredit.includes('VOICEVOX:四国めたん')&&q.audioCredit.includes('VOICEVOX:玄野武宏(CV:ガロ)'));
          assert.ok(q.audioText.includes('বাংলা অনুবাদ:'));
          const recording=audioAudit.get(q.id);assert.ok(recording,'Every original audio must be audited');
          const bytes=fs.readFileSync('.'+q.audioUrl);
          assert.equal(bytes.length,recording.bytes);
          assert.equal(createHash('sha256').update(bytes).digest('hex'),recording.fileSha256);
          assert.ok(recording.seconds>5&&recording.rms>.006&&recording.clippedFraction<.003);
          usedOriginalAudio.add(q.id);
        }
      }
    }
    for(const p of passages)crossPassages.add(p);
    assert.equal(new Set(bank.listening.map(q=>q.audioUrl)).size,bank.listening.length);
    assert.ok(bank.grammarReading.filter(q=>q.kind==='文の組み立て').every(q=>/[★☆]/.test(q.prompt)));
    assert.ok(bank.grammarReading.some(q=>q.kind==='文章文法'&&q.passage));
    for(const kind of level==='n3'?['short','mid','long','information']:['short','mid','information'])assert.ok(bank.grammarReading.some(q=>q.category==='reading'&&q.readingKind===kind));
    assert.ok(bank.listening.every(q=>q.fixedOptions&&q.audioUrl));
    const clone=context.window.JLPT_FULL_GENERATOR(level,test);clone.vocab[0].options[0]='edited';assert.notEqual(context.window.JLPT_FULL_GENERATOR(level,test).vocab[0].options[0],'edited');
    total+=all.length;
  }
  if(availability.availableSets<availability.limit)assert.throws(()=>context.window.JLPT_FULL_GENERATOR(level,availability.availableSets+1),e=>e.code==='NO_NEW_SET');
  catalog.levels[level]=JSON.parse(JSON.stringify({...availability,pass:context.window.JLPT_MOCK_CONFIG[level].pass,groups:context.window.JLPT_MOCK_CONFIG[level].groups}));
  console.log(level,availability.availableSets,'complete disjoint sets with Bengali review and transcripts');
  const doubled={...data,questions:[...data.questions,...data.questions.map(q=>({...q,id:q.id+'-mirror',options:[...q.options].reverse(),answer:q.options.length-1-q.answer}))]};
  const duplicateContext=makeContext(async url=>({ok:true,json:async()=>url.includes('bn-review')?reviews:url.includes('mock-original')?JSON.parse(fs.readFileSync(`assets/data/mock-original/${level}.json`)):doubled}));
  await duplicateContext.window.JLPT_LOAD_BANK(level);
  assert.equal(duplicateContext.window.JLPT_BANK_AVAILABILITY(level).availableSets,availability.availableSets,'Duplicate rows must not inflate capacity');

  const first=context.window.JLPT_FULL_GENERATOR(level,1),base=[...first.vocab,...first.grammarReading,...first.listening];
  const fixtureReview={...reviews,levels:{...reviews.levels,[level]:{}}};
  const questions=Array.from({length:11},(_,i)=>base.map(q=>{
    const copy={...q,id:q.id+'-fixture-'+i,prompt:q.prompt+' fixture '+i,passage:q.passage?(q.kind==='文の組み立て'?q.passage:q.passage+' fixture '+i):undefined,audioUrl:q.audioUrl?q.audioUrl+'-fixture-'+i:undefined};
    fixtureReview.levels[level][copy.id]={...reviews.levels[level][q.id]};
    return copy;
  })).flat();
  const fixtureContext=makeContext(async url=>({ok:true,json:async()=>url.includes('bn-review')?fixtureReview:{version:9,level,questions:url.includes('mock-original')?[]:questions}}));
  await fixtureContext.window.JLPT_LOAD_BANK(level);
  assert.equal(fixtureContext.window.JLPT_BANK_AVAILABILITY(level).availableSets,10);
  assert.ok(fixtureContext.window.JLPT_FULL_GENERATOR(level,10).vocab[0].id.endsWith('-fixture-9'));
  assert.throws(()=>fixtureContext.window.JLPT_FULL_GENERATOR(level,11),/Invalid mock selection/);
}
assert.equal(total,2540);assert.equal(usedOriginalAudio.size,592);
assert.throws(()=>context.window.JLPT_FULL_GENERATOR('n4',0));
assert.throws(()=>context.window.JLPT_FULL_GENERATOR('n3',1.2));
const path='assets/data/jtest4you/catalog.json';
if(process.argv.includes('--write-catalog'))fs.writeFileSync(path,JSON.stringify(catalog,null,2)+'\n');
else assert.deepEqual(JSON.parse(fs.readFileSync(path,'utf8')),catalog,'Catalog must match complete reviewed sets');
console.log(total,'question-specific Bengali answers/explanations validated; independent ten-set capacity guard passes');
