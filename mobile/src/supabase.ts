import * as SecureStore from 'expo-secure-store';
import { createClient, type EmailOtpType } from '@supabase/supabase-js';
import { authConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';

const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key)
};

export const supabase = authConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    })
  : null;

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

export async function handleAuthUrl(url: string): Promise<void> {
  if (!supabase || !url.startsWith('aponarnihon://')) return;

  const params = authParams(url);
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
  const type = params.get('type') as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) throw error;
  }
}
