import {test, expect} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

// Keep mocked API requests in Playwright's page route; service-worker fetches
// bypass page.route. The deployed API is checked separately without mocks.
test.use({serviceWorkers: 'block'});

async function foodApi(page, body, status = 200) {
  await page.route('**/api/public/food?*', route => route.fulfill({status, json: body}));
}
async function checkBarcode(page) {
  await page.locator('#barcodeInput').fill('3017620422003');
  await page.locator('#barcodeLookupBtn').click();
}
const food = ingredients => ({ok: true, found: true, product: {code: '3017620422003', name: 'পরীক্ষার খাবার', brand: 'Test fixture', ingredients, reportedHalalLabel: true}});
const placeData = {ok: true, places: [
  {id: 'node/1', kind: 'mosque', name: 'Fixture Mosque', lat: 35.7168, lng: 139.8584, distance: 120, address: 'Tokyo', evidence: 'OSM Muslim place tag', sourceUrl: 'https://www.openstreetmap.org/node/1'},
  {id: 'way/2', kind: 'food', name: '<img src=x onerror=alert(1)> Halal fixture', lat: 35.718, lng: 139.86, distance: 300, address: 'Tokyo', evidence: 'কিছু খাবারে halal tag আছে; দোকানে মিলিয়ে নিন', sourceUrl: 'https://www.openstreetmap.org/way/2'}
]};
test.beforeEach(async ({page}) => {
  await page.route('https://api.aladhan.com/**', r => r.fulfill({json: {code: 200, data: {timings: {Fajr:'04:30',Sunrise:'06:00',Dhuhr:'12:00',Asr:'15:00',Maghrib:'17:30',Isha:'19:00'}}}}));
});

