(()=>{
  'use strict';
  const pane=document.getElementById('revisionPane');
  if(!pane||document.getElementById('revxRoot')) return;
  const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const STORE='an_full_revision_v2';
  const LEGACY='an_jlpt_revision_v1';
  const load=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch(_){return{}}};
  const save=()=>localStorage.setItem(STORE,JSON.stringify(state));
  const legacy=load(LEGACY);
  const state={level:legacy.level||'N5',mode:'full',done:{},selected:'grammar',quiz:{},...load(STORE)};
  if(!['N5','N4','N3'].includes(state.level))state.level='N5';
  if(!['full','quick','weak','final'].includes(state.mode))state.mode='full';

  const routes={
    N5:{grammar:'/n5-grammar',vocab:'/n5-vocabulary',kanji:'/n5-kanji',reading:'/n5-reading-part1',reading2:'/n5-reading-part2',listening:'/n5-listening',mock:'/n5-mock-tests',quiz:'/jlpt-quiz?level=n5&category=grammar&part=1'},
    N4:{grammar:'/n4-grammar',vocab:'/n4-vocabulary',kanji:'/n4-kanji',reading:'/n4-reading',reading2:'/quiz',listening:'/n4-listening',mock:'/n4-mock-tests',quiz:'/jlpt-quiz?level=n4&category=grammar&part=1'},
    N3:{grammar:'/n3-matome-grammar',grammar2:'/n3-grammar',vocab:'/n3-vocabulary',kanji:'/n3-kanji',reading:'/n3-reading',reading2:'/quiz',listening:'/n3-listening',mock:'/n3-mock-tests',quiz:'/jlpt-quiz?level=n3&category=grammar&part=1'}
  };

  const categories=[
    {key:'grammar',icon:'文',title:'Grammar মাতোমে',sub:'Formula · nuance · ভুল ধরুন'},
    {key:'vocab',icon:'語',title:'Vocabulary Revision',sub:'Meaning · usage · similar word'},
    {key:'kanji',icon:'漢',title:'Kanji Revision',sub:'Reading · word · recall'},
    {key:'reading',icon:'読',title:'Reading Revision',sub:'Clue · main point · time'},
    {key:'listening',icon:'聴',title:'Listening Revision',sub:'Key word · change · answer'},
    {key:'tricks',icon:'技',title:'Exam Tricks',sub:'Question pattern · elimination'},
    {key:'mistakes',icon:'!',title:'Weak & Mistakes',sub:'ভুলগুলো আগে ঠিক করুন'},
    {key:'mock',icon:'試',title:'Mock Test',sub:'Timed exam · score review'},
    {key:'flash',icon:'札',title:'Flash Recall',sub:'Kanji weak queue · active recall'},
    {key:'final',icon:'✓',title:'Final Checklist',sub:'পরীক্ষার আগে শেষ ঝালাই'}
  ];

  const sheets={
    N5:{
      grammar:{a:['は = topic, が = নতুন/জোর দেওয়া subject','を = direct object, に = destination/time, で = action place','へ = direction, と = with/quotation, から・まで = from/to'],b:['Vて + います → চলমান কাজ/অবস্থা','Vない + でください → করবেন না','Vたいです → করতে চাই','V辞書形 + ことができます → করতে পারি'],formula:'N は N です / Vます・Vません / Vました・Vませんでした',example:'<ruby>毎日<rt>まいにち</rt></ruby><ruby>日本語<rt>にほんご</rt></ruby>を<ruby>勉強<rt>べんきょう</rt></ruby>しています。 — প্রতিদিন জাপানি পড়ছি।'},
      vocab:{a:['সময়: 今日・明日・昨日・毎日・今週','স্থান: 学校・駅・店・病院・銀行','কাজ: 行く・来る・帰る・食べる・見る・聞く'],b:['大きい ↔ 小さい','新しい ↔ 古い','多い ↔ 少ない','早い ↔ 遅い'],formula:'শব্দ শুধু বাংলা অর্থে নয়—কোন particle/verb-এর সঙ্গে আসে সেটাও মনে রাখুন।',example:'<ruby>駅<rt>えき</rt></ruby>で<ruby>友達<rt>ともだち</rt></ruby>に<ruby>会<rt>あ</rt></ruby>います。'},
      kanji:{a:['日・月・火・水・木・金・土','人・子・女・男・学・校・先・生','上・下・中・外・左・右・前・後'],b:['reading দেখেই শব্দ চিনুন: 日本、毎日、学校、先生','একটি kanji → 2টি পরিচিত word বলুন','ভুল kanji Flash Recall-এ পাঠান'],formula:'Kanji → reading → word → ছোট sentence = ৪ ধাপ recall',example:'<ruby>学校<rt>がっこう</rt></ruby>へ<ruby>行<rt>い</rt></ruby>きます。'},
      reading:{a:['প্রথমে প্রশ্ন পড়ুন—কি খুঁজতে হবে বুঝুন','সময়/স্থান/ব্যক্তির নাম underline করুন','でも・しかし = contrast; だから = result'],b:['সব sentence translate করার দরকার নেই','শেষ sentence-এ main point থাকার সম্ভাবনা দেখুন','option-এর অতিরিক্ত/ভুল তথ্য বাদ দিন'],formula:'Question → keyword → matching sentence → option check',example:'「明日は休みです。店は開きません。」→ কাল দোকান বন্ধ।'},
      listening:{a:['Who / Where / When / What আগে ধরুন','数字・曜日・時間 শুনলে মনে রাখুন','でも・じゃ・それでは-এর পরে plan বদলাতে পারে'],b:['প্রথমবার meaning, দ্বিতীয়বার decision ধরুন','শেষে কে কী করবে সেটাই answer হতে পারে','একটি শব্দ না বুঝলেও শুনতে থাকুন'],formula:'Situation → key detail → final decision',example:'「3時ではなく、4時に会いましょう。」→ final time = 4時'},
      tricks:{a:['Particles: verb দেখে particle ঠিক করুন','Blank-এর আগে/পরে form দেখে option কাটুন','Sentence order-এ fixed pair আগে খুঁজুন'],b:['এক প্রশ্নে বেশি সময় নয়','দুটি option একইরকম হলে nuance দেখুন','Reading-এ question keyword text-এ খুঁজুন'],formula:'Form → Meaning → Context — এই ক্রমে answer যাচাই',example:'先生（　）質問します → 人に質問する → に'},
      mistakes:{a:['は / が গুলিয়ে ফেলা','に / で গুলিয়ে ফেলা','て-form ও plain form ভুল করা'],b:['সময় expression-এ সবসময় に লাগে না: 今日、毎日','あります = জড় বস্তু; います = প্রাণী/মানুষ','い-adjective-এর negative: 〜くない'],formula:'ভুল answer লিখে রাখুন: কেন ভুল + সঠিক rule + ১টি example',example:'毎日（×に）学校へ行きます。'},
      mock:{a:['Vocabulary/Kanji → Grammar/Reading → Listening','সময় ধরে এক বসায় practice করুন','শেষে score নয়—ভুলের কারণ লিখুন'],b:['Guess করা question-ও review করুন','একই ভুল ২ বার হলে Weak list-এ রাখুন','পরের mock-এর আগে শুধু weak অংশ revise'],formula:'Mock → mistake log → targeted revision → re-test',example:'Mock 01 শেষে 10টি ভুল হলে category অনুযায়ী ভাগ করুন।'},
      flash:{a:['আজকের due card আগে করুন','ভুলে গেছি → দ্রুত আবার দেখুন','পেরেছি → interval বাড়ান'],b:['Kanji দেখে বাংলা নয়, reading-ও বলুন','শব্দ দিয়ে ১টি sentence মনে করুন','Weak queue শূন্য করা লক্ষ্য নয়; ঠিকভাবে recall লক্ষ্য'],formula:'See → Recall → Flip → Rate',example:'休 → やすむ → 休みます。'},
      final:{a:['Particles / verb forms একবার দেখুন','সময়, সংখ্যা, counter revise করুন','Kanji weak list 10–20টি দেখুন'],b:['Reading technique মনে করুন','Listening-এ final decision ধরার rule মনে করুন','পরীক্ষার সময় panic হলে সহজ question আগে'],formula:'শেষ দিনে নতুন chapter নয়—যা পড়েছেন সেটাই শক্ত করুন।',example:'নিজের mistake list + quick sheet + 1 short mock = যথেষ্ট।'}
    },
    N4:{
      grammar:{a:['普通形 + と思います → মনে করি','〜かもしれません → হতে পারে','〜なければなりません → অবশ্যই করতে হবে','〜てしまいます → সম্পূর্ণ/অনিচ্ছাকৃতভাবে হয়ে যাওয়া'],b:['〜ようになります → অবস্থার পরিবর্তন','〜予定です → পরিকল্পনা','〜ながら → একই সময়ে দুই কাজ','〜そうです → দেখে মনে হয় / শুনেছি—form আলাদা'],formula:'Plain form চিনুন: V辞書/ない/た/なかった + pattern',example:'<ruby>日本語<rt>にほんご</rt></ruby>が<ruby>話<rt>はな</rt></ruby>せるようになりました。'},
      vocab:{a:['予定・予約・準備・連絡・説明・確認','必要・大切・便利・不便・安全・危険','間に合う・遅れる・決める・変わる'],b:['始める vs 始まる','決める vs 決まる','変える vs 変わる','落とす vs 落ちる'],formula:'Transitive / intransitive pair একসাথে revise করুন।',example:'予定が変わりました。時間を変えました。'},
      kanji:{a:['働・験・説・変・決・予・連・急','意・味・使・方・場・所・必・要','駅/仕事/生活-এ বেশি দেখা compound পড়ুন'],b:['音読み দিয়ে compound চিনুন','訓読み দিয়ে verb/adjective চিনুন','similar shape আলাদা করে লিখুন'],formula:'Kanji একা নয়: 経験・説明・予定-এর মতো compound হিসেবে মনে রাখুন।',example:'<ruby>予定<rt>よてい</rt></ruby>を<ruby>確認<rt>かくにん</rt></ruby>します。'},
      reading:{a:['Notice/message-এ purpose আগে ধরুন','誰が誰に লিখেছে—relationship ধরুন','しかし・ところが・一方で = contrast clue'],b:['指示語: これ/それ/その → আগের noun খুঁজুন','理由: ので・ため・から','writer-এর final opinion শেষে থাকতে পারে'],formula:'Purpose → relationship → clue → answer',example:'「雨のため、中止します。」→ cancellation-এর কারণ = rain'},
      listening:{a:['প্রথম line-এ situation চিনুন','request/permission/plan change ধরুন','数字, deadline, order of actions note করুন'],b:['〜つもり/予定 = intention/plan','やっぱり = আগের সিদ্ধান্ত বদলাতে পারে','じゃあ/それなら-এর পর final action শুনুন'],formula:'Initial plan ≠ final plan হতে পারে। শেষ সিদ্ধান্ত ধরুন।',example:'「火曜は無理です。じゃ、水曜にしましょう。」→ 水曜'},
      tricks:{a:['普通形 লাগবে কি না প্রথমে দেখুন','sentence order-এ grammar chunk একসাথে রাখুন','similar grammar-এ speaker intent দেখুন'],b:['Reading option text-এর ভাষা বদলে paraphrase হতে পারে','Listening-এ first answer শুনেই mark করবেন না','unknown word = পুরো প্রশ্ন ছেড়ে দেবেন না'],formula:'Structure → clue → intention → eliminate',example:'Vた + ことがあります = past experience'},
      mistakes:{a:['そうです দুই ব্যবহার গুলিয়ে ফেলা','ように / ために গুলিয়ে ফেলা','てある / ている পার্থক্য ভুল'],b:['自動詞・他動詞 pair ভুল','plain form-এর আগে polite form বসানো','のに-কে কারণ হিসেবে পড়া'],formula:'Wrong grammar-এর পাশে “কেন নয়?” লিখুন—শুধু correct answer নয়।',example:'雨なのに、出かけます。 = বৃষ্টি হলেও/সত্ত্বেও বাইরে যাই।'},
      mock:{a:['N4 mock 01–10 থেকে timed practice','Grammar + reading-এর time split আগে ঠিক করুন','Listening শেষে uncertain question note করুন'],b:['score trend দেখুন','category accuracy আলাদা করুন','weak grammar আবার 5 প্রশ্ন practice করুন'],formula:'Test → analyse by category → fix → next test',example:'Grammar 60%, Reading 80% হলে next revision grammar-first।'},
      flash:{a:['N4 weak kanji + N5 forgotten kanji','compound reading active recall','একই kanji-র 2টি word বলুন'],b:['wrong card দ্রুত repeat','hard card next-day repeat','good card spaced interval'],formula:'Kanji → reading → compound → meaning → sentence',example:'決 → 決める / 決定'},
      final:{a:['普通形 table মাথায় পরিষ্কার করুন','N4 top contrast grammar revise','transitive/intransitive pair দেখুন'],b:['Reading clue list একবার পড়ুন','Listening plan-change signal revise','একটি short timed quiz দিন'],formula:'শেষ দিন = ভুল কমানো; নতুন rule যোগ করা নয়।',example:'নিজের top 20 mistake নিয়ে final pass করুন।'}
    },
    N3:{
      grammar:{a:['〜に対して → প্রতি/বিপরীতে','〜によると → সূত্র অনুযায়ী','〜たびに → যখনই/প্রতিবার','〜うちに → সময়/অবস্থা বদলানোর আগে'],b:['〜わけではない → এমন নয় যে...','〜ばかり → শুধু/এইমাত্র—context দেখুন','〜ために vs 〜ように → goal ও controllability','〜ことになっている → নিয়ম/নির্ধারিত ব্যবস্থা'],formula:'N3-তে শুধু অর্থ নয়—接続 (form) + nuance + situation একসাথে মনে রাখুন।',example:'<ruby>規則<rt>きそく</rt></ruby>により、ここでは<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>撮<rt>と</rt></ruby>れません。'},
      vocab:{a:['状況・確認・対応・応募・関係・比較','増加・減少・影響・原因・結果・目的','実際・特に・例えば・一方・つまり'],b:['必ず vs きっと','かなり vs ずいぶん','結局 vs ついに','場合 vs 状況'],formula:'N3 vocab = collocation + nuance. কোন noun/verb-এর সঙ্গে আসে মনে রাখুন।',example:'状況を確認する / 求人に応募する / 影響を与える'},
      kanji:{a:['際・況・確・増・減・比・関・対・応・認','compound-এর meaning অংশভাগ করে ধরুন','news/work/daily-life context-এ frequent kanji revise করুন'],b:['同音語তে context দেখুন','熟語 reading aloud করুন','weak kanji-তে example word লিখুন'],formula:'N3 Kanji → compound recognition speed বাড়ানোই মূল লক্ষ্য।',example:'確認（かくにん）・対応（たいおう）・関係（かんけい）'},
      reading:{a:['প্রথমে প্রশ্ন: 筆者の考え? 理由? 内容一致?','接続詞 দিয়ে structure ভাগ করুন','この/その内容 কোন sentence-কে refer করছে ধরুন'],b:['উদাহরণ আর main claim আলাদা করুন','negative wording মিস করবেন না','option text paraphrase হতে পারে—exact word match প্রয়োজন নেই'],formula:'Question → paragraph role → contrast/result → writer position',example:'「しかし」の পরে writer-এর মূল অবস্থান আসতে পারে।'},
      listening:{a:['Task-based: শেষে কী করতে হবে?','Point: speaker-এর সবচেয়ে গুরুত্বপূর্ণ তথ্য কী?','Summary: পুরো কথার উদ্দেশ্য ধরুন'],b:['言い直し/訂正 signal শুনুন: いや、やっぱり、というより','tone ও indirect refusal ধরুন','option আগে দেখে possible key words predict করুন'],formula:'Prediction → listen → correction/final decision → answer',example:'「行けないことはないけど…」 সরাসরি “yes” নাও হতে পারে।'},
      tricks:{a:['Grammar option-এর 接続 compare করুন','★ ordering-এ fixed expression chunk বানান','long reading-এ paragraph role লিখে নিন'],b:['absolute words (必ず/全部) option-এ সন্দেহ করুন যদি text তা না বলে','writer opinion বনাম quoted opinion আলাদা করুন','Listening-এ indirect answer ধরুন'],formula:'Connection + nuance + discourse = N3 answer',example:'「〜わけではない」 = সম্পূর্ণ অস্বীকার নয়; partial negation।'},
      mistakes:{a:['বাংলা অর্থ মিললেই grammar same ধরে নেওয়া','接続 না দেখে option নির্বাচন','reading-এ নিজের ধারণা দিয়ে answer করা'],b:['Listening correction signal miss করা','similar kanji compound গুলিয়ে ফেলা','unknown word-এ থেমে context হারানো'],formula:'Mistake log: প্রশ্ন → আমার কারণ → আসল clue → next-time rule',example:'〜ために / 〜ように: goal হলেও verb control অনুযায়ী ব্যবহার বদলায়।'},
      mock:{a:['N3 mock 01–10 timed করুন','Language knowledge + Reading stamina তৈরি করুন','Listening শেষে reasonসহ mistake mark করুন'],b:['accuracy নয়, speed-ও track করুন','guess করা correct answer-ও review করুন','একই weak category 2 mock ধরে থাকলে targeted lesson খুলুন'],formula:'Timed mock → analytics → repair → re-test',example:'Reading slow হলে next day 2 passage timed scan practice করুন।'},
      flash:{a:['N3 weak kanji আগে','compound meaning context দিয়ে recall','N4/N5 forgotten card-ও ফিরে আসতে দিন'],b:['reading aloud','2 compound recall','1 context sentence'],formula:'Recognize fast, then confirm reading and nuance.',example:'対 → 対応 / 反対 / 〜に対して'},
      final:{a:['Top grammar comparison sheet দেখুন','connectors/reading clue revise করুন','weak kanji compound 20–30টি active recall'],b:['Listening indirect response signal দেখুন','১টি short mixed quiz','পরীক্ষার আগের রাতে নতুন বড় topic নয়'],formula:'Final pass = high-yield recall + confidence + timing.',example:'নিজের সবচেয়ে বেশি ভুল হওয়া 3 category আগে শেষ করুন।'}
    }
  };

  const quizzes={
    N5:[
      {q:'毎日、学校（　）日本語を勉強します。',o:['に','で','を','と'],a:1,e:'Action place: 学校で勉強します。'},
      {q:'きのう映画を（　）。',o:['見ます','見ました','見るです','見ません'],a:1,e:'きのう = past, তাই 見ました。'},
      {q:'このりんごは三つ（　）500円です。',o:['を','で','に','が'],a:1,e:'Quantity + で price/total বোঝাতে পারে।'},
      {q:'日曜日は会社へ（　）。',o:['行きません','行きますか','行きたいでした','行くます'],a:0,e:'ছুটির দিনে না যাওয়ার simple polite negative: 行きません。'},
      {q:'「毎日」の読み方は？',o:['まいげつ','まいにち','きょう','にちようび'],a:1,e:'毎日 = まいにち。'}
    ],
    N4:[
      {q:'日本へ行く（　）です。',o:['予定','経験','説明','必要'],a:0,e:'V辞書形 + 予定です = পরিকল্পনা।'},
      {q:'薬を飲ま（　）なりません。',o:['ないで','なくて','なければ','ないほど'],a:2,e:'〜なければなりません = অবশ্যই করতে হবে।'},
      {q:'窓が開い（　）います。',o:['で','て','た','に'],a:1,e:'自動詞 開く → 開いています: window is open.'},
      {q:'音楽を聞き（　）勉強します。',o:['まで','ながら','しか','ので'],a:1,e:'Vます-stem + ながら = একই সময়ে দুই কাজ।'},
      {q:'「予定が変わりました」の意味は？',o:['পরিকল্পনা শুরু হয়েছে','পরিকল্পনা বদলেছে','পরিকল্পনা শেষ হয়েছে','পরিকল্পনা নেই'],a:1,e:'変わる = পরিবর্তিত হওয়া।'}
    ],
    N3:[
      {q:'天気予報（　）、明日は雨だそうです。',o:['に対して','によると','たびに','うちに'],a:1,e:'Source অনুযায়ী তথ্য: 〜によると。'},
      {q:'この制度は外国人（　）便利です。',o:['に対して','にとって','について','によって'],a:1,e:'কাউকে/কোন গোষ্ঠীকে দৃষ্টিকোণ হিসেবে: 〜にとって。'},
      {q:'日本へ行く（　）、この写真を撮ります。',o:['たびに','わけで','ほどに','だけで'],a:0,e:'প্রতিবার ঘটলে: V辞書形 + たびに。'},
      {q:'全部が難しい（　）。簡単な問題もあります。',o:['わけではありません','ためです','ことになります','ばかりです'],a:0,e:'Partial negation: 〜わけではない।'},
      {q:'「状況を確認する」に一番近い意味は？',o:['পরিস্থিতি নিশ্চিত/যাচাই করা','পরিস্থিতি বদলানো','পরিস্থিতি লুকানো','পরিস্থিতি তুলনা করা'],a:0,e:'確認する = check/confirm.'}
    ]
  };

  const modeSets={full:categories.map(x=>x.key),quick:['grammar','vocab','kanji','tricks','listening','final'],weak:['mistakes','flash','grammar','vocab','mock'],final:['grammar','tricks','reading','listening','mock','final']};

  [...pane.children].forEach(el=>el.classList.add('revx-legacy'));
  const root=document.createElement('div');root.id='revxRoot';root.className='revx-root';pane.prepend(root);

  function oldStats(){
    const cards=legacy.cards||{};const prefix=state.level+'-';
    const list=Object.entries(cards).filter(([k])=>k.startsWith(prefix));
    return {seen:list.filter(([,v])=>v&&v.seen).length,wrong:list.filter(([,v])=>v&&v.wrong).length,weak:(legacy.weak||[]).filter(x=>String(x).startsWith(prefix)).length};
  }
  function doneKey(key){return `${state.level}:${key}`}
  function isDone(key){return !!state.done[doneKey(key)]}
  function toggleDone(key){state.done[doneKey(key)]=!isDone(key);save();renderAll();}
  function progress(){const keys=categories.map(x=>x.key);const n=keys.filter(isDone).length;return {n,total:keys.length,pct:Math.round(n/keys.length*100)}}
  function selectedCategory(){return categories.find(x=>x.key===state.selected)||categories[0]}
  function syncLegacyLevel(level){
    const btn=document.querySelector(`#flashPane .level-btn[data-level="${level}"]`);
    if(btn&&!btn.classList.contains('active'))btn.click();
    try{const o=load(LEGACY);o.level=level;localStorage.setItem(LEGACY,JSON.stringify(o));}catch(_){ }
  }
  function setLevel(level){if(!['N5','N4','N3'].includes(level))return;state.level=level;state.selected='grammar';save();syncLegacyLevel(level);renderAll();}
  function setMode(mode){state.mode=mode;save();renderAll();}

  function routeLinks(key){const r=routes[state.level];const links=[];
    if(key==='grammar'){links.push(['পুরো Grammar',r.grammar]);if(r.grammar2)links.push(['আরও Grammar',r.grammar2]);links.push(['Grammar VS','/grammar-vs']);}
    if(key==='vocab')links.push(['পূর্ণ Vocabulary',r.vocab],['Vocabulary Quiz',`/jlpt-quiz?level=${state.level.toLowerCase()}&category=vocabulary&part=1`]);
    if(key==='kanji')links.push(['পূর্ণ Kanji',r.kanji],['Kanji Flashcards','#flash']);
    if(key==='reading')links.push(['Reading Practice',r.reading],['আরও Reading',r.reading2]);
    if(key==='listening')links.push(['Listening Lesson',r.listening],['Listening Lab','/listening-lab']);
    if(key==='tricks')links.push(['Study Guide','/study-guide'],['Mixed Quiz','/quiz']);
    if(key==='mistakes')links.push(['Grammar VS','/grammar-vs'],['Quiz Practice',r.quiz]);
    if(key==='mock')links.push([`${state.level} Mock Test`,r.mock],['সব Mock Test','/mock-test']);
    if(key==='flash')links.push(['Kanji Flashcards','#flash'],['Kanji Library',r.kanji]);
    if(key==='final')links.push(['Study Guide','/study-guide'],['Mock Test',r.mock]);
    return links;
  }

  function renderShell(){
    const p=progress(),os=oldStats();const visible=modeSets[state.mode];
    root.innerHTML=`
      <section class="revx-hero">
        <span class="revx-kicker">JLPT REVISION COMMAND CENTER</span>
        <h2><span>${state.level}</span> — এক জায়গায় পুরো রিভিশন</h2>
        <p>Grammar, Vocabulary, Kanji, Reading, Listening, exam tricks, weak mistakes, Flash Recall এবং Mock Test—শুধু link না; এখানে quick sheet দেখে revise করবেন, তারপর প্রয়োজন হলে full lesson খুলবেন।</p>
        <div class="revx-badges"><span class="revx-badge">⚡ Quick Recall</span><span class="revx-badge">✓ Progress Save</span><span class="revx-badge">🎯 Weak Focus</span><span class="revx-badge">📱 Mobile 2-column</span></div>
      </section>
      <div class="revx-toolbar">
        <div class="revx-levels" aria-label="JLPT level">${['N5','N4','N3'].map(l=>`<button class="revx-level ${l===state.level?'active':''}" data-revx-level="${l}">${l}</button>`).join('')}</div>
        <button class="revx-reset" id="revxReset">Progress reset</button>
      </div>
      <div class="revx-modes">${[['full','সব'],['quick','৩০ মিনিট'],['weak','Weak'],['final','Final Day']].map(([k,t])=>`<button class="revx-mode ${k===state.mode?'active':''}" data-revx-mode="${k}">${t}</button>`).join('')}</div>
      <div class="revx-overview">
        <div class="revx-progress-card"><div class="revx-progress-top"><strong>${state.level} Revision Progress</strong><b>${p.pct}%</b></div><div class="revx-progress-track"><div class="revx-progress-fill" style="width:${p.pct}%"></div></div><div class="revx-progress-meta"><div class="revx-mini"><b>${p.n}/${p.total}</b><small>Section revised</small></div><div class="revx-mini"><b>${os.weak}</b><small>Weak Kanji</small></div><div class="revx-mini"><b>${os.wrong}</b><small>Kanji mistakes</small></div></div></div>
        <div class="revx-mission"><small>TODAY'S MISSION</small><h3>${p.pct===100?'রিভিশন সম্পূর্ণ—এখন Mock দিন':p.pct>=50?'Weak অংশ শেষ করুন':'Grammar → Kanji → Listening শুরু করুন'}</h3><p>${state.mode==='quick'?'৩০ মিনিটে high-yield অংশগুলো দ্রুত ঝালাই করুন।':state.mode==='weak'?'আগের ভুল ও দুর্বল অংশকে priority দিন।':'প্রতিটি card খুলে quick sheet পড়ুন, তারপর Revised mark করুন।'}</p><button id="revxMission">${p.pct===100?'Mock Test খুলুন':'পরের অসম্পূর্ণ অংশ খুলুন'} →</button></div>
      </div>
      <div class="revx-section-head"><div><h3>Revision Library</h3><p>একবারে কোন category-ই বাদ যাবে না</p></div><span>${visible.length}টি focus section</span></div>
      <div class="revx-grid" id="revxGrid">${categories.filter(c=>visible.includes(c.key)).map(c=>`<button class="revx-card ${isDone(c.key)?'done':''}" data-key="${c.key}"><span class="revx-visual"><span class="revx-icon">${c.icon}</span></span><span class="revx-copy"><strong>${c.title}</strong><small>${c.sub}</small></span></button>`).join('')}</div>
      <div id="revxDetail"></div>
      ${renderSprint()}
      ${renderQuiz()}
      ${renderFinalChecks()}
    `;
    bind();renderDetail();
  }

  function renderDetail(){
    const host=document.getElementById('revxDetail');if(!host)return;
    const c=selectedCategory(),s=sheets[state.level][c.key],links=routeLinks(c.key);
    const secondTitle=c.key==='mistakes'?'এই ভুলগুলো এড়িয়ে চলুন':c.key==='tricks'?'Answer করার নিয়ম':'আরও মনে রাখুন';
    host.innerHTML=`<section class="revx-detail" id="revxDetailCard"><div class="revx-detail-head"><div class="revx-detail-icon">${c.icon}</div><div><h3>${state.level} · ${c.title}</h3><p>${c.sub} — quick sheet + full practice</p></div><div class="revx-detail-actions"><button class="revx-action" id="revxClose">উপরে যান</button><button class="revx-action primary" id="revxDone">${isDone(c.key)?'✓ Revised':'Revised mark করুন'}</button></div></div><div class="revx-detail-body"><div class="revx-sheet-grid"><div class="revx-sheet"><h4>এখনই যা revise করবেন</h4><ul>${s.a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="revx-sheet"><h4>${secondTitle}</h4><ul>${s.b.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div><span class="revx-formula">${esc(s.formula)}</span><div class="revx-example"><b>Example:</b> ${s.example}</div><div class="revx-link-row">${links.map(([t,h],i)=>`<a class="revx-link ${i===0?'main':''}" href="${h}">${esc(t)} ↗</a>`).join('')}</div></div></section>`;
    document.getElementById('revxDone')?.addEventListener('click',()=>toggleDone(c.key));
    document.getElementById('revxClose')?.addEventListener('click',()=>document.getElementById('revxGrid')?.scrollIntoView({behavior:'smooth',block:'start'}));
    host.querySelectorAll('a[href="#flash"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.querySelector('.section-tab[data-tab="flash"]')?.click();history.replaceState(null,'','#flash');document.querySelector('.section-tabs')?.scrollIntoView({behavior:'smooth'});}));
  }

  function renderSprint(){
    const items=state.mode==='quick'?[['05','Kanji/Vocab','weak word + kanji recall'],['10','Grammar','top forms + traps'],['07','Reading','clue + one passage'],['08','Listening','final decision + quick practice']]:state.mode==='final'?[['10','Weak list','নিজের ভুল'],['15','Grammar','similar rules'],['15','Listening','signal words'],['20','Mock','short timed test']]:[['15','Language','Kanji + Vocabulary'],['20','Grammar','form + nuance'],['15','Reading','clue practice'],['10','Listening','decision practice']];
    return `<section><div class="revx-section-head"><div><h3>${state.mode==='quick'?'30-Minute Sprint':'Revision Route'}</h3><p>কী ক্রমে পড়বেন সেটাও তৈরি আছে</p></div></div><div class="revx-sprint">${items.map(([m,t,d],i)=>`<div class="revx-sprint-item"><b>${m}${state.mode==='quick'?'m':''}</b><strong>${i+1}. ${t}</strong><small>${d}</small></div>`).join('')}</div></section>`;
  }

  function renderQuiz(){
    const qs=quizzes[state.level],qIndex=Math.min(state.quiz[state.level]?.index||0,qs.length-1),q=qs[qIndex],score=state.quiz[state.level]?.score||0;
    return `<section class="revx-quiz" id="revxQuiz"><div class="revx-quiz-top"><h3>⚡ ${state.level} Mixed Recall</h3><span class="revx-quiz-score">Score ${score}/${qIndex}</span></div><div class="revx-question"><div class="q">${esc(q.q)}</div><div class="revx-options">${q.o.map((o,i)=>`<button class="revx-option" data-qopt="${i}">${esc(o)}</button>`).join('')}</div><div class="revx-explain" id="revxExplain"></div><button class="revx-next" id="revxNext">পরের প্রশ্ন →</button></div></section>`;
  }

  function renderFinalChecks(){const list=['Grammar form/接続 একবার দেখেছি','Weak Kanji active recall করেছি','Vocabulary similar words দেখেছি','Reading clue strategy মনে আছে','Listening final-decision signal মনে আছে','কমপক্ষে ১টি timed mock/quiz করেছি','ভুল answer-এর কারণ বুঝেছি','Exam day time split ঠিক করেছি','নতুন বড় topic শুরু করছি না'];return `<section><div class="revx-section-head"><div><h3>Final Coverage Checklist</h3><p>এই ৯টি হলে revision সত্যি complete</p></div></div><div class="revx-final-check">${list.map(x=>`<div class="revx-check">${x}</div>`).join('')}</div></section>`}

  function bind(){
    root.querySelectorAll('[data-revx-level]').forEach(b=>b.addEventListener('click',()=>setLevel(b.dataset.revxLevel)));
    root.querySelectorAll('[data-revx-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.revxMode)));
    root.querySelectorAll('.revx-card').forEach(b=>b.addEventListener('click',()=>{state.selected=b.dataset.key;save();renderDetail();setTimeout(()=>document.getElementById('revxDetailCard')?.scrollIntoView({behavior:'smooth',block:'start'}),20);}));
    document.getElementById('revxReset')?.addEventListener('click',()=>{if(confirm(`${state.level} revision progress reset করবেন?`)){categories.forEach(c=>delete state.done[`${state.level}:${c.key}`]);state.quiz[state.level]={index:0,score:0};save();renderAll();}});
    document.getElementById('revxMission')?.addEventListener('click',()=>{const p=progress();if(p.pct===100){location.href=routes[state.level].mock;return;}const next=categories.find(c=>!isDone(c.key));state.selected=(next||categories[0]).key;save();renderDetail();setTimeout(()=>document.getElementById('revxDetailCard')?.scrollIntoView({behavior:'smooth',block:'start'}),20);});
    bindQuiz();
  }

  function bindQuiz(){
    const qs=quizzes[state.level],qState=state.quiz[state.level]||{index:0,score:0};let locked=false;
    root.querySelectorAll('[data-qopt]').forEach(btn=>btn.addEventListener('click',()=>{if(locked)return;locked=true;const idx=+btn.dataset.qopt,q=qs[Math.min(qState.index||0,qs.length-1)];root.querySelectorAll('[data-qopt]').forEach((b,i)=>{if(i===q.a)b.classList.add('correct');else if(i===idx)b.classList.add('wrong');b.disabled=true;});const ex=document.getElementById('revxExplain');if(ex){ex.textContent=(idx===q.a?'✓ সঠিক। ':'✗ সঠিক উত্তর: '+q.o[q.a]+'। ')+q.e;ex.classList.add('show');}if(idx===q.a){qState.score=(qState.score||0)+1;}state.quiz[state.level]=qState;save();const next=document.getElementById('revxNext');if(next){next.classList.add('show');next.textContent=qState.index>=qs.length-1?'আবার শুরু করুন ↻':'পরের প্রশ্ন →';}}));
    document.getElementById('revxNext')?.addEventListener('click',()=>{qState.index=(qState.index||0)+1;if(qState.index>=qs.length){qState.index=0;qState.score=0;}state.quiz[state.level]=qState;save();renderAll();setTimeout(()=>document.getElementById('revxQuiz')?.scrollIntoView({behavior:'smooth',block:'center'}),20);});
  }

  function renderAll(){renderShell();}
  renderAll();
  syncLegacyLevel(state.level);

  const activateFromHash=()=>{if(/^#revision/i.test(location.hash)){document.querySelector('.section-tab[data-tab="revision"]')?.click();setTimeout(()=>pane.scrollIntoView({behavior:'smooth',block:'start'}),80);}};
  activateFromHash();window.addEventListener('hashchange',activateFromHash);
})();
