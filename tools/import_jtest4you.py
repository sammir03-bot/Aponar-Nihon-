"""Import licensed JTest4You exercises with explicit answer-key validation.

Run only with republication rights. The site owner confirmed those rights on
2026-10-05. Source pages are cached outside the repository; no live scraping is
performed by the application or its normal build.
Requires beautifulsoup4. Uses only Python stdlib for HTTP.
"""
from __future__ import annotations
import concurrent.futures
import hashlib
import html
import json
import re
import time
import urllib.request
from pathlib import Path
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup, Tag, NavigableString

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/tmp/aponar-jtest-cache')
CACHE.mkdir(exist_ok=True)
ORIGIN = 'https://japanesetest4you.com'
ALLOWED_TAGS = {'p', 'br', 'b', 'strong', 'u', 'em', 'i', 'span', 'ruby', 'rt', 'table', 'tbody', 'tr', 'td', 'th', 'img', 'div', 'ul', 'li', 'ol', 'sup', 'sub'}

def fetch(url):
    if urlparse(url).hostname != 'japanesetest4you.com':
        raise ValueError('Unexpected source host')
    dest = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.html')
    if dest.exists():
        return dest.read_text()
    for retry in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'AponarNihon licensed content import'})
            with urllib.request.urlopen(req, timeout=45) as response:
                text = response.read().decode('utf-8')
            dest.write_text(text)
            return text
        except Exception:
            if retry == 2: raise
            time.sleep(1 + retry)

def clean(fragment):
    s = BeautifulSoup(str(fragment), 'html.parser')
    for el in list(s.find_all(True)):
        if el.name in {'script', 'style', 'iframe', 'audio', 'input', 'button', 'figure'}:
            if el.name == 'figure': el.unwrap()
            else: el.decompose()
            continue
        if el.name not in ALLOWED_TAGS:
            el.unwrap(); continue
        underline = el.name in {'u'} or 'underline' in el.get('style', '') or 'auto-style1' in el.get('class', [])
        attrs = {}
        if el.name == 'img':
            src = urljoin(ORIGIN, el.get('src', '')).replace('http://', 'https://', 1)
            if urlparse(src).hostname != 'japanesetest4you.com':
                el.decompose(); continue
            attrs = {'src': src, 'alt': el.get('alt', '') or '問題の図', 'loading': 'lazy'}
        if el.name in {'td', 'th'}:
            attrs.update({k: el[k] for k in ['colspan', 'rowspan'] if k in el.attrs and str(el[k]).isdigit()})
        if underline: attrs['style'] = 'text-decoration:underline'
        el.attrs = attrs
    return str(s).strip()

def discover(level, category):
    suffix = 'reading-tests' if (level, category) == ('n5', 'reading') else category + '-test'
    initial = f'{ORIGIN}/category/jlpt-{level}/jlpt-{level}-{suffix}/'
    todo, seen, posts = [initial], set(), set()
    while todo:
        url = todo.pop()
        if url in seen: continue
        seen.add(url)
        soup = BeautifulSoup(fetch(url), 'html.parser')
        for a in soup.find_all('a', href=True):
            href = urljoin(url, a['href']).split('#')[0]
            label = a.get_text(' ', strip=True)
            if (urlparse(href).hostname == 'japanesetest4you.com' and
                    re.fullmatch(rf'JLPT {level.upper()}\s*[–-]\s*{category.title()} Exercise\s*\d+', label)):
                posts.add(href)
            if href.startswith(initial + 'page/') and href not in seen:
                todo.append(href)
    return sorted(posts)

