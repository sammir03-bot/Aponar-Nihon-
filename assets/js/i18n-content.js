(function () {
  "use strict";

  if (!window.AponarI18n) return;

  var RUNTIME_VERSION = "20260901.9";
  var CACHE_VERSION = "20260901.8";
  var API_PATH = "/api/i18n/translate";
  var CACHE_NAME = "aponar-nihon-i18n-" + CACHE_VERSION;
  var TRANSLATABLE_ATTRIBUTES = [
    "title", "placeholder", "aria-label", "aria-description", "alt", "label",
    "data-label", "data-title", "data-empty", "data-message", "data-success", "data-error"
  ];
  var OBSERVED_ATTRIBUTES = TRANSLATABLE_ATTRIBUTES.concat(["value", "content"]);
  var PRESERVE_SELECTOR = [
    "script", "style", "noscript", "template", "code", "pre", "textarea", "svg", "ruby", "rt",
    "[contenteditable]", "[data-i18n-preserve]", "[data-user-content]", ".tutor-message.user",
    ".user-message", "[data-message-role='user']", ".aponar-language-layer", "#aponarLanguageButton",
    ".app-menu-layer", "#aponarI18nStatus", ".aponar-i18n-dialog"
  ].join(",");
  var JAPANESE_SELECTOR = ["body [lang='ja']", "body [lang^='ja-']", ".jp", ".japanese", ".kanji", ".kana"].join(",");
  var STATUS_MESSAGES = {
    bn: { loading: "পুরো পেজ বাংলায় প্রস্তুত করা হচ্ছে…", detail: "লেখা, বাটন, ফর্ম ও নতুন দেখানো তথ্য অনুবাদ হচ্ছে।", error: "এই পেজের সব লেখা এখন অনুবাদ করা যায়নি।", retry: "আবার চেষ্টা করুন", ok: "ঠিক আছে", cancel: "বাতিল" },
    en: { loading: "Preparing the entire page in English…", detail: "Translating content, buttons, forms, and dynamic messages.", error: "The complete page could not be translated yet.", retry: "Try again", ok: "OK", cancel: "Cancel" },
    ja: { loading: "ページ全体を日本語で準備しています…", detail: "本文、ボタン、フォーム、動的メッセージを翻訳しています。", error: "ページ全体をまだ翻訳できませんでした。", retry: "もう一度試す", ok: "確認", cancel: "キャンセル" },
    vi: { loading: "Đang chuẩn bị toàn bộ trang bằng tiếng Việt…", detail: "Đang dịch nội dung, nút, biểu mẫu và thông báo động.", error: "Chưa thể dịch toàn bộ trang.", retry: "Thử lại", ok: "OK", cancel: "Hủy" },
    ne: { loading: "सम्पूर्ण पृष्ठ नेपालीमा तयार हुँदैछ…", detail: "सामग्री, बटन, फाराम र नयाँ सन्देश अनुवाद हुँदैछन्।", error: "सम्पूर्ण पृष्ठ अहिले अनुवाद गर्न सकिएन।", retry: "फेरि प्रयास गर्नुहोस्", ok: "ठीक छ", cancel: "रद्द" },
    hi: { loading: "पूरा पेज हिन्दी में तैयार हो रहा है…", detail: "सामग्री, बटन, फ़ॉर्म और नए संदेशों का अनुवाद हो रहा है।", error: "पूरा पेज अभी अनुवाद नहीं हो सका।", retry: "फिर कोशिश करें", ok: "ठीक है", cancel: "रद्द करें" },
    ur: { loading: "پورا صفحہ اردو میں تیار ہو رہا ہے…", detail: "مواد، بٹن، فارم اور نئے پیغامات کا ترجمہ ہو رہا ہے۔", error: "پورے صفحے کا ترجمہ ابھی نہیں ہو سکا۔", retry: "دوبارہ کوشش کریں", ok: "ٹھیک ہے", cancel: "منسوخ" },
    my: { loading: "စာမျက်နှာတစ်ခုလုံးကို မြန်မာဘာသာဖြင့် ပြင်ဆင်နေသည်…", detail: "အကြောင်းအရာ၊ ခလုတ်၊ ဖောင်နှင့် စာအသစ်များကို ဘာသာပြန်နေသည်။", error: "စာမျက်နှာတစ်ခုလုံးကို မဘာသာပြန်နိုင်သေးပါ။", retry: "ထပ်ကြိုးစားရန်", ok: "အိုကေ", cancel: "ပယ်ဖျက်" },
    zh: { loading: "正在将整个页面准备为中文…", detail: "正在翻译内容、按钮、表单和动态消息。", error: "暂时无法翻译整个页面。", retry: "重试", ok: "确定", cancel: "取消" },
    si: { loading: "මුළු පිටුවම සිංහලෙන් සූදානම් කරමින්…", detail: "අන්තර්ගතය, බොත්තම්, පෝරම සහ නව පණිවිඩ පරිවර්තනය වෙමින් පවතී.", error: "මුළු පිටුවම තවම පරිවර්තනය කළ නොහැකි විය.", retry: "නැවත උත්සාහ කරන්න", ok: "හරි", cancel: "අවලංගු කරන්න" },
    fil: { loading: "Inihahanda ang buong page sa Filipino…", detail: "Isinasalin ang content, buttons, forms, at dynamic messages.", error: "Hindi pa maisalin ang buong page.", retry: "Subukan ulit", ok: "OK", cancel: "Kanselahin" }
  };

  var originalText = new WeakMap();
  var knownTextNodes = new Set();
  var originalAttributes = new WeakMap();
  var knownAttributeElements = new Set();
  var translationTable = new Map();
  var languageTables = new Map();
  var packCache = new Map();
  var observer = null;
  var observerConnected = false;
  var applying = false;
  var refreshTimer = 0;
  var requestSerial = 0;
  var activeLanguage = window.AponarI18n.getLanguage();
  var runtimeEnabled = !/^(?:localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(window.location.hostname)
    || window.__APONAR_I18N_RUNTIME__ === true;

  function pageKey() {
    var path = window.location.pathname || "/";
    var explicit = document.documentElement.dataset.i18nPage || "";
    if (explicit) return explicit;
    var parts = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    if (parts.length && window.AponarI18n.languages[parts[0]]) parts.shift();
    if (parts.length && /^index\.html$/i.test(parts[parts.length - 1])) parts.pop();
    path = parts.join("/").replace(/\.html$/i, "");
    return path ? (path.replace(/[^a-zA-Z0-9._-]+/g, "__") || "index") : "index";
  }

  function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
  function languageMessages(language) { return STATUS_MESSAGES[language] || STATUS_MESSAGES.en; }
  function brandNames(value) { return String(value || "").match(/আপনার নিহোন|Aponar Nihon|あなたの日本(?!語)/gi) || []; }
  function isExactBrandName(value) { return /^(?:আপনার নিহোন|Aponar Nihon|あなたの日本)$/i.test(normalize(value)); }
  function preserveBrandNames(source, target) {
    var originals = brandNames(source), index = 0;
    if (!originals.length) return String(target || "");
    var translated = String(target || "");
    var preserved = translated.replace(/আপনার নিহোন|Aponar Nihon|あなたの日本(?!語)/gi, function () {
      var value = originals[Math.min(index, originals.length - 1)]; index += 1; return value;
    });
    return preserved === translated && isExactBrandName(source) ? originals[0] : preserved;
  }
  function isJapaneseOnly(value) {
    var text = normalize(value);
    return /[\u3040-\u30ff\u3400-\u9fff]/.test(text) && !/[A-Za-z\u0980-\u09ff]/.test(text);
  }
  function containsLetters(value) {
    try { return /\p{L}/u.test(value); } catch (_error) { return /[A-Za-z\u0980-\u09ff\u3040-\u30ff\u3400-\u9fff]/.test(value); }
  }

  function needsTranslation(value, language) {
    var text = normalize(value);
    if (!text || !containsLetters(text) || isJapaneseOnly(text)) return false;
    if (language === "en") {
      if (/[\u0980-\u09ff]/.test(text)) return true;
      var nonEnglish = text.replace(/[\u3040-\u30ff\u3400-\u9fff]/g, "").replace(/[A-Za-z\d\s\p{P}\p{S}]/gu, "");
      return containsLetters(nonEnglish);
    }
    if (language === "bn") {
      if (/[A-Za-z]/.test(text)) return true;
      var nonBangla = text.replace(/[\u0980-\u09ff\u3040-\u30ff\u3400-\u9fff]/g, "").replace(/[\d\s\p{P}\p{S}]/gu, "");
      return containsLetters(nonBangla);
    }
    if (language === "ja") return /[A-Za-z\u0980-\u09ff]/.test(text) || !isJapaneseOnly(text);
    return /[A-Za-z\u0980-\u09ff]/.test(text);
  }

  function isPreservedTextNode(node) {
    var parent = node && node.parentElement;
    if (!parent || parent.closest(PRESERVE_SELECTOR) || parent.closest(JAPANESE_SELECTOR)) return true;
    var head = parent.closest("head");
    return !!(head && parent.tagName !== "TITLE");
  }

  function shouldTranslateAttribute(element, attribute) {
    if (!element || element.closest(PRESERVE_SELECTOR)) return false;
    if (element.closest(JAPANESE_SELECTOR) && attribute !== "aria-label" && attribute !== "title") return false;
    if (attribute === "content") {
      if (element.tagName !== "META") return false;
      var name = (element.getAttribute("name") || element.getAttribute("property") || "").toLowerCase();
      return /^(?:description|og:title|og:description|twitter:title|twitter:description)$/.test(name);
    }
    if (attribute === "value") return element.tagName === "INPUT" && /^(?:button|submit|reset)$/i.test(element.getAttribute("type") || "text");
    return TRANSLATABLE_ATTRIBUTES.indexOf(attribute) !== -1;
  }

  function attributeMap(element) {
    var map = originalAttributes.get(element);
    if (!map) {
      map = new Map();
      originalAttributes.set(element, map);
      knownAttributeElements.add(element);
    }
    return map;
  }

  function captureText(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      if (!isPreservedTextNode(root) && normalize(root.nodeValue)) {
        if (!originalText.has(root)) originalText.set(root, root.nodeValue || "");
        knownTextNodes.add(root);
      }
      return;
    }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (isPreservedTextNode(node)) return NodeFilter.FILTER_REJECT;
        return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue || "");
      knownTextNodes.add(node);
    }
  }

  function captureAttributes(root) {
    var elements = [];
    if (root.nodeType === Node.ELEMENT_NODE) elements.push(root);
    if (root.querySelectorAll) elements.push.apply(elements, root.querySelectorAll("*"));
    elements.forEach(function (element) {
      OBSERVED_ATTRIBUTES.forEach(function (attribute) {
        if (!shouldTranslateAttribute(element, attribute) || !element.hasAttribute(attribute)) return;
        var map = attributeMap(element);
        if (!map.has(attribute)) map.set(attribute, element.getAttribute(attribute) || "");
      });
    });
  }
  function captureOriginals(root) { if (root) { captureText(root); captureAttributes(root); } }

  function disconnectObserver() {
    if (observer && observerConnected) { observer.disconnect(); observerConnected = false; }
  }
  function connectObserver() {
    if (!observer || observerConnected || !document.documentElement) return;
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: OBSERVED_ATTRIBUTES });
    observerConnected = true;
  }

  function restoreCaptured() {
    disconnectObserver();
    applying = true;
    try {
      knownTextNodes.forEach(function (node) { if (node.isConnected && originalText.has(node)) node.nodeValue = originalText.get(node); });
      knownAttributeElements.forEach(function (element) {
        if (!element.isConnected) return;
        var map = originalAttributes.get(element);
        if (map) map.forEach(function (value, attribute) { element.setAttribute(attribute, value); });
      });
    } finally { applying = false; connectObserver(); }
  }

  function descriptors(language) {
    captureOriginals(document.documentElement);
    var result = [];
    knownTextNodes.forEach(function (node) {
      if (!node.isConnected || isPreservedTextNode(node)) return;
      var raw = originalText.get(node) || "";
      if (needsTranslation(raw, language)) result.push({ kind: "text", node: node, source: normalize(raw), raw: raw });
    });
    knownAttributeElements.forEach(function (element) {
      if (!element.isConnected) return;
      var map = originalAttributes.get(element);
      if (!map) return;
      map.forEach(function (raw, attribute) {
        if (shouldTranslateAttribute(element, attribute) && needsTranslation(raw, language)) result.push({ kind: "attribute", node: element, attribute: attribute, source: normalize(raw), raw: raw });
      });
    });
    return result;
  }

  function uniqueSources(items) { return Array.from(new Set(items.map(function (item) { return item.source; }).filter(Boolean))); }
  function preserveWhitespace(raw, target) {
    return (raw.match(/^\s*/) || [""])[0] + String(target || "").trim() + (raw.match(/\s*$/) || [""])[0];
  }
  function applyTranslations(items) {
    disconnectObserver(); applying = true;
    try {
      items.forEach(function (item) {
        if (isExactBrandName(item.source)) return;
        var target = preserveBrandNames(item.source, translationTable.get(item.source));
        if (typeof target !== "string" || !target.trim()) return;
        if (item.kind === "text") item.node.nodeValue = preserveWhitespace(item.raw, target);
        else item.node.setAttribute(item.attribute, target.trim());
      });
      clearPending();
    } finally { applying = false; connectObserver(); }
  }

  function clearPending() {
    document.querySelectorAll("[data-aponar-i18n-pending]").forEach(function (element) {
      element.removeAttribute("data-aponar-i18n-pending");
    });
  }

  async function loadReviewedPack(language) {
    if (language === "bn") return new Map();
    var key = pageKey() + ":" + language;
    if (packCache.has(key)) return packCache.get(key);
    var result = new Map();
    try {
      var response = await fetch("/assets/i18n/pages/" + encodeURIComponent(pageKey()) + "." + encodeURIComponent(language) + ".json", { headers: { Accept: "application/json" }, cache: "force-cache" });
      if (response.ok) {
        var pack = await response.json();
        if (pack && pack.reviewed === true && pack.targetLanguage === language && Array.isArray(pack.entries)) {
          pack.entries.forEach(function (entry) {
            var source = entry && typeof entry.source === "string" ? normalize(entry.source) : "";
            var target = entry && typeof entry.target === "string" ? entry.target.trim() : "";
            if (source && target) result.set(source, target);
          });
        }
      }
    } catch (_error) { /* The runtime fills missing reviewed packs. */ }
    packCache.set(key, result);
    return result;
  }

  function fingerprint(values) {
    var hash = 2166136261;
    values.forEach(function (value) {
      for (var index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); }
      hash ^= 31; hash = Math.imul(hash, 16777619);
    });
    return (hash >>> 0).toString(36);
  }
  function snapshotRequest(language, sources) {
    var key = [CACHE_VERSION, pageKey(), language, fingerprint(sources.slice().sort())].join("-");
    return new Request(window.location.origin + "/__aponar_i18n_client__/" + encodeURIComponent(key));
  }
  function dictionaryRequest(language) {
    return new Request(window.location.origin + "/__aponar_i18n_dictionary__/" + encodeURIComponent(CACHE_VERSION + "-" + language));
  }
  async function readDictionary(language) {
    if (!("caches" in window)) return new Map();
    try {
      var cache = await caches.open(CACHE_NAME), response = await cache.match(dictionaryRequest(language));
      if (!response) return new Map();
      var payload = await response.json(), result = new Map();
      if (payload && payload.version === CACHE_VERSION && Array.isArray(payload.translations)) {
        payload.translations.forEach(function (entry) {
          if (entry && typeof entry.source === "string" && typeof entry.target === "string") result.set(entry.source, preserveBrandNames(entry.source, entry.target));
        });
      }
      return result;
    } catch (_error) { return new Map(); }
  }
  async function writeDictionary(language) {
    if (!("caches" in window) || !translationTable.size) return;
    try {
      var cache = await caches.open(CACHE_NAME), existing = await readDictionary(language);
      translationTable.forEach(function (target, source) { existing.set(source, preserveBrandNames(source, target)); });
      var entries = Array.from(existing, function (entry) { return { source: entry[0], target: entry[1] }; });
      await cache.put(dictionaryRequest(language), new Response(JSON.stringify({ version: CACHE_VERSION, translations: entries }), { headers: { "content-type": "application/json; charset=utf-8" } }));
    } catch (_error) { /* Shared cache is an optimization only. */ }
  }
  async function readSnapshot(language, sources) {
    if (!("caches" in window) || !sources.length) return new Map();
    try {
      var cache = await caches.open(CACHE_NAME);
      var response = await cache.match(snapshotRequest(language, sources));
      if (!response) return new Map();
      var payload = await response.json();
      var result = new Map();
      if (payload && payload.version === CACHE_VERSION && Array.isArray(payload.translations)) {
        payload.translations.forEach(function (entry) { if (entry && typeof entry.source === "string" && typeof entry.target === "string") result.set(entry.source, preserveBrandNames(entry.source, entry.target)); });
      }
      return result;
    } catch (_error) { return new Map(); }
  }
  async function writeSnapshot(language, sources) {
    if (!("caches" in window) || !sources.length) return;
    try {
      var entries = sources.filter(function (source) { return translationTable.has(source); }).map(function (source) { return { source: source, target: preserveBrandNames(source, translationTable.get(source)) }; });
      if (entries.length !== sources.length) return;
      var cache = await caches.open(CACHE_NAME);
      await cache.put(snapshotRequest(language, sources), new Response(JSON.stringify({ version: CACHE_VERSION, translations: entries }), { headers: { "content-type": "application/json; charset=utf-8" } }));
    } catch (_error) { /* Cache is an optimization only. */ }
  }

  function protectPrivateText(value) {
    var values = [];
    var text = value.replace(/আপনার নিহোন|Aponar Nihon|あなたの日本(?!語)|(?:https?:\/\/|www\.)[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\+?\d[\d\s().-]{7,}\d/gi, function (match) {
      var token = "⟦AN_PRIVATE_" + values.length + "⟧"; values.push(match); return token;
    });
    return { text: text, restore: function (translated) {
      var result = String(translated || "");
      values.forEach(function (original, index) { result = result.replaceAll("⟦AN_PRIVATE_" + index + "⟧", original); });
      return result;
    } };
  }
  function makeChunks(sources) {
    var chunks = [], current = [], size = 0;
    sources.forEach(function (source) {
      if (current.length && (current.length >= 12 || size + source.length > 18000)) { chunks.push(current); current = []; size = 0; }
      current.push(source); size += source.length;
    });
    if (current.length) chunks.push(current);
    return chunks;
  }
  async function translateChunk(language, sources) {
    var protectedItems = sources.map(function (source, index) {
      var safe = protectPrivateText(source); return { id: String(index), source: source, text: safe.text, restore: safe.restore };
    });
    var response = await fetch(API_PATH, {
      method: "POST", headers: { "content-type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ page: pageKey(), targetLanguage: language, items: protectedItems.map(function (item) { return { id: item.id, text: item.text }; }) })
    });
    var payload = null;
    try { payload = await response.json(); } catch (_error) { payload = null; }
    if (!response.ok || !payload || payload.ok !== true || !Array.isArray(payload.translations)) throw new Error(payload && payload.error ? payload.error : "translation_request_failed");
    var returned = new Map();
    payload.translations.forEach(function (entry) { if (entry && typeof entry.id === "string" && typeof entry.text === "string" && entry.text.trim()) returned.set(entry.id, entry.text); });
    if (returned.size !== protectedItems.length) throw new Error("translation_response_incomplete");
    protectedItems.forEach(function (item) { translationTable.set(item.source, preserveBrandNames(item.source, item.restore(returned.get(item.id)))); });
  }
  async function translateMissing(language, sources, onProgress) {
    var missing = sources.filter(function (source) { return !translationTable.has(source); });
    if (!missing.length || !runtimeEnabled) return;
    var chunks = makeChunks(missing), completed = 0, cursor = 0;
    async function worker() {
      while (cursor < chunks.length) {
        var index = cursor; cursor += 1;
        await translateChunk(language, chunks[index]); completed += 1;
        if (onProgress) onProgress(completed, chunks.length);
      }
    }
    await Promise.all(Array.from({ length: Math.min(6, chunks.length) }, worker));
    if (missing.some(function (source) { return !translationTable.has(source); })) throw new Error("translation_coverage_incomplete");
  }

  function statusLayer() {
    var layer = document.getElementById("aponarI18nStatus");
    if (layer) return layer;
    layer = document.createElement("section");
    layer.id = "aponarI18nStatus"; layer.className = "aponar-i18n-status"; layer.setAttribute("role", "status"); layer.setAttribute("aria-live", "polite"); layer.hidden = true;
    layer.innerHTML = '<div class="aponar-i18n-status-card"><span class="aponar-i18n-spinner" aria-hidden="true"></span><h2 data-i18n-status-title></h2><p data-i18n-status-detail></p><button type="button" data-i18n-retry hidden></button></div>';
    document.body.appendChild(layer);
    layer.querySelector("[data-i18n-retry]").addEventListener("click", function () { sync(true); });
    return layer;
  }
  function showStatus(language, isError, progress) {
    if (!runtimeEnabled) return;
    var copy = languageMessages(language), layer = statusLayer();
    layer.hidden = false; layer.classList.toggle("error", !!isError);
    layer.querySelector("[data-i18n-status-title]").textContent = isError ? copy.error : copy.loading;
    layer.querySelector("[data-i18n-status-detail]").textContent = progress || copy.detail;
    var retry = layer.querySelector("[data-i18n-retry]"); retry.hidden = !isError; retry.textContent = copy.retry;
    document.documentElement.classList.add("aponar-i18n-loading");
  }
  function hideStatus() {
    var layer = document.getElementById("aponarI18nStatus");
    if (layer) layer.hidden = true;
    document.documentElement.classList.remove("aponar-i18n-loading"); document.documentElement.dataset.i18nReady = "true";
  }

  async function sync(blocking) {
    var language = window.AponarI18n.getLanguage(), serial = ++requestSerial;
    activeLanguage = language;
    if (blocking !== false) restoreCaptured();
    else captureOriginals(document.documentElement);
    var items = descriptors(language), sources = uniqueSources(items);
    if (!languageTables.has(language)) languageTables.set(language, new Map());
    translationTable = languageTables.get(language);
    if (!sources.length) { clearPending(); hideStatus(); return; }
    if (blocking !== false) showStatus(language, false);
    try {
      var loaded = await Promise.all([loadReviewedPack(language), readSnapshot(language, sources), readDictionary(language)]);
      if (serial !== requestSerial || language !== activeLanguage) return;
      loaded[2].forEach(function (target, source) { translationTable.set(source, preserveBrandNames(source, target)); });
      loaded[1].forEach(function (target, source) { translationTable.set(source, preserveBrandNames(source, target)); });
      loaded[0].forEach(function (target, source) { translationTable.set(source, preserveBrandNames(source, target)); });
      sources.forEach(function (source) { if (isExactBrandName(source)) translationTable.set(source, source); });
      await translateMissing(language, sources, function (done, total) {
        if (blocking !== false && total > 1) showStatus(language, false, languageMessages(language).detail + " " + done + "/" + total);
      });
      if (serial !== requestSerial || language !== activeLanguage) return;
      if (runtimeEnabled && sources.some(function (source) { return !translationTable.has(source); })) throw new Error("translation_coverage_incomplete");
      applyTranslations(items);
      if (serial === requestSerial) hideStatus();
      Promise.all([writeSnapshot(language, sources), writeDictionary(language)]).catch(function () { /* Cache writes never block the UI. */ });
    } catch (error) {
      if (serial !== requestSerial) return;
      console.error("Aponar Nihon full-page translation failed:", error); showStatus(language, true);
    }
  }

  function markPending(node) {
    if (!runtimeEnabled || !node) return;
    var element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (element && !element.closest(PRESERVE_SELECTOR)) element.setAttribute("data-aponar-i18n-pending", "true");
  }
  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    function refreshWhenReady() {
      var layer = document.getElementById("aponarI18nStatus");
      var blocking = document.documentElement.classList.contains("aponar-i18n-loading")
        && layer && !layer.classList.contains("error");
      if (blocking) {
        refreshTimer = window.setTimeout(refreshWhenReady, 120);
        return;
      }
      sync(false);
    }
    refreshTimer = window.setTimeout(refreshWhenReady, 90);
  }
  function observeDynamicContent() {
    if (typeof MutationObserver === "undefined" || !document.documentElement) return;
    observer = new MutationObserver(function (mutations) {
      if (applying) return;
      var meaningful = false;
      mutations.forEach(function (mutation) {
        if (mutation.type === "characterData") {
          if (!isPreservedTextNode(mutation.target)) { originalText.set(mutation.target, mutation.target.nodeValue || ""); knownTextNodes.add(mutation.target); markPending(mutation.target); meaningful = true; }
        } else if (mutation.type === "attributes") {
          var attribute = mutation.attributeName || "";
          if (shouldTranslateAttribute(mutation.target, attribute)) { attributeMap(mutation.target).set(attribute, mutation.target.getAttribute(attribute) || ""); markPending(mutation.target); meaningful = true; }
        } else {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === Node.TEXT_NODE) {
              if (isPreservedTextNode(node)) return;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches(PRESERVE_SELECTOR) || node.closest(PRESERVE_SELECTOR)) return;
            } else return;
            captureOriginals(node); markPending(node); meaningful = true;
          });
        }
      });
      if (meaningful) scheduleRefresh();
    });
    connectObserver();
  }

  async function translateText(value) {
    var source = normalize(value), language = window.AponarI18n.getLanguage();
    if (!source || !needsTranslation(source, language)) return String(value || "");
    if (translationTable.has(source)) return translationTable.get(source);
    await translateMissing(language, [source]); return translationTable.get(source) || String(value || "");
  }
  async function localizedDialog(message, confirmMode) {
    var language = window.AponarI18n.getLanguage(), copy = languageMessages(language), translated = await translateText(String(message || ""));
    return new Promise(function (resolve) {
      var layer = document.createElement("div"); layer.className = "aponar-i18n-dialog";
      layer.innerHTML = '<button class="aponar-i18n-dialog-backdrop" type="button" data-dialog-cancel></button><section class="aponar-i18n-dialog-card" role="dialog" aria-modal="true" aria-labelledby="aponarI18nDialogMessage"><p id="aponarI18nDialogMessage"></p><div class="aponar-i18n-dialog-actions">' + (confirmMode ? '<button type="button" class="secondary" data-dialog-cancel></button>' : "") + '<button type="button" class="primary" data-dialog-ok></button></div></section>';
      layer.querySelector("p").textContent = translated; layer.querySelector("[data-dialog-ok]").textContent = copy.ok;
      layer.querySelectorAll("[data-dialog-cancel]").forEach(function (button) { if (button.classList.contains("secondary")) button.textContent = copy.cancel; });
      function finish(result) { layer.remove(); resolve(result); }
      layer.querySelector("[data-dialog-ok]").addEventListener("click", function () { finish(true); });
      layer.querySelectorAll("[data-dialog-cancel]").forEach(function (button) { button.addEventListener("click", function () { finish(false); }); });
      layer.addEventListener("keydown", function (event) { if (event.key === "Escape") finish(false); });
      document.body.appendChild(layer); layer.querySelector("[data-dialog-ok]").focus();
    });
  }

  captureOriginals(document.documentElement);
  window.AponarI18nContent = {
    pageKey: pageKey, reload: function () { return sync(true); }, restore: restoreCaptured, translateText: translateText,
    alert: function (message) { return localizedDialog(message, false); }, confirm: function (message) { return localizedDialog(message, true); },
    attributes: TRANSLATABLE_ATTRIBUTES.slice(), runtimeVersion: RUNTIME_VERSION
  };
  window.alert = function (message) { window.AponarI18nContent.alert(message); };
  document.addEventListener("DOMContentLoaded", function () { captureOriginals(document.documentElement); observeDynamicContent(); sync(true); });
  window.addEventListener("aponar:languagechange", function () { window.requestAnimationFrame(function () { sync(true); }); });
})();
