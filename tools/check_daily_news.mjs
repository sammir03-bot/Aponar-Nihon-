import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';

const moduleUrl=code=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(code)).toString('base64');
const learningCode=fs.readFileSync('workers/api/src/news-learning.ts','utf8');
const {sourceNewsLessons,headlineReadings}=await import(moduleUrl(learningCode));
globalThis.NewsTestLessons=sourceNewsLessons;
globalThis.NewsTestDurableObject=class {constructor(ctx,env){this.ctx=ctx;this.env=env;}};
const code=fs.readFileSync('workers/api/src/daily-news.ts','utf8')
 .replace('import { DurableObject } from "cloudflare:workers";','const DurableObject=globalThis.NewsTestDurableObject;')
 .replace('import { sourceNewsLessons } from "./news-learning";','const sourceNewsLessons=globalThis.NewsTestLessons;');
const {DailyNewsFeed,parseNewsRss,applyNewsLearning,tokyoDate}=await import(moduleUrl(code));
const title='学校で日本語を学びます',now=new Date();
const item=(url,pub=now.toUTCString(),headline=title)=>`<item><title><![CDATA[${headline}]]></title><link>${url}</link><pubDate>${pub}</pubDate><description>新しい授業を始めます。</description></item>`;
const rss=`<rss><channel>${item('https://news.web.nhk/newsweb/na/nd-test')}${item('https://news.web.nhk/newsweb/na/nd-test')}${item('https://evil.test/story')}${item('https://news.web.nhk/future','Tue, 01 Jan 2080 10:00:00 +0900')}</channel></rss>`;
const parsed=await parseNewsRss(rss,now);assert.equal(parsed.length,1);assert.equal(parsed[0].date,tokyoDate(now));
assert.equal(tokyoDate(new Date('2026-10-06T15:05:00Z')),'2026-10-07');
const dictionaryData=fs.readFileSync('assets/data/news-readings.tsv.gz');
const {gunzipSync}=await import('node:zlib');
const table=new Map(gunzipSync(dictionaryData).toString().trim().split('\n').map(row=>row.split('\t')));
assert.equal(table.size,249261);
const realTitles=['旭化成子会社 個人情報55万人余 漏えいの可能性と発表','ノーベル物理学賞に米大学教授 「IceCube」でニュートリノ観測','企業への不正アクセス被害相次ぐ 個人情報の大規模流出も'];
for(const headline of realTitles){const tokens=headlineReadings(headline,table);assert.equal(tokens.map(t=>t.t).join(''),headline);assert.ok(tokens.every(t=>!/[\u3400-\u9fff]/.test(t.t)||t.r));}
const first=headlineReadings(realTitles[0],table),third=headlineReadings(realTitles[2],table);
for(const [word,reading] of [['旭化成','あさひかせい'],['人','にん'],['余','あまり'],['発表','はっぴょう']])assert.equal(first.find(t=>t.t===word)?.r,reading);
assert.equal(third.find(t=>t.t==='不正')?.r,'ふせい');assert.equal(third.find(t=>t.t==='規模')?.r,'きぼ');
let translations=0,active=0,peak=0;
const meanings={'学校':'স্কুল','日本語':'জাপানি ভাষা','学び':'শেখা','新しい':'নতুন'};
const env={ASSETS:{fetch:async()=>new Response(dictionaryData)},AI:{async run(model,request){assert.equal(model,'@cf/meta/m2m100-1.2b');assert.equal(request.source_lang,'ja');assert.equal(request.target_lang,'bn');translations++;active++;peak=Math.max(peak,active);await Promise.resolve();active--;return {translated_text:meanings[request.text]||'স্কুলে জাপানি শেখার খবর।'};}}};
const learning=(await sourceNewsLessons(env,parsed)).get(parsed[0].id);
assert.equal(applyNewsLearning(parsed[0],learning).learning_status,'ready');assert.ok(peak<=4);
const decodedModule=await import(moduleUrl(learningCode)+'#decoded');
const decoded=(await decodedModule.sourceNewsLessons({...env,ASSETS:{fetch:async()=>new Response(gunzipSync(dictionaryData))}},parsed)).get(parsed[0].id);
assert.equal(applyNewsLearning(parsed[0],decoded).learning_status,'ready','Accept decoded assets only after the canonical checksum matches');
assert.equal(applyNewsLearning(parsed[0],{...learning,teaser_bn:'Japanese only'}).learning_status,'pending');
assert.equal(applyNewsLearning(parsed[0],{...learning,headline_tokens:[{t:'Invented replacement'}]}).learning_status,'pending');
const spaced={...parsed[0],headline:'学校で 日本語を 学びます'};
assert.equal(applyNewsLearning(spaced,learning).headline_tokens.map(t=>t.t).join(''),spaced.headline);
assert.equal(applyNewsLearning({...parsed[0],headline:'学校で日本語を50人が学びます'},{...learning,headline_tokens:[{t:'学校で日本語を55人が学びます',r:'がっこう'}]}).learning_status,'pending');
const invalidModule=await import(moduleUrl(learningCode)+'#invalid');
await assert.rejects(invalidModule.sourceNewsLessons({...env,ASSETS:{fetch:async()=>new Response(new Uint8Array([1,2,3]))}},parsed));