def parse(url, level, category):
    soup = BeautifulSoup(fetch(url), 'html.parser')
    title = soup.title.get_text(' ', strip=True) if soup.title else ''
    if not re.search(rf'JLPT {level.upper()}\s*[–-]\s*{category.title()} Exercise', title):
        raise ValueError('Source level/category title mismatch')
    entry = soup.select_one('.entry')
    if entry is None: raise ValueError('Entry missing')
    fulltext = entry.get_text(' ', strip=True)
    keys = {}
    for m in re.finditer(r'Question\s*(\d+)\s*:\s*([1-4])\b', fulltext):
        num, ans = int(m[1]), int(m[2])-1
        if num in keys and keys[num] != ans: raise ValueError('Conflicting answer keys')
        keys[num] = ans
    if not keys: raise ValueError('No explicit answer key')
    rawblocks = [x for x in entry.children if isinstance(x, Tag)]
    blocks = []
    for block in rawblocks:
        inputs = block.find_all('input', type='radio')
        if inputs and blocks and blocks[-1].find_all('input', type='radio'):
            previous = blocks[-1]
            if {x.get('name') for x in previous.find_all('input', type='radio')} == {x.get('name') for x in inputs}:
                merged = BeautifulSoup('<p>' + previous.decode_contents() + '<br/>' + block.decode_contents() + '</p>', 'html.parser').p
                blocks[-1] = merged
                continue
        blocks.append(block)
    pending, passage, grammar_passage, sentence_context, result, used = [], '', '', '', [], set()
    for block in blocks:
        if 'Answer Key' in block.get_text(): break
        inputs = block.find_all('input', type='radio')
        if not inputs:
            txt = block.get_text(' ', strip=True)
            if re.match(r'Reading passage\s*\d+', txt, re.I):
                pending = []; passage = ''; continue
            if block.name == 'span' and block.get('id', '').startswith('more-'): continue
            if txt.startswith(('つぎの文章', '次の文章')) and not pending: continue
            pending.append(block)
            continue
        names = {x.get('name') for x in inputs}
        if len(names) != 1: raise ValueError('Multiple questions in one block')
        name = next(iter(names)) or ''
        m = re.search(r'(\d+)$', name)
        if not m: raise ValueError('Question number missing')
        num = int(m[1])
        if num not in keys or num in used: raise ValueError('Missing/duplicate answer key')
        options = []
        for inp in inputs:
            pieces = []
            for sib in inp.next_siblings:
                if isinstance(sib, Tag) and (sib.name in {'input', 'br'} or sib.find('input')): break
                pieces.append(str(sib))
            options.append(clean(''.join(pieces)).strip())
        if len(options) not in {3, 4} or any(not x for x in options) or len(set(options)) != len(options): raise ValueError('Invalid options')
        if [str(i+1) for i in range(len(inputs))] != [str(x.get('value')) for x in inputs]:
            raise ValueError('Unexpected option value order')
        if keys[num] >= len(options): raise ValueError('Answer outside options')
        prompt_parts = []
        for child in block.children:
            if isinstance(child, Tag) and (child.name == 'input' or child.find('input')): break
            prompt_parts.append(str(child))
        prompt = clean(''.join(prompt_parts)).strip()
        prompt = re.sub(r'^\s*\d+[.．]\s*', '', prompt)
        prompt = re.sub(r'(<br\s*/?>\s*)+$', '', prompt)
        if category in {'kanji', 'vocabulary'}:
            # A sentence shared by several underlined kanji questions precedes
            # the answer blocks. Keep it with each item, not as a reading group.
            context = ''.join(clean(x) for x in pending if x.name not in {'hr'} and not x.find('audio'))
            if context: sentence_context = context
            if sentence_context: prompt = sentence_context + '<br>' + prompt
        kind = {'kanji': '漢字・表記', 'vocabulary': '語彙', 'reading': '読解', 'listening': '聴解', 'grammar': '文法形式'}[category]
        extra = {}
        if category == 'reading':
            if pending: passage = ''.join(clean(x) for x in pending)
            if not passage: raise ValueError('Reading passage missing')
            if not prompt: prompt = f'問題 {num}：本文の問題に答えてください。'
            extra['passage'] = passage
            passage_text = BeautifulSoup(passage, 'html.parser').get_text(' ', strip=True)
            if '<table' in passage or '<img' in passage or re.search('料金|会費|受付|休館|会場|応募|申込|募集|定員|日時', passage_text):
                extra['readingKind'] = 'information'
            else:
                extra['readingKind'] = 'long' if len(passage_text) >= 600 else 'mid' if len(passage_text) >= 250 else 'short'
        elif category == 'kanji':
            option_texts = [BeautifulSoup(o, 'html.parser').get_text() for o in options]
            kind = '表記' if any(re.search('[一-龯]', o) for o in option_texts) else '漢字読み'
        elif category == 'grammar':
            context = ''.join(clean(x) for x in pending if x.get_text(strip=True) and not x.find('iframe'))
            if context: grammar_passage = context
            if grammar_passage:
                extra['passage'] = grammar_passage
                kind = '文章文法'
            if '★' in prompt or '☆' in prompt:
                kind = '文の組み立て'
        elif category == 'listening':
            sources = []
            for x in pending:
                sources.extend(x.find_all('audio'))
                if x.name == 'audio': sources.append(x)
            audio = sources[-1].get('src') if sources else None
            if not audio and sources:
                source = sources[-1].find('source'); audio = source.get('src') if source else None
            if not audio: raise ValueError('Recorded audio missing')
            audio = urljoin(url, audio).replace('http://', 'https://', 1)
            if urlparse(audio).hostname != 'japanesetest4you.com': raise ValueError('Unexpected audio host')
            extra['audioUrl'] = audio
            images = ''.join(clean(x) for x in pending if x.find('img') or x.name == 'img')
            if images: extra['questionImage'] = images
            prompt = '音声を聞いて、正しい答えを一つ選んでください。'
        effective_category = category
        # JTest4You files some N4 passage-cloze items under Reading. These are
        # genuine source questions, not newly generated substitutions.
        if level == 'n4' and category == 'reading' and re.search('入れ|入る', prompt):
            effective_category = 'grammar'
            kind = '文章文法'
        group = 'listening' if effective_category == 'listening' else ('reading' if effective_category == 'reading' and level == 'n3' else 'language' if level == 'n3' else 'knowledgeReading')
        identity = hashlib.sha256((url + '#' + str(num)).encode()).hexdigest()[:16]
        result.append({'id': 'jtest-' + identity, 'group': group, 'prompt': prompt, 'options': options, 'answer': keys[num], 'kind': kind, 'category': effective_category, 'sourceCategory': category, 'sourceUrl': url, 'sourceQuestion': num, 'fixedOptions': True, 'explanation': f'উৎসের answer key অনুযায়ী সঠিক উত্তর: {keys[num]+1}।', **extra})
        used.add(num); pending = []
    if used != set(keys): raise ValueError(f'Unparsed questions: {set(keys)-used}')
    return result

