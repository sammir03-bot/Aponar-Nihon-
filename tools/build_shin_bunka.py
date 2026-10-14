#!/usr/bin/env python3
"""Build the revised Bunka II companion, keeping existing public route names."""
from pathlib import Path
import argparse
import html
import re
from content.shin_bunka import CONJUGATIONS, EDITION, LESSONS, SOURCES
from ensure_release_guards import LEGACY_GUARD

ROOT = Path(__file__).resolve().parents[1]
HUB = 'n4-shin-bunka-grammar.html'
VERSION = '20261014.2'
FIRST, LAST = 19, 34
TITLE_RUBY = {
    19: '[迷子|まいご]', 20: 'もう[進路|しんろ]を[決|き]めましたか。',
    21: 'ホームステイ', 22: 'ワンさんへのプレゼント',
    23: '[電子書籍|でんししょせき]が[増|ふ]えてきました。',
    24: '[映画|えいが]を[見|み]に[行|い]かない？',
    25: '[故障|こしょう]して、[動|うご]かないんです。',
    26: '[引|ひ]っ[越|こ]し', 27: '[進学準備|しんがくじゅんび]',
    28: '[手伝|てつだ]ってくれてありがとう。', 29: 'お[見舞|みま]い',
    30: 'もう[少|すこ]し[召|め]し[上|あ]がりませんか。',
    31: 'お[祭|まつ]り', 32: '[工場見学|こうじょうけんがく]',
    33: '[毎日|まいにち][家|いえ]の[手伝|てつだ]いをさせました。', 34: 'お[祝|いわ]い',
}


def esc(value):
    return html.escape(str(value), quote=True)


