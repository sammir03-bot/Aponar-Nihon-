#!/usr/bin/env python3
"""Build committed furigana and Bengali pronunciation; deploy has no Python dependency.

Run export-study-bank.mjs first. Install Janome 0.5.0 in a local environment.
STUDY_JANOME_PATH optionally points to an isolated pip --target directory.
"""
from __future__ import annotations
import html, json, os, re, sys
from pathlib import Path
if os.environ.get('STUDY_JANOME_PATH'):
    sys.path.insert(0, os.environ['STUDY_JANOME_PATH'])
from janome.tokenizer import Tokenizer
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/data/study'
OUT.mkdir(parents=True, exist_ok=True)
tokenizer = Tokenizer()
KANJI = re.compile(r'[一-龯々]')
unknown = set()
UNKNOWN_READINGS={'伺':'うかが','倒':'たお','及':'およ','吸':'す','圧':'あつ','忘':'わす','思':'おも','悲':'かな','推':'お','描':'えが','査':'さ','殉':'じゅん','汽':'き','沈':'しず','泳':'およ','混':'こ','渇':'かわ','突':'つ','簡':'かん','絡':'から','維':'い','習':'なら','聞':'き','致':'いた','認':'みと','誘':'さそ','読':'よ','貨':'か','較':'かく','迭':'てつ','違':'ちが','阻':'はば','隔':'へだ'}
UNKNOWN_READINGS['曜大工']='ようだいく'
OVERRIDES = {'日本':'にほん','日本語':'にほんご','何歳':'なんさい','何人':'なんにん','何時':'なんじ','何日':'なんにち','何月':'なんがつ','何分':'なんぷん','今日':'きょう','明日':'あした','昨日':'きのう','一人':'ひとり','二人':'ふたり','一日':'いちにち','一つ':'ひとつ','二つ':'ふたつ','三つ':'みっつ','四つ':'よっつ','五つ':'いつつ','六つ':'むっつ','七つ':'ななつ','八つ':'やっつ','九つ':'ここのつ','四時':'よじ','七時':'しちじ','九時':'くじ','一分':'いっぷん','三分':'さんぷん','四分':'よんぷん','六分':'ろっぷん','八分':'はっぷん','十分':'じゅっぷん','二十八':'にじゅうはち','玄野武宏':'くろのたけひろ','四国':'しこく','小林':'こばやし','山田':'やまだ','田中':'たなか','佐藤':'さとう','鈴木':'すずき','中村':'なかむら','高橋':'たかはし','吉田':'よしだ','伊藤':'いとう','加藤':'かとう','山本':'やまもと','出勤':'しゅっきん','経費支弁':'けいひしべん','支弁':'しべん','在留':'ざいりゅう','資格外':'しかくがい','身につけ':'みにつけ','熱い':'あつい','出身':'しゅっしん','品出し':'しなだし','何':'なに'}
OVERRIDES.update({'結構':'けっこう','月よう日':'げつようび','火よう日':'かようび','水よう日':'すいようび','木よう日':'もくようび','金よう日':'きんようび','土よう日':'どようび','日よう日':'にちようび','二日':'ふつか','三日':'みっか','四日':'よっか','五日':'いつか','六日':'むいか','七日':'なのか','八日':'ようか','九日':'ここのか','十日':'とおか','十四日':'じゅうよっか','二十日':'はつか','二十四日':'にじゅうよっか'})
PATTERN = re.compile('|'.join(re.escape(k) for k in sorted(OVERRIDES,key=len,reverse=True)))
def hira(text):
    return ''.join(chr(ord(c)-0x60) if 'ァ' <= c <= 'ヶ' else c for c in text)
def tokens(text):
    # Protect contextual and administrative readings before morphology.
    cursor=0
    for m in PATTERN.finditer(text):
        yield from morph(text[cursor:m.start()])
        yield m.group(),OVERRIDES[m.group()]
        cursor=m.end()
    yield from morph(text[cursor:])
