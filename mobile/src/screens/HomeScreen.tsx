import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FeatureCard, PrimaryButton, Screen, SectionTitle } from '../components';
import { FEATURE_REGISTRY, HOME_FEATURES } from '../registry';
import { openFeature } from '../navigation';
import { colors, radius, space } from '../theme';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const scanner = FEATURE_REGISTRY.find((item) => item.id === 'halal-scanner')!;
  const news = FEATURE_REGISTRY.find((item) => item.id === 'daily-news')!;
  const others = HOME_FEATURES.filter((item) => !['halal-scanner', 'daily-news'].includes(item.id));
  return <Screen>
    <View style={styles.hero}>
      <Text style={styles.kicker}>Aponar Nihon • আপনার জাপানি শেখার সঙ্গী</Text>
      <Text style={styles.title}>জাপানি শিখুন, প্রতিদিন এগিয়ে যান</Text>
      <Text style={styles.copy}>N5–N1 learning, AI Tutor, Daily News, CV Builder, Halal Scanner এবং website-এর সব learning/resource section—একই app-এ।</Text>
      <PrimaryButton label="শেখা চালিয়ে যান" onPress={() => navigation.navigate('Learn')} />
    </View>

    <View style={{ gap: 10 }}>
      <SectionTitle title="Halal Scanner" subtitle="Home-এর দ্বিতীয় গুরুত্বপূর্ণ line — native camera, ingredient screening, certificate status পরিষ্কারভাবে।" />
      <FeatureCard feature={scanner} prominent onPress={() => openFeature(navigation, scanner)} />
    </View>

    <View style={{ gap: 10 }}>
      <SectionTitle title="Japan Daily News" subtitle="Japanese reading practice হিসেবে — Furigana, বাংলা ব্যাখ্যা, vocabulary ও source।" />
      <FeatureCard feature={news} onPress={() => openFeature(navigation, news)} />
    </View>

    <View style={{ gap: 10 }}><SectionTitle title="আজকের শেখা" subtitle="মূল education features" />{others.map((feature) => <FeatureCard key={feature.id} feature={feature} onPress={() => openFeature(navigation, feature)} />)}</View>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.dark, borderRadius: radius.lg, padding: space.lg, gap: 13 },
  kicker: { color: '#BFD0FF', fontWeight: '800' },
  title: { color: '#fff', fontSize: 30, lineHeight: 38, fontWeight: '900' },
  copy: { color: '#DCE5F5', lineHeight: 23, fontSize: 15 }
});
