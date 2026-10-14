#!/usr/bin/env python3
"""Guard the revised book's syllabus and its generated public reading pages."""
import argparse
import re
from html.parser import HTMLParser
from pathlib import Path
from content.shin_bunka import EDITION, LESSONS
from build_shin_bunka import build, path, plain

ROOT = Path(__file__).resolve().parents[1]
# Independent syllabus counts: Kariya 2016 appendix 2, printed pp.24–26.
# Lesson 25 includes its 自動詞・他動詞 introduction, followed by 文型1.
BOOK_COUNTS = {19: 6, 20: 8, 21: 6, 22: 7, 23: 4, 24: 5, 25: 2, 26: 4,
               27: 5, 28: 5, 29: 5, 30: 4, 31: 5, 32: 3, 33: 3, 34: 3}
KEY_PLACEMENTS = {
    (19, 2): 'する', (20, 3): 'ために', (20, 7): 'なくてはいけない',
    (22, 4): 'あげる', (22, 5): 'もらう', (23, 1): 'てきた',
    (27, 3): 'るところ', (28, 3): 'てもらう', (29, 5): 'ようにしている',
    (30, 2): 'お〜ください', (31, 5): '受け身', (32, 3): 'ているところ',
    (33, 2): '使役形', (34, 1): '使役受け身', (34, 2): 'なら', (34, 3): 'てある',
}


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids = []
        self.patterns = []
        self.targets = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if 'id' in values:
            self.ids.append(values['id'])
        if 'data-pattern-id' in values:
            self.patterns.append(values['data-pattern-id'])
            assert 'hidden' not in values, 'Reading must work without JavaScript'
        if 'data-sb-topic' in values:
            self.targets.append(values['href'][1:])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', default='.')
    args = parser.parse_args()
    site = ROOT / args.site
    build(check=True)
    assert [l['number'] for l in LESSONS] == list(BOOK_COUNTS)
    by_number = {l['number']: l for l in LESSONS}
    identifiers = []
    for lesson in LESSONS:
        n = lesson['number']
        core = [p for p in lesson['patterns'] if p['kind'] != 'text']
        assert len(core) == BOOK_COUNTS[n], (n, 'syllabus count')
        if n != 25:
            assert [p['book_ref'] for p in core] == [f'文型 {i}' for i in range(1, len(core) + 1)]
        for pattern in lesson['patterns']:
            identifiers.append(pattern['id'])
            for field in ('form', 'explanation', 'note', 'example', 'translation', 'practice', 'answer'):
                text = pattern[field]
                assert text.strip(), (n, field)
                assert '[' not in plain(text) and ']' not in plain(text), (n, field, 'broken ruby')
            assert re.search('[\u0980-\u09ff]', pattern['explanation'])
            assert re.search('[\u0980-\u09ff]', pattern['translation'])
        html = (site / path(n)).read_text()
        page = Page(html)
        assert f'data-sb-edition="{EDITION}"' in html
        assert len(page.ids) == len(set(page.ids)), (n, 'duplicate IDs')
        assert page.patterns == [p['id'] for p in lesson['patterns']]
        assert all(target in page.ids for target in page.targets)
        assert 'n4-shin-bunka-lesson-35.html' not in html, 'No revised lesson 35'
    assert len(identifiers) == len(set(identifiers)) == 80
    for (n, index), expected in KEY_PLACEMENTS.items():
        assert expected in by_number[n]['patterns'][index - 1]['title'], (n, index, expected)
    assert by_number[34]['ja'] == 'お祝い'
    assert by_number[34]['pages'] == '162–175'
    hub = (site / 'n4-shin-bunka-grammar.html').read_text()
    assert hub.count('data-sb-card=') == 16
    assert 'max="16"' in hub
    assert not re.search(r'data-sb-card="(?:35|36)"', hub)
    assert 'はず' not in ''.join(p['title'] for l in LESSONS for p in l['patterns'])
    print('Bunka revised audit passed: 16 chapters, 80 topics, publisher order, page ranges, unique IDs, ruby, no-JS reading and valid topic links.')


if __name__ == '__main__':
    main()
