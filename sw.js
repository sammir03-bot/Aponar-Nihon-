/* Aponar Nihon service-worker wrapper — app shell v28.
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

importScripts('/sw-base-v27.js');
self.addEventListener = __anNativeAddEventListener;

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
    const isN3Vocabulary = url.origin === self.location.origin &&
      (url.pathname === '/n3-vocabulary.html' || url.pathname === '/n3-vocabulary');
    const isN3Grammar = url.origin === self.location.origin &&
      (url.pathname === '/n3-grammar.html' || url.pathname === '/n3-grammar');
    const isN3MatomeGrammar = url.origin === self.location.origin &&
      (url.pathname === '/n3-matome-grammar.html' || url.pathname === '/n3-matome-grammar');
    const isHtml = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
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