test('barcode lookup shows Japanese ingredient concerns and the original source', async ({page}) => {
  await foodApi(page, food('牛乳、ゼラチン'));
  await page.goto('/halal-scanner.html'); await checkBarcode(page);
  await expect(page.locator('#productName')).toHaveText('পরীক্ষার খাবার');
  await expect(page.locator('#verdictBox')).toHaveAttribute('data-status', 'doubt');
  await expect(page.locator('#productIngredients')).toHaveText('牛乳、ゼラチン');
  await expect(page.locator('#flagList')).toContainText('জেলাটিন');
  await expect(page.locator('#productSource a')).toHaveAttribute('href', 'https://world.openfoodfacts.org/product/3017620422003');
});
test('a halal database label with missing ingredients remains unknown', async ({page}) => {
  await foodApi(page, food(''));
  await page.goto('/halal-scanner.html'); await checkBarcode(page);
  await expect(page.locator('#verdictBox')).toHaveAttribute('data-status', 'unknown');
  await expect(page.locator('#verdictTitle')).toHaveText('তথ্য যথেষ্ট নয়');
});
test('database outage still allows local ingredient checks and explicit absence claims', async ({page}) => {
  await foodApi(page, {ok: false}, 503);
  await page.goto('/halal-scanner.html'); await checkBarcode(page);
  await expect(page.locator('#productName')).toContainText('এখন পাওয়া যাচ্ছে না');
  await page.locator('#ingredientInput').fill('প্যাকেট: pork-free, alcohol-free, rice, salt');
  await page.locator('#analyzeIngredientsBtn').click();
  await expect(page.locator('#verdictBox')).toHaveAttribute('data-status', 'clear');
  await expect(page.locator('#verdictText')).toContainText('হালাল সনদ');
  await page.locator('#ingredientInput').fill('pork-free seasoning, pork gelatin, 酒精');
  await page.locator('#analyzeIngredientsBtn').click();
  await expect(page.locator('#verdictBox')).toHaveAttribute('data-status', 'danger');
});
test('the locally bundled decoder reads an actual EAN13 image without BarcodeDetector', async ({page}) => {
  await page.addInitScript(() => { delete window.BarcodeDetector; });
  await foodApi(page, food('米、食塩'));
  await page.goto('/halal-scanner.html');
  await page.locator('#barcodeImageInput').setInputFiles(path.resolve('tests/fixtures/food-barcode.svg'));
  await expect(page.locator('#barcodeInput')).toHaveValue('3017620422003');
  await expect(page.locator('#productName')).toHaveText('পরীক্ষার খাবার');
  await expect(page.locator('#verdictBox')).toHaveAttribute('data-status', 'clear');
});
test('camera refusal explains the problem and keeps the manual path usable', async ({page}) => {
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied', 'NotAllowedError'); }; });
  await page.goto('/halal-scanner.html'); await page.locator('#startScanBtn').click();
  await expect(page.locator('#scanStatus')).toContainText('অনুমতি পাওয়া যায়নি');
  await expect(page.locator('#cameraEmpty')).toBeVisible();
  await page.locator('#ingredientInput').fill('豚肉、塩'); await page.locator('#analyzeIngredientsBtn').click();
  await expect(page.locator('#verdictBox')).toHaveAttribute('data-status', 'danger');
});
test('camera decodes a barcode from a live video stream and releases the track', async ({page}) => {
  const imageUrl = 'data:image/svg+xml;base64,' + fs.readFileSync('tests/fixtures/food-barcode.svg').toString('base64');
  await page.addInitScript(imageUrl => {
    navigator.mediaDevices.getUserMedia = async () => {
      const image = new Image();
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = imageUrl; });
      const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 480;
      const ctx = canvas.getContext('2d');
      const draw = () => { ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 960, 480); ctx.drawImage(image, 80, 80, 800, 280); };
      draw(); const timer = setInterval(draw, 80);
      const stream = canvas.captureStream(12); const track = stream.getVideoTracks()[0];
      const stop = track.stop.bind(track); track.stop = () => { clearInterval(timer); stop(); };
      window.testScannerTrack = track;
      return stream;
    };
  }, imageUrl);
  await foodApi(page, food('米、食塩'));
  await page.goto('/halal-scanner.html'); await page.locator('#startScanBtn').click();
  await expect(page.locator('#barcodeInput')).toHaveValue('3017620422003');
  await expect(page.locator('#productName')).toHaveText('পরীক্ষার খাবার');
  await expect(page.locator('#cameraEmpty')).toBeVisible();
  expect(await page.evaluate(() => window.testScannerTrack.readyState)).toBe('ended');
});
test('manual area search loads the open map, filters places and escapes source names', async ({page}) => {
  let queries = 0;
  await page.route('**/api/public/nearby?*', route => { queries++; return route.fulfill({json: placeData}); });
  await page.goto('/muslim-japan.html');
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');
  await page.locator('#areaSelect').selectOption('35.7168,139.8584');
  await page.locator('#areaSearchBtn').click();
  await expect(page.locator('#places')).toContainText('Fixture Mosque');
  await page.locator('.tab[data-type="food"]').click();
  await expect(page.locator('#places')).toContainText('Halal fixture');
  await expect(page.locator('#places')).toContainText('কিছু খাবারে halal tag');
  await expect(page.locator('#places img')).toHaveCount(0);
  await expect(page.locator('#places a').first()).toHaveAttribute('href', /openstreetmap.org\/directions/);
  expect(queries).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('location denial offers area search and an upstream outage offers retry', async ({page}) => {
  await page.addInitScript(() => { navigator.geolocation.getCurrentPosition = (ok, fail) => fail({code: 1}); });
  await page.route('**/api/public/nearby?*', route => route.fulfill({status: 503, json: {ok: false}}));
  await page.goto('/muslim-japan.html'); await page.locator('#locBtn').click();
  await expect(page.locator('#locStatus')).toContainText('এলাকা বেছে খুঁজুন');
  await page.locator('#areaSearchBtn').click();
  await expect(page.locator('#placesStatus')).toContainText('তথ্য এখন আনা যাচ্ছে না');
  await expect(page.locator('#mapRetryBtn')).toBeVisible();
  await expect(page.locator('.leaflet-container')).toBeVisible();
  await page.unroute('**/api/public/nearby?*');
  await page.route('**/api/public/nearby?*', route => route.fulfill({json: {ok: true, places: []}}));
  await page.locator('#mapRetryBtn').click();
  await expect(page.locator('#placesStatus')).toContainText('তথ্য পাওয়া যায়নি');
  await expect(page.locator('#mapRetryBtn')).toBeHidden();
});
