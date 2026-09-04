(function () {
  "use strict";

  var DATA_URL = "/assets/data/daily-news.json";
  var FURIGANA_KEY = "aponarNihonFurigana";
  var dataPromise = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL, { cache: "no-store" })
        .then(function (response) {
          if (!response.ok) throw new Error("Daily news data could not be loaded");
          return response.json();
        })
        .then(function (data) {
          var safeData = data && typeof data === "object" ? data : {};
          var articles = Array.isArray(safeData.articles) ? safeData.articles.slice() : [];
          articles.sort(function (a, b) {
            return String(b.date || "").localeCompare(String(a.date || "")) ||
              String(b.source && b.source.published_at || "").localeCompare(String(a.source && a.source.published_at || "")) ||
              String(b.id || "").localeCompare(String(a.id || ""));
          });
          safeData.articles = articles;
          return safeData;
        });
    }
    return dataPromise;
  }

  function formatDate(dateString) {
    try {
      return new Intl.DateTimeFormat("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Tokyo"
      }).format(new Date(dateString + "T00:00:00+09:00"));
    } catch (_error) {
      return dateString;
    }
  }

  function tokyoToday() {
    try {
      var parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (part) { if (part.type !== "literal") map[part.type] = part.value; });
      return [map.year, map.month, map.day].join("-");
    } catch (_error) {
      return "";
    }
  }

  function renderTokens(tokens) {
    if (!Array.isArray(tokens)) return "";
    return tokens.map(function (token) {
      if (token == null) return "";
      if (typeof token === "string" || typeof token === "number") return escapeHtml(token);
      var text = escapeHtml(token.t || "");
      var reading = escapeHtml(token.r || "");
      if (!reading) return text;
      return "<ruby>" + text + "<rt>" + reading + "</rt></ruby>";
    }).join("");
  }

  function getFuriganaPreference() {
    try {
      return localStorage.getItem(FURIGANA_KEY) === "off" ? "off" : "on";
    } catch (_error) {
      return "on";
    }
  }

  function applyFuriganaPreference(value) {
    var state = value === "off" ? "off" : "on";
    document.documentElement.dataset.furigana = state;
    try { localStorage.setItem(FURIGANA_KEY, state); } catch (_error) { /* no-op */ }
    document.querySelectorAll("[data-furigana-toggle]").forEach(function (button) {
      var on = state === "on";
      button.setAttribute("aria-pressed", String(on));
      var label = button.querySelector("[data-furigana-label]");
      if (label) label.textContent = on ? "ফুরিগানা ON" : "ফুরিগানা OFF";
    });
  }

  function setupFuriganaToggle() {
    applyFuriganaPreference(getFuriganaPreference());
    document.querySelectorAll("[data-furigana-toggle]").forEach(function (button) {
      if (button.dataset.bound === "1") return;
      button.dataset.bound = "1";
      button.addEventListener("click", function () {
        var current = document.documentElement.dataset.furigana === "off" ? "off" : "on";
        applyFuriganaPreference(current === "on" ? "off" : "on");
      });
    });
  }

  function ensureEnhancementStyles() {
    if (document.getElementById("daily-news-enhancement-styles")) return;
    var style = document.createElement("style");
    style.id = "daily-news-enhancement-styles";
    style.textContent = [
      ".daily-news-freshness{display:inline-flex;align-items:center;gap:6px;margin-top:7px;color:#6f8094;font-size:.72rem;font-weight:800}",
      ".daily-news-freshness i{color:#22a06b}",
      ".news-archive-toolbar{display:flex;flex-wrap:wrap;gap:8px;margin:-3px 0 17px}",
      ".news-filter-chip{min-height:38px;padding:8px 13px;border:1px solid #dfe8f2;border-radius:999px;background:#fff;color:#52667f;cursor:pointer;font:800 .76rem/1 'Noto Sans Bengali',sans-serif;transition:160ms ease}",
      ".news-filter-chip:hover{border-color:#b7d7f8;color:#126bc8}",
      ".news-filter-chip[aria-pressed='true']{border-color:#1677e8;background:#edf6ff;color:#0969cc;box-shadow:0 5px 14px rgba(22,119,232,.10)}",
      ".news-date-group{display:grid;gap:10px}",
      ".news-date-group+.news-date-group{margin-top:8px;padding-top:16px;border-top:1px solid #edf1f6}",
      ".news-date-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 2px;color:#52667f;font-size:.75rem;font-weight:900}",
      ".news-date-heading strong{color:#1f3855;font-size:.86rem}",
      ".news-reader-adjacent{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:13px}",
      ".news-adjacent-link{display:grid;gap:5px;padding:13px 14px;border:1px solid #dfe8f2;border-radius:15px;background:#fbfdff;color:#37516f;text-decoration:none}",
      ".news-adjacent-link small{color:#718095;font-size:.68rem;font-weight:900}",
      ".news-adjacent-link strong{display:-webkit-box;overflow:hidden;color:#203a58;font-family:'Noto Sans JP',sans-serif;font-size:.82rem;line-height:1.45;-webkit-box-orient:vertical;-webkit-line-clamp:2}",
      ".news-adjacent-link.is-newer{text-align:right}",
      "@media(max-width:560px){.news-archive-toolbar{overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px;scrollbar-width:none}.news-archive-toolbar::-webkit-scrollbar{display:none}.news-filter-chip{flex:0 0 auto}.news-reader-adjacent{grid-template-columns:1fr}.news-adjacent-link.is-newer{text-align:left}}"
    ].join("");
    document.head.appendChild(style);
  }

  function freshnessText(dateString) {
    if (!dateString) return "";
    return dateString === tokyoToday() ? "আজকের নিউজ আপডেট হয়েছে" : "সর্বশেষ আপডেট: " + formatDate(dateString);
  }

  function homeCard(article, index, latestDate) {
    var isFirst = index === 0;
    var badge = isFirst ? (latestDate === tokyoToday() ? "আজকের প্রধান" : "সর্বশেষ") : "";
    return '<a class="daily-news-card" href="/daily-news-reader.html?id=' + encodeURIComponent(article.id) + '">' +
      '<div>' +
        '<div class="daily-news-meta">' +
          (badge ? '<span class="daily-news-badge">' + badge + '</span>' : '') +
          '<span>' + escapeHtml(formatDate(article.date)) + '</span>' +
          '<span>•</span><span>' + escapeHtml(article.level || "") + '</span>' +
          '<span>•</span><span>' + escapeHtml(article.category_bn || "") + '</span>' +
        '</div>' +
        '<h3 lang="ja">' + escapeHtml(article.headline || "") + '</h3>' +
        '<p>' + escapeHtml(article.teaser_bn || "") + '</p>' +
      '</div>' +
      '<span class="daily-news-open">বিস্তারিত পড়ুন <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>' +
    '</a>';
  }

  function mountHome() {
    if (!document.body || document.body.dataset.page !== "home") return;
    ensureEnhancementStyles();
    if (document.getElementById("dailyNewsHome")) {
      renderHome();
      return;
    }

    var anchor = document.querySelector(".app-home-duo");
    if (!anchor) return;

    var section = document.createElement("section");
    section.className = "daily-news-home";
    section.id = "dailyNewsHome";
    section.setAttribute("aria-labelledby", "daily-news-home-title");
    section.setAttribute("data-i18n-no-content", "");
    section.innerHTML =
      '<div class="daily-news-head">' +
        '<div><span class="daily-news-kicker"><i class="fa-solid fa-newspaper" aria-hidden="true"></i> প্রতিদিনের জাপানি নিউজ</span>' +
        '<h2 id="daily-news-home-title">কানজি দিয়ে খবর পড়ুন, বুঝুন বাংলায়</h2>' +
        '<span class="daily-news-freshness" data-daily-news-freshness><i class="fa-solid fa-circle" aria-hidden="true"></i> আপডেট দেখছি…</span></div>' +
        '<a class="daily-news-all" href="/daily-news.html"><span>সব নিউজ</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
      '</div>' +
      '<div class="daily-news-grid" data-daily-news-home-list aria-live="polite"><div class="daily-news-state">আজকের খবর লোড হচ্ছে…</div></div>';
    anchor.insertAdjacentElement("afterend", section);
    renderHome();
  }

  function renderHome() {
    var list = document.querySelector("[data-daily-news-home-list]");
    var freshness = document.querySelector("[data-daily-news-freshness]");
    if (!list) return;
    loadData().then(function (data) {
      var all = data.articles || [];
      if (!all.length) {
        list.innerHTML = '<div class="daily-news-state">এখনো কোনো নিউজ যোগ হয়নি।</div>';
        if (freshness) freshness.textContent = "নিউজ আপডেটের অপেক্ষায়";
        return;
      }
      var latestDate = all[0].date || "";
      var latest = all.filter(function (article) { return article.date === latestDate; }).slice(0, 3);
      if (!latest.length) latest = all.slice(0, 3);
      list.innerHTML = latest.map(function (article, index) { return homeCard(article, index, latestDate); }).join("");
      if (freshness) freshness.innerHTML = '<i class="fa-solid fa-circle" aria-hidden="true"></i> ' + escapeHtml(freshnessText(latestDate));
    }).catch(function () {
      list.innerHTML = '<div class="daily-news-state">নিউজ লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।</div>';
      if (freshness) freshness.textContent = "আপডেট পাওয়া যায়নি";
    });
  }

  function archiveItem(article) {
    return '<a class="news-list-item" href="/daily-news-reader.html?id=' + encodeURIComponent(article.id) + '">' +
      '<span class="news-list-date">' + escapeHtml(formatDate(article.date)) + '<br><span class="news-level">' + escapeHtml(article.level || "") + '</span></span>' +
      '<span class="news-list-copy"><h2 lang="ja">' + escapeHtml(article.headline || "") + '</h2><p>' + escapeHtml(article.teaser_bn || "") + '</p></span>' +
      '<i class="fa-solid fa-chevron-right news-list-arrow" aria-hidden="true"></i>' +
    '</a>';
  }

  function uniqueDates(articles) {
    var seen = {};
    return articles.map(function (article) { return article.date || ""; }).filter(function (date) {
      if (!date || seen[date]) return false;
      seen[date] = true;
      return true;
    });
  }

  function dateLabel(date, dates) {
    if (date === tokyoToday()) return "আজ";
    if (date === dates[0]) return "সর্বশেষ";
    if (date === dates[1]) return "আগের দিন";
    return formatDate(date);
  }

  function archiveGroups(articles, dates) {
    if (!articles.length) return '<div class="daily-news-state">এই ফিল্টারে কোনো নিউজ নেই।</div>';
    var grouped = {};
    articles.forEach(function (article) {
      var date = article.date || "তারিখ নেই";
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(article);
    });
    return Object.keys(grouped).sort().reverse().map(function (date) {
      var items = grouped[date];
      return '<section class="news-date-group" aria-label="' + escapeHtml(formatDate(date)) + '">' +
        '<div class="news-date-heading"><strong>' + escapeHtml(dateLabel(date, dates)) + '</strong><span>' + escapeHtml(formatDate(date)) + ' · ' + items.length + 'টি</span></div>' +
        items.map(archiveItem).join("") +
      '</section>';
    }).join("");
  }

  function ensureArchiveToolbar(list) {
    var existing = document.querySelector("[data-news-archive-toolbar]");
    if (existing) return existing;
    var toolbar = document.createElement("div");
    toolbar.className = "news-archive-toolbar";
    toolbar.setAttribute("data-news-archive-toolbar", "");
    toolbar.setAttribute("aria-label", "নিউজ তারিখ ফিল্টার");
    toolbar.innerHTML =
      '<button class="news-filter-chip" type="button" data-news-filter="all" aria-pressed="true">সব নিউজ</button>' +
      '<button class="news-filter-chip" type="button" data-news-filter="latest" aria-pressed="false">সর্বশেষ দিন</button>' +
      '<button class="news-filter-chip" type="button" data-news-filter="previous" aria-pressed="false">আগের দিন</button>';
    list.parentNode.insertBefore(toolbar, list);
    return toolbar;
  }

  function renderArchive() {
    var list = document.querySelector("[data-news-archive-list]");
    var count = document.querySelector("[data-news-count]");
    if (!list) return;
    ensureEnhancementStyles();

    loadData().then(function (data) {
      var articles = data.articles || [];
      var dates = uniqueDates(articles);
      var toolbar = ensureArchiveToolbar(list);

      function applyFilter(filter) {
        var visible = articles;
        if (filter === "latest") visible = dates[0] ? articles.filter(function (item) { return item.date === dates[0]; }) : [];
        if (filter === "previous") visible = dates[1] ? articles.filter(function (item) { return item.date === dates[1]; }) : [];
        list.innerHTML = archiveGroups(visible, dates);
        if (count) count.textContent = visible.length === articles.length ? String(articles.length) + "টি নিউজ" : String(visible.length) + " / " + String(articles.length) + "টি নিউজ";
        toolbar.querySelectorAll("[data-news-filter]").forEach(function (button) {
          button.setAttribute("aria-pressed", String(button.dataset.newsFilter === filter));
        });
      }

      if (!articles.length) {
        if (count) count.textContent = "০টি নিউজ";
        toolbar.hidden = true;
        list.innerHTML = '<div class="daily-news-state">এখনো কোনো নিউজ যোগ হয়নি।</div>';
        return;
      }

      toolbar.hidden = false;
      toolbar.querySelectorAll("[data-news-filter]").forEach(function (button) {
        if (button.dataset.bound === "1") return;
        button.dataset.bound = "1";
        button.addEventListener("click", function () { applyFilter(button.dataset.newsFilter || "all"); });
      });
      applyFilter("all");
    }).catch(function () {
      list.innerHTML = '<div class="daily-news-state">নিউজ আর্কাইভ লোড করা যায়নি।</div>';
    });
  }

  function safeSourceUrl(value) {
    if (!value) return "";
    try {
      var url = new URL(value, window.location.origin);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function adjacentLink(article, direction) {
    if (!article) return "";
    var label = direction === "newer" ? "নতুন নিউজ" : "আগের নিউজ";
    var icon = direction === "newer" ? "fa-arrow-right" : "fa-arrow-left";
    return '<a class="news-adjacent-link is-' + direction + '" href="/daily-news-reader.html?id=' + encodeURIComponent(article.id) + '">' +
      '<small>' + (direction === "older" ? '<i class="fa-solid ' + icon + '" aria-hidden="true"></i> ' : '') + label + (direction === "newer" ? ' <i class="fa-solid ' + icon + '" aria-hidden="true"></i>' : '') + '</small>' +
      '<strong lang="ja">' + escapeHtml(article.headline || "") + '</strong>' +
    '</a>';
  }

  function readerArticle(article, editorialNote, navigation) {
    var japanese = (article.japanese || []).map(function (paragraph) {
      return "<p>" + renderTokens(paragraph) + "</p>";
    }).join("");

    var explanations = (article.explanation_bn || []).map(function (paragraph) {
      return "<p>" + escapeHtml(paragraph) + "</p>";
    }).join("");

    var vocab = (article.vocabulary || []).map(function (item) {
      return '<div class="news-vocab-item"><strong lang="ja">' + escapeHtml(item.word) +
        ' <span style="font-weight:600;color:#748196">（' + escapeHtml(item.reading) + '）</span></strong>' +
        '<small>' + escapeHtml(item.meaning_bn) + '</small></div>';
    }).join("");

    var source = article.source || {};
    var sourceUrl = safeSourceUrl(source.url);
    var sourceHtml = sourceUrl
      ? '<a href="' + escapeHtml(sourceUrl) + '" target="_blank" rel="noopener noreferrer">মূল উৎস দেখুন <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>'
      : "";
    var adjacent = adjacentLink(navigation.older, "older") + adjacentLink(navigation.newer, "newer");

    return '<article class="news-reader-card" data-i18n-no-content>' +
      '<div class="news-reader-topline">' +
        '<div class="news-reader-meta"><span class="news-level">' + escapeHtml(article.level || "") + '</span><span>' + escapeHtml(article.category_bn || "") + '</span><span>•</span><time datetime="' + escapeHtml(article.date) + '">' + escapeHtml(formatDate(article.date)) + '</time></div>' +
        '<button class="furigana-toggle" type="button" data-furigana-toggle aria-pressed="true"><span data-furigana-label>ফুরিগানা ON</span><span class="switch-track" aria-hidden="true"><span class="switch-knob"></span></span></button>' +
      '</div>' +
      '<h1 class="news-reader-title news-japanese" lang="ja" style="display:block">' + renderTokens(article.headline_tokens || []) + '</h1>' +
      '<p class="news-reader-lead">' + escapeHtml(article.teaser_bn || "") + '</p>' +
      '<div class="news-divider"></div>' +
      '<section aria-labelledby="japanese-news-title"><h2 class="news-section-title" id="japanese-news-title"><i class="fa-solid fa-language" aria-hidden="true"></i> Japanese News</h2><div class="news-japanese" lang="ja">' + japanese + '</div></section>' +
      '<div class="news-divider"></div>' +
      '<details class="news-explanation"><summary><span><i class="fa-solid fa-bangla-sign" aria-hidden="true"></i> বাংলা বিস্তারিত ব্যাখ্যা</span></summary><div class="news-explanation-body">' + explanations + '</div></details>' +
      '<div class="news-divider"></div>' +
      '<section aria-labelledby="vocabulary-title"><h2 class="news-section-title" id="vocabulary-title"><i class="fa-solid fa-book-open" aria-hidden="true"></i> গুরুত্বপূর্ণ শব্দ</h2><div class="news-vocab-grid">' + vocab + '</div></section>' +
      '<div class="news-divider"></div>' +
      '<div class="news-source"><span><strong>উৎস:</strong> ' + escapeHtml(source.name || "সংবাদ উৎস") + '<br>' + escapeHtml(editorialNote || "") + '</span>' + sourceHtml + '</div>' +
      (adjacent ? '<div class="news-reader-adjacent" aria-label="পরের ও আগের নিউজ">' + adjacent + '</div>' : '') +
      '<div class="news-divider"></div>' +
      '<nav class="news-reader-nav" aria-label="নিউজ নেভিগেশন"><a href="/daily-news.html"><i class="fa-solid fa-box-archive" aria-hidden="true"></i> আগের সব নিউজ</a><a href="/"><i class="fa-solid fa-house" aria-hidden="true"></i> হোমে ফিরুন</a></nav>' +
    '</article>';
  }

  function renderReader() {
    var root = document.querySelector("[data-news-reader]");
    if (!root) return;
    ensureEnhancementStyles();
    var id = new URLSearchParams(window.location.search).get("id") || "";

    loadData().then(function (data) {
      var articles = data.articles || [];
      var index = id ? articles.findIndex(function (item) { return item.id === id; }) : 0;
      if (id && index < 0) {
        root.innerHTML = '<div class="news-reader-card"><div class="daily-news-state">নিউজটি পাওয়া যায়নি। <a href="/daily-news.html">নিউজ আর্কাইভে ফিরুন</a></div></div>';
        document.title = "নিউজ পাওয়া যায়নি | আপনার নিহোন";
        return;
      }
      if (index < 0 || !articles[index]) {
        root.innerHTML = '<div class="news-reader-card"><div class="daily-news-state">এখনো কোনো নিউজ যোগ হয়নি। <a href="/daily-news.html">আর্কাইভে ফিরুন</a></div></div>';
        return;
      }
      var article = articles[index];
      var navigation = {
        newer: index > 0 ? articles[index - 1] : null,
        older: index < articles.length - 1 ? articles[index + 1] : null
      };
      root.innerHTML = readerArticle(article, data.editorial_note_bn, navigation);
      document.title = article.headline + " | আপনার নিহোন";
      var description = document.querySelector('meta[name="description"]');
      if (description && article.teaser_bn) description.setAttribute("content", article.teaser_bn);
      setupFuriganaToggle();
    }).catch(function () {
      root.innerHTML = '<div class="news-reader-card"><div class="daily-news-state">নিউজটি লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।</div></div>';
    });
  }

  function initPage() {
    var page = document.body ? document.body.dataset.page : "";
    if (page === "home") mountHome();
    if (page === "daily-news") renderArchive();
    if (page === "daily-news-reader") renderReader();
  }

  window.AponarDailyNews = {
    mountHome: mountHome,
    renderHome: renderHome,
    renderArchive: renderArchive,
    renderReader: renderReader,
    initPage: initPage,
    applyFuriganaPreference: applyFuriganaPreference
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
