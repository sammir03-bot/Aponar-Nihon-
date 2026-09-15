#!/usr/bin/env python3
"""Check the original QUARTET companion and its additive site integration."""
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

from compare_visible_content import preserves_visible_text

ROOT = Path(__file__).resolve().parents[1]
course = json.loads((ROOT / 'assets/data/n3-quartet.json').read_text())
lessons = course['lessons']
assert len(course['chapters']) == 6 and len(lessons) == 55
assert len({lesson['id'] for lesson in lessons}) == 55
assert len({lesson['quiz']['id'] for lesson in lessons}) == 55
assert [sum(lesson['chapter'] == n for lesson in lessons) for n in range(1, 7)] == [9, 9, 10, 9, 9, 9]
assert sum(len(lesson['examples']) for lesson in lessons) == 110
reading = re.compile(r'([\u3400-\u9fff々〆ヵヶ][\u3400-\u9fff々〆ヵヶぁ-んァ-ンー]*)\[([ぁ-んァ-ンー]+)\]')


def check_readings(value):
    if isinstance(value, str):
        assert not re.search(r'[\u3400-\u9fff]', reading.sub('', value)), value
    elif isinstance(value, list):
        for item in value:
            check_readings(item)
    elif isinstance(value, dict):
        for item in value.values():
            check_readings(item)


check_readings(lessons)
check_readings(course['form_guide'])
for lesson in lessons:
    quiz = lesson['quiz']
    assert 0 <= quiz['answer_index'] < len(quiz['options'])
    assert len(quiz['options']) == len(set(quiz['options']))
for name in ['n3.html', 'n3-grammar.html', 'n3-quartet-ebook.html']:
    assert 'href="/n3-quartet-grammar.html"' in (ROOT / name).read_text(), name

# The content guard permits additions while rejecting changed or lost lessons.
base = '<h1>Grammar</h1><p>First lesson</p><p>Second lesson</p>'
assert preserves_visible_text(base, '<aside>New course</aside>' + base)
assert preserves_visible_text(base, base.replace('<p>Second', '<a>QUARTET</a><p>Second'))
assert not preserves_visible_text(base, base.replace('First lesson', 'Changed lesson'))
assert not preserves_visible_text(base, base.replace('<p>First lesson</p>', ''))
assert not preserves_visible_text(base, '<h1>Grammar</h1><p>Second lesson</p><p>First lesson</p>')
assert not preserves_visible_text('<p>A</p><p>A</p>', '<p>A</p>')


class StudyGuideAudit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.classes = Counter()
        self.ids = set()
        self.anchors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.classes.update(attrs.get('class', '').split())
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, attrs['id']
            self.ids.add(attrs['id'])
        if attrs.get('href', '').startswith('#'):
            self.anchors.append(attrs['href'][1:])
        if tag not in {'br', 'hr', 'img', 'input', 'link', 'meta', 'wbr'}:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.stack:
            self.stack = self.stack[:len(self.stack) - 1 - self.stack[::-1].index(tag)]

    def handle_data(self, value):
        if not any(tag in self.stack for tag in {'ruby', 'script', 'style'}):
            assert not re.search(r'[\u3400-\u9fff]', value), 'Missing furigana: ' + value


guide = StudyGuideAudit()
guide.feed((ROOT / 'n3-quartet-study-guide.html').read_text())
for name, count in {'study-chapter': 8, 'lesson': 55, 'example': 110,
                    'sentence': 51, 'sentence-note': 24, 'dialogue-meaning': 27}.items():
    assert guide.classes[name] == count, (name, guide.classes[name])
assert set(guide.anchors) <= guide.ids, set(guide.anchors) - guide.ids
for name in ['n3.html', 'n3-grammar.html', 'n3-quartet-grammar.html']:
    assert 'href="/n3-quartet-study-guide.html"' in (ROOT / name).read_text(), name
print('Study guide passed: 6 chapters, 24 reading explanations, 27 writing sentences, 27 dialogue translations, complete furigana and navigation.')
print('QUARTET passed: 6 chapters, 55 lessons, 110 examples, 55 quizzes, furigana and source preservation.')
