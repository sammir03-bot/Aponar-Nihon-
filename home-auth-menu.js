(()=>{
  'use strict';

  // Header auth/menu bridge. Keep the existing header design, but when a
  // Supabase session exists turn the visible top Profile action into Menu.
  const MENU_SCRIPT='/assets/js/app-menu.js?v=20260914.2';
  const MENU_STYLE='/assets/css/app-menu.css?v=20260914.2';
  let syncing=false;
  let recheckTimer=0;

  function isBottomOrDrawer(el){
    return !!el?.closest('.app-dock,.app-dock-wrap,.app-bottom-nav,.bottom-nav,.bottom-navigation,.app-menu-layer,.app-menu-drawer,.nav-menu,.mobile-menu');
  }

  function isVisibleTopAction(el){
    if(!el || isBottomOrDrawer(el)) return false;
    if(el.closest('header,.navbar,.app-topbar,.site-header,.main-header,.nav-container')) return true;
    const r=el.getBoundingClientRect();
    return r.width>0 && r.height>0 && r.bottom>0 && r.top<240;
  }

  function findProfileAction(){
    const marked=document.querySelector('[data-an-auth-header-action="true"]');
    if(marked && isVisibleTopAction(marked)) return marked;

    const selectors=[
      '.app-top-actions a[href*="profile"]',
      '.app-top-actions button[aria-label*="Profile" i]',
      'header a[href*="profile"]',
      '.navbar a[href*="profile"]',
      '.nav-container a[href*="profile"]',
      'a[href="/profile.html"]',
      'a[href="profile.html"]'
    ];

    for(const selector of selectors){
      for(const el of document.querySelectorAll(selector)){
        if(isVisibleTopAction(el)) return el;
      }
    }

    const icons=document.querySelectorAll('.fa-user,.fa-circle-user,.fa-user-circle,[class*="fa-user"]');
    for(const icon of icons){
      const el=icon.closest('a,button');
      if(el && isVisibleTopAction(el)) return el;
    }

    const labelled=document.querySelectorAll('a[aria-label],button[aria-label],a[title],button[title]');
    for(const el of labelled){
      const text=((el.getAttribute('aria-label')||'')+' '+(el.getAttribute('title')||'')).toLowerCase();
      if((text.includes('profile') || text.includes('প্রোফাইল') || text.includes('account')) && isVisibleTopAction(el)) return el;
    }
    return null;
  }

  function findLegacyMenu(action){
    const candidates=Array.from(document.querySelectorAll('#menuToggle,.app-classic-menu-btn,[data-menu-toggle]'));
    return candidates.find(el=>el!==action) || null;
  }

  function rememberOriginal(el){
    if(el.dataset.anAuthOriginalSaved==='true') return;
    el.dataset.anAuthOriginalSaved='true';
    el.dataset.anAuthOriginalHtml=el.innerHTML;
    el.dataset.anAuthOriginalHref=el.getAttribute('href') ?? '';
    el.dataset.anAuthOriginalAria=el.getAttribute('aria-label') ?? '';
    el.dataset.anAuthOriginalTitle=el.getAttribute('title') ?? '';
  }

  function restoreProfile(el){
    if(!el || el.dataset.anAuthOriginalSaved!=='true') return;
    if(el.dataset.anAuthMenuState==='profile') return;

    el.innerHTML=el.dataset.anAuthOriginalHtml || '<i class="fa-solid fa-user" aria-hidden="true"></i>';
    if(el.tagName==='A') el.setAttribute('href',el.dataset.anAuthOriginalHref || '/profile.html');

    const aria=el.dataset.anAuthOriginalAria || 'প্রোফাইল';
    el.setAttribute('aria-label',aria);
    if(el.dataset.anAuthOriginalTitle) el.setAttribute('title',el.dataset.anAuthOriginalTitle);
    else el.removeAttribute('title');

    el.removeAttribute('data-app-menu-open');
    el.removeAttribute('aria-expanded');
    el.dataset.anAuthMenuState='profile';
  }

  function ensureMenuStyle(){
    if(document.querySelector('link[data-an-home-menu-style]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=MENU_STYLE;
    link.dataset.anHomeMenuStyle='true';
    document.head.appendChild(link);
  }

  function openGeneratedMenu(action){
    const layer=document.getElementById('appMenu');
    if(!layer) return false;
    layer.hidden=false;
    document.body.classList.add('app-menu-open');
    document.querySelectorAll('[data-app-menu-open]').forEach(el=>el.setAttribute('aria-expanded','true'));
    requestAnimationFrame(()=>{
      layer.classList.add('is-open');
      layer.querySelector('.app-menu-close')?.focus({preventScroll:true});
    });
    action.setAttribute('aria-expanded','true');
    return true;
  }

  function ensureGeneratedMenu(action){
    ensureMenuStyle();
    action.setAttribute('data-app-menu-open','');
    action.setAttribute('aria-expanded','false');

    if(document.getElementById('appMenu')){
      if(action.dataset.anGeneratedMenuBound!=='true'){
        action.dataset.anGeneratedMenuBound='true';
        action.addEventListener('click',event=>{
          if(action.dataset.anAuthMenuState!=='menu') return;
          event.preventDefault();
          openGeneratedMenu(action);
        });
      }
      return;
    }

    if(document.querySelector('script[data-an-home-menu-script]')) return;
    const script=document.createElement('script');
    script.src=MENU_SCRIPT;
    script.defer=true;
    script.dataset.anHomeMenuScript='true';
    document.body.appendChild(script);
  }

  function turnIntoMenu(el){
    rememberOriginal(el);
    el.dataset.anAuthHeaderAction='true';

    const legacyMenu=findLegacyMenu(el);
    if(el.dataset.anAuthMenuState!=='menu'){
      el.dataset.anAuthMenuState='menu';
      if(el.tagName==='A') el.setAttribute('href','#');
      el.setAttribute('aria-label','মেনু');
      el.setAttribute('title','মেনু');
      el.innerHTML='<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    }

    if(legacyMenu){
      if(el.dataset.anLegacyMenuBound!=='true'){
        el.dataset.anLegacyMenuBound='true';
        el.addEventListener('click',event=>{
          if(el.dataset.anAuthMenuState!=='menu') return;
          const target=findLegacyMenu(el);
          if(!target) return;
          event.preventDefault();
          event.stopPropagation();
          target.click();
        });
      }
      return;
    }

    ensureGeneratedMenu(el);
  }

  function fallbackSession(){
    try{
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i)||'';
        if(!/^sb-.*-auth-token$/.test(key)) continue;
        const raw=localStorage.getItem(key);
        if(!raw) continue;
        const data=JSON.parse(raw);
        const session=data?.currentSession || data?.session || data;
        if(session?.access_token && session?.user) return session;
      }
    }catch(_){ }
    return null;
  }

  async function getSession(){
    try{
      if(window.AN && typeof window.AN.session==='function') return await window.AN.session();
    }catch(_){ }
    try{
      if(window.ANAuth && typeof window.ANAuth.session==='function') return await window.ANAuth.session();
    }catch(_){ }
    try{
      const client=window.AN?.client || window.ANAuth?.client || window.supabaseClient;
      if(client?.auth?.getSession) return (await client.auth.getSession()).data?.session || null;
    }catch(_){ }
    return fallbackSession();
  }

  async function sync(){
    if(syncing) return;
    syncing=true;
    try{
      const session=await getSession();
      const action=findProfileAction();
      if(!action) return;
      if(session) turnIntoMenu(action);
      else restoreProfile(action);
    }finally{
      syncing=false;
    }
  }

  function scheduleSync(){
    clearTimeout(recheckTimer);
    recheckTimer=setTimeout(sync,80);
  }

  function boot(){
    sync();
    [200,600,1200,2500,5000].forEach(ms=>setTimeout(sync,ms));
    window.addEventListener('an-auth-changed',sync);
    window.addEventListener('an-profile-updated',sync);
    window.addEventListener('storage',event=>{
      if(!event.key || /^sb-.*-auth-token$/.test(event.key)) sync();
    });

    try{
      const client=window.AN?.client || window.ANAuth?.client || window.supabaseClient;
      client?.auth?.onAuthStateChange?.(()=>setTimeout(sync,0));
    }catch(_){ }

    const observer=new MutationObserver(scheduleSync);
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
