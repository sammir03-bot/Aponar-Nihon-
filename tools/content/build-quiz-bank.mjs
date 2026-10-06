// Derive practice sets from the reviewed bank already used by this site's mocks.
import fs from 'node:fs';

const version = '20261007.quiz2';
fs.mkdirSync('assets/data/quiz', {recursive: true});
for (const level of ['n5', 'n4', 'n3']) {
  const bank = JSON.parse(fs.readFileSync(`assets/data/study/questions-${level}.json`, 'utf8'));
  const categories = {};
  for (const category of ['vocabulary', 'kanji', 'grammar', 'reading']) {
    const seen = new Set();
    const pool = bank.questions.filter(q => {
      if (q.category !== category || seen.has(q.id)) return false;
      if (!/[\u0980-\u09ff]/.test(q.answerBn || '') || !/[\u0980-\u09ff]/.test(q.explanationBn || '')) return false;
      if (q.options.length !== 4 || new Set(q.options).size !== 4) return false;
      seen.add(q.id);
      return true;
    });
    const size = Math.min(8, Math.floor(pool.length / 10));
    if (size < 3) throw new Error(`Not enough reviewed questions for ${level}/${category}`);
    categories[category] = Array.from({length: 10}, (_, part) => pool.slice(part * size, (part + 1) * size).map(q => {
      const copy = {};
      for (const key of ['id', 'category', 'kind', 'prompt', 'promptHtml', 'passageHtml', 'questionImage', 'options', 'optionsHtml', 'answer', 'answerBn', 'explanationBn', 'sourceUrl', 'provenance']) {
        if (q[key] !== undefined) copy[key] = q[key];
      }
      return copy;
    }));
  }
  fs.writeFileSync(`assets/data/quiz/${level}.json`, JSON.stringify({version, level, categories}));
  console.log(`${level}: 40 practice sets derived from the existing reviewed bank.`);
}
