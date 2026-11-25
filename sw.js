/* Aponar Nihon service-worker wrapper — app shell v52 — RUN 46 (2026-11-25):
   Quartet I study guide: the book passages become the guide's main entry —
   a "বইয়ের Passage" index strip now sits at the top of the guide and
   Chapter 1 opens with its Reading Lab (the book's passages) as the first
   block; the base worker's caches are bumped to v46 in sw-base-v28.js so
   installed phones flush and pick up the restructured guide page.
   RUN 45 (2026-11-25):
   Quartet I study guide Lesson 1 pilot: Chapter 1 Reading Lab now carries
   the book's real Lesson 1 passages (verbatim) with Bengali explanations,
   the book's vocabulary list, and Chapter 1 grammar examples rebuilt
   book-first in all 14 languages; the base worker's caches are bumped to
   v45 in sw-base-v28.js so installed phones flush and pick up the new
   guide page and Quartet data sidecars.
   RUN 44 (2026-11-24):
   Home tools grid: the JLPT N2 tile takes the first-row slot (the CSS
   order rule in halal-nav.css now lists /n2.html instead of /quiz.html,
   and the two tiles swap places in index.html); the base worker's
   caches are bumped to v44 in sw-base-v28.js so installed phones flush
   and pick up the new stylesheet and home page.
   RUN 43 (2026-11-24):
   New N2 section: n2 hub master + packs in all 14 languages, the
   Quartet II card moved from the N3 hub to the N2 hub, home tile +
   journey step for N2, two DYN aria rows added to i18n.js; the base
   worker's caches are bumped to v43 in sw-base-v28.js so installed
   phones flush and pick up the new assets.
   RUN 42 (2026-11-24):
   Phase 4 (FINAL) for id/ar/ml: question-bank shards, interview, exam,
   study and news sidecars; the base worker's caches are bumped to v42 in
   sw-base-v28.js so installed phones flush and pick up the new assets.
   RUN 41 (2026-11-24):
   Phase 3 lesson data for id/ar/ml: new data sidecars (N3, Quartet,
   Run 28 families) and id/ar/ml sections in the embedded vocab/kanji/
   grammar data files; the base worker's caches are bumped to v41 in
   sw-base-v28.js so installed phones flush and pick up the new assets.
   RUN 39 (2026-11-24):
   Phase 1 chrome for id/ar/ml: DYN family values added to i18n.js and new
   app/tutor/cv sidecars; the base worker's caches are bumped to v40 in
   sw-base-v28.js so installed phones flush and pick up the new assets.
   RUN 38 (2026-11-24):
   three new languages (id, ar, ml) registered in the i18n runtime; the base
   worker's caches are bumped to v39 in sw-base-v28.js so installed phones
   flush and pick up the new assets.
   HALAL FIX (2026-11-24): wrapper caches renamed v1 -> v2 and an activate
   handler below purges the legacy v1 wrapper caches, so a phone stuck on
   an old worker self-heals on its next visit (the base worker's own caches
   were bumped to v38 in sw-base-v28.js; its install already skipWaiting()s
   and its activate
   already clients.claim()s and deletes every non-current cache).
   The dashboard, dedicated section hubs and AI Tutor assets are available
   offline after install, while updated learning pages stay network-first. */

const __anNativeAddEventListener = self.addEventListener.bind(self);
let __anLegacyFetchListener = null;

self.addEventListener = function(type, listener, options){
  if(type === 'fetch'){
    __anLegacyFetchListener = listener;
    return;
  }
  return __anNativeAddEventListener(type, listener, options);
};

importScripts('/sw-base-v28.js');
self.addEventListener = __anNativeAddEventListener;

/* HALAL FIX (2026-11-24): purge the legacy v1 wrapper caches on activate.
   The base worker's activate already deletes every non-current cache, but
   these two names belong to this wrapper — drop any version that is not
   the current v2 so stale study/content responses can never be replayed. */
const __AN_WRAPPER_CACHES = ['an-current-content-v2', 'an-study-workspaces-v2'];
__anNativeAddEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key =>
      ((key.startsWith('an-current-content-') || key.startsWith('an-study-workspaces-')) &&
        !__AN_WRAPPER_CACHES.includes(key)) ? caches.delete(key) : null
    )))
  );
});

const __AN_N3_CSS = '<link rel="stylesheet" href="/n3-vocabulary-all.css?v=5">';
const __AN_N3_EXAMPLES = '<script src="/n3-vocabulary-examples.js?v=1"></script>';
const __AN_N3_JS = '<script src="/n3-vocabulary-all.js?v=5"></script>';

