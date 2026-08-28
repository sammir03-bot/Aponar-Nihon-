(function () {
  'use strict';

  const rules = Array.isArray(window.N3_MATOME_RULES) ? window.N3_MATOME_RULES : [];
  const weekInfo = {
    1: ['কাজের দৃষ্টিভঙ্গি ও ように পরিবার', 'Passive • causative permission • casual forms • intention'],
    2: ['সীমা, topic ও quote-এর পরিবার', 'ばかり • particles • noun-box • という family • reported speech'],
    3: ['শর্ত, সময়ের মুহূর্ত ও অবস্থা', 'concession • role • expectation • とたん • まま • feelings'],
    4: ['দৃষ্টিভঙ্গি, কারণ ও সিদ্ধান্ত', 'にとって • おかげ／せい • comparison • こと • conclusion'],
    5: ['বাড়ানো, শেষ করা ও সংযোগ', 'not only • completion • wishes • range • sentence connectors'],
    6: ['Hypothesis, সিদ্ধান্ত ও わけ পরিবার', 'もし • ことにする／なる • discovery • わけ • strong negatives']
  };

  const comparisons = [
    ['みたい vs らしい vs っぽい', [
      ['〜みたい', 'চোখে দেখা/অনুমান বা সরাসরি মিল; casual—「雨みたい」。'],
      ['〜らしい', 'সত্যিকারের expected বৈশিষ্ট্য—「春らしい日」。'],
      ['〜っぽい', 'surface tendency বা প্রবণতা; প্রায়ই negative—「忘れっぽい」。']
    ]],
    ['ようにする vs ようになる vs ように', [
      ['〜ようにする', 'নিজে সচেতন চেষ্টা/অভ্যাস বানাই।'],
      ['〜ようになる', 'ক্ষমতা/অভ্যাস বাস্তবে বদলে গেছে।'],
      ['〜ように（目的）', 'অন্য action করি যাতে কাঙ্ক্ষিত ফল ঘটে।']
    ]],
    ['について vs に関して vs に対して vs にとって', [
      ['〜について', 'কোন topic সম্পর্কে কথা/লেখা/পড়া।'],
      ['〜に関して', 'একই “সম্পর্কে”, তবে formal ও field-focused।'],
      ['〜に対して', 'কার প্রতি action অথবা A-এর বিপরীতে B।'],
      ['〜にとって', 'কার viewpoint-এ বিষয়টি কেমন।']
    ]],
    ['ばかり vs だけしか vs さえ vs こそ', [
      ['〜ばかり', 'একই জিনিস অতিরিক্ত—প্রায়ই অভিযোগ।'],
      ['〜だけしか〜ない', 'এইটুকুই, আর কিছু নেই; শেষে negative।'],
      ['〜さえ', 'এমনকি সবচেয়ে extreme জিনিসও।'],
      ['〜こそ', 'ঠিক এটিই—strong spotlight।']
    ]],
    ['とたん vs 最中 vs たところ vs ところだった', [
      ['〜たとたん', 'A শেষ হতেই আকস্মিক B।'],
      ['〜最中に', 'A-র active মাঝখানে interruption B।'],
      ['〜たところ', 'A করে দেখলাম/জানলাম result B।'],
      ['〜るところだった', 'আর একটু হলেই A হতো, কিন্তু হয়নি।']
    ]],
    ['まま vs っぱなし vs かけ vs 切る', [
      ['〜まま', 'অবস্থা নিরপেক্ষভাবে না বদলানো।'],
      ['〜っぱなし', 'ফেলে রাখা/একটানা; neglect বা burden।'],
      ['〜かけ', 'শুরু হয়েছে, completion-এর আগে থেমেছে।'],
      ['〜切る', 'পুরো finish line পর্যন্ত সম্পূর্ণ।']
    ]],
    ['おかげで vs せいで vs そのため', [
      ['〜おかげで', 'ভালো ফল; কৃতজ্ঞতা।'],
      ['〜せいで', 'খারাপ ফল; blame।'],
      ['そのため', 'আগের objective কারণ থেকে formal ফল।']
    ]],
    ['はず vs わけ—এক নজরে', [
      ['〜はずだ', 'Clue অনুযায়ী এমন হওয়ার কথা।'],
      ['〜わけだ', 'Clue বুঝে “তাই তো/তার মানে” conclusion।'],
      ['〜わけがない', 'Logic অনুযায়ী একেবারেই অসম্ভব।'],
      ['〜わけにはいかない', 'সম্ভব হলেও duty/morality-র কারণে করা যায় না।']
    ]],
    ['ことになる vs ことにする', [
      ['〜ことになる', 'বাইরের সিদ্ধান্ত/নিয়মে ঠিক হয়।'],
      ['〜ことにする', 'নিজে সিদ্ধান্ত নিই।'],
      ['〜ことになっている', 'বর্তমান নিয়ম/ব্যবস্থা।'],
      ['〜ことにしている', 'নিজের নিয়মিত নীতি/অভ্যাস।']
    ]],
    ['くらい vs ほど vs ば〜ほど', [
      ['〜くらい／ぐらい', 'কথ্য “এই পরিমাণ/এতটা” degree।'],
      ['〜ほど', 'Scale/benchmark ধরে degree বা comparison।'],
      ['〜ば〜ほど', 'A যত বাড়ে, B তত proportional বদলায়।'],
      ['〜ほど〜ない', 'A-র মতো এত নয়, বা A-র মতো আর কিছু নেই—গঠন দেখো।']
    ]],
    ['Connector map: কারণ, উল্টো, topic বদল', [
      ['ですから', 'Reason → expected result।'],
      ['ところが', 'Expectation → unexpected opposite।'],
      ['ところで', 'আগের topic শেষ → নতুন topic।'],
      ['その上', 'একই direction-এ আরও information।']
    ]],
    ['Negative strength map', [
      ['決して〜ない', 'দৃঢ় প্রতিজ্ঞা: কখনোই না।'],
      ['まったく〜ない', 'পরিমাণ/বোঝা একেবারে zero।'],
      ['めったに〜ない', 'Frequency খুব কম।'],
      ['少しも〜ない', 'সামান্য একটুও নয়।']
    ]]
  ];

  const els = {
    list: document.getElementById('ruleList'),
    weeks: document.getElementById('weekGrid'),
    compare: document.getElementById('compareGrid'),
    q: document.getElementById('q'),
    weekSelect: document.getElementById('weekSelect'),
    undone: document.getElementById('undone'),
    reset: document.getElementById('resetFilter'),
    count: document.getElementById('resultCount'),
    progress: document.getElementById('progress'),
    progressText: document.getElementById('progressText'),
    empty: document.getElementById('empty'),
    theme: document.getElementById('themeToggle'),
    backTop: document.getElementById('backTop')
  };
  const doneKey = 'n3MatomeDoneV1';
  const themeKey = 'n3MatomeTheme';
  let selectedWeek = 'all';
  let onlyUndone = false;
  let done = loadDone();
  let cards = [];

  function loadDone() {
    try { return new Set(JSON.parse(localStorage.getItem(doneKey) || '[]').map(Number)); }
    catch (_) { return new Set(); }
  }

  function saveDone() {
    localStorage.setItem(doneKey, JSON.stringify([...done].sort((a,b) => a-b)));
    updateProgress();
  }

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderWeeks() {
    const all = node('button', 'week-card active');
    all.type = 'button';
    all.dataset.week = '0';
    all.append(node('span', 'week-kicker', 'সব সপ্তাহ'));
    all.append(node('b', '', '১৩২টি Rule একসাথে'));
    all.append(node('p', '', 'Search বা filter দিয়ে প্রয়োজনের grammar খুঁজুন।'));
    all.append(node('small', '', '36 দিন • পূর্ণ revision'));
    all.addEventListener('click', () => setWeek('all', true));
    els.weeks.append(all);

    Object.entries(weekInfo).forEach(([week, info]) => {
      const count = rules.filter(rule => String(rule[1]) === week).length;
      const button = node('button', 'week-card');
      button.type = 'button';
      button.dataset.week = week;
      button.append(node('span', 'week-kicker', `Week ${week}`));
      button.append(node('b', '', info[0]));
      button.append(node('p', '', info[1]));
      button.append(node('small', '', `6 দিন • ${count}টি Rule`));
      button.addEventListener('click', () => setWeek(week, true));
      els.weeks.append(button);
    });
  }

  function renderComparisons() {
    comparisons.forEach((comparison, index) => {
      const details = node('details', 'compare-card');
      if (index < 2) details.open = true;
      const summary = node('summary', '', comparison[0]);
      const body = node('div', 'compare-body');
      comparison[1].forEach(item => {
        const row = node('div', 'compare-row');
        row.append(node('b', '', item[0]), node('span', '', item[1]));
        body.append(row);
      });
      details.append(summary, body);
      els.compare.append(details);
    });
  }

  function makeRuleCard(rule) {
    const [id, week, day, pattern, form, meaning, memory, japanese, bangla] = rule;
    const article = node('article', 'rule-card');
    article.id = `matome-rule-${id}`;
    article.dataset.week = String(week);
    article.dataset.day = String(day);
    article.dataset.id = String(id);
    article.dataset.search = rule.slice(3).join(' ').toLocaleLowerCase();

    const top = node('div', 'rule-top');
    top.append(node('span', 'rule-no', String(id).padStart(3, '0')));
    const title = node('div', 'rule-title');
    title.append(node('h3', '', pattern), node('small', '', `Week ${week} • Day ${day}`));
    const doneLabel = node('label', 'done-wrap');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = done.has(id);
    checkbox.setAttribute('aria-label', `${pattern} শেখা হয়েছে`);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) done.add(id); else done.delete(id);
      saveDone();
      if (onlyUndone) applyFilters();
    });
    doneLabel.append(checkbox, document.createTextNode(' শেখা'));
    top.append(title, doneLabel);

    const body = node('div', 'rule-body');
    body.append(node('div', 'formula', `গঠন: ${form}`));
    body.append(node('p', 'meaning', meaning));
    body.append(node('p', 'memory', memory));
    const example = node('div', 'example');
    example.append(node('div', 'example-jp', japanese), node('div', 'example-bn', bangla));
    body.append(example);
    article.append(top, body);
    return article;
  }

  function renderRules() {
    for (let week = 1; week <= 6; week += 1) {
      for (let day = 1; day <= 6; day += 1) {
        const dayRules = rules.filter(rule => rule[1] === week && rule[2] === day);
        const group = node('section', 'day-group');
        group.dataset.week = String(week);
        group.dataset.day = String(day);
        group.id = `week-${week}-day-${day}`;
        const heading = node('div', 'day-heading');
        heading.append(node('b', '', `Week ${week} • Day ${day}`), node('span', '', `${dayRules.length}টি Rule • একসাথে compare করুন`));
        const grid = node('div', 'rule-grid');
        dayRules.forEach(rule => grid.append(makeRuleCard(rule)));
        group.append(heading, grid);
        els.list.append(group);
      }
    }
    cards = [...els.list.querySelectorAll('.rule-card')];
  }

  function setWeek(week, shouldScroll) {
    selectedWeek = String(week);
    els.weekSelect.value = selectedWeek;
    els.weeks.querySelectorAll('.week-card').forEach(card => {
      card.classList.toggle('active', selectedWeek === 'all' ? card.dataset.week === '0' : card.dataset.week === selectedWeek);
    });
    applyFilters();
    if (shouldScroll) document.getElementById('rules').scrollIntoView({behavior:'smooth', block:'start'});
  }

  function applyFilters() {
    const term = els.q.value.trim().toLocaleLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const id = Number(card.dataset.id);
      const match = (selectedWeek === 'all' || card.dataset.week === selectedWeek)
        && (!term || card.dataset.search.includes(term))
        && (!onlyUndone || !done.has(id));
      card.classList.toggle('hidden', !match);
      if (match) visible += 1;
    });
    els.list.querySelectorAll('.day-group').forEach(group => {
      group.classList.toggle('hidden', !group.querySelector('.rule-card:not(.hidden)'));
    });
    els.count.textContent = `${visible}টি Rule দেখা যাচ্ছে`;
    els.empty.classList.toggle('show', visible === 0);
    els.undone.classList.toggle('active', onlyUndone);
  }

  function updateProgress() {
    els.progress.max = rules.length;
    els.progress.value = done.size;
    els.progressText.textContent = `${done.size} / ${rules.length} শেখা • ${rules.length - done.size} বাকি`;
  }

  function setupControls() {
    els.q.addEventListener('input', applyFilters);
    els.q.addEventListener('keydown', event => {
      if (event.key === 'Escape') { els.q.value = ''; applyFilters(); }
    });
    els.weekSelect.addEventListener('change', event => setWeek(event.target.value, true));
    els.undone.addEventListener('click', () => { onlyUndone = !onlyUndone; applyFilters(); });
    els.reset.addEventListener('click', () => {
      els.q.value = '';
      onlyUndone = false;
      setWeek('all', false);
      els.q.focus();
    });
    document.addEventListener('keydown', event => {
      if (event.key === '/' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) {
        event.preventDefault(); els.q.focus();
      }
    });
  }

  function setupTheme() {
    const saved = localStorage.getItem(themeKey);
    const initial = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const apply = theme => {
      document.body.dataset.theme = theme;
      els.theme.textContent = theme === 'dark' ? '☀ Light' : '☾ Dark';
    };
    apply(initial);
    els.theme.addEventListener('click', () => {
      const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(themeKey, next); apply(next);
    });
  }

  function setupBackTop() {
    els.backTop.addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));
    addEventListener('scroll', () => els.backTop.classList.toggle('show', scrollY > 700), {passive:true});
  }

  renderWeeks();
  renderComparisons();
  renderRules();
  setupControls();
  setupTheme();
  setupBackTop();
  updateProgress();
  applyFilters();

  if (rules.length !== 132) console.warn('N3 Matome rule coverage mismatch', rules.length);
  if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({block:'start'}));
})();
