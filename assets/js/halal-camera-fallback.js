(function () {
  "use strict";

  // Native BarcodeDetector is used by halal-scanner.js when available.
  // This file only takes over on browsers that do not expose that API.
  if ("BarcodeDetector" in window) return;

  var active = false;
  var stream = null;
  var controls = null;
  var reader = null;
  var zxingPromise = null;
  var finishing = false;

  function $(id) { return document.getElementById(id); }

  function setStatus(message) {
    var node = $("scanStatus");
    if (node) node.textContent = message;
  }

  function toast(message) {
    var node = $("scannerToast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () { node.classList.remove("show"); }, 3200);
  }

  function normalizeBarcode(value) {
    return String(value || "").replace(/[^0-9]/g, "").slice(0, 18);
  }

  function resetUi(message) {
    var video = $("scannerVideo");
    var empty = $("cameraEmpty");
    var start = $("startScanBtn");
    if (video) {
      try { video.pause(); } catch (_error) {}
      video.srcObject = null;
      video.hidden = true;
    }
    if (empty) empty.hidden = false;
    if (start) start.innerHTML = '<i class="fa-solid fa-camera"></i> ক্যামেরা দিয়ে স্ক্যান';
    if (message) setStatus(message);
  }

  function stopFallback(message) {
    active = false;
    finishing = false;
    if (controls && typeof controls.stop === "function") {
      try { controls.stop(); } catch (_error) {}
    }
    controls = null;
    if (stream) {
      try { stream.getTracks().forEach(function (track) { track.stop(); }); } catch (_error) {}
    }
    stream = null;
    resetUi(message || "স্ক্যান বন্ধ করা হয়েছে");
  }

  function cameraErrorMessage(error) {
    var name = error && error.name ? error.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return "Camera permission পাওয়া যায়নি। Address bar-এর site settings থেকে Camera → Allow করুন।";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return "এই ডিভাইসে ব্যবহারযোগ্য camera পাওয়া যায়নি।";
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
      return "Camera অন্য app ব্যবহার করছে। অন্য camera app বন্ধ করে আবার চেষ্টা করুন।";
    }
    if (name === "OverconstrainedError") {
      return "Camera setting মিলছে না। আবার চেষ্টা করুন।";
    }
    return "Camera চালু করা যায়নি। আবার চেষ্টা করুন অথবা barcode number লিখুন।";
  }

  function loadZXing() {
    if (!zxingPromise) {
      zxingPromise = import("https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/+esm");
    }
    return zxingPromise;
  }

  async function beginFallbackScan(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    if (active) {
      stopFallback("স্ক্যান বন্ধ করা হয়েছে");
      return;
    }

    if (!window.isSecureContext) {
      setStatus("Camera scan-এর জন্য HTTPS দরকার");
      toast("Secure HTTPS connection ছাড়া camera permission পাওয়া যাবে না।");
      return;
    }

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      setStatus("এই browser camera access support করছে না");
      toast("Browser camera access support করছে না।");
      return;
    }

    var video = $("scannerVideo");
    var empty = $("cameraEmpty");
    var start = $("startScanBtn");
    if (!video) return;

    try {
      setStatus("Camera permission দিন…");

      // Ask for camera permission immediately from the user's click. This is
      // intentionally done before loading the fallback decoder.
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      video.srcObject = stream;
      video.hidden = false;
      if (empty) empty.hidden = true;
      await video.play();
      active = true;
      if (start) start.innerHTML = '<i class="fa-solid fa-stop"></i> স্ক্যান বন্ধ করুন';
      setStatus("Camera চালু হয়েছে — barcode frame-এর মাঝখানে ধরুন");

      var ZXingBrowser = await loadZXing();
      reader = new ZXingBrowser.BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: 110,
        delayBetweenScanSuccess: 500
      });

      controls = await reader.decodeFromStream(stream, video, function (result) {
        if (!result || finishing) return;
        var raw = "";
        try {
          raw = typeof result.getText === "function" ? result.getText() : (result.text || "");
        } catch (_error) {}
        var value = normalizeBarcode(raw);
        if (!value) return;

        finishing = true;
        var input = $("barcodeInput");
        if (input) input.value = value;
        setStatus("Barcode পাওয়া গেছে — product check হচ্ছে…");
        if (navigator.vibrate) navigator.vibrate(60);

        // Stop camera before starting the product lookup.
        if (controls && typeof controls.stop === "function") {
          try { controls.stop(); } catch (_error) {}
        }
        controls = null;
        if (stream) {
          try { stream.getTracks().forEach(function (track) { track.stop(); }); } catch (_error) {}
        }
        stream = null;
        active = false;
        resetUi("Barcode পাওয়া গেছে — product check হচ্ছে…");

        var form = $("barcodeForm");
        if (form) {
          if (typeof form.requestSubmit === "function") form.requestSubmit();
          else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }
        finishing = false;
      });
    } catch (error) {
      var message = cameraErrorMessage(error);
      stopFallback(message);
      toast(message);
    }
  }

  async function decodeImageFallback(file) {
    if (!file) return;
    try {
      setStatus("ছবির barcode পড়া হচ্ছে…");
      var ZXingBrowser = await loadZXing();
      var imageReader = new ZXingBrowser.BrowserMultiFormatReader();
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.src = url;
      await new Promise(function (resolve, reject) {
        img.onload = resolve;
        img.onerror = reject;
      });
      var result = await imageReader.decodeFromImageElement(img);
      URL.revokeObjectURL(url);
      var raw = typeof result.getText === "function" ? result.getText() : (result.text || "");
      var value = normalizeBarcode(raw);
      if (!value) throw new Error("empty barcode");
      var input = $("barcodeInput");
      if (input) input.value = value;
      setStatus("Barcode পাওয়া গেছে — product check হচ্ছে…");
      var form = $("barcodeForm");
      if (form) {
        if (typeof form.requestSubmit === "function") form.requestSubmit();
        else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }
    } catch (_error) {
      setStatus("ছবি থেকে barcode পড়া যায়নি");
      toast("Barcode পরিষ্কার ও সোজা রেখে আবার ছবি তুলুন।");
    } finally {
      var inputFile = $("barcodeImageInput");
      if (inputFile) inputFile.value = "";
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target && event.target.closest ? event.target.closest("#startScanBtn") : null;
    if (!button) return;
    beginFallbackScan(event);
  }, true);

  document.addEventListener("change", function (event) {
    if (!event.target || event.target.id !== "barcodeImageInput") return;
    event.stopImmediatePropagation();
    var file = event.target.files && event.target.files[0];
    decodeImageFallback(file);
  }, true);

  window.addEventListener("pagehide", function () { stopFallback(); });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setStatus("Camera scan প্রস্তুত — button চাপলে permission চাইবে");
    }, { once: true });
  } else {
    setStatus("Camera scan প্রস্তুত — button চাপলে permission চাইবে");
  }
})();
