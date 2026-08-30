(function () {
  'use strict';

  const rules = Array.isArray(window.N3_MATOME_RULES) ? window.N3_MATOME_RULES : [];
  const deepNotes = window.N3_MATOME_DETAILS || {};

  const partInfo = {
    1: { title: 'কাজ, কথ্য রূপ ও ように Family', focus: 'Passive • permission • casual contractions • likeness • habit • intention' },
    2: { title: 'সীমা, Topic ও Quote Family', focus: 'ばかり • emphasis • topic/source • noun-box • という • reported instruction' },
    3: { title: 'শর্ত, সময় ও অপরিবর্তিত অবস্থা', focus: 'Concession • role • expectation • sudden time • まま • feelings' },
    4: { title: 'দৃষ্টিভঙ্গি, কারণ ও সিদ্ধান্ত', focus: 'Viewpoint • judgement • cause • comparison • advice • conclusion' },
    5: { title: 'বাড়ানো, শেষ করা ও সংযোগ', focus: 'Extension • completion • fresh/unfinished • hope • range • connectors' },
    6: { title: 'Hypothesis, উপলব্ধি ও わけ Family', focus: 'もし • decisions • discovery • うちに • わけ • strong negatives' }
  };

  const dayInfo = {
    1: ['Passive ও অনুমতি', 'Casual contraction', 'দেখে অনুমান ও বৈশিষ্ট্য', 'ように—চেষ্টা, উদ্দেশ্য, পরিবর্তন', 'ように—reference, নির্দেশ, প্রার্থনা', 'Intention ও attempt'],
    2: ['সীমা ও spotlight', 'Topic, source ও method', 'Adjective থেকে noun', 'という noun-box family', 'Correction ও association', 'Instruction report'],
    3: ['Concession ও “না করে”', 'Role, standard ও hypothesis', 'Plan, logic ও duty', 'সুযোগ, repetition ও sudden event', 'Exact match ও unchanged state', 'অন্যের feeling ও wish'],
    4: ['Viewpoint, ratio ও criticism', 'ভালো/খারাপ কারণ ও replacement', 'Degree ও comparison', 'Advice, report ও exclamation', 'Memory, no-choice ও hearsay', 'Summary, cause ও result'],
    5: ['Scope বাড়ানো ও target', 'Complete, unfinished ও fresh result', 'Hope, regret ও doubt', 'Endpoint, extreme ও range', 'Hypothesis ও possibility', 'চার ধরনের connector'],
    6: ['তিন ধরনের “যদি”', 'বাইরের/নিজের সিদ্ধান্ত ও partial yes', 'Discovery, near miss ও realization', 'わけ-এর চারটি আলাদা কাজ', 'Negative strength map', 'Addition ও choice connector']
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
      ['〜ほど〜ない', 'A-র মতো এত নয়, বা A-র মতো আর কিছু নেই—গঠন দেখুন।']
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
    list: document.getElementById('ruleList'), parts: document.getElementById('weekGrid'), compare: document.getElementById('compareGrid'),
    q: document.getElementById('q'), partSelect: document.getElementById('weekSelect'), undone: document.getElementById('undone'),
    reset: document.getElementById('resetFilter'), count: document.getElementById('resultCount'), progress: document.getElementById('progress'),
    progressText: document.getElementById('progressText'), empty: document.getElementById('empty'), theme: document.getElementById('themeToggle'),
    backTop: document.getElementById('backTop')
  };
  const doneKey = 'n3MatomeDoneV1';
  const themeKey = 'n3MatomeTheme';
  let selectedPart = '1';
  let selectedDay = '1';
  let onlyUndone = false;
  let done = loadDone();
  let cards = [];
  let daySelect;
  let dayNavigator;
  let expandButton;
  let collapseButton;

  function loadDone() {
    try { return new Set(JSON.parse(localStorage.getItem(doneKey) || '[]').map(Number)); }
    catch (_) { return new Set(); }
  }
  function saveDone() { localStorage.setItem(doneKey, JSON.stringify([...done].sort((a, b) => a - b))); updateProgress(); }
  function node(tag, className, text) { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
  function flattenNote(note) { return note ? [note.explanation, note.why, note.when, note.mistake, note.compare].concat((note.examples || []).flat()).join(' ') : ''; }

  function enhanceStaticCopy() {
    const heroTitle = document.querySelector('.hero h1');
    const heroCopy = document.querySelector('.hero-copy');
    const heroStats = [...document.querySelectorAll('.hero-stat')];
    if (heroTitle) heroTitle.textContent = 'N3 Matome Grammar — Part ধরে পূর্ণ ব্যাখ্যা';
    if (heroCopy) heroCopy.textContent = 'TRY! N3-এর মতো Part → Week → Day। প্রতিটি rule-এ সহজ বাংলা ব্যাখ্যা, কেন ও কখন ব্যবহার করবেন, exact গঠন, common ভুল, confusing rule-এর পার্থক্য, মনে রাখার টিপস এবং ৩টি বাস্তব উদাহরণ।';
    if (heroStats[0]) heroStats[0].textContent = '৬ Part • ৬ Week';
    if (heroStats[1]) heroStats[1].textContent = '৩৬ Study Day';
    if (heroStats[2]) heroStats[2].textContent = '১৩২টি পূর্ণ Lesson';
    if (heroStats[3]) heroStats[3].textContent = '৩৯৬টি বাস্তব Example';
    const weekTitle = document.getElementById('week-title');
    const weekCopy = weekTitle?.parentElement?.querySelector('p');
    if (weekTitle) weekTitle.textContent = 'TRY! N3-এর মতো Part Map';
    if (weekCopy) weekCopy.textContent = 'প্রথমে Part বাছুন, তারপর Day। একই পরিবারের rule পাশাপাশি থাকবে—এলোমেলো ১৩২টি card নয়।';
    const rulesTitle = document.getElementById('rules-title');
    const rulesCopy = rulesTitle?.parentElement?.querySelector('p');
    if (rulesTitle) rulesTitle.textContent = '৬ Part-এর ১৩২টি পূর্ণ Grammar Lesson';
    if (rulesCopy) rulesCopy.textContent = 'প্রতিটি lesson খুললে ব্যাখ্যা, ব্যবহার, ভুল, তুলনা, memory tip ও তিনটি Japanese–Bangla example পাবেন।';
    [...els.partSelect.options].forEach((option) => {
      option.textContent = option.value === 'all' ? 'সব ৬ Part' : `Part ${String(option.value).padStart(2, '0')} • Week ${option.value}`;
    });
    els.partSelect.setAttribute('aria-label', 'Part বাছাই করুন');
    daySelect = node('select', 'day-select');
    daySelect.id = 'daySelect';
    daySelect.setAttribute('aria-label', 'Study Day বাছাই করুন');
    daySelect.append(new Option('সব Day', 'all'));
    for (let day = 1; day <= 6; day += 1) daySelect.append(new Option(`Day ${day}`, String(day)));
    els.partSelect.insertAdjacentElement('afterend', daySelect);
    expandButton = node('button', 'expand-lessons', 'খোলা সব Lesson');
    expandButton.type = 'button';
    collapseButton = node('button', 'collapse-lessons', 'সব Lesson বন্ধ');
    collapseButton.type = 'button';
    els.reset.insertAdjacentElement('afterend', collapseButton);
    els.reset.insertAdjacentElement('afterend', expandButton);
    dayNavigator = node('div', 'day-navigator');
    dayNavigator.id = 'dayNavigator';
    dayNavigator.setAttribute('aria-label', 'Part-এর Study Day');
    document.querySelector('#rules > .section-head')?.insertAdjacentElement('afterend', dayNavigator);
  }

  function renderParts() {
    const all = node('button', 'week-card');
    all.type = 'button'; all.dataset.week = '0';
    all.append(node('span', 'week-kicker', 'সব Part'), node('b', '', '১৩২টি Rule একসাথে'), node('p', '', 'Global search বা full revision-এর জন্য।'), node('small', '', '6 Part • 36 Day • 132 Rule'));
    all.addEventListener('click', () => setPart('all', true, false));
    els.parts.append(all);
    Object.entries(partInfo).forEach(([part, info]) => {
      const count = rules.filter((rule) => String(rule[1]) === part).length;
      const button = node('button', 'week-card');
      button.type = 'button'; button.dataset.week = part;
      button.append(node('span', 'week-kicker', `Part ${String(part).padStart(2, '0')} • Week ${part}`), node('b', '', info.title), node('p', '', info.focus), node('small', '', `6 Day • ${count}টি পূর্ণ Lesson`));
      button.addEventListener('click', () => setPart(part, true, true));
      els.parts.append(button);
    });
  }

  function renderComparisons() {
    comparisons.forEach((comparison, index) => {
      const details = node('details', 'compare-card');
      if (index < 2) details.open = true;
      const body = node('div', 'compare-body');
      comparison[1].forEach((item) => { const row = node('div', 'compare-row'); row.append(node('b', '', item[0]), node('span', '', item[1])); body.append(row); });
      body.append(node('p', 'compare-decision', 'শান্তভাবে সিদ্ধান্ত: বাংলা অনুবাদ নয়—speaker কী বোঝাতে চায় সেটি ধরুন; তারপর উপরের আলাদা কাজটি মিলিয়ে form বাছুন।'));
      details.append(node('summary', '', comparison[0]), body);
      els.compare.append(details);
    });
  }

  function learningCell(label, text, className = '') { const cell = node('section', `learning-cell ${className}`.trim()); cell.append(node('h4', '', label), node('p', '', text)); return cell; }
  function exampleCard(label, japanese, bangla) { const example = node('article', 'real-example'); example.append(node('span', 'example-label', label), node('div', 'example-jp', japanese), node('div', 'example-bn', bangla)); return example; }

  function makeRuleCard(rule, indexInDay) {
    const [id, part, day, pattern, form, meaning, memory, japanese, bangla] = rule;
    const note = deepNotes[id] || { explanation: meaning, why: 'এই নির্দিষ্ট meaning ও nuance পরিষ্কারভাবে প্রকাশ করতে।', when: 'Form ও context মিললে ব্যবহার করুন।', mistake: '❌ Form না দেখে শুধু বাংলা অনুবাদ থেকে grammar বাছবেন না।', compare: 'একই বাংলা অর্থের rule-এর সঙ্গে nuance মিলিয়ে দেখুন।', examples: [] };
    const article = node('article', 'rule-card');
    article.id = `matome-rule-${id}`;
    Object.assign(article.dataset, { week: String(part), part: String(part), day: String(day), id: String(id), search: `${rule.slice(3).join(' ')} ${flattenNote(note)}`.toLocaleLowerCase() });
    const top = node('div', 'rule-top');
    top.append(node('span', 'rule-no', String(id).padStart(3, '0')));
    const title = node('div', 'rule-title');
    title.append(node('h3', '', pattern), node('small', '', `Part ${String(part).padStart(2, '0')} • Week ${part} • Day ${day}`));
    const doneLabel = node('label', 'done-wrap');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.checked = done.has(id); checkbox.setAttribute('aria-label', `${pattern} শেখা হয়েছে`);
    checkbox.addEventListener('change', () => { if (checkbox.checked) done.add(id); else done.delete(id); saveDone(); if (onlyUndone) applyFilters(); });
    doneLabel.append(checkbox, document.createTextNode(' শেখা'));
    top.append(title, doneLabel);
    const body = node('div', 'rule-body');
    body.append(node('div', 'formula', `গঠন: ${form}`));
    const explanation = node('section', 'lesson-explanation');
    explanation.append(node('span', 'lesson-kicker', '১ • সহজ বাংলা ব্যাখ্যা'), node('p', 'meaning', meaning), node('p', 'deep-explanation', note.explanation));
    body.append(explanation);
    const useGrid = node('div', 'learning-grid');
    useGrid.append(learningCell('২ • কেন ব্যবহার করবেন?', note.why, 'why-cell'), learningCell('৩ • কোন সময় ব্যবহার করবেন?', note.when, 'when-cell'));
    body.append(useGrid);
    const mastery = node('details', 'mastery-details');
    mastery.open = indexInDay === 0;
    mastery.append(node('summary', '', 'ভুল, তুলনা, মনে রাখার টিপস ও ৩টি বাস্তব উদাহরণ'));
    const masteryBody = node('div', 'mastery-body');
    masteryBody.append(
      learningCell('৪ • সবচেয়ে common ভুল', note.mistake, 'mistake-cell'),
      learningCell('৫ • Confusing rule থেকে পার্থক্য', note.compare, 'compare-cell'),
      learningCell('৬ • ঠান্ডা মাথায় মনে রাখুন', `${memory} প্রথমে form একবার বলুন, তারপর আপনার নিজের school/কাজের একটি বাক্য বানান।`, 'memory-cell')
    );
    const examples = node('section', 'examples-section');
    examples.append(node('h4', '', '৭ • বাস্তব Japanese–Bangla উদাহরণ'));
    const exampleList = node('div', 'example-list');
    exampleList.append(exampleCard('মূল Example', japanese, bangla));
    (note.examples || []).forEach((example, exampleIndex) => exampleList.append(exampleCard(`বাস্তব Example ${exampleIndex + 2}`, example[0], example[1])));
    examples.append(exampleList);
    const recall = node('section', 'recall-box');
    recall.append(node('b', '', '৮ • ১০-সেকেন্ড Recall'), node('p', '', `${pattern} দেখেই বলুন: “${meaning}”। এবার card না দেখে আপনার আজকের জীবন নিয়ে একটি Japanese বাক্য বলুন।`));
    masteryBody.append(examples, recall);
    mastery.append(masteryBody);
    body.append(mastery);
    article.append(top, body);
    return article;
  }

  function renderRules() {
    for (let part = 1; part <= 6; part += 1) {
      const partRules = rules.filter((rule) => rule[1] === part);
      const partSection = node('section', 'part-group');
      partSection.dataset.part = String(part); partSection.id = `part-${part}`;
      const partHeading = node('header', 'part-heading');
      const headingCopy = node('div', 'part-heading-copy');
      headingCopy.append(node('span', 'part-kicker', `Part ${String(part).padStart(2, '0')} • Week ${part}`), node('h2', '', partInfo[part].title), node('p', '', partInfo[part].focus));
      const stats = node('span', 'part-progress'); stats.dataset.partProgress = String(part);
      partHeading.append(headingCopy, stats); partSection.append(partHeading);
      for (let day = 1; day <= 6; day += 1) {
        const dayRules = partRules.filter((rule) => rule[2] === day);
        const group = node('section', 'day-group');
        Object.assign(group.dataset, { week: String(part), part: String(part), day: String(day) }); group.id = `part-${part}-day-${day}`;
        const heading = node('div', 'day-heading');
        const headingMain = node('div', 'day-heading-main');
        headingMain.append(node('span', '', `DAY ${day}`), node('b', '', dayInfo[part][day - 1]));
        heading.append(headingMain, node('small', '', `${dayRules.length}টি Rule • ধীরে বুঝে পড়ুন`));
        const grid = node('div', 'rule-grid');
        dayRules.forEach((item, index) => grid.append(makeRuleCard(item, index)));
        group.append(heading, grid); partSection.append(group);
      }
      els.list.append(partSection);
    }
    cards = [...els.list.querySelectorAll('.rule-card')];
  }

  function renderDayNavigator() {
    if (!dayNavigator) return;
    dayNavigator.replaceChildren();
    if (selectedPart === 'all') {
      dayNavigator.classList.add('all-parts');
      dayNavigator.append(node('p', 'day-help', 'Day খুলতে আগে উপরের Part 01–06 থেকে একটি Part বাছুন। Global search করলে সব Part একসঙ্গে খুঁজবে।'));
      return;
    }
    dayNavigator.classList.remove('all-parts');
    const intro = node('div', 'day-nav-intro');
    intro.append(node('span', '', `PART ${String(selectedPart).padStart(2, '0')}`), node('b', '', 'এখন Study Day বাছুন'));
    const buttons = node('div', 'day-buttons');
    const all = node('button', selectedDay === 'all' ? 'active' : '', 'সব ৬ Day'); all.type = 'button'; all.addEventListener('click', () => setDay('all', true)); buttons.append(all);
    for (let day = 1; day <= 6; day += 1) {
      const button = node('button', selectedDay === String(day) ? 'active' : ''); button.type = 'button'; button.dataset.day = String(day);
      button.append(node('span', '', `Day ${day}`), node('small', '', dayInfo[Number(selectedPart)][day - 1]));
      button.addEventListener('click', () => setDay(String(day), true)); buttons.append(button);
    }
    dayNavigator.append(intro, buttons);
  }

  function syncControls() {
    els.partSelect.value = selectedPart; daySelect.value = selectedDay; daySelect.disabled = selectedPart === 'all';
    [...els.parts.querySelectorAll('.week-card')].forEach((card) => card.classList.toggle('active', selectedPart === 'all' ? card.dataset.week === '0' : card.dataset.week === selectedPart));
    renderDayNavigator();
  }
  function setPart(part, shouldScroll, firstDay) { selectedPart = String(part); selectedDay = selectedPart === 'all' ? 'all' : (firstDay ? '1' : 'all'); syncControls(); applyFilters(); if (shouldScroll) document.getElementById('rules').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function setDay(day, shouldScroll) {
    selectedDay = String(day); daySelect.value = selectedDay; renderDayNavigator(); applyFilters();
    if (shouldScroll && selectedPart !== 'all') { const target = selectedDay === 'all' ? document.getElementById(`part-${selectedPart}`) : document.getElementById(`part-${selectedPart}-day-${selectedDay}`); target?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  function applyFilters() {
    const term = els.q.value.trim().toLocaleLowerCase(); let visible = 0;
    cards.forEach((card) => {
      const id = Number(card.dataset.id);
      const match = (selectedPart === 'all' || card.dataset.part === selectedPart) && (selectedDay === 'all' || card.dataset.day === selectedDay) && (!term || card.dataset.search.includes(term)) && (!onlyUndone || !done.has(id));
      card.classList.toggle('hidden', !match); if (match) visible += 1;
    });
    els.list.querySelectorAll('.day-group').forEach((group) => group.classList.toggle('hidden', !group.querySelector('.rule-card:not(.hidden)')));
    els.list.querySelectorAll('.part-group').forEach((group) => group.classList.toggle('hidden', !group.querySelector('.rule-card:not(.hidden)')));
    els.count.textContent = `${visible}টি পূর্ণ Lesson দেখা যাচ্ছে`; els.empty.classList.toggle('show', visible === 0); els.undone.classList.toggle('active', onlyUndone);
  }

  function updateProgress() {
    els.progress.max = rules.length; els.progress.value = done.size; els.progressText.textContent = `${done.size} / ${rules.length} শেখা • ${rules.length - done.size} বাকি`;
    document.querySelectorAll('[data-part-progress]').forEach((stat) => {
      const ids = rules.filter((rule) => rule[1] === Number(stat.dataset.partProgress)).map((rule) => rule[0]); const learned = ids.filter((id) => done.has(id)).length;
      stat.textContent = `${learned} শেখা • ${ids.length - learned} বাকি`;
    });
  }
  function toggleVisibleLessons(open) { cards.forEach((card) => { if (!card.classList.contains('hidden')) { const details = card.querySelector('.mastery-details'); if (details) details.open = open; } }); }

  function setupControls() {
    els.q.addEventListener('input', () => { if (els.q.value.trim() && (selectedPart !== 'all' || selectedDay !== 'all')) { selectedPart = 'all'; selectedDay = 'all'; syncControls(); } applyFilters(); });
    els.q.addEventListener('keydown', (event) => { if (event.key === 'Escape') { els.q.value = ''; applyFilters(); } });
    els.partSelect.addEventListener('change', (event) => setPart(event.target.value, true, false));
    daySelect.addEventListener('change', (event) => setDay(event.target.value, true));
    els.undone.addEventListener('click', () => { onlyUndone = !onlyUndone; applyFilters(); });
    els.reset.addEventListener('click', () => { els.q.value = ''; onlyUndone = false; setPart('all', false, false); els.q.focus(); });
    expandButton.addEventListener('click', () => toggleVisibleLessons(true)); collapseButton.addEventListener('click', () => toggleVisibleLessons(false));
    document.addEventListener('keydown', (event) => { if (event.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); els.q.focus(); } });
  }
  function setupTheme() {
    const saved = localStorage.getItem(themeKey); const initial = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const apply = (theme) => { document.body.dataset.theme = theme; els.theme.textContent = theme === 'dark' ? '☀ Light' : '☾ Dark'; };
    apply(initial); els.theme.addEventListener('click', () => { const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem(themeKey, next); apply(next); });
  }
  function setupBackTop() { els.backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' })); addEventListener('scroll', () => els.backTop.classList.toggle('show', scrollY > 700), { passive: true }); }
  function openHashTarget() {
    if (!location.hash) return false; const target = document.querySelector(location.hash); if (!target?.classList.contains('rule-card')) return false;
    selectedPart = target.dataset.part; selectedDay = target.dataset.day; syncControls(); applyFilters(); const details = target.querySelector('.mastery-details'); if (details) details.open = true; requestAnimationFrame(() => target.scrollIntoView({ block: 'start' })); return true;
  }

  enhanceStaticCopy(); renderParts(); renderComparisons(); renderRules(); setupControls(); setupTheme(); setupBackTop(); updateProgress(); syncControls(); applyFilters(); openHashTarget();
  if (rules.length !== 132) console.warn('N3 Matome rule coverage mismatch', rules.length);
  if (Object.keys(deepNotes).length !== rules.length) console.warn('N3 Matome deep-note coverage mismatch', Object.keys(deepNotes).length);
})();
