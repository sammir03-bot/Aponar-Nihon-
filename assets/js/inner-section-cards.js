(()=>{
  'use strict';

  const path=(location.pathname||'/').replace(/\/$/,'')||'/';
  if(path==='/'||path==='/index.html'||path==='/index')return;

  const PAGE_TITLES={
    '/n5.html':'JLPT N5','/n5':'JLPT N5',
    '/n4.html':'JLPT N4','/n4':'JLPT N4',
    '/n3.html':'JLPT N3','/n3':'JLPT N3',
    '/jlpt-revision.html':'JLPT Revision','/jlpt-revision':'JLPT Revision',
    '/listening-lab.html':'Listening Lab','/listening-lab':'Listening Lab',
    '/quiz.html':'JLPT Quiz','/quiz':'JLPT Quiz',
    '/tutor-section.html':'AI Tutor','/tutor-section':'AI Tutor',
    '/mock-test.html':'Mock Test','/mock-test':'Mock Test',
    '/interview.html':'Interview','/interview':'Interview',
    '/ssw.html':'SSW Guide','/ssw':'SSW Guide',
    '/essential-phrases.html':'দরকারি জাপানি','/essential-phrases':'দরকারি জাপানি',
    '/japan-life.html':'Japan Life','/japan-life':'Japan Life',
    '/jobs-in-japan.html':'Jobs in Japan','/jobs-in-japan':'Jobs in Japan',
    '/Hiragana-Katagana.html':'হিরাগানা ও কাতাকানা','/Hiragana-Katagana':'হিরাগানা ও কাতাকানা',
    '/ebook-library.html':'E-Book Library','/ebook-library':'E-Book Library',
    '/student-tools.html':'Student Toolkit','/student-tools':'Student Toolkit',
    '/cv-builder.html':'Japan CV Builder','/cv-builder':'Japan CV Builder',
    '/grammar-vs.html':'Grammar VS','/grammar-vs':'Grammar VS',
    '/muslim-japan.html':'Muslim Japan','/muslim-japan':'Muslim Japan',
    '/jpy-bdt-remittance.html':'JPY ↔ BDT','/jpy-bdt-remittance':'JPY ↔ BDT',
    '/study-guide.html':'Study Guide','/study-guide':'Study Guide',
    '/profile.html':'Profile','/profile':'Profile',
    '/halal-scanner.html':'Halal Scanner','/halal-scanner':'Halal Scanner',
    '/japanese-language-course.html':'Japanese Course','/japanese-language-course':'Japanese Course',
    '/jlpt-quiz.html':'JLPT Quiz Practice','/jlpt-quiz':'JLPT Quiz Practice',
    '/n5-mock-tests.html':'N5 Mock Tests','/n5-mock-tests':'N5 Mock Tests',
    '/n4-mock-tests.html':'N4 Mock Tests','/n4-mock-tests':'N4 Mock Tests',
    '/n3-mock-tests.html':'N3 Mock Tests','/n3-mock-tests':'N3 Mock Tests'
  };

  const TONES=['blue','orange','green','purple','red','cyan','pink','gold'];
  const SYMBOLS={
    grammar:'📖',vocabulary:'📚',kanji:'漢',reading:'📄',listening:'🎧',revision:'🔄',flash:'🃏',mock:'✅',quiz:'⚡',exam:'💡',progress:'📊',job:'💼',interview:'🗣️',cv:'📝',profile:'👤',study:'🎓',visa:'🛂',life:'🏠',train:'🚆',bank:'🏦',money:'💴',halal:'☪️',prayer:'🕌',book:'📚',tool:'🛠️',translate:'あ',conversation:'💬',default:'✦'
  };

  const MANUAL={
    '/jlpt-revision.html':[
      ['Kanji Flashcards','N5 · N4 · N3 active recall','#flash','漢','pink'],
      ['Full Revision','পরীক্ষার আগে সব একসাথে','#revision','🔄','green'],
      ['N5 Kanji','Beginner Kanji library','/n5-kanji.html','N5','blue'],
      ['N4 Kanji','Elementary Kanji library','/n4-kanji.html','N4','purple'],
      ['N3 Kanji','Intermediate Kanji library','/n3-kanji.html','N3','orange'],
      ['Mock Test','Timed exam practice','/mock-test.html','✅','red']
    ],
    '/listening-lab.html':[
      ['N5 Listening','২০টি structured lesson','/listening-lab.html?level=n5','N5','blue'],
      ['N4 Listening','২০টি structured lesson','/listening-lab.html?level=n4','N4','purple'],
      ['N3 Listening','২০টি structured lesson','/listening-lab.html?level=n3','N3','orange'],
      ['Listening Revision','Exam-এর আগে দ্রুত ঝালাই','/jlpt-revision.html#revision','🔄','green'],
      ['Mock Listening','বাস্তব পরীক্ষার practice','/mock-test.html','🎧','red'],
      ['AI Listening Help','না বুঝলে বাংলায় জিজ্ঞাসা','/tutor-section.html?mode=learn&prompt=Listening%20practice%20বুঝিয়ে%20দিন','🤖','cyan']
    ],
    '/quiz.html':[
      ['N5 Quiz','Vocabulary · Kanji · Grammar','/jlpt-quiz.html?level=n5&category=vocabulary&part=1','N5','blue'],
      ['N4 Quiz','Vocabulary · Kanji · Grammar','/jlpt-quiz.html?level=n4&category=vocabulary&part=1','N4','purple'],
      ['N3 Quiz','Vocabulary · Kanji · Grammar','/jlpt-quiz.html?level=n3&category=vocabulary&part=1','N3','orange'],
      ['Vocabulary Quiz','শব্দের meaning ও usage','/jlpt-quiz.html?level=n5&category=vocabulary&part=1','📚','green'],
      ['Kanji Quiz','Reading ও meaning practice','/jlpt-quiz.html?level=n5&category=kanji&part=1','漢','pink'],
      ['Grammar Quiz','Rule চিনে answer দিন','/jlpt-quiz.html?level=n5&category=grammar&part=1','📖','red']
    ],
    '/mock-test.html':[
      ['N5 Full Mock','Timed N5 exam','/n5-mock-tests.html','N5','blue'],
      ['N4 Full Mock','Timed N4 exam','/n4-mock-tests.html','N4','purple'],
      ['N3 Full Mock','Timed N3 exam','/n3-mock-tests.html','N3','orange'],
      ['Revision First','দুর্বল জায়গা ঝালাই করুন','/jlpt-revision.html#revision','🔄','green'],
      ['Listening Lab','শোনার skill practice','/listening-lab.html','🎧','cyan'],
      ['Exam Tricks','Question ধরার কৌশল','/study-guide.html','💡','gold']
    ],
    '/tutor-section.html':[
      ['Grammar Explain','Rule বাংলায় বুঝুন','/tutor-section.html?mode=learn&fresh=1&prompt=একটি%20JLPT%20grammar%20বাংলায়%20শিক্ষকের%20মতো%20বুঝিয়ে%20দিন','📖','purple'],
      ['Sentence Correction','জাপানি বাক্য ঠিক করুন','/tutor-section.html?mode=learn&fresh=1&prompt=আমার%20Japanese%20sentence%20check%20ও%20correct%20করুন','✍️','blue'],
      ['Translation','বাংলা ↔ Japanese','/tutor-section.html?mode=learn&fresh=1&prompt=বাংলা%20থেকে%20স্বাভাবিক%20Japanese%20অনুবাদ%20শেখান','あ','cyan'],
      ['Conversation','বাস্তব কথোপকথন practice','/tutor-section.html?mode=learn&fresh=1&prompt=আমার%20সাথে%20সহজ%20Japanese%20conversation%20practice%20করুন','💬','green'],
      ['Quiz Me','নিজেকে পরীক্ষা করুন','/tutor-section.html?mode=learn&fresh=1&prompt=আমাকে%20JLPT%20quiz%20দিন%20এবং%20উত্তর%20ব্যাখ্যা%20করুন','⚡','orange'],
      ['Interview Help','চাকরির Japanese practice','/tutor-section.html?mode=learn&fresh=1&prompt=Japan%20part-time%20job%20interview%20practice%20করান','💼','red']
    ]
  };
  for(const base of ['/jlpt-revision','/listening-lab','/quiz','/mock-test','/tutor-section']){
    const html=base+'.html';
    if(MANUAL[html])MANUAL[base]=MANUAL[html];
  }

  const GUIDE_PATHS=new Set([
    '/ssw','/ssw.html','/study-guide','/study-guide.html','/muslim-japan','/muslim-japan.html',
    '/japan-arrival-guide','/japan-arrival-guide.html','/japan-emergency-guide','/japan-emergency-guide.html',
    '/japan-google-maps-guide','/japan-google-maps-guide.html','/japan-home-life-guide','/japan-home-life-guide.html',
    '/japan-newcomer-guide','/japan-newcomer-guide.html','/japan-part-time-job-guide','/japan-part-time-job-guide.html',
    '/japan-student-visa','/japan-student-visa.html','/japan-train-platform-guide','/japan-train-platform-guide.html'
  ]);

  function textOf(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim()}
  function esc(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
  function subtitleFrom(el){
    if(!el)return '';
    const p=el.querySelector&&el.querySelector('p,small,.subtitle,.desc,.description');
    const t=textOf(p);
    return t.length>92?t.slice(0,89)+'…':t;
  }
  function keyFor(text){
    const s=(text||'').toLowerCase();
    if(/grammar|文法|গ্রামার/.test(s))return 'grammar';
    if(/vocab|語彙|শব্দ/.test(s))return 'vocabulary';
    if(/kanji|漢字|কানজি|কাঞ্জি/.test(s))return 'kanji';
    if(/reading|読解|রিডিং|পাঠ/.test(s))return 'reading';
    if(/listen|聴解|শোনা|লিসিনিং/.test(s))return 'listening';
    if(/revision|review|রিভিশন/.test(s))return 'revision';
    if(/flash/.test(s))return 'flash';
    if(/mock|test|পরীক্ষা/.test(s))return 'mock';
    if(/quiz|কুইজ/.test(s))return 'quiz';
    if(/exam|tips|trick|কৌশল/.test(s))return 'exam';
    if(/progress|অগ্রগতি/.test(s))return 'progress';
    if(/interview|ইন্টারভিউ/.test(s))return 'interview';
    if(/job|চাকরি|baito/.test(s))return 'job';
    if(/cv|resume|履歴書/.test(s))return 'cv';
    if(/profile|প্রোফাইল/.test(s))return 'profile';
    if(/visa|ভিসা/.test(s))return 'visa';
    if(/train|ট্রেন/.test(s))return 'train';
    if(/money|yen|jpy|bdt|রেমিট|টাকা/.test(s))return 'money';
    if(/halal|হালাল/.test(s))return 'halal';
    if(/prayer|mosque|নামাজ|মসজিদ/.test(s))return 'prayer';
    if(/book|ebook|বই/.test(s))return 'book';
    if(/tool|টুল/.test(s))return 'tool';
    if(/translate|অনুবাদ/.test(s))return 'translate';
    if(/conversation|কথা|বাক্য/.test(s))return 'conversation';
    if(/life|বাসা|জীবন/.test(s))return 'life';
    if(/study|learn|শেখ|পড়/.test(s))return 'study';
    return 'default';
  }
  function slug(s,i){return 'an-section-'+String(s||'part').toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g,'-').replace(/^-|-$/g,'').slice(0,42)+'-'+i}
  function cardMarkup(card,i){
    const [title,sub,target,symbol,tone]=card;
    const key=keyFor(title+' '+sub);
    const sym=symbol||SYMBOLS[key]||SYMBOLS.default;
    const size=String(sym).length<=3?'2.35rem':'1.55rem';
    return `<a class="an-inner-card" data-tone="${esc(tone||TONES[i%TONES.length])}" href="${esc(target||'#')}"><span class="an-inner-card-visual"><span class="an-inner-card-symbol" style="font-size:${size}">${esc(sym)}</span></span><span class="an-inner-card-copy"><strong>${esc(title)}</strong><small>${esc(sub||'এই অংশ খুলুন')}</small></span><span class="an-inner-card-arrow" aria-hidden="true">›</span></a>`;
  }

  function activateRevisionHash(hash){
    if(!/^#(?:flash|flashPane|revision|revisionPane)$/i.test(hash||''))return false;
    const mode=/revision/i.test(hash)?'revision':'flash';
    const tab=document.querySelector(`.section-tab[data-tab="${mode}"]`);
    if(tab){tab.click();return true}
    return false;
  }
  function focusHashTarget(hash){
    if(!hash||hash==='#')return;
    if(activateRevisionHash(hash)){
      setTimeout(()=>document.querySelector('.section-tabs')?.scrollIntoView({behavior:'smooth',block:'start'}),50);
      return;
    }
    let target=null;
    try{target=document.querySelector(hash)}catch(_){target=null}
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function makePanel(cards){
    if(!cards||cards.length<3||document.querySelector('.an-section-overview'))return null;
    const panel=document.createElement('section');
    panel.className='an-section-overview';
    panel.setAttribute('aria-label','এই সেকশনের অংশসমূহ');
    const title=PAGE_TITLES[path]||document.title.split('|')[0].trim();
    panel.innerHTML=`<div class="an-section-overview-head"><div class="an-section-overview-copy"><span class="an-section-overview-kicker">✦ এক নজরে সব অংশ</span><h2>${esc(title)} — যা যা আছে</h2><p>যে বিষয়টি দরকার, কার্ডে চাপুন। মূল content এবং কাজ আগের মতোই থাকবে।</p></div><span class="an-section-overview-badge">দ্রুত নেভিগেশন</span></div><div class="an-inner-section-grid">${cards.map(cardMarkup).join('')}</div>`;
    panel.addEventListener('click',e=>{
      const link=e.target.closest('a[href^="#"]');
      if(!link)return;
      e.preventDefault();
      const hash=link.getAttribute('href');
      if(history.replaceState)history.replaceState(null,'',hash);
      focusHashTarget(hash);
    });
    return panel;
  }

  function placePanel(panel){
    if(!panel)return;
    const hero=document.querySelector('main > .hero,main > .lh-hero,main > .hub-hero,.hero:not(.hero-card),.hero-section,.page-hero');
    if(hero&&hero.parentNode){hero.insertAdjacentElement('afterend',panel);return}
    const main=document.querySelector('main');
    if(main){main.insertAdjacentElement('afterbegin',panel);return}
    const header=document.querySelector('header');
    if(header){header.insertAdjacentElement('afterend',panel);return}
  }

  function guideCards(){
    const root=document.querySelector('main')||document.body;
    const sections=[...root.querySelectorAll(':scope > section, :scope > .section')];
    const pool=sections.length>=3?sections:[...root.querySelectorAll('section')].filter(s=>!s.closest('footer')&&!s.classList.contains('hero')&&!s.classList.contains('lh-hero')&&!s.classList.contains('hub-hero'));
    const seen=new Set(),cards=[];
    pool.forEach((section,i)=>{
      if(cards.length>=12)return;
      const heading=section.querySelector('h2,h3,[role="heading"],legend');
      let title=textOf(heading);
      if(!title||title.length>70)return;
      title=title.replace(/^[0-9０-９]+[.)\-:\s]+/,'').trim();
      if(seen.has(title))return;
      seen.add(title);
      if(!section.id)section.id=slug(title,i+1);
      const sub=subtitleFrom(section)||'এই অংশে যান';
      const key=keyFor(title+' '+sub);
      cards.push([title,sub,'#'+section.id,SYMBOLS[key]||SYMBOLS.default,TONES[cards.length%TONES.length]]);
    });
    return cards;
  }

  function boot(){
    document.body.setAttribute('data-inner-card-page','1');
    const hasExistingGrid=!!document.querySelector('.lh-resource-grid,.hub-resource-grid');
    if(hasExistingGrid){
      document.querySelectorAll('.lh-resource-grid,.hub-resource-grid').forEach(g=>g.classList.add('an-inner-section-grid-existing'));
      return;
    }

    const manual=MANUAL[path];
    if(manual){placePanel(makePanel(manual));}
    else if(GUIDE_PATHS.has(path)){placePanel(makePanel(guideCards()));}

    if((path==='/jlpt-revision'||path==='/jlpt-revision.html')&&location.hash){
      setTimeout(()=>focusHashTarget(location.hash),0);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