def bn(value):
    return str(value).translate(str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯'))


def plain(value):
    return re.sub(r'\[([^]|]+)\|([^]]+)\]', r'\1', value)


def ruby(value):
    return re.sub(r'\[([^]|]+)\|([^]]+)\]', lambda m: f'<ruby>{m[1]}<rp>（</rp><rt>{m[2]}</rt><rp>）</rp></ruby>', esc(value))


def path(n):
    return f'n4-shin-bunka-lesson-{n}.html'


def icon(name):
    paths = {
        'arrow': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
        'back': '<path d="m14 6-6 6 6 6"/>',
        'book': '<path d="M12 6c-3-3-7-3-9-2v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 2Zm0 0v14"/>',
        'search': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    }
    return f'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths[name]}</svg>'


def shell(title, description, body, number=''):
    return f'''<!doctype html>
<html lang="bn" dir="ltr" data-source-language="bn" data-language-preset="bn">
<head>{LEGACY_GUARD}
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f6f7f5"><meta name="description" content="{esc(description)}">
<title>{esc(title)} | আপনার নিহোন</title>
<link rel="icon" href="logo.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&amp;family=Noto+Sans+JP:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/shin-bunka.css?v={VERSION}">
<script defer src="assets/js/shin-bunka.js?v={VERSION}"></script>
</head>
<body class="sb-page" data-sb-lesson="{number}" data-sb-edition="{EDITION}">
<a class="sb-skip" href="#main">মূল পাঠে যান</a>
<header class="sb-header"><div class="sb-wrap sb-header-row">
<a class="sb-brand" href="index.html"><img src="logo.png" width="34" height="34" alt=""><span>আপনার নিহোন<small>BUNKA STUDY ROOM</small></span></a>
<a class="sb-back" href="{'n4.html' if not number else HUB}">{icon('back')}{'N4 কোর্স' if not number else 'সব লেসন'}</a>
</div></header>
<main id="main">{body}</main>
<footer class="sb-wrap sb-footer"><p>আপনার নিহোন · বাংলায় বুঝে জাপানি শিখুন</p><p>文化初級日本語 II · 改訂版-এর সহায়ক পাঠ। বাংলা ব্যাখ্যা, উদাহরণ ও অনুশীলন স্বতন্ত্রভাবে লেখা।</p>
<details class="sb-sources"><summary>বই ও লেসনক্রমের উৎস</summary><p>অধ্যায় ও পৃষ্ঠা প্রকাশকের সূচিপত্র অনুযায়ী। 文型-এর ক্রম সংস্করণটির রচয়িতা প্রতিষ্ঠানের প্রকাশিত পূর্ণ তালিকার সঙ্গে যাচাই করা হয়েছে। 本文-এর সহায়ক বিষয় আলাদা চিহ্নিত।</p>
<a href="{SOURCES['contents']}" target="_blank" rel="noopener noreferrer">প্রকাশকের সূচিপত্র ↗</a><a href="{SOURCES['comparison']}" target="_blank" rel="noopener noreferrer">দুই সংস্করণের তুলনা ↗</a><a href="{SOURCES['syllabus']}" target="_blank" rel="noopener noreferrer">পূর্ণ 文型 তালিকা · পরিশিষ্ট ২ ↗</a></details></footer>
</body></html>'''


def forms_table(n):
    col = {31: 2, 33: 3, 34: 4}[n]
    name = {31: '受身形', 33: '使役形', 34: '使役受身形'}[n]
    rules = {
        31: 'গ্রুপ ১: শেষ উ-ধ্বনি → আ-ধ্বনি＋れる（う → われる）。 গ্রুপ ২: る বাদ＋られる।',
        33: 'গ্রুপ ১: শেষ উ-ধ্বনি → আ-ধ্বনি＋せる（う → わせる）。 গ্রুপ ২: る বাদ＋させる।',
        34: 'প্রথমে 使役形 বানান → শেষের る বাদ দিন → られる যোগ করুন। 食べる → 食べさせる → 食べさせられる।',
    }
    head = '<th scope="col">ছোট রূপ</th>' if n == 34 else ''
    rows = ''.join(f'<tr><th scope="row"><span lang="ja" translate="no">{ruby(r[0])}</span><small>গ্রুপ {r[1]}</small></th><td lang="ja" translate="no">{ruby(r[col])}</td>' + (f'<td>{ruby(r[5])}</td>' if n == 34 else '') + '</tr>' for r in CONJUGATIONS)
    short = '<p class="sb-note">গ্রুপ ১-এর す দিয়ে শেষ হওয়া ক্রিয়া ছোট করবেন না: 話す → 話させられる। গ্রুপ ২ ও ৩-তেও এই ছোট রূপ হয় না।</p>' if n == 34 else ''
    return f'''<details class="sb-forms"><summary>রূপ বদলানোর টেবিল · {name}</summary><div class="sb-forms-body"><p>{esc(rules[n])}</p><div class="sb-table-wrap" role="region" aria-label="{name} রূপ পরিবর্তনের টেবিল" tabindex="0"><table><thead><tr><th scope="col">মূল ক্রিয়া</th><th scope="col">{name}</th>{head}</tr></thead><tbody>{rows}</tbody></table></div>{short}</div></details>'''


def render_pattern(l, p, i):
    extra = ''.join(f'<div class="sb-extra-example"><p class="sb-jp" lang="ja" translate="no">{ruby(ja)}</p><p>{esc(bangla)}</p></div>' for ja, bangla in p['extra_examples'])
    table = forms_table(l['number']) if p['id'] in ('br-31-5', 'br-33-2', 'br-34-1') else ''
    return f'''<section class="sb-pattern" id="grammar-{i}" data-pattern-id="{p['id']}" aria-labelledby="heading-{i}">
<div class="sb-pattern-head"><span class="sb-eyebrow">{esc(p['book_ref'])}</span><span class="sb-topic-label">বিষয় {bn(i)} / {bn(len(l['patterns']))}</span></div>
<h2 id="heading-{i}" tabindex="-1">{esc(p['title'])}</h2>
<div class="sb-form"><h3>গঠন</h3><p lang="ja" translate="no">{esc(p['form'])}</p></div>
<div class="sb-explanation"><h3>বাংলায় বুঝুন</h3><p>{esc(p['explanation'])}</p></div>
<div class="sb-note"><h3>খেয়াল রাখুন</h3><p>{esc(p['note'])}</p></div>
<div class="sb-example"><h3>উদাহরণ পড়ে মিলিয়ে নিন</h3><p class="sb-jp" lang="ja" translate="no">{ruby(p['example'])}</p><p>{esc(p['translation'])}</p>{extra}</div>
{table}<div class="sb-practice"><span class="sb-eyebrow">এবার আপনার পালা</span><h3>জাপানিতে বলুন</h3><p>{esc(p['practice'])}</p><details class="sb-answer"><summary>উত্তর মিলিয়ে দেখুন</summary><div><p class="sb-jp" lang="ja" translate="no">{ruby(p['answer'])}</p><small>একই অর্থে অন্য সঠিক বাক্যও হতে পারে।</small></div></details></div>
</section>'''


def render_lesson(l):
    n = l['number']
    patterns = l['patterns']
    links = ''.join(f'<a href="#grammar-{i}" data-sb-topic="{i}"><span>{bn(i)}</span>{esc(p["title"])}</a>' for i, p in enumerate(patterns, 1))
    prev = f'<a class="sb-page-link" href="{path(n-1)}">← লেসন {bn(n-1)}</a>' if n > FIRST else f'<a class="sb-page-link" href="{HUB}">← লেসন তালিকা</a>'
    nex = f'<a class="sb-page-link" href="{path(n+1)}">লেসন {bn(n+1)} →</a>' if n < LAST else f'<a class="sb-page-link" href="{HUB}">সব লেসন →</a>'
    body = f'''<section class="sb-wrap sb-lesson-intro"><p class="sb-breadcrumb"><a href="{HUB}">Bunka II · 改訂版</a><span>/</span>লেসন {bn(n)}</p>
<div class="sb-lesson-heading"><span class="sb-lesson-number">{n}</span><div><p class="sb-eyebrow">第{n}課 · REVISED EDITION</p><h1 lang="ja" translate="no">{ruby(TITLE_RUBY[n])}</h1><p class="sb-subtitle">{esc(l['title'])}</p></div></div>
<p class="sb-goal">{esc(l['goal'])}</p><div class="sb-meta"><span>বইয়ের পৃষ্ঠা {bn(l['pages'])}</span><span>{bn(len(patterns))}টি বিষয়</span><span>বাংলা + ফুরিগানা</span></div></section>
<div class="sb-reading-tools"><div class="sb-wrap"><span id="sb-active-label">নিয়ম বুঝুন · নিজে বলুন</span><div><button class="sb-tool" id="sb-ruby" type="button" aria-pressed="true" hidden>ফুরিগানা: চালু</button><button class="sb-tool" id="sb-text-size" type="button" aria-pressed="false" hidden aria-label="পাঠের লেখা বড় করুন">অ +</button></div></div></div>
<div class="sb-wrap sb-layout"><aside class="sb-toc" aria-label="এই লেসনের বিষয়"><h2>এই লেসনে</h2><nav aria-label="গ্রামার বিষয় বেছে নিন">{links}</nav></aside><div class="sb-content">
{''.join(render_pattern(l, p, i) for i, p in enumerate(patterns, 1))}
<nav class="sb-pattern-navigation" aria-label="আগের ও পরের বিষয়" hidden><button class="sb-tool" id="sb-topic-prev" type="button">← আগের বিষয়</button><button class="sb-button" id="sb-topic-next" type="button">পরের বিষয় →</button></nav>
<section class="sb-finish"><div><span class="sb-eyebrow">নিজে যাচাই করুন</span><h2>নতুন বাক্য বলতে পারছেন?</h2><p>উদাহরণে নিজের স্কুল বা কাজের জায়গা বসিয়ে বলুন। বুঝে গেলে লেসনটি সম্পন্ন চিহ্নিত করুন।</p></div><button class="sb-button" data-sb-complete="{n}" type="button" aria-pressed="false" hidden>পড়া শেষ চিহ্নিত করুন</button><p class="sb-storage" role="status"></p></section>
<nav class="sb-pagination" aria-label="আগের ও পরের লেসন">{prev}{nex}</nav></div></div>'''
    return shell(f'Bunka II 改訂版 · লেসন {bn(n)}: {l["ja"]}', f'{l["title"]}। 文化初級日本語 II 改訂版 লেসন {n}, পৃষ্ঠা {l["pages"]}। বাংলা ব্যাখ্যা, ফুরিগানা ও অনুশীলন।', body, n)


def render_hub():
    total = sum(len(l['patterns']) for l in LESSONS)
    cards = []
    for l in LESSONS:
        n = l['number']
        search = ' '.join([str(n), l['title'], l['ja'], l['tags']] + [p['title'] + ' ' + p['form'] for p in l['patterns']])
        topics = ' · '.join(p['title'].split(':')[0] for p in l['patterns'][:3])
        cards.append(f'''<a class="sb-lesson-card" href="{path(n)}" data-sb-card="{n}" data-search="{esc(search)}"><span class="sb-card-number">{n}<small>LESSON</small></span><div class="sb-card-copy"><div class="sb-card-top"><span class="sb-card-status">শুরু হয়নি</span><span>পৃষ্ঠা {bn(l['pages'])}</span></div><h3 lang="ja" translate="no">{ruby(TITLE_RUBY[n])}</h3><p class="sb-card-bn">{esc(l['title'])}</p><p class="sb-topics">{esc(topics)}</p><div class="sb-card-bottom"><span>{bn(len(l['patterns']))}টি বিষয়</span><span>পড়ুন {icon('arrow')}</span></div></div></a>''')
    body = f'''<section class="sb-wrap sb-dashboard-head"><div class="sb-dashboard-copy"><p class="sb-eyebrow">বইয়ের সঙ্গে, নিজের গতিতে</p><h1>Bunka II<span>বুঝে পড়ুন। মনে রাখুন।</span></h1><p class="sb-book-edition" lang="ja" translate="no">文化初級日本語 II <b>テキスト 改訂版</b></p><p class="sb-intro">লেসন ১৯–৩৪ · বইয়ের ক্রমে বাংলা নিয়ম, ফুরিগানা ও নিজে বলার অনুশীলন।</p><a class="sb-button" id="sb-resume" href="{path(FIRST)}">লেসন ১৯ থেকে শুরু {icon('arrow')}</a></div>
<a class="sb-current-card" href="{path(LAST)}"><span class="sb-eyebrow">লেসন ৩৪-এ সরাসরি যান</span><div><strong>34</strong><span lang="ja" translate="no">お<ruby>祝<rt>いわ</rt></ruby>い</span></div><p>使役受身 · なら · てある</p><span class="sb-current-action">শেষ লেসন খুলুন {icon('arrow')}</span></a></section>
<section class="sb-wrap sb-progress" aria-label="শেখার অগ্রগতি"><div><span id="sb-progress-label">১৬টির মধ্যে ০টি পড়া শেষ</span><span id="sb-progress-percent">০%</span></div><progress id="sb-progress" max="16" value="0" aria-label="সম্পন্ন লেসন"></progress><p class="sb-muted">সংশোধিত বইয়ের অগ্রগতি এই ব্রাউজারে সংরক্ষিত থাকে।</p><p class="sb-storage" role="status"></p></section>
<section class="sb-wrap sb-directory" id="sb-lessons"><div class="sb-section-heading"><div><p class="sb-eyebrow">আপনার বইয়ের লেসন</p><h2>আজ কোন লেসন পড়বেন?</h2></div><span class="sb-count">১৬ লেসন · {bn(total)} বিষয়</span></div>
<div class="sb-filters" hidden><div class="sb-search-field"><label for="sb-search" class="sb-sr">লেসন বা গ্রামার খুঁজুন</label>{icon('search')}<input id="sb-search" type="search" placeholder="লেসন, 使役受身, ৩৪…" autocomplete="off"></div><label class="sb-sr" for="sb-filter">অগ্রগতি অনুযায়ী দেখুন</label><select id="sb-filter"><option value="all">সব লেসন</option><option value="todo">বাকি লেসন</option><option value="done">পড়া শেষ</option></select><button id="sb-clear" class="sb-tool" type="button">মুছুন</button></div>
<p id="sb-results" class="sb-muted" role="status">১৬টি লেসন</p><div class="sb-grid">{''.join(cards)}</div><div id="sb-empty" class="sb-empty" hidden><h3>এই নামে লেসন পাওয়া যায়নি</h3><p>অন্য গ্রামার বা লেসন নম্বর লিখুন। সব দেখতে ‘মুছুন’ চাপুন।</p></div></section>'''
    return shell('Bunka II 改訂版 · লেসন ১৯–৩৪', '文化初級日本語 II テキスト 改訂版 লেসন ১৯–৩৪। বইয়ের ক্রমে বাংলা ব্যাখ্যা, ফুরিগানা, অনুশীলন ও অগ্রগতি।', body)


def legacy_route(number):
    equivalent = 27 if number == 35 else 34
    body = f'''<section class="sb-wrap sb-lesson-intro"><p class="sb-eyebrow">বইয়ের সংস্করণ সংশোধন করা হয়েছে</p><h1>সংশোধিত বইটি ৩৪-এ শেষ।</h1><p>আপনার পুরোনো লিংকটি 新文化 সংস্করণের লেসন {bn(number)}-এর। এখন 文化初級日本語 II 改訂版 অনুযায়ী লেসন সাজানো হয়েছে। এই বিষয়ের নতুন পাঠ লেসন {bn(equivalent)}-এ পাবেন।</p><div class="sb-actions"><a class="sb-button" href="{path(equivalent)}">লেসন {bn(equivalent)} খুলুন →</a><a class="sb-tool" href="{HUB}">সংশোধিত লেসন তালিকা</a></div></section>'''
    return shell('Bunka II · সংশোধিত লেসন খুলুন', 'পুরোনো সংস্করণের লেসন নম্বর বদলেছে। সংশোধিত বইয়ের পাঠ খুলুন।', body).replace('</head>', '<meta name="robots" content="noindex,follow"></head>')


def build(check=False):
    assert [l['number'] for l in LESSONS] == list(range(FIRST, LAST + 1))
    outputs = {HUB: render_hub(), **{path(l['number']): render_lesson(l) for l in LESSONS}, **{path(n): legacy_route(n) for n in (35, 36)}}
    for name, content in outputs.items():
        target = ROOT / name
        if check:
            assert target.exists() and target.read_text() == content, f'Regenerate {name}: python3 tools/build_shin_bunka.py'
        else:
            target.write_text(content, encoding='utf-8')
    print(f'Bunka II revised: {len(LESSONS)} lessons (19–34), {sum(len(l["patterns"]) for l in LESSONS)} topics; {len(outputs)} pages {"checked" if check else "written"}.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
