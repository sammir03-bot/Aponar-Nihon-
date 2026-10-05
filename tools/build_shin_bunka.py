#!/usr/bin/env python3
"""Render original Bengali companion lessons as accessible, searchable static HTML.
Run before build_site.py. --check detects uncommitted/outdated generated pages.
"""
from pathlib import Path
import argparse
import html
import re
from content.shin_bunka import LESSONS
from ensure_release_guards import LEGACY_GUARD

ROOT = Path(__file__).resolve().parents[1]
HUB = 'n4-shin-bunka-grammar.html'
def esc(value): return html.escape(str(value), quote=True)
def bn(value): return str(value).translate(str.maketrans('0123456789','০১২৩৪৫৬৭৮৯'))
def plain(value): return re.sub(r'\[([^]|]+)\|([^]]+)\]', r'\1',value)
def ruby(value):
    return re.sub(r'\[([^]|]+)\|([^]]+)\]', lambda m: f'<ruby>{m[1]}<rp>（</rp><rt>{m[2]}</rt><rp>）</rp></ruby>', esc(value))
def path(n): return f'n4-shin-bunka-lesson-{n}.html'
def shell(title, description, body, number=''):
    return f'''<!doctype html>
<html lang="bn" dir="ltr" data-source-language="bn" data-language-preset="bn">
<head>{LEGACY_GUARD}
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#103f3e"><meta name="description" content="{esc(description)}">
<title>{esc(title)} | আপনার নিহোন</title>
<link rel="icon" href="logo.png" type="image/png">
<link rel="stylesheet" href="assets/css/shin-bunka.css?v=1">
<script defer src="assets/js/shin-bunka.js?v=1"></script>
</head>
<body class="sb-page" data-sb-lesson="{number}">
<a class="sb-skip" href="#main">মূল পাঠে যান</a>
<header class="sb-header"><div class="sb-wrap sb-header-row">
<a class="sb-brand" href="index.html"><img src="logo.png" width="40" height="40" alt=""><span>আপনার নিহোন<small>জাপানি শেখার সঙ্গী</small></span></a>
<nav aria-label="মূল নেভিগেশন"><a href="n4.html">N4</a><a href="n4-grammar.html">গ্রামার</a><a href="{HUB}" aria-label="Shin Bunka II সব লেসন">Shin Bunka II</a></nav>
</div></header>
<main id="main">{body}</main>
<footer class="sb-wrap sb-footer"><p>আপনার নিহোন · নিজে পড়ুন, নিজে বলুন।</p><p>Shin Bunka Shokyuu Nihongo II-এর লেসনক্রমে তৈরি স্বতন্ত্র বাংলা সহায়ক পাঠ। ব্যাখ্যা, উদাহরণ ও অনুশীলন আপনার নিহোনের জন্য নতুন করে লেখা। বইয়ের পৃষ্ঠা বলতে মুদ্রিত পৃষ্ঠা বোঝানো হয়েছে।</p><a href="n4-grammar.html">সব N4 গ্রামার →</a></footer>
</body></html>
'''

