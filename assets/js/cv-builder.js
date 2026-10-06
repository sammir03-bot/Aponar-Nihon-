/* CV data stays on this device. Classic globals are shared with the resume layouts. */
'use strict';
const KEY = 'aponarNihonCvV5';
const OLD = ['aponarNihonCvV4', 'aponarNihonCvV3', 'aponarNihonCvV2'];
const $ = id => document.getElementById(id);
const simple = ['created','name','furigana','dob','gender','nationality','phone','email','address','addressKana','visa','schoolTime','availability','motive','request','summary','skills','selfpr'];
const extra = ['postal','tel','fax','contactKana','contactPostal','contactAddress','contactTel','contactFax','commuteHour','commuteMin','dependents','spouse','spouseSupport','stationLine','stationName','strengths','guardianName','guardianAddress','guardianTel','guardianFax'];
const titles = [['Template নির্বাচন','কাজ অনুযায়ী CV type বেছে নিন'],['個人情報 — ব্যক্তিগত তথ্য','Japanese CV-এর মূল তথ্য'],['学歴・職歴 — ইতিহাস','Education, work ও qualification'],['志望動機・自己PR — আবেদন','নিজের অভিজ্ঞতা অনুযায়ী আবেদন লিখুন'],['Preview / PDF','শেষবার যাচাই করে export করুন']];
let state, step = 0, photoSource = null;
function esc(s = '') { return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function tokyoToday() {
  const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const g = t => p.find(x => x.type === t).value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}
function validDate(v) { return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v; }
function jpDate(v) { if (!validDate(v)) return ''; const [y,m,d] = v.split('-'); return `${+y}年${+m}月${+d}日現在`; }
function age(v) { if (!validDate(v)) return ''; const [y,m,d] = v.split('-').map(Number), [ty,tm,td] = (validDate(state?.created) ? state.created : tokyoToday()).split('-').map(Number); return ty - y - (tm < m || (tm === m && td < d) ? 1 : 0); }
const emptyRow = () => ({year:'',month:'',text:''});
function emptyState() { return {template:'standard',outputFormat:'a4-2',created:tokyoToday(),photo:'',edu:[emptyRow()],work:[emptyRow()],qual:[emptyRow()],cvV6Seeded:true}; }
function normalizeCV(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid_cv');
  const out = emptyState();
  for (const k of [...simple,...extra]) if (typeof value[k] === 'string') out[k] = value[k].slice(0,20000);
  if (!validDate(out.created)) out.created = tokyoToday();
  if (out.dob && !validDate(out.dob)) out.dob = '';
  if (['standard','parttime','newgrad','career'].includes(value.template)) out.template = value.template;
  if (['a4-1','a4-2','a3-1'].includes(value.outputFormat)) out.outputFormat = value.outputFormat;
  for (const k of ['edu','work','qual']) {
    if (value[k] !== undefined && !Array.isArray(value[k])) throw new Error('invalid_rows');
    if (value[k]?.length > 100) throw new Error('too_many_rows');
    if (Array.isArray(value[k])) out[k] = value[k].map(v => {
      if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('invalid_row');
      return {year:String(v.year ?? '').slice(0,4),month:String(v.month ?? '').slice(0,2),text:String(v.text ?? '').slice(0,4000)};
    });
  }
  if (typeof value.photo === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value.photo) && value.photo.length <= 2500000) out.photo = value.photo;
  out.cvV6Seeded = true;
  return out;
}
function message(text, isError = false) {
  const el = $('cvMessage'); if (!el) return;
  el.textContent = text; el.hidden = !text; el.classList.toggle('error',isError);
}
function save() {
  const el = $('cvSaveStatus');
  try { localStorage.setItem(KEY,JSON.stringify(state)); if (el) {el.textContent='✓ এই ডিভাইসে সংরক্ষিত';el.classList.remove('unsaved');} return true; }
  catch { if (el) {el.textContent='সংরক্ষণ হয়নি · Backup নিন';el.classList.add('unsaved');} return false; }
}
function collect() { for (const id of simple) if ($(id)) state[id] = $(id).value; save(); render(); }
function fillFields() {
  for (const id of [...simple,...extra]) if ($(id)) $(id).value = state[id] || '';
  document.querySelectorAll('.template').forEach(b => b.classList.toggle('active',b.dataset.template === state.template));
}
function load() {
  state = emptyState();
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) for (const k of OLD) { raw = localStorage.getItem(k); if (raw) break; }
    if (raw) state = normalizeCV(JSON.parse(raw));
  } catch { message('সংরক্ষিত draft পড়া যায়নি। এখানে নতুন CV তৈরি করতে পারবেন; আগের backup থাকলে Restore করুন।',true); }
  const type = new URLSearchParams(location.search).get('template');
  if (['standard','parttime','newgrad','career'].includes(type)) state.template = type;
  fillFields(); syncTemplate(); renderRows(); render(); save();
}
function syncTemplate() {
  const part = state.template === 'parttime';
  $('parttimeBox').classList.toggle('show',part);
  $('parttimePreview').style.display = part ? 'table' : 'none';
  document.body.dataset.cvTemplate = state.template;
}
function showStep(n) {
  step = Math.max(0,Math.min(4,n));
  document.querySelectorAll('.wiz').forEach((b,i) => {b.classList.toggle('active',i === step);b.setAttribute('aria-current',i === step ? 'step' : 'false');});
  document.querySelectorAll('.step').forEach((s,i) => s.classList.toggle('active',i === step));
  $('formTitle').textContent = titles[step][0]; $('formSub').textContent = titles[step][1];
  $('prevBtn').style.visibility = step === 0 ? 'hidden' : 'visible'; $('nextBtn').style.display = step === 4 ? 'none' : 'inline-block';
  if (typeof window.updateCVReview === 'function') window.updateCVReview();
  document.querySelector('.wizard').scrollIntoView({block:'start',behavior:'smooth'});
}
function addRow(type, item = emptyRow()) { if (state[type].length >= 100) {message('একটি বিভাগে সর্বোচ্চ ১০০টি সারি রাখা যাবে।',true);return;} state[type].push(item);renderRows();save();render(); }
function renderRows() {
  for (const type of ['edu','work','qual']) {
    const title = {edu:'শিক্ষা',work:'কাজ',qual:'যোগ্যতা'}[type];
    $(type+'Rows').innerHTML = state[type].map((r,i) => `<div class="row"><button type="button" class="remove" aria-label="${title} সারি ${i+1} মুছুন" data-remove="${type}" data-i="${i}">×</button><div class="row-grid"><input inputmode="numeric" maxlength="4" aria-label="${title} ${i+1} সাল" placeholder="年 / সাল" value="${esc(r.year)}" data-rtype="${type}" data-i="${i}" data-k="year"><input inputmode="numeric" maxlength="2" aria-label="${title} ${i+1} মাস" placeholder="月 / মাস" value="${esc(r.month)}" data-rtype="${type}" data-i="${i}" data-k="month"><input aria-label="${title} ${i+1} বিবরণ" placeholder="${type==='edu'?'学校名・入学/卒業':type==='work'?'会社名・入社/退職':'資格・免許名'}" value="${esc(r.text)}" data-rtype="${type}" data-i="${i}" data-k="text"></div></div>`).join('');
  }
  document.querySelectorAll('[data-rtype]').forEach(x => x.oninput = e => {const {rtype,i,k}=e.target.dataset;state[rtype][+i][k]=e.target.value;save();render();});
  document.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => {state[b.dataset.remove].splice(+b.dataset.i,1);renderRows();save();render();});
}
function tr(y='',m='',txt='',cls='') { return `<tr class="history-cell"><td class="year-col">${esc(y)}</td><td class="month-col">${esc(m)}</td><td class="${cls}">${esc(txt)}</td></tr>`; }
function render() {
  $('pCreated').textContent=jpDate(state.created);
  const fields={pFuri:'furigana',pName:'name',pGender:'gender',pNationality:'nationality',pPhone:'phone',pEmail:'email',pAddress:'address',pAddressKana:'addressKana',pVisa:'visa',pMotive:'motive',pRequest:'request',pSchoolTime:'schoolTime',pAvailability:'availability'};
  for (const [id,key] of Object.entries(fields)) $(id).textContent=state[key] || '';
  $('pDob').textContent=validDate(state.dob)?`${state.dob.slice(0,4)}年${+state.dob.slice(5,7)}月${+state.dob.slice(8,10)}日生（満${age(state.dob)}歳）`:'';
  syncTemplate();
  let hist=tr('','','学歴');for(const x of state.edu)hist+=tr(x.year,x.month,x.text);hist+=tr('','','職歴');for(const x of state.work)hist+=tr(x.year,x.month,x.text);hist+=tr('','','以上');while((hist.match(/<tr/g)||[]).length<13)hist+=tr();$('pHistory').innerHTML=hist;
  let q='';for(const x of state.qual)q+=tr(x.year,x.month,x.text);while((q.match(/<tr/g)||[]).length<5)q+=tr();$('pQual').innerHTML=q;
  $('cDate').textContent=jpDate(state.created);$('cName').textContent=state.name?`氏名: ${state.name}`:'';$('cEmail').textContent=state.email?`メールアドレス: ${state.email}`:'';
  $('cSummary').textContent=state.summary||'';$('cSkills').textContent=state.skills||'';$('cPr').textContent=state.selfpr||'';
  const work=state.work.filter(x=>x.text||x.year||x.month),quals=state.qual.filter(x=>x.text||x.year||x.month);
  $('cWork').innerHTML=work.map(w=>`<tr><td>${esc(w.year)}${w.year?'年 ':''}${esc(w.month)}${w.month?'月':''}</td><td>${esc(w.text)}</td></tr>`).join('') || '<tr><td></td><td></td></tr>';
  $('cQual').textContent=quals.map(q=>`${q.year||''}${q.year?'年 ':''}${q.month||''}${q.month?'月　':''}${q.text||''}`).join('\n');
  $('photoPreview').innerHTML=state.photo?`<img src="${esc(state.photo)}" alt="আপনার CV-এর ছবি">`:'<i class="fa-solid fa-user" aria-hidden="true"></i>';
  $('pPhoto').innerHTML=state.photo?`<img src="${esc(state.photo)}" alt="証明写真">`:'<div class="photo-placeholder">写真<br>縦40mm<br>横30mm</div>';
  if ($('removePhoto')) $('removePhoto').hidden=!state.photo;
  save();fit();
}
function fit() {
  const a=$('paperArea');if(!a)return;
  const css=getComputedStyle(a),available=a.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
  document.querySelectorAll('.page').forEach(p=>{const scale=document.body.classList.contains('cv-preview-full')?1:Math.min(1,Math.max(0.1,available/(p.offsetWidth||794)));p.style.transformOrigin='top left';p.style.transform=`scale(${scale})`;p.style.marginBottom=`${-(p.offsetHeight*(1-scale))+16}px`;});
}
function preview(kind) { document.querySelectorAll('.preview-tools [data-preview]').forEach(b=>{b.classList.toggle('active',b.dataset.preview===kind);b.setAttribute('aria-pressed',String(b.dataset.preview===kind));});$('rirekiDoc').style.display=kind==='rireki'?'block':'none';$('careerDoc').style.display=kind==='career'?'block':'none';fit(); }
function printDoc(kind) { save();render();document.querySelectorAll('.page').forEach(p=>p.classList.remove('print-me'));document.querySelectorAll(kind==='career'?'.print-career':'.print-rireki').forEach(p=>p.classList.add('print-me'));setTimeout(()=>window.print(),80); }
const motives={parttime:'学業と両立しながら日本語力と接客力を高めたいと考え、応募いたしました。責任を持って勤務し、周囲と協力しながら仕事を覚えていきたいです。',konbini:'コンビニエンスストアの仕事を通して、日本語での接客力を高めたいと考え応募いたしました。時間を守り、正確なレジ対応と丁寧な接客を心掛けます。',restaurant:'人と接することが好きで、飲食店での接客を通して日本語力とサービス力を身につけたいと考え応募いたしました。忙しい時間帯でも周囲と協力して行動します。',fulltime:'これまでの経験を活かしながら、貴社でさらに専門性を高め、長期的に貢献したいと考え応募いたしました。',newgrad:'学校で学んだことを仕事に活かし、新しい知識や技術を身につけながら成長したいと考え、応募いたしました。周囲と協力し、責任を持って業務に取り組みたいと考えています。'};
const prs={responsible:'私は責任感を持って最後まで仕事に取り組むことを大切にしています。任された業務は確認を怠らず、時間を守って確実に対応します。',team:'私は周囲と協力して仕事を進めることを大切にしています。相手の話をよく聞き、必要な情報を共有しながら行動できます。',service:'接客では、相手の立場を考えて丁寧に対応することを心掛けています。笑顔と挨拶を大切にしています。'};
const sampleMeanings={parttime:'পড়াশোনার পাশাপাশি জাপানি ও সেবার দক্ষতা বাড়াতে চাই। দায়িত্ব নিয়ে কাজ শিখব এবং সহকর্মীদের সঙ্গে সহযোগিতা করব।',konbini:'কনবিনির কাজের মাধ্যমে জাপানিতে গ্রাহকসেবার দক্ষতা বাড়াতে চাই। সময় মেনে সঠিক লেনদেন ও ভদ্র ব্যবহার করব।',restaurant:'মানুষের সঙ্গে কাজ করতে ভালো লাগে। রেস্তোরাঁয় জাপানি ও সেবার দক্ষতা শিখতে চাই; ব্যস্ত সময়েও সহযোগিতা করব।',fulltime:'আগের অভিজ্ঞতা কাজে লাগিয়ে দক্ষতা বাড়াতে এবং দীর্ঘমেয়াদে প্রতিষ্ঠানে অবদান রাখতে চাই।',newgrad:'স্কুলে শেখা বিষয় কাজে লাগিয়ে নতুন জ্ঞান ও দক্ষতা অর্জন করতে চাই। দায়িত্ব নিয়ে সহকর্মীদের সঙ্গে কাজ করব।',responsible:'দায়িত্ব নিয়ে কাজ শেষ করি। কাজ যাচাই করি এবং সময়মতো নির্ভরযোগ্যভাবে কাজ করি।',team:'অন্যের কথা মন দিয়ে শুনি, প্রয়োজনীয় তথ্য জানাই এবং সহযোগিতা করি।',service:'গ্রাহকের অবস্থান বুঝে ভদ্রভাবে সেবা দিই। হাসিমুখে অভিবাদনকে গুরুত্ব দিই।'};
function useSample(id,key) {const el=$(id);el.value=(id==='motive'?motives:prs)[key];message('নমুনার অর্থ: '+sampleMeanings[key]+' নিজের সঙ্গে মিলিয়ে লেখাটি সম্পাদনা করুন।');collect();}
function downloadBackup() {
  collect();const blob=new Blob([JSON.stringify({format:'aponar-cv',version:1,exported_at:new Date().toISOString(),cv:state},null,2)],{type:'application/json'}),a=document.createElement('a');
  const url=URL.createObjectURL(blob);a.href=url;a.download='aponar-nihon-cv-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function confirmCV(text) { return window.AponarI18nContent?.confirm ? window.AponarI18nContent.confirm(text) : window.confirm(text); }
async function restoreBackup(file) {
  if (!file) return;
  if (file.size>4500000) {message('Backup ফাইলটি বেশি বড়। সর্বোচ্চ ৪ MB-এর CV backup ব্যবহার করুন।',true);return;}
  try {
    const data=JSON.parse(await file.text());
    if (data.format && (data.format!=='aponar-cv'||data.version!==1)) throw new Error('unsupported_backup');
    const value=data.format==='aponar-cv'?data.cv:data;
    if (!value || !['name','edu','work','qual'].some(k=>Object.hasOwn(value,k))) throw new Error('not_cv');
    const restored=normalizeCV(value);
    if (!await confirmCV('Backup-এর তথ্য দিয়ে এই ডিভাইসের বর্তমান CV বদলাবেন?')) return;
    state=restored;photoSource=null;fillFields();renderRows();render();if(typeof window.refreshCVFormat==='function')window.refreshCVFormat();
    $('photoCrop').hidden=true;message('Backup ফিরিয়ে আনা হয়েছে। Preview-তে তথ্যগুলো মিলিয়ে নিন।');document.querySelector('.form-panel').dispatchEvent(new Event('input',{bubbles:true}));
  } catch {message('এই ফাইলটি সঠিক CV backup নয়। JSON backup ফাইলটি আবার বেছে নিন।',true);}
}
function cropPhoto() {
  if (!photoSource) return;
  const width=450,height=600,zoom=+$('photoZoom').value,ratio=width/height;
  let sw=photoSource.width,sh=photoSource.height;
  if(sw/sh>ratio)sw=sh*ratio;else sh=sw/ratio;
  sw/=zoom;sh/=zoom;
  const sx=(photoSource.width-sw)*(+$('photoX').value/100),sy=(photoSource.height-sh)*(+$('photoY').value/100),canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(photoSource,sx,sy,sw,sh,0,0,width,height);
  state.photo=canvas.toDataURL('image/jpeg',0.88);save();render();
}
async function uploadPhoto(file) {
  if (!file) return;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15000000) {message('JPG, PNG বা WebP ছবি দিন; সর্বোচ্চ ১৫ MB।',true);return;}
  const url=URL.createObjectURL(file),img=new Image();
  try {img.src=url;await img.decode();if(!img.width||!img.height||img.width*img.height>40000000)throw new Error('large_photo');photoSource=img;$('photoZoom').value=1;$('photoX').value=50;$('photoY').value=50;$('photoCrop').hidden=false;cropPhoto();message('ছবি যোগ হয়েছে। নিচের controls দিয়ে মুখের অবস্থান ও মাপ ঠিক করুন।');}
  catch {message('ছবিটি পড়া যায়নি বা মাপ বেশি বড়। অন্য একটি JPG/PNG ছবি দিন।',true);}
  finally {URL.revokeObjectURL(url);}
}
for(const id of simple)if($(id))$(id).addEventListener('input',collect);
document.querySelectorAll('.wiz').forEach((b,i)=>b.onclick=()=>showStep(i));
$('prevBtn').onclick=()=>showStep(step-1);$('nextBtn').onclick=()=>showStep(step+1);
document.querySelectorAll('.template').forEach(b=>b.onclick=()=>{state.template=b.dataset.template;document.querySelectorAll('.template').forEach(x=>x.classList.toggle('active',x===b));syncTemplate();save();render();});
$('addEdu').onclick=()=>addRow('edu');$('addWork').onclick=()=>addRow('work');$('addQual').onclick=()=>addRow('qual');
$('photoBtn').onclick=()=>$('photoInput').click();$('photoInput').onchange=e=>{uploadPhoto(e.target.files[0]);e.target.value='';};
$('removePhoto').onclick=()=>{state.photo='';photoSource=null;$('photoCrop').hidden=true;save();render();};
for(const id of ['photoZoom','photoX','photoY'])$(id).oninput=cropPhoto;
document.querySelectorAll('[data-motive]').forEach(b=>b.onclick=()=>useSample('motive',b.dataset.motive));document.querySelectorAll('[data-pr]').forEach(b=>b.onclick=()=>useSample('selfpr',b.dataset.pr));
document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>preview(b.dataset.preview));
$('printRireki').onclick=()=>printDoc('rireki');$('printCareer').onclick=()=>printDoc('career');$('mobilePrint').onclick=()=>printDoc('rireki');$('mobilePreview').onclick=()=>{$('paperArea').scrollIntoView({behavior:'smooth'});};
$('backupBtn').onclick=downloadBackup;$('restoreBtn').onclick=()=>$('backupInput').click();$('backupInput').onchange=e=>{restoreBackup(e.target.files[0]);e.target.value='';};
$('clearBtn').onclick=async()=>{if(await confirmCV('এই ডিভাইসের CV মুছে নতুন করে শুরু করবেন? দরকার হলে আগে Backup নিন।')){for(const k of [KEY,...OLD])try{localStorage.removeItem(k);}catch{}state=emptyState();photoSource=null;fillFields();renderRows();render();window.refreshCVFormat?.();$('photoCrop').hidden=true;showStep(0);message('নতুন CV শুরু করা হয়েছে।');}};
window.addEventListener('resize',fit);document.fonts?.ready.then(fit);load();preview('rireki');
