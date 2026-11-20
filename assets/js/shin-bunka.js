/* The revised edition has its own progress. Old lesson numbers are incompatible. */
(() => {
  'use strict';
  const KEY = 'aponar-nihon:bunka-ii-revised:v2';
  const EDITION = 'bunka-ii-revised-2013';
  const FIRST = 19;
  const LAST = 34;
  const TOTAL = LAST - FIRST + 1;
  const valid = (n) => Number.isInteger(n) && n >= FIRST && n <= LAST;
  const state = { edition: EDITION, done: [], ruby: true, last: FIRST, large: false, topics: {} };
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object' && saved.edition === EDITION) {
      state.done = [...new Set(Array.isArray(saved.done) ? saved.done.filter(valid) : [])];
      state.ruby = saved.ruby !== false;
      state.last = valid(saved.last) ? saved.last : FIRST;
      state.large = saved.large === true;
      if (saved.topics && typeof saved.topics === 'object') {
        for (const [n, index] of Object.entries(saved.topics)) {
          if (valid(Number(n)) && Number.isInteger(index) && index >= 1 && index <= 20) state.topics[n] = index;
        }
      }
    } else {
      // A reading preference is safe to retain; completion and last lesson are not.
      const old = JSON.parse(localStorage.getItem('aponar-nihon:shin-bunka-ii:v1') || 'null');
      if (old?.ruby === false) state.ruby = false;
    }
  } catch { storageAvailable = false; }
  const bn = (n) => String(n).replace(/[0-9]/g, (c) => '০১২৩৪৫৬৭৮৯'[Number(c)]);
  function dynT(k,v){if(window.AponarDyn)return window.AponarDyn(k,v);var s=dynT._b[k]||k;if(v)for(var x in v)s=s.split("{"+x+"}").join(v[x]);return s;}dynT._b={"sb.storageWarn": "ব্রাউজারে অগ্রগতি রাখা যাচ্ছে না। এই পৃষ্ঠা খোলা থাকা পর্যন্ত পরিবর্তন কাজ করবে।", "sb.lessons": "{n}টি লেসন", "sb.furiganaOn": "ফুরিগানা: চালু", "sb.furiganaOff": "ফুরিগানা: বন্ধ", "sb.textNormal": "পাঠের লেখা স্বাভাবিক করুন", "sb.textBigger": "পাঠের লেখা বড় করুন", "sb.aMinus": "অ −", "sb.aPlus": "অ +", "sb.readDoneToggle": "✓ পড়া শেষ · আবার বাকি রাখুন", "sb.markRead": "পড়া শেষ চিহ্নিত করুন", "sb.readDone": "✓ পড়া শেষ", "sb.continueReading": "পড়া চালিয়ে যান", "sb.notStarted": "শুরু হয়নি", "sb.progress": "{total}টির মধ্যে {done}টি পড়া শেষ", "sb.readLesson": "লেসন {n} পড়ুন →", "sb.reread": "সব পড়া শেষ · আবার পড়ুন →", "sb.topicOf": "বিষয় {a} / {b}", "sb.finishLesson": "লেসন শেষ করুন ✓", "sb.nextTopic": "পরের বিষয় →"};function dynLang(){return window.AponarDynLang?window.AponarDynLang():'bn';}function num(v){return dynLang()==='bn'?bn(v):String(v);}
  const normalize = (text) => String(text).normalize('NFKC').toLowerCase().replace(/[০-৯]/g, (c) => String('০১২৩৪৫৬৭৮৯'.indexOf(c))).trim();
  const lesson = Number(document.body.dataset.sbLesson);
  const cards = [...document.querySelectorAll('[data-sb-card]')];
  const search = document.getElementById('sb-search');
  const filter = document.getElementById('sb-filter');
  const panels = [...document.querySelectorAll('.sb-pattern')];
  const topicLinks = [...document.querySelectorAll('[data-sb-topic]')];
  let active = 1;

  function storageNotice() {
    document.querySelectorAll('.sb-storage').forEach((el) => {
      el.textContent = storageAvailable ? '' : dynT('sb.storageWarn');
    });
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; }
    catch { storageAvailable = false; }
    storageNotice();
  }
  function applyFilter() {
    const terms = normalize(search?.value || '').split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach((card) => {
      const done = state.done.includes(Number(card.dataset.sbCard));
      const statusMatches = !filter || filter.value === 'all' || (filter.value === 'done' ? done : !done);
      card.hidden = !(statusMatches && terms.every((term) => normalize(card.dataset.search).includes(term)));
      if (!card.hidden) count += 1;
    });
    const result = document.getElementById('sb-results');
    if (result) result.textContent = dynT('sb.lessons', {n: num(count)});
    const empty = document.getElementById('sb-empty');
    if (empty) empty.hidden = count > 0;
  }
  function renderState() {
    document.body.classList.toggle('sb-hide-ruby', !state.ruby);
    document.body.classList.toggle('sb-large-text', state.large);
    const ruby = document.getElementById('sb-ruby');
    if (ruby) {
      ruby.hidden = false;
      ruby.setAttribute('aria-pressed', String(state.ruby));
      ruby.textContent = state.ruby ? dynT('sb.furiganaOn') : dynT('sb.furiganaOff');
    }
    const size = document.getElementById('sb-text-size');
    if (size) {
      size.hidden = false;
      size.setAttribute('aria-pressed', String(state.large));
      size.setAttribute('aria-label', state.large ? dynT('sb.textNormal') : dynT('sb.textBigger'));
      size.textContent = state.large ? dynT('sb.aMinus') : dynT('sb.aPlus');
    }
    document.querySelectorAll('[data-sb-complete]').forEach((button) => {
      const done = state.done.includes(Number(button.dataset.sbComplete));
      button.hidden = false;
      button.setAttribute('aria-pressed', String(done));
      button.textContent = done ? dynT('sb.readDoneToggle') : dynT('sb.markRead');
    });
    cards.forEach((card) => {
      const done = state.done.includes(Number(card.dataset.sbCard));
      card.classList.toggle('is-complete', done);
      const label = card.querySelector('.sb-card-status');
      if (label) label.textContent = done ? dynT('sb.readDone') : (Number(card.dataset.sbCard) === state.last ? dynT('sb.continueReading') : dynT('sb.notStarted'));
    });
    const progress = document.getElementById('sb-progress');
    if (progress) { progress.value = state.done.length; progress.setAttribute('value', String(state.done.length)); }
    const label = document.getElementById('sb-progress-label');
    if (label) label.textContent = dynT('sb.progress', {total: num(TOTAL), done: num(state.done.length)});
    const percent = document.getElementById('sb-progress-percent');
    if (percent) percent.textContent = `${num(Math.round(state.done.length / TOTAL * 100))}%`;
    const resume = document.getElementById('sb-resume');
    if (resume) {
      const next = !state.done.includes(state.last) ? state.last : Array.from({ length: TOTAL }, (_, i) => FIRST + i).find((n) => !state.done.includes(n));
      resume.href = `n4-shin-bunka-lesson-${next || FIRST}.html`;
      resume.textContent = next ? dynT('sb.readLesson', {n: num(next)}) : dynT('sb.reread');
    }
    applyFilter();
    storageNotice();
  }
  function showTopic(index, { updateHash = false, focus = false } = {}) {
    if (!panels.length) return;
    active = Math.max(1, Math.min(panels.length, index));
    panels.forEach((panel, i) => { panel.hidden = i + 1 !== active; });
    topicLinks.forEach((link) => {
      if (Number(link.dataset.sbTopic) === active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const label = document.getElementById('sb-active-label');
    if (label) label.textContent = dynT('sb.topicOf', {a: num(active), b: num(panels.length)});
    const previous = document.getElementById('sb-topic-prev');
    if (previous) previous.disabled = active === 1;
    const next = document.getElementById('sb-topic-next');
    if (next) next.textContent = active === panels.length ? dynT('sb.finishLesson') : dynT('sb.nextTopic');
    state.topics[lesson] = active;
    save();
    if (updateHash) {
      try { history.replaceState(null, '', `#grammar-${active}`); } catch { /* Reading still works. */ }
    }
    if (focus) {
      const heading = panels[active - 1].querySelector('h2');
      heading?.focus({ preventScroll: true });
      panels[active - 1].scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }
  const hashTopic = () => {
    const match = location.hash.match(/^#grammar-(\d+)$/);
    return match ? Number(match[1]) : null;
  };
  if (valid(lesson)) { state.last = lesson; save(); }
  if (panels.length) {
    document.querySelector('.sb-pattern-navigation')?.removeAttribute('hidden');
    showTopic(hashTopic() || state.topics[lesson] || 1);
    topicLinks.forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      showTopic(Number(link.dataset.sbTopic), { updateHash: true, focus: true });
    }));
    document.getElementById('sb-topic-prev')?.addEventListener('click', () => showTopic(active - 1, { updateHash: true, focus: true }));
    document.getElementById('sb-topic-next')?.addEventListener('click', () => {
      if (active < panels.length) showTopic(active + 1, { updateHash: true, focus: true });
      else {
        document.querySelector('.sb-finish')?.scrollIntoView({ block: 'center', behavior: 'auto' });
        document.querySelector('[data-sb-complete]')?.focus({ preventScroll: true });
      }
    });
    window.addEventListener('hashchange', () => { if (hashTopic()) showTopic(hashTopic()); });
  }
  document.querySelectorAll('[data-sb-complete]').forEach((button) => button.addEventListener('click', () => {
    const n = Number(button.dataset.sbComplete);
    if (!valid(n)) return;
    state.done = state.done.includes(n) ? state.done.filter((x) => x !== n) : [...state.done, n];
    save(); renderState();
  }));
  document.getElementById('sb-ruby')?.addEventListener('click', () => { state.ruby = !state.ruby; save(); renderState(); });
  document.getElementById('sb-text-size')?.addEventListener('click', () => { state.large = !state.large; save(); renderState(); });
  search?.addEventListener('input', applyFilter);
  filter?.addEventListener('change', applyFilter);
  document.getElementById('sb-clear')?.addEventListener('click', () => {
    if (search) search.value = '';
    if (filter) filter.value = 'all';
    applyFilter(); search?.focus();
  });
  document.querySelector('.sb-filters')?.removeAttribute('hidden');
  renderState();
})();