def render_lesson(l):
    n=l['number']; patterns=l['patterns']; sections=[]
    for i,p in enumerate(patterns,1):
        sections.append(f'''<section class="sb-pattern" id="grammar-{i}" aria-labelledby="heading-{i}">
<div class="sb-pattern-head"><span class="sb-index">{i:02}</span><h2 id="heading-{i}">{esc(p['title'])}</h2></div>
<div class="sb-form"><h3>গঠন</h3><p>{esc(p['form'])}</p></div>
<h3>কখন ও কীভাবে ব্যবহার করবেন</h3><p>{esc(p['explanation'])}</p>
<p class="sb-note"><strong>মনে রাখুন</strong> {esc(p['note'])}</p>
<div class="sb-example"><h3>উদাহরণ</h3><p class="sb-jp" lang="ja" translate="no">{ruby(p['example'])}</p><p>{esc(p['translation'])}</p></div>
<div class="sb-practice"><h3>নিজে বলুন · {bn(i)}</h3><p>{esc(p['practice'])}</p>
<p class="sb-muted">আগে নিজে জাপানিতে বলুন, তারপর নমুনা উত্তরের সঙ্গে মিলিয়ে নিন। একই অর্থের অন্য সঠিক বাক্যও হতে পারে।</p>
<details><summary>নমুনা উত্তর দেখুন</summary><p class="sb-jp" lang="ja" translate="no">{ruby(p['answer'])}</p></details></div>
</section>''')
    links=''.join(f'<a href="#grammar-{i}"><span>{i:02}</span> {esc(p["title"])}</a>' for i,p in enumerate(patterns,1))
    prev=f'<a class="sb-button sb-secondary" href="{path(n-1)}">← লেসন {bn(n-1)}</a>' if n>19 else f'<a class="sb-button sb-secondary" href="{HUB}">← লেসন তালিকা</a>'
    nex=f'<a class="sb-button" href="{path(n+1)}">লেসন {bn(n+1)} →</a>' if n<36 else f'<a class="sb-button" href="{HUB}">সব লেসনে ফিরে যান →</a>'
    body=f'''<div class="sb-wrap sb-lesson-intro"><p class="sb-breadcrumb"><a href="{HUB}">Shin Bunka II</a> / লেসন {bn(n)}</p>
<p class="sb-kicker">SHIN BUNKA II · LESSON {n}</p><h1>{esc(l['title'])}</h1><p class="sb-subtitle" lang="ja" translate="no">{esc(l['ja'])}</p>
<div class="sb-meta"><span>{bn(len(patterns))}টি বিষয় ও অনুশীলন</span><span>বইয়ের পৃষ্ঠা {bn(l['pages'])}</span></div>
<div class="sb-actions"><a class="sb-button" href="#grammar-1">পড়া শুরু করুন ↓</a><button class="sb-button sb-secondary" id="sb-ruby" type="button" aria-pressed="true" hidden>ফুরিগানা: চালু</button><button class="sb-button sb-secondary" data-sb-complete="{n}" type="button" aria-pressed="false" hidden>পড়া শেষ চিহ্নিত করুন</button></div>
<p class="sb-storage" role="status"></p></div>
<div class="sb-wrap sb-layout"><aside class="sb-toc" aria-label="এই লেসনের বিষয়"><h2>এই লেসনে</h2>{links}<a href="{HUB}">সব ১৮টি লেসন →</a></aside><div class="sb-content">{''.join(sections)}
<section class="sb-finish"><h2>আরেকবার নিজের ভাষায় বলুন</h2><p>উদাহরণে নিজের নাম, স্কুল বা কাজের জায়গা বসিয়ে নতুন বাক্য বানান। যেটি আটকে যায়, সেই নিয়মটি আবার পড়ুন।</p><button class="sb-button" data-sb-complete="{n}" type="button" aria-pressed="false" hidden>পড়া শেষ চিহ্নিত করুন</button><p class="sb-storage" role="status"></p></section>
<nav class="sb-actions sb-pagination" aria-label="আগের ও পরের লেসন">{prev}{nex}</nav></div></div>'''
    return shell(f'Shin Bunka II · লেসন {bn(n)}: {l["title"]}', f'{l["title"]}। বাংলা ব্যাখ্যা, গঠন, ফুরিগানা, উদাহরণ ও অনুশীলন। Shin Bunka II লেসন {n}।',body,n)