def morph(text):
    for t in tokenizer.tokenize(text):
        reading=hira(t.reading) if t.reading != '*' else t.surface
        if t.part_of_speech.startswith('助詞'):
            reading={'は':'わ','へ':'え','を':'お'}.get(t.surface,reading)
        if KANJI.search(t.surface) and KANJI.search(reading):
            reading=UNKNOWN_READINGS.get(t.surface,reading)
            if KANJI.search(reading): unknown.add(t.surface)
        yield t.surface,reading
def ruby(text):
    return ''.join(f'<ruby>{html.escape(s)}<rt>{html.escape(r)}</rt></ruby>' if KANJI.search(s) and not KANJI.search(r) else html.escape(s) for s,r in tokens(text))
def html_ruby(text):
    # Existing source HTML only uses a small set of formatting tags and images.
    parts=re.split(r'(<[^>]+>)',text or '')
    out=[]; inside_rt=0; inside_ruby=0
    for part in parts:
        if part.startswith('<'):
            if re.match(r'<ruby\b',part): inside_ruby+=1
            if re.match(r'</ruby',part): inside_ruby=max(0,inside_ruby-1)
            if re.match(r'<rt\b',part): inside_rt+=1
            if re.match(r'</rt',part): inside_rt=max(0,inside_rt-1)
            out.append(part)
        else: out.append(part if inside_rt or inside_ruby else ruby(html.unescape(part)))
    return ''.join(out)
BN = dict(zip(list('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ'),['আ','ই','উ','এ','ও','কা','কি','কু','কে','কো','সা','শি','সু','সে','সো','তা','চি','ৎসু','তে','তো','না','নি','নু','নে','নো','হা','হি','ফু','হে','হো','মা','মি','মু','মে','মো','ইয়া','ইয়ু','ইয়ো','রা','রি','রু','রে','রো','ওয়া','ও','ন','গা','গি','গু','গে','গো','যা','জি','যু','যে','যো','দা','জি','যু','দে','দো','বা','বি','বু','বে','বো','পা','পি','পু','পে','পো']))
DIGRAPH={}
for base,prefix in [('き','ক'),('ぎ','গ'),('し','শ'),('じ','জ'),('ち','চ'),('に','ন'),('ひ','হ'),('び','ব'),('ぴ','প'),('み','ম'),('り','র')]:
    for tail,v in [('ゃ','্যা'),('ゅ','্যু'),('ょ','্যো')]: DIGRAPH[base+tail]=prefix+v
DIGRAPH.update({'しゃ':'শা','しゅ':'শু','しょ':'শো','ちゃ':'চা','ちゅ':'চু','ちょ':'চো','じゃ':'জা','じゅ':'জু','じょ':'জো','てぃ':'তি','でぃ':'দি','ふぁ':'ফা','ふぃ':'ফি','ふぇ':'ফে','ふぉ':'ফো','うぃ':'উই','うぇ':'ওয়ে','うぉ':'ও','しぇ':'শে','ちぇ':'চে','じぇ':'জে'})
def bn_kana(text):
    text=hira(text);out='';i=0
    while i<len(text):
        pair=text[i:i+2];c=text[i]
        if pair in DIGRAPH: out+=DIGRAPH[pair];i+=2;continue
        if c=='っ':
            nxt=DIGRAPH.get(text[i+1:i+3],BN.get(text[i+1:i+2],''));out+=(nxt[0]+'্') if nxt else '';i+=1;continue
        if c=='ー': out+='';i+=1;continue
        out+=BN.get(c,{'ぁ':'আ','ぃ':'ই','ぅ':'উ','ぇ':'এ','ぉ':'ও','。':'।','、':',','？':'?'}.get(c,c));i+=1
    return out
def pronunciation(text):
    # Combine verb endings for readable word groups; particles stay separate.
    units=[]
    for s,r in tokens(text):
        b=bn_kana(r)
        if units and (s in ('ます','ました','ません','です','でした','ない','たい','て','た','で','れる','られる','ください') or re.fullmatch('[。、「」！？!?]',s)):
            units[-1]+=b
        else: units.append(b)
    return ' '.join(units).replace('【 ','【').replace(' 】','】')
