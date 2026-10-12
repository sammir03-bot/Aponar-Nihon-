import {dayKey, normalize, rowsForLevel, lessonsForLevel, studied, mastered, dueRows, readState, saveState, grade, streakDays, question} from './kanji-lab-core.js?v=20261012.2';

const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const bn = value => Number(value).toLocaleString('bn-BD');
const level = new URLSearchParams(location.search).get('level') === 'n4' ? 'n4' : 'n5';
const dialog = $('studyDialog');
let course, bank, lessons, state, storage, view = 'lessons', session = null, pathsData, toastTimer, renderToken = 0, stopWriting = () => {};
try { storage = window.localStorage; } catch (_error) { storage = {getItem: () => null, setItem: () => { throw Error('unavailable'); }}; }

function toast(message) {
  $('klToast').textContent = message;
  $('klToast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('klToast').classList.remove('show'), 3200);
}
function persist() {
  if (!saveState(storage, state)) $('saveNote').textContent = 'এই ব্রাউজারে সংরক্ষণ বন্ধ আছে। এইবারের পাঠ চলবে, কিন্তু বন্ধ করলে অগ্রগতি হারাতে পারে।';
}
function stats() {
  $('totalCount').textContent = bn(bank.length);
  $('seenCount').textContent = bn(bank.filter(r => studied(state.cards[r.k])).length);
  $('masterCount').textContent = bn(bank.filter(r => mastered(state.cards[r.k])).length);
  $('dueCount').textContent = bn(dueRows(bank, state).length);
  $('streakCount').textContent = bn(streakDays(state.dates));
}
function tile(row) {
  const record = state.cards[row.k];
  const badge = mastered(record) ? 'মনে পড়ছে ✓' : studied(record) ? 'পড়া হয়েছে' : record?.errors ? 'আবার পড়ুন' : 'শেখা বাকি';
  return `<button class="kl-tile" data-open="${esc(row.k)}" aria-label="${esc(row.k + ' — ' + row.bn)}"><b lang="ja">${esc(row.k)}</b><span>${esc(row.bn)}</span><small>${badge}</small></button>`;
}
function renderHome() {
  stats();
  const query = normalize($('kanjiSearch').value);
  if (view !== 'lessons' || query) {
    let list = bank;
    if (view === 'mistakes') list = list.filter(r => state.cards[r.k]?.errors > 0 && !mastered(state.cards[r.k]));
    if (query) list = list.filter(row => normalize([row.k, row.bn, ...row.on, ...row.kun, ...row.words.flatMap(w => [w.ja, w.reading, w.bn])].join(' ')).includes(query));
    $('courseContent').innerHTML = list.length ? `<p class="kl-body-note">${bn(list.length)}টি ${level.toUpperCase()} কাঞ্জি · একটি খুলে পড়া শুরু করুন।</p><div class="kl-library">${list.map(tile).join('')}</div>` : `<div class="kl-empty">${view === 'mistakes' ? 'এখন কোনো ভুল জমা নেই। একটি পাঠের মনে পড়ার পরীক্ষা দিন।' : 'এই লেভেলে কিছু পাওয়া যায়নি। বানান বা বাংলা অর্থ বদলে খুঁজুন।'}</div>`;
    return;
  }
  let html = '';
  for (const book of [1, 2, 0]) {
    const group = lessons.filter(l => l.book === book);
    if (!group.length) continue;
    const name = book ? `Minna no Nihongo ${book === 1 ? 'I' : 'II'}` : `বইয়ের পরে আরও ${level.toUpperCase()}`;
    html += `<div class="kl-book-head"><h3>${name}</h3><span>${bn(group.length)}টি ছোট পাঠ</span></div><div class="kl-lesson-grid">`;
    html += group.map(l => {
      const count = l.kanji.filter(k => studied(state.cards[k])).length;
      return `<article class="kl-lesson"><div class="kl-unit"><span>${book ? 'কাঞ্জি ইউনিট' : 'ধাপ'} ${bn(l.unit)}</span><span>${bn(l.kanji.length)} কাঞ্জি</span></div><h4>${esc(l.title)}</h4><div class="kl-lesson-glyphs" lang="ja">${l.kanji.map(esc).join('')}</div><progress value="${count}" max="${l.kanji.length}" aria-label="পাঠের অগ্রগতি"></progress><small>${bn(count)} / ${bn(l.kanji.length)} পড়া হয়েছে</small><button data-lesson="${l.id}">${count === l.kanji.length ? 'আবার অনুশীলন' : count ? 'পড়া চালিয়ে যান' : 'এই পাঠ শুরু করুন'} →</button></article>`;
    }).join('') + '</div>';
  }
  $('courseContent').innerHTML = html;
}
function chooseLesson() {
  return lessons.find(l => l.id === state.lastLesson[level] && l.kanji.some(k => !studied(state.cards[k]))) || lessons.find(l => l.kanji.some(k => !studied(state.cards[k]))) || lessons[0];
}
function startLesson(lesson) {
  if (!lesson || lesson.level !== level) return;
  const available = lesson.kanji.map(k => bank.find(r => r.k === k)).filter(Boolean);
  const fresh = available.filter(r => !studied(state.cards[r.k]));
  state.lastLesson[level] = lesson.id;
  persist();
  start((fresh.length ? fresh : available).slice(0, 5), 'learn', lesson.book ? `Minna ${lesson.book === 1 ? 'I' : 'II'} · কাঞ্জি ইউনিট ${bn(lesson.unit)}` : 'বইয়ের পরে আরও');
}
function start(rows, mode, caption) {
  rows = rows.filter(r => r.level === level);
  if (!rows.length) { toast('রিভিশন বাকি নেই। নতুন একটি পাঠ শুরু করুন।'); return; }
  session = {rows, mode, caption, index: 0, phase: mode === 'learn' ? 0 : 3, qi: 0, answers: 0, right: 0, locked: false, completed: false};
  $('studyCaption').textContent = level.toUpperCase() + ' · ' + caption;
  $('studyTitle').textContent = mode === 'learn' ? 'একটি কাঞ্জি, চারটি ধাপ' : 'মনে পড়ার রিভিশন';
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  renderSession();
}
function finish() {
  session.completed = true;
  stopWriting();
  $('studyTitle').textContent = 'আজকের ছোট পাঠ শেষ';
  $('sessionSteps').innerHTML = '';
  $('studyBody').innerHTML = `<div class="kl-result"><div class="kl-result-icon">✓</div><h3>${bn(session.right)} / ${bn(session.answers)} মনে পড়েছে</h3><p>${session.right === session.answers ? 'এবার বিরতি নিন। পরে আবার মনে পড়লে শেখাটা আরও শক্ত হবে।' : 'যেগুলো ভুল হয়েছে, সেগুলো ভুলের খাতা ও রিভিশনে পাওয়া যাবে।'}</p><p>একদিনের কুইজ শেষ করলেই স্থায়ীভাবে শেখা হয়েছে ধরা হয় না। দুই আলাদা দিনে অর্থ ও পড়ার পরীক্ষা দিন।</p></div>`;
  $('sessionFeedback').textContent = '';
  $('sessionProgress').textContent = `${bn(session.rows.length)}টি কাঞ্জির অনুশীলন`;
  $('nextStep').textContent = 'পাঠের তালিকায় ফিরুন';
  $('nextStep').disabled = false;
  stats();
}
function readingDisplay(values) { return values.length ? esc(values.slice(0, 4).join(' · ')) : 'এই কাঞ্জির জন্য নেই'; }
function renderSession() {
  stopWriting();
  renderToken++;
  if (session.index >= session.rows.length) { finish(); return; }
  const row = session.rows[session.index];
  session.locked = false;
  $('sessionFeedback').textContent = '';
  $('sessionProgress').textContent = `কাঞ্জি ${bn(session.index + 1)} / ${bn(session.rows.length)}`;
  const phases = ['১ চিনুন', '২ শব্দে পড়ুন', '৩ লিখুন', '৪ মনে করুন'];
  $('sessionSteps').innerHTML = phases.map((p, i) => `<span${i === session.phase ? ' class="active" aria-current="step"' : ''}>${p}</span>`).join('');
  $('nextStep').disabled = false;
  $('nextStep').textContent = ['শব্দগুলো পড়ুন →', 'লেখার অনুশীলন →', 'নিজেকে পরীক্ষা করুন →', 'পরের প্রশ্ন →'][session.phase];
  if (session.phase === 0) {
    $('studyBody').innerHTML = `<div class="kl-recall"><div class="kl-big" lang="ja">${esc(row.k)}</div><p class="kl-meaning">${esc(row.bn)}</p><p class="kl-body-note">${bn(row.strokeCount)}টি দাগ · আকৃতি দেখুন, অর্থ জোরে বলুন।</p>${row.memory ? `<div class="kl-memory"><b>মনে রাখার ছবি</b><br>${esc(row.memory)}</div>` : ''}<div class="kl-readings"><div><small>音読み · ধ্বনিভিত্তিক পড়া</small><b lang="ja">${readingDisplay(row.on)}</b></div><div><small>訓読み · জাপানি পড়া</small><b lang="ja">${readingDisplay(row.kun)}</b></div></div><p class="kl-body-note">訓読み-তে বিন্দুর পরের অংশ হিরাগানায় লেখা হয়। সব পড়া একসঙ্গে মুখস্থ নয়—পরের ধাপে পরিচিত শব্দে শিখুন।</p>${row.parts.length ? `<p class="kl-parts">আকৃতির অংশ: <span lang="ja">${row.parts.map(esc).join(' · ')}</span></p>` : ''}</div>`;
  } else if (session.phase === 1) {
    $('studyBody').innerHTML = `<p class="kl-body-note">ফুরিগানা দেখে পড়ুন। তারপর চোখ সরিয়ে শব্দের অর্থ বলুন।</p><div class="kl-word-list">${row.words.map(w => `<article class="kl-word"><ruby lang="ja">${esc(w.ja)}<rt>${esc(w.reading)}</rt></ruby><p>${esc(w.bn)}</p><button data-speak="${esc(w.reading)}" aria-label="${esc(w.ja)} শুনুন">▷ উচ্চারণ শুনুন</button></article>`).join('')}</div><div class="kl-explain"><b>শব্দের ভেতরে ${esc(row.k)}</b><br>${esc(row.words[0].ja)} → ${esc(row.words[0].reading)} → ${esc(row.words[0].bn)}। কাঞ্জির অর্থ আর পুরো শব্দের অর্থ এক নাও হতে পারে। শব্দটির পড়া আলাদা করে মনে রাখুন।</div>${row.examples.map(e => `<p class="kl-body-note"><span lang="ja">${esc(e.ja)}</span><br>${esc(e.reading)}<br>${esc(e.bn)}</p>`).join('')}`;
  } else if (session.phase === 2) {
    $('studyBody').innerHTML = `<p class="kl-body-note">আগে দাগের অ্যানিমেশন দেখুন। তারপর নীল বিন্দু থেকে দাগটি আঙুল দিয়ে লিখুন।</p><div class="kl-write-box"><svg id="writeSvg" viewBox="0 0 109 109" aria-label="${esc(row.k)} লেখার দাগ" role="img"></svg><canvas id="writeCanvas" aria-label="আঙুল দিয়ে কাঞ্জি লিখুন"></canvas></div><p id="writingProgress" class="kl-write-progress">দাগের তথ্য খুলছে…</p><div class="kl-write-tools"><button id="animateStrokes" disabled>▷ দাগের ক্রম দেখুন</button><button id="restartWriting" disabled>নিজে লিখুন</button><button id="hideGuide" disabled>গাইড লুকান</button></div>`;
    setupWriting(row, renderToken);
  } else {
    session.current = question(row, session.qi === 0 ? 'meaning' : 'reading', bank);
    const q = session.current;
    $('studyBody').innerHTML = `<div class="kl-quiz-prompt"><p>${q.kind === 'meaning' ? 'এই কাঞ্জির মূল অর্থ কোনটি?' : 'এই পুরো শব্দটি কীভাবে পড়বেন?'}</p><div class="kl-question-glyph" lang="ja">${esc(q.prompt)}</div><p>আগে নিজে মনে করুন, তারপর উত্তর বেছে নিন।</p></div><div class="kl-choice-list">${q.choices.map((choice, i) => `<button class="kl-choice" data-choice="${i}">${esc(choice)}</button>`).join('')}</div><div id="answerExplanation"></div>`;
    $('nextStep').disabled = true;
  }
  dialog.scrollTop = 0;
}
function answer(index) {
  if (!session || session.phase !== 3 || session.locked) return;
  const q = session.current;
  if (!Number.isInteger(index) || index < 0 || index >= q.choices.length) return;
  session.locked = true;
  const correct = q.choices[index] === q.answer;
  const row = session.rows[session.index];
  const now = Date.now();
  state.cards[row.k] = grade(state.cards[row.k], correct, q.kind, now);
  state.cards[row.k].level = row.level;
  if (!state.dates.includes(dayKey(now))) state.dates.push(dayKey(now));
  session.answers++;
  if (correct) session.right++;
  persist();
  for (const button of $('studyBody').querySelectorAll('[data-choice]')) {
    button.disabled = true;
    const chosen = q.choices[Number(button.dataset.choice)];
    button.classList.toggle('correct', chosen === q.answer);
    button.classList.toggle('wrong', Number(button.dataset.choice) === index && !correct);
  }
  $('sessionFeedback').textContent = correct ? 'ঠিক মনে পড়েছে। এবার শব্দটি একবার জোরে পড়ুন।' : 'এবার আবার শিখুন। ভুলটি রিভিশনের তালিকায় রাখা হয়েছে।';
  $('answerExplanation').innerHTML = `<div class="kl-explain"><b>সঠিক উত্তর: ${esc(q.answer)}</b><p><ruby lang="ja">${esc(q.word.ja)}<rt>${esc(q.word.reading)}</rt></ruby> — ${esc(q.word.bn)}</p><p>${esc(row.k)}-এর মূল অর্থ: ${esc(row.bn)}।</p><button data-speak="${esc(q.word.reading)}">▷ শব্দটি শুনুন</button></div>`;
  $('nextStep').disabled = false;
  $('nextStep').textContent = session.qi === 0 ? 'এবার শব্দের পড়া →' : 'পরের কাঞ্জি →';
  stats();
}
function next() {
  if (!session) return;
  if (session.completed) { dialog.close(); return; }
  if (session.phase === 3) {
    if (!session.locked) return;
    if (session.qi === 0) session.qi = 1;
    else { session.index++; session.qi = 0; session.phase = session.mode === 'learn' ? 0 : 3; }
  } else session.phase++;
  renderSession();
}

async function setupWriting(row, token) {
  try {
    if (!pathsData) {
      const response = await fetch(`/assets/data/kanji-lab/strokes-${level}.json?v=20261012.2`);
      if (!response.ok) throw Error('stroke data unavailable');
      pathsData = (await response.json()).strokes;
    }
    if (token !== renderToken || !dialog.open) return;
    const paths = pathsData[row.k];
    if (!Array.isArray(paths) || !paths.length) throw Error('missing strokes');
    const svg = $('writeSvg'), canvas = $('writeCanvas');
    svg.innerHTML = `<path class="kl-write-grid" d="M0 54.5H109M54.5 0V109M0 0L109 109M109 0L0 109"/>` + paths.map(d => `<path class="kl-stroke" d="${esc(d)}" fill="none" stroke="#d8e1d6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join('') + '<circle id="strokeStart" r="2.4" fill="#347762"/><text id="strokeNumber" font-size="6" fill="#20523c"></text>';
    const elements = [...svg.querySelectorAll('.kl-stroke')];
    const samples = elements.map(path => { const length = path.getTotalLength(); return {length, points: Array.from({length: 33}, (_, i) => path.getPointAtLength(length * i / 32))}; });
    const size = 436 * Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(size / 109, 0, 0, size / 109, 0, 0);
    ctx.strokeStyle = '#2c7154'; ctx.lineWidth = 2.8; ctx.lineCap = ctx.lineJoin = 'round';
    let index = 0, drawing = false, points = [], guide = true, animating = false, cancelled = false, timers = [], activePointer = null;
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const coordinate = event => { const rect = canvas.getBoundingClientRect(); return {x: (event.clientX - rect.left) * 109 / rect.width, y: (event.clientY - rect.top) * 109 / rect.height}; };
    const progress = () => {
      elements.forEach((p, i) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.setAttribute('stroke', i < index ? '#347762' : i === index && guide ? '#80a8ff' : guide ? '#d8e1d6' : 'transparent'); });
      const start = $('strokeStart'), number = $('strokeNumber');
      if (index < samples.length && guide) {
        const p = samples[index].points[0]; start.setAttribute('cx', p.x); start.setAttribute('cy', p.y); start.style.display = '';
        number.setAttribute('x', Math.max(4, p.x - 7)); number.setAttribute('y', Math.max(7, p.y - 4)); number.textContent = String(index + 1); number.style.display = '';
      } else { start.style.display = 'none'; number.style.display = 'none'; }
      $('writingProgress').textContent = index === elements.length ? 'সব দাগ লিখেছেন ✓ গাইড লুকিয়ে আবার লিখে দেখুন।' : `দাগ ${bn(index + 1)} / ${bn(elements.length)} · নীল বিন্দু থেকে শুরু করুন`;
    };
    const reset = () => { index = 0; animating = false; timers.forEach(clearTimeout); timers = []; elements.forEach(p => p.style.transition = ''); ctx.clearRect(0, 0, 109, 109); progress(); };
    const down = event => {
      if (animating || index >= samples.length || event.isPrimary === false) return;
      activePointer = event.pointerId; drawing = true; points = [coordinate(event)];
      canvas.setPointerCapture(event.pointerId); ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
    };
    const move = event => { if (!drawing || event.pointerId !== activePointer) return; const p = coordinate(event); points.push(p); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const up = event => {
      if (!drawing || event.pointerId !== activePointer) return;
      drawing = false; activePointer = null;
      const target = samples[index];
      const last = coordinate(event); points.push(last);
      const length = points.slice(1).reduce((n, p, i) => n + distance(p, points[i]), 0);
      const error = points.reduce((n, p) => n + Math.min(...target.points.map(t => distance(p, t))), 0) / points.length;
      const valid = points.length > 3 && length > target.length * .45 && length < target.length * 1.9 && distance(points[0], target.points[0]) < 17 && distance(last, target.points.at(-1)) < 19 && error < 11;
      ctx.clearRect(0, 0, 109, 109);
      if (valid) { index++; $('sessionFeedback').textContent = 'দাগের দিক ও আকৃতি মিলে গেছে।'; }
      else $('sessionFeedback').textContent = 'দাগটি আবার চেষ্টা করুন। নীল বিন্দু থেকে শুরু করে দাগের শেষ পর্যন্ত লিখুন।';
      progress();
    };
    const cancel = () => { drawing = false; activePointer = null; ctx.clearRect(0, 0, 109, 109); };
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', cancel);
    $('restartWriting').onclick = reset;
    $('hideGuide').onclick = () => { guide = !guide; $('hideGuide').textContent = guide ? 'গাইড লুকান' : 'গাইড দেখান'; progress(); };
    $('animateStrokes').onclick = () => {
      reset(); animating = true;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tick = i => {
        if (cancelled) return;
        if (i >= elements.length) { animating = false; index = 0; progress(); return; }
        const p = elements[i], length = samples[i].length;
        p.style.transition = 'none'; p.style.strokeDasharray = String(length); p.style.strokeDashoffset = String(length); p.setAttribute('stroke', '#347762');
        p.getBoundingClientRect();
        p.style.transition = reduced ? '' : 'stroke-dashoffset 480ms linear'; p.style.strokeDashoffset = '0';
        $('writingProgress').textContent = `দাগের ক্রম: ${bn(i + 1)} / ${bn(elements.length)}`;
        timers.push(setTimeout(() => tick(i + 1), reduced ? 130 : 650));
      };
      tick(0);
    };
    ['animateStrokes', 'restartWriting', 'hideGuide'].forEach(id => $(id).disabled = false);
    stopWriting = () => { cancelled = true; timers.forEach(clearTimeout); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', cancel); };
    progress();
  } catch (_error) {
    if (token !== renderToken) return;
    $('writingProgress').textContent = 'দাগের তথ্য এখন খুলছে না। এই ধাপ পরে আবার করতে পারবেন।';
  }
}

function speak(text) {
  if (!('speechSynthesis' in window)) { toast('এই ব্রাউজারে উচ্চারণের সুবিধা নেই। ফুরিগানা দেখে পড়ুন।'); return; }
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice = voices.find(v => v.lang.startsWith('ja'));
  if (voices.length && !voice) { toast('জাপানি voice পাওয়া যায়নি। ফোনের Text-to-speech সেটিংসে জাপানি voice যোগ করুন।'); return; }
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP'; utterance.rate = .82;
  if (voice) utterance.voice = voice;
  utterance.onerror = () => toast('উচ্চারণ চালু হয়নি। ফুরিগানা দেখে শব্দটি পড়ুন।');
  synth.speak(utterance);
}

dialog.addEventListener('close', () => { renderToken++; stopWriting(); session = null; document.body.style.overflow = ''; window.speechSynthesis?.cancel(); if (course) renderHome(); });
$('closeStudy').addEventListener('click', () => dialog.close());
$('nextStep').addEventListener('click', next);
$('studyBody').addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.hasAttribute('data-choice')) answer(Number(button.dataset.choice)); if (button.dataset.speak) speak(button.dataset.speak); });
$('courseContent').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.lesson) startLesson(lessons.find(l => l.id === button.dataset.lesson));
  if (button.dataset.open) start([bank.find(r => r.k === button.dataset.open)].filter(Boolean), 'learn', 'নিজের পছন্দের কাঞ্জি');
});
$('kanjiSearch').addEventListener('input', () => course && renderHome());
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  view = button.dataset.view;
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  if (course) renderHome();
}));
$('continueButton').addEventListener('click', () => startLesson(chooseLesson()));
$('reviewButton').addEventListener('click', () => start(dueRows(bank, state).slice(0, 15), 'review', 'আজকের রিভিশন'));
$('levelName').textContent = level.toUpperCase();
document.title = `${level.toUpperCase()} কাঞ্জি শেখার পথ | আপনার নিহোন`;
document.querySelector(`[data-level="${level}"]`).setAttribute('aria-current', 'page');

async function load() {
  try {
    const response = await fetch(`/assets/data/kanji-lab/${level}.json?v=20261012.2`);
    if (!response.ok) throw Error('course unavailable');
    course = await response.json(); bank = rowsForLevel(course, level); lessons = lessonsForLevel(course, level);
    if (!bank.length || !lessons.length) throw Error('course empty');
    state = readState(storage, course); persist();
    $('continueButton').disabled = $('reviewButton').disabled = false;
    renderHome();
  } catch (_error) {
    course = null;
    $('courseContent').innerHTML = '<div class="kl-empty">পাঠ খুলতে সমস্যা হচ্ছে। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।<br><button id="retryCourse">আবার খুলুন</button></div>';
    $('retryCourse').addEventListener('click', load, {once: true});
  }
}
load();
