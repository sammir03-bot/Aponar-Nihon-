(function () {
  "use strict";

  var STORAGE_KEY = "aponarNihonLanguage";
  var DEFAULT_LANGUAGE = "bn";
  var RTL_LANGUAGES = { ur: true };

  var LANGUAGES = {
    bn: { label: "বাংলা", short: "BN", flag: "🇧🇩" },
    ja: { label: "日本語", short: "JA", flag: "🇯🇵" },
    en: { label: "English", short: "EN", flag: "🇬🇧" },
    vi: { label: "Tiếng Việt", short: "VI", flag: "🇻🇳" },
    ne: { label: "नेपाली", short: "NE", flag: "🇳🇵" },
    hi: { label: "हिन्दी", short: "HI", flag: "🇮🇳" },
    ur: { label: "اردو", short: "UR", flag: "🇵🇰" },
    my: { label: "မြန်မာ", short: "MY", flag: "🇲🇲" },
    zh: { label: "中文", short: "ZH", flag: "🇨🇳" },
    si: { label: "සිංහල", short: "SI", flag: "🇱🇰" },
    fil: { label: "Filipino", short: "FIL", flag: "🇵🇭" }
  };

  var LANGUAGE_ALIASES = {
    bangla: "bn",
    bengali: "bn",
    japanese: "ja",
    english: "en",
    vietnamese: "vi",
    nepali: "ne",
    hindi: "hi",
    urdu: "ur",
    burmese: "my",
    myanmar: "my",
    chinese: "zh",
    sinhala: "si",
    tagalog: "fil",
    filipino: "fil"
  };

  var MESSAGES = {
    bn: {
      "language.button": "ভাষা",
      "language.title": "আপনার ভাষা বেছে নিন",
      "language.subtitle": "বাংলা ডিফল্ট থাকবে। একবার ভাষা বেছে নিলে এই ডিভাইসে মনে থাকবে।",
      "language.close": "বন্ধ করুন",
      "language.active": "বর্তমান ভাষা",
      "brand.name": "আপনার নিহোন",
      "brand.tagline": "জাপানি শেখার পূর্ণাঙ্গ প্ল্যাটফর্ম",
      "menu.main": "মূল পাতা",
      "menu.jlpt": "JLPT শেখা",
      "menu.practice": "Practice & প্রস্তুতি",
      "menu.japan": "Japan & দরকারি Tools",
      "menu.home": "হোম",
      "menu.home.note": "সব গুরুত্বপূর্ণ সেকশন",
      "menu.n5.note": "শুরুর লেভেল learning center",
      "menu.n4.note": "প্রাথমিক learning center",
      "menu.n3.note": "মাঝারি learning center",
      "menu.quiz": "কুইজ Arena",
      "menu.quiz.note": "Level ও category practice",
      "menu.tutor.note": "নিজের ভাষায় ব্যক্তিগত Japanese coach",
      "menu.mock.note": "Exam simulation ও review",
      "menu.interview": "ইন্টারভিউ",
      "menu.interview.note": "Job, school, embassy ও SSW",
      "menu.japanlife": "জাপান লাইফ",
      "menu.japanlife.note": "নতুনদের practical guide",
      "menu.cv.note": "履歴書 তৈরি করুন",
      "menu.toolkit.note": "জীবন ও পড়াশোনার tools",
      "menu.profile.note": "Progress ও account",
      "menu.title": "আপনার নিহোন",
      "menu.subtitle": "এক menu-তে পুরো learning app",
      "menu.intro": "যে সেকশন দরকার, এখান থেকে সরাসরি খুলুন",
      "menu.footer": "নিজের ভাষায় জাপানি শেখার পূর্ণাঙ্গ app · あなたの日本",
      "menu.close": "মেনু বন্ধ করুন",
      "home.search": "কানজি, ভোকাবুলারি, গ্রামার খুঁজুন…",
      "home.noResults": "কিছু পাওয়া যায়নি—N5, N4, N3, AI বা কুইজ লিখে দেখুন",
      "home.eyebrow": "এক জায়গায় সবকিছু",
      "home.title": "সব গুরুত্বপূর্ণ সেকশন",
      "home.n5.note": "বেসিক কোর্স",
      "home.n4.note": "পরবর্তী ধাপ",
      "home.n3.note": "ইন্টারমিডিয়েট",
      "home.quiz": "কুইজ",
      "home.quiz.note": "ফ্রি প্র্যাকটিস",
      "home.tutor": "AI টিউটর",
      "home.tutor.note": "নিজের ভাষায় জিজ্ঞাসা",
      "home.mock.note": "পরীক্ষা প্র্যাকটিস",
      "home.interview": "ইন্টারভিউ",
      "home.interview.note": "চাকরি ও এম্বাসি",
      "home.ssw.note": "সম্পূর্ণ গাইড",
      "home.phrases": "দরকারি বাক্য",
      "home.phrases.note": "কথোপকথন",
      "home.japanlife": "জাপান লাইফ",
      "home.japanlife.note": "নতুনদের গাইড",
      "home.kana": "হিরাগানা-কানা",
      "home.kana.note": "অক্ষর শেখা",
      "progress.done": "সম্পন্ন",
      "progress.opened": "খোলা হয়েছে",
      "progress.notStarted": "শুরু হয়নি",
      "progress.saved": "শেখা সংরক্ষিত",
      "progress.finished": "শেষ",
      "progress.continue": "শেষ resource থেকে চালিয়ে যান"
    },
    en: {
      "language.button": "Language", "language.title": "Choose your language", "language.subtitle": "Bangla stays the default. Your choice is remembered on this device.", "language.close": "Close", "language.active": "Current language",
      "brand.name": "Aponar Nihon", "brand.tagline": "Japanese learning for everyone",
      "menu.main": "Main", "menu.jlpt": "Learn JLPT", "menu.practice": "Practice & preparation", "menu.japan": "Japan & useful tools", "menu.home": "Home", "menu.home.note": "All important sections", "menu.n5.note": "Beginner learning center", "menu.n4.note": "Elementary learning center", "menu.n3.note": "Intermediate learning center", "menu.quiz": "Quiz Arena", "menu.quiz.note": "Practice by level and category", "menu.tutor.note": "Your personal Japanese coach", "menu.mock.note": "Exam simulation and review", "menu.interview": "Interview", "menu.interview.note": "Job, school, embassy and SSW", "menu.japanlife": "Japan Life", "menu.japanlife.note": "Practical guide for newcomers", "menu.cv.note": "Create a Japanese resume", "menu.toolkit.note": "Life and study tools", "menu.profile.note": "Progress and account", "menu.title": "Aponar Nihon", "menu.subtitle": "Your whole learning app in one menu", "menu.intro": "Open any section directly from here", "menu.footer": "Japanese learning in your own language · あなたの日本", "menu.close": "Close menu",
      "home.search": "Search kanji, vocabulary, grammar…", "home.noResults": "Nothing found—try N5, N4, N3, AI or quiz", "home.eyebrow": "Everything in one place", "home.title": "All important sections", "home.n5.note": "Basic course", "home.n4.note": "Next step", "home.n3.note": "Intermediate", "home.quiz": "Quiz", "home.quiz.note": "Free practice", "home.tutor": "AI Tutor", "home.tutor.note": "Ask in your language", "home.mock.note": "Exam practice", "home.interview": "Interview", "home.interview.note": "Jobs and embassy", "home.ssw.note": "Complete guide", "home.phrases": "Useful phrases", "home.phrases.note": "Conversation", "home.japanlife": "Japan Life", "home.japanlife.note": "Guide for newcomers", "home.kana": "Hiragana & Katakana", "home.kana.note": "Learn the scripts",
      "progress.done": "completed", "progress.opened": "Opened", "progress.notStarted": "Not started", "progress.saved": "learning saved", "progress.finished": "done", "progress.continue": "Continue from your last resource"
    },
    ja: {
      "language.button": "言語", "language.title": "言語を選択", "language.subtitle": "初期設定はベンガル語です。選んだ言語はこの端末に保存されます。", "language.close": "閉じる", "language.active": "現在の言語",
      "brand.name": "あなたの日本", "brand.tagline": "みんなの日本語学習プラットフォーム",
      "menu.main": "メイン", "menu.jlpt": "JLPT学習", "menu.practice": "練習・準備", "menu.japan": "日本生活・便利ツール", "menu.home": "ホーム", "menu.home.note": "重要なセクション一覧", "menu.n5.note": "初級学習センター", "menu.n4.note": "初中級学習センター", "menu.n3.note": "中級学習センター", "menu.quiz": "クイズ Arena", "menu.quiz.note": "レベル・カテゴリー別練習", "menu.tutor.note": "あなた専用の日本語コーチ", "menu.mock.note": "模擬試験と復習", "menu.interview": "面接", "menu.interview.note": "仕事・学校・大使館・SSW", "menu.japanlife": "日本生活", "menu.japanlife.note": "来日した人向け実用ガイド", "menu.cv.note": "履歴書を作成", "menu.toolkit.note": "生活・学習ツール", "menu.profile.note": "進捗とアカウント", "menu.title": "あなたの日本", "menu.subtitle": "学習アプリを一つのメニューに", "menu.intro": "必要なセクションをここから開けます", "menu.footer": "自分の言語で日本語を学ぶ · あなたの日本", "menu.close": "メニューを閉じる",
      "home.search": "漢字・語彙・文法を検索…", "home.noResults": "見つかりません。N5、N4、N3、AI、クイズなどで検索してください", "home.eyebrow": "すべてを一か所に", "home.title": "重要なセクション", "home.n5.note": "基礎コース", "home.n4.note": "次のステップ", "home.n3.note": "中級", "home.quiz": "クイズ", "home.quiz.note": "無料練習", "home.tutor": "AIチューター", "home.tutor.note": "自分の言語で質問", "home.mock.note": "試験練習", "home.interview": "面接", "home.interview.note": "仕事・大使館", "home.ssw.note": "完全ガイド", "home.phrases": "便利なフレーズ", "home.phrases.note": "会話", "home.japanlife": "日本生活", "home.japanlife.note": "初心者ガイド", "home.kana": "ひらがな・カタカナ", "home.kana.note": "文字を学ぶ",
      "progress.done": "完了", "progress.opened": "開きました", "progress.notStarted": "未開始", "progress.saved": "学習を保存", "progress.finished": "終了", "progress.continue": "前回の教材から続ける"
    },
    vi: {
      "language.button": "Ngôn ngữ", "language.title": "Chọn ngôn ngữ của bạn", "language.subtitle": "Tiếng Bangla vẫn là mặc định. Lựa chọn sẽ được ghi nhớ trên thiết bị này.", "language.close": "Đóng", "language.active": "Ngôn ngữ hiện tại",
      "brand.name": "Aponar Nihon", "brand.tagline": "Nền tảng học tiếng Nhật cho mọi người",
      "menu.main": "Trang chính", "menu.jlpt": "Học JLPT", "menu.practice": "Luyện tập & chuẩn bị", "menu.japan": "Cuộc sống Nhật & công cụ", "menu.home": "Trang chủ", "menu.home.note": "Tất cả mục quan trọng", "menu.n5.note": "Trung tâm học cho người mới", "menu.n4.note": "Trung tâm sơ trung cấp", "menu.n3.note": "Trung tâm trung cấp", "menu.quiz": "Quiz Arena", "menu.quiz.note": "Luyện theo cấp độ và chủ đề", "menu.tutor.note": "Gia sư tiếng Nhật cá nhân", "menu.mock.note": "Thi thử và ôn tập", "menu.interview": "Phỏng vấn", "menu.interview.note": "Việc làm, trường học, đại sứ quán, SSW", "menu.japanlife": "Cuộc sống ở Nhật", "menu.japanlife.note": "Hướng dẫn thực tế cho người mới", "menu.cv.note": "Tạo CV kiểu Nhật", "menu.toolkit.note": "Công cụ học tập và cuộc sống", "menu.profile.note": "Tiến độ và tài khoản", "menu.title": "Aponar Nihon", "menu.subtitle": "Toàn bộ ứng dụng học trong một menu", "menu.intro": "Mở trực tiếp mục bạn cần từ đây", "menu.footer": "Học tiếng Nhật bằng ngôn ngữ của bạn · あなたの日本", "menu.close": "Đóng menu",
      "home.search": "Tìm kanji, từ vựng, ngữ pháp…", "home.noResults": "Không tìm thấy—hãy thử N5, N4, N3, AI hoặc quiz", "home.eyebrow": "Mọi thứ ở một nơi", "home.title": "Các mục quan trọng", "home.n5.note": "Khóa cơ bản", "home.n4.note": "Bước tiếp theo", "home.n3.note": "Trung cấp", "home.quiz": "Quiz", "home.quiz.note": "Luyện miễn phí", "home.tutor": "AI Tutor", "home.tutor.note": "Hỏi bằng ngôn ngữ của bạn", "home.mock.note": "Luyện thi", "home.interview": "Phỏng vấn", "home.interview.note": "Việc làm & đại sứ quán", "home.ssw.note": "Hướng dẫn đầy đủ", "home.phrases": "Câu hữu ích", "home.phrases.note": "Hội thoại", "home.japanlife": "Cuộc sống Nhật", "home.japanlife.note": "Hướng dẫn người mới", "home.kana": "Hiragana & Katakana", "home.kana.note": "Học bảng chữ",
      "progress.done": "hoàn thành", "progress.opened": "Đã mở", "progress.notStarted": "Chưa bắt đầu", "progress.saved": "đã lưu tiến độ", "progress.finished": "xong", "progress.continue": "Tiếp tục từ tài liệu gần nhất"
    },
    ne: {
      "language.button": "भाषा", "language.title": "आफ्नो भाषा छान्नुहोस्", "language.subtitle": "बङ्गाली पूर्वनिर्धारित रहन्छ। तपाईंको छनोट यस उपकरणमा सुरक्षित हुन्छ।", "language.close": "बन्द", "language.active": "हालको भाषा", "brand.name": "Aponar Nihon", "brand.tagline": "सबैका लागि जापानी सिकाइ",
      "menu.main": "मुख्य", "menu.jlpt": "JLPT सिकाइ", "menu.practice": "अभ्यास र तयारी", "menu.japan": "जापान जीवन र उपयोगी उपकरण", "menu.home": "होम", "menu.home.note": "सबै महत्वपूर्ण भाग", "menu.n5.note": "शुरुआती सिकाइ केन्द्र", "menu.n4.note": "प्रारम्भिक सिकाइ केन्द्र", "menu.n3.note": "मध्यवर्ती सिकाइ केन्द्र", "menu.quiz": "क्विज Arena", "menu.quiz.note": "स्तर र विषय अनुसार अभ्यास", "menu.tutor.note": "तपाईंको व्यक्तिगत जापानी शिक्षक", "menu.mock.note": "नमुना परीक्षा र समीक्षा", "menu.interview": "अन्तर्वार्ता", "menu.interview.note": "काम, स्कूल, दूतावास र SSW", "menu.japanlife": "जापान जीवन", "menu.japanlife.note": "नयाँ आउनेका लागि व्यावहारिक गाइड", "menu.cv.note": "जापानी CV बनाउनुहोस्", "menu.toolkit.note": "जीवन र पढाइका उपकरण", "menu.profile.note": "प्रगति र खाता", "menu.title": "Aponar Nihon", "menu.subtitle": "एउटै मेनुमा पूरा सिकाइ एप", "menu.intro": "चाहिएको भाग यहाँबाट सिधै खोल्नुहोस्", "menu.footer": "आफ्नो भाषामा जापानी सिक्नुहोस् · あなたの日本", "menu.close": "मेनु बन्द",
      "home.search": "कान्जी, शब्दावली, व्याकरण खोज्नुहोस्…", "home.noResults": "केही भेटिएन—N5, N4, N3, AI वा quiz प्रयास गर्नुहोस्", "home.eyebrow": "सबै कुरा एउटै ठाउँमा", "home.title": "महत्वपूर्ण भागहरू", "home.n5.note": "आधारभूत कोर्स", "home.n4.note": "अर्को चरण", "home.n3.note": "मध्यवर्ती", "home.quiz": "क्विज", "home.quiz.note": "निःशुल्क अभ्यास", "home.tutor": "AI Tutor", "home.tutor.note": "आफ्नो भाषामा सोध्नुहोस्", "home.mock.note": "परीक्षा अभ्यास", "home.interview": "अन्तर्वार्ता", "home.interview.note": "काम र दूतावास", "home.ssw.note": "पूर्ण गाइड", "home.phrases": "उपयोगी वाक्य", "home.phrases.note": "कुराकानी", "home.japanlife": "जापान जीवन", "home.japanlife.note": "नयाँ आउनेका लागि", "home.kana": "हिरागाना र काताकाना", "home.kana.note": "लिपि सिक्नुहोस्", "progress.done": "पूरा", "progress.opened": "खोलिएको", "progress.notStarted": "सुरु भएको छैन", "progress.saved": "सिकाइ सुरक्षित", "progress.finished": "समाप्त", "progress.continue": "अन्तिम सामग्रीबाट जारी राख्नुहोस्"
    },
    hi: {
      "language.button": "भाषा", "language.title": "अपनी भाषा चुनें", "language.subtitle": "बांग्ला डिफ़ॉल्ट रहेगा। आपकी पसंद इस डिवाइस पर याद रखी जाएगी।", "language.close": "बंद करें", "language.active": "वर्तमान भाषा", "brand.name": "Aponar Nihon", "brand.tagline": "हर किसी के लिए जापानी सीखना",
      "menu.main": "मुख्य", "menu.jlpt": "JLPT सीखें", "menu.practice": "अभ्यास और तैयारी", "menu.japan": "जापान जीवन और उपयोगी टूल", "menu.home": "होम", "menu.home.note": "सभी महत्वपूर्ण सेक्शन", "menu.n5.note": "शुरुआती लर्निंग सेंटर", "menu.n4.note": "प्रारंभिक लर्निंग सेंटर", "menu.n3.note": "मध्यवर्ती लर्निंग सेंटर", "menu.quiz": "क्विज Arena", "menu.quiz.note": "लेवल और कैटेगरी के अनुसार अभ्यास", "menu.tutor.note": "आपका निजी जापानी कोच", "menu.mock.note": "मॉक परीक्षा और रिव्यू", "menu.interview": "इंटरव्यू", "menu.interview.note": "जॉब, स्कूल, दूतावास और SSW", "menu.japanlife": "जापान लाइफ", "menu.japanlife.note": "नए लोगों के लिए प्रैक्टिकल गाइड", "menu.cv.note": "जापानी रिज़्यूमे बनाएं", "menu.toolkit.note": "जीवन और पढ़ाई के टूल", "menu.profile.note": "प्रगति और अकाउंट", "menu.title": "Aponar Nihon", "menu.subtitle": "एक मेनु में पूरा लर्निंग ऐप", "menu.intro": "ज़रूरी सेक्शन यहां से सीधे खोलें", "menu.footer": "अपनी भाषा में जापानी सीखें · あなたの日本", "menu.close": "मेनु बंद करें",
      "home.search": "कान्जी, शब्दावली, व्याकरण खोजें…", "home.noResults": "कुछ नहीं मिला—N5, N4, N3, AI या quiz आज़माएं", "home.eyebrow": "सब कुछ एक जगह", "home.title": "सभी महत्वपूर्ण सेक्शन", "home.n5.note": "बेसिक कोर्स", "home.n4.note": "अगला चरण", "home.n3.note": "मध्यवर्ती", "home.quiz": "क्विज", "home.quiz.note": "फ्री अभ्यास", "home.tutor": "AI Tutor", "home.tutor.note": "अपनी भाषा में पूछें", "home.mock.note": "परीक्षा अभ्यास", "home.interview": "इंटरव्यू", "home.interview.note": "जॉब और दूतावास", "home.ssw.note": "पूरा गाइड", "home.phrases": "उपयोगी वाक्य", "home.phrases.note": "बातचीत", "home.japanlife": "जापान लाइफ", "home.japanlife.note": "नए लोगों का गाइड", "home.kana": "हिरागाना और काताकाना", "home.kana.note": "लिपि सीखें", "progress.done": "पूरा", "progress.opened": "खोला गया", "progress.notStarted": "शुरू नहीं", "progress.saved": "सीखना सुरक्षित", "progress.finished": "समाप्त", "progress.continue": "पिछले रिसोर्स से जारी रखें"
    },
    ur: {
      "language.button": "زبان", "language.title": "اپنی زبان منتخب کریں", "language.subtitle": "بنگلہ بطور ڈیفالٹ رہے گی۔ آپ کا انتخاب اس ڈیوائس پر محفوظ رہے گا۔", "language.close": "بند کریں", "language.active": "موجودہ زبان", "brand.name": "Aponar Nihon", "brand.tagline": "ہر کسی کے لیے جاپانی سیکھنے کا پلیٹ فارم",
      "menu.main": "مرکزی", "menu.jlpt": "JLPT سیکھیں", "menu.practice": "مشق اور تیاری", "menu.japan": "جاپان زندگی اور مفید ٹولز", "menu.home": "ہوم", "menu.home.note": "تمام اہم حصے", "menu.n5.note": "ابتدائی لرننگ سینٹر", "menu.n4.note": "بنیادی لرننگ سینٹر", "menu.n3.note": "درمیانی لرننگ سینٹر", "menu.quiz": "کوئز Arena", "menu.quiz.note": "لیول اور کیٹیگری کے مطابق مشق", "menu.tutor.note": "آپ کا ذاتی جاپانی کوچ", "menu.mock.note": "نمونہ امتحان اور جائزہ", "menu.interview": "انٹرویو", "menu.interview.note": "ملازمت، اسکول، سفارت خانہ اور SSW", "menu.japanlife": "جاپان لائف", "menu.japanlife.note": "نئے آنے والوں کے لیے عملی گائیڈ", "menu.cv.note": "جاپانی ریزیومے بنائیں", "menu.toolkit.note": "زندگی اور پڑھائی کے ٹولز", "menu.profile.note": "پیش رفت اور اکاؤنٹ", "menu.title": "Aponar Nihon", "menu.subtitle": "ایک مینو میں مکمل لرننگ ایپ", "menu.intro": "ضروری حصہ یہاں سے براہ راست کھولیں", "menu.footer": "اپنی زبان میں جاپانی سیکھیں · あなたの日本", "menu.close": "مینو بند کریں",
      "home.search": "کانجی، الفاظ، گرامر تلاش کریں…", "home.noResults": "کچھ نہیں ملا—N5، N4، N3، AI یا quiz آزمائیں", "home.eyebrow": "سب کچھ ایک جگہ", "home.title": "تمام اہم حصے", "home.n5.note": "بنیادی کورس", "home.n4.note": "اگلا مرحلہ", "home.n3.note": "درمیانی", "home.quiz": "کوئز", "home.quiz.note": "مفت مشق", "home.tutor": "AI Tutor", "home.tutor.note": "اپنی زبان میں پوچھیں", "home.mock.note": "امتحان کی مشق", "home.interview": "انٹرویو", "home.interview.note": "ملازمت اور سفارت خانہ", "home.ssw.note": "مکمل گائیڈ", "home.phrases": "ضروری جملے", "home.phrases.note": "گفتگو", "home.japanlife": "جاپان لائف", "home.japanlife.note": "نئے لوگوں کی گائیڈ", "home.kana": "ہیراگانا اور کاتاکانا", "home.kana.note": "حروف سیکھیں", "progress.done": "مکمل", "progress.opened": "کھولا گیا", "progress.notStarted": "شروع نہیں ہوا", "progress.saved": "پیش رفت محفوظ", "progress.finished": "ختم", "progress.continue": "آخری مواد سے جاری رکھیں"
    },
    my: {
      "language.button": "ဘာသာစကား", "language.title": "သင့်ဘာသာစကားကို ရွေးပါ", "language.subtitle": "ဘင်္ဂါလီကို မူလဘာသာအဖြစ်ထားမည်။ ရွေးချယ်မှုကို ဤစက်တွင် မှတ်ထားမည်။", "language.close": "ပိတ်ရန်", "language.active": "လက်ရှိဘာသာစကား", "brand.name": "Aponar Nihon", "brand.tagline": "လူတိုင်းအတွက် ဂျပန်စာလေ့လာရေး",
      "menu.main": "ပင်မ", "menu.jlpt": "JLPT လေ့လာရန်", "menu.practice": "လေ့ကျင့်မှုနှင့် ပြင်ဆင်မှု", "menu.japan": "ဂျပန်ဘဝနှင့် အသုံးဝင်သောကိရိယာများ", "menu.home": "ပင်မစာမျက်နှာ", "menu.home.note": "အရေးကြီးသောအပိုင်းအားလုံး", "menu.n5.note": "စတင်သူ လေ့လာရေးစင်တာ", "menu.n4.note": "အခြေခံ လေ့လာရေးစင်တာ", "menu.n3.note": "အလယ်အလတ် လေ့လာရေးစင်တာ", "menu.quiz": "Quiz Arena", "menu.quiz.note": "အဆင့်နှင့် အမျိုးအစားအလိုက် လေ့ကျင့်ရန်", "menu.tutor.note": "သင့်ကိုယ်ပိုင် ဂျပန်စာဆရာ", "menu.mock.note": "စာမေးပွဲစမ်းသပ်မှုနှင့် ပြန်လည်သုံးသပ်မှု", "menu.interview": "အင်တာဗျူး", "menu.interview.note": "အလုပ်၊ ကျောင်း၊ သံရုံးနှင့် SSW", "menu.japanlife": "ဂျပန်ဘဝ", "menu.japanlife.note": "အသစ်ရောက်သူများအတွက် လက်တွေ့လမ်းညွှန်", "menu.cv.note": "ဂျပန် CV ပြုလုပ်ရန်", "menu.toolkit.note": "ဘဝနှင့် စာသင်ကိရိယာများ", "menu.profile.note": "တိုးတက်မှုနှင့် အကောင့်", "menu.title": "Aponar Nihon", "menu.subtitle": "မီနူးတစ်ခုထဲတွင် လေ့လာရေး app အားလုံး", "menu.intro": "လိုအပ်သောအပိုင်းကို ဤနေရာမှ တိုက်ရိုက်ဖွင့်ပါ", "menu.footer": "မိမိဘာသာစကားဖြင့် ဂျပန်စာလေ့လာပါ · あなたの日本", "menu.close": "မီနူးပိတ်ရန်",
      "home.search": "Kanji၊ ဝေါဟာရ၊ သဒ္ဒါ ရှာရန်…", "home.noResults": "မတွေ့ပါ—N5, N4, N3, AI သို့မဟုတ် quiz ကို စမ်းပါ", "home.eyebrow": "အားလုံးတစ်နေရာတည်း", "home.title": "အရေးကြီးသောအပိုင်းများ", "home.n5.note": "အခြေခံသင်တန်း", "home.n4.note": "နောက်တစ်ဆင့်", "home.n3.note": "အလယ်အလတ်", "home.quiz": "Quiz", "home.quiz.note": "အခမဲ့လေ့ကျင့်ရန်", "home.tutor": "AI Tutor", "home.tutor.note": "မိမိဘာသာစကားဖြင့် မေးရန်", "home.mock.note": "စာမေးပွဲလေ့ကျင့်မှု", "home.interview": "အင်တာဗျူး", "home.interview.note": "အလုပ်နှင့် သံရုံး", "home.ssw.note": "လမ်းညွှန်အပြည့်အစုံ", "home.phrases": "အသုံးဝင်သောစကားစုများ", "home.phrases.note": "စကားပြော", "home.japanlife": "ဂျပန်ဘဝ", "home.japanlife.note": "အသစ်ရောက်သူလမ်းညွှန်", "home.kana": "Hiragana & Katakana", "home.kana.note": "အက္ခရာလေ့လာရန်", "progress.done": "ပြီးစီး", "progress.opened": "ဖွင့်ပြီး", "progress.notStarted": "မစရသေး", "progress.saved": "တိုးတက်မှုသိမ်းထား", "progress.finished": "ပြီး", "progress.continue": "နောက်ဆုံးသင်ခန်းစာမှ ဆက်ရန်"
    },
    zh: {
      "language.button": "语言", "language.title": "选择你的语言", "language.subtitle": "孟加拉语保持为默认语言。你的选择会保存在此设备上。", "language.close": "关闭", "language.active": "当前语言", "brand.name": "Aponar Nihon", "brand.tagline": "面向所有人的日语学习平台",
      "menu.main": "主页", "menu.jlpt": "JLPT学习", "menu.practice": "练习与准备", "menu.japan": "日本生活与实用工具", "menu.home": "首页", "menu.home.note": "所有重要板块", "menu.n5.note": "初学者学习中心", "menu.n4.note": "初级学习中心", "menu.n3.note": "中级学习中心", "menu.quiz": "Quiz Arena", "menu.quiz.note": "按级别和类别练习", "menu.tutor.note": "你的私人日语教练", "menu.mock.note": "模拟考试与复习", "menu.interview": "面试", "menu.interview.note": "工作、学校、使馆与SSW", "menu.japanlife": "日本生活", "menu.japanlife.note": "新来日本者实用指南", "menu.cv.note": "制作日式简历", "menu.toolkit.note": "生活与学习工具", "menu.profile.note": "进度与账号", "menu.title": "Aponar Nihon", "menu.subtitle": "一个菜单管理整个学习应用", "menu.intro": "从这里直接打开需要的板块", "menu.footer": "用自己的语言学习日语 · あなたの日本", "menu.close": "关闭菜单",
      "home.search": "搜索汉字、词汇、语法…", "home.noResults": "未找到—试试 N5、N4、N3、AI 或 quiz", "home.eyebrow": "全部集中在一处", "home.title": "重要板块", "home.n5.note": "基础课程", "home.n4.note": "下一步", "home.n3.note": "中级", "home.quiz": "测验", "home.quiz.note": "免费练习", "home.tutor": "AI Tutor", "home.tutor.note": "用你的语言提问", "home.mock.note": "考试练习", "home.interview": "面试", "home.interview.note": "工作与使馆", "home.ssw.note": "完整指南", "home.phrases": "实用短语", "home.phrases.note": "会话", "home.japanlife": "日本生活", "home.japanlife.note": "新手指南", "home.kana": "平假名与片假名", "home.kana.note": "学习假名", "progress.done": "已完成", "progress.opened": "已打开", "progress.notStarted": "未开始", "progress.saved": "学习进度已保存", "progress.finished": "完成", "progress.continue": "从上次的学习资源继续"
    },
    si: {
      "language.button": "භාෂාව", "language.title": "ඔබගේ භාෂාව තෝරන්න", "language.subtitle": "බංග්ලා පෙරනිමි භාෂාව ලෙස පවතී. ඔබගේ තේරීම මෙම උපාංගයේ සුරැකේ.", "language.close": "වසන්න", "language.active": "දැනට තෝරාගත් භාෂාව", "brand.name": "Aponar Nihon", "brand.tagline": "සියලු දෙනා සඳහා ජපන් භාෂා ඉගෙනීම",
      "menu.main": "ප්‍රධාන", "menu.jlpt": "JLPT ඉගෙනීම", "menu.practice": "පුහුණුව සහ සූදානම", "menu.japan": "ජපාන ජීවිතය සහ මෙවලම්", "menu.home": "මුල් පිටුව", "menu.home.note": "සියලු වැදගත් කොටස්", "menu.n5.note": "ආරම්භක ඉගෙනුම් මධ්‍යස්ථානය", "menu.n4.note": "මූලික ඉගෙනුම් මධ්‍යස්ථානය", "menu.n3.note": "මධ්‍යම මට්ටමේ ඉගෙනුම් මධ්‍යස්ථානය", "menu.quiz": "ප්‍රශ්නාවලි Arena", "menu.quiz.note": "මට්ටම සහ කාණ්ඩය අනුව පුහුණුව", "menu.tutor.note": "ඔබගේ පුද්ගලික ජපන් භාෂා උපදේශකයා", "menu.mock.note": "ආදර්ශ විභාග සහ සමාලෝචනය", "menu.interview": "සම්මුඛ පරීක්ෂණ", "menu.interview.note": "රැකියා, පාසල්, තානාපති කාර්යාල සහ SSW", "menu.japanlife": "ජපාන ජීවිතය", "menu.japanlife.note": "නවකයන් සඳහා ප්‍රායෝගික මාර්ගෝපදේශය", "menu.cv.note": "ජපන් ආකාරයේ CV එකක් සාදන්න", "menu.toolkit.note": "ජීවිතය සහ අධ්‍යයනය සඳහා මෙවලම්", "menu.profile.note": "ප්‍රගතිය සහ ගිණුම", "menu.title": "Aponar Nihon", "menu.subtitle": "සම්පූර්ණ ඉගෙනුම් app එක එකම මෙනුවක", "menu.intro": "ඔබට අවශ්‍ය කොටස මෙතැනින් සෘජුව විවෘත කරන්න", "menu.footer": "ඔබගේම භාෂාවෙන් ජපන් භාෂාව ඉගෙන ගන්න · あなたの日本", "menu.close": "මෙනුව වසන්න",
      "home.search": "කන්ජි, වචන මාලාව, ව්‍යාකරණ සොයන්න…", "home.noResults": "කිසිවක් හමු නොවීය—N5, N4, N3, AI හෝ quiz උත්සාහ කරන්න", "home.eyebrow": "සියල්ල එකම තැනක", "home.title": "සියලු වැදගත් කොටස්", "home.n5.note": "මූලික පාඨමාලාව", "home.n4.note": "ඊළඟ පියවර", "home.n3.note": "මධ්‍යම මට්ටම", "home.quiz": "ප්‍රශ්නාවලිය", "home.quiz.note": "නොමිලේ පුහුණුව", "home.tutor": "AI Tutor", "home.tutor.note": "ඔබගේ භාෂාවෙන් අසන්න", "home.mock.note": "විභාග පුහුණුව", "home.interview": "සම්මුඛ පරීක්ෂණ", "home.interview.note": "රැකියා සහ තානාපති කාර්යාල", "home.ssw.note": "සම්පූර්ණ මාර්ගෝපදේශය", "home.phrases": "ප්‍රයෝජනවත් වාක්‍ය", "home.phrases.note": "සංවාද", "home.japanlife": "ජපාන ජීවිතය", "home.japanlife.note": "නවකයන්ගේ මාර්ගෝපදේශය", "home.kana": "හිරගනා සහ කතකනා", "home.kana.note": "අක්ෂර ඉගෙන ගන්න", "progress.done": "සම්පූර්ණයි", "progress.opened": "විවෘත කර ඇත", "progress.notStarted": "තවම ආරම්භ කර නැත", "progress.saved": "ඉගෙනුම් ප්‍රගතිය සුරැකිණි", "progress.finished": "අවසන්", "progress.continue": "අවසන් වරට බැලූ පාඩමෙන් ඉදිරියට යන්න"
    },
    fil: {
      "language.button": "Wika", "language.title": "Piliin ang iyong wika", "language.subtitle": "Mananatiling default ang Bangla. Tatandaan sa device na ito ang pinili mo.", "language.close": "Isara", "language.active": "Kasalukuyang wika", "brand.name": "Aponar Nihon", "brand.tagline": "Pag-aaral ng Japanese para sa lahat",
      "menu.main": "Pangunahin", "menu.jlpt": "Mag-aral ng JLPT", "menu.practice": "Pagsasanay at paghahanda", "menu.japan": "Buhay sa Japan at mga tool", "menu.home": "Home", "menu.home.note": "Lahat ng mahalagang seksyon", "menu.n5.note": "Learning center para sa baguhan", "menu.n4.note": "Elementary learning center", "menu.n3.note": "Intermediate learning center", "menu.quiz": "Quiz Arena", "menu.quiz.note": "Magsanay ayon sa level at category", "menu.tutor.note": "Personal mong Japanese coach", "menu.mock.note": "Mock exam at review", "menu.interview": "Interview", "menu.interview.note": "Trabaho, paaralan, embahada at SSW", "menu.japanlife": "Buhay sa Japan", "menu.japanlife.note": "Praktikal na gabay para sa mga bagong dating", "menu.cv.note": "Gumawa ng Japanese-style CV", "menu.toolkit.note": "Mga tool para sa buhay at pag-aaral", "menu.profile.note": "Progress at account", "menu.title": "Aponar Nihon", "menu.subtitle": "Buong learning app sa iisang menu", "menu.intro": "Buksan dito mismo ang seksyong kailangan mo", "menu.footer": "Mag-aral ng Japanese sa sarili mong wika · あなたの日本", "menu.close": "Isara ang menu",
      "home.search": "Maghanap ng kanji, vocabulary, grammar…", "home.noResults": "Walang nakita—subukan ang N5, N4, N3, AI o quiz", "home.eyebrow": "Lahat sa iisang lugar", "home.title": "Lahat ng mahalagang seksyon", "home.n5.note": "Basic course", "home.n4.note": "Susunod na hakbang", "home.n3.note": "Intermediate", "home.quiz": "Quiz", "home.quiz.note": "Libreng pagsasanay", "home.tutor": "AI Tutor", "home.tutor.note": "Magtanong sa sarili mong wika", "home.mock.note": "Pagsasanay para sa exam", "home.interview": "Interview", "home.interview.note": "Trabaho at embahada", "home.ssw.note": "Kumpletong gabay", "home.phrases": "Mahahalagang parirala", "home.phrases.note": "Conversation", "home.japanlife": "Buhay sa Japan", "home.japanlife.note": "Gabay para sa bagong dating", "home.kana": "Hiragana at Katakana", "home.kana.note": "Aralin ang mga character", "progress.done": "tapos", "progress.opened": "Nabuksan", "progress.notStarted": "Hindi pa nasisimulan", "progress.saved": "Naka-save ang progress", "progress.finished": "tapos", "progress.continue": "Magpatuloy mula sa huling lesson"
    }
  };

  var BRAND_NAME = "আপনার নিহোন";
  Object.keys(MESSAGES).forEach(function (language) {
    MESSAGES[language]["brand.name"] = BRAND_NAME;
    MESSAGES[language]["menu.title"] = BRAND_NAME;
  });

  var currentLanguage = DEFAULT_LANGUAGE;
  var profileSyncInFlight = false;

  function normalizeLanguage(value) {
    if (typeof value !== "string") return "";
    var raw = value.trim();
    if (!raw) return "";
    var lowered = raw.toLocaleLowerCase();
    if (LANGUAGES[lowered]) return lowered;
    if (LANGUAGE_ALIASES[lowered]) return LANGUAGE_ALIASES[lowered];
    var match = Object.keys(LANGUAGES).find(function (code) {
      return LANGUAGES[code].label === raw || LANGUAGES[code].label.toLocaleLowerCase() === lowered;
    });
    return match || "";
  }

  function languageFromPath() {
    var preset = document.documentElement.dataset.languagePreset || "";
    // Native HTML is tagged as Bangla, but an explicit saved choice still applies.
    // Only a non-Bangla locale preset or an actual locale URL overrides storage.
    if (preset !== DEFAULT_LANGUAGE && LANGUAGES[preset]) return preset;
    var first = (window.location.pathname || "/").split("/").filter(Boolean)[0] || "";
    try { first = decodeURIComponent(first); } catch (_error) { /* Keep the raw segment. */ }
    return LANGUAGES[first] ? first : "";
  }

  function storedLanguage() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY) || "";
      return normalizeLanguage(saved);
    } catch (_error) {
      return "";
    }
  }

  function readLanguage() {
    return languageFromPath() || storedLanguage() || DEFAULT_LANGUAGE;
  }

  function rememberLanguage(language) {
    try { localStorage.setItem(STORAGE_KEY, language); } catch (_error) { /* no-op */ }
  }

  function normalizedRoute(pathname) {
    var path = pathname || "/";
    path = path.replace(/\/index\.html$/i, "/").replace(/\.html$/i, "");
    if (path.length > 1) path = path.replace(/\/+$/, "");
    return path || "/";
  }

  function isHomeRoute() {
    var route = normalizedRoute(window.location.pathname);
    if (route === "/") return true;
    var parts = route.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    return parts.length === 1 && !!normalizeLanguage(parts[0]);
  }

  function alternatePath(language) {
    var link = document.querySelector('link[rel~="alternate"][hreflang="' + language + '"]');
    if (!link || !link.href) return "";
    try {
      var target = new URL(link.href, window.location.href);
      target.search = window.location.search;
      target.hash = window.location.hash;
      return target.pathname + target.search + target.hash;
    } catch (_error) {
      return "";
    }
  }

  function navigateToLanguage(language, replace) {
    var target = alternatePath(language);
    if (!target) return false;
    var targetUrl = new URL(target, window.location.href);
    if (normalizedRoute(targetUrl.pathname) === normalizedRoute(window.location.pathname)) return false;
    if (replace) window.location.replace(target);
    else window.location.assign(target);
    return true;
  }

  function persistProfileLanguage(language) {
    language = normalizeLanguage(language);
    if (!language) return;
    if (!window.AN || typeof window.AN.updateProfile !== "function") return;
    Promise.resolve(window.AN.updateProfile({ preferred_language: language })).catch(function () {
      // Local preference remains authoritative when profile sync is unavailable.
    });
  }

  function mountProfileLanguageSelect(preferred) {
    var select = document.getElementById("language");
    if (!select || select.tagName !== "SELECT") return;
    var profilePath = /\/(?:profile(?:\.html)?)(?:\/)?$/i.test(window.location.pathname || "");
    if (!profilePath && !select.hasAttribute("data-aponar-language-profile")) return;

    var selected = normalizeLanguage(preferred) || normalizeLanguage(select.value) || currentLanguage;
    select.textContent = "";
    Object.keys(LANGUAGES).forEach(function (code) {
      var option = document.createElement("option");
      option.value = code;
      option.textContent = LANGUAGES[code].flag + " " + LANGUAGES[code].label;
      select.appendChild(option);
    });
    select.value = selected;
    select.dataset.aponarLanguageProfile = "true";
    var profileField = select.closest(".field");
    if (profileField) {
      profileField.hidden = true;
      profileField.setAttribute("aria-hidden", "true");
    } else {
      select.hidden = true;
      select.setAttribute("aria-hidden", "true");
    }
    if (select.dataset.aponarLanguageBound !== "true") {
      select.dataset.aponarLanguageBound = "true";
      select.addEventListener("change", function () {
        setLanguage(select.value, { persistProfile: false });
      });
    }
  }

  async function syncProfileLanguage() {
    if (profileSyncInFlight || !window.AN || typeof window.AN.profile !== "function") return;
    profileSyncInFlight = true;
    try {
      var profile = await window.AN.profile();
      if (!profile) return;
      var rawPreferred = typeof profile.preferred_language === "string" ? profile.preferred_language.trim() : "";
      var preferred = normalizeLanguage(rawPreferred);
      mountProfileLanguageSelect(preferred);
      var local = languageFromPath() || storedLanguage();
      if (local && rawPreferred !== local && typeof window.AN.updateProfile === "function") {
        await window.AN.updateProfile({ preferred_language: local });
      } else if (!local && preferred) {
        setLanguage(preferred, { persistProfile: false });
        navigateToLanguage(preferred, true);
      }
    } catch (_error) {
      // Authentication/profile access is optional; device persistence still works.
    } finally {
      profileSyncInFlight = false;
    }
  }

  function t(key, fallback) {
    var locale = MESSAGES[currentLanguage] || MESSAGES[DEFAULT_LANGUAGE];
    return (locale && locale[key]) || (MESSAGES[DEFAULT_LANGUAGE] && MESSAGES[DEFAULT_LANGUAGE][key]) || fallback || key;
  }

  function applyDocumentLanguage() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = RTL_LANGUAGES[currentLanguage] ? "rtl" : "ltr";
    document.documentElement.dataset.language = currentLanguage;
  }

  function translateAnnotated(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("[data-i18n]").forEach(function (element) {
      var key = element.dataset.i18n;
      if (!key) return;
      element.textContent = t(key, element.textContent);
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      var key = element.dataset.i18nPlaceholder;
      if (key) element.setAttribute("placeholder", t(key, element.getAttribute("placeholder") || ""));
    });
    scope.querySelectorAll("[data-i18n-aria-label]").forEach(function (element) {
      var key = element.dataset.i18nAriaLabel;
      if (key) element.setAttribute("aria-label", t(key, element.getAttribute("aria-label") || ""));
    });
  }

  function updatePicker() {
    var button = document.getElementById("aponarLanguageButton");
    if (button) {
      var label = LANGUAGES[currentLanguage];
      button.querySelector("[data-language-flag]").textContent = label.flag;
      button.querySelector("[data-language-label]").textContent = label.label;
      button.querySelector("[data-language-code]").textContent = label.short;
      button.setAttribute("aria-label", t("language.button", "Language") + ": " + label.label);
    }
    document.querySelectorAll("[data-language-option]").forEach(function (option) {
      var active = option.dataset.languageOption === currentLanguage;
      option.classList.toggle("active", active);
      if (active) option.setAttribute("aria-current", "true");
      else option.removeAttribute("aria-current");
    });
    var title = document.querySelector("[data-language-title]");
    var subtitle = document.querySelector("[data-language-subtitle]");
    var close = document.querySelector("[data-language-close-label]");
    if (title) title.textContent = t("language.title", "Choose language");
    if (subtitle) subtitle.textContent = t("language.subtitle", "");
    if (close) close.textContent = t("language.close", "Close");
    document.querySelectorAll("[data-language-close]").forEach(function (element) {
      element.setAttribute("aria-label", t("language.close", "Close"));
    });
  }

  function setLanguage(language, options) {
    language = normalizeLanguage(language) || DEFAULT_LANGUAGE;
    currentLanguage = language;
    if (!options || options.persist !== false) {
      rememberLanguage(currentLanguage);
    }
    applyDocumentLanguage();
    translateAnnotated(document);
    updatePicker();
    window.dispatchEvent(new CustomEvent("aponar:languagechange", { detail: { language: currentLanguage } }));
    if (!options || options.persistProfile !== false) persistProfileLanguage(currentLanguage);
  }

  function closePicker() {
    var layer = document.getElementById("aponarLanguageLayer");
    if (!layer) return;
    layer.classList.remove("open");
    window.setTimeout(function () { layer.hidden = true; }, 180);
    document.body.classList.remove("aponar-language-open");
    var button = document.getElementById("aponarLanguageButton");
    if (button) button.focus({ preventScroll: true });
  }

  function openPicker() {
    var layer = document.getElementById("aponarLanguageLayer");
    if (!layer) return;
    layer.hidden = false;
    document.body.classList.add("aponar-language-open");
    window.requestAnimationFrame(function () {
      layer.classList.add("open");
      var active = layer.querySelector("[data-language-option].active");
      if (active) active.focus({ preventScroll: true });
    });
  }

  function mountPicker() {
    if (!isHomeRoute()) return;
    if (document.getElementById("aponarLanguageButton")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "aponar-language-button";
    button.id = "aponarLanguageButton";
    button.innerHTML = '<span class="aponar-language-globe" aria-hidden="true">🌐</span>' +
      '<span class="aponar-language-current-flag" data-language-flag>🇧🇩</span>' +
      '<span class="aponar-language-current-label" data-language-label>বাংলা</span>' +
      '<span class="aponar-language-current-code" data-language-code>BN</span>' +
      '<span class="aponar-language-chevron" aria-hidden="true">▾</span>';
    button.addEventListener("click", openPicker);

    var actions = document.querySelector(".app-top-actions, .lh-top-actions, .tutor-top-actions");
    if (actions) actions.insertBefore(button, actions.firstChild);
    else {
      button.classList.add("aponar-language-floating");
      document.body.appendChild(button);
    }

    var options = Object.keys(LANGUAGES).map(function (code) {
      var item = LANGUAGES[code];
      var direction = RTL_LANGUAGES[code] ? ' dir="rtl"' : '';
      return '<button type="button" class="aponar-language-option" data-language-option="' + code + '"' + direction + '>' +
        '<span class="aponar-language-flag" aria-hidden="true">' + item.flag + '</span>' +
        '<span class="aponar-language-option-copy"><span class="aponar-language-native" lang="' + code + '">' + item.label + '</span>' +
        '<span class="aponar-language-code">' + item.short + '</span></span>' +
        '<span class="aponar-language-check" aria-hidden="true">✓</span></button>';
    }).join("");

    var layer = document.createElement("div");
    layer.className = "aponar-language-layer";
    layer.id = "aponarLanguageLayer";
    layer.hidden = true;
    layer.innerHTML = '<button class="aponar-language-backdrop" type="button" data-language-close aria-label="Close"></button>' +
      '<section class="aponar-language-sheet" role="dialog" aria-modal="true" aria-labelledby="aponarLanguageTitle">' +
      '<div class="aponar-language-head"><div><h2 id="aponarLanguageTitle" data-language-title></h2><p data-language-subtitle></p></div><button type="button" class="aponar-language-x" data-language-close aria-label="Close"><span aria-hidden="true">×</span></button></div>' +
      '<div class="aponar-language-grid">' + options + '</div>' +
      '<button type="button" class="aponar-language-done" data-language-close><span data-language-close-label></span></button>' +
      '</section>';
    document.body.appendChild(layer);

    layer.addEventListener("click", function (event) {
      var option = event.target.closest("[data-language-option]");
      if (option) {
        var chosen = option.dataset.languageOption;
        setLanguage(chosen);
        closePicker();
        window.setTimeout(function () { navigateToLanguage(chosen, false); }, 40);
        return;
      }
      if (event.target.closest("[data-language-close]")) closePicker();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !layer.hidden) closePicker();
    });

    updatePicker();
  }

  currentLanguage = readLanguage();
  if (languageFromPath()) rememberLanguage(currentLanguage);
  applyDocumentLanguage();

  window.AponarI18n = {
    languages: LANGUAGES,
    defaultLanguage: DEFAULT_LANGUAGE,
    normalizeLanguage: normalizeLanguage,
    mountProfileLanguageSelect: mountProfileLanguageSelect,
    getLanguage: function () { return currentLanguage; },
    setLanguage: setLanguage,
    localizedPath: alternatePath,
    t: t,
    translate: translateAnnotated,
    register: function (language, messages) {
      if (!LANGUAGES[language] || !messages || typeof messages !== "object") return;
      MESSAGES[language] = Object.assign({}, MESSAGES[language] || {}, messages);
      if (language === currentLanguage) {
        translateAnnotated(document);
        window.dispatchEvent(new CustomEvent("aponar:languagechange", { detail: { language: currentLanguage } }));
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    mountPicker();
    mountProfileLanguageSelect(storedLanguage() || currentLanguage);
    if (currentLanguage !== DEFAULT_LANGUAGE) translateAnnotated(document);
    if (currentLanguage !== DEFAULT_LANGUAGE || languageFromPath()) {
      window.setTimeout(function () { navigateToLanguage(currentLanguage, true); }, 0);
    }
    window.setTimeout(syncProfileLanguage, 500);
    window.setTimeout(syncProfileLanguage, 1600);
  });
  window.addEventListener("an-auth-changed", syncProfileLanguage);
  window.addEventListener("an-profile-updated", function (event) {
    var detail = event && event.detail ? event.detail : {};
    mountProfileLanguageSelect(detail.preferred_language || storedLanguage() || currentLanguage);
  });
})();