def write(path,data): path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
for track in ['parttime','school','embassy']:
    rows=[]
    for line in (ROOT/f'tools/content/interview-{track}.tsv').read_text().splitlines():
        if not line or line.startswith('#'): continue
        topic,q,q_bn,a,a_bn,note=line.split('|')
        rows.append({'id':f'{track}-{len(rows)+1:03}','topic':topic,'qJa':q,'qHtml':ruby(q),'qBn':q_bn,'qPronBn':pronunciation(q),'aJa':a,'aHtml':ruby(a),'aBn':a_bn,'aPronBn':pronunciation(a),'noteBn':note,'noteHtml':ruby(note)})
    write(OUT/f'interview-{track}.json',{'version':1,'track':track,'questions':rows})
    print(track,len(rows))
IMAGE_OVERRIDES={
 'jtest-5ec5a405c3cc5477':'2005_03_listen_quiz1.gif','jtest-f4e2aad5b8744dca':'2005_03_listen_quiz3.gif','jtest-b8e887e282cefb96':'2005_03_listen_quiz4.gif','jtest-f0e5f5345230c8cb':'2005_03_listen_quiz5.gif','jtest-bf9adb617ccf4448':'2010_07_listen_quiz1.png',
 'jtest-53ad5eb8a959fa02':'2005_03_listen_quiz6.gif','jtest-e937b790d80ab545':'2005_03_listen_quiz8.gif','jtest-5f41ea60994ac130':'2005_03_listen_quiz9.gif','jtest-df255b61c2560eaa':'2005_03_listen_quiz10.gif',
}
for level in ['n5','n4','n3']:
    file=OUT/f'questions-{level}.json'; data=json.loads(file.read_text())
    for q in data['questions']:
        if q['id']=='jtest-a1746a9cf30f25cb':
            q['passage']='<p>A. コーヒー　300円<br>B. こうちゃ　300円<br>C. ケーキ　400円<br>D. アイスクリーム　300円<br>E. カレーライス　700円<br>F. ピザ　1300円</p>'
        for field in ['prompt','passage']:
            if q.get(field): q[field+'Html']=html_ruby(q[field])
        # Kanji spelling distractors deliberately contain invalid spellings.
        q['optionsHtml']=[x if q['category']=='kanji' else html_ruby(x) for x in q['options']]
        if q['id'] in IMAGE_OVERRIDES:
            q['questionImage']=f'<img src="https://japanesetest4you.com/image/{IMAGE_OVERRIDES[q["id"]]}" alt="উৎসের উত্তর বাছাইয়ের ছবি" referrerpolicy="no-referrer" loading="lazy">'
        if q.get('audioText') or q.get('transcriptJa'):
            text=q.get('audioText') or q['transcriptJa']+ ('\nবাংলা অনুবাদ:\n'+q['transcriptBn'] if q.get('transcriptBn') else '')
            ja,sep,bn=text.partition('বাংলা অনুবাদ:')
            ja=re.sub(r'(?<=[ぁ-んァ-ヶ一-龯])\s+(?=[ぁ-んァ-ヶ一-龯])','',ja)
            q['transcriptJa']=ja.strip();q['transcriptHtml']=ruby(ja.strip());q['transcriptBn']=bn.strip() if sep else ''
        q.pop('audioText',None)
    write(file,data);print(level,len(data['questions']))
cards=json.loads((OUT/'flashcards.json').read_text())
for c in cards:
    c['words']=[{'ja':ruby(w[0]),'reading':w[1],'bn':w[2]} for w in c['w']]
    c['examples']=[{'ja':ruby(e[0]),'reading':e[1],'bn':e[2]} for e in c['e']]
write(OUT/'flashcards.json',cards)
write(ROOT/'tools/content/study-data-audit.json',{'version':1,'interviewQuestions':{'parttime':125,'school':93,'embassy':87},'revisionQuestions':2540,'listeningQuestions':800,'sourceRecordings':208,'originalRecordings':592,'unresolvedReadings':sorted(unknown)})
print('Unresolved readings:',len(unknown),', '.join(sorted(unknown)[:70]))
