import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient, processLock, type EmailOtpType } from '@supabase/supabase-js';
import { authConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';

const SECURE_CHUNK_SIZE = 1800;

function chunkKey(key: string, index: number) {
  return `${key}.__chunk_${index}`;
}

function chunkCountKey(key: string) {
  return `${key}.__chunks`;
}

async function storedChunkCount(key: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(chunkCountKey(key));
  const count = Number(raw || 0);
  return Number.isInteger(count) && count > 0 ? count : 0;
}

const storage = {
  async getItem(key: string): Promise<string | null> {
    const count = await storedChunkCount(key);
    if (!count) return SecureStore.getItemAsync(key);
    const chunks = await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(chunkKey(key, index))));
    if (chunks.some((value) => value === null)) return null;
    return chunks.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    const previousCount = await storedChunkCount(key);
    const chunks = Array.from({ length: Math.ceil(value.length / SECURE_CHUNK_SIZE) }, (_, index) => value.slice(index * SECURE_CHUNK_SIZE, (index + 1) * SECURE_CHUNK_SIZE));
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk)));
    await SecureStore.setItemAsync(chunkCountKey(key), String(chunks.length));
    await SecureStore.deleteItemAsync(key).catch(() => {});
    if (previousCount > chunks.length) {
      await Promise.all(Array.from({ length: previousCount - chunks.length }, (_, offset) => SecureStore.deleteItemAsync(chunkKey(key, chunks.length + offset)).catch(() => {})));
    }
  },
  async removeItem(key: string): Promise<void> {
    const count = await storedChunkCount(key);
    await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.deleteItemAsync(chunkKey(key, index)).catch(() => {})));
    await SecureStore.deleteItemAsync(chunkCountKey(key)).catch(() => {});
    await SecureStore.deleteItemAsync(key).catch(() => {});
  }
};

let passwordRecoveryPending = false;

export const supabase = authConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        lock: processLock
      }
    })
  : null;

if (supabase && Platform.OS !== 'web') {
  if (AppState.currentState === 'active') void supabase.auth.startAutoRefresh();
  else void supabase.auth.stopAutoRefresh();

  AppState.addEventListener('change', (state) => {
    if (state === 'active') void supabase.auth.startAutoRefresh();
    else void supabase.auth.stopAutoRefresh();
  });
}

function authParams(url: string): URLSearchParams {
  const params = new URLSearchParams();
  const queryStart = url.indexOf('?');
  const hashStart = url.indexOf('#');
  const queryEnd = hashStart >= 0 ? hashStart : url.length;

  if (queryStart >= 0) {
    const query = new URLSearchParams(url.slice(queryStart + 1, queryEnd));
    query.forEach((value, key) => params.set(key, value));
  }
  if (hashStart >= 0) {
    const hash = new URLSearchParams(url.slice(hashStart + 1));
    hash.forEach((value, key) => params.set(key, value));
  }
  return params;
}

export function consumePasswordRecovery(): boolean {
  const pending = passwordRecoveryPending;
  passwordRecoveryPending = false;
  return pending;
}

export async function handleAuthUrl(url: string): Promise<void> {
  if (!supabase || !url.startsWith('aponarnihon://')) return;

  const params = authParams(url);
  const type = params.get('type') as EmailOtpType | null;
  if (url.startsWith('aponarnihon://auth/reset') || type === 'recovery') passwordRecoveryPending = true;

  const errorDescription = params.get('error_description') || params.get('error');
  if (errorDescription) throw new Error(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));

  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw error;
    return;
  }

  const tokenHash = params.get('token_hash');
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) throw error;
  }
}
