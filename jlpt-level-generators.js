(function (global) {
'use strict';
const CONFIG = {
  n5: {label:'N5',times:[20,40,30],counts:[25,28,24],pass:80,groups:[{id:'knowledgeReading',label:'ভাষাজ্ঞান + রিডিং',max:120,min:38},{id:'listening',label:'লিসেনিং',max:60,min:19}]},
  n4: {label:'N4',times:[25,55,35],counts:[28,29,28],pass:90,groups:[{id:'knowledgeReading',label:'ভাষাজ্ঞান + রিডিং',max:120,min:38},{id:'listening',label:'লিসেনিং',max:60,min:19}]},
  n3: {label:'N3',times:[30,70,40],counts:[35,39,28],pass:95,groups:[{id:'language',label:'ভাষাজ্ঞান',max:60,min:19},{id:'reading',label:'রিডিং',max:60,min:19},{id:'listening',label:'লিসেনিং',max:60,min:19}]}
};
const banks = new Map();
const pending = new Map();
function signature(q) {
  return JSON.stringify([q.prompt,q.options,q.passage||'',q.audioUrl||'',q.questionImage||'']);
}
function validate(data, level) {
  if(data.version!==5 || data.level!==level || !Array.isArray(data.questions)) throw new Error('প্রশ্নব্যাংকের সংস্করণ সঠিক নয়');
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
    const response=await fetch(`/assets/data/jtest4you/${level}.json?v=20261005`,{cache:'no-cache'});
    if(!response.ok) throw new Error('প্রশ্নব্যাংক লোড হয়নি। আবার চেষ্টা করুন।');
    banks.set(level, validate(await response.json(), level));
  })();
  pending.set(level,promise);
  try {await promise;} finally {pending.delete(level);}
}
function take(pool, count, offset, seen, label) {
  const out=[];
  for(let i=0;i<pool.length && out.length<count;i++) {
    const q=pool[(offset+i)%pool.length],key=signature(q);
    if(seen.has(key)) continue;
    seen.add(key);out.push({...q,options:[...q.options]});
  }
  if(out.length!==count) throw new Error(`${label}: পর্যাপ্ত আলাদা যাচাইকৃত প্রশ্ন নেই`);
  return out;
}
function build(level,test) {
  if(!Number.isInteger(test)||test<1||test>10||!CONFIG[level]) throw new Error('Invalid mock selection');
  const qs=banks.get(level);if(!qs) throw new Error('প্রশ্নব্যাংক এখনো লোড হয়নি');
  const cfg=CONFIG[level],seen=new Set(),cat=c=>qs.filter(q=>q.category===c);
  const kcount=level==='n5'?10:level==='n4'?12:14;
  const vocab=[...take(cat('kanji'),kcount,(test-1)*kcount,seen,'কানজি'),...take(cat('vocabulary'),cfg.counts[0]-kcount,(test-1)*(cfg.counts[0]-kcount),seen,'শব্দভাণ্ডার')];
  const grammar=cat('grammar'), order=grammar.filter(q=>q.kind==='文の組み立て'),text=grammar.filter(q=>q.kind==='文章文法'),form=grammar.filter(q=>q.kind==='文法形式');
  const readingCount=level==='n5'?6:level==='n4'?8:16;
  const grammarCount=cfg.counts[1]-readingCount;
  const grammarReading=[...take(form,grammarCount-10,(test-1)*(grammarCount-10),seen,'গ্রামার'),...take(order,5,(test-1)*5,seen,'★ বাক্য সাজানো'),...take(text,5,(test-1)*5,seen,'প্যাসেজ গ্রামার'),...take(cat('reading'),readingCount,(test-1)*readingCount,seen,'রিডিং')];
  const listening=take(cat('listening'),cfg.counts[2],(test-1)*cfg.counts[2],seen,'লিসেনিং');
  return {vocab,grammarReading,listening,meta:{...cfg,bankVersion:5,source:'JapaneseTest4You-এর প্রশ্ন ও answer key। JLPT সময় অনুযায়ী অনুশীলন পরীক্ষা; অফিসিয়াল প্রশ্নপত্র নয়। কিছু প্রশ্ন অন্য সেটেও আসতে পারে।'}};
}
// No generated fallback: failed imports must be corrected before an exam opens.
global.JLPT_MOCK_CONFIG=CONFIG;
global.JLPT_LOAD_BANK=load;
global.JLPT_FULL_GENERATOR=build;
global.JLPT_VALIDATE_BANK=validate;
})(window);
