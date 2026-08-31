(function () {
  "use strict";

  if (!window.AponarI18n) return;

  var translatedNodes = new Set();
  var originalText = new WeakMap();
  var packCache = new Map();
  var requestSerial = 0;
  var activePack = null;
  var activeLanguage = "bn";
  var applying = false;
  var mutationTimer = 0;

  function pageKey() {
    var path = window.location.pathname || "/";
    var explicit = document.documentElement.dataset.i18nPage || "";
    if (explicit) return explicit;

    var parts = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    if (parts.length && window.AponarI18n.languages[parts[0]]) parts.shift();
    if (parts.length && /^index\.html$/i.test(parts[parts.length - 1])) parts.pop();
    path = parts.join("/").replace(/\.html$/i, "");
    if (!path) return "index";
    return path.replace(/[^a-zA-Z0-9._-]+/g, "__") || "index";
  }

  function normalize(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function restore() {
    applying = true;
    try {
      translatedNodes.forEach(function (node) {
        if (originalText.has(node) && node.isConnected) node.nodeValue = originalText.get(node);
      });
      translatedNodes.clear();
      document.querySelectorAll("[data-i18n-content-dir]").forEach(function (element) {
        element.removeAttribute("dir");
        element.removeAttribute("data-i18n-content-dir");
      });
    } finally {
      applying = false;
    }
  }

  function shouldSkip(node) {
    var parent = node.parentElement;
    if (!parent) return true;
    if (parent.closest("script,style,noscript,template,code,pre,textarea,svg,[data-i18n-no-content]")) return true;
    if (parent.closest(".aponar-language-layer,.app-menu-layer")) return true;
    return false;
  }

  function textNodes(root) {
    var nodes = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
        return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  }

  function applyPack(pack, language) {
    applying = true;
    try {
      translatedNodes.forEach(function (node) {
        if (originalText.has(node) && node.isConnected) node.nodeValue = originalText.get(node);
      });
      translatedNodes.clear();
      document.querySelectorAll("[data-i18n-content-dir]").forEach(function (element) {
        element.removeAttribute("dir");
        element.removeAttribute("data-i18n-content-dir");
      });

      if (!pack || pack.reviewed !== true || !Array.isArray(pack.entries) || !pack.entries.length) return;

      var table = new Map();
      pack.entries.forEach(function (entry) {
        if (!entry || typeof entry.source !== "string" || typeof entry.target !== "string") return;
        var source = normalize(entry.source);
        var target = entry.target.trim();
        if (source && target) table.set(source, target);
      });
      if (!table.size) return;

      var root = document.querySelector("main") || document.body;
      textNodes(root).forEach(function (node) {
        var source = normalize(node.nodeValue);
        var target = table.get(source);
        if (typeof target !== "string") return;
        if (!originalText.has(node)) originalText.set(node, node.nodeValue);

        var raw = node.nodeValue || "";
        var leading = raw.match(/^\s*/)?.[0] || "";
        var trailing = raw.match(/\s*$/)?.[0] || "";
        node.nodeValue = leading + target + trailing;
        translatedNodes.add(node);

        if (language === "ur" && node.parentElement) {
          node.parentElement.setAttribute("dir", "auto");
          node.parentElement.setAttribute("data-i18n-content-dir", "true");
        }
      });
    } finally {
      applying = false;
    }
  }

  async function loadPack(language) {
    activeLanguage = language;
    var serial = ++requestSerial;

    if (language === "bn") {
      activePack = null;
      restore();
      return;
    }

    var key = pageKey() + ":" + language;
    if (packCache.has(key)) {
      if (serial !== requestSerial || activeLanguage !== language) return;
      activePack = packCache.get(key);
      applyPack(activePack, language);
      return;
    }

    var url = "/assets/i18n/pages/" + encodeURIComponent(pageKey()) + "." + encodeURIComponent(language) + ".json";
    try {
      var response = await fetch(url, { headers: { Accept: "application/json" }, cache: "force-cache" });
      if (serial !== requestSerial || activeLanguage !== language) return;
      if (!response.ok) {
        packCache.set(key, null);
        activePack = null;
        restore();
        return;
      }
      var pack = await response.json();
      if (serial !== requestSerial || activeLanguage !== language) return;
      if (!pack || pack.reviewed !== true || pack.targetLanguage !== language || !Array.isArray(pack.entries)) {
        packCache.set(key, null);
        activePack = null;
        restore();
        return;
      }
      packCache.set(key, pack);
      activePack = pack;
      applyPack(activePack, language);
    } catch (_error) {
      if (serial === requestSerial && activeLanguage === language) {
        activePack = null;
        restore();
      }
    }
  }

  function sync() {
    loadPack(window.AponarI18n.getLanguage());
  }

  function scheduleDynamicRefresh() {
    if (applying || activeLanguage === "bn" || !activePack) return;
    window.clearTimeout(mutationTimer);
    mutationTimer = window.setTimeout(function () {
      if (!applying && activePack && activeLanguage !== "bn") applyPack(activePack, activeLanguage);
    }, 80);
  }

  function observeDynamicContent() {
    var root = document.querySelector("main") || document.body;
    if (!root || typeof MutationObserver === "undefined") return;
    var observer = new MutationObserver(function (mutations) {
      if (applying) return;
      var meaningful = mutations.some(function (mutation) {
        if (mutation.type === "childList") return true;
        if (mutation.type === "characterData") return !translatedNodes.has(mutation.target);
        return false;
      });
      if (meaningful) scheduleDynamicRefresh();
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    sync();
    observeDynamicContent();
  });
  window.addEventListener("aponar:languagechange", function () {
    window.requestAnimationFrame(sync);
  });

  window.AponarI18nContent = {
    pageKey: pageKey,
    reload: sync,
    restore: restore
  };
})();
