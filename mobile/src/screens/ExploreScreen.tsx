import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components';
import { EXPLORE_FEATURES } from '../registry';
import { openFeature } from '../navigation';
import { colors, radius } from '../theme';

const gradients: readonly (readonly [string, string])[] = [
  ['#27CDB3', '#0BA98E'], ['#2BC2DF', '#0C8FC3'], ['#6D6CF0', '#4B42D8'],
  ['#FBB62D', '#E89A05'], ['#2C63C7', '#17449E'], ['#91A0B5', '#5D6F86']
];
const fallbackGradient = ['#1677E8', '#075FC5'] as const;

export default function ExploreScreen({ navigation }: { navigation: any }) {
  return <Screen>
    <View style={styles.hero}>
      <Text style={styles.eyebrow}>JAPAN LIFE & CAREER</Text>
      <Text style={styles.title}>জাপানে দরকারি সবকিছু</Text>
      <Text style={styles.copy}>Career, SSW, visa, transport, living cost, emergency, student tools এবং website-এর practical guides—native app-এ।</Text>
    </View>

    <View><Text style={styles.smallBlue}>▦  EXPLORE</Text><Text style={styles.sectionTitle}>গাইড ও টুলস</Text></View>

    <View style={styles.grid}>
      {EXPLORE_FEATURES.map((feature, index) => {
        const gradient = gradients[index % gradients.length] ?? fallbackGradient;
        return <Pressable key={feature.id} onPress={() => openFeature(navigation, feature)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconWrap}><Text style={styles.icon}>{feature.icon}</Text></LinearGradient>
          <View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.cardTitle}>{feature.title}</Text><Text numberOfLines={2} style={styles.cardCopy}>{feature.subtitle}</Text></View>
          <Text style={styles.link}>দেখুন  →</Text>
        </Pressable>;
      })}
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { padding: 22, borderRadius: radius.xl, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: .8 },
  title: { marginTop: 6, color: colors.text, fontSize: 26, lineHeight: 33, fontWeight: '900' },
  copy: { marginTop: 8, color: colors.muted, fontSize: 14, lineHeight: 22 },
  smallBlue: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  sectionTitle: { marginTop: 3, color: colors.text, fontSize: 22, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48.2%', minHeight: 196, padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: '#FFFFFF' },
  iconWrap: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  icon: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  cardTitle: { marginTop: 12, color: colors.text, fontSize: 15, fontWeight: '900' },
  cardCopy: { marginTop: 5, color: colors.muted, fontSize: 11, lineHeight: 17 },
  link: { marginTop: 10, color: colors.primary, fontSize: 12, fontWeight: '900' },
  pressed: { opacity: .8, transform: [{ scale: .985 }] }
});
