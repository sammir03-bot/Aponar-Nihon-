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
  const rows = Array.from({ length: Math.ceil(EXPLORE_FEATURES.length / 2) }, (_, index) =>
    EXPLORE_FEATURES.slice(index * 2, index * 2 + 2)
  );

  return <Screen>
    <View style={styles.hero}>
      <Text style={styles.eyebrow}>JAPAN LIFE & CAREER</Text>
      <Text style={styles.title}>জাপানে দরকারি সবকিছু</Text>
      <Text style={styles.copy}>Career, SSW, visa, transport, living cost, emergency, student tools—দরকারি গাইড এক জায়গায়।</Text>
    </View>

    <View style={styles.sectionHead}>
      <Text style={styles.smallBlue}>▦  EXPLORE</Text>
      <Text style={styles.sectionTitle}>গাইড ও টুলস</Text>
    </View>

    <View style={styles.grid}>
      {rows.map((row, rowIndex) => <View key={`explore-row-${rowIndex}`} style={styles.row}>
        {row.map((feature, itemIndex) => {
          const index = rowIndex * 2 + itemIndex;
          const gradient = gradients[index % gradients.length] ?? fallbackGradient;
          return <Pressable
            key={feature.id}
            accessibilityRole="button"
            accessibilityLabel={`${feature.title} দেখুন`}
            onPress={() => openFeature(navigation, feature)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconWrap}>
              <Text style={styles.icon}>{feature.icon}</Text>
            </LinearGradient>
            <Text numberOfLines={2} style={styles.cardTitle}>{feature.title}</Text>
            <Text numberOfLines={2} style={styles.cardCopy}>{feature.subtitle}</Text>
            <Text style={styles.link}>দেখুন  →</Text>
          </Pressable>;
        })}
        {row.length === 1 ? <View style={styles.spacer} /> : null}
      </View>)}
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: {
    padding: 19,
    borderRadius: radius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#284C72',
    shadowOpacity: .04,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: .8 },
  title: { marginTop: 6, color: colors.text, fontSize: 24, lineHeight: 31, fontWeight: '900' },
  copy: { marginTop: 7, color: colors.muted, fontSize: 13, lineHeight: 20 },
  sectionHead: { gap: 3 },
  smallBlue: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },
  grid: { gap: 10 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  card: {
    flex: 1,
    minWidth: 0,
    minHeight: 176,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#284C72',
    shadowOpacity: .045,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2
  },
  spacer: { flex: 1, minWidth: 0 },
  iconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  icon: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  cardTitle: { marginTop: 10, color: colors.text, fontSize: 14, lineHeight: 18, fontWeight: '900', minHeight: 18 },
  cardCopy: { marginTop: 4, color: colors.muted, fontSize: 10.5, lineHeight: 15, flexGrow: 1 },
  link: { marginTop: 8, color: colors.primary, fontSize: 11.5, fontWeight: '900' },
  pressed: { opacity: .82, transform: [{ scale: .98 }] }
});