async function __anEnhanceN3(response){
  if(!response || !response.ok) return response;
  const type = response.headers.get('content-type') || '';
  if(!type.includes('text/html')) return response;
  try{
    let html = await response.text();
    if(!html.includes('/n3-vocabulary-all.css')){
      html = html.replace('</head>', __AN_N3_CSS + '\n</head>');
    }
    if(!html.includes('/n3-vocabulary-examples.js')){
      html = html.replace('</body>', __AN_N3_EXAMPLES + '\n</body>');
    }
    if(!html.includes('/n3-vocabulary-all.js')){
      html = html.replace('</body>', __AN_N3_JS + '\n</body>');
    }
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.delete('etag');
    return new Response(html, {status:response.status,statusText:response.statusText,headers});
  }catch(error){
    console.warn('N3 vocabulary enhancement skipped:', error);
    return response;
  }
}

__anNativeAddEventListener('fetch', event => {
  const request = event.request;
  if(request.method === 'GET'){
    const url = new URL(request.url);
    // Public API data has its own bounded edge cache. Never cache API errors or
    // location-specific results as offline page assets.
    if (url.origin === self.location.origin && url.pathname.startsWith('/api/public/')) {
      event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ok:false,error:'offline'}), {
        status:503, headers:{'content-type':'application/json','cache-control':'no-store'}
      })));
      return;
    }
    if (url.origin === self.location.origin &&
        (url.pathname === '/assets/data/daily-news.json' || url.pathname.startsWith('/assets/data/quiz/') ||
         ['/assets/js/shin-bunka.js', '/assets/css/shin-bunka.css', '/assets/css/bunka-entry.css', '/assets/js/bottom-navigation.js', '/assets/css/bottom-navigation.css', '/assets/js/daily-news.js', '/assets/js/app-shell.js', '/assets/js/learning-hub-pro.js', '/assets/js/cv-builder.js', '/assets/js/cv-workflow.js', '/assets/js/cv-builder-v6.js', '/cv-jis-format.js', '/cv-jis-format.css', '/assets/css/cv-builder.css', '/assets/css/cv-builder-v6.css'].includes(url.pathname))) {
      event.respondWith(fetch(request, {cache:'no-store'}).then(response => {
        if (response.ok) event.waitUntil(caches.open('an-current-content-v2').then(cache => cache.put(request, response.clone())));
        return response;
      }).catch(async () => (await caches.match(request)) || new Response('', {status:503})));
      return;
    }
    const isN3Vocabulary = url.origin === self.location.origin &&
      (url.pathname === '/n3-vocabulary.html' || url.pathname === '/n3-vocabulary');
    const isN3Grammar = url.origin === self.location.origin &&
      (url.pathname === '/n3-grammar.html' || url.pathname === '/n3-grammar');
    const isN3MatomeGrammar = url.origin === self.location.origin &&
      (url.pathname === '/n3-matome-grammar.html' || url.pathname === '/n3-matome-grammar');
    const isHtml = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
    const studyPath = decodeURIComponent(url.pathname).replace(/\.html$/, '').replace(/\/$/, '');
    const isStudyPage = url.origin === self.location.origin &&
      (studyPath === '/n4' || studyPath.startsWith('/n4-shin-bunka-') ||
       ['/cv-builder', '/part-time-cv-builder', '/quiz', '/jlpt-quiz', '/daily-news', '/daily-news-reader', '/interview', '/part-time-interview', '/skype sheet', '/embassy-interview', '/listening-lab', '/jlpt-revision', '/halal-scanner', '/muslim-japan'].includes(studyPath));
    if (isStudyPage && isHtml) {
      event.respondWith(
        fetch(request, {cache:'no-store'}).then(response => {
          if (response.ok) {
            event.waitUntil(caches.open('an-study-workspaces-v2').then(cache => cache.put(request, response.clone())));
          }
          return response;
        }).catch(async () => {
          const cached = await caches.match(request, {ignoreSearch:true});
          return cached || caches.match('/index.html');
        })
      );
      return;
    }
    if(isN3Vocabulary && isHtml){
      event.respondWith(
        fetch(request, {cache:'no-store'})
          .then(__anEnhanceN3)
          .catch(async () => {
            const cached = await caches.match('/n3-vocabulary.html', {ignoreSearch:true});
            return cached ? __anEnhanceN3(cached) : caches.match('/index.html');
          })
      );
      return;
    }
    if(isN3Grammar && isHtml){
      event.respondWith(
        fetch(request, {cache:'no-store'})
          .catch(async () => {
            const cached = await caches.match('/n3-grammar.html', {ignoreSearch:true});
            return cached || caches.match('/index.html');
          })
      );
      return;
    }
    if(isN3MatomeGrammar && isHtml){
      event.respondWith(
        fetch(request, {cache:'no-store'})
          .catch(async () => {
            const cached = await caches.match('/n3-matome-grammar.html', {ignoreSearch:true});
            return cached || caches.match('/index.html');
          })
      );
      return;
    }
  }
  if(__anLegacyFetchListener) return __anLegacyFetchListener(event);
});
