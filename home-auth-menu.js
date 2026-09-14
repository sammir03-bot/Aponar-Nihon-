(()=>{
  'use strict';

  const MENU_SCRIPT='/assets/js/app-menu.js?v=20260914.1';
  const MENU_STYLE='/assets/css/app-menu.css?v=20260914.1';
  const ACTION_ID='anHomeAccountAction';
  let lastState=null;

  function findAction(){
    return document.getElementById(ACTION_ID)
      || document.querySelector('.app-top-actions a[href="/profile.html"]')
      || document.querySelector('.app-top-actions .app-profile-link')
      || document.querySelector('.app-top-actions [aria-label="প্রোফাইল"]')
      || document.querySelector('.app-top-actions [aria-label="Profile"]');
  }

  function fallbackSession(){
    try{
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i)||'';
        if(!/^sb-.*-auth-token$/.test(key)) continue;
        const raw=localStorage.getItem(key);
        if(!raw) continue;
        const data=JSON.parse(raw);
        const session=data?.currentSession || data;
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
    return fallbackSession();
  }

  function ensureMenuStyle(){
    if(document.querySelector('link[data-an-home-menu-style]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=MENU_STYLE;
    link.dataset.anHomeMenuStyle='true';
    document.head.appendChild(link);
  }

  function openExistingMenu(button){
    const layer=document.getElementById('appMenu');
    if(!layer) return false;
    layer.hidden=false;
    document.body.classList.add('app-menu-open');
    document.querySelectorAll('[data-app-menu-open]').forEach(el=>el.setAttribute('aria-expanded','true'));
    requestAnimationFrame(()=>{
      layer.classList.add('is-open');
      layer.querySelector('.app-menu-close')?.focus({preventScroll:true});
    });
    button.setAttribute('aria-expanded','true');
    return true;
  }

  function ensureMenuScript(button){
    ensureMenuStyle();
    if(document.getElementById('appMenu')){
      if(!button.dataset.anExistingMenuBound){
        button.dataset.anExistingMenuBound='true';
        button.addEventListener('click',()=>openExistingMenu(button));
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

  function renderLoggedIn(action){
    let button=action;
    if(action.tagName!=='BUTTON'){
      button=document.createElement('button');
      button.type='button';
      button.className=action.className || 'app-icon-button';
      button.id=ACTION_ID;
      action.replaceWith(button);
    }
    button.id=ACTION_ID;
    button.type='button';
    button.classList.add('app-icon-button');
    button.removeAttribute('href');
    button.setAttribute('aria-label','মেনু');
    button.setAttribute('title','মেনু');
    button.setAttribute('data-app-menu-open','');
    button.setAttribute('aria-expanded','false');
    button.innerHTML='<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    ensureMenuScript(button);
  }

  function renderLoggedOut(action){
    let link=action;
    if(action.tagName!=='A'){
      link=document.createElement('a');
      link.className=action.className || 'app-icon-button';
      link.id=ACTION_ID;
      action.replaceWith(link);
    }
    link.id=ACTION_ID;
    link.classList.add('app-icon-button');
    link.href='/profile.html';
    link.removeAttribute('data-app-menu-open');
    link.removeAttribute('aria-expanded');
    link.setAttribute('aria-label','প্রোফাইল');
    link.setAttribute('title','প্রোফাইল');
    link.innerHTML='<i class="fa-solid fa-user" aria-hidden="true"></i>';
  }

  async function sync(){
    const action=findAction();
    if(!action) return;
    const session=await getSession();
    const loggedIn=!!session;
    if(loggedIn) renderLoggedIn(action);
    else renderLoggedOut(action);
    lastState=loggedIn;
  }

  function boot(){
    sync();
    [250,700,1500,3000].forEach(ms=>setTimeout(sync,ms));
    window.addEventListener('an-auth-changed',sync);
    window.addEventListener('storage',event=>{
      if(event.key && /^sb-.*-auth-token$/.test(event.key)) sync();
    });
    try{
      const client=window.AN?.client || window.ANAuth?.client;
      client?.auth?.onAuthStateChange?.(()=>setTimeout(sync,0));
    }catch(_){ }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
