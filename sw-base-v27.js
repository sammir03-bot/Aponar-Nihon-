const STATIC_CACHE = "aponar-nihon-static-v29";
const DYNAMIC_CACHE = "aponar-nihon-dynamic-v29";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo.png",
  "/assets/css/app-shell.css?v=20260829",
  "/assets/css/tutor-pro.css?v=20260829",
  "/assets/js/app-shell.js?v=20260831.2",
  "/assets/js/tutor-pro.js?v=20260831.2",
  "/assets/css/i18n.css?v=20260831.2",
  "/assets/js/i18n.js?v=20260831.2",
  "/assets/js/i18n-content.js?v=20260831.2",
  "/n5.html",
  "/n4.html",
  "/n3.html",
  "/quiz.html",
  "/interview.html",
  "/japan-life.html",
  "/essential-phrases.html",
  "/study-guide.html",
  "/tutor-section.html",
  "/mock-test.html",
  "/aponar-nihon(1).png",
  "/ebook-library.html",
  "/student-tools.html",
  "/student-time-manager.css",
  "/student-time-manager.js",
  "/cv-builder.html",
  "/auth.html",
  "/profile.html",
  "/privacy-policy.html",
  "/delete-account.html",
  "/muslim-japan.html",
  "/jpy-bdt-remittance.html",
  "/grammar-vs.html",
  "/n3-vocabulary.html",
  "/n3-vocabulary-original.css",
  "/n3-vocabulary-parts-v2.js",

  "/admin.html",
  "/supabase-config.js",
  "/account.js",
  "/account-widget.js",
  "/activity-tracker.js",
  "/cv-jis-format.css",
  "/cv-jis-format.js",
  "/cv-parttime-v2.css",
  "/cv-parttime-v2.js",
  "/speak-japanese-today-bangla-ebook.html",
  "/japanese-conversation-bangla-ebook.html",
  "/ebook-data/sjt-pack-1.txt",
  "/ebook-data/sjt-pack-2.txt",
  "/ebook-data/sjt-pack-3.txt",
  "/ebook-data/jc-01.txt",
  "/ebook-data/jc-02.txt",
  "/ebook-data/jc-03.txt",
  "/ebook-data/jc-04.txt",
  "/ebook-data/jc-05.txt",
  "/ebook-data/jc-06.txt",
  "/ebook-data/jc-07.txt",
  "/ebook-data/jc-08.txt",
  "/ebook-data/jc-09.txt",
  "/ebook-data/jc-10.txt",
  "/ebook-data/jc-tail-1.txt",
  "/ebook-data/jc-tail-2.txt",
  "/ebook-data/jc-tail-3.txt"
];

const MAX_DYNAMIC_CACHE_ITEMS = 120;

const GUIDE_MARKER = `        <a class="app-tool-item gray" href="#guide">
          <span class="app-tool-icon"><i class="fa-solid fa-compass"></i></span>
          <strong>স্টাডি গাইড</strong><small>শেখার রোডম্যাপ</small>
        </a>`;

const EBOOK_TOOL_CARD = `        <a class="app-tool-item cyan" data-tool="ebook-library" href="ebook-library.html" aria-label="E-Book Library">
          <span class="app-tool-icon"><i class="fa-solid fa-book-open-reader"></i></span>
          <strong>E-Book</strong><small>স্টাডি লাইব্রেরি</small>
        </a>\n`;

const STUDENT_TOOL_CARD = `        <a class="app-tool-item toolkit" data-tool="student-toolkit" href="student-tools.html#toolkit" aria-label="Student Toolkit">
          <span class="app-tool-icon"><i class="fa-solid fa-toolbox"></i></span>
          <strong>Student Toolkit</strong><small>28h + বাজেট</small>
        </a>\n`;

const CV_TOOL_CARD = `        <a class="app-tool-item cvbuilder" data-tool="cv-builder" href="cv-builder.html" aria-label="Japan CV Builder">
          <span class="app-tool-icon"><i class="fa-solid fa-file-signature"></i></span>
          <strong>Japan CV Builder</strong><small>履歴書 তৈরি</small>
        </a>\n`;

