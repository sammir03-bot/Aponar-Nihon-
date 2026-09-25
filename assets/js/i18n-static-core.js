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

  function useDirectStaticLanguage(language) {
    if (!isStaticCore() || !window.AponarI18n) return false;
    language = window.AponarI18n.normalizeLanguage(language) || "bn";
    document.documentElement.dataset.i18nRequestedLanguage = language;

    var preset = document.documentElement.dataset.languagePreset || document.documentElement.lang || "bn";
    if (preset === language) {
      delete document.documentElement.dataset.i18nMissingStaticLanguage;
      return false;
    }

    var target = alternate(language);
    if (!target) {
      document.documentElement.dataset.i18nMissingStaticLanguage = language;
      return false;
    }

    delete document.documentElement.dataset.i18nMissingStaticLanguage;
    return navigate(target);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!isStaticCore() || !window.AponarI18n) return;
    useDirectStaticLanguage(window.AponarI18n.getLanguage());
  });

  window.addEventListener("aponar:languagechange", function (event) {
    var detail = event && event.detail ? event.detail : {};
    useDirectStaticLanguage(detail.language || (window.AponarI18n && window.AponarI18n.getLanguage()));
  });
})();
