/* Run 35 — study apps chrome i18n loader.
   The Listening Lab and Revision apps (assets/js/listening-lab.js,
   listening-workspace.js, jlpt-revision.js, revision-workspace.js and
   the shared renderer assets/js/study-shared.js) hardcode their
   Bengali UI chrome — and the two self-contained apps also carry
   inline Bengali lesson/card data (listening-lab `lessons`,
   jlpt-revision `K` / `modules`). This loader fetches the
   per-language sidecar (assets/i18n/data/study.<lang>.json — one flat
   exact-source map for the whole union set) and exposes
   window.AponarStudyT(source) for the apps' T() wraps and data
   walkers. Japanese content (prompts, options' Japanese, furigana
   HTML, readings) is never a map key and is never touched.
   bn is a strict no-op: nothing is fetched, AponarStudyT stays the
   identity, AponarStudyReady resolves false, and the apps render
   exactly as before. Keys and lookups are NFC-normalized on both
   sides (the U+09DF lesson of Run 12). Language is resolved exactly
   like AponarDyn: AponarDynLang, else data-language-preset, else the
   URL's first segment, else bn. A failed sidecar fetch keeps the
   Bengali originals as the graceful fallback. */
(function () {
  'use strict';
  function resolveLang() {
    if (window.AponarDynLang) { try { return window.AponarDynLang(); } catch (e) { /* fall through */ } }
    var preset = document.documentElement.getAttribute('data-language-preset');
    if (preset) return preset;
    var seg = (location.pathname.split('/').filter(Boolean) || [])[0] || '';
    return /^[a-z]{2,3}$/.test(seg) ? seg : 'bn';
  }
  function norm(s) { return typeof s === 'string' && s.normalize ? s.normalize('NFC') : s; }

  var map = null;
  window.AponarStudyT = function (source) {
    if (!map || typeof source !== 'string') return source;
    var hit = map[norm(source)];
    return typeof hit === 'string' ? hit : source;
  };
  window.AponarStudyLang = resolveLang();

  var lang = window.AponarStudyLang;
  if (!lang || lang === 'bn') {
    window.AponarStudyReady = Promise.resolve(false);
    return;
  }
  window.AponarStudyReady = fetch('/assets/i18n/data/study.' + lang + '.json')
    .then(function (r) { if (!r.ok) throw new Error('study sidecar'); return r.json(); })
    .then(function (data) {
      if (!data || typeof data !== 'object') return false;
      map = {};
      for (var k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k)) map[norm(k)] = data[k];
      }
      return true;
    })
    .catch(function () { map = null; return false; });
})();
