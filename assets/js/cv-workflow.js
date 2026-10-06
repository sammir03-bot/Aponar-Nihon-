/* Review, continuation sheets and readable mobile controls for the CV builder. */
(() => {
  'use strict';
  if (!document.getElementById('paperArea') || typeof state === 'undefined') return;
  const E = id => document.getElementById(id);
  const currentKind = () => document.querySelector('[data-preview].active')?.dataset.preview || 'rireki';
  const filled = v => String(v || '').trim();
  function disclosure(el,title) {
    if (!el) return;
    const details=document.createElement('details');details.className='cv-optional-fields';
    const summary=document.createElement('summary');summary.textContent=title;details.append(summary);
    el.before(details);details.append(el);
  }
  // The commonly used fields stay visible; old form details are still available.
  const postal=E('postal')?.closest('.field');if(postal)E('address').closest('.field').before(postal);
  const strengths=E('strengths')?.closest('.field');if(strengths)E('motive').closest('.field').after(strengths);
  disclosure(E('jisPersonalExtra'),'অন্য যোগাযোগ ও FAX · ঐচ্ছিক');
  disclosure(E('jisApplicationExtra'),'যাতায়াত, পরিবার ও অভিভাবক · ঐচ্ছিক');
  const careerTitle=[...document.querySelectorAll('[data-form="3"] > .div-title')].find(x=>x.textContent.includes('職務経歴書'));
  if(careerTitle) {
    const group=document.createElement('details');group.className='cv-optional-fields';group.id='cvCareerFields';
    group.innerHTML='<summary>職務経歴書 · কাজের অভিজ্ঞতার বিস্তারিত</summary>';
    careerTitle.before(group);let next=careerTitle;
    while(next && !next.classList.contains('cv-optional-fields')) {const following=next.nextElementSibling;group.append(next);next=following;}
  }
  document.querySelectorAll('.field').forEach(field=>{const input=field.querySelector('input,select,textarea'),label=field.querySelector('label');if(input?.id&&label)label.htmlFor=input.id;});
  E('created').max='';E('dob').max=tokyoToday();
  for(const id of ['commuteHour','commuteMin','dependents'])if(E(id)){E(id).min=0;E(id).step=1;}
  if(E('commuteMin'))E('commuteMin').max=59;
  E('cvZoom').onclick=()=>{const full=document.body.classList.toggle('cv-preview-full');E('cvZoom').setAttribute('aria-pressed',String(full));E('cvZoom').textContent=full?'পর্দায় ফিট করুন':'বড় করে দেখুন';fit();};

  const review=document.createElement('section');review.id='cvValidation';review.className='cv-validation';
  review.innerHTML='<h3>জমা দেওয়ার প্রস্তুতি</h3><p id="cvReviewSummary"></p><ul id="cvIssueList"></ul><p class="cv-review-note">ছবি, যোগ্যতা ও ঐচ্ছিক ঘর প্রয়োজনমতো পূরণ করুন। চূড়ান্ত CV-তে নিজের সঠিক তথ্যই ব্যবহার করুন।</p>';
  document.querySelector('[data-form="4"] .nav-actions').before(review);
  function issues(kind=currentKind()) {
    const out=[];const add=(id,text,step=1)=>out.push({id,text,step});
    if(!filled(state.name))add('name','পুরো নাম লিখুন।');
    if(!filled(state.address))add('address','বর্তমান ঠিকানা লিখুন।');
    if(!filled(state.phone)&&!filled(state.email))add('phone','যোগাযোগের ফোন বা ইমেইল দিন।');
    if(state.email&&!E('email').validity.valid)add('email','ইমেইলের বানান ও @ চিহ্ন মিলিয়ে নিন।');
    if(state.phone&&!/^[+\d\s()－ー-]{7,25}$/.test(state.phone))add('phone','ফোন নম্বরের অঙ্ক ও মাপ মিলিয়ে নিন।');
    if(state.dob&&(!validDate(state.dob)||state.dob>tokyoToday()))add('dob','সঠিক জন্মতারিখ বেছে নিন।');
    if(!validDate(state.created))add('created','CV-এর সঠিক তারিখ বেছে নিন।');
    for(const type of ['edu','work','qual'])state[type].forEach((row,index)=>{
      if(!filled(row.text)&&!row.year&&!row.month)return;
      if(!filled(row.text)||!/^\d{4}$/.test(row.year)||!/^\d{1,2}$/.test(row.month)||+row.month<1||+row.month>12)add(type+'Rows',`${{edu:'শিক্ষা',work:'কাজ',qual:'যোগ্যতা'}[type]}: ${index+1} নম্বর সারির সাল, মাস ও বিবরণ সম্পূর্ণ করুন।`,2);
    });
    for(const id of ['commuteHour','commuteMin','dependents'])if(state[id]&&(!/^\d+$/.test(state[id])||(id==='commuteMin'&&+state[id]>59)))add(id,'যাতায়াত/পরিবারের সংখ্যাটি ঠিক করুন।',3);
    if(kind==='career'&&!filled(state.summary))add('summary','職務経歴書-এর জন্য অভিজ্ঞতার সংক্ষিপ্ত বিবরণ লিখুন।',3);
    if(kind==='career'&&!filled(state.skills))add('skills','職務経歴書-এর জন্য কাজের দক্ষতা লিখুন।',3);
    return out;
  }
  function goToIssue(issue) {showStep(issue.step);const el=E(issue.id);let parent=el?.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}const control=el?.matches('input,textarea,select')?el:el?.querySelector('input,textarea,select');control?.focus({preventScroll:true});el?.scrollIntoView({block:'center',behavior:'smooth'});}
  function updateReview() {
    const list=E('cvIssueList'),items=issues();list.replaceChildren();
    E('cvReviewSummary').textContent=items.length?`${items.length}টি বিষয় ঠিক করে Preview মিলিয়ে নিন।`:'মূল তথ্য পূরণ হয়েছে। বানান, নমুনা লেখা ও ছবিটি শেষবার মিলিয়ে নিন।';
    for(const issue of items){const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=issue.text;button.onclick=()=>goToIssue(issue);li.append(button);list.append(li);}
    E('cvCareerFields').open=state.template==='career'||currentKind()==='career';
  }
  window.updateCVReview=updateReview;

  function allHistory() {
    const rows=[{text:'学歴'}];
    for(const row of state.edu.filter(x=>x.year||x.month||x.text))rows.push(row);
    rows.push({text:'職歴'});
    const work=state.work.filter(x=>x.year||x.month||x.text);rows.push(...work);
    if(work.length&&!/(退職|退社|契約終了)/.test(work.at(-1).text||''))rows.push({text:'現在に至る'});
    rows.push({text:'以上'});return rows;
  }
  let continuationSignature='';
  function continuations() {
    const history=allHistory(),qual=state.qual.filter(x=>x.year||x.month||x.text);
    const signature=JSON.stringify([history,qual,state.name,state.created]);
    if(signature!==continuationSignature) {
      continuationSignature=signature;document.querySelectorAll('.cv-continuation').forEach(p=>p.remove());
      const rows=[];
      if(history.length>15)rows.push({section:'学歴・職歴（続き）'},...history.slice(14));
      if(qual.length>5)rows.push({section:'免許・資格（続き）'},...qual.slice(5));
      for(let offset=0;offset<rows.length;offset+=22) {
        const page=document.createElement('div');page.className='page jis-page print-jis cv-continuation';
        page.innerHTML=`<div class="jis-header"><div class="jis-title">履歴書（別紙 ${offset/22+1}）</div><div class="jis-date">${esc(jpDate(state.created))}<br>${esc(state.name||'')}</div></div><table class="jis-table jis-history"><thead><tr><th class="jis-year">年</th><th class="jis-month">月</th><th>学歴・職歴 / 免許・資格（続き）</th></tr></thead><tbody>${rows.slice(offset,offset+22).map(r=>r.section?`<tr><td colspan="3" class="jis-section">${esc(r.section)}</td></tr>`:`<tr><td class="jis-year">${esc(r.year||'')}</td><td class="jis-month">${esc(r.month||'')}</td><td>${esc(r.text||'')}</td></tr>`).join('')}</tbody></table>`;
        E('careerDoc').before(page);
      }
    }
    const show=currentKind()==='rireki'&&state.outputFormat!=='a4-1';
    document.querySelectorAll('.cv-continuation').forEach(p=>p.style.display=show?'block':'none');
    const note=E('cvPreviewFormatNote');if(note&&state.outputFormat==='a4-2')note.textContent=`Preview: A4 · ${2+document.querySelectorAll('.cv-continuation').length} Pages · বেশি ইতিহাস হলে অতিরিক্ত পাতা যুক্ত হয়`;
  }
  const baseRender=render;render=function(){baseRender();continuations();updateReview();fit();};
  const basePreview=preview;preview=function(kind){basePreview(kind);continuations();updateReview();fit();};
  function contentOverflows(page) {
    const scale=page.getBoundingClientRect().width/page.offsetWidth;
    const bottom=page.getBoundingClientRect().top+page.clientHeight*scale-parseFloat(getComputedStyle(page).paddingBottom)*scale;
    return [...page.querySelectorAll('td,.jis-box-body,.cv-compact-box-body,.summary-box'),...page.children].some(el=>getComputedStyle(el).display!=='none'&&(el.getBoundingClientRect().bottom>bottom+2||el.scrollWidth>el.clientWidth+2));
  }
  const basePrint=printDoc;
  printDoc=async function(kind) {
    collect();preview(kind);const found=issues(kind);
    if(found.length){message('PDF করার আগে এই তথ্যটি ঠিক করুন: '+found[0].text,true);showStep(4);E('cvValidation').scrollIntoView({block:'center',behavior:'smooth'});return;}
    if(kind==='rireki'&&state.outputFormat==='a3-1'&&document.querySelectorAll('.cv-continuation').length){message('ইতিহাস/যোগ্যতা বেশি হওয়ায় অতিরিক্ত পাতা প্রয়োজন। A4 · 2 Pages বেছে নিন; অতিরিক্ত পাতাও PDF-তে থাকবে।',true);showStep(0);return;}
    if(kind==='rireki'&&state.outputFormat==='a4-1'&&(allHistory().length>10||state.qual.filter(x=>x.year||x.month||x.text).length>3||String(state.motive||'').length>260||String(state.selfpr||state.strengths||'').length>210||String(state.address||'').length>75)){message('এক পাতায় সব তথ্য নিরাপদভাবে ধরছে না। A4 · 2 Pages বেছে নিন অথবা লেখা ছোট করুন।',true);showStep(4);return;}
    await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,3500))]);
    const pages=kind==='career'?[E('careerDoc')]:state.outputFormat==='a4-1'?[E('cvCompactResume')]:[...document.querySelectorAll('.print-jis')];
    if(pages.some(contentOverflows)){message('কিছু লেখা পাতার বাইরে যাচ্ছে। দীর্ঘ বিবরণ ছোট করুন; ১ পৃষ্ঠা হলে A4 · 2 Pages বেছে নিন। তথ্য কেটে PDF তৈরি করা হবে না।',true);showStep(4);return;}
    document.title=kind==='career'?'職務経歴書 - Aponar Nihon':'履歴書 - Aponar Nihon';
    message('Print খুলছে। Destination → Save as PDF, Scale → 100%, Headers/footers → বন্ধ রাখুন।');basePrint(kind);
  };
  document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>preview(b.dataset.preview));
  E('printRireki').onclick=()=>printDoc('rireki');E('printCareer').onclick=()=>printDoc('career');E('mobilePrint').onclick=()=>{showStep(4);printDoc(currentKind());};
  document.querySelector('.form-panel').addEventListener('input',updateReview);
  window.addEventListener('afterprint',()=>{document.querySelectorAll('.print-me').forEach(p=>p.classList.remove('print-me'));document.title='Japan CV Builder | Aponar Nihon';preview(currentKind());});
  render();preview('rireki');
})();
