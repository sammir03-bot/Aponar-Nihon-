import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components';
import { LEARNING_FEATURES } from '../registry';
import { openFeature } from '../navigation';
import { colors, radius } from '../theme';

const gradients: readonly (readonly [string, string])[] = [
  ['#9A45EF', '#6634D8'], ['#2BB7F1', '#1774E8'], ['#FF736C', '#EF443C'],
  ['#2DD487', '#0DAD63'], ['#F15BA4', '#DF2F86'], ['#6D6CF0', '#4B42D8']
];

export default function LearnScreen({ navigation }: { navigation: any }) {
  return <Screen>
    <View style={styles.hero}>
      <Text style={styles.eyebrow}>JAPANESE LEARNING</Text>
      <Text style={styles.title}>জাপানি শেখার সব কোর্স</Text>
      <Text style={styles.copy}>N5, N4, N3, Kanji, Vocabulary, Grammar, Reading, Mock Test—website-এর learning structure native app-এ।</Text>
    </View>

    <View style={styles.sectionHead}><View><Text style={styles.smallBlue}>▦  LEARNING HUB</Text><Text style={styles.sectionTitle}>শেখার সেকশন</Text></View></View>

    <View style={styles.grid}>
      {LEARNING_FEATURES.map((feature, index) => <Pressable key={feature.id} onPress={() => openFeature(navigation, feature)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <LinearGradient colors={gradients[index % gradients.length]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconWrap}><Text style={styles.icon}>{feature.icon}</Text></LinearGradient>
        <Text numberOfLines={1} style={styles.cardTitle}>{feature.title}</Text>
        <Text numberOfLines={2} style={styles.cardCopy}>{feature.subtitle}</Text>
        <Text style={styles.link}>খুলুন  →</Text>
      </Pressable>)}
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { padding: 22, borderRadius: radius.xl, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: .8 },
  title: { marginTop: 6, color: colors.text, fontSize: 26, lineHeight: 33, fontWeight: '900' },
  copy: { marginTop: 8, color: colors.muted, fontSize: 14, lineHeight: 22 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallBlue: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  sectionTitle: { marginTop: 3, color: colors.text, fontSize: 22, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48.2%', minHeight: 192, padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: '#FFFFFF' },
  iconWrap: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  icon: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  cardTitle: { marginTop: 12, color: colors.text, fontSize: 15, fontWeight: '900' },
  cardCopy: { marginTop: 5, color: colors.muted, fontSize: 11, lineHeight: 17, flexGrow: 1 },
  link: { marginTop: 10, color: colors.primary, fontSize: 12, fontWeight: '900' },
  pressed: { opacity: .8, transform: [{ scale: .985 }] }
});
