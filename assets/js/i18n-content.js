(function () {
  "use strict";

  if (!window.AponarI18n) return;

  var translatedNodes = new Set();
  var originalText = new WeakMap();
  var packCache = new Map();
  var requestSerial = 0;

  function pageKey() {
    var path = window.location.pathname || "/";
    if (path === "/" || /\/index\.html$/i.test(path)) return "index";
    path = path.replace(/^\/+|\/+$/g, "").replace(/\.html$/i, "");
    return path.replace(/[^a-zA-Z0-9._-]+/g, "__") || "index";
  }

  function normalize(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function restore() {
    translatedNodes.forEach(function (node) {
      if (originalText.has(node) && node.isConnected) node.nodeValue = originalText.get(node);
    });
    translatedNodes.clear();
    document.querySelectorAll("[data-i18n-content-dir]").forEach(function (element) {
      element.removeAttribute("dir");
      element.removeAttribute("data-i18n-content-dir");
    });
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
    restore();
    if (!pack || !Array.isArray(pack.entries) || !pack.entries.length) return;

    var table = new Map();
    pack.entries.forEach(function (entry) {
      if (!entry || typeof entry.source !== "string" || typeof entry.target !== "string") return;
      var source = normalize(entry.source);
      if (source) table.set(source, entry.target);
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
  }

  async function loadPack(language) {
    if (language === "bn") {
      restore();
      return;
    }

    var key = pageKey() + ":" + language;
    if (packCache.has(key)) {
      applyPack(packCache.get(key), language);
      return;
    }

    var serial = ++requestSerial;
    var url = "/assets/i18n/pages/" + encodeURIComponent(pageKey()) + "." + encodeURIComponent(language) + ".json";
    try {
      var response = await fetch(url, { headers: { Accept: "application/json" }, cache: "force-cache" });
      if (serial !== requestSerial) return;
      if (!response.ok) {
        packCache.set(key, null);
        restore();
        return;
      }
      var pack = await response.json();
      if (!pack || pack.targetLanguage !== language || !Array.isArray(pack.entries)) {
        packCache.set(key, null);
        restore();
        return;
      }
      packCache.set(key, pack);
      applyPack(pack, language);
    } catch (_error) {
      if (serial === requestSerial) restore();
    }
  }

  function sync() {
    loadPack(window.AponarI18n.getLanguage());
  }

  document.addEventListener("DOMContentLoaded", sync);
  window.addEventListener("aponar:languagechange", function () {
    window.requestAnimationFrame(sync);
  });

  window.AponarI18nContent = {
    pageKey: pageKey,
    reload: sync,
    restore: restore
  };
})();
