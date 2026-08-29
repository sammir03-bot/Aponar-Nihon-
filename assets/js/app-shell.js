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

  function setupLanguageSwitch() {
    var input = document.getElementById("appSearchInput");
    var buttons = document.querySelectorAll("[data-search-language]");
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
        results.innerHTML = '<div class="app-search-result"><span>কিছু পাওয়া যায়নি—N5, N4, N3, AI বা কুইজ লিখে দেখুন</span></div>';
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
    var hour = new Date().getHours();
    greeting.textContent = hour < 12 ? "শুভ সকাল" : hour < 17 ? "শুভ বিকেল" : "শুভ সন্ধ্যা";
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
  });
})();
