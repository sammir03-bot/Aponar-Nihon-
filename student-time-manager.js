(()=>{
  const SHIFT_KEY='an_shifts_v1';
  const ACTIVE_KEY='an_active_shift_v1';
  const MODE_KEY='an_work_mode_v2';
  const $=id=>document.getElementById(id);
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const pad=n=>String(n).padStart(2,'0');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const jpParts=(date=new Date())=>{
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,weekday:'short'}).formatToParts(date);
    const g=t=>p.find(x=>x.type===t)?.value||'';
    return {date:`${g('year')}-${g('month')}-${g('day')}`,time:`${g('hour')}:${g('minute')}`,sec:`${g('hour')}:${g('minute')}:${g('second')}`,weekday:g('weekday')};
  };
  const today=()=>jpParts().date;
  const getShifts=()=>read(SHIFT_KEY,[]);
  const setShifts=v=>write(SHIFT_KEY,v);
  const active=()=>read(ACTIVE_KEY,null);
  const setActive=v=>v?write(ACTIVE_KEY,v):localStorage.removeItem(ACTIVE_KEY);
  const minutesFromHHMM=v=>{if(!v||!v.includes(':'))return 0;const [h,m]=v.split(':').map(Number);return h*60+m};
  const paidHours=(start,end,breakMin=0)=>{let a=minutesFromHHMM(start),b=minutesFromHHMM(end);if(b<a)b+=1440;return Math.max(0,(b-a-(+breakMin||0))/60)};
  const mondayOf=date=>{const d=new Date(date+'T12:00:00+09:00');const day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day);return d.toISOString().slice(0,10)};
  const addDays=(date,n)=>{const d=new Date(date+'T12:00:00+09:00');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
  const monthOf=d=>d.slice(0,7);
  const fmtHours=h=>`${(Math.round(h*100)/100).toFixed(2)}h`;
  const dayLabel=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const monthDay=d=>{const [,m,day]=d.split('-');return `${+m}/${+day}`};

  function findTracker(){return [...document.querySelectorAll('#toolkit .card')].find(c=>/28-hour Work Tracker/i.test(c.querySelector('h3')?.textContent||''));}
  const card=findTracker();
  if(!card)return;
  card.classList.add('ptm-card');
  card.innerHTML=`
    <div class="ptm-hero">
      <div class="ptm-title"><div class="ptm-logo">⏱️</div><div><h3>Part-time Time Manager</h3><p>কাজ শুরু–শেষ, break, weekly hours ও shift history</p></div></div>
      <div class="ptm-mode"><select id="workMode"><option value="normal">School term · 週28時間</option><option value="vacation">Official long vacation · 1日8時間</option></select></div>
    </div>
    <div class="ptm-body">
      <div class="ptm-metrics">
        <div class="ptm-metric"><b id="ptmToday">0.00h</b><small>আজ কাজ</small></div>
        <div class="ptm-metric"><b id="ptmWeek">0.00h</b><small>এই সপ্তাহ</small></div>
        <div class="ptm-metric"><b id="ptmRemain">28.00h</b><small>বাকি সময়</small></div>
        <div class="ptm-metric"><b id="ptmMonth">0.00h</b><small>এই মাস</small></div>
      </div>
      <div class="ptm-ring"><i id="ptmProgress"></i></div><div class="ptm-limit-note" id="ptmLimitNote"></div>

      <div class="ptm-clock">
        <div class="ptm-clock-top"><div><div class="ptm-now" id="ptmNow">--:--:--</div><div class="ptm-date" id="ptmNowDate"></div></div><span class="ptm-status" id="ptmStatus">Ready</span></div>
        <div class="ptm-jobrow"><input id="ptmJob" placeholder="Job / Store name (例: Seven-Eleven)"><button class="btn alt" id="ptmUseLast">Last job</button></div>
        <div class="ptm-main-actions"><button class="ptm-action" id="ptmStart">▶ কাজ শুরু</button><button class="ptm-action stop" id="ptmStop" disabled>■ কাজ শেষ</button><button class="ptm-action break" id="ptmBreak" disabled>☕ Break শুরু</button><button class="ptm-action resume" id="ptmResume" disabled>↩ Break শেষ</button></div>
        <div class="ptm-liveinfo" id="ptmLiveInfo">কাজ শুরু করলে সময় automatic save হবে। Browser বন্ধ করলেও active shift থাকবে।</div>
      </div>

      <div class="ptm-week"><div class="ptm-section-title"><b>এই সপ্তাহ</b><span id="ptmWeekRange"></span></div><div class="ptm-days" id="ptmDays"></div></div>

      <details class="ptm-manual"><summary>＋ Manual shift যোগ করুন</summary>
        <div class="ptm-manual-grid">
          <div class="field"><label>Date</label><input type="date" id="shiftDate"></div>
          <div class="field"><label>Job name</label><input id="shiftJob" placeholder="Part-time"></div>
          <div class="field"><label>Start</label><input type="time" id="shiftStart"></div>
          <div class="field"><label>End</label><input type="time" id="shiftEnd"></div>
          <div class="field"><label>Break (min)</label><input type="number" id="shiftBreak" min="0" value="0"></div>
        </div><button class="btn ptm-add" id="ptmManualAdd">+ Shift save করুন</button>
      </details>

      <div id="workSummary" class="result"></div>
      <div class="ptm-history"><div class="ptm-section-title"><b>Shift history</b><span id="ptmHistoryCount"></span></div><div id="shiftList"></div></div>
      <div class="official"><b>নোট:</b> এই tool আপনার কাজের সময় গুছিয়ে রাখার সহায়ক। নিজের permission/কাজের শর্ত অনুযায়ী limit যাচাই করুন।</div>
    </div>`;

  const mode=$('workMode');
  mode.value=localStorage.getItem(MODE_KEY)||'normal';
  mode.onchange=()=>{localStorage.setItem(MODE_KEY,mode.value);renderShifts();};
  $('shiftDate').value=today();

  function addShiftRecord(rec){
    const list=getShifts();
    list.push(rec);
    list.sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
    setShifts(list);
    renderShifts();
  }

  window.addShift=function(){
    const date=$('shiftDate').value,start=$('shiftStart').value,end=$('shiftEnd').value;
    if(!date||!start||!end){alert('Date, start, end দিন।');return;}
    const br=Math.max(0,+$('shiftBreak').value||0);
    addShiftRecord({id:Date.now(),date,job:$('shiftJob').value.trim()||'Part-time',start,end,break:br,h:paidHours(start,end,br)});
    $('shiftStart').value='';$('shiftEnd').value='';$('shiftBreak').value='0';
  };
  $('ptmManualAdd').onclick=window.addShift;

  window.delShift=async function(id){
    if(!await window.AponarI18nContent.confirm('এই shift মুছবেন?'))return;
    setShifts(getShifts().filter(x=>x.id!==id));renderShifts();
  };

  function clockStart(){
    if(active())return;
    const n=jpParts(),job=$('ptmJob').value.trim()||'Part-time';
    setActive({id:Date.now(),job,date:n.date,start:n.time,startedAt:Date.now(),break:0,breakStartedAt:null});
    localStorage.setItem('an_last_job',job);renderActive();renderShifts();
  }
  function breakStart(){const a=active();if(!a||a.breakStartedAt)return;a.breakStartedAt=Date.now();setActive(a);renderActive();}
  function breakEnd(){const a=active();if(!a||!a.breakStartedAt)return;a.break=(+a.break||0)+Math.max(0,Math.round((Date.now()-a.breakStartedAt)/60000));a.breakStartedAt=null;setActive(a);renderActive();}
  function clockStop(){
    let a=active();if(!a)return;
    if(a.breakStartedAt){a.break=(+a.break||0)+Math.max(0,Math.round((Date.now()-a.breakStartedAt)/60000));a.breakStartedAt=null;}
    const n=jpParts(),elapsed=Math.max(0,(Date.now()-a.startedAt)/3600000-(+a.break||0)/60);
    addShiftRecord({id:a.id,date:a.date,job:a.job,start:a.start,end:n.time,break:+a.break||0,h:elapsed});
    setActive(null);renderActive();renderShifts();
  }
  $('ptmStart').onclick=clockStart;$('ptmStop').onclick=clockStop;$('ptmBreak').onclick=breakStart;$('ptmResume').onclick=breakEnd;
  $('ptmUseLast').onclick=()=>{$('ptmJob').value=localStorage.getItem('an_last_job')||'';};

  function renderActive(){
    const a=active(),status=$('ptmStatus');
    $('ptmStart').disabled=!!a;$('ptmStop').disabled=!a;$('ptmBreak').disabled=!a||!!a?.breakStartedAt;$('ptmResume').disabled=!a||!a?.breakStartedAt;
    if(!a){status.className='ptm-status';status.textContent='Ready';$('ptmLiveInfo').textContent='কাজ শুরু করলে সময় automatic save হবে। Browser বন্ধ করলেও active shift থাকবে।';return;}
    const breaking=!!a.breakStartedAt;status.className='ptm-status '+(breaking?'break':'live');status.textContent=breaking?'On break':'Working';
    const gross=(Date.now()-a.startedAt)/3600000;let br=(+a.break||0);if(a.breakStartedAt)br+=(Date.now()-a.breakStartedAt)/60000;const paid=Math.max(0,gross-br/60);
    $('ptmLiveInfo').innerHTML=`<b>${esc(a.job)}</b> · শুরু ${a.start} · ${breaking?'Break চলছে · ':''}বর্তমান paid time <b>${fmtHours(paid)}</b> · break ${Math.max(0,Math.round(br))}m`;
  }

  function currentWeekStats(list){
    const t=today(),mon=mondayOf(t),sun=addDays(mon,6);const week=list.filter(x=>x.date>=mon&&x.date<=sun);return {mon,sun,week,h:week.reduce((s,x)=>s+(+x.h||0),0)};
  }
  function activePaidForDate(date){const a=active();if(!a||a.date!==date)return 0;let br=(+a.break||0);if(a.breakStartedAt)br+=(Date.now()-a.breakStartedAt)/60000;return Math.max(0,(Date.now()-a.startedAt)/3600000-br/60);}

  window.renderShifts=function(){
    const list=getShifts(),t=today(),ws=currentWeekStats(list);let wh=ws.h+activePaidForDate(t);
    const todayH=list.filter(x=>x.date===t).reduce((s,x)=>s+(+x.h||0),0)+activePaidForDate(t);
    const monthH=list.filter(x=>monthOf(x.date)===monthOf(t)).reduce((s,x)=>s+(+x.h||0),0)+activePaidForDate(t);
    let remain=mode.value==='normal'?Math.max(0,28-wh):Math.max(0,8-todayH);
    $('ptmToday').textContent=fmtHours(todayH);$('ptmWeek').textContent=fmtHours(wh);$('ptmRemain').textContent=fmtHours(remain);$('ptmMonth').textContent=fmtHours(monthH);
    const limit=mode.value==='normal'?28:8,pct=Math.min(100,((mode.value==='normal'?wh:todayH)/limit)*100);$('ptmProgress').style.width=pct+'%';
    $('ptmLimitNote').textContent=mode.value==='normal'?`Week ${fmtHours(wh)} / 28.00h`:`Today ${fmtHours(todayH)} / 8.00h`;
    const over=(mode.value==='normal'?wh>28:todayH>8),near=(mode.value==='normal'?wh>=24:todayH>=7);
    $('workSummary').className='result '+(over?'danger':near?'warn':'ok');
    $('workSummary').innerHTML=over?`⚠️ Limit-এর ওপরে: <b>${fmtHours(mode.value==='normal'?wh:todayH)}</b>`:near?`⚠️ Limit-এর কাছাকাছি · বাকি <b>${fmtHours(remain)}</b>`:`✓ এখন পর্যন্ত বাকি <b>${fmtHours(remain)}</b>`;
    $('ptmWeekRange').textContent=`${monthDay(ws.mon)} – ${monthDay(ws.sun)}`;
    $('ptmDays').innerHTML=dayLabel.map((name,i)=>{const d=addDays(ws.mon,i);const h=list.filter(x=>x.date===d).reduce((s,x)=>s+(+x.h||0),0)+(d===t?activePaidForDate(t):0);return `<div class="ptm-day ${d===t?'today':''}"><span>${name}</span><b>${h?h.toFixed(1):'—'}</b></div>`}).join('');
    const latest=list.slice().sort((a,b)=>(b.date+b.start).localeCompare(a.date+a.start));$('ptmHistoryCount').textContent=`${latest.length} shifts`;
    $('shiftList').innerHTML=latest.length?latest.slice(0,40).map(x=>{const d=new Date(x.date+'T12:00:00+09:00');const wd=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',weekday:'short'}).format(d);return `<div class="ptm-shift"><div class="ptm-datebox">${+x.date.slice(8,10)}<small>${wd}</small></div><div class="ptm-shift-main"><b>${esc(x.job||'Part-time')}</b><small>${x.date} · ${esc(x.start)}–${esc(x.end)} · break ${Math.round(+x.break||0)}m</small></div><div><div class="ptm-hours">${fmtHours(+x.h||0)}</div><button class="ptm-del" onclick="delShift(${Number(x.id)})">×</button></div></div>`}).join(''):'<div class="ptm-empty">এখনও কোনো shift নেই। “কাজ শুরু” চাপুন বা manual shift যোগ করুন।</div>';
    if($('salaryHours'))$('salaryHours').value=Math.round(monthH*100)/100;
  };

  function tick(){const n=jpParts();$('ptmNow').textContent=n.sec;$('ptmNowDate').textContent=`${n.date} · ${n.weekday} · Japan time`;renderActive();if(active())renderShifts();}
  tick();renderShifts();setInterval(tick,1000);
})();
