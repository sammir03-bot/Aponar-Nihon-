"""Apply the checked-in, question-specific Bengali source review files."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P = ROOT / 'assets/data/jtest4you/bn-review.json'
data = json.loads(P.read_text())
index = {}
for level in ('n5', 'n4', 'n3'):
    bank = json.loads((ROOT / f'assets/data/jtest4you/{level}.json').read_text())
    for q in bank['questions']:
        index[q['id'][6:]] = (level, q)
count = 0
for path in sorted((ROOT / 'tools/content').glob('mock-source-*-v9.tsv')):
    for line in path.read_text().splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        key, answer, explanation = line.split('|', 2)
        level, question = index[key]
        assert key and answer and len(explanation) >= 40, key
        assert question['id'] not in data['excludedQuestionIds'][level], key
        data['levels'][level][question['id']] = {'answerBn': answer, 'explanationBn': explanation}
        count += 1
data['bankVersion'] = 9
P.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
print('Applied source reviews:', count)
