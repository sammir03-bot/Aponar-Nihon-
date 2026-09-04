(function () {
  "use strict";

  var STORAGE_KEY = "aponarNihonHalalScanHistoryV1";
  var MAX_HISTORY = 10;
  var detector = null;
  var mediaStream = null;
  var scanning = false;
  var scanBusy = false;
  var lastDetected = "";
  var lastDetectedAt = 0;

  var DANGER_RULES = [
    { label: "Pork / pig-derived", pattern: /豚肉|豚脂|豚エキス|豚由来|ポーク|ラード|pork|porcine|lard|bacon|ベーコン/i },
    { label: "Alcohol-related ingredient", pattern: /酒精|アルコール|みりん|味醂|料理酒|清酒|日本酒|洋酒|ワイン|ブランデー|ラム酒|alcohol|ethanol|wine|brandy|\brum\b/i }
  ];

  var DOUBT_RULES = [
    { label: "Gelatin — source check", pattern: /ゼラチン|gelatin/i },
    { label: "Shortening — source check", pattern: /ショートニング|shortening/i },
    { label: "Emulsifier / E471-E472 — source check", pattern: /乳化剤|emulsifier|\bE[- ]?471\b|\bE[- ]?472[a-z]?\b/i },
    { label: "Animal fat — source check", pattern: /動物油脂|animal\s+fat/i },
    { label: "Glycerin — source check", pattern: /グリセリン|グリセロール|glycerin|glycerol/i },
    { label: "Enzyme — source check", pattern: /酵素|enzyme/i },
    { label: "Rennet — source check", pattern: /レンネット|rennet/i },
    { label: "Flavoring — source may vary", pattern: /香料|flavou?r(?:ing)?/i },
    { label: "Ham — meat source check", pattern: /(^|[^a-z])ham([^a-z]|$)|ハム/i },
    { label: "Fermented seasoning — source check", pattern: /発酵調味料/i }
  ];

  function $(id) { return document.getElementById(id); }

  var el = {
    video: $("scannerVideo"),
    cameraEmpty: $("cameraEmpty"),
    cameraShell: $("cameraShell"),
    scanStatus: $("scanStatus"),
    start: $("startScanBtn"),
    image: $("imageScanBtn"),
    imageInput: $("barcodeImageInput"),
    form: $("barcodeForm"),
    barcode: $("barcodeInput"),
    ingredient: $("ingredientInput"),
    analyze: $("analyzeIngredientsBtn"),
    clearIngredient: $("clearIngredientsBtn"),
    result: $("resultCard"),
    productImage: $("productImage"),
    productName: $("productName"),
    productBrand: $("productBrand"),
    productCode: $("productCode"),
    verdict: $("verdictBox"),
    verdictIcon: $("verdictIcon"),
    verdictTitle: $("verdictTitle"),
    verdictText: $("verdictText"),
    flags: $("flagList"),
    ingredientsBox: $("ingredientsBox"),
    ingredients: $("productIngredients"),
    history: $("historyList"),
    clearHistory: $("clearHistoryBtn"),
    toast: $("scannerToast")
  };

  function toast(message) {
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () { el.toast.classList.remove("show"); }, 2600);
  }

  function setStatus(message) {
    if (el.scanStatus) el.scanStatus.textContent = message;
  }

  function normalizeBarcode(value) {
    return String(value || "").replace(/[^0-9]/g, "").slice(0, 18);
  }

  function createDetector() {
    if (!("BarcodeDetector" in window)) return null;
    try {
      return new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
    } catch (_error) {
      try { return new window.BarcodeDetector(); } catch (_secondError) { return null; }
    }
  }

  function stopCamera(message) {
    scanning = false;
    scanBusy = false;
    if (mediaStream) {
      mediaStream.getTracks().forEach(function (track) { track.stop(); });
      mediaStream = null;
    }
    if (el.video) {
      el.video.pause();
      el.video.srcObject = null;
      el.video.hidden = true;
    }
    if (el.cameraEmpty) el.cameraEmpty.hidden = false;
    if (el.start) el.start.innerHTML = '<i class="fa-solid fa-camera"></i> ক্যামেরা দিয়ে স্ক্যান';
    if (message) setStatus(message);
  }

  async function startCamera() {
    if (scanning) {
      stopCamera("স্ক্যান বন্ধ করা হয়েছে");
      return;
    }
    if (!detector) {
      toast("এই browser-এ automatic barcode detection নেই। Barcode number লিখে Check করুন।");
      setStatus("Auto scan unsupported — নিচে barcode number লিখুন");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast("এই browser camera access support করছে না।");
      return;
    }

    try {
      setStatus("ক্যামেরা permission দিন…");
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      el.video.srcObject = mediaStream;
      el.video.hidden = false;
      el.cameraEmpty.hidden = true;
      await el.video.play();
      scanning = true;
      el.start.innerHTML = '<i class="fa-solid fa-stop"></i> স্ক্যান বন্ধ করুন';
      setStatus("Barcode-টি frame-এর মাঝখানে স্থির রাখুন");
      window.requestAnimationFrame(scanLoop);
    } catch (error) {
      stopCamera("Camera চালু হয়নি");
      if (error && error.name === "NotAllowedError") toast("Camera permission পাওয়া যায়নি। চাইলে barcode number লিখুন।");
      else toast("Camera চালু করা যায়নি। Barcode number দিয়ে চেষ্টা করুন।");
    }
  }

  async function scanLoop() {
    if (!scanning || !detector || !el.video) return;
    if (!scanBusy && el.video.readyState >= 2) {
      scanBusy = true;
      try {
        var codes = await detector.detect(el.video);
        if (codes && codes.length) {
          var value = normalizeBarcode(codes[0].rawValue || "");
          var now = Date.now();
          if (value && (value !== lastDetected || now - lastDetectedAt > 2500)) {
            lastDetected = value;
            lastDetectedAt = now;
            el.barcode.value = value;
            stopCamera("Barcode পাওয়া গেছে — product check হচ্ছে…");
            if (navigator.vibrate) navigator.vibrate(60);
            await lookupBarcode(value);
            return;
          }
        }
      } catch (_error) {
        // A single failed frame should not interrupt an otherwise working camera session.
      } finally {
        scanBusy = false;
      }
    }
    if (scanning) window.setTimeout(function () { window.requestAnimationFrame(scanLoop); }, 140);
  }

  async function scanImage(file) {
    if (!file) return;
    if (!detector) {
      toast("এই browser-এ image barcode detection নেই। Barcode number লিখে দিন।");
      return;
    }
    try {
      setStatus("ছবির barcode পড়া হচ্ছে…");
      var bitmap = await createImageBitmap(file);
      var codes = await detector.detect(bitmap);
      if (bitmap.close) bitmap.close();
      if (!codes || !codes.length) {
        setStatus("ছবিতে barcode পাওয়া যায়নি");
        toast("Barcode পরিষ্কার ও সোজা রেখে আবার ছবি তুলুন।");
        return;
      }
      var value = normalizeBarcode(codes[0].rawValue || "");
      if (!value) throw new Error("empty barcode");
      el.barcode.value = value;
      setStatus("Barcode পাওয়া গেছে — product check হচ্ছে…");
      await lookupBarcode(value);
    } catch (_error) {
      setStatus("ছবি থেকে barcode পড়া যায়নি");
      toast("ছবিটি পরিষ্কার করে আবার চেষ্টা করুন, অথবা barcode number লিখুন।");
    } finally {
      el.imageInput.value = "";
    }
  }

  function matchRules(text, rules) {
    var hits = [];
    rules.forEach(function (rule) {
      var match = text.match(rule.pattern);
      if (match) hits.push({ label: rule.label, matched: match[0].trim() });
    });
    return hits;
  }

  function analyzeText(text) {
    var clean = String(text || "").replace(/\s+/g, " ").trim();
    if (!clean) return { status: "unknown", danger: [], doubt: [], text: "" };
    var danger = matchRules(clean, DANGER_RULES);
    var doubt = matchRules(clean, DOUBT_RULES);
    return {
      status: danger.length ? "danger" : doubt.length ? "doubt" : "clear",
      danger: danger,
      doubt: doubt,
      text: clean
    };
  }

  function verdictCopy(status) {
    if (status === "danger") return {
      icon: "fa-triangle-exclamation",
      title: "স্পষ্ট Haram concern পাওয়া গেছে",
      text: "Ingredient list-এ pork/pig-derived অথবা alcohol-related signal মিলেছে। নিচের matched item দেখুন এবং product এড়িয়ে চলা/বিশ্বস্ত certifier দিয়ে যাচাই করা নিরাপদ।"
    };
    if (status === "doubt") return {
      icon: "fa-circle-exclamation",
      title: "সন্দেহজনক — source যাচাই করুন",
      text: "এক বা একাধিক source-dependent ingredient পাওয়া গেছে। এগুলো সবসময় Haram নয়; animal/plant source বা certification যাচাই করা দরকার।"
    };
    if (status === "clear") return {
      icon: "fa-circle-check",
      title: "স্পষ্ট নিষিদ্ধ ingredient signal মেলেনি",
      text: "বর্তমান ingredient text-এ আমাদের rule list অনুযায়ী স্পষ্ট concern মেলেনি। এটি Halal certification বা ১০০% নিশ্চয়তা নয়।"
    };
    return {
      icon: "fa-circle-question",
      title: "তথ্য যথেষ্ট নয়",
      text: "Ingredient list পাওয়া যায়নি বা product database-এ নেই। প্যাকেটের 原材料名 লিখে check করুন।"
    };
  }

  function setProductImage(url, name) {
    if (!el.productImage) return;
    if (url && /^https:\/\//i.test(url)) {
      el.productImage.src = url;
      el.productImage.alt = name ? name + " product image" : "Product image";
      el.productImage.hidden = false;
    } else {
      el.productImage.removeAttribute("src");
      el.productImage.alt = "";
      el.productImage.hidden = true;
    }
  }

  function renderFlags(analysis) {
    el.flags.textContent = "";
    var items = [];
    analysis.danger.forEach(function (hit) { items.push({ type: "danger", hit: hit }); });
    analysis.doubt.forEach(function (hit) { items.push({ type: "doubt", hit: hit }); });
    if (!items.length) return;

    items.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "flag-item";
      var dot = document.createElement("span");
      dot.className = "flag-dot";
      if (item.type === "danger") dot.style.background = "#e54848";
      var copy = document.createElement("span");
      copy.textContent = item.hit.label + (item.hit.matched ? " · matched: " + item.hit.matched : "");
      row.appendChild(dot);
      row.appendChild(copy);
      el.flags.appendChild(row);
    });
  }

  function renderResult(product, analysis, save) {
    var info = product || {};
    var copy = verdictCopy(analysis.status);
    el.result.hidden = false;
    el.productName.textContent = info.name || "Ingredient check";
    el.productBrand.textContent = info.brand || "";
    el.productCode.textContent = info.code ? "BARCODE · " + info.code : "MANUAL INGREDIENT CHECK";
    setProductImage(info.image, info.name);
    el.verdict.dataset.status = analysis.status;
    el.verdictIcon.innerHTML = '<i class="fa-solid ' + copy.icon + '"></i>';
    el.verdictTitle.textContent = copy.title;
    el.verdictText.textContent = copy.text;
    renderFlags(analysis);

    if (analysis.text) {
      el.ingredientsBox.hidden = false;
      el.ingredients.textContent = analysis.text;
    } else {
      el.ingredientsBox.hidden = true;
      el.ingredients.textContent = "";
    }

    if (save !== false) saveHistory({
      code: info.code || "",
      name: info.name || "Ingredient check",
      status: analysis.status,
      at: Date.now()
    });
  }

  function setLookupLoading(code) {
    el.result.hidden = false;
    el.productName.textContent = "Product খোঁজা হচ্ছে…";
    el.productBrand.textContent = "Open Food Facts";
    el.productCode.textContent = "BARCODE · " + code;
    setProductImage("", "");
    el.verdict.dataset.status = "unknown";
    el.verdictIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    el.verdictTitle.textContent = "Database check হচ্ছে";
    el.verdictText.textContent = "Ingredient information পাওয়া গেলে সাথে সাথে screening হবে।";
    el.flags.textContent = "";
    el.ingredientsBox.hidden = true;
  }

  async function lookupBarcode(rawCode) {
    var code = normalizeBarcode(rawCode);
    if (code.length < 7 || code.length > 14) {
      toast("সঠিক 7–14 digit barcode দিন।");
      return;
    }
    setLookupLoading(code);
    try {
      var fields = ["code", "product_name", "product_name_ja", "product_name_en", "brands", "ingredients_text", "ingredients_text_ja", "ingredients_text_en", "image_front_small_url", "image_front_url"].join(",");
      var url = "https://world.openfoodfacts.org/api/v3.6/product/" + encodeURIComponent(code) + ".json?cc=jp&lc=ja&fields=" + encodeURIComponent(fields);
      var response = await fetch(url, { method: "GET", mode: "cors", credentials: "omit", headers: { Accept: "application/json" } });
      if (response.status === 404) {
        renderResult({ code: code, name: "Database-এ product পাওয়া যায়নি" }, analyzeText(""));
        toast("Product পাওয়া যায়নি — ingredient text দিয়ে check করুন।");
        return;
      }
      if (!response.ok) throw new Error("lookup failed");
      var data = await response.json();
      var p = data && data.product ? data.product : data;
      if (!p || (!p.product_name && !p.product_name_ja && !p.ingredients_text && !p.ingredients_text_ja)) {
        renderResult({ code: code, name: "Product data অসম্পূর্ণ" }, analyzeText(""));
        toast("Database-এ ingredient list নেই। প্যাকেট থেকে লিখে check করুন।");
        return;
      }
      var ingredients = p.ingredients_text_ja || p.ingredients_text || p.ingredients_text_en || "";
      var product = {
        code: p.code || code,
        name: p.product_name_ja || p.product_name || p.product_name_en || "নাম পাওয়া যায়নি",
        brand: p.brands || "",
        image: p.image_front_small_url || p.image_front_url || ""
      };
      renderResult(product, analyzeText(ingredients));
      if (!ingredients) toast("Product পাওয়া গেছে, কিন্তু ingredient list নেই।");
    } catch (_error) {
      renderResult({ code: code, name: "Online database check করা যায়নি" }, analyzeText(""));
      toast("Internet/API সমস্যা হয়েছে। Ingredient text দিয়ে local check এখনও কাজ করবে।");
    }
  }

  function loadHistory() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data.slice(0, MAX_HISTORY) : [];
    } catch (_error) { return []; }
  }

  function saveHistory(item) {
    var history = loadHistory();
    if (item.code) history = history.filter(function (entry) { return entry.code !== item.code; });
    history.unshift(item);
    history = history.slice(0, MAX_HISTORY);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (_error) { /* private mode may block storage */ }
    renderHistory();
  }

  function renderHistory() {
    if (!el.history) return;
    var history = loadHistory();
    el.history.textContent = "";
    if (!history.length) {
      var empty = document.createElement("div");
      empty.className = "history-empty";
      empty.textContent = "এখনও কোনো scan history নেই।";
      el.history.appendChild(empty);
      return;
    }
    history.forEach(function (entry) {
      var row = document.createElement("div");
      row.className = "history-item";
      var status = document.createElement("span");
      status.className = "history-status " + (entry.status || "unknown");
      var copy = document.createElement("div");
      copy.className = "history-copy";
      var name = document.createElement("b");
      name.textContent = entry.name || "Product";
      var meta = document.createElement("small");
      var date = new Date(entry.at || Date.now());
      meta.textContent = (entry.code ? entry.code + " · " : "") + date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      copy.appendChild(name);
      copy.appendChild(meta);
      row.appendChild(status);
      row.appendChild(copy);
      if (entry.code) {
        row.setAttribute("role", "button");
        row.tabIndex = 0;
        row.addEventListener("click", function () { el.barcode.value = entry.code; lookupBarcode(entry.code); });
        row.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); row.click(); } });
      }
      el.history.appendChild(row);
    });
  }

  function analyzeManualIngredients() {
    var text = el.ingredient.value.trim();
    if (!text) {
      toast("প্যাকেটের ingredient list লিখুন বা paste করুন।");
      el.ingredient.focus();
      return;
    }
    var analysis = analyzeText(text);
    renderResult({ name: "Manual ingredient check" }, analysis);
    el.result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function bindEvents() {
    el.start.addEventListener("click", startCamera);
    el.image.addEventListener("click", function () { el.imageInput.click(); });
    el.imageInput.addEventListener("change", function () { scanImage(el.imageInput.files && el.imageInput.files[0]); });
    el.form.addEventListener("submit", function (event) {
      event.preventDefault();
      var code = normalizeBarcode(el.barcode.value);
      el.barcode.value = code;
      lookupBarcode(code);
    });
    el.barcode.addEventListener("input", function () { el.barcode.value = normalizeBarcode(el.barcode.value); });
    el.analyze.addEventListener("click", analyzeManualIngredients);
    el.clearIngredient.addEventListener("click", function () { el.ingredient.value = ""; el.ingredient.focus(); });
    el.clearHistory.addEventListener("click", function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_error) { /* no-op */ }
      renderHistory();
      toast("Scan history মুছে দেওয়া হয়েছে।");
    });
    window.addEventListener("pagehide", function () { stopCamera(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden && scanning) stopCamera("Camera বন্ধ করা হয়েছে"); });
  }

  function init() {
    detector = createDetector();
    if (!detector) {
      setStatus("এই browser-এ auto scan সীমিত — manual barcode সবসময় কাজ করবে");
    }
    renderHistory();
    bindEvents();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();