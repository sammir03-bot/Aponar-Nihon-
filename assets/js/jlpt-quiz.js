(() => {
  'use strict';
  const S = window.ANStudy, $ = id => document.getElementById(id), e = S.esc;
  const categories = ['vocabulary', 'kanji', 'grammar', 'reading'];
  const names = {vocabulary: 'Vocabulary · শব্দভাণ্ডার', kanji: 'Kanji · কানজি', grammar: 'Grammar · ব্যাকরণ', reading: 'Reading · রিডিং'};
  const params = new URLSearchParams(location.search);
  let level = (params.get('level') || 'n5').toLowerCase();
  if (!['n5', 'n4', 'n3'].includes(level)) level = 'n5';
  let category = (params.get('category') || 'vocabulary').toLowerCase();
  if (!categories.includes(category)) category = 'vocabulary';
  let part = Math.max(1, Math.min(10, Math.floor(Number(params.get('part'))) || 1));
  let rows = [], answers = {}, version = '', retryIds = null, requestId = 0;
  let furigana = true;
  try { furigana = localStorage.getItem('aponarQuizFurigana') !== 'off'; } catch { /* Practice works without storage. */ }
  const stateKey = () => `aponarQuizV2:${level}:${category}:${part}`;
  const visibleRows = () => retryIds ? rows.filter(q => retryIds.includes(q.id)) : rows;

  // Store the original choice index; rendering and furigana never change it.
  function order(q) {
    let seed = 2166136261;
    for (const ch of q.id + ':quiz2') seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
    const indices = [0, 1, 2, 3];
    for (let i = 3; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }
  function go(l, c, p) {
    location.href = `/jlpt-quiz.html?level=${l}&category=${c}&part=${p}`;
  }
  function nav() {
    $('quizLevel').value = level;
    $('categoryTabs').innerHTML = categories.map(c => `<button type="button" class="tab ${c === category ? 'active' : ''}" data-c="${c}" aria-pressed="${c === category}">${names[c]}</button>`).join('');
    $('partTabs').innerHTML = Array.from({length: 10}, (_, i) => `<button type="button" class="part ${i + 1 === part ? 'active' : ''}" data-p="${i + 1}" aria-pressed="${i + 1 === part}">Part ${i + 1}</button>`).join('');
    $('badge').textContent = `JLPT ${level.toUpperCase()} · Part ${part}`;
    $('title').textContent = `${level.toUpperCase()} ${names[category]}`;
    $('topSub').textContent = `${level.toUpperCase()} · ${names[category]} · Part ${part}`;
    $('desc').textContent = 'নিজে উত্তর দিন; তারপর বাংলা অর্থ ও কারণ দেখুন। প্রকাশিত mock test-এর পরীক্ষিত প্রশ্ন থেকে এই অনুশীলন সাজানো হয়েছে।';
  }
  function applyFurigana() {
    document.documentElement.dataset.quizFurigana = furigana ? 'on' : 'off';
    $('furiganaBtn').textContent = furigana ? 'ふ Furigana ON' : 'ふ Furigana OFF';
    $('furiganaBtn').setAttribute('aria-pressed', String(furigana));
  }
  function card(q, i) {
    const checked = Object.hasOwn(answers, q.id), choice = answers[q.id];
    // A reading/spelling test must not reveal its answer through ruby.
    const testedKanji = q.category === 'kanji' && !checked;
    const opts = order(q).map((sourceIndex, displayIndex) => `<button type="button" class="opt ${checked && sourceIndex === q.answer ? 'correct' : checked && sourceIndex === choice ? 'wrong' : checked ? 'dim' : ''}" data-id="${e(q.id)}" data-choice="${sourceIndex}" aria-pressed="${sourceIndex === choice}" ${checked ? 'disabled' : ''}><span class="option-number">${displayIndex + 1}</span><span class="jp-text" lang="ja">${S.safe(testedKanji ? q.options[sourceIndex] : q.optionsHtml?.[sourceIndex] || q.options[sourceIndex])}</span>${checked && sourceIndex === q.answer ? '<span class="sr-only">সঠিক উত্তর</span>' : ''}</button>`).join('');
    return `<article class="card" data-i="${i}" data-id="${e(q.id)}"><div class="qhead"><span class="qno">${i + 1}</span><span class="kind">${e(names[q.category])}</span></div>${q.passageHtml ? `<div class="passage jp-text" lang="ja">${S.safe(q.passageHtml)}</div>` : ''}${q.questionImage ? S.safe(q.questionImage) : ''}<div class="q jp-text" lang="ja">${S.safe(testedKanji ? q.prompt : q.promptHtml || q.prompt)}</div>${testedKanji ? '<p class="quiz-note">এই কানজির পাঠ/বানান নিজে মনে করুন; উত্তর দেওয়ার পরে ফুরিগানা দেখাবে।</p>' : ''}<div class="opts">${opts}</div><div class="explain ${checked ? 'show' : ''}" aria-live="polite">${checked ? `<strong>${choice === q.answer ? 'সঠিক হয়েছে ✓' : 'এবার হয়নি—সঠিক উত্তর দেখুন'}</strong><p><b>বাংলা উত্তর:</b> ${e(q.answerBn)}</p><p>${e(q.explanationBn)}</p>${S.source(q)}` : ''}</div></article>`;
  }
  function save() {
    S.write(stateKey(), {version: 2, bankVersion: version, answers});
    let results = S.read('anQuizSetResultsV2', {});
    if (Array.isArray(results)) results = {};
    const valid = rows.filter(q => Object.hasOwn(answers, q.id));
    results[stateKey()] = {version: 2, bankVersion: version, total: rows.length, answered: valid.length, correct: valid.filter(q => answers[q.id] === q.answer).length, completed: valid.length === rows.length, updatedAt: Date.now()};
    S.write('anQuizSetResultsV2', results);
  }
  function update() {
    const done = rows.filter(q => Object.hasOwn(answers, q.id));
    const correct = done.filter(q => answers[q.id] === q.answer).length;
    $('statusText').textContent = `${done.length} / ${rows.length} উত্তর${retryIds ? ' · ভুলগুলো আবার করছি' : ''}`;
    $('scoreText').textContent = `স্কোর ${correct} / ${rows.length}`;
    $('progressFill').style.width = `${rows.length ? Math.round(done.length / rows.length * 100) : 0}%`;
    $('resultText').textContent = done.length === rows.length ? `শেষ! আপনার স্কোর ${correct}/${rows.length} · ${correct === rows.length ? 'সব উত্তর সঠিক 🎉' : 'নিচে “ভুলগুলো আবার করি” চাপতে পারেন।'}` : 'সব প্রশ্নের উত্তর দিন';
    $('retryWrongBtn').disabled = !done.some(q => answers[q.id] !== q.answer);
    $('resetBtn').disabled = !rows.length;
    $('nextBtn').disabled = !rows.length;
    $('nextBtn').textContent = part === 10 ? 'Quiz Center-এ ফিরুন →' : 'পরের Part →';
  }
  function render() {
    $('quizHost').innerHTML = visibleRows().map(card).join('');
    $('passageHost').textContent = '';
    update();
  }
  async function load() {
    const id = ++requestId;
    nav(); applyFurigana();
    $('quizHost').innerHTML = '<p class="quiz-state" role="status">প্রশ্ন লোড হচ্ছে…</p>';
    $('resetBtn').disabled = true; $('nextBtn').disabled = true; $('retryWrongBtn').disabled = true;
    try {
      const response = await fetch(`/assets/data/quiz/${level}.json?v=20261007.quiz2`, {signal: AbortSignal.timeout(15000)});
      if (!response.ok) throw new Error('load');
      const bank = await response.json();
      if (id !== requestId) return;
      rows = bank.categories[category][part - 1]; version = bank.version;
      if (!Array.isArray(rows) || !rows.length) throw new Error('empty');
      const saved = S.read(stateKey(), {});
      const raw = saved.version === 2 && saved.bankVersion === version && saved.answers && typeof saved.answers === 'object' ? saved.answers : {};
      answers = {};
      for (const q of rows) if (Number.isInteger(raw[q.id]) && raw[q.id] >= 0 && raw[q.id] < 4) answers[q.id] = raw[q.id];
      render();
    } catch {
      if (id !== requestId) return;
      rows = []; update();
      $('quizHost').innerHTML = '<p class="quiz-state" role="status">প্রশ্ন লোড হয়নি। <button class="btn soft" type="button" id="quizLoadRetry">আবার চেষ্টা করুন</button></p>';
      $('quizLoadRetry').onclick = load;
    }
  }
  $('quizHost').addEventListener('click', event => {
    const button = event.target.closest('button[data-choice]');
    if (!button) return;
    const q = rows.find(q => q.id === button.dataset.id), choice = Number(button.dataset.choice);
    if (!q || Object.hasOwn(answers, q.id) || !Number.isInteger(choice) || choice < 0 || choice > 3) return;
    answers[q.id] = choice; S.record(q, choice, level); save();
    const article = button.closest('.card');
    const i = visibleRows().findIndex(row => row.id === q.id);
    article.outerHTML = card(q, i); update();
    $('quizHost').querySelector(`[data-id="${q.id}"] .explain`).scrollIntoView({behavior: 'smooth', block: 'nearest'});
  });
  $('categoryTabs').addEventListener('click', event => { const b = event.target.closest('[data-c]'); if (b) go(level, b.dataset.c, part); });
  $('partTabs').addEventListener('click', event => { const b = event.target.closest('[data-p]'); if (b) go(level, category, Number(b.dataset.p)); });
  $('quizLevel').onchange = event => go(event.target.value, category, 1);
  $('furiganaBtn').onclick = () => { furigana = !furigana; try { localStorage.setItem('aponarQuizFurigana', furigana ? 'on' : 'off'); } catch { S.toast('ফুরিগানা বদলেছে; এই ব্রাউজারে সেটিং রাখা যাচ্ছে না।'); } applyFurigana(); };
  $('resetBtn').onclick = () => { answers = {}; retryIds = null; save(); render(); };
  $('retryWrongBtn').onclick = () => { retryIds = rows.filter(q => Object.hasOwn(answers, q.id) && answers[q.id] !== q.answer).map(q => q.id); for (const id of retryIds) delete answers[id]; save(); render(); $('quizHost').scrollIntoView({behavior: 'smooth', block: 'start'}); };
  $('nextBtn').onclick = () => part === 10 ? location.assign('/quiz.html') : go(level, category, part + 1);
  load();
})();
