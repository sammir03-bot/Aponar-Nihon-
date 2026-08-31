(function () {
  "use strict";

  var HASH_ROUTES = {
    "#n5": "/n5.html",
    "#n4": "/n4.html",
    "#n3": "/n3.html",
    "#quiz": "/quiz.html",
    "#ai-tutor": "/tutor-section.html",
    "#kana": "/Hiragana-Katagana.html",
    "#japan-start": "/japan-life.html",
    "#interviews": "/interview.html",
    "#essential-phrases": "/essential-phrases.html",
    "#guide": "/study-guide.html",
    "#about": "/about.html",
    "#contact": "/contact.html"
  };

  var GREETINGS = {
    bn: ["শুভ সকাল", "শুভ বিকেল", "শুভ সন্ধ্যা"],
    ja: ["おはようございます", "こんにちは", "こんばんは"],
    en: ["Good morning", "Good afternoon", "Good evening"],
    vi: ["Chào buổi sáng", "Chào buổi chiều", "Chào buổi tối"],
    ne: ["शुभ प्रभात", "शुभ दिउँसो", "शुभ साँझ"],
    hi: ["सुप्रभात", "नमस्कार", "शुभ संध्या"],
    ur: ["صبح بخیر", "دوپہر بخیر", "شام بخیر"],
    my: ["မင်္ဂလာနံနက်ခင်းပါ", "မင်္ဂလာနေ့လယ်ခင်းပါ", "မင်္ဂလာညနေခင်းပါ"],
    zh: ["早上好", "下午好", "晚上好"],
    si: ["සුබ උදෑසනක්", "සුබ දහවලක්", "සුබ සන්ධ්‍යාවක්"],
    fil: ["Magandang umaga", "Magandang hapon", "Magandang gabi"]
  };

  function tr(key, fallback) {
    return window.AponarI18n ? window.AponarI18n.t(key, fallback) : fallback;
  }

  function redirectLegacyHash() {
    if (document.body.dataset.page !== "home") return;
    var route = HASH_ROUTES[window.location.hash.toLowerCase()];
    if (route) window.location.replace(route);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {
        // The website remains fully usable when service-worker registration is unavailable.
      });
    });
  }

  function setActiveDock() {
    var page = document.body.dataset.page || "home";
    document.querySelectorAll(".app-dock-link").forEach(function (link) {
      var key = link.dataset.nav || "";
      link.classList.toggle("active", key === page);
      if (key === page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function setText(selector, key, fallback) {
    var element = document.querySelector(selector);
    if (element) element.textContent = tr(key, fallback || element.textContent);
  }

  function setCard(href, labelKey, noteKey) {
    var card = document.querySelector('.app-tool[href="' + href + '"]');
    if (!card) return;
    var label = card.querySelector("b");
    var note = card.querySelector("small");
    if (label && labelKey) label.textContent = tr(labelKey, label.textContent);
    if (note && noteKey) note.textContent = tr(noteKey, note.textContent);
  }

  function setQuick(href, key) {
    var link = document.querySelector('.app-quick-item[href="' + href + '"] span');
    if (link) link.textContent = tr(key, link.textContent);
  }

  function applyHomeLanguage() {
    if (document.body.dataset.page !== "home") return;
    setText(".app-brand-copy strong", "brand.name", "আপনার নিহোন");
    setText(".app-brand-copy small", "brand.tagline", "JAPANESE LEARNING HUB");
    setText(".app-eyebrow", "home.eyebrow", "এক জায়গায় সবকিছু");
    setText("#all-sections-title", "home.title", "সব গুরুত্বপূর্ণ সেকশন");

    var input = document.getElementById("appSearchInput");
    if (input) {
      input.placeholder = tr("home.search", input.placeholder);
      input.lang = window.AponarI18n ? window.AponarI18n.getLanguage() : "bn";
    }

    setCard("/n5.html", null, "home.n5.note");
    setCard("/n4.html", null, "home.n4.note");
    setCard("/n3.html", null, "home.n3.note");
    setCard("/quiz.html", "home.quiz", "home.quiz.note");
    setCard("/tutor-section.html", "home.tutor", "home.tutor.note");
    setCard("/mock-test.html", null, "home.mock.note");
    setCard("/interview.html", "home.interview", "home.interview.note");
    setCard("/ssw.html", null, "home.ssw.note");
    setCard("/essential-phrases.html", "home.phrases", "home.phrases.note");
    setCard("/japan-life.html", "home.japanlife", "home.japanlife.note");
    setCard("/Hiragana-Katagana.html", "home.kana", "home.kana.note");

    setQuick("/n5.html", "home.kana");
    setQuick("/n4.html", "home.n4.note");
    setQuick("/n3.html", "home.n3.note");
    setQuick("/essential-phrases.html", "home.phrases");
    setupGreeting();
  }

  function setupLanguageSwitch() {
    var input = document.getElementById("appSearchInput");
    var buttons = document.querySelectorAll("[data-search-language]");
    var oldSwitcher = document.querySelector(".app-language-switch");
    if (window.AponarI18n && oldSwitcher) {
      oldSwitcher.hidden = true;
      return;
    }
    if (!input || !buttons.length) return;

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) { item.classList.remove("active"); });
        button.classList.add("active");
        var japanese = button.dataset.searchLanguage === "ja";
        input.placeholder = japanese
          ? "漢字、語彙、文法を検索…"
          : "কানজি, ভোকাবুলারি, গ্রামার খুঁজুন…";
        input.lang = japanese ? "ja" : "bn";
        input.focus();
      });
    });
  }

  function setupDashboardSearch() {
    var form = document.getElementById("appSearchForm");
    var input = document.getElementById("appSearchInput");
    var results = document.getElementById("appSearchResults");
    if (!form || !input || !results) return;

    var entries = Array.from(document.querySelectorAll("[data-search]"))
      .map(function (element) {
        return {
          label: (element.dataset.label || element.textContent || "").replace(/\s+/g, " ").trim(),
          keywords: (element.dataset.search || "").toLowerCase(),
          href: element.getAttribute("href") || "#",
          icon: element.dataset.searchIcon || "fa-arrow-right"
        };
      })
      .filter(function (entry) { return entry.label && entry.href !== "#"; });

    function closeResults() {
      results.hidden = true;
      results.innerHTML = "";
    }

    function render(query) {
      var normalized = (query || "").trim().toLowerCase();
      if (!normalized) {
        closeResults();
        return [];
      }

      var matches = entries.filter(function (entry) {
        return (entry.label + " " + entry.keywords).toLowerCase().includes(normalized);
      }).slice(0, 7);

      if (!matches.length) {
        results.innerHTML = '<div class="app-search-result"><span>' + tr("home.noResults", "কিছু পাওয়া যায়নি—N5, N4, N3, AI বা কুইজ লিখে দেখুন") + '</span></div>';
      } else {
        results.innerHTML = matches.map(function (entry) {
          return '<a class="app-search-result" href="' + entry.href + '">' +
            '<span><i class="fa-solid ' + entry.icon + '" aria-hidden="true"></i>&nbsp;&nbsp;' + entry.label + '</span>' +
            '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a>';
        }).join("");
      }
      results.hidden = false;
      return matches;
    }

    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("focus", function () {
      if (input.value.trim()) render(input.value);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var matches = render(input.value);
      if (matches.length) window.location.href = matches[0].href;
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".app-search-card")) closeResults();
    });
  }

  function setupGreeting() {
    var greeting = document.querySelector("[data-greeting]");
    if (!greeting) return;
    var language = window.AponarI18n ? window.AponarI18n.getLanguage() : "bn";
    var list = GREETINGS[language] || GREETINGS.bn;
    var hour = new Date().getHours();
    greeting.textContent = hour < 12 ? list[0] : hour < 17 ? list[1] : list[2];
  }

  function setupPwaInstall() {
    var card = document.getElementById("pwaInstallCard");
    var install = document.getElementById("pwaInstallButton");
    var close = document.getElementById("pwaInstallClose");
    if (!card || !install || !close) return;

    var deferredPrompt = null;
    var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (standalone) return;

    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      deferredPrompt = event;
      if (!sessionStorage.getItem("aponarNihonInstallClosed")) {
        window.setTimeout(function () { card.classList.add("show"); }, 900);
      }
    });

    install.addEventListener("click", async function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_error) { /* no-op */ }
      deferredPrompt = null;
      card.classList.remove("show");
    });

    close.addEventListener("click", function () {
      sessionStorage.setItem("aponarNihonInstallClosed", "yes");
      card.classList.remove("show");
    });

    window.addEventListener("appinstalled", function () {
      deferredPrompt = null;
      card.classList.remove("show");
    });
  }

  redirectLegacyHash();
  registerServiceWorker();
  document.addEventListener("DOMContentLoaded", function () {
    setActiveDock();
    setupLanguageSwitch();
    setupDashboardSearch();
    setupGreeting();
    setupPwaInstall();
    applyHomeLanguage();
  });
  window.addEventListener("aponar:languagechange", applyHomeLanguage);
})();
