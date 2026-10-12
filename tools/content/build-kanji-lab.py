#!/usr/bin/env python3
"""Build the committed companion course; no textbook sentences are reproduced.

Requires beautifulsoup4 for one-time extraction. Arguments point to independently
downloaded KANJIDIC2 XML and a KanjiVG checkout. Production uses committed JSON.
"""
import argparse
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'tools/content/kanji-lab'
OUT = ROOT / 'assets/data/kanji-lab'


def dump(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--kanjidic', required=True, type=Path)
    parser.add_argument('--kanjivg', required=True, type=Path)
    args = parser.parse_args()
    order = json.loads((SOURCE / 'minna-order.json').read_text())
    gloss = {}
    for line in (SOURCE / 'meanings.tsv').read_text().splitlines():
        if line and not line.startswith('#'):
            k, bn = line.split('|', 1)
            gloss[k] = bn
    memory = json.loads((SOURCE / 'memory.json').read_text())
    levels = json.loads((SOURCE / 'jlpt-levels.json').read_text())
    records, words = {}, []

    def add_word(ja, reading, bn, priority=10):
        ja, reading, bn = ja.strip(), reading.strip(), bn.strip()
        if not ja or not reading or not bn or not re.search('[一-鿿]', ja):
            return
        # A spelling alternative is not a single pronounceable target.
        if any(c in ja for c in ['、', '［', '〜', '～', '…', '／', '・']):
            return
        words.append({'ja': ja, 'reading': reading, 'bn': bn, 'priority': priority})

    for level in ['n5', 'n4']:
        text = (ROOT / 'archive' / (level + '-kanji-pre-course-20261012.html')).read_text()
        match = re.search(r'const DATA\s*=\s*', text)
        data = json.JSONDecoder().raw_decode(text[match.end():])[0]
        for row in data:
            if len(row['kanji']) == 1:
                records.setdefault(row['kanji'], {'k': row['kanji'], 'bn': row['bn'], 'level': level, 'legacy': []})
                records[row['kanji']]['legacy'].append([level, str(row['no'])])
            for example in row['six_examples']:
                if example['type'] != 'word':
                    continue
                parsed = BeautifulSoup(example['html'], 'html.parser')
                ruby, rt = parsed.find('ruby'), parsed.find('rt')
                if ruby and rt:
                    add_word(str(ruby.contents[0]), rt.get_text(), parsed.get_text().split('=', 1)[-1], 4)

    parsed = BeautifulSoup((ROOT / 'n3-kanji.html').read_text(), 'html.parser')
    for cluster in parsed.select('.kanji-cluster'):
        k = cluster.select_one('.glyph-box strong').get_text(strip=True)
        if k not in records:
            records[k] = {'k': k, 'bn': gloss[k], 'level': 'n3', 'legacy': []}
        for word in cluster.select('.word-row'):
            ruby = word.select_one('.word-jp ruby')
            if ruby:
                add_word(str(ruby.contents[0]), ruby.select_one('rt').get_text(), word.select_one('.word-bn').get_text(), 5)

    for lesson in range(26, 51):
        parsed = BeautifulSoup((ROOT / f'n4-vocab-lesson-{lesson:02}-real.html').read_text(), 'html.parser')
        for word in parsed.select('[data-japanese]'):
            add_word(word['data-japanese'], word['data-reading'], word['data-meaning'], 8)

    for line in (SOURCE / 'words.tsv').read_text().splitlines():
        if line and not line.startswith('#'):
            add_word(*line.split('|'), priority=0)

    for row in order:
        if row['k'] not in records:
            records[row['k']] = {'k': row['k'], 'bn': gloss[row['k']], 'level': '', 'legacy': []}
        records[row['k']]['book'] = row['book']
        records[row['k']]['unit'] = row['unit']
        records[row['k']]['bookId'] = row['id']

    dictionary = {c.findtext('literal'): c for c in ET.parse(args.kanjidic).getroot().findall('character')}
    strokes = {}
    for k, row in records.items():
        entry = dictionary[k]
        row['on'] = [r.text for r in entry.findall('.//reading') if r.get('r_type') == 'ja_on']
        row['kun'] = [r.text for r in entry.findall('.//reading') if r.get('r_type') == 'ja_kun']
        row['bn'] = gloss.get(k, row['bn'])
        row['book'] = row.get('book', 0)
        row['level'] = 'n' + str(levels.get(k, 1))
        row['memory'] = memory.get(k, '')
        seen, selected = set(), []
        for word in sorted(words, key=lambda w: (w['priority'], len(w['ja']))):
            if k in word['ja'] and (word['ja'], word['reading']) not in seen:
                seen.add((word['ja'], word['reading']))
                selected.append({x: word[x] for x in ['ja', 'reading', 'bn']})
        level = levels.get(k, 1)
        row['words'] = [w for w in selected if all(levels.get(c, 0) >= level for c in w['ja'] if '\u4e00' <= c <= '\u9fff')][:4]
        if level in (5, 4) and any(levels.get(c, 0) < level for c in row['memory'] if '\u4e00' <= c <= '\u9fff'):
            row['memory'] = ''
        svg = ET.parse(args.kanjivg / 'kanji' / f'{ord(k):05x}.svg').getroot()
        paths = [p.get('d') for p in svg.findall('.//{http://www.w3.org/2000/svg}path')]
        parts = []
        for group in svg.findall('.//{http://www.w3.org/2000/svg}g'):
            attrs = {a.split('}')[-1]: b for a, b in group.attrib.items()}
            part = attrs.get('element')
            if part and part != k and part not in parts:
                parts.append(part)
        row['parts'] = [p for p in parts if p not in levels or levels[p] >= level][:6]
        row['strokeCount'] = len(paths)
        strokes[k] = paths

    missing = [k for k, row in records.items() if row['level'] in ('n5', 'n4') and not row['words']]
    assert not missing, 'Missing contextual words: ' + ''.join(missing)

    lessons = []
    titles1 = ['দিন ও প্রকৃতি', 'সংখ্যা ও টাকা', 'মানুষ ও পরিচয়', 'সময় ও দৈনন্দিন জীবন', 'স্কুল ও যাতায়াত', 'বর্ণনা ও রং', 'পরিবার ও খাবার', 'দিক ও অবস্থান', 'দৈনন্দিন কাজ', 'ভাষা ও বিনোদন', 'শেখা ও ভ্রমণ', 'চলাফেরা ও কাজ', 'বিপরীত অর্থ', 'কাজ ও পরিচিতি', 'দিক, শরীর ও রান্না', 'ভাবনা ও ভাষা', 'বাসস্থান ও সঙ্গীত', 'ঋতু ও স্বাস্থ্য', 'পরিবার', 'ঘর ও চিন্তা']
    for level in ['n5', 'n4']:
        for book in [1, 2]:
            for unit in sorted({r['unit'] for r in order if r['book'] == book}):
                chars = [r['k'] for r in order if r['book'] == book and r['unit'] == unit and records[r['k']]['level'] == level]
                if not chars:
                    continue
                label = titles1[unit - 1] if book == 1 else ('আগের বইয়ের প্রস্তুতি' if unit < 26 else 'শব্দ দিয়ে ব্যবহার শিখুন')
                lessons.append({'id': f'{level}-minna{book}-{unit}', 'level': level, 'track': 'minna', 'book': book, 'unit': unit, 'title': label, 'kanji': chars})
    extra = [r['k'] for r in records.values() if not r['book']]
    for level in ['n5', 'n4']:
        more = [k for k in extra if records[k]['level'] == level]
        for i in range(0, len(more), 8):
            lessons.append({'id': f'{level}-extra-{i//8+1}', 'level': level, 'track': 'extra', 'book': 0, 'unit': i//8+1, 'title': 'বইয়ের পরে আরও কাঞ্জি', 'kanji': more[i:i+8]})

    examples = {}
    for card in json.loads((ROOT / 'assets/data/study/flashcards.json').read_text()):
        if card['k'] in records:
            examples[card['k']] = [{'ja': e[0], 'reading': e[1], 'bn': e[2]} for e in card['e']]
    for k, row in records.items():
        lv = levels.get(k, 1)
        row['examples'] = [e for e in examples.get(k, []) if all(levels.get(c, 0) >= lv for c in e['ja'] if '\u4e00' <= c <= '\u9fff')]

    OUT.mkdir(parents=True, exist_ok=True)
    tracks = [{'id': level, 'name': level.upper() + ' কাঞ্জি', 'count': sum(r['level'] == level for r in records.values())} for level in ['n5', 'n4']]
    data = {'version': '20261012.2', 'levels': tracks, 'lessons': lessons, 'kanji': list(records.values()), 'levelMap': levels}
    dump(OUT / 'course.json', data)
    migrations = [{key: row[key] for key in ['k', 'level', 'legacy']} for row in records.values() if row['legacy']]
    for level in ['n5', 'n4']:
        selected = [r for r in records.values() if r['level'] == level]
        dump(OUT / (level + '.json'), {**data, 'kanji': selected, 'lessons': [l for l in lessons if l['level'] == level], 'migrations': migrations})
        dump(OUT / ('strokes-' + level + '.json'), {'license': 'CC BY-SA 3.0', 'credit': 'KanjiVG, Ulrich Apel', 'source': 'https://kanjivg.tagaini.net/', 'strokes': {r['k']: strokes[r['k']] for r in selected}})
    dump(OUT / 'strokes.json', {'license': 'CC BY-SA 3.0', 'credit': 'KanjiVG, Ulrich Apel', 'source': 'https://kanjivg.tagaini.net/', 'strokes': strokes})
    print(f'{len(records)} unique kanji; {len(lessons)} lessons; {len(extra)} extra; {sum(len(r["words"]) for r in records.values())} contextual word references')


if __name__ == '__main__':
    main()
