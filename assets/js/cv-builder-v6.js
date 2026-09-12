(()=>{
  'use strict';
  const E=id=>document.getElementById(id);
  if(!E('paperArea')||typeof state==='undefined') return;

  const DEFAULTS={
    motive:'学業と両立しながら、日本語力と接客力をさらに高めたいと考え、応募いたしました。責任を持って勤務し、時間を守り、周囲と協力しながら一つずつ仕事を覚えて、長く貢献したいと考えています。',
    strengths:'責任感／時間を守ること／周囲と協力して働くこと／新しい仕事を素直に覚えること',
    selfpr:'私の強みは、責任感を持って最後まで取り組めることです。分からないことはそのままにせず確認し、教えていただいたことをメモして、同じミスを繰り返さないようにしています。忙しい時も周囲と声を掛け合い、丁寧に行動します。',
    request:'貴社の規定に従います。'
  };
  const PROVIDERS={
    seven:'https://www.printing.ne.jp/',
    family:'https://networkprint.family.co.jp/fmweb/start',
    lawson:'https://www.lawson.co.jp/service/others/multicopy/'
  };
  const safe=(v='')=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const currentKind=()=>document.querySelector('.preview-tools button.active')?.dataset.preview||'rireki';

  function saveNow(){try{save();}catch(_){}}
  function seedDefaults(){
    if(state.cvV6Seeded) return;
    for(const [key,value] of Object.entries(DEFAULTS)) if(!String(state[key]||'').trim()) state[key]=value;
    state.outputFormat=state.outputFormat||'a4-2';
    state.cvV6Seeded=true;
    for(const key of Object.keys(DEFAULTS)){const el=E(key);if(el&&!el.value)el.value=state[key]||'';}
    saveNow();
  }

  function addGuide(id,type,text){
    const el=E(id);if(!el)return;
    const field=el.closest('.field');if(!field||field.querySelector(`.cv-v6-guide[data-guide="${id}"]`))return;
    const icon=type==='default'?'fa-wand-magic-sparkles':'fa-pen';
    const reset=type==='default'?`<button type="button" class="cv-default-reset" data-reset-default="${id}">ডিফল্ট ফিরিয়ে আনুন</button>`:'';
    el.insertAdjacentHTML('beforebegin',`<div class="cv-v6-guide ${type}" data-guide="${id}"><i class="fa-solid ${icon}"></i><span>${text}${reset}</span></div>`);
  }

  function mountGuides(){
    ['name','furigana','dob','nationality','phone','email','address','addressKana','visa','schoolTime','availability','summary','skills'].forEach(id=>addGuide(id,'user','এই তথ্যটি আপনার নিজের—নিজে লিখুন/যাচাই করুন।'));
    addGuide('motive','default','ভালো একটি Japanese বাক্য ডিফল্ট রাখা আছে। আপনার সঙ্গে সত্যিই মিললে রাখুন, না হলে পরিবর্তন করুন।');
    addGuide('strengths','default','“আপনার প্রধান শক্তি”র একটি ভালো ডিফল্ট উদাহরণ রাখা আছে। সত্যি হলে রাখুন, প্রয়োজনমতো সম্পাদনা করুন।');
    addGuide('selfpr','default','自己PR-এর ভালো ডিফল্ট বাক্য রাখা আছে। নিজের বাস্তব অভিজ্ঞতা যোগ করলে আরও শক্তিশালী হবে।');
    addGuide('request','default','বিশেষ অনুরোধ না থাকলে Japanese CV-তে ব্যবহৃত সাধারণ বাক্যটি ডিফল্ট রাখা আছে।');
    document.querySelectorAll('[data-reset-default]').forEach(btn=>btn.addEventListener('click',()=>{
      const id=btn.dataset.resetDefault;if(!DEFAULTS[id]||!E(id))return;
      E(id).value=DEFAULTS[id];state[id]=DEFAULTS[id];saveNow();render();
    }));
    const historyStep=document.querySelector('.step[data-form="2"]');
    if(historyStep&&!historyStep.querySelector('.cv-history-guide'))historyStep.insertAdjacentHTML('afterbegin','<div class="cv-history-guide"><i class="fa-solid fa-pen"></i> 学歴・職歴・資格は ব্যক্তিভেদে আলাদা—এগুলো সবসময় নিজে লিখবেন। ভুল তথ্য auto-fill করা হবে না।</div>');
  }

  function mountFormatPicker(){
    const step=document.querySelector('.step[data-form="0"]');
    if(!step||E('cvOutputPicker'))return;
    const grid=step.querySelector('.template-grid');
    const html=`<div class="cv-v6-intro"><b>সহজভাবে করুন:</b> চাকরির ধরন এবং CV-এর page format বেছে নিন। ২ পৃষ্ঠা সবচেয়ে নিরাপদ; Baito-এর জন্য সংক্ষিপ্ত ১ পৃষ্ঠাও ব্যবহার করা যাবে।</div>
      <div class="cv-output-title">PDF / Print format</div>
      <div class="cv-output-grid" id="cvOutputPicker">
        <button type="button" class="cv-output" data-output-format="a4-1"><span class="cv-output-icon"><i class="fa-solid fa-file"></i></span><strong>A4 · 1 Page</strong><small>アルバイト向け সহজ compact CV। তথ্য বেশি হলে 2 Page ব্যবহার করুন।</small></button>
        <button type="button" class="cv-output" data-output-format="a4-2"><span class="recommended">おすすめ</span><span class="cv-output-icon"><i class="fa-solid fa-copy"></i></span><strong>A4 · 2 Pages</strong><small>Japanese traditional 履歴書-এর পূর্ণ layout। Default.</small></button>
        <button type="button" class="cv-output" data-output-format="a3-1"><span class="cv-output-icon"><i class="fa-solid fa-table-columns"></i></span><strong>A3 · 1 Sheet</strong><small>দুইটি A4 page এক A3 landscape sheet-এ। Convenience-store A3 print-এর জন্য।</small></button>
      </div>`;
    (grid||step.firstElementChild)?.insertAdjacentHTML(grid?'beforebegin':'afterend',html);
    document.querySelectorAll('[data-output-format]').forEach(btn=>btn.addEventListener('click',()=>setFormat(btn.dataset.outputFormat)));
    setFormat(state.outputFormat||'a4-2',false);
  }

  function mountPrintHub(){
    const step=document.querySelector('.step[data-form="4"]');
    if(!step||E('cvPrintHub'))return;
    step.insertAdjacentHTML('beforeend',`<div class="cv-print-hub" id="cvPrintHub">
      <h3><i class="fa-solid fa-store"></i> コンビニで印刷 — Seven‑Eleven / FamilyMart / Lawson</h3>
      <p>প্রথমে “履歴書 PDF / Print” চাপুন এবং ফোনে <b>Save as PDF</b> করুন। তারপর নিচের official service খুলে সেই PDF upload/transfer করুন।</p>
      <div class="cv-print-step"><i class="fa-solid fa-circle-1"></i><span><b>সেরা সেটিং:</b> CV সাধারণত A4, সাদা-কালো, Actual size / 100%। A3 1 Sheet বাছলে A3 landscape ব্যবহার করুন।</span></div>
      <div class="cv-store-grid">
        <a class="cv-store" href="${PROVIDERS.seven}" target="_blank" rel="noopener" data-store="seven"><span class="store-name">7‑Eleven · netprint</span><small>PDF online register করে nationwide Seven‑Eleven multi-copy machine-এ print করুন।</small><span class="store-action">Official netprint খুলুন →</span></a>
        <a class="cv-store" href="${PROVIDERS.family}" target="_blank" rel="noopener" data-store="family"><span class="store-name">FamilyMart · Network Print</span><small>PDF upload করে FamilyMart multi-copy machine-এ print করুন। Smartphone/PrintSmash-ও ব্যবহার করা যায়।</small><span class="store-action">FamilyMart Print খুলুন →</span></a>
        <a class="cv-store" href="${PROVIDERS.lawson}" target="_blank" rel="noopener" data-store="lawson"><span class="store-name">Lawson · Network Print / PrintSmash</span><small>PDF smartphone থেকে multi-copy machine-এ পাঠানো বা Network Print ব্যবহার করা যায়।</small><span class="store-action">Lawson guide খুলুন →</span></a>
      </div>
      <div class="cv-print-note"><b>নোট:</b> Aponar Nihon আপনার PDF নিজে থেকে দোকানের printer-এ পাঠায় না; convenience-store service-এ PDF transfer/upload করতে হবে। এতে provider-এর official flow-ই ব্যবহার হয়।</div>
    </div>`);
  }

  function buildCompact(){
    if(E('cvCompactResume'))return;
    const career=E('careerDoc');if(!career)return;
    career.insertAdjacentHTML('beforebegin',`<div class="page cv-compact-page" id="cvCompactResume" style="display:none">
      <div class="cv-compact-head"><div class="cv-compact-title">履 歴 書</div><div class="cv-compact-date" id="cvCDate"></div></div>
      <table class="cv-compact-table"><tr><td class="cv-compact-label">フリガナ</td><td colspan="3" id="cvCFuri"></td><td rowspan="3" class="cv-compact-photo" id="cvCPhoto"></td></tr><tr><td class="cv-compact-label">氏 名</td><td colspan="3" class="cv-compact-name" id="cvCName"></td></tr><tr><td class="cv-compact-label">生年月日</td><td id="cvCDob"></td><td class="cv-compact-label">性別</td><td id="cvCGender"></td></tr><tr><td class="cv-compact-label">現住所</td><td colspan="4" id="cvCAddress"></td></tr><tr><td class="cv-compact-label">携帯</td><td id="cvCPhone"></td><td class="cv-compact-label">Email</td><td colspan="2" id="cvCEmail"></td></tr><tr><td class="cv-compact-label">国籍</td><td id="cvCNationality"></td><td class="cv-compact-label">在留資格</td><td colspan="2" id="cvCVisa"></td></tr></table>
      <table class="cv-compact-table cv-compact-history"><tr><th class="cv-compact-year">年</th><th class="cv-compact-month">月</th><th>学歴・職歴</th></tr><tbody id="cvCHistory"></tbody></table>
      <table class="cv-compact-table cv-compact-history"><tr><th class="cv-compact-year">年</th><th class="cv-compact-month">月</th><th>免許・資格</th></tr><tbody id="cvCQual"></tbody></table>
      <div class="cv-compact-grid"><div class="cv-compact-box wide"><div class="cv-compact-box-title">志望動機</div><div class="cv-compact-box-body" id="cvCMotive"></div></div><div class="cv-compact-box"><div class="cv-compact-box-title">主な強み・自己PR</div><div class="cv-compact-box-body" id="cvCPr"></div></div><div class="cv-compact-box"><div class="cv-compact-box-title">希望勤務日・時間帯</div><div class="cv-compact-box-body" id="cvCAvailability"></div></div><div class="cv-compact-box wide"><div class="cv-compact-box-title">本人希望記入欄</div><div class="cv-compact-box-body" id="cvCRequest"></div></div></div>
      <div class="cv-compact-footer">Aponar Nihon · A4 1-page compact 履歴書</div>
    </div>`);
    const tools=document.querySelector('.preview-tools');
    if(tools&&!E('cvPreviewFormatNote'))tools.insertAdjacentHTML('afterend','<div class="cv-preview-format-note" id="cvPreviewFormatNote"></div>');
    const picker=E('cvOutputPicker');if(picker&&!E('cvOverflowWarning'))picker.insertAdjacentHTML('afterend','<div class="cv-overflow-warning" id="cvOverflowWarning"><i class="fa-solid fa-triangle-exclamation"></i> ১ পৃষ্ঠায় আপনার সব তথ্য নিরাপদভাবে ধরছে না। কিছু লেখা ছোট করুন অথবা A4 · 2 Pages বেছে নিন।</div>');
  }

  function row(y='',m='',t='',cls=''){return `<tr><td class="cv-compact-year">${safe(y)}</td><td class="cv-compact-month">${safe(m)}</td><td class="${cls}">${safe(t)}</td></tr>`;}
  function compactTooLong(){
    const history=(state.edu||[]).filter(x=>x.year||x.month||x.text).length+(state.work||[]).filter(x=>x.year||x.month||x.text).length;
    const quals=(state.qual||[]).filter(x=>x.year||x.month||x.text).length;
    return history>7||quals>3||String(state.motive||'').length>260||String(state.selfpr||state.strengths||'').length>210||String(state.address||'').length>75;
  }
  function renderCompact(){
    if(!E('cvCompactResume'))return;
    E('cvCDate').textContent=typeof jpDate==='function'?jpDate(state.created||tokyoToday()):'';
    E('cvCFuri').textContent=state.furigana||'';E('cvCName').textContent=state.name||'';
    E('cvCDob').textContent=state.dob?`${state.dob.slice(0,4)}年${+state.dob.slice(5,7)}月${+state.dob.slice(8,10)}日生（満${age(state.dob)}歳）`:'';
    E('cvCGender').textContent=state.gender||'';E('cvCAddress').textContent=state.address||'';E('cvCPhone').textContent=state.phone||'';E('cvCEmail').textContent=state.email||'';E('cvCNationality').textContent=state.nationality||'';E('cvCVisa').textContent=state.visa||'';
    E('cvCPhoto').innerHTML=state.photo?`<img src="${state.photo}" alt="証明写真">`:'<div class="photo-placeholder">写真<br>30〜40mm</div>';
    const rows=[];rows.push(row('','','学歴','cv-compact-section'));(state.edu||[]).filter(x=>x.year||x.month||x.text).forEach(x=>rows.push(row(x.year,x.month,x.text)));rows.push(row('','','職歴','cv-compact-section'));(state.work||[]).filter(x=>x.year||x.month||x.text).forEach(x=>rows.push(row(x.year,x.month,x.text)));rows.push(row('','','以上','cv-compact-section'));
    const shown=rows.slice(0,10);while(shown.length<10)shown.push(row());E('cvCHistory').innerHTML=shown.join('');
    const qs=(state.qual||[]).filter(x=>x.year||x.month||x.text).slice(0,3).map(x=>row(x.year,x.month,x.text));while(qs.length<3)qs.push(row());E('cvCQual').innerHTML=qs.join('');
    E('cvCMotive').textContent=state.motive||'';E('cvCPr').textContent=state.selfpr||state.strengths||'';
    const av=[];if(state.schoolTime)av.push(`学校授業時間：${state.schoolTime}`);if(state.availability)av.push(state.availability);E('cvCAvailability').textContent=av.join('\n');E('cvCRequest').textContent=state.request||'';
    const warn=E('cvOverflowWarning');if(warn)warn.classList.toggle('show',(state.outputFormat||'a4-2')==='a4-1'&&compactTooLong());
  }

  function setFormat(format,rerender=true){
    if(!['a4-1','a4-2','a3-1'].includes(format))format='a4-2';
    state.outputFormat=format;saveNow();
    document.querySelectorAll('[data-output-format]').forEach(b=>b.classList.toggle('active',b.dataset.outputFormat===format));
    if(rerender){renderCompact();preview(currentKind());}
  }

  function applyFormatPreview(kind=currentKind()){
    const format=state.outputFormat||'a4-2';
    const note=E('cvPreviewFormatNote');
    if(note)note.textContent=format==='a4-1'?'Preview: A4 · 1 Page compact':format==='a3-1'?'Preview: 2 pages দেখানো হচ্ছে; Print-এ A3 · 1 Sheet হবে':'Preview: A4 · 2 Pages official-style';
    if(kind!=='rireki'){if(E('cvCompactResume'))E('cvCompactResume').style.display='none';return;}
    if(format==='a4-1'){
      document.querySelectorAll('.jis-page,.parttime-rireki').forEach(p=>p.style.display='none');if(E('rirekiDoc'))E('rirekiDoc').style.display='none';if(E('cvCompactResume'))E('cvCompactResume').style.display='block';
    }else{
      if(E('cvCompactResume'))E('cvCompactResume').style.display='none';
    }
    if(typeof fit==='function')fit();
  }

  function setPageStyle(css){let s=E('cvV6PageStyle');if(!s){s=document.createElement('style');s.id='cvV6PageStyle';document.head.appendChild(s);}s.textContent=css;}
  function cleanupPrint(){document.body.classList.remove('cv-print-a3','cv-print-a4-one');const s=E('cvV6PageStyle');if(s)s.remove();}

  const baseRender=render;
  render=function(){baseRender();renderCompact();applyFormatPreview(currentKind());};
  const basePreview=preview;
  preview=function(kind){basePreview(kind);applyFormatPreview(kind);};
  const basePrintDoc=printDoc;
  printDoc=function(kind){
    if(kind==='career'){cleanupPrint();basePrintDoc(kind);return;}
    state.created=tokyoToday();saveNow();render();
    const format=state.outputFormat||'a4-2';
    if(format==='a4-1'){
      if(compactTooLong()){alert('১ পৃষ্ঠায় সব তথ্য নিরাপদভাবে ধরছে না। কিছু তথ্য ছোট করুন অথবা A4 · 2 Pages বেছে নিন।');return;}
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('print-me'));E('cvCompactResume')?.classList.add('print-me');document.body.classList.add('cv-print-a4-one');setPageStyle('@page{size:A4 portrait;margin:0}');setTimeout(()=>window.print(),80);return;
    }
    if(format==='a3-1'){
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('print-me'));document.querySelectorAll('.print-jis').forEach(p=>p.classList.add('print-me'));document.body.classList.add('cv-print-a3');setPageStyle('@page{size:A3 landscape;margin:0}');setTimeout(()=>window.print(),80);return;
    }
    cleanupPrint();basePrintDoc('rireki');
  };
  window.addEventListener('afterprint',cleanupPrint);

  seedDefaults();mountFormatPicker();mountGuides();mountPrintHub();buildCompact();
  document.querySelectorAll('[data-store]').forEach(a=>a.addEventListener('click',()=>{state.lastPrintProvider=a.dataset.store;saveNow();}));
  document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>preview(b.dataset.preview));
  if(E('printRireki'))E('printRireki').onclick=()=>printDoc('rireki');if(E('printCareer'))E('printCareer').onclick=()=>printDoc('career');if(E('mobilePrint'))E('mobilePrint').onclick=()=>printDoc('rireki');
  render();preview(currentKind());
})();
