(()=>{'use strict';
const params=new URLSearchParams(location.search);let level=(params.get('level')||'n5').toLowerCase();if(!['n5','n4','n3'].includes(level))level='n5';const test=Math.min(window.JLPT_MOCK_SET_LIMIT,Math.max(1,Math.floor(Number(params.get('test')))||1));const byId=id=>document.getElementById(id);const bn=v=>String(v).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);const letters=['1','2','3','4'];const listPage=`${level}-mock-tests.html`;let cfg=null,sections=[],prepared={},questionIndex=new Map(),state=null,timerTick=null,toastTick=null,recordedAudio=null,audioEpoch=0,bankReady=false;
function hash(text){let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}function rng(seed){let x=seed||123456789;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}function shuffle(items,seed){const list=[...items],random=rng(seed);for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}function mixOptions(question){return {...question,displayId:question.id+'-m'+test,options:[...question.options]}}
function groupReading(items){const grammar=items.filter(x=>!x.passage),groups=[],map=new Map();for(const item of items.filter(x=>x.passage)){if(!map.has(item.passage)){const g=[];map.set(item.passage,g);groups.push(g)}map.get(item.passage).push(item)}return[...grammar,...groups.flat()]}
function prepare(){if(typeof window.JLPT_FULL_GENERATOR!=='function')throw new Error('Mock question bank load হয়নি');const bank=window.JLPT_FULL_GENERATOR(level,test);cfg=bank.meta||window.JLPT_MOCK_CONFIG[level];sections=[{id:'vocab',title:'শব্দভাণ্ডার',jp:'言語知識（文字・語彙）',minutes:cfg.times[0],short:'文字・語彙',description:level==='n5'?'কানজির পড়া, লেখা, শব্দভাণ্ডার ও একই অর্থের বাক্য বাছাই।':'কানজি reading, spelling, context, paraphrase ও usage প্রশ্ন।'},{id:'grammarReading',title:'গ্রামার ও রিডিং',jp:'言語知識（文法）・読解',minutes:cfg.times[1],short:'文法・読解',description:'Grammar form, sentence/text grammar এবং JLPT-style reading passage।'},{id:'listening',title:'লিসেনিং',jp:'聴解',minutes:cfg.times[2],short:'聴解',description:'মূল সোর্স ও নিজস্ব জাপানি রেকর্ডিং। সব অডিও শোনা শেষে এই পার্ট জমা দিতে পারবেন।'}];prepared.vocab=bank.vocab.map(mixOptions);prepared.grammarReading=groupReading(bank.grammarReading).map(mixOptions);prepared.listening=bank.listening.map(mixOptions);questionIndex=new Map(Object.values(prepared).flat().map(x=>[x.displayId,x]))}
const storageKey=()=>`aponarNihonExam-v9-${level}-${test}`,resultKey='aponarNihonMockResults';function freshState(mode='full'){return{version:9,level,test,mode,candidateName:(byId('candidateName')?.value||'').trim().slice(0,80),sectionTimes:{},sectionStartedAt:null,sectionIndex:0,answers:{},flags:{},audioPlays:{},audioProgress:{},audioDone:[],completed:[],sectionEnd:null,awaitingNext:false,finished:false,startedAt:Date.now(),scrollY:0,questionPositions:{},layout:'single',checkedAnswers:{}}}function normalizeState(raw){if(!raw||!window.AponarMockBankVersion.compatible(level,test,raw.version)||raw.level!==level||raw.test!==test)return null;return{...freshState(raw.mode||'full'),...raw,version:9,answers:raw.answers||{},flags:raw.flags||{},audioPlays:raw.audioPlays||{},audioProgress:raw.audioProgress||{},audioDone:Array.isArray(raw.audioDone)?raw.audioDone:[],completed:Array.isArray(raw.completed)?raw.completed:[],questionPositions:raw.questionPositions||{},layout:raw.layout==='all'?'all':'single',checkedAnswers:raw.checkedAnswers||{}}}function loadState(){try{return normalizeState(JSON.parse(localStorage.getItem(storageKey())||(window.AponarMockBankVersion.compatible(level,test,8)?localStorage.getItem(`aponarNihonExam-v8-${level}-${test}`):null)||'null'))}catch{return null}}function saveState(){try{if(state)localStorage.setItem(storageKey(),JSON.stringify(state))}catch{showToast('এই ব্রাউজারে অগ্রগতি সেভ হচ্ছে না')}}function getResults(){try{return JSON.parse(localStorage.getItem(resultKey)||'{}')}catch{return{}}}function saveResults(r){try{localStorage.setItem(resultKey,JSON.stringify(r))}catch{showToast('ফলাফল সেভ হয়নি; এই পেজে দেখতে পারবেন')}}function sectionSeconds(s){return(state.mode==='practice'?Math.max(5,Math.ceil(s.minutes/10)):s.minutes)*60}function answeredIn(i){return prepared[sections[i].id].filter(q=>state.answers[q.displayId]!==undefined).length}function remainingIn(i){return prepared[sections[i].id].length-answeredIn(i)}function jumpTo(top=0){const root=document.documentElement,old=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollTo(0,Math.max(0,top));requestAnimationFrame(()=>root.style.scrollBehavior=old)}
function setupIntro(){document.title=`JLPT ${level.toUpperCase()} Mock Test ${test} | আপনার নিহোন`;byId('introTitle').textContent=`${level.toUpperCase()} Mock Test ${bn(test)}`;byId('levelPill').textContent=`JLPT ${level.toUpperCase()} · APONAR NIHON · EXAM PRACTICE`;byId('startHero').classList.add(level);byId('sourceText').textContent=cfg.source+(cfg.coverageNote?' '+cfg.coverageNote:'');byId('realTimeLabel').textContent=`Real Time · ${bn(cfg.times.reduce((a,b)=>a+b,0))} মিনিট`;byId('partPreview').innerHTML=sections.map((s,i)=>`<div class="preview-item"><b>${bn(prepared[s.id].length)}</b><strong>${s.title}</strong><small>${bn(s.minutes)} মিনিট</small></div>`).join('');[byId('introBack'),byId('exitLink'),byId('resultBack'),byId('allTestsLink')].forEach(a=>a.href=listPage);if(window.AponarMockBankVersion.compatible(level,test,getResults()[`${level}-${test}`]?.bankVersion))byId('sourceText').textContent+=' এই সেট আগে দেওয়া হয়েছে; আবার দিলে একই প্রশ্ন থাকবে।';const old=loadState();if(old&&!old.finished){byId('candidateName').value=old.candidateName||'';byId('resumeBtn').classList.remove('hidden');byId('restartBtn').classList.remove('hidden')}if(params.get('result')==='1'){const saved=getResults()[`${level}-${test}`];if(window.AponarMockBankVersion.compatible(level,test,saved?.bankVersion)){state=loadState();showResult(saved)}}}
function startNew(){state=freshState(document.querySelector('input[name="mode"]:checked').value);beginSection(0)}async function restart(){if(!await window.AponarI18nContent.confirm('আগের অগ্রগতি মুছে নতুন করে শুরু করবেন?'))return;localStorage.removeItem(storageKey());startNew()}function resume(){state=loadState()||freshState();showExamChrome();renderSection(false);if(state.awaitingNext)showPartSheet();else startTimer();requestAnimationFrame(()=>jumpTo(state.scrollY||0))}function beginSection(index){stopSpeech();clearInterval(timerTick);state.sectionIndex=index;state.awaitingNext=false;state.scrollY=0;state.sectionStartedAt=Date.now();state.sectionEnd=state.sectionStartedAt+sectionSeconds(sections[index])*1000;saveState();showExamChrome();renderSection(true);startTimer();jumpTo(0)}function showExamChrome(){byId('startView').classList.add('hidden');byId('resultView').classList.add('hidden');byId('examTop').classList.remove('hidden');byId('examView').classList.remove('hidden');byId('bottomDock').classList.remove('hidden')}
function renderPartRail(){byId('partRail').innerHTML=sections.map((s,i)=>{const done=state.completed.includes(i),active=i===state.sectionIndex&&!state.awaitingNext;return`<div class="part-step ${done?'done':''} ${active?'active':''}"><span class="step-no">${done?'✓':bn(i+1)}</span><span>${s.short}</span></div>`}).join('')}function renderSection(reset){const s=sections[state.sectionIndex],questions=prepared[s.id];byId('topTitle').textContent=`${level.toUpperCase()} Mock Test ${bn(test)}`;byId('topSubtitle').textContent=`পার্ট ${bn(state.sectionIndex+1)} · ${s.jp}`;byId('partKicker').textContent=`PART ${bn(state.sectionIndex+1)} / ৩`;byId('partTitle').textContent=`${s.title} · ${s.jp}`;byId('partDescription').textContent=s.description;byId('feedLabel').textContent=`মোট ${bn(questions.length)}টি প্রশ্ন · ${bn(sectionSeconds(s)/60)} মিনিট`;renderPartRail();renderQuestionFeed(questions);updateProgress();if(reset)requestAnimationFrame(()=>jumpTo(0))}function questionKind(q){return q.kind||(q.audioUrl?'聴解 · লিসেনিং':q.passage?'読解 · রিডিং':'言語知識 · ভাষাজ্ঞান')}
function renderQuestionFeed(questions){
 let lastPassage=null,pno=0,html='';
 questions.forEach((q,index)=>{
  if(q.passage&&q.kind!=='文の組み立て'&&q.passage!==lastPassage){pno++;html+=`<aside class="passage-card" data-passage-start="${index}"><span class="passage-label">📖 Reading Passage ${bn(pno)}</span><div class="passage-text">${q.passage}</div></aside>`}
  lastPassage=q.passage||null;
  const selected=state.answers[q.displayId],flagged=!!state.flags[q.displayId];
  html+=`<article class="question-card ${selected!==undefined?'answered':''} ${flagged?'flagged':''}" id="q-${q.displayId}" data-qid="${q.displayId}" data-question-index="${index}"><div class="question-head"><div class="question-meta"><span class="question-number">${bn(index+1)}</span><span class="question-kind">${questionKind(q)}</span></div><button class="flag-button ${flagged?'active':''}" type="button" data-flag="${q.displayId}" aria-pressed="${flagged}">${flagged?'★ পরে দেখব':'☆ পরে দেখব'}</button></div>${q.audioUrl?`<div class="audio-panel"><button class="audio-play" type="button" aria-label="প্রশ্ন ${bn(index+1)}-এর অডিও শুনুন" data-audio="${q.displayId}" ${state.mode==='full'&&(state.audioDone.includes(q.displayId)||prepared.listening.find(x=>!state.audioDone.includes(x.displayId))?.displayId!==q.displayId)?'disabled':''}>${state.audioDone.includes(q.displayId)?'✓':'▶'}</button><div class="audio-copy"><strong>রেকর্ড করা অডিও</strong><small data-audio-status="${q.displayId}">${state.audioDone.includes(q.displayId)?'শোনা হয়েছে':state.mode==='full'?'পরীক্ষা মোড · একবার · ক্রমানুসারে':'অনুশীলন মোড · আবার শুনতে পারবেন'}</small></div></div>`:''}<div class="question-prompt">${q.prompt}</div>${q.questionImage||''}<div class="options">${q.options.map((o,oi)=>`<button class="option ${selected===oi?'selected':''}" type="button" aria-pressed="${selected===oi}" data-answer="${q.displayId}" data-option="${oi}"><span class="option-key ${q.options.every(x=>/^[1-4]$/.test(x))?'hidden':''}">${letters[oi]||bn(oi+1)}</span><span class="option-text">${o}</span></button>`).join('')}</div>${state.mode==='practice'?`<div class="practice-check"><button class="secondary-button" type="button" data-check="${q.displayId}">উত্তর ও বাংলা ব্যাখ্যা দেখুন</button><div class="practice-feedback ${state.checkedAnswers[q.displayId]?'':'hidden'}" data-feedback="${q.displayId}" aria-live="polite">${state.checkedAnswers[q.displayId]?answerFeedback(q):''}</div></div>`:''}</article>`;
 });
 byId('questionFeed').innerHTML=html;
 byId('questionFeed').querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>selectAnswer(b.dataset.answer,Number(b.dataset.option))));
 byId('questionFeed').querySelectorAll('[data-flag]').forEach(b=>b.addEventListener('click',()=>toggleFlag(b.dataset.flag)));
 byId('questionFeed').querySelectorAll('[data-audio]').forEach(b=>b.addEventListener('click',()=>playQuestionAudio(b.dataset.audio)));
 byId('questionFeed').querySelectorAll('[data-check]').forEach(b=>b.addEventListener('click',()=>checkPracticeAnswer(b.dataset.check)));
 renderQuestionMap();applyQuestionLayout();
}
function answerFeedback(q){
 const ok=state.answers[q.displayId]===q.answer;
 return `<strong>${ok?'✓ আপনার উত্তর সঠিক':'✕ সঠিক উত্তর দেখুন'} · ${bn(q.answer+1)}</strong><div>${q.options[q.answer]}</div><div class="bangla-answer">${escapeHTML(q.answerBn)}</div><p>${escapeHTML(q.explanationBn)}</p>`;
}
function checkPracticeAnswer(id){
 if(!state||state.mode!=='practice'||state.finished||state.awaitingNext)return;
 if(state.answers[id]===undefined){showToast('আগে একটি উত্তর বেছে নিন');return}
 const q=questionIndex.get(id);if(!currentQuestions().includes(q))return;
 state.checkedAnswers[id]=true;saveState();
 const box=document.querySelector(`[data-feedback="${id}"]`);if(box){box.innerHTML=answerFeedback(q);box.classList.remove('hidden')}
}
function currentQuestions(){return prepared[sections[state.sectionIndex].id]}
function currentPosition(){
 const qs=currentQuestions(),raw=Number(state.questionPositions[sections[state.sectionIndex].id])||0;
 return Math.max(0,Math.min(qs.length-1,Math.floor(raw)));
}
function renderQuestionMap(){
 const qs=currentQuestions(),position=currentPosition();
 byId('questionMap').innerHTML=qs.map((q,i)=>`<button type="button" data-go-question="${i}" class="${state.answers[q.displayId]!==undefined?'answered':''} ${state.flags[q.displayId]?'flagged':''} ${i===position?'current':''}" aria-label="প্রশ্ন ${bn(i+1)}${state.answers[q.displayId]!==undefined?', উত্তর দেওয়া':''}${state.flags[q.displayId]?', পরে দেখব':''}" ${i===position?'aria-current="step"':''}>${bn(i+1)}</button>`).join('');
 byId('questionMap').querySelectorAll('[data-go-question]').forEach(b=>b.addEventListener('click',()=>goQuestion(Number(b.dataset.goQuestion))));
}
function applyQuestionLayout(){
 const qs=currentQuestions(),position=currentPosition(),all=state.layout==='all';
 document.querySelectorAll('[data-question-index]').forEach(card=>card.classList.toggle('hidden',!all&&Number(card.dataset.questionIndex)!==position));
 document.querySelectorAll('[data-passage-start]').forEach(card=>{const passage=qs[Number(card.dataset.passageStart)].passage;card.classList.toggle('hidden',!all&&qs[position].passage!==passage)});
 byId('questionCounter').textContent=`প্রশ্ন ${bn(position+1)} / ${bn(qs.length)}`;
 byId('previousQuestion').disabled=position===0;byId('nextQuestion').disabled=position===qs.length-1;
 byId('layoutToggle').textContent=all?'একটি করে প্রশ্ন দেখুন':'সব প্রশ্ন দেখুন';byId('layoutToggle').setAttribute('aria-pressed',String(all));
 byId('questionMap').querySelectorAll('[data-go-question]').forEach(b=>{const active=Number(b.dataset.goQuestion)===position;b.classList.toggle('current',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
}
function goQuestion(index,scroll=true){
 if(!state||state.finished||state.awaitingNext)return;
 const qs=currentQuestions();if(!Number.isInteger(index)||index<0||index>=qs.length)return;
 state.questionPositions[sections[state.sectionIndex].id]=index;saveState();applyQuestionLayout();
 if(scroll){
  const q=qs[index],passage=document.querySelector('[data-passage-start]:not(.hidden)');
  (state.layout==='single'&&q.passage&&passage?passage:document.getElementById('q-'+q.displayId))?.scrollIntoView({behavior:'smooth',block:'start'});
 }
}
function selectAnswer(id,opt){
 if(!state||state.finished||state.awaitingNext||!currentQuestions().some(q=>q.displayId===id))return;
 state.answers[id]=opt;delete state.checkedAnswers[id];saveState();
 const card=document.querySelector(`[data-qid="${id}"]`);if(!card)return;
 card.classList.add('answered');
 card.querySelectorAll('[data-answer]').forEach(b=>{const active=Number(b.dataset.option)===opt;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});
 card.querySelector('[data-feedback]')?.classList.add('hidden');
 updateProgress();renderQuestionMap();
}
function toggleFlag(id){
 if(!state||state.finished||state.awaitingNext)return;
 state.flags[id]=!state.flags[id];saveState();
 const card=document.querySelector(`[data-qid="${id}"]`),b=card?.querySelector('[data-flag]');
 card?.classList.toggle('flagged',!!state.flags[id]);
 if(b){b.classList.toggle('active',!!state.flags[id]);b.setAttribute('aria-pressed',String(!!state.flags[id]));b.textContent=state.flags[id]?'★ পরে দেখব':'☆ পরে দেখব'}
 renderQuestionMap();
}
function updateProgress(){const qs=prepared[sections[state.sectionIndex].id],answered=answeredIn(state.sectionIndex),left=qs.length-answered,pct=qs.length?answered/qs.length*100:0;byId('topProgress').style.width=pct+'%';byId('answeredTop').textContent=`${bn(answered)} / ${bn(qs.length)} উত্তর`;byId('dockTitle').textContent=sections[state.sectionIndex].title;byId('dockStatus').textContent=`${bn(answered)} / ${bn(qs.length)} উত্তর দেওয়া`;const audioRemaining=state.mode==='full'&&state.sectionIndex===2?qs.filter(q=>!state.audioDone.includes(q.displayId)).length:0,audioLeft=audioRemaining>0; if(state.sectionIndex===2&&state.mode==='full')byId('dockStatus').textContent+=` · ${bn(qs.length-audioRemaining)}/${bn(qs.length)} অডিও শেষ`;byId('submitPartBtn').disabled=audioLeft;byId('submitPartBtn').textContent=audioLeft?'লিসেনিং শুনে শেষ করুন':`পার্ট জমা দিন →${left?' ('+bn(left)+'টি ফাঁকা)':''}`;byId('unansweredJump').classList.toggle('hidden',left===0&&!audioLeft);byId('unansweredJump').textContent=audioLeft?'বাকি অডিও শুনুন →':'প্রথম উত্তর না-দেওয়া প্রশ্নে যান';byId('endCardTitle').textContent=audioLeft?`আরও ${bn(audioRemaining)}টি অডিও বাকি`:left?`আরও ${bn(left)}টি প্রশ্ন বাকি`:'সব প্রশ্নের উত্তর দেওয়া হয়েছে';byId('endCardText').textContent=audioLeft?'পরীক্ষা মোডে অডিও ক্রমানুসারে একবার শুনতে হবে। নিচের বাটনে বাকি অডিওতে যান; সব অডিও শেষে জমা দিতে পারবেন।':left?'ফাঁকা প্রশ্নে ফিরে যেতে পারেন, অথবা এই পার্ট জমা দিতে পারেন।':'এখন “পার্ট জমা দিন” বাটন চাপুন।'}function jumpToUnanswered(){
 const qs=currentQuestions();
 if(state.mode==='full'&&state.sectionIndex===2){
  const index=qs.findIndex(x=>!state.audioDone.includes(x.displayId));
  if(index>=0){goQuestion(index);const button=document.querySelector(`[data-audio="${qs[index].displayId}"]`);if(button&&!button.disabled)playQuestionAudio(qs[index].displayId);return}
 }
 const index=qs.findIndex(x=>state.answers[x.displayId]===undefined);if(index>=0)goQuestion(index);
}
function submitPart(auto=false){if(!state||state.finished||state.awaitingNext)return;const left=remainingIn(state.sectionIndex);if(!auto&&state.mode==='full'&&state.sectionIndex===2&&prepared.listening.some(q=>!state.audioDone.includes(q.displayId))){showToast('রেকর্ড করা লিসেনিং আগে শেষ করুন');return}if(left&&!auto&&!window.confirm(`${bn(left)}টি প্রশ্নের উত্তর দেওয়া হয়নি। তবুও জমা দেবেন?`))return;state.sectionTimes=state.sectionTimes||{};state.sectionTimes[state.sectionIndex]=Math.min(sectionSeconds(sections[state.sectionIndex]),Math.max(0,Math.floor((Date.now()-(state.sectionStartedAt||state.startedAt))/1000)));clearInterval(timerTick);stopSpeech();if(!state.completed.includes(state.sectionIndex))state.completed.push(state.sectionIndex);state.sectionEnd=null;state.awaitingNext=true;state.scrollY=0;saveState();renderPartRail();updateProgress();showPartSheet(auto)}function showPartSheet(auto=false){const i=state.sectionIndex,total=prepared[sections[i].id].length,answered=answeredIn(i),last=i===2;byId('sheetTitle').textContent=auto?'সময় শেষ—পার্ট জমা হয়েছে':`${sections[i].title} পার্ট সম্পন্ন`;byId('sheetAnswered').textContent=`${bn(answered)}/${bn(total)}`;byId('sheetPart').textContent=`${bn(i+1)}/৩`;if(last){byId('nextPreview').innerHTML='<strong>সব পার্ট সম্পন্ন</strong><span>১৮০ নম্বরের practice result প্রস্তুত</span>';byId('nextPartBtn').textContent='ফলাফল দেখুন →'}else{const n=sections[i+1];byId('nextPreview').innerHTML=`<strong>পরবর্তী পার্ট ${bn(i+2)}</strong><span>${n.title} · ${n.jp} · ${bn(n.minutes)} মিনিট</span>`;byId('nextPartBtn').textContent='পরবর্তী পার্ট শুরু করুন →'}byId('partSheet').classList.remove('hidden');byId('bottomDock').classList.add('hidden')}function continueAfterPart(){byId('partSheet').classList.add('hidden');if(state.sectionIndex===2){finalize();return}byId('bottomDock').classList.remove('hidden');beginSection(state.sectionIndex+1)}function startTimer(){clearInterval(timerTick);const draw=()=>{const left=Math.max(0,Math.ceil((state.sectionEnd-Date.now())/1000)),m=Math.floor(left/60),s=left%60;byId('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');byId('timer').classList.toggle('danger',left<=300);if(left<=0){clearInterval(timerTick);submitPart(true)}};draw();timerTick=setInterval(draw,1000)}
function calculate(){const groups={};for(const g of cfg.groups)groups[g.id]={...g,total:0,correct:0,score:0};let correct=0,total=0;for(const qu of Object.values(prepared).flat()){total++;const g=groups[qu.group]||groups[cfg.groups[0].id];g.total++;if(state.answers[qu.displayId]===qu.answer){correct++;g.correct++}}for(const g of Object.values(groups))g.score=g.total?Math.round(g.correct/g.total*g.max):0;const score=Object.values(groups).reduce((a,g)=>a+g.score,0),sectionPass=Object.values(groups).every(g=>g.score>=g.min),passed=score>=cfg.pass&&sectionPass;return{bankVersion:9,level,test,score,correct,total,groups,passed,candidateName:state.candidateName||'',startedAt:state.startedAt,elapsedSeconds:Object.values(state.sectionTimes||{}).reduce((a,b)=>a+b,0),answers:{...state.answers},completedAt:new Date().toISOString(),mode:state.mode}}function finalize(){state.finished=true;state.awaitingNext=false;state.sectionEnd=null;saveState();const result=calculate(),results=getResults();results[`${level}-${test}`]=result;saveResults(results);showResult(result)}function showResult(result){clearInterval(timerTick);stopSpeech();byId('startView').classList.add('hidden');byId('examTop').classList.add('hidden');byId('examView').classList.add('hidden');byId('bottomDock').classList.add('hidden');byId('partSheet').classList.add('hidden');byId('resultView').classList.remove('hidden');const pct=Math.round(result.score/180*100),answers=result.answers||(state?.answers||{});byId('resultHero').innerHTML=`<section class="result-hero ${result.passed?'':'fail'}"><span class="result-status">${result.passed?'✓ PRACTICE PASS':'আরও প্র্যাকটিস প্রয়োজন'}</span><h1>${level.toUpperCase()} Mock Test ${bn(test)}</h1><div class="score-circle" style="--pct:${pct}%"><div><strong>${bn(result.score)}</strong><small>/ ১৮০</small></div></div><p>${bn(result.correct)} / ${bn(result.total)} প্রশ্ন সঠিক · practice conversion, official scaled score নয়</p></section>`;byId('scoreGrid').innerHTML=Object.values(result.groups).map(g=>`<div class="score-card"><span>${g.label}</span><strong>${bn(g.score)} / ${bn(g.max)}</strong><small>JLPT পাসসীমা ${bn(g.min)}</small></div>`).join('')+`<div class="score-card"><span>মোট ফলাফল</span><strong>${bn(result.score)} / ১৮০</strong><small>JLPT মোট পাসসীমা ${bn(cfg.pass)}</small></div>`;byId('retryLink').textContent='একই সেট আবার দিন';byId('retryLink').href=`jlpt-exam.html?level=${level}&test=${test}`;byId('certificateBtn').onclick=()=>window.AponarMockCertificate.show(result,(name,certificateId)=>{
  result.certificateName=name;result.certificateId=certificateId;
  const results=getResults();results[level+'-'+test]=result;saveResults(results);
});renderReview(answers);jumpTo(0)}function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function renderReview(answers){
  let html='';
  sections.forEach(section=>prepared[section.id].forEach((qu,i)=>{
    const selected=answers[qu.displayId],correct=selected===qu.answer;
    html+=`<article class="review-item ${correct?'correct':'wrong'}" data-review="${correct?'correct':'wrong'}">
      <div class="review-top"><span>${section.title} · প্রশ্ন ${bn(i+1)}</span><span class="${correct?'ok':'bad'}">${correct?'✓ সঠিক':selected===undefined?'— উত্তর দেননি':'✕ ভুল'}</span></div>
      <div class="review-question">${qu.prompt}</div>
      <div class="answer-line"><span>আপনার উত্তর</span><div>${selected===undefined?'উত্তর দেওয়া হয়নি':qu.options[selected]}</div></div>
      <div class="answer-line"><span>সঠিক উত্তর</span><div>${qu.options[qu.answer]}</div></div>
      <div class="meaning-line"><strong>বাংলা অর্থ:</strong> ${escapeHTML(qu.answerBn)}</div>
      <div class="explanation"><strong>কেন এই উত্তর সঠিক:</strong><p>${escapeHTML(qu.explanationBn)}</p></div>
      ${qu.passage&&qu.kind!=='文の組み立て'?`<details class="transcript"><summary>মূল পাঠ আবার দেখুন</summary>${qu.passage}</details>`:''}
      ${qu.audioUrl?`<audio class="review-audio" controls preload="none" src="${escapeHTML(qu.audioUrl)}" aria-label="রিভিউয়ের অডিও শুনুন"></audio>`:''}
      ${qu.audioCredit?`<p class="audio-credit">${escapeHTML(qu.audioCredit)}</p>`:''}${qu.audioText?`<details class="transcript"><summary>লিসেনিংয়ের জাপানি ট্রান্সক্রিপ্ট</summary><pre>${escapeHTML(qu.audioText)}</pre></details>`:''}
      <a class="source-link" href="${escapeHTML(qu.sourceUrl)}" target="_blank" rel="noopener noreferrer">প্রশ্নের উৎস: ${qu.provenance==='aponar-original'?'আপনার নিহোন · নিজস্ব প্রশ্ন':'JapaneseTest4You'} · ${bn(qu.sourceQuestion)} ↗</a>
      ${qu.transcriptSource?`<a class="source-link" href="${escapeHTML(qu.transcriptSource)}" target="_blank" rel="noopener noreferrer">মূল ট্রান্সক্রিপ্ট ↗</a>`:''}
    </article>`;
  }));
  byId('reviewList').innerHTML=html;
}
function filterReview(f){document.querySelectorAll('[data-review]').forEach(x=>x.classList.toggle('hidden',f!=='all'&&x.dataset.review!==f));document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===f))}
function stopSpeech(){audioEpoch++;if(recordedAudio){recordedAudio.pause();recordedAudio.onended=null;recordedAudio.onerror=null;recordedAudio=null}}
function soundCheck(){
  stopSpeech();const first=prepared.listening[0];if(!first)return;
  const audio=new Audio(first.audioUrl);recordedAudio=audio;
  byId('soundStatus').textContent='রেকর্ড করা অডিও চলছে…';
  audio.onerror=()=>{byId('soundStatus').textContent='অডিও লোড হয়নি—নেটওয়ার্ক পরীক্ষা করে আবার চালান'};
  audio.play().then(()=>{setTimeout(()=>{if(recordedAudio===audio){stopSpeech();byId('soundStatus').textContent='✓ রেকর্ড করা অডিও শোনা যাচ্ছে'}},3500)}).catch(()=>{byId('soundStatus').textContent='অডিও লোড হয়নি—আবার Sound Check চাপুন'});
}
function playQuestionAudio(id){
  const qu=questionIndex.get(id);if(!qu||!state||state.sectionIndex!==2||state.awaitingNext||state.finished)return;
  const full=state.mode==='full';
  if(full&&(state.audioDone.includes(id)||prepared.listening.find(q=>!state.audioDone.includes(q.displayId))?.displayId!==id))return;
  goQuestion(prepared.listening.indexOf(qu),false);stopSpeech();const epoch=audioEpoch,audio=new Audio(qu.audioUrl);recordedAudio=audio;
  const button=document.querySelector(`[data-audio="${id}"]`),status=document.querySelector(`[data-audio-status="${id}"]`);
  if(button){button.textContent='…';button.disabled=true}
  if(status)status.textContent='রেকর্ড করা অডিও লোড হচ্ছে…';
  const restore=()=>{if(epoch!==audioEpoch)return;if(button){button.textContent='▶';button.disabled=false}if(status)status.textContent='অডিও চালানো যায়নি—এখান থেকে আবার চেষ্টা করুন'};
  audio.onloadedmetadata=()=>{const pos=full?Number(state.audioProgress[id])||0:0;if(pos>0&&pos<audio.duration)audio.currentTime=pos};
  audio.onplaying=()=>{if(epoch!==audioEpoch)return;state.audioPlays[id]=(state.audioPlays[id]||0)+1;saveState();if(status)status.textContent='অডিও চলছে…'};
  audio.ontimeupdate=()=>{if(epoch!==audioEpoch)return;const t=Math.floor(audio.currentTime);if(state.audioProgress[id]!==t){state.audioProgress[id]=t;saveState()}};
  audio.onerror=restore;
  audio.onended=()=>{
    if(epoch!==audioEpoch)return;
    if(!state.audioDone.includes(id))state.audioDone.push(id);state.audioProgress[id]=0;saveState();
    if(button){button.textContent=full?'✓':'▶';button.disabled=full}if(status)status.textContent=full?'শোনা হয়েছে':'শোনা হয়েছে · আবার শুনতে পারেন';updateProgress();
    if(full){const next=prepared.listening.find(q=>!state.audioDone.includes(q.displayId));if(next){const b=document.querySelector(`[data-audio="${next.displayId}"]`);if(b)b.disabled=false;setTimeout(()=>{if(epoch===audioEpoch)playQuestionAudio(next.displayId)},1500)}}
  };
  audio.play().catch(restore);
}
function showToast(msg){clearTimeout(toastTick);byId('toast').textContent=msg;byId('toast').classList.add('show');toastTick=setTimeout(()=>byId('toast').classList.remove('show'),2200)}
byId('previousQuestion').addEventListener('click',()=>goQuestion(currentPosition()-1));byId('nextQuestion').addEventListener('click',()=>goQuestion(currentPosition()+1));byId('layoutToggle').addEventListener('click',()=>{if(!state||state.finished||state.awaitingNext)return;state.layout=state.layout==='all'?'single':'all';saveState();applyQuestionLayout()});
byId('startBtn').addEventListener('click',()=>{if(bankReady)startNew();else boot()});byId('resumeBtn').addEventListener('click',resume);byId('restartBtn').addEventListener('click',restart);byId('soundCheckBtn').addEventListener('click',soundCheck);byId('submitPartBtn').addEventListener('click',()=>submitPart(false));byId('unansweredJump').addEventListener('click',jumpToUnanswered);byId('nextPartBtn').addEventListener('click',continueAfterPart);byId('reviewFilter').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b)filterReview(b.dataset.filter)});byId('exitLink').addEventListener('click',async e=>{if(state&&!state.finished){e.preventDefault();if(await window.AponarI18nContent.confirm('অগ্রগতি অটো-সেভ হয়েছে। এখন টেস্ট থেকে বের হবেন?'))location.href=byId('exitLink').href}});let saveTick=null;addEventListener('scroll',()=>{if(!state||state.finished||state.awaitingNext)return;clearTimeout(saveTick);saveTick=setTimeout(()=>{state.scrollY=scrollY;saveState()},180)},{passive:true});addEventListener('beforeunload',()=>{if(state&&!state.finished){state.scrollY=scrollY;saveState()}stopSpeech()});
async function boot(){
  byId('startBtn').disabled=true;byId('startBtn').textContent='প্রশ্ন ও answer key লোড হচ্ছে…';
  try{await window.JLPT_LOAD_BANK(level);prepare();setupIntro();bankReady=true;byId('startBtn').disabled=false;byId('startBtn').textContent=window.AponarMockBankVersion.compatible(level,test,getResults()[`${level}-${test}`]?.bankVersion)?'একই সেট আবার দিন →':'পরীক্ষা শুরু করুন →'}
  catch(error){console.error(error);bankReady=false;byId('introTitle').textContent='প্রশ্ন লোড করা যায়নি';byId('sourceText').textContent=error.message;byId('startBtn').disabled=false;byId('startBtn').textContent='আবার লোড করুন →';if(error.code==='NO_NEW_SET'){byId('startBtn').disabled=true;byId('startBtn').textContent='নতুন আলাদা প্রশ্ন প্রয়োজন';byId('introTitle').textContent='সেটটি এখনও প্রস্তুত নয়';byId('introBack').href=listPage}}
}
boot();
})();
