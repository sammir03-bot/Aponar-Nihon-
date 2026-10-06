import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';

globalThis.NewsTestDurableObject = class {constructor(ctx, env) {this.ctx = ctx; this.env = env;}};
const code = fs.readFileSync('workers/api/src/daily-news.ts', 'utf8').replace('import { DurableObject } from "cloudflare:workers";', 'const DurableObject = globalThis.NewsTestDurableObject;');
const {DailyNewsFeed, parseNewsRss, applyNewsLearning, tokyoDate} = await import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(code)).toString('base64'));
const now = new Date(), title = '学校で日本語を学びます';
const item = (url, pub = now.toUTCString(), headline = title) => `<item><title><![CDATA[${headline}]]></title><link>${url}</link><pubDate>${pub}</pubDate><description>新しい授業を始めます。</description></item>`;
const rss = `<rss><channel>${item('https://news.web.nhk/newsweb/na/nd-test')}${item('https://news.web.nhk/newsweb/na/nd-test')}${item('https://evil.test/story')}${item('https://news.web.nhk/future', 'Tue, 01 Jan 2080 10:00:00 +0900')}</channel></rss>`;
const parsed = await parseNewsRss(rss, now);
assert.equal(parsed.length, 1, 'Exclude duplicate links, foreign hosts and future stories');
assert.equal(parsed[0].date, tokyoDate(now));assert.equal(parsed[0].learning_status, 'pending');
assert.equal(tokyoDate(new Date('2026-10-06T15:05:00Z')), '2026-10-07', 'Use Japan midnight');
const learning = {id: parsed[0].id, headline_tokens: [{t:'学校',r:'がっこう'},{t:'で'},{t:'日本語',r:'にほんご'},{t:'を'},{t:'学び',r:'まなび'},{t:'ます'}], summary_tokens: [{t:'学校',r:'がっこう'},{t:'で'},{t:'日本語',r:'にほんご'},{t:'を'},{t:'学び',r:'まなび'},{t:'ます。'}], teaser_bn:'স্কুলে জাপানি শেখার খবর।', explanation_bn:['বিদ্যালয়ের নতুন ক্লাসে জাপানি শেখা হবে।'], vocabulary:[{word:'学校',reading:'がっこう',meaning_bn:'স্কুল'},{word:'日本語',reading:'にほんご',meaning_bn:'জাপানি ভাষা'},{word:'学び',reading:'まなび',meaning_bn:'শেখা'}]};
assert.equal(applyNewsLearning(parsed[0], learning).learning_status, 'ready');
assert.equal(applyNewsLearning(parsed[0], {...learning, headline_tokens:[{t:'Invented replacement'}]}).learning_status, 'pending');
assert.equal(applyNewsLearning(parsed[0], {...learning, teaser_bn:'Untranslated English'}).learning_status, 'pending');
assert.equal(applyNewsLearning(parsed[0], {...learning, headline_tokens:[{t:title,r:'Latin reading'}]}).learning_status,'pending','Readings must use kana');
const spaced={...parsed[0],headline:'学校で 日本語を 学びます'};
const aligned=applyNewsLearning(spaced,learning);
assert.equal(aligned.learning_status,'ready','Restore source spaces without changing its text');
assert.equal(aligned.headline_tokens.map(t=>t.t).join(''),spaced.headline);
const changed=applyNewsLearning({...parsed[0],headline:'学校で日本語を50人が学びます'}, {...learning,headline_tokens:[{t:'学校で日本語を55人が学びます',r:'がっこうでにほんごをごじゅうごにんがまなびます'}]});
assert.equal(changed.learning_status,'pending','Never reconcile changed numbers as a formatting difference');

