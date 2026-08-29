(function () {
  "use strict";

  var body = document.body;
  var hubId = body.dataset.learningHub;
  if (!hubId) return;

  var STORAGE_KEY = "aponarNihonHub:" + hubId + ":v1";
  var state = { opened: [], checks: [], lastHref: "" };
  var toastTimer = 0;

  function readJson(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || "null");
      return value === null ? fallback : value;
    } catch (_error) {
      return fallback;
    }
  }

  function loadState() {
    var saved = readJson(STORAGE_KEY, null);
    if (!saved || typeof saved !== "object") return;
    if (Array.isArray(saved.opened)) state.opened = saved.opened.filter(function (item) { return typeof item === "string"; });
    if (Array.isArray(saved.checks)) state.checks = saved.checks.filter(function (item) { return typeof item === "string"; });
    if (typeof saved.lastHref === "string") state.lastHref = saved.lastHref;
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_error) { /* The page works without persistence. */ }
  }

  function countTrueObject(key) {
    var value = readJson(key, {});
    if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
    return Object.keys(value).filter(function (item) { return Boolean(value[item]); }).length;
  }

  function countArray(key) {
    var value = readJson(key, []);
    return Array.isArray(value) ? new Set(value).size : 0;
  }

  function countLessons(pageKey, total) {
    var done = 0;
    for (var index = 1; index <= total; index += 1) {
      try {
        if (localStorage.getItem("aponarnihon:" + pageKey + ":" + index) === "1") done += 1;
      } catch (_error) { return done; }
    }
    return done;
  }

  function sourceProgress(source) {
    if (!source) return null;
    var parts = source.split(":");
    var type = parts.shift();
    var total = Number(parts.pop()) || 0;
    var key = parts.join(":");
    var done = 0;
    if (type === "lessons") done = countLessons(key, total);
    if (type === "array") done = countArray(key);
    if (type === "object") done = countTrueObject(key);
    if (type === "set") done = countArray(key);
    return { done: Math.min(done, total), total: total };
  }

  function quizProgress() {
    var sets = 0;
    try {
      for (var index = 0; index < localStorage.length; index += 1) {
        var key = localStorage.key(index) || "";
        if (key.indexOf("aponarQuiz:") !== 0) continue;
        var answers = readJson(key, {});
        if (answers && Object.keys(answers).length) sets += 1;
      }
    } catch (_error) { /* Keep the progress available even in private mode. */ }
    var mockResults = readJson("aponarNihonMockResults", {});
    var mocks = mockResults && typeof mockResults === "object" ? Object.keys(mockResults).length : 0;
    return { done: Math.min(sets, 90) + Math.min(mocks, 30), total: 120, label: sets + "টি quiz set · " + mocks + "টি mock" };
  }

  function setCardStatus(card) {
    var id = card.dataset.track || card.getAttribute("href") || "";
    var status = card.querySelector("[data-card-status]");
    var progress = sourceProgress(card.dataset.progressSource || "");
    var opened = state.opened.indexOf(id) !== -1;
    card.classList.toggle("is-opened", opened || Boolean(progress && progress.done));
    if (!status) return;
    if (progress) {
      status.textContent = progress.done + "/" + progress.total + " সম্পন্ন";
      return;
    }
    status.textContent = opened ? "খোলা হয়েছে" : "শুরু হয়নি";
  }

  function progressMetrics() {
    if (hubId === "quiz") return quizProgress();

    var seen = {};
    var done = 0;
    var total = 0;
    document.querySelectorAll("[data-progress-source]").forEach(function (card) {
      var source = card.dataset.progressSource;
      if (!source || seen[source]) return;
      seen[source] = true;
      var progress = sourceProgress(source);
      if (!progress) return;
      done += progress.done;
      total += progress.total;
    });
    if (total) return { done: done, total: total, label: done + "/" + total + " শেখা সংরক্ষিত" };

    var resources = document.querySelectorAll("[data-track]").length;
    var checks = document.querySelectorAll("[data-plan-check]").length;
    return {
      done: Math.min(state.opened.length, resources) + Math.min(state.checks.length, checks),
      total: resources + checks,
      label: state.opened.length + "টি resource · " + state.checks.length + "টি প্রস্তুতি"
    };
  }

  function updateProgress() {
    document.querySelectorAll("[data-track]").forEach(setCardStatus);
    var metrics = progressMetrics();
    var percent = metrics.total ? Math.round((metrics.done / metrics.total) * 100) : 0;
    var orb = document.querySelector("[data-progress-orb]");
    var value = document.querySelector("[data-progress-value]");
    var label = document.querySelector("[data-progress-label]");
    var bar = document.querySelector("[data-progress-bar]");
    if (orb) orb.style.setProperty("--progress", String(percent));
    if (value) value.textContent = percent + "%";
    if (label) label.textContent = metrics.label;
    if (bar) bar.style.width = percent + "%";

    var checked = document.querySelectorAll("[data-plan-check]:checked").length;
    var totalChecks = document.querySelectorAll("[data-plan-check]").length;
    var planCount = document.querySelector("[data-plan-count]");
    if (planCount) planCount.textContent = checked + "/" + totalChecks + " শেষ";
  }

  function showSaved() {
    var toast = document.querySelector("[data-save-status]");
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.classList.add("show");
    toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 1500);
  }

  function setupChecks() {
    document.querySelectorAll("[data-plan-check]").forEach(function (checkbox) {
      var id = checkbox.dataset.planCheck;
      checkbox.checked = state.checks.indexOf(id) !== -1;
      checkbox.addEventListener("change", function () {
        if (checkbox.checked && state.checks.indexOf(id) === -1) state.checks.push(id);
        if (!checkbox.checked) state.checks = state.checks.filter(function (item) { return item !== id; });
        saveState();
        updateProgress();
        showSaved();
      });
    });
  }

  function setupResourceTracking() {
    document.querySelectorAll("[data-track]").forEach(function (card) {
      card.addEventListener("click", function () {
        var id = card.dataset.track || card.getAttribute("href") || "";
        if (state.opened.indexOf(id) === -1) state.opened.push(id);
        state.lastHref = card.getAttribute("href") || state.lastHref;
        saveState();
      });
    });

    var continueLink = document.querySelector("[data-continue]");
    if (continueLink && state.lastHref) {
      continueLink.href = state.lastHref;
      var label = continueLink.querySelector("span");
      if (label) label.textContent = "শেষ resource থেকে চালিয়ে যান";
    }
  }

  function setupDailyLinks() {
    var day = Math.floor(Date.now() / 86400000);
    document.querySelectorAll("[data-daily-link]").forEach(function (link) {
      var level = (link.dataset.dailyLevel || "n5").toLowerCase();
      var categories = level === "n3" ? ["reading"] : ["vocabulary", "kanji", "grammar", "reading"];
      var category = categories[day % categories.length];
      var part = (day % 10) + 1;
      link.href = "/jlpt-quiz.html?level=" + level + "&category=" + category + "&part=" + part;
    });
  }

  loadState();
  setupChecks();
  setupResourceTracking();
  setupDailyLinks();
  updateProgress();
  window.addEventListener("pageshow", updateProgress);
  window.addEventListener("storage", updateProgress);
})();