const NAV_ABOUT_MARKER = `      <li><a href="#about" class="nav-item-link"><i class="fas fa-circle-info"></i><span>আমাদের সম্পর্কে</span></a></li>`;
const NAV_EXTRA_ITEMS = `      <li class="an-menu-extra"><a href="tutor-section.html" class="nav-item-link"><i class="fas fa-robot"></i><span>AI টিউটর</span></a></li>\n      <li class="an-menu-extra"><a href="mock-test.html" class="nav-item-link"><i class="fas fa-file-circle-check"></i><span>Mock Test</span></a></li>\n      <li class="an-menu-extra"><a href="ebook-library.html" class="nav-item-link"><i class="fas fa-book-open-reader"></i><span>E-Book Library</span></a></li>\n      <li class="an-menu-extra"><a href="student-tools.html#toolkit" class="nav-item-link"><i class="fas fa-toolbox"></i><span>Student Toolkit</span></a></li>\n      <li class="an-menu-extra"><a href="cv-builder.html" class="nav-item-link"><i class="fas fa-file-signature"></i><span>Japan CV Builder</span></a></li>\n      <li class="an-menu-extra"><a href="profile.html" class="nav-item-link"><i class="fas fa-user-circle"></i><span>Student Profile</span></a></li>\n      <li class="an-menu-extra"><a href="auth.html" class="nav-item-link"><i class="fas fa-right-to-bracket"></i><span>Login / Register</span></a></li>\n`;

const HOME_ACCOUNT_UI = `
<style id="an-account-ui-style">
.an-account-pill{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;min-height:42px!important;padding:0 12px!important;border:1px solid #d7e4ef!important;border-radius:13px!important;background:#fff!important;color:#17436f!important;text-decoration:none!important;font:800 11px/1 'Inter','Noto Sans Bengali',sans-serif!important;box-shadow:0 5px 15px rgba(23,59,94,.08)!important;white-space:nowrap!important}
@media(max-width:620px){.an-account-pill{min-height:38px!important;padding:0 9px!important;font-size:9px!important}}
</style>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/supabase-config.js"></script>
<script src="/account.js"></script>
<script>window.addEventListener('DOMContentLoaded',async()=>{try{const btn=document.querySelector('.app-classic-menu-btn');if(!btn||document.querySelector('.an-account-pill'))return;const a=document.createElement('a');a.className='an-account-pill';const ss=await AN.session();if(!ss){a.href='/auth.html';a.textContent='Login / Register'}else{const p=await AN.profile();a.href='/profile.html';a.textContent=p?.full_name?('👤 '+p.full_name.split(' ')[0]):'👤 Profile'}btn.parentNode.insertBefore(a,btn);await AN.log('home_view',{module:'home'})}catch(e){}})</script>`;

const COMPACT_HOME_STYLE = `
<style id="important-section-compact-v3">
@media(max-width:767px){
  .app-home-screen{padding-left:10px!important;padding-right:10px!important;padding-bottom:24px!important}
  .app-tools-card{margin-top:12px!important;padding:13px 7px 10px!important;border-radius:22px!important}
  .app-card-heading{padding:0 5px 7px!important}
  .app-card-heading span{font-size:9px!important}
  .app-card-heading h2{margin-top:1px!important;font-size:17px!important;line-height:1.16!important}
  .app-card-heading>a{width:34px!important;height:34px!important;border-radius:11px!important}
  .app-tools-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;column-gap:1px!important;row-gap:4px!important;align-items:start!important;grid-auto-rows:min-content!important}
  .app-tool-item{min-width:0!important;min-height:0!important;height:auto!important;padding:0!important;margin:0!important;gap:0!important;align-self:start!important}
  .app-tool-icon{width:47px!important;height:47px!important;border-radius:14px!important;margin:0 auto 3px!important;font-size:18px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 5px 11px rgba(38,62,89,.13)!important}
  .app-tool-icon b{font-size:15px!important;letter-spacing:-.35px!important}
  .app-tool-item strong{width:100%!important;min-height:18px!important;margin:0!important;font-size:9.4px!important;line-height:1.05!important;font-weight:800!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;display:flex!important;align-items:flex-start!important;justify-content:center!important}
  .app-tool-item small{width:100%!important;min-height:10px!important;margin-top:0!important;font-size:6.9px!important;line-height:1.02!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
}
@media(max-width:380px){
  .app-tools-card{padding-left:6px!important;padding-right:6px!important}
  .app-tools-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;column-gap:1px!important;row-gap:3px!important}
  .app-tool-icon{width:44px!important;height:44px!important;border-radius:13px!important;font-size:17px!important;margin-bottom:3px!important}
  .app-tool-icon b{font-size:14px!important}
  .app-tool-item strong{font-size:8.8px!important;min-height:17px!important}
  .app-tool-item small{font-size:6.6px!important;min-height:9px!important}
}
.app-tool-item.toolkit .app-tool-icon{background:linear-gradient(145deg,#14b8a6 0%,#0f766e 100%)!important;color:#fff!important}
.app-tool-item.cvbuilder .app-tool-icon{background:linear-gradient(145deg,#2563eb 0%,#173f68 100%)!important;color:#fff!important}
</style>`;

