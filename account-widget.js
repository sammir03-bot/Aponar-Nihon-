(()=>{
  const ACCOUNT_ID='anHeaderAccount';
  const INSTALL_ID='anSmartInstallCard';
  let deferredInstallPrompt=null;

  function T(s) { return window.AponarAppT ? window.AponarAppT(s) : s; }
  function addStyles(){
    if(document.getElementById('anAccountWidgetStyles'))return;
    const style=document.createElement('style');
    style.id='anAccountWidgetStyles';
    style.textContent=`
      #${ACCOUNT_ID}{flex:0 0 auto!important;height:42px!important;min-width:42px!important;padding:0 12px!important;border-radius:14px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;text-decoration:none!important;box-sizing:border-box!important;border:1px solid rgba(24,105,165,.16)!important;background:linear-gradient(180deg,#fff 0%,#f6fbff 100%)!important;color:#176aa5!important;font-family:'Noto Sans Bengali','Inter',system-ui,sans-serif!important;font-size:11px!important;font-weight:900!important;line-height:1!important;white-space:nowrap!important;box-shadow:0 8px 22px rgba(24,78,122,.10)!important;overflow:hidden!important}
      #${ACCOUNT_ID} .an-header-avatar-fallback{width:26px!important;height:26px!important;border-radius:9px!important;display:grid!important;place-items:center!important;background:#eaf5fc!important;color:#176aa5!important;font-size:14px!important}
      #${ACCOUNT_ID}:active{transform:scale(.97)!important}
      @media(max-width:520px){.navbar .nav-container{gap:8px!important}.navbar .logo{min-width:0!important;flex:1 1 auto!important}#${ACCOUNT_ID}{width:42px!important;height:42px!important;min-width:42px!important;padding:0!important}.an-account-label{display:none!important}}
      @media(max-width:370px){#${ACCOUNT_ID}{width:38px!important;height:38px!important;min-width:38px!important;border-radius:12px!important}#${ACCOUNT_ID} .an-header-avatar-fallback{width:24px!important;height:24px!important;border-radius:8px!important}}

      .app-tool-item.muslim-japan .app-tool-icon{background:linear-gradient(145deg,#22a879 0%,#08735f 100%)!important;color:#fff!important}
      .app-tool-item.grammar-vs .app-tool-icon{background:linear-gradient(145deg,#8b5cf6 0%,#5b36a6 100%)!important;color:#fff!important}
      .app-tool-item.money-bd .app-tool-icon{background:linear-gradient(145deg,#19a8c7 0%,#1766a6 100%)!important;color:#fff!important}

      #${INSTALL_ID}{position:relative;overflow:hidden;display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:13px;width:calc(100% - 20px);max-width:1180px;margin:16px auto 18px;padding:16px 17px;border:1px solid rgba(47,108,166,.13);border-radius:24px;background:linear-gradient(120deg,#fff 0%,#f7fbff 54%,#edf6ff 100%);box-shadow:0 14px 38px rgba(28,72,112,.09);font-family:'Noto Sans Bengali','Inter',system-ui,sans-serif;color:#183d61;isolation:isolate}
      #${INSTALL_ID}:before{content:'';position:absolute;width:160px;height:160px;border-radius:50%;right:74px;top:-82px;background:rgba(255,107,107,.10);z-index:-1}
      .an-install-logo{width:58px;height:58px;border-radius:18px;background:#fff;display:grid;place-items:center;box-shadow:0 8px 22px rgba(20,74,117,.10);border:1px solid #e5edf4;overflow:hidden}
      .an-install-logo img{width:50px;height:50px;object-fit:contain}
      .an-install-copy{min-width:0}.an-install-copy strong{display:block;font-size:17px;line-height:1.25;font-weight:900;color:#173b5e}.an-install-copy span{display:block;margin-top:4px;color:#73879a;font-size:11px;line-height:1.55;font-weight:600}
      .an-install-art{position:relative;width:92px;height:54px;flex:0 0 92px;overflow:hidden}
      .an-install-sun{position:absolute;width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#ff8b81,#f25f66);right:5px;top:0;opacity:.92}
      .an-install-mountain{position:absolute;left:2px;bottom:-1px;font-size:44px;line-height:1;filter:saturate(.85)}
      .an-install-btn{height:44px;min-width:100px;padding:0 17px;border:0;border-radius:15px;background:linear-gradient(135deg,#196fc2,#315bd6);color:#fff;font:900 12px/1 'Noto Sans Bengali','Inter',sans-serif;box-shadow:0 10px 22px rgba(34,88,177,.22);cursor:pointer;white-space:nowrap}.an-install-btn:active{transform:scale(.97)}
      .an-install-close{width:38px;height:38px;border:0;border-radius:13px;background:#edf2f7;color:#667b8e;font-size:22px;display:grid;place-items:center;cursor:pointer}
      .an-install-note{grid-column:2/-1;display:none;margin-top:-4px;padding:8px 10px;border-radius:11px;background:#edf7ff;color:#39739d;font-size:10px;font-weight:700;line-height:1.45}
      .an-install-note.show{display:block}
      @media(max-width:680px){#${INSTALL_ID}{grid-template-columns:auto minmax(0,1fr) auto;gap:10px;padding:14px 13px;border-radius:22px}.an-install-logo{width:52px;height:52px;border-radius:16px}.an-install-logo img{width:45px;height:45px}.an-install-copy strong{font-size:15px}.an-install-copy span{font-size:9.5px}.an-install-art{display:none}.an-install-btn{grid-column:2;height:40px;min-width:0;width:max-content;padding:0 16px}.an-install-close{position:absolute;right:10px;top:10px;width:32px;height:32px;border-radius:11px;font-size:19px}.an-install-copy{padding-right:32px}.an-install-note{grid-column:1/-1;margin-top:0}}
      @media(max-width:390px){#${INSTALL_ID}{width:calc(100% - 18px);margin-top:12px}.an-install-copy strong{font-size:14px}.an-install-copy span{font-size:9px}.an-install-btn{font-size:11px}}
    `;
    document.head.appendChild(style);
  }

  function updateBottomNav(){
    const cv=document.querySelector('.app-bottom-nav [data-nav="jlpt"]');
    if(cv){cv.href='/cv-builder.html';cv.setAttribute('aria-label','CV Builder');const i=cv.querySelector('i');if(i)i.className='fa-solid fa-file-signature';const l=cv.querySelector('.app-nav-label');if(l)l.textContent='CV BUILDER'}
    const mock=document.querySelector('.app-bottom-nav [data-nav="quiz"]');
    if(mock){mock.href='/mock-test.html';mock.setAttribute('aria-label','Mock Test');const i=mock.querySelector('i');if(i)i.className='fa-solid fa-clipboard-check';const l=mock.querySelector('.app-nav-label');if(l)l.textContent='Mock Test'}
    const profile=document.querySelector('.app-bottom-nav [data-nav="japan"]');
    if(profile){profile.href='/profile.html';profile.setAttribute('aria-label','Profile');const i=profile.querySelector('i');if(i)i.className='fa-solid fa-circle-user';const l=profile.querySelector('.app-nav-label');if(l)l.textContent='Profile'}
  }

  function mountSuperFeatures(){
    if(!/^\/$|\/index\.html$/i.test(location.pathname))return;
    const grid=document.querySelector('.app-tools-grid');
    if(grid){
      const guide=grid.querySelector('a[href="#guide"]');
      const items=[
        {key:'grammar-vs',cls:'grammar-vs',href:'/grammar-vs.html',icon:'fa-code-compare',title:'Grammar VS',sub:'N5 · N4 · N3'},
        {key:'muslim-japan',cls:'muslim-japan',href:'/muslim-japan.html',icon:'fa-mosque',title:'Muslim Japan',sub:T('নামাজ · হালাল')},
        {key:'money-bd',cls:'money-bd',href:'/jpy-bdt-remittance.html',icon:'fa-money-bill-transfer',title:'JPY ↔ BDT',sub:T('রেট · রেমিট্যান্স')}
      ];
      items.forEach(x=>{
        if(grid.querySelector(`[data-tool="${x.key}"]`))return;
        const a=document.createElement('a');a.className=`app-tool-item ${x.cls}`;a.dataset.tool=x.key;a.href=x.href;a.setAttribute('aria-label',x.title);a.innerHTML=`<span class="app-tool-icon"><i class="fa-solid ${x.icon}"></i></span><strong>${x.title}</strong><small>${x.sub}</small>`;
        guide?grid.insertBefore(a,guide):grid.appendChild(a);
      });
    }
    const nav=document.querySelector('.nav-menu');
    if(nav){
      const about=nav.querySelector('a[href="#about"]')?.closest('li');
      const links=[
        ['grammar-vs','/grammar-vs.html','fa-code-compare','Grammar VS'],
        ['muslim-japan','/muslim-japan.html','fa-mosque','Muslim Japan'],
        ['money-bd','/jpy-bdt-remittance.html','fa-money-bill-transfer','JPY ↔ BDT']
      ];
      links.forEach(([key,href,icon,label])=>{
        if(nav.querySelector(`[data-an-feature="${key}"]`))return;
        const li=document.createElement('li');li.className='an-menu-extra';li.dataset.anFeature=key;li.innerHTML=`<a href="${href}" class="nav-item-link"><i class="fas ${icon}"></i><span>${label}</span></a>`;about?nav.insertBefore(li,about):nav.appendChild(li);
      });
    }
  }

  function cleanupLegacy(){
    document.querySelectorAll('#anAccountWidget,#anHeaderAccount,.an-account-pill,.an-account-inline,[data-an-header-account]').forEach(el=>el.remove());
  }

  function toggleMenuAccount(loggedIn){
    document.querySelectorAll('.nav-menu a,.mobile-menu a').forEach(a=>{
      const href=(a.getAttribute('href')||'').split('?')[0];
      if(/(^|\/)auth\.html(?:#.*)?$/.test(href))a.closest('li')?.style.setProperty('display',loggedIn?'none':'block','important');
      if(/(^|\/)profile\.html$/.test(href))a.closest('li')?.style.setProperty('display',loggedIn?'block':'none','important');
    });
  }

  async function renderAccount(){
    if(!window.AN)return;
    cleanupLegacy();updateBottomNav();mountSuperFeatures();
    const menu=document.querySelector('.app-classic-menu-btn,#menuToggle');
    if(!menu||!menu.parentNode)return;
    const s=await AN.session();
    toggleMenuAccount(!!s);

    if(s){
      cleanupLegacy();
      try{await AN.ensureProfile()}catch(_){ }
      setTimeout(cleanupLegacy,350);
      setTimeout(cleanupLegacy,1200);
      return;
    }

    let a=document.getElementById(ACCOUNT_ID);
    if(!a){a=document.createElement('a');a.id=ACCOUNT_ID;menu.parentNode.insertBefore(a,menu)}
    a.href='/auth.html';
    a.setAttribute('aria-label','Login / Register');
    a.innerHTML='<span class="an-header-avatar-fallback"><i class="fa-solid fa-user" aria-hidden="true"></i></span><span class="an-account-label">Login</span>';
  }

  function isStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true}
  function recentlyDismissed(){try{const at=Number(localStorage.getItem('anInstallDismissedAt')||0);return at&&Date.now()-at<7*24*60*60*1000}catch(_){return false}}
  function installMessage(note){if(!note)return;note.textContent=/iphone|ipad|ipod/i.test(navigator.userAgent)?T('Safari-এর Share বাটন চাপুন → “Add to Home Screen” নির্বাচন করুন।'):T('Browser menu (⋮) খুলে “Install app” অথবা “Add to Home screen” নির্বাচন করুন।');note.classList.add('show')}
  function mountInstallCard(){
    if(isStandalone()||recentlyDismissed()||document.getElementById(INSTALL_ID))return;
    if(!/^\/$|\/index\.html$/i.test(location.pathname))return;
    const card=document.createElement('section');card.id=INSTALL_ID;card.setAttribute('aria-label','Aponar Nihon app install');
    card.innerHTML=T(`<div class="an-install-logo"><img src="/logo.png" alt="আপনার নিহোন"></div><div class="an-install-copy"><strong>আপনার নিহোন App ইনস্টল করুন</strong><span>Play Store ছাড়াই ফোনের Home Screen থেকে অ্যাপের মতো দ্রুত ব্যবহার করুন।</span></div><div class="an-install-art" aria-hidden="true"><span class="an-install-sun"></span><span class="an-install-mountain">🗻</span></div><button class="an-install-btn" type="button">Install করুন</button><button class="an-install-close" type="button" aria-label="Install banner বন্ধ করুন">×</button><div class="an-install-note" role="status"></div>`);
    const tools=document.querySelector('.app-tools-card');const home=document.querySelector('.app-home-screen,main');if(tools?.parentNode)tools.parentNode.insertBefore(card,tools);else if(home)home.prepend(card);else document.body.appendChild(card);
    const installBtn=card.querySelector('.an-install-btn'),closeBtn=card.querySelector('.an-install-close'),note=card.querySelector('.an-install-note');
    installBtn?.addEventListener('click',async()=>{if(deferredInstallPrompt){try{deferredInstallPrompt.prompt();const choice=await deferredInstallPrompt.userChoice;if(choice?.outcome==='accepted')card.remove();deferredInstallPrompt=null}catch(_){installMessage(note)}}else installMessage(note)});
    closeBtn?.addEventListener('click',()=>{try{localStorage.setItem('anInstallDismissedAt',String(Date.now()))}catch(_){ }card.remove()});
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;mountInstallCard()});
  window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;document.getElementById(INSTALL_ID)?.remove();try{localStorage.removeItem('anInstallDismissedAt')}catch(_){ }});
  function boot(){addStyles();updateBottomNav();mountSuperFeatures();setTimeout(mountSuperFeatures,450);setTimeout(mountSuperFeatures,1500);setTimeout(()=>renderAccount().catch(()=>{}),80);setTimeout(()=>renderAccount().catch(()=>{}),650);setTimeout(()=>renderAccount().catch(()=>{}),1600);setTimeout(mountInstallCard,180);setTimeout(mountInstallCard,1200)}
  window.addEventListener('an-auth-changed',()=>renderAccount().catch(()=>{}));window.addEventListener('an-profile-updated',()=>renderAccount().catch(()=>{}));
  var start36=function(){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();};
  if(window.AponarAppReady)window.AponarAppReady.then(start36);else start36();
})();