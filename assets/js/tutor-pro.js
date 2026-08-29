(function () {
  "use strict";

  var API_ENDPOINT = "/api/tutor";
  var STATE_KEY = "nihon_tutor_state_v2";
  var LEGACY_CHAT_KEY = "nihon_tutor_chat_v1";
  var CLIENT_ID_KEY = "nihon_tutor_client_v1";
  var USAGE_KEY = "nihon_tutor_usage_v1";
  var DAILY_LIMIT = 20;
  var VALID_LEVELS = ["N5", "N4", "N3"];
  var VALID_DEPTHS = ["quick", "standard", "deep"];

  var MODES = {
    learn: {
      label: "বুঝিয়ে শেখান",
      icon: "fa-book-open",
      title: "আজ কী শিখতে চান?",
      text: "জাপানি ব্যাকরণ, শব্দ, কানজি বা যেকোনো বাক্য বাংলায় সহজ করে বুঝিয়ে নিন।",
      placeholder: "জাপানি শেখার প্রশ্ন লিখুন…",
      starters: [
        ["fa-scale-balanced", "Grammar পার্থক্য", "は আর が কখন ব্যবহার করব?", "は এবং が-এর পার্থক্য উদাহরণসহ বুঝিয়ে দিন"],
        ["fa-puzzle-piece", "বাক্য ভেঙে শিখুন", "Particle ও conjugation বুঝুন", "日本へ行きたいです বাক্যটির grammar breakdown করুন"],
        ["fa-font", "আজকের ৫টি শব্দ", "অর্থ, reading ও উদাহরণ", "আজ আমাকে ৫টি দরকারি vocabulary শেখান"],
        ["fa-store", "বাস্তব জাপানি", "Convenience store-এর ভাষা", "জাপানের convenience store-এ কাজে লাগে এমন কথোপকথন শেখান"]
      ],
      chips: [
        ["সহজ করে বলুন", "আরও সহজ করে বুঝিয়ে দিন"],
        ["আরও example", "আরও ৩টি natural example দিন"],
        ["ছোট quiz দিন", "এই বিষয়ের উপর আমাকে একটি ছোট quiz দিন"]
      ]
    },
    correct: {
      label: "বাক্য ঠিক করুন",
      icon: "fa-pen-to-square",
      title: "আপনার জাপানি বাক্য দিন",
      text: "ভুল থাকলে ঠিক করে দেব, কেন ভুল হয়েছে বলব এবং আরও natural Japanese দেখাব।",
      placeholder: "যে জাপানি বাক্যটি ঠিক করতে চান…",
      starters: [
        ["fa-pen", "বাক্য সংশোধন", "昨日学校を行きました", "এই বাক্যটি ঠিক করুন: 昨日学校を行きました"],
        ["fa-message", "Natural Japanese", "আরও স্বাভাবিকভাবে বলুন", "আরও natural Japanese করে দিন: 私は日本語を勉強することが好きです"],
        ["fa-briefcase", "কাজের ভাষা", "ভদ্র Japanese যাচাই", "এই workplace Japanese ঠিক ও ভদ্র করুন: 明日休みたいです"],
        ["fa-envelope", "মেসেজ ঠিক করুন", "Teacher-কে পাঠানোর আগে", "先生に送るメッセージとして直してください：今日、学校に行けません"]
      ],
      chips: [
        ["কেন ভুল?", "ভুলগুলোর কারণ আরও সহজ করে বলুন"],
        ["আরও natural", "একই কথা আরও naturalভাবে বলার ২টি উপায় দিন"],
        ["ভদ্র রূপ", "এটির polite এবং formal version দিন"]
      ]
    },
    conversation: {
      label: "কথোপকথন",
      icon: "fa-comments",
      title: "Japanese-এ কথা বলা শুরু করুন",
      text: "একবারে একটি প্রশ্ন—আপনি উত্তর দেবেন, টিউটর ছোট করে ভুল ঠিক করে পরের কথা বলবে।",
      placeholder: "Japanese-এ উত্তর লিখুন…",
      starters: [
        ["fa-store", "Convenience store", "দোকানে কেনাকাটার role-play", "Convenience store-এর conversation role-play শুরু করুন। আপনি staff হবেন।"],
        ["fa-user-tie", "Job interview", "নিজের পরিচয় ও কাজ", "Japanese job interview role-play শুরু করুন। প্রথম প্রশ্নটি করুন।"],
        ["fa-train-subway", "Train station", "পথ ও টিকিট জিজ্ঞাসা", "Train station-এ পথ জিজ্ঞাসার conversation শুরু করুন।"],
        ["fa-utensils", "Restaurant", "অর্ডার দেওয়ার অনুশীলন", "Japanese restaurant-এ খাবার order করার role-play শুরু করুন।"]
      ],
      chips: [
        ["বাংলা hint", "এই প্রশ্নের জন্য শুধু একটি ছোট বাংলা hint দিন"],
        ["আবার বলুন", "আরও সহজ Japanese-এ প্রশ্নটি আবার করুন"],
        ["আমার ভুল", "আমার শেষ উত্তরের ভুলগুলো সংক্ষেপে ঠিক করুন"]
      ]
    },
    quiz: {
      label: "কুইজ প্র্যাকটিস",
      icon: "fa-circle-question",
      title: "একটি ছোট কুইজ দিয়ে শুরু করুন",
      text: "আপনার JLPT লেভেল অনুযায়ী একবারে একটি প্রশ্ন পাবেন—উত্তর দিলে ব্যাখ্যা ও পরের প্রশ্ন।",
      placeholder: "আপনার উত্তর লিখুন…",
      starters: [
        ["fa-spell-check", "Vocabulary quiz", "অর্থ ও ব্যবহার যাচাই", "আমার লেভেল অনুযায়ী vocabulary quiz শুরু করুন। একবারে একটি প্রশ্ন দিন।"],
        ["fa-book", "Grammar quiz", "সঠিক pattern বাছুন", "আমার লেভেল অনুযায়ী grammar quiz শুরু করুন। একবারে একটি প্রশ্ন দিন।"],
        ["fa-language", "Kanji quiz", "Reading ও meaning", "আমার লেভেল অনুযায়ী kanji reading quiz শুরু করুন। একবারে একটি প্রশ্ন দিন।"],
        ["fa-align-left", "Reading quiz", "ছোট passage বুঝুন", "আমার লেভেল অনুযায়ী ছোট reading quiz শুরু করুন। একবারে একটি প্রশ্ন দিন।"]
      ],
      chips: [
        ["একটি hint", "উত্তর না বলে একটি ছোট hint দিন"],
        ["ব্যাখ্যা করুন", "সঠিক উত্তরটি কেন সঠিক ব্যাখ্যা করুন"],
        ["পরের প্রশ্ন", "পরের quiz প্রশ্ন দিন"]
      ]
    },
    translate: {
      label: "অনুবাদ ও বিশ্লেষণ",
      icon: "fa-language",
      title: "যে বাক্যটি বুঝতে চান, লিখুন",
      text: "Natural বাংলা/Japanese অনুবাদের সঙ্গে literal breakdown, particle ও conjugation বুঝুন।",
      placeholder: "বাংলা বা Japanese বাক্য লিখুন…",
      starters: [
        ["fa-arrow-right-arrow-left", "Japanese → বাংলা", "অর্থ ও breakdown", "বাংলায় অনুবাদ ও breakdown করুন: 日本に来てから、毎日が楽しいです。"],
        ["fa-language", "বাংলা → Japanese", "Natural Japanese তৈরি", "Natural Japanese-এ অনুবাদ করুন: আমি আগামী বছর জাপানে পড়তে যেতে চাই।"],
        ["fa-magnifying-glass", "Particle বিশ্লেষণ", "は・が・に・で বুঝুন", "এই বাক্যের প্রতিটি particle বুঝিয়ে দিন: 駅で友達に会いました。"],
        ["fa-briefcase", "কাজের Japanese", "ভদ্রভাবে অনুবাদ", "কর্মক্ষেত্রের polite Japanese-এ অনুবাদ করুন: আজ শরীর খারাপ, তাই একটু আগে বাড়ি যেতে চাই।"]
      ],
      chips: [
        ["Literal breakdown", "শব্দে শব্দে literal breakdown দিন"],
        ["আরও natural", "আরও naturalভাবে বলার ২টি উপায় দিন"],
        ["Polite version", "এটির polite এবং casual দুই রূপ দিন"]
      ]
    }
  };

  var state = {
    level: "N5",
    mode: "learn",
    depth: "standard",
    messages: [],
    busy: false,
    controller: null
  };

  var els = {};
  var toastTimer = 0;

  function $(selector) { return document.querySelector(selector); }
  function $$(selector) { return Array.from(document.querySelectorAll(selector)); }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function inlineMarkdown(value) {
    var text = escapeHtml(value);
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    return text;
  }

  function tableCells(line) {
    return line.trim().replace(/^\||\|$/g, "").split("|").map(function (cell) { return cell.trim(); });
  }

  function isTableDivider(line) {
    var cells = tableCells(line);
    return cells.length > 1 && cells.every(function (cell) { return /^:?-{3,}:?$/.test(cell); });
  }

  function renderMarkdown(source) {
    var lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
    var html = [];
    var list = "";
    var inCode = false;
    var code = [];

    function closeList() {
      if (list) html.push("</" + list + ">");
      list = "";
    }

    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i];
      if (/^```/.test(line.trim())) {
        closeList();
        if (inCode) {
          html.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
          code = [];
          inCode = false;
        } else {
          inCode = true;
        }
        continue;
      }
      if (inCode) {
        code.push(line);
        continue;
      }
      if (!line.trim()) {
        closeList();
        continue;
      }
      if (line.includes("|") && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
        closeList();
        var headers = tableCells(line);
        var rows = [];
        i += 2;
        while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
          rows.push(tableCells(lines[i]));
          i += 1;
        }
        i -= 1;
        html.push('<div class="tutor-table-wrap"><table><thead><tr>' + headers.map(function (cell) {
          return "<th>" + inlineMarkdown(cell) + "</th>";
        }).join("") + "</tr></thead><tbody>" + rows.map(function (row) {
          return "<tr>" + headers.map(function (_header, index) {
            return "<td>" + inlineMarkdown(row[index] || "") + "</td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>");
        continue;
      }
      var heading = line.match(/^(#{2,4})\s+(.+)$/);
      if (heading) {
        closeList();
        var level = heading[1].length;
        html.push("<h" + level + ">" + inlineMarkdown(heading[2]) + "</h" + level + ">");
        continue;
      }
      var unordered = line.match(/^\s*[-*•]\s+(.+)$/);
      var ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (unordered || ordered) {
        var nextList = unordered ? "ul" : "ol";
        if (list !== nextList) {
          closeList();
          list = nextList;
          html.push("<" + list + ">");
        }
        html.push("<li>" + inlineMarkdown((unordered || ordered)[1]) + "</li>");
        continue;
      }
      closeList();
      if (/^>\s?/.test(line)) html.push("<blockquote>" + inlineMarkdown(line.replace(/^>\s?/, "")) + "</blockquote>");
      else if (/^(-{3,}|_{3,})$/.test(line.trim())) html.push("<hr>");
      else html.push("<p>" + inlineMarkdown(line) + "</p>");
    }
    closeList();
    if (inCode) html.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
    return html.join("");
  }

  function localDayKey() {
    var now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  }

  function getUsage() {
    var today = localDayKey();
    try {
      var saved = JSON.parse(localStorage.getItem(USAGE_KEY) || "null");
      if (saved && saved.date === today && Number.isFinite(saved.count)) {
        return { date: today, count: Math.max(0, Math.floor(saved.count)) };
      }
    } catch (_error) { /* Storage is optional. */ }
    return { date: today, count: 0 };
  }

  function incrementUsage() {
    var usage = getUsage();
    usage.count += 1;
    try { localStorage.setItem(USAGE_KEY, JSON.stringify(usage)); } catch (_error) { /* no-op */ }
    updateUsage();
  }

  function updateUsage() {
    if (els.dailyUsage) els.dailyUsage.textContent = getUsage().count.toLocaleString("bn-BD");
  }

  function createClientId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    var bytes = new Uint8Array(18);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
  }

  function getClientId() {
    try {
      var existing = localStorage.getItem(CLIENT_ID_KEY) || "";
      if (/^[A-Za-z0-9_-]{20,100}$/.test(existing)) return existing;
      var created = createClientId();
      localStorage.setItem(CLIENT_ID_KEY, created);
      return created;
    } catch (_error) {
      return createClientId();
    }
  }

  function normalizeMessage(item) {
    if (!item || typeof item.text !== "string") return null;
    var role = item.role || item.sender;
    if (role !== "user" && role !== "bot") return null;
    var text = item.text.trim().slice(0, 12000);
    if (!text) return null;
    return {
      role: role,
      text: text,
      time: typeof item.time === "string" ? item.time : "",
      error: Boolean(item.error || item.isError)
    };
  }

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
      if (saved && typeof saved === "object") {
        if (VALID_LEVELS.includes(saved.level)) state.level = saved.level;
        if (Object.prototype.hasOwnProperty.call(MODES, saved.mode)) state.mode = saved.mode;
        if (VALID_DEPTHS.includes(saved.depth)) state.depth = saved.depth;
        if (Array.isArray(saved.messages)) state.messages = saved.messages.map(normalizeMessage).filter(Boolean).slice(-30);
        return;
      }
      var legacy = JSON.parse(localStorage.getItem(LEGACY_CHAT_KEY) || "[]");
      if (Array.isArray(legacy)) state.messages = legacy.map(normalizeMessage).filter(Boolean).slice(-30);
    } catch (_error) { /* Start with safe defaults. */ }
  }

  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        level: state.level,
        mode: state.mode,
        depth: state.depth,
        messages: state.messages.slice(-30)
      }));
    } catch (_error) { /* The tutor still works without persistence. */ }
  }

  function timeNow() {
    return new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
  }

  function showToast(message, isError) {
    if (!els.toast) return;
    window.clearTimeout(toastTimer);
    els.toast.classList.toggle("error", Boolean(isError));
    els.toast.querySelector("i").className = isError ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check";
    els.toast.querySelector("span").textContent = message;
    els.toast.classList.add("show");
    toastTimer = window.setTimeout(function () { els.toast.classList.remove("show"); }, 3200);
  }

  function starterMarkup() {
    return MODES[state.mode].starters.map(function (starter) {
      return '<button class="tutor-starter" type="button" data-prompt="' + escapeHtml(starter[3]) + '">' +
        '<i class="fa-solid ' + starter[0] + '" aria-hidden="true"></i><span><strong>' + escapeHtml(starter[1]) +
        "</strong><small>" + escapeHtml(starter[2]) + "</small></span></button>";
    }).join("");
  }

  function welcomeMarkup() {
    var mode = MODES[state.mode];
    return '<section class="tutor-welcome" id="tutorWelcome">' +
      '<span class="tutor-welcome-mark"><i class="fa-solid fa-robot" aria-hidden="true"></i></span>' +
      '<h2 id="welcomeTitle">' + escapeHtml(mode.title) + "</h2>" +
      '<p id="welcomeText">' + escapeHtml(mode.text) + "</p>" +
      '<div class="tutor-capabilities" aria-label="AI Tutor সুবিধা"><span>বাংলায় ব্যাখ্যা</span><span>সঠিক ふりがな</span><span>Natural Japanese</span><span>JLPT ' + state.level + "</span></div>" +
      '<div class="tutor-starters" id="tutorStarters">' + starterMarkup() + "</div></section>";
  }

  function messageElement(message, index) {
    var isUser = message.role === "user";
    var article = document.createElement("article");
    article.className = "tutor-message " + (isUser ? "user" : "assistant") + (message.error ? " error" : "");
    article.dataset.messageIndex = String(index);

    var avatar = document.createElement("span");
    avatar.className = "tutor-avatar";
    avatar.innerHTML = '<i class="fa-solid ' + (isUser ? "fa-user" : "fa-robot") + '" aria-hidden="true"></i>';

    var content = document.createElement("div");
    content.className = "tutor-message-content";
    var bubble = document.createElement("div");
    bubble.className = "tutor-bubble";
    if (isUser) bubble.textContent = message.text;
    else bubble.innerHTML = renderMarkdown(message.text);

    var meta = document.createElement("div");
    meta.className = "tutor-message-meta";
    var label = document.createElement("span");
    label.textContent = (isUser ? "আপনি" : "AI Tutor") + (message.time ? " · " + message.time : "");
    meta.appendChild(label);

    if (!isUser && !message.error) {
      var actions = document.createElement("span");
      actions.className = "tutor-message-actions";
      actions.innerHTML = '<button class="tutor-msg-action" type="button" data-action="copy" aria-label="উত্তর কপি করুন" title="কপি"><i class="fa-regular fa-copy" aria-hidden="true"></i></button>' +
        '<button class="tutor-msg-action" type="button" data-action="speak" aria-label="উত্তর শুনুন" title="শুনুন"><i class="fa-solid fa-volume-high" aria-hidden="true"></i></button>';
      meta.appendChild(actions);
    }
    content.appendChild(bubble);
    content.appendChild(meta);
    article.appendChild(avatar);
    article.appendChild(content);
    return article;
  }

  function renderConversation(scroll) {
    if (!state.messages.length) {
      els.messages.innerHTML = welcomeMarkup();
    } else {
      els.messages.innerHTML = "";
      state.messages.forEach(function (message, index) { els.messages.appendChild(messageElement(message, index)); });
    }
    if (scroll) scrollBottom();
  }

  function renderPromptRail() {
    els.promptRail.innerHTML = MODES[state.mode].chips.map(function (chip) {
      return '<button class="tutor-prompt-chip" type="button" data-prompt="' + escapeHtml(chip[1]) + '">' + escapeHtml(chip[0]) + "</button>";
    }).join("");
  }

  function scrollBottom() {
    window.requestAnimationFrame(function () {
      els.chat.scrollTo({ top: els.chat.scrollHeight, behavior: "smooth" });
    });
  }

  function updateInterface() {
    var mode = MODES[state.mode];
    $$("[data-level]").forEach(function (button) {
      var active = button.dataset.level === state.level;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    $$("[data-mode]").forEach(function (button) {
      var active = button.dataset.mode === state.mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    els.activeLevel.textContent = "JLPT " + state.level;
    els.activeMode.textContent = mode.label;
    els.activeModeIcon.className = "fa-solid " + mode.icon;
    els.input.placeholder = mode.placeholder;
    els.depthLabel.textContent = state.depth === "quick" ? "সংক্ষিপ্ত উত্তর" : state.depth === "deep" ? "বিস্তারিত উত্তর" : "Standard উত্তর";
    renderPromptRail();
    if (!state.messages.length) renderConversation(false);
    updateUsage();
  }

  function selectLevel(level) {
    if (!VALID_LEVELS.includes(level)) return;
    state.level = level;
    saveState();
    updateInterface();
  }

  function selectMode(mode) {
    if (!Object.prototype.hasOwnProperty.call(MODES, mode)) return;
    state.mode = mode;
    saveState();
    updateInterface();
    showToast(MODES[mode].label + " মোড চালু হয়েছে");
  }

  function addTyping() {
    var typing = document.createElement("article");
    typing.id = "tutorTyping";
    typing.className = "tutor-message assistant";
    typing.innerHTML = '<span class="tutor-avatar"><i class="fa-solid fa-robot" aria-hidden="true"></i></span><div class="tutor-message-content"><div class="tutor-bubble tutor-typing" aria-label="AI উত্তর লিখছে"><i></i><i></i><i></i></div><div class="tutor-message-meta">ভাবছি ও যাচাই করছি…</div></div>';
    els.messages.appendChild(typing);
    scrollBottom();
  }

  function removeTyping() {
    var typing = $("#tutorTyping");
    if (typing) typing.remove();
  }

  function setBusy(busy) {
    state.busy = busy;
    els.chat.setAttribute("aria-busy", String(busy));
    els.input.disabled = busy;
    els.send.classList.toggle("stop", busy);
    els.send.disabled = false;
    els.send.setAttribute("aria-label", busy ? "উত্তর থামান" : "প্রশ্ন পাঠান");
    els.send.innerHTML = busy ? '<i class="fa-solid fa-stop" aria-hidden="true"></i>' : '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
  }

  function followupMarkup() {
    return '<div class="tutor-followups" id="tutorFollowups">' + MODES[state.mode].chips.map(function (chip) {
      return '<button class="tutor-followup" type="button" data-prompt="' + escapeHtml(chip[1]) + '">' + escapeHtml(chip[0]) + "</button>";
    }).join("") + "</div>";
  }

  async function sendMessage(rawMessage) {
    if (state.busy) {
      if (state.controller) state.controller.abort();
      return;
    }
    var message = String(rawMessage || "").trim();
    if (!message) {
      els.input.focus();
      return;
    }
    if (getUsage().count >= DAILY_LIMIT) {
      showToast("আজকের ২০টি প্রশ্ন শেষ। আগামীকাল আবার চেষ্টা করুন।", true);
      return;
    }

    var history = state.messages.filter(function (item) { return !item.error; }).slice(-8).map(function (item) {
      return { role: item.role, text: item.text };
    });
    state.messages.push({ role: "user", text: message, time: timeNow(), error: false });
    state.messages = state.messages.slice(-30);
    saveState();
    renderConversation(true);
    els.input.value = "";
    resizeInput();
    addTyping();
    setBusy(true);

    var controller = new AbortController();
    var timedOut = false;
    var timeout = window.setTimeout(function () {
      timedOut = true;
      controller.abort();
    }, 110000);
    state.controller = controller;

    try {
      var clientId = getClientId();
      var response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Client-Id": clientId
        },
        body: JSON.stringify({
          message: message,
          history: history,
          client_id: clientId,
          level: state.level,
          mode: state.mode,
          depth: state.depth
        }),
        signal: controller.signal
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.message || "AI সেবা এখন পাওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।");
      var reply = typeof data.response === "string" ? data.response.trim() : "";
      if (!reply) throw new Error("AI খালি উত্তর দিয়েছে। প্রশ্নটি অন্যভাবে লিখে আবার চেষ্টা করুন।");

      removeTyping();
      state.messages.push({ role: "bot", text: reply, time: timeNow(), error: false });
      state.messages = state.messages.slice(-30);
      incrementUsage();
      saveState();
      renderConversation(true);
      els.messages.insertAdjacentHTML("beforeend", followupMarkup());
      scrollBottom();
    } catch (error) {
      removeTyping();
      if (error && error.name === "AbortError" && !timedOut) {
        showToast("উত্তর থামানো হয়েছে");
      } else {
        var reason = timedOut ? "উত্তর পেতে বেশি সময় লাগছে। একটু পরে আবার চেষ্টা করুন।" : (error && error.message ? error.message : "সংযোগ সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        state.messages.push({ role: "bot", text: "⚠️ **AI সংযোগ সমস্যা**\n\n" + reason, time: timeNow(), error: true });
        saveState();
        renderConversation(true);
        showToast("AI সংযোগে সমস্যা হয়েছে", true);
      }
    } finally {
      window.clearTimeout(timeout);
      state.controller = null;
      setBusy(false);
      els.input.focus();
    }
  }

  function resizeInput() {
    els.input.style.height = "auto";
    els.input.style.height = Math.min(els.input.scrollHeight, 126) + "px";
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("উত্তর কপি হয়েছে");
    } catch (_error) {
      var temporary = document.createElement("textarea");
      temporary.value = text;
      temporary.setAttribute("readonly", "");
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.appendChild(temporary);
      temporary.select();
      document.execCommand("copy");
      temporary.remove();
      showToast("উত্তর কপি হয়েছে");
    }
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) {
      showToast("এই browser-এ শোনার সুবিধা নেই", true);
      return;
    }
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(text.replace(/[*#_|`]/g, " "));
    utterance.lang = /[ぁ-んァ-ン一-龯]/.test(text) ? "ja-JP" : "bn-BD";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }

  function setupVoice() {
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      els.voice.disabled = true;
      els.voice.title = "এই browser-এ voice input নেই";
      return;
    }
    var recognition = new Recognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = function () {
      els.voice.classList.add("recording");
      els.voice.innerHTML = '<i class="fa-solid fa-wave-square" aria-hidden="true"></i>';
      showToast("বলুন—আমি শুনছি");
    };
    recognition.onend = function () {
      els.voice.classList.remove("recording");
      els.voice.innerHTML = '<i class="fa-solid fa-microphone" aria-hidden="true"></i>';
    };
    recognition.onerror = function () { showToast("কণ্ঠ ঠিকভাবে শোনা যায়নি", true); };
    recognition.onresult = function (event) {
      els.input.value = event.results[0][0].transcript;
      resizeInput();
      els.input.focus();
    };
    els.voice.addEventListener("click", function () {
      if (els.voice.classList.contains("recording")) recognition.stop();
      else recognition.start();
    });
  }

  function setStatus(online) {
    els.statusDot.classList.toggle("offline", !online);
    els.statusText.textContent = online ? "AI Tutor অনলাইন" : "সংযোগ পাওয়া যাচ্ছে না";
  }

  async function checkStatus() {
    if (!navigator.onLine) {
      setStatus(false);
      return;
    }
    try {
      var response = await fetch(API_ENDPOINT, { method: "HEAD", cache: "no-store" });
      setStatus(response.ok);
    } catch (_error) {
      setStatus(false);
    }
  }

  function openSettings() {
    var levelInput = $('input[name="settingsLevel"][value="' + state.level + '"]');
    var depthInput = $('input[name="settingsDepth"][value="' + state.depth + '"]');
    if (levelInput) levelInput.checked = true;
    if (depthInput) depthInput.checked = true;
    if (typeof els.settingsDialog.showModal === "function") els.settingsDialog.showModal();
    else els.settingsDialog.setAttribute("open", "");
  }

  function closeSettings() {
    if (typeof els.settingsDialog.close === "function") els.settingsDialog.close();
    else els.settingsDialog.removeAttribute("open");
  }

  function clearConversation(notify) {
    if (state.controller) state.controller.abort();
    state.messages = [];
    saveState();
    renderConversation(false);
    if (notify) showToast("চ্যাটের ইতিহাস মুছে দেওয়া হয়েছে");
  }

  function bindEvents() {
    document.addEventListener("click", function (event) {
      var target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      var modeButton = target.closest("[data-mode]");
      if (modeButton) {
        selectMode(modeButton.dataset.mode);
        return;
      }
      var levelButton = target.closest("[data-level]");
      if (levelButton) {
        selectLevel(levelButton.dataset.level);
        return;
      }
      var promptButton = target.closest("[data-prompt]");
      if (promptButton) {
        sendMessage(promptButton.dataset.prompt);
        return;
      }
      var action = target.closest("[data-action]");
      if (action) {
        var article = action.closest("[data-message-index]");
        var message = article ? state.messages[Number(article.dataset.messageIndex)] : null;
        if (!message) return;
        if (action.dataset.action === "copy") copyText(message.text);
        if (action.dataset.action === "speak") speakText(message.text);
      }
    });

    els.form.addEventListener("submit", function (event) {
      event.preventDefault();
      sendMessage(els.input.value);
    });
    els.input.addEventListener("input", resizeInput);
    els.input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        els.form.requestSubmit();
      }
    });
    $("#newChatButton").addEventListener("click", function () {
      if (!state.messages.length || window.confirm("বর্তমান চ্যাট বন্ধ করে নতুন চ্যাট শুরু করবেন?")) clearConversation(false);
    });
    $("#settingsButton").addEventListener("click", openSettings);
    $("#saveSettingsButton").addEventListener("click", function () {
      var selectedLevel = $('input[name="settingsLevel"]:checked');
      var selectedDepth = $('input[name="settingsDepth"]:checked');
      if (selectedLevel) state.level = selectedLevel.value;
      if (selectedDepth) state.depth = selectedDepth.value;
      saveState();
      updateInterface();
      closeSettings();
      showToast("Tutor সেটিংস সংরক্ষণ হয়েছে");
    });
    $("#clearHistoryButton").addEventListener("click", function () {
      if (!state.messages.length || window.confirm("এই browser থেকে AI Tutor-এর সম্পূর্ণ চ্যাট মুছবেন?")) {
        clearConversation(true);
        closeSettings();
      }
    });
    window.addEventListener("online", checkStatus);
    window.addEventListener("offline", function () { setStatus(false); });
  }

  function initialize() {
    els.messages = $("#tutorMessages");
    els.chat = $("#tutorChat");
    els.form = $("#tutorForm");
    els.input = $("#tutorInput");
    els.send = $("#sendButton");
    els.voice = $("#voiceButton");
    els.promptRail = $("#promptRail");
    els.activeLevel = $("#activeLevelLabel");
    els.activeMode = $("#activeModeLabel");
    els.activeModeIcon = $("#activeModeIcon");
    els.dailyUsage = $("#dailyUsage");
    els.depthLabel = $("#depthLabel");
    els.settingsDialog = $("#settingsDialog");
    els.toast = $("#tutorToast");
    els.statusDot = $("#tutorStatusDot");
    els.statusText = $("#tutorStatusText");

    loadState();
    renderConversation(false);
    updateInterface();
    bindEvents();
    setupVoice();
    checkStatus();
    resizeInput();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
