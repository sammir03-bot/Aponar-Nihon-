(function () {
  "use strict";

  if (!window.AponarI18n) return;

  var FIXED_BRAND_TEXT = new Set([
    "আপনার নিহোন",
    "APONAR NIHON",
    "Aponar Nihon",
    "JAPANESE LEARNING HUB"
  ]);
  var TRANSLATABLE_ATTRIBUTES = ["aria-label", "placeholder", "title", "alt"];
  var translatedNodes = new Set();
  var translatedElements = new Set();
  var originalText = new WeakMap();
  var originalAttributes = new WeakMap();
  var originalTitle = null;
  var packCache = new Map();
  var requestSerial = 0;
  var activePack = null;
  var activeTable = null;
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

  function protectedElement(element) {
    if (!element) return true;
    if (element.closest(
      "script,style,noscript,template,code,pre,textarea,svg,ruby,rt," +
      "[data-i18n-no-content],[lang^='ja'],.jp,.aponar-language-layer,.app-menu-layer"
    )) return true;
    return false;
  }

  function shouldSkipNode(node) {
    var parent = node.parentElement;
    if (protectedElement(parent)) return true;
    return FIXED_BRAND_TEXT.has(normalize(node.nodeValue));
  }

  function textNodes(root) {
    var nodes = [];
    if (!root) return nodes;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  }

  function rememberAttribute(element, name, value) {
    var saved = originalAttributes.get(element);
    if (!saved) {
      saved = {};
      originalAttributes.set(element, saved);
    }
    if (!Object.prototype.hasOwnProperty.call(saved, name)) saved[name] = value;
    translatedElements.add(element);
  }

  function restore() {
    applying = true;
    try {
      translatedNodes.forEach(function (node) {
        if (originalText.has(node) && node.isConnected) node.nodeValue = originalText.get(node);
      });
      translatedNodes.clear();

      translatedElements.forEach(function (element) {
        if (!element.isConnected) return;
        var saved = originalAttributes.get(element) || {};
        Object.keys(saved).forEach(function (name) {
          element.setAttribute(name, saved[name]);
        });
      });
      translatedElements.clear();

      if (originalTitle !== null) {
        document.title = originalTitle;
        originalTitle = null;
      }
      document.querySelectorAll("[data-i18n-content-dir]").forEach(function (element) {
        element.removeAttribute("dir");
        element.removeAttribute("data-i18n-content-dir");
      });
    } finally {
      applying = false;
    }
  }

  function tableFor(pack) {
    var table = new Map();
    if (!pack || pack.reviewed !== true || !Array.isArray(pack.entries)) return table;
    pack.entries.forEach(function (entry) {
      if (!entry || typeof entry.source !== "string" || typeof entry.target !== "string") return;
      var source = normalize(entry.source);
      var target = entry.target.trim();
      if (source && target) table.set(source, target);
    });
    return table;
  }

  function translateTextNode(node, table, language) {
    var source = normalize(node.nodeValue);
    if (!source || FIXED_BRAND_TEXT.has(source)) return;
    var target = table.get(source);
    if (typeof target !== "string") return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);

    var raw = node.nodeValue || "";
    var leading = (raw.match(/^\s*/) || [""])[0];
    var trailing = (raw.match(/\s*$/) || [""])[0];
    node.nodeValue = leading + target + trailing;
    translatedNodes.add(node);

    if (language === "ur" && node.parentElement) {
      node.parentElement.setAttribute("dir", "auto");
      node.parentElement.setAttribute("data-i18n-content-dir", "true");
    }
  }

  function translateAttribute(element, name, table, language) {
    if (!element.hasAttribute(name) || protectedElement(element)) return;
    var raw = element.getAttribute(name) || "";
    var source = normalize(raw);
    if (!source || FIXED_BRAND_TEXT.has(source)) return;
    var target = table.get(source);
    if (typeof target !== "string") return;
    rememberAttribute(element, name, raw);
    element.setAttribute(name, target);
    if (language === "ur") {
      element.setAttribute("dir", "auto");
      element.setAttribute("data-i18n-content-dir", "true");
    }
  }

  function applyTranslations(root, table, language) {
    if (!root || !table || !table.size) return;
    applying = true;
    try {
      textNodes(root).forEach(function (node) {
        translateTextNode(node, table, language);
      });

      var selector = TRANSLATABLE_ATTRIBUTES.map(function (name) {
        return "[" + name + "]";
      }).join(",");
      root.querySelectorAll(selector).forEach(function (element) {
        TRANSLATABLE_ATTRIBUTES.forEach(function (name) {
          translateAttribute(element, name, table, language);
        });
      });
      root.querySelectorAll("input[type='button'][value],input[type='submit'][value],input[type='reset'][value]").forEach(function (element) {
        translateAttribute(element, "value", table, language);
      });

      if (root === document.body || root === document.documentElement) {
        var titleSource = normalize(document.title);
        var titleTarget = table.get(titleSource);
        if (titleTarget && !FIXED_BRAND_TEXT.has(titleSource)) {
          if (originalTitle === null) originalTitle = document.title;
          document.title = titleTarget;
        }
        var description = document.querySelector("meta[name='description'][content]");
        if (description) translateAttribute(description, "content", table, language);
      }
    } finally {
      applying = false;
    }
  }

  function applyPack(pack, language) {
    restore();
    if (!pack || pack.reviewed !== true || !Array.isArray(pack.entries)) {
      activeTable = null;
      return;
    }
    activeTable = tableFor(pack);
    applyTranslations(document.body, activeTable, language);
  }

  async function loadPack(language) {
    activeLanguage = language;
    var serial = ++requestSerial;

    if (language === "bn") {
      activePack = null;
      activeTable = null;
      restore();
      return;
    }

    if (packCache.has(language)) {
      if (serial !== requestSerial || activeLanguage !== language) return;
      activePack = packCache.get(language);
      applyPack(activePack, language);
      return;
    }

    var url = "/translations/" + encodeURIComponent(language) + ".json";
    try {
      var response = await fetch(url, { headers: { Accept: "application/json" }, cache: "force-cache" });
      if (serial !== requestSerial || activeLanguage !== language) return;
      if (!response.ok) {
        packCache.set(language, null);
        activePack = null;
        activeTable = null;
        restore();
        return;
      }
      var pack = await response.json();
      if (serial !== requestSerial || activeLanguage !== language) return;
      if (!pack || pack.reviewed !== true || pack.targetLanguage !== language || !Array.isArray(pack.entries)) {
        packCache.set(language, null);
        activePack = null;
        activeTable = null;
        restore();
        return;
      }
      packCache.set(language, pack);
      activePack = pack;
      applyPack(activePack, language);
    } catch (_error) {
      if (serial === requestSerial && activeLanguage === language) {
        activePack = null;
        activeTable = null;
        restore();
      }
    }
  }

  function sync() {
    loadPack(window.AponarI18n.getLanguage());
  }

  function scheduleDynamicRefresh() {
    if (applying || activeLanguage === "bn" || !activeTable) return;
    window.clearTimeout(mutationTimer);
    mutationTimer = window.setTimeout(function () {
      if (!applying && activeTable && activeLanguage !== "bn") {
        applyTranslations(document.body, activeTable, activeLanguage);
      }
    }, 80);
  }

  function observeDynamicContent() {
    var root = document.body;
    if (!root || typeof MutationObserver === "undefined") return;
    var observer = new MutationObserver(function (mutations) {
      if (applying) return;
      var meaningful = mutations.some(function (mutation) {
        if (mutation.type === "childList") return true;
        if (mutation.type === "characterData") return !translatedNodes.has(mutation.target);
        if (mutation.type === "attributes") return !translatedElements.has(mutation.target);
        return false;
      });
      if (meaningful) scheduleDynamicRefresh();
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES.concat(["value"])
    });
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
