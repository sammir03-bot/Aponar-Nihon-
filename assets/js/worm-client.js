/* Aponar Nihon WORM GPT client.
   No provider API key, upstream access key or secret is stored in this file. */
(function () {
  "use strict";
  var BASE = "https://xgudgxnkolpqfovfmijl.supabase.co/functions/v1/worm-tutor";
  var PREFIX = "nihon_worm_conversation_";
  var lastUserId = "";
  var forceFresh = false;

  async function session() {
    if (!window.AN || !window.AN_SUPABASE) return null;
    var value = await window.AN.session().catch(function () { return null; });
    lastUserId = value && value.user ? value.user.id : "";
    return value;
  }
  function authHeaders(s) {
    return {
      "Content-Type": "application/json",
      "apikey": window.AN_SUPABASE.key,
      "Authorization": "Bearer " + s.access_token
    };
  }
  async function errorMessage(response) {
    var data = await response.json().catch(function () { return {}; });
    return data.message || "WORM GPT সংযোগে সমস্যা হয়েছে (HTTP " + response.status + ")";
  }
  async function available() {
    try {
      var s = await session();
      if (!s) return false;
      var response = await fetch(BASE, {
        method: "GET",
        headers: authHeaders(s),
        cache: "no-store"
      });
      if (!response.ok) return false;
      var data = await response.json();
      var active = data.configured === true;
      var usage = document.querySelector(".tutor-usage");
      if (usage && active) usage.textContent = "WORM GPT";
      var historyButton = document.getElementById("wormHistoryButton");
      if (historyButton) historyButton.style.display = active ? "" : "none";
      return active;
    } catch (_error) {
      return false;
    }
  }
  async function request(action, payload, signal, userSession) {
    var s = userSession || await session();
    if (!s) throw new Error("WORM GPT ব্যবহারের জন্য লগইন করুন");
    var response = await fetch(BASE, {
      method: "POST",
      headers: authHeaders(s),
      body: JSON.stringify(Object.assign({ action: action }, payload || {})),
      signal: signal
    });
    if (!response.ok) throw new Error(await errorMessage(response));
    return response;
  }
  async function sendMessage(payload, signal, onChunk) {
    var s = await session();
    if (!s) throw new Error("লগইন প্রয়োজন");
    var key = PREFIX + s.user.id;
    if (forceFresh) {
      try { localStorage.removeItem(key); } catch (_error) { /* ignore */ }
      forceFresh = false;
    }
    var id = "";
    try { id = localStorage.getItem(key) || ""; } catch (_error) { /* ignore */ }
    if (!/^[a-f0-9-]{36}$/i.test(id)) {
      var created = await request("new-chat", {
        title: "Aponar Nihon AI Tutor"
      }, signal, s);
      var result = await created.json();
      id = result.conversation_id || "";
      if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error("নতুন চ্যাট তৈরি করা যায়নি");
      try { localStorage.setItem(key, id); } catch (_error) { /* ignore */ }
    }
    var response = await request("send-message", Object.assign({
      conversation_id: id
    }, payload), signal, s);
    if (!response.body) throw new Error("AI streaming response পাওয়া যায়নি");
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var pending = "";
    var answer = "";
    var done = false;
    var upstreamError = "";
    function appendText(value) {
      if (typeof value !== "string" || !value.length) return;
      answer += value;
      if (answer.trim() && typeof onChunk === "function") onChunk(answer);
    }
    function eventText(obj) {
      if (!obj || typeof obj !== "object") return "";
      var candidates = [
        obj.content,
        obj.delta && obj.delta.content,
        obj.data && obj.data.content,
        obj.message && obj.message.content,
        obj.choices && obj.choices[0] && obj.choices[0].delta && obj.choices[0].delta.content,
        obj.choices && obj.choices[0] && obj.choices[0].message && obj.choices[0].message.content,
        obj.response,
        obj.text
      ];
      for (var c = 0; c < candidates.length; c++) {
        var value = candidates[c];
        if (typeof value === "string") return value;
        if (Array.isArray(value)) {
          var segments = value.map(function (part) {
            return typeof part === "string" ? part : part && typeof part.text === "string" ? part.text : "";
          }).join("");
          if (segments) return segments;
        }
      }
      return "";
    }
    function parseData(raw) {
      var data = raw.trim();
      if (!data) return;
      if (data === "[DONE]") { done = true; return; }
      try {
        var obj = JSON.parse(data);
        if (typeof obj === "string") { appendText(obj); return; }
        if (obj && obj.error) {
          upstreamError = typeof obj.error === "string" ? obj.error : String(obj.error.message || "Provider error");
        }
        appendText(eventText(obj));
      } catch (_error) {
        // Some providers send advisory fields that are not valid JSON; do not display them as AI answers.
      }
    }
    function processEvent(frame) {
      var lines = frame.split(/\r?\n/);
      var dataLines = lines.filter(function (line) { return line.indexOf("data:") === 0; }).map(function (line) {
        return line.slice(5).trimStart();
      });
      if (dataLines.length) {
        // SSE permits several data: lines per event. Most WORM responses contain one JSON object per event.
        if (dataLines.length === 1) parseData(dataLines[0]);
        else {
          var combined = dataLines.join("\n");
          try { JSON.parse(combined); parseData(combined); }
          catch (_error) { dataLines.forEach(parseData); }
        }
      } else if (frame.trim()) {
        // Gracefully accept an upstream JSON response mislabeled as an SSE stream.
        parseData(frame);
      }
    }
    try {
      while (!done) {
        var part = await reader.read();
        if (part.done) break;
        pending += decoder.decode(part.value, { stream: true });
        var separator;
        while ((separator = /\r?\n\r?\n/.exec(pending))) {
          processEvent(pending.slice(0, separator.index));
          pending = pending.slice(separator.index + separator[0].length);
          if (done) break;
        }
      }
      pending += decoder.decode();
      if (pending.trim() && !done) processEvent(pending);
    } finally {
      reader.releaseLock();
    }
    if (!answer.trim()) {
      // The provider can persist its answer even when its SSE transport emits no text.
      // Only recover an answer following the exact latest user turn; never return a stale response.
      try {
        var historyResult = await request("get-history", { conversation_id: id }, signal, s);
        var historyData = await historyResult.json();
        var messages = Array.isArray(historyData.messages) ? historyData.messages : [];
        var lastUser = -1;
        for (var i = 0; i < messages.length; i++) {
          if (messages[i] && messages[i].role === "user") lastUser = i;
        }
        var currentQuestion = String(payload.message || "").trim();
        if (lastUser >= 0 && currentQuestion &&
            String(messages[lastUser].content || "").trim().endsWith(currentQuestion)) {
          for (var j = lastUser + 1; j < messages.length; j++) {
            var item = messages[j];
            if (item && item.role === "assistant" && typeof item.content === "string" && item.content.trim()) {
              answer = item.content.trim();
              if (typeof onChunk === "function") onChunk(answer);
            }
          }
        }
      } catch (_historyError) { /* The existing AI fallback can handle an unrecoverable empty stream. */ }
    }
    if (!answer.trim()) {
      var error = new Error(upstreamError ? "WORM GPT উত্তর পাঠাতে পারেনি। বিকল্প AI চেষ্টা হচ্ছে।" : "WORM GPT থেকে খালি response এসেছে।");
      error.code = "WORM_EMPTY_RESPONSE";
      throw error;
    }
    return answer.trim();
  }
  function resetConversation() {
    forceFresh = true;
    if (lastUserId) {
      try { localStorage.removeItem(PREFIX + lastUserId); } catch (_error) { /* ignore */ }
    }
  }
  function selectConversation(id) {
    if (!/^[a-f0-9-]{36}$/i.test(id) || !lastUserId) throw new Error("Invalid chat selection");
    forceFresh = false;
    localStorage.setItem(PREFIX + lastUserId, id);
  }
  async function listChats() {
    var result = await request("list-chats");
    return result.json();
  }
  async function getHistory(conversationId) {
    var result = await request("get-history", { conversation_id: conversationId });
    return result.json();
  }
  window.WormTutor = {
    ready: available,
    sendMessage: sendMessage,
    resetConversation: resetConversation,
    selectConversation: selectConversation,
    listChats: listChats,
    getHistory: getHistory
  };
})();
