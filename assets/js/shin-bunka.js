/* Progressive enhancement: all lessons and model answers remain usable without JS. */
(() => {
  'use strict';
  const KEY = 'aponar-nihon:shin-bunka-ii:v1';
  const valid = (n) => Number.isInteger(n) && n >= 19 && n <= 36;
  let state = { done: [], ruby: true, last: 19 };
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
      state.done = [...new Set(Array.isArray(saved.done) ? saved.done.filter(valid) : [])];
      state.ruby = saved.ruby !== false;
      state.last = valid(saved.last) ? saved.last : 19;
    }
  } catch { storageAvailable = false; }
  const bn = (n) => String(n).replace(/[0-9]/g, (c) => '০১২৩৪৫৬৭৮৯'[Number(c)]);
  const normalize = (text) => text.normalize('NFKC').toLowerCase().replace(/[০-৯]/g, (c) => String('০১২৩৪৫৬৭৮৯'.indexOf(c))).trim();
  const lesson = Number(document.body.dataset.sbLesson);
  const storageNotice = () => document.querySelectorAll('.sb-storage').forEach((el) => {
    el.textContent = storageAvailable ? '' : 'ব্রাউজারে অগ্রগতি রাখা যাচ্ছে না। এই পৃষ্ঠা খোলা থাকা পর্যন্ত পরিবর্তন কাজ করবে।';
  });
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; }
    catch { storageAvailable = false; }
    storageNotice();
  };
  const cards = [...document.querySelectorAll('[data-sb-card]')];
  const search = document.getElementById('sb-search');
  const filter = document.getElementById('sb-filter');
  function applyFilter() {
    const query = normalize(search?.value || '');
    const terms = query.split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach((card) => {
      const isDone = state.done.includes(Number(card.dataset.sbCard));
      const matchesStatus = !filter || filter.value === 'all' || (filter.value === 'done' ? isDone : !isDone);
      const matchesQuery = terms.every((term) => normalize(card.dataset.search).includes(term));
      card.hidden = !(matchesStatus && matchesQuery);
      if (!card.hidden) count += 1;
    });
    const results = document.getElementById('sb-results');
    if (results) results.textContent = `${bn(count)}টি লেসন`;
    const empty = document.getElementById('sb-empty');
    if (empty) empty.hidden = count > 0;
  }
  function renderState() {
    document.body.classList.toggle('sb-hide-ruby', !state.ruby);
    const ruby = document.getElementById('sb-ruby');
    if (ruby) {
      ruby.hidden = false;
      ruby.setAttribute('aria-pressed', String(state.ruby));
      ruby.textContent = `ফুরিগানা: ${state.ruby ? 'চালু' : 'বন্ধ'}`;
    }
    document.querySelectorAll('[data-sb-complete]').forEach((button) => {
      const done = state.done.includes(Number(button.dataset.sbComplete));
      button.hidden = false;
      button.setAttribute('aria-pressed', String(done));
      button.textContent = done ? '✓ পড়া শেষ · আবার বাকি রাখুন' : 'পড়া শেষ চিহ্নিত করুন';
    });
    cards.forEach((card) => {
      const done = state.done.includes(Number(card.dataset.sbCard));
      card.classList.toggle('is-complete', done);
      card.querySelector('.sb-card-status').textContent = done ? '✓ পড়া শেষ' : 'পড়ার জন্য প্রস্তুত';
    });
    const progress = document.getElementById('sb-progress');
    if (progress) progress.value = state.done.length;
    const label = document.getElementById('sb-progress-label');
    if (label) label.textContent = `১৮টির মধ্যে ${bn(state.done.length)}টি পড়া শেষ`;
    const resume = document.getElementById('sb-resume');
    if (resume) {
      const next = !state.done.includes(state.last) ? state.last : Array.from({ length: 18 }, (_, i) => i + 19).find((n) => !state.done.includes(n));
      resume.href = `n4-shin-bunka-lesson-${next || 19}.html`;
      resume.textContent = next ? `লেসন ${bn(next)} পড়ুন →` : 'সব পড়া শেষ · আবার পড়ুন →';
    }
    applyFilter();
    storageNotice();
  }
  if (valid(lesson)) { state.last = lesson; save(); }
  document.querySelectorAll('[data-sb-complete]').forEach((button) => button.addEventListener('click', () => {
    const n = Number(button.dataset.sbComplete);
    if (!valid(n)) return;
    state.done = state.done.includes(n) ? state.done.filter((x) => x !== n) : [...state.done, n];
    save(); renderState();
  }));
  document.getElementById('sb-ruby')?.addEventListener('click', () => { state.ruby = !state.ruby; save(); renderState(); });
  search?.addEventListener('input', applyFilter);
  filter?.addEventListener('change', applyFilter);
  document.getElementById('sb-clear')?.addEventListener('click', () => { search.value = ''; filter.value = 'all'; applyFilter(); search.focus(); });
  document.querySelector('.sb-filters')?.removeAttribute('hidden');
  renderState();
})();
