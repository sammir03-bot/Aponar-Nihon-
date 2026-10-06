"""Compile the checked-in original authors into small browser question banks."""
import argparse,hashlib,importlib.util,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def module(name,file):
    spec=importlib.util.spec_from_file_location(name,ROOT/'tools/content'/file)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result);return result
written=module('written','author-original-written.py')
listening=module('listening','author-original-listening.py')
check=argparse.ArgumentParser();check.add_argument('--check',action='store_true');args=check.parse_args()
p=ROOT/'assets/data/jtest4you/bn-review.json';reviews=json.loads(p.read_text())
audio_audit=json.loads((ROOT/'tools/content/mock-original-audio-audit.json').read_text())
recordings={record['id']:record for record in audio_audit['recordings']}
speed={'n5':.92,'n4':.96,'n3':1.0}
for level in ['n5','n4','n3']:
    questions=list(written.BANK[level])
    for test in range(listening.START[level],11):
        qs=listening.author(level,test)
        if level=='n4':qs=listening.enrich_n4(qs)
        elif level=='n3':qs=listening.enrich_n3(qs,test)
        questions.extend(qs)
    bank=[]
    for original in questions:
        q=dict(original);review=q.pop('review');segments=q.pop('audioSegments',None)
        if segments:
            digest=hashlib.sha256(json.dumps([speed[level],segments],ensure_ascii=False,sort_keys=True).encode()).hexdigest()
            assert recordings[q['id']]['scriptSha256']==digest,('Stale audio script',q['id'])
        assert 'অ'<=next(c for c in review['answerBn'] if '\u0980'<=c<='\u09ff')<='৿'
        assert len(review['explanationBn'])>=40
        reviews['levels'][level][q['id']]=review
        bank.append(q)
    data={'version':9,'level':level,'source':'Aponar Nihon original supplemental mock content','questions':bank}
    output=ROOT/f'assets/data/mock-original/{level}.json'
    content=json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n'
    if args.check:assert output.read_text()==content,output
    else:output.parent.mkdir(parents=True,exist_ok=True);output.write_text(content)
    print(level,len(bank),'compiled original questions')
reviews['bankVersion']=9
content=json.dumps(reviews,ensure_ascii=False,separators=(',',':'))+'\n'
if args.check:assert p.read_text()==content,'Original Bengali reviews are stale'
else:p.write_text(content)