const MAZII_MENU_STYLE = `
<style id="aponar-mazii-menu-v2">
@media(max-width:1023px){
  .navbar.app-classic-header .nav-menu{
    display:block!important;
    position:fixed!important;
    inset:0 auto 0 0!important;
    top:0!important;
    left:-110%!important;
    right:auto!important;
    width:min(80vw,420px)!important;
    min-width:280px!important;
    height:100dvh!important;
    max-height:none!important;
    margin:0!important;
    padding:96px 18px 28px!important;
    border:0!important;
    border-radius:0!important;
    background:linear-gradient(180deg,#1978dc 0%,#1268c3 52%,#0b579f 100%)!important;
    box-shadow:none!important;
    overflow-y:auto!important;
    overscroll-behavior:contain!important;
    scrollbar-width:none!important;
    z-index:1450!important;
    transition:left .34s cubic-bezier(.22,.8,.26,1)!important;
  }
  .navbar.app-classic-header .nav-menu::-webkit-scrollbar{display:none!important}
  .navbar.app-classic-header .nav-menu.active{
    left:0!important;
    right:auto!important;
    box-shadow:18px 0 48px rgba(7,37,72,.30),0 0 0 100vmax rgba(7,18,34,.42)!important;
  }

  .navbar.app-classic-header .nav-menu::before{
    content:"APONAR NIHON";
    position:absolute!important;
    top:0!important;
    left:0!important;
    right:0!important;
    min-height:82px!important;
    display:flex!important;
    align-items:center!important;
    padding:15px 70px 15px 82px!important;
    background:url('/logo.png') 20px center/48px 48px no-repeat,rgba(255,255,255,.055)!important;
    border-bottom:1px solid rgba(255,255,255,.13)!important;
    color:#fff!important;
    font-family:'Inter','Noto Sans Bengali',sans-serif!important;
    font-size:19px!important;
    line-height:1.2!important;
    font-weight:900!important;
    letter-spacing:.04em!important;
    white-space:nowrap!important;
  }

  .navbar.app-classic-header .nav-menu li{
    display:block!important;
    width:100%!important;
    margin:0!important;
    padding:0!important;
    list-style:none!important;
    opacity:1!important;
    transform:none!important;
    transition:none!important;
  }
  .navbar.app-classic-header .nav-menu li:nth-child(6),
  .navbar.app-classic-header .nav-menu li:nth-child(14){
    margin-top:12px!important;
    padding-top:12px!important;
    border-top:1px solid rgba(255,255,255,.16)!important;
  }

  .navbar.app-classic-header .nav-menu a,
  .navbar.app-classic-header .nav-menu a:hover,
  .navbar.app-classic-header .nav-menu a.active{
    width:100%!important;
    min-height:54px!important;
    display:flex!important;
    align-items:center!important;
    justify-content:flex-start!important;
    gap:15px!important;
    padding:11px 12px!important;
    margin:0!important;
    border:0!important;
    border-radius:11px!important;
    background:transparent!important;
    color:#fff!important;
    box-shadow:none!important;
    text-decoration:none!important;
    font-family:'Noto Sans Bengali','Inter',sans-serif!important;
    font-size:16px!important;
    line-height:1.25!important;
    font-weight:700!important;
    transform:none!important;
    transition:background .16s ease,transform .12s ease!important;
  }
  .navbar.app-classic-header .nav-menu a:hover,
  .navbar.app-classic-header .nav-menu a.active{background:rgba(255,255,255,.115)!important}
  .navbar.app-classic-header .nav-menu a:active{background:rgba(255,255,255,.18)!important;transform:scale(.985)!important}
  .navbar.app-classic-header .nav-menu a i{
    flex:0 0 35px!important;
    width:35px!important;
    height:35px!important;
    display:grid!important;
    place-items:center!important;
    margin:0!important;
    padding:0!important;
    border:0!important;
    border-radius:0!important;
    background:transparent!important;
    color:#fff!important;
    box-shadow:none!important;
    font-size:21px!important;
    opacity:.96!important;
  }
  .navbar.app-classic-header .nav-menu a span{
    min-width:0!important;
    color:inherit!important;
    white-space:normal!important;
    overflow-wrap:anywhere!important;
  }

  .navbar.app-classic-header .app-classic-menu-btn.active,
  .navbar.app-classic-header .app-classic-menu-btn.active:hover{
    position:fixed!important;
    top:17px!important;
    left:calc(min(80vw,420px) - 62px)!important;
    right:auto!important;
    width:48px!important;
    height:48px!important;
    z-index:1600!important;
    border-radius:14px!important;
    border:1px solid rgba(255,255,255,.42)!important;
    background:rgba(255,255,255,.16)!important;
    box-shadow:none!important;
    backdrop-filter:none!important;
    -webkit-backdrop-filter:none!important;
    transform:none!important;
  }
  .navbar.app-classic-header .app-classic-menu-btn.active .hamburger{width:25px!important;height:20px!important}
  .navbar.app-classic-header .app-classic-menu-btn.active .hamburger span{height:3px!important;background:#fff!important}
}
@media(max-width:370px){
  .navbar.app-classic-header .nav-menu{width:84vw!important;min-width:0!important;padding-left:14px!important;padding-right:14px!important}
  .navbar.app-classic-header .nav-menu a,.navbar.app-classic-header .nav-menu a:hover,.navbar.app-classic-header .nav-menu a.active{font-size:14px!important;min-height:50px!important;padding:9px 10px!important;gap:12px!important}
  .navbar.app-classic-header .nav-menu a i{width:31px!important;height:31px!important;flex-basis:31px!important;font-size:18px!important}
  .navbar.app-classic-header .app-classic-menu-btn.active,.navbar.app-classic-header .app-classic-menu-btn.active:hover{left:calc(84vw - 58px)!important;width:44px!important;height:44px!important}
}
</style>`;

