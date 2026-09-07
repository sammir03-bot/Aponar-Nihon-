(()=>{
  'use strict';

  if(!document.body||document.body.dataset.page!=='jobs')return;
  if(document.getElementById('an-jobs-enhance-root'))return;

  const external=(href,label,icon='fa-arrow-up-right-from-square')=>`<a class="an-job-link" target="_blank" rel="noopener external" href="${href}"><i class="fa-solid ${icon}" aria-hidden="true"></i>${label}</a>`;
  const ruby=(kanji,reading)=>`<ruby>${kanji}<rt>${reading}</rt></ruby>`;

  function addStyles(){
    if(document.getElementById('an-jobs-enhance-style'))return;
    const style=document.createElement('style');
    style.id='an-jobs-enhance-style';
    style.textContent=`
      .an-jobs-enhance{margin-top:15px;background:#fff;border:1px solid #dce7eb;border-radius:22px;padding:18px;box-shadow:0 16px 42px rgba(20,58,76,.09)}
      .an-jobs-head{margin-bottom:12px}.an-jobs-head .an-eyebrow{display:block;color:#0f7c83;font-size:9px;font-weight:900;letter-spacing:.11em}.an-jobs-head h2{margin:3px 0 0;color:#17344a;font-size:clamp(21px,4vw,29px);line-height:1.2}.an-jobs-head p{margin:5px 0 0;color:#6d7f8c;font-size:11px;line-height:1.65}
      .an-reading-strip{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.an-reading-chip{display:inline-flex;align-items:center;gap:4px;padding:8px 10px;border:1px solid #dce7eb;border-radius:999px;background:#f7fbfc;color:#17344a;font-family:'Noto Sans JP','Noto Sans Bengali',sans-serif;font-size:11px;font-weight:800}.an-reading-chip small{font-family:'Noto Sans Bengali',sans-serif;color:#6d7f8c;font-weight:700}
      ruby{ruby-position:over}rt{font-size:.58em;color:#5c7482;font-weight:700;letter-spacing:.01em}
      .an-login-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.an-login-card{border:1px solid #dce7eb;border-radius:18px;padding:16px;background:linear-gradient(180deg,#fff,#fbfdfd)}.an-login-top{display:flex;align-items:center;gap:10px}.an-login-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#eef7f8;color:#0f7c83;font-size:18px}.an-login-card h3{margin:0;color:#17344a;font-size:18px}.an-login-card p{margin:8px 0;color:#6d7f8c;font-size:10px;line-height:1.65}.an-steps{display:grid;gap:7px;margin-top:10px}.an-step{display:grid;grid-template-columns:27px 1fr;gap:8px;align-items:start}.an-step-no{display:grid;place-items:center;width:27px;height:27px;border-radius:9px;background:#edf7f8;color:#0f7c83;font:900 10px/1 Inter,sans-serif}.an-step b{display:block;color:#17344a;font-size:10px}.an-step small{display:block;margin-top:2px;color:#6d7f8c;font-size:9px;line-height:1.55}
      .an-job-links{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.an-job-link{display:inline-flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;border:1px solid #dce7eb;background:#fff;color:#17344a;border-radius:10px;padding:9px 10px;font-size:10px;font-weight:900}.an-job-link.primary{background:#0f7c83;border-color:#0f7c83;color:#fff}
      .an-brand-groups{display:grid;gap:14px}.an-brand-title{display:flex;align-items:center;gap:8px;margin:2px 0 8px;color:#17344a;font-size:13px}.an-brand-title i{color:#0f7c83}.an-brand-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.an-brand-card{display:flex;flex-direction:column;min-height:150px;border:1px solid #dce7eb;border-radius:16px;padding:13px;background:#fff}.an-brand-card .an-brand-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:#eef7f8;color:#0f7c83;font-size:16px}.an-brand-card h3{margin:9px 0 3px;color:#17344a;font-size:13px}.an-brand-card p{margin:0;color:#6d7f8c;font-size:9px;line-height:1.55;flex:1}.an-brand-card a{margin-top:10px;text-decoration:none;color:#0f7c83;font-size:10px;font-weight:900}.an-official{display:inline-flex;align-items:center;gap:4px;margin-left:auto;padding:4px 7px;border-radius:999px;background:#eaf6f1;color:#198668;font-size:8px;font-weight:900}
      .an-apply-flow{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.an-apply-step{border:1px solid #dce7eb;border-radius:14px;padding:12px;background:#fff}.an-apply-step span{display:grid;place-items:center;width:27px;height:27px;border-radius:9px;background:#eef7f8;color:#0f7c83;font:900 10px/1 Inter,sans-serif}.an-apply-step b{display:block;margin-top:8px;color:#17344a;font-size:10px}.an-apply-step small{display:block;margin-top:2px;color:#6d7f8c;font-size:9px;line-height:1.55}
      .an-safety-note{margin-top:11px;padding:10px 11px;border-radius:12px;background:#eef8fa;border:1px solid #d4e9ee;color:#3c6671;font-size:9px;line-height:1.65}
      @media(max-width:820px){.an-login-grid{grid-template-columns:1fr}.an-brand-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.an-apply-flow{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:560px){.an-jobs-enhance{border-radius:19px;padding:14px}.an-brand-grid,.an-apply-flow{grid-template-columns:1fr}.an-job-link{flex:1}.an-reading-chip{font-size:10px}}
    `;
    document.head.appendChild(style);
  }

  function enhanceFurigana(){
    const fields={
      '氏名（しめい）':`${ruby('氏名','しめい')}`,
      '生年月日':`${ruby('生年月日','せいねんがっぴ')}`,
      '電話番号':`${ruby('電話番号','でんわばんごう')}`,
      '現在の職業':`${ruby('現在','げんざい')}の${ruby('職業','しょくぎょう')}`,
      '希望勤務日':`${ruby('希望','きぼう')}${ruby('勤務日','きんむび')}`,
      '希望勤務時間':`${ruby('希望','きぼう')}${ruby('勤務時間','きんむじかん')}`,
      '応募する':`${ruby('応募','おうぼ')}する`
    };
    document.querySelectorAll('.field b').forEach(el=>{
      const key=(el.textContent||'').trim();
      if(fields[key])el.innerHTML=fields[key];
    });
    const words={
      '時給':ruby('時給','じきゅう'),
      '交通費支給':ruby('交通費支給','こうつうひしきゅう'),
      '未経験OK':`${ruby('未経験','みけいけん')}OK`,
      '深夜':ruby('深夜','しんや'),
      '研修あり':`${ruby('研修','けんしゅう')}あり`
    };
    document.querySelectorAll('.word strong').forEach(el=>{
      const key=(el.textContent||'').trim();
      if(words[key])el.innerHTML=words[key];
    });
    document.querySelectorAll('.flow-card b').forEach(el=>{
      if((el.textContent||'').trim()==='応募 করুন')el.innerHTML=`${ruby('応募','おうぼ')} করুন`;
    });
  }

  function addReadingStrip(){
    const hero=document.querySelector('.hero');
    if(!hero||document.getElementById('an-reading-strip'))return;
    const box=document.createElement('section');
    box.id='an-reading-strip';
    box.className='an-jobs-enhance';
    box.innerHTML=`
      <div class="an-jobs-head"><span class="an-eyebrow">JAPANESE READING</span><h2>Job-এর দরকারি কাঞ্জি + ফুরিগানা</h2><p>এই ৬টা শব্দ আগে চিনে রাখলে TownWork, Baitoru এবং company job page বুঝতে অনেক সহজ হবে।</p></div>
      <div class="an-reading-strip">
        <span class="an-reading-chip">${ruby('仕事','しごと')} <small>কাজ</small></span>
        <span class="an-reading-chip">${ruby('求人','きゅうじん')} <small>চাকরির বিজ্ঞাপন</small></span>
        <span class="an-reading-chip">${ruby('応募','おうぼ')} <small>আবেদন</small></span>
        <span class="an-reading-chip">${ruby('面接','めんせつ')} <small>ইন্টারভিউ</small></span>
        <span class="an-reading-chip">${ruby('履歴書','りれきしょ')} <small>CV</small></span>
        <span class="an-reading-chip">${ruby('時給','じきゅう')} <small>ঘণ্টাপ্রতি বেতন</small></span>
      </div>`;
    hero.insertAdjacentElement('afterend',box);
  }

  function addLoginGuide(){
    const find=document.getElementById('find');
    if(!find||document.getElementById('an-login-guide'))return;
    const section=document.createElement('section');
    section.id='an-login-guide';
    section.className='an-jobs-enhance';
    section.innerHTML=`
      <div class="an-jobs-head"><span class="an-eyebrow">ACCOUNT · LOGIN</span><h2>Registration / Login কীভাবে করবেন?</h2><p>আপনার Nihon কোনো account তৈরি করে না। নিচের ধাপ দেখে original TownWork/Baitoru page-এ account ব্যবহার করুন।</p></div>
      <div class="an-login-grid">
        <article class="an-login-card">
          <div class="an-login-top"><span class="an-login-icon"><i class="fa-solid fa-building"></i></span><div><h3>TownWork</h3><small>${ruby('会員','かいいん')} / ${ruby('応募','おうぼ')} guide</small></div></div>
          <div class="an-steps">
            <div class="an-step"><span class="an-step-no">1</span><div><b>TownWork official site খুলুন</b><small>Home থেকে ${ruby('マイページ','')} / job search ব্যবহার করুন।</small></div></div>
            <div class="an-step"><span class="an-step-no">2</span><div><b>Login/registration screen এলে নির্দেশনা অনুসরণ করুন</b><small>Screen-এ যে option দেখাবে সেটাই ব্যবহার করুন; UI সময়ের সাথে বদলাতে পারে।</small></div></div>
            <div class="an-step"><span class="an-step-no">3</span><div><b>${ruby('求人','きゅうじん')} খুঁজুন</b><small>Tokyo → station/area → job type → shift দিয়ে filter করুন।</small></div></div>
            <div class="an-step"><span class="an-step-no">4</span><div><b>${ruby('応募','おうぼ')} button চাপুন</b><small>Original form-এ নিজের সঠিক phone/email দিন এবং confirmation করুন।</small></div></div>
          </div>
          <div class="an-job-links">${external('https://townwork.net/','TownWork খুলুন','fa-arrow-up-right-from-square')}</div>
        </article>
        <article class="an-login-card">
          <div class="an-login-top"><span class="an-login-icon"><i class="fa-solid fa-bolt"></i></span><div><h3>Baitoru · dipID</h3><small>${ruby('ログイン','')} / ${ruby('利用開始','りようかいし')}</small></div></div>
          <div class="an-steps">
            <div class="an-step"><span class="an-step-no">1</span><div><b>「ログインまたは利用開始する」 চাপুন</b><small>Baitoru home/menu-তে এই entry পাওয়া যায়।</small></div></div>
            <div class="an-step"><span class="an-step-no">2</span><div><b>dipID তৈরি বা login করুন</b><small>Email অথবা official login screen-এ দেখানো supported sign-in option ব্যবহার করুন।</small></div></div>
            <div class="an-step"><span class="an-step-no">3</span><div><b>Verification এলে complete করুন</b><small>Authentication code চাইলে নিজের registered email/official method ব্যবহার করুন।</small></div></div>
            <div class="an-step"><span class="an-step-no">4</span><div><b>Job খুলে ${ruby('応募','おうぼ')} করুন</b><small>Application history পরে 「応募した仕事」 থেকে দেখা যায়।</small></div></div>
          </div>
          <div class="an-job-links">${external('https://www.baitoru.com/','Baitoru খুলুন','fa-arrow-up-right-from-square')}${external('https://www.baitoru.com/about/ask/','Baitoru Help','fa-circle-question')}</div>
        </article>
      </div>
      <div class="an-safety-note"><i class="fa-solid fa-shield-halved"></i> Password, verification code বা login তথ্য কখনো Aponar Nihon-এ দেবেন না। সব account কাজ original site-এই করবেন।</div>`;
    find.insertAdjacentElement('afterend',section);
  }

  function brandCard(name,desc,url,icon){
    return `<article class="an-brand-card"><div style="display:flex;align-items:center;gap:8px"><span class="an-brand-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></span><span class="an-official">OFFICIAL</span></div><h3>${name}</h3><p>${desc}</p><a target="_blank" rel="noopener external" href="${url}">Official jobs <i class="fa-solid fa-arrow-up-right-from-square"></i></a></article>`;
  }

  function addEmployerSites(){
    const quick=document.querySelector('.quick-grid');
    const host=quick&&quick.closest('.section');
    if(!host||document.getElementById('an-employer-sites'))return;
    const section=document.createElement('section');
    section.id='an-employer-sites';
    section.className='an-jobs-enhance';
    section.innerHTML=`
      <div class="an-jobs-head"><span class="an-eyebrow">ORIGINAL COMPANY JOB SITES</span><h2>Company-এর official site থেকেও সরাসরি আবেদন করুন</h2><p>TownWork/Baitoru ছাড়াও বড় chain-এর নিজস্ব recruitment site আছে। Job পছন্দ হলে original company page-এই apply করবেন।</p></div>
      <div class="an-brand-groups">
        <div>
          <h3 class="an-brand-title"><i class="fa-solid fa-store"></i> Convenience Store · コンビニ</h3>
          <div class="an-brand-grid">
            ${brandCard('7-Eleven','Store job খুঁজুন, job detail পড়ুন এবং WEB/phone application option ব্যবহার করুন।','https://ptj.sej.co.jp/','fa-7')}
            ${brandCard('FamilyMart','Tokyo, shift, station এবং 留学生歓迎 / 外国人活躍 condition দিয়ে job খুঁজুন।','https://staff.family.co.jp/','fa-store')}
            ${brandCard('Lawson','Lawson, Natural Lawson, Lawson Store 100; language/ひらがな option-ও আছে।','https://crew.lawson.co.jp/','fa-store')}
            ${brandCard('MINISTOP','Recruitment store list থেকে কাছের দোকানের part-time opening দেখুন।','https://ministop-arbeit.jp/','fa-store')}
            ${brandCard('Daily Yamazaki','売場クルー / 厨房クルー-এর part-time recruitment information দেখুন।','https://www.daily-yamazaki.jp/job/','fa-bread-slice')}
          </div>
        </div>
        <div>
          <h3 class="an-brand-title"><i class="fa-solid fa-utensils"></i> Restaurant · Ramen · Fast Food</h3>
          <div class="an-brand-grid">
            ${brandCard("McDonald's",'Store search → crew job → application → interview flow ব্যবহার করুন।','https://www.mcdonalds.co.jp/recruit/crew_recruiting/','fa-burger')}
            ${brandCard('KFC','KFC store jobs-এ WEB/LINE/phone application option job অনুযায়ী পাওয়া যেতে পারে।','https://job-kfc.net/','fa-drumstick-bite')}
            ${brandCard('Sushiro','Sushiro recruitment site থেকে アルバイト・パート求人 entry খুলুন।','https://www.akindo-sushiro.co.jp/recruit/','fa-fish')}
            ${brandCard('Sukiya','Tokyo-area hall/kitchen part-time openings এবং WEB application দেখুন।','https://work.sukiya.jp/','fa-bowl-rice')}
            ${brandCard('Marugame / Toridoll','Marugame Seimen সহ Toridoll group-এর brand/area দিয়ে part-time job খুঁজুন।','https://jobs.toridoll.com/','fa-bowl-food')}
            ${brandCard('ICHIRAN Ramen','一蘭-এর official recruitment page থেকে アルバイト応募 entry ব্যবহার করুন।','https://ichiran.com/recruit2018/','fa-bowl-food')}
            ${brandCard('Marugen Ramen','物語コーポレーション-এর part-time recruitment entry থেকে 丸源ラーメン job খুঁজুন।','https://www.monogatari.co.jp/recruit/','fa-bowl-food')}
          </div>
        </div>
      </div>`;
    host.insertAdjacentElement('afterend',section);
  }

  function addCompanyApplyFlow(){
    const employer=document.getElementById('an-employer-sites');
    if(!employer||document.getElementById('an-company-apply-flow'))return;
    const section=document.createElement('section');
    section.id='an-company-apply-flow';
    section.className='an-jobs-enhance';
    section.innerHTML=`
      <div class="an-jobs-head"><span class="an-eyebrow">HOW TO APPLY</span><h2>Company job site-এ আবেদন করার সহজ নিয়ম</h2><p>Button-এর নাম brand অনুযায়ী একটু আলাদা হতে পারে, কিন্তু flow প্রায় একই।</p></div>
      <div class="an-apply-flow">
        <div class="an-apply-step"><span>1</span><b>${ruby('求人','きゅうじん')} খুঁজুন</b><small>Tokyo / station / store / shift বেছে নিন।</small></div>
        <div class="an-apply-step"><span>2</span><b>${ruby('募集要項','ぼしゅうようこう')} পড়ুন</b><small>時給, 勤務時間, 交通費, 条件 দেখে নিন।</small></div>
        <div class="an-apply-step"><span>3</span><b>${ruby('応募','おうぼ')} করুন</b><small>WEB応募 / 応募する / エントリー button চাপুন।</small></div>
        <div class="an-apply-step"><span>4</span><b>${ruby('面接','めんせつ')} প্রস্তুতি</b><small>Call/email এলে date confirm করুন, CV/履歴書 ready রাখুন।</small></div>
      </div>
      <div class="an-job-links">${external('/interview.html','Interview Guide','fa-user-tie').replace('target="_blank" rel="noopener external"','')}${external('/cv-builder.html','CV Builder','fa-file-signature').replace('target="_blank" rel="noopener external"','')}</div>`;
    employer.insertAdjacentElement('afterend',section);
  }

  function boot(){
    addStyles();
    enhanceFurigana();
    addReadingStrip();
    addLoginGuide();
    addEmployerSites();
    addCompanyApplyFlow();
    const marker=document.createElement('span');
    marker.id='an-jobs-enhance-root';
    marker.hidden=true;
    document.body.appendChild(marker);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
