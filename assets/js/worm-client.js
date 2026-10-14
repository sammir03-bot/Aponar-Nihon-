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
      // Preserve the original tutor's daily question counter in dual-provider mode.
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
  // The provider may complete a stream before exposing content to the browser.
  // Read the saved assistant answer for the exact latest user message, never an older answer.
  async function recoverFromHistory(conversationId, question, signal, s) {
    for (var attempt = 0; attempt < 2; attempt++) {
      if (signal && signal.aborted) throw new DOMException("Aborted", "AbortError");
      var historyResponse = await request("get-history", {
        conversation_id: conversationId
      }, signal, s);
      var history = await historyResponse.json();
      var entries = Array.isArray(history.messages) ? history.messages : [];
      var userIndex = -1;
      for (var i = entries.length - 1; i >= 0; i--) {
        var item = entries[i];
        if (item && item.role === "user" && typeof item.content === "string" &&
            item.content.trim().endsWith(question.trim())) {
          userIndex = i;
          break;
        }
      }
      if (userIndex >= 0) {
        for (var j = userIndex + 1; j < entries.length; j++) {
          var next = entries[j];
          if (next && next.role === "assistant" && typeof next.content === "string" &&
              next.content.trim()) return next.content.trim();
        }
      }
      if (attempt === 0) await new Promise(function (resolve) { setTimeout(resolve, 650); });
    }
    return "";
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
    var streamError = "";
    function processEvent(frame) {
      var dataLines = frame.split(/\r?\n/).filter(function (line) {
        return line.indexOf("data:") === 0;
      });
      for (var i = 0; i < dataLines.length; i++) {
        var data = dataLines[i].slice(5).trim();
        if (data === "[DONE]") { done = true; break; }
        if (!data) continue;
        try {
          var obj = JSON.parse(data);
          if (!obj || typeof obj !== "object") continue;
          if (obj.error || obj.type === "error") {
            streamError = "WORM GPT সেবা থেকে উত্তর পাওয়া যায়নি";
            continue;
          }
          var delta = "";
          if (typeof obj.content === "string") delta = obj.content;
          else if (typeof obj.delta === "string") delta = obj.delta;
          else if (typeof obj.text === "string") delta = obj.text;
          else if (typeof obj.response === "string") delta = obj.response;
          else if (obj.data && typeof obj.data.content === "string") delta = obj.data.content;
          else if (obj.message && typeof obj.message.content === "string") delta = obj.message.content;
          else if (obj.choices && obj.choices[0]) {
            var choice = obj.choices[0];
            if (choice.delta && typeof choice.delta.content === "string") delta = choice.delta.content;
            else if (choice.message && typeof choice.message.content === "string") delta = choice.message.content;
            else if (typeof choice.text === "string") delta = choice.text;
          }
          if (delta) {
            answer += delta;
            if (typeof onChunk === "function") onChunk(answer);
          }
        } catch (_error) {
          // Ignore non-JSON heartbeat frames but do not discard later valid chunks.
        }
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
    if (!answer.trim() && !streamError) {
      answer = await recoverFromHistory(id, payload.message, signal, s);
      if (answer && typeof onChunk === "function") onChunk(answer);
    }
    if (streamError) throw new Error(streamError);
    if (!answer.trim()) throw new Error("WORM GPT উত্তর পাঠায়নি। একটু পরে আবার চেষ্টা করুন।");
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
