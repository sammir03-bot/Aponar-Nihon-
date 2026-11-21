/* N3 Vocabulary sequential-part upgrade.
   Keeps the existing page design, adds a 4th real-life example to every current word,
   and automatically splits all words into Part 1, Part 2 ... until the last part. */
(() => {
  if (typeof DATA === 'undefined' || !Array.isArray(DATA)) return;

  const EX4 = {
    '状況':['混雑の状況を駅員に聞きました。','こんざつのじょうきょうをえきいんにききました。','ভিড়ের পরিস্থিতি স্টেশন কর্মীকে জিজ্ঞেস করেছি।','স্টেশন'],
    '確認':['出発前にパスポートを確認しました。','しゅっぱつまえにぱすぽーとをかくにんしました。','রওনা হওয়ার আগে পাসপোর্ট যাচাই করেছি।','ভ্রমণ'],
    '連絡':['予定が決まったらすぐ連絡します。','よていがきまったらすぐれんらくします。','পরিকল্পনা ঠিক হলে সঙ্গে সঙ্গে জানাব।','দৈনন্দিন'],
    '準備':['明日の授業の準備をしておきます。','あしたのじゅぎょうのじゅんびをしておきます。','আগামীকালের ক্লাসের প্রস্তুতি আগে করে রাখব।','স্কুল'],
    '予定':['午後は病院へ行く予定です。','ごごはびょういんへいくよていです。','বিকেলে হাসপাতালে যাওয়ার পরিকল্পনা আছে।','স্বাস্থ্য'],
    '変更':['電車の時間が変更されました。','でんしゃのじかんがへんこうされました。','ট্রেনের সময় পরিবর্তন করা হয়েছে।','ট্রেন'],
    '必要':['手続きには印鑑が必要な場合があります。','てつづきにはいんかんがひつようなばあいがあります。','কিছু প্রক্রিয়ায় সিল প্রয়োজন হতে পারে।','অফিস'],
    '利用':['駅のロッカーを利用しました。','えきのろっかーをりようしました。','স্টেশনের লকার ব্যবহার করেছি।','স্টেশন'],
    '間に合う':['今出れば授業に間に合います。','いまでればじゅぎょうにまにあいます。','এখন বের হলে ক্লাসে সময়মতো পৌঁছাতে পারব।','স্কুল'],
    '遅れる':['バスが渋滞で遅れています。','ばすがじゅうたいでおくれています。','যানজটের কারণে বাস দেরি করছে।','বাস'],
    '受付':['ホテルの受付で鍵を受け取りました。','ほてるのうけつけでかぎをうけとりました。','হোটেলের রিসেপশন থেকে চাবি নিয়েছি।','হোটেল'],
    '料金':['学生料金は少し安くなります。','がくせいりょうきんはすこしやすくなります。','স্টুডেন্ট ফি একটু কম হয়।','সার্ভিস'],
    '申し込む':['市役所の日本語教室に申し込みました。','しやくしょのにほんごきょうしつにもうしこみました。','সিটি অফিসের জাপানি ক্লাসে আবেদন করেছি।','সিটি অফিস'],
    '支払う':['携帯電話の料金を自動で支払っています。','けいたいでんわのりょうきんをじどうでしはらっています。','মোবাইলের বিল অটোমেটিকভাবে পরিশোধ করছি।','বিল'],
    '届く':['ネットで注文した商品が今日届きました。','ねっとでちゅうもんしたしょうひんがきょうとどきました。','অনলাইনে অর্ডার করা পণ্য আজ পৌঁছেছে।','ডেলিভারি'],
    '説明':['契約内容を分かりやすく説明してもらいました。','けいやくないようをわかりやすくせつめいしてもらいました。','চুক্তির বিষয়গুলো সহজভাবে বুঝিয়ে দেওয়া হয়েছে।','চুক্তি'],
    '注意':['ホームでは黄色い線の内側に注意してください。','ほーむではきいろいせんのうちがわにちゅういしてください。','প্ল্যাটফর্মে হলুদ লাইনের ভেতরে থাকার দিকে খেয়াল রাখুন।','স্টেশন'],
    '経験':['接客の経験を面接で話しました。','せっきゃくのけいけんをめんせつではなしました。','ইন্টারভিউতে কাস্টমার সার্ভিসের অভিজ্ঞতা বলেছি।','ইন্টারভিউ'],
    '意見':['会議で自分の意見を伝えました。','かいぎでじぶんのいけんをつたえました。','মিটিংয়ে নিজের মতামত জানিয়েছি।','অফিস'],
    '比較':['いくつかの携帯プランを比較しました。','いくつかのけいたいぷらんをひかくしました。','কয়েকটি মোবাইল প্ল্যান তুলনা করেছি।','সার্ভিস'],
    '選ぶ':['スーパーで安い野菜を選びました。','すーぱーでやすいやさいをえらびました。','সুপারমার্কেটে সস্তা সবজি বেছে নিয়েছি।','কেনাকাটা'],
    '決める':['休みの日に何をするか今夜決めます。','やすみのひになにをするかこんやきめます。','ছুটির দিনে কী করব আজ রাতে ঠিক করব।','দৈনন্দিন'],
    '続ける':['健康のために毎朝歩くことを続けています。','けんこうのためにまいあさあるくことをつづけています。','স্বাস্থ্যের জন্য প্রতিদিন সকালে হাঁটা চালিয়ে যাচ্ছি।','স্বাস্থ্য'],
    '慣れる':['日本の電車の乗り方にも慣れてきました。','にほんのでんしゃののりかたにもなれてきました。','জাপানের ট্রেনে ওঠার নিয়মেও অভ্যস্ত হয়ে গেছি।','জাপান লাইফ'],
    '断る':['体調が悪かったので残業を断りました。','たいちょうがわるかったのでざんぎょうをことわりました。','শরীর খারাপ থাকায় ওভারটাইম করতে না বলেছি।','কাজ'],
    '任せる':['予約の手続きは友達に任せました。','よやくのてつづきはともだちにまかせました。','রিজার্ভেশনের কাজ বন্ধুর ওপর ছেড়ে দিয়েছি।','দৈনন্দিন'],
    '結果':['面接の結果をメールで確認しました。','めんせつのけっかをめーるでかくにんしました。','ইন্টারভিউর ফল ইমেইলে যাচাই করেছি।','চাকরি'],
    '原因':['電車が止まった原因は事故でした。','でんしゃがとまったげんいんはじこでした。','ট্রেন বন্ধ হওয়ার কারণ ছিল দুর্ঘটনা।','ট্রেন'],
    '影響':['円安は生活費にも影響します。','えんやすはせいかつひにもえいきょうします。','ইয়েন দুর্বল হলে জীবনযাত্রার খরচেও প্রভাব পড়ে।','জীবন'],
    '条件':['アルバイトの条件を店長に確認しました。','あるばいとのじょうけんをてんちょうにかくにんしました。','পার্ট-টাইম কাজের শর্ত ম্যানেজারের কাছে যাচাই করেছি।','বাইতো'],
    '方法':['駅まで一番早く行く方法を調べました。','えきまでいちばんはやくいくほうほうをしらべました。','স্টেশনে সবচেয়ে দ্রুত যাওয়ার উপায় খুঁজেছি।','যাত্রা'],
    '場合':['カードをなくした場合はすぐに連絡してください。','かーどをなくしたばあいはすぐにれんらくしてください。','কার্ড হারালে সঙ্গে সঙ্গে যোগাযোগ করুন।','জরুরি'],
    '途中':['帰宅途中にコンビニへ寄りました。','きたくとちゅうにこんびにへよりました。','বাসায় ফেরার পথে কনবিনিতে ঢুকেছিলাম।','দৈনন্দিন'],
    '以前':['以前働いていた店の近くを通りました。','いぜんはたらいていたみせのちかくをとおりました。','আগে যেখানে কাজ করতাম সেই দোকানের পাশ দিয়ে গেছি।','জীবন'],
    '以外':['この部屋は学生以外も借りられます。','このへやはがくせいいがいもかりられます。','এই রুম ছাত্র ছাড়াও অন্যরা ভাড়া নিতে পারে।','বাসা'],
    'やっと':['やっと市役所の手続きが全部終わりました。','やっとしやくしょのてつづきがぜんぶおわりました。','অবশেষে সিটি অফিসের সব প্রক্রিয়া শেষ হয়েছে।','সিটি অফিস']
  };

  const words = DATA.flatMap(part => part.words || []);
  for (const word of words) {
    const examples = word[5];
    const extra = EX4[word[0]];
    if (Array.isArray(examples) && examples.length < 4 && extra) examples.push(extra);
  }

  const WORDS_PER_PART = 6;
  const rebuilt = [];
  for (let i = 0; i < words.length; i += WORDS_PER_PART) {
    const n = Math.floor(i / WORDS_PER_PART) + 1;
    rebuilt.push({
      title: `Part ${n}`,
      sub: `N3 Vocabulary • বাস্তব Japan usage • ${Math.min(WORDS_PER_PART, words.length - i)} words`,
      words: words.slice(i, i + WORDS_PER_PART)
    });
  }
  DATA.splice(0, DATA.length, ...rebuilt);

  const totalWords = words.length;
  const totalExamples = words.reduce((sum, w) => sum + (Array.isArray(w[5]) ? w[5].length : 0), 0);
  const heroText = document.querySelector('.hero p');
  if (heroText) heroText.textContent = 'শুধু অর্থ মুখস্থ নয়—জাপানে বাস্তবে কীভাবে বলা হয় সেটা শিখুন। প্রতিটি শব্দে ফুরিগানা, বাংলা অর্থ এবং ৪টি বাস্তব উদাহরণ।';
  const badges = document.querySelector('.hero-badges');
  if (badges) badges.innerHTML = `<span>${DATA.length} Parts</span><span>${totalWords} Core Words</span><span>${totalExamples} Real Examples</span><span>Furigana + বাংলা</span>`;
  const summary = document.querySelector('.summary > span:first-child');
  if (summary) summary.textContent = `Part 1 → Part ${DATA.length} • Part-এ tap করলে খুলবে • শেখা শব্দ ✓ দিয়ে mark করতে পারবেন`;

  if (typeof render === 'function') render();
})();

