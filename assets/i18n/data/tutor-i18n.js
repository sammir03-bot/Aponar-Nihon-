/* Run 31 — AI Tutor i18n loader.
   tutor-pro.js carries its UI strings as Bengali
   literals and resolves them through window.AponarTutorT(source), an
   exact-source-match lookup defined here. On non-bn pages this loader
   fetches the per-language sidecar (assets/i18n/data/tutor.<lang>.js,
   which sets window.AponarTutorData) and installs it as the lookup map;
   window.AponarTutorReady resolves once the map is installed (or false
   on failure, keeping the Bengali originals as the graceful fallback).
   bn is a strict no-op: nothing is fetched, the lookup stays the
   identity, and the tutor renders exactly as before. Keys and lookups
   are NFC-normalized on both sides (the U+09DF lesson of Run 12: the
   same Bengali string can be stored precomposed or decomposed and must
   still match). Language is resolved exactly like AponarDyn:
   data-language-preset, else the URL's first segment, else bn. */
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
  window.AponarTutorT = function (source) {
    if (!map || typeof source !== 'string') return source;
    var hit = map[norm(source)];
    return typeof hit === 'string' ? hit : source;
  };

  var lang = resolveLang();
  if (!lang || lang === 'bn') {
    window.AponarTutorReady = Promise.resolve(false);
    return;
  }
  window.AponarTutorReady = new Promise(function (resolve) {
    var s = document.createElement('script');
    s.src = '/assets/i18n/data/tutor.' + lang + '.js';
    s.onload = function () {
      var data = window.AponarTutorData;
      if (data && typeof data === 'object') {
        map = {};
        for (var k in data) {
          if (Object.prototype.hasOwnProperty.call(data, k)) map[norm(k)] = data[k];
        }
        resolve(true);
      } else {
        resolve(false);
      }
    };
    s.onerror = function () { resolve(false); };
    document.head.appendChild(s);
  });
})();