const GLOBAL_ACTIVITY_SCRIPTS = `
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/supabase-config.js"></script>
<script src="/account.js"></script>
<script src="/activity-tracker.js"></script>`;

function injectGlobalActivity(html){
  if(!html.includes('/activity-tracker.js') && html.includes('</body>')){
    html = html.replace('</body>',GLOBAL_ACTIVITY_SCRIPTS + '\n</body>');
  }
  return html;
}

function injectHomeEnhancements(html){
  if(!html.includes('data-tool="ebook-library"') && html.includes(GUIDE_MARKER)){
    html = html.replace(GUIDE_MARKER,EBOOK_TOOL_CARD + GUIDE_MARKER);
  }
  if(!html.includes('data-tool="student-toolkit"') && html.includes(GUIDE_MARKER)){
    html = html.replace(GUIDE_MARKER,STUDENT_TOOL_CARD + GUIDE_MARKER);
  }
  if(!html.includes('data-tool="cv-builder"') && html.includes(GUIDE_MARKER)){
    html = html.replace(GUIDE_MARKER,CV_TOOL_CARD + GUIDE_MARKER);
  }
  if(!html.includes('class="an-menu-extra"') && html.includes(NAV_ABOUT_MARKER)){
    html = html.replace(NAV_ABOUT_MARKER,NAV_EXTRA_ITEMS + NAV_ABOUT_MARKER);
  }
  if(!html.includes('id="important-section-compact-v3"') && html.includes('</head>')){
    html = html.replace('</head>',COMPACT_HOME_STYLE + '\n' + MAZII_MENU_STYLE + '\n</head>');
  }else if(!html.includes('id="aponar-mazii-menu-v2"') && html.includes('</head>')){
    html = html.replace('</head>',MAZII_MENU_STYLE + '\n</head>');
  }
  return html;
}

