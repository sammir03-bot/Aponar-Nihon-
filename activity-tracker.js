(()=>{
  const HOME_CARD_BN={
    '/n5.html':['JLPT N5','বেসিক কোর্স'],
    '/n4.html':['JLPT N4','পরবর্তী ধাপ'],
    '/n3.html':['JLPT N3','মধ্যম স্তর'],
    '/kanji-flashcards.html':['Kanji Flashcards','N5 · N4 · N3 স্মার্ট রিভিউ'],
    '/revision.html':['Full Revision','পরীক্ষার আগে সব একসাথে'],
    '/listening-lab.html':['Listening Lab','শুনুন · উত্তর দিন · ভেঙে শিখুন'],
    '/quiz.html':['কুইজ','বিনামূল্যে অনুশীলন'],
    '/tutor-section.html':['AI Tutor','বাংলায় জিজ্ঞাসা করুন'],
    '/mock-test.html':['Mock Test','পরীক্ষার অনুশীলন'],
    '/interview.html':['ইন্টারভিউ','চাকরি ও দূতাবাস'],
    '/ssw.html':['SSW','সম্পূর্ণ গাইড'],
    '/essential-phrases.html':['দরকারি বাক্য','কথোপকথন'],
    '/japan-life.html':['জাপান জীবন','নতুনদের গাইড'],
    '/jobs-in-japan.html':['জাপানে চাকরি','কাজ খুঁজুন · আবেদন শিখুন'],
    '/Hiragana-Katagana.html':['হিরাগানা-কাতাকানা','অক্ষর শিখুন'],
    '/ebook-library.html':['E-Book','পড়ার লাইব্রেরি'],
    '/student-tools.html':['Student Toolkit','২৮ ঘণ্টা ও দরকারি টুল'],
    '/cv-builder.html':['Japan CV Builder','জাপানি জীবনবৃত্তান্ত তৈরি'],
    '/grammar-vs.html':['Grammar VS','N5 · N4 · N3'],
    '/muslim-japan.html':['Muslim Japan','নামাজ ও হালাল'],
    '/jpy-bdt-remittance.html':['JPY ↔ BDT','রেট ও রেমিট্যান্স'],
    '/study-guide.html':['স্টাডি গাইড','শেখার রোডম্যাপ'],
    '/halal-scanner.html':['হালাল ফুড স্ক্যানার','বারকোড ও উপাদান যাচাই']
  };

  function applyMobileLayoutFix(){
    if(document.getElementById('an-mobile-layout-fix'))return;
    const s=document.createElement('style');
    s.id='an-mobile-layout-fix';
    s.textContent=`html{scroll-padding-bottom:calc(104px + env(safe-area-inset-bottom,0px))}.app-tool-jobs .app-tool-icon{background:linear-gradient(145deg,#167c83,#154f73)!important;color:#fff!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.32),0 9px 20px rgba(21,79,115,.18)!important}.app-tool-revision{position:relative;overflow:hidden;border-color:rgba(79,70,229,.18)!important;background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(245,243,255,.96))!important}.app-tool-revision:after,.app-tool-listening:after{content:'NEW';position:absolute;top:8px;right:8px;padding:3px 6px;border-radius:999px;color:#fff;font-size:.48rem;font-weight:900;letter-spacing:.06em}.app-tool-revision:after{background:#4f46e5}.app-tool-revision .app-tool-icon{background:linear-gradient(145deg,#4f46e5,#7c3aed)!important;color:#fff!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.3),0 9px 20px rgba(79,70,229,.22)!important}.app-tool-flashcards{position:relative;overflow:hidden;border-color:rgba(14,116,144,.18)!important;background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(236,254,255,.96))!important}.app-tool-flashcards:after{content:'NEW';position:absolute;top:8px;right:8px;padding:3px 6px;border-radius:999px;background:#0e7490;color:#fff;font-size:.48rem;font-weight:900;letter-spacing:.06em}.app-tool-flashcards .app-tool-icon{background:linear-gradient(145deg,#0891b2,#2563eb)!important;color:#fff!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.3),0 9px 20px rgba(8,145,178,.22)!important}.app-tool-listening{position:relative;overflow:hidden;border-color:rgba(124,58,237,.18)!important;background:linear-gradient(145deg,rgba(255,255,255,.99),rgba(250,245,255,.97))!important}.app-tool-listening:after{background:#7c3aed}.app-tool-listening .app-tool-icon{background:linear-gradient(145deg,#7c3aed,#4338ca)!important;color:#fff!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.3),0 9px 20px rgba(124,58,237,.22)!important}@media(max-width:620px){body.app-page{padding-bottom:calc(104px + env(safe-area-inset-bottom,0px))!important}.app-main,.hub-main{padding-bottom:54px!important}.app-tool b{display:-webkit-box!important;min-height:2.35em;overflow:hidden!important;white-space:normal!important;text-overflow:clip!important;line-height:1.18!important;-webkit-box-orient:vertical;-webkit-line-clamp:2}.app-dock-wrap{padding:5px 8px calc(5px + env(safe-area-inset-bottom,0px))!important;background:linear-gradient(180deg,rgba(243,247,251,0) 0,rgba(243,247,251,.92) 16px,rgba(243,247,251,.985) 100%)}.app-dock{min-height:60px!important;border-radius:20px!important}.app-dock-link{gap:1px!important;padding:4px 2px!important;font-size:.56rem!important;line-height:1.15!important}.app-dock-link i{width:32px!important;height:30px!important;border-radius:11px!important;font-size:1.03rem!important}.app-dock-link.active i{box-shadow:0 5px 12px rgba(22,119,232,.23)!important}}@media(max-width:370px){.app-dock-link{font-size:.52rem!important}}`;
    document.head.appendChild(s);
  }

  function normalizeHalalScannerEntry(){
    if(!document.body||document.body.dataset.page!=='home')return;
    const card=document.querySelector('.app-tools-grid .app-tool[href="/halal-scanner.html"]');
    if(!card)return;
    card.classList.add('app-tool-halal');
    const icon=card.querySelector('.app-tool-icon');
    if(icon)icon.className='app-tool-icon tone-deepgreen';
    const badge=card.querySelector('.app-tool-halal-badge');
    if(badge)badge.remove();
  }

  function applyHomeCardLanguage(){
    if(!document.body||document.body.dataset.page!=='home')return;
    const lang=window.AponarI18n&&typeof window.AponarI18n.getLanguage==='function'?window.AponarI18n.getLanguage():(document.documentElement.lang||'bn');
    if(lang!=='bn')return;
    const grid=document.querySelector('.app-tools-grid');
    if(!grid)return;
    Object.entries(HOME_CARD_BN).forEach(([href,copy])=>{
      const card=grid.querySelector(`.app-tool[href="${href}"]`);
      if(!card)return;
      const title=card.querySelector('b'),note=card.querySelector('small');
      if(title)title.textContent=copy[0];
      if(note)note.textContent=copy[1];
      card.dataset.label=copy[0];
    });
  }

  function mountRevisionCards(){
    if(!document.body||document.body.dataset.page!=='home')return;
    const grid=document.querySelector('.app-tools-grid');
    if(!grid)return;
    let flash=grid.querySelector('[data-kanji-flashcards-entry]');
    if(!flash){flash=document.createElement('a');flash.className='app-tool app-tool-flashcards';flash.href='/kanji-flashcards.html';flash.dataset.kanjiFlashcardsEntry='1';flash.dataset.label='Kanji Flashcards';flash.dataset.search='kanji flashcards flash card n5 n4 n3 漢字 কাঞ্জি ফ্ল্যাশকার্ড review spaced repetition weak ভুল';flash.dataset.searchIcon='fa-layer-group';flash.innerHTML='<span class="app-tool-icon"><i class="fa-solid fa-layer-group" aria-hidden="true"></i></span><b>Kanji Flashcards</b><small>N5 · N4 · N3 স্মার্ট রিভিউ</small>'}
    let revision=grid.querySelector('[data-full-revision-entry]');
    if(!revision){revision=document.createElement('a');revision.className='app-tool app-tool-revision';revision.href='/revision.html';revision.dataset.fullRevisionEntry='1';revision.dataset.label='Full Revision';revision.dataset.search='full revision jlpt n5 n4 n3 exam grammar vocabulary kanji reading listening mock quick weak রিভিশন পরীক্ষা';revision.dataset.searchIcon='fa-rotate';revision.innerHTML='<span class="app-tool-icon"><i class="fa-solid fa-rotate" aria-hidden="true"></i></span><b>Full Revision</b><small>পরীক্ষার আগে সব একসাথে</small>'}
    const n3=grid.querySelector('a[href="/n3.html"]');
    if(n3&&n3.parentNode===grid){n3.insertAdjacentElement('afterend',revision);n3.insertAdjacentElement('afterend',flash)}else{grid.prepend(revision);grid.prepend(flash)}
  }

  function mountListeningLabEntry(){
    if(!document.body||document.body.dataset.page!=='home')return;
    const grid=document.querySelector('.app-tools-grid');
    if(!grid||grid.querySelector('[data-listening-lab-entry]'))return;
    const card=document.createElement('a');
    card.className='app-tool app-tool-listening';
    card.href='/listening-lab.html';
    card.dataset.listeningLabEntry='1';
    card.dataset.label='Listening Lab';
    card.dataset.search='listening lab jlpt n5 n4 n3 audio transcript script furigana vocabulary grammar clue listening weak শুনে উত্তর লিসিনিং স্ক্রিপ্ট';
    card.dataset.searchIcon='fa-headphones';
    card.innerHTML='<span class="app-tool-icon"><i class="fa-solid fa-headphones" aria-hidden="true"></i></span><b>Listening Lab</b><small>শুনুন · উত্তর দিন · ভেঙে শিখুন</small>';
    const revision=grid.querySelector('[data-full-revision-entry]');
    if(revision&&revision.parentNode===grid)revision.insertAdjacentElement('afterend',card);else grid.prepend(card);
  }

  function mountJobsInJapanEntry(){
    if(!document.body||document.body.dataset.page!=='home')return;
    const grid=document.querySelector('.app-tools-grid');
    if(!grid||grid.querySelector('[data-jobs-in-japan-entry]'))return;
    const card=document.createElement('a');
    card.className='app-tool app-tool-jobs';card.href='/jobs-in-japan.html';card.dataset.jobsInJapanEntry='1';card.dataset.label='জাপানে চাকরি';card.dataset.search='jobs japan baito part time townwork baitoru চাকরি কাজ আবেদন apply interview convenience restaurant';card.dataset.searchIcon='fa-briefcase';card.innerHTML='<span class="app-tool-icon tone-teal"><i class="fa-solid fa-briefcase" aria-hidden="true"></i></span><b>Jobs in Japan</b><small>Find Jobs · Learn to Apply</small>';
    const japanLife=grid.querySelector('a[href="/japan-life.html"]');
    if(japanLife&&japanLife.parentNode===grid)japanLife.insertAdjacentElement('afterend',card);else grid.prepend(card);
  }

  function ensureStylesheet(id,href){if(document.getElementById(id))return;const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=href;document.head.appendChild(link)}
  function ensureScript(id,src){return new Promise((resolve,reject)=>{const existing=document.getElementById(id);if(existing){if(existing.dataset.loaded==='1'||window.AponarDailyNews){resolve();return}existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}const script=document.createElement('script');script.id=id;script.src=src;script.async=true;script.addEventListener('load',()=>{script.dataset.loaded='1';resolve()},{once:true});script.addEventListener('error',reject,{once:true});document.head.appendChild(script)})}
  function loadJobsEnhancer(){if(!document.body||document.body.dataset.page!=='jobs')return;if(document.getElementById('an-jobs-enhance-js'))return;const script=document.createElement('script');script.id='an-jobs-enhance-js';script.src='/assets/js/jobs-in-japan-enhance.js?v=20260907.1';script.async=true;document.head.appendChild(script)}
  async function mountHomeDailyNews(){if(!document.body||document.body.dataset.page!=='home')return;ensureStylesheet('an-daily-news-css','/assets/css/daily-news.css?v=20260904.2');if(!window.AponarDailyNews)await ensureScript('an-daily-news-js','/assets/js/daily-news.js?v=20260904.2');if(window.AponarDailyNews&&typeof window.AponarDailyNews.mountHome==='function')window.AponarDailyNews.mountHome()}

  async function boot(){
    applyMobileLayoutFix();mountRevisionCards();mountListeningLabEntry();mountJobsInJapanEntry();normalizeHalalScannerEntry();applyHomeCardLanguage();
    setTimeout(()=>{mountRevisionCards();mountListeningLabEntry();normalizeHalalScannerEntry();applyHomeCardLanguage()},0);
    loadJobsEnhancer();mountHomeDailyNews().catch(()=>{});
    if(!window.AN)return;
    const s=await AN.session();if(!s)return;await AN.log('page_view',{title:document.title});
    try{await AN.sb.from('profiles').update({last_active_at:new Date().toISOString()}).eq('id',s.user.id)}catch{}
    let sent=false;document.addEventListener('click',e=>{const a=e.target.closest('a[href],button');if(!a||sent)return;const label=(a.textContent||a.getAttribute('aria-label')||'').trim().slice(0,80),href=a.getAttribute('href')||'';if(label||href){sent=true;AN.log('interaction',{label,href}).finally(()=>setTimeout(()=>sent=false,800))}})
  }

  window.addEventListener('aponar:languagechange',()=>setTimeout(()=>{mountRevisionCards();mountListeningLabEntry();normalizeHalalScannerEntry();applyHomeCardLanguage()},0));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();