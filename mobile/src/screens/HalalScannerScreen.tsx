import React, { useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import { analyzeIngredients, getVerifiedCertificate, lookupFoodProduct, type FoodProduct, type HalalCertificate, type IngredientAnalysis } from '../api';
import { Field, PrimaryButton, Screen, SecondaryButton, SectionTitle } from '../components';
import { colors, radius } from '../theme';

const HISTORY_KEY = 'aponarNihonHalalHistoryV2';
type HistoryItem = { code: string; name: string; status: string; at: number };

export default function HalalScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState(false);
  const [locked, setLocked] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [manual, setManual] = useState('');
  const [product, setProduct] = useState<FoodProduct | null>(null);
  const [analysis, setAnalysis] = useState<IngredientAnalysis | null>(null);
  const [certificate, setCertificate] = useState<HalalCertificate | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => { SecureStore.getItemAsync(HISTORY_KEY).then((value) => { if (value) { try { setHistory(JSON.parse(value)); } catch {} } }); }, []);
  async function saveHistory(item: HistoryItem) { const next = [item, ...history.filter((x) => x.code !== item.code)].slice(0, 10); setHistory(next); await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(next)); }
  async function check(codeValue: string) {
    if (busy) return; setBusy(true); setMessage(''); setCamera(false); setLocked(true);
    try {
      const p = await lookupFoodProduct(codeValue); setProduct(p); setBarcode(p.code);
      const a = analyzeIngredients(p.ingredients); setAnalysis(a);
      const cert = await getVerifiedCertificate(p.code); setCertificate(cert);
      const status = cert ? 'certified' : a.status;
      await saveHistory({ code: p.code, name: p.name, status, at: Date.now() });
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Product check করা যায়নি।'); setProduct(null); setAnalysis(null); setCertificate(null); }
    finally { setBusy(false); setTimeout(() => setLocked(false), 900); }
  }
  function manualAnalyze() { const a = analyzeIngredients(manual); setProduct({ code: '', name: 'Manual ingredient check', brand: '', image: '', ingredients: manual }); setAnalysis(a); setCertificate(null); }
  async function openCamera() { if (!permission?.granted) { const result = await requestPermission(); if (!result.granted) { setMessage('Camera permission প্রয়োজন। Barcode number লিখেও check করতে পারবেন।'); return; } } setCamera(true); setLocked(false); }
  const verdict = certificate ? { title: 'Verified Halal Certificate পাওয়া গেছে', text: `${certificate.certifier}${certificate.valid_until ? ` • valid until ${certificate.valid_until}` : ''}`, color: colors.success, bg: colors.successSoft } : analysis?.status === 'danger' ? { title: 'Haram concern পাওয়া গেছে', text: 'Ingredient list-এ pork/pig-derived বা alcohol-related signal মিলেছে।', color: colors.danger, bg: colors.dangerSoft } : analysis?.status === 'doubt' ? { title: 'Source যাচাই প্রয়োজন', text: 'Source-dependent ingredient পাওয়া গেছে। Certification বা manufacturer source যাচাই করুন।', color: colors.warning, bg: colors.warningSoft } : analysis?.status === 'clear' ? { title: 'স্পষ্ট নিষিদ্ধ ingredient signal মেলেনি', text: 'এটি Halal certification নয়। Verified certificate না থাকলে app “Halal certified” দাবি করবে না।', color: colors.primary, bg: colors.primarySoft } : null;
  return <Screen>
    <SectionTitle title="Halal Scanner" subtitle="Barcode + ingredient screening; certificate status আলাদা ও পরিষ্কার।" />
    {camera ? <View style={styles.cameraWrap}><CameraView style={styles.cameraFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','upc_a','upc_e','code128'] }} onBarcodeScanned={locked ? undefined : ({ data }) => { setLocked(true); setBarcode(data); check(data); }} /><View style={styles.frame} /><Pressable onPress={() => setCamera(false)} style={styles.close}><Text style={{ color: '#fff', fontWeight: '900' }}>বন্ধ</Text></Pressable></View> : <PrimaryButton label="📷 Camera দিয়ে barcode scan" onPress={openCamera} />}
    <Field label="Barcode number" keyboardType="number-pad" value={barcode} onChangeText={(v) => setBarcode(v.replace(/\D/g, ''))} placeholder="7–14 digit barcode" />
    <PrimaryButton label={busy ? 'Check হচ্ছে…' : 'Product check'} disabled={busy} onPress={() => check(barcode)} />
    <Field label="Ingredient list (manual)" multiline value={manual} onChangeText={setManual} placeholder="原材料名 paste করুন..." style={{ minHeight: 100, textAlignVertical: 'top' }} />
    <SecondaryButton label="Ingredient analyse" onPress={manualAnalyze} />
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {product ? <View style={styles.result}>{product.image ? <Image source={{ uri: product.image }} style={styles.productImage} /> : null}<Text style={styles.productName}>{product.name}</Text>{product.brand ? <Text style={styles.meta}>{product.brand}</Text> : null}{product.code ? <Text style={styles.meta}>Barcode: {product.code}</Text> : null}{verdict ? <View style={[styles.verdict, { backgroundColor: verdict.bg }]}><Text style={[styles.verdictTitle, { color: verdict.color }]}>{verdict.title}</Text><Text style={styles.verdictText}>{verdict.text}</Text></View> : null}
      <View style={styles.cert}><Text style={styles.certTitle}>Certificate verification</Text>{certificate ? <><Text style={styles.text}>Certifier: {certificate.certifier}</Text>{certificate.certificate_id ? <Text style={styles.text}>Certificate: {certificate.certificate_id}</Text> : null}<Pressable onPress={() => Linking.openURL(certificate.source_url)}><Text style={styles.link}>Official/record source খুলুন ↗</Text></Pressable></> : <Text style={styles.text}>Verified certificate record পাওয়া যায়নি। Ingredient screening-কে certification হিসেবে দেখানো হচ্ছে না।</Text>}</View>
      {analysis?.danger.map((item, i) => <Text key={`d-${i}`} style={styles.flag}>⚠️ {item.label}: {item.matched}</Text>)}{analysis?.doubt.map((item, i) => <Text key={`q-${i}`} style={styles.flag}>🔎 {item.label}: {item.matched}</Text>)}{product.ingredients ? <Text style={styles.ingredients}>{product.ingredients}</Text> : <Text style={styles.meta}>Ingredient list database-এ নেই।</Text>}</View> : null}
    {history.length ? <View style={{ gap: 8 }}><Text style={styles.productName}>Recent scans</Text>{history.map((item) => <Pressable key={`${item.code}-${item.at}`} onPress={() => { setBarcode(item.code); check(item.code); }} style={styles.history}><Text style={styles.text}>{item.name}</Text><Text style={styles.meta}>{item.code} • {item.status}</Text></Pressable>)}</View> : null}
  </Screen>;
}
const styles = StyleSheet.create({ cameraWrap: { height: 320, overflow: 'hidden', borderRadius: radius.lg, backgroundColor: '#000' }, cameraFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, frame: { position: 'absolute', left: '12%', right: '12%', top: '32%', height: 100, borderWidth: 2, borderColor: '#fff', borderRadius: 14 }, close: { position: 'absolute', right: 14, top: 14, backgroundColor: '#0009', padding: 10, borderRadius: radius.pill }, result: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 10 }, productImage: { width: 90, height: 90, borderRadius: radius.md, backgroundColor: colors.bg }, productName: { color: colors.text, fontWeight: '900', fontSize: 18 }, meta: { color: colors.muted }, verdict: { padding: 14, borderRadius: radius.md, gap: 5 }, verdictTitle: { fontWeight: '900', fontSize: 17 }, verdictText: { color: colors.text, lineHeight: 22 }, cert: { borderWidth: 1, borderColor: colors.border, padding: 13, borderRadius: radius.md, gap: 6 }, certTitle: { color: colors.text, fontWeight: '900' }, text: { color: colors.text, lineHeight: 22 }, link: { color: colors.primary, fontWeight: '800' }, flag: { color: colors.text, lineHeight: 22 }, ingredients: { color: colors.text, lineHeight: 22, backgroundColor: colors.bg, padding: 12, borderRadius: radius.md }, history: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface }, message: { color: colors.danger, lineHeight: 22 } });