const values=new Map(),waits=[];
const ctx={waitUntil:p=>waits.push(p),storage:{
 async get(k){return structuredClone(values.get(k));},
 async put(k,v){if(typeof k==='object')for(const [key,value] of Object.entries(k))values.set(key,structuredClone(value));else values.set(k,structuredClone(v));},
 async list({prefix}){return new Map([...values].filter(([k])=>k.startsWith(prefix)).map(([k,v])=>[k,structuredClone(v)]));},
 async delete(keys){for(const k of keys)values.delete(k);}
}};
const nativeFetch=globalThis.fetch;let sources=0;
globalThis.fetch=async url=>{assert.equal(url,'https://www.nhk.or.jp/rss/news/cat0.xml');sources++;return new Response(rss);};
try{
 translations=0;
 const feed=new DailyNewsFeed(ctx,env);
 const [a,b]=await Promise.all([feed.fetch(new Request('https://internal/feed')),feed.fetch(new Request('https://internal/feed'))]);
 assert.equal(a.status,200);assert.equal(b.status,200);assert.equal(sources,1);assert.equal(translations,4,'Share one source headline and three word translations');
 const data=await a.json();assert.equal(data.articles[0].learning_status,'ready');assert.equal(data.articles[0].source_excerpt,undefined);
 const next=new DailyNewsFeed(ctx,env);await next.fetch(new Request('https://internal/feed'));assert.equal(sources,1);assert.equal(translations,4);
 let meta=values.get('feed-meta-v1');meta.last_checked=Date.now()-4*3600000;values.set('feed-meta-v1',meta);
 const correctedTitle='学校で新しい日本語を学びます';
 globalThis.fetch=async()=>{sources++;return new Response(`<rss><channel>${item('https://news.web.nhk/newsweb/na/nd-test',now.toUTCString(),correctedTitle)}</channel></rss>`);};
 const corrected=await (await next.fetch(new Request('https://internal/refresh',{method:'POST'}))).json();assert.equal(corrected.articles.length,1);assert.equal(corrected.articles[0].headline,correctedTitle);assert.equal(corrected.articles[0].learning_status,'pending');
 meta=values.get('feed-meta-v1');meta.last_checked=Date.now()-4*3600000;values.set('feed-meta-v1',meta);globalThis.fetch=async()=>{sources++;return new Response('',{status:503});};
 const failed=await (await next.fetch(new Request('https://internal/refresh',{method:'POST'}))).json();assert.equal(failed.update_status,'source_unavailable');assert.equal(failed.articles.length,1);
 await next.fetch(new Request('https://internal/refresh',{method:'POST'}));assert.equal(sources,3);
 assert.equal((await next.fetch(new Request('https://internal/feed',{method:'PUT'}))).status,405);
 values.set('article:'+parsed[0].id,{...parsed[0],learning_status:'ready',reading_version:'old-generator',headline_tokens:[{t:title,r:'incorrect'}]});meta=values.get('feed-meta-v1');meta.last_checked=Date.now();meta.learning_checked=Date.now();meta.learning_version='old-generator';values.set('feed-meta-v1',meta);
 globalThis.fetch=async()=>{throw new Error('A language retry must not refetch RSS');};
 const retiring=await (await next.fetch(new Request('https://internal/feed'))).json();assert.equal(retiring.articles[0].learning_status,'pending','Retire prior unverified readings immediately');await Promise.all(waits);const retried=await (await next.fetch(new Request('https://internal/feed'))).json();assert.equal(retried.articles[0].learning_status,'ready');assert.equal(retried.learning_error,null);
 values.set('article:'+parsed[0].id,structuredClone(parsed[0]));meta=values.get('feed-meta-v1');meta.learning_checked=0;values.set('feed-meta-v1',meta);
 let badCalls=0;const invalid=new DailyNewsFeed(ctx,{...env,AI:{async run(){badCalls++;return {translated_text:title};}}});
 await invalid.fetch(new Request('https://internal/feed'));await Promise.all(waits);const invalidData=await (await invalid.fetch(new Request('https://internal/feed'))).json();assert.equal(invalidData.articles[0].learning_status,'pending');assert.equal(invalidData.learning_error,'news_learning_bengali_missing');assert.equal(badCalls,4,'Back off after untranslated output');
 const siblings=[parsed[0],{...parsed[0],id:parsed[0].id+'-second',headline:'新しい学校で日本語を学びます'},{...parsed[0],id:parsed[0].id+'-third',headline:'学校で新しい日本語を学びます'}];for(const article of siblings)values.set('article:'+article.id,structuredClone(article));
 meta=values.get('feed-meta-v1');meta.learning_checked=0;values.set('feed-meta-v1',meta);
 const separate=new DailyNewsFeed(ctx,{...env,AI:{async run(model,request){if(request.text===siblings[1].headline)throw new Error('one-headline-outage');return env.AI.run(model,request);}}});
 await separate.fetch(new Request('https://internal/feed'));await Promise.all(waits);const independent=await (await separate.fetch(new Request('https://internal/feed'))).json();assert.equal(independent.articles.filter(a=>a.learning_status==='ready').length,2,'Preserve valid siblings');assert.equal(independent.learning_error,'news_learning_bengali_missing');
 console.log('Daily news audit passed: source dates, verified open readings, exact headlines, Bengali-only translation, concurrent deduplication, independent cards, archive and retry backoff.');
}finally{globalThis.fetch=nativeFetch;delete globalThis.NewsTestDurableObject;delete globalThis.NewsTestLessons;}

