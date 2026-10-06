(()=>{
  const E=id=>document.getElementById(id);
  const safe=(v='')=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  if(!E('paperArea')||typeof state==='undefined') return;

  const extraKeys=['postal','tel','fax','contactKana','contactPostal','contactAddress','contactTel','contactFax','commuteHour','commuteMin','dependents','spouse','spouseSupport','stationLine','stationName','strengths','guardianName','guardianAddress','guardianTel','guardianFax'];
  extraKeys.forEach(k=>{if(state[k]===undefined) state[k]='';});

  function field(id,ja,bn,type='text',ph=''){
    if(type==='select') return `<div class="field"><label><span class="ja">${ja}</span><span class="bn">${bn}</span></label><select id="${id}">${ph}</select></div>`;
    if(type==='textarea') return `<div class="field"><label><span class="ja">${ja}</span><span class="bn">${bn}</span></label><textarea id="${id}" placeholder="${safe(ph)}"></textarea></div>`;
    return `<div class="field"><label><span class="ja">${ja}</span><span class="bn">${bn}</span></label><input id="${id}" type="${type}" placeholder="${safe(ph)}"></div>`;
  }

  function mountExtraFields(){
    const personal=document.querySelector('.step[data-form="1"]');
    if(personal&&!E('jisPersonalExtra')){
      personal.insertAdjacentHTML('beforeend',`<div class="jis-extra" id="jisPersonalExtra"><div class="jis-extra-title">📄 Traditional 履歴書 — অতিরিক্ত তথ্য</div><div class="jis-extra-note">Final CV-র layout আপনার দেওয়া দুই-পৃষ্ঠার Japanese resume form অনুযায়ী হবে।</div><div class="jis-extra-grid">
        ${field('postal','郵便番号','পোস্টাল কোড','text','124-0011')}
        ${field('tel','電話（TEL）','বাসা/অন্য ফোন নম্বর','tel','03-0000-0000')}
        ${field('fax','FAX','FAX নম্বর — না থাকলে খালি রাখুন','text','')}
        ${field('contactKana','連絡先 ふりがな','অন্য যোগাযোগের ঠিকানার ফুরিগানা','text','')}
        ${field('contactPostal','連絡先 郵便番号','অন্য যোগাযোগের পোস্টাল কোড','text','')}
        ${field('contactAddress','連絡先','বর্তমান ঠিকানা ছাড়া অন্য যোগাযোগের ঠিকানা','text','')}
        ${field('contactTel','連絡先 電話','অন্য যোগাযোগের ফোন','tel','')}
        ${field('contactFax','連絡先 FAX','অন্য যোগাযোগের FAX','text','')}
      </div></div>`);
    }
    const app=document.querySelector('.step[data-form="3"]');
    if(app&&!E('jisApplicationExtra')){
      app.insertAdjacentHTML('beforeend',`<div class="jis-extra" id="jisApplicationExtra"><div class="jis-extra-title">📄 履歴書 ২য় পৃষ্ঠার তথ্য</div><div class="jis-extra-note">Japanese option-এর নিচে বাংলা দেওয়া আছে; final Preview/PDF-তে form-এর original Japanese/English layout থাকবে।</div><div class="jis-extra-grid">
        ${field('commuteHour','通勤時間（時間）','যাতায়াতে কত ঘণ্টা লাগে','number','0')}
        ${field('commuteMin','通勤時間（分）','যাতায়াতে অতিরিক্ত কত মিনিট লাগে','number','30')}
        ${field('dependents','扶養家族数','আপনার উপর নির্ভরশীল পরিবারের সদস্য সংখ্যা','number','0')}
        ${field('spouse','配偶者','স্বামী/স্ত্রী আছে কি?','select','<option value="">未記載 / না লিখব</option><option value="有">有 / আছে</option><option value="無">無 / নেই</option>')}
        ${field('spouseSupport','配偶者の扶養義務','স্বামী/স্ত্রীর ভরণপোষণের দায়িত্ব আছে কি?','select','<option value="">未記載 / না লিখব</option><option value="有">有 / আছে</option><option value="無">無 / নেই</option>')}
        ${field('stationLine','最寄り駅 — 線','নিকটতম স্টেশনের লাইন','text','総武線')}
        ${field('stationName','最寄り駅 — 駅','নিকটতম স্টেশনের নাম','text','新小岩駅')}
      </div>
      ${field('strengths','特技・趣味・得意科目等','দক্ষতা, শখ, ভালো বিষয় ইত্যাদি','textarea','例：接客、サッカー、日本語学習')}
      <div class="jis-extra-grid">
        ${field('guardianName','保護者 氏名','অপ্রাপ্তবয়স্ক হলে অভিভাবকের নাম','text','')}
        ${field('guardianTel','保護者 電話','অভিভাবকের ফোন','tel','')}
        ${field('guardianAddress','保護者 住所','অভিভাবকের ঠিকানা','text','')}
        ${field('guardianFax','保護者 FAX','অভিভাবকের FAX','text','')}
      </div></div>`);
    }
    extraKeys.forEach(k=>{const el=E(k);if(!el)return;el.value=state[k]??'';el.oninput=el.onchange=()=>{state[k]=el.value;save();render();};});
  }

  function photoHtml(){return state.photo?`<img src="${state.photo}" alt="Portrait">`:`<div class="jis-photo-note"><b>Portrait</b><br>36～40 mm long,<br>24～30 mm wide,<br>Bust shot,<br>Write your name on<br>the back side</div>`;}
  function dateText(){const v=state.created||tokyoToday();if(!v)return'';const[y,m,d]=v.split('-');return `${+y}年　${+m}月　${+d}日現在 (date, as of)`;}
  function dobText(){if(!state.dob)return'';const[y,m,d]=state.dob.split('-');return `${+y}年　${+m}月　${+d}日生 （満 ${age(state.dob)} 歳）`;}
  function genderHtml(){if(state.gender==='男')return `<span class="jis-circle">男</span> ・ 女`;if(state.gender==='女')return `男 ・ <span class="jis-circle">女</span>`;if(state.gender==='その他')return 'その他';return `男 ・ 女`;}
  function historyRows(){
    const rows=[];
    rows.push({y:'',m:'',t:'学歴',c:'jis-section'});
    (state.edu||[]).filter(x=>x.year||x.month||x.text).forEach(x=>rows.push({y:x.year||'',m:x.month||'',t:x.text||''}));
    rows.push({y:'',m:'',t:'職歴',c:'jis-section'});
    const work=(state.work||[]).filter(x=>x.year||x.month||x.text);work.forEach(x=>rows.push({y:x.year||'',m:x.month||'',t:x.text||''}));
    if(work.length&&!/(退職|退社|契約終了)/.test(work[work.length-1].text||''))rows.push({y:'',m:'',t:'現在に至る',c:'jis-right'});
    rows.push({y:'',m:'',t:'以上',c:'jis-right'});
    const cap=15;if(rows.length>cap){rows.length=cap;rows[cap-1]={y:'',m:'',t:'※ 学歴・職歴の続きは別紙',c:'jis-right'};}
    while(rows.length<cap)rows.push({y:'',m:'',t:'',c:''});
    return rows.map(r=>`<tr><td class="jis-year">${safe(r.y)}</td><td class="jis-month">${safe(r.m)}</td><td class="${r.c||''}">${safe(r.t)}</td></tr>`).join('');
  }
  function qualRows(){const a=(state.qual||[]).filter(x=>x.year||x.month||x.text).slice(0,5);while(a.length<5)a.push({year:'',month:'',text:''});return a.map(x=>`<tr><td class="jis-year">${safe(x.year||'')}</td><td class="jis-month">${safe(x.month||'')}</td><td>${safe(x.text||'')}</td></tr>`).join('');}
  function requestText(){const out=[];if(state.template==='parttime'&&state.schoolTime)out.push(`学校授業時間：${state.schoolTime}`);if(state.template==='parttime'&&state.availability)out.push(`希望勤務日・時間帯：${state.availability}`);if(state.request)out.push(state.request);return out.join('\n');}

  function buildPages(){
    if(E('jisResume1'))return;
    const pages=`<div class="page jis-page print-jis" id="jisResume1">
      <div class="jis-header"><div class="jis-title">履歴書 <small>(Resume)</small></div><div class="jis-date" id="jisDate1"></div></div>
      <table class="jis-table">
        <tr><td class="jis-label">ふりがな<small>(Hiragana pronunciation)</small></td><td colspan="3" class="jis-kana" id="jisFuri"></td><td rowspan="3" class="jis-photo" id="jisPhoto"></td></tr>
        <tr><td class="jis-label">氏　名<small>(Name)</small></td><td colspan="3" class="jis-name" id="jisName"></td></tr>
        <tr><td class="jis-label">生年月日<small>(birthday)</small></td><td colspan="2" class="jis-dob" id="jisDob"></td><td class="jis-gender" id="jisGender"></td></tr>
        <tr class="jis-contact-row"><td class="jis-label">携帯電話<small>(mobile#)</small></td><td id="jisMobile"></td><td class="jis-label">E-MAIL</td><td colspan="2" id="jisEmail"></td></tr>
        <tr><td class="jis-label">ふりがな<small>(Hiragana pronunciation)</small></td><td colspan="3" id="jisAddrKana"></td><td rowspan="2" class="jis-side-contact"><div>電話 (TEL)<br><span id="jisTel"></span></div><div>FAX<br><span id="jisFax"></span></div></td></tr>
        <tr><td class="jis-label">現住所<small>(Current address)</small></td><td colspan="3" class="jis-address"><span id="jisPostal"></span><br><span id="jisAddress"></span></td></tr>
        <tr><td class="jis-label">ふりがな<small>(Hiragana pronunciation)</small></td><td colspan="3" id="jisContactKana"></td><td rowspan="2" class="jis-side-contact"><div>電話 (TEL)<br><span id="jisContactTel"></span></div><div>FAX<br><span id="jisContactFax"></span></div></td></tr>
        <tr><td class="jis-label">連絡先<small>(contact)</small></td><td colspan="3" class="jis-address"><span id="jisContactPostal"></span><br><span id="jisContactAddress"></span><br><small class="jis-en">（現住所以外に連絡を希望する場合のみ記入 / In the case you want a contact which is different from current address）</small></td></tr>
      </table>
      <table class="jis-table jis-history"><tr><th class="jis-year">年<small class="jis-en">(year)</small></th><th class="jis-month">月<small class="jis-en">(mo.)</small></th><th>学歴･職歴（各項目ごとにまとめて書く）<small class="jis-en">Academic records, work experiences</small></th></tr><tbody id="jisHistory"></tbody></table>
      <div class="jis-note">記入上の注意　1：鉛筆以外の黒または青の筆記具で記入。　2：数字はアラビア数字で、文字はくずさず正確に書く。<br>3：※印のところは、該当するものを○で囲む。<span class="support">Supported by Brainstorm Worldwide, Inc.</span></div>
    </div>
    <div class="page jis-page print-jis" id="jisResume2">
      <table class="jis-table jis-licenses"><tr><th class="jis-year">年<small class="jis-en">(year)</small></th><th class="jis-month">月<small class="jis-en">(mo.)</small></th><th>免許・資格<small class="jis-en">License, certificate, credentials</small></th></tr><tbody id="jisQuals"></tbody></table>
      <table class="jis-table jis-midinfo"><tr>
        <td class="wide"><b>通勤時間</b>　約 <span id="jisCommuteH"></span> 時間　<span id="jisCommuteM"></span> 分<br><small class="jis-en">Nearest station</small>　<span id="jisStationLine"></span> 線　<span id="jisStationName"></span> 駅</td>
        <td class="fam">扶養家族数 (# of family)<br>（配偶者を除く / Excluding spouse）<br><b id="jisDependents"></b> 人</td>
        <td class="spouse">配偶者 (Spouse)<br><span id="jisSpouse"></span><br><small class="jis-en">Yes　No</small></td>
        <td class="support">配偶者の扶養義務<br><small class="jis-en">(Duty of spouse support)</small><br><span id="jisSpouseSupport"></span><br><small class="jis-en">Yes　No</small></td>
      </tr></table>
      <div class="jis-box jis-strengths"><div class="jis-box-head">特技・趣味・得意科目等 <small>(Strengths, special skills and interests, hobbies, favorite subjects)</small></div><div class="jis-box-body" id="jisStrengths"></div></div>
      <div class="jis-box jis-motive"><div class="jis-box-head">志望の動機 <small>(Objective of application)</small></div><div class="jis-box-body" id="jisMotive"></div></div>
      <div class="jis-box jis-request"><div class="jis-box-head">本人希望記入欄（特に給料･職種･勤務時間･勤務地･その他についての希望などがあれば記入）<small>(Desirable employment conditions, such as salary, role, working hours, location and other preferences)</small></div><div class="jis-box-body" id="jisRequest"></div></div>
      <table class="jis-table jis-guardian"><tr><td colspan="3" class="g-head">保護者（本人が未成年者の場合のみ記入） <small>(Guardian, in case applicant is underage)</small></td><td>電話 <span id="jisGuardianTel"></span></td></tr><tr><td>氏 名</td><td id="jisGuardianName"></td><td>住 所　<span id="jisGuardianAddress"></span></td><td>FAX <span id="jisGuardianFax"></span></td></tr></table>
      <div class="jis-note"><span class="support">Supported by Brainstorm Worldwide, Inc.</span></div>
    </div>`;
    E('careerDoc').insertAdjacentHTML('beforebegin',pages);
  }

  function renderJIS(){
    if(!E('jisResume1'))return;
    E('jisDate1').textContent=dateText();E('jisFuri').textContent=state.furigana||'';E('jisName').textContent=state.name||'';E('jisDob').textContent=dobText();E('jisGender').innerHTML=genderHtml();E('jisPhoto').innerHTML=photoHtml();
    E('jisMobile').textContent=state.phone||'';E('jisEmail').textContent=state.email||'';E('jisAddrKana').textContent=state.addressKana||'';E('jisPostal').textContent=state.postal?`〒 ${state.postal}`:'〒';E('jisAddress').textContent=state.address||'';E('jisTel').textContent=state.tel||'';E('jisFax').textContent=state.fax||'';
    E('jisContactKana').textContent=state.contactKana||'';E('jisContactPostal').textContent=state.contactPostal?`〒 ${state.contactPostal}`:'〒';E('jisContactAddress').textContent=state.contactAddress||'';E('jisContactTel').textContent=state.contactTel||'';E('jisContactFax').textContent=state.contactFax||'';
    E('jisHistory').innerHTML=historyRows();E('jisQuals').innerHTML=qualRows();E('jisCommuteH').textContent=state.commuteHour||'';E('jisCommuteM').textContent=state.commuteMin||'';E('jisStationLine').textContent=state.stationLine||'';E('jisStationName').textContent=state.stationName||'';E('jisDependents').textContent=state.dependents||'';
    E('jisSpouse').textContent=state.spouse?`${state.spouse} ・ ${state.spouse==='有'?'無':'有'}`:'有 ・ 無';E('jisSpouseSupport').textContent=state.spouseSupport?`${state.spouseSupport} ・ ${state.spouseSupport==='有'?'無':'有'}`:'有 ・ 無';E('jisStrengths').textContent=state.strengths||'';E('jisMotive').textContent=state.motive||'';E('jisRequest').textContent=requestText();
    E('jisGuardianName').textContent=state.guardianName||'';E('jisGuardianAddress').textContent=state.guardianAddress||'';E('jisGuardianTel').textContent=state.guardianTel||'';E('jisGuardianFax').textContent=state.guardianFax||'';
  }

  function showPreview(kind='rireki'){
    document.querySelectorAll('.preview-tools button').forEach(b=>b.classList.toggle('active',b.dataset.preview===kind));
    if(E('rirekiDoc'))E('rirekiDoc').style.display='none';document.querySelectorAll('.parttime-rireki').forEach(p=>p.style.display='none');
    document.querySelectorAll('.jis-page').forEach(p=>p.style.display=kind==='rireki'?'block':'none');
    if(E('careerDoc'))E('careerDoc').style.display=kind==='career'?'block':'none';
    if(typeof fit==='function')fit();
  }

  mountExtraFields();buildPages();
  const baseRender=render;render=function(){baseRender();renderJIS();const kind=document.querySelector('.preview-tools button.active')?.dataset.preview||'rireki';showPreview(kind);};
  preview=function(kind){showPreview(kind);};
  printDoc=function(kind){save();render();document.querySelectorAll('.page').forEach(p=>p.classList.remove('print-me'));if(kind==='career')document.querySelectorAll('.print-career').forEach(p=>p.classList.add('print-me'));else document.querySelectorAll('.print-jis').forEach(p=>p.classList.add('print-me'));setTimeout(()=>window.print(),80);};
  document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>preview(b.dataset.preview));if(E('printRireki'))E('printRireki').onclick=()=>printDoc('rireki');if(E('printCareer'))E('printCareer').onclick=()=>printDoc('career');if(E('mobilePrint'))E('mobilePrint').onclick=()=>printDoc('rireki');if(E('mobilePreview'))E('mobilePreview').onclick=()=>{preview('rireki');E('paperArea').scrollIntoView({behavior:'smooth'})};
  const oldSync=syncTemplate;syncTemplate=function(){oldSync();showPreview(document.querySelector('.preview-tools button.active')?.dataset.preview||'rireki');};
  renderJIS();showPreview('rireki');save();
})();
