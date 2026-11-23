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
    window.dispatchEvent(new CustomEvent("aponar:beforelanguagechange", { detail: { language: language } }));
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
    // The picker is available on every page, not only the home route: the
    // saved choice applies site-wide, so the control to change it must also
    // be reachable site-wide. Pages whose header has no actions container
    // get the floating-button fallback below.
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
    sourceDictionary: function (language) {
      var result = new Map(), target = MESSAGES[language] || {};
      Object.keys(target).forEach(function (key) {
        Object.keys(MESSAGES).forEach(function (sourceLanguage) {
          var source = MESSAGES[sourceLanguage][key];
          if (source && target[key]) result.set(String(source).replace(/\s+/g, " ").trim(), target[key]);
        });
      });
      return result;
    },
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
      // Redirect synchronously, not via setTimeout: this handler was
      // registered before i18n-content.js's startRuntime handler, so
      // initiating the navigation here means the move to the reviewed
      // static version begins before the runtime translator can start
      // an in-place pass on this master page (Run 13). When there is
      // no static version, navigateToLanguage returns false and the
      // runtime fallback proceeds exactly as before.
      navigateToLanguage(currentLanguage, true);
    }
    window.setTimeout(syncProfileLanguage, 500);
    window.setTimeout(syncProfileLanguage, 1600);
  });
  window.addEventListener("an-auth-changed", syncProfileLanguage);
  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY) return;
    var language = normalizeLanguage(event.newValue) || DEFAULT_LANGUAGE;
    if (language !== currentLanguage) setLanguage(language, { persist: false, persistProfile: false });
  });
  window.addEventListener("an-profile-updated", function (event) {
    var detail = event && event.detail ? event.detail : {};
    mountProfileLanguageSelect(detail.preferred_language || storedLanguage() || currentLanguage);
  });
})();



/* ==== Run 11: dynamic UI strings (window.AponarDyn) ====
   Renderers of JS-built UI chrome (counters, progress, toggles, empty
   states) resolve through AponarDyn so static localized pages show their
   own language instead of Bengali. Language signal: the page's own
   data-language-preset, else the URL's first segment, else bn. Storage
   is never consulted, and Bengali master pages render exactly as before
   (bn values are the original strings). Placeholder and dashboard
   data-label attributes (never extracted into the packs) are rewritten
   on localized routes only, by exact Bengali source match. */
