"""Apply individually authored Bengali meanings to the selected source kanji items.

Input is the reviewed selection, not the entire unreviewed source pool. The source
answer key is preserved. A known incorrect spelling item is quarantined separately.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SELECTION = ROOT / 'tools/content/jtest4you-completion-kanji-selection.json'
MEANINGS = {
'n5': '''বৃষ্টি|প্রবেশদ্বার|খোলা যায় না|টাকা|এক হাজার ইয়েন|মাসের দশ তারিখ|রাস্তা|রান্না বা খাবার|সাঁতার কাটছে|কী|সরু বা ছোট পরিসরের|ছোট|চড়েছিলাম|প্রশ্ন|কোম্পানি বা অফিস|নতুন|এই মাস|ট্রেন|পড়ছে|নিচে|মাসের ছয় তারিখ|পশ্চিম|ট্যাক্সি|আগামী বছর|কান|বিদেশ|নিজের ছোট বোন|শরীর|অসুবিধাজনক|বিশ্ব|গোসল করি|যত্ন বা গুরুত্ব|সিনেমা হল|দেখান|ফুল|ইংরেজি ভাষা|ধূমপান করা|একশ|দেরি হয়েছিল|অসুখ|কতজন|ভিন্ন হয়|পান করছে|নিজের বড় ভাই|তাড়াতাড়ি|এপ্রিল|পাহাড়|রাতের খাবার|ফটক|স্যুট|অর্থ|মেয়ে শিশু|পেছনে|পাহাড়|একশটি লম্বা বস্তু বা গাছ|সঠিকভাবে|আবহাওয়া|ক্যামেরা|এই বছর|দীর্ঘ|বসন্ত|মানুষ|চেরি ফুল দেখা|আগে|খেয়ে|পরে|কিনে|ছবি|বিশ ডিগ্রি|বড়|নিজের মা|প্রতিদিন''',
'n4': '''যথেষ্ট|আয়োজন বা পরিচালনা করা|স্নাতক বা পড়াশোনা শেষ করা|রাজধানী|শখ|অসুস্থ কাউকে দেখতে যাওয়া|দয়ালু|ছড়িয়ে পড়ে বা পৌঁছায়|বিদ্যালয়ের প্রধান শিক্ষক|দয়ালু বা সাহায্যপ্রবণ|নড়ে না|হঠাৎ|পুতুল|গল্প|সমুদ্র|শক্তিশালী|বাতাস|মাছ|রাতের খাবার|তৃষ্ণা পেয়েছে|একাকী বা নিঃসঙ্গ|গত বছর|বসন্ত|শেষ হওয়ার পরে|ব্যবহার করেছিল|রান্না বা খাবার|শ্রেণিকক্ষ|গান|বন্ধ করুন|টেলিফোনের খরচ|রাত|প্রধান শিক্ষক|চিন্তার ধরন|সঠিক|নীল|রং|সময়ের মধ্যে|সস্তা|মা|রান্নাঘর|খাবার ঘর|পরিবার|আনন্দ হচ্ছে বলে মনে হয়|পাঠান|লজ্জাজনক|গাঢ় এবং|ঘুম পাচ্ছে|বাড়ির প্রবেশপথ|কথোপকথন|বড় ভাই|ভবন|বের হওয়ার দরজা|বাদামি রং|পোশাক|পরে আছে|পুনরায় পড়া বা রিভিশন|রোগ সারে|যাতায়াত|কাপড় বা বস্ত্র|ব্যর্থতা|শহর বা জনপদ|জনসংখ্যা|গত বছর|বেশি হয়ে|বিখ্যাত|আলোকচিত্রী|বিশ্ব|আলো|কুড়িয়ে পেয়েছে|প্রতিশ্রুতি|প্রতিবেশ বা আশপাশ|সঙ্গ দেওয়া বা কারও সঙ্গে সময় কাটানো|পাখি|প্রাণী|অনুষ্ঠিত হচ্ছে|চিকিৎসক|কাজ করা|সতর্কতা|বলা হয়েছিল|অগ্নিকাণ্ড|বেঁচে থাকা|উপন্যাস|মতামত|পৌঁছানো|বাস করে|সমুদ্র|কাছাকাছি এবং|মোটরগাড়ি|শিল্প|ডাকটিকিট|পাঠান|রচনা|পড়ে গিয়েছিল|শারীরিক অবস্থা|স্বাধীনতা|পরিকল্পনা''',
'n3': '''ঘাম|রপ্তানি|পৃষ্ঠ বা উপরিভাগ|সম্পূর্ণ হওয়া|বাস্তবায়ন|শক্ত করে|পরিষ্কার করার ডিটারজেন্ট|উচ্চারণ|আইন|রক্ষা করা বা কথা রাখা|মুড়ে দিন|টিকিট বা কুপন|সাময়িকী|দেরি পর্যন্ত|টিকিট যাচাইয়ের গেট|বিলি করুন|ঘষে পরিষ্কার করা|ভাই বা বোনের ছেলে|ভাঙা|অতীত|গাছের শিকড়|অফিসের কাজে বাইরে যাওয়া|পরামর্শ|ধার দিন|দয়ালু|গরম করেছিলাম|চোখের পানি|কাজের আলোচনা|ভরে আছে|পৃথিবী|অতিরিক্ত ছোট হওয়ায়|হাসিমুখ|আসন|জমিয়ে বরফ করা|নির্ভর করে|মেপে|ভিন্ন হয়ে|সংখ্যা|ভয় পাওয়া|স্বাভাবিক বা ঠিক অবস্থায়|রক্ত|অপরাধ বা দোষ|সমুদ্রসৈকত|সময় বা সুবিধা|বয়ে চলছিল বা বাজছিল|ঝরে পড়া|মনে রেখেছিল|সমালোচনা|সন্ধ্যার আগের বিকেল|মুড়ে|বাধা|সুরক্ষা বা নিশ্চয়তা|যানজট|মন বা মানসিক অবস্থা|স্বভাব|দর্শনীয় স্থান ঘোরা|পারদর্শী|আবিষ্কার|প্রকাশ করছে|বিষয় বা প্রসঙ্গ|অফিসে যাতায়াত|পাথর|চেষ্টা|প্রান্ত|তাপমাত্রা|শ্বাসপ্রশ্বাস|পদ্ধতি|মেনে নেওয়া বা যুক্তি বুঝে সম্মত হওয়া|অবস্থা|সরিয়ে নেওয়া|বুড়ো আঙুল|সংকেত|হাসিমুখ|সঙ্গী|পার্থক্য|একমাত্র|আত্মীয়|দুশ্চিন্তা|অবকাশ বা সামর্থ্য|অনুশীলন|পিছিয়ে দেওয়া|স্নায়ু|মনোযোগ এক জায়গায় রাখা|গুরুত্বপূর্ণ|পারদর্শী বা গর্বিত|পরিবেশ বা আবহ|সর্বোচ্চ বা সবচেয়ে ভালো|রসিকতা|অর্থহীন বা অপচয়|গর্ব করে বলা|ঝগড়া|জীবন|বুদ্ধি|আসলে বা আদৌ|অদ্ভুত|অনুভূতি|তদন্ত|কাজ বা পদক্ষেপ|বাঁচানোর চেষ্টা|পাঠ্য বিষয়|উত্তীর্ণ হওয়া|তাজা|অদ্ভুত|সমালোচনা|সম্পূর্ণ|পরিকল্পনা|অবশিষ্ট রাখা হয়েছিল|উপায়|আঘাত|লুকিয়ে|মিষ্টি বা হালকা খাবার|ভুল উৎস বানান; ব্যবহার করা হবে না'''
}

def clean(s):
    return html.unescape(re.sub('<[^>]*>', '', s)).strip()

def target(q):
    tail = re.search(r'<br\s*/?>\s*([^<]+)\s*$', q['prompt'])
    if tail:
        return clean(tail[1])
    last_sentence = re.split(r'<br\s*/?>', q['prompt'])[-1]
    marked = re.findall(r'<span[^>]*text-decoration:underline[^>]*>(.*?)</span>', last_sentence)
    assert len(marked) == 1, q['id']
    return clean(marked[0])

def apply(selection):
    review_path = ROOT / 'assets/data/jtest4you/bn-review.json'
    reviews = json.loads(review_path.read_text())
    count = 0
    for level, questions in selection.items():
        selected = [q for q in questions if q['category'] == 'kanji']
        meanings = MEANINGS[level].split('|')
        assert len(selected) == len(meanings), (level, len(selected), len(meanings))
        for q, meaning in zip(selected, meanings):
            if q['id'] == 'jtest-8f81883fde4b1017':
                if q['id'] not in reviews['excludedQuestionIds'][level]:
                    reviews['excludedQuestionIds'][level].append(q['id'])
                reviews['exclusionReasons'][q['id']] = 'খাবার খেতে উৎসাহ দেওয়ার অর্থে 勧めた দরকার; উৎসের চার বিকল্পেই সঠিক বানান নেই। 進めた এই বাক্যের অর্থের সঙ্গে মেলে না।'
                continue
            if q['id'] in reviews['excludedQuestionIds'][level]:
                continue
            written, answer = target(q), clean(q['options'][q['answer']])
            if q['kind'] == '漢字読み':
                explanation = f'এই বাক্যে 「{written}」 শব্দটির পড়া 「{answer}」। শব্দটির অর্থ {meaning}। পুরো শব্দের কানজি ও শেষের হিরাগানা একসঙ্গে পড়ে এই বিকল্পটি বেছে নিতে হবে।'
                if 'っ' in answer:
                    explanation += ' ছোট っ পরের ব্যঞ্জনধ্বনিতে বিরতি বা দ্বিত্ব তৈরি করে; সেটি বাদ দিলে উচ্চারণ বদলে যায়।'
                elif any(c in answer for c in 'ゃゅょ'):
                    explanation += ' ছোট ゃ・ゅ・ょ আগের ধ্বনির সঙ্গে মিলে একটি যুক্ত উচ্চারণ তৈরি করে।'
            else:
                explanation = f'「{written}」-এর সঠিক লিখিত রূপ 「{answer}」। এখানে এর অর্থ {meaning}। উচ্চারণ কাছাকাছি হলেও এই অর্থ প্রকাশ করতে বিকল্পটির নির্দিষ্ট কানজি বা কাটাকানা প্রয়োজন।'
            reviews['levels'][level][q['id']] = {'answerBn': f'{answer} — {meaning}', 'explanationBn': explanation}
            count += 1
    reviews['bankVersion'] = 9
    review_path.write_text(json.dumps(reviews, ensure_ascii=False, separators=(',', ':')) + '\n')
    print('Reviewed source kanji:', count)

if __name__ == '__main__':
    ids = json.loads(SELECTION.read_text())
    selection = {}
    for level, keys in ids.items():
        bank = json.loads((ROOT / f'assets/data/jtest4you/{level}.json').read_text())
        index = {q['id']: q for q in bank['questions']}
        selection[level] = [index[key] for key in keys]
    apply(selection)
