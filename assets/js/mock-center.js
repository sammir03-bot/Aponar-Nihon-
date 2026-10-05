(async()=>{'use strict';
const bn=v=>String(v).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
try{
 const response=await fetch('/assets/data/jtest4you/catalog.json?v=20261005.15',{cache:'no-cache'});if(!response.ok)throw new Error('টেস্ট তালিকা লোড হয়নি');
 const catalog=await response.json();if(catalog.version!==6)throw new Error('টেস্ট তালিকা আপডেট হচ্ছে');
 let results={};try{results=JSON.parse(localStorage.getItem('aponarNihonMockResults')||'{}')}catch{}
 let totalSets=0,totalTarget=0;
 for(const [level,c] of Object.entries(catalog.levels)){
  totalSets+=c.availableSets;totalTarget+=c.limit;
  const card=document.querySelector(`[data-level="${level}"]`);if(!card)continue;
  card.querySelector('h3').textContent=`JLPT ${level.toUpperCase()} · ${bn(c.availableSets)}টি আলাদা সেট`;
  const facts=card.querySelectorAll('.fact');facts[0].lastChild.textContent=`${c.times.join(' + ')} = ${c.times.reduce((a,b)=>a+b,0)} মিনিট`;
  facts[1].lastChild.textContent=`${c.counts.join(' + ')} = ${c.counts.reduce((a,b)=>a+b,0)} প্রশ্ন (আনুমানিক বিন্যাস)`;
  let done=0;for(let i=1;i<=c.availableSets;i++)if(results[level+'-'+i]?.bankVersion===6)done++;
  document.getElementById(level+'txt').textContent=`${bn(done)} / ${bn(c.availableSets)}`;
  document.getElementById(level+'bar').style.width=(c.availableSets?done/c.availableSets*100:0)+'%';
 }
 const hero=document.querySelector('.hero p');if(hero)hero.textContent='JLPT-এর অফিসিয়াল সময়সীমা ও পাসসীমায় উৎসের প্রশ্ন দিয়ে অনুশীলন। পর্যাপ্ত নতুন প্রশ্ন ছাড়া সেট বাড়ানো হয় না; পুরোনো প্রশ্ন ঘুরিয়ে নতুন সেট দেখানো হয় না।';
 const stats=document.querySelector('.hero-meta');if(stats)stats.textContent=`${bn(totalSets)}টি আলাদা সেট · লক্ষ্য ${bn(totalTarget)}টি পূর্ণ সেট · ৩টি লেভেল · অটো-সেভ`;
 const intro=document.querySelector('.head p');if(intro)intro.textContent='চালু সেটে নতুন প্রশ্ন পাবেন। একই সেট আবার দিলে একই প্রশ্ন থাকবে—বাটনে তা স্পষ্ট লেখা আছে।';
 const note=document.querySelector('.note');if(note)note.textContent='প্রশ্ন ও answer key: JapaneseTest4You। JLPT-এর অফিসিয়াল সময় ও পাসসীমা অনুসরণ করা হয়েছে। প্রশ্নসংখ্যা আনুমানিক; প্রকৃত পরীক্ষায় কিছুটা বদলায়। ১৮০ নম্বর অনুশীলনের সরল conversion, অফিসিয়াল IRT scaled score নয়। N5 উৎসে paraphrase প্রশ্ন নেই; ওই অংশে context practice আছে।';
}catch(error){const note=document.querySelector('.note');if(note)note.textContent=error.message+'। পেজ রিলোড করে চালু সেটগুলো দেখুন।';}
})();
