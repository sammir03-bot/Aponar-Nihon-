(() => {
  'use strict';

  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const $ = (s, r = document) => r.querySelector(s);

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  const kana = (value) => String(value ?? '')
    .replace(/（([^）]+)）/g, '$1')
    .replace(/\(([^)]+)\)/g, '$1')
    .replace(/[／/].*$/, '')
    .trim();

  const normaliseTarget = (word, reading) => {
    let w = kana(word), r = kana(reading || word);
    if (w.startsWith('～')) {
      w = '３' + w.slice(1);
      r = 'さん' + r.replace(/^～/, '');
    }
    return { word: w, reading: r };
  };

  const targetRuby = (word, reading) =>
    `<ruby>${escapeHtml(word)}<rt>${escapeHtml(reading)}</rt></ruby>`;

  function textWithoutRt(ruby) {
    if (!ruby) return '';
    const copy = ruby.cloneNode(true);
    copy.querySelectorAll('rt').forEach(rt => rt.remove());
    return copy.textContent.trim();
  }

  function getLessonNo(row) {
    const lesson = row.closest('.lesson-card');
    const m = lesson?.id?.match(/lesson-(\d+)/);
    return m ? Number(m[1]) : 0;
  }

  function getWord(row) {
    const ruby = $('.word-jp ruby', row);
    const word = textWithoutRt(ruby) || $('.word-jp', row)?.textContent.trim() || '';
    const reading = $('rt', ruby)?.textContent.trim() || word;
    const bn = $('.word-bn', row)?.textContent.trim() || '';
    const posEl = $('.pos', row);
    const pos = (posEl?.getAttribute('title') || '').trim();
    const search = (row.dataset.search || '').toLowerCase();
    const lessonNo = getLessonNo(row);
    return { ...normaliseTarget(word, reading), bn, pos, search, lessonNo };
  }

  function classify({ word, pos, search, lessonNo }) {
    if (pos === 'suf' || /^～/.test(word)) return 'counter';
    if (pos === 'adv') return 'adverb';
    if (pos === 'a-na') return 'naAdj';
    if (pos === 'a-i') return 'iAdj';
    if (pos === 'v') return 'verb';

    const predicateEnd = /(?:ている|でいる|てある|である|になる|となる|がある|がいる|がいい|がよい|が悪い|がわるい|が濃い|が薄い|が多い|が少ない|が高い|が低い|が強い|が弱い|が乾く|がぬれている|が湿っている|が冷えている|が効いている|がつく|がかかる|が終わる|が始まる|が決まる|が変わる|が違う|が足りる|が足りない|が間に合う|が遅れる|が壊れる|が汚れる|が伸びる|が縮む|が落ちる|が止まる|が動く|が開く|が閉まる|が混む|が空く|が込む|がすく|だ)$/;
    if (predicateEnd.test(word)) return 'clause';

    const verbEnd = /(?:する|くる|来る|いく|行く|[うくぐすつぬぶむる])$/;
    if (verbEnd.test(word) && !/(ビール|ボール|タオル|ホテル|ルール|メール|シール|オイル|タイトル|スタイル|レベル|トラブル|スケジュール)$/.test(word)) return 'verb';

    if (/[をにへでとがは].+/.test(word) && /(い|ない|だ)$/.test(word)) return 'clause';
    if (pos === 'adj' || (/[ぁ-ん一-龯]い$/.test(word) && !/(場合|具合|祝い|出会い|付き合い|違い|支払い|お見舞い|向かい|周り|終わり|始まり|集まり)$/.test(word))) return 'iAdj';

    if (lessonNo === 7 || /(昨日|今日|明日|一昨日|あさって|しあさって|元日|元旦|曜日|週間|今週|来週|先週|今月|来月|先月|今年|来年|去年|午前|午後|時|分|日|月|年)$/.test(word)) return 'time';

    if (search.includes('adverb')) return 'adverb';
    return 'noun';
  }

  const corpusExamples = window.N3_VOCAB_CORPUS_EXAMPLES || {};
  const authoredExamples = window.N3_VOCAB_AUTHORED_EXAMPLES || {};
  const corpusUpgrades = window.N3_VOCAB_CORPUS_UPGRADES || {};

  const example = (jp, yomi, bangla, tag, extra = {}) => ({ jp, yomi, bangla, tag, ...extra });

  function stableHash(value) {
    let hash = 2166136261;
    for (const char of String(value)) {
      hash ^= char.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function pickTemplates(templates, count, info, salt = '') {
    if (!templates.length || count < 1) return [];
    const output = [];
    const used = new Set();
    const hash = stableHash(`${info.word}|${info.reading}|${info.lessonNo}|${salt}`);
    let index = hash % templates.length;
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    let step = 1 + ((hash >>> 8) % Math.max(1, templates.length - 1));
    while (gcd(step, templates.length) !== 1) step = (step % templates.length) + 1;
    while (output.length < Math.min(count, templates.length)) {
      if (!used.has(index)) {
        used.add(index);
        output.push(templates[index](info));
      }
      index = (index + step) % templates.length;
    }
    return output;
  }

  function sourceExample(info) {
    const source = corpusExamples[`${info.word}␟${info.reading}`];
    if (!source) return null;
    const upgrade = corpusUpgrades[`${info.word}␟${info.reading}`];
    const match = String(source.match || info.word);
    const pieces = String(source.text || '').split(match);
    const highlighted = pieces.map(escapeHtml).join(targetRuby(match, info.reading));
    return example(
      upgrade ? upgrade.jp : highlighted,
      source.reading || `টার্গেট: ${info.reading}`,
      upgrade ? upgrade.bn : `এই বাক্যে “${info.word}” অর্থ “${info.bn || info.word}”। আগে নিজে পুরো বাক্যের অর্থ ধরার চেষ্টা করুন।`,
      'Corpus • বাস্তব বাক্য',
      {
        speak: source.text,
        readingIsFull: Boolean(source.reading),
        source: {
          id: source.id,
          author: source.author,
          url: `https://tatoeba.org/en/sentences/show/${encodeURIComponent(source.id)}`
        }
      }
    );
  }

  function commonStudyTemplates() {
    return [
      ({ word, reading, bn }) => example(`先生が「${targetRuby(word, reading)}」の使い方を説明しました。`, `せんせいが「${reading}」のつかいかたをせつめいしました。`, `শিক্ষক “${bn}”-এর ব্যবহার বুঝিয়েছেন।`, 'শেখার practice'),
      ({ word, reading, bn }) => example(`ノートに「${targetRuby(word, reading)}」を使った文を書きました。`, `のーとに「${reading}」をつかったぶんをかきました。`, `“${bn}” ব্যবহার করে নোটে একটি বাক্য লিখেছি।`, 'লিখে practice'),
      ({ word, reading, bn }) => example(`「${targetRuby(word, reading)}」を別の文でも使ってみましょう。`, `「${reading}」をべつのぶんでもつかってみましょう。`, `“${bn}” অন্য একটি বাক্যেও ব্যবহার করে দেখুন।`, 'নিজে বানান'),
      ({ word, reading, bn }) => example(`「${targetRuby(word, reading)}」と一緒によく使う言葉を探しました。`, `「${reading}」といっしょによくつかうことばをさがしました。`, `“${bn}”-এর সঙ্গে বেশি ব্যবহৃত শব্দ খুঁজেছি।`, 'Collocation'),
      ({ word, reading, bn }) => example(`会話の中で「${targetRuby(word, reading)}」を聞き取りました。`, `かいわのなかで「${reading}」をききとりました。`, `কথোপকথনের মধ্যে “${bn}” শুনে ধরেছি।`, 'শুনে practice'),
      ({ word, reading, bn }) => example(`今日覚えたい言葉は「${targetRuby(word, reading)}」です。`, `きょうおぼえたいことばは「${reading}」です。`, `আজ যে শব্দটি মনে রাখতে চাই সেটি “${bn}”।`, 'আজকের শব্দ'),
      ({ word, reading, bn }) => example(`「${targetRuby(word, reading)}」を使って、自分のことを話してください。`, `「${reading}」をつかって、じぶんのことをはなしてください。`, `“${bn}” ব্যবহার করে নিজের কথা বলুন।`, 'Speaking'),
      ({ word, reading, bn }) => example(`「${targetRuby(word, reading)}」が使われる場面を考えました。`, `「${reading}」がつかわれるばめんをかんがえました。`, `“${bn}” কোন পরিস্থিতিতে ব্যবহৃত হয়, তা ভেবেছি।`, 'ব্যবহারের場面'),
      ({ word, reading, bn }) => example(`辞書で「${targetRuby(word, reading)}」の例文を確認しました。`, `じしょで「${reading}」のれいぶんをかくにんしました。`, `অভিধানে “${bn}”-এর উদাহরণ বাক্য যাচাই করেছি।`, 'Dictionary'),
      ({ word, reading, bn }) => example(`「${targetRuby(word, reading)}」を三回、声に出して読みました。`, `「${reading}」をさんかい、こえにだしてよみました。`, `“${bn}” তিনবার জোরে পড়েছি।`, 'Shadowing'),
      ({ word, reading, bn }) => example(`忘れないように「${targetRuby(word, reading)}」をメモしました。`, `わすれないように「${reading}」をめもしました。`, `ভুলে না যেতে “${bn}” লিখে রেখেছি।`, 'মনে রাখুন'),
      ({ word, reading, bn }) => example(`友達と「${targetRuby(word, reading)}」を使った文を作りました。`, `ともだちと「${reading}」をつかったぶんをつくりました。`, `বন্ধুর সঙ্গে “${bn}” ব্যবহার করে বাক্য বানিয়েছি।`, 'Pair practice'),
      ({ word, reading, bn }) => example(`「${targetRuby(word, reading)}」の読み方と意味を確認してください。`, `「${reading}」のよみかたといみをかくにんしてください。`, `“${bn}”-এর পড়া ও অর্থ যাচাই করুন।`, 'Recall'),
      ({ word, reading, bn }) => example(`明日、「${targetRuby(word, reading)}」をもう一度復習します。`, `あした、「${reading}」をもういちどふくしゅうします。`, `কাল “${bn}” আরেকবার রিভিশন দেব।`, 'Revision'),
      ({ word, reading, bn }) => example(`「${targetRuby(word, reading)}」を短い会話で使ってみました。`, `「${reading}」をみじかいかいわでつかってみました。`, `ছোট কথোপকথনে “${bn}” ব্যবহার করে দেখেছি।`, 'কথোপকথন'),
      ({ word, reading, bn }) => example(`先生に「${targetRuby(word, reading)}」のニュアンスを質問しました。`, `せんせいに「${reading}」のにゅあんすをしつもんしました。`, `শিক্ষককে “${bn}”-এর সূক্ষ্ম ব্যবহার জিজ্ঞেস করেছি।`, 'Nuance'),
      ({ word, reading, bn }) => example(`「${targetRuby(word, reading)}」が自然に使えるまで練習します。`, `「${reading}」がしぜんにつかえるまでれんしゅうします。`, `“${bn}” স্বাভাবিকভাবে বলতে পারা পর্যন্ত অনুশীলন করব।`, 'Fluency'),
      ({ word, reading, bn }) => example(`この場面では「${targetRuby(word, reading)}」が使えますか。`, `このばめんでは「${reading}」がつかえますか。`, `এই পরিস্থিতিতে “${bn}” ব্যবহার করা যাবে কি?`, 'Check usage'),
      ({ word, reading, bn }) => example(`「${targetRuby(word, reading)}」と似た言葉の違いを調べました。`, `「${reading}」とにたことばのちがいをしらべました。`, `“${bn}”-এর কাছাকাছি শব্দগুলোর পার্থক্য দেখেছি।`, 'পার্থক্য')
    ];
  }

  function nounTemplates() {
    return [
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}について、もう少し詳しく説明してください。`, `${reading}について、もうすこしくわしくせつめいしてください。`, `${bn} সম্পর্কে আরেকটু বিস্তারিত বলুন।`, 'ব্যাখ্যা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}に関する情報を調べています。`, `${reading}にかんするじょうほうをしらべています。`, `${bn}-সংক্রান্ত তথ্য খুঁজছি।`, 'তথ্য খোঁজা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}のことをもっと知りたいです。`, `${reading}のことをもっとしりたいです。`, `${bn} সম্পর্কে আরও জানতে চাই।`, 'ইচ্ছা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}が必要かどうか、確認しました。`, `${reading}がひつようかどうか、かくにんしました。`, `${bn} প্রয়োজন কি না যাচাই করেছি।`, 'যাচাই'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}について質問があります。`, `${reading}についてしつもんがあります。`, `${bn} সম্পর্কে আমার একটি প্রশ্ন আছে।`, 'প্রশ্ন'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}を使った短い例を作りました。`, `${reading}をつかったみじかいれいをつくりました。`, `${bn} ব্যবহার করে ছোট একটি উদাহরণ বানিয়েছি।`, 'ছোট উদাহরণ'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}について先生に説明してもらいました。`, `${reading}についてせんせいにせつめいしてもらいました。`, `শিক্ষকের কাছ থেকে ${bn} সম্পর্কে ব্যাখ্যা নিয়েছি।`, 'শেখা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}はどんな時に使いますか。`, `${reading}はどんなときにつかいますか。`, `${bn} কোন সময়ে ব্যবহার করা হয়?`, 'ব্যবহারের সময়'),
      ({ word, reading, bn }) => example(`この文では、${targetRuby(word, reading)}が何を表していますか。`, `このぶんでは、${reading}がなにをあらわしていますか。`, `এই বাক্যে ${bn} কী বোঝাচ্ছে?`, 'Context check'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}が出てくる短い会話を作りました。`, `${reading}がでてくるみじかいかいわをつくりました。`, `${bn} আছে এমন ছোট কথোপকথন বানিয়েছি।`, 'কথোপকথন'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}の意味を、やさしい日本語で説明できますか。`, `${reading}のいみを、やさしいにほんごでせつめいできますか。`, `${bn}-এর অর্থ সহজ জাপানিতে বলতে পারবেন?`, 'Output'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}と似ているものを比べました。`, `${reading}とにているものをくらべました。`, `${bn}-এর সঙ্গে মিল আছে এমন জিনিস তুলনা করেছি।`, 'তুলনা')
    ];
  }

  function verbTemplates() {
    return [
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}前に、ルールを確認してください。`, `${reading}まえに、るーるをかくにんしてください。`, `${bn} করার আগে নিয়ম যাচাই করুন।`, 'আগে'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}かどうか、状況を見て決めます。`, `${reading}かどうか、じょうきょうをみてきめます。`, `পরিস্থিতি দেখে ${bn} করব কি না ঠিক করব।`, 'সিদ্ধান্ত'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}方法を先生に質問しました。`, `${reading}ほうほうをせんせいにしつもんしました。`, `${bn} করার পদ্ধতি শিক্ষককে জিজ্ঞেস করেছি।`, 'কীভাবে'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ときは、十分に気をつけてください。`, `${reading}ときは、じゅうぶんにきをつけてください。`, `${bn} করার সময় যথেষ্ট সতর্ক থাকুন।`, 'সতর্কতা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ためには、何が必要ですか。`, `${reading}ためには、なにがひつようですか。`, `${bn} করতে কী প্রয়োজন?`, 'প্রয়োজন'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ことについて、友達と話しました。`, `${reading}ことについて、ともだちとはなしました。`, `${bn} করা নিয়ে বন্ধুর সঙ্গে কথা বলেছি।`, 'আলোচনা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}必要があるか、もう一度考えます。`, `${reading}ひつようがあるか、もういちどかんがえます。`, `${bn} করা দরকার কি না আবার ভাবব।`, 'প্রয়োজন যাচাই'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}場合は、事前に知らせてください。`, `${reading}ばあいは、じぜんにしらせてください。`, `${bn} করলে আগে থেকে জানান।`, 'এমন হলে'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ことは、簡単ではありません。`, `${reading}ことは、かんたんではありません。`, `${bn} করা সহজ নয়।`, 'কঠিনতা'),
      ({ word, reading, bn }) => example(`初めて${targetRuby(word, reading)}人は、説明を読んでください。`, `はじめて${reading}ひとは、せつめいをよんでください。`, `যিনি প্রথমবার ${bn} করবেন, ব্যাখ্যাটি পড়ুন।`, 'প্রথমবার'),
      ({ word, reading, bn }) => example(`どうして${targetRuby(word, reading)}のか、理由を説明してください。`, `どうして${reading}のか、りゆうをせつめいしてください。`, `কেন ${bn} করবে, কারণটি বলুন।`, 'কারণ'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ことになったら、早めに準備します。`, `${reading}ことになったら、はやめにじゅんびします。`, `${bn} করার সিদ্ধান্ত হলে আগেই প্রস্তুতি নেব।`, 'প্রস্তুতি'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ときの注意点を調べました。`, `${reading}ときのちゅういてんをしらべました。`, `${bn} করার সময় কী কী খেয়াল রাখতে হয়, তা দেখেছি।`, '注意点'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}前に、周りの人に知らせます。`, `${reading}まえに、まわりのひとにしらせます。`, `${bn} করার আগে আশপাশের মানুষকে জানাব।`, 'আগে জানানো'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}かどうかは、本人が決めます。`, `${reading}かどうかは、ほんにんがきめます。`, `${bn} করবে কি না সংশ্লিষ্ট ব্যক্তি ঠিক করবে।`, 'নিজের সিদ্ধান্ত'),
      ({ word, reading, bn }) => example(`安全に${targetRuby(word, reading)}方法を調べました。`, `あんぜんに${reading}ほうほうをしらべました。`, `নিরাপদে ${bn} করার পদ্ধতি দেখেছি।`, 'নিরাপদ ব্যবহার'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}練習を、少しずつ続けています。`, `${reading}れんしゅうを、すこしずつつづけています。`, `${bn} করার অনুশীলন একটু একটু করে চালিয়ে যাচ্ছি।`, 'ধীরে practice'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ことができるか、試してみました。`, `${reading}ことができるか、ためしてみました。`, `${bn} করতে পারি কি না চেষ্টা করে দেখেছি।`, 'চেষ্টা')
    ];
  }

  function clauseTemplates() {
    return [
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}そうです。`, `${reading}そうです。`, `শুনেছি—${bn}।`, 'শোনা কথা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}かもしれません。`, `${reading}かもしれません。`, `হয়তো ${bn}।`, 'সম্ভাবনা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ので、予定を変えました。`, `${reading}ので、よていをかえました。`, `${bn} বলে পরিকল্পনা বদলেছি।`, 'কারণ'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}かどうか、確認してください。`, `${reading}かどうか、かくにんしてください。`, `${bn} কি না যাচাই করুন।`, 'যাচাই'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ときは、すぐに連絡してください。`, `${reading}ときは、すぐにれんらくしてください。`, `${bn} হলে সঙ্গে সঙ্গে যোগাযোগ করুন।`, 'পরিস্থিতি'),
      ({ word, reading, bn }) => example(`もし${targetRuby(word, reading)}なら、別の方法を考えます。`, `もし${reading}なら、べつのほうほうをかんがえます。`, `যদি ${bn} হয়, অন্য উপায় ভাবব।`, 'শর্ত'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}と聞きました。`, `${reading}とききました。`, `শুনেছি যে ${bn}।`, 'উদ্ধৃতি'),
      ({ word, reading, bn }) => example(`私も${targetRuby(word, reading)}と思います。`, `わたしも${reading}とおもいます。`, `আমিও মনে করি ${bn}।`, 'মতামত'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}場合は、受付に相談してください。`, `${reading}ばあいは、うけつけにそうだんしてください。`, `${bn} হলে রিসেপশনে পরামর্শ নিন।`, 'এমন হলে'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ため、少し遅れます。`, `${reading}ため、すこしおくれます。`, `${bn} বলে একটু দেরি হবে।`, 'ফলাফল'),
      ({ word, reading, bn }) => example(`本当に${targetRuby(word, reading)}のですか。`, `ほんとうに${reading}のですか。`, `সত্যিই কি ${bn}?`, 'নিশ্চিতকরণ'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}という連絡がありました。`, `${reading}というれんらくがありました。`, `${bn}—এমন খবর এসেছে।`, 'খবর')
    ];
  }

  function iAdjectiveTemplates() {
    return [
      ({ word, reading, bn }) => example(`これは本当に${targetRuby(word, reading)}です。`, `これはほんとうに${reading}です。`, `এটি সত্যিই ${bn}।`, 'বর্ণনা'),
      ({ word, reading, bn }) => example(`思ったより${targetRuby(word, reading)}です。`, `おもったより${reading}です。`, `ভাবার চেয়ে ${bn}।`, 'তুলনা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}と感じました。`, `${reading}とかんじました。`, `আমার ${bn} মনে হয়েছে।`, 'অনুভূতি'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}かどうか、比べてください。`, `${reading}かどうか、くらべてください。`, `${bn} কি না তুলনা করে দেখুন।`, 'তুলনা'),
      ({ word, reading, bn }) => example(`こんなに${targetRuby(word, reading)}とは思いませんでした。`, `こんなに${reading}とはおもいませんでした。`, `এতটা ${bn} হবে ভাবিনি।`, 'অপ্রত্যাশিত'),
      ({ word, reading, bn }) => example(`少し${targetRuby(word, reading)}ですが、問題ありません。`, `すこし${reading}ですが、もんだいありません。`, `একটু ${bn}, তবে সমস্যা নেই।`, 'বিপরীত ভাব'),
      ({ word, reading, bn }) => example(`前より${targetRuby(word, reading)}です。`, `まえより${reading}です。`, `আগের চেয়ে ${bn}।`, 'পরিবর্তন'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ものを選びました。`, `${reading}ものをえらびました。`, `${bn} জিনিসটি বেছে নিয়েছি।`, 'বাছাই'),
      ({ word, reading, bn }) => example(`どうして${targetRuby(word, reading)}のか、理由を教えてください。`, `どうして${reading}のか、りゆうをおしえてください。`, `কেন ${bn}, কারণটি বলুন।`, 'কারণ'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}ときは、無理をしないでください。`, `${reading}ときは、むりをしないでください。`, `${bn} হলে জোর করবেন না।`, 'সতর্কতা'),
      ({ word, reading, bn }) => example(`見た目よりずっと${targetRuby(word, reading)}です。`, `みためよりずっと${reading}です。`, `দেখতে যা লাগে, তার চেয়ে অনেক বেশি ${bn}।`, 'দেখা বনাম সত্য'),
      ({ word, reading, bn }) => example(`本当に${targetRuby(word, reading)}ですね。`, `ほんとうに${reading}ですね。`, `সত্যিই ${bn}, তাই না?`, 'কথ্য')
    ];
  }

  function naAdjectiveTemplates() {
    return [
      ({ word, reading, bn }) => example(`この場所はとても${targetRuby(word, reading)}です。`, `このばしょはとても${reading}です。`, `এই জায়গাটি খুব ${bn}।`, 'বর্ণনা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}な場所を探しています。`, `${reading}なばしょをさがしています。`, `${bn} জায়গা খুঁজছি।`, 'খোঁজা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}なので、安心しました。`, `${reading}なので、あんしんしました。`, `${bn} বলে নিশ্চিন্ত হয়েছি।`, 'কারণ'),
      ({ word, reading, bn }) => example(`思ったより${targetRuby(word, reading)}でした。`, `おもったより${reading}でした。`, `ভাবার চেয়ে ${bn} ছিল।`, 'তুলনা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}な方法を選びました。`, `${reading}なほうほうをえらびました。`, `${bn} পদ্ধতি বেছে নিয়েছি।`, 'বাছাই'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}なら、ここに決めます。`, `${reading}なら、ここにきめます。`, `${bn} হলে এটিই ঠিক করব।`, 'শর্ত'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}かどうか、実際に見てください。`, `${reading}かどうか、じっさいにみてください。`, `${bn} কি না নিজে দেখে নিন।`, 'যাচাই'),
      ({ word, reading, bn }) => example(`もっと${targetRuby(word, reading)}な例を教えてください。`, `もっと${reading}なれいをおしえてください。`, `আরও ${bn} উদাহরণ বলুন।`, 'উদাহরণ'),
      ({ word, reading, bn }) => example(`前より${targetRuby(word, reading)}になりました。`, `まえより${reading}になりました。`, `আগের চেয়ে ${bn} হয়েছে।`, 'পরিবর্তন'),
      ({ word, reading, bn }) => example(`ここなら${targetRuby(word, reading)}に過ごせます。`, `ここなら${reading}にすごせます。`, `এখানে ${bn}ভাবে সময় কাটানো যায়।`, 'অবস্থা')
    ];
  }

  function adverbTemplates() {
    return [
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}確認してください。`, `${reading}かくにんしてください。`, `${bn}ভাবে যাচাই করুন।`, 'নির্দেশনা'),
      ({ word, reading, bn }) => example(`今日は${targetRuby(word, reading)}話しました。`, `きょうは${reading}はなしました。`, `আজ ${bn}ভাবে কথা বলেছি।`, 'কথা বলা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}準備を進めました。`, `${reading}じゅんびをすすめました。`, `${bn}ভাবে প্রস্তুতি এগিয়েছি।`, 'প্রস্তুতি'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}できるようになりました。`, `${reading}できるようになりました。`, `${bn}ভাবে করতে পারছি এখন।`, 'পরিবর্তন'),
      ({ word, reading, bn }) => example(`先生が${targetRuby(word, reading)}説明してくれました。`, `せんせいが${reading}せつめいしてくれました。`, `শিক্ষক ${bn}ভাবে বুঝিয়েছেন।`, 'ব্যাখ্যা'),
      ({ word, reading, bn }) => example(`もう一度、${targetRuby(word, reading)}考えてみます。`, `もういちど、${reading}かんがえてみます。`, `আরেকবার ${bn}ভাবে ভেবে দেখব।`, 'ভাবনা'),
      ({ word, reading, bn }) => example(`仕事は${targetRuby(word, reading)}進んでいます。`, `しごとは${reading}すすんでいます。`, `কাজ ${bn}ভাবে এগোচ্ছে।`, 'কাজ'),
      ({ word, reading, bn }) => example(`最近、生活が${targetRuby(word, reading)}変わりました。`, `さいきん、せいかつが${reading}かわりました。`, `সম্প্রতি জীবন ${bn}ভাবে বদলেছে।`, 'পরিবর্তন'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}答えても大丈夫です。`, `${reading}こたえてもだいじょうぶです。`, `${bn}ভাবে উত্তর দিলেও সমস্যা নেই।`, 'অনুমতি'),
      ({ word, reading, bn }) => example(`駅まで${targetRuby(word, reading)}歩きました。`, `えきまで${reading}あるきました。`, `স্টেশন পর্যন্ত ${bn}ভাবে হেঁটেছি।`, 'চলাফেরা')
    ];
  }

  function timeTemplates() {
    return [
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}、友達に会います。`, `${reading}、ともだちにあいます。`, `${bn}-এ বন্ধুর সঙ্গে দেখা করব।`, 'সময়'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}までに連絡してください。`, `${reading}までにれんらくしてください。`, `${bn}-এর মধ্যে যোগাযোগ করুন।`, 'সময়সীমা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}の予定を確認しました。`, `${reading}のよていをかくにんしました。`, `${bn}-এর পরিকল্পনা যাচাই করেছি।`, 'ক্যালেন্ডার'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}から勉強を始めます。`, `${reading}からべんきょうをはじめます。`, `${bn} থেকে পড়া শুরু করব।`, 'শুরু'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}は家でゆっくり休みます。`, `${reading}はいえでゆっくりやすみます。`, `${bn}-এ বাসায় বিশ্রাম নেব।`, 'পরিকল্পনা'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}になったら、もう一度確認します。`, `${reading}になったら、もういちどかくにんします。`, `${bn} হলে আবার যাচাই করব।`, 'সময় এলে'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}について家族に連絡しました。`, `${reading}についてかぞくにれんらくしました。`, `${bn} সম্পর্কে পরিবারকে জানিয়েছি।`, 'যোগাযোগ'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}は空いていますか。`, `${reading}はあいていますか。`, `${bn}-এ কি আপনার সময় খালি আছে?`, 'সময় জিজ্ঞেস')
    ];
  }

  function counterTemplates() {
    return [
      ({ word, reading, bn }) => example(`これを${targetRuby(word, reading)}ください。`, `これを${reading}ください。`, `এটি ${bn} দিন।`, 'দোকান'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}必要です。`, `${reading}ひつようです。`, `${bn} প্রয়োজন।`, 'পরিমাণ'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}で足りると思います。`, `${reading}でたりるとおもいます。`, `মনে হয় ${bn}-ই যথেষ্ট।`, 'যথেষ্ট'),
      ({ word, reading, bn }) => example(`一人に${targetRuby(word, reading)}ずつ配ってください。`, `ひとりに${reading}ずつくばってください。`, `প্রত্যেককে ${bn} করে দিন।`, 'বণ্টন'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}用意しました。`, `${reading}よういしました。`, `${bn} প্রস্তুত করেছি।`, 'প্রস্তুতি'),
      ({ word, reading, bn }) => example(`まだ${targetRuby(word, reading)}あります。`, `まだ${reading}あります。`, `এখনও ${bn} আছে।`, 'কত আছে'),
      ({ word, reading, bn }) => example(`${targetRuby(word, reading)}注文しました。`, `${reading}ちゅうもんしました。`, `${bn} অর্ডার করেছি।`, 'অর্ডার'),
      ({ word, reading, bn }) => example(`この中から${targetRuby(word, reading)}選んでください。`, `このなかから${reading}えらんでください。`, `এগুলোর মধ্যে থেকে ${bn} বেছে নিন।`, 'বাছাই')
    ];
  }

  function isCompleteEntry(word) {
    return /[「」『』]|[。！？!?]$/.test(word);
  }

  function curatedExamples(info) {
    const { word, reading } = info;
    const ruby = targetRuby(word, reading);
    const banks = {
      'お茶わん': [
        example(`${ruby}に<ruby>ご飯<rt>ごはん</rt></ruby>をよそいます。`, `${reading}にごはんをよそいます。`, 'ভাতের বাটিতে ভাত পরিবেশন করি।', 'রান্নাঘর'),
        example(`<ruby>食事<rt>しょくじ</rt></ruby>の<ruby>後<rt>あと</rt></ruby>で、${ruby}を<ruby>洗<rt>あら</rt></ruby>いました。`, `しょくじのあとで、${reading}をあらいました。`, 'খাওয়ার পর ভাতের বাটিটি ধুয়েছি।', 'ঘরের কাজ'),
        example(`この${ruby}は、<ruby>毎日<rt>まいにち</rt></ruby><ruby>使<rt>つか</rt></ruby>っています。`, `この${reading}は、まいにちつかっています。`, 'এই ভাতের বাটিটি প্রতিদিন ব্যবহার করি।', 'দৈনন্দিন'),
        example(`${ruby}を<ruby>食器棚<rt>しょっきだな</rt></ruby>に<ruby>戻<rt>もど</rt></ruby>してください。`, `${reading}をしょっきだなにもどしてください。`, 'ভাতের বাটিটি আলমারিতে ফিরিয়ে রাখুন।', 'নির্দেশনা')
      ],
      '時速１００キロで走る': [
        example(`この<ruby>車<rt>くるま</rt></ruby>は<ruby>高速道路<rt>こうそくどうろ</rt></ruby>を${ruby}ことができます。`, `このくるまはこうそくどうろを${reading}ことができます。`, 'এই গাড়িটি এক্সপ্রেসওয়েতে ঘণ্টায় ১০০ কিলোমিটার গতিতে চলতে পারে।', 'গাড়ি'),
        example(`${ruby}と、<ruby>止<rt>と</rt></ruby>まるまでの<ruby>距離<rt>きょり</rt></ruby>が<ruby>長<rt>なが</rt></ruby>くなります。`, `${reading}と、とまるまでのきょりがながくなります。`, 'ঘণ্টায় ১০০ কিলোমিটার গতিতে চললে থামার দূরত্ব বেড়ে যায়।', 'নিরাপত্তা'),
        example(`${ruby}<ruby>前<rt>まえ</rt></ruby>に、<ruby>制限速度<rt>せいげんそくど</rt></ruby>を<ruby>確認<rt>かくにん</rt></ruby>してください。`, `${reading}まえに、せいげんそくどをかくにんしてください。`, 'ঘণ্টায় ১০০ কিলোমিটার গতিতে চলার আগে গতিসীমা যাচাই করুন।', 'Traffic rule'),
        example(`<ruby>雨<rt>あめ</rt></ruby>の<ruby>日<rt>ひ</rt></ruby>に${ruby}のは<ruby>危険<rt>きけん</rt></ruby>です。`, `あめのひに${reading}のはきけんです。`, 'বৃষ্টির দিনে ঘণ্টায় ১০০ কিলোমিটার গতিতে চলা বিপজ্জনক।', 'সতর্কতা')
      ],
      'かける': [
        example(`３に４を${ruby}と、１２になります。`, `さんによんを${reading}と、じゅうにになります。`, '৩-কে ৪ দিয়ে গুণ করলে ১২ হয়।', 'গণিত'),
        example(`この<ruby>問題<rt>もんだい</rt></ruby>では、<ruby>二<rt>ふた</rt></ruby>つの<ruby>数<rt>かず</rt></ruby>を${ruby}。`, `このもんだいでは、ふたつのかずを${reading}。`, 'এই অঙ্কে দুটি সংখ্যা গুণ করতে হবে।', 'সমস্যা'),
        example(`５に０を${ruby}と、<ruby>答<rt>こた</rt></ruby>えは０です。`, `ごにぜろを${reading}と、こたえはぜろです。`, '৫-কে ০ দিয়ে গুণ করলে উত্তর ০।', 'উত্তর'),
        example(`まず<ruby>足<rt>た</rt></ruby>して、それから２を${ruby}。`, `まずたして、それからにを${reading}。`, 'প্রথমে যোগ করুন, তারপর ২ দিয়ে গুণ করুন।', 'ধাপ')
      ],
      '指定席': [
        example(`<ruby>新幹線<rt>しんかんせん</rt></ruby>の${ruby}を<ruby>予約<rt>よやく</rt></ruby>しました。`, `しんかんせんの${reading}をよやくしました。`, 'শিনকানসেনের সংরক্ষিত আসন বুক করেছি।', 'ট্রেন'),
        example(`${ruby}の<ruby>切符<rt>きっぷ</rt></ruby>を<ruby>見<rt>み</rt></ruby>せてください。`, `${reading}のきっぷをみせてください。`, 'সংরক্ষিত আসনের টিকিট দেখান।', 'টিকিট'),
        example(`<ruby>窓側<rt>まどがわ</rt></ruby>の${ruby}は<ruby>空<rt>あ</rt></ruby>いていますか。`, `まどがわの${reading}はあいていますか。`, 'জানালার পাশের সংরক্ষিত আসন খালি আছে কি?', 'জিজ্ঞেস'),
        example(`${ruby}は<ruby>何号車<rt>なんごうしゃ</rt></ruby>ですか。`, `${reading}はなんごうしゃですか。`, 'সংরক্ষিত আসনটি কোন বগিতে?', 'স্টেশন')
      ],
      'パンツ': [
        example(`<ruby>黒<rt>くろ</rt></ruby>い${ruby}に<ruby>白<rt>しろ</rt></ruby>いシャツを<ruby>合<rt>あ</rt></ruby>わせました。`, `くろい${reading}にしろいしゃつをあわせました。`, 'কালো প্যান্টের সঙ্গে সাদা শার্ট মিলিয়েছি।', 'পোশাক'),
        example(`この${ruby}は<ruby>少<rt>すこ</rt></ruby>しきついです。`, `この${reading}はすこしきついです。`, 'এই প্যান্টটি একটু আঁটসাঁট।', 'মাপ'),
        example(`<ruby>仕事<rt>しごと</rt></ruby>には、<ruby>落<rt>お</rt></ruby>ち<ruby>着<rt>つ</rt></ruby>いた<ruby>色<rt>いろ</rt></ruby>の${ruby}をはきます。`, `しごとには、おちついたいろの${reading}をはきます。`, 'কাজে শান্ত রঙের প্যান্ট পরি।', 'কাজের পোশাক'),
        example(`${ruby}のサイズを<ruby>確認<rt>かくにん</rt></ruby>してから<ruby>買<rt>か</rt></ruby>いました。`, `${reading}のさいずをかくにんしてからかいました。`, 'প্যান্টের মাপ যাচাই করে কিনেছি।', 'কেনাকাটা')
      ],
      '吐く': [
        example(`<ruby>気分<rt>きぶん</rt></ruby>が<ruby>悪<rt>わる</rt></ruby>くて、<ruby>食<rt>た</rt></ruby>べた<ruby>物<rt>もの</rt></ruby>を${ruby}ことがあります。`, `きぶんがわるくて、たべたものを${reading}ことがあります。`, 'শরীর খারাপ হয়ে কখনও খাওয়া খাবার বমি হয়েছে।', 'স্বাস্থ্য'),
        example(`<ruby>何度<rt>なんど</rt></ruby>も${ruby}なら、<ruby>医者<rt>いしゃ</rt></ruby>に<ruby>相談<rt>そうだん</rt></ruby>してください。`, `なんども${reading}なら、いしゃにそうだんしてください。`, 'বারবার বমি হলে ডাক্তারের পরামর্শ নিন।', 'পরামর্শ'),
        example(`<ruby>吐<rt>は</rt></ruby>き<ruby>気<rt>け</rt></ruby>はありますが、${ruby}ほどではありません。`, `はきけはありますが、${reading}ほどではありません。`, 'বমিভাব আছে, তবে বমি করার মতো নয়।', 'উপসর্গ'),
        example(`<ruby>子<rt>こ</rt></ruby>どもが<ruby>急<rt>きゅう</rt></ruby>に${ruby}ことがあります。`, `こどもがきゅうに${reading}ことがあります。`, 'শিশু কখনও হঠাৎ বমি করতে পারে।', 'সতর্কতা')
      ],
      'おごり': [
        example(`<ruby>今日<rt>きょう</rt></ruby>は<ruby>私<rt>わたし</rt></ruby>の${ruby}です。`, `きょうはわたしの${reading}です。`, 'আজ আমি খাওয়াব।', 'দাওয়াত'),
        example(`このコーヒーは<ruby>先輩<rt>せんぱい</rt></ruby>の${ruby}でした。`, `このこーひーはせんぱいの${reading}でした。`, 'এই কফিটি সিনিয়র খাইয়েছেন।', 'ক্যাফে'),
        example(`<ruby>次<rt>つぎ</rt></ruby>は<ruby>私<rt>わたし</rt></ruby>の${ruby}にさせてください。`, `つぎはわたしの${reading}にさせてください。`, 'পরেরবার আমাকে খাওয়াতে দিন।', 'কথ্য'),
        example(`「ここは<ruby>僕<rt>ぼく</rt></ruby>の${ruby}だよ」と<ruby>友達<rt>ともだち</rt></ruby>が<ruby>言<rt>い</rt></ruby>いました。`, `「ここはぼくの${reading}だよ」とともだちがいいました。`, '“এখানে আমি খাওয়াব,” বন্ধু বলল।', 'সংলাপ')
      ],
      '道路が混んでいる': [
        example(`<ruby>朝<rt>あさ</rt></ruby>は${ruby}ので、<ruby>早<rt>はや</rt></ruby>く<ruby>家<rt>いえ</rt></ruby>を<ruby>出<rt>で</rt></ruby>ます。`, `あさは${reading}ので、はやくいえをでます。`, 'সকালে রাস্তা ভিড় থাকে বলে তাড়াতাড়ি বাসা থেকে বের হই।', 'সকাল'),
        example(`${ruby}と、バスが<ruby>遅<rt>おく</rt></ruby>れることがあります。`, `${reading}と、ばすがおくれることがあります。`, 'রাস্তা ভিড় থাকলে বাস কখনও দেরি করে।', 'বাস'),
        example(`<ruby>今日<rt>きょう</rt></ruby>は${ruby}か、<ruby>地図<rt>ちず</rt></ruby>で<ruby>確認<rt>かくにん</rt></ruby>しました。`, `きょうは${reading}か、ちずでかくにんしました。`, 'আজ রাস্তা ভিড় কি না ম্যাপে দেখেছি।', 'মানচিত্র'),
        example(`${ruby}<ruby>時間<rt>じかん</rt></ruby>を<ruby>避<rt>さ</rt></ruby>けて<ruby>出発<rt>しゅっぱつ</rt></ruby>します。`, `${reading}じかんをさけてしゅっぱつします。`, 'রাস্তা ভিড় থাকে এমন সময় এড়িয়ে রওনা হব।', 'পরিকল্পনা')
      ]
    };
    return banks[word] || null;
  }

  function buildExamples(info) {
    const curated = curatedExamples(info);
    if (curated) return curated;
    const key = `${info.word}␟${info.reading}`;
    const authored = (authoredExamples[key] || []).map(ex =>
      example(ex.jp, ex.yomi, ex.bn, ex.tag));
    const source = sourceExample(info);

    if (isCompleteEntry(info.word)) {
      const output = [example(
        targetRuby(info.word, info.reading),
        info.reading,
        info.bn || 'সম্পূর্ণ কথোপকথনটি জোরে পড়ুন।',
        'মূল phrase',
        { speak: info.word }
      )];
      output.push(...authored);
      if (output.length > 1) return output.slice(0, 4);
      output.push(...pickTemplates(commonStudyTemplates(), 4 - output.length, info, 'dialogue'));
      return output.slice(0, 4);
    }

    const output = [];
    if (source) output.push(source);
    output.push(...authored);
    if (output.length) return output.slice(0, 4);

    // Last-resort fallback (no row should reach here after Run 51):
    const type = classify(info);
    const wanted = 4 - output.length;
    const banks = {
      verb: verbTemplates,
      clause: clauseTemplates,
      iAdj: iAdjectiveTemplates,
      naAdj: naAdjectiveTemplates,
      adverb: adverbTemplates,
      time: timeTemplates,
      counter: counterTemplates
    };
    if (banks[type]) {
      output.push(...pickTemplates(banks[type](), wanted, info, type));
    } else {
      const directCount = source ? 2 : 3;
      output.push(...pickTemplates(nounTemplates(), Math.min(directCount, 4 - output.length), info, 'noun'));
      output.push(...pickTemplates(commonStudyTemplates(), 4 - output.length, info, 'study'));
    }
    return output.slice(0, 4);
  }

  function renderExamples(row, examples) {
    const box = document.createElement('div');
    box.className = 'n3-vocab-examples';
    box.hidden = true;
    box.innerHTML = examples.map((ex, i) => `
      <div class="n3-vocab-example${ex.source ? ' is-source' : ''}">
        <div class="n3-ex-head">
          <span class="n3-ex-no">${i + 1}</span>
          <span class="n3-ex-tag">${escapeHtml(ex.tag)}</span>
          <button class="n3-ex-speak" type="button" data-speak="${escapeHtml(ex.speak || ex.jp.replace(/<rt>.*?<\/rt>/g, '').replace(/<[^>]+>/g, ''))}" aria-label="উচ্চারণ শুনুন">🔊</button>
        </div>
        <div class="n3-ex-jp">${ex.jp}</div>
        <div class="n3-ex-yomi"><b>${ex.readingIsFull ? '全文よみ：' : 'よみ：'}</b>${escapeHtml(ex.yomi)}</div>
        <div class="n3-ex-bn">${escapeHtml(ex.bangla)}</div>
        ${ex.source ? `<div class="n3-ex-source"><span>উৎস</span><a href="${escapeHtml(ex.source.url)}" target="_blank" rel="noopener noreferrer">Tatoeba #${escapeHtml(ex.source.id)} · ${escapeHtml(ex.source.author)}</a><small>বাক্য ও লাইসেন্স দেখুন ↗</small></div>` : ''}
      </div>`).join('');
    row.appendChild(box);
    return box;
  }

  function enhanceVocabularyRows() {
    const rows = $$('[data-vocab-row]');
    rows.forEach((row) => {
      if (row.dataset.examplesReady === '1') return;
      row.dataset.examplesReady = '1';
      row.classList.add('n3-vocab-expanded-row');

      const info = getWord(row);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'n3-example-toggle';
      button.innerHTML = '<span>ব্যবহার + Practice</span><span class="n3-example-arrow">⌄</span>';
      button.setAttribute('aria-expanded', 'false');

      const pos = $('.pos', row);
      if (pos) pos.insertAdjacentElement('afterend', button);
      else row.appendChild(button);

      let box = null;
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!box) box = renderExamples(row, buildExamples(info));
        const open = box.hidden;
        box.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
        row.classList.toggle('examples-open', open);
        button.querySelector('.n3-example-arrow').textContent = open ? '⌃' : '⌄';
      });
    });

    const sourceCount = rows.reduce((total, row) => {
      const info = getWord(row);
      return total + Number(Boolean(corpusExamples[`${info.word}␟${info.reading}`]));
    }, 0);
    const stats = $('.hero-stats');
    if (stats && !$('#n3ExampleStat', stats)) {
      const span = document.createElement('span');
      span.id = 'n3ExampleStat';
      span.innerHTML = `<b>${sourceCount}</b> source-backed বাক্য`;
      stats.appendChild(span);
    }
    return { total: rows.length, sourceCount };
  }

  function verticalPartPicker() {
    const nav = $('.part-nav');
    if (!nav) return;
    nav.classList.add('n3-vertical-parts');

    const all = $('.part-btn[data-week="all"]', nav);
    if (all) all.hidden = true;

    if (!$('.n3-part-label', nav.parentElement)) {
      const label = document.createElement('div');
      label.className = 'n3-part-label';
      label.innerHTML = '<b>Part বেছে নিন</b><small>Part 1 → Part 6 • tap করলে শুধু ওই Part খুলবে</small>';
      nav.before(label);
    }

    const buttons = $$('.part-btn:not([data-week="all"])', nav);
    buttons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      if (!btn.querySelector('.n3-part-chevron')) btn.insertAdjacentHTML('beforeend', '<span class="n3-part-chevron">›</span>');
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-expanded', String(b === btn));
        });
      });
    });

    if (buttons[0]) setTimeout(() => buttons[0].click(), 0);
  }

  function speech() {
    document.addEventListener('click', event => {
      const btn = event.target.closest('.n3-ex-speak');
      if (!btn || !('speechSynthesis' in window)) return;
      event.preventDefault();
      event.stopPropagation();
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(btn.dataset.speak || '');
      utterance.lang = 'ja-JP';
      utterance.rate = 0.86;
      speechSynthesis.speak(utterance);
    });
  }

  function updateCopy(total, sourceCount) {
    const heroCopy = $('.hero-copy');
    if (heroCopy) {
      heroCopy.textContent = `Nihongo Sou Matome N3-এর বইয়ের ক্রমে Lesson 1–36। মোট ${total.toLocaleString('en-US')} vocabulary—প্রতিটি শব্দের সঙ্গে furigana-সহ আসল উদাহরণ বাক্য ও বাংলা অনুবাদ, আর ${sourceCount.toLocaleString('en-US')}টিতে Tatoeba corpus-এর বাস্তব বাক্য ও উৎস link।`;
    }
    const note = $('.note-main p');
    if (note) note.textContent = 'Part খুলুন → শব্দ + furigana দেখুন → “ব্যবহার + Practice” tap করুন → উদাহরণ বাক্যগুলো পড়ুন ও বাংলা অনুবাদ মিলান → তারপর নিজে একই শব্দ দিয়ে বাক্য বলুন।';
    const studyNote = $('.study-note');
    if (studyNote && !$('#n3SourceNote')) {
      const sourceNote = document.createElement('aside');
      sourceNote.id = 'n3SourceNote';
      sourceNote.className = 'n3-source-note';
      sourceNote.innerHTML = '<b>উদাহরণ বাক্য সম্পর্কে</b><p>প্রতিটি শব্দের উদাহরণ বাক্য এই তালিকার জন্য লেখা আসল বাক্য—পুরো বাক্যে furigana ও বাংলা অনুবাদসহ। <strong>Corpus • বাস্তব বাক্য</strong> লেখা card-গুলোতে Tatoeba-র বাক্য আছে; সেখানে sentence ID, লেখক ও source/license link দেওয়া আছে।</p>';
      studyNote.insertAdjacentElement('afterend', sourceNote);
    }
  }

  function init() {
    const { total, sourceCount } = enhanceVocabularyRows();
    verticalPartPicker();
    speech();
    updateCopy(total, sourceCount);
    document.documentElement.classList.add('n3-all-vocab-ready');
    console.info(`[Aponar Nihon] N3 vocabulary ready: ${total} words / ${sourceCount} source-backed corpus examples`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

/* Run 24: N3 vocab i18n sidecar loader (bn = strict no-op). Loads the
   per-language data sidecar before the app renders; if document.write is
   unavailable, falls back to an async load (the sidecar self-initializes). */
(function () {
  function run24Lang() {
    try { if (window.AponarDynLang) return window.AponarDynLang(); } catch (e) {}
    var ok = { bn: 1, en: 1, ja: 1, vi: 1, ne: 1, hi: 1, ur: 1, my: 1, zh: 1, si: 1, fil: 1, id: 1, ar: 1, ml: 1 };
    var p = document.documentElement ? document.documentElement.getAttribute("data-language-preset") : null;
    if (p && ok[p]) return p;
    var s = location.pathname.split("/").filter(Boolean)[0];
    return s && ok[s] ? s : "bn";
  }
  var L = run24Lang();
  if (!L || L === "bn") return;
  var url = "/assets/i18n/data/n3-vocab." + L + ".js?v=20261126.51";
  document.write('<script src="' + url + '"><\/script>');
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.AponarN3Vocab) {
      var s = document.createElement("script");
      s.src = url;
      (document.head || document.documentElement).appendChild(s);
    }
  });
})();