(function () {
  "use strict";
  var DYN = {
    "ag.progress": {"bn":"{done}/{total} সম্পন্ন","en":"{done}/{total} completed","ja":"{done}/{total} 完了","vi":"Đã hoàn thành {done}/{total}","ne":"{done}/{total} सकियो","hi":"{done}/{total} पूर्ण","ur":"{done}/{total} مکمل","my":"{done}/{total} ပြီးဆုံး","zh":"{done}/{total} 完成","si":"{done}/{total} අවසන්","fil":"{done}/{total} tapos"},
    "dn.allArchive": {"bn":"আগের সব নিউজ","en":"All previous news","ja":"過去のニュースすべて","vi":"Tất cả tin trước","ne":"अघिल्ला सबै समाचार","hi":"पिछले सभी समाचार","ur":"تمام پچھلی خبریں","my":"ယခင် သတင်း အားလုံး","zh":"全部过往新闻","si":"පෙර සියලුම පුවත්","fil":"Lahat ng nakaraang balita"},
    "dn.allNews": {"bn":"সব নিউজ","en":"All news","ja":"すべてのニュース","vi":"Tất cả tin","ne":"सबै समाचार","hi":"सभी समाचार","ur":"تمام خبریں","my":"သတင်း အားလုံး","zh":"全部新闻","si":"සියලුම පුවත්","fil":"Lahat ng balita"},
    "dn.archiveFail": {"bn":"নিউজ আর্কাইভ লোড করা যায়নি।","en":"The news archive could not be loaded.","ja":"ニュースアーカイブを読み込めませんでした。","vi":"Không tải được kho lưu trữ tin.","ne":"समाचार अभिलेख load गर्न सकिएन।","hi":"समाचार संग्रह load नहीं हो सका।","ur":"خبروں کا آرکائیو لوڈ نہیں ہو سکا۔","my":"သတင်း မှတ်တမ်း ဖွင့်၍ မရပါ။","zh":"新闻存档加载失败。","si":"පුවත් ලේඛනාගාරය පූරණය කළ නොහැකි විය.","fil":"Hindi ma-load ang news archive."},
    "dn.autoUpdate": {"bn":"স্বয়ংক্রিয় আপডেট · প্রতি ৩ ঘণ্টায় উৎস যাচাই","en":"Auto update · source checked every 3 hours","ja":"自動更新 · 3時間ごとにソース確認","vi":"Tự động cập nhật · kiểm tra nguồn mỗi 3 giờ","ne":"स्वतः अपडेट · हरेक ३ घण्टामा स्रोत जाँच","hi":"ऑटो अपडेट · हर 3 घंटे स्रोत जांच","ur":"خودکار اپ ڈیٹ · ہر 3 گھنٹے ماخذ کی جانچ","my":"အလိုအလျောက် အပ်ဒိတ် · ၃ နာရီတိုင်း အရင်းအမြစ် စစ်ဆေးသည်","zh":"自动更新 · 每3小时核查来源","si":"ස්වයංක්‍රීය යාවත්කාලීනය · සෑම පැය 3කට වරක් මූලාශ්‍රය පරීක්ෂා කරයි","fil":"Auto update · sinusuri ang source bawat 3 oras"},
    "dn.backHome": {"bn":"হোমে ফিরুন","en":"Back to home","ja":"ホームに戻る","vi":"Về trang chủ","ne":"गृहपृष्ठमा फर्कनुहोस्","hi":"होम पर वापस जाएं","ur":"ہوم پر واپس جائیں","my":"ပင်မသို့ ပြန်သွားရန်","zh":"返回首页","si":"මුල් පිටුවට යන්න","fil":"Bumalik sa home"},
    "dn.backToArchive": {"bn":"নিউজ আর্কাইভে ফিরুন","en":"Back to the news archive","ja":"ニュースアーカイブに戻る","vi":"Quay lại kho tin","ne":"समाचार अभिलेखमा फर्कनुहोस्","hi":"समाचार संग्रह पर वापस जाएं","ur":"خبروں کے آرکائیو پر واپس جائیں","my":"သတင်း မှတ်တမ်းသို့ ပြန်သွားပါ","zh":"返回新闻存档","si":"පුවත් ලේඛනාගාරයට ආපසු යන්න","fil":"Bumalik sa news archive"},
    "dn.backToArchiveShort": {"bn":"আর্কাইভে ফিরুন","en":"Back to the archive","ja":"アーカイブに戻る","vi":"Quay lại kho lưu trữ","ne":"अभिलेखमा फर्कनुहोस्","hi":"संग्रह पर वापस जाएं","ur":"آرکائیو پر واپس جائیں","my":"မှတ်တမ်းသို့ ပြန်သွားပါ","zh":"返回存档","si":"ලේඛනාගාරයට ආපසු යන්න","fil":"Bumalik sa archive"},
    "dn.badgeLatest": {"bn":"সর্বশেষ","en":"Latest","ja":"最新","vi":"Mới nhất","ne":"पछिल्लो","hi":"नवीनतम","ur":"تازہ ترین","my":"နောက်ဆုံး","zh":"最新","si":"නවතම","fil":"Pinakabago"},
    "dn.badgeLead": {"bn":"আজকের প্রধান","en":"Today's lead","ja":"今日のトップ","vi":"Tin chính hôm nay","ne":"आजको मुख्य","hi":"आज की प्रमुख","ur":"آج کی اہم","my":"ယနေ့ အဓိက","zh":"今日头条","si":"අද ප්‍රධාන","fil":"Pangunahin ngayon"},
    "dn.checking": {"bn":"আপডেট দেখছি…","en":"Checking for updates…","ja":"更新を確認中…","vi":"Đang kiểm tra cập nhật…","ne":"अपडेट हेरिँदैछ…","hi":"अपडेट देख रहे हैं…","ur":"اپ ڈیٹ دیکھ رہے ہیں…","my":"အပ်ဒိတ် ကြည့်နေပါတယ်…","zh":"正在查看更新…","si":"යාවත්කාලීන බලමින්…","fil":"Tinitingnan ang mga update…"},
    "dn.count": {"bn":"{n}টি নিউজ","en":"{n} news","ja":"{n}件のニュース","vi":"{n} tin","ne":"{n} वटा समाचार","hi":"{n} समाचार","ur":"{n} خبریں","my":"သတင်း {n} ခု","zh":"{n} 条新闻","si":"පුවත් {n} ක්","fil":"{n} balita"},
    "dn.countOf": {"bn":"{a} / {b}টি নিউজ","en":"{a} / {b} news","ja":"{a} / {b}件のニュース","vi":"{a} / {b} tin","ne":"{a} / {b} वटा समाचार","hi":"{a} / {b} समाचार","ur":"{a} / {b} خبریں","my":"သတင်း {a} / {b} ခု","zh":"{a} / {b} 条新闻","si":"පුවත් {a} / {b} ක්","fil":"{a} / {b} balita"},
    "dn.empty": {"bn":"এখনো কোনো নিউজ যোগ হয়নি।","en":"No news added yet.","ja":"ニュースはまだ追加されていません。","vi":"Chưa có tin nào được thêm.","ne":"अझै कुनै समाचार थपिएको छैन।","hi":"अभी कोई समाचार नहीं जोड़ा गया।","ur":"ابھی کوئی خبر شامل نہیں ہوئی۔","my":"သတင်း မထည့်ရသေးပါ။","zh":"尚未添加任何新闻。","si":"තවම පුවත් එකතු කර නැත.","fil":"Wala pang naidagdag na balita."},
    "dn.emptyFilter": {"bn":"এই ফিল্টারে কোনো নিউজ নেই।","en":"No news in this filter.","ja":"このフィルターにはニュースがありません。","vi":"Không có tin trong bộ lọc này.","ne":"यो फिल्टरमा कुनै समाचार छैन।","hi":"इस फ़िल्टर में कोई समाचार नहीं है।","ur":"اس فلٹر میں کوئی خبر نہیں ہے۔","my":"ဤစစ်ထုတ်မှုတွင် သတင်း မရှိပါ။","zh":"此筛选下没有新闻。","si":"මෙම පෙරහනේ පුවත් නැත.","fil":"Walang balita sa filter na ito."},
    "dn.furiganaOff": {"bn":"ফুরিগানা OFF","en":"Furigana OFF","ja":"ふりがな OFF","vi":"Furigana OFF","ne":"फुरिगाना OFF","hi":"फुरिगाना OFF","ur":"فوریگانا OFF","my":"Furigana OFF","zh":"注音 OFF","si":"Furigana OFF","fil":"Furigana OFF"},
    "dn.furiganaOn": {"bn":"ফুরিগানা ON","en":"Furigana ON","ja":"ふりがな ON","vi":"Furigana ON","ne":"फुरिगाना ON","hi":"फुरिगाना ON","ur":"فوریگانا ON","my":"Furigana ON","zh":"注音 ON","si":"Furigana ON","fil":"Furigana ON"},
    "dn.homeTitle": {"bn":"কানজি দিয়ে খবর পড়ুন, বুঝুন বাংলায়","en":"Read the news with kanji, understand it in English","ja":"漢字で読む毎日のニュース解説","vi":"Đọc tin bằng kanji, hiểu bằng tiếng Việt","ne":"कान्जीले समाचार पढ्नुहोस्, नेपालीमा बुझ्नुहोस्","hi":"कांजी से समाचार पढ़ें, हिंदी में समझें","ur":"کانجی سے خبریں پڑھیں، اردو میں سمجھیں","my":"ခန်ဂျီဖြင့် သတင်းဖတ်ပြီး မြန်မာလို နားလည်ပါ","zh":"用汉字读新闻，用中文理解","si":"කාන්ජි වලින් පුවත් කියවා සිංහලෙන් තේරුම් ගන්න","fil":"Basahin ang balita gamit ang kanji, intindihin sa Filipino"},
    "dn.illustrative": {"bn":"প্রতীকী চিত্র","en":"Illustrative image","ja":"イメージ画像","vi":"Ảnh minh họa","ne":"प्रतीकात्मक तस्बिर","hi":"प्रतीकात्मक चित्र","ur":"علامتی تصویر","my":"သင်္ကေတ ပုံ","zh":"示意图","si":"සංකේතාත්මක රූපය","fil":"Illustrative na larawan"},
    "dn.kicker": {"bn":"প্রতিদিনের জাপানি নিউজ","en":"Daily Japanese News","ja":"毎日の日本のニュース","vi":"Tin Nhật hằng ngày","ne":"दैनिक जापानी समाचार","hi":"दैनिक जापानी समाचार","ur":"روزانہ جاپانی خبریں","my":"နေ့စဉ် ဂျပန် သတင်း","zh":"每日日本新闻","si":"දෛනික ජපන් පුවත්","fil":"Araw-araw na Balitang Hapon"},
    "dn.lastCheck": {"bn":" · সর্বশেষ যাচাই: ","en":" · Last checked: ","ja":" · 最終確認： ","vi":" · Kiểm tra lần cuối: ","ne":" · पछिल्लो जाँच: ","hi":" · अंतिम जांच: ","ur":" · آخری جانچ: ","my":" · နောက်ဆုံး စစ်ဆေးချိန်: ","zh":" · 最后核查：","si":" · අවසන් පරීක්ෂාව: ","fil":" · Huling pagsusuri: "},
    "dn.lastUpdate": {"bn":"সর্বশেষ আপডেট: ","en":"Last updated: ","ja":"最終更新： ","vi":"Cập nhật lần cuối: ","ne":"पछिल्लो अपडेट: ","hi":"अंतिम अपडेट: ","ur":"آخری اپ ڈیٹ: ","my":"နောက်ဆုံး အပ်ဒိတ်: ","zh":"最后更新：","si":"අවසන් යාවත්කාලීනය: ","fil":"Huling update: "},
    "dn.latestDay": {"bn":"সর্বশেষ দিন","en":"Latest day","ja":"最新の日","vi":"Ngày mới nhất","ne":"पछिल्लो दिन","hi":"नवीनतम दिन","ur":"تازہ ترین دن","my":"နောက်ဆုံးနေ့","zh":"最新一天","si":"නවතම දිනය","fil":"Pinakabagong araw"},
    "dn.loadFail": {"bn":"নিউজ লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।","en":"News could not be loaded. Try again in a little while.","ja":"ニュースを読み込めませんでした。少し後でもう一度お試しください。","vi":"Không tải được tin. Thử lại sau ít phút.","ne":"समाचार load गर्न सकिएन। केही समयपछि फेरि प्रयास गर्नुहोस्।","hi":"समाचार load नहीं हो सका। थोड़ी देर बाद फिर से प्रयास करें।","ur":"خبریں لوڈ نہیں ہو سکیں۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔","my":"သတင်း ဖွင့်၍ မရပါ။ ခဏနေမှ ပြန်ကြိုးစားပါ။","zh":"新闻加载失败。请稍后再试。","si":"පුවත් පූරණය කළ නොහැකි විය. ටික වේලාවකින් නැවත උත්සාහ කරන්න.","fil":"Hindi ma-load ang balita. Subukan ulit mamaya."},
    "dn.loadingToday": {"bn":"আজকের খবর লোড হচ্ছে…","en":"Loading today's news…","ja":"今日のニュースを読み込み中…","vi":"Đang tải tin hôm nay…","ne":"आजको समाचार लोड हुँदैछ…","hi":"आज के समाचार लोड हो रहे हैं…","ur":"آج کی خبریں لوڈ ہو رہی ہیں…","my":"ယနေ့ သတင်း ဖွင့်နေပါတယ်…","zh":"正在加载今日新闻…","si":"අද පුවත් පූරණය වෙමින්…","fil":"Naglo-load ang balita ngayon…"},
    "dn.newerNews": {"bn":"নতুন নিউজ","en":"Newer news","ja":"新しいニュース","vi":"Tin mới hơn","ne":"नयाँ समाचार","hi":"नए समाचार","ur":"نئی خبر","my":"သတင်းအသစ်","zh":"更新的新闻","si":"නව පුවත්","fil":"Mas bagong balita"},
    "dn.noDate": {"bn":"তারিখ নেই","en":"No date","ja":"日付なし","vi":"Không có ngày","ne":"मिति छैन","hi":"कोई तारीख नहीं","ur":"کوئی تاریخ نہیں","my":"ရက်စွဲ မရှိ","zh":"无日期","si":"දින නැත","fil":"Walang petsa"},
    "dn.noUpdate": {"bn":"আপডেট পাওয়া যায়নি","en":"No update found","ja":"更新が見つかりません","vi":"Không tìm thấy cập nhật","ne":"update भेटिएन","hi":"update नहीं मिला","ur":"اپڈیٹ نہیں ملی","my":"အပ်ဒိတ် မတွေ့ရှိပါ","zh":"未找到更新","si":"යාවත්කාලීනය හමු නොවීය","fil":"Walang nakitang update"},
    "dn.notFound": {"bn":"নিউজটি পাওয়া যায়নি।","en":"The news item was not found.","ja":"ニュースが見つかりませんでした。","vi":"Không tìm thấy tin này.","ne":"समाचार भेटिएन।","hi":"समाचार नहीं मिला।","ur":"خبر نہیں ملی۔","my":"သတင်း မတွေ့ရှိပါ။","zh":"未找到该新闻。","si":"පුවත හමු නොවීය.","fil":"Hindi nakita ang balita."},
    "dn.notFoundTitle": {"bn":"নিউজ পাওয়া যায়নি | আপনার নিহোন","en":"News not found | আপনার নিহোন","ja":"ニュースが見つかりません | আপনার নিহোন","vi":"Không tìm thấy tin | আপনার নিহোন","ne":"समाचार भेटिएन | আপনার নিহোন","hi":"समाचार नहीं मिला | আপনার নিহোন","ur":"خبر نہیں ملی | আপনার নিহোন","my":"သတင်း မတွေ့ပါ | আপনার নিহোন","zh":"未找到新闻 | আপনার নিহোন","si":"පුවත් හමු නොවීය | আপনার নিহোন","fil":"Hindi nakita ang balita | আপনার নিহোন"},
    "dn.olderNews": {"bn":"আগের নিউজ","en":"Older news","ja":"前のニュース","vi":"Tin cũ hơn","ne":"पुरानो समाचार","hi":"पुराने समाचार","ur":"پرانی خبر","my":"သတင်းဟောင်း","zh":"更早的新闻","si":"පැරණි පුවත්","fil":"Mas lumang balita"},
    "dn.prevDay": {"bn":"আগের দিন","en":"Previous day","ja":"前日","vi":"Ngày trước","ne":"अघिल्लो दिन","hi":"पिछला दिन","ur":"پچھلا دن","my":"ယခင်နေ့","zh":"前一天","si":"පෙර දිනය","fil":"Nakaraang araw"},
    "dn.readMore": {"bn":"বিস্তারিত পড়ুন","en":"Read more","ja":"詳しく読む","vi":"Đọc chi tiết","ne":"विस्तारमा पढ्नुहोस्","hi":"विस्तार से पढ़ें","ur":"تفصیل پڑھیں","my":"အသေးစိတ် ဖတ်ရန်","zh":"阅读详情","si":"විස්තර කියවන්න","fil":"Basahin ang detalye"},
    "dn.readerLoadFail": {"bn":"নিউজটি লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।","en":"The news item could not be loaded. Try again in a little while.","ja":"ニュースを読み込めませんでした。少し後でもう一度お試しください。","vi":"Không tải được tin này. Thử lại sau ít phút.","ne":"समाचार load गर्न सकिएन। केही समयपछि फेरि प्रयास गर्नुहोस्।","hi":"समाचार load नहीं हो सका। थोड़ी देर बाद फिर से प्रयास करें।","ur":"خبر لوڈ نہیں ہو سکی۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔","my":"သတင်း ဖွင့်၍ မရပါ။ ခဏနေမှ ပြန်ကြိုးစားပါ။","zh":"该新闻加载失败。请稍后再试。","si":"පුවත පූරණය කළ නොහැකි විය. ටික වේලාවකින් නැවත උත්සාහ කරන්න.","fil":"Hindi ma-load ang balita. Subukan ulit mamaya."},
    "dn.refresh": {"bn":"↻ আপডেট দেখুন","en":"↻ See updates","ja":"↻ 更新を見る","vi":"↻ Xem cập nhật","ne":"↻ update हेर्नुहोस्","hi":"↻ update देखें","ur":"↻ اپڈیٹ دیکھیں","my":"↻ အပ်ဒိတ် ကြည့်ပါ","zh":"↻ 查看更新","si":"↻ යාවත්කාලීන බලන්න","fil":"↻ Tingnan ang mga update"},
    "dn.savedFallback": {"bn":"সরাসরি আপডেট পাওয়া যায়নি; সংরক্ষিত খবর দেখানো হচ্ছে।","en":"Live update not available; showing saved news.","ja":"ライブ更新を取得できませんでした。保存されたニュースを表示しています。","vi":"Không lấy được cập nhật trực tiếp; đang hiển thị tin đã lưu.","ne":"प्रत्यक्ष update पाइएन; सुरक्षित समाचार देखाइँदैछ।","hi":"लाइव update नहीं मिला; सहेजे गए समाचार दिखाए जा रहे हैं।","ur":"لائیو اپڈیٹ نہیں ملی؛ محفوظ خبریں دکھائی جا رہی ہیں۔","my":"တိုက်ရိုက် အပ်ဒိတ် မရနိုင်ပါ။ သိမ်းဆည်းထားသော သတင်း ပြသနေပါတယ်။","zh":"无法获取实时更新；正在显示已保存的新闻。","si":"සජීවී යාවත්කාලීනය ලැබුණේ නැත; සුරකින ලද පුවත් පෙන්වනු ලැබේ.","fil":"Hindi available ang live update; ipinapakita ang mga na-save na balita."},
    "dn.source": {"bn":"মূল উৎস দেখুন","en":"See the original source","ja":"元の出典を見る","vi":"Xem nguồn gốc","ne":"मूल स्रोत हेर्नुहोस्","hi":"मूल स्रोत देखें","ur":"اصل ماخذ دیکھیں","my":"မူရင်း အရင်းအမြစ် ကြည့်ပါ","zh":"查看原始来源","si":"මුල් මූලාශ්‍රය බලන්න","fil":"Tingnan ang orihinal na pinagmulan"},
    "dn.sourceFallback": {"bn":"সংবাদ উৎস","en":"News source","ja":"ニュースソース","vi":"Nguồn tin","ne":"समाचार स्रोत","hi":"समाचार स्रोत","ur":"خبر کا ماخذ","my":"သတင်း အရင်းအမြစ်","zh":"新闻来源","si":"පුවත් මූලාශ්‍රය","fil":"News source"},
    "dn.sourceLabel": {"bn":"উৎস:","en":"Source:","ja":"出典：","vi":"Nguồn:","ne":"स्रोत:","hi":"स्रोत:","ur":"ماخذ:","my":"အရင်းအမြစ်:","zh":"来源：","si":"මූලාශ්‍රය:","fil":"Source:"},
    "dn.sourceProblem": {"bn":"সংবাদ উৎসে এখন সমস্যা হচ্ছে; সর্বশেষ সংরক্ষিত খবর দেখানো হচ্ছে।","en":"The news source is having problems right now; showing the latest saved news.","ja":"ニュースソースで現在問題が発生しています。保存された最新ニュースを表示しています。","vi":"Nguồn tin hiện đang gặp sự cố; đang hiển thị tin đã lưu mới nhất.","ne":"समाचार स्रोतमा अहिले समस्या छ; पछिल्लो सुरक्षित समाचार देखाइँदैछ।","hi":"समाचार स्रोत में अभी समस्या है; नवीनतम सहेजे गए समाचार दिखाए जा रहे हैं।","ur":"خبر کے ماخذ میں ابھی مسئلہ ہے؛ تازہ ترین محفوظ خبریں دکھائی جا رہی ہیں۔","my":"သတင်း အရင်းအမြစ်တွင် လက်ရှိ ပြဿနာ ဖြစ်နေပါတယ်။ နောက်ဆုံး သိမ်းဆည်းထားသော သတင်း ပြသနေပါတယ်။","zh":"新闻来源目前出现问题；正在显示最新保存的新闻。","si":"පුවත් මූලාශ්‍රයේ දැනට ගැටලුවක් ඇත; නවතම සුරකින ලද පුවත් පෙන්වනු ලැබේ.","fil":"May problema ngayon ang news source; ipinapakita ang pinakabagong na-save na balita."},
    "dn.today": {"bn":"আজ","en":"Today","ja":"今日","vi":"Hôm nay","ne":"आज","hi":"आज","ur":"آج","my":"ယနေ့","zh":"今天","si":"අද","fil":"Ngayon"},
    "dn.updatedToday": {"bn":"আজকের নিউজ আপডেট হয়েছে","en":"Today's news has been updated","ja":"今日のニュースが更新されました","vi":"Tin hôm nay đã được cập nhật","ne":"आजको समाचार अपडेट भयो","hi":"आज के समाचार अपडेट हो गए","ur":"آج کی خبریں اپ ڈیٹ ہو گئیں","my":"ယနေ့ သတင်း အပ်ဒိတ်လုပ်ပြီး","zh":"今日新闻已更新","si":"අද පුවත් යාවත්කාලීනයි","fil":"Na-update na ang balita ngayon"},
    "dn.vocabTitle": {"bn":"গুরুত্বপূর্ণ শব্দ","en":"Important words","ja":"重要な単語","vi":"Từ quan trọng","ne":"महत्त्वपूर्ण शब्दहरू","hi":"महत्वपूर्ण शब्द","ur":"اہم الفاظ","my":"အရေးကြီး စကားလုံးများ","zh":"重要词汇","si":"වැදගත් වචන","fil":"Mahahalagang salita"},
    "dn.waiting": {"bn":"নিউজ আপডেটের অপেক্ষায়","en":"Waiting for news updates","ja":"ニュースの更新待ち","vi":"Đang chờ cập nhật tin","ne":"समाचार update को प्रतीक्षामा","hi":"समाचार update की प्रतीक्षा में","ur":"خبروں کی اپڈیٹ کا انتظار","my":"သတင်း အပ်ဒိတ် စောင့်ဆိုင်းနေပါတယ်","zh":"等待新闻更新","si":"පුවත් යාවත්කාලීනය බලාපොරොත්තුවෙන්","fil":"Naghihintay ng update sa balita"},
    "dn.adjacentLabel": {"bn":"পরের ও আগের নিউজ","en":"Next and previous news","ja":"次のニュースと前のニュース","vi":"Tin tiếp theo và tin trước","ne":"अर्को र अघिल्लो समाचार","hi":"अगली और पिछली ख़बरें","ur":"اگلی اور پچھلی خبر","my":"နောက်ထပ်နှင့် ယခင် သတင်းများ","zh":"下一条和上一条新闻","si":"ඊළඟ සහ පෙර පුවත්","fil":"Susunod at nakaraang balita"},
    "dn.explanationTitle": {"bn":"বাংলা বিস্তারিত ব্যাখ্যা","en":"Detailed explanation in English","ja":"日本語での詳しい解説","vi":"Giải thích chi tiết bằng tiếng Việt","ne":"नेपालीमा विस्तृत व्याख्या","hi":"हिंदी में विस्तृत व्याख्या","ur":"اردو میں تفصیلی وضاحت","my":"မြန်မာဘာသာ အသေးစိတ် ရှင်းလင်းချက်","zh":"中文详细解说","si":"සිංහලෙන් සවිස්තරාත්මක පැහැදිලි කිරීම","fil":"Detalyadong paliwanag sa Filipino"},
    "dn.filterLabel": {"bn":"নিউজ তারিখ ফিল্টার","en":"News date filter","ja":"ニュースの日付フィルター","vi":"Bộ lọc theo ngày của tin tức","ne":"समाचार मिति फिल्टर","hi":"समाचार तिथि फ़िल्टर","ur":"خبر کی تاریخ کا فلٹر","my":"သတင်း ရက်စွဲ စစ်ထုတ်ခြင်း","zh":"新闻日期筛选","si":"පුවත් දිනය පෙරහන","fil":"Filter ng petsa ng balita"},
    "dn.groupCount": {"bn":"{n}টি","en":"{n}","ja":"{n}件","vi":"{n} tin","ne":"{n} वटा","hi":"{n}","ur":"{n}","my":"{n} ခု","zh":"{n} 条","si":"{n} ක්","fil":"{n}"},
    "dn.imageSource": {"bn":"ছবির উৎস","en":"Photo source","ja":"写真の出典","vi":"Nguồn ảnh","ne":"तस्बिरको स्रोत","hi":"तस्वीर का स्रोत","ur":"تصویر کا ماخذ","my":"ဓာတ်ပုံ အရင်းအမြစ်","zh":"图片来源","si":"ඡායාරූප මූලාශ්‍රය","fil":"Pinagmulan ng larawan"},
    "dn.homeLoadFail": {"bn":"নিউজ লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।","en":"The news could not be loaded. Please try again in a little while.","ja":"ニュースを読み込めませんでした。しばらくしてからもう一度お試しください。","vi":"Không tải được tin tức. Vui lòng thử lại sau ít phút.","ne":"समाचार लोड हुन सकेन। केही बेरपछि फेरि प्रयास गर्नुहोस्।","hi":"समाचार लोड नहीं हो सका। थोड़ी देर बाद फिर प्रयास करें।","ur":"خبر لوڈ نہیں ہو سکی۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔","my":"သတင်းကို ဖွင့်၍မရပါ။ အနည်းငယ်ကြာပြီးနောက် ထပ်မံကြိုးစားပါ။","zh":"新闻加载失败。请稍后再试。","si":"පුවත් පූරණය කළ නොහැකි විය. මොහොතකින් නැවත උත්සාහ කරන්න.","fil":"Hindi ma-load ang balita. Subukan muli pagkalipas ng ilang sandali."},
    "dn.navLabel": {"bn":"নিউজ নেভিগেশন","en":"News navigation","ja":"ニュースナビゲーション","vi":"Điều hướng tin tức","ne":"समाचार नेभिगेसन","hi":"समाचार नेविगेशन","ur":"خبر کی نیویگیشن","my":"သတင်း လမ်းညွှန်မှု","zh":"新闻导航","si":"පුවත් සංචාලනය","fil":"Nabigasyon ng balita"},
    "g3.allParts": {"bn":"সব Part-এর তালিকা","en":"List of all Parts","ja":"すべてのPart一覧","vi":"Danh sách tất cả Part","ne":"सबै Part को सूची","hi":"सभी Part की सूची","ur":"تمام Part کی فہرست","my":"Part အားလုံး စာရင်း","zh":"所有部分列表","si":"සියලුම කොටස් ලැයිස්තුව","fil":"Listahan ng lahat ng Part"},
    "g3.backToList": {"bn":"{n}টি Part • তালিকায় ফিরুন","en":"{n} Parts • Back to the list","ja":"{n} Part • 一覧に戻る","vi":"{n} Part • Quay lại danh sách","ne":"{n} वटा Part • सूचीमा फर्कनुहोस्","hi":"{n} Part • सूची पर वापस जाएं","ur":"{n} Part • فہرست پر واپس جائیں","my":"Part {n} ခု • စာရင်းသို့ ပြန်သွားရန်","zh":"{n} 个部分 • 返回列表","si":"කොටස් {n} ක් • ලැයිස්තුවට ආපසු යන්න","fil":"{n} Part • Bumalik sa listahan"},
    "g3.dirIntro": {"bn":"নিচের Part-গুলো ১ থেকে ১১ পর্যন্ত সম্পূর্ণ আছে। যেটি পড়বেন, সেটিতে tap করুন—শেষে আগের/পরের Part-এ যাওয়ার button-ও পাবেন।","en":"The Parts below are complete, from 1 to 11. Tap the one you want to study—at the end you will also find buttons to go to the previous/next Part.","ja":"下のパートは1から11まで全部そろっています。勉強したいものをタップしてください。最後には前/次のパートへ進むボタンもあります。","vi":"Các Part bên dưới đầy đủ từ 1 đến 11. Chạm vào Part bạn muốn học—ở cuối còn có nút để sang Part trước/tiếp theo.","ne":"तलका Part हरू १ देखि ११ सम्म पूर्ण छन्। जुन पढ्नुहुन्छ, त्यसमा tap गर्नुहोस्—अन्त्यमा अघिल्लो/अर्को Part मा जाने button पनि पाउनुहुनेछ।","hi":"नीचे के Part 1 से 11 तक पूर्ण हैं। जिसे पढ़ना हो, उस पर tap करें—अंत में पिछले/अगले Part पर जाने के button भी मिलेंगे।","ur":"نیچے کے Part 1 سے 11 تک مکمل ہیں۔ جو پڑھنا ہو، اس پر tap کریں—آخر میں پچھلے/اگلے Part پر جانے کے button بھی ملیں گے۔","my":"အောက်ပါ Part များသည် 1 မှ 11 အထိ ပြည့်စုံပါသည်။ ဖတ်လိုသောအရာကို နှိပ်ပါ—အဆုံးတွင် ရှေ့/နောက် Part သို့ သွားရန် button များလည်း ရနိုင်ပါသည်။","zh":"下面的部分从 1 到 11 完整无缺。点击你想学习的部分——最后还有前往上一/下一部分的按钮。","si":"පහත කොටස් 1 සිට 11 දක්වා සම්පූර්ණයි. ඔබට ඉගෙන ගැනීමට අවශ්‍ය දේ තට්ටු කරන්න—අවසානයේ කලින්/ඊළඟ කොටසට යාමට බොත්තම් ද ලැබේ.","fil":"Kumpleto ang mga Part sa ibaba, mula 1 hanggang 11. I-tap ang gusto mong aralin—sa dulo ay may mga button din papunta sa nakaraan/susunod na Part."},
    "g3.dirTitle": {"bn":"N3 Grammar-এর সব ১১টি Part","en":"All 11 Parts of N3 Grammar","ja":"N3文法の全11パート","vi":"Tất cả 11 Part của N3 Grammar","ne":"N3 Grammar का सबै ११ वटा Part","hi":"N3 Grammar के सभी 11 Part","ur":"N3 Grammar کے تمام 11 حصے","my":"N3 Grammar ၏ Part 11 ခု အားလုံး","zh":"N3 语法的全部 11 个部分","si":"N3 ව්‍යාකරණයේ සියලුම කොටස් 11","fil":"Lahat ng 11 Part ng N3 Grammar"},
    "g3.grammarFound": {"bn":"{n}টি Grammar পাওয়া গেছে","en":"{n} Grammar found","ja":"{n}件の文法が見つかりました","vi":"Đã tìm thấy {n} Grammar","ne":"{n} वटा Grammar भेटियो","hi":"{n} Grammar मिले","ur":"{n} Grammar ملے","my":"Grammar {n} ခု တွေ့ရှိပါတယ်","zh":"找到 {n} 个语法","si":"ව්‍යාකරණ {n} ක් හමු විය","fil":"{n} Grammar ang nakita"},
    "g3.nextPart": {"bn":"পরের Part →","en":"Next Part →","ja":"次のPart →","vi":"Part tiếp theo →","ne":"अर्को Part →","hi":"अगला Part →","ur":"اگلا Part →","my":"နောက် Part →","zh":"下一部分 →","si":"ඊළඟ කොටස →","fil":"Susunod na Part →"},
    "g3.partMeta": {"bn":"{n}টি Grammar • {done} শেখা","en":"{n} Grammar • {done} learned","ja":"{n}件の文法 • {done}件学習済み","vi":"{n} Grammar • Đã học {done}","ne":"{n} वटा Grammar • {done} सिकियो","hi":"{n} Grammar • {done} सीखे","ur":"{n} Grammar • {done} سیکھے","my":"Grammar {n} ခု • {done} ခု သင်ယူပြီး","zh":"{n} 个语法 • 已学 {done}","si":"ව්‍යාකරණ {n} ක් • {done} ක් ඉගෙන ගත්තා","fil":"{n} Grammar • {done} ang natutunan"},
    "g3.partOfAll": {"bn":"Part {cur} / {total} • সব Part","en":"Part {cur} / {total} • All Parts","ja":"Part {cur} / {total} • すべてのPart","vi":"Part {cur} / {total} • Tất cả Part","ne":"Part {cur} / {total} • सबै Part","hi":"Part {cur} / {total} • सभी Part","ur":"Part {cur} / {total} • تمام Part","my":"Part {cur} / {total} • Part အားလုံး","zh":"Part {cur} / {total} • 所有部分","si":"කොටස {cur} / {total} • සියලුම කොටස්","fil":"Part {cur} / {total} • Lahat ng Part"},
    "g3.partStat": {"bn":"{done} শেখা • {left} বাকি","en":"{done} learned • {left} left","ja":"{done}件学習済み • 残り{left}件","vi":"Đã học {done} • Còn {left}","ne":"{done} सिकियो • {left} बाँकी","hi":"{done} सीखे • {left} बाकी","ur":"{done} سیکھے • {left} باقی","my":"{done} ခု သင်ယူပြီး • {left} ခု ကျန်","zh":"已学 {done} • 还剩 {left}","si":"{done} ක් ඉගෙන ගත්තා • {left} ක් ඉතිරියි","fil":"{done} ang natutunan • {left} ang natitira"},
    "g3.prevPart": {"bn":"← আগের Part","en":"← Previous Part","ja":"← 前のPart","vi":"← Part trước","ne":"← अघिल्लो Part","hi":"← पिछला Part","ur":"← پچھلا Part","my":"← ရှေ့ Part","zh":"← 上一部分","si":"← කලින් කොටස","fil":"← Nakaraang Part"},
    "g3.progress": {"bn":"{done} / {total} শেখা","en":"{done} / {total} learned","ja":"{done} / {total} 学習済み","vi":"Đã học {done} / {total}","ne":"{done} / {total} सिकियो","hi":"{done} / {total} सीखे","ur":"{done} / {total} سیکھے","my":"{done} / {total} သင်ယူပြီး","zh":"已学 {done} / {total}","si":"{done} / {total} ඉගෙන ගත්තා","fil":"{done} / {total} ang natutunan"},
    "g3.startPart1": {"bn":"Part 01 শুরু →","en":"Start Part 01 →","ja":"Part 01を始める →","vi":"Bắt đầu Part 01 →","ne":"Part 01 सुरु →","hi":"Part 01 शुरू करें →","ur":"Part 01 شروع کریں →","my":"Part 01 စတင်ပါ →","zh":"开始 Part 01 →","si":"1 කොටස අරඹන්න →","fil":"Simulan ang Part 01 →"},
    "g3.viewAll": {"bn":"সব ১১৩টি Grammar দেখুন","en":"See all 113 Grammar points","ja":"全113件の文法を見る","vi":"Xem tất cả 113 Grammar","ne":"सबै ११३ वटा Grammar हेर्नुहोस्","hi":"सभी 113 Grammar देखें","ur":"تمام 113 Grammar دیکھیں","my":"Grammar 113 ခု အားလုံး ကြည့်ပါ","zh":"查看全部 113 个语法点","si":"ව්‍යාකරණ 113 ම බලන්න","fil":"Tingnan ang lahat ng 113 Grammar"},
    "g4.courseStatus": {"bn":"{done}/25 lesson সম্পন্ন · {pct}%","en":"{done}/25 lessons completed · {pct}%","ja":"{done}/25 レッスン完了 · {pct}%","vi":"{done}/25 lesson đã hoàn thành · {pct}%","ne":"{done}/25 lesson सकियो · {pct}%","hi":"{done}/25 lesson पूर्ण · {pct}%","ur":"{done}/25 lesson مکمل · {pct}%","my":"{done}/25 lesson ပြီးဆုံး · {pct}%","zh":"{done}/25 课完成 · {pct}%","si":"{done}/25 පාඩම් අවසන් · {pct}%","fil":"{done}/25 lesson ang tapos · {pct}%"},
    "g4.done": {"bn":"✓ সম্পন্ন হয়েছে","en":"✓ Completed","ja":"✓ 完了しました","vi":"✓ Đã hoàn thành","ne":"✓ सकियो","hi":"✓ पूर्ण हो गया","ur":"✓ مکمل ہو گیا","my":"✓ ပြီးဆုံးပါပြီ","zh":"✓ 已完成","si":"✓ අවසන් කර ඇත","fil":"✓ Tapos na"},
    "g4.hideReading": {"bn":"あ Reading লুকান","en":"あ Hide reading","ja":"あ 読み方を隠す","vi":"あ Ẩn cách đọc","ne":"あ Reading लुकाउनुहोस्","hi":"あ Reading छिपाएं","ur":"あ Reading چھپائیں","my":"あ Reading ဖျောက်ပါ","zh":"あ 隐藏读音","si":"あ කියවීම හංගන්න","fil":"あ Itago ang reading"},
    "g4.markDone": {"bn":"✓ সম্পন্ন করুন","en":"✓ Mark as complete","ja":"✓ 完了にする","vi":"✓ Đánh dấu hoàn thành","ne":"✓ सकिएको चिन्ह लगाउनुहोस्","hi":"✓ पूर्ण चिह्नित करें","ur":"✓ مکمل نشان لگائیں","my":"✓ ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"✓ 标记为完成","si":"✓ අවසන් කළා ලෙස සලකුණු කරන්න","fil":"✓ Markahang tapos"},
    "g4.notDone": {"bn":"এখনো সম্পন্ন নয়","en":"Not completed yet","ja":"まだ完了していません","vi":"Chưa hoàn thành","ne":"अझै सकिएको छैन","hi":"अभी पूर्ण नहीं है","ur":"ابھی مکمل نہیں ہے","my":"မပြီးဆုံးသေးပါ","zh":"尚未完成","si":"තවම අවසන් කර නැත","fil":"Hindi pa tapos"},
    "g4.showReading": {"bn":"あ Reading দেখান","en":"あ Show reading","ja":"あ 読み方を表示","vi":"あ Hiện cách đọc","ne":"あ Reading देखाउनुहोस्","hi":"あ Reading दिखाएं","ur":"あ Reading دکھائیں","my":"あ Reading ပြပါ","zh":"あ 显示读音","si":"あ කියවීම පෙන්වන්න","fil":"あ Ipakita ang reading"},
    "g4.thisDone": {"bn":"এই Lesson সম্পন্ন","en":"This lesson is complete","ja":"このレッスンは完了です","vi":"Lesson này đã hoàn thành","ne":"यो Lesson सकियो","hi":"यह Lesson पूर्ण है","ur":"یہ Lesson مکمل ہے","my":"ဤ Lesson ပြီးဆုံးပါပြီ","zh":"本课已完成","si":"මෙම පාඩම අවසන් කර ඇත","fil":"Tapos na ang lesson na ito"},
    "gl.audioFail": {"bn":"Audio চালু করা যায়নি","en":"Could not play audio","ja":"音声を再生できませんでした","vi":"Không phát được audio","ne":"Audio चलाउन सकिएन","hi":"Audio नहीं चल पाया","ur":"آڈیو نہیں چل سکا","my":"အသံ ဖွင့်၍ မရပါ","zh":"无法播放音频","si":"ශ්‍රව්‍ය වාදනය කළ නොහැකි විය","fil":"Hindi ma-play ang audio"},
    "gl.correct": {"bn":"正解! সঠিক","en":"正解! Correct","ja":"正解！その通り","vi":"正解! Đúng rồi","ne":"正解! सही","hi":"正解! सही","ur":"正解! درست","my":"正解! မှန်ပါတယ်","zh":"正解! 正确","si":"正解! නිවැරදියි","fil":"正解! Tama"},
    "gl.correctGreat": {"bn":"সঠিক! よくできました","en":"Correct! よくできました","ja":"正解！よくできました","vi":"Đúng rồi! よくできました","ne":"सही! よくできました","hi":"सही! よくできました","ur":"درست! よくできました","my":"မှန်ပါတယ်! よくできました","zh":"正确！よくできました","si":"නිවැරදියි! よくできました","fil":"Tama! よくできました"},
    "gl.listen": {"bn":"Japanese শুনুন","en":"Listen to the Japanese","ja":"日本語を聞く","vi":"Nghe Japanese","ne":"Japanese सुन्नुहोस्","hi":"Japanese सुनें","ur":"Japanese سنیں","my":"Japanese နားထောင်ပါ","zh":"听日语","si":"Japanese අසන්න","fil":"Pakinggan ang Japanese"},
    "gl.noVoice": {"bn":"এই browser-এ Japanese voice নেই","en":"No Japanese voice in this browser","ja":"このブラウザには日本語の音声がありません","vi":"Trình duyệt này không có giọng Japanese","ne":"यस browser मा Japanese आवाज छैन","hi":"इस browser में Japanese आवाज़ नहीं है","ur":"اس براؤزر میں Japanese آواز نہیں ہے","my":"ဤ browser တွင် Japanese အသံ မရှိပါ","zh":"此浏览器没有日语语音","si":"මෙම browser එකේ Japanese හඬ නැත","fil":"Walang Japanese voice sa browser na ito"},
    "gl.wrong": {"bn":"ভুল হয়েছে","en":"Incorrect","ja":"不正解です","vi":"Sai rồi","ne":"गलत भयो","hi":"गलत हुआ","ur":"غلط ہوا","my":"မှားသွားပါတယ်","zh":"答错了","si":"වැරදිණි","fil":"Mali"},
    "gl.wrongGreen": {"bn":"ভুল—সবুজ উত্তরটি দেখুন","en":"Wrong—look at the green answer","ja":"不正解—緑の答えを見てください","vi":"Sai—hãy xem đáp án màu xanh lá","ne":"गलत—हरियो उत्तर हेर्नुहोस्","hi":"गलत—हरा उत्तर देखें","ur":"غلط—سبز جواب دیکھیں","my":"မှားပါတယ်—အစိမ်းရောင် အဖြေကို ကြည့်ပါ","zh":"错误—请看绿色答案","si":"වැරදියි—කොළ පැහැති පිළිතුර බලන්න","fil":"Mali—tingnan ang berdeng sagot"},
    "ha.menu": {"bn":"মেনু","en":"Menu","ja":"メニュー","vi":"Menu","ne":"मेनु","hi":"मेनू","ur":"مینیو","my":"မီနူး","zh":"菜单","si":"මෙනුව","fil":"Menu"},
    "ha.profile": {"bn":"প্রোফাইল","en":"Profile","ja":"プロフィール","vi":"Hồ sơ","ne":"प्रोफाइल","hi":"प्रोफ़ाइल","ur":"پروفائل","my":"ပရိုဖိုင်","zh":"个人资料","si":"පැතිකඩ","fil":"Profile"},
    "hb.continue": {"bn":"শেখা চালিয়ে যান","en":"Continue learning","ja":"学習を続ける","vi":"Tiếp tục học","ne":"सिकाइ जारी राख्नुहोस्","hi":"सीखना जारी रखें","ur":"سیکھنا جاری رکھیں","my":"ဆက်လက်သင်ယူပါ","zh":"继续学习","si":"ඉගෙනීම දිගටම කරගෙන යන්න","fil":"Ipagpatuloy ang pag-aaral"},
    "hb.foundSuffix": {"bn":"টি lesson পাওয়া গেছে","en":" lessons found","ja":"件のレッスンが見つかりました","vi":" lesson đã tìm thấy","ne":" वटा lesson भेटियो","hi":" lesson मिले","ur":" lesson ملے","my":" lesson တွေ့ရှိပါတယ်","zh":" 课已找到","si":" පාඩම් හමු විය","fil":" lesson ang nakita"},
    "hb.lessonsDone": {"bn":"{done}/{total} lesson সম্পন্ন","en":"{done}/{total} lessons completed","ja":"{done}/{total} レッスン完了","vi":"Đã hoàn thành {done}/{total} lesson","ne":"{done}/{total} lesson सकियो","hi":"{done}/{total} lesson पूरे","ur":"{done}/{total} lesson مکمل","my":"lesson {done}/{total} ပြီးဆုံး","zh":"{done}/{total} 课完成","si":"පාඩම් {done}/{total} අවසන්","fil":"{done}/{total} lesson ang tapos"},
    "hb.showingSuffix": {"bn":"টি lesson দেখানো হচ্ছে","en":" lessons showing","ja":"件のレッスンを表示中","vi":" lesson đang hiển thị","ne":" वटा lesson देखाइँदै छ","hi":" lesson दिखाए जा रहे हैं","ur":" lesson دکھائے جا رہے ہیں","my":" lesson ပြသနေပါတယ်","zh":" 课显示中","si":" පාඩම් පෙන්වමින්","fil":" lesson ang ipinapakita"},
    "hb.startFirst": {"bn":"প্রথম Lesson শুরু করুন","en":"Start the first lesson","ja":"最初のレッスンを始める","vi":"Bắt đầu lesson đầu tiên","ne":"पहिलो Lesson सुरु गर्नुहोस्","hi":"पहला Lesson शुरू करें","ur":"پہلا Lesson شروع کریں","my":"ပထမ Lesson စတင်ပါ","zh":"开始第一课","si":"පළමු පාඩම අරඹන්න","fil":"Simulan ang unang lesson"},
    "hp.quizLabel": {"bn":"{a} সম্পূর্ণ quiz · {b} mock","en":"{a} completed quizzes · {b} mocks","ja":"{a}件のクイズ完了 · {b}件の模試","vi":"{a} quiz đã hoàn thành · {b} mock","ne":"{a} वटा सम्पूर्ण quiz · {b} mock","hi":"{a} पूर्ण quiz · {b} mock","ur":"{a} مکمل quiz · {b} mock","my":"ပြီးဆုံးသော quiz {a} ခု · mock {b} ခု","zh":"{a} 个已完成测验 · {b} 个模拟考","si":"සම්පූර්ණ ප්‍රශ්නාවලි {a} ක් · අනුකරණ {b} ක්","fil":"{a} natapos na quiz · {b} mock"},
    "is.allTogether": {"bn":"পরীক্ষার আগে সব একসাথে","en":"Everything together before the exam","ja":"試験前に全部まとめて","vi":"Tất cả cùng nhau trước kỳ thi","ne":"परीक्षा अघि सबै एकैसाथ","hi":"परीक्षा से पहले सब एक साथ","ur":"امتحان سے پہلے سب ایک ساتھ","my":"စာမေးပွဲမတိုင်မီ အားလုံး အတူတကွ","zh":"考试前全部汇总","si":"විභාගයට පෙර සියල්ල එකවර","fil":"Lahat-lahat bago ang exam"},
    "is.askInLang": {"bn":"না বুঝলে বাংলায় জিজ্ঞাসা","en":"Ask in English if you don't understand","ja":"分からなければ日本語で質問","vi":"Không hiểu thì hỏi bằng tiếng Việt","ne":"नबुझे नेपालीमा सोध्नुहोस्","hi":"न समझ आए तो हिंदी में पूछें","ur":"سمجھ نہ آئے تو اردو میں پوچھیں","my":"နားမလည်ရင် မြန်မာလို မေးပါ","zh":"不懂就用中文问","si":"නොතේරුණොත් සිංහලෙන් අසන්න","fil":"Magtanong sa Filipino kung hindi mo maintindihan"},
    "is.fixSentence": {"bn":"জাপানি বাক্য ঠিক করুন","en":"Fix Japanese sentences","ja":"日本語の文を直す","vi":"Sửa câu Japanese","ne":"Japanese वाक्य सच्याउनुहोस्","hi":"Japanese वाक्य ठीक करें","ur":"Japanese جملے درست کریں","my":"Japanese ဝါကျ ပြင်ပါ","zh":"改正日语句子","si":"ජපන් වාක්‍ය නිවැරදි කරන්න","fil":"Ayusin ang mga pangungusap na Japanese"},
    "is.goSection": {"bn":"এই অংশে যান","en":"Go to this part","ja":"この部分へ進む","vi":"Đi đến phần này","ne":"यस भागमा जानुहोस्","hi":"इस भाग पर जाएं","ur":"اس حصے پر جائیں","my":"ဤအပိုင်းသို့ သွားပါ","zh":"前往此部分","si":"මෙම කොටසට යන්න","fil":"Pumunta sa bahaging ito"},
    "is.jobJapanese": {"bn":"চাকরির Japanese practice","en":"Japanese practice for jobs","ja":"仕事の日本語練習","vi":"Practice Japanese cho công việc","ne":"कामको Japanese practice","hi":"नौकरी के Japanese की practice","ur":"ملازمت کے Japanese کی practice","my":"အလုပ်အတွက် Japanese လေ့ကျင့်မှု","zh":"工作日语练习","si":"රැකියා ජපන් බස පුහුණුව","fil":"Japanese practice para sa trabaho"},
    "is.kana": {"bn":"হিরাগানা ও কাতাকানা","en":"Hiragana & Katakana","ja":"ひらがなとカタカナ","vi":"Hiragana & Katakana","ne":"हिरागाना र काताकाना","hi":"हिरागाना और काताकाना","ur":"ہیراگانا اور کاتاکانا","my":"Hiragana နှင့် Katakana","zh":"平假名和片假名","si":"හිරගානා සහ කතකානා","fil":"Hiragana at Katakana"},
    "is.kicker": {"bn":"✦ এক নজরে সব অংশ","en":"✦ All parts at a glance","ja":"✦ 全部を一目で","vi":"✦ Tất cả các phần trong nháy mắt","ne":"✦ एक नजरमा सबै भाग","hi":"✦ एक नज़र में सभी भाग","ur":"✦ ایک نظر میں تمام حصے","my":"✦ အစိတ်အပိုင်းအားလုံး တစ်ပြိုင်နက်","zh":"✦ 一眼看全所有部分","si":"✦ සියලුම අංග එක බැල්මෙන්","fil":"✦ Lahat ng bahagi sa isang tingin"},
    "is.langPair": {"bn":"বাংলা ↔ Japanese","en":"English ↔ Japanese","ja":"日本語 ↔ Japanese","vi":"Tiếng Việt ↔ Japanese","ne":"नेपाली ↔ Japanese","hi":"हिंदी ↔ Japanese","ur":"اردو ↔ Japanese","my":"မြန်မာ ↔ Japanese","zh":"中文 ↔ Japanese","si":"සිංහල ↔ Japanese","fil":"Filipino ↔ Japanese"},
    "is.listeningSkill": {"bn":"শোনার skill practice","en":"Listening skill practice","ja":"リスニングスキル練習","vi":"Practice kỹ năng nghe","ne":"सुन्ने skill practice","hi":"सुनने की skill practice","ur":"سننے کی skill کی practice","my":"နားထောင်မှု စွမ်းရည် လေ့ကျင့်မှု","zh":"听力技能练习","si":"ඇහුම්කන් දීමේ කුසලතා පුහුණුව","fil":"Listening skill practice"},
    "is.meaningUsage": {"bn":"শব্দের meaning ও usage","en":"Word meanings & usage","ja":"単語の意味と使い方","vi":"Meaning & usage của từ","ne":"शब्दको meaning र usage","hi":"शब्द के meaning और usage","ur":"لفظ کے معنی اور استعمال","my":"စကားလုံး အဓိပ္ပာယ်နှင့် အသုံးပြုပုံ","zh":"单词含义与用法","si":"වචනවල අර්ථය සහ භාවිතය","fil":"Meaning at usage ng mga salita"},
    "is.openPart": {"bn":"এই অংশ খুলুন","en":"Open this part","ja":"この部分を開く","vi":"Mở phần này","ne":"यो भाग खोल्नुहोस्","hi":"यह भाग खोलें","ur":"یہ حصہ کھولیں","my":"ဤအပိုင်း ဖွင့်ပါ","zh":"打开此部分","si":"මෙම කොටස විවෘත කරන්න","fil":"Buksan ang bahaging ito"},
    "is.panelTitle": {"bn":"এই সেকশনের অংশসমূহ","en":"Parts of this section","ja":"このセクションの内容","vi":"Các phần của section này","ne":"यस section का भागहरू","hi":"इस section के भाग","ur":"اس section کے حصے","my":"ဤ section ၏ အစိတ်အပိုင်းများ","zh":"本部分的内容","si":"මෙම කොටසේ අංග","fil":"Mga bahagi ng section na ito"},
    "is.questionTechnique": {"bn":"Question ধরার কৌশল","en":"Techniques for catching questions","ja":"質問をつかむコツ","vi":"Kỹ thuật nắm bắt Question","ne":"Question समात्ने तरिका","hi":"Question पकड़ने की तरकीब","ur":"Question پکڑنے کی ترکیب","my":"မေးခွန်း ဖမ်းနည်း","zh":"抓题技巧","si":"ප්‍රශ්න අල්ලා ගැනීමේ උපක්‍රම","fil":"Mga teknik sa pagkuha ng Question"},
    "is.quickNav": {"bn":"দ্রুত নেভিগেশন","en":"Quick navigation","ja":"クイックナビゲーション","vi":"Điều hướng nhanh","ne":"छिटो नेभिगेसन","hi":"त्वरित नेविगेशन","ur":"فوری نیویگیشن","my":"အမြန် လမ်းညွှန်","zh":"快速导航","si":"ඉක්මන් සංචාලනය","fil":"Mabilisang nabigasyon"},
    "is.quickReview": {"bn":"Exam-এর আগে দ্রুত ঝালাই","en":"Quick review before the exam","ja":"試験前のクイック復習","vi":"Ôn nhanh trước Exam","ne":"Exam अघि छिटो दोहोर्याइ","hi":"Exam से पहले त्वरित दोहराव","ur":"Exam سے پہلے فوری دہرائی","my":"Exam မတိုင်မီ အမြန် ပြန်လှန်ရန်","zh":"考试前快速复习","si":"විභාගයට පෙර ඉක්මන් පුනරීක්ෂණය","fil":"Mabilisang review bago ang Exam"},
    "is.readingMeaning": {"bn":"Reading ও meaning practice","en":"Reading & meaning practice","ja":"リーディングと意味の練習","vi":"Practice Reading & meaning","ne":"Reading र meaning practice","hi":"Reading और meaning practice","ur":"Reading اور meaning کی practice","my":"Reading နှင့် အဓိပ္ပာယ် လေ့ကျင့်မှု","zh":"阅读与含义练习","si":"කියවීම සහ අර්ථ පුහුණුව","fil":"Reading at meaning practice"},
    "is.realConversation": {"bn":"বাস্তব কথোপকথন practice","en":"Real conversation practice","ja":"実際の会話練習","vi":"Practice hội thoại thực tế","ne":"वास्तविक कुराकानी practice","hi":"वास्तविक बातचीत practice","ur":"حقیقی گفتگو کی practice","my":"စကားပြော လက်တွေ့ လေ့ကျင့်မှု","zh":"真实会话练习","si":"සැබෑ සංවාද පුහුණුව","fil":"Practice ng totoong usapan"},
    "is.realPractice": {"bn":"বাস্তব পরীক্ষার practice","en":"Real exam practice","ja":"本番試験の練習","vi":"Practice kỳ thi thật","ne":"वास्तविक परीक्षाको practice","hi":"वास्तविक परीक्षा की practice","ur":"حقیقی امتحان کی practice","my":"စာမေးပွဲအစစ် လေ့ကျင့်မှု","zh":"真实考试练习","si":"සැබෑ විභාග පුහුණුව","fil":"Practice ng totoong exam"},
    "is.ruleAnswer": {"bn":"Rule চিনে answer দিন","en":"Spot the rule and answer","ja":"ルールを見分けて答える","vi":"Nhận biết Rule rồi trả lời","ne":"Rule चिनेर answer दिनुहोस्","hi":"Rule पहचानकर answer दें","ur":"Rule پہچان کر جواب دیں","my":"Rule မှတ်ပြီး ဖြေပါ","zh":"认清规则再作答","si":"නීතිය හඳුනාගෙන පිළිතුරු දෙන්න","fil":"Kilalanin ang Rule at sumagot"},
    "is.ruleInLang": {"bn":"Rule বাংলায় বুঝুন","en":"Understand rules in English","ja":"ルールを日本語で理解する","vi":"Hiểu Rule bằng tiếng Việt","ne":"Rule नेपालीमा बुझ्नुहोस्","hi":"Rule हिंदी में समझें","ur":"Rule اردو میں سمجھیں","my":"Rule ကို မြန်မာလို နားလည်ပါ","zh":"用中文理解规则","si":"නීති සිංහලෙන් තේරුම් ගන්න","fil":"Intindihin ang Rule sa Filipino"},
    "is.structuredLessons": {"bn":"{n}টি structured lesson","en":"{n} structured lessons","ja":"{n}件の構成レッスン","vi":"{n} lesson có cấu trúc","ne":"{n} वटा structured lesson","hi":"{n} structured lesson","ur":"{n} structured lesson","my":"structured lesson {n} ခု","zh":"{n} 个结构化课程","si":"ව්‍යුහගත පාඩම් {n} ක්","fil":"{n} structured lesson"},
    "is.tapCard": {"bn":"যে বিষয়টি দরকার, কার্ডে চাপুন। মূল content এবং কাজ আগের মতোই থাকবে।","en":"Tap the card for the topic you need. The main content and features stay as before.","ja":"必要なトピックのカードをタップしてください。メインコンテンツと機能はこれまで通りです。","vi":"Chạm vào thẻ của chủ đề bạn cần. Nội dung chính và tính năng vẫn như trước.","ne":"चाहिएको विषयको कार्डमा थिच्नुहोस्। मुख्य content र सुविधाहरू पहिले जस्तै रहनेछन्।","hi":"जिस विषय की ज़रूरत हो, उस कार्ड पर टैप करें। मुख्य content और सुविधाएँ पहले जैसी ही रहेंगी।","ur":"جس موضوع کی ضرورت ہو، اس کارڈ پر تھپتھپائیں۔ اصل content اور خصوصیات پہلے جیسی ہی رہیں گی۔","my":"လိုအပ်သော အကြောင်းအရာ ကတ်ကို နှိပ်ပါ။ အဓိက content နှင့် လုပ်ဆောင်ချက်များ ယခင်အတိုင်းပင် ဖြစ်ပါသည်။","zh":"点击你需要的主题卡片。主要内容和功能保持不变。","si":"ඔබට අවශ්‍ය මාතෘකා කාඩ්පත තට්ටු කරන්න. ප්‍රධාන අන්තර්ගතය සහ විශේෂාංග පෙර පරිදිම පවතී.","fil":"I-tap ang card ng paksang kailangan mo. Ang pangunahing content at mga feature ay mananatiling gaya ng dati."},
    "is.testYourself": {"bn":"নিজেকে পরীক্ষা করুন","en":"Test yourself","ja":"自分をテストする","vi":"Tự kiểm tra","ne":"आफूलाई जाँच्नुहोस्","hi":"खुद को परखें","ur":"خود کو آزمائیں","my":"ကိုယ့်ကိုယ်ကို စမ်းသပ်ပါ","zh":"自我测试","si":"ඔබම පරීක්ෂා කරන්න","fil":"Subukan ang sarili mo"},
    "is.usefulJapanese": {"bn":"দরকারি জাপানি","en":"Useful Japanese","ja":"便利な日本語","vi":"Japanese hữu ích","ne":"उपयोगी Japanese","hi":"उपयोगी Japanese","ur":"مفید Japanese","my":"အသုံးဝင်သော Japanese","zh":"实用日语","si":"ප්‍රයෝජනවත් ජපන් බස","fil":"Kapaki-pakinabang na Japanese"},
    "is.weakSpots": {"bn":"দুর্বল জায়গা ঝালাই করুন","en":"Brush up your weak spots","ja":"弱点を復習する","vi":"Ôn lại điểm yếu","ne":"कमजोर ठाउँ दोहोर्याउनुहोस्","hi":"कमज़ोर जगहों को दोहराएं","ur":"کمزور جگہیں دہرائیں","my":"အားနည်းသော နေရာများ ပြန်လှန်ပါ","zh":"复习薄弱环节","si":"දුර්වල තැන් පුනරීක්ෂණය කරන්න","fil":"I-review ang mga mahihinang bahagi"},
    "is.whatsInside": {"bn":"যা যা আছে","en":"what's inside","ja":"内容一覧","vi":"những gì có bên trong","ne":"के के छ","hi":"क्या-क्या है","ur":"کیا کیا ہے","my":"ပါဝင်သည်များ","zh":"包含内容","si":"ඇතුළත් දේ","fil":"kung ano ang laman"},
    "kj.itemsFound": {"bn":"{n}টি item পাওয়া গেছে","en":"{n} items found","ja":"{n}項目が見つかりました","vi":"Đã tìm thấy {n} mục","ne":"{n} वटा item भेटियो","hi":"{n} item मिले","ur":"{n} item ملے","my":"item {n} ခု တွေ့ရှိပါတယ်","zh":"找到 {n} 个 item","si":"item {n} ක් හමු විය","fil":"{n} item ang nakita"},
    "kj.progress": {"bn":"{done} / {total} শেষ","en":"{done} / {total} completed","ja":"{done} / {total} 完了","vi":"Đã xong {done} / {total}","ne":"{done} / {total} सकियो","hi":"{done} / {total} समाप्त","ur":"{done} / {total} ختم","my":"{done} / {total} ပြီးဆုံး","zh":"{done} / {total} 完成","si":"{done} / {total} ඉවරයි","fil":"{done} / {total} tapos"},
    "kj.restart": {"bn":"আবার শুরু করুন","en":"Start again","ja":"もう一度始める","vi":"Bắt đầu lại","ne":"फेरि सुरु गर्नुहोस्","hi":"फिर से शुरू करें","ur":"دوبارہ شروع کریں","my":"ပြန်စပါ","zh":"重新开始","si":"නැවත ආරම්භ කරන්න","fil":"Magsimula ulit"},
    "kj.score": {"bn":"স্কোর {c} / {t} · উত্তর {a}/{t}","en":"Score {c} / {t} · Answered {a}/{t}","ja":"スコア {c} / {t} · 回答 {a}/{t}","vi":"Điểm {c} / {t} · Đã trả lời {a}/{t}","ne":"स्कोर {c} / {t} · उत्तर {a}/{t}","hi":"स्कोर {c} / {t} · उत्तर {a}/{t}","ur":"اسکور {c} / {t} · جواب {a}/{t}","my":"အမှတ် {c} / {t} · ဖြေဆိုပြီး {a}/{t}","zh":"得分 {c} / {t} · 已答 {a}/{t}","si":"ලකුණු {c} / {t} · පිළිතුරු {a}/{t}","fil":"Score {c} / {t} · Nasagot {a}/{t}"},
    "ko.close": {"bn":"✕ বন্ধ","en":"✕ Close","ja":"✕ 閉じる","vi":"✕ Đóng","ne":"✕ बन्द","hi":"✕ बंद करें","ur":"✕ بند کریں","my":"✕ ပိတ်ရန်","zh":"✕ 关闭","si":"✕ වසන්න","fil":"✕ Isara"},
    "ko.options": {"bn":"☰ অপশন","en":"☰ Options","ja":"☰ オプション","vi":"☰ Tùy chọn","ne":"☰ विकल्प","hi":"☰ विकल्प","ur":"☰ آپشنز","my":"☰ ရွေးချယ်စရာများ","zh":"☰ 选项","si":"☰ විකල්ප","fil":"☰ Mga opsyon"},
    "ll.librarySuffix": {"bn":" · আপনার শেখার লাইব্রেরি","en":" · your learning library","ja":" · あなたの学習ライブラリ","vi":" · thư viện học tập của bạn","ne":" · तपाईंको सिकाइ पुस्तकालय","hi":" · आपकी सीखने की लाइब्रेरी","ur":" · آپ کی سیکھنے کی لائبریری","my":" · သင့်သင်ယူမှု စာကြည့်တိုက်","zh":" · 你的学习图书馆","si":" · ඔබේ ඉගෙනුම් පුස්තකාලය","fil":" · ang iyong learning library"},
    "ll.quartetSuffix": {"bn":" · QUARTET I ও II","en":" · QUARTET I and II","ja":" · QUARTET IとII","vi":" · QUARTET I và II","ne":" · QUARTET I र II","hi":" · QUARTET I और II","ur":" · QUARTET I اور II","my":" · QUARTET I နှင့် II","zh":" · QUARTET I 和 II","si":" · QUARTET I සහ II","fil":" · QUARTET I at II"},
    "ll.resources": {"bn":"{n}টি রিসোর্স","en":"{n} resources","ja":"{n}件のリソース","vi":"{n} tài nguyên","ne":"{n} वटा रिसोर्स","hi":"{n} संसाधन","ur":"{n} وسائل","my":"အရင်းအမြစ် {n} ခု","zh":"{n} 个资源","si":"සම්පත් {n} ක්","fil":"{n} resources"},
    "mc.heroText": {"bn":"আপনার নিহোনে পূর্ণ মক পরীক্ষা দিন। পার্ট অনুযায়ী টাইমার, অটো-সেভ, বিস্তারিত স্কোর, প্রতিটি উত্তরের বাংলা ব্যাখ্যা এবং নিজের নামে সনদ।","en":"Take full mock tests on Aponar Nihon. Part-by-part timer, auto-save, detailed scores, English explanations for every answer and a certificate in your own name.","ja":"Aponar Nihonでフル模擬試験を受けましょう。パートごとのタイマー、自動保存、詳しいスコア、すべての答えの日本語解説、そして自分の名前の証明書。","vi":"Làm bài mock test đầy đủ trên Aponar Nihon. Hẹn giờ theo từng phần, tự động lưu, điểm chi tiết, giải thích tiếng Việt cho mọi đáp án và chứng chỉ mang tên bạn.","ne":"Aponar Nihon मा पूर्ण मक परीक्षा दिनुहोस्। भाग अनुसार टाइमर, अटो-सेभ, विस्तृत स्कोर, प्रत्येक उत्तरको नेपाली व्याख्या र आफ्नै नामको प्रमाणपत्र।","hi":"Aponar Nihon पर पूर्ण मॉक परीक्षा दें। पार्ट के अनुसार टाइमर, ऑटो-सेव, विस्तृत स्कोर, हर उत्तर की हिंदी व्याख्या और अपने नाम का प्रमाणपत्र।","ur":"Aponar Nihon پر مکمل فرضی امتحان دیں۔ حصے کے مطابق ٹائمر، خودکار محفوظ، تفصیلی اسکور، ہر جواب کی اردو وضاحت اور اپنے نام کا سرٹیفکیٹ۔","my":"Aponar Nihon တွင် အပြည့်အစုံ အစမ်း စာမေးပွဲ ဖြေပါ။ အပိုင်းအလိုက် အချိန်မှတ်ကိရိယာ၊ အလိုအလျောက် သိမ်းဆည်းမှု၊ အသေးစိတ် အမှတ်၊ အဖြေတိုင်း၏ မြန်မာ ရှင်းလင်းချက်နှင့် ကိုယ်ပိုင်အမည် လက်မှတ်။","zh":"在 Aponar Nihon 参加完整的模拟考试。按部分计时、自动保存、详细成绩、每道题的中文讲解，还有以你本人名字颁发的证书。","si":"Aponar Nihon හි සම්පූර්ණ අනුකරණ පරීක්ෂණ කරන්න. කොටස් අනුව ටයිමරය, ස්වයංක්‍රීය සුරැකීම, සවිස්තර ලකුණු, සෑම පිළිතුරකටම සිංහල පැහැදිලි කිරීම සහ ඔබේම නමින් සහතිකය.","fil":"Kumuha ng buong mock test sa Aponar Nihon. Timer bawat part, auto-save, detalyadong score, paliwanag sa Filipino para sa bawat sagot at certificate sa sarili mong pangalan."},
    "mc.introText": {"bn":"প্রতিটি লেভেলে ১০টি পূর্ণ সেট। লেভেল বেছে এখানেই পরীক্ষা শুরু করুন।","en":"10 full sets at every level. Pick your level and start the exam right here.","ja":"各レベルに10セットのフルテスト。レベルを選んで、ここで試験を始めましょう。","vi":"Mỗi level có 10 bộ đầy đủ. Chọn level và bắt đầu bài thi ngay tại đây.","ne":"प्रत्येक लेभलमा १० वटा पूर्ण सेट। लेभल छानेर यहीँ परीक्षा सुरु गर्नुहोस्।","hi":"हर लेवल पर 10 पूर्ण सेट। लेवल चुनें और यहीं परीक्षा शुरू करें।","ur":"ہر درجے پر 10 مکمل سیٹ۔ درجہ منتخب کریں اور یہیں امتحان شروع کریں۔","my":"အဆင့်တိုင်းတွင် အစုံ 10 စုံ။ အဆင့် ရွေးပြီး ဒီမှာပဲ စာမေးပွဲ စတင်ပါ။","zh":"每个级别有 10 套完整试卷。选择级别，就在这里开始考试。","si":"සෑම මට්ටමකම සම්පූර්ණ කට්ටල 10 ක්. මට්ටම තෝරා මෙහිම විභාගය අරඹන්න.","fil":"10 buong set sa bawat level. Piliin ang level at simulan ang exam dito mismo."},
    "mc.minutes": {"bn":"{parts} = {total} মিনিট","en":"{parts} = {total} minutes","ja":"{parts} = {total} 分","vi":"{parts} = {total} phút","ne":"{parts} = {total} मिनेट","hi":"{parts} = {total} मिनट","ur":"{parts} = {total} منٹ","my":"{parts} = {total} မိနစ်","zh":"{parts} = {total} 分钟","si":"{parts} = {total} මිනිත්තු","fil":"{parts} = {total} minuto"},
    "mc.noteHtml": {"bn":"প্রশ্ন ও অডিও: JapaneseTest4You এবং আপনার নিহোনের নিজস্ব প্রশ্ন। নতুন নিজস্ব লিসেনিংয়ে জাপানি কৃত্রিম কণ্ঠ। JLPT সময় ও পাসসীমা অনুসরণ করা হয়েছে; স্কোর অনুশীলনের। <a href=\"mock-content-notes.html\" style=\"color:#93c5fd\">উৎস ও ক্রেডিট</a>","en":"Questions & audio: JapaneseTest4You and Aponar Nihon's own questions. New original listening uses a Japanese synthetic voice. JLPT timing and pass marks are followed; scores are for practice. <a href=\"/en/mock-content-notes/\" style=\"color:#93c5fd\">Source & credits</a>","ja":"問題と音声： JapaneseTest4You と Aponar Nihon の自作問題。新しい自作リスニングには日本語の合成音声を使用。JLPT の時間と合格ラインに準拠；スコアは練習用です。 <a href=\"/ja/mock-content-notes/\" style=\"color:#93c5fd\">出典とクレジット</a>","vi":"Câu hỏi & audio: JapaneseTest4You và câu hỏi tự biên soạn của Aponar Nihon. Listening tự làm mới dùng giọng tổng hợp tiếng Nhật. Tuân theo thời gian và điểm đỗ JLPT; điểm số chỉ để luyện tập. <a href=\"/vi/mock-content-notes/\" style=\"color:#93c5fd\">Nguồn & credit</a>","ne":"प्रश्न र अडियो: JapaneseTest4You र Aponar Nihon का आफ्नै प्रश्न। नयाँ आफ्नै लिसेनिङमा जापानी कृत्रिम आवाज। JLPT समय र पाससीमा अनुसरण गरिएको छ; स्कोर अभ्यासको लागि हो। <a href=\"/ne/mock-content-notes/\" style=\"color:#93c5fd\">स्रोत र क्रेडिट</a>","hi":"प्रश्न और ऑडियो: JapaneseTest4You और Aponar Nihon के अपने प्रश्न। नई अपनी लिसनिंग में जापानी कृत्रिम आवाज़। JLPT समय और पास सीमा का पालन किया गया है; स्कोर अभ्यास के लिए है। <a href=\"/hi/mock-content-notes/\" style=\"color:#93c5fd\">स्रोत और क्रेडिट</a>","ur":"سوالات اور آڈیو: JapaneseTest4You اور Aponar Nihon کے اپنے سوالات۔ نئی اپنی لسٹننگ میں جاپانی مصنوعی آواز۔ JLPT وقت اور پاس حد کی پیروی کی گئی ہے؛ اسکور مشق کے لیے ہے۔ <a href=\"/ur/mock-content-notes/\" style=\"color:#93c5fd\">ماخذ اور کریڈٹ</a>","my":"မေးခွန်းနှင့် အသံ: JapaneseTest4You နှင့် Aponar Nihon ၏ ကိုယ်ပိုင် မေးခွန်းများ။ ကိုယ်ပိုင် နားထောင်မှု အသစ်တွင် ဂျပန် အတုအယောင် အသံ။ JLPT အချိန်နှင့် အောင်မှတ်ကို လိုက်နာထားသည်； အမှတ်မှာ လေ့ကျင့်ရန် ဖြစ်သည်။ <a href=\"/my/mock-content-notes/\" style=\"color:#93c5fd\">အရင်းအမြစ်နှင့် credit</a>","zh":"题目与音频：JapaneseTest4You 和 Aponar Nihon 的自编题目。新的自编听力使用日语合成语音。遵循 JLPT 的时间和及格线；成绩仅供练习。 <a href=\"/zh/mock-content-notes/\" style=\"color:#93c5fd\">来源与鸣谢</a>","si":"ප්‍රශ්න සහ ශ්‍රව්‍ය: JapaneseTest4You සහ Aponar Nihon හිමිකාර ප්‍රශ්න. නව ස්වයං සවන්දීමේ ජපන් කෘත්‍රිම හඬ. JLPT කාලය සහ සමත් සීමාව අනුගමනය කර ඇත; ලකුණු පුහුණුව සඳහාය. <a href=\"/si/mock-content-notes/\" style=\"color:#93c5fd\">මූලාශ්‍ර සහ ගෞරවය</a>","fil":"Mga tanong at audio: JapaneseTest4You at sariling mga tanong ng Aponar Nihon. Ang bagong sariling listening ay gumagamit ng Japanese synthetic voice. Sinusunod ang oras at passing mark ng JLPT; ang score ay para sa practice. <a href=\"/fil/mock-content-notes/\" style=\"color:#93c5fd\">Source at credits</a>"},
    "mc.questions": {"bn":"{parts} = {total} প্রশ্ন","en":"{parts} = {total} questions","ja":"{parts} = {total} 問","vi":"{parts} = {total} câu hỏi","ne":"{parts} = {total} प्रश्न","hi":"{parts} = {total} प्रश्न","ur":"{parts} = {total} سوالات","my":"{parts} = {total} မေးခွန်း","zh":"{parts} = {total} 题","si":"{parts} = {total} ප්‍රශ්න","fil":"{parts} = {total} tanong"},
    "mc.reloadSetsSuffix": {"bn":"। পেজ রিলোড করে চালু সেট দেখুন।","en":". Reload the page to see the available sets.","ja":"。ページを再読み込みして、利用可能なセットを見てください。","vi":". Tải lại trang để xem các bộ đang mở.","ne":"। पृष्ठ reload गरेर चालु सेट हेर्नुहोस्।","hi":"। पेज reload करके चालू सेट देखें।","ur":"۔ صفحہ دوبارہ لوڈ کر کے فعال سیٹ دیکھیں۔","my":"။ စာမျက်နှာ ပြန်ဖွင့်၍ ရနိုင်သော အစုံများ ကြည့်ပါ။","zh":"。请重新加载页面查看可用套卷。","si":". ලබා ගත හැකි කට්ටල බැලීමට පිටුව නැවත පූරණය කරන්න.","fil":". I-reload ang page para makita ang mga available na set."},
    "mc.setsLine": {"bn":"JLPT {level} · {n}টি চালু পূর্ণ পরীক্ষা","en":"JLPT {level} · {n} full tests available","ja":"JLPT {level} · {n}件のフルテスト利用可能","vi":"JLPT {level} · {n} bài test đầy đủ đang mở","ne":"JLPT {level} · {n} वटा चालु पूर्ण परीक्षा","hi":"JLPT {level} · {n} चालू पूर्ण परीक्षाएं","ur":"JLPT {level} · {n} فعال مکمل ٹیسٹ","my":"JLPT {level} · အပြည့်အစုံ စာမေးပွဲ {n} ခု ရနိုင်ပါတယ်","zh":"JLPT {level} · {n} 套完整考试可用","si":"JLPT {level} · සම්පූර්ණ පරීක්ෂණ {n} ක් ලබා ගත හැක","fil":"JLPT {level} · {n} buong test ang available"},
    "mc.statsLine": {"bn":"{n}টি চালু পূর্ণ পরীক্ষা · ৩টি লেভেল · নিজের সাইটেই পরীক্ষা ও ফলাফল","en":"{n} full tests available · 3 levels · exam and results right on this site","ja":"{n}件のフルテスト利用可能 · 3レベル · 試験と結果はこのサイトで","vi":"{n} bài test đầy đủ đang mở · 3 level · thi và kết quả ngay trên site này","ne":"{n} वटा चालु पूर्ण परीक्षा · ३ वटा लेभल · यही साइटमै परीक्षा र नतिजा","hi":"{n} चालू पूर्ण परीक्षाएं · 3 स्तर · इसी साइट पर परीक्षा और परिणाम","ur":"{n} فعال مکمل ٹیسٹ · 3 درجے · اسی سائٹ پر امتحان اور نتائج","my":"အပြည့်အစုံ စာမေးပွဲ {n} ခု ရနိုင်ပါတယ် · အဆင့် 3 ခု · ဤ site တွင်ပင် စာမေးပွဲနှင့် ရလဒ်","zh":"{n} 套完整考试可用 · 3 个级别 · 就在本网站考试和查看成绩","si":"සම්පූර්ණ පරීක්ෂණ {n} ක් ලබා ගත හැක · මට්ටම් 3 ක් · මෙම අඩවියේම විභාගය සහ ප්‍රතිඵල","fil":"{n} buong test ang available · 3 level · exam at resulta dito mismo sa site"},
    "mh.cardNeedQuestions": {"bn":"নতুন আলাদা প্রশ্ন প্রয়োজন","en":"New separate questions needed","ja":"新しい別の問題が必要です","vi":"Cần câu hỏi riêng mới","ne":"नयाँ अलग प्रश्न चाहिन्छ","hi":"नए अलग प्रश्न चाहिए","ur":"نئے الگ سوالات درکار ہیں","my":"မေးခွန်းအသစ် သီးခြား လိုအပ်ပါတယ်","zh":"需要新的单独题目","si":"නව වෙනම ප්‍රශ්න අවශ්‍යයි","fil":"Kailangan ng bagong hiwalay na mga tanong"},
    "mh.cardSections": {"bn":"শব্দভাণ্ডার · গ্রামার/রিডিং · লিসেনিং","en":"Vocabulary · Grammar/Reading · Listening","ja":"語彙・文法/読解・リスニング","vi":"Từ vựng · Grammar/Reading · Listening","ne":"शब्दावली · Grammar/Reading · Listening","hi":"शब्दावली · Grammar/Reading · Listening","ur":"الفاظ · Grammar/Reading · Listening","my":"ဝေါဟာရ · Grammar/Reading · Listening","zh":"词汇·语法/阅读·听力","si":"ශබ්දකෝෂය · ව්‍යාකරණ/කියවීම · සවන්දීම","fil":"Bokabularyo · Grammar/Reading · Listening"},
    "mh.credits": {"bn":"উৎস ও অডিও ক্রেডিট","en":"Source & audio credits","ja":"出典と音声クレジット","vi":"Nguồn & credit audio","ne":"स्रोत र अडियो क्रेडिट","hi":"स्रोत और ऑडियो क्रेडिट","ur":"ماخذ اور آڈیو کریڈٹ","my":"အရင်းအမြစ်နှင့် အသံ credit","zh":"来源与音频鸣谢","si":"මූලාශ්‍ර සහ ශ්‍රව්‍ය ගෞරවය","fil":"Source at audio credits"},
    "mh.fullSet": {"bn":"পূর্ণ পরীক্ষার সেট","en":"Full exam set","ja":"フル試験セット","vi":"Bộ test đầy đủ","ne":"पूर्ण परीक्षा सेट","hi":"पूर्ण परीक्षा सेट","ur":"مکمل امتحانی سیٹ","my":"စာမေးပွဲ အစုံလိုက်","zh":"完整考试套卷","si":"සම්පූර්ණ විභාග කට්ටලය","fil":"Buong exam set"},
    "mh.heroSets": {"bn":"{n}টি চালু পূর্ণ পরীক্ষা। পরীক্ষা, টাইমার, ফলাফল, বাংলা ব্যাখ্যা ও সনদ—সব এখানেই।","en":"{n} full tests available. Exam, timer, results, English explanations and certificates—all here.","ja":"{n}件のフルテストが利用可能。試験、タイマー、結果、日本語の解説と証明書—すべてここに。","vi":"{n} bài test đầy đủ đang mở. Thi, hẹn giờ, kết quả, giải thích tiếng Việt và chứng chỉ—tất cả ở đây.","ne":"{n} वटा चालु पूर्ण परीक्षा। परीक्षा, टाइमर, नतिजा, नेपाली व्याख्या र प्रमाणपत्र—सबै यहीँ।","hi":"{n} चालू पूर्ण परीक्षाएं। परीक्षा, टाइमर, परिणाम, हिंदी व्याख्या और प्रमाणपत्र—सब यहीं।","ur":"{n} فعال مکمل ٹیسٹ۔ امتحان، ٹائمر، نتائج، اردو وضاحت اور سرٹیفکیٹ—سب یہیں۔","my":"အပြည့်အစုံ စာမေးပွဲ {n} ခု ရနိုင်ပါတယ်။ စာမေးပွဲ၊ အချိန်မှတ်ကိရိယာ၊ ရလဒ်၊ မြန်မာ ရှင်းလင်းချက်နှင့် လက်မှတ်—အားလုံး ဒီမှာပါ။","zh":"{n} 套完整考试可用。考试、计时器、成绩、中文讲解和证书——全都在这里。","si":"සම්පූර්ණ පරීක්ෂණ {n} ක් ලබා ගත හැක. විභාගය, ටයිමරය, ප්‍රතිඵල, සිංහල පැහැදිලි කිරීම් සහ සහතික—සියල්ල මෙහි.","fil":"{n} buong test ang available. Exam, timer, resulta, paliwanag sa Filipino at certificate—lahat nandito."},
    "mh.levelBeginner": {"bn":"বিগিনার","en":"Beginner","ja":"ビギナー","vi":"Beginner","ne":"बिगिनर","hi":"बिगिनर","ur":"بگنر","my":"Beginner","zh":"初学者","si":"ආරම්භක","fil":"Beginner"},
    "mh.levelElementary": {"bn":"এলিমেন্টারি","en":"Elementary","ja":"エレメンタリー","vi":"Elementary","ne":"एलिमेन्टरी","hi":"एलीमेंटरी","ur":"ایلیمنٹری","my":"Elementary","zh":"初级","si":"ප්‍රාථමික","fil":"Elementary"},
    "mh.levelIntermediate": {"bn":"ইন্টারমিডিয়েট","en":"Intermediate","ja":"インターミディエイト","vi":"Intermediate","ne":"इन्टरमिडिएट","hi":"इंटरमीडिएट","ur":"انٹرمیڈیٹ","my":"Intermediate","zh":"中级","si":"මධ්‍යම","fil":"Intermediate"},
    "mh.loadFail": {"bn":"টেস্ট তালিকা লোড হয়নি","en":"The test list did not load","ja":"テスト一覧を読み込めませんでした","vi":"Danh sách test chưa tải được","ne":"टेस्ट सूची load भएन","hi":"टेस्ट सूची load नहीं हुई","ur":"ٹیسٹ فہرست لوڈ نہیں ہوئی","my":"စာမေးပွဲ စာရင်း မဖွင့်နိုင်ပါ","zh":"考试列表加载失败","si":"පරීක්ෂණ ලැයිස්තුව පූරණය නොවීය","fil":"Hindi nag-load ang listahan ng test"},
    "mh.loading": {"bn":"পরীক্ষার তালিকা লোড হচ্ছে…","en":"Loading the test list…","ja":"テスト一覧を読み込み中…","vi":"Đang tải danh sách test…","ne":"परीक्षा सूची load हुँदैछ…","hi":"परीक्षा सूची load हो रही है…","ur":"ٹیسٹ فہرست لوڈ ہو رہی ہے…","my":"စာမေးပွဲ စာရင်း ဖွင့်နေပါတယ်…","zh":"正在加载考试列表…","si":"පරීක්ෂණ ලැයිස්තුව පූරණය වෙමින්…","fil":"Naglo-load ang listahan ng test…"},
    "mh.minutes": {"bn":"{t} মিনিট","en":"{t} minutes","ja":"{t} 分","vi":"{t} phút","ne":"{t} मिनेट","hi":"{t} मिनट","ur":"{t} منٹ","my":"{t} မိနစ်","zh":"{t} 分钟","si":"{t} මිනිත්තු","fil":"{t} minuto"},
    "mh.mockCert": {"bn":"মক পরীক্ষার সনদ","en":"Mock exam certificate","ja":"模擬試験の証明書","vi":"Chứng chỉ mock exam","ne":"मक परीक्षा प्रमाणपत्र","hi":"मॉक परीक्षा प्रमाणपत्र","ur":"فرضی امتحان کا سرٹیفکیٹ","my":"အစမ်း စာမေးပွဲ လက်မှတ်","zh":"模拟考试证书","si":"අනුකරණ විභාග සහතිකය","fil":"Mock exam certificate"},
    "mh.needPractice": {"bn":"আরও প্র্যাকটিস দরকার","en":"More practice needed","ja":"もっと練習が必要です","vi":"Cần practice thêm","ne":"थप अभ्यास चाहिन्छ","hi":"और अभ्यास चाहिए","ur":"مزید مشق درکار ہے","my":"လေ့ကျင့်မှု ထပ်လိုပါတယ်","zh":"需要更多练习","si":"තවත් පුහුණුව අවශ්‍යයි","fil":"Kailangan pa ng practice"},
    "mh.notReady": {"bn":"প্রশ্ন প্রস্তুত হয়নি","en":"Questions not ready yet","ja":"問題がまだ準備できていません","vi":"Câu hỏi chưa sẵn sàng","ne":"प्रश्न तयार छैन","hi":"प्रश्न तैयार नहीं हैं","ur":"سوالات تیار نہیں ہیں","my":"မေးခွန်းများ မပြင်ဆင်ရသေး","zh":"题目尚未准备好","si":"ප්‍රශ්න තවම සූදානම් නැත","fil":"Hindi pa handa ang mga tanong"},
    "mh.notReadyTag": {"bn":"প্রস্তুত হয়নি","en":"Not ready","ja":"未準備","vi":"Chưa sẵn sàng","ne":"तयार छैन","hi":"तैयार नहीं","ur":"تیار نہیں","my":"မပြင်ဆင်ရသေး","zh":"尚未就绪","si":"සූදානම් නැත","fil":"Hindi pa handa"},
    "mh.notTaken": {"bn":"এখনও পরীক্ষা দেওয়া হয়নি","en":"Not taken yet","ja":"まだ受験していません","vi":"Chưa làm bài","ne":"अझै परीक्षा दिइएको छैन","hi":"अभी परीक्षा नहीं दी","ur":"ابھی امتحان نہیں دیا","my":"စာမေးပွဲ မဖြေရသေး","zh":"尚未参加考试","si":"තවම විභාගය කර නැත","fil":"Hindi pa nasasagutan"},
    "mh.passMark": {"bn":"পাসসীমা {p}/১৮০","en":"Pass mark {p}/180","ja":"合格ライン {p}/180","vi":"Điểm đỗ {p}/180","ne":"पाससीमा {p}/१८०","hi":"पास सीमा {p}/180","ur":"پاس حد {p}/180","my":"အောင်မှတ် {p}/180","zh":"及格线 {p}/180","si":"සමත් සීමාව {p}/180","fil":"Passing mark {p}/180"},
    "mh.passed": {"bn":"মক পরীক্ষায় উত্তীর্ণ","en":"Passed the mock exam","ja":"模擬試験に合格","vi":"Đã đỗ mock exam","ne":"मक परीक्षामा उत्तीर्ण","hi":"मॉक परीक्षा में उत्तीर्ण","ur":"فرضی امتحان میں کامیاب","my":"အစမ်း စာမေးပွဲ အောင်မြင်","zh":"模拟考试通过","si":"අනුකරණ විභාගය සමත්","fil":"Pumasa sa mock exam"},
    "mh.pendingNote": {"bn":"পূর্ণ সেটের প্রশ্ন ও বাংলা ব্যাখ্যা যাচাই বাকি","en":"Full-set questions and English explanations still being checked","ja":"フルセットの問題と日本語の解説を確認中","vi":"Câu hỏi bộ đầy đủ và giải thích tiếng Việt đang được kiểm tra","ne":"पूर्ण सेटका प्रश्न र नेपाली व्याख्या जाँच बाँकी","hi":"पूर्ण सेट के प्रश्न और हिंदी व्याख्या की जांच बाकी","ur":"مکمل سیٹ کے سوالات اور اردو وضاحت کی جانچ باقی","my":"အစုံလိုက် မေးခွန်းနှင့် မြန်မာ ရှင်းလင်းချက် စစ်ဆေးရန် ကျန်","zh":"完整套卷的题目和中文讲解尚在核对","si":"සම්පූර්ණ කට්ටලයේ ප්‍රශ්න සහ සිංහල පැහැදිලි කිරීම් පරීක්ෂා කරමින්","fil":"Sinusuri pa ang mga tanong ng buong set at mga paliwanag sa Filipino"},
    "mh.questionsCount": {"bn":"{n} প্রশ্ন","en":"{n} questions","ja":"{n} 問","vi":"{n} câu hỏi","ne":"{n} प्रश्न","hi":"{n} प्रश्न","ur":"{n} سوالات","my":"မေးခွန်း {n} ခု","zh":"{n} 题","si":"ප්‍රශ්න {n} ක්","fil":"{n} tanong"},
    "mh.readyTag": {"bn":"প্রস্তুত","en":"Ready","ja":"準備完了","vi":"Sẵn sàng","ne":"तयार","hi":"तैयार","ur":"تیار","my":"အဆင်သင့်","zh":"已就绪","si":"සූදානම්","fil":"Handa na"},
    "mh.reloadSuffix": {"bn":"। পেজ রিলোড করুন।","en":". Reload the page.","ja":"。ページを再読み込みしてください。","vi":". Tải lại trang.","ne":"। पृष्ठ reload गर्नुहोस्।","hi":"। पेज reload करें।","ur":"۔ صفحہ دوبارہ لوڈ کریں۔","my":"။ စာမျက်နှာ ပြန်ဖွင့်ပါ။","zh":"。请重新加载页面。","si":". පිටුව නැවත පූරණය කරන්න.","fil":". I-reload ang page."},
    "mh.resultCert": {"bn":"ফলাফল ও সনদ","en":"Results & certificate","ja":"結果と証明書","vi":"Kết quả & chứng chỉ","ne":"नतिजा र प्रमाणपत्र","hi":"परिणाम और प्रमाणपत्र","ur":"نتائج اور سرٹیفکیٹ","my":"ရလဒ်နှင့် လက်မှတ်","zh":"成绩与证书","si":"ප්‍රතිඵල සහ සහතිකය","fil":"Resulta at certificate"},
    "mh.retake": {"bn":"একই সেট আবার দিন","en":"Take the same set again","ja":"同じセットをもう一度","vi":"Làm lại cùng bộ","ne":"उही सेट फेरि दिनुहोस्","hi":"वही सेट फिर से दें","ur":"وہی سیٹ دوبارہ دیں","my":"တူညီသော အစုံ ပြန်ဖြေပါ","zh":"再做一次同一套","si":"එම කට්ටලයම නැවත කරන්න","fil":"Ulitin ang parehong set"},
    "mh.scorePrefix": {"bn":"স্কোর: ","en":"Score: ","ja":"スコア： ","vi":"Điểm: ","ne":"स्कोर: ","hi":"स्कोर: ","ur":"اسکور: ","my":"အမှတ်: ","zh":"得分： ","si":"ලකුණු: ","fil":"Score: "},
    "mh.scoreValue": {"bn":"{s}/১৮০","en":"{s}/180","ja":"{s}/180","vi":"{s}/180","ne":"{s}/१८०","hi":"{s}/180","ur":"{s}/180","my":"{s}/180","zh":"{s}/180","si":"{s}/180","fil":"{s}/180"},
    "mh.sourceNote": {"bn":"JapaneseTest4You ও আপনার নিহোনের নিজস্ব প্রশ্ন; প্রতিটি উত্তরের বাংলা অর্থ ও ব্যাখ্যা আছে। নতুন নিজস্ব লিসেনিংয়ে জাপানি কৃত্রিম কণ্ঠ। সময় ও পাসসীমা JLPT অনুযায়ী; স্কোর ও সনদ মক পরীক্ষার।","en":"JapaneseTest4You and Aponar Nihon's own questions; every answer has an English meaning and explanation. New original listening uses a Japanese synthetic voice. Timing and pass marks follow the JLPT; scores and certificates are from the mock exam.","ja":"JapaneseTest4You と Aponar Nihon の自作問題；すべての答えに日本語の意味と解説があります。新しい自作リスニングには日本語の合成音声を使用。時間と合格ラインは JLPT に準拠；スコアと証明書は模擬試験のものです。","vi":"JapaneseTest4You và câu hỏi tự biên soạn của Aponar Nihon; mọi đáp án đều có nghĩa và giải thích tiếng Việt. Listening tự làm mới dùng giọng tổng hợp tiếng Nhật. Thời gian và điểm đỗ theo JLPT; điểm và chứng chỉ là của mock exam.","ne":"JapaneseTest4You र Aponar Nihon का आफ्नै प्रश्न; प्रत्येक उत्तरको नेपाली अर्थ र व्याख्या छ। नयाँ आफ्नै लिसेनिङमा जापानी कृत्रिम आवाज। समय र पाससीमा JLPT अनुसार; स्कोर र प्रमाणपत्र मक परीक्षाका हुन्।","hi":"JapaneseTest4You और Aponar Nihon के अपने प्रश्न; हर उत्तर का हिंदी अर्थ और व्याख्या है। नई अपनी लिसनिंग में जापानी कृत्रिम आवाज़। समय और पास सीमा JLPT के अनुसार; स्कोर और प्रमाणपत्र मॉक परीक्षा के हैं।","ur":"JapaneseTest4You اور Aponar Nihon کے اپنے سوالات؛ ہر جواب کا اردو مطلب اور وضاحت موجود ہے۔ نئی اپنی لسٹننگ میں جاپانی مصنوعی آواز۔ وقت اور پاس حد JLPT کے مطابق؛ اسکور اور سرٹیفکیٹ فرضی امتحان کے ہیں۔","my":"JapaneseTest4You နှင့် Aponar Nihon ၏ ကိုယ်ပိုင် မေးခွန်းများ； အဖြေတိုင်းတွင် မြန်မာ အဓိပ္ပာယ်နှင့် ရှင်းလင်းချက် ရှိသည်။ ကိုယ်ပိုင် နားထောင်မှု အသစ်တွင် ဂျပန် အတုအယောင် အသံ။ အချိန်နှင့် အောင်မှတ် JLPT အတိုင်း； အမှတ်နှင့် လက်မှတ်မှာ အစမ်း စာမေးပွဲ၏ ဖြစ်သည်။","zh":"JapaneseTest4You 和 Aponar Nihon 的自编题目；每道题都有中文意思和讲解。新的自编听力使用日语合成语音。时间和及格线遵循 JLPT；成绩和证书来自模拟考试。","si":"JapaneseTest4You සහ Aponar Nihon හිමිකාර ප්‍රශ්න; සෑම පිළිතුරකටම සිංහල අර්ථය සහ පැහැදිලි කිරීම ඇත. නව ස්වයං සවන්දීමේ ජපන් කෘත්‍රිම හඬ. කාලය සහ සමත් සීමාව JLPT අනුව; ලකුණු සහ සහතිකය අනුකරණ විභාගයේය.","fil":"JapaneseTest4You at sariling mga tanong ng Aponar Nihon; bawat sagot ay may kahulugan at paliwanag sa Filipino. Ang bagong sariling listening ay gumagamit ng Japanese synthetic voice. Ang oras at passing mark ay ayon sa JLPT; ang score at certificate ay mula sa mock exam."},
    "mh.start": {"bn":"পরীক্ষা শুরু করুন","en":"Start the exam","ja":"試験を始める","vi":"Bắt đầu bài thi","ne":"परीक्षा सुरु गर्नुहोस्","hi":"परीक्षा शुरू करें","ur":"امتحان شروع کریں","my":"စာမေးပွဲ စတင်ပါ","zh":"开始考试","si":"විභාගය අරඹන්න","fil":"Simulan ang exam"},
    "mh.totalMinutes": {"bn":"মোট {t} মিনিট","en":"{t} minutes in total","ja":"合計 {t} 分","vi":"Tổng cộng {t} phút","ne":"जम्मा {t} मिनेट","hi":"कुल {t} मिनट","ur":"کل {t} منٹ","my":"စုစုပေါင်း {t} မိနစ်","zh":"共 {t} 分钟","si":"මුළු {t} මිනිත්තු","fil":"{t} minuto sa kabuuan"},
    "mh.updating": {"bn":"টেস্ট তালিকা আপডেট হচ্ছে","en":"The test list is updating","ja":"テスト一覧を更新中","vi":"Danh sách test đang cập nhật","ne":"टेस्ट सूची update हुँदैछ","hi":"टेस्ट सूची update हो रही है","ur":"ٹیسٹ فہرست اپڈیٹ ہو رہی ہے","my":"စာမေးပွဲ စာရင်း အပ်ဒိတ်လုပ်နေပါတယ်","zh":"考试列表更新中","si":"පරීක්ෂණ ලැයිස්තුව යාවත්කාලීන වෙමින්","fil":"Nag-a-update ang listahan ng test"},
    "ms.ebookError": {"bn":"eBook load করতে সমস্যা হয়েছে।","en":"There was a problem loading the eBook.","ja":"eBookの読み込みで問題が発生しました。","vi":"Đã xảy ra sự cố khi tải eBook.","ne":"eBook load गर्न समस्या भयो।","hi":"eBook load करने में समस्या हुई।","ur":"eBook لوڈ کرنے میں مسئلہ ہوا۔","my":"eBook ဖွင့်ရာတွင် ပြဿနာ ဖြစ်ပွားခဲ့သည်။","zh":"加载电子书时出现问题。","si":"eBook පූරණය කිරීමේදී ගැටලුවක් ඇතිවිය.","fil":"Nagkaproblema sa pag-load ng eBook."},
    "ms.ebookLoading": {"bn":"eBook load হচ্ছে… {p}%","en":"Loading eBook… {p}%","ja":"eBookを読み込み中… {p}%","vi":"Đang tải eBook… {p}%","ne":"eBook load हुँदैछ… {p}%","hi":"eBook load हो रहा है… {p}%","ur":"eBook لوڈ ہو رہا ہے… {p}%","my":"eBook ဖွင့်နေပါတယ်… {p}%","zh":"正在加载电子书… {p}%","si":"eBook පූරණය වෙමින්… {p}%","fil":"Naglo-load ang eBook… {p}%"},
    "ms.ebookOpening": {"bn":"Reader খুলছে…","en":"Opening the reader…","ja":"リーダーを開いています…","vi":"Đang mở trình đọc…","ne":"Reader खुल्दैछ…","hi":"Reader खुल रहा है…","ur":"ریڈر کھل رہا ہے…","my":"Reader ဖွင့်နေပါတယ်…","zh":"正在打开阅读器…","si":"කියවනය විවෘත වෙමින්…","fil":"Binubuksan ang reader…"},
    "ms.lessonDone": {"bn":"লেসন সম্পন্ন","en":"Lesson completed","ja":"レッスン完了","vi":"Lesson đã hoàn thành","ne":"Lesson सकियो","hi":"Lesson पूर्ण","ur":"Lesson مکمل","my":"Lesson ပြီးဆုံး","zh":"课程完成","si":"පාඩම අවසන්","fil":"Tapos na ang lesson"},
    "ms.vocabLoadErrorBody": {"bn":"Internet connection check করে আবার reload করুন।","en":"Check your internet connection and reload.","ja":"インターネット接続を確認して、再読み込みしてください。","vi":"Kiểm tra kết nối internet rồi tải lại.","ne":"Internet connection जाँच गरेर फेरि reload गर्नुहोस्।","hi":"Internet connection जांचकर फिर से reload करें।","ur":"انٹرنیٹ کنکشن چیک کر کے دوبارہ لوڈ کریں۔","my":"အင်တာနက် ချိတ်ဆက်မှု စစ်ဆေးပြီး ပြန်ဖွင့်ပါ။","zh":"请检查网络连接并重新加载。","si":"අන්තර්ජාල සම්බන්ධතාව පරීක්ෂා කර නැවත පූරණය කරන්න.","fil":"Suriin ang internet connection at mag-reload."},
    "ms.vocabLoadErrorTitle": {"bn":"Vocabulary load করা যায়নি","en":"Vocabulary could not be loaded","ja":"Vocabularyを読み込めませんでした","vi":"Không tải được Vocabulary","ne":"Vocabulary load गर्न सकिएन","hi":"Vocabulary load नहीं हो सका","ur":"Vocabulary لوڈ نہیں ہو سکا","my":"Vocabulary ဖွင့်၍ မရပါ","zh":"词汇加载失败","si":"ශබ්දකෝෂය පූරණය කළ නොහැක","fil":"Hindi ma-load ang Vocabulary"},
    "mt.allParts": {"bn":"সব {n} পার্ট","en":"All {n} Parts","ja":"全{n}パート","vi":"Tất cả {n} Part","ne":"सबै {n} पार्ट","hi":"सभी {n} Part","ur":"{n} تمام Part","my":"Part {n} ခု အားလုံး","zh":"全部 {n} 部分","si":"සියලුම කොටස් {n}","fil":"Lahat ng {n} Part"},
    "mt.clearSearch": {"bn":"খোঁজা মুছুন","en":"Clear search","ja":"検索をクリア","vi":"Xóa tìm kiếm","ne":"खोज मेटाउनुहोस्","hi":"खोज साफ़ करें","ur":"تلاش صاف کریں","my":"ရှာဖွေမှု ရှင်းလင်းပါ","zh":"清除搜索","si":"සෙවුම මකන්න","fil":"I-clear ang search"},
    "mt.onlyUnread": {"bn":"শুধু না-পড়া","en":"Unread only","ja":"未読のみ","vi":"Chỉ chưa đọc","ne":"नपढेको मात्र","hi":"सिर्फ़ अनपढ़ा","ur":"صرف غیر مطالعہ شدہ","my":"မဖတ်ရသေးသော အရာများ သာ","zh":"仅未读","si":"නොකියවූ දේ පමණක්","fil":"Hindi pa nababasa lang"},
    "mt.partWeek": {"bn":"পার্ট {a} • সপ্তাহ {b}","en":"Part {a} • Week {b}","ja":"パート{a} • 第{b}週","vi":"Part {a} • Tuần {b}","ne":"पार्ट {a} • हप्ता {b}","hi":"पार्ट {a} • सप्ताह {b}","ur":"حصہ {a} • ہفتہ {b}","my":"အပိုင်း {a} • ရက်သတ္တပတ် {b}","zh":"第 {a} 部分 • 第 {b} 周","si":"කොටස {a} • සතිය {b}","fil":"Part {a} • Linggo {b}"},
    "mt.print": {"bn":"ছাপান / পিডিএফ","en":"Print / PDF","ja":"印刷 / PDF","vi":"In / PDF","ne":"छाप्नुहोस् / PDF","hi":"प्रिंट / PDF","ur":"پرنٹ / PDF","my":"ပုံနှိပ် / PDF","zh":"打印 / PDF","si":"මුද්‍රණය / PDF","fil":"I-print / PDF"},
    "mt.progress": {"bn":"{done} / {total} শেখা • {left} বাকি","en":"{done} / {total} learned • {left} left","ja":"{done} / {total} 学習済み • 残り {left}","vi":"Đã học {done} / {total} • Còn {left}","ne":"{done} / {total} सिकियो • {left} बाँकी","hi":"{done} / {total} सीखे • {left} बाकी","ur":"{done} / {total} سیکھے • {left} باقی","my":"{done} / {total} သင်ယူပြီး • {left} ကျန်","zh":"已学 {done} / {total} • 还剩 {left}","si":"{done} / {total} ඉගෙන ගත්තා • {left} ක් ඉතිරියි","fil":"{done} / {total} ang natutunan • {left} ang natitira"},
    "mt.searchPlaceholder": {"bn":"জাপানি নিয়ম বা বাংলা অর্থ লিখে খুঁজুন…","en":"Search by Japanese rule or English meaning…","ja":"日本語のルールや日本語の意味で検索…","vi":"Tìm theo quy tắc Japanese hoặc nghĩa tiếng Việt…","ne":"Japanese नियम वा नेपाली अर्थ लेखेर खोज्नुहोस्…","hi":"Japanese नियम या हिंदी अर्थ लिखकर खोजें…","ur":"Japanese قاعدہ یا اردو مطلب لکھ کر تلاش کریں…","my":"Japanese စည်းမျဉ်း သို့မဟုတ် မြန်မာ အဓိပ္ပာယ် ရေးပြီး ရှာပါ…","zh":"输入日语规则或中文意思搜索…","si":"ජපන් නීතිය හෝ සිංහල අර්ථය ලියා සොයන්න…","fil":"Maghanap gamit ang Japanese rule o kahulugang Filipino…"},
    "mt.showingFull": {"bn":"{n}টি পূর্ণ পাঠ দেখা যাচ্ছে","en":"Showing {n} full lessons","ja":"{n}件の完全なレッスンを表示中","vi":"Đang hiển thị {n} bài đầy đủ","ne":"{n} वटा पूर्ण पाठ देखाइँदैछ","hi":"{n} पूर्ण पाठ दिखाए जा रहे हैं","ur":"{n} مکمل اسباق دکھائے جا رہے ہیں","my":"အပြည့်အစုံ သင်ခန်းစာ {n} ခု ပြသနေပါတယ်","zh":"正在显示 {n} 个完整课程","si":"සම්පූර්ණ පාඩම් {n} ක් පෙන්වමින්","fil":"Ipinapakita ang {n} buong lesson"},
    "mt.themeDark": {"bn":"☾ অন্ধকার","en":"☾ Dark","ja":"☾ ダーク","vi":"☾ Tối","ne":"☾ अँध्यारो","hi":"☾ गहरा","ur":"☾ تاریک","my":"☾ အမှောင်","zh":"☾ 深色","si":"☾ අඳුර","fil":"☾ Madilim"},
    "mt.themeLight": {"bn":"☀ আলো","en":"☀ Light","ja":"☀ ライト","vi":"☀ Sáng","ne":"☀ उज्यालो","hi":"☀ हल्का","ur":"☀ روشن","my":"☀ အလင်း","zh":"☀ 浅色","si":"☀ ආලෝකය","fil":"☀ Maliwanag"},
    "qn.label": {"bn":"প্রশ্ন {n}","en":"Question {n}","ja":"質問 {n}","vi":"Câu hỏi {n}","ne":"प्रश्न {n}","hi":"प्रश्न {n}","ur":"سوال {n}","my":"မေးခွန်း {n}","zh":"问题 {n}","si":"ප්‍රශ්නය {n}","fil":"Tanong {n}"},
    "qn.step": {"bn":"প্রশ্ন {a} / {b}","en":"Question {a} / {b}","ja":"質問 {a} / {b}","vi":"Câu hỏi {a} / {b}","ne":"प्रश्न {a} / {b}","hi":"प्रश्न {a} / {b}","ur":"سوال {a} / {b}","my":"မေးခွန်း {a} / {b}","zh":"问题 {a} / {b}","si":"ප්‍රශ්නය {a} / {b}","fil":"Tanong {a} / {b}"},
    "qr.ariaLessonParts": {"bn":"পাঠের অংশ","en":"Parts of the lesson","ja":"レッスンの部分","vi":"Các phần của bài","ne":"पाठका भागहरू","hi":"पाठ के भाग","ur":"سبق کے حصے","my":"သင်ခန်းစာ အစိတ်အပိုင်းများ","zh":"课程部分","si":"පාඩමේ කොටස්","fil":"Mga bahagi ng lesson"},
    "qr.avoidMistakes": {"bn":"ভুল এড়ান","en":"Avoid mistakes","ja":"間違いを避ける","vi":"Tránh lỗi","ne":"गल्ती टार्नुहोस्","hi":"गलतियों से बचें","ur":"غلطیوں سے بچیں","my":"အမှား ရှောင်ပါ","zh":"避免错误","si":"වැරදි වළකින්න","fil":"Iwasan ang mga mali"},
    "qr.buildForm": {"bn":"ধাপে ধাপে Form বানান","en":"Build the form step by step","ja":"ステップごとにFormを作る","vi":"Tạo Form từng bước","ne":"चरणबद्ध Form बनाउनुहोस्","hi":"चरण-दर-चरण Form बनाएं","ur":"مرحلہ وار Form بنائیں","my":"အဆင့်ဆင့် Form တည်ဆောက်ပါ","zh":"逐步构建形式","si":"පියවරෙන් පියවර ආකෘතිය හදන්න","fil":"Buuin ang Form nang hakbang-hakbang"},
    "qr.chipExamples": {"bn":"{n}টি উদাহরণ","en":"{n} examples","ja":"{n}件の例","vi":"{n} ví dụ","ne":"{n} वटा उदाहरण","hi":"{n} उदाहरण","ur":"{n} مثالیں","my":"ဥပမာ {n} ခု","zh":"{n} 个例句","si":"උදාහරණ {n} ක්","fil":"{n} halimbawa"},
    "qr.chipExplain": {"bn":"বাক্য ধরে ব্যাখ্যা","en":"Sentence-by-sentence explanation","ja":"文ごとの解説","vi":"Giải thích theo câu","ne":"वाक्य अनुसार व्याख्या","hi":"वाक्य-दर-वाक्य व्याख्या","ur":"جملہ بہ جملہ وضاحت","my":"ဝါကျအလိုက် ရှင်းလင်းချက်","zh":"逐句讲解","si":"වාක්‍යයෙන් වාක්‍යයට පැහැදිලි කිරීම","fil":"Paliwanag bawat pangungusap"},
    "qr.chipSelfCheck": {"bn":"নিজে যাচাই","en":"Self-check","ja":"セルフチェック","vi":"Tự kiểm tra","ne":"आफैं जाँच","hi":"स्वयं जांच","ur":"خود جانچ","my":"ကိုယ်တိုင် စစ်ဆေးရန်","zh":"自我检查","si":"ස්වයං පරීක්ෂාව","fil":"Self-check"},
    "qr.compareTitle": {"bn":"পাশাপাশি রেখে পার্থক্য বুঝুন","en":"Compare side by side and understand the difference","ja":"並べて違いを理解する","vi":"Đặt cạnh nhau và hiểu sự khác biệt","ne":"सँगै राखेर फरक बुझ्नुहोस्","hi":"साथ रखकर अंतर समझें","ur":"ساتھ رکھ کر فرق سمجھیں","my":"နှိုင်းယှဉ်၍ ကွာခြားချက် နားလည်ပါ","zh":"并排比较，理解差异","si":"පැත්තෙන් පැත්ත තබා වෙනස තේරුම් ගන්න","fil":"Ihambing nang magkatabi at intindihin ang pagkakaiba"},
    "qr.fontBig": {"bn":"বড়","en":"Big","ja":"大","vi":"Lớn","ne":"ठूलो","hi":"बड़ा","ur":"بڑا","my":"ကြီး","zh":"大","si":"විශාල","fil":"Malaki"},
    "qr.fontBigger": {"bn":"আরও বড়","en":"Bigger","ja":"さらに大","vi":"Lớn hơn","ne":"झन् ठूलो","hi":"और बड़ा","ur":"مزید بڑا","my":"ပိုကြီး","zh":"更大","si":"තවත් විශාල","fil":"Mas malaki"},
    "qr.fontNormal": {"bn":"স্বাভাবিক","en":"Normal","ja":"通常","vi":"Thường","ne":"सामान्य","hi":"सामान्य","ur":"معمول","my":"ပုံမှန်","zh":"正常","si":"සාමාන්‍ය","fil":"Normal"},
    "qr.jumpUnderstand": {"bn":"বুঝুন","en":"Understand","ja":"理解する","vi":"Hiểu","ne":"बुझ्नुहोस्","hi":"समझें","ur":"سمجھیں","my":"နားလည်ပါ","zh":"理解","si":"තේරුම් ගන්න","fil":"Intindihin"},
    "qr.lessonLabel": {"bn":"পাঠ","en":"Lesson","ja":"レッスン","vi":"Bài","ne":"पाठ","hi":"पाठ","ur":"سبق","my":"သင်ခန်းစာ","zh":"课","si":"පාඩම","fil":"Lesson"},
    "qr.memoryLine": {"bn":"এক লাইনে মনে রাখুন","en":"Remember in one line","ja":"一行で覚える","vi":"Nhớ trong một dòng","ne":"एक लाइनमा सम्झनुहोस्","hi":"एक लाइन में याद रखें","ur":"ایک سطر میں یاد رکھیں","my":"တစ်ကြောင်းတည်းဖြင့် မှတ်ထားပါ","zh":"一句话记住","si":"එක පේළියෙන් මතක තබාගන්න","fil":"Tandaan sa isang linya"},
    "qr.mistakeTitle": {"bn":"যে ভুলটি এড়িয়ে চলবেন","en":"The mistake to avoid","ja":"避けるべき間違い","vi":"Lỗi cần tránh","ne":"टार्नुपर्ने गल्ती","hi":"जिस गलती से बचना है","ur":"جس غلطی سے بچنا ہے","my":"ရှောင်ရမည့် အမှား","zh":"要避免的错误","si":"වැළකිය යුතු වැරැද්ද","fil":"Ang maling dapat iwasan"},
    "qr.ofTotal": {"bn":" / {t}","en":" / {t}","ja":" / {t}","vi":" / {t}","ne":" / {t}","hi":" / {t}","ur":" / {t}","my":" / {t}","zh":" / {t}","si":" / {t}","fil":" / {t}"},
    "qr.oneWay": {"bn":"একভাবে বললে","en":"Said one way","ja":"一つの言い方では","vi":"Nói theo một cách","ne":"एक तरिकाले भन्दा","hi":"एक तरह से कहें तो","ur":"ایک طرح سے کہیں تو","my":"တစ်နည်းဖြင့် ပြောလျှင်","zh":"一种说法","si":"එක් ආකාරයකින් කිවහොත්","fil":"Sa isang paraan ng pagsabi"},
    "qr.otherWay": {"bn":"অন্যভাবে বললে","en":"Said another way","ja":"別の言い方では","vi":"Nói theo cách khác","ne":"अर्को तरिकाले भन्दा","hi":"दूसरी तरह से कहें तो","ur":"دوسری طرح سے کہیں تو","my":"အခြားနည်းဖြင့် ပြောလျှင်","zh":"另一种说法","si":"වෙනත් ආකාරයකින් කිවහොත්","fil":"Sa ibang paraan ng pagsabi"},
    "qr.ownNote": {"bn":" · নিজস্ব বাংলা সহায়ক নোট","en":" · Own English support notes","ja":" · 自作の日本語サポートノート","vi":" · Ghi chú hỗ trợ tiếng Việt riêng","ne":" · आफ्नै नेपाली सहायक नोट","hi":" · अपने हिंदी सहायक नोट","ur":" · اپنے اردو معاون نوٹ","my":" · ကိုယ်ပိုင် မြန်မာ အထောက်အကူ မှတ်စု","zh":" · 自制中文辅助笔记","si":" · තමාගේම සිංහල උපකාරක සටහන්","fil":" · Sariling Filipino support notes"},
    "qr.resultForm": {"bn":"যে রূপটি হবে","en":"Resulting form","ja":"変化後の形","vi":"Dạng kết quả","ne":"हुने रूप","hi":"बनने वाला रूप","ur":"بننے والی شکل","my":"ဖြစ်လာမည့် ပုံစံ","zh":"变化后的形式","si":"ලැබෙන ආකෘතිය","fil":"Magiging anyo"},
    "qr.sayYourself": {"bn":"এবার নিজে একটি বাক্য বলুন","en":"Now say a sentence yourself","ja":"今度は自分で一文言ってみましょう","vi":"Bây giờ tự nói một câu","ne":"अब आफैं एक वाक्य भन्नुहोस्","hi":"अब खुद एक वाक्य कहें","ur":"اب خود ایک جملہ کہیں","my":"အခု ကိုယ်တိုင် ဝါကျတစ်ကြောင်း ပြောပါ","zh":"现在自己说一个句子","si":"දැන් ඔබම වාක්‍යයක් කියන්න","fil":"Ngayon, magsabi ka ng isang pangungusap"},
    "qr.sectionIntro": {"bn":"প্রথম দুইটি বাক্য অংশে ভাগ করা। তারপর ভিন্ন পরিস্থিতিতে একই নিয়ম দেখুন।","en":"The first two sentences are split into parts. Then see the same rule in different situations.","ja":"最初の2文は部分に分けられています。その後、違う状況で同じルールを見てみましょう。","vi":"Hai câu đầu được chia thành các phần. Sau đó xem cùng quy tắc trong các tình huống khác nhau.","ne":"पहिला दुई वाक्य भागमा विभाजित छन्। त्यसपछि फरक परिस्थितिमा उही नियम हेर्नुहोस्।","hi":"पहले दो वाक्य भागों में विभाजित हैं। फिर अलग-अलग स्थितियों में वही नियम देखें।","ur":"پہلے دو جملے حصوں میں تقسیم ہیں۔ پھر مختلف صورتوں میں وہی قاعدہ دیکھیں۔","my":"ပထမ ဝါကျနှစ်ကြောင်းကို အစိတ်အပိုင်းခွဲထားပါတယ်။ ထို့နောက် မတူညီသော အခြေအနေများတွင် တူညီသော စည်းမျဉ်း ကြည့်ပါ။","zh":"前两个句子被拆分成部分。然后在不同的情境中看同一规则。","si":"පළමු වාක්‍ය දෙක කොටස්වලට බෙදා ඇත. ඉන්පසු විවිධ අවස්ථාවල එකම නීතිය බලන්න.","fil":"Ang unang dalawang pangungusap ay hinati sa mga bahagi. Pagkatapos ay tingnan ang parehong rule sa ibang sitwasyon."},
    "qr.seeInSentence": {"bn":"বাক্যে দেখে বুঝুন","en":"See it in sentences and understand","ja":"文で見て理解する","vi":"Xem trong câu và hiểu","ne":"वाक्यमा हेरेर बुझ्नुहोस्","hi":"वाक्यों में देखकर समझें","ur":"جملوں میں دیکھ کر سمجھیں","my":"ဝါကျတွင် ကြည့်၍ နားလည်ပါ","zh":"在句子中理解","si":"වාක්‍යවලින් බලා තේරුම් ගන්න","fil":"Tingnan sa mga pangungusap at intindihin"},
    "qr.selfCheckHint": {"bn":"আগে নিজে বলুন। তারপর উত্তরের সঙ্গে Form মিলিয়ে নিন।","en":"Say it yourself first. Then match the Form with the answer.","ja":"まず自分で言ってください。その後、答えとFormを照らし合わせてください。","vi":"Hãy tự nói trước. Sau đó đối chiếu Form với đáp án.","ne":"पहिले आफैं भन्नुहोस्। त्यसपछि उत्तरसँग Form मिलाउनुहोस्।","hi":"पहले खुद कहें। फिर उत्तर से Form मिलाएं।","ur":"پہلے خود کہیں۔ پھر جواب سے Form ملائیں۔","my":"ပထမဆုံး ကိုယ်တိုင် ပြောပါ။ ထို့နောက် အဖြေနှင့် Form တိုက်ဆိုင်ပါ။","zh":"先自己说。然后将形式与答案对照。","si":"පළමුව ඔබම කියන්න. ඉන්පසු පිළිතුර සමඟ ආකෘතිය සැසඳෙන්න.","fil":"Magsabi ka muna mismo. Pagkatapos ay ihambing ang Form sa sagot."},
    "qr.sentenceParts": {"bn":"বাক্য অংশে ভাগ করে অর্থ","en":"Meaning split into sentence parts","ja":"文を部分に分けた意味","vi":"Nghĩa chia theo phần của câu","ne":"वाक्यका भागमा विभाजित अर्थ","hi":"वाक्य के भागों में विभाजित अर्थ","ur":"جملے کے حصوں میں تقسیم معنی","my":"ဝါကျ အစိတ်အပိုင်းများဖြင့် အဓိပ္ပာယ်","zh":"按句子部分拆分的含义","si":"වාක්‍ය කොටස් අනුව අර්ථය","fil":"Kahulugang hinati sa mga bahagi ng pangungusap"},
    "qr.showAnswer": {"bn":"উত্তর ও কারণ দেখুন","en":"See the answer and reason","ja":"答えと理由を見る","vi":"Xem đáp án và lý do","ne":"उत्तर र कारण हेर्नुहोस्","hi":"उत्तर और कारण देखें","ur":"جواب اور وجہ دیکھیں","my":"အဖြေနှင့် အကြောင်းပြချက် ကြည့်ပါ","zh":"查看答案和原因","si":"පිළිතුර සහ හේතුව බලන්න","fil":"Tingnan ang sagot at dahilan"},
    "qr.sourceBook": {"bn":"মূল বই পৃ. ","en":"Original book p. ","ja":"元の本 p. ","vi":"Sách gốc tr. ","ne":"मूल किताब पृ. ","hi":"मूल किताब पृ. ","ur":"اصل کتاب ص. ","my":"မူရင်း စာအုပ် စာ. ","zh":"原书 p. ","si":"මුල් පොත පි. ","fil":"Orihinal na libro p. "},
    "qr.startForm": {"bn":"শুরুর রূপ","en":"Starting form","ja":"元の形","vi":"Dạng ban đầu","ne":"सुरुको रूप","hi":"शुरुआती रूप","ur":"ابتدائی شکل","my":"အစပုံစံ","zh":"初始形式","si":"ආරම්භක ආකෘතිය","fil":"Panimulang anyo"},
    "qr.understandFirst": {"bn":"আগে পরিস্থিতিটা বুঝুন","en":"First, understand the situation","ja":"まず状況を理解しましょう","vi":"Trước tiên, hãy hiểu tình huống","ne":"पहिले परिस्थिति बुझ्नुहोस्","hi":"पहले स्थिति समझें","ur":"پہلے صورتحال سمجھیں","my":"ပထမဆုံး အခြေအနေ နားလည်ပါ","zh":"先理解情境","si":"පළමුව තත්ත්වය තේරුම් ගන්න","fil":"Una, intindihin ang sitwasyon"},
    "qr.usageImage": {"bn":"ব্যবহারের ভাবনা","en":"Usage image","ja":"使い方のイメージ","vi":"Hình dung cách dùng","ne":"प्रयोगको भावना","hi":"प्रयोग की भावना","ur":"استعمال کا تصور","my":"အသုံးပြုပုံ စိတ်ကူး","zh":"用法意象","si":"භාවිතා කරන ආකාරය පිළිබඳ හැඟීම","fil":"Larawan ng paggamit"},
    "qr.whyStructure": {"bn":"কেন এই গঠন?","en":"Why this structure?","ja":"なぜこの構造？","vi":"Tại sao cấu trúc này?","ne":"किन यो संरचना?","hi":"यह संरचना क्यों?","ur":"یہ ساخت کیوں؟","my":"ဘာကြောင့် ဒီဖွဲ့စည်းပုံ?","zh":"为什么是这个结构？","si":"ඇයි මෙම ව්‍යුහය?","fil":"Bakit ganitong istruktura?"},
    "qr.workedBadge": {"bn":"বাক্য ভেঙে বুঝুন","en":"Understand by breaking the sentence","ja":"文を分解して理解","vi":"Hiểu bằng cách chia câu","ne":"वाक्य तोडेर बुझ्नुहोस्","hi":"वाक्य तोड़कर समझें","ur":"جملہ توڑ کر سمجھیں","my":"ဝါကျ ခွဲ၍ နားလည်ပါ","zh":"拆句理解","si":"වාක්‍යය බිඳ දමා තේරුම් ගන්න","fil":"Intindihin sa paghati ng pangungusap"},
    "qs.listenDone": {"bn":"শোনা শেষ। প্রশ্নের উত্তর দিয়ে transcript মিলিয়ে নিন।","en":"Listening finished. Answer the questions and check against the transcript.","ja":"リスニング終了。質問に答えて、トランスクリプトと照らし合わせてください。","vi":"Nghe xong. Trả lời câu hỏi rồi đối chiếu với transcript.","ne":"सुन्न सकियो। प्रश्नको उत्तर दिएर transcript सँग मिलाउनुहोस्।","hi":"सुनना समाप्त। प्रश्नों के उत्तर देकर transcript से मिलाएं।","ur":"سننا ختم۔ سوالات کے جواب دے کر transcript سے ملائیں۔","my":"နားထောင်ပြီး။ မေးခွန်းများ ဖြေပြီး transcript နှင့် တိုက်ဆိုင်ပါ။","zh":"听力结束。请回答问题并与文字稿对照。","si":"ඇහුම්කන් දීම අවසන්. ප්‍රශ්නවලට පිළිතුරු දී පිටපත සමඟ සැසඳෙන්න.","fil":"Tapos na ang pakikinig. Sagutin ang mga tanong at ihambing sa transcript."},
    "qs.noJapaneseVoice": {"bn":"এই ব্রাউজারে জাপানি কণ্ঠ পাওয়া যায়নি। transcript খুলে অনুশীলন করুন।","en":"No Japanese voice found in this browser. Open the transcript and practice.","ja":"このブラウザでは日本語の音声が見つかりませんでした。トランスクリプトを開いて練習してください。","vi":"Không tìm thấy giọng Japanese trong trình duyệt này. Mở transcript và luyện tập.","ne":"यस browser मा Japanese आवाज भेटिएन। transcript खोलेर अभ्यास गर्नुहोस्।","hi":"इस browser में Japanese आवाज़ नहीं मिली। transcript खोलकर अभ्यास करें।","ur":"اس براؤزر میں Japanese آواز نہیں ملی۔ transcript کھول کر مشق کریں۔","my":"ဤ browser တွင် Japanese အသံ မတွေ့ရှိပါ။ transcript ဖွင့်၍ လေ့ကျင့်ပါ။","zh":"此浏览器未找到日语语音。请打开文字稿练习。","si":"මෙම බ්‍රවුසරයේ ජපන් හඬ හමු නොවීය. පිටපත විවෘත කර පුහුණු වන්න.","fil":"Walang Japanese voice sa browser na ito. Buksan ang transcript at mag-practice."},
    "qs.noSpeech": {"bn":"এই ব্রাউজারে কণ্ঠ চালু নেই। transcript খুলে পড়তে পারেন।","en":"Voice is not available in this browser. You can open the transcript and read.","ja":"このブラウザでは音声が使えません。トランスクリプトを開いて読めます。","vi":"Trình duyệt này không có giọng nói. Bạn có thể mở transcript để đọc.","ne":"यस browser मा आवाज उपलब्ध छैन। transcript खोलेर पढ्न सक्नुहुन्छ।","hi":"इस browser में आवाज़ उपलब्ध नहीं है। transcript खोलकर पढ़ सकते हैं।","ur":"اس براؤزر میں آواز دستیاب نہیں ہے۔ transcript کھول کر پڑھ سکتے ہیں۔","my":"ဤ browser တွင် အသံ မရနိုင်ပါ။ transcript ဖွင့်၍ ဖတ်နိုင်ပါသည်။","zh":"此浏览器没有语音。你可以打开文字稿阅读。","si":"මෙම බ්‍රවුසරයේ හඬ නොමැත. ඔබට පිටපත විවෘත කර කියවිය හැක.","fil":"Walang voice sa browser na ito. Maaari mong buksan ang transcript at basahin."},
    "qs.playing": {"bn":"জাপানি স্ক্রিপ্ট চলছে…","en":"Japanese script is playing…","ja":"日本語スクリプトを再生中…","vi":"Đang phát script Japanese…","ne":"Japanese script चलिरहेको छ…","hi":"Japanese script चल रहा है…","ur":"Japanese اسکرپٹ چل رہا ہے…","my":"Japanese script ဖွင့်နေပါတယ်…","zh":"正在播放日语脚本…","si":"ජපන් පිටපත වාදනය වෙමින්…","fil":"Nagpe-play ang Japanese script…"},
    "qs.speechFail": {"bn":"কণ্ঠ চালানো যায়নি। transcript খুলে পড়তে পারেন।","en":"The voice could not be played. You can open the transcript and read.","ja":"音声を再生できませんでした。トランスクリプトを開いて読めます。","vi":"Không phát được giọng nói. Bạn có thể mở transcript để đọc.","ne":"आवाज चलाउन सकिएन। transcript खोलेर पढ्न सक्नुहुन्छ।","hi":"आवाज़ नहीं चल पाई। transcript खोलकर पढ़ सकते हैं।","ur":"آواز نہیں چل سکی۔ transcript کھول کر پڑھ سکتے ہیں۔","my":"အသံ ဖွင့်၍ မရပါ။ transcript ဖွင့်၍ ဖတ်နိုင်ပါသည်။","zh":"无法播放语音。你可以打开文字稿阅读。","si":"හඬ වාදනය කළ නොහැකි විය. ඔබට පිටපත විවෘත කර කියවිය හැක.","fil":"Hindi ma-play ang voice. Maaari mong buksan ang transcript at basahin."},
    "qs.stopped": {"bn":"শোনা থামানো হয়েছে।","en":"Listening stopped.","ja":"リスニングを停止しました。","vi":"Đã dừng nghe.","ne":"सुन्न रोकियो।","hi":"सुनना रोका गया।","ur":"سننا روک دیا گیا۔","my":"နားထောင်မှု ရပ်တန့်လိုက်ပါပြီ။","zh":"已停止收听。","si":"ඇහුම්කන් දීම නැවැත්විණි.","fil":"Huminto ang pakikinig."},
    "qt.bookPageSep": {"bn":" · বই পৃ. ","en":" · Book p. ","ja":" · 本 p. ","vi":" · Sách tr. ","ne":" · किताब पृ. ","hi":" · किताब पृ. ","ur":" · کتاب ص. ","my":" · စာအုပ် စာ. ","zh":" · 书 p. ","si":" · පොත පි. ","fil":" · Libro p. "},
    "qt.chapterPrefix": {"bn":"অধ্যায় ","en":"Chapter ","ja":"章 ","vi":"Chương ","ne":"अध्याय ","hi":"अध्याय ","ur":"باب ","my":"အခန်း ","zh":"章节 ","si":"පරිච්ඡේදය ","fil":"Kabanata "},
    "qt.correctAnswerLabel": {"bn":"সঠিক উত্তর","en":"Correct answer","ja":"正解","vi":"Đáp án đúng","ne":"सही उत्तर","hi":"सही उत्तर","ur":"درست جواب","my":"အဖြေမှန်","zh":"正确答案","si":"නිවැරදි පිළිතුර","fil":"Tamang sagot"},
    "qt.correctBangla": {"bn":"সঠিক উত্তর। ","en":"Correct answer. ","ja":"正解です。 ","vi":"Đáp án đúng. ","ne":"सही उत्तर। ","hi":"सही उत्तर। ","ur":"درست جواب۔ ","my":"အဖြေမှန်။ ","zh":"正确答案。 ","si":"නිවැරදි පිළිතුර. ","fil":"Tamang sagot. "},
    "qt.correctBanglaN": {"bn":"সঠিক উত্তর {n}। ","en":"Correct answer {n}. ","ja":"正解は{n}です。 ","vi":"Đáp án đúng {n}. ","ne":"सही उत्तर {n}। ","hi":"सही उत्तर {n}। ","ur":"درست جواب {n}۔ ","my":"အဖြေမှန် {n}။ ","zh":"正确答案 {n}。 ","si":"නිවැරදි පිළිතුර {n}. ","fil":"Tamang sagot {n}. "},
    "qt.countSuffix": {"bn":"টি","en":"","ja":"件","vi":"","ne":" वटा","hi":"","ur":"","my":" ခု","zh":" 个","si":" ක්","fil":""},
    "qt.example": {"bn":"উদাহরণ","en":"Example","ja":"例","vi":"Ví dụ","ne":"उदाहरण","hi":"उदाहरण","ur":"مثال","my":"ဥပမာ","zh":"例句","si":"උදාහරණය","fil":"Halimbawa"},
    "qt.grammarFound": {"bn":"{n}টি গ্রামার পাওয়া গেছে","en":"{n} grammar points found","ja":"{n}件の文法が見つかりました","vi":"Đã tìm thấy {n} grammar","ne":"{n} वटा grammar भेटियो","hi":"{n} grammar मिले","ur":"{n} grammar ملے","my":"grammar {n} ခု တွေ့ရှိပါတယ်","zh":"找到 {n} 个语法点","si":"ව්‍යාකරණ {n} ක් හමු විය","fil":"{n} grammar ang nakita"},
    "qt.learnedBtn": {"bn":"✓ শেখা হয়েছে","en":"✓ Learned","ja":"✓ 学習済み","vi":"✓ Đã học","ne":"✓ सिकियो","hi":"✓ सीख लिया","ur":"✓ سیکھ لیا","my":"✓ သင်ယူပြီး","zh":"✓ 已学","si":"✓ ඉගෙන ගත්තා","fil":"✓ Natutunan na"},
    "qt.learnedCount": {"bn":"{n}টি শেখা","en":"{n} learned","ja":"{n}件学習済み","vi":"Đã học {n}","ne":"{n} सिकियो","hi":"{n} सीखे","ur":"{n} سیکھے","my":"{n} ခု သင်ယူပြီး","zh":"已学 {n}","si":"{n} ක් ඉගෙන ගත්තා","fil":"{n} ang natutunan"},
    "qt.loadFail": {"bn":"পাঠগুলো খোলা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।","en":"The lessons could not be opened. Check your internet connection and try again.","ja":"レッスンを開けませんでした。インターネット接続を確認して、もう一度お試しください。","vi":"Không mở được các bài học. Kiểm tra kết nối internet rồi thử lại.","ne":"पाठहरू खोल्न सकिएन। Internet जडान जाँचेर फेरि प्रयास गर्नुहोस्।","hi":"पाठ नहीं खुल सके। Internet connection जांचकर फिर से प्रयास करें।","ur":"اسباق نہیں کھل سکے۔ انٹرنیٹ کنکشن چیک کر کے دوبارہ کوشش کریں۔","my":"သင်ခန်းစာများ ဖွင့်၍ မရပါ။ အင်တာနက် ချိတ်ဆက်မှု စစ်ဆေးပြီး ပြန်ကြိုးစားပါ။","zh":"无法打开课程。请检查网络连接后重试。","si":"පාඩම් විවෘත කළ නොහැකි විය. අන්තර්ජාල සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.","fil":"Hindi mabuksan ang mga lesson. Suriin ang internet connection at subukan ulit."},
    "qt.markLearned": {"bn":"শেখা হয়েছে চিহ্ন দিন","en":"Mark as learned","ja":"学習済みにする","vi":"Đánh dấu đã học","ne":"सिकेको चिन्ह लगाउनुहोस्","hi":"सीखा हुआ चिह्नित करें","ur":"سیکھا ہوا نشان لگائیں","my":"သင်ယူပြီးအဖြစ် မှတ်သားပါ","zh":"标记为已学","si":"ඉගෙන ගත්තා ලෙස සලකුණු කරන්න","fil":"Markahang natutunan na"},
    "qt.nextLesson": {"bn":"পরের পাঠ","en":"Next lesson","ja":"次のレッスン","vi":"Bài tiếp theo","ne":"अर्को पाठ","hi":"अगला पाठ","ur":"اگلا سبق","my":"နောက်သင်ခန်းစာ","zh":"下一课","si":"ඊළඟ පාඩම","fil":"Susunod na lesson"},
    "qt.notThisTime": {"bn":"এবার হয়নি। সঠিক উত্তর: ","en":"Not this time. Correct answer: ","ja":"今回は違います。正解： ","vi":"Lần này chưa đúng. Đáp án đúng: ","ne":"यसपालि भएन। सही उत्तर: ","hi":"इस बार नहीं हुआ। सही उत्तर: ","ur":"اس بار نہیں ہوا۔ درست جواب: ","my":"ဒီတစ်ခါ မမှန်ပါ။ အဖြေမှန်: ","zh":"这次不对。正确答案： ","si":"මෙවර නොවේ. නිවැරදි පිළිතුර: ","fil":"Hindi sa pagkakataong ito. Tamang sagot: "},
    "qt.pdfPageSep": {"bn":" / PDF পৃ. ","en":" / PDF p. ","ja":" / PDF p. ","vi":" / PDF tr. ","ne":" / PDF पृ. ","hi":" / PDF पृ. ","ur":" / PDF ص. ","my":" / PDF စာ. ","zh":" / PDF p. ","si":" / PDF පි. ","fil":" / PDF p. "},
    "qt.practice": {"bn":"অনুশীলন","en":"Practice","ja":"練習","vi":"Luyện tập","ne":"अभ्यास","hi":"अभ्यास","ur":"مشق","my":"လေ့ကျင့်မှု","zh":"练习","si":"පුහුණුව","fil":"Pagsasanay"},
    "qt.prevLesson": {"bn":"আগের পাঠ","en":"Previous lesson","ja":"前のレッスン","vi":"Bài trước","ne":"अघिल्लो पाठ","hi":"पिछला पाठ","ur":"پچھلا سبق","my":"ရှေ့သင်ခန်းစာ","zh":"上一课","si":"කලින් පාඩම","fil":"Nakaraang lesson"},
    "qt.progressOf": {"bn":"{a} / {b}টি শেখা","en":"{a} / {b} learned","ja":"{a} / {b} 学習済み","vi":"Đã học {a} / {b}","ne":"{a} / {b} सिकियो","hi":"{a} / {b} सीखे","ur":"{a} / {b} سیکھے","my":"{a} / {b} သင်ယူပြီး","zh":"已学 {a} / {b}","si":"{a} / {b} ඉගෙන ගත්තා","fil":"{a} / {b} ang natutunan"},
    "qt.quizSummary": {"bn":"উত্তর দিয়েছেন {a} / {t} · সঠিক {c}","en":"Answered {a} / {t} · Correct {c}","ja":"回答 {a} / {t} · 正解 {c}","vi":"Đã trả lời {a} / {t} · Đúng {c}","ne":"उत्तर दिनुभयो {a} / {t} · सही {c}","hi":"उत्तर दिए {a} / {t} · सही {c}","ur":"جواب دیے {a} / {t} · درست {c}","my":"ဖြေဆိုပြီး {a} / {t} · မှန် {c}","zh":"已答 {a} / {t} · 正确 {c}","si":"පිළිතුරු දුන්නා {a} / {t} · නිවැරදි {c}","fil":"Nasagot {a} / {t} · Tama {c}"},
    "qt.remember": {"bn":"মনে রাখুন","en":"Remember","ja":"覚えておきましょう","vi":"Hãy nhớ","ne":"सम्झनुहोस्","hi":"याद रखें","ur":"یاد رکھیں","my":"မှတ်ထားပါ","zh":"请记住","si":"මතක තබාගන්න","fil":"Tandaan"},
    "qt.rereadRule": {"bn":"নিয়মটি আবার পড়ুন","en":"Read the rule again","ja":"ルールをもう一度読む","vi":"Đọc lại quy tắc","ne":"नियम फेरि पढ्नुहोस्","hi":"नियम फिर से पढ़ें","ur":"قاعدہ دوبارہ پڑھیں","my":"စည်းမျဉ်း ပြန်ဖတ်ပါ","zh":"再读一遍规则","si":"නීතිය නැවත කියවන්න","fil":"Basahin ulit ang rule"},
    "qt.resetDone": {"bn":"এই অধ্যায়ের উত্তরগুলো মুছে দেওয়া হয়েছে। আবার চেষ্টা করুন।","en":"This chapter's answers have been cleared. Try again.","ja":"この章の回答は消去されました。もう一度お試しください。","vi":"Đáp án của chương này đã bị xóa. Thử lại.","ne":"यो अध्यायका उत्तरहरू मेटाइयो। फेरि प्रयास गर्नुहोस्।","hi":"इस अध्याय के उत्तर मिटा दिए गए हैं। फिर से प्रयास करें।","ur":"اس باب کے جوابات مٹا دیے گئے ہیں۔ دوبارہ کوشش کریں۔","my":"ဤအခန်း၏ အဖြေများ ဖျက်ပြီးပါပြီ။ ပြန်ကြိုးစားပါ။","zh":"本章的答案已清除。请再试一次。","si":"මෙම පරිච්ඡේදයේ පිළිතුරු මකා දමා ඇත. නැවත උත්සාහ කරන්න.","fil":"Nabura na ang mga sagot sa kabanatang ito. Subukan ulit."},
    "qt.retryChapter": {"bn":"এই অধ্যায় আবার চেষ্টা করুন","en":"Try this chapter again","ja":"この章をもう一度試す","vi":"Thử lại chương này","ne":"यो अध्याय फेरि प्रयास गर्नुहोस्","hi":"यह अध्याय फिर से प्रयास करें","ur":"یہ باب دوبارہ آزمائیں","my":"ဤအခန်း ပြန်ကြိုးစားပါ","zh":"再试一次本章","si":"මෙම පරිච්ඡේදය නැවත උත්සාහ කරන්න","fil":"Subukan ulit ang kabanatang ito"},
    "qt.revision": {"bn":"এক নজরে রিভিশন","en":"Revision at a glance","ja":"一目で復習","vi":"Revision trong nháy mắt","ne":"एक नजरमा Revision","hi":"एक नज़र में Revision","ur":"ایک نظر میں Revision","my":"တစ်ပြိုင်နက် ပြန်လှန်ရန်","zh":"一眼复习","si":"එක බැල්මෙන් පුනරීක්ෂණය","fil":"Revision sa isang tingin"},
    "qt.revisionTab": {"bn":"রিভিশন","en":"Revision","ja":"復習","vi":"Ôn tập","ne":"दोहोर्याइ","hi":"दोहराव","ur":"دہرائی","my":"ပြန်လှန်ရန်","zh":"复习","si":"පුනරීක්ෂණය","fil":"Revision"},
    "qt.searchNotFound": {"bn":"পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।","en":"Not found. Try another word.","ja":"見つかりませんでした。別の言葉で検索してください。","vi":"Không tìm thấy. Thử từ khác.","ne":"भेटिएन। अर्को शब्दले खोज्नुहोस्।","hi":"नहीं मिला। दूसरे शब्द से खोजें।","ur":"نہیں ملا۔ دوسرے لفظ سے تلاش کریں۔","my":"မတွေ့ရှိပါ။ အခြားစကားလုံးဖြင့် ရှာပါ။","zh":"未找到。请换个词搜索。","si":"හමු නොවීය. වෙනත් වචනයකින් සොයන්න.","fil":"Hindi nakita. Subukan ang ibang salita."},
    "qt.selectedHelper": {"bn":" · নির্বাচিত সহায়ক গ্রামার","en":" · Selected support grammar","ja":" · 選ばれた補助文法","vi":" · Grammar hỗ trợ đã chọn","ne":" · छानिएको सहायक grammar","hi":" · चुनी हुई सहायक grammar","ur":" · منتخب معاون grammar","my":" · ရွေးချယ်ထားသော အထောက်အကူ grammar","zh":" · 所选辅助语法","si":" · තෝරාගත් උපකාරක ව්‍යාකරණ","fil":" · Napiling support grammar"},
    "qt.titleSuffix": {"bn":" বাংলা","en":" English","ja":" 日本語","vi":" Tiếng Việt","ne":" नेपाली","hi":" हिंदी","ur":" اردو","my":" မြန်မာ","zh":" 中文","si":" සිංහල","fil":" Filipino"},
    "qt.topicPrefix": {"bn":"বিষয় ","en":"Topic ","ja":"トピック ","vi":"Chủ đề ","ne":"विषय ","hi":"विषय ","ur":"موضوع ","my":"အကြောင်းအရာ ","zh":"主题 ","si":"මාතෘකාව ","fil":"Paksa "},
    "qt.topicSep": {"bn":" · বিষয় ","en":" · Topic ","ja":" · トピック ","vi":" · Chủ đề ","ne":" · विषय ","hi":" · विषय ","ur":" · موضوع ","my":" · အကြောင်းအရာ ","zh":" · 主题 ","si":" · මාතෘකාව ","fil":" · Paksa "},
    "qt.topicsCount": {"bn":"{n}টি বিষয়","en":"{n} topics","ja":"{n}件のトピック","vi":"{n} chủ đề","ne":"{n} वटा विषय","hi":"{n} विषय","ur":"{n} موضوعات","my":"အကြောင်းအရာ {n} ခု","zh":"{n} 个主题","si":"මාතෘකා {n} ක්","fil":"{n} paksa"},
    "qt.tryYourself": {"bn":"নিজে চেষ্টা করুন","en":"Try it yourself","ja":"自分で試してみましょう","vi":"Tự thử làm","ne":"आफैं प्रयास गर्नुहोस्","hi":"खुद प्रयास करें","ur":"خود کوشش کریں","my":"ကိုယ်တိုင် ကြိုးစားပါ","zh":"自己试一试","si":"ඔබම උත්සාහ කරන්න","fil":"Subukan mo mismo"},
    "qt.tryYourselfCopy": {"bn":"উত্তর বেছে নিন। সঙ্গে সঙ্গে কারণ দেখতে পাবেন।","en":"Choose an answer. You will see the reason right away.","ja":"答えを選んでください。すぐに理由が見られます。","vi":"Chọn một đáp án. Bạn sẽ thấy lý do ngay.","ne":"उत्तर छान्नुहोस्। तुरुन्तै कारण देख्नुहुनेछ।","hi":"उत्तर चुनें। तुरंत कारण दिखाई देगा।","ur":"جواب منتخب کریں۔ فوراً وجہ نظر آئے گی۔","my":"အဖြေ ရွေးပါ။ အကြောင်းပြချက် ချက်ချင်း မြင်ရပါမည်။","zh":"选择答案。你会立即看到原因。","si":"පිළිතුරක් තෝරන්න. ඔබට වහාම හේතුව පෙනෙනු ඇත.","fil":"Pumili ng sagot. Makikita mo agad ang dahilan."},
    "qt.usage": {"bn":"বাক্যে ব্যবহার","en":"Use in sentences","ja":"文での使い方","vi":"Sử dụng trong câu","ne":"वाक्यमा प्रयोग","hi":"वाक्यों में प्रयोग","ur":"جملوں میں استعمال","my":"ဝါကျတွင် အသုံးပြုပုံ","zh":"句子中的用法","si":"වාක්‍යවල භාවිතය","fil":"Paggamit sa mga pangungusap"},
    "qt.whichForm": {"bn":"কোন Form লাগবে?","en":"Which form do you need?","ja":"どのFormが必要ですか？","vi":"Bạn cần Form nào?","ne":"कुन Form चाहिन्छ?","hi":"कौन सा Form चाहिए?","ur":"کون سا Form چاہیے؟","my":"ဘယ် Form လိုအပ်လဲ?","zh":"需要哪种形式？","si":"ඔබට අවශ්‍ය ආකෘතිය කුමක්ද?","fil":"Aling Form ang kailangan mo?"},
    "sb.aMinus": {"bn":"অ −","en":"A −","ja":"あ −","vi":"A −","ne":"अ −","hi":"अ −","ur":"ا −","my":"က −","zh":"A −","si":"අ −","fil":"A −"},
    "sb.aPlus": {"bn":"অ +","en":"A +","ja":"あ +","vi":"A +","ne":"अ +","hi":"अ +","ur":"ا +","my":"က +","zh":"A +","si":"අ +","fil":"A +"},
    "sb.continueReading": {"bn":"পড়া চালিয়ে যান","en":"Continue reading","ja":"読み続ける","vi":"Tiếp tục đọc","ne":"पढाइ जारी राख्नुहोस्","hi":"पढ़ना जारी रखें","ur":"پڑھنا جاری رکھیں","my":"ဆက်ဖတ်ပါ","zh":"继续阅读","si":"කියවීම දිගටම කරගෙන යන්න","fil":"Ipagpatuloy ang pagbabasa"},
    "sb.finishLesson": {"bn":"লেসন শেষ করুন ✓","en":"Finish the lesson ✓","ja":"レッスンを終える ✓","vi":"Kết thúc lesson ✓","ne":"Lesson सकाउनुहोस् ✓","hi":"Lesson समाप्त करें ✓","ur":"Lesson ختم کریں ✓","my":"Lesson ပြီးဆုံးပါ ✓","zh":"完成本课 ✓","si":"පාඩම අවසන් කරන්න ✓","fil":"Tapusin ang lesson ✓"},
    "sb.furiganaOff": {"bn":"ফুরিগানা: বন্ধ","en":"Furigana: OFF","ja":"ふりがな：オフ","vi":"Furigana: TẮT","ne":"फुरिगाना: बन्द","hi":"फुरिगाना: बंद","ur":"فوریگانا: آف","my":"Furigana: ပိတ်","zh":"注音: 关","si":"Furigana: අක්‍රිය","fil":"Furigana: OFF"},
    "sb.furiganaOn": {"bn":"ফুরিগানা: চালু","en":"Furigana: ON","ja":"ふりがな：オン","vi":"Furigana: BẬT","ne":"फुरिगाना: चालु","hi":"फुरिगाना: चालू","ur":"فوریگانا: آن","my":"Furigana: ဖွင့်","zh":"注音: 开","si":"Furigana: සක්‍රිය","fil":"Furigana: ON"},
    "sb.lessons": {"bn":"{n}টি লেসন","en":"{n} lessons","ja":"{n}レッスン","vi":"{n} lesson","ne":"{n} वटा लेसन","hi":"{n} lesson","ur":"{n} lesson","my":"Lesson {n} ခု","zh":"{n} 课","si":"පාඩම් {n} ක්","fil":"{n} lesson"},
    "sb.markRead": {"bn":"পড়া শেষ চিহ্নিত করুন","en":"Mark as read","ja":"読了にする","vi":"Đánh dấu đã đọc xong","ne":"पढिसकेको चिन्ह लगाउनुहोस्","hi":"पढ़ा हुआ चिह्नित करें","ur":"پڑھا ہوا نشان لگائیں","my":"ဖတ်ပြီးအဖြစ် မှတ်သားပါ","zh":"标记为已读","si":"කියවා අවසන් ලෙස සලකුණු කරන්න","fil":"Markahang nabasa na"},
    "sb.nextTopic": {"bn":"পরের বিষয় →","en":"Next topic →","ja":"次のトピック →","vi":"Chủ đề tiếp theo →","ne":"अर्को विषय →","hi":"अगला विषय →","ur":"اگلا موضوع →","my":"နောက် အကြောင်းအရာ →","zh":"下一个主题 →","si":"ඊළඟ මාතෘකාව →","fil":"Susunod na paksa →"},
    "sb.notStarted": {"bn":"শুরু হয়নি","en":"Not started","ja":"未開始","vi":"Chưa bắt đầu","ne":"सुरु भएको छैन","hi":"शुरू नहीं हुआ","ur":"شروع نہیں ہوا","my":"မစရသေးပါ","zh":"尚未开始","si":"ආරම්භ කර නැත","fil":"Hindi pa nagsisimula"},
    "sb.progress": {"bn":"{total}টির মধ্যে {done}টি পড়া শেষ","en":"{done} of {total} read","ja":"全{total}件中 {done}件 読了","vi":"Đã đọc {done} / {total}","ne":"{total} मध्ये {done} पढिसकियो","hi":"{total} में से {done} पढ़े गए","ur":"{total} میں سے {done} پڑھے گئے","my":"{total} ခုထဲမှ {done} ခု ဖတ်ပြီး","zh":"{total} 个中已读 {done} 个","si":"{total} න් {done} ක් කියවා අවසන්","fil":"{done} sa {total} ang nabasa na"},
    "sb.readDone": {"bn":"✓ পড়া শেষ","en":"✓ Finished reading","ja":"✓ 読了","vi":"✓ Đã đọc xong","ne":"✓ पढिसकियो","hi":"✓ पढ़ लिया","ur":"✓ پڑھ لیا","my":"✓ ဖတ်ပြီးပါပြီ","zh":"✓ 已读完","si":"✓ කියවා අවසන්","fil":"✓ Nabasa na"},
    "sb.readDoneToggle": {"bn":"✓ পড়া শেষ · আবার বাকি রাখুন","en":"✓ Read · Mark as unread again","ja":"✓ 読了 · 未読に戻す","vi":"✓ Đã đọc xong · Đánh dấu chưa đọc lại","ne":"✓ पढिसकियो · फेरि बाँकी राख्नुहोस्","hi":"✓ पढ़ा हुआ · फिर से बाकी रखें","ur":"✓ پڑھا ہوا · دوبارہ باقی رکھیں","my":"✓ ဖတ်ပြီး · မဖတ်ရသေးအဖြစ် ပြန်မှတ်ပါ","zh":"✓ 已读完 · 重新标为未读","si":"✓ කියවා අවසන් · නැවත ඉතිරි ලෙස තබන්න","fil":"✓ Nabasa na · Ibalik sa hindi pa nababasa"},
    "sb.readLesson": {"bn":"লেসন {n} পড়ুন →","en":"Read Lesson {n} →","ja":"レッスン{n}を読む →","vi":"Đọc Lesson {n} →","ne":"Lesson {n} पढ्नुहोस् →","hi":"Lesson {n} पढ़ें →","ur":"Lesson {n} پڑھیں →","my":"Lesson {n} ဖတ်ပါ →","zh":"阅读第 {n} 课 →","si":"පාඩම {n} කියවන්න →","fil":"Basahin ang Lesson {n} →"},
    "sb.reread": {"bn":"সব পড়া শেষ · আবার পড়ুন →","en":"All read · Read again →","ja":"全部読了 · もう一度読む →","vi":"Đã đọc hết · Đọc lại →","ne":"सबै पढिसकियो · फेरि पढ्नुहोस् →","hi":"सब पढ़ लिया · फिर से पढ़ें →","ur":"سب پڑھ لیا · دوبارہ پڑھیں →","my":"အားလုံး ဖတ်ပြီး · ပြန်ဖတ်ပါ →","zh":"全部读完 · 再读一遍 →","si":"සියල්ල කියවා අවසන් · නැවත කියවන්න →","fil":"Nabasa na lahat · Basahin ulit →"},
    "sb.storageWarn": {"bn":"ব্রাউজারে অগ্রগতি রাখা যাচ্ছে না। এই পৃষ্ঠা খোলা থাকা পর্যন্ত পরিবর্তন কাজ করবে।","en":"Progress cannot be saved in the browser. Changes will work while this page stays open.","ja":"ブラウザに進捗を保存できません。このページを開いている間だけ変更が有効です。","vi":"Không thể lưu tiến độ trong trình duyệt. Thay đổi sẽ có hiệu lực khi trang này còn mở.","ne":"browser मा प्रगति राख्न सकिएन। यो पृष्ठ खुला रहुन्जेल परिवर्तनले काम गर्नेछ।","hi":"browser में प्रगति सहेजी नहीं जा रही। यह पृष्ठ खुला रहने तक परिवर्तन काम करेंगे।","ur":"براؤزر میں پیش رفت محفوظ نہیں ہو رہی۔ جب تک یہ صفحہ کھلا ہے تبدیلیاں کام کریں گی۔","my":"browser တွင် တိုးတက်မှု သိမ်းဆည်း၍ မရပါ။ ဤစာမျက်နှာ ဖွင့်ထားသမျှ ပြောင်းလဲမှုများ အလုပ်လုပ်ပါမည်။","zh":"无法在浏览器中保存进度。本页保持打开时，更改将生效。","si":"බ්‍රවුසරයේ ප්‍රගතිය සුරැකිය නොහැක. මෙම පිටුව විවෘතව ඇති තාක් වෙනස්කම් ක්‍රියාත්මක වේ.","fil":"Hindi mai-save ang progreso sa browser. Gagana ang mga pagbabago habang bukas ang page na ito."},
    "sb.textBigger": {"bn":"পাঠের লেখা বড় করুন","en":"Make the reading text bigger","ja":"本文の文字を大きくする","vi":"Phóng to chữ bài đọc","ne":"पाठको अक्षर ठूलो बनाउनुहोस्","hi":"पाठ के अक्षर बड़े करें","ur":"متن کا سائز بڑا کریں","my":"စာသား အရွယ်အစား ကြီးလုပ်ပါ","zh":"将正文文字放大","si":"පාඨ අකුරු විශාල කරන්න","fil":"Palakihin ang teksto"},
    "sb.textNormal": {"bn":"পাঠের লেখা স্বাভাবিক করুন","en":"Make the reading text normal size","ja":"本文の文字を通常サイズにする","vi":"Đưa chữ bài đọc về cỡ thường","ne":"पाठको अक्षर सामान्य बनाउनुहोस्","hi":"पाठ के अक्षर सामान्य करें","ur":"متن کا سائز معمول پر کریں","my":"စာသား အရွယ်အစား ပုံမှန် ပြန်လုပ်ပါ","zh":"将正文文字恢复正常大小","si":"පාඨ අකුරු සාමාන්‍ය ප්‍රමාණයට කරන්න","fil":"Gawing normal ang laki ng teksto"},
    "sb.topicOf": {"bn":"বিষয় {a} / {b}","en":"Topic {a} / {b}","ja":"トピック {a} / {b}","vi":"Chủ đề {a} / {b}","ne":"विषय {a} / {b}","hi":"विषय {a} / {b}","ur":"موضوع {a} / {b}","my":"အကြောင်းအရာ {a} / {b}","zh":"主题 {a} / {b}","si":"මාතෘකාව {a} / {b}","fil":"Paksa {a} / {b}"},
    "sw.results": {"bn":"{n}টি ফলাফল","en":"{n} results","ja":"{n}件の結果","vi":"{n} kết quả","ne":"{n} वटा नतिजा","hi":"{n} परिणाम","ur":"{n} نتائج","my":"ရလဒ် {n} ခု","zh":"{n} 个结果","si":"ප්‍රතිඵල {n} ක්","fil":"{n} resulta"},
    "v4.completed": {"bn":"সম্পন্ন","en":"Completed","ja":"完了","vi":"Đã hoàn thành","ne":"सकियो","hi":"समाप्त","ur":"مکمل","my":"ပြီးပါပြီ","zh":"完成","si":"අවසන්","fil":"Tapos"},
    "v4.copied": {"bn":"শব্দটি copy হয়েছে","en":"Word copied","ja":"単語をコピーしました","vi":"Đã copy từ","ne":"शब्द copy भयो","hi":"शब्द copy हो गया","ur":"لفظ کاپی ہو گیا","my":"စကားလုံး ကူးယူပြီးပါပြီ","zh":"单词已复制","si":"වචනය පිටපත් විය","fil":"Nakopya ang salita"},
    "v4.correctAnswer": {"bn":"সঠিক উত্তর: ","en":"Correct answer: ","ja":"正解： ","vi":"Đáp án đúng: ","ne":"सही उत्तर: ","hi":"सही उत्तर: ","ur":"درست جواب: ","my":"အဖြေမှန်: ","zh":"正确答案： ","si":"නිවැරදි පිළිතුර: ","fil":"Tamang sagot: "},
    "v4.correctPron": {"bn":"সঠিক ✓  উচ্চারণ: ","en":"Correct ✓ Pronunciation: ","ja":"正解 ✓ 発音： ","vi":"Đúng ✓ Phát âm: ","ne":"सही ✓ उच्चारण: ","hi":"सही ✓ उच्चारण: ","ur":"درست ✓ تلفظ: ","my":"မှန်ပါတယ် ✓ အသံထွက်: ","zh":"正确 ✓ 发音： ","si":"නිවැරදියි ✓ උච්චාරණය: ","fil":"Tama ✓ Pagbigkas: "},
    "v4.learned": {"bn":"✓ শেখা হয়েছে","en":"✓ Learned","ja":"✓ 学習済み","vi":"✓ Đã học","ne":"✓ सिकियो","hi":"✓ सीख लिया","ur":"✓ سیکھ لیا","my":"✓ သင်ယူပြီး","zh":"✓ 已学","si":"✓ ඉගෙන ගත්තා","fil":"✓ Natutunan na"},
    "v4.learnedSuffix": {"bn":" শেখা","en":" learned","ja":"件学習済み","vi":" đã học","ne":" सिकियो","hi":" सीखे","ur":" سیکھے","my":" သင်ယူပြီး","zh":" 已学","si":" ඉගෙන ගත්තා","fil":" ang natutunan"},
    "v4.mastered": {"bn":"দারুণ! এই লেসনটি ভালোভাবে আয়ত্ত হয়েছে।","en":"Great! You have mastered this lesson well.","ja":"すごい！このレッスンをしっかりマスターしました。","vi":"Tuyệt vời! Bạn đã nắm vững lesson này.","ne":"राम्रो! यो lesson राम्ररी सिकियो।","hi":"बहुत बढ़िया! यह lesson अच्छी तरह आ गया है।","ur":"زبردست! یہ سبق اچھی طرح آ گیا ہے۔","my":"အရမ်းကောင်းပါတယ်! ဒီ lesson ကို ကောင်းကောင်း တတ်မြောက်ပါပြီ။","zh":"太棒了！你已经很好地掌握了本课。","si":"නියමයි! ඔබ මෙම පාඩම හොඳින් අත්කරගෙන ඇත.","fil":"Mahusay! Kabisado mo nang mabuti ang lesson na ito."},
    "v4.meaningTail": {"bn":" এর বাংলা অর্থ কী?","en":" — what does it mean in English?","ja":" の日本語の意味は何ですか？","vi":" có nghĩa tiếng Việt là gì?","ne":" को नेपाली अर्थ के हो?","hi":" का हिंदी अर्थ क्या है?","ur":" کا اردو مطلب کیا ہے؟","my":" ရဲ့ မြန်မာ အဓိပ္ပာယ် က ဘာလဲ?","zh":" 的中文意思是什么？","si":" යන්නෙහි සිංහල අර්ථය කුමක්ද?","fil":" — ano ang ibig sabihin sa Filipino?"},
    "v4.noAudio": {"bn":"এই browser-এ Japanese audio নেই","en":"No Japanese audio in this browser","ja":"このブラウザには日本語の音声がありません","vi":"Trình duyệt này không có audio Japanese","ne":"यस browser मा Japanese audio छैन","hi":"इस browser में Japanese audio नहीं है","ur":"اس براؤزر میں Japanese آڈیو نہیں ہے","my":"ဤ browser တွင် Japanese အသံ မရှိပါ","zh":"此浏览器没有日语音频","si":"මෙම browser එකේ Japanese ශ්‍රව්‍ය නැත","fil":"Walang Japanese audio sa browser na ito"},
    "v4.noWords": {"bn":"দেখানোর মতো কোনো শব্দ নেই","en":"No words to show","ja":"表示する単語がありません","vi":"Không có từ nào để hiển thị","ne":"देखाउने कुनै शब्द छैन","hi":"दिखाने के लिए कोई शब्द नहीं है","ur":"دکھانے کے لیے کوئی لفظ نہیں ہے","my":"ပြသရန် စကားလုံး မရှိပါ","zh":"没有可显示的单词","si":"පෙන්වීමට වචන නැත","fil":"Walang salitang maipapakita"},
    "v4.notLearned": {"bn":"○ শেখা বাকি","en":"○ Not learned yet","ja":"○ 未学習","vi":"○ Chưa học","ne":"○ सिक्न बाँकी","hi":"○ सीखना बाकी","ur":"○ سیکھنا باقی","my":"○ မသင်ရသေး","zh":"○ 尚未学习","si":"○ තවම ඉගෙන නැත","fil":"○ Hindi pa natututunan"},
    "v4.progressLine": {"bn":"{a} / {b} শেখা","en":"{a} / {b} learned","ja":"{a} / {b} 学習済み","vi":"Đã học {a} / {b}","ne":"{a} / {b} सिकियो","hi":"{a} / {b} सीखे","ur":"{a} / {b} سیکھے","my":"{a} / {b} သင်ယူပြီး","zh":"已学 {a} / {b}","si":"{a} / {b} ඉගෙන ගත්තා","fil":"{a} / {b} ang natutunan"},
    "v4.pronSuffix": {"bn":" • উচ্চারণ: ","en":" • Pronunciation: ","ja":" • 発音： ","vi":" • Phát âm: ","ne":" • उच्चारण: ","hi":" • उच्चारण: ","ur":" • تلفظ: ","my":" • အသံထွက်: ","zh":" • 发音： ","si":" • උච්චාරණය: ","fil":" • Pagbigkas: "},
    "v4.quizDoneScore": {"bn":"কুইজ শেষ! আপনার স্কোর {s} / {t}","en":"Quiz finished! Your score {s} / {t}","ja":"クイズ終了！あなたのスコア {s} / {t}","vi":"Quiz xong! Điểm của bạn {s} / {t}","ne":"क्विज सकियो! तपाईंको स्कोर {s} / {t}","hi":"क्विज़ खत्म! आपका स्कोर {s} / {t}","ur":"کوئز ختم! آپ کا اسکور {s} / {t}","my":"ပဟေဠိ ပြီးပါပြီ! သင့်အမှတ် {s} / {t}","zh":"测验结束！你的得分 {s} / {t}","si":"ප්‍රශ්නාවලිය අවසන්! ඔබේ ලකුණු {s} / {t}","fil":"Tapos na ang quiz! Ang score mo {s} / {t}"},
    "v4.retryAdvice": {"bn":"আরেকবার শব্দগুলো দেখে নতুন কুইজ দিন।","en":"Review the words once more and take a new quiz.","ja":"単語をもう一度見て、新しいクイズに挑戦しましょう。","vi":"Xem lại các từ rồi làm quiz mới.","ne":"शब्दहरू फेरि हेरेर नयाँ क्विज दिनुहोस्।","hi":"शब्दों को फिर से देखकर नया क्विज़ दें।","ur":"لفظ دوبارہ دیکھ کر نیا کوئز دیں۔","my":"စကားလုံးများ ပြန်ကြည့်ပြီး ပဟေဠိအသစ် ဖြေပါ။","zh":"再看一遍单词，然后做新的测验。","si":"වචන නැවත බලා නව ප්‍රශ්නාවලියක් කරන්න.","fil":"Tingnan ulit ang mga salita at mag-quiz nang bago."},
    "v4.score": {"bn":"স্কোর {n}","en":"Score {n}","ja":"スコア {n}","vi":"Điểm {n}","ne":"स्कोर {n}","hi":"स्कोर {n}","ur":"اسکور {n}","my":"အမှတ် {n}","zh":"得分 {n}","si":"ලකුණු {n}","fil":"Score {n}"},
    "v4.showing": {"bn":"{n}টি দেখানো হচ্ছে","en":"Showing {n}","ja":"{n}件を表示中","vi":"Đang hiển thị {n}","ne":"{n} वटा देखाइँदै छ","hi":"{n} दिखाए जा रहे हैं","ur":"{n} دکھائے جا رہے ہیں","my":"{n} ခု ပြသနေပါတယ်","zh":"正在显示 {n} 个","si":"{n} ක් පෙන්වමින්","fil":"Ipinapakita ang {n}"},
    "v4.whichJpTail": {"bn":" — সঠিক জাপানিজ কোনটি?","en":" — which is the correct Japanese?","ja":" — 正しい日本語はどれですか？","vi":" — đâu là Japanese đúng?","ne":" — सही Japanese कुन हो?","hi":" — सही Japanese कौन सा है?","ur":" — درست Japanese کون سا ہے؟","my":" — မှန်ကန်သော Japanese က ဘယ်ဟာလဲ?","zh":" — 哪个是正确的日语？","si":" — නිවැරදි ජපන් බස කුමක්ද?","fil":" — alin ang tamang Japanese?"},
    "v5.meaningTail": {"bn":" এর অর্থ কী?","en":" — what does it mean?","ja":" の意味は何ですか？","vi":" có nghĩa là gì?","ne":" को अर्थ के हो?","hi":" का अर्थ क्या है?","ur":" کا مطلب کیا ہے؟","my":" ရဲ့ အဓိပ္ပာယ် က ဘာလဲ?","zh":" 是什么意思？","si":" යන්නෙහි අර්ථය කුමක්ද?","fil":" — ano ang ibig sabihin?"},
    "v5.noVoiceSupport": {"bn":"Voice supported নয়","en":"Voice not supported","ja":"音声に対応していません","vi":"Không hỗ trợ giọng nói","ne":"Voice समर्थित छैन","hi":"Voice समर्थित नहीं है","ur":"آواز سپورٹ نہیں ہے","my":"အသံ မပံ့ပိုးပါ","zh":"不支持语音","si":"හඬ සහාය නැත","fil":"Hindi suportado ang voice"},
    "v5.noVoiceSupport2": {"bn":"Voice support নেই","en":"Voice support not available","ja":"音声サポートがありません","vi":"Không có hỗ trợ giọng nói","ne":"Voice support छैन","hi":"Voice support नहीं है","ur":"آواز سپورٹ نہیں ہے","my":"အသံ ပံ့ပိုးမှု မရှိပါ","zh":"没有语音支持","si":"හඬ සහාය නැත","fil":"Walang voice support"},
    "v5.tryAgain": {"bn":"আরেকবার চেষ্টা করুন","en":"Try again","ja":"もう一度試してください","vi":"Thử lại","ne":"फेरि प्रयास गर्नुहोस्","hi":"फिर से प्रयास करें","ur":"دوبارہ کوشش کریں","my":"ပြန်ကြိုးစားပါ","zh":"请再试一次","si":"නැවත උත්සාහ කරන්න","fil":"Subukan ulit"},
  };
  var DYN_PLACEHOLDERS = {
    "Search Kanji, 音読み, 訓読み, Bangla meaning, examples...": {"bn":"Search Kanji, 音読み, 訓読み, Bangla meaning, examples...","en":"Search Kanji, 音読み, 訓読み, meaning, examples...","ja":"漢字、音読み、訓読み、意味、例を検索…","vi":"Tìm Kanji, on'yomi, kun'yomi, nghĩa, ví dụ…","ne":"Kanji, on'yomi, kun'yomi, अर्थ, उदाहरण खोज्नुहोस्…","hi":"Kanji, on'yomi, kun'yomi, अर्थ, उदाहरण खोजें…","ur":"Kanji، on'yomi، kun'yomi، مطلب، مثالیں تلاش کریں…","my":"Kanji, on'yomi, kun'yomi, အဓိပ္ပာယ်, ဥပမာ ရှာပါ…","zh":"搜索汉字、音读、训读、意思、例句…","si":"Kanji, on'yomi, kun'yomi, අර්ථය, උදාහරණ සොයන්න…","fil":"Maghanap ng Kanji, on'yomi, kun'yomi, kahulugan, halimbawa…"},
    "Search Kanji, reading, Bangla meaning, examples...": {"bn":"Search Kanji, reading, Bangla meaning, examples...","en":"Search Kanji, reading, meaning, examples...","ja":"漢字、読み、意味、例を検索…","vi":"Tìm Kanji, cách đọc, nghĩa, ví dụ…","ne":"Kanji, reading, अर्थ, उदाहरण खोज्नुहोस्…","hi":"Kanji, reading, अर्थ, उदाहरण खोजें…","ur":"Kanji، reading، مطلب، مثالیں تلاش کریں…","my":"Kanji, reading, အဓိပ္ပာယ်, ဥပမာ ရှာပါ…","zh":"搜索汉字、读法、意思、例句…","si":"Kanji, reading, අර්ථය, උදාහරණ සොයන්න…","fil":"Maghanap ng Kanji, reading, kahulugan, halimbawa…"},
    "Grammar, বাংলা অর্থ বা form খুঁজুন…": {"bn":"Grammar, বাংলা অর্থ বা form খুঁজুন…","en":"Search grammar, English meanings or forms…","ja":"文法、日本語の意味、形を検索…","vi":"Tìm grammar, nghĩa tiếng Việt hoặc form…","ne":"Grammar, नेपाली अर्थ वा form खोज्नुहोस्…","hi":"Grammar, हिंदी अर्थ या form खोजें…","ur":"Grammar، اردو مطلب یا form تلاش کریں…","my":"Grammar, မြန်မာ အဓိပ္ပာယ် သို့မဟုတ် form ရှာပါ…","zh":"搜索语法、中文意思或形式…","si":"ව්‍යාකරණ, සිංහල අර්ථය හෝ ආකෘතිය සොයන්න…","fil":"Maghanap ng grammar, kahulugang Filipino o form…"},
    "Grammar, বাংলা অর্থ, form বা example খুঁজুন…": {"bn":"Grammar, বাংলা অর্থ, form বা example খুঁজুন…","en":"Search grammar, English meanings, forms or examples…","ja":"文法、日本語の意味、形、例を検索…","vi":"Tìm grammar, nghĩa tiếng Việt, form hoặc example…","ne":"Grammar, नेपाली अर्थ, form वा example खोज्नुहोस्…","hi":"Grammar, हिंदी अर्थ, form या example खोजें…","ur":"Grammar، اردو مطلب، form یا example تلاش کریں…","my":"Grammar, မြန်မာ အဓိပ္ပာယ်, form သို့မဟုတ် example ရှာပါ…","zh":"搜索语法、中文意思、形式或例句…","si":"ව්‍යාකරණ, සිංහල අර්ථය, ආකෘතිය හෝ උදාහරණ සොයන්න…","fil":"Maghanap ng grammar, kahulugang Filipino, form o example…"},
    "Japanese / Romaji / বাংলা দিয়ে খুঁজুন… যেমন: sensei, শিক্ষক, 学生": {"bn":"Japanese / Romaji / বাংলা দিয়ে খুঁজুন… যেমন: sensei, শিক্ষক, 学生","en":"Search by Japanese / Romaji / English… e.g. sensei, teacher, 学生","ja":"日本語 / ローマ字 / 日本語の意味で検索… 例：sensei、先生、学生","vi":"Tìm bằng Japanese / Romaji / tiếng Việt… ví dụ: sensei, giáo viên, 学生","ne":"Japanese / Romaji / नेपालीले खोज्नुहोस्… जस्तै: sensei, शिक्षक, 学生","hi":"Japanese / Romaji / हिंदी से खोजें… जैसे: sensei, शिक्षक, 学生","ur":"Japanese / Romaji / اردو سے تلاش کریں… جیسے: sensei، استاد، 学生","my":"Japanese / Romaji / မြန်မာဖြင့် ရှာပါ… ဥပမာ: sensei, ဆရာ, 学生","zh":"用日语 / 罗马字 / 中文搜索… 例如：sensei、老师、学生","si":"ජපන් / Romaji / සිංහලෙන් සොයන්න… උදා: sensei, ගුරුතුමා, 学生","fil":"Maghanap gamit ang Japanese / Romaji / Filipino… hal. sensei, guro, 学生"},
    "Japanese / romaji / বাংলা দিয়ে search করুন…": {"bn":"Japanese / romaji / বাংলা দিয়ে search করুন…","en":"Search by Japanese / romaji / English…","ja":"日本語 / ローマ字 / 日本語の意味で検索…","vi":"Tìm bằng Japanese / romaji / tiếng Việt…","ne":"Japanese / romaji / नेपालीले search गर्नुहोस्…","hi":"Japanese / romaji / हिंदी से search करें…","ur":"Japanese / romaji / اردو سے تلاش کریں…","my":"Japanese / romaji / မြန်မာဖြင့် ရှာပါ…","zh":"用日语 / 罗马字 / 中文搜索…","si":"ජපන් / romaji / සිංහලෙන් සොයන්න…","fil":"Mag-search gamit ang Japanese / romaji / Filipino…"},
    "Kanji, ふりがな বা বাংলা দিয়ে খুঁজুন…": {"bn":"Kanji, ふりがな বা বাংলা দিয়ে খুঁজুন…","en":"Search by Kanji, furigana or English…","ja":"漢字、ふりがな、または日本語で検索…","vi":"Tìm bằng Kanji, furigana hoặc tiếng Việt…","ne":"Kanji, ふりがな वा नेपालीले खोज्नुहोस्…","hi":"Kanji, ふりがな या हिंदी से खोजें…","ur":"Kanji، ふりがな یا اردو سے تلاش کریں…","my":"Kanji, ふりがな သို့မဟုတ် မြန်မာဖြင့် ရှာပါ…","zh":"用汉字、ふりがな或中文搜索…","si":"Kanji, ふりがな හෝ සිංහලෙන් සොයන්න…","fil":"Maghanap gamit ang Kanji, furigana o Filipino…"},
    "Lesson 14, て-form অথবা বাংলা বিষয় লিখুন": {"bn":"Lesson 14, て-form অথবা বাংলা বিষয় লিখুন","en":"Write Lesson 14, て-form or an English topic","ja":"Lesson 14、て-form、または日本語のトピックを入力","vi":"Viết Lesson 14, て-form hoặc chủ đề tiếng Việt","ne":"Lesson 14, て-form वा नेपाली विषय लेख्नुहोस्","hi":"Lesson 14, て-form या हिंदी विषय लिखें","ur":"Lesson 14، て-form یا اردو موضوع لکھیں","my":"Lesson 14, て-form သို့မဟုတ် မြန်မာ အကြောင်းအရာ ရေးပါ","zh":"输入 Lesson 14、て-form 或中文主题","si":"Lesson 14, て-form හෝ සිංහල මාතෘකාව ලියන්න","fil":"Isulat ang Lesson 14, て-form o paksang Filipino"},
    "Lesson 35, なら অথবা বাংলা বিষয় লিখুন": {"bn":"Lesson 35, なら অথবা বাংলা বিষয় লিখুন","en":"Write Lesson 35, なら or an English topic","ja":"Lesson 35、なら、または日本語のトピックを入力","vi":"Viết Lesson 35, なら hoặc chủ đề tiếng Việt","ne":"Lesson 35, なら वा नेपाली विषय लेख्नुहोस्","hi":"Lesson 35, なら या हिंदी विषय लिखें","ur":"Lesson 35، なら یا اردو موضوع لکھیں","my":"Lesson 35, なら သို့မဟုတ် မြန်မာ အကြောင်းအရာ ရေးပါ","zh":"输入 Lesson 35、なら 或中文主题","si":"Lesson 35, なら හෝ සිංහල මාතෘකාව ලියන්න","fil":"Isulat ang Lesson 35, なら o paksang Filipino"},
    "Lesson 42, ために অথবা বাংলা অর্থ লিখুন": {"bn":"Lesson 42, ために অথবা বাংলা অর্থ লিখুন","en":"Write Lesson 42, ために or an English meaning","ja":"Lesson 42、ために、または日本語の意味を入力","vi":"Viết Lesson 42, ために hoặc nghĩa tiếng Việt","ne":"Lesson 42, ために वा नेपाली अर्थ लेख्नुहोस्","hi":"Lesson 42, ために या हिंदी अर्थ लिखें","ur":"Lesson 42، ために یا اردو مطلب لکھیں","my":"Lesson 42, ために သို့မဟုတ် မြန်မာ အဓိပ္ပာယ် ရေးပါ","zh":"输入 Lesson 42、ために 或中文意思","si":"Lesson 42, ために හෝ සිංහල අර්ථය ලියන්න","fil":"Isulat ang Lesson 42, ために o kahulugang Filipino"},
    "Lesson 8, 食べます অথবা বাংলা অর্থ লিখুন": {"bn":"Lesson 8, 食べます অথবা বাংলা অর্থ লিখুন","en":"Write Lesson 8, 食べます or an English meaning","ja":"Lesson 8、食べます、または日本語の意味を入力","vi":"Viết Lesson 8, 食べます hoặc nghĩa tiếng Việt","ne":"Lesson 8, 食べます वा नेपाली अर्थ लेख्नुहोस्","hi":"Lesson 8, 食べます या हिंदी अर्थ लिखें","ur":"Lesson 8، 食べます یا اردو مطلب لکھیں","my":"Lesson 8, 食べます သို့မဟုတ် မြန်မာ အဓိပ္ပာယ် ရေးပါ","zh":"输入 Lesson 8、食べます 或中文意思","si":"Lesson 8, 食べます හෝ සිංහල අර්ථය ලියන්න","fil":"Isulat ang Lesson 8, 食べます o kahulugang Filipino"},
    "grammar / Japanese / বাংলা দিয়ে search করুন…": {"bn":"grammar / Japanese / বাংলা দিয়ে search করুন…","en":"Search by grammar / Japanese / English…","ja":"grammar / 日本語 / 日本語の意味で検索…","vi":"Tìm bằng grammar / Japanese / tiếng Việt…","ne":"grammar / Japanese / नेपालीले search गर्नुहोस्…","hi":"grammar / Japanese / हिंदी से search करें…","ur":"grammar / Japanese / اردو سے تلاش کریں…","my":"grammar / Japanese / မြန်မာဖြင့် ရှာပါ…","zh":"用语法 / 日语 / 中文搜索…","si":"ව්‍යාකරණ / ජපන් / සිංහලෙන් සොයන්න…","fil":"Mag-search gamit ang grammar / Japanese / Filipino…"},
    "grammar / বাংলা / Japanese দিয়ে খুঁজুন…": {"bn":"grammar / বাংলা / Japanese দিয়ে খুঁজুন…","en":"Search by grammar / English / Japanese…","ja":"grammar / 日本語の意味 / 日本語で検索…","vi":"Tìm bằng grammar / tiếng Việt / Japanese…","ne":"grammar / नेपाली / Japanese ले खोज्नुहोस्…","hi":"grammar / हिंदी / Japanese से खोजें…","ur":"grammar / اردو / Japanese سے تلاش کریں…","my":"grammar / မြန်မာ / Japanese ဖြင့် ရှာပါ…","zh":"用语法 / 中文 / 日语搜索…","si":"ව්‍යාකරණ / සිංහල / ජපන් බසෙන් සොයන්න…","fil":"Maghanap gamit ang grammar / Filipino / Japanese…"},
    "আপনার learning journey বা লক্ষ্য": {"bn":"আপনার learning journey বা লক্ষ্য","en":"Your learning journey or goal","ja":"あなたの学習の歩みや目標","vi":"Hành trình học tập hoặc mục tiêu của bạn","ne":"तपाईंको learning journey वा लक्ष्य","hi":"आपकी learning journey या लक्ष्य","ur":"آپ کا سیکھنے کا سفر یا ہدف","my":"သင့်သင်ယူမှု ခရီးစဉ် သို့မဟုတ် ပန်းတိုင်","zh":"你的学习历程或目标","si":"ඔබේ ඉගෙනුම් ගමන හෝ ඉලක්කය","fil":"Ang iyong learning journey o layunin"},
    "কানজি, ভোকাবুলারি, গ্রামার খুঁজুন…": {"bn":"কানজি, ভোকাবুলারি, গ্রামার খুঁজুন…","en":"Search kanji, vocabulary, grammar…","ja":"漢字、単語、文法を検索…","vi":"Tìm kanji, từ vựng, grammar…","ne":"कान्जी, शब्दावली, grammar खोज्नुहोस्…","hi":"कांजी, शब्दावली, grammar खोजें…","ur":"کانجی، الفاظ، گرامر تلاش کریں…","my":"Kanji, ဝေါဟာရ, grammar ရှာပါ…","zh":"搜索汉字、词汇、语法…","si":"කාන්ජි, ශබ්දකෝෂය, ව්‍යාකරණ සොයන්න…","fil":"Maghanap ng kanji, bokabularyo, grammar…"},
    "গ্রামার বা বাংলা অর্থ খুঁজুন…": {"bn":"গ্রামার বা বাংলা অর্থ খুঁজুন…","en":"Search grammar or English meanings…","ja":"文法や日本語の意味を検索…","vi":"Tìm grammar hoặc nghĩa tiếng Việt…","ne":"grammar वा नेपाली अर्थ खोज्नुहोस्…","hi":"grammar या हिंदी अर्थ खोजें…","ur":"گرامر یا اردو مطلب تلاش کریں…","my":"grammar သို့မဟုတ် မြန်မာ အဓိပ္ပာယ် ရှာပါ…","zh":"搜索语法或中文意思…","si":"ව්‍යාකරණ හෝ සිංහල අර්ථය සොයන්න…","fil":"Maghanap ng grammar o kahulugang Filipino…"},
    "জাপানি নিয়ম বা বাংলা অর্থ লিখে খুঁজুন…": {"bn":"জাপানি নিয়ম বা বাংলা অর্থ লিখে খুঁজুন…","en":"Search by Japanese rule or English meaning…","ja":"日本語のルールや日本語の意味で検索…","vi":"Tìm theo quy tắc Japanese hoặc nghĩa tiếng Việt…","ne":"Japanese नियम वा नेपाली अर्थ लेखेर खोज्नुहोस्…","hi":"Japanese नियम या हिंदी अर्थ लिखकर खोजें…","ur":"Japanese قاعدہ یا اردو مطلب لکھ کر تلاش کریں…","my":"Japanese စည်းမျဉ်း သို့မဟုတ် မြန်မာ အဓိပ္ပာယ် ရေးပြီး ရှာပါ…","zh":"输入日语规则或中文意思搜索…","si":"ජපන් නීතිය හෝ සිංහල අර්ථය ලියා සොයන්න…","fil":"Maghanap gamit ang Japanese rule o kahulugang Filipino…"},
    "জাপানি বা বাংলা অর্থ…": {"bn":"জাপানি বা বাংলা অর্থ…","en":"Japanese or English meaning…","ja":"日本語または日本語の意味…","vi":"Japanese hoặc nghĩa tiếng Việt…","ne":"Japanese वा नेपाली अर्थ…","hi":"Japanese या हिंदी अर्थ…","ur":"Japanese یا اردو مطلب…","my":"Japanese သို့မဟုတ် မြန်မာ အဓိပ္ပာယ်…","zh":"日语或中文意思…","si":"ජපන් හෝ සිංහල අර්ථය…","fil":"Japanese o kahulugang Filipino…"},
    "জাপানি শেখার প্রশ্ন লিখুন…": {"bn":"জাপানি শেখার প্রশ্ন লিখুন…","en":"Write your Japanese-learning question…","ja":"日本語学習の質問を書いてください…","vi":"Viết câu hỏi học Japanese của bạn…","ne":"Japanese सिक्ने प्रश्न लेख्नुहोस्…","hi":"Japanese सीखने का प्रश्न लिखें…","ur":"Japanese سیکھنے کا سوال لکھیں…","my":"Japanese သင်ယူမှု မေးခွန်း ရေးပါ…","zh":"写下你的日语学习问题…","si":"ඔබේ ජපන් ඉගෙනුම් ප්‍රශ්නය ලියන්න…","fil":"Isulat ang tanong mo sa pag-aaral ng Japanese…"},
    "জাপানিজ / বাংলা / উচ্চারণ দিয়ে খুঁজুন…": {"bn":"জাপানিজ / বাংলা / উচ্চারণ দিয়ে খুঁজুন…","en":"Search by Japanese / English / pronunciation…","ja":"日本語 / 日本語の意味 / 発音で検索…","vi":"Tìm bằng Japanese / tiếng Việt / phát âm…","ne":"Japanese / नेपाली / उच्चारणले खोज्नुहोस्…","hi":"Japanese / हिंदी / उच्चारण से खोजें…","ur":"Japanese / اردو / تلفظ سے تلاش کریں…","my":"Japanese / မြန်မာ / အသံထွက်ဖြင့် ရှာပါ…","zh":"用日语 / 中文 / 发音搜索…","si":"ජපන් / සිංහල / උච්චාරණයෙන් සොයන්න…","fil":"Maghanap gamit ang Japanese / Filipino / pagbigkas…"},
    "বই বা বিষয় খুঁজুন…": {"bn":"বই বা বিষয় খুঁজুন…","en":"Search for a book or topic…","ja":"本やトピックを検索…","vi":"Tìm sách hoặc chủ đề…","ne":"किताब वा विषय खोज्नुहोस्…","hi":"किताब या विषय खोजें…","ur":"کتاب یا موضوع تلاش کریں…","my":"စာအုပ် သို့မဟုတ် အကြောင်းအရာ ရှာပါ…","zh":"搜索书籍或主题…","si":"පොතක් හෝ මාතෘකාවක් සොයන්න…","fil":"Maghanap ng libro o paksa…"},
    "যেমন: JLPT N3 pass করতে চাই": {"bn":"যেমন: JLPT N3 pass করতে চাই","en":"e.g. I want to pass JLPT N3","ja":"例：JLPT N3に合格したい","vi":"ví dụ: Tôi muốn đỗ JLPT N3","ne":"जस्तै: JLPT N3 पास गर्न चाहन्छु","hi":"जैसे: JLPT N3 पास करना चाहता हूँ","ur":"جیسے: JLPT N3 پاس کرنا چاہتا ہوں","my":"ဥပမာ: JLPT N3 အောင်ချင်ပါတယ်","zh":"例如：我想通过 JLPT N3","si":"උදා: මට JLPT N3 සමත් වීමට අවශ්‍යයි","fil":"hal. Gusto kong pumasa sa JLPT N3"},
    "যেমন: কৃষি, হোটেল, গাড়ি, railway…": {"bn":"যেমন: কৃষি, হোটেল, গাড়ি, railway…","en":"e.g. agriculture, hotel, car, railway…","ja":"例：農業、ホテル、車、鉄道…","vi":"ví dụ: nông nghiệp, khách sạn, ô tô, đường sắt…","ne":"जस्तै: कृषि, होटेल, गाडी, railway…","hi":"जैसे: कृषि, होटल, गाड़ी, railway…","ur":"جیسے: زراعت، ہوٹل، گاڑی، railway…","my":"ဥပမာ: စိုက်ပျိုးရေး, ဟိုတယ်, ကား, railway…","zh":"例如：农业、酒店、汽车、铁路…","si":"උදා: කෘෂිකර්මය, හෝටලය, මෝටර් රථය, දුම්රිය…","fil":"hal. agrikultura, hotel, kotse, railway…"},
    "লেসন, 使役受身, ৩৪…": {"bn":"লেসন, 使役受身, ৩৪…","en":"Lesson, 使役受身, 34…","ja":"レッスン、使役受身、34…","vi":"Lesson, 使役受身, 34…","ne":"Lesson, 使役受身, ३४…","hi":"Lesson, 使役受身, 34…","ur":"Lesson، 使役受身، 34…","my":"Lesson, 使役受身, 34…","zh":"课程、使役受身、34…","si":"පාඩම, 使役受身, 34…","fil":"Lesson, 使役受身, 34…"},
    "শব্দ, ふりがな বা বাংলা দিয়ে খুঁজুন…": {"bn":"শব্দ, ふりがな বা বাংলা দিয়ে খুঁজুন…","en":"Search by word, furigana or English…","ja":"単語、ふりがな、または日本語で検索…","vi":"Tìm bằng từ, furigana hoặc tiếng Việt…","ne":"शब्द, ふりがな वा नेपालीले खोज्नुहोस्…","hi":"शब्द, ふりがな या हिंदी से खोजें…","ur":"لفظ، ふりがな یا اردو سے تلاش کریں…","my":"စကားလုံး, ふりがな သို့မဟုတ် မြန်မာဖြင့် ရှာပါ…","zh":"用单词、ふりがな或中文搜索…","si":"වචනය, ふりがな හෝ සිංහලෙන් සොයන්න…","fil":"Maghanap gamit ang salita, furigana o Filipino…"},
  };
  var DYN_DATA_LABELS = {
    "AI জাপানি টিউটর": {"bn":"AI জাপানি টিউটর","en":"AI Japanese Tutor","ja":"AI日本語チューター","vi":"Gia sư AI Japanese","ne":"AI Japanese ट्युटर","hi":"AI Japanese ट्यूटर","ur":"AI Japanese ٹیوٹر","my":"AI Japanese သင်ကြားပေးသူ","zh":"AI 日语导师","si":"AI ජපන් උපදේශක","fil":"AI Japanese Tutor"},
    "JLPT কুইজ": {"bn":"JLPT কুইজ","en":"JLPT Quiz","ja":"JLPTクイズ","vi":"JLPT Quiz","ne":"JLPT क्विज","hi":"JLPT क्विज़","ur":"JLPT کوئز","my":"JLPT ပဟေဠိ","zh":"JLPT 测验","si":"JLPT ප්‍රශ්නාවලිය","fil":"JLPT Quiz"},
    "JPY থেকে BDT": {"bn":"JPY থেকে BDT","en":"JPY to BDT","ja":"JPYからBDT","vi":"JPY sang BDT","ne":"JPY बाट BDT","hi":"JPY से BDT","ur":"JPY سے BDT","my":"JPY မှ BDT","zh":"JPY 到 BDT","si":"JPY සිට BDT දක්වා","fil":"JPY hanggang BDT"},
    "SSW সম্পূর্ণ গাইড": {"bn":"SSW সম্পূর্ণ গাইড","en":"SSW Complete Guide","ja":"SSW完全ガイド","vi":"Hướng dẫn SSW đầy đủ","ne":"SSW पूर्ण गाइड","hi":"SSW पूर्ण गाइड","ur":"SSW مکمل گائیڈ","my":"SSW အပြည့်အစုံ လမ်းညွှန်","zh":"SSW 完整指南","si":"SSW සම්පූර්ණ මාර්ගෝපදේශය","fil":"SSW Kumpletong Gabay"},
    "ইন্টারভিউ প্রস্তুতি": {"bn":"ইন্টারভিউ প্রস্তুতি","en":"Interview Preparation","ja":"面接の準備","vi":"Chuẩn bị phỏng vấn","ne":"अन्तर्वार्ता तयारी","hi":"साक्षात्कार की तैयारी","ur":"انٹرویو کی تیاری","my":"အင်တာဗျူး ပြင်ဆင်မှု","zh":"面试准备","si":"සම්මුඛ පරීක්ෂණ සූදානම","fil":"Paghahanda sa Interview"},
    "জাপান লাইফ গাইড": {"bn":"জাপান লাইফ গাইড","en":"Japan Life Guide","ja":"日本生活ガイド","vi":"Hướng dẫn cuộc sống Nhật Bản","ne":"जापान लाइफ गाइड","hi":"जापान लाइफ गाइड","ur":"جاپان لائف گائیڈ","my":"Japan Life လမ်းညွှန်","zh":"日本生活指南","si":"ජපානයේ ජීවිත මාර්ගෝපදේශය","fil":"Japan Life Guide"},
    "জাপানি E-Book Library": {"bn":"জাপানি E-Book Library","en":"Japanese E-Book Library","ja":"日本語電子書籍ライブラリ","vi":"Thư viện E-Book Japanese","ne":"Japanese E-Book Library","hi":"Japanese E-Book Library","ur":"Japanese E-Book لائبریری","my":"Japanese E-Book စာကြည့်တိုက်","zh":"日语电子书图书馆","si":"ජපන් විද්‍යුත් පොත් පුස්තකාලය","fil":"Japanese E-Book Library"},
    "দরকারি জাপানি বাক্য": {"bn":"দরকারি জাপানি বাক্য","en":"Useful Japanese phrases","ja":"便利な日本語フレーズ","vi":"Câu Japanese hữu ích","ne":"उपयोगी Japanese वाक्य","hi":"उपयोगी Japanese वाक्य","ur":"مفید Japanese جملے","my":"အသုံးဝင်သော Japanese စာကြောင်းများ","zh":"实用日语句子","si":"ප්‍රයෝජනවත් ජපන් වාක්‍ය","fil":"Mahahalagang pangungusap na Japanese"},
    "স্টাডি গাইড": {"bn":"স্টাডি গাইড","en":"Study Guide","ja":"学習ガイド","vi":"Hướng dẫn học tập","ne":"अध्ययन मार्गदर्शन","hi":"अध्ययन मार्गदर्शिका","ur":"مطالعے کی رہنمائی","my":"လေ့လာမှု လမ်းညွှန်","zh":"学习指南","si":"අධ්‍යයන මාර්ගෝපදේශය","fil":"Gabay sa pag-aaral"},
  };
  /* Titles run (2026-11-21): title attributes were never extracted
     into packs (Run 17 class (a)); cover them with the same runtime
     dictionary mechanism as placeholders/data-labels. Theme value
     reuses Run 18 n4-vocab-ui, listen reuses Run 21 n5-vocab-ui,
     menu reuses DYN ha.menu; the rest are self-translated. */
  var DYN_TITLES = {
    "রঙের থিম বদলান": {"bn":"রঙের থিম বদলান","en":"Change color theme","ja":"カラーテーマを変更","vi":"Đổi chủ đề màu","ne":"रङ थिम परिवर्तन गर्नुहोस्","hi":"रंग थीम बदलें","ur":"رنگ تھیم بدلیں","my":"အရောင်သီမ် ပြောင်းပါ","zh":"更改颜色主题","si":"වර්ණ තේමාව වෙනස් කරන්න","fil":"Baguhin ang tema ng kulay"},
    "মেনু": {"bn":"মেনু","en":"Menu","ja":"メニュー","vi":"Menu","ne":"मेनु","hi":"मेनू","ur":"مینیو","my":"မီနူး","zh":"菜单","si":"මෙනුව","fil":"Menu"},
    "শুনুন": {"bn":"শুনুন","en":"Listen","ja":"聞く","vi":"Nghe","ne":"सुन्नुहोस्","hi":"सुनें","ur":"سنیں","my":"နားထောင်ပါ","zh":"听","si":"අහන්න","fil":"Pakinggan"},
    "নতুন চ্যাট": {"bn":"নতুন চ্যাট","en":"New chat","ja":"新しいチャット","vi":"Chat mới","ne":"नयाँ च्याट","hi":"नई चैट","ur":"نئی چیٹ","my":"ချတ်အသစ်","zh":"新聊天","si":"නව සංවාදය","fil":"Bagong chat"},
    "সেটিংস": {"bn":"সেটিংস","en":"Settings","ja":"設定","vi":"Cài đặt","ne":"सेटिङ","hi":"सेटिंग्स","ur":"ترتیبات","my":"ဆက်တင်များ","zh":"设置","si":"සැකසීම්","fil":"Mga Setting"},
    "কণ্ঠে বলুন": {"bn":"কণ্ঠে বলুন","en":"Say it aloud","ja":"声に出して言う","vi":"Nói bằng giọng nói","ne":"आवाजमा भन्नुहोस्","hi":"आवाज़ में कहें","ur":"آواز میں کہیں","my":"အသံဖြင့် ပြောပါ","zh":"用语音说","si":"කටහඬින් කියන්න","fil":"Sabihin nang malakas"},
    "Lesson 01 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 01 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 01 as completed","ja":"レッスン01を完了にする","vi":"Đánh dấu Lesson 01 đã hoàn thành","ne":"Lesson ०१ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 01 को सम्पन्न चिह्नित करें","ur":"Lesson 01 کو مکمل شدہ نشان لگائیں","my":"Lesson 01 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 01 标记为已完成","si":"Lesson 01 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 01"},
    "Lesson 02 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 02 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 02 as completed","ja":"レッスン02を完了にする","vi":"Đánh dấu Lesson 02 đã hoàn thành","ne":"Lesson ०२ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 02 को सम्पन्न चिह्नित करें","ur":"Lesson 02 کو مکمل شدہ نشان لگائیں","my":"Lesson 02 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 02 标记为已完成","si":"Lesson 02 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 02"},
    "Lesson 03 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 03 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 03 as completed","ja":"レッスン03を完了にする","vi":"Đánh dấu Lesson 03 đã hoàn thành","ne":"Lesson ०३ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 03 को सम्पन्न चिह्नित करें","ur":"Lesson 03 کو مکمل شدہ نشان لگائیں","my":"Lesson 03 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 03 标记为已完成","si":"Lesson 03 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 03"},
    "Lesson 04 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 04 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 04 as completed","ja":"レッスン04を完了にする","vi":"Đánh dấu Lesson 04 đã hoàn thành","ne":"Lesson ०४ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 04 को सम्पन्न चिह्नित करें","ur":"Lesson 04 کو مکمل شدہ نشان لگائیں","my":"Lesson 04 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 04 标记为已完成","si":"Lesson 04 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 04"},
    "Lesson 05 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 05 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 05 as completed","ja":"レッスン05を完了にする","vi":"Đánh dấu Lesson 05 đã hoàn thành","ne":"Lesson ०५ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 05 को सम्पन्न चिह्नित करें","ur":"Lesson 05 کو مکمل شدہ نشان لگائیں","my":"Lesson 05 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 05 标记为已完成","si":"Lesson 05 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 05"},
    "Lesson 06 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 06 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 06 as completed","ja":"レッスン06を完了にする","vi":"Đánh dấu Lesson 06 đã hoàn thành","ne":"Lesson ०६ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 06 को सम्पन्न चिह्नित करें","ur":"Lesson 06 کو مکمل شدہ نشان لگائیں","my":"Lesson 06 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 06 标记为已完成","si":"Lesson 06 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 06"},
    "Lesson 07 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 07 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 07 as completed","ja":"レッスン07を完了にする","vi":"Đánh dấu Lesson 07 đã hoàn thành","ne":"Lesson ०७ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 07 को सम्पन्न चिह्नित करें","ur":"Lesson 07 کو مکمل شدہ نشان لگائیں","my":"Lesson 07 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 07 标记为已完成","si":"Lesson 07 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 07"},
    "Lesson 08 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 08 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 08 as completed","ja":"レッスン08を完了にする","vi":"Đánh dấu Lesson 08 đã hoàn thành","ne":"Lesson ०८ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 08 को सम्पन्न चिह्नित करें","ur":"Lesson 08 کو مکمل شدہ نشان لگائیں","my":"Lesson 08 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 08 标记为已完成","si":"Lesson 08 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 08"},
    "Lesson 09 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 09 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 09 as completed","ja":"レッスン09を完了にする","vi":"Đánh dấu Lesson 09 đã hoàn thành","ne":"Lesson ०९ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 09 को सम्पन्न चिह्नित करें","ur":"Lesson 09 کو مکمل شدہ نشان لگائیں","my":"Lesson 09 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 09 标记为已完成","si":"Lesson 09 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 09"},
    "Lesson 10 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 10 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 10 as completed","ja":"レッスン10を完了にする","vi":"Đánh dấu Lesson 10 đã hoàn thành","ne":"Lesson १० सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 10 को सम्पन्न चिह्नित करें","ur":"Lesson 10 کو مکمل شدہ نشان لگائیں","my":"Lesson 10 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 10 标记为已完成","si":"Lesson 10 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 10"},
    "Lesson 11 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 11 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 11 as completed","ja":"レッスン11を完了にする","vi":"Đánh dấu Lesson 11 đã hoàn thành","ne":"Lesson ११ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 11 को सम्पन्न चिह्नित करें","ur":"Lesson 11 کو مکمل شدہ نشان لگائیں","my":"Lesson 11 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 11 标记为已完成","si":"Lesson 11 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 11"},
    "Lesson 12 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 12 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 12 as completed","ja":"レッスン12を完了にする","vi":"Đánh dấu Lesson 12 đã hoàn thành","ne":"Lesson १२ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 12 को सम्पन्न चिह्नित करें","ur":"Lesson 12 کو مکمل شدہ نشان لگائیں","my":"Lesson 12 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 12 标记为已完成","si":"Lesson 12 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 12"},
    "Lesson 13 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 13 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 13 as completed","ja":"レッスン13を完了にする","vi":"Đánh dấu Lesson 13 đã hoàn thành","ne":"Lesson १३ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 13 को सम्पन्न चिह्नित करें","ur":"Lesson 13 کو مکمل شدہ نشان لگائیں","my":"Lesson 13 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 13 标记为已完成","si":"Lesson 13 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 13"},
    "Lesson 14 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 14 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 14 as completed","ja":"レッスン14を完了にする","vi":"Đánh dấu Lesson 14 đã hoàn thành","ne":"Lesson १४ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 14 को सम्पन्न चिह्नित करें","ur":"Lesson 14 کو مکمل شدہ نشان لگائیں","my":"Lesson 14 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 14 标记为已完成","si":"Lesson 14 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 14"},
    "Lesson 15 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 15 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 15 as completed","ja":"レッスン15を完了にする","vi":"Đánh dấu Lesson 15 đã hoàn thành","ne":"Lesson १५ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 15 को सम्पन्न चिह्नित करें","ur":"Lesson 15 کو مکمل شدہ نشان لگائیں","my":"Lesson 15 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 15 标记为已完成","si":"Lesson 15 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 15"},
    "Lesson 16 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 16 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 16 as completed","ja":"レッスン16を完了にする","vi":"Đánh dấu Lesson 16 đã hoàn thành","ne":"Lesson १६ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 16 को सम्पन्न चिह्नित करें","ur":"Lesson 16 کو مکمل شدہ نشان لگائیں","my":"Lesson 16 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 16 标记为已完成","si":"Lesson 16 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 16"},
    "Lesson 17 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 17 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 17 as completed","ja":"レッスン17を完了にする","vi":"Đánh dấu Lesson 17 đã hoàn thành","ne":"Lesson १७ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 17 को सम्पन्न चिह्नित करें","ur":"Lesson 17 کو مکمل شدہ نشان لگائیں","my":"Lesson 17 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 17 标记为已完成","si":"Lesson 17 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 17"},
    "Lesson 18 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 18 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 18 as completed","ja":"レッスン18を完了にする","vi":"Đánh dấu Lesson 18 đã hoàn thành","ne":"Lesson १८ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 18 को सम्पन्न चिह्नित करें","ur":"Lesson 18 کو مکمل شدہ نشان لگائیں","my":"Lesson 18 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 18 标记为已完成","si":"Lesson 18 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 18"},
    "Lesson 19 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 19 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 19 as completed","ja":"レッスン19を完了にする","vi":"Đánh dấu Lesson 19 đã hoàn thành","ne":"Lesson १९ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 19 को सम्पन्न चिह्नित करें","ur":"Lesson 19 کو مکمل شدہ نشان لگائیں","my":"Lesson 19 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 19 标记为已完成","si":"Lesson 19 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 19"},
    "Lesson 20 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 20 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 20 as completed","ja":"レッスン20を完了にする","vi":"Đánh dấu Lesson 20 đã hoàn thành","ne":"Lesson २० सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 20 को सम्पन्न चिह्नित करें","ur":"Lesson 20 کو مکمل شدہ نشان لگائیں","my":"Lesson 20 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 20 标记为已完成","si":"Lesson 20 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 20"},
    "Lesson 21 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 21 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 21 as completed","ja":"レッスン21を完了にする","vi":"Đánh dấu Lesson 21 đã hoàn thành","ne":"Lesson २१ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 21 को सम्पन्न चिह्नित करें","ur":"Lesson 21 کو مکمل شدہ نشان لگائیں","my":"Lesson 21 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 21 标记为已完成","si":"Lesson 21 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 21"},
    "Lesson 22 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 22 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 22 as completed","ja":"レッスン22を完了にする","vi":"Đánh dấu Lesson 22 đã hoàn thành","ne":"Lesson २२ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 22 को सम्पन्न चिह्नित करें","ur":"Lesson 22 کو مکمل شدہ نشان لگائیں","my":"Lesson 22 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 22 标记为已完成","si":"Lesson 22 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 22"},
    "Lesson 23 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 23 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 23 as completed","ja":"レッスン23を完了にする","vi":"Đánh dấu Lesson 23 đã hoàn thành","ne":"Lesson २३ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 23 को सम्पन्न चिह्नित करें","ur":"Lesson 23 کو مکمل شدہ نشان لگائیں","my":"Lesson 23 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 23 标记为已完成","si":"Lesson 23 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 23"},
    "Lesson 24 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 24 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 24 as completed","ja":"レッスン24を完了にする","vi":"Đánh dấu Lesson 24 đã hoàn thành","ne":"Lesson २४ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 24 को सम्पन्न चिह्नित करें","ur":"Lesson 24 کو مکمل شدہ نشان لگائیں","my":"Lesson 24 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 24 标记为已完成","si":"Lesson 24 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 24"},
    "Lesson 25 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 25 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 25 as completed","ja":"レッスン25を完了にする","vi":"Đánh dấu Lesson 25 đã hoàn thành","ne":"Lesson २५ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 25 को सम्पन्न चिह्नित करें","ur":"Lesson 25 کو مکمل شدہ نشان لگائیں","my":"Lesson 25 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 25 标记为已完成","si":"Lesson 25 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 25"},
    "Lesson 26 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 26 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 26 as completed","ja":"レッスン26を完了にする","vi":"Đánh dấu Lesson 26 đã hoàn thành","ne":"Lesson २६ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 26 को सम्पन्न चिह्नित करें","ur":"Lesson 26 کو مکمل شدہ نشان لگائیں","my":"Lesson 26 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 26 标记为已完成","si":"Lesson 26 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 26"},
    "Lesson 27 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 27 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 27 as completed","ja":"レッスン27を完了にする","vi":"Đánh dấu Lesson 27 đã hoàn thành","ne":"Lesson २७ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 27 को सम्पन्न चिह्नित करें","ur":"Lesson 27 کو مکمل شدہ نشان لگائیں","my":"Lesson 27 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 27 标记为已完成","si":"Lesson 27 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 27"},
    "Lesson 28 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 28 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 28 as completed","ja":"レッスン28を完了にする","vi":"Đánh dấu Lesson 28 đã hoàn thành","ne":"Lesson २८ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 28 को सम्पन्न चिह्नित करें","ur":"Lesson 28 کو مکمل شدہ نشان لگائیں","my":"Lesson 28 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 28 标记为已完成","si":"Lesson 28 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 28"},
    "Lesson 29 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 29 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 29 as completed","ja":"レッスン29を完了にする","vi":"Đánh dấu Lesson 29 đã hoàn thành","ne":"Lesson २९ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 29 को सम्पन्न चिह्नित करें","ur":"Lesson 29 کو مکمل شدہ نشان لگائیں","my":"Lesson 29 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 29 标记为已完成","si":"Lesson 29 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 29"},
    "Lesson 30 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 30 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 30 as completed","ja":"レッスン30を完了にする","vi":"Đánh dấu Lesson 30 đã hoàn thành","ne":"Lesson ३० सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 30 को सम्पन्न चिह्नित करें","ur":"Lesson 30 کو مکمل شدہ نشان لگائیں","my":"Lesson 30 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 30 标记为已完成","si":"Lesson 30 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 30"},
    "Lesson 31 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 31 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 31 as completed","ja":"レッスン31を完了にする","vi":"Đánh dấu Lesson 31 đã hoàn thành","ne":"Lesson ३१ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 31 को सम्पन्न चिह्नित करें","ur":"Lesson 31 کو مکمل شدہ نشان لگائیں","my":"Lesson 31 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 31 标记为已完成","si":"Lesson 31 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 31"},
    "Lesson 32 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 32 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 32 as completed","ja":"レッスン32を完了にする","vi":"Đánh dấu Lesson 32 đã hoàn thành","ne":"Lesson ३२ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 32 को सम्पन्न चिह्नित करें","ur":"Lesson 32 کو مکمل شدہ نشان لگائیں","my":"Lesson 32 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 32 标记为已完成","si":"Lesson 32 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 32"},
    "Lesson 33 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 33 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 33 as completed","ja":"レッスン33を完了にする","vi":"Đánh dấu Lesson 33 đã hoàn thành","ne":"Lesson ३३ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 33 को सम्पन्न चिह्नित करें","ur":"Lesson 33 کو مکمل شدہ نشان لگائیں","my":"Lesson 33 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 33 标记为已完成","si":"Lesson 33 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 33"},
    "Lesson 34 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 34 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 34 as completed","ja":"レッスン34を完了にする","vi":"Đánh dấu Lesson 34 đã hoàn thành","ne":"Lesson ३४ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 34 को सम्पन्न चिह्नित करें","ur":"Lesson 34 کو مکمل شدہ نشان لگائیں","my":"Lesson 34 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 34 标记为已完成","si":"Lesson 34 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 34"},
    "Lesson 35 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 35 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 35 as completed","ja":"レッスン35を完了にする","vi":"Đánh dấu Lesson 35 đã hoàn thành","ne":"Lesson ३५ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 35 को सम्पन्न चिह्नित करें","ur":"Lesson 35 کو مکمل شدہ نشان لگائیں","my":"Lesson 35 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 35 标记为已完成","si":"Lesson 35 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 35"},
    "Lesson 36 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 36 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 36 as completed","ja":"レッスン36を完了にする","vi":"Đánh dấu Lesson 36 đã hoàn thành","ne":"Lesson ३६ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 36 को सम्पन्न चिह्नित करें","ur":"Lesson 36 کو مکمل شدہ نشان لگائیں","my":"Lesson 36 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 36 标记为已完成","si":"Lesson 36 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 36"},
    "Lesson 37 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 37 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 37 as completed","ja":"レッスン37を完了にする","vi":"Đánh dấu Lesson 37 đã hoàn thành","ne":"Lesson ३७ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 37 को सम्पन्न चिह्नित करें","ur":"Lesson 37 کو مکمل شدہ نشان لگائیں","my":"Lesson 37 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 37 标记为已完成","si":"Lesson 37 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 37"},
    "Lesson 38 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 38 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 38 as completed","ja":"レッスン38を完了にする","vi":"Đánh dấu Lesson 38 đã hoàn thành","ne":"Lesson ३८ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 38 को सम्पन्न चिह्नित करें","ur":"Lesson 38 کو مکمل شدہ نشان لگائیں","my":"Lesson 38 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 38 标记为已完成","si":"Lesson 38 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 38"},
    "Lesson 39 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 39 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 39 as completed","ja":"レッスン39を完了にする","vi":"Đánh dấu Lesson 39 đã hoàn thành","ne":"Lesson ३९ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 39 को सम्पन्न चिह्नित करें","ur":"Lesson 39 کو مکمل شدہ نشان لگائیں","my":"Lesson 39 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 39 标记为已完成","si":"Lesson 39 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 39"},
    "Lesson 40 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 40 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 40 as completed","ja":"レッスン40を完了にする","vi":"Đánh dấu Lesson 40 đã hoàn thành","ne":"Lesson ४० सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 40 को सम्पन्न चिह्नित करें","ur":"Lesson 40 کو مکمل شدہ نشان لگائیں","my":"Lesson 40 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 40 标记为已完成","si":"Lesson 40 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 40"},
    "Lesson 41 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 41 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 41 as completed","ja":"レッスン41を完了にする","vi":"Đánh dấu Lesson 41 đã hoàn thành","ne":"Lesson ४१ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 41 को सम्पन्न चिह्नित करें","ur":"Lesson 41 کو مکمل شدہ نشان لگائیں","my":"Lesson 41 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 41 标记为已完成","si":"Lesson 41 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 41"},
    "Lesson 42 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 42 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 42 as completed","ja":"レッスン42を完了にする","vi":"Đánh dấu Lesson 42 đã hoàn thành","ne":"Lesson ४२ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 42 को सम्पन्न चिह्नित करें","ur":"Lesson 42 کو مکمل شدہ نشان لگائیں","my":"Lesson 42 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 42 标记为已完成","si":"Lesson 42 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 42"},
    "Lesson 43 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 43 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 43 as completed","ja":"レッスン43を完了にする","vi":"Đánh dấu Lesson 43 đã hoàn thành","ne":"Lesson ४३ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 43 को सम्पन्न चिह्नित करें","ur":"Lesson 43 کو مکمل شدہ نشان لگائیں","my":"Lesson 43 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 43 标记为已完成","si":"Lesson 43 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 43"},
    "Lesson 44 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 44 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 44 as completed","ja":"レッスン44を完了にする","vi":"Đánh dấu Lesson 44 đã hoàn thành","ne":"Lesson ४४ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 44 को सम्पन्न चिह्नित करें","ur":"Lesson 44 کو مکمل شدہ نشان لگائیں","my":"Lesson 44 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 44 标记为已完成","si":"Lesson 44 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 44"},
    "Lesson 45 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 45 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 45 as completed","ja":"レッスン45を完了にする","vi":"Đánh dấu Lesson 45 đã hoàn thành","ne":"Lesson ४५ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 45 को सम्पन्न चिह्नित करें","ur":"Lesson 45 کو مکمل شدہ نشان لگائیں","my":"Lesson 45 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 45 标记为已完成","si":"Lesson 45 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 45"},
    "Lesson 46 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 46 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 46 as completed","ja":"レッスン46を完了にする","vi":"Đánh dấu Lesson 46 đã hoàn thành","ne":"Lesson ४६ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 46 को सम्पन्न चिह्नित करें","ur":"Lesson 46 کو مکمل شدہ نشان لگائیں","my":"Lesson 46 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 46 标记为已完成","si":"Lesson 46 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 46"},
    "Lesson 47 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 47 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 47 as completed","ja":"レッスン47を完了にする","vi":"Đánh dấu Lesson 47 đã hoàn thành","ne":"Lesson ४७ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 47 को सम्पन्न चिह्नित करें","ur":"Lesson 47 کو مکمل شدہ نشان لگائیں","my":"Lesson 47 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 47 标记为已完成","si":"Lesson 47 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 47"},
    "Lesson 48 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 48 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 48 as completed","ja":"レッスン48を完了にする","vi":"Đánh dấu Lesson 48 đã hoàn thành","ne":"Lesson ४८ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 48 को सम्पन्न चिह्नित करें","ur":"Lesson 48 کو مکمل شدہ نشان لگائیں","my":"Lesson 48 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 48 标记为已完成","si":"Lesson 48 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 48"},
    "Lesson 49 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 49 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 49 as completed","ja":"レッスン49を完了にする","vi":"Đánh dấu Lesson 49 đã hoàn thành","ne":"Lesson ४९ सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 49 को सम्पन्न चिह्नित करें","ur":"Lesson 49 کو مکمل شدہ نشان لگائیں","my":"Lesson 49 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 49 标记为已完成","si":"Lesson 49 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 49"},
    "Lesson 50 সম্পন্ন হিসেবে চিহ্নিত করুন": {"bn":"Lesson 50 সম্পন্ন হিসেবে চিহ্নিত করুন","en":"Mark Lesson 50 as completed","ja":"レッスン50を完了にする","vi":"Đánh dấu Lesson 50 đã hoàn thành","ne":"Lesson ५० सम्पन्न भएको चिन्ह लगाउनुहोस्","hi":"Lesson 50 को सम्पन्न चिह्नित करें","ur":"Lesson 50 کو مکمل شدہ نشان لگائیں","my":"Lesson 50 ကို ပြီးဆုံးအဖြစ် မှတ်သားပါ","zh":"将 Lesson 50 标记为已完成","si":"Lesson 50 සම්පූර්ණ කළා ලෙස සලකුණු කරන්න","fil":"Markahang tapos na ang Lesson 50"},
  };
  /* Run 12: Bengali য় has two canonically-equivalent spellings — the
     precomposed U+09DF used throughout the HTML pages vs the decomposed
     U+09AF U+09BC used in the dictionaries above — so the exact-match
     lookups in applyDynAttributes silently missed (e.g. the n3-kanji
     search placeholder stayed Bengali on localized routes). Compare
     NFC-normalized forms on both sides; the rows handed back are the
     untouched dictionary values, and bn pages still return early. */
  function dynNorm(s) { return typeof s === "string" && s.normalize ? s.normalize("NFC") : s; }
  function dynNormMap(map) {
    var out = {};
    Object.keys(map).forEach(function (k) { out[dynNorm(k)] = map[k]; });
    return out;
  }
  var DYN_PLACEHOLDERS_NFC = dynNormMap(DYN_PLACEHOLDERS);
  var DYN_DATA_LABELS_NFC = dynNormMap(DYN_DATA_LABELS);
  var DYN_TITLES_NFC = dynNormMap(DYN_TITLES);
  var DYN_LANGS = { bn: 1, en: 1, ja: 1, vi: 1, ne: 1, hi: 1, ur: 1, my: 1, zh: 1, si: 1, fil: 1 };
  function dynLang() {
    var preset = document.documentElement.getAttribute("data-language-preset");
    if (preset && DYN_LANGS[preset]) return preset;
    var seg = window.location.pathname.split("/").filter(Boolean)[0];
    if (seg && DYN_LANGS[seg]) return seg;
    return "bn";
  }
  var NE_DIGITS = "०१२३४५६७८९";
  function dynFormat(lang, text, vars) {
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (m, name) {
      if (!Object.prototype.hasOwnProperty.call(vars, name)) return m;
      var v = String(vars[name]);
      if (lang === "ne" && /^\d+$/.test(v) && v !== "0") v = v.replace(/\d/g, function (d) { return NE_DIGITS[Number(d)]; });
      return v;
    });
  }
  window.AponarDynLang = dynLang;
  window.AponarDyn = function (key, vars) {
    var lang = dynLang();
    var row = DYN[key];
    if (!row) return key;
    return dynFormat(lang, row[lang] || row.bn, vars);
  };
  function applyDynAttributes() {
    try {
      var lang = dynLang();
      if (lang === "bn") return;
      var inputs = document.querySelectorAll("[placeholder]");
      for (var i = 0; i < inputs.length; i++) {
        var row = DYN_PLACEHOLDERS_NFC[dynNorm(inputs[i].getAttribute("placeholder"))];
        if (row && row[lang]) inputs[i].setAttribute("placeholder", row[lang]);
      }
      var labelled = document.querySelectorAll("[data-label]");
      for (var j = 0; j < labelled.length; j++) {
        var lrow = DYN_DATA_LABELS_NFC[dynNorm(labelled[j].getAttribute("data-label"))];
        if (lrow && lrow[lang]) labelled[j].setAttribute("data-label", lrow[lang]);
      }
      var titled = document.querySelectorAll("[title]");
      for (var k = 0; k < titled.length; k++) {
        var trow = DYN_TITLES_NFC[dynNorm(titled[k].getAttribute("title"))];
        if (trow && trow[lang]) titled[k].setAttribute("title", trow[lang]);
      }
    } catch (e) { /* attribute localization must never break a page */ }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyDynAttributes);
  else applyDynAttributes();
})();

