import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';

const worker = fs.readFileSync('workers/api/src/index.ts', 'utf8');
const context = vm.createContext({ Request, Response, TextDecoder, TextEncoder, URL, console });
vm.runInContext(stripTypeScriptTypes(worker.slice(0, worker.indexOf('export default {')))
  + ';this.check={parseTranslationRequest,parseTranslationModelOutput};', context);
const items = Array.from({ length: 4 }, (_, id) => ({ id: String(id), text: 'বাংলায় শিখুন। '.repeat(330) }));
const payload = { page: 'lesson', targetLanguage: 'vi', items };
assert.ok(Buffer.byteLength(JSON.stringify(payload)) > 32768, 'Regression must cross the former UTF-8 limit');
const parsed = await context.check.parseTranslationRequest(new Request('https://example.test/api/i18n/translate', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
}));
assert.equal(parsed.items.length, 4);

function valid(targetLanguage, source, translated) {
  return context.check.parseTranslationModelOutput(JSON.stringify({ translations: [{ id: '0', text: translated }] }), {
    page: 'jobs', targetLanguage, items: [{ id: '0', text: source }]
  });
}
assert.ok(valid('ja', 'TownWork খুলুন', 'TownWorkを開く'));
assert.ok(valid('vi', 'অ্যাপ খুলুন', 'Mở app'));
assert.ok(valid('fil', 'অনুশীলন শুরু করুন', 'Simulan ang practice'));
assert.equal(valid('ja', 'Student dashboard', 'Student dashboard'), null);
assert.equal(valid('vi', 'অ্যাপ খুলুন', 'অ্যাপ খুলুন'), null);
const ui = vm.createContext({ window: {}, Map });
vm.runInContext(fs.readFileSync('assets/js/i18n-ui.js', 'utf8'), ui);
for (const row of ui.window.AponarUIStrings.rows) {
  assert.equal(row.length, 11);
  assert.ok(row.every(value => typeof value === 'string' && value.trim()));
}
console.log('Translation audit passed: large Bangla UTF-8 requests, proper names, native loanwords, residue rejection, and 11-language UI coverage.');
