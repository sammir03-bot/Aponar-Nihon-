(function () {
  "use strict";
  var KEY = "aponarNihonHalalScanHistoryV1", controls = null, stream = null, cameraActive = false, cameraToken = 0, lookupToken = 0, lookupAbort = null;
  var $ = function (id) { return document.getElementById(id); };
  var danger = [
    ["শূকর বা শূকর থেকে তৈরি উপাদান", /豚|ポーク|ラード|ベーコン|\b(?:pork|porcine|lard|bacon)\b/i],
    ["অ্যালকোহল বা মদজাত উপাদান", /酒精|アルコール|みりん|味醂|料理酒|清酒|日本酒|洋酒|ワイン|ブランデー|ラム酒|リキュール|ビール|ウォッカ|ウイスキー|\b(?:alcohol|ethanol|wine|brandy|rum|sake|mirin|liqueur|beer|vodka|whisk[ey]+)\b/i]
  ];
  var doubts = [
    ["জেলাটিন—কোন উৎস থেকে তৈরি, যাচাই করুন", /ゼラチン|\bgelatin(?:e)?\b/i],
    ["শর্টেনিং—উদ্ভিদ না প্রাণী থেকে তৈরি, যাচাই করুন", /ショートニング|\bshortening\b/i],
    ["ইমালসিফায়ার—উৎস যাচাই করুন", /乳化剤|\bemulsifier[s]?\b|\bE[- ]?47[12][a-z]?\b/i],
    ["প্রাণীর চর্বি—উৎস যাচাই করুন", /動物油脂|\banimal\s+fat\b/i],
    ["গ্লিসারিন—উৎস যাচাই করুন", /グリセリン|グリセロール|\bglycer(?:in|ine|ol)\b/i],
    ["এনজাইম বা রেনেট—উৎস যাচাই করুন", /酵素|レンネット|\b(?:enzyme[s]?|rennet)\b/i],
    ["ফ্লেভারিং—উৎস যাচাই করুন", /香料|\bflavou?r(?:ing)?[s]?\b/i],
    ["মাংস বা মাংসের নির্যাস—উৎস ও সনদ যাচাই করুন", /チキン|ビーフ|鶏肉|牛肉|肉エキス|ハム|\b(?:ham|chicken|beef|meat\s+extract)\b/i],
    ["ফারমেন্টেড সিজনিং—উপাদান যাচাই করুন", /発酵調味料/i]
  ];
  function toast(message) {
    $("scannerToast").textContent = message;
    $("scannerToast").classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(function () { $("scannerToast").classList.remove("show"); }, 4000);
  }
  function status(message) { $("scanStatus").textContent = message; }
  function normalize(value) { return String(value || "").normalize("NFKC").replace(/[\s-]/g, ""); }
  function valid(code) {
    if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
    var sum = 0, weight = 3;
    for (var i = code.length - 2; i >= 0; i--) { sum += Number(code[i]) * weight; weight = weight === 3 ? 1 : 3; }
    return (10 - sum % 10) % 10 === Number(code[code.length - 1]);
  }
  function analyze(raw) {
    var original = String(raw || "").normalize("NFKC").trim();
    // Exclude explicit absence claims only, without hiding later ingredient mentions.
    var scan = original.replace(/\b(?:pork|alcohol)[ -]free\b|\b(?:non[ -]alcoholic|no\s+pork)\b|ノンアルコール|(?:アルコール|豚肉|ポーク)(?:不使用|なし)/gi, "");
    function matches(rules) { return rules.map(function (rule) { var hit = scan.match(rule[1]); return hit ? {label: rule[0], matched: hit[0]} : null; }).filter(Boolean); }
    var bad = matches(danger), doubt = matches(doubts);
    return {status: !original ? "unknown" : bad.length ? "danger" : doubt.length ? "doubt" : "clear", danger: bad, doubt: doubt, text: original};
  }
  var copies = {
    danger: ["fa-triangle-exclamation", "নিষিদ্ধ উপাদানের বিষয়ে উদ্বেগ আছে", "লেখায় শূকর বা মদজাত উপাদানের উল্লেখ পাওয়া গেছে। নিচের উপাদান দেখুন এবং প্যাকেট ও প্রস্তুতকারকের তথ্য মিলিয়ে নিন।"],
    doubt: ["fa-circle-exclamation", "উপাদানের উৎস যাচাই প্রয়োজন", "কিছু উপাদানের প্রাণী/উদ্ভিদ উৎস বা মাংসের সনদ জানা দরকার। শুধু এই তালিকা দেখে হালাল বলে নিশ্চিত করা যায় না।"],
    clear: ["fa-circle-check", "স্পষ্ট নিষিদ্ধ উপাদানের উল্লেখ মেলেনি", "এই লেখা ও আমাদের সীমিত নিয়মে উদ্বেগের উল্লেখ পাওয়া যায়নি। এটি হালাল সনদ বা নিরাপত্তার নিশ্চয়তা নয়।"],
    unknown: ["fa-circle-question", "তথ্য যথেষ্ট নয়", "উপাদানের তালিকা পাওয়া যায়নি। প্যাকেটের 原材料名 অংশ লিখে বা ছবি থেকে পড়ে যাচাই করুন।"]
  };
  function history() { try { var rows = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(rows) ? rows.slice(0, 10) : []; } catch (_) { return []; } }
  function showHistory() {
    var list = $("historyList"); list.textContent = "";
    history().forEach(function (item) {
      var row = document.createElement("button"); row.type = "button"; row.className = "history-item";
      var name = document.createElement("span"); name.textContent = item.name || "উপাদান যাচাই";
      var code = document.createElement("small"); code.textContent = item.code || "নিজে লেখা উপাদান";
      row.append(name, code);
      if (item.code) row.onclick = function () { $("barcodeInput").value = item.code; lookup(item.code); };
      else row.disabled = true;
      list.appendChild(row);
    });
    if (!list.children.length) list.textContent = "এখনো কোনো খাবার যাচাই করা হয়নি।";
  }
  function render(product, analysis, save) {
    var copy = copies[analysis.status], info = product || {};
    $("resultCard").hidden = false;
    $("productName").textContent = info.name || "উপাদান যাচাই";
    $("productBrand").textContent = info.brand || "";
    $("productCode").textContent = info.code ? "BARCODE · " + info.code : "নিজে লেখা উপাদান";
    $("productImage").hidden = !info.image;
    if (info.image && /^https:\/\//.test(info.image)) { $("productImage").src = info.image; $("productImage").alt = info.name || "খাবারের ছবি"; }
    else $("productImage").removeAttribute("src");
    $("verdictBox").dataset.status = analysis.status;
    $("verdictIcon").innerHTML = '<i class="fa-solid ' + copy[0] + '"></i>';
    $("verdictTitle").textContent = copy[1]; $("verdictText").textContent = copy[2];
    $("flagList").textContent = "";
    analysis.danger.concat(analysis.doubt).forEach(function (hit) {
      var row = document.createElement("div"); row.className = "flag-item"; row.textContent = hit.matched + " — " + hit.label; $("flagList").appendChild(row);
    });
    $("ingredientsBox").hidden = !analysis.text; $("productIngredients").textContent = analysis.text;
    var source = $("productSource"); source.textContent = "";
    if (info.code) {
      var link = document.createElement("a"); link.href = "https://world.openfoodfacts.org/product/" + info.code; link.target = "_blank"; link.rel = "noopener"; link.textContent = "Open Food Facts-এ মূল তথ্য দেখুন"; source.appendChild(link);
      if (info.reportedHalalLabel) source.appendChild(document.createTextNode(" · তথ্যভাণ্ডারে halal label আছে; প্যাকেটের বর্তমান সনদ মিলিয়ে নিন।"));
    }
    if (save !== false) {
      var rows = history().filter(function (r) { return info.code ? r.code !== info.code : r.code; });
      rows.unshift({code: info.code || "", name: info.name || "উপাদান যাচাই", status: analysis.status, at: Date.now()});
      try { localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 10))); } catch (_) { /* Private mode still supports checks. */ }
      showHistory();
    }
  }
  async function lookup(raw) {
    var code = normalize(raw);
    if (!valid(code)) { toast("সঠিক ৮, ১২, ১৩ বা ১৪ সংখ্যার barcode দিন। শেষ সংখ্যাটিও মিলতে হবে।"); return; }
    var token = ++lookupToken;
    if (lookupAbort) lookupAbort.abort();
    var abort = new AbortController(); lookupAbort = abort;
    var timeout = setTimeout(function () { abort.abort(); }, 18000);
    render({code: code, name: "খাবারের তথ্য খোঁজা হচ্ছে…"}, analyze(""), false);
    $("verdictTitle").textContent = "তথ্যভাণ্ডার থেকে উপাদান আনা হচ্ছে…";
    $("barcodeLookupBtn").disabled = true;
    try {
      var res = await fetch("/api/public/food?barcode=" + encodeURIComponent(code), {signal: abort.signal, headers: {Accept: "application/json"}});
      if (!res.ok) { var error = new Error("lookup"); error.status = res.status; throw error; }
      var data = await res.json();
      if (token !== lookupToken) return;
      if (!data.ok) throw new Error("lookup");
      if (!data.found) { render({code: code, name: "তথ্যভাণ্ডারে এই খাবার পাওয়া যায়নি"}, analyze("")); return; }
      render(data.product, analyze(data.product.ingredients));
    } catch (error) {
      if (token !== lookupToken) return;
      render({code: code, name: error.status === 429 ? "কিছুক্ষণ পরে আবার চেষ্টা করুন" : "তথ্যভাণ্ডার এখন পাওয়া যাচ্ছে না"}, analyze(""), false);
      $("verdictText").textContent = "নেটওয়ার্ক বা তথ্যের সেবায় সমস্যা হয়েছে। প্যাকেটের উপাদান লিখে যাচাই এখনো করা যাবে।";
    } finally { clearTimeout(timeout); if (token === lookupToken) $("barcodeLookupBtn").disabled = false; }
  }
  function stopCamera(message) {
    cameraToken++; cameraActive = false;
    if (controls) { controls.stop(); controls = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    $("scannerVideo").srcObject = null; $("scannerVideo").hidden = true; $("cameraEmpty").hidden = false;
    $("startScanBtn").innerHTML = '<i class="fa-solid fa-camera"></i> ক্যামেরা দিয়ে স্ক্যান';
    if (message) status(message);
  }
  async function startCamera() {
    if (cameraActive) { stopCamera("স্ক্যান বন্ধ করা হয়েছে"); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast("ক্যামেরা ব্যবহার করা যাচ্ছে না। Barcode লিখে বা ছবি দিয়ে যাচাই করুন।"); return; }
    if (!window.ZXingBrowser) { toast("Scanner লোড হয়নি। পেজটি আবার খুলুন বা barcode লিখুন।"); return; }
    var token = ++cameraToken; cameraActive = true;
    $("startScanBtn").textContent = "স্ক্যান বন্ধ করুন"; status("ক্যামেরা ব্যবহারের অনুমতি দিন…");
    try {
      var nextStream = await navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: {ideal: "environment"}, width: {ideal: 1280}, height: {ideal: 720}}});
      if (token !== cameraToken) { nextStream.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = nextStream; $("scannerVideo").hidden = false; $("cameraEmpty").hidden = true;
      var reader = new ZXingBrowser.BrowserMultiFormatOneDReader(undefined, {delayBetweenScanAttempts: 150});
      var nextControls = await reader.decodeFromStream(stream, $("scannerVideo"), function (result, error, scanControls) {
        if (!result || token !== cameraToken) return;
        var code = normalize(result.getText()); if (!valid(code)) return;
        scanControls.stop(); stopCamera("Barcode পাওয়া গেছে। খাবারের তথ্য খোঁজা হচ্ছে…");
        $("barcodeInput").value = code; lookup(code);
      });
      if (token !== cameraToken) nextControls.stop();
      else { controls = nextControls; status("Barcode সোজা করে frame-এর মাঝখানে স্থির রাখুন"); }
    } catch (error) {
      if (token !== cameraToken) return;
      var message = error.name === "NotAllowedError" ? "ক্যামেরার অনুমতি পাওয়া যায়নি। Site settings থেকে Camera Allow করুন, অথবা ছবি বা barcode দিন।" : "ক্যামেরা চালু হয়নি। অন্য camera app বন্ধ করে আবার চেষ্টা করুন, অথবা ছবি দিন।";
      stopCamera(message); toast(message);
    }
  }
  async function scanImage(file) {
    if (!file) return;
    stopCamera(); var url = URL.createObjectURL(file);
    try {
      status("ছবির barcode পড়া হচ্ছে…");
      var reader = new ZXingBrowser.BrowserMultiFormatOneDReader();
      var result = await reader.decodeFromImageUrl(url), code = normalize(result.getText());
      if (!valid(code)) throw new Error("invalid barcode");
      $("barcodeInput").value = code; status("ছবিতে barcode পাওয়া গেছে"); await lookup(code);
    } catch (_) { status("ছবিতে পরিষ্কার barcode পাওয়া যায়নি"); toast("Barcode-এর পুরো অংশ পরিষ্কার করে আবার ছবি দিন বা সংখ্যাটি লিখুন।"); }
    finally { URL.revokeObjectURL(url); $("barcodeImageInput").value = ""; }
  }
  function init() {
    $("startScanBtn").onclick = startCamera;
    $("imageScanBtn").onclick = function () { $("barcodeImageInput").click(); };
    $("barcodeImageInput").onchange = function () { scanImage(this.files[0]); };
    $("barcodeForm").onsubmit = function (e) { e.preventDefault(); lookup($("barcodeInput").value); };
    $("analyzeIngredientsBtn").onclick = function () {
      ++lookupToken; if (lookupAbort) lookupAbort.abort(); $("barcodeLookupBtn").disabled = false;
      var analysis = analyze($("ingredientInput").value);
      if (!analysis.text) { toast("প্যাকেটের উপাদানের তালিকা আগে লিখুন।"); return; }
      render({}, analysis);
    };
    $("clearIngredientsBtn").onclick = function () { $("ingredientInput").value = ""; $("ingredientInput").focus(); };
    $("clearHistoryBtn").onclick = function () { try { localStorage.removeItem(KEY); } catch (_) {} showHistory(); };
    window.addEventListener("pagehide", function () { stopCamera(); if (lookupAbort) lookupAbort.abort(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stopCamera("ক্যামেরা বন্ধ করা হয়েছে"); });
    showHistory(); status("ক্যামেরা, barcode-এর ছবি বা সংখ্যাটি দিয়ে শুরু করুন");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
