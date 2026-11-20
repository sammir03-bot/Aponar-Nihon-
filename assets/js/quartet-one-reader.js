// Original, expanded teaching notes for the first volume. Progress stays in the
// shared course controller so existing bookmarks and answers keep working.
export function createMasterclass({ root, course, deep, ruby, esc, bn, plain, readSaved, save, dynT: dynTIn }) {
  function dynTFallback(k,v){if(window.AponarDyn)return window.AponarDyn(k,v);var s=dynTFallback._b[k]||k;if(v)for(var x in v)s=s.split("{"+x+"}").join(v[x]);return s;}dynTFallback._b={"qr.fontNormal": "স্বাভাবিক", "qr.fontBig": "বড়", "qr.fontBigger": "আরও বড়", "qr.sentenceParts": "বাক্য অংশে ভাগ করে অর্থ", "qr.workedBadge": "বাক্য ভেঙে বুঝুন", "qr.whyStructure": "কেন এই গঠন?", "qr.lessonLabel": "পাঠ", "qr.ofTotal": " / {t}", "qr.chipExamples": "{n}টি উদাহরণ", "qr.chipExplain": "বাক্য ধরে ব্যাখ্যা", "qr.chipSelfCheck": "নিজে যাচাই", "qr.jumpUnderstand": "বুঝুন", "qr.avoidMistakes": "ভুল এড়ান", "qr.ariaLessonParts": "পাঠের অংশ", "qr.understandFirst": "আগে পরিস্থিতিটা বুঝুন", "qr.usageImage": "ব্যবহারের ভাবনা", "qr.buildForm": "ধাপে ধাপে Form বানান", "qr.startForm": "শুরুর রূপ", "qr.resultForm": "যে রূপটি হবে", "qr.seeInSentence": "বাক্যে দেখে বুঝুন", "qr.sectionIntro": "প্রথম দুইটি বাক্য অংশে ভাগ করা। তারপর ভিন্ন পরিস্থিতিতে একই নিয়ম দেখুন।", "qr.compareTitle": "পাশাপাশি রেখে পার্থক্য বুঝুন", "qr.oneWay": "একভাবে বললে", "qr.otherWay": "অন্যভাবে বললে", "qr.mistakeTitle": "যে ভুলটি এড়িয়ে চলবেন", "qr.memoryLine": "এক লাইনে মনে রাখুন", "qr.sayYourself": "এবার নিজে একটি বাক্য বলুন", "qr.showAnswer": "উত্তর ও কারণ দেখুন", "qr.selfCheckHint": "আগে নিজে বলুন। তারপর উত্তরের সঙ্গে Form মিলিয়ে নিন।", "qr.sourceBook": "মূল বই পৃ. ", "qr.ownNote": " · নিজস্ব বাংলা সহায়ক নোট", "qt.example": "উদাহরণ", "qt.chapterPrefix": "অধ্যায় ", "qt.learnedBtn": "✓ শেখা হয়েছে", "qt.markLearned": "শেখা হয়েছে চিহ্ন দিন", "qt.prevLesson": "আগের পাঠ", "qt.nextLesson": "পরের পাঠ"};function dynLang(){return window.AponarDynLang?window.AponarDynLang():'bn';}
  const dynT = dynTIn || dynTFallback;
  const prefsKey = 'quartetIReaderPrefsV2';
  const stored = readSaved(prefsKey, {});
  const prefs = {
    size: [0, 1, 2].includes(stored?.size) ? stored.size : 0,
    furigana: stored?.furigana !== false,
    dark: stored?.dark === true,
  };
  const picker = root.querySelector('.course-picker');
  const mobile = matchMedia('(max-width: 800px)');
  const updatePicker = () => { picker.open = !mobile.matches; };
  updatePicker();
  mobile.addEventListener('change', updatePicker);

  function applyPrefs() {
    document.body.dataset.readerSize = String(prefs.size);
    document.body.dataset.furigana = prefs.furigana ? 'on' : 'off';
    document.body.dataset.readerTheme = prefs.dark ? 'dark' : 'light';
    root.querySelector('[data-reader="smaller"]').disabled = prefs.size === 0;
    root.querySelector('[data-reader="larger"]').disabled = prefs.size === 2;
    root.querySelector('[data-reader="furigana"]').setAttribute('aria-pressed', String(prefs.furigana));
    root.querySelector('[data-reader="theme"]').setAttribute('aria-pressed', String(prefs.dark));
    root.querySelector('#reader-size-label').textContent = [dynT('qr.fontNormal'), dynT('qr.fontBig'), dynT('qr.fontBigger')][prefs.size];
  }
  applyPrefs();
  root.addEventListener('click', event => {
    const control = event.target.closest('[data-reader]');
    if (control && !control.disabled) {
      if (control.dataset.reader === 'smaller') prefs.size = Math.max(0, prefs.size - 1);
      if (control.dataset.reader === 'larger') prefs.size = Math.min(2, prefs.size + 1);
      if (control.dataset.reader === 'furigana') prefs.furigana = !prefs.furigana;
      if (control.dataset.reader === 'theme') prefs.dark = !prefs.dark;
      save(prefsKey, prefs);
      applyPrefs();
    }
    const jump = event.target.closest('[data-jump]');
    if (jump) {
      const target = document.getElementById(jump.dataset.jump);
      target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      target?.focus({ preventScroll: true });
    }
    if (mobile.matches && event.target.closest('#lesson-list a')) picker.open = false;
  });
  root.querySelector('#lesson-select').addEventListener('change', () => {
    if (mobile.matches) picker.open = false;
  });

  const sectionTitle = (number, title, id) => '<div class="section-heading" id="'+id+'" tabindex="-1"><span aria-hidden="true">'+bn(number).padStart(2,bn(0))+'</span><h3>'+title+'</h3></div>';
  function example(e, number) {
    const parts = e.parts ? '<div class="sentence-parts" aria-label="'+dynT('qr.sentenceParts')+'">'+e.parts.map((p, index) => '<div><span class="part-index" aria-hidden="true">'+bn(index+1)+'</span><p lang="ja">'+ruby(p.japanese)+'</p><p>'+ruby(p.meaning_bn)+'</p></div>').join('')+'</div>' : '';
    return '<article class="example'+(parts?' worked-example':'')+'"><div class="example-label"><span>'+dynT('qt.example')+' '+bn(number).padStart(2,bn(0))+'</span>'+(parts?'<span class="worked-badge">'+dynT('qr.workedBadge')+'</span>':'')+'</div><p class="jp" lang="ja">'+ruby(e.japanese)+'</p><p class="translation">'+ruby(e.bangla)+'</p>'+parts+(e.why_bn?'<p class="example-why"><strong>'+dynT('qr.whyStructure')+'</strong> '+ruby(e.why_bn)+'</p>':'')+'</article>';
  }
  function renderLesson(i, idx, learned) {
    const note = deep.lessons[i.id];
    const compare = note.comparison;
    return '<header class="lesson-heading"><div class="lesson-overline"><span>'+dynT('qt.chapterPrefix')+bn(i.chapter)+' <span aria-hidden="true">/</span> '+dynT('qr.lessonLabel')+' '+bn(i.order)+'</span><span>'+bn(idx+1)+dynT('qr.ofTotal',{t:bn(55)})+'</span></div><h2 class="grammar-title">'+ruby(i.title)+'</h2><p class="meaning">'+ruby(i.meaning_bn)+'</p><div class="lesson-chips"><span>'+dynT('qr.chipExamples',{n:bn(10)})+'</span><span>'+dynT('qr.chipExplain')+'</span><span>'+dynT('qr.chipSelfCheck')+'</span></div></header>'+
      '<nav class="lesson-jumps" aria-label="'+dynT('qr.ariaLessonParts')+'"><button data-jump="understand">'+dynT('qr.jumpUnderstand')+'</button><button data-jump="formation">Form</button><button data-jump="examples">'+dynT('qt.example')+'</button><button data-jump="common-mistake">'+dynT('qr.avoidMistakes')+'</button></nav>'+
      '<section class="lesson-section">'+sectionTitle(1,dynT('qr.understandFirst'),'understand')+'<p class="scene">'+ruby(note.scene_bn)+'</p><div class="meaning-model" role="group" aria-label="'+dynT('qr.usageImage')+'">'+note.model_bn.map((s,n)=>'<div><span class="model-dot" aria-hidden="true">'+bn(n+1)+'</span><p>'+ruby(s)+'</p></div>').join('')+'</div><p>'+ruby(i.explanation_bn)+'</p><ol class="teaching-steps">'+note.steps_bn.map(s=>'<li>'+ruby(s)+'</li>').join('')+'</ol></section>'+
      '<section class="lesson-section">'+sectionTitle(2,dynT('qr.buildForm'),'formation')+'<ul class="formula-list">'+i.forms.map(f=>'<li>'+ruby(f)+'</li>').join('')+'</ul><div class="form-builds">'+note.form_builds.map(f=>'<article class="form-build"><div class="form-input"><span>'+dynT('qr.startForm')+'</span><p lang="ja">'+ruby(f.before)+'</p></div><div class="form-rule"><span aria-hidden="true">→</span><p>'+ruby(f.pattern)+'</p></div><div class="form-output"><span>'+dynT('qr.resultForm')+'</span><p lang="ja">'+ruby(f.after)+'</p></div><p class="form-note">'+ruby(f.note_bn)+'</p></article>').join('')+'</div></section>'+
      '<section class="lesson-section examples-section">'+sectionTitle(3,dynT('qr.seeInSentence'),'examples')+'<p class="section-intro">'+dynT('qr.sectionIntro')+'</p>'+note.extra_examples.map((e,n)=>example(e,n+1)).join('')+i.examples.map((e,n)=>example(e,n+9)).join('')+'</section>'+
      '<section class="lesson-section">'+sectionTitle(4,dynT('qr.compareTitle'),'comparison')+'<div class="comparison-pair"><article><span>'+dynT('qr.oneWay')+'</span><p class="jp" lang="ja">'+ruby(compare.left_jp)+'</p><p>'+ruby(compare.left_bn)+'</p></article><article><span>'+dynT('qr.otherWay')+'</span><p class="jp" lang="ja">'+ruby(compare.right_jp)+'</p><p>'+ruby(compare.right_bn)+'</p></article></div><p class="comparison-explanation">'+ruby(compare.explanation_bn)+'</p></section>'+
      '<section class="lesson-section">'+sectionTitle(5,dynT('qr.mistakeTitle'),'common-mistake')+'<div class="pitfall"><span aria-hidden="true">!</span><p>'+ruby(note.pitfall_bn)+'</p></div><p class="original-tip">'+ruby(i.tip_bn)+'</p><div class="memory"><span>'+dynT('qr.memoryLine')+'</span><p>'+ruby(note.memory_bn)+'</p></div></section>'+
      '<section class="lesson-section self-check">'+sectionTitle(6,dynT('qr.sayYourself'),'self-check')+'<p>'+ruby(note.practice.prompt_bn)+'</p><details><summary>'+dynT('qr.showAnswer')+'</summary><div><p class="jp" lang="ja">'+ruby(note.practice.answer_jp)+'</p><p>'+ruby(note.practice.explanation_bn)+'</p></div></details><p class="self-check-hint">'+dynT('qr.selfCheckHint')+'</p></section>'+
      '<div class="completion-row"><button class="btn" data-learned aria-pressed="'+learned.has(i.id)+'">'+(learned.has(i.id)?dynT('qt.learnedBtn'):dynT('qt.markLearned'))+'</button></div><div class="nav-row"><button class="btn" data-prev'+(idx===0?' disabled':'')+'>'+dynT('qt.prevLesson')+'</button><button class="btn primary" data-next'+(idx===course.lessons.length-1?' disabled':'')+'>'+dynT('qt.nextLesson')+' <span aria-hidden="true">→</span></button></div><p class="source-meta">'+dynT('qr.sourceBook')+bn(i.book_page)+dynT('qr.ownNote')+'</p>';
  }

  function afterRender(current, shouldScroll) {
    root.querySelector('#picker-current').textContent = dynT('qt.chapterPrefix')+bn(current.chapter)+' · '+plain(current.title);
    if (shouldScroll && (!mobile.matches || !picker.open)) root.querySelector('.main').scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  return { renderLesson, afterRender };
}
