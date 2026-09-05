import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { askTutor, type TutorDepth, type TutorHistoryItem, type TutorLevel, type TutorMode } from '../api';
import { Chip, PrimaryButton, Screen, SectionTitle } from '../components';
import { colors, radius } from '../theme';

const CLIENT_KEY = 'aponarNihonTutorClientId';
const modes: Array<[TutorMode, string]> = [['learn','শিখি'],['correct','বাক্য ঠিক'],['conversation','কথোপকথন'],['interview','ইন্টারভিউ'],['quiz','Quiz'],['translate','অনুবাদ']];

export default function TutorScreen() {
  const [level, setLevel] = useState<TutorLevel>('N4');
  const [mode, setMode] = useState<TutorMode>('learn');
  const [depth, setDepth] = useState<TutorDepth>('standard');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<TutorHistoryItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const clientId = useRef('mobile-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
  useEffect(() => { SecureStore.getItemAsync(CLIENT_KEY).then((value) => { if (value) clientId.current = value; else SecureStore.setItemAsync(CLIENT_KEY, clientId.current); }); }, []);
  async function send() {
    const clean = message.trim(); if (!clean || busy) return;
    setBusy(true); setError(''); setMessage('');
    const next = [...history, { role: 'user' as const, text: clean }]; setHistory(next);
    try {
      const reply = await askTutor({ message: clean, history: history.slice(-8), clientId: clientId.current, level, mode, depth, language: 'bn' });
      setHistory((items) => [...items, { role: 'bot', text: reply }]);
    } catch (e) { setError(e instanceof Error ? e.message : 'AI Tutor সমস্যা হয়েছে।'); }
    finally { setBusy(false); }
  }
  return <Screen scroll={false}>
    <SectionTitle title="AI Japanese Tutor" subtitle="Aponar Nihon-এর existing secure /api/tutor backend-এর native client।" />
    <View style={styles.chips}><Text style={styles.label}>Level</Text>{(['N5','N4','N3'] as TutorLevel[]).map((item) => <Chip key={item} text={item} selected={level === item} onPress={() => setLevel(item)} />)}</View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{modes.map(([value,label]) => <Chip key={value} text={label} selected={mode === value} onPress={() => setMode(value)} />)}</ScrollView>
    <View style={styles.chips}>{(['quick','standard','deep'] as TutorDepth[]).map((item) => <Chip key={item} text={item} selected={depth === item} onPress={() => setDepth(item)} />)}</View>
    <ScrollView style={styles.chat} contentContainerStyle={{ gap: 10, padding: 10 }}>{history.length === 0 ? <Text style={styles.empty}>Grammar, sentence correction, conversation বা JLPT প্রশ্ন লিখুন।</Text> : history.map((item, i) => <View key={i} style={[styles.bubble, item.role === 'user' ? styles.user : styles.bot]}><Text style={[styles.bubbleText, item.role === 'user' && { color: '#fff' }]}>{item.text}</Text></View>)}{busy ? <ActivityIndicator /> : null}{error ? <Text style={styles.error}>{error}</Text> : null}</ScrollView>
    <TextInput value={message} onChangeText={setMessage} multiline placeholder="Japanese বা বাংলা প্রশ্ন লিখুন..." placeholderTextColor={colors.muted} style={styles.composer} />
    <PrimaryButton label={busy ? 'উত্তর তৈরি হচ্ছে…' : 'পাঠান'} onPress={send} disabled={busy || !message.trim()} />
  </Screen>;
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }, label: { color: colors.text, fontWeight: '800' }, chat: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg }, empty: { color: colors.muted, lineHeight: 22 }, bubble: { maxWidth: '88%', padding: 12, borderRadius: radius.md }, user: { alignSelf: 'flex-end', backgroundColor: colors.primary }, bot: { alignSelf: 'flex-start', backgroundColor: colors.primarySoft }, bubbleText: { color: colors.text, lineHeight: 22 }, composer: { minHeight: 70, maxHeight: 130, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, color: colors.text, textAlignVertical: 'top' }, error: { color: colors.danger } });
