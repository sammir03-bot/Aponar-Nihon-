import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { getDailyNews, tokensToText, type DailyNewsArticle } from '../api';
import { Chip, Screen, SectionTitle } from '../components';
import { colors, radius, space } from '../theme';

export default function DailyNewsScreen() {
  const [articles, setArticles] = useState<DailyNewsArticle[]>([]);
  const [furigana, setFurigana] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getDailyNews().then(setArticles).catch(() => setError('আজকের news load করা যায়নি।')).finally(() => {}); }, []);
  return <Screen>
    <View style={styles.header}><SectionTitle title="Japan Daily News" subtitle="খবর + Japanese reading practice" /><Chip text={furigana ? 'ふりがな ON' : 'ふりがな OFF'} selected={furigana} onPress={() => setFurigana((v) => !v)} /></View>
    {!articles.length && !error ? <ActivityIndicator /> : null}{error ? <Text style={styles.error}>{error}</Text> : null}
    <View style={{ gap: 14 }}>{articles.map((article) => {
      const open = openId === article.id;
      return <View key={article.id} style={styles.card}>
        {article.image_url ? <Image source={{ uri: article.image_url }} style={styles.image} accessibilityLabel={article.image_alt_bn || article.headline} /> : <View style={styles.placeholder}><Text style={{ fontSize: 42 }}>🗾</Text><Text style={styles.placeholderText}>News image field ready</Text></View>}
        <View style={styles.meta}><Text style={styles.level}>{article.level}</Text><Text style={styles.metaText}>{article.category_bn || 'Japan'} • {article.date}</Text></View>
        <Text style={styles.headline}>{tokensToText(article.headline_tokens, furigana) || article.headline}</Text>
        {article.teaser_bn ? <Text style={styles.teaser}>{article.teaser_bn}</Text> : null}
        <Pressable onPress={() => setOpenId(open ? null : article.id)}><Text style={styles.read}>{open ? 'বন্ধ করুন' : 'বিস্তারিত পড়ুন →'}</Text></Pressable>
        {open ? <View style={styles.detail}>
          {(article.japanese || []).map((paragraph, i) => <Text key={i} style={styles.jp}>{tokensToText(paragraph, furigana)}</Text>)}
          {(article.explanation_bn || []).map((text, i) => <Text key={`bn-${i}`} style={styles.bn}>{text}</Text>)}
          {(article.vocabulary || []).length ? <View style={{ gap: 7 }}><Text style={styles.subhead}>Vocabulary</Text>{article.vocabulary!.map((v) => <Text key={`${v.word}-${v.reading}`} style={styles.bn}>• {v.word}{v.reading ? `（${v.reading}）` : ''} — {v.meaning_bn}</Text>)}</View> : null}
          {article.source?.url ? <Pressable onPress={() => Linking.openURL(article.source!.url!)}><Text style={styles.source}>Source: {article.source.name || 'Original source'} ↗</Text></Pressable> : null}
        </View> : null}
      </View>;
    })}</View>
  </Screen>;
}
const styles = StyleSheet.create({ header: { gap: 12 }, card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.md, gap: 10 }, image: { width: '100%', height: 190, borderRadius: radius.md, backgroundColor: colors.border }, placeholder: { height: 150, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, placeholderText: { color: colors.muted, marginTop: 6 }, meta: { flexDirection: 'row', alignItems: 'center', gap: 8 }, level: { color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill, fontWeight: '900' }, metaText: { color: colors.muted }, headline: { color: colors.text, fontSize: 21, lineHeight: 31, fontWeight: '900' }, teaser: { color: colors.text, lineHeight: 23 }, read: { color: colors.primary, fontWeight: '800' }, detail: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, gap: 12 }, jp: { color: colors.text, fontSize: 17, lineHeight: 29 }, bn: { color: colors.text, lineHeight: 24 }, subhead: { color: colors.text, fontSize: 18, fontWeight: '900' }, source: { color: colors.primary, fontWeight: '700' }, error: { color: colors.danger } });
