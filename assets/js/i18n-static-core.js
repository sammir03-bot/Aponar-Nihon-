(function () {
  "use strict";

  function isStaticCore() {
    return document.documentElement.dataset.i18nMode === "static-core";
  }

  function alternate(language) {
    var link = document.querySelector('link[rel~="alternate"][hreflang="' + language + '"]');
    if (!link || !link.href) return "";
    try {
      var target = new URL(link.href, window.location.href);
      target.search = window.location.search;
      target.hash = window.location.hash;
      return target.pathname + target.search + target.hash;
    } catch (_error) {
      return "";
    }
  }

  function normalizedRoute(pathname) {
    var path = pathname || "/";
    path = path.replace(/\/index\.html$/i, "/").replace(/\.html$/i, "");
    if (path.length > 1) path = path.replace(/\/+$/, "");
    return path || "/";
  }

  function navigate(path) {
    if (!path) return false;
    var target = new URL(path, window.location.href);
    if (normalizedRoute(target.pathname) === normalizedRoute(window.location.pathname)) return false;
    window.location.assign(path);
    return true;
  }

  function enforceFallback(language) {
    if (!isStaticCore() || !window.AponarI18n) return false;
    language = window.AponarI18n.normalizeLanguage(language) || "bn";
    document.documentElement.dataset.i18nRequestedLanguage = language;

    if (language === "bn" || alternate(language)) {
      delete document.documentElement.dataset.i18nActiveFallback;
      return false;
    }

    document.documentElement.dataset.i18nActiveFallback = "bn";
    var preset = document.documentElement.dataset.languagePreset || "bn";
    if (preset === "bn") return false;
    return navigate(alternate("bn") || alternate("x-default"));
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!isStaticCore() || !window.AponarI18n) return;
    enforceFallback(window.AponarI18n.getLanguage());
  });

  window.addEventListener("aponar:languagechange", function (event) {
    var detail = event && event.detail ? event.detail : {};
    enforceFallback(detail.language || (window.AponarI18n && window.AponarI18n.getLanguage()));
  });
})();
