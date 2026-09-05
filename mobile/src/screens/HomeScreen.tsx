import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_ORIGIN } from '../config';
import { FEATURE_REGISTRY, type Feature } from '../registry';
import { openFeature } from '../navigation';
import { colors, radius, space } from '../theme';

const HOME_GRID_IDS = [
  'n5', 'n4', 'n3', 'jlpt-quiz',
  'ai-tutor', 'halal-scanner', 'daily-news', 'cv-builder',
  'mock-test', 'interview', 'ssw', 'life',
  'hiragana-katakana', 'student-tools', 'profile', 'all-sections'
] as const;

const QUICK_ITEMS = [
  { id: 'kanji', label: 'কানজি', icon: '漢' },
  { id: 'vocabulary', label: 'ভোকাব', icon: '語' },
  { id: 'grammar', label: 'গ্রামার', icon: '文' },
  { id: 'interview', label: 'কথা বলা', icon: '話' }
] as const;

const GRADIENTS: Record<string, readonly [string, string]> = {
  n5: ['#9A45EF', '#6634D8'],
  n4: ['#2BB7F1', '#1774E8'],
  n3: ['#FF736C', '#EF443C'],
  'jlpt-quiz': ['#2DD487', '#0DAD63'],
  'ai-tutor': ['#CF4BE8', '#9A34DD'],
  'halal-scanner': ['#25C58A', '#079E71'],
  'daily-news': ['#2BC2DF', '#0C8FC3'],
  'cv-builder': ['#2C63C7', '#17449E'],
  'mock-test': ['#FFAD5B', '#FF7D36'],
  interview: ['#6D6CF0', '#4B42D8'],
  ssw: ['#FBB62D', '#E89A05'],
  life: ['#27CDB3', '#0BA98E'],
  'hiragana-katakana': ['#F15BA4', '#DF2F86'],
  'student-tools': ['#91A0B5', '#5D6F86'],
  profile: ['#2C63C7', '#17449E'],
  'all-sections': ['#32B78F', '#168066']
};

function featureById(id: string): Feature | undefined {
  return FEATURE_REGISTRY.find((item) => item.id === id);
}

