(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var coords = null, category = "mosque", map = null, markers = null, centerMarker = null, places = null;
  var requestToken = 0, requestAbort = null, heading = null, bearing = null, prayerToken = 0;
  var prayerNames = {Fajr: "ফজর", Sunrise: "সূর্যোদয়", Dhuhr: "যোহর", Asr: "আসর", Maghrib: "মাগরিব", Isha: "এশা"};
  function link(label, url) { var a = document.createElement("a"); a.textContent = label; a.href = url; a.target = "_blank"; a.rel = "noopener"; return a; }
  function distance(meters) { return meters < 1000 ? meters + " মিটার" : (meters / 1000).toFixed(1) + " কিমি"; }
  function qibla(lat, lng) {
    var rad = Math.PI / 180, p = lat * rad, delta = (39.826206 - lng) * rad;
    return (Math.atan2(Math.sin(delta), Math.cos(p) * Math.tan(21.422487 * rad) - Math.sin(p) * Math.cos(delta)) / rad + 360) % 360;
  }
  function rotate() { if (bearing !== null) $("needle").style.transform = "translate(-50%,-100%) rotate(" + (bearing - (heading || 0)) + "deg)"; }
  function minutes(t) { var m = String(t || "").match(/(\d{1,2}):(\d{2})/); return m ? Number(m[1]) * 60 + Number(m[2]) : 9999; }
  async function prayers() {
    if (!coords) return;
    var token = ++prayerToken;
    $("prayers").textContent = "নামাজের সময় আনা হচ্ছে…";
    var date = new Intl.DateTimeFormat("en-GB", {timeZone: "Asia/Tokyo", day: "2-digit", month: "2-digit", year: "numeric"}).format(new Date()).replaceAll("/", "-");
    try {
      var res = await fetch("https://api.aladhan.com/v1/timings/" + date + "?latitude=" + coords.lat + "&longitude=" + coords.lng + "&method=" + $("method").value + "&school=" + $("school").value + "&timezonestring=Asia%2FTokyo", {signal: AbortSignal.timeout(14000)});
      var data = await res.json(); if (!res.ok || data.code !== 200) throw new Error("prayer");
      if (token !== prayerToken) return;
      var timings = data.data.timings, now = minutes(new Intl.DateTimeFormat("en-GB", {timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hour12: false}).format(new Date()));
      var next = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].find(function (n) { return minutes(timings[n]) > now; });
      $("prayers").textContent = "";
      Object.keys(prayerNames).forEach(function (name) {
        var row = document.createElement("div"); row.className = "prayer" + (name === next ? " next" : "");
        var label = document.createElement("span"), time = document.createElement("b");
        label.textContent = prayerNames[name] + (name === next ? " • পরের" : ""); time.textContent = String(timings[name] || "--:--").slice(0, 5);
        row.append(label, time); $("prayers").appendChild(row);
      });
    } catch (_) { if (token === prayerToken) $("prayers").textContent = "নামাজের সময় পাওয়া যায়নি। স্থানীয় মসজিদের সময়সূচি দেখুন।"; }
  }
  function showPlaces() {
    $("places").textContent = "";
    if (markers) markers.clearLayers();
    if (!places) return;
    var selected = places.filter(function (p) { return p.kind === category; });
    $("placesStatus").textContent = selected.length ? selected.length + "টি জায়গা • কাছেরগুলো আগে • সরলরেখায় দূরত্ব" : "এই এলাকায় OpenStreetMap-এ তথ্য পাওয়া যায়নি। এটি জায়গা নেই—এমন নিশ্চয়তা নয়। এলাকা বা দূরত্ব বদলে দেখুন।";
    selected.forEach(function (p) {
      var row = document.createElement("article"); row.className = "place";
      var title = document.createElement("b"); title.textContent = p.name;
      var detail = document.createElement("small"); detail.textContent = distance(p.distance) + (p.address ? " · " + p.address : "");
      var evidence = document.createElement("small"); evidence.textContent = p.evidence;
      var actions = document.createElement("div"); actions.className = "place-actions";
      var pin = document.createElement("button"); pin.type = "button"; pin.textContent = "মানচিত্রে দেখুন";
      pin.onclick = function () { if (map) { map.setView([p.lat, p.lng], 16); $("map").scrollIntoView({behavior: "smooth", block: "center"}); } };
      actions.append(pin, link("পথ দেখুন", "https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=" + coords.lat + "%2C" + coords.lng + "%3B" + p.lat + "%2C" + p.lng), link("মূল তথ্য", p.sourceUrl));
      row.append(title, detail, evidence, actions); $("places").appendChild(row);
      if (markers) {
        var popup = document.createElement("div"); popup.appendChild(document.createTextNode(p.name + " · " + distance(p.distance)));
        L.circleMarker([p.lat, p.lng], {radius: 8, color: "#fff", weight: 2, fillColor: category === "mosque" ? "#0f766e" : "#bd6318", fillOpacity: 1}).bindPopup(popup).addTo(markers);
      }
    });
  }
  async function nearby() {
    if (!coords) return;
    var token = ++requestToken;
    if (requestAbort) requestAbort.abort();
    var abort = new AbortController(); requestAbort = abort;
    var timer = setTimeout(function () { abort.abort(); }, 50000);
    places = null; $("places").textContent = ""; if (markers) markers.clearLayers();
    $("placesStatus").textContent = "এই এলাকার মসজিদ ও খাবারের তথ্য খোঁজা হচ্ছে…";
    $("mapRetryBtn").hidden = true; $("fallback").textContent = "";
    $("fallback").appendChild(link("OpenStreetMap-এ এলাকা খুলুন", "https://www.openstreetmap.org/?mlat=" + coords.lat + "&mlon=" + coords.lng + "#map=14/" + coords.lat + "/" + coords.lng));
    try {
      var res = await fetch("/api/public/nearby?lat=" + coords.lat.toFixed(6) + "&lng=" + coords.lng.toFixed(6) + "&radius=" + $("mapRadius").value, {signal: abort.signal});
      if (!res.ok) throw new Error("map");
      var data = await res.json(); if (!data.ok || !Array.isArray(data.places)) throw new Error("map");
      if (token !== requestToken) return;
      places = data.places; showPlaces();
    } catch (_) {
      if (token !== requestToken) return;
      $("placesStatus").textContent = "জায়গার তথ্য এখন আনা যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন। মানচিত্রে এলাকা দেখা যাবে।";
      $("mapRetryBtn").hidden = false;
    } finally { clearTimeout(timer); }
  }
  function setLocation(lat, lng, label) {
    coords = {lat: lat, lng: lng}; $("locStatus").textContent = label;
    bearing = qibla(lat, lng); $("bearing").textContent = bearing.toFixed(1) + "°";
    $("qiblaText").textContent = "উত্তর দিক থেকে " + bearing.toFixed(1) + "° দিকে কিবলা। Compass না থাকলে উত্তর দিক ধরে দেখুন।"; rotate();
    if (map) {
      map.setView([lat, lng], 13);
      if (centerMarker) centerMarker.remove();
      centerMarker = L.circleMarker([lat, lng], {radius: 7, color: "#fff", fillColor: "#2563eb", fillOpacity: 1}).bindPopup(label).addTo(map);
    }
    prayers(); nearby();
  }
  function locate() {
    if (!navigator.geolocation) { $("locStatus").textContent = "Location ব্যবহার করা যাচ্ছে না। নিচে এলাকা বেছে খুঁজুন।"; return; }
    $("locStatus").textContent = "লোকেশন নেওয়া হচ্ছে…";
    navigator.geolocation.getCurrentPosition(function (p) {
      setLocation(p.coords.latitude, p.coords.longitude, "আপনার লোকেশন পাওয়া গেছে • আনুমানিক নির্ভুলতা " + Math.round(p.coords.accuracy) + " মিটার");
    }, function (e) {
      $("locStatus").textContent = e.code === 1 ? "Location-এর অনুমতি পাওয়া যায়নি। নিচে এলাকা বেছে খুঁজুন বা browser settings থেকে অনুমতি দিন।" : "লোকেশন পাওয়া যায়নি। নিচে এলাকা বেছে খুঁজুন।";
    }, {enableHighAccuracy: true, timeout: 15000, maximumAge: 120000});
  }
  async function compass() {
    if (typeof DeviceOrientationEvent === "undefined") { $("compassBtn").textContent = "Compass পাওয়া যাচ্ছে না"; return; }
    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function" && await DeviceOrientationEvent.requestPermission() !== "granted") throw new Error("permission");
      function update(e) {
        if (e.webkitCompassHeading != null) heading = e.webkitCompassHeading;
        else if (e.absolute && e.alpha != null) heading = (360 - e.alpha) % 360;
        else return;
        rotate(); $("compassBtn").textContent = "Compass চলছে";
      }
      window.addEventListener("deviceorientationabsolute", update, true); window.addEventListener("deviceorientation", update, true);
      $("compassBtn").textContent = "ফোন ঘুরিয়ে Compass দেখুন";
    } catch (_) { $("compassBtn").textContent = "Compass-এর অনুমতি পাওয়া যায়নি"; }
  }
  function init() {
    if (window.L) {
      map = L.map("map", {scrollWheelZoom: false}).setView([35.6812, 139.7671], 12);
      var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
      tiles.on("tileerror", function () { $("mapTileStatus").textContent = "মানচিত্রের পটভূমি লোড হয়নি। জায়গার তালিকা ব্যবহার করতে পারেন।"; });
      tiles.on("tileload", function () { $("mapTileStatus").textContent = ""; });
      markers = L.layerGroup().addTo(map);
      new ResizeObserver(function () { map.invalidateSize(); }).observe($("map"));
    } else $("mapTileStatus").textContent = "মানচিত্র লোড হয়নি। নিচে এলাকা বেছে জায়গার তালিকা দেখুন।";
    $("locBtn").onclick = locate; $("compassBtn").onclick = compass;
    $("school").onchange = prayers; $("method").onchange = prayers;
    $("areaSelect").onchange = function () { var c = this.value.split(",").map(Number); if (map) map.setView(c, 13); };
    $("areaSearchBtn").onclick = function () {
      var c = $("areaSelect").value.split(",").map(Number), point = map ? map.getCenter() : {lat: c[0], lng: c[1]};
      setLocation(point.lat, point.lng, "মানচিত্রে বেছে নেওয়া এলাকার তথ্য দেখানো হচ্ছে");
    };
    $("mapRadius").onchange = nearby; $("mapRetryBtn").onclick = nearby;
    document.querySelectorAll(".near-tabs .tab").forEach(function (button) { button.onclick = function () {
      document.querySelectorAll(".near-tabs .tab").forEach(function (b) { b.classList.toggle("active", b === button); b.setAttribute("aria-selected", b === button ? "true" : "false"); });
      category = button.dataset.type; showPlaces();
    }; });
    window.addEventListener("pagehide", function () { if (requestAbort) requestAbort.abort(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
