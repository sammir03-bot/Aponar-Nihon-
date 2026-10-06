// Export the exact reviewed questions used by the 30 published mock tests.
import fs from 'node:fs';
import vm from 'node:vm';
const context = {window:{}, fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('.'+url.split('?')[0],'utf8'))})};
vm.createContext(context);
vm.runInContext(fs.readFileSync('jlpt-level-generators.js','utf8'),context);
fs.mkdirSync('assets/data/study',{recursive:true});
for(const level of ['n5','n4','n3']) {
  await context.window.JLPT_LOAD_BANK(level);
  const questions=[];
  for(let set=1;set<=10;set++){
    const data=context.window.JLPT_FULL_GENERATOR(level,set);
    questions.push(...data.vocab,...data.grammarReading,...data.listening);
  }
  fs.writeFileSync(`assets/data/study/questions-${level}.json`,JSON.stringify({version:1,level,questions}));
}
const old=fs.readFileSync('assets/js/jlpt-revision.js','utf8');
const start=old.indexOf('const K=')+'const K='.length;
const end=old.indexOf('];',start)+1;
const cards=vm.runInNewContext('('+old.slice(start,end)+')');
fs.writeFileSync('assets/data/study/flashcards.json',JSON.stringify(cards));
