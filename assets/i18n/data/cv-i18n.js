/* Run 32 — CV Builder i18n loader.
   cv-builder.js, cv-builder-v6.js, cv-workflow.js and cv-jis-format.js
   carry their UI strings as Bengali literals and resolve them through
   window.AponarCvT(source), an exact-source-match lookup defined here.
   On non-bn pages this loader loads the per-language sidecar
   (assets/i18n/data/cv.<lang>.js, which sets window.AponarCvData) and
   installs it as the lookup map; window.AponarCvReady resolves once the
   map is installed (or false on failure, keeping the Bengali originals
   as the graceful fallback). bn is a strict no-op: nothing is loaded,
   the lookup stays the identity, and the CV builder renders exactly as
   before. Keys and lookups are NFC-normalized on both sides (the
   U+09DF lesson of Run 12: the same Bengali string can be stored
   precomposed or decomposed and must still match). Language is resolved
   exactly like AponarDyn: AponarDynLang if present, else
   data-language-preset, else the URL's first segment, else bn.
   Difference from the Run 31 tutor loader: the CV cluster boot-renders
   synchronously while the page is still parsing (cv-builder.js calls
   load() at parse time and cv-jis-format.js reads the shared state
   immediately), so a promise-gated first render is impossible here.
   While the document is still loading, the sidecar is therefore
   written with document.write, which installs the map BEFORE
   cv-builder.js executes — no Bengali flash and no boot-logic changes
   in the app files. If the loader ever runs after parsing, it falls
   back to the async append used by the other loaders. */
(function () {
  'use strict';
  var LANGS = ['en', 'ja', 'vi', 'ne', 'hi', 'ur', 'my', 'zh', 'si', 'fil', 'id', 'ar', 'ml'];
  function resolveLang() {
    if (window.AponarDynLang) { try { return window.AponarDynLang(); } catch (e) { /* fall through */ } }
    var preset = document.documentElement.getAttribute('data-language-preset');
    if (preset) return preset;
    var seg = (location.pathname.split('/').filter(Boolean) || [])[0] || '';
    return /^[a-z]{2,3}$/.test(seg) ? seg : 'bn';
  }
  function norm(s) { return typeof s === 'string' && s.normalize ? s.normalize('NFC') : s; }

  var map = null;
  window.AponarCvT = function (source) {
    // Lazy install: a document.written sidecar executes only AFTER this
    // loader script finishes (but before any later app script), so the
    // map is picked up on the first translation call, not immediately.
    if (!map) install();
    if (!map || typeof source !== 'string') return source;
    var hit = map[norm(source)];
    return typeof hit === 'string' ? hit : source;
  };
  function install() {
    var data = window.AponarCvData;
    if (data && typeof data === 'object') {
      map = {};
      for (var k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k)) map[norm(k)] = data[k];
      }
      return true;
    }
    return false;
  }

  var lang = resolveLang();
  if (!lang || LANGS.indexOf(lang) === -1) {
    window.AponarCvReady = Promise.resolve(false);
    return;
  }
  var src = '/assets/i18n/data/cv.' + lang + '.js';
  if (document.readyState === 'loading') {
    document.write('<script src="' + src + '"><\/script>');
    window.AponarCvReady = Promise.resolve(true);
    return;
  }
  window.AponarCvReady = new Promise(function (resolve) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { resolve(install()); };
    s.onerror = function () { resolve(false); };
    document.head.appendChild(s);
  });
})();