function WebsiteTool({ feature, onPress }: { feature: Feature; onPress: () => void }) {
  const gradient = GRADIENTS[feature.id] || ['#65A6D3', '#1677E8'];
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.tool, pressed && styles.pressed]}>
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.toolIcon}>
      <Text style={styles.toolIconText}>{feature.icon}</Text>
    </LinearGradient>
    <Text numberOfLines={1} style={styles.toolTitle}>{feature.title}</Text>
    <Text numberOfLines={1} style={styles.toolSubtitle}>{feature.subtitle}</Text>
  </Pressable>;
}

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [query, setQuery] = useState('');
  const gridFeatures = useMemo(() => HOME_GRID_IDS.map(featureById).filter(Boolean) as Feature[], []);
  const quickFeatures = useMemo(() => QUICK_ITEMS.map((item) => ({ ...item, feature: featureById(item.id) })).filter((item) => item.feature), []);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return FEATURE_REGISTRY.filter((item) => `${item.title} ${item.subtitle} ${item.id}`.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const tutor = featureById('ai-tutor')!;
  const scanner = featureById('halal-scanner')!;
  const news = featureById('daily-news')!;
  const cv = featureById('cv-builder')!;

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.topbar}>
      <View style={styles.brand}>
        <Image source={{ uri: `${APP_ORIGIN}/logo.png` }} style={styles.logo} resizeMode="contain" />
        <View style={styles.brandCopy}>
          <Text numberOfLines={1} style={styles.brandTitle}>আপনার নিহোন</Text>
          <Text numberOfLines={1} style={styles.brandSub}>JAPANESE LEARNING HUB</Text>
        </View>
      </View>
      <View style={styles.topActions}>
        <Pressable accessibilityLabel="আমাদের সম্পর্কে" onPress={() => navigation.navigate('Content', { title: 'আপনার নিহোন সম্পর্কে', path: 'about.html' })} style={styles.iconButton}><Text style={styles.iconButtonText}>ⓘ</Text></Pressable>
        <Pressable accessibilityLabel="প্রোফাইল" onPress={() => navigation.navigate('Profile')} style={styles.iconButton}><Text style={styles.iconButtonText}>👤</Text></Pressable>
      </View>
    </View>

    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.searchCard}>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="কানজি, ভোকাবুলারি, গ্রামার খুঁজুন…"
            placeholderTextColor="#A3ACB8"
            style={styles.searchInput}
            returnKeyType="search"
          />
          <View style={styles.languageSwitch}><View style={styles.languageActive}><Text style={styles.languageActiveText}>বাং</Text></View><Text style={styles.languageOff}>日</Text></View>
        </View>

        {query.trim() ? <View style={styles.searchResults}>
          {results.length ? results.map((feature) => <Pressable key={feature.id} onPress={() => { setQuery(''); openFeature(navigation, feature); }} style={styles.searchResult}>
            <Text style={styles.searchResultIcon}>{feature.icon}</Text>
            <View style={{ flex: 1 }}><Text style={styles.searchResultTitle}>{feature.title}</Text><Text numberOfLines={1} style={styles.searchResultSub}>{feature.subtitle}</Text></View>
            <Text style={styles.searchResultArrow}>›</Text>
          </Pressable>) : <Text style={styles.noResult}>কোনো সেকশন পাওয়া যায়নি</Text>}
        </View> : null}

        <View style={styles.quickRow}>
          {quickFeatures.map((item) => <Pressable key={item.id} onPress={() => openFeature(navigation, item.feature!)} style={({ pressed }) => [styles.quickItem, pressed && styles.pressed]}>
            <Text style={styles.quickIcon}>{item.icon}</Text><Text style={styles.quickLabel}>{item.label}</Text>
          </Pressable>)}
        </View>
      </View>

      <View style={styles.dashboardCard}>
        <View style={styles.cardHead}>
          <View style={{ flex: 1 }}><Text style={styles.eyebrow}>▦  এক জায়গায় সবকিছু</Text><Text style={styles.cardTitle}>সব গুরুত্বপূর্ণ সেকশন</Text></View>
          <Pressable onPress={() => navigation.navigate('AllSections')} style={styles.arrowButton}><Text style={styles.arrowButtonText}>→</Text></Pressable>
        </View>
        <View style={styles.toolsGrid}>{gridFeatures.map((feature) => <WebsiteTool key={feature.id} feature={feature} onPress={() => openFeature(navigation, feature)} />)}</View>
      </View>

      <LinearGradient colors={['#5848DF', '#755FF0', '#3F8DE8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.spotlight}>
        <Text style={styles.spotlightBadge}>✦ SMART LEARNING</Text>
        <Text style={styles.spotlightTitle}>AI জাপানি টিউটর</Text>
        <Text style={styles.spotlightCopy}>বাংলায় প্রশ্ন করুন, grammar বুঝুন, sentence correction, conversation, interview ও quiz practice করুন।</Text>
        <Pressable onPress={() => openFeature(navigation, tutor)} style={styles.spotlightButton}><Text style={styles.spotlightButtonText}>AI Tutor খুলুন  →</Text></Pressable>
        <Text style={styles.spotlightKana}>あ</Text>
      </LinearGradient>

      <View style={styles.nativeDuo}>
        <Pressable onPress={() => openFeature(navigation, scanner)} style={({ pressed }) => [styles.nativeCard, styles.halalCard, pressed && styles.pressed]}>
          <View style={styles.nativeIcon}><Text style={styles.nativeIconText}>📷</Text></View>
          <Text style={styles.nativeKicker}>NATIVE CAMERA</Text><Text style={styles.nativeTitle}>Halal Scanner</Text><Text style={styles.nativeCopy}>Barcode scan, ingredient screening ও certificate status—app-এর camera দিয়েই।</Text>
          <Text style={styles.nativeLink}>স্ক্যান করুন  →</Text>
        </Pressable>
        <Pressable onPress={() => openFeature(navigation, cv)} style={({ pressed }) => [styles.nativeCard, pressed && styles.pressed]}>
          <View style={styles.nativeIcon}><Text style={styles.nativeIconText}>📄</Text></View>
          <Text style={styles.nativeKicker}>JAPAN CV</Text><Text style={styles.nativeTitle}>CV Builder</Text><Text style={styles.nativeCopy}>履歴書 তৈরি, photo select, PDF export ও native share।</Text>
          <Text style={styles.nativeLink}>CV বানান  →</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => openFeature(navigation, news)} style={({ pressed }) => [styles.newsCard, pressed && styles.pressed]}>
        <View style={styles.newsIconWrap}><Text style={styles.newsIcon}>📰</Text></View>
        <View style={{ flex: 1 }}><Text style={styles.newsEyebrow}>JAPAN DAILY NEWS</Text><Text style={styles.newsTitle}>প্রতিদিন জাপানি পড়ে শিখুন</Text><Text style={styles.newsCopy}>Furigana on/off, বাংলা ব্যাখ্যা, vocabulary ও source সহ native reader।</Text></View>
        <Text style={styles.newsArrow}>›</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('AllSections')} style={styles.allSectionsButton}><Text style={styles.allSectionsText}>ওয়েবসাইটের সব সেকশন দেখুন</Text><Text style={styles.allSectionsArrow}>→</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topbar: { minHeight: 70, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(223,231,241,0.82)', backgroundColor: '#FFFFFF' },
  brand: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  logo: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#fff' },
  brandCopy: { minWidth: 0, flex: 1 },
  brandTitle: { color: '#14243A', fontSize: 17, fontWeight: '900' },
  brandSub: { marginTop: 3, color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: .6 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 42, height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { color: '#607087', fontSize: 19 },
  scroll: { padding: 16, paddingBottom: 34, gap: 18 },
  searchCard: { padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: '#fff', shadowColor: '#234367', shadowOpacity: .08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  searchRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#E1E7EF', borderRadius: 22, backgroundColor: '#fff', paddingLeft: 4 },
  searchIcon: { width: 48, color: '#182435', textAlign: 'center', fontSize: 28, fontWeight: '700' },
  searchInput: { minWidth: 0, flex: 1, color: colors.text, fontSize: 15, fontWeight: '650', paddingVertical: 14 },
  languageSwitch: { marginRight: 6, flexDirection: 'row', alignItems: 'center', gap: 2, padding: 3, borderWidth: 1, borderColor: '#E4E9F0', borderRadius: 17, backgroundColor: '#F7F9FC' },
  languageActive: { minWidth: 43, height: 39, paddingHorizontal: 8, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  languageActiveText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  languageOff: { minWidth: 32, textAlign: 'center', color: '#7D8795', fontWeight: '800', fontSize: 14 },
  searchResults: { marginTop: 10, padding: 7, gap: 3, borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: '#fff' },
  searchResult: { minHeight: 52, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchResultIcon: { width: 30, textAlign: 'center', fontSize: 19 },
  searchResultTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  searchResultSub: { marginTop: 2, color: colors.muted, fontSize: 11 },
  searchResultArrow: { color: colors.primary, fontSize: 24 },
  noResult: { padding: 12, color: colors.muted, textAlign: 'center' },
  quickRow: { marginTop: 17, flexDirection: 'row', justifyContent: 'space-between' },
  quickItem: { width: '24%', alignItems: 'center', gap: 5 },
  quickIcon: { color: '#65A6D3', fontSize: 24, fontWeight: '900' },
  quickLabel: { color: '#728095', fontSize: 12, fontWeight: '800' },
  dashboardCard: { padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: '#fff', shadowColor: '#234367', shadowOpacity: .08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  cardHead: { marginBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  cardTitle: { marginTop: 3, color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: '900' },
  arrowButton: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#EDF7FF', alignItems: 'center', justifyContent: 'center' },
  arrowButtonText: { color: colors.primary, fontSize: 24, fontWeight: '800' },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 20 },
  tool: { width: '25%', minWidth: 0, paddingHorizontal: 3, alignItems: 'center', gap: 5 },
  toolIcon: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#204468', shadowOpacity: .16, shadowRadius: 8, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  toolIconText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  toolTitle: { width: '100%', color: '#212937', textAlign: 'center', fontSize: 12, fontWeight: '900' },
  toolSubtitle: { width: '100%', color: colors.faint, textAlign: 'center', fontSize: 9, fontWeight: '650' },
  spotlight: { position: 'relative', overflow: 'hidden', minHeight: 235, padding: 24, borderRadius: radius.xl },
  spotlightBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.16)', color: '#fff', fontSize: 11, fontWeight: '900' },
  spotlightTitle: { marginTop: 18, color: '#fff', fontSize: 27, fontWeight: '900' },
  spotlightCopy: { marginTop: 8, maxWidth: '82%', color: '#EEF2FF', fontSize: 14, lineHeight: 22, fontWeight: '600' },
  spotlightButton: { marginTop: 18, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, backgroundColor: '#fff' },
  spotlightButtonText: { color: '#5548D8', fontWeight: '900' },
  spotlightKana: { position: 'absolute', right: 14, bottom: -37, color: 'rgba(255,255,255,.10)', fontSize: 150, lineHeight: 170, fontWeight: '900', transform: [{ rotate: '-8deg' }] },
  nativeDuo: { flexDirection: 'row', gap: 12 },
  nativeCard: { flex: 1, minHeight: 210, padding: 17, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: '#fff' },
  halalCard: { borderColor: '#BCECDC', backgroundColor: '#F6FFFB' },
  nativeIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  nativeIconText: { fontSize: 22 },
  nativeKicker: { marginTop: 13, color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: .8 },
  nativeTitle: { marginTop: 3, color: colors.text, fontSize: 17, fontWeight: '900' },
  nativeCopy: { marginTop: 6, color: colors.muted, fontSize: 11, lineHeight: 17, flexGrow: 1 },
  nativeLink: { marginTop: 10, color: colors.primary, fontSize: 12, fontWeight: '900' },
  newsCard: { padding: 17, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: '#fff' },
  newsIconWrap: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#EAF8FC', alignItems: 'center', justifyContent: 'center' },
  newsIcon: { fontSize: 26 },
  newsEyebrow: { color: '#0C8FC3', fontSize: 9, fontWeight: '900', letterSpacing: .7 },
  newsTitle: { marginTop: 2, color: colors.text, fontSize: 16, fontWeight: '900' },
  newsCopy: { marginTop: 4, color: colors.muted, fontSize: 11, lineHeight: 17 },
  newsArrow: { color: colors.primary, fontSize: 30 },
  allSectionsButton: { minHeight: 54, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 18, backgroundColor: colors.primary },
  allSectionsText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  allSectionsArrow: { color: '#fff', fontSize: 22, fontWeight: '900' },
  pressed: { opacity: .78, transform: [{ scale: .985 }] }
});
