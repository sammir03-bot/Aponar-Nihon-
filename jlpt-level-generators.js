(function (global) {
'use strict';
const CONFIG = {
  n5: {label:'N5',times:[20,40,30],counts:[21,22,24],pass:80,groups:[{id:'knowledgeReading',label:'ভাষাজ্ঞান + রিডিং',max:120,min:38},{id:'listening',label:'লিসেনিং',max:60,min:19}]},
  n4: {label:'N4',times:[25,55,35],counts:[28,29,28],pass:90,groups:[{id:'knowledgeReading',label:'ভাষাজ্ঞান + রিডিং',max:120,min:38},{id:'listening',label:'লিসেনিং',max:60,min:19}]},
  n3: {label:'N3',times:[30,70,40],counts:[35,39,28],pass:95,groups:[{id:'language',label:'ভাষাজ্ঞান',max:60,min:19},{id:'reading',label:'রিডিং',max:60,min:19},{id:'listening',label:'লিসেনিং',max:60,min:19}]}
};
const banks = new Map();
const pending = new Map();
const schedules = new Map();
const VERSION = 6;
const SET_LIMIT = 15;
function textKey(value) {
  return (value||'').replace(/<[^>]*>/g,'').replace(/&(?:nbsp|#160);/g,' ').replace(/[\s　]+/g,'').normalize('NFKC');
}
function signature(q) {
  if(q.audioUrl)return 'audio:'+q.audioUrl.split('?')[0];
  return JSON.stringify([textKey(q.prompt),q.options.map(textKey).sort(),textKey(q.passage),textKey(q.passage)?'':q.passage||'']);
}
function validate(data, level) {
  if(data.version!==VERSION || data.level!==level || !Array.isArray(data.questions)) throw new Error('প্রশ্নব্যাংকের সংস্করণ সঠিক নয়');
  const ids=new Set();
  for(const q of data.questions) {
    if(!q.id || ids.has(q.id) || !q.prompt || !Array.isArray(q.options) || ![3,4].includes(q.options.length) || !Number.isInteger(q.answer) || q.answer<0 || q.answer>=q.options.length || !q.sourceUrl?.startsWith('https://japanesetest4you.com/')) throw new Error('প্রশ্ন বা answer key যাচাই হয়নি');
    if(q.category==='listening' && !q.audioUrl?.startsWith('https://japanesetest4you.com/')) throw new Error('Recorded listening audio অনুপস্থিত');
    ids.add(q.id);
  }
  return data.questions;
}
async function load(level) {
  if(!CONFIG[level]) throw new Error('Unsupported JLPT level');
  if(banks.has(level)) return;
  if(pending.has(level)) return pending.get(level);
  const promise=(async()=>{
    const response=await fetch(`/assets/data/jtest4you/${level}.json?v=20261005.6`,{cache:'no-cache'});
    if(!response.ok) throw new Error('প্রশ্নব্যাংক লোড হয়নি। আবার চেষ্টা করুন।');
    const questions=validate(await response.json(), level);
    const sets=assemble(level,questions);
    banks.set(level,questions);schedules.set(level,sets);
  })();
  pending.set(level,promise);
  try {await promise;} finally {pending.delete(level);}
}
class InsufficientQuestions extends Error {}
function take(pool, count, seen, label, previousPassages) {
  const out=[];
  for(const q of pool) {
    if(out.length===count)break;
    const key=signature(q);
    if(seen.has(key)||(q.passage&&previousPassages.has(textKey(q.passage))))continue;
    seen.add(key);out.push({...q,options:[...q.options]});
  }
  if(out.length!==count)throw new InsufficientQuestions(`${label}: নতুন আলাদা প্রশ্ন শেষ হয়েছে`);
  return out;
}
function vocabularyKind(q) {
  const prompt=textKey(q.prompt);
  if(/同じいみ|同じ意味|意味が最も近/.test(prompt))return 'paraphrase';
  if(/つかいかた|使い方|使いかた/.test(prompt))return 'usage';
  return 'context';
}
function assemble(level,qs) {
  const cfg=CONFIG[level],sets=[];let seen=new Set(),previousPassages=new Set();
  const cat=c=>qs.filter(q=>q.category===c),kanji=cat('kanji'),vocabulary=cat('vocabulary'),grammar=cat('grammar'),reading=cat('reading');
  for(let index=0;index<SET_LIMIT;index++) {
    const trial=new Set(seen),pick=(pool,n,label)=>take(pool,n,trial,label,previousPassages);
    try {
      const kReading=level==='n3'?8:7,kSpelling=level==='n3'?6:5;
      const vocab=[...pick(kanji.filter(q=>q.kind==='漢字読み'),kReading,'কানজি reading'),...pick(kanji.filter(q=>q.kind==='表記'),kSpelling,'কানজি spelling')];
      const vCounts=level==='n3'?[11,5,5]:level==='n4'?[8,4,4]:[9,0,0];
      for(const [i,kind] of ['context','paraphrase','usage'].entries())vocab.push(...pick(vocabulary.filter(q=>vocabularyKind(q)===kind),vCounts[i],'শব্দভাণ্ডার '+kind));
      const gCounts=level==='n5'?[9,4,4]:level==='n4'?[13,4,4]:[13,5,5];
      const grammarReading=[];
      for(const [i,kind] of ['文法形式','文の組み立て','文章文法'].entries())grammarReading.push(...pick(grammar.filter(q=>q.kind===kind),gCounts[i],kind));
      const rCounts=level==='n5'?[['short',2],['mid',2],['information',1]]:level==='n4'?[['short',3],['mid',3],['information',2]]:[['short',4],['mid',6],['long',4],['information',2]];
      for(const [kind,n] of rCounts)grammarReading.push(...pick(reading.filter(q=>q.readingKind===kind),n,'রিডিং '+kind));
      const listening=pick(cat('listening'),cfg.counts[2],'লিসেনিং');
      sets.push({vocab,grammarReading,listening});seen=trial;for(const q of [...vocab,...grammarReading,...listening])if(q.passage)previousPassages.add(textKey(q.passage));
    }catch(error){if(error instanceof InsufficientQuestions)break;throw error;}
  }
  return sets;
}
function build(level,test) {
  if(!Number.isInteger(test)||test<1||test>SET_LIMIT||!CONFIG[level])throw new Error('Invalid mock selection');
  const sets=schedules.get(level);if(!sets)throw new Error('প্রশ্নব্যাংক এখনো লোড হয়নি');
  const set=sets[test-1];if(!set){const error=new Error('এই সেটে পুনরাবৃত্তি ছাড়া যথেষ্ট যাচাইকৃত প্রশ্ন নেই। টেস্ট তালিকার চালু সেট বেছে নিন।');error.code='NO_NEW_SET';throw error;}
  return {...Object.fromEntries(Object.entries(set).map(([key,qs])=>[key,qs.map(q=>({...q,options:[...q.options]}))])),meta:{...CONFIG[level],bankVersion:VERSION,availableSets:sets.length,coverageNote:level==='n5'?'উৎসের N5 শব্দভাণ্ডারে paraphrase প্রশ্ন নেই; সেই ৩টির জায়গায় context practice আছে।':'' ,source:'JapaneseTest4You-এর প্রশ্ন ও answer key। JLPT-এর অফিসিয়াল সময় ও পাসসীমা; প্রশ্ন ও ১৮০ নম্বরের স্কোর অনুশীলনের। আলাদা সেটে প্রশ্ন ও রেকর্ডিং পুনরাবৃত্তি হয় না। প্রশ্নসংখ্যা অফিসিয়াল আনুমানিক তালিকা অনুযায়ী; প্রকৃত পরীক্ষায় কিছুটা পরিবর্তন হয়।'}};
}
function availability(level) {
  if(!schedules.has(level))throw new Error('Question bank not loaded');
  return {version:VERSION,availableSets:schedules.get(level).length,limit:SET_LIMIT,counts:[...CONFIG[level].counts],times:[...CONFIG[level].times]};
}
// No generated fallback: failed imports must be corrected before an exam opens.
global.JLPT_MOCK_SET_LIMIT=SET_LIMIT;
global.JLPT_MOCK_CONFIG=CONFIG;
global.JLPT_LOAD_BANK=load;
global.JLPT_FULL_GENERATOR=build;
global.JLPT_VALIDATE_BANK=validate;
global.JLPT_BANK_AVAILABILITY=availability;
global.JLPT_QUESTION_SIGNATURE=signature;
})(window);
