import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Session } from '@supabase/supabase-js';
import { Field, PrimaryButton, Screen, SecondaryButton, SectionTitle } from '../components';
import { supabase } from '../supabase';
import { colors, radius } from '../theme';

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signup, setSignup] = useState(false);
  const [message, setMessage] = useState('');
  const [progressCount, setProgressCount] = useState<number | null>(null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!supabase || !session?.user) { setProgressCount(null); return; }
    supabase.from('student_progress').select('*', { count: 'exact', head: true }).then(({ count }) => setProgressCount(count || 0));
  }, [session?.user?.id]);
  async function submit() {
    const client = supabase;
    if (!client) { setMessage('Supabase publishable key configure করা হয়নি।'); return; }
    setMessage('');
    if (signup) {
      const { error } = await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: 'aponarnihon://auth/callback' } });
      setMessage(error ? error.message : 'Verification email পাঠানো হয়েছে। App link দিয়ে account verify করুন।');
    } else {
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      setMessage(error ? error.message : 'Login সফল।');
    }
  }
  async function reminder() {
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) { setMessage('Notification permission দেওয়া হয়নি।'); return; }
    await Notifications.cancelScheduledNotificationAsync('daily-study').catch(() => {});
    await Notifications.scheduleNotificationAsync({ identifier: 'daily-study', content: { title: 'Aponar Nihon', body: 'আজকের Japanese lesson আর Daily News দেখে নিন 🇯🇵' }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 19, minute: 0 } });
    setMessage('প্রতিদিন সন্ধ্যা ৭টার study reminder চালু হয়েছে।');
  }
  const client = supabase;
  if (!client) return <Screen><SectionTitle title="Profile" /><Text style={styles.message}>Mobile `.env`-এ Supabase publishable key যোগ করলে login/profile চালু হবে। Secret/service-role key কখনো app-এ রাখা হবে না।</Text></Screen>;
  if (session) return <Screen><SectionTitle title="আপনার Profile" subtitle="Website ও app একই Supabase account ব্যবহার করে।" /><View style={styles.card}><Text style={styles.email}>{session.user.email}</Text><Text style={styles.meta}>User ID: {session.user.id}</Text><Text style={styles.meta}>Progress records: {progressCount ?? '…'}</Text></View><PrimaryButton label="Daily study reminder চালু করুন" onPress={reminder} /><SecondaryButton label="Logout" onPress={async () => { await client.auth.signOut(); setMessage('Logout হয়েছে।'); }} />{message ? <Text style={styles.message}>{message}</Text> : null}</Screen>;
  return <Screen><SectionTitle title={signup ? 'Register' : 'Login'} subtitle="একই account website এবং Android/iOS app-এ।" /><Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry /><PrimaryButton label={signup ? 'Account তৈরি করুন' : 'Login'} onPress={submit} /><SecondaryButton label={signup ? 'আগে account আছে? Login' : 'নতুন account? Register'} onPress={() => setSignup((v) => !v)} />{message ? <Text style={styles.message}>{message}</Text> : null}<Text onPress={() => Linking.openURL('https://app.aponar-nihon.workers.dev/privacy.html')} style={styles.link}>Privacy policy</Text></Screen>;
}
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 7 }, email: { color: colors.text, fontSize: 18, fontWeight: '900' }, meta: { color: colors.muted }, message: { color: colors.text, lineHeight: 22 }, link: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '700' } });