/* Run 33 — question-bank i18n loader.
   The study question banks (assets/data/study/questions-*.json,
   assets/data/study/flashcards.json), the JTest banks
   (assets/data/jtest4you/{n5,n4,n3}.json + bn-review.json) and the mock
   catalog (assets/data/jtest4you/catalog.json) carry their Bengali
   explanation layer as data fields (answerBn / explanationBn /
   transcriptBn / explanation / review transcript / glosses / labels).
   The consuming apps fetch the original JSON and hand it to
   window.AponarQbApply(url, data) before rendering; on non-bn pages
   this loader fetches the per-language sidecar
   (assets/i18n/data/qb.<lang>.{1,2,3}.json — 3 shards of one flat
   exact-source map for the whole union set) and swaps those fields
   in place. Japanese content
   (prompts, options, furigana HTML, transcripts' Japanese head) is
   never touched: only the inventoried Bengali fields are replaced.
   bn is a strict no-op: nothing is fetched, AponarQbT stays the
   identity, AponarQbApply resolves without changing anything, and the
   apps render exactly as before. Keys and lookups are NFC-normalized
   on both sides (the U+09DF lesson of Run 12). Language is resolved
   exactly like AponarDyn: AponarDynLang, else data-language-preset,
   else the URL's first segment, else bn. A failed sidecar fetch keeps
   the Bengali originals as the graceful fallback. */
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
  window.AponarQbT = function (source) {
    if (!map || typeof source !== 'string') return source;
    var hit = map[norm(source)];
    return typeof hit === 'string' ? hit : source;
  };

  function swapQuestion(q) {
    if (!q || typeof q !== 'object') return;
    var fields = ['explanation', 'answerBn', 'explanationBn', 'transcriptBn'];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (typeof q[f] === 'string') q[f] = window.AponarQbT(q[f]);
    }
    if (typeof q.questionImage === 'string') {
      q.questionImage = q.questionImage.replace(/alt="([^"]*)"/, function (m, alt) {
        return 'alt="' + window.AponarQbT(alt) + '"';
      });
    }
  }
  function swapReview(review) {
    if (typeof review.bengaliContent === 'string') review.bengaliContent = window.AponarQbT(review.bengaliContent);
    var levels = review.levels || {};
    for (var lv in levels) {
      if (!Object.prototype.hasOwnProperty.call(levels, lv)) continue;
      var entries = levels[lv] || {};
      for (var qid in entries) {
        if (!Object.prototype.hasOwnProperty.call(entries, qid)) continue;
        var e = entries[qid];
        if (!e || typeof e !== 'object') continue;
        var fields = ['answerBn', 'explanationBn', 'transcript'];
        for (var i = 0; i < fields.length; i++) {
          var f = fields[i];
          if (typeof e[f] === 'string') e[f] = window.AponarQbT(e[f]);
        }
      }
    }
  }
  function swapFlashcards(cards) {
    if (!Array.isArray(cards)) return;
    cards.forEach(function (c) {
      if (!c || typeof c !== 'object') return;
      if (typeof c.m === 'string') c.m = window.AponarQbT(c.m);
      (c.w || []).forEach(function (w) { if (Array.isArray(w) && typeof w[2] === 'string') w[2] = window.AponarQbT(w[2]); });
      (c.e || []).forEach(function (e) { if (Array.isArray(e) && typeof e[2] === 'string') e[2] = window.AponarQbT(e[2]); });
      (c.words || []).forEach(function (w) { if (w && typeof w.bn === 'string') w.bn = window.AponarQbT(w.bn); });
      (c.examples || []).forEach(function (e) { if (e && typeof e.bn === 'string') e.bn = window.AponarQbT(e.bn); });
    });
  }
  function swapCatalog(cat) {
    var levels = (cat && cat.levels) || {};
    for (var lv in levels) {
      if (!Object.prototype.hasOwnProperty.call(levels, lv)) continue;
      (levels[lv].groups || []).forEach(function (g) {
        if (g && typeof g.label === 'string') g.label = window.AponarQbT(g.label);
      });
    }
  }

  window.AponarQbApply = function (url, data) {
    return window.AponarQbReady.then(function (ok) {
      if (!ok || !map || !data || typeof data !== 'object') return data;
      try {
        if (/flashcards\.json/.test(url)) swapFlashcards(data);
        else if (/bn-review\.json/.test(url)) swapReview(data);
        else if (/catalog\.json/.test(url)) swapCatalog(data);
        else if (/questions-[a-z0-9]+\.json/.test(url) || /jtest4you\/[a-z0-9]+\.json/.test(url)) {
          (data.questions || []).forEach(swapQuestion);
        }
      } catch (e) { /* graceful: keep the originals */ }
      return data;
    });
  };

  var lang = resolveLang();
  if (!lang || lang === 'bn') {
    window.AponarQbReady = Promise.resolve(false);
    return;
  }
  /* The sidecar ships as 3 shards (qb.<lang>.1/2/3.json) so each file
     stays under the connector push-payload limit; they are merged into
     one map here. All-or-nothing: any failed shard keeps Bengali. */
  function fetchShard(n) {
    return fetch('/assets/i18n/data/qb.' + lang + '.' + n + '.json')
      .then(function (r) { if (!r.ok) throw new Error('qb sidecar'); return r.json(); });
  }
  window.AponarQbReady = Promise.all([fetchShard(1), fetchShard(2), fetchShard(3)])
    .then(function (parts) {
      map = {};
      for (var p = 0; p < parts.length; p++) {
        var data = parts[p];
        if (!data || typeof data !== 'object') return false;
        for (var k in data) {
          if (Object.prototype.hasOwnProperty.call(data, k)) map[norm(k)] = data[k];
        }
      }
      return true;
    })
    .catch(function () { map = null; return false; });
})();
