import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Session } from '@supabase/supabase-js';
import { Field, PrimaryButton, Screen, SecondaryButton, SectionTitle } from '../components';
import { APP_ORIGIN, AUTH_REDIRECT, PASSWORD_RESET_REDIRECT } from '../config';
import { consumePasswordRecovery, supabase } from '../supabase';
import { colors, radius } from '../theme';

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [signup, setSignup] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [message, setMessage] = useState('');
  const [progressCount, setProgressCount] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase) return;
    if (consumePasswordRecovery()) setRecoveryMode(true);
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'PASSWORD_RECOVERY' || consumePasswordRecovery()) setRecoveryMode(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) { setProgressCount(null); return; }
    supabase.from('student_progress').select('*', { count: 'exact', head: true }).then(({ count }) => setProgressCount(count || 0));
  }, [session?.user?.id]);

  async function submit() {
    const client = supabase;
    if (!client) { setMessage('Login service configure করা হয়নি।'); return; }
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) { setMessage('Email এবং password দিন।'); return; }
    setMessage('');
    if (signup) {
      const { error } = await client.auth.signUp({ email: cleanEmail, password, options: { emailRedirectTo: AUTH_REDIRECT } });
      setMessage(error ? error.message : 'Verification email পাঠানো হয়েছে। Email-এর link চাপলে Aponar Nihon app খুলে account verify হবে।');
    } else {
      const { error } = await client.auth.signInWithPassword({ email: cleanEmail, password });
      setMessage(error ? error.message : 'Login সফল।');
    }
  }

  async function forgotPassword() {
    const client = supabase;
    const cleanEmail = email.trim();
    if (!client || !cleanEmail) { setMessage('আগে আপনার email লিখুন।'); return; }
    const { error } = await client.auth.resetPasswordForEmail(cleanEmail, { redirectTo: PASSWORD_RESET_REDIRECT });
    setMessage(error ? error.message : 'Password reset email পাঠানো হয়েছে। Link চাপলে app-এ নতুন password সেট করতে পারবেন।');
  }

  async function updatePassword() {
    const client = supabase;
    if (!client || !session) { setMessage('Reset session পাওয়া যায়নি। আবার reset email নিন।'); return; }
    if (newPassword.length < 8) { setMessage('নতুন password কমপক্ষে ৮ অক্ষরের দিন।'); return; }
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) { setMessage(error.message); return; }
    setNewPassword('');
    setRecoveryMode(false);
    setMessage('নতুন password সফলভাবে সেট হয়েছে।');
  }

  async function reminder() {
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) { setMessage('Notification permission দেওয়া হয়নি।'); return; }
    await Notifications.cancelScheduledNotificationAsync('daily-study').catch(() => {});
    await Notifications.scheduleNotificationAsync({ identifier: 'daily-study', content: { title: 'Aponar Nihon', body: 'আজকের Japanese lesson আর Daily News দেখে নিন 🇯🇵' }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 19, minute: 0 } });
    setMessage('প্রতিদিন সন্ধ্যা ৭টার study reminder চালু হয়েছে।');
  }

  const client = supabase;
  if (!client) return <Screen><SectionTitle title="Profile" /><Text style={styles.message}>Login service এখন পাওয়া যাচ্ছে না।</Text></Screen>;

  if (session && recoveryMode) return <Screen><SectionTitle title="নতুন Password সেট করুন" subtitle="Reset link verify হয়েছে। এখন নতুন password দিন।" /><Field label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry /><PrimaryButton label="Password আপডেট করুন" onPress={updatePassword} />{message ? <Text style={styles.message}>{message}</Text> : null}</Screen>;

  if (session) return <Screen><SectionTitle title="আপনার Profile" subtitle="Website ও app একই Supabase account ব্যবহার করে।" /><View style={styles.card}><Text style={styles.email}>{session.user.email}</Text><Text style={styles.meta}>User ID: {session.user.id}</Text><Text style={styles.meta}>Progress records: {progressCount ?? '…'}</Text></View><PrimaryButton label="Daily study reminder চালু করুন" onPress={reminder} /><SecondaryButton label="Logout" onPress={async () => { await client.auth.signOut(); setMessage('Logout হয়েছে।'); }} />{message ? <Text style={styles.message}>{message}</Text> : null}</Screen>;

  return <Screen><SectionTitle title={signup ? 'Register' : 'Login'} subtitle="একই account website এবং Android/iOS app-এ।" /><Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry /><PrimaryButton label={signup ? 'Account তৈরি করুন' : 'Login'} onPress={submit} /><SecondaryButton label={signup ? 'আগে account আছে? Login' : 'নতুন account? Register'} onPress={() => setSignup((v) => !v)} />{!signup ? <SecondaryButton label="Password ভুলে গেছেন?" onPress={forgotPassword} /> : null}{message ? <Text style={styles.message}>{message}</Text> : null}<Text onPress={() => Linking.openURL(`${APP_ORIGIN}/app-privacy-policy.html`)} style={styles.link}>App privacy policy</Text></Screen>;
}

const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 7 }, email: { color: colors.text, fontSize: 18, fontWeight: '900' }, meta: { color: colors.muted }, message: { color: colors.text, lineHeight: 22 }, link: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '700' } });
