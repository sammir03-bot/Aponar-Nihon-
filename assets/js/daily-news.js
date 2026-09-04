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
          var articles = Array.isArray(data.articles) ? data.articles.slice() : [];
          articles.sort(function (a, b) {
            return String(b.date || "").localeCompare(String(a.date || "")) ||
              String(b.id || "").localeCompare(String(a.id || ""));
          });
          data.articles = articles;
          return data;
        });
    }
    return dataPromise;
  }

  function formatDate(dateString) {
    try {
      return new Intl.DateTimeFormat("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }).format(new Date(dateString + "T00:00:00+09:00"));
    } catch (_error) {
      return dateString;
    }
  }

  function renderTokens(tokens) {
    if (!Array.isArray(tokens)) return "";
    return tokens.map(function (token) {
      if (token == null) return "";
      if (typeof token === "string" || typeof token === "number") {
        return escapeHtml(token);
      }
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
      button.addEventListener("click", function () {
        var current = document.documentElement.dataset.furigana === "off" ? "off" : "on";
        applyFuriganaPreference(current === "on" ? "off" : "on");
      });
    });
  }

  function homeCard(article, index) {
    var isNewest = index === 0;
    return '<a class="daily-news-card" href="/daily-news-reader.html?id=' + encodeURIComponent(article.id) + '">' +
      '<div>' +
        '<div class="daily-news-meta">' +
          (isNewest ? '<span class="daily-news-badge">আজকের প্রধান</span>' : '') +
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
        '<h2 id="daily-news-home-title">কানজি দিয়ে খবর পড়ুন, বুঝুন বাংলায়</h2></div>' +
        '<a class="daily-news-all" href="/daily-news.html"><span>সব নিউজ</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
      '</div>' +
      '<div class="daily-news-grid" data-daily-news-home-list><div class="daily-news-state">আজকের খবর লোড হচ্ছে…</div></div>';
    anchor.insertAdjacentElement("afterend", section);
    renderHome();
  }

  function renderHome() {
    var list = document.querySelector("[data-daily-news-home-list]");
    if (!list) return;
    loadData().then(function (data) {
      var articles = (data.articles || []).slice(0, 3);
      if (!articles.length) {
        list.innerHTML = '<div class="daily-news-state">আজকের জন্য কোনো নিউজ পাওয়া যায়নি।</div>';
        return;
      }
      list.innerHTML = articles.map(homeCard).join("");
    }).catch(function () {
      list.innerHTML = '<div class="daily-news-state">নিউজ লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।</div>';
    });
  }

  function archiveItem(article) {
    return '<a class="news-list-item" href="/daily-news-reader.html?id=' + encodeURIComponent(article.id) + '">' +
      '<span class="news-list-date">' + escapeHtml(formatDate(article.date)) + '<br><span class="news-level">' + escapeHtml(article.level || "") + '</span></span>' +
      '<span class="news-list-copy"><h2 lang="ja">' + escapeHtml(article.headline || "") + '</h2><p>' + escapeHtml(article.teaser_bn || "") + '</p></span>' +
      '<i class="fa-solid fa-chevron-right news-list-arrow" aria-hidden="true"></i>' +
    '</a>';
  }

  function renderArchive() {
    var list = document.querySelector("[data-news-archive-list]");
    var count = document.querySelector("[data-news-count]");
    if (!list) return;

    loadData().then(function (data) {
      var articles = data.articles || [];
      if (count) count.textContent = String(articles.length) + "টি নিউজ";
      if (!articles.length) {
        list.innerHTML = '<div class="daily-news-state">এখনো কোনো নিউজ যোগ হয়নি।</div>';
        return;
      }
      list.innerHTML = articles.map(archiveItem).join("");
    }).catch(function () {
      list.innerHTML = '<div class="daily-news-state">নিউজ আর্কাইভ লোড করা যায়নি।</div>';
    });
  }

  function readerArticle(article, editorialNote) {
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
    var sourceHtml = source.url
      ? '<a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener noreferrer">মূল উৎস দেখুন <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>'
      : "";

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
      '<div class="news-divider"></div>' +
      '<nav class="news-reader-nav" aria-label="নিউজ নেভিগেশন"><a href="/daily-news.html"><i class="fa-solid fa-box-archive" aria-hidden="true"></i> আগের সব নিউজ</a><a href="/"><i class="fa-solid fa-house" aria-hidden="true"></i> হোমে ফিরুন</a></nav>' +
    '</article>';
  }

  function renderReader() {
    var root = document.querySelector("[data-news-reader]");
    if (!root) return;
    var id = new URLSearchParams(window.location.search).get("id") || "";

    loadData().then(function (data) {
      var articles = data.articles || [];
      var article = articles.find(function (item) { return item.id === id; }) || articles[0];
      if (!article) {
        root.innerHTML = '<div class="news-reader-card"><div class="daily-news-state">নিউজটি পাওয়া যায়নি। <a href="/daily-news.html">আর্কাইভে ফিরুন</a></div></div>';
        return;
      }
      root.innerHTML = readerArticle(article, data.editorial_note_bn);
      document.title = article.headline + " | আপনার নিহোন";
      setupFuriganaToggle();
    }).catch(function () {
      root.innerHTML = '<div class="news-reader-card"><div class="daily-news-state">নিউজটি লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।</div></div>';
    });
  }

  function initPage() {
    var page = document.body ? document.body.dataset.page : "";
    if (page === "daily-news") renderArchive();
    if (page === "daily-news-reader") renderReader();
  }

  window.AponarDailyNews = {
    mountHome: mountHome,
    renderHome: renderHome,
    initPage: initPage,
    applyFuriganaPreference: applyFuriganaPreference
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
