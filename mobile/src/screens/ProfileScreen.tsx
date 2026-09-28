import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Session } from '@supabase/supabase-js';
import { Field, PrimaryButton, Screen, SecondaryButton, SectionTitle } from '../components';
import { APP_ORIGIN, AUTH_REDIRECT, PASSWORD_RESET_REDIRECT } from '../config';
import { consumePasswordRecovery, supabase } from '../supabase';
import { colors, radius } from '../theme';

type Profile = {
  full_name: string | null;
  city: string | null;
  jlpt_target: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।';
}

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [jlptTarget, setJlptTarget] = useState('N5');
  const [signup, setSignup] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progressCount, setProgressCount] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase) return;
    if (consumePasswordRecovery()) setRecoveryMode(true);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user.email) setEmail(data.session.user.email);
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (next?.user.email) setEmail(next.user.email);
      if (event === 'PASSWORD_RECOVERY' || consumePasswordRecovery()) setRecoveryMode(true);
      if (event === 'SIGNED_IN' && !recoveryMode) setMessage('Login/verification সফল হয়েছে।');
    });
    return () => data.subscription.unsubscribe();
  }, [recoveryMode]);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProgressCount(null);
      return;
    }

    const userId = session.user.id;
    void Promise.all([
      supabase.from('student_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('profiles').select('full_name,city,jlpt_target').eq('id', userId).maybeSingle<Profile>()
    ]).then(([progress, profile]) => {
      setProgressCount(progress.count || 0);
      if (profile.data) {
        setFullName(profile.data.full_name || '');
        setCity(profile.data.city || '');
        setJlptTarget(profile.data.jlpt_target || 'N5');
      }
    });
  }, [session?.user?.id]);

  async function submit() {
    const client = supabase;
    if (!client || loading) return;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    if (!EMAIL_RE.test(cleanEmail)) { setMessage('সঠিক email address দিন।'); return; }
    if (password.length < 8) { setMessage('Password কমপক্ষে ৮ অক্ষরের দিন।'); return; }
    if (signup && password !== confirmPassword) { setMessage('দুইটি password এক নয়।'); return; }
    if (signup && !cleanName) { setMessage('আপনার নাম লিখুন।'); return; }

    setLoading(true);
    setMessage('');
    try {
      if (signup) {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: AUTH_REDIRECT, data: { full_name: cleanName, jlpt_target: jlptTarget } }
        });
        if (error) throw error;
        setVerificationSent(!data.session);
        setConfirmPassword('');
        setMessage(data.session
          ? 'Account তৈরি হয়েছে এবং আপনি login হয়েছেন।'
          : 'Verification email পাঠানো হয়েছে। Email-এর link চাপলে Aponar Nihon app খুলে account verify হবে।');
      } else {
        const { error } = await client.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        setPassword('');
        setMessage('Login সফল।');
      }
    } catch (error) {
      setMessage(messageFor(error));
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    const client = supabase;
    const cleanEmail = email.trim().toLowerCase();
    if (!client || loading || !EMAIL_RE.test(cleanEmail)) return;
    setLoading(true);
    try {
      const { error } = await client.auth.resend({ type: 'signup', email: cleanEmail, options: { emailRedirectTo: AUTH_REDIRECT } });
      if (error) throw error;
      setMessage('Verification email আবার পাঠানো হয়েছে।');
    } catch (error) {
      setMessage(messageFor(error));
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    const client = supabase;
    const cleanEmail = email.trim().toLowerCase();
    if (!client || loading) return;
    if (!EMAIL_RE.test(cleanEmail)) { setMessage('আগে সঠিক email লিখুন।'); return; }
    setLoading(true);
    try {
      const { error } = await client.auth.resetPasswordForEmail(cleanEmail, { redirectTo: PASSWORD_RESET_REDIRECT });
      if (error) throw error;
      setMessage('Password reset email পাঠানো হয়েছে। Link চাপলে app-এ নতুন password সেট করতে পারবেন।');
    } catch (error) {
      setMessage(messageFor(error));
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword() {
    const client = supabase;
    if (!client || !session || loading) return;
    if (newPassword.length < 8) { setMessage('নতুন password কমপক্ষে ৮ অক্ষরের দিন।'); return; }
    if (newPassword !== confirmNewPassword) { setMessage('দুইটি নতুন password এক নয়।'); return; }
    setLoading(true);
    try {
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmNewPassword('');
      setRecoveryMode(false);
      setMessage('নতুন password সফলভাবে সেট হয়েছে।');
    } catch (error) {
      setMessage(messageFor(error));
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    const client = supabase;
    if (!client || !session?.user || loading) return;
    const cleanName = fullName.trim();
    if (!cleanName) { setMessage('নাম খালি রাখা যাবে না।'); return; }
    setLoading(true);
    try {
      const { error } = await client.from('profiles').update({
        full_name: cleanName,
        city: city.trim() || null,
        jlpt_target: jlptTarget.trim().toUpperCase() || 'N5',
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', session.user.id);
      if (error) throw error;
      setMessage('Profile save হয়েছে।');
    } catch (error) {
      setMessage(messageFor(error));
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    const client = supabase;
    if (!client || loading) return;
    setLoading(true);
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      setPassword('');
      setMessage('Logout হয়েছে।');
    } catch (error) {
      setMessage(messageFor(error));
    } finally {
      setLoading(false);
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
  if (!client) return <Screen><SectionTitle title="Profile" /><Text style={styles.message}>Login service এখন পাওয়া যাচ্ছে না।</Text></Screen>;

  if (session && recoveryMode) return <Screen>
    <SectionTitle title="নতুন Password সেট করুন" subtitle="Reset link verify হয়েছে। এখন নতুন password দিন।" />
    <Field label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" />
    <Field label="Confirm new password" value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry autoCapitalize="none" />
    <PrimaryButton label={loading ? 'আপডেট হচ্ছে…' : 'Password আপডেট করুন'} onPress={updatePassword} disabled={loading} />
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </Screen>;

  if (session) return <Screen>
    <SectionTitle title="আপনার Profile" subtitle="Website ও app একই Supabase account ব্যবহার করে।" />
    <View style={styles.card}>
      <Text style={styles.email}>{session.user.email}</Text>
      <Text style={styles.meta}>Email: {session.user.email_confirmed_at ? 'Verified ✓' : 'Verification pending'}</Text>
      <Text style={styles.meta}>Progress records: {progressCount ?? '…'}</Text>
    </View>
    <Field label="নাম" value={fullName} onChangeText={setFullName} />
    <Field label="শহর" value={city} onChangeText={setCity} />
    <Field label="JLPT Target (N5/N4/N3)" value={jlptTarget} onChangeText={setJlptTarget} autoCapitalize="characters" />
    <PrimaryButton label={loading ? 'Save হচ্ছে…' : 'Profile Save করুন'} onPress={saveProfile} disabled={loading} />
    <SecondaryButton label="Daily study reminder চালু করুন" onPress={reminder} />
    <SecondaryButton label="Logout" onPress={signOut} />
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </Screen>;

  return <Screen>
    <SectionTitle title={signup ? 'Register' : 'Login'} subtitle="একই account website এবং Android/iOS app-এ ব্যবহার হবে।" />
    {signup ? <Field label="আপনার নাম" value={fullName} onChangeText={setFullName} autoCapitalize="words" /> : null}
    <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
    <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={signup ? 'new-password' : 'current-password'} />
    {signup ? <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" /> : null}
    {signup ? <Field label="JLPT Target (N5/N4/N3)" value={jlptTarget} onChangeText={setJlptTarget} autoCapitalize="characters" /> : null}
    <PrimaryButton label={loading ? 'অপেক্ষা করুন…' : signup ? 'Account তৈরি করুন' : 'Login'} onPress={submit} disabled={loading} />
    <SecondaryButton label={signup ? 'আগে account আছে? Login' : 'নতুন account? Register'} onPress={() => { if (!loading) { setSignup((value) => !value); setMessage(''); setVerificationSent(false); } }} />
    {!signup ? <SecondaryButton label="Password ভুলে গেছেন?" onPress={forgotPassword} /> : null}
    {signup && verificationSent ? <SecondaryButton label="Verification email আবার পাঠান" onPress={resendVerification} /> : null}
    {message ? <Text style={styles.message}>{message}</Text> : null}
    <Text onPress={() => Linking.openURL(`${APP_ORIGIN}/app-privacy-policy.html`)} style={styles.link}>App privacy policy</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 7 },
  email: { color: colors.text, fontSize: 18, fontWeight: '900' },
  meta: { color: colors.muted },
  message: { color: colors.text, lineHeight: 22 },
  link: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '700' }
});
