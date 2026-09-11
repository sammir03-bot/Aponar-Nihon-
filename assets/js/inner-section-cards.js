(()=>{
  'use strict';

  const path=(location.pathname||'/').replace(/\/$/,'')||'/';
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

  if(!PAGE_TITLES[path])return;
  document.body&&document.body.setAttribute('data-inner-card-page','1');

  const TONES=['blue','orange','green','purple','red','cyan','pink','gold'];
  const SYMBOLS={
    grammar:'📖',vocabulary:'📚',kanji:'漢',reading:'📄',listening:'🎧',revision:'🔄',flash:'🃏',mock:'✅',quiz:'⚡',exam:'💡',progress:'📊',job:'💼',interview:'🗣️',cv:'📝',profile:'👤',study:'🎓',visa:'🛂',life:'🏠',train:'🚆',bank:'🏦',money:'💴',halal:'☪️',prayer:'🕌',book:'📚',tool:'🛠️',translate:'あ',conversation:'💬',default:'✦'
  };

  const MANUAL={
    '/jlpt-revision.html':[
      ['Kanji Flashcards','N5 · N4 · N3 active recall','#flashPane','漢','pink'],
      ['Full Revision','পরীক্ষার আগে সব একসাথে','#revisionPane','🔄','green'],
      ['N5 Kanji','Beginner Kanji library','/n5-kanji.html','N5','blue'],
      ['N4 Kanji','Elementary Kanji library','/n4-kanji.html','N4','purple'],
      ['N3 Kanji','Intermediate Kanji library','/n3-kanji.html','N3','orange'],
      ['Mock Test','Timed exam practice','/mock-test.html','✅','red']
    ],
    '/jlpt-revision':null,
    '/listening-lab.html':[
      ['N5 Listening','২০টি structured lesson','/listening-lab.html?level=n5','N5','blue'],
      ['N4 Listening','২০টি structured lesson','/listening-lab.html?level=n4','N4','purple'],
      ['N3 Listening','২০টি structured lesson','/listening-lab.html?level=n3','N3','orange'],
      ['Listening Revision','Exam-এর আগে দ্রুত ঝালাই','/jlpt-revision.html#revision','🔄','green'],
      ['Mock Listening','বাস্তব পরীক্ষার practice','/mock-test.html','🎧','red'],
      ['AI Listening Help','না বুঝলে বাংলায় জিজ্ঞাসা','/tutor-section.html?mode=learn&prompt=Listening%20practice%20বুঝিয়ে%20দিন','🤖','cyan']
    ],
    '/listening-lab':null,
    '/quiz.html':[
      ['N5 Quiz','Vocabulary · Kanji · Grammar','/jlpt-quiz.html?level=n5&category=vocabulary&part=1','N5','blue'],
      ['N4 Quiz','Vocabulary · Kanji · Grammar','/jlpt-quiz.html?level=n4&category=vocabulary&part=1','N4','purple'],
      ['N3 Quiz','Vocabulary · Kanji · Grammar','/jlpt-quiz.html?level=n3&category=vocabulary&part=1','N3','orange'],
      ['Vocabulary Quiz','শব্দের meaning ও usage','/jlpt-quiz.html?level=n5&category=vocabulary&part=1','📚','green'],
      ['Kanji Quiz','Reading ও meaning practice','/jlpt-quiz.html?level=n5&category=kanji&part=1','漢','pink'],
      ['Grammar Quiz','Rule চিনে answer দিন','/jlpt-quiz.html?level=n5&category=grammar&part=1','📖','red']
    ],
    '/quiz':null,
    '/mock-test.html':[
      ['N5 Full Mock','Timed N5 exam','/n5-mock-tests.html','N5','blue'],
      ['N4 Full Mock','Timed N4 exam','/n4-mock-tests.html','N4','purple'],
      ['N3 Full Mock','Timed N3 exam','/n3-mock-tests.html','N3','orange'],
      ['Revision First','দুর্বল জায়গা ঝালাই করুন','/jlpt-revision.html#revision','🔄','green'],
      ['Listening Lab','শোনার skill practice','/listening-lab.html','🎧','cyan'],
      ['Exam Tricks','Question ধরার কৌশল','/study-guide.html','💡','gold']
    ],
    '/mock-test':null,
    '/tutor-section.html':[
      ['Grammar Explain','Rule বাংলায় বুঝুন','/tutor-section.html?mode=learn&fresh=1&prompt=একটি%20JLPT%20grammar%20বাংলায়%20শিক্ষকের%20মতো%20বুঝিয়ে%20দিন','📖','purple'],
      ['Sentence Correction','জাপানি বাক্য ঠিক করুন','/tutor-section.html?mode=learn&fresh=1&prompt=আমার%20Japanese%20sentence%20check%20ও%20correct%20করুন','✍️','blue'],
      ['Translation','বাংলা ↔ Japanese','/tutor-section.html?mode=learn&fresh=1&prompt=বাংলা%20থেকে%20স্বাভাবিক%20Japanese%20অনুবাদ%20শেখান','あ','cyan'],
      ['Conversation','বাস্তব কথোপকথন practice','/tutor-section.html?mode=learn&fresh=1&prompt=আমার%20সাথে%20সহজ%20Japanese%20conversation%20practice%20করুন','💬','green'],
      ['Quiz Me','নিজেকে পরীক্ষা করুন','/tutor-section.html?mode=learn&fresh=1&prompt=আমাকে%20JLPT%20quiz%20দিন%20এবং%20উত্তর%20ব্যাখ্যা%20করুন','⚡','orange'],
      ['Interview Help','চাকরির Japanese practice','/tutor-section.html?mode=learn&fresh=1&prompt=Japan%20part-time%20job%20interview%20practice%20করান','💼','red']
    ],
    '/tutor-section':null
  };
  Object.keys(MANUAL).forEach(k=>{if(MANUAL[k]===null){const html=k+'.html';if(MANUAL[html])MANUAL[k]=MANUAL[html]}});

  function textOf(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim()}
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
    const isHash=String(target||'').startsWith('#');
    const tag=isHash?'a':'a';
    const key=keyFor(title+' '+sub);
    const sym=symbol||SYMBOLS[key]||SYMBOLS.default;
    return `<${tag} class="an-inner-card" data-tone="${tone||TONES[i%TONES.length]}" href="${target||'#'}"><span class="an-inner-card-visual"><span class="an-inner-card-symbol" style="position:relative;z-index:1;font-size:${String(sym).length<=3?'2.35rem':'1.55rem'};font-weight:950;line-height:1;color:#fff;filter:drop-shadow(0 5px 9px rgba(0,0,0,.18))">${sym}</span></span><span class="an-inner-card-copy"><strong>${title}</strong><small>${sub||'এই অংশ খুলুন'}</small></span><span class="an-inner-card-arrow" aria-hidden="true">›</span></${tag}>`;
  }
  function actionCardMarkup(title,sub,index){
    const key=keyFor(title+' '+sub),sym=SYMBOLS[key]||SYMBOLS.default;
    return `<button type="button" class="an-inner-card" data-an-action-index="${index}" data-tone="${TONES[index%TONES.length]}"><span class="an-inner-card-visual"><span class="an-inner-card-symbol" style="position:relative;z-index:1;font-size:2.25rem;font-weight:950;line-height:1;color:#fff">${sym}</span></span><span class="an-inner-card-copy"><strong>${title}</strong><small>${sub||'এই অংশ খুলুন'}</small></span><span class="an-inner-card-arrow" aria-hidden="true">›</span></button>`;
  }

  function makePanel(cards,actions){
    if(document.querySelector('.an-section-overview'))return null;
    const panel=document.createElement('section');
    panel.className='an-section-overview';
    panel.setAttribute('aria-label','এই সেকশনের অংশসমূহ');
    const title=PAGE_TITLES[path]||document.title.split('|')[0].trim();
    const body=cards?cards.map(cardMarkup).join(''):actions.map((a,i)=>actionCardMarkup(a.title,a.sub,i)).join('');
    panel.innerHTML=`<div class="an-section-overview-head"><div class="an-section-overview-copy"><span class="an-section-overview-kicker">✦ এক নজরে সব অংশ</span><h2>${title} — যা যা আছে</h2><p>যে বিষয়টি দরকার, কার্ডে চাপুন। সব content আগের মতোই থাকবে—এটি শুধু দ্রুত ও পরিষ্কার navigation.</p></div><span class="an-section-overview-badge">Mobile • 2 columns</span></div><div class="an-inner-section-grid">${body}</div>`;
    if(actions){
      panel.addEventListener('click',e=>{
        const btn=e.target.closest('[data-an-action-index]');
        if(!btn)return;
        const a=actions[Number(btn.dataset.anActionIndex)];
        if(!a||!a.el)return;
        a.el.click();
        setTimeout(()=>{
          const target=a.scrollEl||document.querySelector('.layout,.content,main')||a.el;
          target&&target.scrollIntoView({behavior:'smooth',block:'start'});
        },80);
      });
    }
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
    document.body.insertAdjacentElement('afterbegin',panel);
  }

  function autoActions(){
    const wizard=[...document.querySelectorAll('.wizard .wiz')].filter(x=>textOf(x));
    if(wizard.length>=3)return wizard.map((el,i)=>({el,title:textOf(el).replace(/^\d+\s*/,''),sub:'ধাপ '+(i+1)+' খুলুন',scrollEl:document.querySelector('.layout')||el}));
    const tabs=[...document.querySelectorAll('[role="tab"],.section-tab,.tab-btn,.tabs button,.nav-tabs button')].filter(x=>textOf(x));
    if(tabs.length>=3)return tabs.slice(0,16).map(el=>({el,title:textOf(el),sub:'এই অংশ দেখুন',scrollEl:el.closest('main,section,.content')||el}));
    return [];
  }

  function autoSectionCards(){
    const root=document.querySelector('main')||document.body;
    let sections=[...root.querySelectorAll(':scope > section, :scope > .section, :scope > .panel-section')];
    if(sections.length<3)sections=[...root.querySelectorAll('section')].filter(s=>!s.closest('footer')&&!s.classList.contains('hero')&&!s.classList.contains('lh-hero')&&!s.classList.contains('hub-hero'));
    const seen=new Set(),cards=[];
    sections.forEach((section,i)=>{
      if(cards.length>=18)return;
      const heading=section.querySelector('h2,h3,[role="heading"],legend');
      let title=textOf(heading);
      if(!title||title.length>70)return;
      title=title.replace(/^[0-9０-９]+[.)\-:\s]+/,'').trim();
      if(seen.has(title))return;seen.add(title);
      if(!section.id)section.id=slug(title,i+1);
      const sub=subtitleFrom(section)||'এই অংশে যান';
      const key=keyFor(title+' '+sub);
      cards.push([title,sub,'#'+section.id,SYMBOLS[key]||SYMBOLS.default,TONES[cards.length%TONES.length]]);
    });
    if(cards.length>=3)return cards;

    const headings=[...root.querySelectorAll('h2')].filter(h=>!h.closest('footer'));
    headings.forEach((h,i)=>{
      if(cards.length>=18)return;
      const title=textOf(h);if(!title||seen.has(title))return;seen.add(title);
      const target=h.closest('section,.panel,.card,.step')||h;
      if(!target.id)target.id=slug(title,i+30);
      cards.push([title,subtitleFrom(target)||'এই অংশে যান','#'+target.id,SYMBOLS[keyFor(title)]||SYMBOLS.default,TONES[cards.length%TONES.length]]);
    });
    return cards;
  }

  function enhanceExistingGrids(){
    document.querySelectorAll('.lh-resource-grid,.hub-resource-grid').forEach(g=>g.classList.add('an-inner-section-grid-existing'));
  }

  function boot(){
    document.body.setAttribute('data-inner-card-page','1');
    enhanceExistingGrids();
    /* N5/N4/N3 and generic hub pages already have accurate subsection cards; only restyle them. */
    if(document.querySelector('.lh-resource-grid,.hub-resource-grid'))return;

    const manual=MANUAL[path];
    if(manual&&manual.length){placePanel(makePanel(manual,null));return}
    const actions=autoActions();
    if(actions.length>=3){placePanel(makePanel(null,actions));return}
    const cards=autoSectionCards();
    if(cards.length>=3)placePanel(makePanel(cards,null));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