/* Run 24: N3 vocab parts i18n (defensive). In the current build nothing loads
   this file and DATA is undefined, so this block is a complete no-op today;
   if the parts app is ever revived, it swaps the example glosses/categories
   and chrome strings from the per-language vocab sidecar before rendering. */
(function () {
  if (typeof DATA === "undefined" || !Array.isArray(DATA)) return;
  function run24Lang() {
    try { if (window.AponarDynLang) return window.AponarDynLang(); } catch (e) {}
    var ok = { bn: 1, en: 1, ja: 1, vi: 1, ne: 1, hi: 1, ur: 1, my: 1, zh: 1, si: 1, fil: 1 };
    var p = document.documentElement ? document.documentElement.getAttribute("data-language-preset") : null;
    if (p && ok[p]) return p;
    var s = location.pathname.split("/").filter(Boolean)[0];
    return s && ok[s] ? s : "bn";
  }
  var L = run24Lang();
  if (!L || L === "bn") return;
  var s = document.createElement("script");
  s.src = "/assets/i18n/data/n3-vocab." + L + ".js?v=20261121.24";
  s.onload = function () {
    var V = window.AponarN3Vocab;
    if (!V || !V.vparts) return;
    var map = V.vparts;
    DATA.forEach(function (part) {
      (part.words || []).forEach(function (w) {
        (w[5] || []).forEach(function (ex) {
          if (Object.prototype.hasOwnProperty.call(map, ex[2])) ex[2] = map[ex[2]];
          if (Object.prototype.hasOwnProperty.call(map, ex[3])) ex[3] = map[ex[3]];
        });
      });
    });
    function renderTpl(tpl, vals) {
      return tpl.replace(/\$\{([^}]*)\}/g, function (_, e) {
        var k = e.trim();
        return k in vals ? String(vals[k]) : _;
      });
    }
    var totalWords = DATA.reduce(function (a, p) { return a + (p.words || []).length; }, 0);
    var totalExamples = DATA.reduce(function (a, p) {
      return a + (p.words || []).reduce(function (b, w) { return b + (w[5] || []).length; }, 0);
    }, 0);
    var vals = { "DATA.length": DATA.length, totalWords: totalWords, totalExamples: totalExamples, "words.length": totalWords };
    var pats = V.vpartsPatterns || [];
    var heroP = document.querySelector(".hero p");
    if (heroP && Object.prototype.hasOwnProperty.call(map, heroP.textContent)) heroP.textContent = map[heroP.textContent];
    var badges = document.querySelector(".hero-badges");
    if (badges) pats.forEach(function (p) { if (renderTpl(p.s, vals) === badges.innerHTML) badges.innerHTML = renderTpl(p.t, vals); });
    var sum = document.querySelector(".summary > span:first-child");
    if (sum) pats.forEach(function (p) { if (renderTpl(p.s, vals) === sum.textContent) sum.textContent = renderTpl(p.t, vals); });
    DATA.forEach(function (part, pi) {
      var start = pi * 6;
      var v2 = Object.assign({}, vals);
      v2["i"] = start;
      v2["i + 1"] = start + 1;
      v2["Math.min(WORDS_PER_PART, words.length - i)"] = Math.min(6, totalWords - start);
      v2["i + Math.min(WORDS_PER_PART, words.length - i)"] = start + Math.min(6, totalWords - start);
      pats.forEach(function (p) { if (renderTpl(p.s, v2) === part.sub) part.sub = renderTpl(p.t, v2); });
    });
    if (typeof render === "function") render();
  };
  (document.head || document.documentElement).appendChild(s);
})();
