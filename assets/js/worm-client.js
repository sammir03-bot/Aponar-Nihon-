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
    function processEvent(frame) {
      var dataLines = frame.split(/\r?\n/).filter(function (line) { return line.indexOf("data:") === 0; });
      for (var i = 0; i < dataLines.length; i++) {
        var data = dataLines[i].slice(5).trim();
        if (data === "[DONE]") { done = true; break; }
        if (!data) continue;
        try {
          var obj = JSON.parse(data);
          if (typeof obj.content === "string") {
            answer += obj.content;
            if (typeof onChunk === "function") onChunk(answer);
          }
        } catch (_error) { /* An incomplete/malformed SSE event is ignored. */ }
      }
    }
    try {
      while (!done) {
        var part = await reader.read();
        if (part.done) break;
        pending += decoder.decode(part.value, { stream: true }).replace(/\r\n/g, "\n");
        var index;
        while ((index = pending.indexOf("\n\n")) >= 0) {
          processEvent(pending.slice(0, index));
          pending = pending.slice(index + 2);
          if (done) break;
        }
      }
      pending += decoder.decode();
      if (pending.trim() && !done) processEvent(pending);
    } finally {
      reader.releaseLock();
    }
    if (!answer.trim()) throw new Error("WORM GPT খালি উত্তর দিয়েছে");
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
