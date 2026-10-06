(async()=>{
  'use strict';
  const bn=v=>String(v).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
  try{
    const response=await fetch('/assets/data/jtest4you/catalog.json?v=20261006.complete',{cache:'no-cache'});
    if(!response.ok)throw new Error('টেস্ট তালিকা লোড হয়নি');
    const catalog=await response.json();
    if(catalog.version!==9)throw new Error('টেস্ট তালিকা আপডেট হচ্ছে');
    let results={};try{results=JSON.parse(localStorage.getItem('aponarNihonMockResults')||'{}')}catch{}
    let totalSets=0,totalTarget=0;
    for(const [level,c] of Object.entries(catalog.levels)){
      totalSets+=c.availableSets;totalTarget+=c.limit;
      const card=document.querySelector(`[data-level="${level}"]`);if(!card)continue;
      card.querySelector('h3').textContent=`JLPT ${level.toUpperCase()} · ${bn(c.availableSets)}টি চালু পূর্ণ পরীক্ষা`;
      const facts=card.querySelectorAll('.fact');
      facts[0].lastChild.textContent=`${c.times.join(' + ')} = ${c.times.reduce((a,b)=>a+b,0)} মিনিট`;
      facts[1].lastChild.textContent=`${c.counts.join(' + ')} = ${c.counts.reduce((a,b)=>a+b,0)} প্রশ্ন`;
      let done=0;for(let i=1;i<=c.availableSets;i++)if(window.AponarMockBankVersion.compatible(level,i,results[level+'-'+i]?.bankVersion))done++;
      document.getElementById(level+'txt').textContent=`${bn(done)} / ${bn(c.availableSets)}`;
      document.getElementById(level+'bar').style.width=(c.availableSets?done/c.availableSets*100:0)+'%';
    }
    const hero=document.querySelector('.hero p');
    if(hero)hero.textContent='আপনার নিহোনে পূর্ণ মক পরীক্ষা দিন। পার্ট অনুযায়ী টাইমার, অটো-সেভ, বিস্তারিত স্কোর, প্রতিটি উত্তরের বাংলা ব্যাখ্যা এবং নিজের নামে সনদ।';
    const stats=document.querySelector('.hero-meta');
    if(stats)stats.textContent=`${bn(totalSets)}টি চালু পূর্ণ পরীক্ষা · ৩টি লেভেল · নিজের সাইটেই পরীক্ষা ও ফলাফল`;
    const intro=document.querySelector('.head p');
    if(intro)intro.textContent='প্রতিটি লেভেলে ১০টি পূর্ণ সেট। লেভেল বেছে এখানেই পরীক্ষা শুরু করুন।';
    const note=document.querySelector('.note');
    if(note)note.innerHTML='প্রশ্ন ও অডিও: JapaneseTest4You এবং আপনার নিহোনের নিজস্ব প্রশ্ন। নতুন নিজস্ব লিসেনিংয়ে জাপানি কৃত্রিম কণ্ঠ। JLPT সময় ও পাসসীমা অনুসরণ করা হয়েছে; স্কোর অনুশীলনের। <a href="mock-content-notes.html" style="color:#93c5fd">উৎস ও ক্রেডিট</a>';
  }catch(error){
    const note=document.querySelector('.note');if(note)note.textContent=error.message+'। পেজ রিলোড করে চালু সেট দেখুন।';
  }
})();
