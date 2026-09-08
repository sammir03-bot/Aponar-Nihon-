import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html = fs.readFileSync('jlpt-quiz.html', 'utf8');
const source = html.slice(html.indexOf("const $=s=>"), html.indexOf('const stateKey='));
const context = vm.createContext({URLSearchParams,location:{search:''},localStorage:{getItem:()=>null},document:{querySelector:()=>null}});
vm.runInContext(source + ';this.inspect=(l,c,p)=>{level=l;category=c;part=p;return qs()};this.vocabulary=V;',context);
let count = 0;
for (const level of ['n5','n4','n3']) {
 for (const category of level==='n3'?['reading']:['vocabulary','kanji','grammar','reading']) {
  for (let part=1;part<=10;part++) {
   for (const q of context.inspect(level,category,part)) {
    assert.equal(q.opts.length,4,`${level}/${category}/${part}: four choices`);
    assert.equal(new Set(q.opts).size,4,`${level}/${category}/${part}: unique choices`);
    assert.ok(Number.isInteger(q.ans)&&q.ans>=0&&q.ans<4);
    assert.ok(q.exp.trim());
    count++;
   }
  }
 }
}
const expected = {'拾う':'拾い','迎える':'迎え','遅れる':'遅れ','急ぐ':'急いで'};
for (const [lemma,form] of Object.entries(expected)) {
 const entry=context.vocabulary.n4.find(e=>e[0]===lemma);
 assert.equal(entry[4],form,`Inflection for ${lemma}`);
}
const pickup=context.inspect('n4','vocabulary',1)[5];
assert.equal(pickup.opts[pickup.ans],'拾い');
assert.match(pickup.exp,/拾いました/);
console.log(`Quiz audit passed: ${count} generated questions across 90 sets; four inflection regressions.`);
