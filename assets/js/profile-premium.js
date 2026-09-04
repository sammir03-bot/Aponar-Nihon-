(()=>{
  'use strict';

  const $=id=>document.getElementById(id);
  const MAX_AVATAR_BYTES=2*1024*1024;
  const ALLOWED_AVATAR_TYPES=['image/jpeg','image/png','image/webp'];
  const STORAGE_KEY='aponarNihonLanguage';
  let session=null;
  let profile=null;
  let pendingAvatarFile=null;
  let previewObjectUrl='';
  let avatarUrl='';
  let saving=false;
  let toastTimer=null;

  const BASE={
    brandTag:'জাপানি শেখার পূর্ণাঙ্গ প্ল্যাটফর্ম',home:'হোম',account:'অ্যাকাউন্ট',logout:'লগআউট',admin:'অ্যাডমিন',
    profileEyebrow:'STUDENT PROFILE',verified:'ইমেইল ভেরিফাইড',unverified:'ইমেইল ভেরিফাই হয়নি',completion:'Profile completion',completionNote:'প্রয়োজনীয় তথ্য পূরণ করলে 100% হবে',
    checkName:'নাম',checkSchool:'স্কুল',checkLocation:'লোকেশন',checkJlpt:'JLPT',checkGoal:'লক্ষ্য',checkDob:'জন্মতারিখ',
    updateTitle:'প্রোফাইল আপডেট',updateSub:'তথ্যগুলো ঠিক করে নিরাপদভাবে Save করুন',
    personalTitle:'ব্যক্তিগত তথ্য',personalSub:'আপনার মূল পরিচিতি',fullName:'পুরো নাম',dob:'জন্মতারিখ',gender:'লিঙ্গ',select:'নির্বাচন করুন',male:'পুরুষ',female:'নারী',preferNot:'বলতে চাই না',nationality:'জাতীয়তা',
    studyTitle:'পড়াশোনা ও JLPT',studySub:'আপনার স্কুল ও শেখার লক্ষ্য',school:'স্কুল / প্রতিষ্ঠান',jlpt:'JLPT Target',dailyStudy:'দৈনিক পড়ার সময়',studyGoal:'Study Goal',
    contactTitle:'যোগাযোগ ও অবস্থান',contactSub:'বর্তমান যোগাযোগের তথ্য',city:'বর্তমান City',phone:'ফোন নম্বর',optional:'ঐচ্ছিক',
    aboutTitle:'নিজের সম্পর্কে',aboutSub:'সংক্ষিপ্ত learning profile',bio:'Bio / Learning journey',
    cancel:'বাতিল',save:'Save',saveHome:'Save & Home',saving:'Saving…',
    photoTitle:'Profile Photo',photoSub:'নিজের ছবি যোগ বা পরিবর্তন করুন',choosePhoto:'ছবি বেছে নিন',accountPhoto:'Account photo ব্যবহার',photoNote:'JPG, PNG বা WebP · সর্বোচ্চ 2 MB',
    securityTitle:'Account & Security',email:'ইমেইল',provider:'Login provider',language:'Website language',changeHome:'ভাষা Home থেকে পরিবর্তন করা যায়',
    learningTitle:'My Learning',activities:'Activities',activeDays:'Active days',progressItems:'Progress items',lastActive:'Last active',recentTitle:'Recent Activity',
    dangerTitle:'Danger Zone',deleteAccount:'Delete Account',dangerNote:'অ্যাকাউন্ট মুছলে আপনার profile ও learning data স্থায়ীভাবে মুছে যেতে পারে।',openDelete:'Delete options খুলুন',
    loading:'Profile load হচ্ছে…',emptyActivity:'এখনও activity নেই। শেখা শুরু করলে এখানে দেখা যাবে।',activityError:'Activity load করা যায়নি।',
    saved:'Profile সফলভাবে save হয়েছে ✓',savedHome:'Profile save হয়েছে ✓ হোমে নিয়ে যাচ্ছি…',saveError:'Profile save করা যায়নি।',loadError:'Profile load করা যায়নি।',
    required:'এই তথ্যটি প্রয়োজন।',nameShort:'নাম কমপক্ষে ২ অক্ষরের দিন।',invalidPhone:'ফোন নম্বরটি ঠিকভাবে লিখুন।',invalidDate:'সঠিক জন্মতারিখ দিন।',tooLarge:'ছবিটি 2 MB-এর কম হতে হবে।',invalidType:'শুধু JPG, PNG বা WebP ছবি ব্যবহার করুন।',uploadError:'ছবি upload করা যায়নি।',verifiedToast:'ইমেইল verification সফল হয়েছে ✓',
    min15:'15 মিনিট',min30:'30 মিনিট',min45:'45 মিনিট',min60:'1 ঘণ্টা',min90:'1.5 ঘণ্টা',min120:'2 ঘণ্টা'
  };

  const I18N={
    bn:{},
    en:{brandTag:'Complete Japanese learning platform',home:'Home',account:'Account',logout:'Logout',admin:'Admin',profileEyebrow:'STUDENT PROFILE',verified:'Email verified',unverified:'Email not verified',completion:'Profile completion',completionNote:'Complete the key fields to reach 100%',checkName:'Name',checkSchool:'School',checkLocation:'Location',checkJlpt:'JLPT',checkGoal:'Goal',checkDob:'Birthday',updateTitle:'Update profile',updateSub:'Review your details and save securely',personalTitle:'Personal information',personalSub:'Your basic profile details',fullName:'Full name',dob:'Date of birth',gender:'Gender',select:'Select',male:'Male',female:'Female',preferNot:'Prefer not to say',nationality:'Nationality',studyTitle:'Study & JLPT',studySub:'School and learning goals',school:'School / Institution',jlpt:'JLPT Target',dailyStudy:'Daily study time',studyGoal:'Study goal',contactTitle:'Contact & location',contactSub:'Your current contact details',city:'Current city',phone:'Phone number',optional:'Optional',aboutTitle:'About you',aboutSub:'A short learning profile',bio:'Bio / Learning journey',cancel:'Cancel',save:'Save',saveHome:'Save & Home',saving:'Saving…',photoTitle:'Profile photo',photoSub:'Add or change your photo',choosePhoto:'Choose photo',accountPhoto:'Use account photo',photoNote:'JPG, PNG or WebP · max 2 MB',securityTitle:'Account & Security',email:'Email',provider:'Login provider',language:'Website language',changeHome:'Change language from Home',learningTitle:'My Learning',activities:'Activities',activeDays:'Active days',progressItems:'Progress items',lastActive:'Last active',recentTitle:'Recent activity',dangerTitle:'Danger zone',deleteAccount:'Delete account',dangerNote:'Deleting your account may permanently remove your profile and learning data.',openDelete:'Open delete options',loading:'Loading profile…',emptyActivity:'No activity yet. Start learning and it will appear here.',activityError:'Could not load activity.',saved:'Profile saved successfully ✓',savedHome:'Profile saved ✓ Taking you home…',saveError:'Could not save profile.',loadError:'Could not load profile.',required:'This field is required.',nameShort:'Enter at least 2 characters.',invalidPhone:'Enter a valid phone number.',invalidDate:'Enter a valid date of birth.',tooLarge:'Photo must be under 2 MB.',invalidType:'Use JPG, PNG or WebP only.',uploadError:'Could not upload the photo.',verifiedToast:'Email verification completed ✓',min15:'15 min',min30:'30 min',min45:'45 min',min60:'1 hour',min90:'1.5 hours',min120:'2 hours'},
    ja:{brandTag:'日本語学習の総合プラットフォーム',home:'ホーム',account:'アカウント',logout:'ログアウト',admin:'管理者',verified:'メール確認済み',unverified:'メール未確認',completion:'プロフィール完成度',completionNote:'必要な情報を入力すると100%になります',checkName:'名前',checkSchool:'学校',checkLocation:'居住地',checkJlpt:'JLPT',checkGoal:'目標',checkDob:'生年月日',updateTitle:'プロフィール更新',updateSub:'内容を確認して安全に保存します',personalTitle:'個人情報',personalSub:'基本プロフィール',fullName:'氏名',dob:'生年月日',gender:'性別',select:'選択してください',male:'男性',female:'女性',preferNot:'回答しない',nationality:'国籍',studyTitle:'学習・JLPT',studySub:'学校と学習目標',school:'学校 / 教育機関',jlpt:'JLPT目標',dailyStudy:'1日の学習時間',studyGoal:'学習目標',contactTitle:'連絡先・居住地',contactSub:'現在の連絡情報',city:'現在の市区町村',phone:'電話番号',optional:'任意',aboutTitle:'自己紹介',aboutSub:'学習プロフィール',bio:'自己紹介 / 学習履歴',cancel:'キャンセル',save:'保存',saveHome:'保存してホームへ',saving:'保存中…',photoTitle:'プロフィール写真',photoSub:'写真を追加・変更',choosePhoto:'写真を選ぶ',accountPhoto:'アカウント写真を使用',photoNote:'JPG・PNG・WebP · 最大2MB',securityTitle:'アカウントとセキュリティ',email:'メール',provider:'ログイン方法',language:'サイト言語',changeHome:'言語はホームから変更できます',learningTitle:'学習状況',activities:'アクティビティ',activeDays:'学習日数',progressItems:'進捗項目',lastActive:'最終利用',recentTitle:'最近のアクティビティ',dangerTitle:'重要な操作',deleteAccount:'アカウント削除',dangerNote:'アカウントを削除するとプロフィールや学習データが完全に削除される場合があります。',openDelete:'削除オプションを開く',loading:'プロフィールを読み込み中…',emptyActivity:'まだアクティビティがありません。学習を始めると表示されます。',activityError:'アクティビティを読み込めませんでした。',saved:'プロフィールを保存しました ✓',savedHome:'保存しました ✓ ホームへ移動します…',saveError:'プロフィールを保存できませんでした。',loadError:'プロフィールを読み込めませんでした。',required:'この項目は必須です。',nameShort:'2文字以上で入力してください。',invalidPhone:'正しい電話番号を入力してください。',invalidDate:'正しい生年月日を入力してください。',tooLarge:'写真は2MB未満にしてください。',invalidType:'JPG・PNG・WebPのみ使用できます。',uploadError:'写真をアップロードできませんでした。',verifiedToast:'メール確認が完了しました ✓',min15:'15分',min30:'30分',min45:'45分',min60:'1時間',min90:'1.5時間',min120:'2時間'},
    hi:{home:'होम',account:'अकाउंट',logout:'लॉग आउट',admin:'एडमिन',verified:'ईमेल सत्यापित',unverified:'ईमेल सत्यापित नहीं',completion:'प्रोफ़ाइल पूर्णता',completionNote:'ज़रूरी जानकारी भरकर 100% पूरा करें',checkName:'नाम',checkSchool:'स्कूल',checkLocation:'स्थान',checkJlpt:'JLPT',checkGoal:'लक्ष्य',checkDob:'जन्मतिथि',updateTitle:'प्रोफ़ाइल अपडेट',updateSub:'जानकारी जाँचें और सुरक्षित रूप से सेव करें',personalTitle:'व्यक्तिगत जानकारी',fullName:'पूरा नाम',dob:'जन्मतिथि',gender:'लिंग',select:'चुनें',male:'पुरुष',female:'महिला',preferNot:'नहीं बताना',nationality:'राष्ट्रीयता',studyTitle:'पढ़ाई और JLPT',school:'स्कूल / संस्थान',jlpt:'JLPT लक्ष्य',dailyStudy:'दैनिक अध्ययन समय',studyGoal:'अध्ययन लक्ष्य',contactTitle:'संपर्क और स्थान',city:'वर्तमान शहर',phone:'फ़ोन नंबर',optional:'वैकल्पिक',aboutTitle:'आपके बारे में',bio:'परिचय / सीखने की यात्रा',cancel:'रद्द करें',save:'सेव',saveHome:'सेव और होम',saving:'सेव हो रहा है…',photoTitle:'प्रोफ़ाइल फोटो',choosePhoto:'फोटो चुनें',accountPhoto:'अकाउंट फोटो इस्तेमाल करें',securityTitle:'अकाउंट और सुरक्षा',email:'ईमेल',provider:'लॉगिन प्रदाता',language:'वेबसाइट भाषा',learningTitle:'मेरी पढ़ाई',activities:'गतिविधियाँ',activeDays:'सक्रिय दिन',progressItems:'प्रगति आइटम',lastActive:'अंतिम सक्रिय',recentTitle:'हाल की गतिविधि',dangerTitle:'डेंजर ज़ोन',deleteAccount:'अकाउंट हटाएँ',openDelete:'डिलीट विकल्प खोलें',loading:'प्रोफ़ाइल लोड हो रही है…',saved:'प्रोफ़ाइल सेव हुई ✓',saveError:'प्रोफ़ाइल सेव नहीं हुई।',required:'यह जानकारी आवश्यक है।'},
    ne:{home:'होम',account:'खाता',logout:'लगआउट',admin:'एडमिन',verified:'इमेल प्रमाणित',unverified:'इमेल प्रमाणित छैन',completion:'प्रोफाइल पूर्णता',checkName:'नाम',checkSchool:'स्कुल',checkLocation:'स्थान',checkJlpt:'JLPT',checkGoal:'लक्ष्य',checkDob:'जन्ममिति',updateTitle:'प्रोफाइल अपडेट',fullName:'पूरा नाम',dob:'जन्ममिति',gender:'लिङ्ग',select:'छान्नुहोस्',male:'पुरुष',female:'महिला',preferNot:'भन्न चाहन्न',nationality:'राष्ट्रियता',studyTitle:'अध्ययन र JLPT',school:'स्कुल / संस्था',jlpt:'JLPT लक्ष्य',dailyStudy:'दैनिक अध्ययन समय',studyGoal:'अध्ययन लक्ष्य',contactTitle:'सम्पर्क र स्थान',city:'हालको सहर',phone:'फोन नम्बर',optional:'ऐच्छिक',aboutTitle:'आफ्नो बारेमा',bio:'परिचय / सिकाइ यात्रा',cancel:'रद्द',save:'सेभ',saveHome:'सेभ र होम',saving:'सेभ हुँदैछ…',photoTitle:'प्रोफाइल फोटो',choosePhoto:'फोटो छान्नुहोस्',accountPhoto:'खाताको फोटो प्रयोग',securityTitle:'खाता र सुरक्षा',email:'इमेल',provider:'लगइन प्रदायक',language:'वेबसाइट भाषा',learningTitle:'मेरो अध्ययन',activities:'गतिविधि',activeDays:'सक्रिय दिन',progressItems:'प्रगति',lastActive:'अन्तिम सक्रिय',recentTitle:'हालको गतिविधि',dangerTitle:'जोखिम क्षेत्र',deleteAccount:'खाता मेटाउनुहोस्',openDelete:'मेटाउने विकल्प खोल्नुहोस्',loading:'प्रोफाइल लोड हुँदैछ…',saved:'प्रोफाइल सेभ भयो ✓',saveError:'प्रोफाइल सेभ हुन सकेन।',required:'यो जानकारी आवश्यक छ।'},
    ur:{home:'ہوم',account:'اکاؤنٹ',logout:'لاگ آؤٹ',admin:'ایڈمن',verified:'ای میل تصدیق شدہ',unverified:'ای میل تصدیق نہیں ہوئی',completion:'پروفائل تکمیل',checkName:'نام',checkSchool:'اسکول',checkLocation:'مقام',checkJlpt:'JLPT',checkGoal:'ہدف',checkDob:'تاریخ پیدائش',updateTitle:'پروفائل اپڈیٹ',fullName:'پورا نام',dob:'تاریخ پیدائش',gender:'جنس',select:'منتخب کریں',male:'مرد',female:'عورت',preferNot:'نہیں بتانا',nationality:'قومیت',studyTitle:'تعلیم اور JLPT',school:'اسکول / ادارہ',jlpt:'JLPT ہدف',dailyStudy:'روزانہ مطالعہ',studyGoal:'مطالعہ کا ہدف',contactTitle:'رابطہ اور مقام',city:'موجودہ شہر',phone:'فون نمبر',optional:'اختیاری',aboutTitle:'آپ کے بارے میں',bio:'تعارف / سیکھنے کا سفر',cancel:'منسوخ',save:'محفوظ کریں',saveHome:'محفوظ کریں اور ہوم',saving:'محفوظ ہو رہا ہے…',photoTitle:'پروفائل تصویر',choosePhoto:'تصویر منتخب کریں',accountPhoto:'اکاؤنٹ تصویر استعمال کریں',securityTitle:'اکاؤنٹ اور سیکیورٹی',email:'ای میل',provider:'لاگ ان طریقہ',language:'ویب سائٹ زبان',learningTitle:'میری تعلیم',activities:'سرگرمیاں',activeDays:'فعال دن',progressItems:'پیش رفت',lastActive:'آخری سرگرمی',recentTitle:'حالیہ سرگرمی',dangerTitle:'خطرہ زون',deleteAccount:'اکاؤنٹ حذف کریں',openDelete:'حذف کے اختیارات',loading:'پروفائل لوڈ ہو رہا ہے…',saved:'پروفائل محفوظ ہوگیا ✓',saveError:'پروفائل محفوظ نہیں ہوا۔',required:'یہ معلومات ضروری ہے۔'},
    vi:{home:'Trang chủ',account:'Tài khoản',logout:'Đăng xuất',admin:'Quản trị',verified:'Email đã xác minh',unverified:'Email chưa xác minh',completion:'Hoàn thiện hồ sơ',checkName:'Tên',checkSchool:'Trường',checkLocation:'Địa điểm',checkJlpt:'JLPT',checkGoal:'Mục tiêu',checkDob:'Ngày sinh',updateTitle:'Cập nhật hồ sơ',fullName:'Họ và tên',dob:'Ngày sinh',gender:'Giới tính',select:'Chọn',male:'Nam',female:'Nữ',preferNot:'Không muốn trả lời',nationality:'Quốc tịch',studyTitle:'Học tập & JLPT',school:'Trường / Cơ sở',jlpt:'Mục tiêu JLPT',dailyStudy:'Thời gian học mỗi ngày',studyGoal:'Mục tiêu học tập',contactTitle:'Liên hệ & địa điểm',city:'Thành phố hiện tại',phone:'Số điện thoại',optional:'Không bắt buộc',aboutTitle:'Giới thiệu',bio:'Tiểu sử / Hành trình học',cancel:'Hủy',save:'Lưu',saveHome:'Lưu & Trang chủ',saving:'Đang lưu…',photoTitle:'Ảnh hồ sơ',choosePhoto:'Chọn ảnh',accountPhoto:'Dùng ảnh tài khoản',securityTitle:'Tài khoản & Bảo mật',email:'Email',provider:'Phương thức đăng nhập',language:'Ngôn ngữ website',learningTitle:'Việc học của tôi',activities:'Hoạt động',activeDays:'Ngày hoạt động',progressItems:'Tiến độ',lastActive:'Lần cuối',recentTitle:'Hoạt động gần đây',dangerTitle:'Vùng nguy hiểm',deleteAccount:'Xóa tài khoản',openDelete:'Mở tùy chọn xóa',loading:'Đang tải hồ sơ…',saved:'Đã lưu hồ sơ ✓',saveError:'Không thể lưu hồ sơ.',required:'Thông tin này là bắt buộc.'},
    zh:{home:'主页',account:'账户',logout:'退出登录',admin:'管理',verified:'邮箱已验证',unverified:'邮箱未验证',completion:'资料完成度',checkName:'姓名',checkSchool:'学校',checkLocation:'所在地',checkJlpt:'JLPT',checkGoal:'目标',checkDob:'出生日期',updateTitle:'更新个人资料',fullName:'姓名',dob:'出生日期',gender:'性别',select:'请选择',male:'男',female:'女',preferNot:'不愿透露',nationality:'国籍',studyTitle:'学习与 JLPT',school:'学校 / 机构',jlpt:'JLPT 目标',dailyStudy:'每日学习时间',studyGoal:'学习目标',contactTitle:'联系方式与所在地',city:'当前城市',phone:'电话号码',optional:'可选',aboutTitle:'关于你',bio:'简介 / 学习经历',cancel:'取消',save:'保存',saveHome:'保存并返回主页',saving:'保存中…',photoTitle:'头像',choosePhoto:'选择照片',accountPhoto:'使用账户头像',securityTitle:'账户与安全',email:'邮箱',provider:'登录方式',language:'网站语言',learningTitle:'我的学习',activities:'活动',activeDays:'活跃天数',progressItems:'进度项目',lastActive:'最后活跃',recentTitle:'最近活动',dangerTitle:'危险操作',deleteAccount:'删除账户',openDelete:'打开删除选项',loading:'正在加载资料…',saved:'资料已保存 ✓',saveError:'无法保存资料。',required:'此项为必填。'},
    my:{home:'ပင်မ',account:'အကောင့်',logout:'ထွက်ရန်',admin:'အက်ဒမင်',verified:'အီးမေးလ် အတည်ပြုပြီး',unverified:'အီးမေးလ် မအတည်ပြုရသေး',completion:'ပရိုဖိုင် ပြည့်စုံမှု',checkName:'အမည်',checkSchool:'ကျောင်း',checkLocation:'နေရာ',checkJlpt:'JLPT',checkGoal:'ရည်မှန်းချက်',checkDob:'မွေးနေ့',updateTitle:'ပရိုဖိုင် ပြင်ဆင်ရန်',fullName:'အမည်အပြည့်အစုံ',dob:'မွေးသက္ကရာဇ်',gender:'ကျား/မ',select:'ရွေးချယ်ပါ',male:'ကျား',female:'မ',preferNot:'မဖြေလိုပါ',nationality:'နိုင်ငံသား',studyTitle:'စာသင် & JLPT',school:'ကျောင်း / အဖွဲ့အစည်း',jlpt:'JLPT ရည်မှန်းချက်',dailyStudy:'နေ့စဉ်လေ့လာချိန်',studyGoal:'လေ့လာရေး ရည်မှန်းချက်',contactTitle:'ဆက်သွယ်ရန် & နေရာ',city:'လက်ရှိမြို့',phone:'ဖုန်းနံပါတ်',optional:'ရွေးချယ်နိုင်',aboutTitle:'သင့်အကြောင်း',bio:'ကိုယ်ရေး / လေ့လာမှုခရီး',cancel:'ပယ်ဖျက်',save:'သိမ်းမည်',saveHome:'သိမ်းပြီး ပင်မသို့',saving:'သိမ်းနေသည်…',photoTitle:'ပရိုဖိုင်ပုံ',choosePhoto:'ပုံရွေးပါ',accountPhoto:'အကောင့်ပုံသုံးပါ',securityTitle:'အကောင့် & လုံခြုံရေး',email:'အီးမေးလ်',provider:'ဝင်ရောက်နည်း',language:'ဝဘ်ဆိုက်ဘာသာစကား',learningTitle:'ကျွန်ုပ်၏လေ့လာမှု',activities:'လုပ်ဆောင်မှု',activeDays:'တက်ကြွရက်',progressItems:'တိုးတက်မှု',lastActive:'နောက်ဆုံးသုံးချိန်',recentTitle:'မကြာသေးမီလုပ်ဆောင်မှု',dangerTitle:'သတိထားရန်',deleteAccount:'အကောင့်ဖျက်ရန်',openDelete:'ဖျက်ရန်ရွေးချယ်မှု',loading:'ပရိုဖိုင်ဖွင့်နေသည်…',saved:'ပရိုဖိုင်သိမ်းပြီး ✓',saveError:'ပရိုဖိုင် မသိမ်းနိုင်ပါ။',required:'ဤအချက်လိုအပ်သည်။'},
    si:{home:'මුල් පිටුව',account:'ගිණුම',logout:'ඉවත් වන්න',admin:'පරිපාලක',verified:'ඊමේල් තහවුරුයි',unverified:'ඊමේල් තහවුරු කර නැත',completion:'පැතිකඩ සම්පූර්ණතාව',checkName:'නම',checkSchool:'පාසල',checkLocation:'ස්ථානය',checkJlpt:'JLPT',checkGoal:'ඉලක්කය',checkDob:'උපන්දිනය',updateTitle:'පැතිකඩ යාවත්කාලීන කරන්න',fullName:'සම්පූර්ණ නම',dob:'උපන්දිනය',gender:'ස්ත්‍රී/පුරුෂ භාවය',select:'තෝරන්න',male:'පුරුෂ',female:'ස්ත්‍රී',preferNot:'කියන්න කැමති නැත',nationality:'ජාතිකත්වය',studyTitle:'අධ්‍යයනය සහ JLPT',school:'පාසල / ආයතනය',jlpt:'JLPT ඉලක්කය',dailyStudy:'දෛනික අධ්‍යයන කාලය',studyGoal:'අධ්‍යයන ඉලක්කය',contactTitle:'සම්බන්ධතා සහ ස්ථානය',city:'වත්මන් නගරය',phone:'දුරකථන අංකය',optional:'විකල්ප',aboutTitle:'ඔබ ගැන',bio:'හැඳින්වීම / ඉගෙනුම් ගමන',cancel:'අවලංගු',save:'සුරකින්න',saveHome:'සුරකින්න සහ මුල් පිටුව',saving:'සුරකිමින්…',photoTitle:'පැතිකඩ ඡායාරූපය',choosePhoto:'ඡායාරූපයක් තෝරන්න',accountPhoto:'ගිණුම් ඡායාරූපය භාවිතා කරන්න',securityTitle:'ගිණුම සහ ආරක්ෂාව',email:'ඊමේල්',provider:'පිවිසුම් ක්‍රමය',language:'වෙබ් අඩවි භාෂාව',learningTitle:'මගේ ඉගෙනීම',activities:'ක්‍රියාකාරකම්',activeDays:'සක්‍රීය දින',progressItems:'ප්‍රගතිය',lastActive:'අවසන් සක්‍රීය',recentTitle:'මෑත ක්‍රියාකාරකම්',dangerTitle:'අවදානම් කලාපය',deleteAccount:'ගිණුම මකන්න',openDelete:'මකාදැමීමේ විකල්ප',loading:'පැතිකඩ පූරණය වෙමින්…',saved:'පැතිකඩ සුරකින ලදී ✓',saveError:'පැතිකඩ සුරැකීමට නොහැකි විය.',required:'මෙම තොරතුර අවශ්‍යයි.'},
    fil:{home:'Home',account:'Account',logout:'Mag-log out',admin:'Admin',verified:'Beripikado ang email',unverified:'Hindi pa beripikado ang email',completion:'Pagkumpleto ng profile',checkName:'Pangalan',checkSchool:'Paaralan',checkLocation:'Lokasyon',checkJlpt:'JLPT',checkGoal:'Layunin',checkDob:'Kaarawan',updateTitle:'I-update ang profile',fullName:'Buong pangalan',dob:'Petsa ng kapanganakan',gender:'Kasarian',select:'Pumili',male:'Lalaki',female:'Babae',preferNot:'Ayaw sabihin',nationality:'Nasyonalidad',studyTitle:'Pag-aaral at JLPT',school:'Paaralan / Institusyon',jlpt:'JLPT Target',dailyStudy:'Araw-araw na oras ng pag-aaral',studyGoal:'Layunin sa pag-aaral',contactTitle:'Contact at lokasyon',city:'Kasalukuyang lungsod',phone:'Numero ng telepono',optional:'Opsyonal',aboutTitle:'Tungkol sa iyo',bio:'Bio / Learning journey',cancel:'Kanselahin',save:'I-save',saveHome:'I-save at Home',saving:'Sine-save…',photoTitle:'Profile photo',choosePhoto:'Pumili ng larawan',accountPhoto:'Gamitin ang account photo',securityTitle:'Account at Security',email:'Email',provider:'Login provider',language:'Wika ng website',learningTitle:'Aking pag-aaral',activities:'Activities',activeDays:'Active days',progressItems:'Progress items',lastActive:'Last active',recentTitle:'Recent activity',dangerTitle:'Danger zone',deleteAccount:'I-delete ang account',openDelete:'Buksan ang delete options',loading:'Nilo-load ang profile…',saved:'Na-save ang profile ✓',saveError:'Hindi ma-save ang profile.',required:'Kailangan ang impormasyong ito.'}
  };

  const languageCode=()=>{
    const code=(document.documentElement.dataset.language||localStorage.getItem(STORAGE_KEY)||'bn').toLowerCase();
    return I18N[code]?code:'en';
  };
  const t=key=>Object.prototype.hasOwnProperty.call(I18N[languageCode()]||{},key)?I18N[languageCode()][key]:BASE[key]||key;

  function applyTranslations(){
    document.querySelectorAll('[data-t]').forEach(el=>{const key=el.dataset.t;if(key)el.textContent=t(key)});
    document.querySelectorAll('[data-t-placeholder]').forEach(el=>{const key=el.dataset.tPlaceholder;if(key)el.setAttribute('placeholder',t(key))});
    document.querySelectorAll('[data-t-aria]').forEach(el=>{const key=el.dataset.tAria;if(key)el.setAttribute('aria-label',t(key))});
    const languageName={bn:'বাংলা',en:'English',ja:'日本語',vi:'Tiếng Việt',ne:'नेपाली',hi:'हिन्दी',ur:'اردو',my:'မြန်မာ',zh:'中文',si:'සිංහල',fil:'Filipino'}[languageCode()]||'English';
    if($('languageValue'))$('languageValue').textContent=languageName;
  }

  function toast(message,bad=false){
    const el=$('toast');
    if(!el)return;
    clearTimeout(toastTimer);
    el.textContent=message;
    el.className='toast show'+(bad?' bad':'');
    toastTimer=setTimeout(()=>{el.className='toast'},2600);
  }

  function initials(name){
    return (name||'Student').trim().split(/\s+/).slice(0,2).map(part=>part[0]||'').join('').toUpperCase()||'S';
  }

  function accountPhoto(){
    const meta=session?.user?.user_metadata||{};
    return String(meta.avatar_url||meta.picture||'').trim();
  }

  function setAvatar(url,name){
    const targets=[[$('avatarPreview'),$('avatarFallback')],[$('sideAvatarPreview'),$('sideAvatarFallback')]];
    targets.forEach(([img,fallback])=>{
      if(!img||!fallback)return;
      if(url){
        img.src=url;
        img.style.display='block';
        fallback.style.display='none';
        img.onerror=()=>{img.style.display='none';fallback.style.display='grid';fallback.textContent=initials(name)};
      }else{
        img.removeAttribute('src');img.style.display='none';fallback.style.display='grid';fallback.textContent=initials(name);
      }
    });
  }

  function fieldValue(id){return String($(id)?.value||'').trim()}

  function updateHero(){
    const name=fieldValue('name')||'Student';
    $('heroName').textContent=name;
    $('heroEmail').textContent=session?.user?.email||'';
    $('levelBadge').textContent='JLPT '+(fieldValue('level')||'N5');
    const displayUrl=previewObjectUrl||avatarUrl||accountPhoto();
    setAvatar(displayUrl,name);
    updateCompletion();
  }

  function completionState(){
    const parts={
      name:fieldValue('name').length>=2,
      school:!!fieldValue('school'),
      location:!!fieldValue('nationality')&&!!fieldValue('city'),
      jlpt:!!fieldValue('level'),
      goal:!!fieldValue('goal'),
      dob:!!fieldValue('dateOfBirth')
    };
    const score=Math.round(Object.values(parts).filter(Boolean).length/Object.keys(parts).length*100);
    return {parts,score};
  }

  function updateCompletion(){
    const {parts,score}=completionState();
    $('completionText').textContent=score+'%';
    $('progressRing').style.setProperty('--progress',score);
    Object.entries(parts).forEach(([key,done])=>{
      const el=document.querySelector(`[data-check="${key}"]`);
      if(el)el.classList.toggle('done',done);
    });
  }

  function clearErrors(){
    document.querySelectorAll('.control.invalid').forEach(el=>el.classList.remove('invalid'));
    document.querySelectorAll('[data-error-for]').forEach(el=>{el.textContent=''});
  }

  function setError(id,message){
    const input=$(id);const error=document.querySelector(`[data-error-for="${id}"]`);
    if(input)input.classList.add('invalid');
    if(error)error.textContent=message;
  }

  function validate(){
    clearErrors();
    let valid=true;
    const name=fieldValue('name');
    if(!name){setError('name',t('required'));valid=false}else if(name.length<2){setError('name',t('nameShort'));valid=false}
    const dob=fieldValue('dateOfBirth');
    if(dob){
      const date=new Date(dob+'T00:00:00');
      const now=new Date();
      const min=new Date('1900-01-01T00:00:00');
      if(Number.isNaN(date.getTime())||date>now||date<min){setError('dateOfBirth',t('invalidDate'));valid=false}
    }
    const phone=fieldValue('phone');
    if(phone&&!/^[0-9+()\-\s]{7,24}$/.test(phone)){setError('phone',t('invalidPhone'));valid=false}
    const limits={school:120,nationality:60,city:80,goal:500,bio:800};
    for(const [id,max] of Object.entries(limits)){
      if(fieldValue(id).length>max){setError(id,`Max ${max}`);valid=false}
    }
    if(!valid){document.querySelector('.control.invalid')?.focus({preventScroll:false})}
    return valid;
  }

  function selectAvatar(file){
    if(!file)return;
    if(!ALLOWED_AVATAR_TYPES.includes(file.type)){toast(t('invalidType'),true);$('avatarFile').value='';return}
    if(file.size>MAX_AVATAR_BYTES){toast(t('tooLarge'),true);$('avatarFile').value='';return}
    if(previewObjectUrl)URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl=URL.createObjectURL(file);
    pendingAvatarFile=file;
    updateHero();
  }

  async function uploadAvatar(){
    if(!pendingAvatarFile)return avatarUrl;
    try{
      const path=`${session.user.id}/avatar`;
      const {error}=await AN.sb.storage.from('avatars').upload(path,pendingAvatarFile,{upsert:true,contentType:pendingAvatarFile.type,cacheControl:'3600'});
      if(error)throw error;
      const {data}=AN.sb.storage.from('avatars').getPublicUrl(path);
      if(!data?.publicUrl)throw new Error('Public URL unavailable');
      return `${data.publicUrl}?v=${Date.now()}`;
    }catch(error){
      console.error('avatar upload',error);
      throw new Error(t('uploadError'));
    }
  }

  function collectValues(finalAvatarUrl){
    return {
      full_name:fieldValue('name'),
      school:fieldValue('school')||null,
      nationality:fieldValue('nationality')||null,
      city:fieldValue('city')||null,
      phone:fieldValue('phone')||null,
      jlpt_target:fieldValue('level')||'N5',
      study_goal:fieldValue('goal')||null,
      daily_study_minutes:Number(fieldValue('minutes'))||30,
      preferred_language:languageCode(),
      avatar_url:finalAvatarUrl||null,
      bio:fieldValue('bio')||null,
      date_of_birth:fieldValue('dateOfBirth')||null,
      gender:fieldValue('gender')||null,
      updated_at:new Date().toISOString(),
      last_active_at:new Date().toISOString()
    };
  }

  function setSavingState(on){
    saving=on;
    ['saveBtn','saveHomeBtn'].forEach(id=>{if($(id))$(id).disabled=on});
    if($('saveBtn'))$('saveBtn').textContent=on?t('saving'):t('save');
    if($('saveHomeBtn'))$('saveHomeBtn').textContent=on?t('saving'):t('saveHome');
  }

  async function save(goHome){
    if(saving||!validate())return;
    setSavingState(true);
    try{
      const finalAvatarUrl=await uploadAvatar();
      const values=collectValues(finalAvatarUrl);
      const {data,error}=await AN.sb.from('profiles').update(values).eq('id',session.user.id).select('*').single();
      if(error)throw error;
      profile=data;
      avatarUrl=data?.avatar_url||'';
      pendingAvatarFile=null;
      if(previewObjectUrl){URL.revokeObjectURL(previewObjectUrl);previewObjectUrl=''}
      window.dispatchEvent(new CustomEvent('an-profile-updated',{detail:data}));
      AN.log('profile_update',{module:'profile'}).catch(()=>{});
      updateHero();
      toast(goHome?t('savedHome'):t('saved'));
      if(goHome)setTimeout(()=>location.replace('/'),750);
    }catch(error){
      console.error('profile save',error);
      toast(error?.message||t('saveError'),true);
    }finally{
      if(!goHome)setSavingState(false);
    }
  }

  function activityLabel(value){return String(value||'activity').replaceAll('_',' ')}

  async function loadActivity(){
    try{
      const {data:items=[],error}=await AN.sb.from('activity_events').select('event_type,page,metadata,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(30);
      if(error)throw error;
      $('events').textContent=String(items.length);
      $('days').textContent=String(new Set(items.map(item=>String(item.created_at||'').slice(0,10)).filter(Boolean)).size);
      $('last').textContent=items[0]?.created_at?new Date(items[0].created_at).toLocaleDateString(languageCode(),{day:'2-digit',month:'short'}):'—';
      const list=$('activity');
      list.textContent='';
      if(!items.length){const empty=document.createElement('div');empty.className='empty';empty.textContent=t('emptyActivity');list.appendChild(empty)}
      else items.slice(0,10).forEach(item=>{
        const row=document.createElement('div');row.className='activity';
        const title=document.createElement('b');title.textContent=activityLabel(item.event_type);
        const meta=item.metadata&&typeof item.metadata==='object'?item.metadata:{};
        const where=[meta.module,meta.item_key].filter(Boolean).map(String).join(' · ')||String(item.page||'');
        const small=document.createElement('small');small.textContent=`${where}${where?' · ':''}${new Date(item.created_at).toLocaleString(languageCode())}`;
        row.append(title,small);list.appendChild(row);
      });
    }catch(error){
      console.debug('activity',error);
      $('activity').innerHTML='';
      const empty=document.createElement('div');empty.className='empty';empty.textContent=t('activityError');$('activity').appendChild(empty);
    }
    try{
      const {data=[]}=await AN.sb.from('student_progress').select('item_key').eq('user_id',session.user.id);
      $('progressCount').textContent=String(data?.length||0);
    }catch(_){$('progressCount').textContent='0'}
  }

  function populate(){
    const meta=session.user.user_metadata||{};
    $('name').value=profile?.full_name||meta.full_name||meta.name||'';
    $('email').value=session.user.email||profile?.email||'';
    $('school').value=profile?.school||'';
    $('nationality').value=profile?.nationality||'';
    $('city').value=profile?.city||'';
    $('phone').value=profile?.phone||'';
    $('level').value=profile?.jlpt_target||'N5';
    $('goal').value=profile?.study_goal||'';
    $('minutes').value=String(profile?.daily_study_minutes||30);
    $('bio').value=profile?.bio||'';
    $('dateOfBirth').value=profile?.date_of_birth||'';
    $('gender').value=profile?.gender||'';
    avatarUrl=profile?.avatar_url||accountPhoto()||'';
    $('emailValue').textContent=session.user.email||'—';
    $('providerValue').textContent=session.user.app_metadata?.provider==='google'?'Google':'Email';
    const verified=Boolean(session.user.email_confirmed_at||session.user.confirmed_at||session.user.app_metadata?.provider==='google');
    $('verifiedBadge').textContent=verified?t('verified'):t('unverified');
    $('verifiedBadge').classList.toggle('is-verified',verified);
    $('emailStatus').textContent=verified?t('verified'):t('unverified');
    $('emailStatus').classList.toggle('unverified',!verified);
    const isAdmin=profile?.role==='admin';
    document.querySelectorAll('[data-admin-link]').forEach(el=>{el.hidden=!isAdmin});
    updateHero();
  }

  function bind(){
    const liveIds=['name','school','nationality','city','level','goal','dateOfBirth'];
    liveIds.forEach(id=>$(id)?.addEventListener(id==='level'?'change':'input',updateHero));
    $('profileForm')?.addEventListener('submit',event=>event.preventDefault());
    $('saveBtn')?.addEventListener('click',()=>save(false));
    $('saveHomeBtn')?.addEventListener('click',()=>save(true));
    $('avatarFile')?.addEventListener('change',event=>selectAvatar(event.target.files?.[0]));
    document.querySelectorAll('[data-choose-avatar]').forEach(el=>el.addEventListener('click',()=>$('avatarFile').click()));
    $('useAccountPhoto')?.addEventListener('click',()=>{
      pendingAvatarFile=null;
      if(previewObjectUrl){URL.revokeObjectURL(previewObjectUrl);previewObjectUrl=''}
      avatarUrl=accountPhoto();
      $('avatarFile').value='';
      updateHero();
    });
    document.querySelectorAll('[data-logout]').forEach(el=>el.addEventListener('click',async()=>{try{await AN.logout()}catch(error){toast(error?.message||'Logout failed',true)}}));
    const trigger=$('accountMenuButton'),menu=$('accountMenu');
    trigger?.addEventListener('click',event=>{event.stopPropagation();const open=!menu.hidden;menu.hidden=open;trigger.setAttribute('aria-expanded',String(!open))});
    document.addEventListener('click',event=>{if(menu&&!menu.hidden&&!menu.contains(event.target)&&event.target!==trigger){menu.hidden=true;trigger?.setAttribute('aria-expanded','false')}});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu&&!menu.hidden){menu.hidden=true;trigger?.setAttribute('aria-expanded','false');trigger?.focus()}});
    window.addEventListener('aponar:languagechange',()=>{applyTranslations();populate();});
    window.addEventListener('beforeunload',()=>{if(previewObjectUrl)URL.revokeObjectURL(previewObjectUrl)});
  }

  async function boot(){
    bind();
    applyTranslations();
    try{
      session=await AN.session();
      if(!session){location.replace('/auth.html');return}
      profile=await AN.ensureProfile();
      populate();
      await loadActivity();
      AN.log('profile_view',{module:'profile'}).catch(()=>{});
      const query=new URLSearchParams(location.search);
      if(query.get('verified')==='1')toast(t('verifiedToast'));
    }catch(error){
      console.error('profile boot',error);
      toast(error?.message||t('loadError'),true);
    }finally{
      $('loadingLayer').hidden=true;
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();