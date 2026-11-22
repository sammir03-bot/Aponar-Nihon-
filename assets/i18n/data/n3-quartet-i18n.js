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

  window.AponarQuartetI18n = function (course, deep) {
    return ready.then(function (data) {
      if (data) swapData(course, deep, data);
    });
  };
  ready.then(function (data) { if (data) applyAttributes(data.qh); });
})();
