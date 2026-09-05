import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Field, PrimaryButton, Screen, SectionTitle } from '../components';
import { colors, radius } from '../theme';

type CV = { name: string; furigana: string; dob: string; phone: string; email: string; address: string; visa: string; jlpt: string; education: string; experience: string; skills: string; motivation: string };
const initial: CV = { name: '', furigana: '', dob: '', phone: '', email: '', address: '', visa: '', jlpt: 'N4', education: '', experience: '', skills: '', motivation: '' };
const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] || c)).replace(/\n/g, '<br>');

export default function CVBuilderScreen() {
  const [cv, setCv] = useState<CV>(initial);
  const [photo, setPhoto] = useState<{ uri: string; data?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const set = (key: keyof CV) => (value: string) => setCv((old) => ({ ...old, [key]: value }));
  async function pickPhoto() { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [3,4], quality: .85, base64: true }); if (!result.canceled && result.assets[0]) setPhoto({ uri: result.assets[0].uri, data: result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : undefined }); }
  async function makePdf() {
    if (!cv.name.trim()) { setMessage('নাম লিখুন।'); return; }
    setBusy(true); setMessage('');
    try {
      const image = photo?.data ? `<img src="${photo.data}" style="width:105px;height:140px;object-fit:cover;border:1px solid #333"/>` : '';
      const row = (label: string, value: string) => `<tr><th>${label}</th><td>${esc(value || '—')}</td></tr>`;
      const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>@page{size:A4;margin:18mm}body{font-family:-apple-system,BlinkMacSystemFont,'Noto Sans JP',sans-serif;color:#111;font-size:12px}h1{text-align:center;font-size:24px;letter-spacing:.12em}header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}table{border-collapse:collapse;width:100%;margin:10px 0}th,td{border:1px solid #333;padding:8px;vertical-align:top}th{width:28%;background:#f2f4f7;text-align:left}.section{margin-top:14px;font-weight:700;font-size:14px}</style></head><body><h1>履歴書</h1><header><div><b>${esc(cv.name)}</b><br>${esc(cv.furigana)}<br>${esc(cv.address)}</div>${image}</header><table>${row('生年月日',cv.dob)}${row('電話番号',cv.phone)}${row('メール',cv.email)}${row('在留資格',cv.visa)}${row('日本語レベル',cv.jlpt)}</table><div class="section">学歴</div><table>${row('Education',cv.education)}</table><div class="section">職歴</div><table>${row('Experience',cv.experience)}</table><div class="section">スキル</div><table>${row('Skills',cv.skills)}</table><div class="section">志望動機</div><table>${row('Motivation',cv.motivation)}</table></body></html>`;
      const file = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: 'Aponar Nihon CV PDF' });
      setMessage('PDF তৈরি হয়েছে।');
    } catch { setMessage('PDF তৈরি করা যায়নি।'); }
    finally { setBusy(false); }
  }
  return <Screen><SectionTitle title="CV Builder" subtitle="Native form → Japanese 履歴書 PDF" />
    <View style={styles.photoRow}>{photo ? <Image source={{ uri: photo.uri }} style={styles.photo} /> : <View style={styles.photoPlaceholder}><Text style={{ fontSize: 28 }}>👤</Text></View>}<View style={{ flex: 1 }}><PrimaryButton label="ছবি নির্বাচন" onPress={pickPhoto} /></View></View>
    <Field label="নাম / 氏名" value={cv.name} onChangeText={set('name')} /><Field label="フリガナ" value={cv.furigana} onChangeText={set('furigana')} /><Field label="জন্মতারিখ / 生年月日" value={cv.dob} onChangeText={set('dob')} placeholder="2004-01-01" /><Field label="ফোন" value={cv.phone} onChangeText={set('phone')} keyboardType="phone-pad" /><Field label="Email" value={cv.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" /><Field label="ঠিকানা" value={cv.address} onChangeText={set('address')} /><Field label="在留資格 / Visa" value={cv.visa} onChangeText={set('visa')} /><Field label="JLPT / Japanese level" value={cv.jlpt} onChangeText={set('jlpt')} /><Field label="শিক্ষা / 学歴" multiline value={cv.education} onChangeText={set('education')} style={styles.multi} /><Field label="কাজের অভিজ্ঞতা / 職歴" multiline value={cv.experience} onChangeText={set('experience')} style={styles.multi} /><Field label="Skills" multiline value={cv.skills} onChangeText={set('skills')} style={styles.multi} /><Field label="志望動機 / Motivation" multiline value={cv.motivation} onChangeText={set('motivation')} style={styles.multi} />
    {message ? <Text style={{ color: message.includes('হয়েছে') ? colors.success : colors.danger }}>{message}</Text> : null}<PrimaryButton label={busy ? 'PDF তৈরি হচ্ছে…' : 'PDF তৈরি ও Share'} disabled={busy} onPress={makePdf} /></Screen>;
}
const styles = StyleSheet.create({ photoRow: { flexDirection: 'row', gap: 14, alignItems: 'center' }, photo: { width: 90, height: 120, borderRadius: radius.md, backgroundColor: colors.border }, photoPlaceholder: { width: 90, height: 120, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, multi: { minHeight: 100, textAlignVertical: 'top' } });
