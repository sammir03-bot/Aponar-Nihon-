import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const CSS='<link rel="stylesheet" href="/assets/css/inner-section-cards.css?v=20260912.1">';
const JS='<script defer src="/assets/js/inner-section-cards.js?v=20260912.1"></script>';

const exactTargets=[
  'n5.html','n4.html','n3.html',
  'jlpt-revision.html','listening-lab.html','quiz.html','jlpt-quiz.html',
  'mock-test.html','n5-mock-tests.html','n4-mock-tests.html','n3-mock-tests.html',
  'tutor-section.html','interview.html','ssw.html','essential-phrases.html',
  'japan-life.html','jobs-in-japan.html','Hiragana-Katagana.html','ebook-library.html',
  'student-tools.html','cv-builder.html','grammar-vs.html','muslim-japan.html',
  'jpy-bdt-remittance.html','study-guide.html','profile.html','halal-scanner.html',
  'japanese-language-course.html'
];

/* Detail hubs/guides under the main sections. Lesson/article pages are intentionally excluded. */
const optionalPatterns=[
  /^japan-(arrival|home-life|train-platform|google-maps|part-time-job|emergency|newcomer)-guide\.html$/,
  /^japan-student-visa\.html$/,
  /^student-(time-manager|job-guide|life-guide)\.html$/,
  /^ssw-[a-z0-9-]+\.html$/,
  /^interview-[a-z0-9-]+\.html$/
];

function shouldInclude(file){
  return exactTargets.includes(file)||optionalPatterns.some(re=>re.test(file));
}

const rootFiles=fs.readdirSync(ROOT,{withFileTypes:true})
  .filter(d=>d.isFile()&&d.name.endsWith('.html'))
  .map(d=>d.name)
  .filter(shouldInclude);

let changed=0;
for(const file of rootFiles){
  const abs=path.join(ROOT,file);
  let html=fs.readFileSync(abs,'utf8');
  const before=html;

  if(!html.includes('inner-section-cards.css')){
    if(html.includes('</head>')) html=html.replace('</head>',`  ${CSS}\n</head>`);
    else continue;
  }
  if(!html.includes('inner-section-cards.js')){
    if(html.includes('</head>')) html=html.replace('</head>',`  ${JS}\n</head>`);
  }
  if(/<body\b/i.test(html)&&!/<body\b[^>]*data-inner-card-page=/i.test(html)){
    html=html.replace(/<body\b/i,'<body data-inner-card-page="1"');
  }

  if(html!==before){
    fs.writeFileSync(abs,html,'utf8');
    changed++;
    console.log('updated',file);
  }
}

/* The enhancer is loaded only on section pages, so allow any installed page to use auto-detection.
   Home is never edited by this installer and therefore remains unchanged. */
const enhancerPath=path.join(ROOT,'assets/js/inner-section-cards.js');
if(fs.existsSync(enhancerPath)){
  let js=fs.readFileSync(enhancerPath,'utf8');
  const before=js;
  js=js.replace("  if(!PAGE_TITLES[path])return;\n  document.body&&document.body.setAttribute('data-inner-card-page','1');", "  if(path==='/'||path==='/index.html'||path==='/index')return;\n  document.body&&document.body.setAttribute('data-inner-card-page','1');");
  if(js!==before){fs.writeFileSync(enhancerPath,js,'utf8');changed++;console.log('updated assets/js/inner-section-cards.js generic fallback')}
}

console.log(`Inner-section card installer complete. Changed ${changed} file(s).`);
