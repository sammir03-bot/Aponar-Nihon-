import fs from 'node:fs';
import assert from 'node:assert/strict';

let sets = 0, questions = 0;
for (const level of ['n5','n4','n3']) {
  const bank = JSON.parse(fs.readFileSync(`assets/data/quiz/${level}.json`, 'utf8'));
  const source = new Map(JSON.parse(fs.readFileSync(`assets/data/study/questions-${level}.json`, 'utf8')).questions.map(q => [q.id, q]));
  assert.equal(bank.version, '20261007.quiz2');
  for (const category of ['vocabulary', 'kanji', 'grammar', 'reading']) {
    assert.equal(bank.categories[category].length, 10);
    const seen = new Set();
    for (const rows of bank.categories[category]) {
      assert.ok(rows.length >= 3 && rows.length <= 8); sets++;
      for (const q of rows) {
        assert.ok(!seen.has(q.id), `${level}/${category}: parts must not reuse questions`); seen.add(q.id);
        assert.equal(q.options.length, 4); assert.equal(new Set(q.options).size, 4);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
        assert.match(q.answerBn, /[\u0980-\u09ff]/); assert.match(q.explanationBn, /[\u0980-\u09ff]/);
        assert.ok(q.promptHtml);
        assert.deepEqual(q.options, source.get(q.id).options, 'Keep the reviewed source choices');
        assert.equal(q.answer, source.get(q.id).answer); assert.equal(q.explanationBn, source.get(q.id).explanationBn);
        if (category === 'reading') assert.ok(q.passageHtml);
        questions++;
      }
    }
  }
}
assert.equal(sets, 120);
console.log(`Quiz audit passed: ${questions} reviewed questions across 120 distinct practice sets, all levels/categories, Bengali answers and source-key integrity.`);