def main():
    jobs = [(level, cat) for level in ['n5', 'n4', 'n3'] for cat in ['kanji', 'vocabulary', 'grammar', 'reading', 'listening']]
    tasks, errors = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(discover, level, cat): (level, cat) for level, cat in jobs}
        for future in concurrent.futures.as_completed(futures):
            level, cat = futures[future]
            try:
                urls = future.result(); print(level, cat, len(urls), 'pages', flush=True)
                tasks.extend((u, level, cat) for u in urls)
            except Exception as e: errors.append({'category': [level, cat], 'error': str(e)})
    banks = {level: [] for level in ['n5', 'n4', 'n3']}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(parse, *task): task for task in tasks}
        for i, future in enumerate(concurrent.futures.as_completed(futures)):
            url, level, cat = futures[future]
            try: banks[level].extend(future.result())
            except Exception as e: errors.append({'url': url, 'error': str(e)})
            if i % 25 == 0: print('Parsed', i+1, '/', len(tasks), 'pages;', len(errors), 'rejected', flush=True)
    out = ROOT / 'assets/data/jtest4you'
    out.mkdir(parents=True, exist_ok=True)
    for level, qs in banks.items():
        qs.sort(key=lambda q: (q['category'], q['sourceUrl'], q['sourceQuestion']))
        (out / (level + '.json')).write_text(json.dumps({'version': 5, 'level': level, 'source': ORIGIN, 'questions': qs}, ensure_ascii=False, separators=(',', ':')) + '\n')
        from collections import Counter
        print(level, len(qs), dict(Counter(q['category'] for q in qs)), dict(Counter(q['kind'] for q in qs)), flush=True)
    (CACHE / 'rejections.json').write_text(json.dumps(errors, ensure_ascii=False, indent=2))
    print('Rejections:', CACHE / 'rejections.json', flush=True)

if __name__ == '__main__': main()
