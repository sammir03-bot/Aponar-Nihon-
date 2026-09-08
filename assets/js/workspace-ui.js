/* Progressive enhancement: original content and account logic remain usable. */
(()=>{
 'use strict';
 const q=(selector,root=document)=>root.querySelector(selector);
 const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
 const node=(tag,cls,html='')=>{const el=document.createElement(tag);el.className=cls;el.innerHTML=html;return el;};
 const isBangla=()=>!document.documentElement.lang||document.documentElement.lang==='bn';
 const text=(bn,en)=>isBangla()?bn:en;
 const launch=(href,icon,title,description)=>`<a class="ui-launch" href="${href}"><span class="ui-launch-icon" aria-hidden="true">${icon}</span><span><strong>${title}</strong><small>${description}</small></span></a>`;

 function cv(){
  const form=q('.form-panel'),wizard=q('.wizard');if(!form||!wizard)return;
  const help=node('div','ui-step-help');help.id='cvStepHelp';help.setAttribute('role','status');
  q('.panel-head',form).after(help);
  const progress=node('div','ui-progress','<span></span>');progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','CV steps');progress.setAttribute('aria-valuemin','1');progress.setAttribute('aria-valuemax','5');wizard.after(progress);
  const guidance=[
   ['প্রথমে কাজের ধরন বেছে নিন','বাইতো বা দোকানের কাজের জন্য Part-time Job বেছে নিন। এরপর “পরের ধাপ” চাপুন।','Choose your job type','For a part-time role, select Part-time Job, then continue.'],
   ['আপনার পরিচয় লিখুন','বাংলা ব্যাখ্যা দেখে তথ্য লিখুন। CV-তে যা দেখাতে চান, সেটি জাপানি বা উপযুক্ত ইংরেজিতে লিখুন।','Add your details','Use the explanations to fill in your details in Japanese or suitable English.'],
   ['পড়াশোনা ও কাজের ইতিহাস','পুরোনো থেকে নতুন তারিখ অনুযায়ী লিখুন। প্রয়োজনমতো নতুন সারি যোগ করুন; অভিজ্ঞতা না থাকলে কাজের ইতিহাস ফাঁকা রাখতে পারেন।','Add education and experience','Use chronological order. Add rows as needed; leave work experience empty if you have none.'],
   ['আপনার আবেদন সাজান','নমুনা বাটন থেকে লেখা নিতে পারেন। জমা দেওয়ার আগে নিজের অভিজ্ঞতা ও কাজের সঙ্গে মিলিয়ে সম্পাদনা করুন।','Prepare your application','You can use a sample, then edit it to match your own experience and the role.'],
   ['শেষবার দেখে PDF করুন','নিচের তালিকা ধরে তথ্য মিলিয়ে নিন। ফাঁকা তথ্যের বাটন চাপলে সেই ঘরে যেতে পারবেন।','Review before printing','Check the details below. Select an incomplete item to return to its field.']
  ];
  function updateStep(){
   const active=q('.wiz.active');const index=Number(active?.dataset.step||0);const g=guidance[index];
   help.replaceChildren(node('b','',text(g[0],g[2])),document.createTextNode(text(g[1],g[3])));
   progress.firstElementChild.style.width=`${(index+1)*20}%`;progress.setAttribute('aria-valuenow',String(index+1));progress.setAttribute('aria-valuetext',`${index+1} / 5`);
   all('.wiz').forEach((b,i)=>{b.setAttribute('aria-current',i===index?'step':'false');});
   all('.template').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('active'))));
  }
  new MutationObserver(updateStep).observe(wizard,{subtree:true,attributes:true,attributeFilter:['class']});
  q('.template-grid').addEventListener('click',()=>queueMicrotask(updateStep));
  // Associate the explanatory labels with their existing controls.
  function labelFields(){all('.field').forEach(f=>{const input=q('input:not([type=hidden]),select,textarea',f),label=q('label',f);if(input?.id&&label)label.htmlFor=input.id;});all('[data-rtype]').forEach(input=>{input.setAttribute('aria-label',`${input.dataset.rtype} ${Number(input.dataset.i)+1} ${input.dataset.k}`);});all('.remove').forEach(b=>b.setAttribute('aria-label',text('এই সারি মুছুন','Remove this row')));}
  labelFields();all('.rows').forEach(rows=>new MutationObserver(labelFields).observe(rows,{childList:true}));
  const review=node('section','ui-review');review.id='cvReview';review.innerHTML=`<h3>${text('প্রিন্টের আগে মিলিয়ে নিন','Pre-print checklist')}</h3><p>${text('এটি তথ্য পূরণের তালিকা; বানান ও সঠিকতা নিজে যাচাই করুন।','This checks for filled fields; review spelling and accuracy yourself.')}</p><ul class="ui-checklist"></ul>`;
  q('[data-form="4"] .note').after(review);
  const checks=[['name','পুরো নাম','Full name'],['furigana','নামের কাতাকানা','Name in katakana'],['dob','জন্মতারিখ','Date of birth'],['phone','ফোন নম্বর','Phone'],['address','বর্তমান ঠিকানা','Address'],['motive','আবেদনের কারণ','Motivation']];
  function updateReview(){const list=q('ul',review);list.replaceChildren();checks.forEach(([id,bn,en])=>{const filled=!!q('#'+id)?.value.trim();const li=node('li','');const b=node('button',filled?'done':'');b.type='button';b.textContent=`${filled?'✓':'○'} ${text(bn,en)} — ${filled?text('লেখা হয়েছে','Filled'):text('এখনও ফাঁকা','Empty')}`;b.addEventListener('click',()=>{q(`.wiz[data-step="${id==='motive'?3:1}"]`).click();q('#'+id).focus({preventScroll:true});q('#'+id).scrollIntoView({block:'center',behavior:'smooth'});});li.append(b);list.append(li);});}
  form.addEventListener('input',updateReview);form.addEventListener('click',()=>queueMicrotask(updateReview));updateReview();updateStep();
 }

 function student(){
  const main=q('main.page'),settings=q('.content-grid');if(!main||!settings)return;
  const learning=node('section','ui-learning');learning.id='studentLearning';
  learning.innerHTML=`<div class="ui-panel"><h2 class="ui-section-title">${text('আজ কী শিখবেন?','What will you learn today?')}</h2><p class="ui-caption">${text('পাঠ, অনুশীলন ও প্রয়োজনীয় টুল—এক জায়গায়।','Lessons, practice and useful tools in one place.')}</p><div class="ui-launch-grid">${launch('/n5.html','文',text('জাপানি কোর্স','Japanese courses'),text('N5, N4 বা N3 থেকে শুরু করুন','Start with N5, N4 or N3'))}${launch('/quiz.html','✓',text('কুইজ অনুশীলন','Quiz practice'),text('নিজের শেখা যাচাই করুন','Check what you have learned'))}${launch('/tutor-section.html','AI','AI Tutor',text('জাপানি নিয়ে প্রশ্ন করুন','Ask a Japanese question'))}${launch('/daily-news.html','読',text('দৈনিক নিউজ','Daily news'),text('ফুরিগানাসহ পড়ার চর্চা','Reading practice with furigana'))}${launch('/cv-builder.html','CV',text('আমার CV তৈরি','Build my CV'),text('বাংলায় বুঝে জাপানি CV','Japanese CV with Bangla guidance'))}${launch('/jobs-in-japan.html','↗',text('জাপানে কাজ','Jobs in Japan'),text('কাজ খোঁজা ও আবেদন শেখা','Find work and learn to apply'))}</div><nav class="ui-jump" aria-label="JLPT courses"><a href="/n5.html">JLPT N5</a><a href="/n4.html">JLPT N4</a><a href="/n3.html">JLPT N3</a></nav></div><div class="ui-learning-grid"></div>`;
  const grid=q('.ui-learning-grid',learning);
  for(const id of ['events','activity']){const card=q('#'+id)?.closest('.side-card');if(card)grid.append(card);}
  settings.id='studentSettings';settings.before(learning);
  const tabs=node('div','ui-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',text('শিক্ষার্থীর ড্যাশবোর্ড','Student dashboard'));
  [[learning,text('আমার শেখা','My learning')],[settings,text('প্রোফাইল ও সেটিংস','Profile & settings')]].forEach(([panel,label],i)=>{
   const b=node('button','');b.type='button';b.id=`studentTab${i}`;b.textContent=label;b.setAttribute('role','tab');b.setAttribute('aria-controls',panel.id);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',b.id);tabs.append(b);
   b.addEventListener('click',()=>activate(i));
  });
  function activate(index){[learning,settings].forEach((p,i)=>{p.hidden=i!==index;const b=tabs.children[i];b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});}
  tabs.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=e.key==='Home'?0:e.key==='End'?1:tabs.children[0].getAttribute('aria-selected')==='true'?1:0;activate(i);tabs.children[i].focus();});
  learning.before(tabs);activate(location.hash==='#studentSettings'?1:0);
 }

 function admin(){
  const rows=q('#studentRows');if(!rows)return;
  q('#searchInput').setAttribute('aria-label','Search students');q('#levelFilter').setAttribute('aria-label','JLPT level');q('#activityFilter').setAttribute('aria-label','Activity period');
  const tools=node('div','ui-admin-tools');tools.innerHTML=`<label>${text('সাজান','Sort')} <select id="studentSort" class="control"><option value="default">${text('নতুন অ্যাকাউন্ট আগে','Newest accounts')}</option><option value="name">${text('নাম অনুযায়ী','Name A–Z')}</option></select></label><button type="button" class="ui-button" id="resetStudentFilters">${text('ফিল্টার রিসেট','Reset filters')}</button>`;
  q('.filters').after(tools);
  function decorate(){const labels=['','','JLPT','Activity','Last active',''];all('.tr',rows).forEach(row=>{[...row.children].forEach((cell,i)=>{if(labels[i])cell.dataset.label=labels[i];});});}
  function sortRows(){if(q('#studentSort').value!=='name')return;const sorted=all('.tr',rows).sort((a,b)=>(q('.student-copy b',a)?.textContent||'').localeCompare(q('.student-copy b',b)?.textContent||''));sorted.forEach(row=>rows.append(row));}
  const observer=new MutationObserver(()=>{observer.disconnect();decorate();sortRows();observer.observe(rows,{childList:true});});observer.observe(rows,{childList:true});decorate();
  q('#studentSort').addEventListener('change',()=>{q('#searchInput').dispatchEvent(new Event('input',{bubbles:true}));});
  q('#resetStudentFilters').addEventListener('click',()=>{for(const id of ['searchInput','levelFilter','activityFilter'])q('#'+id).value='';q('#studentSort').value='default';q('#searchInput').dispatchEvent(new Event('input',{bubbles:true}));q('#searchInput').focus();});
  const drawer=q('#studentDrawer');drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','true');drawer.setAttribute('aria-hidden','true');drawer.inert=true;let previousFocus;
  new MutationObserver(()=>{const open=drawer.classList.contains('show');drawer.inert=!open;drawer.setAttribute('aria-hidden',String(!open));q('main').inert=open;q('header').inert=open;if(open){previousFocus=document.activeElement;q('#drawerClose').focus();}else if(previousFocus?.isConnected){previousFocus.focus();}}).observe(drawer,{attributes:true,attributeFilter:['class']});
  drawer.addEventListener('keydown',e=>{if(e.key==='Escape'){q('#drawerClose').click();}if(e.key==='Tab'){const focusable=all('a[href],button,input,select,textarea,[tabindex="0"]',drawer).filter(el=>!el.disabled&&!el.hidden);if(focusable.length===1){e.preventDefault();focusable[0].focus();}else if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0].focus();}}});
  q('#toast').setAttribute('role','status');q('#resultCount').setAttribute('aria-live','polite');
 }

 function jobs(){
  const main=q('.jobs-main');if(!main)return;
  const nav=node('nav','ui-jump');nav.setAttribute('aria-label',text('কাজের গাইড','Job guide'));nav.innerHTML=`<a href="#find">${text('কাজ খুঁজুন','Find work')}</a><a href="#apply-guide">${text('আবেদনের নিয়ম','How to apply')}</a><a href="/cv-builder.html">${text('CV তৈরি','Build a CV')}</a><a href="/interview.html">${text('ইন্টারভিউ প্রস্তুতি','Interview preparation')}</a>`;q('.hero',main).after(nav);
  function directory(){const host=q('#an-employer-sites');if(!host||q('#employerFilters'))return false;
   const cards=all('.an-brand-card',host);const groups=all('.an-brand-groups>div',host);
   const filter=node('div','ui-filter');filter.id='employerFilters';filter.setAttribute('role','group');filter.setAttribute('aria-label',text('কাজের ধরন','Job category'));
   const categories=[['all','সব প্রতিষ্ঠান','All employers'],['0','কনভিনিয়েন্স স্টোর','Convenience stores'],['1','রেস্টুরেন্ট','Restaurants']];
   categories.forEach(([value,bn,en])=>{const b=node('button','ui-button');b.type='button';b.dataset.category=value;b.textContent=text(bn,en);b.setAttribute('aria-pressed',String(value==='all'));b.addEventListener('click',()=>{all('button',filter).forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)));groups.forEach((g,i)=>g.hidden=value!=='all'&&String(i)!==value);});filter.append(b);});
   q('.an-jobs-head',host).after(filter);const link=node('a','');link.href='#an-employer-sites';link.textContent=text('কোম্পানির সাইট','Employer sites');nav.insertBefore(link,nav.children[1]);return cards.length>0;
  }
  if(!directory()){const observer=new MutationObserver(()=>{if(directory())observer.disconnect();});observer.observe(main,{childList:true,subtree:true});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});}
 }
 function report(){const stats=q('.stats-row');if(!stats)return;const links=node('nav','ui-launch-grid');links.setAttribute('aria-label','Student tools');links.innerHTML=launch('/profile.html','学',text('আমার শেখার ড্যাশবোর্ড','My learning dashboard'),text('নিজের অগ্রগতি ও প্রোফাইল','Your activity and profile'))+launch('/quiz.html','✓',text('অনুশীলন শুরু','Start practising'),text('JLPT কুইজ ও প্রস্তুতি','JLPT quizzes and preparation'))+launch('/cv-builder.html','CV',text('CV তৈরি','Build a CV'),text('জাপানে কাজের প্রস্তুতি','Prepare for work in Japan'));stats.after(links);}
 const boot=()=>({cv,student,admin,jobs,report}[document.body.dataset.workspaceUi]?.());
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
