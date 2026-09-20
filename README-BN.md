# JLPT N5 Mock Test System

এই প্যাকেজটি `n5-mock-tests.html`-এর ১০টি N5 Mock Test চালানোর জন্য তৈরি। মূল `index.html`-এ কোনো পরিবর্তন প্রয়োজন নেই।

## ব্যবহার

একই ফোল্ডারে এই তিনটি ফাইল রাখুন:

- `n5-mock-tests.html`
- `jlpt-exam.html`
- `n5-full-generator.js`

তারপর `n5-mock-tests.html` খুলুন। Mock Test 1 চাপলে Test 1, Mock Test 2 চাপলে Test 2—এভাবে প্রতিটি বাটন তার নিজস্ব প্রশ্নসেট খুলবে।

## পরীক্ষার flow

1. শব্দভাণ্ডার: ২৫টি প্রশ্ন একই পাতায় নিচে নিচে থাকবে। সব উত্তর দিয়ে পার্ট জমা দিতে হবে।
2. পার্ট জমা হওয়ার পরেই “পরবর্তী পার্ট শুরু করুন” বাটন আসবে। আগের পার্টে আর ফেরা যাবে না।
3. গ্রামার ও রিডিং: ৩০টি প্রশ্ন একই vertical feed-এ থাকবে। Reading passage-গুলো সংশ্লিষ্ট প্রশ্নের আগে grouped থাকবে।
4. এই পার্ট জমা হলে Listening খুলবে।
5. Listening: ২০টি প্রশ্ন; প্রতিটি audio সর্বোচ্চ দুইবার শোনা যাবে।
6. শেষ পার্ট জমা হলে ১৮০ নম্বরের ফলাফল, pass/fail এবং ৭৫টি প্রশ্নের বাংলা review দেখা যাবে।

## N5 level ও Furigana

- প্রশ্নগুলো N5-এর basic particle, verb/adjective form, て-form, permission, prohibition, ইচ্ছা, invitation, time/counter এবং সহজ দৈনন্দিন vocabulary-র মধ্যে রাখা হয়েছে।
- Question, option, reading passage এবং result transcript-এর kanji-তে ruby furigana আছে।
- Kanji-reading/kanji-writing প্রশ্নে যে শব্দটি সরাসরি পরীক্ষা করা হচ্ছে শুধু তার furigana পরীক্ষার সময় লুকানো থাকে—না হলে উত্তর আগেই দেখা হয়ে যাবে। Review explanation-এ সেই শব্দের পড়া দেওয়া আছে।
- N4-এর `つもり・そうだ・なら・ながら・ように` ইত্যাদি pattern এই N5 bank-এ ব্যবহার করা হয়নি।

## সুবিধা

- Todai-inspired mobile app layout
- প্রতি টেস্টে ৭৫টি প্রশ্ন; ১০টি আলাদা mock test
- Real Time: ২০ + ৪০ + ৩০ মিনিট
- Practice mode-এ সংক্ষিপ্ত timer
- উত্তর, বর্তমান পার্ট ও scroll position auto-save
- মাঝপথ থেকে Resume
- সময় শেষ হলে সেই পার্ট auto-submit
- Listening Sound Check ও Japanese browser voice
- ভুল/সঠিক উত্তর filter, transcript ও বাংলা ব্যাখ্যা

Listening-এর জন্য Android Chrome বা desktop Chrome ব্যবহার করলে সবচেয়ে ভালো ফল পাওয়া যায়।

Question pattern ও difficulty বোঝার reference হিসেবে JLPT N5-এর প্রচলিত format এবং JapaneseTest4You-এর N5 vocabulary, kanji, grammar, reading ও listening category দেখা হয়েছে। সব question, dialogue, explanation ও TTS script এই project-এর জন্য নতুনভাবে লেখা।

## লাইসেন্স ও কপিরাইট

এই repository-র সব ফাইল একই license-এর অধীনে নয়।

- Project-এর নিজস্ব **software source code** সাধারণভাবে [`LICENSE`](./LICENSE)-এ থাকা **MIT License**-এর অধীনে।
- নিজস্ব lesson, explanation, translation, vocabulary note, study guide ও editorial/educational content-এর কপিরাইট সংরক্ষিত, যদি কোনো file-এ আলাদাভাবে অন্য license উল্লেখ না থাকে। বিস্তারিত [`COPYRIGHT.md`](./COPYRIGHT.md)-এ।
- Third-party PDF, ebook/book-derived material, image, font, dataset, news/source material ইত্যাদি MIT License-এর আওতায় নয়। যেসব asset-এর provenance/license আলাদাভাবে যাচাই করা প্রয়োজন, সেগুলোর তালিকা ও policy [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)-এ আছে।

Publicly available কোনো third-party file-কে স্বয়ংক্রিয়ভাবে freely redistributable ধরে নেওয়া উচিত নয়। Release বা redistribution-এর আগে applicable license/permission যাচাই করুন।