def render_hub():
    cards=[]; total=sum(len(l['patterns']) for l in LESSONS)
    for l in LESSONS:
        n=l['number']; topics=' · '.join(p['title'] for p in l['patterns'])
        search=' '.join([str(n),l['title'],l['ja'],topics]+[p['form'] for p in l['patterns']])
        cards.append(f'''<article class="sb-lesson-card" data-sb-card="{n}" data-search="{esc(search)}"><div class="sb-card-top"><span class="sb-index">{n}</span><span class="sb-card-status">পড়ার জন্য প্রস্তুত</span></div><p class="sb-card-ja" lang="ja" translate="no">{esc(l['ja'])}</p><h3><a href="{path(n)}">{esc(l['title'])}</a></h3><p class="sb-topics">{esc(topics)}</p><div class="sb-card-bottom"><span>{bn(len(l['patterns']))}টি বিষয়</span><a href="{path(n)}" aria-label="লেসন {bn(n)} পড়ুন">পড়ুন →</a></div></article>''')
    body=f'''<section class="sb-hero"><div class="sb-wrap sb-hero-grid"><div><p class="sb-kicker">N4 GRAMMAR · নতুন শেখার পথ</p><h1>Shin Bunka <span>সহজ বাংলায়।</span></h1><p class="sb-hero-copy">বইয়ের সঙ্গে তাল মিলিয়ে, এক লেসন এক ধাপ। নিয়ম বুঝুন, ফুরিগানাসহ উদাহরণ পড়ুন, তারপর নিজে বাক্য বলুন।</p><div class="sb-actions"><a class="sb-button" id="sb-resume" href="{path(19)}">লেসন ১৯ থেকে শুরু →</a><a class="sb-button sb-outline" href="#sb-lessons">লেসন বেছে নিন ↓</a></div><div class="sb-hero-stats"><span><b>১৮</b>লেসন · ১৯–৩৬</span><span><b>{bn(total)}</b>গ্রামার বিষয়</span><span><b>{bn(total)}</b>নিজে বলার অনুশীলন</span></div></div><div class="sb-book" aria-label="Shin Bunka Shokyuu Nihongo II"><p>আপনার নিহোন</p><div lang="ja" translate="no">新文化<br>初級日本語<span>II</span></div><p>বাংলা সহায়ক পাঠ<br>গঠন · অর্থ · উদাহরণ</p></div></div></section>
<section class="sb-wrap sb-progress" aria-label="শেখার অগ্রগতি"><div><p class="sb-kicker">আপনার শেখার পথ</p><h2 id="sb-progress-label">১৮টি লেসন, নিজের গতিতে</h2><p class="sb-muted">পড়া শেষ হলে লেসনে চিহ্ন দিন। অগ্রগতি এই ব্রাউজারে রাখা হয়।</p></div><progress id="sb-progress" max="18" value="0" aria-label="সম্পন্ন লেসন"></progress><p class="sb-storage" role="status"></p></section>
<section class="sb-wrap sb-directory" id="sb-lessons"><div class="sb-section-heading"><div><p class="sb-kicker">LESSON DIRECTORY</p><h2>আজ কী শিখবেন?</h2></div><a href="n4-grammar.html">Minna no Nihongo II →</a></div>
<div class="sb-filters" hidden><div><label for="sb-search">লেসন বা গ্রামার খুঁজুন</label><input id="sb-search" type="search" placeholder="যেমন: ৩২, passive, のに" autocomplete="off"></div><div><label for="sb-filter">অগ্রগতি</label><select id="sb-filter"><option value="all">সব লেসন</option><option value="todo">বাকি লেসন</option><option value="done">পড়া শেষ</option></select></div><button id="sb-clear" class="sb-button sb-secondary" type="button">মুছুন</button></div>
<p id="sb-results" class="sb-muted" role="status">১৮টি লেসন</p><div class="sb-grid">{''.join(cards)}</div><p id="sb-empty" class="sb-empty" hidden>মিল পাওয়া যায়নি। অন্য শব্দ লিখুন বা ফিল্টার মুছে দিন।</p></section>'''
    return shell('Shin Bunka II · N4 Grammar', 'Shin Bunka Shokyuu Nihongo II লেসন ১৯–৩৬: বাংলা নিয়ম, ফুরিগানা, উদাহরণ ও নিজে বলার অনুশীলন।',body)

def build(check=False):
    assert [l['number'] for l in LESSONS]==list(range(19,37))
    outputs={HUB:render_hub(), **{path(l['number']):render_lesson(l) for l in LESSONS}}
    for name,content in outputs.items():
        target=ROOT/name
        if check:
            assert target.exists() and target.read_text()==content, f'Regenerate {name}: python3 tools/build_shin_bunka.py'
        else: target.write_text(content,encoding='utf-8')
    print(f'Shin Bunka: {len(LESSONS)} lessons, {sum(len(l["patterns"]) for l in LESSONS)} grammar topics and exercises; {len(outputs)} static pages {"checked" if check else "written"}.')
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');build(ap.parse_args().check)
