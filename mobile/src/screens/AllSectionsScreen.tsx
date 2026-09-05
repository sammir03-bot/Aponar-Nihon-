import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Field, Screen, SectionTitle } from '../components';
import { getMobileContentIndex, type MobileContentIndexItem } from '../api';
import { colors, radius } from '../theme';

export default function AllSectionsScreen({ navigation }: { navigation: any }) {
  const [pages, setPages] = useState<MobileContentIndexItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { getMobileContentIndex().then((data) => setPages(data.pages || [])).catch(() => setError('Mobile content index এখনো deploy হয়নি। Website build-এর সাথে index তৈরি হবে।')).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((item) => `${item.title} ${item.path}`.toLowerCase().includes(q));
  }, [pages, query]);
  return <Screen>
    <SectionTitle title="সব সেকশন" subtitle={`${pages.length}টি user-facing page পাওয়া গেছে`} />
    <Field label="Search" value={query} onChangeText={setQuery} placeholder="Grammar, N4, visa, interview..." />
    {loading ? <ActivityIndicator /> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <View style={{ gap: 8 }}>{filtered.map((item) => <Pressable key={item.id} onPress={() => navigation.navigate('Content', { id: item.id, title: item.title })} style={styles.row}><View style={{ flex: 1 }}><Text style={styles.title}>{item.title}</Text><Text style={styles.meta}>{item.path} • {item.block_count} blocks</Text></View><Text style={styles.arrow}>›</Text></Pressable>)}</View>
  </Screen>;
}
const styles = StyleSheet.create({ row: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: 'row', alignItems: 'center' }, title: { color: colors.text, fontWeight: '800', fontSize: 16 }, meta: { color: colors.muted, marginTop: 4, fontSize: 12 }, arrow: { fontSize: 26, color: colors.primary }, error: { color: colors.warning, lineHeight: 22 } });
