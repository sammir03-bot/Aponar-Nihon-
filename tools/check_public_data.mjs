import fs from 'node:fs';
import assert from 'node:assert/strict';
import {stripTypeScriptTypes} from 'node:module';

const code = stripTypeScriptTypes(fs.readFileSync('workers/api/src/public-data.ts', 'utf8'));
const {handlePublicData, validBarcode, parsePlaces} = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const nativeFetch = globalThis.fetch;
const request = path => new Request('https://app.aponar-nihon.workers.dev' + path);
let calls = [];
globalThis.fetch = async (url, init) => {
  calls.push({url, init});
  return Response.json({status: 1, product: {product_name: 'Sample food', product_name_ja: '食品', ingredients_text: 'Milk', ingredients_text_ja: '牛乳、ゼラチン', labels_tags: ['en:halal']}});
};
try {
  assert.ok(validBarcode('3017620422003'));
  assert.equal(validBarcode('3017620422004'), false);
  assert.equal(validBarcode('https://example.com/3017620422003'), false);
  assert.equal((await handlePublicData(request('/api/public/food?barcode=123'))).status, 400);
  assert.equal((await handlePublicData(request('/api/public/nearby?lat=&lng=139.8'))).status, 400);
  assert.equal((await handlePublicData(request('/api/public/nearby?lat=100&lng=0'))).status, 400);
  assert.equal((await handlePublicData(request('/api/public/nearby?lat=35&lng=139&radius=999999'))).status, 400);
  assert.equal(calls.length, 0, 'Invalid requests must not consume public API quota');
  const product = await (await handlePublicData(request('/api/public/food?barcode=3017620422003'))).json();
  assert.equal(product.product.ingredients, '牛乳、ゼラチン');
  assert.equal(product.product.name, '食品');
  assert.ok(calls[0].url.includes('/api/v2/product/3017620422003.json'));
  assert.ok(calls[0].init.headers['User-Agent'].includes('AponarNihon'));
  assert.equal(product.product.reportedHalalLabel, true);
  assert.equal(product.product.status, undefined, 'A database label must not become halal certification');
  globalThis.fetch = async () => Response.json({status: 1, product: {product_name: 'No ingredients'}});
  assert.equal((await (await handlePublicData(request('/api/public/food?barcode=3017620422003'))).json()).product.ingredients, '');
  globalThis.fetch = async () => Response.json({status: 0}, {status: 404});
  assert.equal((await (await handlePublicData(request('/api/public/food?barcode=3017620422003'))).json()).found, false);
  globalThis.fetch = async () => new Response('Busy', {status: 429});
  assert.equal((await handlePublicData(request('/api/public/food?barcode=3017620422003'))).status, 429);
  const elements = [
    {type: 'node', id: 1, lat: 35.7168, lon: 139.8584, tags: {amenity: 'place_of_worship', religion: 'muslim', name: 'Mosque'}},
    {type: 'way', id: 2, center: {lat: 35.718, lon: 139.86}, tags: {amenity: 'restaurant', 'diet:halal': 'limited', name: 'Food'}},
    {type: 'node', id: 3, lat: 35.718, lon: 139.86, tags: {amenity: 'restaurant', cuisine: 'indian', name: 'Generic restaurant'}},
    {type: 'node', id: 4, lat: 35.718, lon: 139.86, tags: {amenity: 'restaurant', 'diet:halal': 'no', name: 'Halal old name'}},
    {type: 'node', id: 5, lat: 35.718, lon: 139.86, tags: {amenity: 'place_of_worship', religion: 'christian'}},
    {type: 'node', id: 6, tags: {amenity: 'restaurant', 'diet:halal': 'yes'}},
    {type: 'node', id: 7, lat: 35.718, lon: 139.86, tags: {shop: 'supermarket', name: 'Halal market', website: 'javascript:alert(1)'}}
  ];
  const selected = parsePlaces({elements});
  assert.deepEqual(selected.map(p => p.id), ['node/1', 'way/2', 'node/7']);
  assert.equal(selected[1].kind, 'food');
  assert.ok(selected[1].evidence.includes('কিছু খাবারে'));
  assert.equal(selected[2].website, '');
  globalThis.fetch = async (url, init) => { calls.push({url, init}); return Response.json({elements}); };
  const places = await (await handlePublicData(request('/api/public/nearby?lat=35.7168&lng=139.8584&radius=3000'))).json();
  assert.equal(places.places[0].distance, 0);
  assert.equal(places.places.length, 3);
  assert.ok(calls.at(-1).init.body.includes('around%3A4000'));
  let retries = 0;
  globalThis.fetch = async () => { retries++; return new Response('', {status: 429}); };
  assert.equal((await handlePublicData(request('/api/public/nearby?lat=35.7168&lng=139.8584'))).status, 429);
  assert.equal(retries, 1, 'Do not retry another server to evade a rate limit');
  console.log('Public data checks passed: bounded inputs, v2 lookup, source accuracy, missing data, rate limits, OSM tags and distance sorting.');
} finally { globalThis.fetch = nativeFetch; }
