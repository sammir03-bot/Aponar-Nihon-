export const APP_ORIGIN = (process.env.EXPO_PUBLIC_APP_ORIGIN || 'https://app.aponar-nihon.workers.dev').replace(/\/$/, '');
export const API_ORIGIN = APP_ORIGIN;
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xgudgxnkolpqfovfmijl.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const remote = {
  dailyNews: `${APP_ORIGIN}/assets/data/daily-news.json`,
  mobileContentIndex: `${APP_ORIGIN}/assets/data/mobile-content/index.json`,
  mobileContent: (id: string) => `${APP_ORIGIN}/assets/data/mobile-content/${encodeURIComponent(id)}.json`,
  halalCertificates: `${APP_ORIGIN}/assets/data/halal-certificates.json`,
  tutor: `${API_ORIGIN}/api/tutor`
} as const;

export function authConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}
