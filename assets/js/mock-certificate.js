(function (global) {
  'use strict';
  const bn=value=>String(value).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
  const hash=value=>{let h=2166136261;for(const ch of value){h=Math.imul(h^ch.charCodeAt(0),16777619)}return(h>>>0).toString(16).padStart(8,'0').toUpperCase()};
  const idFor=result=>result.certificateId||`AN-${result.level.toUpperCase()}-${String(result.test).padStart(2,'0')}-${hash(result.completedAt+'|'+result.score+'|'+result.total)}`;
  let dialog,canvas,input,download,status,current,onName,drawEpoch=0;
  function initialize(){
    if(dialog)return;
    dialog=document.createElement('dialog');
    dialog.id='certificateDialog';
    dialog.setAttribute('aria-labelledby','certificateTitle');
    dialog.innerHTML='<div class="certificate-toolbar"><div><h2 id="certificateTitle">আপনার নিহোন · পরীক্ষার সনদ</h2><p>নিজের নাম দিয়ে PDF ডাউনলোড করুন</p></div><button type="button" class="certificate-close" aria-label="সনদ বন্ধ করুন">×</button></div><label class="certificate-name">সনদে আপনার নাম<input id="certificateName" type="text" maxlength="80" autocomplete="name" placeholder="আপনার পুরো নাম লিখুন"></label><div class="certificate-preview"><canvas id="certificateCanvas" width="1684" height="1190" role="img" aria-label="আপনার নিহোন মক পরীক্ষার ফলাফলের সনদ"></canvas></div><div class="certificate-bottom"><p id="certificateStatus" role="status" aria-live="polite"></p><button type="button" id="downloadCertificate" class="primary-button">PDF ডাউনলোড করুন</button></div>';
    document.body.append(dialog);
    canvas=dialog.querySelector('canvas');input=dialog.querySelector('input');
    download=dialog.querySelector('#downloadCertificate');status=dialog.querySelector('#certificateStatus');
    dialog.querySelector('.certificate-close').addEventListener('click',()=>dialog.close());
    input.addEventListener('input',()=>{
      const name=input.value.trim();
      download.disabled=!name;
      onName?.(name,idFor(current));
      draw();
    });
    download.addEventListener('click',downloadPDF);
  }
  async function show(result,callback){
    initialize();current=result;onName=callback;
    input.value=result.certificateName||result.candidateName||'';
    download.disabled=!input.value.trim();
    status.textContent='আপনার নিহোনের মক পরীক্ষার সনদ · আপনার ডিভাইসে ফলাফল সেভ থাকে।';
    if(!dialog.open)dialog.showModal();
    await draw();
    if(!input.value.trim())input.focus();
  }
  function write(ctx,text,x,y,size=24,weight=500,align='center',color='#172f4a',maxWidth){
    ctx.fillStyle=color;ctx.textAlign=align;ctx.font=`${weight} ${size}px "Noto Sans Bengali","Aponar Mock Japanese",sans-serif`;
    if(maxWidth)while(ctx.measureText(text).width>maxWidth&&size>20){size-=2;ctx.font=`${weight} ${size}px "Noto Sans Bengali","Aponar Mock Japanese",sans-serif`}
    ctx.fillText(text,x,y);
  }
  function wrap(ctx,text,x,y,width,size=23){
    ctx.font=`500 ${size}px "Noto Sans Bengali","Aponar Mock Japanese",sans-serif`;
    const words=text.split(/\s+/),lines=[];let line='';
    for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){lines.push(line);line=word}else line=next}
    if(line)lines.push(line);
    for(const [i,l] of lines.slice(0,2).entries())write(ctx,l,x,y+i*(size+8),size,500,'left');
  }
  async function draw(){
    const epoch=++drawEpoch;
    if(document.fonts){await Promise.all([document.fonts.load('400 24px "Noto Sans Bengali"','বাংলা সনদ'),document.fonts.load('700 24px "Noto Sans Bengali"','আপনার নিহোন'),document.fonts.load('500 24px "Aponar Mock Japanese"','日本語模擬試験 成績証明書')]);await document.fonts.ready}
    if(epoch!==drawEpoch)return;
    const r=current,ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,center=w/2;
    ctx.fillStyle='#fcfaf3';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#173152';ctx.lineWidth=5;ctx.strokeRect(44,44,w-88,h-88);
    ctx.strokeStyle='#b89553';ctx.lineWidth=2;ctx.strokeRect(57,57,w-114,h-114);
    for(const [x,y,sx,sy] of [[76,76,1,1],[w-76,76,-1,1],[76,h-76,1,-1],[w-76,h-76,-1,-1]]){
      ctx.strokeStyle='#b89553';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+64*sx,y);ctx.lineTo(x,y);ctx.lineTo(x,y+64*sy);ctx.stroke();
    }
    write(ctx,'আপনার নিহোন',center,128,48,800);
    write(ctx,'APONAR NIHON · JAPANESE LEARNING HUB',center,166,18,600,'center','#677486');
    write(ctx,'日本語模擬試験 成績証明書',center,237,44,700);
    write(ctx,'MOCK EXAMINATION CERTIFICATE',center,279,20,600,'center','#916f31');
    ctx.strokeStyle='#d8c79d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(160,311);ctx.lineTo(w-160,311);ctx.stroke();
    write(ctx,'এই মর্মে সনদ দেওয়া যাচ্ছে যে',center,357,24,500);
    write(ctx,input.value.trim()||'আপনার নাম',center,418,52,700,'center','#173152',w-260);
    write(ctx,'আপনার নিহোনের নিচের মক পরীক্ষা সম্পন্ন করেছেন',center,465,25,500);
    const mode=r.mode==='practice'?'অনুশীলন মোড':'পূর্ণ সময়ের পরীক্ষা';
    write(ctx,`JLPT ${r.level.toUpperCase()} · Mock Test ${bn(String(r.test).padStart(2,'0'))} · ${mode}`,center,524,25,700);
    write(ctx,`${bn(r.score)} / ১৮০`,center,614,74,800);
    write(ctx,r.passed?'মক পরীক্ষায় উত্তীর্ণ':'মক পরীক্ষা সম্পন্ন · আরও অনুশীলন প্রয়োজন',center,663,26,700,'center',r.passed?'#167063':'#9a5540');
    write(ctx,`${bn(r.correct)} / ${bn(r.total)}টি প্রশ্নের সঠিক উত্তর`,center,701,20,500,'center','#677486');
    const groups=Object.values(r.groups),rows=[...groups,{label:'মোট স্কোর',score:r.score,max:180,min:global.JLPT_MOCK_CONFIG[r.level].pass}];
    const tableX=160,tableW=w-320,startY=734,rowH=57;
    ctx.fillStyle='#edf1f5';ctx.fillRect(tableX,startY,tableW,45);
    write(ctx,'পরীক্ষার অংশ',tableX+22,startY+30,20,700,'left');
    write(ctx,'প্রাপ্ত স্কোর',1050,startY+30,20,700);
    write(ctx,'পাসসীমা',1380,startY+30,20,700);
    rows.forEach((g,i)=>{
      const y=startY+45+i*rowH;
      ctx.strokeStyle='#e0ddd3';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tableX,y+rowH);ctx.lineTo(tableX+tableW,y+rowH);ctx.stroke();
      wrap(ctx,g.label,tableX+22,y+36,720,21);
      write(ctx,`${bn(g.score)} / ${bn(g.max)}`,1050,y+36,22,i===rows.length-1?700:500);
      write(ctx,bn(g.min),1380,y+36,22,500);
    });
    const completed=new Date(r.completedAt);
    const date=Number.isNaN(completed.getTime())?'—':completed.toLocaleDateString('bn-BD',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Tokyo'});
    write(ctx,`পরীক্ষার তারিখ: ${date}`,160,1060,22,600,'left');
    write(ctx,`Certificate ID: ${idFor(r)}`,160,1094,17,500,'left','#677486');
    const sealX=w-213,sealY=1060;
    ctx.strokeStyle='#b89553';ctx.lineWidth=3;ctx.beginPath();ctx.arc(sealX,sealY,62,0,Math.PI*2);ctx.stroke();
    ctx.lineWidth=1;ctx.beginPath();ctx.arc(sealX,sealY,54,0,Math.PI*2);ctx.stroke();
    write(ctx,'日',sealX,sealY+4,42,700,'center','#916f31');
    write(ctx,'模擬試験',sealX,sealY+31,16,600,'center','#916f31');
    write(ctx,'অনুশীলনের ফলাফল · ১৮০ নম্বর সরল conversion · অফিসিয়াল JLPT সনদ নয়',center,1118,17,500,'center','#677486');
    canvas.setAttribute('aria-label',`${input.value.trim()||'পরীক্ষার্থী'} · ${r.level.toUpperCase()} · ${r.score}/180 · ${r.passed?'মক পরীক্ষায় উত্তীর্ণ':'মক পরীক্ষা সম্পন্ন'}`);
  }
  function jpegPDF(jpeg,width,height){
    const enc=new TextEncoder(),chunks=[],offsets=[0];let length=0;
    const add=value=>{const bytes=typeof value==='string'?enc.encode(value):value;chunks.push(bytes);length+=bytes.length};
    const object=(id,body)=>{offsets[id]=length;add(`${id} 0 obj\n${body}\nendobj\n`)};
    add('%PDF-1.4\n');
    object(1,'<< /Type /Catalog /Pages 2 0 R >>');
    object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    offsets[4]=length;add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);add(jpeg);add('\nendstream\nendobj\n');
    const stream='q\n841.89 0 0 595.28 0 0 cm\n/Im0 Do\nQ\n';
    object(5,`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}endstream`);
    object(6,'<< /Title (Aponar Nihon Mock Examination Certificate) /Creator (Aponar Nihon) >>');
    const xref=length;add('xref\n0 7\n0000000000 65535 f \n');
    for(let i=1;i<=6;i++)add(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
    add(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(chunks,{type:'application/pdf'});
  }
  async function downloadPDF(){
    if(!input.value.trim()){input.focus();return}
    download.disabled=true;status.textContent='PDF তৈরি হচ্ছে…';
    try{
      await draw();
      const base64=canvas.toDataURL('image/jpeg',.95).split(',')[1];
      const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
      const url=URL.createObjectURL(jpegPDF(bytes,canvas.width,canvas.height));
      const link=document.createElement('a');link.href=url;
      link.download=`Aponar-Nihon-${current.level.toUpperCase()}-Mock-${String(current.test).padStart(2,'0')}-Certificate.pdf`;
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
      status.textContent='সনদের PDF ডাউনলোড হয়েছে।';
    }catch(error){status.textContent='PDF তৈরি হয়নি। আবার চেষ্টা করুন।';console.error(error)}
    finally{download.disabled=!input.value.trim()}
  }
  global.AponarMockCertificate={show,idFor};
})(window);
