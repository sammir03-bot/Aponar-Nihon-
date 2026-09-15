(async () => {
 'use strict';
 let course;
 try {
  const response = await fetch('/assets/data/n3-quartet.json?v=20260914.1');
  if (!response.ok) throw new Error('Course data unavailable');
  course = await response.json();
  if (course.lessons?.length !== 55 || course.chapters?.length !== 6) throw new Error('Course data incomplete');
 } catch (error) {
  document.getElementById('load-message').textContent = 'পাঠগুলো খোলা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।';
  document.getElementById('load-retry').hidden = false;
  document.getElementById('load-retry').addEventListener('click', () => location.reload());
  console.error('QUARTET course:', error);
  return;
 }
 const byId=new Map(course.lessons.map(x=>[x.id,x]));
 const readSaved = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
 const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Studying still works without storage. */ } };
 const savedDone = readSaved('quartetN3DoneV1', []);
 const learned = new Set((Array.isArray(savedDone) ? savedDone : []).filter(id => byId.has(id)));
 const answers = new Map();
 const savedAnswers = readSaved('quartetN3AnswersV1', {});
 for (const item of course.lessons) {
  const answer = savedAnswers && savedAnswers[item.quiz.id];
  if (Number.isInteger(answer) && answer >= 0 && answer < item.quiz.options.length) answers.set(item.quiz.id, answer);
 }
 const saveAnswers = () => save('quartetN3AnswersV1', Object.fromEntries(answers));
 let current=course.lessons[0], tab='lesson';
 const root=document.getElementById('app'), panel=document.getElementById('panel');
 const chapterSelect=document.getElementById('chapter-select'), lessonSelect=document.getElementById('lesson-select');
 const nav=document.getElementById('lesson-list'), announce=document.getElementById('announce');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const token=/([\u3400-\u9fff々〆ヵヶ][\u3400-\u9fff々〆ヵヶぁ-んァ-ンー]*)\[([ぁ-んァ-ンー]+)\]/g;
 const plain=s=>String(s).replace(token,'$1');
 const readLabel=s=>String(s).replace(token,'$1（$2）');
 const ruby=s=>{let out='',last=0;for(const m of String(s).matchAll(token)){out+=esc(s.slice(last,m.index))+'<ruby lang="ja">'+esc(m[1])+'<rp>（</rp><rt>'+esc(m[2])+'</rt><rp>）</rp></ruby>';last=m.index+m[0].length;}return out+esc(s.slice(last));};
 const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[Number(d)]);
 const chapterItems=()=>course.lessons.filter(x=>x.chapter===current.chapter);
 const link=(id,mode='lesson')=>'#'+id+'/'+mode;
 const forms=i=>'<ul class="formula-list">'+i.forms.map(f=>'<li>'+ruby(f)+'</li>').join('')+'</ul>';
 function navigation(){
  document.getElementById('course-progress').value = learned.size;
  document.getElementById('progress-text').textContent = bn(learned.size) + ' / ৫৫টি শেখা';
  chapterSelect.value=String(current.chapter);
  const list=chapterItems();
  lessonSelect.innerHTML=list.map(i=>'<option value="'+i.id+'">'+bn(i.order)+'. '+esc(readLabel(i.title))+'</option>').join('');
  lessonSelect.value=current.id;
  nav.innerHTML=list.map(i=>'<a class="lesson-link'+(i.id===current.id?' active':'')+'" href="'+link(i.id)+'"'+(i.id===current.id?' aria-current="page"':'')+'><span class="number">'+bn(i.order)+'.</span>'+ruby(i.title)+'</a>').join('');
  for(const b of root.querySelectorAll('[data-tab]')){const selected=b.dataset.tab===tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;}
  panel.setAttribute('aria-labelledby','tab-'+tab);
 }
 function renderLesson(){
  const i=current,idx=course.lessons.indexOf(i);
  panel.innerHTML='<div class="meta">অধ্যায় '+bn(i.chapter)+' · বিষয় '+bn(i.order)+' · বই পৃ. '+bn(i.book_page)+' / PDF পৃ. '+bn(i.uploaded_pdf_page)+'</div><h2 class="grammar-title">'+ruby(i.title)+'</h2><p class="meaning">'+ruby(i.meaning_bn)+'</p><p>'+ruby(i.explanation_bn)+'</p><div class="card"><h3>কোন Form লাগবে?</h3>'+forms(i)+'</div><div class="tip"><strong>মনে রাখুন</strong>'+ruby(i.tip_bn)+'</div><section aria-label="উদাহরণ"><h3>বাক্যে ব্যবহার</h3>'+i.examples.map((e,n)=>'<div class="example"><div class="example-label">উদাহরণ '+bn(n+1)+'</div><p class="jp" lang="ja">'+ruby(e.japanese)+'</p><p class="translation">'+ruby(e.bangla)+'</p></div>').join('')+'</section><div class="completion-row"><button class="btn" data-learned aria-pressed="'+learned.has(i.id)+'">'+(learned.has(i.id)?'✓ শেখা হয়েছে':'শেখা হয়েছে চিহ্ন দিন')+'</button></div><div class="nav-row"><button class="btn" data-prev'+(idx===0?' disabled':'')+'>আগের পাঠ</button><button class="btn primary" data-next'+(idx===course.lessons.length-1?' disabled':'')+'>পরের পাঠ</button></div>';
 }
 function quizCard(i){
  const q=i.quiz,attempt=answers.get(q.id),has=attempt!==undefined;
  const options=q.options.map((o,n)=>{let result='';if(has){if(n===q.answer_index)result='correct';else if(n===attempt)result='wrong';}return '<button class="option" data-q="'+q.id+'" data-option="'+n+'"'+(has?' disabled':'')+(result?' data-result="'+result+'"':'')+'><span class="answer-marker">'+bn(n+1)+'.</span>'+ruby(o)+'</button>';}).join('');
  const correct=has&&attempt===q.answer_index;
  const feedback=has?'<div class="feedback '+(correct?'correct':'wrong')+'"><strong>'+(correct?'সঠিক উত্তর':'এবার হয়নি। সঠিক উত্তর: '+bn(q.answer_index+1))+'</strong><p>'+ruby(q.explanation_bn)+'</p><a href="'+link(i.id)+'">নিয়মটি আবার পড়ুন</a></div>':'';
  return '<article class="quiz-item" id="card-'+q.id+'"><div class="meta">বিষয় '+bn(i.order)+'</div><h3>'+ruby(i.title)+'</h3><p class="quiz-prompt">'+ruby(q.prompt)+'</p><div class="answers">'+options+'</div>'+feedback+'</article>';
 }
 function renderQuiz(){
  panel.innerHTML='<div class="meta">অধ্যায় '+bn(current.chapter)+'</div><h2>নিজে চেষ্টা করুন</h2><p class="muted">উত্তর বেছে নিন। সঙ্গে সঙ্গে কারণ দেখতে পাবেন।</p><p class="quiz-summary" id="quiz-summary"></p><div id="quiz-cards">'+chapterItems().map(quizCard).join('')+'</div><button class="btn" data-retry>এই অধ্যায় আবার চেষ্টা করুন</button>';
  updateSummary();
 }
 function updateSummary(){
  const list=chapterItems(),done=list.filter(i=>answers.has(i.quiz.id)),correct=done.filter(i=>answers.get(i.quiz.id)===i.quiz.answer_index);
  const target=document.getElementById('quiz-summary');if(target)target.textContent='উত্তর দিয়েছেন '+bn(done.length)+' / '+bn(list.length)+' · সঠিক '+bn(correct.length);
 }
 function renderRevision(){
  panel.innerHTML='<div class="meta">অধ্যায় '+bn(current.chapter)+' · '+bn(chapterItems().length)+'টি বিষয়</div><h2>এক নজরে রিভিশন</h2>'+chapterItems().map(i=>'<article class="revision-row"><a class="revision-title" href="'+link(i.id)+'">'+bn(i.order)+'. '+ruby(i.title)+'</a><p class="revision-meaning">'+ruby(i.meaning_bn)+'</p>'+forms(i)+'<p class="tip">'+ruby(i.tip_bn)+'</p></article>').join('');
 }
 function route(){
  const [id,mode]=location.hash.slice(1).split('/');
  current=byId.get(id)||course.lessons[0];tab=['lesson','quiz','revision'].includes(mode)?mode:'lesson';
  save('quartetN3LastV1', {id: current.id, mode: tab});
  navigation();if(tab==='lesson')renderLesson();else if(tab==='quiz')renderQuiz();else renderRevision();
  document.title=plain(current.title)+' · QUARTET Ⅰ বাংলা';
  announce.textContent='অধ্যায় '+bn(current.chapter)+' · '+(tab==='lesson'?readLabel(current.title):tab==='quiz'?'অনুশীলন':'রিভিশন');
 }
 function go(id,mode=tab){const target=link(id,mode);if(location.hash===target)route();else location.hash=target;}
 chapterSelect.innerHTML=course.chapters.map(c=>'<option value="'+c.id+'">'+c.title_bn+' · '+bn(c.lesson_count)+'টি</option>').join('');
 document.getElementById('form-guide').innerHTML=course.form_guide.map(g=>'<div class="guide-row"><strong>'+esc(g.label)+'</strong><p>'+ruby(g.meaning_bn)+'</p><p class="jp">'+ruby(g.example)+'</p></div>').join('');
 chapterSelect.addEventListener('change',()=>go(course.lessons.find(i=>i.chapter===Number(chapterSelect.value)).id));
 lessonSelect.addEventListener('change',()=>go(lessonSelect.value,'lesson'));
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b||b.disabled)return;
  if(b.hasAttribute('data-learned')) {
   if (learned.has(current.id)) learned.delete(current.id); else learned.add(current.id);
   save('quartetN3DoneV1', [...learned]);
   navigation();
   b.setAttribute('aria-pressed', String(learned.has(current.id)));
   b.textContent = learned.has(current.id) ? '✓ শেখা হয়েছে' : 'শেখা হয়েছে চিহ্ন দিন';
   return;
  }
  if(b.dataset.tab){go(current.id,b.dataset.tab);return;}
  if(b.hasAttribute('data-prev')||b.hasAttribute('data-next')){const n=course.lessons.indexOf(current)+(b.hasAttribute('data-prev')?-1:1);if(course.lessons[n])go(course.lessons[n].id,'lesson');return;}
  if(b.hasAttribute('data-retry')){for(const i of chapterItems())answers.delete(i.quiz.id);saveAnswers();renderQuiz();document.querySelector('[data-retry]').focus();announce.textContent='এই অধ্যায়ের উত্তরগুলো মুছে দেওয়া হয়েছে। আবার চেষ্টা করুন।';return;}
  if(b.dataset.q){const i=chapterItems().find(x=>x.quiz.id===b.dataset.q);if(!i||answers.has(i.quiz.id))return;const choice=Number(b.dataset.option);answers.set(i.quiz.id,choice);saveAnswers();document.getElementById('card-'+i.quiz.id).outerHTML=quizCard(i);updateSummary();announce.textContent=(choice===i.quiz.answer_index?'সঠিক উত্তর। ':'সঠিক উত্তর '+bn(i.quiz.answer_index+1)+'। ')+readLabel(i.quiz.explanation_bn);}
 });
 root.querySelector('[role="tablist"]').addEventListener('keydown',ev=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;
  const tabs=Array.from(root.querySelectorAll('[data-tab]')),index=tabs.indexOf(document.activeElement);if(index<0)return;
  ev.preventDefault();const next=ev.key==='Home'?0:ev.key==='End'?tabs.length-1:(index+(ev.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();go(current.id,tabs[next].dataset.tab);
 });
 addEventListener('hashchange',route);
 const last = readSaved('quartetN3LastV1', null);
 if (!location.hash && last && byId.has(last.id)) {
  history.replaceState(null, '', link(last.id, ['lesson', 'quiz', 'revision'].includes(last.mode) ? last.mode : 'lesson'));
 }
 document.getElementById('loading').hidden = true;
 document.getElementById('study-workspace').hidden = false;
 route();
})();