/* ==== Run 28: inline-data pages (window.AponarRun28) ====
   grammar-vs and Hiragana-Katagana keep their lesson data in inline
   scripts, and the Run 27 pages carry a handful of inline-script UI
   strings; packs cannot reach those. On localized routes only, this
   hook loads the Run 28 data loader (assets/i18n/data/run28-i18n.js),
   which swaps that inline Bengali from per-language sidecars. Bengali
   pages return before anything is loaded and render exactly as
   before. */
(function () {
  "use strict";
  try {
    var lang = window.AponarDynLang ? window.AponarDynLang() : "bn";
    if (!lang || lang === "bn") return;
    var segs = window.location.pathname.split("/").filter(Boolean);
    var stem = segs.length >= 2 ? segs[1] : "";
    var PAGES = {
      "grammar-vs": 1, "Hiragana-Katagana": 1, "admin": 1, "auth": 1,
      "auth-callback": 1, "daily-greetings": 1, "dashboard": 1,
      "delete-account": 1, "directions-emergency": 1,
      "japan-emergency-guide": 1, "japan-google-maps-guide": 1,
      "japan-home-life-guide": 1, "japan-newcomer-guide": 1,
      "japan-part-time-job-guide": 1, "japan-train-platform-guide": 1,
      "japanese-conversation-bangla-ebook": 1, "jpy-bdt-remittance": 1,
      "part-time-cv-builder": 1, "refresh-site": 1, "reset-password": 1,
      "shop-food-phrases": 1, "speak-japanese-today-bangla-ebook": 1,
      "student-tools": 1
    };
    if (!PAGES[stem]) return;
    var start = function () {
      var s = document.createElement("script");
      s.src = "/assets/i18n/data/run28-i18n.js";
      document.head.appendChild(s);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  } catch (e) { /* the Run 28 hook must never break a page */ }
})();

/* Run 34: mock/exam chrome + interview Q&A data (gated sidecars; bn is a strict no-op). */
(function () {
  try {
    var lang = window.AponarDynLang ? window.AponarDynLang() : "bn";
    if (!lang || lang === "bn") return;
    var segs = location.pathname.split("/").filter(Boolean);
    var stem = segs.length ? decodeURIComponent(segs[segs.length - 1]).replace(/\.html$/, "").toLowerCase() : "";
    var STEMS = { "jlpt-exam": 1, "embassy-interview": 1, "part-time-interview": 1, "skype sheet": 1, "interview": 1 };
    if (!STEMS[stem]) return;
    window.AponarExamLang = lang;
    var data = null, ivData = null, ivPromise = null;
    window.AponarExamReady = new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = "/assets/i18n/data/exam." + lang + ".js";
      s.onload = function () { data = window.AponarExamData || {}; resolve(); };
      s.onerror = function () { data = {}; resolve(); };
      document.head.appendChild(s);
    });
    window.AponarExamT = function (t) {
      if (typeof t !== "string" || !data) return t;
      var k = t.normalize("NFC");
      return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : t;
    };
    window.AponarInterviewApply = function (url, d) {
      if (!d || typeof d !== "object") return Promise.resolve(d);
      if (!ivPromise) {
        ivPromise = fetch("/assets/i18n/data/interview." + lang + ".json").then(function (r) { return r.json(); }).then(function (j) { ivData = j || {}; }).catch(function () { ivData = {}; });
      }
      return ivPromise.then(function () {
        var FIELDS = ["topic", "qBn", "qPronBn", "aBn", "aPronBn", "noteBn", "noteHtml"];
        var apply = function (q) {
          if (!q || typeof q !== "object") return;
          for (var i = 0; i < FIELDS.length; i++) {
            var v = q[FIELDS[i]];
            if (typeof v === "string") {
              var k = v.normalize("NFC");
              if (Object.prototype.hasOwnProperty.call(ivData, k)) q[FIELDS[i]] = ivData[k];
            }
          }
        };
        if (Array.isArray(d)) d.forEach(apply);
        else if (Array.isArray(d.questions)) d.questions.forEach(apply);
        else apply(d);
        return d;
      });
    };
  } catch (e) { /* the Run 34 hook must never break a page */ }
})();

  // ---- Run 36: remaining app-JS chrome (profile/auth, halal, muslim map, misc) ----
  (function () {
    try {
      var lang = (window.AponarDynLang && AponarDynLang()) || document.documentElement.lang || 'bn';
      if (!lang || lang === 'bn') return;
      window.AponarAppLang = lang;
      var data = null;
      var src = '';
      try { src = document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/assets\/js\/i18n\.js.*$/, 'assets/i18n/data/app.' + lang + '.js') : ''; } catch (e) {}
      if (!src) src = '/assets/i18n/data/app.' + lang + '.js';
      window.AponarAppReady = new Promise(function (resolve) {
        var s = document.createElement('script');
        s.src = src; s.async = true;
        s.onload = function () { data = window.AponarAppData || null; resolve(data); };
        s.onerror = function () { resolve(null); };
        (document.head || document.documentElement).appendChild(s);
      });
      window.AponarAppT = function (s) {
        try {
          if (data && typeof s === 'string') {
            var k = s.normalize('NFC');
            if (Object.prototype.hasOwnProperty.call(data, k)) return data[k];
          }
        } catch (e) {}
        return s;
      };
    } catch (e) {}
  })();
