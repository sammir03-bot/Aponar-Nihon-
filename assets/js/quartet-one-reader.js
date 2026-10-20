// Original, expanded teaching notes for the first volume. Progress stays in the
// shared course controller so existing bookmarks and answers keep working.
export function createMasterclass({ root, course, deep, ruby, esc, bn, plain, readSaved, save }) {
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
    root.querySelector('#reader-size-label').textContent = ['স্বাভাবিক', 'বড়', 'আরও বড়'][prefs.size];
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

  const sectionTitle = (number, title, id) => '<div class="section-heading" id="'+id+'" tabindex="-1"><span aria-hidden="true">'+bn(number).padStart(2,'০')+'</span><h3>'+title+'</h3></div>';
  function example(e, number) {
    const parts = e.parts ? '<div class="sentence-parts" aria-label="বাক্য অংশে ভাগ করে অর্থ">'+e.parts.map((p, index) => '<div><span class="part-index" aria-hidden="true">'+bn(index+1)+'</span><p lang="ja">'+ruby(p.japanese)+'</p><p>'+ruby(p.meaning_bn)+'</p></div>').join('')+'</div>' : '';
    return '<article class="example'+(parts?' worked-example':'')+'"><div class="example-label"><span>উদাহরণ '+bn(number).padStart(2,'০')+'</span>'+(parts?'<span class="worked-badge">বাক্য ভেঙে বুঝুন</span>':'')+'</div><p class="jp" lang="ja">'+ruby(e.japanese)+'</p><p class="translation">'+ruby(e.bangla)+'</p>'+parts+(e.why_bn?'<p class="example-why"><strong>কেন এই গঠন?</strong> '+ruby(e.why_bn)+'</p>':'')+'</article>';
  }
  function renderLesson(i, idx, learned) {
    const note = deep.lessons[i.id];
    const compare = note.comparison;
    return '<header class="lesson-heading"><div class="lesson-overline"><span>অধ্যায় '+bn(i.chapter)+' <span aria-hidden="true">/</span> পাঠ '+bn(i.order)+'</span><span>'+bn(idx+1)+' / ৫৫</span></div><h2 class="grammar-title">'+ruby(i.title)+'</h2><p class="meaning">'+ruby(i.meaning_bn)+'</p><div class="lesson-chips"><span>১০টি উদাহরণ</span><span>বাক্য ধরে ব্যাখ্যা</span><span>নিজে যাচাই</span></div></header>'+
      '<nav class="lesson-jumps" aria-label="পাঠের অংশ"><button data-jump="understand">বুঝুন</button><button data-jump="formation">Form</button><button data-jump="examples">উদাহরণ</button><button data-jump="common-mistake">ভুল এড়ান</button></nav>'+
      '<section class="lesson-section">'+sectionTitle(1,'আগে পরিস্থিতিটা বুঝুন','understand')+'<p class="scene">'+ruby(note.scene_bn)+'</p><div class="meaning-model" role="group" aria-label="ব্যবহারের ভাবনা">'+note.model_bn.map((s,n)=>'<div><span class="model-dot" aria-hidden="true">'+bn(n+1)+'</span><p>'+ruby(s)+'</p></div>').join('')+'</div><p>'+ruby(i.explanation_bn)+'</p><ol class="teaching-steps">'+note.steps_bn.map(s=>'<li>'+ruby(s)+'</li>').join('')+'</ol></section>'+
      '<section class="lesson-section">'+sectionTitle(2,'ধাপে ধাপে Form বানান','formation')+'<ul class="formula-list">'+i.forms.map(f=>'<li>'+ruby(f)+'</li>').join('')+'</ul><div class="form-builds">'+note.form_builds.map(f=>'<article class="form-build"><div class="form-input"><span>শুরুর রূপ</span><p lang="ja">'+ruby(f.before)+'</p></div><div class="form-rule"><span aria-hidden="true">→</span><p>'+ruby(f.pattern)+'</p></div><div class="form-output"><span>যে রূপটি হবে</span><p lang="ja">'+ruby(f.after)+'</p></div><p class="form-note">'+ruby(f.note_bn)+'</p></article>').join('')+'</div></section>'+
      '<section class="lesson-section examples-section">'+sectionTitle(3,'বাক্যে দেখে বুঝুন','examples')+'<p class="section-intro">প্রথম দুইটি বাক্য অংশে ভাগ করা। তারপর ভিন্ন পরিস্থিতিতে একই নিয়ম দেখুন।</p>'+note.extra_examples.map((e,n)=>example(e,n+1)).join('')+i.examples.map((e,n)=>example(e,n+9)).join('')+'</section>'+
      '<section class="lesson-section">'+sectionTitle(4,'পাশাপাশি রেখে পার্থক্য বুঝুন','comparison')+'<div class="comparison-pair"><article><span>একভাবে বললে</span><p class="jp" lang="ja">'+ruby(compare.left_jp)+'</p><p>'+ruby(compare.left_bn)+'</p></article><article><span>অন্যভাবে বললে</span><p class="jp" lang="ja">'+ruby(compare.right_jp)+'</p><p>'+ruby(compare.right_bn)+'</p></article></div><p class="comparison-explanation">'+ruby(compare.explanation_bn)+'</p></section>'+
      '<section class="lesson-section">'+sectionTitle(5,'যে ভুলটি এড়িয়ে চলবেন','common-mistake')+'<div class="pitfall"><span aria-hidden="true">!</span><p>'+ruby(note.pitfall_bn)+'</p></div><p class="original-tip">'+ruby(i.tip_bn)+'</p><div class="memory"><span>এক লাইনে মনে রাখুন</span><p>'+ruby(note.memory_bn)+'</p></div></section>'+
      '<section class="lesson-section self-check">'+sectionTitle(6,'এবার নিজে একটি বাক্য বলুন','self-check')+'<p>'+ruby(note.practice.prompt_bn)+'</p><details><summary>উত্তর ও কারণ দেখুন</summary><div><p class="jp" lang="ja">'+ruby(note.practice.answer_jp)+'</p><p>'+ruby(note.practice.explanation_bn)+'</p></div></details><p class="self-check-hint">আগে নিজে বলুন। তারপর উত্তরের সঙ্গে Form মিলিয়ে নিন।</p></section>'+
      '<div class="completion-row"><button class="btn" data-learned aria-pressed="'+learned.has(i.id)+'">'+(learned.has(i.id)?'✓ শেখা হয়েছে':'শেখা হয়েছে চিহ্ন দিন')+'</button></div><div class="nav-row"><button class="btn" data-prev'+(idx===0?' disabled':'')+'>আগের পাঠ</button><button class="btn primary" data-next'+(idx===course.lessons.length-1?' disabled':'')+'>পরের পাঠ <span aria-hidden="true">→</span></button></div><p class="source-meta">মূল বই পৃ. '+bn(i.book_page)+' · নিজস্ব বাংলা সহায়ক নোট</p>';
  }

  function afterRender(current, shouldScroll) {
    root.querySelector('#picker-current').textContent = 'অধ্যায় '+bn(current.chapter)+' · '+plain(current.title);
    if (shouldScroll && (!mobile.matches || !picker.open)) root.querySelector('.main').scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  return { renderLesson, afterRender };
}
