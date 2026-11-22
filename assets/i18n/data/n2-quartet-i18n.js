/* Run 29 — Quartet II guide data i18n loader.
   On non-bn pages it loads the per-language sidecars
   (n2-quartet-data.<lang>.js data + n2-quartet-attr.<lang>.js attributes),
   swaps the Bengali field values of the n2-quartet.json course structure
   in place by exact source-string match (field-path keyed), and localizes
   the guide page's static aria-labels, meta description and noscript
   fallback texts. bn is a strict no-op: nothing is loaded and nothing is
   defined. All Bengali lives in the sidecar payloads; this file is
   Bengali-free. Mirrors the Run 25 n3-quartet-i18n.js pattern; it defines
   the same window.AponarQuartetI18n(course, deep) entry point so the
   shared app (assets/js/n3-quartet.js) can call it for volume 2 too. */
(function () {
  'use strict';
  function resolveLang() {
    if (window.AponarDynLang) { try { return window.AponarDynLang(); } catch (e) { /* fall through */ } }
    var preset = document.documentElement.getAttribute('data-language-preset');
    if (preset) return preset;
    var seg = (location.pathname.split('/').filter(Boolean) || [])[0] || '';
    return /^[a-z]{2,3}$/.test(seg) ? seg : 'bn';
  }
  var lang = resolveLang();
  if (!lang || lang === 'bn') return;

  /* Chapter-count suffix: AponarDyn resolves qt.countSuffix with
     row[lang] || row.bn, so the five languages whose reviewed DYN value
     is an empty string (en, vi, hi, ur, fil) would fall back to the
     Bengali counter in the chapter dropdown. Expose the exact DYN row
     here (values extracted programmatically from i18n.js) so the app
     uses it verbatim; bn never loads this file. Same fix as the Run 25
     remnant pass applied to the N3 loader. */
  var COUNT_SUFFIX = {"en": "", "ja": "件", "vi": "", "ne": " वटा", "hi": "", "ur": "", "my": " ခု", "zh": " 个", "si": " ක්", "fil": ""};
  if (Object.prototype.hasOwnProperty.call(COUNT_SUFFIX, lang)) {
    window.AponarQuartetCountSuffix = COUNT_SUFFIX[lang];
  }

  /* Fetch the tiny attribute sidecar (the static aria-labels + meta
     description + noscript fallback texts) first, in parallel with the
     full data sidecar below, and swap the page's static attributes as
     soon as it arrives instead of after the much larger data sidecar.
     The data sidecar's qa pass at the bottom stays as the fallback and
     is an idempotent no-op when this early pass already ran. */
  var attrReady = new Promise(function (resolve) {
    var s = document.createElement('script');
    s.src = '/assets/i18n/data/n2-quartet-attr.' + lang + '.js';
    s.onload = function () { resolve(window.AponarQuartet2Attr || null); };
    s.onerror = function () { resolve(null); };
    document.head.appendChild(s);
  });

  var ready = new Promise(function (resolve) {
    var s = document.createElement('script');
    s.src = '/assets/i18n/data/n2-quartet-data.' + lang + '.js';
    s.onload = function () { resolve(window.AponarQuartet2Data || null); };
    s.onerror = function () { resolve(null); };
    document.head.appendChild(s);
  });

  function swapValue(node, path, map) {
    if (typeof node === 'string') {
      var fieldMap = map[path];
      if (fieldMap && Object.prototype.hasOwnProperty.call(fieldMap, node)) return fieldMap[node];
      return node;
    }
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) node[i] = swapValue(node[i], path, map);
      return node;
    }
    if (node && typeof node === 'object') {
      for (var k in node) node[k] = swapValue(node[k], path ? path + '.' + k : k, map);
      return node;
    }
    return node;
  }

  function applyAria(aria, metaSource, metaTarget, texts) {
    var els = document.querySelectorAll('[aria-label]');
    for (var i = 0; i < els.length; i++) {
      var v = els[i].getAttribute('aria-label');
      if (v && Object.prototype.hasOwnProperty.call(aria, v)) els[i].setAttribute('aria-label', aria[v]);
    }
    if (metaSource) {
      var md = document.querySelector('meta[name="description"]');
      if (md && md.getAttribute('content') === metaSource) md.setAttribute('content', metaTarget);
    }
    if (texts) {
      var ns = document.querySelectorAll('noscript');
      for (var n = 0; n < ns.length; n++) {
        var tc = ns[n].textContent;
        if (!tc) continue;
        for (var src in texts) {
          if (tc.indexOf(src) !== -1) tc = tc.split(src).join(texts[src]);
        }
        if (tc !== ns[n].textContent) ns[n].textContent = tc;
      }
    }
  }

  function applyAttributes(qa) {
    if (!qa) return;
    var aria = {}, metaSource = null, metaTarget = null, texts = {};
    for (var field in qa) {
      if (field.indexOf('attr.') === 0 && field.slice(-'@aria-label'.length) === '@aria-label') {
        for (var a in qa[field]) aria[a] = qa[field][a];
      } else if (field === 'attr.meta@description') {
        for (var m in qa[field]) { metaSource = m; metaTarget = qa[field][m]; }
      } else if (field === 'text.uncovered') {
        for (var t in qa[field]) texts[t] = qa[field][t];
      }
    }
    applyAria(aria, metaSource, metaTarget, texts);
  }

  window.AponarQuartetI18n = function (course, deep) {
    return ready.then(function (data) {
      if (data && data.q2) swapValue(course, '', data.q2);
    });
  };
  attrReady.then(function (attr) {
    if (attr) applyAria(attr.aria || {}, attr.meta ? attr.meta[0] : null, attr.meta ? attr.meta[1] : null, attr.texts || {});
  });
  ready.then(function (data) { if (data) applyAttributes(data.qa); });
})();