async function enhanceHomeHtml(response,requestUrl){
  if(!response || !response.ok) return response;
  const url = new URL(requestUrl);
  const isHome = url.origin === self.location.origin && (url.pathname === '/' || url.pathname === '/index.html');
  if(!isHome) return response;
  const contentType = response.headers.get('content-type') || '';
  if(!contentType.includes('text/html')) return response;
  try{
    let html = await response.text();
    html = injectGlobalActivity(html);
    html = injectHomeEnhancements(html);
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }catch(error){
    console.warn('Homepage enhancement skipped:',error);
    return response;
  }
}

async function trimCache(cacheName,maxItems){
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if(keys.length > maxItems){
    await cache.delete(keys[0]);
    return trimCache(cacheName,maxItems);
  }
}

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(STATIC_CACHE).then(cache=>Promise.allSettled(STATIC_ASSETS.map(asset=>cache.add(asset)))));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.map(key=>(key!==STATIC_CACHE && key!==DYNAMIC_CACHE)?caches.delete(key):null)))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if(isSameOrigin && url.pathname === '/google-maps-config.js'){
    event.respondWith(fetch(request,{cache:'no-store'}).catch(()=>new Response("window.AN_GOOGLE_MAPS_KEY='';\n",{headers:{'content-type':'application/javascript; charset=utf-8'}})));
    return;
  }

  if(isSameOrigin && url.pathname.startsWith('/ebook-data/')){
    const cleanRequest = new Request(url.origin + url.pathname,{method:'GET',credentials:'same-origin'});
    event.respondWith(
      caches.match(cleanRequest).then(cached=>cached || fetch(request).then(response=>{
        if(response && response.ok){
          const copy = response.clone();
          caches.open(STATIC_CACHE).then(cache=>cache.put(cleanRequest,copy));
        }
        return response;
      }).catch(()=>caches.match(request,{ignoreSearch:true})))
    );
    return;
  }

  if(request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')){
    event.respondWith(
      fetch(request).then(async networkResponse=>{
        const finalResponse = await enhanceHomeHtml(networkResponse,request.url);
        if(isSameOrigin && finalResponse && finalResponse.ok){
          const copy = finalResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache=>{
            cache.put(request,copy);
            trimCache(DYNAMIC_CACHE,MAX_DYNAMIC_CACHE_ITEMS);
          });
        }
        return finalResponse;
      }).catch(()=>caches.match(request,{ignoreSearch:true}).then(async cached=>{
        const fallback = cached || await caches.match('/index.html') || await caches.match('/');
        return fallback ? enhanceHomeHtml(fallback,request.url) : fallback;
      }))
    );
    return;
  }

  if(isSameOrigin && (url.pathname.endsWith('.css') || url.pathname.endsWith('.js'))){
    event.respondWith(
      fetch(request).then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(DYNAMIC_CACHE).then(cache=>{
            cache.put(request,copy);
            trimCache(DYNAMIC_CACHE,MAX_DYNAMIC_CACHE_ITEMS);
          });
        }
        return response;
      }).catch(()=>caches.match(request))
    );
    return;
  }

  if(isSameOrigin && (request.destination === 'image' || /\.(png|jpg|jpeg|webp|svg)$/i.test(url.pathname))){
    event.respondWith(
      caches.match(request).then(cached=>cached || fetch(request).then(response=>{
        if(response && response.ok){
          const copy = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache=>{
            cache.put(request,copy);
            trimCache(DYNAMIC_CACHE,MAX_DYNAMIC_CACHE_ITEMS);
          });
        }
        return response;
      }).catch(()=>caches.match('/logo.png')))
    );
    return;
  }

  event.respondWith(
    fetch(request).then(response=>{
      if(isSameOrigin && response && response.ok){
        const copy = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache=>{
          cache.put(request,copy);
          trimCache(DYNAMIC_CACHE,MAX_DYNAMIC_CACHE_ITEMS);
        });
      }
      return response;
    }).catch(()=>caches.match(request,{ignoreSearch:true}))
  );
});
