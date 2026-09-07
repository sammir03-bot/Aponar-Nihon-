(function () {
  "use strict";

  var OFF_V3_RE = /^https:\/\/world\.openfoodfacts\.org\/api\/v3\.6\/product\/(\d+)\.json/i;
  var nativeFetch = window.fetch.bind(window);
  var tesseractPromise = null;
  var ocrBusy = false;

  function $(id) { return document.getElementById(id); }

  function toast(message) {
    var node = $("scannerToast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () { node.classList.remove("show"); }, 3600);
  }

  function stripMarkup(value) {
    var div = document.createElement("div");
    div.innerHTML = String(value || "");
    return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
  }

  function firstUsefulIngredientText(product) {
    var p = product || {};
    var candidates = [
      p.ingredients_text_ja,
      p.ingredients_text,
      p.ingredients_text_en,
      p.ingredients_text_with_allergens_ja,
      p.ingredients_text_with_allergens,
      p.ingredients_text_with_allergens_en,
      p.ingredients_original
    ];

    Object.keys(p).forEach(function (key) {
      if (/^ingredients_text_(?!with_allergens)/i.test(key)) candidates.push(p[key]);
    });

    for (var i = 0; i < candidates.length; i += 1) {
      var value = stripMarkup(candidates[i]);
      if (value.length >= 3) return value;
    }

    if (Array.isArray(p.ingredients)) {
      var list = p.ingredients.map(function (item) {
        if (!item) return "";
        return stripMarkup(item.text || item.original_text || item.id || "");
      }).filter(Boolean);
      if (list.length) return list.join("、");
    }

    return "";
  }

  function mergeProduct(primary, fallback) {
    var merged = Object.assign({}, fallback || {}, primary || {});
    var text = firstUsefulIngredientText(primary) || firstUsefulIngredientText(fallback);
    if (text) merged.ingredients_text = text;
    return merged;
  }

  async function fetchOpenFoodFactsFallback(code) {
    var endpoints = [
      "https://world.openfoodfacts.org/api/v2/product/" + encodeURIComponent(code) + ".json",
      "https://world.openfoodfacts.org/api/v0/product/" + encodeURIComponent(code) + ".json"
    ];

    for (var i = 0; i < endpoints.length; i += 1) {
      try {
        var response = await nativeFetch(endpoints[i], {
          method: "GET",
          mode: "cors",
          credentials: "omit",
          headers: { Accept: "application/json" }
        });
        if (!response.ok) continue;
        var data = await response.json();
        var product = data && data.product ? data.product : null;
        if (product && (firstUsefulIngredientText(product) || product.product_name || product.product_name_ja || product.product_name_en)) {
          return product;
        }
      } catch (_error) {
        // Try the next compatible Open Food Facts endpoint.
      }
    }
    return null;
  }

  // The main scanner performs a compact Open Food Facts lookup. If that compact
  // response has no ingredient list, transparently do a second-pass lookup with
  // the full product payload and feed the richer response back to the scanner.
  window.fetch = async function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url ? input.url : "");
    var match = url.match(OFF_V3_RE);
    var response = await nativeFetch(input, init);
    if (!match || !response.ok) return response;

    try {
      var snapshot = await response.clone().json();
      var primary = snapshot && snapshot.product ? snapshot.product : snapshot;
      if (firstUsefulIngredientText(primary)) return response;

      var fallback = await fetchOpenFoodFactsFallback(match[1]);
      if (!fallback) return response;

      var mergedProduct = mergeProduct(primary, fallback);
      if (snapshot && snapshot.product) snapshot.product = mergedProduct;
      else snapshot = mergedProduct;

      return new Response(JSON.stringify(snapshot), {
        status: response.status,
        statusText: response.statusText,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    } catch (_error) {
      return response;
    }
  };

  function loadTesseract() {
    if (window.Tesseract && typeof window.Tesseract.createWorker === "function") {
      return Promise.resolve(window.Tesseract);
    }
    if (tesseractPromise) return tesseractPromise;

    tesseractPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = function () {
        if (window.Tesseract && typeof window.Tesseract.createWorker === "function") resolve(window.Tesseract);
        else reject(new Error("OCR library unavailable"));
      };
      script.onerror = function () { reject(new Error("OCR library load failed")); };
      document.head.appendChild(script);
    });

    return tesseractPromise;
  }

  function cleanOcrText(raw) {
    var text = String(raw || "")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) return "";

    var startMatch = text.match(/原材料名?|原料名?|Ingredients?/i);
    if (startMatch && typeof startMatch.index === "number") {
      text = text.slice(startMatch.index + startMatch[0].length).replace(/^[\s:：・-]+/, "");
    }

    var endMarkers = ["栄養成分", "内容量", "賞味期限", "消費期限", "保存方法", "販売者", "製造者", "加工者", "お問い合わせ", "Nutrition Facts"];
    var endAt = -1;
    endMarkers.forEach(function (marker) {
      var index = text.indexOf(marker);
      if (index > 8 && (endAt === -1 || index < endAt)) endAt = index;
    });
    if (endAt > 0) text = text.slice(0, endAt);

    return text
      .replace(/\n+/g, "、")
      .replace(/、{2,}/g, "、")
      .replace(/\s*、\s*/g, "、")
      .replace(/^[、\s]+|[、\s]+$/g, "")
      .trim();
  }

  function setOcrButtonState(button, busy, label) {
    if (!button) return;
    button.disabled = !!busy;
    button.innerHTML = busy
      ? '<i class="fa-solid fa-spinner fa-spin"></i> ' + (label || "ছবি পড়া হচ্ছে…")
      : '<i class="fa-solid fa-camera-retro"></i> Ingredient label-এর ছবি';
  }

  async function readIngredientPhoto(file, sourceButton) {
    if (!file || ocrBusy) return;
    var textarea = $("ingredientInput");
    if (!textarea) return;

    ocrBusy = true;
    setOcrButtonState(sourceButton, true, "OCR প্রস্তুত হচ্ছে…");

    var worker = null;
    try {
      var Tesseract = await loadTesseract();
      worker = await Tesseract.createWorker("jpn+eng", 1, {
        logger: function (message) {
          if (!sourceButton || !message) return;
          if (message.status === "recognizing text" && typeof message.progress === "number") {
            setOcrButtonState(sourceButton, true, "পড়া হচ্ছে " + Math.round(message.progress * 100) + "%");
          }
        }
      });

      var result = await worker.recognize(file);
      var raw = result && result.data ? result.data.text : "";
      var cleaned = cleanOcrText(raw);
      if (cleaned.length < 6) throw new Error("not enough OCR text");

      textarea.value = cleaned;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.scrollIntoView({ behavior: "smooth", block: "center" });
      textarea.focus({ preventScroll: true });
      toast("Ingredient text ছবি থেকে পড়া হয়েছে। OCR ভুল হতে পারে—text দেখে তারপর Ingredient check চাপুন।");
    } catch (_error) {
      toast("ছবি থেকে ingredient text পরিষ্কারভাবে পড়া যায়নি। আলো ভালো রেখে 原材料名 অংশটা কাছ থেকে তুলুন।");
    } finally {
      if (worker && typeof worker.terminate === "function") {
        try { await worker.terminate(); } catch (_error) {}
      }
      ocrBusy = false;
      setOcrButtonState(sourceButton, false);
    }
  }

  function ensurePhotoInput() {
    var input = $("ingredientPhotoInput");
    if (input) return input;
    input = document.createElement("input");
    input.id = "ingredientPhotoInput";
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.hidden = true;
    document.body.appendChild(input);
    return input;
  }

  function openIngredientCamera(button) {
    var input = ensurePhotoInput();
    input.dataset.triggerId = button && button.id ? button.id : "";
    input.value = "";
    input.click();
  }

  function makePhotoButton(id) {
    var button = document.createElement("button");
    button.type = "button";
    button.id = id;
    button.className = "halal-btn secondary";
    button.innerHTML = '<i class="fa-solid fa-camera-retro"></i> Ingredient label-এর ছবি';
    button.addEventListener("click", function () { openIngredientCamera(button); });
    return button;
  }

  function ensureIngredientPhotoAction() {
    var actions = document.querySelector(".ingredient-card .ingredient-actions");
    if (!actions || $("ingredientPhotoBtn")) return;
    var button = makePhotoButton("ingredientPhotoBtn");
    actions.appendChild(button);

    var note = document.createElement("p");
    note.id = "ingredientOcrNote";
    note.style.margin = "10px 0 0";
    note.style.fontSize = ".74rem";
    note.style.lineHeight = "1.55";
    note.style.color = "#718596";
    note.textContent = "原材料名-এর ছবি দিলে text এই browser-এই OCR হবে। Result দেওয়ার আগে OCR text একবার দেখে নিন।";
    actions.insertAdjacentElement("afterend", note);
  }

  function ensureMissingIngredientAction() {
    var result = $("resultCard");
    var verdict = $("verdictBox");
    if (!result || !verdict) return;

    var box = $("ingredientFallbackBox");
    var isUnknown = !result.hidden && verdict.dataset.status === "unknown";
    if (!isUnknown) {
      if (box) box.hidden = true;
      return;
    }

    if (!box) {
      box = document.createElement("div");
      box.id = "ingredientFallbackBox";
      box.style.marginTop = "12px";
      box.style.padding = "13px";
      box.style.border = "1px solid #cfe7dd";
      box.style.borderRadius = "15px";
      box.style.background = "#f3fbf7";

      var text = document.createElement("p");
      text.style.margin = "0 0 10px";
      text.style.fontSize = ".78rem";
      text.style.lineHeight = "1.6";
      text.style.color = "#45665a";
      text.textContent = "Database-এ ingredient list না থাকলে প্যাকেটের 原材料名 অংশের ছবি তুলুন। Text বের হলে দেখে Ingredient check দিন।";

      var button = makePhotoButton("ingredientFallbackPhotoBtn");
      button.style.width = "100%";
      box.appendChild(text);
      box.appendChild(button);
      result.appendChild(box);
    }
    box.hidden = false;
  }

  function bindPhotoInput() {
    var input = ensurePhotoInput();
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var sourceButton = input.dataset.triggerId ? $(input.dataset.triggerId) : $("ingredientPhotoBtn");
      readIngredientPhoto(file, sourceButton);
      input.value = "";
    });
  }

  function init() {
    ensureIngredientPhotoAction();
    bindPhotoInput();
    ensureMissingIngredientAction();

    var result = $("resultCard");
    if (result && "MutationObserver" in window) {
      new MutationObserver(function () {
        window.requestAnimationFrame(ensureMissingIngredientAction);
      }).observe(result, { attributes: true, childList: true, subtree: true, characterData: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
