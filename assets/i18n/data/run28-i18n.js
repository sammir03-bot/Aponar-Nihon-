/* Run 28 — inline-data page localization loader.
   Loaded by the Run 28 hook in assets/js/i18n.js on localized (non-bn)
   routes only; it also re-resolves the language itself and returns
   immediately for bn, so Bengali pages are a strict no-op and nothing
   here ever runs on them.
   Pieces:
   - grammar-vs: replaces the page's simpleBangla() with a lookup over
     the per-language sidecar map (raw Bengali string -> translation of
     the string the page would have rendered), wraps render() with a
     chrome pass for the template-hardcoded labels, and fixes the
     static hero/tab copy set by enhanceStaticCopy().
   - Hiragana-Katagana: rewrites the reading element of the B/D/C kana
     arrays in place (romaji for every language, the kana itself for
     ja — the Runs 21/23 pronunciation convention), re-renders the
     grids, localizes the reading-toggle label and the JS-only hint /
     quiz-result strings.
   - Run 27 pages with inline-script strings: a text-node pass (exact +
     template rules) over the rendered DOM, kept current with a
     MutationObserver; dialog messages routed through
     AponarI18nContent are mapped first; the dashboard's Chart.js
     labels/callbacks and navigator.share payload are patched in place.
   All Bengali lives in the per-language sidecars; this file is
   Bengali-free. Every step is guarded: a failure leaves the page as it
   was rather than breaking it. */
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

  var segs = location.pathname.split('/').filter(Boolean);
  var stem = segs.length >= 2 ? segs[1] : '';

  function load(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
  }
  function has(map, key) { return Object.prototype.hasOwnProperty.call(map, key); }
  var BN_RE = /[\u0980-\u09ff]/;

  /* ---------------- grammar-vs ---------------- */
  function initGrammarVs() {
    load('/assets/i18n/data/grammar-vs.' + lang + '.js').then(function () {
      try {
        var D = window.AponarGrammarVs;
        if (!D) return;
        var map = D.map || {};
        var chrome = D.chrome || {};   // key -> [bnSource, target]
        function tr(key) { return chrome[key] ? chrome[key][1] : null; }
        function bnOf(key) { return chrome[key] ? chrome[key][0] : null; }

        if (typeof window.simpleBangla === 'function') {
          window.simpleBangla = function (v) {
            if (typeof v !== 'string') return v;
            return has(map, v) ? map[v] : v;
          };
        }

        function setText(sel, val) {
          var el = document.querySelector(sel);
          if (el && val != null) el.textContent = val;
        }
        function tplRegex(tpl) {
          var parts = tpl.split(/\{(\w+)\}/);
          var names = [];
          var pat = '^';
          for (var i = 0; i < parts.length; i++) {
            if (i % 2 === 0) pat += parts[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            else { names.push(parts[i]); pat += '([\\s\\S]*?)'; }
          }
          return { re: new RegExp(pat + '$'), names: names };
        }
        function applyTpl(text, key) {
          var src = bnOf(key), dst = tr(key);
          if (src == null || dst == null || typeof text !== 'string') return text;
          var t = tplRegex(src);
          var m = t.re.exec(text);
          if (!m) return text;
          var out = dst;
          for (var i = 0; i < t.names.length; i++) out = out.split('{' + t.names[i] + '}').join(m[i + 1]);
          return out;
        }
        function fixPeriods(root) {
          var pair = chrome.period;   // [bn danda, localized sentence period]
          if (!pair || pair[0] === pair[1]) return;
          var danda = pair[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var re = new RegExp(danda + '(\\s*)$');
          var nodes = root.querySelectorAll('.why-use p, .details .box p');
          for (var i = 0; i < nodes.length; i++) {
            var walker = document.createTreeWalker(nodes[i], NodeFilter.SHOW_TEXT);
            var n;
            while ((n = walker.nextNode())) {
              if (re.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(re, pair[1] + '$1');
            }
          }
        }
        function chromePass() {
          try {
            setText('.kicker', tr('kicker'));
            var h1 = document.querySelector('.hero h1');
            if (h1 && tr('h1') != null) h1.innerHTML = tr('h1');
            setText('.hero p', tr('heroP'));
            setText('.notice', tr('notice'));
            var tabs = document.querySelectorAll('.tab');
            for (var i = 0; i < tabs.length; i++) {
              var key = 'tab' + (tabs[i].getAttribute('data-level') || '');
              if (tr(key) != null) tabs[i].textContent = tr(key);
            }
            var search = document.getElementById('search');
            if (search && tr('searchPh') != null) search.setAttribute('placeholder', tr('searchPh'));
            var nav = document.getElementById('partNav');
            if (nav && tr('partNavAria') != null) nav.setAttribute('aria-label', tr('partNavAria'));
            if (nav) {
              var btns = nav.querySelectorAll('button');
              for (var b = 0; b < btns.length; b++) {
                var bt = btns[b].textContent;
                if (btns[b].getAttribute('data-part') === 'all') {
                  if (bt === bnOf('allParts') && tr('allParts') != null) btns[b].textContent = tr('allParts');
                } else if (bnOf('partPrefix') && bt.indexOf(bnOf('partPrefix')) === 0) {
                  btns[b].textContent = tr('partPrefix') + bt.slice(bnOf('partPrefix').length);
                }
              }
            }
            var title = document.getElementById('title');
            if (title) title.textContent = applyTpl(title.textContent, 'titleTpl');
            var sub = document.getElementById('subtitle');
            if (sub) {
              if (sub.textContent === bnOf('subtitleN3')) sub.textContent = tr('subtitleN3');
              else if (sub.textContent === bnOf('subtitleLevel')) sub.textContent = tr('subtitleLevel');
            }
            var count = document.getElementById('count');
            if (count) count.textContent = applyTpl(count.textContent, 'countTpl');
            var intro = document.getElementById('intro');
            if (intro) {
              var t = intro.textContent;
              var prefixes = chrome.introPrefixes || {};
              for (var raw in prefixes) {
                if (t.indexOf(raw) === 0) { t = prefixes[raw] + t.slice(raw.length); break; }
              }
              var sufBn = bnOf('introSuffix'), sufTr = tr('introSuffix');
              if (sufBn && t.slice(-sufBn.length) === sufBn) t = t.slice(0, t.length - sufBn.length) + sufTr;
              intro.textContent = t;
            }
            var cards = document.getElementById('cards');
            if (cards) {
              var q = function (sel) { return cards.querySelectorAll(sel); };
              var list, j, el;
              list = q('.card-no');
              for (j = 0; j < list.length; j++) {
                el = list[j];
                if (bnOf('cardNoPrefix') && el.textContent.indexOf(bnOf('cardNoPrefix')) === 0) {
                  el.textContent = tr('cardNoPrefix') + el.textContent.slice(bnOf('cardNoPrefix').length);
                }
              }
              list = q('.why-use h3');
              for (j = 0; j < list.length; j++) if (list[j].textContent === bnOf('whyTitle')) list[j].textContent = tr('whyTitle');
              list = q('.explain-title');
              for (j = 0; j < list.length; j++) if (list[j].textContent === bnOf('explainTitle')) list[j].textContent = tr('explainTitle');
              list = q('.details .box h3');
              for (j = 0; j < list.length; j++) {
                el = list[j];
                var suf = bnOf('whenSuffix');
                if (suf && el.textContent.slice(-suf.length) === suf) {
                  el.textContent = el.textContent.slice(0, el.textContent.length - suf.length) + tr('whenSuffix');
                }
              }
              list = q('.examples .ex b');
              for (j = 0; j < list.length; j++) {
                el = list[j];
                if (bnOf('examplePrefix') && el.textContent.indexOf(bnOf('examplePrefix')) === 0) {
                  el.textContent = tr('examplePrefix') + el.textContent.slice(bnOf('examplePrefix').length);
                }
              }
              list = q('.trap b');
              for (j = 0; j < list.length; j++) if (list[j].textContent === bnOf('trapLabel')) list[j].textContent = tr('trapLabel');
              list = q('.memory-calm h3');
              for (j = 0; j < list.length; j++) if (list[j].textContent === bnOf('memoryTitle')) list[j].textContent = tr('memoryTitle');
              list = q('.recall');
              for (j = 0; j < list.length; j++) {
                el = list[j];
                var label = el.querySelector('b');
                if (label && label.textContent === bnOf('recallLabel')) label.textContent = tr('recallLabel');
                var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
                var n;
                while ((n = walker.nextNode())) {
                  if (n.parentNode === label) continue;
                  var nt = applyTpl(n.nodeValue, 'recallTpl');
                  if (nt !== n.nodeValue) n.nodeValue = nt;
                }
              }
              list = q('.vs-part-kicker');
              for (j = 0; j < list.length; j++) {
                el = list[j];
                if (bnOf('partPrefix') && el.textContent.indexOf(bnOf('partPrefix')) === 0) {
                  el.textContent = tr('partPrefix') + el.textContent.slice(bnOf('partPrefix').length);
                }
              }
              list = q('.vs-part-count');
              for (j = 0; j < list.length; j++) list[j].textContent = applyTpl(list[j].textContent, 'countTpl');
              list = q('.empty');
              for (j = 0; j < list.length; j++) if (list[j].textContent === bnOf('emptyText')) list[j].textContent = tr('emptyText');
              fixPeriods(cards);
            }
          } catch (e) { /* chrome pass must never break the page */ }
        }
        chromePass();
        if (typeof window.render === 'function') {
          var origRender = window.render;
          window.render = function () { var r = origRender.apply(this, arguments); chromePass(); return r; };
          // The page's first render already ran with the Bengali simpleBangla
          // before this sidecar arrived (async load). Repaint once through
          // the wrapped render so the initial view is localized too.
          try { window.render(); } catch (e) { /* tab clicks still repaint */ }
        }
      } catch (e) { /* leave the page as it was */ }
    });
  }

  /* ---------------- Hiragana-Katagana ---------------- */
  function initHiragana() {
    load('/assets/i18n/data/hiragana.' + lang + '.js').then(function () {
      try {
        var HD = window.AponarHiragana;
        if (!HD) return;
        var readings = HD.readings || {};
        var exact = (HD.chrome && HD.chrome.exact) || {};
        var arrays = [];
        try { if (typeof B !== 'undefined') arrays.push(B); } catch (e) { /* not present */ }
        try { if (typeof D !== 'undefined') arrays.push(D); } catch (e) { /* not present */ }
        try { if (typeof C !== 'undefined') arrays.push(C); } catch (e) { /* not present */ }
        for (var a = 0; a < arrays.length; a++) {
          var arr = arrays[a];
          for (var i = 0; i < arr.length; i++) {
            var kana = arr[i][0];
            if (has(readings, kana)) arr[i][2] = readings[kana];
          }
        }
        if (typeof window.renderGrids === 'function') window.renderGrids();
        var btn = document.getElementById('banglaToggle');
        if (btn) {
          var base = btn.textContent.replace(/\s*(ON|OFF)\s*$/, '');
          if (BN_RE.test(base) && HD.chrome && HD.chrome.readingLabel) base = HD.chrome.readingLabel;
          var show = !document.body.classList.contains('hide-bangla');
          btn.textContent = base + ' ' + (show ? 'ON' : 'OFF');
          btn.onclick = function () {
            show = !show;
            document.body.classList.toggle('hide-bangla', !show);
            btn.textContent = base + ' ' + (show ? 'ON' : 'OFF');
          };
        }
        function pass() {
          var ids = ['listenHint', 'quizOpts'];
          for (var k = 0; k < ids.length; k++) {
            var host = document.getElementById(ids[k]);
            if (!host) continue;
            var walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
            var n;
            while ((n = walker.nextNode())) {
              var v = n.nodeValue;
              if (has(exact, v)) n.nodeValue = exact[v];
            }
          }
        }
        pass();
        var targets = [document.getElementById('listenHint'), document.getElementById('quizOpts')];
        for (var t = 0; t < targets.length; t++) {
          if (targets[t] && window.MutationObserver) {
            new MutationObserver(function () { pass(); }).observe(targets[t], { childList: true, characterData: true, subtree: true });
          }
        }
      } catch (e) { /* leave the page as it was */ }
    });
  }

  /* ---------------- Run 27 pages: inline-script strings ---------------- */
  function initInlinePage() {
    load('/assets/i18n/data/inline-pages.' + lang + '.js').then(function () {
      try {
        var all = window.AponarInlinePages;
        if (!all || !all[stem]) return;
        var P = all[stem];
        var exact = P.exact || {};
        var templates = (P.templates || []).map(function (t) {
          var pat = '^\\s*';
          for (var i = 0; i < t.parts.length; i++) {
            pat += t.parts[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (i < t.parts.length - 1) pat += '([\\s\\S]*?)';
          }
          pat += '\\s*$';
          return { re: new RegExp(pat), to: t.to };
        });
        var fragments = (P.fragments || []).slice().sort(function (a, b) { return b.from.length - a.from.length; });
        function convert(text) {
          if (typeof text !== 'string' || !BN_RE.test(text)) return text;
          if (has(exact, text)) return exact[text];
          var trimmed = text.trim();
          if (trimmed !== text && has(exact, trimmed)) {
            return text.replace(trimmed, exact[trimmed]);
          }
          for (var i = 0; i < templates.length; i++) {
            var m = templates[i].re.exec(text);
            if (m) {
              var out = templates[i].to;
              for (var g = 1; g < m.length; g++) out = out.split('{' + (g - 1) + '}').join(m[g]);
              return out;
            }
          }
          var res = text;
          for (var f = 0; f < fragments.length; f++) {
            if (res.indexOf(fragments[f].from) !== -1) res = res.split(fragments[f].from).join(fragments[f].to);
          }
          return res;
        }
        var SKIP = 'script, style, .jp, [lang="ja"], ruby, rt, code, pre, textarea, noscript';
        function pass(root) {
          if (!root || !document.createTreeWalker) return;
          var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
              if (!BN_RE.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
              if (node.parentElement && node.parentElement.closest(SKIP)) return NodeFilter.FILTER_REJECT;
              return NodeFilter.FILTER_ACCEPT;
            }
          });
          var nodes = [];
          var n;
          while ((n = walker.nextNode())) nodes.push(n);
          for (var i = 0; i < nodes.length; i++) {
            var nv = convert(nodes[i].nodeValue);
            if (nv !== nodes[i].nodeValue) nodes[i].nodeValue = nv;
          }
        }
        pass(document.body);
        if (window.MutationObserver && document.body) {
          var pending = false;
          var obs = new MutationObserver(function () {
            if (pending) return;
            pending = true;
            setTimeout(function () {
              pending = false;
              obs.disconnect();
              pass(document.body);
              obs.observe(document.body, { childList: true, characterData: true, subtree: true });
            }, 60);
          });
          obs.observe(document.body, { childList: true, characterData: true, subtree: true });
        }
        if (P.dialogs && window.AponarI18nContent) {
          var AIC = window.AponarI18nContent;
          if (typeof AIC.confirm === 'function') {
            var origConfirm = AIC.confirm;
            AIC.confirm = function (msg) { return origConfirm.call(AIC, typeof msg === 'string' ? convert(msg) : msg); };
          }
          if (typeof AIC.alert === 'function') {
            var origAlert = AIC.alert;
            AIC.alert = function (msg) { return origAlert.call(AIC, typeof msg === 'string' ? convert(msg) : msg); };
          }
        }
        if (P.chart && window.Chart && window.Chart.instances) {
          try {
            var changed = false;
            Object.keys(window.Chart.instances).forEach(function (id) {
              var chart = window.Chart.instances[id];
              if (!chart) return;
              if (Array.isArray(chart.data.labels)) {
                chart.data.labels = chart.data.labels.map(function (l) { return has(exact, l) ? exact[l] : l; });
                changed = true;
              }
              (chart.data.datasets || []).forEach(function (ds) {
                if (ds && typeof ds.label === 'string' && has(exact, ds.label)) { ds.label = exact[ds.label]; changed = true; }
              });
              var opts = chart.options || {};
              var tt = opts.plugins && opts.plugins.tooltip && opts.plugins.tooltip.callbacks;
              if (tt && typeof tt.label === 'function' && BN_RE.test(tt.label.toString()) && P.chart.qnaSuffix != null) {
                tt.label = function (context) { return context.parsed.x + P.chart.qnaSuffix; };
                changed = true;
              }
              var scales = opts.scales || {};
              Object.keys(scales).forEach(function (axis) {
                var ticks = scales[axis] && scales[axis].ticks;
                if (ticks && typeof ticks.callback === 'function' && BN_RE.test(ticks.callback.toString()) && P.chart.tickSuffix != null) {
                  ticks.callback = function (value) { return value + P.chart.tickSuffix; };
                  changed = true;
                }
              });
              if (changed && typeof chart.update === 'function') chart.update('none');
            });
          } catch (e) { /* chart fix is best-effort */ }
        }
        if (P.share && navigator.share) {
          try {
            var origShare = navigator.share.bind(navigator);
            navigator.share = function (data) {
              if (data && typeof data === 'object') {
                var copy = {};
                for (var k in data) copy[k] = data[k];
                if (typeof copy.title === 'string') copy.title = convert(copy.title);
                if (typeof copy.text === 'string') copy.text = convert(copy.text);
                return origShare(copy);
              }
              return origShare(data);
            };
          } catch (e) { /* share wrap is best-effort */ }
        }
        if (P.digits) {
          // The dashboard stat counters animate numbers through a Bengali
          // digit table (behavior, no localizable literal). Convert Bengali
          // digits (U+09E6-U+09EF) to ASCII in text nodes while the counters
          // settle (~2s animation; poll for 5s).
          try {
            var convertDigits = function () {
              var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
              var n;
              while ((n = w.nextNode())) {
                if (/[\u09e6-\u09ef]/.test(n.nodeValue)) {
                  n.nodeValue = n.nodeValue.replace(/[\u09e6-\u09ef]/g, function (d) { return String(d.charCodeAt(0) - 0x09e6); });
                }
              }
            };
            convertDigits();
            var polls = 0;
            var digitTimer = setInterval(function () { convertDigits(); if (++polls >= 20) clearInterval(digitTimer); }, 250);
          } catch (e) { /* best-effort */ }
        }
      } catch (e) { /* leave the page as it was */ }
    });
  }

  if (stem === 'grammar-vs') initGrammarVs();
  else if (stem === 'Hiragana-Katagana') initHiragana();
  else initInlinePage();
})();
