(function () {
  'use strict';

  const rules = Array.isArray(window.N3_MATOME_RULES) ? window.N3_MATOME_RULES : [];
  const deepNotes = window.N3_MATOME_DETAILS || {};
  const easyNotes = window.N3_MATOME_EASY || {};
  const extraExamples = window.N3_MATOME_EXTRA_EXAMPLES || {};

  const partInfo = {
    1: { title: 'কাজ, অনুমতি ও কথার ছোট রূপ', focus: 'কাজটি কে করেছে • অনুমতি চাওয়া • দেখে অনুমান • চেষ্টা ও পরিবর্তন' },
    2: { title: 'শুধু, বিষয়, নাম ও বলা কথা', focus: 'কতটুকু • কোন বিষয়ে • খবরের সূত্র • নাম ও কথাকে বাক্যে জোড়া' },
    3: { title: 'শর্ত, সময় ও একই অবস্থা', focus: 'হলেও • না করে • করার কথা • ঠিক মাঝখানে • যেমন ছিল তেমন' },
    4: { title: 'কার চোখে, কারণ ও সিদ্ধান্ত', focus: 'কার কাছে কেমন • ভালো/খারাপ কারণ • তুলনা • পরামর্শ • শেষ ফল' },
    5: { title: 'কাজ শেষ, অসম্পূর্ণ ও বাক্য জোড়া', focus: 'পুরো শেষ • আধা করা • টাটকা • আশা/আফসোস • তাই/কিন্তু' },
    6: { title: 'যদি, বুঝতে পারা ও わけ-এর ব্যবহার', focus: 'তিন রকম যদি • কার সিদ্ধান্ত • করে বুঝলাম • わけ • শক্ত না-বোধক কথা' }
  };

  const dayInfo = {
    1: ['কাজটি করা হয়েছে ও অনুমতি', 'কথার সময় ছোট করে বলা', 'দেখে অনুমান ও আসল বৈশিষ্ট্য', 'ように—চেষ্টা, উদ্দেশ্য ও পরিবর্তন', 'ように—যেমন, নির্দেশ ও প্রার্থনা', 'ইচ্ছা, চেষ্টা ও অনিচ্ছা'],
    2: ['শুধু, এতটুকুই ও বিশেষ জোর', 'কোন বিষয়ে ও খবরের সূত্র', 'গুণকে একটি নাম বানানো', 'という—নাম, মানে ও পুরো কথা', 'কথা ঠিক করা ও প্রসঙ্গ তোলা', 'অন্যের বলা নির্দেশ জানানো'],
    3: ['হলেও ও না করেই', 'কী হিসেবে ও ধরে নিলে', 'পরিকল্পনা, হওয়ার কথা ও উচিত', 'সুযোগে, প্রতিবার ও হঠাৎ', 'হুবহু, একই অবস্থা ও ফেলে রাখা', 'অন্যের অনুভূতি, আশা ও ভান'],
    4: ['কার কাছে কেমন ও প্রত্যাশার অমিল', 'ভালো/খারাপ কারণ ও বদলে', 'কতটা ও তুলনা', 'দরকার নেই, পরামর্শ ও অনুভূতি', 'মনে করা, উপায় নেই ও শোনা খবর', 'অর্থাৎ, কারণ ও শেষ ফল'],
    5: ['শুধু নয়, আরও এবং তুলনা', 'পুরো শেষ, আধা করা ও টাটকা', 'আশা, আফসোস ও মনে প্রশ্ন', 'শেষ সীমা, এমনকি ও বিস্তৃত এলাকা', 'যদিও, হয়তো ও সব সময় নয়', 'কিন্তু, তাই ও নতুন প্রসঙ্গ'],
    6: ['তিনভাবে “যদি” বলা', 'বাইরের/নিজের সিদ্ধান্ত ও কিছুটা হ্যাঁ', 'করে ফল জানা, অল্পের জন্য বাঁচা ও বুঝতে পারা', 'わけ-এর চারটি আলাদা অর্থ', 'কখনোই না, একদম না ও খুব কম', 'আরও যোগ করা ও দুটি থেকে বাছাই']
  };

  const comparisons = [
    ['みたい・らしい・っぽい—কোনটি কখন?', [
      ['〜みたい', 'নিজে দেখে মনে হচ্ছে, অথবা অন্য কিছুর মতো লাগছে।'],
      ['〜らしい', 'যার যেমন হওয়া স্বাভাবিক, ঠিক সেই গুণ দেখা যাচ্ছে।'],
      ['〜っぽい', 'একটু সেই রকম ভাব বা বারবার হওয়া প্রবণতা আছে।']
    ]],
    ['ようにする・ようになる・ように—সহজ পার্থক্য', [
      ['〜ようにする', 'আমি নিজে চেষ্টা করে অভ্যাস বানাই।'],
      ['〜ようになる', 'আগের অবস্থা বদলে এখন সত্যিই পারি বা করি।'],
      ['〜ように（目的）', 'যাতে কাঙ্ক্ষিত ফল হয়, সেজন্য আরেক কাজ করি।']
    ]],
    ['について・に関して・に対して・にとって', [
      ['〜について', 'কোন বিষয় সম্পর্কে কথা বলছি।'],
      ['〜に関して', 'একই “সম্পর্কে”; তবে অফিস বা লেখায় একটু বেশি ভদ্র।'],
      ['〜に対して', 'কার প্রতি কাজ হচ্ছে, অথবা এক দিকের বিপরীতে অন্য দিক।'],
      ['〜にとって', 'কার কাছে বিষয়টি কেমন বা কত গুরুত্বপূর্ণ।']
    ]],
    ['ばかり・だけしか・さえ・こそ', [
      ['〜ばかり', 'শুধু একই কাজ বা জিনিস খুব বেশি।'],
      ['〜だけしか〜ない', 'এইটুকুই আছে, এর বাইরে কিছু নেই।'],
      ['〜さえ', 'এমনকি এই সামান্য বা অবাক করা জিনিসটিও।'],
      ['〜こそ', 'অন্যটি নয়—ঠিক এটিই।']
    ]],
    ['とたん・最中・たところ・ところだった', [
      ['〜たとたん', 'প্রথম কাজ শেষ হতেই হঠাৎ দ্বিতীয় ঘটনা।'],
      ['〜最中に', 'কাজের ঠিক মাঝখানে অন্য ঘটনা এসে বাধা দিল।'],
      ['〜たところ', 'কাজটি করে দেখলাম, তারপর নতুন ফল জানলাম।'],
      ['〜るところだった', 'আর একটু হলেই ঘটত, কিন্তু শেষ পর্যন্ত ঘটেনি।']
    ]],
    ['まま・っぱなし・かけ・切る', [
      ['〜まま', 'অবস্থা যেমন ছিল, তেমনই আছে।'],
      ['〜っぱなし', 'অবহেলায় ফেলে রাখা বা বিরতি ছাড়া একটানা করা।'],
      ['〜かけ', 'শুরু হয়েছে, কিন্তু এখনও শেষ হয়নি।'],
      ['〜切る', 'কিছু বাকি না রেখে একেবারে শেষ করা।']
    ]],
    ['おかげで・せいで・そのため', [
      ['〜おかげで', 'ভালো ফল; কৃতজ্ঞতা।'],
      ['〜せいで', 'খারাপ ফল; কারণটিকে দোষ দেওয়া।'],
      ['そのため', 'ভালো/খারাপ অনুভূতি ছাড়াই কারণ থেকে ফল বলা।']
    ]],
    ['はず ও わけ—এক নজরে', [
      ['〜はずだ', 'জানা কারণ আছে, তাই এমন হওয়ার কথা।'],
      ['〜わけだ', 'নতুন তথ্য পেয়ে বলি—তাই তো এমন হয়েছে।'],
      ['〜わけがない', 'যুক্তি অনুযায়ী কোনোভাবেই সম্ভব নয়।'],
      ['〜わけにはいかない', 'করা সম্ভব, কিন্তু দায়িত্বের কারণে করা ঠিক নয়।']
    ]],
    ['ことになる・ことにする', [
      ['〜ことになる', 'বাইরের সিদ্ধান্ত/নিয়মে ঠিক হয়।'],
      ['〜ことにする', 'নিজে সিদ্ধান্ত নিই।'],
      ['〜ことになっている', 'বর্তমান নিয়ম/ব্যবস্থা।'],
      ['〜ことにしている', 'নিজে বানানো নিয়ম বা অভ্যাস।']
    ]],
    ['くらい・ほど・ば〜ほど', [
      ['〜くらい／ぐらい', 'কথার ভাষায় “এই পরিমাণ / এতটা”।'],
      ['〜ほど', 'একটি মাপকাঠি ধরে কতটা বা তুলনা বলা।'],
      ['〜ば〜ほど', 'একটি যত বদলায়, অন্যটিও তত বদলায়।'],
      ['〜ほど〜ない', 'ওটার মতো এতটা নয়; বিশেষ গঠনে “এর মতো সেরা কিছু নেই”।']
    ]],
    ['বাক্য জোড়া: তাই, উল্টো ফল, নতুন কথা', [
      ['ですから', 'কারণ থেকে স্বাভাবিক ফল: তাই।'],
      ['ところが', 'যা ভেবেছিলাম, তার উল্টো হলো।'],
      ['ところで', 'আগের কথা শেষ; এখন নতুন বিষয়।'],
      ['その上', 'একই দিকের আরও একটি তথ্য যোগ।']
    ]],
    ['চারভাবে শক্ত “না” বলা', [
      ['決して〜ない', 'দৃঢ় প্রতিজ্ঞা: কখনোই না।'],
      ['まったく〜ない', 'পরিমাণ বা বোঝা একেবারে শূন্য।'],
      ['めったに〜ない', 'ঘটনাটি হয়, তবে খুব কম।'],
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
  const banglaWordMap = [
    ['residence status', 'থাকার অনুমতি'], ['residence card', 'রেসিডেন্স কার্ড'], ['vocational school', 'কারিগরি স্কুল'],
    ['utility bill', 'পরিষেবার বিল'], ['convenience-store', 'কনবিনি'], ['part-time', 'খণ্ডকালীন কাজ'],
    ['break time', 'বিরতির সময়'], ['post office', 'ডাকঘর'], ['sky tree', 'স্কাইট্রি'], ['tanaka-san', 'তানাকা-সান'],
    ['shin-koiwa', 'শিন-কোইওয়া'], ['jlpt', 'জেএলপিটি'], ['japanese', 'জাপানি'], ['interview', 'সাক্ষাৎকার'],
    ['pronunciation', 'উচ্চারণ'], ['convenience', 'সুবিধা'], ['supermarket', 'সুপারমার্কেট'], ['conversation', 'কথোপকথন'],
    ['confidence', 'আত্মবিশ্বাস'], ['explanation', 'ব্যাখ্যা'], ['vocabulary', 'শব্দভান্ডার'], ['bangladesh', 'বাংলাদেশ'],
    ['homework', 'বাড়ির কাজ'], ['dictionary', 'অভিধান'], ['shopping', 'কেনাকাটা'], ['customer', 'ক্রেতা'],
    ['manager', 'ম্যানেজার'], ['teacher', 'শিক্ষক'], ['medicine', 'ওষুধ'], ['meeting', 'সভা'], ['overtime', 'অতিরিক্ত কাজ'],
    ['station', 'স্টেশন'], ['bicycle', 'সাইকেল'], ['practice', 'অনুশীলন'], ['grammar', 'ব্যাকরণ'], ['schedule', 'সময়সূচি'],
    ['classroom', 'শ্রেণিকক্ষ'], ['weekend', 'ছুটির দিন'], ['weekday', 'কর্মদিবস'], ['commute', 'যাতায়াত'],
    ['register', 'রেজিস্টার'], ['typhoon', 'ঘূর্ণিঝড়'], ['nervous', 'উদ্বিগ্ন'], ['service', 'সেবা'], ['payment', 'পেমেন্ট'],
    ['injection', 'ইনজেকশন'], ['roommate', 'রুমমেট'], ['company', 'কোম্পানি'], ['freezer', 'ফ্রিজার'],
    ['report', 'প্রতিবেদন'], ['reading', 'পড়া'], ['revision', 'পুনরাবৃত্তি'], ['natural', 'স্বাভাবিক'],
    ['traffic', 'যানবাহন'], ['design', 'নকশা'], ['salary', 'বেতন'], ['utility', 'পরিষেবা'], ['ready', 'প্রস্তুত'],
    ['wallet', 'মানিব্যাগ'], ['uniform', 'ইউনিফর্ম'], ['coffee', 'কফি'], ['fridge', 'ফ্রিজ'], ['novel', 'উপন্যাস'],
    ['hokkaido', 'হোক্কাইদো'], ['shinjuku', 'শিনজুকু'], ['osaka', 'ওসাকা'], ['chiba', 'চিবা'], ['tokyo', 'টোকিও'],
    ['tanaka', 'তানাকা'], ['onigiri', 'ওনিগিরি'], ['natto', 'নাত্তো'], ['ramen', 'রামেন'], ['keigo', 'কেইগো'],
    ['train', 'ট্রেন'], ['shift', 'শিফট'], ['kanji', 'কানজি'], ['card', 'কার্ড'], ['class', 'ক্লাস'], ['store', 'দোকান'],
    ['button', 'বোতাম'], ['school', 'স্কুল'], ['email', 'ইমেইল'], ['news', 'খবর'], ['plan', 'পরিকল্পনা'], ['staff', 'কর্মী'],
    ['bread', 'রুটি'], ['bake', 'বেক'], ['print', 'ছাপানো'], ['diary', 'দিনলিপি'], ['note', 'নোট'], ['game', 'খেলা'],
    ['lunch', 'দুপুরের খাবার'], ['status', 'অবস্থা'], ['rule', 'নিয়ম'], ['soup', 'স্যুপ'], ['fuji', 'ফুজি'], ['save', 'সংরক্ষণ'],
    ['sale', 'ছাড়'], ['stamp', 'ডাকটিকিট'], ['form', 'ফরম'], ['bed', 'বিছানা'], ['seat', 'আসন'], ['cash', 'নগদ'],
    ['robot', 'রোবট'], ['mail', 'মেইল'], ['site', 'ওয়েবসাইট'], ['bag', 'ব্যাগ'], ['rumor', 'গুজব'], ['line', 'সারি'],
    ['seal', 'সিল'], ['wage', 'মজুরি'], ['job', 'চাকরি'], ['night', 'রাত'], ['day', 'দিন'], ['bus', 'বাস'], ['tea', 'চা'],
    ['japan', 'জাপান'], ['haiki', 'বিক্রি না-হওয়া পণ্য ফেলা'], ['table', 'টেবিল'], ['miss', 'ধরতে না-পারা'],
    ['yen', 'ইয়েন'], ['app', 'অ্যাপ'], ['fail', 'ব্যর্থ'], ['map', 'মানচিত্র'], ['N3', 'এন৩']
  ];
  function easyBangla(value) {
    let result = String(value || '');
    const escapeRegExp = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    banglaWordMap.forEach(([from, to]) => { result = result.replace(new RegExp(`\\b${escapeRegExp(from)}\\b`, 'gi'), to); });
    return result
      .replace(/বাংলাদেশ-এর/g, 'বাংলাদেশের')
      .replace(/জাপান-এর/g, 'জাপানের')
      .replace(/জাপান-এ/g, 'জাপানে')
      .replace(/কেনাকাটা-এর/g, 'কেনাকাটার');
  }
  function easyForm(value) {
    return String(value || '')
      .replace(/過去条件形/g, 'অতীতের শর্ত-রূপ')
      .replace(/条件形/g, 'শর্ত-রূপ')
      .replace(/感情A語幹/g, 'অনুভূতির বিশেষণের মূল রূপ')
      .replace(/V使役て形/g, 'কাউকে দিয়ে করানোর て-রূপ')
      .replace(/V受身形/g, '“কাজটি করা হয়” এমন ক্রিয়ার রূপ')
      .replace(/V辞書形/g, 'ক্রিয়ার অভিধান রূপ')
      .replace(/Vない形/g, 'ক্রিয়ার ない-রূপ')
      .replace(/V意向形/g, 'ক্রিয়ার “করব/চল করি” রূপ')
      .replace(/可能形/g, 'পারার রূপ')
      .replace(/Vますstem/g, 'ক্রিয়ার ます বাদ দেওয়া রূপ')
      .replace(/Vないstem/g, 'ক্রিয়ার ない বাদ দেওয়া রূপ')
      .replace(/いAstem/g, 'い-বিশেষণের い বাদ দেওয়া রূপ')
      .replace(/Astem/g, 'বিশেষণের মূল রূপ')
      .replace(/普通形/g, 'সাদামাটা রূপ')
      .replace(/辞書形/g, 'অভিধান রূপ')
      .replace(/意向形/g, '“করব/চল করি” রূপ')
      .replace(/語幹/g, 'মূল রূপ')
      .replace(/いA/g, 'い-বিশেষণ')
      .replace(/なA/g, 'な-বিশেষণ')
      .replace(/原因/g, 'কারণ')
      .replace(/当然の結果/g, 'স্বাভাবিক ফল')
      .replace(/予想外の事実/g, 'অপ্রত্যাশিত ঘটনা')
      .replace(/過去の行動/g, 'আগের কাজ')
      .replace(/別の話題/g, 'নতুন কথা')
      .replace(/結論/g, 'শেষ কথা')
      .replace(/理由/g, 'কারণ')
      .replace(/結果/g, 'ফল')
      .replace(/予想/g, 'অনুমান')
      .replace(/予定/g, 'পরিকল্পনা')
      .replace(/文/g, 'বাক্য')
      .replace(/V/g, 'ক্রিয়া ')
      .replace(/N/g, 'বিশেষ্য ')
      .replace(/negative/g, 'না-বোধক রূপ')
      .replace(/predicate/g, 'বাক্যের শেষ অংশ')
      .replace(/particle/g, 'পার্টিকেল')
      .replace(/quote/g, 'উদ্ধৃত কথা')
      .replace(/\bA\b/g, 'প্রথম কথা')
      .replace(/\bB\b/g, 'দ্বিতীয় কথা')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  function flattenNote(note) { return note ? [note.meaning, note.explain, note.explanation, note.why, note.when, note.mistake, note.compare, note.tip].concat((note.examples || []).flat()).join(' ') : ''; }

  function enhanceStaticCopy() {
    const heroTitle = document.querySelector('.hero h1');
    const heroCopy = document.querySelector('.hero-copy');
    const heroStats = [...document.querySelectorAll('.hero-stat')];
    if (heroTitle) heroTitle.textContent = 'N3 মাতোমে ব্যাকরণ — একদম সহজ বাংলায়';
    if (heroCopy) heroCopy.textContent = 'বইয়ের কঠিন ভাষা নয়। প্রথমে এক কথায় অর্থ, তারপর মুখের ভাষায় ব্যাখ্যা। কেন বলবেন, কখন বলবেন, কোথায় ভুল হয় এবং কীভাবে মনে রাখবেন—সব ১৩২টি নিয়মে আলাদা করে দেওয়া আছে।';
    if (heroStats[0]) heroStats[0].textContent = '৬ পার্ট • ৬ সপ্তাহ';
    if (heroStats[1]) heroStats[1].textContent = '৩৬ দিনের পড়া';
    if (heroStats[2]) heroStats[2].textContent = '১৩২টি সহজ পাঠ';
    if (heroStats[3]) heroStats[3].textContent = '১৩২০টি বাংলা-সহ উদাহরণ';
    const weekTitle = document.getElementById('week-title');
    const weekCopy = weekTitle?.parentElement?.querySelector('p');
    if (weekTitle) weekTitle.textContent = 'পার্ট ধরে ধীরে ধীরে পড়ুন';
    if (weekCopy) weekCopy.textContent = 'প্রথমে পার্ট বাছুন, তারপর দিন। একই রকম নিয়ম পাশাপাশি রাখা হয়েছে, তাই পার্থক্য বুঝতে সহজ হবে।';
    const rulesTitle = document.getElementById('rules-title');
    const rulesCopy = rulesTitle?.parentElement?.querySelector('p');
    if (rulesTitle) rulesTitle.textContent = '১৩২টি নিয়ম—মুখের ভাষায় বুঝুন';
    if (rulesCopy) rulesCopy.textContent = 'প্রথমে ছোট অর্থ পড়ুন। তারপর সহজ ব্যাখ্যা ও কখন বলবেন দেখুন। নিচের অংশ খুললে ভুল, পার্থক্য, মনে রাখার উপায় এবং দশটি বাস্তব উদাহরণ পাবেন।';
    const memoryTitle = document.getElementById('memory-title');
    const memoryCopy = memoryTitle?.parentElement?.querySelector('p');
    if (memoryTitle) memoryTitle.textContent = 'একটি নিয়ম বুঝে পড়ার ৪টি সহজ ধাপ';
    if (memoryCopy) memoryCopy.textContent = 'অর্থ দেখুন → কেন লাগে বুঝুন → উদাহরণ পড়ুন → নিজের একটি বাক্য বলুন। এভাবেই মনে থাকবে।';
    const compareTitle = document.getElementById('compare-title');
    const compareCopy = compareTitle?.parentElement?.querySelector('p');
    if (compareTitle) compareTitle.textContent = 'দেখতে একই—কাজ কিন্তু আলাদা';
    if (compareCopy) compareCopy.textContent = 'যে নিয়মগুলো সহজে গুলিয়ে যায়, সেগুলোর পার্থক্য এখানে খুব ছোট করে বলা হয়েছে।';
    if (els.q) { els.q.placeholder = 'জাপানি নিয়ম বা বাংলা অর্থ লিখে খুঁজুন…'; els.q.setAttribute('aria-label', 'নিয়ম খুঁজুন'); }
    if (els.undone) els.undone.textContent = 'শুধু না-পড়া';
    if (els.reset) els.reset.textContent = 'খোঁজা মুছুন';
    const printButton = document.querySelector('.controls button[onclick]');
    if (printButton) printButton.textContent = 'ছাপান / পিডিএফ';
    [...els.partSelect.options].forEach((option) => {
      option.textContent = option.value === 'all' ? 'সব ৬ পার্ট' : `পার্ট ${String(option.value).padStart(2, '0')} • সপ্তাহ ${option.value}`;
    });
    els.partSelect.setAttribute('aria-label', 'পার্ট বাছাই করুন');
    daySelect = node('select', 'day-select');
    daySelect.id = 'daySelect';
    daySelect.setAttribute('aria-label', 'পড়ার দিন বাছাই করুন');
    daySelect.append(new Option('সব দিন', 'all'));
    for (let day = 1; day <= 6; day += 1) daySelect.append(new Option(`দিন ${day}`, String(day)));
    els.partSelect.insertAdjacentElement('afterend', daySelect);
    expandButton = node('button', 'expand-lessons', 'সব পাঠ খুলুন');
    expandButton.type = 'button';
    collapseButton = node('button', 'collapse-lessons', 'সব পাঠ বন্ধ করুন');
    collapseButton.type = 'button';
    els.reset.insertAdjacentElement('afterend', collapseButton);
    els.reset.insertAdjacentElement('afterend', expandButton);
    dayNavigator = node('div', 'day-navigator');
    dayNavigator.id = 'dayNavigator';
    dayNavigator.setAttribute('aria-label', 'পার্টের পড়ার দিন');
    document.querySelector('#rules > .section-head')?.insertAdjacentElement('afterend', dayNavigator);
  }

  function renderParts() {
    const all = node('button', 'week-card');
    all.type = 'button'; all.dataset.week = '0';
    all.append(node('span', 'week-kicker', 'সব পার্ট'), node('b', '', '১৩২টি নিয়ম একসঙ্গে'), node('p', '', 'সব নিয়মে একসঙ্গে খুঁজতে বা আবার পড়তে।'), node('small', '', '৬ পার্ট • ৩৬ দিন • ১৩২ নিয়ম'));
    all.addEventListener('click', () => setPart('all', true, false));
    els.parts.append(all);
    Object.entries(partInfo).forEach(([part, info]) => {
      const count = rules.filter((rule) => String(rule[1]) === part).length;
      const button = node('button', 'week-card');
      button.type = 'button'; button.dataset.week = part;
      button.append(node('span', 'week-kicker', `পার্ট ${String(part).padStart(2, '0')} • সপ্তাহ ${part}`), node('b', '', info.title), node('p', '', info.focus), node('small', '', `৬ দিন • ${count}টি সহজ পাঠ`));
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
      body.append(node('p', 'compare-decision', 'বাছার সহজ উপায়: বাংলা অর্থ এক মনে হলেও, মানুষটি আসলে কী বলতে চাইছে তা দেখুন। তারপর উপরের যে ব্যাখ্যাটি মেলে, সেই নিয়ম নিন।'));
      details.append(node('summary', '', comparison[0]), body);
      els.compare.append(details);
    });
  }

  function learningCell(label, text, className = '') { const cell = node('section', `learning-cell ${className}`.trim()); cell.append(node('h4', '', label), node('p', '', text)); return cell; }
  function exampleCard(label, japanese, bangla) { const example = node('article', 'real-example'); example.append(node('span', 'example-label', label), node('div', 'example-jp', japanese), node('div', 'example-bn', easyBangla(bangla))); return example; }

  function makeRuleCard(rule, indexInDay) {
    const [id, part, day, pattern, form, meaning, memory, japanese, bangla] = rule;
    const note = deepNotes[id] || { examples: [] };
    const easy = easyNotes[id] || {
      meaning: easyBangla(meaning), explain: easyBangla(meaning), why: 'এই ভাবটি ছোট ও পরিষ্কারভাবে বলতে।',
      when: 'উপরের অর্থটি আপনার কথার সঙ্গে মিললে ব্যবহার করুন।', mistake: 'শুধু বাংলা অর্থ দেখে নয়; আগে গঠনটি মিলিয়ে নিন।',
      compare: 'কাছাকাছি নিয়মের সঙ্গে অর্থ ও গঠন—দুটিই মিলিয়ে দেখুন।', tip: easyBangla(memory)
    };
    const article = node('article', 'rule-card');
    article.id = `matome-rule-${id}`;
    Object.assign(article.dataset, { week: String(part), part: String(part), day: String(day), id: String(id), search: `${rule.slice(3).join(' ')} ${flattenNote(note)} ${flattenNote(easy)}`.toLocaleLowerCase() });
    const top = node('div', 'rule-top');
    top.append(node('span', 'rule-no', String(id).padStart(3, '0')));
    const title = node('div', 'rule-title');
    title.append(node('h3', '', pattern), node('small', '', `পার্ট ${String(part).padStart(2, '0')} • সপ্তাহ ${part} • দিন ${day}`));
    const doneLabel = node('label', 'done-wrap');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.checked = done.has(id); checkbox.setAttribute('aria-label', `${pattern} শেখা হয়েছে`);
    checkbox.addEventListener('change', () => { if (checkbox.checked) done.add(id); else done.delete(id); saveDone(); if (onlyUndone) applyFilters(); });
    doneLabel.append(checkbox, document.createTextNode(' শেখা'));
    top.append(title, doneLabel);
    const body = node('div', 'rule-body');
    const explanation = node('section', 'lesson-explanation');
    explanation.append(node('span', 'lesson-kicker', '১ • এক কথায় অর্থ'), node('p', 'meaning', easy.meaning));
    const spoken = node('div', 'spoken-explanation');
    spoken.append(node('h4', '', '২ • সহজ করে বুঝুন'), node('p', 'deep-explanation', easy.explain));
    explanation.append(spoken);
    body.append(explanation);
    body.append(node('div', 'formula', `গঠন: ${easyForm(form)}`));
    const useGrid = node('div', 'learning-grid');
    useGrid.append(learningCell('৩ • কেন ব্যবহার করবেন?', easy.why, 'why-cell'), learningCell('৪ • কখন বলবেন?', easy.when, 'when-cell'));
    body.append(useGrid);
    const mastery = node('details', 'mastery-details');
    mastery.open = indexInDay === 0;
    mastery.append(node('summary', '', 'ভুল, পার্থক্য, মনে রাখার উপায় ও ১০টি উদাহরণ'));
    const masteryBody = node('div', 'mastery-body');
    masteryBody.append(
      learningCell('৫ • সবচেয়ে সাধারণ ভুল', easy.mistake, 'mistake-cell'),
      learningCell('৬ • এর সঙ্গে গুলিয়ে ফেলবেন না', easy.compare, 'compare-cell'),
      learningCell('৭ • ঠান্ডা মাথায় মনে রাখুন', easy.tip, 'memory-cell')
    );
    const examples = node('section', 'examples-section');
    examples.append(node('h4', '', '৮ • ১০টি জাপানি বাক্য ও সহজ বাংলা অর্থ'));
    const exampleList = node('div', 'example-list');
    examples.append(exampleList);
    const renderExamples = () => {
      if (exampleList.childElementCount) return;
      const lessonExamples = [[japanese, bangla], ...(note.examples || []), ...(extraExamples[id] || [])];
      lessonExamples.forEach((example, exampleIndex) => exampleList.append(exampleCard(`উদাহরণ ${exampleIndex + 1}`, example[0], example[1])));
    };
    mastery.addEventListener('toggle', () => { if (mastery.open) renderExamples(); });
    if (mastery.open) renderExamples();
    const recall = node('section', 'recall-box');
    recall.append(node('b', '', '৯ • ১০ সেকেন্ডে মনে করুন'), node('p', '', `${pattern} দেখেই বলুন: “${easy.meaning}” এবার পাঠটি না দেখে নিজের আজকের জীবন নিয়ে একটি জাপানি বাক্য বলুন।`));
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
      headingCopy.append(node('span', 'part-kicker', `পার্ট ${String(part).padStart(2, '0')} • সপ্তাহ ${part}`), node('h2', '', partInfo[part].title), node('p', '', partInfo[part].focus));
      const stats = node('span', 'part-progress'); stats.dataset.partProgress = String(part);
      partHeading.append(headingCopy, stats); partSection.append(partHeading);
      for (let day = 1; day <= 6; day += 1) {
        const dayRules = partRules.filter((rule) => rule[2] === day);
        const group = node('section', 'day-group');
        Object.assign(group.dataset, { week: String(part), part: String(part), day: String(day) }); group.id = `part-${part}-day-${day}`;
        const heading = node('div', 'day-heading');
        const headingMain = node('div', 'day-heading-main');
        headingMain.append(node('span', '', `দিন ${day}`), node('b', '', dayInfo[part][day - 1]));
        heading.append(headingMain, node('small', '', `${dayRules.length}টি নিয়ম • ধীরে বুঝে পড়ুন`));
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
      dayNavigator.append(node('p', 'day-help', 'দিন খুলতে আগে উপরের পার্ট ০১–০৬ থেকে একটি পার্ট বাছুন। খোঁজার ঘরে লিখলে সব পার্ট একসঙ্গে খুঁজবে।'));
      return;
    }
    dayNavigator.classList.remove('all-parts');
    const intro = node('div', 'day-nav-intro');
    intro.append(node('span', '', `পার্ট ${String(selectedPart).padStart(2, '0')}`), node('b', '', 'এখন পড়ার দিন বাছুন'));
    const buttons = node('div', 'day-buttons');
    const all = node('button', selectedDay === 'all' ? 'active' : '', 'সব ৬ দিন'); all.type = 'button'; all.addEventListener('click', () => setDay('all', true)); buttons.append(all);
    for (let day = 1; day <= 6; day += 1) {
      const button = node('button', selectedDay === String(day) ? 'active' : ''); button.type = 'button'; button.dataset.day = String(day);
      button.append(node('span', '', `দিন ${day}`), node('small', '', dayInfo[Number(selectedPart)][day - 1]));
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
    els.count.textContent = `${visible}টি পূর্ণ পাঠ দেখা যাচ্ছে`; els.empty.classList.toggle('show', visible === 0); els.undone.classList.toggle('active', onlyUndone);
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
    const apply = (theme) => { document.body.dataset.theme = theme; els.theme.textContent = theme === 'dark' ? '☀ আলো' : '☾ অন্ধকার'; };
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
  if (Object.keys(easyNotes).length !== rules.length) console.warn('N3 Matome easy-note coverage mismatch', Object.keys(easyNotes).length);
  if (Object.keys(extraExamples).length !== rules.length) console.warn('N3 Matome extra-example coverage mismatch', Object.keys(extraExamples).length);
})();
