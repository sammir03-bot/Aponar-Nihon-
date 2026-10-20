#!/usr/bin/env python3
"""Build the original QUARTET II companion from its reviewed course data."""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKEN = re.compile(r'([\u3400-\u9fff々〆ヵヶ][\u3400-\u9fff々〆ヵヶぁ-んァ-ンー]*)\[([ぁ-んァ-ンー]+)\]')


def ruby(value):
    out, last = [], 0
    for match in TOKEN.finditer(str(value)):
        out.append(escape(str(value)[last:match.start()]))
        out.append(f'<ruby lang="ja">{escape(match[1])}<rp>（</rp><rt>{escape(match[2])}</rt><rp>）</rp></ruby>')
        last = match.end()
    return ''.join(out) + escape(str(value)[last:])


def bn(value):
    return str(value).translate(str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯'))


def build():
    course = json.loads((ROOT / 'assets/data/n2-quartet.json').read_text())
    redirect = re.search(r'<script id="legacy-origin-redirect">[\s\S]*?</script>', (ROOT / 'n3-quartet-grammar.html').read_text())[0]
    options = '<option value="0">শুরু ও Form Guide</option>' + ''.join(
        f'<option value="{index}">{escape(chapter["title_bn"])}</option>'
        for index, chapter in enumerate(course['chapters'], 1)
    ) + '<option value="7">শেষ রিভিশন</option>'
    html = [f'''<!doctype html>
<html lang="bn" dir="ltr" data-language-preset="bn" data-source-language="bn">
<head><meta charset="utf-8">{redirect}
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>QUARTET II বাংলা স্টাডি সহায়িকা | আপনার নিহোন</title>
<meta name="description" content="QUARTET II-এর অধ্যায় ৭–১২-এর থিমে নিজস্ব বাংলা অনুশীলন: ৩৬ নির্বাচিত গ্রামার, ৬টি Reading, Writing, Speaking ও Listening Lab।">
<link rel="canonical" href="https://app.aponar-nihon.workers.dev/n2-quartet-study-guide">
<link rel="icon" href="/logo.png" type="image/png"><meta name="theme-color" content="#0c121b">
<link rel="stylesheet" href="/assets/css/n3-quartet-study.css?v=20260915.1">
<link rel="stylesheet" href="/assets/css/quartet-studio.css?v=20261020.1"></head>
<body class="quartet-page quartet-guide" data-quartet-volume="2"><a class="skip-link" href="#study-content">পাঠে যান</a>
<header class="study-header"><nav class="study-breadcrumb" aria-label="পথ নির্দেশনা"><a href="/n3.html#quartet">আপনার নিহোন · শেখার লাইব্রেরি</a><a href="/n2-quartet-grammar.html">গ্রামার অনুশীলন</a></nav>
<div class="quartet-hero"><div class="quartet-hero-copy"><span class="quartet-eyebrow">READ · WRITE · SPEAK · LISTEN</span><h1>QUARTET II<br>বাংলা স্টাডি সহায়িকা</h1><p>অধ্যায় ৭–১২ · নির্বাচিত ৩৬ গ্রামার · ৬টি নিজস্ব Reading passage · চার দক্ষতার অনুশীলন</p><p>{escape(course['scope_bn'])}</p></div><img class="quartet-hero-art" src="/assets/images/learning/quartet-ii.svg" alt="" width="640" height="300"></div></header>
<nav class="quartet-series-nav" aria-label="QUARTET বই ও পড়ার ধরন"><a href="/n3-quartet-grammar.html">QUARTET I · N3</a><a href="/n2-quartet-grammar.html">QUARTET II · N2</a><a href="/n2-quartet-study-guide.html" aria-current="page">চার দক্ষতার গাইড</a></nav>
<div class="study-toolbar" id="study-toolbar" hidden><label for="study-chapter-select">অধ্যায় বেছে নিন</label><select id="study-chapter-select">{options}</select><p id="study-status" role="status" aria-live="polite"></p></div>
<main id="study-content"><section class="study-chapter" id="guide-0" data-study-chapter="0"><h2 tabindex="-1">আপনার পরের ধাপ: QUARTET II</h2><div class="notice">I-এ অধ্যায় ১–৬ ও N3-এর ভিত্তি; II-এ অধ্যায় ৭–১২ ও মূলত N2-স্তরের কাজ। এই সহায়িকার সব প্যাসেজ, ব্যাখ্যা, উদাহরণ ও প্রশ্ন নিজস্বভাবে লেখা।</div>
<h3>একটি অধ্যায় যেভাবে পড়বেন</h3><ol><li>শব্দ ও কানজি দেখে নিন।</li><li>নির্বাচিত গ্রামারের Form ও উদাহরণ বুঝুন।</li><li>Reading Lab পড়ে আগে নিজে প্রশ্নের উত্তর দিন।</li><li>Writing model নিজের তথ্য দিয়ে বদলান।</li><li>Speaking dialogue জোড়ায় বা নিজে অনুশীলন করুন।</li><li>Listening Lab দুবার শুনে নোট নিন; তারপর transcript মিলিয়ে দেখুন।</li></ol><h3>Form Guide</h3>''']
    for form in course['form_guide']:
        html.append(f'<div class="card"><strong>{escape(form["label"])}</strong><p>{ruby(form["meaning_bn"])}</p><p class="jp">{ruby(form["example"])}</p></div>')
    html.append('</section>')
    parts = ['শেখার লক্ষ্য', 'Vocabulary Bank', 'Kanji Focus', 'Grammar Core', 'Reading Lab', 'Writing Lab', 'Speaking Lab', 'Listening Lab']
    for index, (chapter, study) in enumerate(zip(course['chapters'], course['study']), 1):
        nav = ''.join(f'<a href="#guide-{index}-part-{part}">{title}</a>' for part, title in enumerate(parts, 1))
        html.append(f'<section class="study-chapter" id="guide-{index}" data-study-chapter="{index}"><nav class="skill-nav" aria-label="এই অধ্যায়ের অংশ">{nav}</nav><h2 tabindex="-1">{escape(chapter["title_bn"])}</h2>')
        html.append(f'<h3 id="guide-{index}-part-1">শেখার লক্ষ্য</h3><p>{escape(chapter["theme_bn"])}</p><div class="tip"><strong>পড়ার কৌশল</strong><p>{escape(study["strategy"])}</p></div>')
        html.append(f'<h3 id="guide-{index}-part-2">Vocabulary Bank</h3><div class="table-scroll"><table><thead><tr><th scope="col">শব্দ ও ফুরিগানা</th><th scope="col">বাংলা অর্থ</th></tr></thead><tbody>')
        html.extend(f'<tr><td class="jp">{ruby(word)}</td><td>{escape(meaning)}</td></tr>' for word, meaning in study['vocab'])
        html.append('</tbody></table></div>')
        html.append(f'<h3 id="guide-{index}-part-3">Kanji Focus</h3><div class="table-scroll"><table><thead><tr><th scope="col">কানজি</th><th scope="col">ইঙ্গিত</th><th scope="col">উদাহরণ শব্দ</th></tr></thead><tbody>')
        html.extend(f'<tr><td class="jp">{ruby(kanji)}</td><td>{escape(meaning)}</td><td class="jp">{ruby(word)}</td></tr>' for kanji, meaning, word in study['kanji'])
        html.append('</tbody></table></div>')
        html.append(f'<h3 id="guide-{index}-part-4">Grammar Core · নির্বাচিত ৬টি বিষয়</h3>')
        for lesson in [item for item in course['lessons'] if item['chapter'] == chapter['id']]:
            html.append(f'<article class="lesson"><h4>{bn(lesson["order"])}. {ruby(lesson["title"])}</h4><p><strong>{escape(lesson["meaning_bn"])}</strong></p><p>{ruby(lesson["explanation_bn"])}</p><div class="formula">{ruby(lesson["forms"][0])}</div><p class="tip">{ruby(lesson["tip_bn"])}</p>')
            for example in lesson['examples']:
                html.append(f'<div class="example"><p class="jp">{ruby(example["japanese"])}</p><p>{escape(example["bangla"])}</p></div>')
            html.append(f'<a class="skill-action" href="/n2-quartet-grammar.html#{lesson["id"]}/quiz">অনুশীলন ও উত্তর ব্যাখ্যা →</a></article>')
        html.append(f'<h3 id="guide-{index}-part-5">Reading Lab · {escape(study["reading_title"])}</h3><p class="small">নিজস্ব অনুশীলনের প্যাসেজ · আগে পুরো জাপানি অংশ পড়ুন, তারপর বাংলা মিলিয়ে নিন।</p>')
        for number, (japanese, bangla, note) in enumerate(study['reading'], 1):
            html.append(f'<article class="sentence"><p class="sentence-label">বাক্য {bn(number)}</p><p class="jp" lang="ja">{ruby(japanese)}</p><p>{escape(bangla)}</p><div class="sentence-note">{ruby(note)}</div></article>')
        for number, (question, answer) in enumerate(study['questions'], 1):
            html.append(f'<div class="quiz"><strong>প্রশ্ন {bn(number)}.</strong> {ruby(question)}</div><details><summary>উত্তর ও কারণ দেখুন</summary><p>{ruby(answer)}</p></details>')
        html.append(f'<h3 id="guide-{index}-part-6">Writing Lab</h3><p>{escape(study["writing_prompt"])}</p><div class="card"><strong>নিজস্ব নমুনা · বাক্য ধরে বাংলা</strong>')
        for japanese, bangla in study['writing']:
            html.append(f'<div class="sentence"><p class="jp" lang="ja">{ruby(japanese)}</p><p>{escape(bangla)}</p></div>')
        html.append('</div><p class="small">নিজে যাচাই করুন: মূল বক্তব্য আছে? কারণ দিয়েছেন? সংযোগ ঠিক? শেষে একই সিদ্ধান্ত রেখেছেন?</p>')
        html.append(f'<h3 id="guide-{index}-part-7">Speaking Lab</h3><div class="card">')
        for speaker, japanese, bangla in study['dialogue']:
            html.append(f'<div class="dialogue"><strong>{speaker}</strong><div><p class="jp" lang="ja">{ruby(japanese)}</p><p class="dialogue-meaning">{escape(bangla)}</p></div></div>')
        html.append('</div><p>প্রথমবার দেখে বলুন। দ্বিতীয়বার নিজের তথ্য বসান। তৃতীয়বার না দেখে দুই পক্ষের কথা বলুন।</p>')
        text = TOKEN.sub(r'\1', study['listening'])
        html.append(f'<h3 id="guide-{index}-part-8">Listening Lab</h3><p class="small">নিজস্ব স্ক্রিপ্ট · ব্রাউজারের জাপানি কৃত্রিম কণ্ঠ। মূল বইয়ের অডিও নয়। কণ্ঠ না থাকলে transcript দেখে অনুশীলন করুন।</p><button class="skill-action" type="button" data-listen-text="{escape(text, quote=True)}">জাপানি স্ক্রিপ্ট শুনুন</button><button class="skill-action" type="button" data-listen-stop>থামান</button><p class="listen-status" role="status" aria-live="polite"></p><div class="quiz">{escape(study["listening_question"])}</div><details><summary>জাপানি transcript দেখুন</summary><p class="jp" lang="ja">{ruby(study["listening"])}</p></details><details><summary>শোনার উত্তর দেখুন</summary><p>{escape(study["listening_answer"])}</p></details></section>')
    html.append('<section class="study-chapter" id="guide-7" data-study-chapter="7"><h2 tabindex="-1">শেষ রিভিশন · ৩৬টি নির্বাচিত গ্রামার</h2><p>অর্থ পড়ার পরে Form না দেখে নিজের একটি বাক্য বলুন। যে বিষয় আটকে যায়, তার অনুশীলনে ফিরে যান।</p>')
    for chapter in course['chapters']:
        html.append(f'<h3>{escape(chapter["title_bn"])}</h3><ul>')
        for lesson in [item for item in course['lessons'] if item['chapter'] == chapter['id']]:
            html.append(f'<li><a href="/n2-quartet-grammar.html#{lesson["id"]}/lesson">{ruby(lesson["title"])}</a> — {escape(lesson["meaning_bn"])}</li>')
        html.append('</ul>')
    html.append('''<h3>নিজের প্রস্তুতি যাচাই</h3><ol><li>৬টি Reading-এর মূল কথা এক বাক্যে বলুন।</li><li>দুটি কাছাকাছি গ্রামারের পার্থক্য নিজের উদাহরণ দিয়ে বোঝান।</li><li>একটি Writing model নিজের অভিজ্ঞতায় লিখুন।</li><li>একটি Speaking dialogue না দেখে বলুন।</li><li>Listening-এ সময়, স্থান, কারণ ও পরের কাজ লিখুন।</li></ol></section>
<footer class="study-footer"><a href="/n2-quartet-grammar.html">৩৬টি ইন্টারঅ্যাকটিভ গ্রামার →</a><a href="/n3-quartet-study-guide.html">QUARTET I</a><a href="https://quartet.japantimes.co.jp/en/" target="_blank" rel="noopener noreferrer">প্রকাশকের বই ও রিসোর্স</a><a href="/n3.html#quartet">শেখার লাইব্রেরি</a></footer></main>
<script defer src="/assets/js/n3-quartet-study.js?v=20261020.1"></script></body></html>''')
    (ROOT / 'n2-quartet-study-guide.html').write_text('\n'.join(html) + '\n')


if __name__ == '__main__':
    build()
