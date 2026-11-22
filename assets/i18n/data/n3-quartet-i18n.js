/* Run 25 stage 2 — Quartet I guide data i18n loader.
   On non-bn pages it loads the per-language sidecar
   (n3-quartet-data.<lang>.js), swaps the Bengali field values of the
   course/deep JSON structures in place by exact source-string match
   (field-path keyed), and localizes the guide page's static aria-labels.
   bn is a strict no-op: nothing is loaded and nothing is defined.
   All Bengali lives in the sidecar payloads; this file is Bengali-free. */
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

  /* Remnant fix (Run 25 follow-up): AponarDyn resolves qt.countSuffix with
     row[lang] || row.bn, so the five languages whose reviewed DYN value is
     an empty string (en, vi, hi, ur, fil) fall back to the Bengali counter
     in the chapter dropdown. Expose the exact DYN row here (values copied
     programmatically from i18n.js) so the app can use it verbatim; bn
     never loads this file, and pages without this loader (e.g. the N2
     guide) keep the previous dynT behaviour. */
  var COUNT_SUFFIX = {"en": "", "ja": "件", "vi": "", "ne": " वटा", "hi": "", "ur": "", "my": " ခု", "zh": " 个", "si": " ක්", "fil": ""};
  if (Object.prototype.hasOwnProperty.call(COUNT_SUFFIX, lang)) {
    window.AponarQuartetCountSuffix = COUNT_SUFFIX[lang];
  }

  /* Remnant fix: fetch the tiny attribute sidecar (the 11 static
     aria-labels + meta description) first, in parallel with the full data
     sidecar below, and swap the page's static attributes as soon as it
     arrives instead of after the much larger data sidecar. The data
     sidecar's qh pass at the bottom stays as the fallback and is an
     idempotent no-op when this early pass already ran. */
  var attrReady = new Promise(function (resolve) {
    var s = document.createElement('script');
    s.src = '/assets/i18n/data/n3-quartet-attr.' + lang + '.js';
    s.onload = function () { resolve(window.AponarQuartetAttr || null); };
    s.onerror = function () { resolve(null); };
    document.head.appendChild(s);
  });

  var ready = new Promise(function (resolve) {
    var s = document.createElement('script');
    s.src = '/assets/i18n/data/n3-quartet-data.' + lang + '.js';
    s.onload = function () { resolve(window.AponarQuartetData || null); };
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

  function swapData(course, deep, data) {
    if (course && data.qc) swapValue(course, '', data.qc);
    if (deep && data.qd) {
      var rootMap = data.qd['scope_bn'];
      if (typeof deep.scope_bn === 'string' && rootMap &&
          Object.prototype.hasOwnProperty.call(rootMap, deep.scope_bn)) {
        deep.scope_bn = rootMap[deep.scope_bn];
      }
      var lessons = deep.lessons || {};
      for (var id in lessons) swapValue(lessons[id], '', data.qd);
    }
  }

  function applyAria(aria, metaSource, metaTarget) {
    var els = document.querySelectorAll('[aria-label]');
    for (var i = 0; i < els.length; i++) {
      var v = els[i].getAttribute('aria-label');
      if (v && Object.prototype.hasOwnProperty.call(aria, v)) els[i].setAttribute('aria-label', aria[v]);
    }
    if (metaSource) {
      var md = document.querySelector('meta[name="description"]');
      if (md && md.getAttribute('content') === metaSource) md.setAttribute('content', metaTarget);
    }
  }

  function applyAttributes(qh) {
    if (!qh) return;
    var aria = {}, metaSource = null, metaTarget = null;
    for (var field in qh) {
      if (field.indexOf('attr.') === 0 && field.slice(-'@aria-label'.length) === '@aria-label') {
        for (var a in qh[field]) aria[a] = qh[field][a];
      } else if (field === 'attr.meta@description') {
        for (var m in qh[field]) { metaSource = m; metaTarget = qh[field][m]; }
      }
    }
    applyAria(aria, metaSource, metaTarget);
  }

  window.AponarQuartetI18n = function (course, deep) {
    return ready.then(function (data) {
      if (data) swapData(course, deep, data);
    });
  };
  attrReady.then(function (attr) {
    if (attr) applyAria(attr.aria || {}, attr.meta ? attr.meta[0] : null, attr.meta ? attr.meta[1] : null);
  });
  ready.then(function (data) { if (data) applyAttributes(data.qh); });
})();