const values = new Map(), waits = [];
const ctx = {waitUntil:p=>waits.push(p), storage:{
  async get(k) {return structuredClone(values.get(k));},
  async put(k,v) {if(typeof k === 'object') for(const [key,value] of Object.entries(k)) values.set(key,structuredClone(value)); else values.set(k,structuredClone(v));},
  async list({prefix}) {return new Map([...values].filter(([k])=>k.startsWith(prefix)).map(([k,v])=>[k,structuredClone(v)]));},
  async delete(keys) {for(const k of keys)values.delete(k);}
}};
const nativeFetch = globalThis.fetch;let sources=0, models=0;
globalThis.fetch = async url => {
  if(url === 'https://www.nhk.or.jp/rss/news/cat0.xml') {sources++;return new Response(rss);}
  assert.ok(url.startsWith('https://generativelanguage.googleapis.com/'));
  models++;return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({articles:[learning]})}]}}]});
};
try {
  const feed = new DailyNewsFeed(ctx,{GEMINI_API_KEY:'test-only'});
  const [a,b] = await Promise.all([feed.fetch(new Request('https://internal/feed')),feed.fetch(new Request('https://internal/feed'))]);
  assert.equal(a.status,200);assert.equal(b.status,200);
  assert.equal(sources,1,'Share the source request across concurrent visitors');assert.equal(models,1,'Share the model call');
  const data=await a.json();assert.equal(data.articles[0].learning_status,'ready');assert.equal(data.articles[0].source_excerpt,undefined);
  const next=new DailyNewsFeed(ctx,{GEMINI_API_KEY:'test-only'});
  assert.equal((await next.fetch(new Request('https://internal/feed'))).status,200);assert.equal(sources,1,'Reuse persistent data across object instances');
  let meta=values.get('feed-meta-v1');meta.last_checked=Date.now()-4*3600000;values.set('feed-meta-v1',meta);
  const correctedTitle='学校で新しい日本語を学びます';
  globalThis.fetch=async url=>url==='https://www.nhk.or.jp/rss/news/cat0.xml'?(sources++,new Response(`<rss><channel>${item('https://news.web.nhk/newsweb/na/nd-test',now.toUTCString(),correctedTitle)}</channel></rss>`)):Response.json({candidates:[{content:{parts:[{text:JSON.stringify({articles:[learning]})}]}}]});
  const corrected=await (await next.fetch(new Request('https://internal/refresh',{method:'POST'}))).json();
  assert.equal(corrected.articles.length,1,'Corrections must not duplicate a source story');
  assert.equal(corrected.articles[0].headline,correctedTitle);assert.equal(corrected.articles[0].learning_status,'pending','Discard language material based on the old headline');
  meta=values.get('feed-meta-v1');meta.last_checked=Date.now()-4*3600000;values.set('feed-meta-v1',meta);
  globalThis.fetch = async ()=>{sources++;return new Response('',{status:503});};
  const failed=await (await next.fetch(new Request('https://internal/refresh',{method:'POST'}))).json();
  assert.equal(failed.update_status,'source_unavailable');assert.equal(failed.articles.length,1,'Keep the last good news during outages');
  await next.fetch(new Request('https://internal/refresh',{method:'POST'}));assert.equal(sources,3,'Back off after upstream failures');
  assert.equal((await next.fetch(new Request('https://internal/feed',{method:'PUT'}))).status,405);
  // Pending language cards retry independently of the three-hour source refresh.
  values.set('article:'+parsed[0].id,structuredClone(parsed[0]));
  meta=values.get('feed-meta-v1');meta.last_checked=Date.now();meta.learning_checked=Date.now()-16*60000;values.set('feed-meta-v1',meta);
  globalThis.fetch=async (url,init)=>{
    assert.ok(url.startsWith('https://generativelanguage.googleapis.com/'),'A language retry must not refetch RSS');
    const config=JSON.parse(init.body).generationConfig;assert.equal(config.thinkingConfig.thinkingLevel,'MINIMAL');assert.ok(config.responseJsonSchema);
    models++;return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({articles:[learning]})}]}}]});
  };
  await next.fetch(new Request('https://internal/feed'));await Promise.all(waits);
  const retried=await (await next.fetch(new Request('https://internal/feed'))).json();
  assert.equal(retried.articles[0].learning_status,'ready');assert.equal(retried.learning_error,null);assert.equal(sources,3);
  values.set('article:'+parsed[0].id,structuredClone(parsed[0]));
  meta=values.get('feed-meta-v1');meta.learning_checked=Date.now();meta.learning_version='previous-generator';values.set('feed-meta-v1',meta);
  globalThis.fetch=async()=>new Response('',{status:400});let fallbackCalls=0;
  const fallback=new DailyNewsFeed(ctx,{GEMINI_API_KEY:'test-only',AI:{async run(model,request){assert.equal(model,'@cf/zai-org/glm-4.7-flash');assert.equal(request.reasoning_effort,'low');assert.equal(request.max_completion_tokens,4500);assert.equal(request.response_format.type,'json_object');fallbackCalls++;return {choices:[{message:{content:JSON.stringify({articles:[learning]})}}]};}}});
  await fallback.fetch(new Request('https://internal/feed'));await Promise.all(waits);
  const fallbackData=await (await fallback.fetch(new Request('https://internal/feed'))).json();
  assert.equal(fallbackData.articles[0].learning_status,'ready','Use the existing inference binding when the primary request fails');assert.equal(fallbackCalls,1);
  values.set('article:'+parsed[0].id,structuredClone(parsed[0]));
  meta=values.get('feed-meta-v1');meta.learning_checked=0;values.set('feed-meta-v1',meta);
  const invalidFallback=new DailyNewsFeed(ctx,{AI:{async run(){fallbackCalls++;return {response:JSON.stringify({articles:[{...learning,teaser_bn:'English only'}]})};}}});
  await invalidFallback.fetch(new Request('https://internal/feed'));await Promise.all(waits);
  const invalidData=await (await invalidFallback.fetch(new Request('https://internal/feed'))).json();
  assert.equal(invalidData.articles[0].learning_status,'pending','Fallback content must pass the same Bengali validation');assert.equal(fallbackCalls,2,'Invalid fallback output must respect the retry backoff');
  assert.equal(invalidData.learning_error,'news_learning_bengali_missing','Diagnostics contain a reason, never raw model text');
  const siblings=[parsed[0],{...parsed[0],id:parsed[0].id+'-second'},{...parsed[0],id:parsed[0].id+'-third'}];
  for(const article of siblings)values.set('article:'+article.id,structuredClone(article));
  meta=values.get('feed-meta-v1');meta.last_checked=Date.now();meta.learning_checked=0;values.set('feed-meta-v1',meta);
  let perCardCalls=0;
  globalThis.fetch=async(url,init)=>{const body=JSON.parse(init.body),input=JSON.parse(body.contents[0].parts[0].text);assert.equal(input.length,1);assert.equal(body.generationConfig.responseJsonSchema.properties.articles.maxItems,1);assert.deepEqual(body.generationConfig.responseJsonSchema.properties.articles.items.properties.id.enum,[input[0].id]);return new Response('',{status:400});};
  const separate=new DailyNewsFeed(ctx,{GEMINI_API_KEY:'test-only',AI:{async run(_model,request){perCardCalls++;const [{id}]=JSON.parse(request.messages[1].content);if(id===siblings[1].id)throw new Error('one-provider-outage');return {response:JSON.stringify({articles:[{...learning,id}]})};}}});
  await separate.fetch(new Request('https://internal/feed'));await Promise.all(waits);
  const separateData=await (await separate.fetch(new Request('https://internal/feed'))).json();
  assert.equal(perCardCalls,3);assert.equal(separateData.articles.filter(a=>a.learning_status==='ready').length,2,'Successful siblings survive one failed card');assert.equal(separateData.learning_error,'news_learning_missing_card');
  console.log('Daily news audit passed: trusted real dates, enrichment validation, persistent archive, concurrent deduplication, outages and backoff.');
} finally {globalThis.fetch=nativeFetch;delete globalThis.NewsTestDurableObject;}

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
