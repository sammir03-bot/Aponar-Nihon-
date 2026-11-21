(async () => {
 'use strict';
 const dynT=(k,v)=>{if(window.AponarDyn)return window.AponarDyn(k,v);let s=dynT._b[k]||k;if(v)for(const x in v)s=s.split("{"+x+"}").join(v[x]);return s};dynT._b={"qt.loadFail": "পাঠগুলো খোলা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।", "qt.chapterPrefix": "অধ্যায় ", "qt.grammarFound": "{n}টি গ্রামার পাওয়া গেছে", "qt.searchNotFound": "পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।", "qt.progressOf": "{a} / {b}টি শেখা", "qt.bookPageSep": " · বই পৃ. ", "qt.pdfPageSep": " / PDF পৃ. ", "qt.selectedHelper": " · নির্বাচিত সহায়ক গ্রামার", "qt.topicSep": " · বিষয় ", "qt.whichForm": "কোন Form লাগবে?", "qt.remember": "মনে রাখুন", "qt.example": "উদাহরণ", "qt.usage": "বাক্যে ব্যবহার", "qt.learnedBtn": "✓ শেখা হয়েছে", "qt.markLearned": "শেখা হয়েছে চিহ্ন দিন", "qt.prevLesson": "আগের পাঠ", "qt.nextLesson": "পরের পাঠ", "qt.correctAnswerLabel": "সঠিক উত্তর", "qt.notThisTime": "এবার হয়নি। সঠিক উত্তর: ", "qt.rereadRule": "নিয়মটি আবার পড়ুন", "qt.topicPrefix": "বিষয় ", "qt.tryYourself": "নিজে চেষ্টা করুন", "qt.tryYourselfCopy": "উত্তর বেছে নিন। সঙ্গে সঙ্গে কারণ দেখতে পাবেন।", "qt.retryChapter": "এই অধ্যায় আবার চেষ্টা করুন", "qt.quizSummary": "উত্তর দিয়েছেন {a} / {t} · সঠিক {c}", "qt.topicsCount": "{n}টি বিষয়", "qt.revision": "এক নজরে রিভিশন", "qt.titleSuffix": " বাংলা", "qt.practice": "অনুশীলন", "qt.revisionTab": "রিভিশন", "qt.countSuffix": "টি", "qt.resetDone": "এই অধ্যায়ের উত্তরগুলো মুছে দেওয়া হয়েছে। আবার চেষ্টা করুন।", "qt.correctBangla": "সঠিক উত্তর। ", "qt.correctBanglaN": "সঠিক উত্তর {n}। "};const dynLang=()=>window.AponarDynLang?window.AponarDynLang():'bn';
 const secondVolume = document.body.dataset.quartetVolume === '2';
 const storagePrefix = secondVolume ? 'quartetN2' : 'quartetN3';
 const volumeName = secondVolume ? 'Ⅱ' : 'Ⅰ';
 const expectedTotal = secondVolume ? 36 : 55;
 let course, deep, makeMasterclass;
 try {
  const response = await fetch('/assets/data/' + (secondVolume ? 'n2' : 'n3') + '-quartet.json?v=20261020.1');
  if (!response.ok) throw new Error('Course data unavailable');
  course = await response.json();
  if (course.lessons?.length !== expectedTotal || course.chapters?.length !== 6) throw new Error('Course data incomplete');
  if (!secondVolume && document.body.classList.contains('quartet-masterclass')) {
   const expanded = await fetch('/assets/data/n3-quartet-deep.json?v=20261020.2');
   if (!expanded.ok) throw new Error('Expanded course data unavailable');
   deep = await expanded.json();
   if (Object.keys(deep.lessons || {}).length !== 55 || !course.lessons.every(item => deep.lessons[item.id]?.extra_examples?.length === 8)) throw new Error('Expanded course data incomplete');
   makeMasterclass = (await import('/assets/js/quartet-one-reader.js?v=20261020.2')).createMasterclass;
  }
 } catch (error) {
  document.getElementById('load-message').textContent = dynT('qt.loadFail');
  document.getElementById('load-retry').hidden = false;
  document.getElementById('load-retry').addEventListener('click', () => location.reload());
  console.error('QUARTET course:', error);
  return;
 }
 const byId=new Map(course.lessons.map(x=>[x.id,x]));
 const readSaved = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
 const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Studying still works without storage. */ } };
 const savedDone = readSaved(storagePrefix + 'DoneV1', []);
 const learned = new Set((Array.isArray(savedDone) ? savedDone : []).filter(id => byId.has(id)));
 const answers = new Map();
 const savedAnswers = readSaved(storagePrefix + 'AnswersV1', {});
 for (const item of course.lessons) {
  const answer = savedAnswers && savedAnswers[item.quiz.id];
  if (Number.isInteger(answer) && answer >= 0 && answer < item.quiz.options.length) answers.set(item.quiz.id, answer);
 }
 const saveAnswers = () => save(storagePrefix + 'AnswersV1', Object.fromEntries(answers));
 let current=course.lessons[0], tab='lesson';
 const root=document.getElementById('app'), panel=document.getElementById('panel');
 const chapterSelect=document.getElementById('chapter-select'), lessonSelect=document.getElementById('lesson-select');
 const nav=document.getElementById('lesson-list'), announce=document.getElementById('announce');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const token=/([\u3400-\u9fff々〆ヵヶ][\u3400-\u9fff々〆ヵヶぁ-んァ-ンー]*)\[([ぁ-んァ-ンー]+)\]/g;
 const plain=s=>String(s).replace(token,'$1');
 const readLabel=s=>String(s).replace(token,'$1（$2）');
 const ruby=s=>{let out='',last=0;for(const m of String(s).matchAll(token)){out+=esc(s.slice(last,m.index))+'<ruby lang="ja">'+esc(m[1])+'<rp>（</rp><rt>'+esc(m[2])+'</rt><rp>）</rp></ruby>';last=m.index+m[0].length;}return out+esc(s.slice(last));};
 const bn=n=>dynLang()==='bn'?String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[Number(d)]):String(n);
 const chapterItems=()=>course.lessons.filter(x=>x.chapter===current.chapter);
 const searchInput = document.getElementById('grammar-search');
 const searchStatus = document.getElementById('grammar-search-status');
 const normalize = value => plain(value).toLocaleLowerCase().replace(/\s+/g, ' ').trim();
 function renderLessonList(){
  const query = normalize(searchInput?.value || '');
  const list = query ? course.lessons.filter(i => normalize([i.title,i.meaning_bn,i.explanation_bn,i.chapter,dynT('qt.chapterPrefix')+bn(i.chapter)].join(' ')).includes(query)) : chapterItems();
  nav.classList.toggle('is-searching', Boolean(query));
  nav.innerHTML=list.map(i=>'<a class="lesson-link'+(i.id===current.id?' active':'')+'" data-done="'+learned.has(i.id)+'" href="'+link(i.id)+'"'+(i.id===current.id?' aria-current="page"':'')+'><span class="number">'+bn(i.order)+'.</span>'+ruby(i.title)+(query?'<span class="lesson-search-result">'+dynT('qt.chapterPrefix')+bn(i.chapter)+' · '+esc(i.meaning_bn)+'</span>':'')+'</a>').join('');
  if(searchStatus) searchStatus.textContent = query ? (list.length ? dynT('qt.grammarFound',{n:bn(list.length)}) : dynT('qt.searchNotFound')) : '';
 }
 searchInput?.addEventListener('input', renderLessonList);
 const link=(id,mode='lesson')=>'#'+id+'/'+mode;
 const forms=i=>'<ul class="formula-list">'+i.forms.map(f=>'<li>'+ruby(f)+'</li>').join('')+'</ul>';
 const masterclass = makeMasterclass?.({root, course, deep, ruby, esc, bn, plain, readSaved, save, dynT});
 function navigation(){
  document.getElementById('course-progress').value = learned.size;
  document.getElementById('progress-text').textContent = dynT('qt.progressOf',{a:bn(learned.size),b:bn(course.lessons.length)});
  chapterSelect.value=String(current.chapter);
  const list=chapterItems();
  lessonSelect.innerHTML=list.map(i=>'<option value="'+i.id+'">'+bn(i.order)+'. '+esc(readLabel(i.title))+'</option>').join('');
  lessonSelect.value=current.id;
  renderLessonList();
  for(const b of root.querySelectorAll('[data-tab]')){const selected=b.dataset.tab===tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;}
  panel.setAttribute('aria-labelledby','tab-'+tab);
 }
 function renderLesson(){
  const i=current,idx=course.lessons.indexOf(i);
  if (masterclass) { panel.innerHTML=masterclass.renderLesson(i,idx,learned); return; }
  const pageInfo = Number.isInteger(i.book_page) ? dynT('qt.bookPageSep')+bn(i.book_page)+(Number.isInteger(i.uploaded_pdf_page)?dynT('qt.pdfPageSep')+bn(i.uploaded_pdf_page):'') : dynT('qt.selectedHelper');
  panel.innerHTML='<div class="meta">'+dynT('qt.chapterPrefix')+bn(i.chapter)+dynT('qt.topicSep')+bn(i.order)+pageInfo+'</div><h2 class="grammar-title">'+ruby(i.title)+'</h2><p class="meaning">'+ruby(i.meaning_bn)+'</p><p>'+ruby(i.explanation_bn)+'</p><div class="card"><h3>'+dynT('qt.whichForm')+'</h3>'+forms(i)+'</div><div class="tip"><strong>'+dynT('qt.remember')+'</strong>'+ruby(i.tip_bn)+'</div><section aria-label="'+dynT('qt.example')+'"><h3>'+dynT('qt.usage')+'</h3>'+i.examples.map((e,n)=>'<div class="example"><div class="example-label">'+dynT('qt.example')+' '+bn(n+1)+'</div><p class="jp" lang="ja">'+ruby(e.japanese)+'</p><p class="translation">'+ruby(e.bangla)+'</p></div>').join('')+'</section><div class="completion-row"><button class="btn" data-learned aria-pressed="'+learned.has(i.id)+'">'+(learned.has(i.id)?dynT('qt.learnedBtn'):dynT('qt.markLearned'))+'</button></div><div class="nav-row"><button class="btn" data-prev'+(idx===0?' disabled':'')+'>'+dynT('qt.prevLesson')+'</button><button class="btn primary" data-next'+(idx===course.lessons.length-1?' disabled':'')+'>'+dynT('qt.nextLesson')+'</button></div>';
 }
 function quizCard(i){
  const q=i.quiz,attempt=answers.get(q.id),has=attempt!==undefined;
  const options=q.options.map((o,n)=>{let result='';if(has){if(n===q.answer_index)result='correct';else if(n===attempt)result='wrong';}return '<button class="option" data-q="'+q.id+'" data-option="'+n+'"'+(has?' disabled':'')+(result?' data-result="'+result+'"':'')+'><span class="answer-marker">'+bn(n+1)+'.</span>'+ruby(o)+'</button>';}).join('');
  const correct=has&&attempt===q.answer_index;
  const feedback=has?'<div class="feedback '+(correct?'correct':'wrong')+'"><strong>'+(correct?dynT('qt.correctAnswerLabel'):dynT('qt.notThisTime')+bn(q.answer_index+1))+'</strong><p>'+ruby(q.explanation_bn)+'</p><a href="'+link(i.id)+'">'+dynT('qt.rereadRule')+'</a></div>':'';
  return '<article class="quiz-item" id="card-'+q.id+'"><div class="meta">'+dynT('qt.topicPrefix')+bn(i.order)+'</div><h3>'+ruby(i.title)+'</h3><p class="quiz-prompt">'+ruby(q.prompt)+'</p><div class="answers">'+options+'</div>'+feedback+'</article>';
 }
 function renderQuiz(){
  panel.innerHTML='<div class="meta">'+dynT('qt.chapterPrefix')+bn(current.chapter)+'</div><h2>'+dynT('qt.tryYourself')+'</h2><p class="muted">'+dynT('qt.tryYourselfCopy')+'</p><p class="quiz-summary" id="quiz-summary"></p><div id="quiz-cards">'+chapterItems().map(quizCard).join('')+'</div><button class="btn" data-retry>'+dynT('qt.retryChapter')+'</button>';
  updateSummary();
 }
 function updateSummary(){
  const list=chapterItems(),done=list.filter(i=>answers.has(i.quiz.id)),correct=done.filter(i=>answers.get(i.quiz.id)===i.quiz.answer_index);
  const target=document.getElementById('quiz-summary');if(target)target.textContent=dynT('qt.quizSummary',{a:bn(done.length),t:bn(list.length),c:bn(correct.length)});
 }
 function renderRevision(){
  panel.innerHTML='<div class="meta">'+dynT('qt.chapterPrefix')+bn(current.chapter)+' · '+dynT('qt.topicsCount',{n:bn(chapterItems().length)})+'</div><h2>'+dynT('qt.revision')+'</h2>'+chapterItems().map(i=>'<article class="revision-row"><a class="revision-title" href="'+link(i.id)+'">'+bn(i.order)+'. '+ruby(i.title)+'</a><p class="revision-meaning">'+ruby(i.meaning_bn)+'</p>'+forms(i)+'<p class="tip">'+ruby(i.tip_bn)+'</p></article>').join('');
 }
 let hasRendered=false;
 function route(){
  const previousId=current.id, previousMode=tab;
  const [id,mode]=location.hash.slice(1).split('/');
  current=byId.get(id)||course.lessons[0];tab=['lesson','quiz','revision'].includes(mode)?mode:'lesson';
  save(storagePrefix + 'LastV1', {id: current.id, mode: tab});
  navigation();if(tab==='lesson')renderLesson();else if(tab==='quiz')renderQuiz();else renderRevision();
  document.title=plain(current.title)+' · QUARTET '+volumeName+dynT('qt.titleSuffix');
  announce.textContent=dynT('qt.chapterPrefix')+bn(current.chapter)+' · '+(tab==='lesson'?readLabel(current.title):tab==='quiz'?dynT('qt.practice'):dynT('qt.revisionTab'));
  masterclass?.afterRender(current, hasRendered && (previousId!==current.id || previousMode!==tab));
  hasRendered=true;
 }
 function go(id,mode=tab){const target=link(id,mode);if(location.hash===target)route();else location.hash=target;}
 chapterSelect.innerHTML=course.chapters.map(c=>'<option value="'+c.id+'">'+c.title_bn+' · '+bn(c.lesson_count)+dynT('qt.countSuffix')+'</option>').join('');
 document.getElementById('form-guide').innerHTML=course.form_guide.map(g=>'<div class="guide-row"><strong>'+esc(g.label)+'</strong><p>'+ruby(g.meaning_bn)+'</p><p class="jp">'+ruby(g.example)+'</p></div>').join('');
 chapterSelect.addEventListener('change',()=>go(course.lessons.find(i=>i.chapter===Number(chapterSelect.value)).id));
 lessonSelect.addEventListener('change',()=>go(lessonSelect.value,'lesson'));
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b||b.disabled)return;
  if(b.hasAttribute('data-learned')) {
   if (learned.has(current.id)) learned.delete(current.id); else learned.add(current.id);
   save(storagePrefix + 'DoneV1', [...learned]);
   navigation();
   b.setAttribute('aria-pressed', String(learned.has(current.id)));
   b.textContent = learned.has(current.id) ? dynT('qt.learnedBtn') : dynT('qt.markLearned');
   return;
  }
  if(b.dataset.tab){go(current.id,b.dataset.tab);return;}
  if(b.hasAttribute('data-prev')||b.hasAttribute('data-next')){const n=course.lessons.indexOf(current)+(b.hasAttribute('data-prev')?-1:1);if(course.lessons[n])go(course.lessons[n].id,'lesson');return;}
  if(b.hasAttribute('data-retry')){for(const i of chapterItems())answers.delete(i.quiz.id);saveAnswers();renderQuiz();document.querySelector('[data-retry]').focus();announce.textContent=dynT('qt.resetDone');return;}
  if(b.dataset.q){const i=chapterItems().find(x=>x.quiz.id===b.dataset.q);if(!i||answers.has(i.quiz.id))return;const choice=Number(b.dataset.option);answers.set(i.quiz.id,choice);saveAnswers();document.getElementById('card-'+i.quiz.id).outerHTML=quizCard(i);updateSummary();announce.textContent=(choice===i.quiz.answer_index?dynT('qt.correctBangla'):dynT('qt.correctBanglaN',{n:bn(i.quiz.answer_index+1)}))+readLabel(i.quiz.explanation_bn);}
 });
 root.querySelector('[role="tablist"]').addEventListener('keydown',ev=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;
  const tabs=Array.from(root.querySelectorAll('[data-tab]')),index=tabs.indexOf(document.activeElement);if(index<0)return;
  ev.preventDefault();const next=ev.key==='Home'?0:ev.key==='End'?tabs.length-1:(index+(ev.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();go(current.id,tabs[next].dataset.tab);
 });
 addEventListener('hashchange',route);
 const last = readSaved(storagePrefix + 'LastV1', null);
 if (!location.hash && last && byId.has(last.id)) {
  history.replaceState(null, '', link(last.id, ['lesson', 'quiz', 'revision'].includes(last.mode) ? last.mode : 'lesson'));
 }
 document.getElementById('loading').hidden = true;
 document.getElementById('study-workspace').hidden = false;
 route();
})();
