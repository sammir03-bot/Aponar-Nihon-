import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
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

export async function handleAuthUrl(url: string): Promise<void> {
  if (!supabase) return;
  try {
    const parsed = new URL(url);
    const code = parsed.searchParams.get('code');
    if (code) await supabase.auth.exchangeCodeForSession(code);
  } catch {
    // Invalid/unrelated app links are ignored.
  }
}
