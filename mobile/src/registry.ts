export type NativeRoute = 'Tutor' | 'HalalScanner' | 'CVBuilder' | 'DailyNews' | 'Profile' | 'AllSections';

export type Feature = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: 'core' | 'learn' | 'exam' | 'career' | 'life' | 'account' | 'legal';
  nativeRoute?: NativeRoute;
  webPath?: string;
  priority?: number;
};

export const FEATURE_REGISTRY: Feature[] = [
  { id: 'ai-tutor', title: 'AI Tutor', subtitle: 'Grammar, correction, conversation, interview ও quiz', icon: '🤖', category: 'core', nativeRoute: 'Tutor', priority: 1 },
  { id: 'halal-scanner', title: 'Halal Scanner', subtitle: 'Native camera barcode scan + ingredient screening + certificate status', icon: '📷', category: 'core', nativeRoute: 'HalalScanner', priority: 2 },
  { id: 'daily-news', title: 'Japan Daily News', subtitle: 'ছবি, Furigana, বাংলা ব্যাখ্যা ও vocabulary সহ', icon: '📰', category: 'core', nativeRoute: 'DailyNews', priority: 3 },
  { id: 'cv-builder', title: 'CV Builder', subtitle: 'Japanese CV / 履歴書 তৈরি ও PDF export', icon: '📄', category: 'career', nativeRoute: 'CVBuilder', priority: 4 },
  { id: 'part-time-cv', title: 'Part-time CV Builder', subtitle: 'Baito আবেদন উপযোগী CV সহায়তা', icon: '🧾', category: 'career', webPath: 'part-time-cv-builder.html' },
  { id: 'n5', title: 'JLPT N5', subtitle: 'Grammar, Kanji, Vocabulary, Reading ও practice', icon: '⑤', category: 'learn', webPath: 'N5.html' },
  { id: 'n4', title: 'JLPT N4', subtitle: 'N4 complete learning hub', icon: '④', category: 'learn', webPath: 'N4.html' },
  { id: 'n3', title: 'JLPT N3', subtitle: 'N3 grammar, reading, kanji ও matome', icon: '③', category: 'learn', webPath: 'N3.html' },
  { id: 'hiragana-katakana', title: 'Hiragana & Katakana', subtitle: 'Japanese alphabet শেখা ও practice', icon: 'あ', category: 'learn', webPath: 'Hiragana-Katagana.html' },
  { id: 'kanji', title: 'Kanji', subtitle: 'Level-wise Kanji lessons', icon: '漢', category: 'learn', webPath: 'N5-Kanji.html' },
  { id: 'vocabulary', title: 'Vocabulary', subtitle: 'Vocabulary lessons ও review', icon: '語', category: 'learn', webPath: 'N5-Vocabulary.html' },
  { id: 'grammar', title: 'Grammar', subtitle: 'সহজ বাংলা explanation সহ grammar', icon: '文', category: 'learn', webPath: 'N5-Grammar-part1.html' },
  { id: 'reading', title: 'Reading', subtitle: 'Japanese reading practice', icon: '📖', category: 'learn', webPath: 'N5-Reading.html' },
  { id: 'mock-test', title: 'Mock Test', subtitle: 'JLPT-style mock ও quiz', icon: '✅', category: 'exam', webPath: 'jlpt-mock-test.html' },
  { id: 'jlpt-quiz', title: 'JLPT Quiz', subtitle: 'দ্রুত practice ও self-check', icon: '🎯', category: 'exam', webPath: 'jlpt-quiz.html' },
  { id: 'exam', title: 'JLPT Exam', subtitle: 'Exam preparation resources', icon: '📝', category: 'exam', webPath: 'jlpt-exam.html' },
  { id: 'ebooks', title: 'E-book Library', subtitle: 'Study books ও learning resources', icon: '📚', category: 'learn', webPath: 'ebook-library.html' },
  { id: 'student-tools', title: 'Student Tools', subtitle: 'শিক্ষার্থীদের দরকারি utilities', icon: '🧰', category: 'core', webPath: 'student-tools.html' },
  { id: 'interview', title: 'Interview Preparation', subtitle: 'Japanese job interview practice', icon: '💬', category: 'career', webPath: 'interview-preparation.html' },
  { id: 'ssw', title: 'Specified Skilled Worker (SSW)', subtitle: 'SSW exam, docs, FAQ, jobs ও salary guide', icon: '🧑‍🔧', category: 'career', webPath: 'ssw.html' },
  { id: 'visa', title: 'Visa Guide', subtitle: 'Japan visa ও residence information', icon: '🛂', category: 'life', webPath: 'visa.html' },
  { id: 'arrival', title: 'Arrival Guide', subtitle: 'জাপানে আসার পর প্রথম প্রয়োজনীয় কাজ', icon: '🧳', category: 'life', webPath: 'arrival-guide.html' },
  { id: 'life', title: 'Japan Life Guide', subtitle: 'বাসা, নিয়ম, দৈনন্দিন জীবন ও প্রয়োজনীয় তথ্য', icon: '🏠', category: 'life', webPath: 'japan-life.html' },
  { id: 'train', title: 'Train & Transport', subtitle: 'জাপানের train ও transport guide', icon: '🚆', category: 'life', webPath: 'train-guide.html' },
  { id: 'emergency', title: 'Emergency Guide', subtitle: 'জরুরি সময়ে প্রয়োজনীয় official information', icon: '🆘', category: 'life', webPath: 'emergency.html' },
  { id: 'japan-map', title: 'Japan Map & Places', subtitle: 'Prefecture ও প্রয়োজনীয় জায়গার guide', icon: '🗾', category: 'life', webPath: 'japan-map.html' },
  { id: 'study-japan', title: 'Study in Japan', subtitle: 'Student life ও study guide', icon: '🎓', category: 'life', webPath: 'study-in-japan.html' },
  { id: 'cost', title: 'Living Cost', subtitle: 'Japan living cost information', icon: '💴', category: 'life', webPath: 'cost-of-living.html' },
  { id: 'remittance', title: 'Remittance Guide', subtitle: 'টাকা পাঠানো ও financial basics', icon: '💱', category: 'life', webPath: 'remittance.html' },
  { id: 'profile', title: 'Profile & Progress', subtitle: 'Account, streak, progress ও activity', icon: '👤', category: 'account', nativeRoute: 'Profile' },
  { id: 'all-sections', title: 'সব সেকশন', subtitle: 'Website-এর সব user-facing page native content list-এ', icon: '🧭', category: 'core', nativeRoute: 'AllSections', priority: 99 }
];

export const HOME_FEATURES = FEATURE_REGISTRY
  .filter((item) => item.priority !== undefined)
  .sort((a, b) => (a.priority || 999) - (b.priority || 999));

export const LEARNING_FEATURES = FEATURE_REGISTRY.filter((item) => item.category === 'learn' || item.category === 'exam');
export const EXPLORE_FEATURES = FEATURE_REGISTRY.filter((item) => ['career', 'life', 'core'].includes(item.category));
