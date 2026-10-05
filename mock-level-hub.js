(async function(){'use strict';
const themes={
 n5:{sub:'বিগিনার',hero:'linear-gradient(135deg,#173152 0%,#315f86 55%,#7194b2 100%)',grad:'linear-gradient(135deg,#2563eb,#06b6d4)',shadow:'rgba(37,99,235,.22)'},
 n4:{sub:'এলিমেন্টারি',hero:'linear-gradient(135deg,#173152 0%,#6e4f3a 55%,#b87543 100%)',grad:'linear-gradient(135deg,#d85c4a,#e4a34a)',shadow:'rgba(216,92,74,.24)'},
 n3:{sub:'ইন্টারমিডিয়েট',hero:'linear-gradient(135deg,#173152 0%,#493f91 55%,#6975b9 100%)',grad:'linear-gradient(135deg,#6c5ce7,#4f87ac)',shadow:'rgba(108,92,231,.24)'}
};
const level=(document.body.dataset.level||'n5').toLowerCase(),theme=themes[level]||themes.n5,$=s=>document.querySelector(s),bn=v=>String(v).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
document.documentElement.style.setProperty('--hero',theme.hero);document.documentElement.style.setProperty('--grad',theme.grad);document.documentElement.style.setProperty('--shadow-color',theme.shadow);
$('#heroTitle').textContent=`JLPT ${level.toUpperCase()} Mock Test`;$('#examGrid').textContent='আলাদা প্রশ্নের সেট যাচাই হচ্ছে…';
try{
 const response=await fetch('/assets/data/jtest4you/catalog.json?v=20261005.6',{cache:'no-cache'});if(!response.ok)throw new Error('টেস্ট তালিকা লোড হয়নি');
 const catalog=await response.json();if(catalog.version!==6)throw new Error('টেস্ট তালিকা আপডেট হচ্ছে');
 const c=catalog.levels[level],count=c.counts.reduce((a,b)=>a+b,0),time=c.times.reduce((a,b)=>a+b,0);
 document.title=`JLPT ${level.toUpperCase()} — ${bn(c.availableSets)}টি আলাদা Mock Test | আপনার নিহোন`;
 $('#levelName').textContent=`JLPT ${level.toUpperCase()}`;$('#levelSub').textContent=theme.sub;$('#levelJp').textContent=`日本語能力試験 ${level.toUpperCase()}`;
 $('#heroTitle').innerHTML=`JLPT ${level.toUpperCase()} <span>${bn(c.availableSets)}টি আলাদা Mock Test</span>`;
 $('#heroDesc').textContent=`শব্দভাণ্ডার · গ্রামার/রিডিং · লিসেনিং — ${c.times.map(bn).join(' + ')} মিনিট। JLPT পাসসীমা অনুযায়ী practice result; অফিসিয়াল IRT স্কোর নয়।`;
 $('#timePill').textContent=`মোট ${bn(time)} মিনিট`;$('#passPill').textContent=`JLPT পাসসীমা ${bn(c.pass)}/১৮০`;
 $('.section-head h2').textContent='নতুন আলাদা প্রশ্নের সেট';
 $('#sourceNote').textContent='JapaneseTest4You-এর মূল প্রশ্ন, উত্তর ও রেকর্ডিং। আলাদা সেটে একই প্রশ্ন বা অডিও ঘোরানো হয় না। পর্যাপ্ত নতুন যাচাইকৃত প্রশ্ন ছাড়া আরেকটি সেট চালু করা হবে না।'+(level==='n5'?' N5 উৎসে paraphrase প্রশ্ন নেই; ওই ৩টির জায়গায় context practice আছে।':'');
 $('#activeLevel').innerHTML=`<i class="fa-solid fa-file-lines"></i>${level.toUpperCase()}`;
 let results={};try{results=JSON.parse(localStorage.getItem('aponarNihonMockResults')||'{}')}catch{}
 let html='';for(let i=1;i<=c.availableSets;i++){
  const r=results[`${level}-${i}`],done=r?.bankVersion===6;
  html+=`<article class="exam-card" data-test="${i}"><div class="exam-title-row"><div class="exam-no"><div class="exam-icon"><i class="fa-solid fa-file-pen"></i></div><h3>${level.toUpperCase()} Mock Test ${i}<small>আলাদা প্রশ্ন · সেট ${String(i).padStart(2,'0')}</small></h3></div><span class="tag">JTEST4YOU</span></div><div class="meta"><span><i class="fa-regular fa-clock"></i> ${bn(time)} মিনিট</span><span><i class="fa-solid fa-list-check"></i> ${bn(count)} প্রশ্ন</span><span><i class="fa-solid fa-headphones"></i> লিসেনিং</span></div><div class="score-mini" id="score-${i}">${done?`Practice score: <strong>${bn(r.score)}/১৮০</strong> · ${r.passed?'Practice pass':'আরও প্র্যাকটিস দরকার'}`:'এখনও পরীক্ষা দেওয়া হয়নি'}</div><div class="exam-actions"><a class="start" id="start-${i}" href="jlpt-exam.html?level=${level}&test=${i}"><i class="fa-solid ${done?'fa-rotate-right':'fa-play'}"></i> ${done?'একই সেট আবার দিন':'নতুন সেট শুরু করুন'}</a><a class="result-link ${done?'show':''}" id="result-${i}" href="jlpt-exam.html?level=${level}&test=${i}&result=1">ফলাফল</a></div></article>`;
 }
 $('#examGrid').innerHTML=html||'আরেকটি পূর্ণ সেটের জন্য নতুন যাচাইকৃত প্রশ্ন প্রয়োজন।';
}catch(error){$('#examGrid').textContent=error.message+'। পেজ রিলোড করুন।';}
})();
