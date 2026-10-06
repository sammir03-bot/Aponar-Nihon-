import { DurableObject } from "cloudflare:workers";
import { sourceNewsLessons } from "./news-learning";

type Obj = Record<string, unknown>;
type Token = {t: string; r?: string};
type Article = {
  id: string; date: string; level: string; category_bn: string; headline: string;
  headline_tokens: Token[]; teaser_bn: string; japanese: Token[][];
  explanation_bn: string[]; vocabulary: {word: string; reading: string; meaning_bn: string}[];
  source: {name: string; url: string; published_at: string};
  learning_status: "ready" | "pending"; source_excerpt?: string; reading_version?: string;
};
type State = {articles: Article[]; last_checked: number; last_success: number; last_error: string; learning_checked?: number; learning_error?: string; learning_version?: string};
const RSS = "https://www.nhk.or.jp/rss/news/cat0.xml";
const INTERVAL = 3 * 60 * 60 * 1000;
const LEARNING_VERSION = "20261007.news7";
const NOTE = "NHK-এর মূল শিরোনাম, উন্মুক্ত IPADIC অভিধানের ফুরিগানা ও যাচাই করা বাংলা শব্দার্থ দিয়ে তৈরি পাঠ। পর্যালোচিত বাংলা সারাংশ পাওয়া গেলে দেখানো হয়। পুরো খবর ও সর্বশেষ তথ্য মূল উৎসে পড়ুন।";
const record = (v: unknown): Obj => v && typeof v === "object" && !Array.isArray(v) ? v as Obj : {};
const plain = (v: unknown, max = 500): string => typeof v === "string" ? v.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max) : "";
const bn = (v: string): boolean => /[\u0980-\u09ff]/.test(v);
export function tokyoDate(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(value);
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}
function decodeXml(value: string): string {
  return value.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_match, code: string) => {
      const point = code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : "";
    }).replace(/&(amp|lt|gt|quot|apos);/g, (_match, name: string) => ({amp: "&", lt: "<", gt: ">", quot: '"', apos: "'"}[name] || ""));
}
export async function parseNewsRss(xml: string, now = new Date()): Promise<Article[]> {
  if (xml.length > 1_000_000 || !/<rss\b/i.test(xml)) throw new Error("invalid_news_feed");
  const out: Article[] = [], seen = new Set<string>();
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    if (out.length >= 30) break;
    const field = (name: string): string => plain(decodeXml(match[1].match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] || ""), name === "description" ? 350 : 300);
    const headline = field("title"), url = field("link"), published = new Date(field("pubDate"));
    let sourceUrl: URL;
    try { sourceUrl = new URL(url); } catch { continue; }
    if (sourceUrl.protocol !== "https:" || !["news.web.nhk", "www3.nhk.or.jp", "www.nhk.or.jp"].includes(sourceUrl.hostname) || sourceUrl.username || sourceUrl.password) continue;
    if (!headline || !Number.isFinite(published.getTime()) || published.getTime() > now.getTime() || now.getTime() - published.getTime() > 7 * 86400000) continue;
    sourceUrl.hash = "";
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sourceUrl.href));
    const id = "nhk-" + Array.from(new Uint8Array(hash)).map(n => n.toString(16).padStart(2, "0")).join("").slice(0, 20);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({id, date: tokyoDate(published), level: "ニュース", category_bn: "জাপানের খবর", headline,
      headline_tokens: [{t: headline}], teaser_bn: "NHK-এর নতুন সংবাদ। বাংলা পাঠ প্রস্তুত হচ্ছে; মূল উৎসে খবরটি পড়তে পারবেন।",
      japanese: [[{t: headline}]], explanation_bn: ["এই খবরের বাংলা ব্যাখ্যা এখনও প্রস্তুত হয়নি। অনুমান করে বিস্তারিত লেখা হয়নি; নিচের মূল উৎসের লিংক ব্যবহার করুন।"],
      vocabulary: [], source: {name: "NHK", url: sourceUrl.href, published_at: published.toISOString()}, learning_status: "pending", source_excerpt: field("description")});
  }
  return out.sort((a, b) => b.source.published_at.localeCompare(a.source.published_at));
}
function tokens(value: unknown, maxText = 500): Token[] {
  if (!Array.isArray(value)) return [];
  const out = value.slice(0, 150).map(v => {
    const row = record(v), t = typeof row.t === "string" ? row.t.replace(/<[^>]*>/g, "").slice(0, 180) : "";
    const r = plain(row.r, 100);
    return {t, ...(r && /^[\u3040-\u30ff\u3000\sー・]+$/.test(r) ? {r} : {})};
  }).filter(t => t.t);
  return out.map(t => t.t).join("").length <= maxText ? out : [];
}
function alignHeadline(source: string, parts: Token[]): Token[] {
  const joined = parts.map(part => part.t).join("");
  if (joined === source) return parts;
  // Only whitespace may differ. Names, numbers and every other source
  // character must still match before readings can attach to the headline.
  if (joined.replace(/\s/g, "") !== source.replace(/\s/g, "")) return [];
  const aligned: Token[] = [];
  let cursor = 0;
  for (const part of parts) {
    const text = part.t.replace(/\s/g, "");
    if (!text) continue;
    const gap = cursor;
    while (cursor < source.length && /\s/.test(source[cursor])) cursor++;
    if (cursor > gap) aligned.push({t: source.slice(gap, cursor)});
    const start = cursor;
    let chars = 0;
    while (cursor < source.length && chars < text.length) {
      if (!/\s/.test(source[cursor])) chars++;
      cursor++;
    }
    aligned.push({...part, t: source.slice(start, cursor)});
  }
  if (cursor < source.length) aligned.push({t: source.slice(cursor)});
  return aligned;
}
function validateNewsLearning(article: Article, value: unknown): {article: Article; issue: string} {
  const v = record(value), headline = alignHeadline(article.headline, tokens(v.headline_tokens, 300)), summary = tokens(v.summary_tokens, 400);
  const teaser = plain(v.teaser_bn, 280);
  const explanation = Array.isArray(v.explanation_bn) ? v.explanation_bn.slice(0, 2).map(p => plain(p, 500)).filter(bn) : [];
  const vocabulary = Array.isArray(v.vocabulary) ? v.vocabulary.slice(0, 5).map(item => {
    const row = record(item);
    return {word: plain(row.word, 50), reading: plain(row.reading, 70), meaning_bn: plain(row.meaning_bn, 100)};
  }).filter(item => item.word && item.reading && bn(item.meaning_bn) && (article.headline + summary.map(t => t.t).join("")).includes(item.word)) : [];
  const issue = !Object.keys(v).length ? "missing_card" : headline.map(t => t.t).join("") !== article.headline ? "headline_mismatch" : !summary.length ? "summary_missing" : !bn(teaser) || !explanation.length ? "bengali_missing" : vocabulary.length < 3 ? "vocabulary_missing" : [...headline, ...summary].some(t => /[\u3400-\u9fff]/.test(t.t) && !t.r) ? "reading_missing" : "";
  if (issue) return {article, issue};
  const result = {...article, headline_tokens: headline, teaser_bn: teaser, japanese: [summary], explanation_bn: explanation, vocabulary, learning_status: "ready" as const};
  delete result.source_excerpt;
  return {article: result, issue: ""};
}
export function applyNewsLearning(article: Article, value: unknown): Article {
  return validateNewsLearning(article, value).article;
}
async function boundedText(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader(), chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) { await reader.cancel(); throw new Error("news_response_too_large"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(bytes);
}
async function buildLearning(env: Env, articles: Article[]): Promise<Map<string, unknown>> {
  return sourceNewsLessons(env, articles);
}
function pendingSource(article: Article): Article {
  return {...article, headline_tokens: [{t: article.headline}], japanese: [[{t: article.headline}]],
    teaser_bn: "NHK-এর নতুন সংবাদ। বাংলা পাঠ প্রস্তুত হচ্ছে; মূল উৎসে খবরটি পড়তে পারবেন।",
    explanation_bn: ["এই খবরের বাংলা পাঠ এখনও প্রস্তুত হয়নি। নিচের মূল উৎসের লিংক ব্যবহার করুন।"],
    vocabulary: [], learning_status: "pending", reading_version: ""};
}

// A single persistent feed deduplicates source refreshes across visitors.
export class DailyNewsFeed extends DurableObject<Env> {
  private refreshing: Promise<State> | null = null;
  private async state(): Promise<State> {
    const [meta, stored] = await Promise.all([
      this.ctx.storage.get<Omit<State, "articles">>("feed-meta-v1"),
      this.ctx.storage.list<Article>({prefix: "article:"})
    ]);
    return {...(meta || {last_checked: 0, last_success: 0, last_error: ""}), articles: [...stored.values()].sort((a, b) => b.source.published_at.localeCompare(a.source.published_at))};
  }
  private async persist(state: State): Promise<void> {
    // Each card has its own small storage value; a growing archive never hits
    // the per-value limit of the key-value storage API.
    for (let offset = 0; offset < state.articles.length; offset += 100) {
      await this.ctx.storage.put(Object.fromEntries(state.articles.slice(offset, offset + 100).map(a => ["article:" + a.id, a])));
    }
    const keep = new Set(state.articles.map(a => "article:" + a.id));
    const old = await this.ctx.storage.list({prefix: "article:"});
    const removed = [...old.keys()].filter(key => !keep.has(key));
    if (removed.length) await this.ctx.storage.delete(removed);
    await this.ctx.storage.put("feed-meta-v1", {last_checked: state.last_checked, last_success: state.last_success, last_error: state.last_error,
      learning_checked: state.learning_checked || 0, learning_error: state.learning_error || "", learning_version: state.learning_version || ""});
  }
  private refresh(): Promise<State> {
    if (this.refreshing) return this.refreshing;
    this.refreshing = this.update().finally(() => { this.refreshing = null; });
    return this.refreshing;
  }
  private async enrich(saved: State): Promise<State> {
    const pending = saved.articles.filter(a => a.learning_status !== "ready" || a.reading_version !== LEARNING_VERSION).slice(0, 3);
    if (!pending.length || (saved.learning_version === LEARNING_VERSION && Date.now() - (saved.learning_checked || 0) < 15 * 60000)) return saved;
    saved.learning_version = LEARNING_VERSION;
    saved.learning_checked = Date.now();
    await this.persist(saved);
    try {
      const learning = await buildLearning(this.env, pending);
      saved.articles = saved.articles.map(a => {
        if (!pending.some(row => row.id === a.id)) return a;
        const updated = applyNewsLearning(pendingSource(a), learning.get(a.id));
        return updated.learning_status === "ready" ? {...updated, reading_version: LEARNING_VERSION} : updated;
      });
      const issue = pending.map(a => validateNewsLearning(a, learning.get(a.id)).issue).find(Boolean);
      saved.learning_error = issue ? "news_learning_" + issue : "";
    } catch (error) {
      const reason = error instanceof Error ? error.message : "";
      saved.learning_error = /^news_learning_[a-z0-9_]+$/.test(reason) ? reason : "news_learning_failed";
    }
    await this.persist(saved);
    if (saved.learning_error) console.warn(JSON.stringify({event: "news_learning_unavailable", reason: saved.learning_error}));
    return saved;
  }
  private async update(): Promise<State> {
    const saved = await this.state(), now = Date.now();
    // Back off after failures; public page views cannot trigger repeated upstream calls.
    if (now - saved.last_checked < (saved.last_error ? 15 * 60000 : INTERVAL)) return this.enrich(saved);
    saved.last_checked = now;
    await this.persist(saved);
    try {
      const res = await fetch(RSS, {headers: {"User-Agent": "AponarNihon/1.2 (+https://app.aponar-nihon.workers.dev/contact)", Accept: "application/rss+xml, application/xml"}, signal: AbortSignal.timeout(12000)});
      if (!res.ok) throw new Error("news_source_" + res.status);
      const feed = await parseNewsRss(await boundedText(res, 1000000));
      if (!feed.length) throw new Error("news_feed_empty");
      const current = new Map(feed.map(a => [a.id, a]));
      saved.articles = saved.articles.map(a => {
        const revision = current.get(a.id);
        // A source correction keeps its ID and invalidates the older lesson.
        return revision && revision.headline !== a.headline ? revision : a;
      });
      const known = new Set(saved.articles.map(a => a.id));
      const perDay = new Map<string, number>();
      for (const a of saved.articles) perDay.set(a.date, (perDay.get(a.date) || 0) + 1);
      const added: Article[] = [];
      for (const a of feed) {
        if (added.length >= 3) break;
        if (known.has(a.id) || (perDay.get(a.date) || 0) >= 6) continue;
        added.push(a); perDay.set(a.date, (perDay.get(a.date) || 0) + 1);
      }
      saved.articles = [...added, ...saved.articles].sort((a, b) => b.source.published_at.localeCompare(a.source.published_at)).slice(0, 300);
      saved.last_success = now; saved.last_error = "";
      // Persist source-backed headlines before optional language enrichment.
      await this.persist(saved);
      await this.enrich(saved);
      console.log(JSON.stringify({event: "daily_news_refreshed", added: added.length, articles: saved.articles.length, latest: saved.articles[0]?.date}));
    } catch (error) {
      saved.last_error = error instanceof Error ? error.message : "news_service_unavailable";
      await this.persist(saved);
      console.error(JSON.stringify({event: "daily_news_refresh_failed", reason: saved.last_error}));
    }
    return saved;
  }
  async fetch(request: Request): Promise<Response> {
    const refreshRequest = request.method === "POST" && new URL(request.url).pathname === "/refresh";
    if (request.method !== "GET" && !refreshRequest) return new Response("Method not allowed", {status: 405});
    let state = await this.state();
    if (refreshRequest || !state.articles.length) state = await this.refresh();
    else if (Date.now() - state.last_checked >= (state.last_error ? 15 * 60000 : INTERVAL) ||
      (state.articles.some(a => a.learning_status !== "ready" || a.reading_version !== LEARNING_VERSION) && (state.learning_version !== LEARNING_VERSION || Date.now() - (state.learning_checked || 0) >= 15 * 60000))) this.ctx.waitUntil(this.refresh());
    const articles = state.articles.map(a => { const row = a.reading_version === LEARNING_VERSION ? {...a} : pendingSource(a); delete row.source_excerpt; return row; });
    return Response.json({ok: !!articles.length, articles, updated_at: state.last_success ? new Date(state.last_success).toISOString() : null,
      checked_at: state.last_checked ? new Date(state.last_checked).toISOString() : null, latest_date: articles[0]?.date || null,
      update_status: state.last_error ? "source_unavailable" : "live", learning_error: state.learning_error || null,
      editorial_note_bn: NOTE, refresh_interval_hours: 3},
      {status: articles.length ? 200 : 503, headers: {"cache-control": "no-store", "x-content-type-options": "nosniff"}});
  }
}

export function newsFeed(env: Env): DurableObjectStub {
  return env.DAILY_NEWS.get(env.DAILY_NEWS.idFromName("daily-news-v1"));
}