// Use a real fetch response: its immutable headers match a DO subrequest.
// In-memory Response.json fixtures hide this production-only failure.
const workerCode = fs.readFileSync('workers/api/src/index.ts', 'utf8')
  .replace(/^import \{ handlePublicData \} from "\.\/public-data";\s*/m, '')
  .replace(/^import \{ newsFeed \} from "\.\/daily-news";\s*/m, '')
  .replace(/^export \{ DailyNewsFeed \} from "\.\/daily-news";\s*/m, '')
  .replace('export default {', 'this.worker = {');
const workerContext = vm.createContext({Request, Response, URL, TextDecoder, TextEncoder, crypto, console,
  newsFeed: () => ({fetch: () => nativeFetch('data:application/json,' + encodeURIComponent(JSON.stringify({ok: true, articles: []})))})});
vm.runInContext(stripTypeScriptTypes(workerCode), workerContext);
const publicResponse = await workerContext.worker.fetch(new Request('https://app.aponar-nihon.workers.dev/api/public/news'), {APP_ORIGIN:'https://app.aponar-nihon.workers.dev'});
assert.equal(publicResponse.status, 200, 'Wrap immutable DO response headers before setting CORS');
assert.equal(publicResponse.headers.get('access-control-allow-origin'), 'https://app.aponar-nihon.workers.dev');
assert.equal((await publicResponse.json()).ok, true);
console.log('Live news route audit passed with immutable upstream headers.');
