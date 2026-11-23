(async function () {
  'use strict';
  const themes = {
    n5: {sub:'mh.levelBeginner',hero:'linear-gradient(135deg,#173152,#315f86,#7194b2)',grad:'linear-gradient(135deg,#2563eb,#06b6d4)',shadow:'rgba(37,99,235,.22)'},
    n4: {sub:'mh.levelElementary',hero:'linear-gradient(135deg,#173152,#6e4f3a,#b87543)',grad:'linear-gradient(135deg,#d85c4a,#e4a34a)',shadow:'rgba(216,92,74,.24)'},
    n3: {sub:'mh.levelIntermediate',hero:'linear-gradient(135deg,#173152,#493f91,#6975b9)',grad:'linear-gradient(135deg,#6c5ce7,#4f87ac)',shadow:'rgba(108,92,231,.24)'}
  };
  const level=(document.body.dataset.level||'n5').toLowerCase(),theme=themes[level]||themes.n5;
  const $=s=>document.querySelector(s),bn=v=>String(v).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
  const dynT=(k,v)=>{if(window.AponarDyn)return window.AponarDyn(k,v);let s=dynT._b[k]||k;if(v)for(const x in v)s=s.split("{"+x+"}").join(v[x]);return s};dynT._b={"mh.levelBeginner": "বিগিনার", "mh.levelElementary": "এলিমেন্টারি", "mh.levelIntermediate": "ইন্টারমিডিয়েট", "mh.loading": "পরীক্ষার তালিকা লোড হচ্ছে…", "mh.loadFail": "টেস্ট তালিকা লোড হয়নি", "mh.updating": "টেস্ট তালিকা আপডেট হচ্ছে", "mh.heroSets": "{n}টি চালু পূর্ণ পরীক্ষা। পরীক্ষা, টাইমার, ফলাফল, বাংলা ব্যাখ্যা ও সনদ—সব এখানেই।", "mh.totalMinutes": "মোট {t} মিনিট", "mh.passMark": "পাসসীমা {p}/১৮০", "mh.fullSet": "পূর্ণ পরীক্ষার সেট", "mh.credits": "উৎস ও অডিও ক্রেডিট", "mh.cardSections": "শব্দভাণ্ডার · গ্রামার/রিডিং · লিসেনিং", "mh.cardNeedQuestions": "নতুন আলাদা প্রশ্ন প্রয়োজন", "mh.readyTag": "প্রস্তুত", "mh.notReadyTag": "প্রস্তুত হয়নি", "mh.minutes": "{t} মিনিট", "mh.questionsCount": "{n} প্রশ্ন", "mh.mockCert": "মক পরীক্ষার সনদ", "mh.scorePrefix": "স্কোর: ", "mh.scoreValue": "{s}/১৮০", "mh.passed": "মক পরীক্ষায় উত্তীর্ণ", "mh.needPractice": "আরও প্র্যাকটিস দরকার", "mh.notTaken": "এখনও পরীক্ষা দেওয়া হয়নি", "mh.pendingNote": "পূর্ণ সেটের প্রশ্ন ও বাংলা ব্যাখ্যা যাচাই বাকি", "mh.retake": "একই সেট আবার দিন", "mh.sourceNote": "JapaneseTest4You ও আপনার নিহোনের নিজস্ব প্রশ্ন; প্রতিটি উত্তরের বাংলা অর্থ ও ব্যাখ্যা আছে। নতুন নিজস্ব লিসেনিংয়ে জাপানি কৃত্রিম কণ্ঠ। সময় ও পাসসীমা JLPT অনুযায়ী; স্কোর ও সনদ মক পরীক্ষার।", "mh.start": "পরীক্ষা শুরু করুন", "mh.resultCert": "ফলাফল ও সনদ", "mh.notReady": "প্রশ্ন প্রস্তুত হয়নি", "mh.reloadSuffix": "। পেজ রিলোড করুন।"};function dynLang(){return window.AponarDynLang?window.AponarDynLang():'bn';}function num(v){return dynLang()==='bn'?bn(v):String(v);}function examHref(q){const l=dynLang();return l==='bn'?'jlpt-exam.html?'+q:'/'+l+'/jlpt-exam/?'+q;}function notesHref(){const l=dynLang();return l==='bn'?'mock-content-notes.html':'/'+l+'/mock-content-notes/';}
  document.documentElement.style.setProperty('--hero',theme.hero);
  document.documentElement.style.setProperty('--grad',theme.grad);
  document.documentElement.style.setProperty('--shadow-color',theme.shadow);
  $('#heroTitle').textContent=`JLPT ${level.toUpperCase()} Mock Test`;
  $('#examGrid').textContent=dynT('mh.loading');
  try {
    const response=await fetch('/assets/data/jtest4you/catalog.json?v=20261006.complete',{cache:'no-cache'});
    if(!response.ok)throw new Error(dynT('mh.loadFail'));
    const catalog=await response.json();
    if(window.AponarQbApply)await window.AponarQbApply('/assets/data/jtest4you/catalog.json',catalog);
    if(catalog.version!==9)throw new Error(dynT('mh.updating'));
    const c=catalog.levels[level],count=c.counts.reduce((a,b)=>a+b,0),time=c.times.reduce((a,b)=>a+b,0);
    document.title=`JLPT ${level.toUpperCase()} Mock Test | আপনার নিহোন`;
    $('#levelName').textContent=`JLPT ${level.toUpperCase()}`;
    $('#levelSub').textContent=dynT(theme.sub);
    $('#levelJp').textContent=`日本語能力試験 ${level.toUpperCase()}`;
    $('#heroTitle').innerHTML=`JLPT ${level.toUpperCase()} <span>আপনার নিহোন Mock Test</span>`;
    $('#heroDesc').textContent=dynT('mh.heroSets',{n:num(c.availableSets)});
    $('#timePill').textContent=dynT('mh.totalMinutes',{t:num(time)});
    $('#passPill').textContent=dynT('mh.passMark',{p:num(c.pass)});
    $('.section-head h2').textContent=dynT('mh.fullSet');
    $('#sourceNote').textContent=dynT('mh.sourceNote');
    $('#sourceNote').append(document.createTextNode(' '));const credits=document.createElement('a');credits.href=notesHref();credits.textContent=dynT('mh.credits');$('#sourceNote').append(credits);
    $('#activeLevel').innerHTML=`<i class="fa-solid fa-file-lines"></i>${level.toUpperCase()}`;
    let results={};
    try {results=JSON.parse(localStorage.getItem('aponarNihonMockResults')||'{}')}catch{}
    let html='';
    for(let i=1;i<=c.limit;i++){
      const ready=i<=c.availableSets,r=results[`${level}-${i}`],done=ready&&window.AponarMockBankVersion.compatible(level,i,r?.bankVersion);
      html+=`<article class="exam-card ${ready?'':'pending-set'}" data-test="${i}" data-ready="${ready}"><div class="exam-title-row"><div class="exam-no"><div class="exam-icon"><i class="fa-solid ${ready?'fa-file-pen':'fa-lock'}"></i></div><h3>${level.toUpperCase()} Mock Test ${String(i).padStart(2,'0')}<small>${ready?dynT('mh.cardSections'):dynT('mh.cardNeedQuestions')}</small></h3></div><span class="tag">${ready?dynT('mh.readyTag'):dynT('mh.notReadyTag')}</span></div><div class="meta"><span><i class="fa-regular fa-clock"></i> ${dynT('mh.minutes',{t:num(time)})}</span><span><i class="fa-solid fa-list-check"></i> ${dynT('mh.questionsCount',{n:num(count)})}</span><span><i class="fa-solid fa-award"></i> ${dynT('mh.mockCert')}</span></div><div class="score-mini" id="score-${i}">${done?dynT('mh.scorePrefix')+'<strong>'+dynT('mh.scoreValue',{s:num(r.score)})+'</strong> · '+(r.passed?dynT('mh.passed'):dynT('mh.needPractice')):ready?dynT('mh.notTaken'):dynT('mh.pendingNote')}</div><div class="exam-actions">${ready?`<a class="start" id="start-${i}" href="${examHref('level='+level+'&test='+i)}"><i class="fa-solid ${done?'fa-rotate-right':'fa-play'}"></i> ${done?dynT('mh.retake'):dynT('mh.start')}</a><a class="result-link ${done?'show':''}" id="result-${i}" href="${examHref('level='+level+'&test='+i+'&result=1')}">${dynT('mh.resultCert')}</a>`:`<button class="start" type="button" disabled>${dynT('mh.notReady')}</button>`}</div></article>`;
    }
    $('#examGrid').innerHTML=html;
  } catch(error) {
    $('#examGrid').textContent=error.message+dynT('mh.reloadSuffix');
  }
})();
