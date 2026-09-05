import React from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ContentBlock } from './api';
import { resolveAsset } from './api';
import { colors, radius, space } from './theme';
import type { Feature } from './registry';

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const content = <View style={styles.screenInner}>{children}</View>;
  return <SafeAreaView style={styles.safe}>{scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</SafeAreaView>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={{ gap: 4 }}><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}</View>;
}

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && !disabled && { opacity: .82 }]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.secondaryButton}><Text style={styles.secondaryText}>{label}</Text></Pressable>;
}

export function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, style, ...rest } = props;
  return <View style={{ gap: 7 }}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor={colors.muted} {...rest} style={[styles.input, style]} /></View>;
}

export function FeatureCard({ feature, onPress, prominent = false }: { feature: Feature; onPress: () => void; prominent?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.feature, prominent && styles.featureProminent, pressed && { transform: [{ scale: .99 }] }]}>
    <Text style={styles.featureIcon}>{feature.icon}</Text>
    <View style={{ flex: 1, gap: 4 }}><Text style={styles.featureTitle}>{feature.title}</Text><Text style={styles.muted}>{feature.subtitle}</Text></View>
    <Text style={styles.arrow}>›</Text>
  </Pressable>;
}

export function Chip({ text, selected, onPress }: { text: string; selected?: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && { color: '#fff' }]}>{text}</Text></Pressable>;
}

export function NativeContent({ blocks, sourcePath }: { blocks: ContentBlock[]; sourcePath: string }) {
  return <View style={{ gap: 12 }}>
    {blocks.map((block, index) => {
      const key = `${block.type}-${index}`;
      if (block.type === 'heading') return <Text key={key} style={block.level <= 2 ? styles.h2 : styles.h3}>{block.text}</Text>;
      if (block.type === 'paragraph') return <Text key={key} style={styles.paragraph}>{block.text}</Text>;
      if (block.type === 'list_item') return <Text key={key} style={styles.paragraph}>{block.ordered ? `${index + 1}. ` : '• '}{block.text}</Text>;
      if (block.type === 'image') return <Image key={key} source={{ uri: resolveAsset(block.src, sourcePath) }} accessibilityLabel={block.alt || ''} style={styles.articleImage} resizeMode="cover" />;
      if (block.type === 'link') return <Pressable key={key} onPress={() => Linking.openURL(resolveAsset(block.href, sourcePath))}><Text style={styles.link}>{block.text || block.href}</Text></Pressable>;
      if (block.type === 'table_row') return <View key={key} style={styles.tableRow}>{block.cells.map((cell, i) => <Text key={i} style={styles.tableCell}>{cell}</Text>)}</View>;
      return null;
    })}
  </View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 44 },
  screenInner: { flex: 1, padding: space.md, gap: space.lg },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  button: { backgroundColor: colors.primary, minHeight: 48, paddingHorizontal: 18, paddingVertical: 13, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  disabled: { opacity: .5 },
  secondaryButton: { minHeight: 46, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  secondaryText: { color: colors.primary, fontWeight: '700' },
  label: { color: colors.text, fontWeight: '700' },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, minHeight: 48, paddingHorizontal: 14, color: colors.text, fontSize: 16 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16 },
  featureProminent: { borderColor: '#B9C9FF', backgroundColor: colors.primarySoft },
  featureIcon: { fontSize: 26 },
  featureTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  arrow: { color: colors.primary, fontSize: 28, fontWeight: '300' },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '700' },
  h2: { color: colors.text, fontWeight: '900', fontSize: 22, marginTop: 6 },
  h3: { color: colors.text, fontWeight: '800', fontSize: 18, marginTop: 4 },
  paragraph: { color: colors.text, fontSize: 16, lineHeight: 26 },
  articleImage: { width: '100%', height: 210, borderRadius: radius.lg, backgroundColor: colors.border },
  link: { color: colors.primary, fontSize: 16, fontWeight: '700', textDecorationLine: 'underline' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 8, gap: 8 },
  tableCell: { flex: 1, color: colors.text, fontSize: 14 }
});

export const commonStyles = styles;
