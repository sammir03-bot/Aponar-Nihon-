(()=>{
  function applyMobileLayoutFix(){
    if(document.getElementById('an-mobile-layout-fix'))return;
    const s=document.createElement('style');
    s.id='an-mobile-layout-fix';
    s.textContent=`html{scroll-padding-bottom:calc(104px + env(safe-area-inset-bottom,0px))}.app-tool-jobs .app-tool-icon{background:linear-gradient(145deg,#167c83,#154f73)!important;color:#fff!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.32),0 9px 20px rgba(21,79,115,.18)!important}@media(max-width:620px){body.app-page{padding-bottom:calc(104px + env(safe-area-inset-bottom,0px))!important}.app-main,.hub-main{padding-bottom:54px!important}.app-tool b{display:-webkit-box!important;min-height:2.35em;overflow:hidden!important;white-space:normal!important;text-overflow:clip!important;line-height:1.18!important;-webkit-box-orient:vertical;-webkit-line-clamp:2}.app-dock-wrap{padding:5px 8px calc(5px + env(safe-area-inset-bottom,0px))!important;background:linear-gradient(180deg,rgba(243,247,251,0) 0,rgba(243,247,251,.92) 16px,rgba(243,247,251,.985) 100%)}.app-dock{min-height:60px!important;border-radius:20px!important}.app-dock-link{gap:1px!important;padding:4px 2px!important;font-size:.56rem!important;line-height:1.15!important}.app-dock-link i{width:32px!important;height:30px!important;border-radius:11px!important;font-size:1.03rem!important}.app-dock-link.active i{box-shadow:0 5px 12px rgba(22,119,232,.23)!important}}@media(max-width:370px){.app-dock-link{font-size:.52rem!important}}`;
    document.head.appendChild(s);
  }

  function normalizeHalalScannerEntry(){
    if(!document.body||document.body.dataset.page!=='home')return;
    const card=document.querySelector('.app-tools-grid .app-tool[href="/halal-scanner.html"]');
    if(!card)return;
    card.className='app-tool';
    const icon=card.querySelector('.app-tool-icon');
    if(icon){
      icon.className='app-tool-icon tone-deepgreen';
    }
    const badge=card.querySelector('.app-tool-halal-badge');
    if(badge)badge.remove();
  }

  function mountJobsInJapanEntry(){
    if(!document.body||document.body.dataset.page!=='home')return;
    const grid=document.querySelector('.app-tools-grid');
    if(!grid||grid.querySelector('[data-jobs-in-japan-entry]'))return;

    const card=document.createElement('a');
    card.className='app-tool app-tool-jobs';
    card.href='/jobs-in-japan.html';
    card.dataset.jobsInJapanEntry='1';
    card.dataset.label='Jobs in Japan';
    card.dataset.search='jobs japan baito part time townwork baitoru চাকরি কাজ আবেদন apply interview convenience restaurant';
    card.dataset.searchIcon='fa-briefcase';
    card.innerHTML='<span class="app-tool-icon tone-teal"><i class="fa-solid fa-briefcase" aria-hidden="true"></i></span><b>Jobs in Japan</b><small>কাজ খুঁজুন · আবেদন শিখুন</small>';

    const japanLife=grid.querySelector('a[href="/japan-life.html"]');
    if(japanLife&&japanLife.parentNode===grid)japanLife.insertAdjacentElement('afterend',card);else grid.prepend(card);
  }

  function ensureStylesheet(id,href){
    if(document.getElementById(id))return;
    const link=document.createElement('link');
    link.id=id;
    link.rel='stylesheet';
    link.href=href;
    document.head.appendChild(link);
  }

  function ensureScript(id,src){
    return new Promise((resolve,reject)=>{
      const existing=document.getElementById(id);
      if(existing){
        if(existing.dataset.loaded==='1'||window.AponarDailyNews){resolve();return;}
        existing.addEventListener('load',resolve,{once:true});
        existing.addEventListener('error',reject,{once:true});
        return;
      }
      const script=document.createElement('script');
      script.id=id;
      script.src=src;
      script.async=true;
      script.addEventListener('load',()=>{script.dataset.loaded='1';resolve();},{once:true});
      script.addEventListener('error',reject,{once:true});
      document.head.appendChild(script);
    });
  }

  function loadJobsEnhancer(){
    if(!document.body||document.body.dataset.page!=='jobs')return;
    if(document.getElementById('an-jobs-enhance-js'))return;
    const script=document.createElement('script');
    script.id='an-jobs-enhance-js';
    script.src='/assets/js/jobs-in-japan-enhance.js?v=20260907.1';
    script.async=true;
    document.head.appendChild(script);
  }

  async function mountHomeDailyNews(){
    if(!document.body||document.body.dataset.page!=='home')return;
    ensureStylesheet('an-daily-news-css','/assets/css/daily-news.css?v=20260904.2');
    if(!window.AponarDailyNews){
      await ensureScript('an-daily-news-js','/assets/js/daily-news.js?v=20260904.2');
    }
    if(window.AponarDailyNews&&typeof window.AponarDailyNews.mountHome==='function'){
      window.AponarDailyNews.mountHome();
    }
  }

  async function boot(){
    applyMobileLayoutFix();
    mountJobsInJapanEntry();
    normalizeHalalScannerEntry();
    setTimeout(normalizeHalalScannerEntry,0);
    loadJobsEnhancer();
    mountHomeDailyNews().catch(()=>{});
    if(!window.AN)return;
    const s=await AN.session();
    if(!s)return;
    await AN.log('page_view',{title:document.title});
    try{await AN.sb.from('profiles').update({last_active_at:new Date().toISOString()}).eq('id',s.user.id)}catch{}
    let sent=false;
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[href],button');
      if(!a||sent)return;
      const label=(a.textContent||a.getAttribute('aria-label')||'').trim().slice(0,80);
      const href=a.getAttribute('href')||'';
      if(label||href){
        sent=true;
        AN.log('interaction',{label,href}).finally(()=>setTimeout(()=>sent=false,800));
      }
    });
  }

  window.addEventListener('aponar:languagechange',()=>setTimeout(normalizeHalalScannerEntry,0));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
