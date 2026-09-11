(()=>{'use strict';
const K=[
{l:'N5',k:'休',m:'বিশ্রাম / ছুটি',on:'キュウ',kun:'やすむ・やすみ',w:[['休む','やすむ','বিশ্রাম নেওয়া'],['休日','きゅうじつ','ছুটির দিন']],e:[['少し休みます。','すこし やすみます','একটু বিশ্রাম নেব।'],['日曜日は休日です。','にちようび は きゅうじつ です','রবিবার ছুটির দিন।']]},
{l:'N5',k:'日',m:'দিন / সূর্য',on:'ニチ・ジツ',kun:'ひ・か',w:[['日本','にほん','জাপান'],['毎日','まいにち','প্রতিদিন']],e:[['毎日日本語を勉強します。','まいにち にほんご を べんきょうします','প্রতিদিন জাপানি পড়ি।']]},
{l:'N5',k:'月',m:'মাস / চাঁদ',on:'ゲツ・ガツ',kun:'つき',w:[['月曜日','げつようび','সোমবার'],['今月','こんげつ','এই মাস']],e:[['今月は忙しいです。','こんげつ は いそがしい です','এই মাস ব্যস্ত।']]},
{l:'N5',k:'人',m:'মানুষ',on:'ジン・ニン',kun:'ひと',w:[['日本人','にほんじん','জাপানি ব্যক্তি'],['一人','ひとり','একজন']],e:[['あの人は先生です。','あの ひと は せんせい です','ওই ব্যক্তি শিক্ষক।']]},
{l:'N5',k:'学',m:'শেখা / অধ্যয়ন',on:'ガク',kun:'まなぶ',w:[['学生','がくせい','শিক্ষার্থী'],['学校','がっこう','স্কুল']],e:[['学校で日本語を学びます。','がっこう で にほんご を まなびます','স্কুলে জাপানি শিখি।']]},
{l:'N5',k:'食',m:'খাওয়া / খাবার',on:'ショク',kun:'たべる',w:[['食べる','たべる','খাওয়া'],['食事','しょくじ','খাবার/মিল']],e:[['朝ご飯を食べます。','あさごはん を たべます','সকালের খাবার খাই।']]},
{l:'N5',k:'行',m:'যাওয়া / কার্য',on:'コウ・ギョウ',kun:'いく・おこなう',w:[['行く','いく','যাওয়া'],['銀行','ぎんこう','ব্যাংক']],e:[['学校へ行きます。','がっこう へ いきます','স্কুলে যাই।']]},
{l:'N5',k:'見',m:'দেখা',on:'ケン',kun:'みる・みえる',w:[['見る','みる','দেখা'],['見せる','みせる','দেখানো']],e:[['映画を見ます。','えいが を みます','সিনেমা দেখি।']]},
{l:'N5',k:'時',m:'সময় / ঘণ্টা',on:'ジ',kun:'とき',w:[['時間','じかん','সময়'],['何時','なんじ','কয়টা']],e:[['今何時ですか。','いま なんじ ですか','এখন কয়টা?']]},
{l:'N5',k:'話',m:'কথা বলা / গল্প',on:'ワ',kun:'はなす・はなし',w:[['話す','はなす','কথা বলা'],['電話','でんわ','টেলিফোন']],e:[['日本語で話します。','にほんご で はなします','জাপানিতে কথা বলি।']]},
{l:'N4',k:'働',m:'কাজ করা',on:'ドウ',kun:'はたらく',w:[['働く','はたらく','কাজ করা'],['労働','ろうどう','শ্রম']],e:[['コンビニで働いています。','こんびに で はたらいて います','কনভিনিতে কাজ করছি।']]},
{l:'N4',k:'験',m:'পরীক্ষা / অভিজ্ঞতা',on:'ケン',kun:'—',w:[['試験','しけん','পরীক্ষা'],['経験','けいけん','অভিজ্ঞতা']],e:[['来月試験があります。','らいげつ しけん が あります','আগামী মাসে পরীক্ষা আছে।']]},
{l:'N4',k:'説',m:'ব্যাখ্যা / মত',on:'セツ・ゼイ',kun:'とく',w:[['説明','せつめい','ব্যাখ্যা'],['小説','しょうせつ','উপন্যাস']],e:[['先生が説明しました。','せんせい が せつめい しました','শিক্ষক ব্যাখ্যা করেছেন।']]},
{l:'N4',k:'変',m:'পরিবর্তন / অদ্ভুত',on:'ヘン',kun:'かわる・かえる',w:[['変わる','かわる','পরিবর্তিত হওয়া'],['大変','たいへん','কঠিন/ভীষণ']],e:[['予定が変わりました。','よてい が かわりました','পরিকল্পনা বদলেছে।']]},
{l:'N4',k:'決',m:'সিদ্ধান্ত',on:'ケツ',kun:'きめる・きまる',w:[['決める','きめる','সিদ্ধান্ত নেওয়া'],['決定','けってい','সিদ্ধান্ত']],e:[['時間を決めましょう。','じかん を きめましょう','সময় ঠিক করি।']]},
{l:'N4',k:'予',m:'আগে / পূর্ব',on:'ヨ',kun:'—',w:[['予定','よてい','পরিকল্পনা'],['予約','よやく','রিজার্ভেশন']],e:[['病院を予約しました。','びょういん を よやく しました','হাসপাতালের অ্যাপয়েন্টমেন্ট নিয়েছি।']]},
{l:'N4',k:'連',m:'যোগ / ধারাবাহিক',on:'レン',kun:'つれる・つらなる',w:[['連絡','れんらく','যোগাযোগ'],['連れて行く','つれていく','সঙ্গে নিয়ে যাওয়া']],e:[['後で連絡します。','あと で れんらく します','পরে যোগাযোগ করব।']]},
{l:'N4',k:'必要',m:'প্রয়োজনীয়',on:'ヒツ・ヨウ',kun:'—',w:[['必要','ひつよう','প্রয়োজন'],['必要書類','ひつようしょるい','প্রয়োজনীয় কাগজপত্র']],e:[['パスポートが必要です。','ぱすぽーと が ひつよう です','পাসপোর্ট প্রয়োজন।']]},
{l:'N4',k:'場',m:'স্থান / জায়গা',on:'ジョウ',kun:'ば',w:[['場所','ばしょ','স্থান'],['場合','ばあい','ক্ষেত্রে']],e:[['集合場所は駅です。','しゅうごうばしょ は えき です','জমায়েতের স্থান স্টেশন।']]},
{l:'N4',k:'急',m:'তাড়াহুড়া / জরুরি',on:'キュウ',kun:'いそぐ',w:[['急ぐ','いそぐ','তাড়া করা'],['急行','きゅうこう','এক্সপ্রেস']],e:[['急いでください。','いそいで ください','দয়া করে তাড়াতাড়ি করুন।']]},
{l:'N3',k:'際',m:'সময় / উপলক্ষ',on:'サイ',kun:'きわ',w:[['〜際に','さいに','যখন/উপলক্ষে'],['実際','じっさい','বাস্তবে']],e:[['申請の際に必要です。','しんせい の さい に ひつよう です','আবেদনের সময় প্রয়োজন।']]},
{l:'N3',k:'況',m:'অবস্থা',on:'キョウ',kun:'—',w:[['状況','じょうきょう','পরিস্থিতি'],['実況','じっきょう','লাইভ বর্ণনা']],e:[['状況を確認してください。','じょうきょう を かくにん して ください','পরিস্থিতি নিশ্চিত করুন।']]},
{l:'N3',k:'確',m:'নিশ্চিত / যথার্থ',on:'カク',kun:'たしか・たしかめる',w:[['確認','かくにん','নিশ্চিতকরণ'],['確か','たしか','সম্ভবত/নিশ্চিত']],e:[['時間を確認します。','じかん を かくにん します','সময় নিশ্চিত করি।']]},
{l:'N3',k:'増',m:'বাড়া / বৃদ্ধি',on:'ゾウ',kun:'ふえる・ふやす',w:[['増える','ふえる','বাড়া'],['増加','ぞうか','বৃদ্ধি']],e:[['外国人が増えています。','がいこくじん が ふえて います','বিদেশির সংখ্যা বাড়ছে।']]},
{l:'N3',k:'減',m:'কমা / হ্রাস',on:'ゲン',kun:'へる・へらす',w:[['減る','へる','কমে যাওয়া'],['減少','げんしょう','হ্রাস']],e:[['人口が減っています。','じんこう が へって います','জনসংখ্যা কমছে।']]},
{l:'N3',k:'比',m:'তুলনা',on:'ヒ',kun:'くらべる',w:[['比べる','くらべる','তুলনা করা'],['比較','ひかく','তুলনা']],e:[['二つを比べてください。','ふたつ を くらべて ください','দুটো তুলনা করুন।']]},
{l:'N3',k:'関',m:'সম্পর্ক / সংযোগ',on:'カン',kun:'かかわる',w:[['関係','かんけい','সম্পর্ক'],['関する','かんする','সম্পর্কিত']],e:[['日本に関する本です。','にほん に かんする ほん です','জাপান সম্পর্কিত বই।']]},
{l:'N3',k:'対',m:'বিপরীতে / প্রতি',on:'タイ・ツイ',kun:'—',w:[['〜に対して','にたいして','প্রতি/বিপরীতে'],['反対','はんたい','বিরোধিতা']],e:[['質問に対して答えます。','しつもん に たいして こたえます','প্রশ্নের উত্তর দিই।']]},
{l:'N3',k:'応',m:'সাড়া / উপযোগ',on:'オウ',kun:'こたえる',w:[['対応','たいおう','সাড়া/ব্যবস্থা'],['応募','おうぼ','আবেদন']],e:[['求人に応募しました。','きゅうじん に おうぼ しました','চাকরিতে আবেদন করেছি।']]},
{l:'N3',k:'認',m:'স্বীকৃতি / শনাক্ত',on:'ニン',kun:'みとめる',w:[['確認','かくにん','নিশ্চিত করা'],['認める','みとめる','স্বীকার করা']],e:[['内容を確認してください。','ないよう を かくにん して ください','বিষয়বস্তু নিশ্চিত করুন।']]}
];
const modules={N5:[
['漢','কাঞ্জি ও ভোকাবুলারি','বেসিক kanji, reading, পরিচিত শব্দ এবং কাছাকাছি শব্দের পার্থক্য।','/n5-kanji','/n5-vocabulary'],
['文','গ্রামার মাতোমে','Particles, verb forms, adjective, 〜ている, 〜たい, comparison ও প্রয়োজনীয় N5 pattern।','/n5-grammar','/grammar-vs'],
['読','রিডিং','ছোট passage-এ কে/কখন/কোথায়/কেন এবং মূল তথ্য খোঁজার practice।','/n5-reading-part1','/n5-reading-part2'],
['技','প্রশ্ন ধরার কৌশল','শূন্যস্থান, sentence order, ভুল option বাদ এবং সময় বাঁচানোর নিয়ম।','/quiz','/study-guide'],
['聴','লিসনিং','কাজ, সময়, স্থান, পরিবর্তন ও উপযুক্ত response ধরার focused practice।','/n5-listening','/essential-phrases'],
['試','অনুশীলনী পরীক্ষা','সময় ধরে mock, পরে explanation দেখে weak point আবার revision।','/n5-mock-test','/mock-test']
],N4:[
['漢','কাঞ্জি ও ভোকাবুলারি','N4 core kanji/word + দরকারমতো N5 foundation recall।','/n4-kanji','/n4-vocabulary'],
['文','গ্রামার মাতোমে','Form → অর্থ → usage → furigana example → common mistake।','/n4-grammar','/grammar-vs'],
['読','রিডিং','Notice, message ও passage-এ clue, contrast এবং writer intent ধরার practice।','/n4-reading','/quiz'],
['技','প্রশ্ন ধরার কৌশল','★ sentence order, context grammar, distractor বাদ এবং time split।','/quiz','/study-guide'],
['聴','লিসনিং','কে কী করবে, plan change, request/response ও key decision ধরুন।','/n4-listening','/essential-phrases'],
['試','অনুশীলনী পরীক্ষা','N4 timed mock + ভুলগুলো weak queue-তে ফেরত।','/n4-mock-test','/mock-test']
],N3:[
['漢','কাঞ্জি ও ভোকাবুলারি','N3-এর frequent kanji/word, nuance এবং context; প্রয়োজন হলে N4/N5 recall।','/n3-kanji','/n3-vocabulary'],
['文','গ্রামার মাতোমে','N3 Matome + TRY! rules; similar grammar পাশাপাশি compare করুন।','/n3-matome-grammar','/n3-grammar'],
['読','রিডিং','কারণ, contrast, referent, writer opinion ও main point দ্রুত ধরার practice।','/n3-reading','/quiz'],
['技','প্রশ্ন ধরার কৌশল','Grammar context, ★ ordering, reading scan এবং time allocation।','/quiz','/study-guide'],
['聴','লিসনিং','Task-based, point, summary ও quick response—পুরো meaning ধরে answer।','/n3-listening','/essential-phrases'],
['試','অনুশীলনী পরীক্ষা','N3 timed mock, explanation, mistake log এবং targeted redo।','/n3-mock-test','/mock-test']
]};
const LS='an_jlpt_revision_v1', S=load(); let level=S.level||'N5', card=null, mode=S.mode||'full', filter='today';
function load(){try{return JSON.parse(localStorage.getItem(LS))||{}}catch(_){return{}}}function save(){localStorage.setItem(LS,JSON.stringify(S))}function stateKey(x){return x.l+'-'+x.k}function cs(x){S.cards=S.cards||{};return S.cards[stateKey(x)]||(S.cards[stateKey(x)]={seen:0,due:0,ease:2.3,wrong:0,hard:0,good:0,book:false})}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1800)}
function setTab(name){$$('.section-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$$('.pane').forEach(p=>p.classList.toggle('active',p.id===name+'Pane'));S.tab=name;save();history.replaceState(null,'','#'+name)}
function setLevel(l){level=l;S.level=l;save();$$('[data-level]').forEach(b=>b.classList.toggle('active',b.dataset.level===l));renderQueue();nextCard();renderRevision();}
function due(x){const s=cs(x);return !s.seen||s.due<=Date.now()}
function pool(){let a=K.filter(x=>x.l===level);if(filter==='today')a=a.filter(due);if(filter==='new')a=a.filter(x=>!cs(x).seen);if(filter==='wrong')a=a.filter(x=>cs(x).wrong>0);if(filter==='book')a=a.filter(x=>cs(x).book);return a}
function nextCard(){const a=pool();card=a.length?a[Math.floor(Math.random()*a.length)]:null;renderCard();renderStats()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function furigana(jp,reading){return `<ruby>${esc(jp)}<rt>${esc(reading)}</rt></ruby>`}
function renderCard(){const box=$('#flashcard');box.classList.remove('flipped');if(!card){$('#frontKanji').textContent='✓';$('#backBody').innerHTML='<div class="empty"><b>এই তালিকার সব card শেষ।</b><br>অন্য filter বেছে নিন বা অন্য level খুলুন।</div>';return}$('#frontKanji').textContent=card.k;let words=card.w.map(w=>`<div class="example"><span class="jp">${furigana(w[0],w[1])}</span><small>${esc(w[2])}</small></div>`).join('');let ex=card.e.map(w=>`<div class="example"><span class="jp">${furigana(w[0],w[1])}</span><small>${esc(w[2])}</small></div>`).join('');$('#backBody').innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><h2>${esc(card.k)}</h2><div class="meaning">${esc(card.m)}</div></div><button class="bookmark-btn" id="bookmarkBtn">${cs(card).book?'★ Saved':'☆ বুকমার্ক'}</button></div><div class="reading-row"><div class="reading-box"><small>音読み • Onyomi</small><b>${esc(card.on)}</b></div><div class="reading-box"><small>訓読み • Kunyomi</small><b>${esc(card.kun)}</b></div></div><div class="example-list"><b>শব্দ</b>${words}<b>ব্যবহার</b>${ex}</div><div class="audio-row"><button class="audio-btn" id="audioBtn">🔊 উচ্চারণ শুনুন</button></div>`;$('#bookmarkBtn').onclick=e=>{e.stopPropagation();cs(card).book=!cs(card).book;save();renderCard();renderStats()};$('#audioBtn').onclick=e=>{e.stopPropagation();speak(card.w[0]?.[0]||card.k)}}
function speak(t){if(!('speechSynthesis'in window)){toast('এই browser-এ audio নেই');return}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang='ja-JP';u.rate=.86;speechSynthesis.speak(u)}
function rate(kind){if(!card)return;let s=cs(card),now=Date.now();s.seen=(s.seen||0)+1;if(kind==='again'){s.wrong++;s.due=now+10*60e3;s.ease=Math.max(1.3,s.ease-.2);pushWeak(card);toast('১০ মিনিট পরে আবার আসবে')}if(kind==='hard'){s.hard++;s.due=now+24*3600e3;s.ease=Math.max(1.3,s.ease-.08);toast('আগামীকাল আবার দেখাবে')}if(kind==='good'){s.good++;let days=s.good===1?3:s.good===2?7:Math.min(30,Math.round(7*s.ease));s.due=now+days*864e5;s.ease=Math.min(2.8,s.ease+.08);toast(days+' দিন পরে review')}save();nextCard()}
function pushWeak(x){S.weak=S.weak||[];let id=stateKey(x);if(!S.weak.includes(id))S.weak.unshift(id);S.weak=S.weak.slice(0,80);save();renderQueue()}
function renderStats(){let a=K.filter(x=>x.l===level),learned=a.filter(x=>cs(x).seen).length,wrong=a.filter(x=>cs(x).wrong).length,d=a.filter(due).length,b=a.filter(x=>cs(x).book).length;$('#statToday').textContent=d;$('#statLearned').textContent=learned;$('#statWrong').textContent=wrong;$('#statBook').textContent=b;$('#cardCounter').textContent=`${pool().length}টি card • ${level}`}
function renderQueue(){let a=(S.weak||[]).map(id=>K.find(x=>stateKey(x)===id)).filter(Boolean).filter(x=>x.l===level);$('#weakList').innerHTML=a.length?a.slice(0,10).map(x=>`<div class="queue-item"><span><b>${esc(x.k)}</b> <small>${esc(x.m)}</small></span><button class="icon-btn weak-open" data-id="${esc(stateKey(x))}">খুলুন</button></div>`).join(''):'<div class="empty">এখনও weak kanji নেই। ভুল হলে এখানে আসবে।</div>';$$('.weak-open').forEach(b=>b.onclick=()=>{card=K.find(x=>stateKey(x)===b.dataset.id);filter='wrong';$('#cardFilter').value='wrong';renderCard();scrollTo({top:$('#flashcard').getBoundingClientRect().top+scrollY-110,behavior:'smooth'})})}
function doneKey(i){return level+'-'+mode+'-'+i}function renderRevision(){S.rev=S.rev||{};let list=modules[level],pick=mode==='quick'?[0,1,3,4]:mode==='weak'?list.map((_,i)=>i).filter(i=>S.rev[level+'-full-'+i]===false||i<2):list.map((_,i)=>i);if(!pick.length)pick=[0,1,2,3,4,5];$('#revisionTitle').textContent=`${level} • ${mode==='full'?'পূর্ণ রিভিশন':mode==='quick'?'৩০ মিনিট দ্রুত রিভিশন':'আমার দুর্বল জায়গা'}`;$('#moduleList').innerHTML=pick.map(i=>{let m=list[i],done=!!S.rev[doneKey(i)];return `<article class="module card ${done?'done':''}" data-i="${i}"><div class="module-icon">${m[0]}</div><div><h3>${m[1]}</h3><p>${m[2]}</p></div><div class="module-actions"><a href="${m[3]}">মূল Lesson</a><a href="${m[4]}">আরও Practice</a><button class="mark-module" data-i="${i}">${done?'✓ সম্পন্ন':'সম্পন্ন করুন'}</button></div></article>`}).join('');$$('.mark-module').forEach(b=>b.onclick=()=>{let k=doneKey(+b.dataset.i);S.rev[k]=!S.rev[k];S.last={level,mode,index:+b.dataset.i,time:Date.now()};save();renderRevision();toast(S.rev[k]?'Progress save হয়েছে':'আবার বাকি হিসেবে রাখা হলো')});renderProgress(pick);renderCoverage();}
function renderProgress(pick){let n=pick.filter(i=>S.rev[doneKey(i)]).length,p=pick.length?Math.round(n/pick.length*100):0;$('#revisionProgress').style.width=p+'%';$('#revisionProgressText').textContent=`${n}/${pick.length} সম্পন্ন • ${p}%`;}
function renderCoverage(){let counts={N5:'N5 foundation',N4:'N4 + প্রয়োজনীয় N5 recall',N3:'N3 + প্রয়োজনমতো N4/N5 recall'};$('#coverageLabel').textContent=counts[level];}
function setMode(m){mode=m;S.mode=m;save();$$('.mode').forEach(x=>x.classList.toggle('active',x.dataset.mode===m));renderRevision()}
function miniQuiz(){const q=[{q:'明日、雨が（　）ても、学校へ行きます。',a:'降っ',o:['降り','降っ','降る'],x:'〜ても-এর আগে て-form লাগে। 降る → 降って → 降っても।'},{q:'先生（　）質問しました。',a:'に',o:['を','に','で'],x:'ব্যক্তির কাছে প্রশ্ন করা: 人に質問する।'},{q:'電車が遅れた（　）、遅刻しました。',a:'ので',o:['ので','のに','まで'],x:'কারণ বোঝালে ので স্বাভাবিক। のに বিপরীত প্রত্যাশা বোঝায়।'}],z=q[Math.floor(Math.random()*q.length)];let ans=prompt(z.q+'\n\n'+z.o.map((x,i)=>`${i+1}. ${x}`).join('\n')+'\n\nনম্বর লিখুন');if(ans){let got=z.o[+ans-1];alert((got===z.a?'✅ সঠিক':'❌ সঠিক উত্তর: '+z.a)+'\n\n'+z.x);if(got!==z.a){S.grammarWeak=(S.grammarWeak||0)+1;save()}}}
function init(){$$('.section-tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));$$('[data-level]').forEach(b=>b.onclick=()=>setLevel(b.dataset.level));$$('.mode').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$('#flashcard').onclick=e=>{if(e.target.closest('button'))return;e.currentTarget.classList.toggle('flipped')};$$('.rate').forEach(b=>b.onclick=()=>rate(b.dataset.rate));$('#cardFilter').onchange=e=>{filter=e.target.value;nextCard()};$('#nextCard').onclick=nextCard;$('#miniQuiz').onclick=miniQuiz;$('#resetProgress').onclick=()=>{if(confirm('এই level-এর revision progress reset করবেন?')){Object.keys(S.rev||{}).filter(k=>k.startsWith(level+'-')).forEach(k=>delete S.rev[k]);save();renderRevision()}};let tab=location.hash.slice(1)||S.tab||'flash';if(!['flash','revision'].includes(tab))tab='flash';setTab(tab);setLevel(level);setMode(mode);if(S.last&&Date.now()-S.last.time<30*864e5){let r=$('#resumeBanner');r.classList.add('show');$('#resumeText').textContent=`শেষবার ${S.last.level} ${S.last.mode==='full'?'পূর্ণ':'রিভিশন'}-এ থেমেছিলেন।`;$('#resumeBtn').onclick=()=>{setLevel(S.last.level);setMode(S.last.mode);setTab('revision');r.classList.remove('show')}}}
document.addEventListener('DOMContentLoaded',init);
})();