import { APP_ORIGIN, remote } from './config';

export type TutorLevel = 'N5' | 'N4' | 'N3';
export type TutorMode = 'learn' | 'correct' | 'conversation' | 'interview' | 'quiz' | 'translate';
export type TutorDepth = 'quick' | 'standard' | 'deep';
export type TutorHistoryItem = { role: 'user' | 'bot'; text: string };

export type DailyNewsToken = string | { t: string; r?: string };
export type DailyNewsArticle = {
  id: string;
  date: string;
  level: string;
  category_bn?: string;
  headline: string;
  headline_tokens?: DailyNewsToken[];
  teaser_bn?: string;
  image_url?: string;
  image_alt_bn?: string;
  japanese?: DailyNewsToken[][];
  explanation_bn?: string[];
  vocabulary?: Array<{ word: string; reading?: string; meaning_bn: string }>;
  source?: { name?: string; url?: string; published_at?: string };
};

export type MobileContentIndexItem = {
  id: string;
  path: string;
  title: string;
  block_count: number;
};
export type MobileContentIndex = { generated_at: string; pages: MobileContentIndexItem[] };
export type ContentBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list_item'; text: string; ordered?: boolean }
  | { type: 'image'; src: string; alt?: string }
  | { type: 'link'; href: string; text: string }
  | { type: 'table_row'; cells: string[] };
export type MobileContent = { id: string; path: string; title: string; blocks: ContentBlock[] };

export type FoodProduct = { code: string; name: string; brand: string; image: string; ingredients: string };
export type IngredientAnalysis = {
  status: 'danger' | 'doubt' | 'clear' | 'unknown';
  danger: Array<{ label: string; matched: string }>;
  doubt: Array<{ label: string; matched: string }>;
  text: string;
};
export type HalalCertificate = {
  barcode: string;
  product_name?: string;
  certifier: string;
  certificate_id?: string;
  valid_until?: string;
  source_url: string;
  verified: true;
};

type CertificateFile = { updated_at?: string; certificates?: HalalCertificate[] };

const DANGER_RULES = [
  { label: 'Pork / pig-derived', pattern: /豚肉|豚脂|豚エキス|豚由来|ポーク|ラード|pork|porcine|lard|bacon|ベーコン/i },
  { label: 'Alcohol-related ingredient', pattern: /酒精|アルコール|みりん|味醂|料理酒|清酒|日本酒|洋酒|ワイン|ブランデー|ラム酒|alcohol|ethanol|wine|brandy|\brum\b/i }
];
const DOUBT_RULES = [
  { label: 'Gelatin — source check', pattern: /ゼラチン|gelatin/i },
  { label: 'Shortening — source check', pattern: /ショートニング|shortening/i },
  { label: 'Emulsifier / E471-E472 — source check', pattern: /乳化剤|emulsifier|\bE[- ]?471\b|\bE[- ]?472[a-z]?\b/i },
  { label: 'Animal fat — source check', pattern: /動物油脂|animal\s+fat/i },
  { label: 'Glycerin — source check', pattern: /グリセリン|グリセロール|glycerin|glycerol/i },
  { label: 'Enzyme — source check', pattern: /酵素|enzyme/i },
  { label: 'Rennet — source check', pattern: /レンネット|rennet/i },
  { label: 'Flavoring — source may vary', pattern: /香料|flavou?r(?:ing)?/i },
  { label: 'Ham — meat source check', pattern: /(^|[^a-z])ham([^a-z]|$)|ハム/i },
  { label: 'Fermented seasoning — source check', pattern: /発酵調味料/i }
];

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export async function askTutor(input: {
  message: string;
  history: TutorHistoryItem[];
  clientId: string;
  level: TutorLevel;
  mode: TutorMode;
  depth: TutorDepth;
  language?: string;
}): Promise<string> {
  const data = await jsonFetch<{ ok: boolean; response?: string; message?: string }>(remote.tutor, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-client-id': input.clientId },
    body: JSON.stringify({ ...input, language: input.language || 'bn' })
  });
  if (!data.ok || !data.response) throw new Error(data.message || 'AI Tutor উত্তর দিতে পারেনি।');
  return data.response;
}

export async function getDailyNews(): Promise<DailyNewsArticle[]> {
  const data = await jsonFetch<{ articles?: DailyNewsArticle[] }>(remote.dailyNews);
  return data.articles || [];
}

export function tokensToText(tokens: DailyNewsToken[] | undefined, furigana: boolean): string {
  if (!tokens) return '';
  return tokens.map((token) => {
    if (typeof token === 'string') return token;
    if (furigana && token.r) return `${token.t}（${token.r}）`;
    return token.t;
  }).join('');
}

export async function getMobileContentIndex(): Promise<MobileContentIndex> {
  return jsonFetch<MobileContentIndex>(remote.mobileContentIndex);
}

export async function getMobileContent(id: string): Promise<MobileContent> {
  return jsonFetch<MobileContent>(remote.mobileContent(id));
}

export function resolveAsset(src: string, sourcePath = ''): string {
  if (/^https?:\/\//i.test(src)) return src;
  try {
    return new URL(src, `${APP_ORIGIN}/${sourcePath}`).toString();
  } catch {
    return `${APP_ORIGIN}/${src.replace(/^\//, '')}`;
  }
}

export function analyzeIngredients(value: string): IngredientAnalysis {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return { status: 'unknown', danger: [], doubt: [], text: '' };
  const match = (rules: typeof DANGER_RULES) => rules.flatMap((rule) => {
    const found = text.match(rule.pattern);
    return found ? [{ label: rule.label, matched: found[0].trim() }] : [];
  });
  const danger = match(DANGER_RULES);
  const doubt = match(DOUBT_RULES);
  return { status: danger.length ? 'danger' : doubt.length ? 'doubt' : 'clear', danger, doubt, text };
}

export async function lookupFoodProduct(rawCode: string): Promise<FoodProduct> {
  const code = rawCode.replace(/\D/g, '').slice(0, 18);
  if (code.length < 7 || code.length > 14) throw new Error('সঠিক 7–14 digit barcode দিন।');
  const fields = ['code','product_name','product_name_ja','product_name_en','brands','ingredients_text','ingredients_text_ja','ingredients_text_en','image_front_small_url','image_front_url'].join(',');
  const url = `https://world.openfoodfacts.org/api/v3.6/product/${encodeURIComponent(code)}.json?cc=jp&lc=ja&fields=${encodeURIComponent(fields)}`;
  const data = await jsonFetch<any>(url, { headers: { Accept: 'application/json' } });
  const p = data?.product || data;
  if (!p) throw new Error('Product পাওয়া যায়নি।');
  return {
    code: p.code || code,
    name: p.product_name_ja || p.product_name || p.product_name_en || 'নাম পাওয়া যায়নি',
    brand: p.brands || '',
    image: p.image_front_small_url || p.image_front_url || '',
    ingredients: p.ingredients_text_ja || p.ingredients_text || p.ingredients_text_en || ''
  };
}

export async function getVerifiedCertificate(barcode: string): Promise<HalalCertificate | null> {
  try {
    const file = await jsonFetch<CertificateFile>(remote.halalCertificates);
    const normalized = barcode.replace(/\D/g, '');
    const match = (file.certificates || []).find((item) => item.verified && item.barcode === normalized);
    if (!match) return null;
    if (match.valid_until && new Date(match.valid_until).getTime() < Date.now()) return null;
    return match;
  } catch {
    return null;
  }
}
