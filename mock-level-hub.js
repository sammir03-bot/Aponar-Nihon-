(async function () {
  'use strict';
  const themes = {
    n5: {sub:'বিগিনার',hero:'linear-gradient(135deg,#173152,#315f86,#7194b2)',grad:'linear-gradient(135deg,#2563eb,#06b6d4)',shadow:'rgba(37,99,235,.22)'},
    n4: {sub:'এলিমেন্টারি',hero:'linear-gradient(135deg,#173152,#6e4f3a,#b87543)',grad:'linear-gradient(135deg,#d85c4a,#e4a34a)',shadow:'rgba(216,92,74,.24)'},
    n3: {sub:'ইন্টারমিডিয়েট',hero:'linear-gradient(135deg,#173152,#493f91,#6975b9)',grad:'linear-gradient(135deg,#6c5ce7,#4f87ac)',shadow:'rgba(108,92,231,.24)'}
  };
  const level=(document.body.dataset.level||'n5').toLowerCase(),theme=themes[level]||themes.n5;
  const $=s=>document.querySelector(s),bn=v=>String(v).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
  document.documentElement.style.setProperty('--hero',theme.hero);
  document.documentElement.style.setProperty('--grad',theme.grad);
  document.documentElement.style.setProperty('--shadow-color',theme.shadow);
  $('#heroTitle').textContent=`JLPT ${level.toUpperCase()} Mock Test`;
  $('#examGrid').textContent='পরীক্ষার তালিকা লোড হচ্ছে…';
  try {
    const response=await fetch('/assets/data/jtest4you/catalog.json?v=20261006.complete',{cache:'no-cache'});
    if(!response.ok)throw new Error('টেস্ট তালিকা লোড হয়নি');
    const catalog=await response.json();
    if(catalog.version!==9)throw new Error('টেস্ট তালিকা আপডেট হচ্ছে');
    const c=catalog.levels[level],count=c.counts.reduce((a,b)=>a+b,0),time=c.times.reduce((a,b)=>a+b,0);
    document.title=`JLPT ${level.toUpperCase()} Mock Test | আপনার নিহোন`;
    $('#levelName').textContent=`JLPT ${level.toUpperCase()}`;
    $('#levelSub').textContent=theme.sub;
    $('#levelJp').textContent=`日本語能力試験 ${level.toUpperCase()}`;
    $('#heroTitle').innerHTML=`JLPT ${level.toUpperCase()} <span>আপনার নিহোন Mock Test</span>`;
    $('#heroDesc').textContent=`${bn(c.availableSets)}টি চালু পূর্ণ পরীক্ষা। পরীক্ষা, টাইমার, ফলাফল, বাংলা ব্যাখ্যা ও সনদ—সব এখানেই।`;
    $('#timePill').textContent=`মোট ${bn(time)} মিনিট`;
    $('#passPill').textContent=`পাসসীমা ${bn(c.pass)}/১৮০`;
    $('.section-head h2').textContent='পূর্ণ পরীক্ষার সেট';
    $('#sourceNote').textContent='JapaneseTest4You ও আপনার নিহোনের নিজস্ব প্রশ্ন; প্রতিটি উত্তরের বাংলা অর্থ ও ব্যাখ্যা আছে। নতুন নিজস্ব লিসেনিংয়ে জাপানি কৃত্রিম কণ্ঠ। সময় ও পাসসীমা JLPT অনুযায়ী; স্কোর ও সনদ মক পরীক্ষার।';
    $('#sourceNote').append(document.createTextNode(' '));const credits=document.createElement('a');credits.href='mock-content-notes.html';credits.textContent='উৎস ও অডিও ক্রেডিট';$('#sourceNote').append(credits);
    $('#activeLevel').innerHTML=`<i class="fa-solid fa-file-lines"></i>${level.toUpperCase()}`;
    let results={};
    try {results=JSON.parse(localStorage.getItem('aponarNihonMockResults')||'{}')}catch{}
    let html='';
    for(let i=1;i<=c.limit;i++){
      const ready=i<=c.availableSets,r=results[`${level}-${i}`],done=ready&&window.AponarMockBankVersion.compatible(level,i,r?.bankVersion);
      html+=`<article class="exam-card ${ready?'':'pending-set'}" data-test="${i}" data-ready="${ready}"><div class="exam-title-row"><div class="exam-no"><div class="exam-icon"><i class="fa-solid ${ready?'fa-file-pen':'fa-lock'}"></i></div><h3>${level.toUpperCase()} Mock Test ${String(i).padStart(2,'0')}<small>${ready?'শব্দভাণ্ডার · গ্রামার/রিডিং · লিসেনিং':'নতুন আলাদা প্রশ্ন প্রয়োজন'}</small></h3></div><span class="tag">${ready?'প্রস্তুত':'প্রস্তুত হয়নি'}</span></div><div class="meta"><span><i class="fa-regular fa-clock"></i> ${bn(time)} মিনিট</span><span><i class="fa-solid fa-list-check"></i> ${bn(count)} প্রশ্ন</span><span><i class="fa-solid fa-award"></i> মক পরীক্ষার সনদ</span></div><div class="score-mini" id="score-${i}">${done?`স্কোর: <strong>${bn(r.score)}/১৮০</strong> · ${r.passed?'মক পরীক্ষায় উত্তীর্ণ':'আরও প্র্যাকটিস দরকার'}`:ready?'এখনও পরীক্ষা দেওয়া হয়নি':'পূর্ণ সেটের প্রশ্ন ও বাংলা ব্যাখ্যা যাচাই বাকি'}</div><div class="exam-actions">${ready?`<a class="start" id="start-${i}" href="jlpt-exam.html?level=${level}&test=${i}"><i class="fa-solid ${done?'fa-rotate-right':'fa-play'}"></i> ${done?'একই সেট আবার দিন':'পরীক্ষা শুরু করুন'}</a><a class="result-link ${done?'show':''}" id="result-${i}" href="jlpt-exam.html?level=${level}&test=${i}&result=1">ফলাফল ও সনদ</a>`:'<button class="start" type="button" disabled>প্রশ্ন প্রস্তুত হয়নি</button>'}</div></article>`;
    }
    $('#examGrid').innerHTML=html;
  } catch(error) {
    $('#examGrid').textContent=error.message+'। পেজ রিলোড করুন।';
  }
})();
