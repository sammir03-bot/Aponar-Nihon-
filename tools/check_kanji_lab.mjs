import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DAY, STORAGE_KEY, rowsForLevel, lessonsForLevel, allowedText, question, grade, mastered, studied, readState, saveState, blankState, dueRows} from '../assets/js/kanji-lab-core.js';

const course = JSON.parse(readFileSync(new URL('../assets/data/kanji-lab/course.json', import.meta.url)));
const strokes = JSON.parse(readFileSync(new URL('../assets/data/kanji-lab/strokes.json', import.meta.url))).strokes;
const characters = new Set(course.kanji.map(r => r.k));
assert.equal(characters.size, course.kanji.length);
assert.equal(course.kanji.filter(r => r.book === 1).length, 220);
assert.equal(course.kanji.filter(r => r.book === 2).length, 316);

for (const [level, count] of [['n5', 79], ['n4', 166]]) {
  const chunk = JSON.parse(readFileSync(new URL(`../assets/data/kanji-lab/${level}.json`, import.meta.url)));
  assert(chunk.kanji.every(r => r.level === level));
  assert(chunk.lessons.every(r => r.level === level));
  const bank = rowsForLevel(course, level);
  assert.equal(bank.length, count, 'Pinned level classification changed');
  const assigned = lessonsForLevel(course, level).flatMap(l => l.kanji);
  assert.equal(new Set(assigned).size, count);
  assert.equal(assigned.length, count, 'Every kanji appears in exactly one course unit');
  for (const lesson of lessonsForLevel(course, level)) {
    assert(lesson.kanji.every(k => bank.some(r => r.k === k)), 'Lesson crossed a level boundary');
  }
  for (const row of bank) {
    assert.equal(row.k.length, 1);
    assert(row.bn && row.words.length && row.strokeCount > 0);
    assert.equal(strokes[row.k].length, row.strokeCount);
    assert(strokes[row.k].every(path => /^[Mm]\s*-?[0-9]/.test(path)), 'SVG stroke path is invalid');
    for (const word of row.words) {
      assert(word.ja.includes(row.k));
      assert(word.reading && word.bn);
      assert(allowedText(word.ja, level, course.levelMap), `${level} word contains a higher level glyph: ${word.ja}`);
      assert(!/[一-鿿]/.test(word.reading), 'A pronunciation contains unanswered kanji');
    }
    assert(allowedText(row.memory, level, course.levelMap));
    for (const example of row.examples) assert(allowedText(example.ja, level, course.levelMap));
    for (const kind of ['meaning', 'reading', 'spelling']) {
      const q = question(row, kind, course.kanji, () => .41);
      assert.equal(q.choices.length, 4);
      assert.equal(new Set(q.choices).size, 4);
      assert.equal(q.choices.filter(c => c === q.answer).length, 1);
      for (const c of q.choices) if (kind === 'spelling') assert(allowedText(c, level, course.levelMap));
    }
  }
}
assert.deepEqual(rowsForLevel(course, 'n2'), []);
assert.deepEqual(lessonsForLevel(course, 'n3'), []);

const now = new Date(2026, 9, 12, 12).getTime();
let record = grade(undefined, true, 'meaning', now);
record = grade(record, true, 'reading', now + 1000);
assert(studied(record));
assert(!mastered(record), 'One session must not imply long-term mastery');
assert.equal(record.stage, 1, 'Same-day repetition must not inflate review intervals');
assert.equal(record.due, now + 1000 + DAY);
record = grade(record, true, 'meaning', now + DAY);
record = grade(record, true, 'reading', now + DAY + 1000);
assert(mastered(record));
assert.equal(record.stage, 2);
assert.equal(record.due, now + DAY + 1000 + 3 * DAY);
record = grade(record, false, 'meaning', now + DAY + 2000);
assert(!mastered(record));
const due = record.due;
record = grade(record, true, 'reading', now + DAY + 3000);
assert.equal(record.due, due, 'A different correct skill must retain the recent mistake retry');

const values = new Map([['aponarnihon-n5-kanji-dark-learned', '[1,"2"]'], ['aponarnihon-n4-kanji-dark-learned', 'not JSON']]);
const storage = {getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v)};
const state = readState(storage, course);
assert(state.cards['一'].legacy);
assert(state.cards['二'].legacy);
assert(!mastered(state.cards['一']));
assert(saveState(storage, state));
const importedN5 = JSON.parse(values.get('aponarKanjiStudiedV2:n5'));
assert(importedN5.every(k => rowsForLevel(course, 'n5').some(r => r.k === k)));
const otherLevel = rowsForLevel(course, 'n4')[0].k;
state.cards[otherLevel] = {level: 'n4', legacy: true, dates: [], skills: {}};
saveState(storage, state);
const n5Chunk = JSON.parse(readFileSync(new URL('../assets/data/kanji-lab/n5.json', import.meta.url)));
assert(readState(storage, n5Chunk).cards[otherLevel].legacy, 'Changing a level must not erase the other level progress');
values.set(STORAGE_KEY, '{broken');
assert(readState(storage, course).cards['一'].legacy);
assert(!saveState({setItem: () => {throw Error('blocked');}}, blankState()));
const review = blankState();
review.cards['一'] = grade(undefined, false, 'meaning', now);
assert.equal(dueRows(rowsForLevel(course, 'n5'), review, now).length, 0);
assert.equal(dueRows(rowsForLevel(course, 'n5'), review, now + 600001).length, 1);
assert.equal(dueRows(rowsForLevel(course, 'n4'), review, now + 600001).length, 0);
console.log('Kanji Lab: level isolation, 245 course targets, 735 question variants, stroke data, recall scheduling and migration passed.');
