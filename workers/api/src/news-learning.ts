type Obj = Record<string, unknown>;
type Token = {t: string; r?: string};
type SourceArticle = {id: string; headline: string};
type Lexicon = Map<string, string>;
type Vocabulary = {word: string; reading: string; meaning_bn: string};
type Lessons = {terms: Vocabulary[]; headlines: Map<string, string>};
const KANJI = /[\u3400-\u9fff]/;
const TABLE_SHA = '7985075cafbd7fbfc43808c7491787661a868312e96825b827f008acfa48b8d3';
let dictionary: Promise<Lexicon> | undefined;
let lessons: Promise<Lessons> | undefined;
const record = (v: unknown): Obj => v && typeof v === 'object' && !Array.isArray(v) ? v as Obj : {};

async function boundedBytes(stream: ReadableStream<Uint8Array>, max = 8 * 1024 * 1024) {
  const reader = stream.getReader(), chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {await reader.cancel(); throw new Error('news_learning_readings_too_large');}
    chunks.push(value);
  }
  const data = new Uint8Array(size);
  let cursor = 0;
  for (const chunk of chunks) {data.set(chunk, cursor); cursor += chunk.byteLength;}
  return data;
}

async function loadReadings(env: Env): Promise<Lexicon> {
  if (dictionary) return dictionary;
  dictionary = (async () => {
    const response = await env.ASSETS.fetch(new Request('https://app.aponar-nihon.workers.dev/assets/data/news-readings.tsv.gz', {signal: AbortSignal.timeout(10000)}));
    if (!response.ok || !response.body) throw new Error('news_learning_readings_unavailable');
    const incoming = await boundedBytes(response.body);
    // Asset services can deliver the file or its already decoded contents.
    // Both representations must match the same canonical table checksum.
    const data = incoming[0] === 0x1f && incoming[1] === 0x8b
      ? await boundedBytes(new Response(incoming).body!.pipeThrough(new DecompressionStream('gzip'))) : incoming;
    const digest = await crypto.subtle.digest('SHA-256', data);
    const sha = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
    if (sha !== TABLE_SHA) throw new Error('news_learning_readings_invalid');
    const table = new Map<string, string>();
    for (const line of new TextDecoder().decode(data).split('\n')) {
      const at = line.indexOf('\t');
      if (at > 0) table.set(line.slice(0, at), line.slice(at + 1));
    }
    return table;
  })().catch(error => {dictionary = undefined; throw error;});
  return dictionary;
}

export function headlineReadings(headline: string, table: Lexicon): Token[] {
  const result: Token[] = [];
  let cursor = 0;
  while (cursor < headline.length) {
    let word = '', readings: string[] = [];
    for (let length = Math.min(32, headline.length - cursor); length > 0; length--) {
      const text = headline.slice(cursor, cursor + length), value = table.get(text);
      // 万人 is normally ばんにん (everyone); a numerical count is 万 + 人.
      if (text === '万人' && /[0-9０-９]$/.test(headline.slice(0, cursor))) continue;
      if (value) {word = text; readings = value.split(','); break;}
    }
    if (word) {
      let reading = readings[0];
      const previous = headline.slice(0, cursor);
      if (word === '人' && /[0-9０-９万億兆]$/.test(previous) && readings.includes('にん')) reading = 'にん';
      if (word === '人' && /[ァ-ヶー]$/.test(previous) && readings.includes('じん')) reading = 'じん';
      if (word === '米' && readings.includes('こめ') && !/^(?:大学|政府|大統領|議会|企業|国|軍|株|ドル|\s)/.test(headline.slice(cursor + word.length))) reading = 'こめ';
      if (word === '余' && /[0-9０-９][十百千万億兆人年日円件社回分時％%]*$/.test(previous) && readings.includes('あまり')) reading = 'あまり';
      result.push({t: word, r: reading}); cursor += word.length;
    } else {
      const char = String.fromCodePoint(headline.codePointAt(cursor)!);
      const last = result[result.length - 1];
      if (!KANJI.test(char) && last && !last.r && !KANJI.test(last.t)) last.t += char;
      else result.push({t: char});
      cursor += char.length;
    }
  }
  return result;
}

async function loadLessons(env: Env): Promise<Lessons> {
  if (lessons) return lessons;
  lessons = (async () => {
    const response = await env.ASSETS.fetch(new Request('https://app.aponar-nihon.workers.dev/assets/data/news-source-lessons.json', {signal: AbortSignal.timeout(10000)}));
    if (!response.ok || !response.body) throw new Error('news_learning_glossary_unavailable');
    const data = record(JSON.parse(new TextDecoder().decode(await boundedBytes(response.body, 200000))));
    if (data.version !== 1) throw new Error('news_learning_glossary_invalid');
    const terms: Vocabulary[] = [];
    for (const [word, value] of Object.entries(record(data.terms))) {
      const row = record(value);
      if (word.length > 1 && word.length <= 50 && typeof row.reading === 'string' && /^[\u3040-\u30ff\sー・]+$/.test(row.reading) && row.reading.length <= 70 &&
        typeof row.meaning_bn === 'string' && /[\u0980-\u09ff]/.test(row.meaning_bn) && row.meaning_bn.length <= 100 && !/[<>]/.test(word + row.meaning_bn)) {
        terms.push({word, reading: row.reading, meaning_bn: row.meaning_bn});
      }
    }
    if (terms.length < 3) throw new Error('news_learning_glossary_invalid');
    const headlines = new Map<string, string>();
    for (const [headline, value] of Object.entries(record(data.headlines))) {
      if (headline && headline.length <= 300 && typeof value === 'string' && value.length <= 280 && /[\u0980-\u09ff]/.test(value) && !/[<>]/.test(headline + value)) headlines.set(headline, value);
    }
    return {terms: terms.sort((a, b) => b.word.length - a.word.length), headlines};
  })().catch(error => {lessons = undefined; throw error;});
  return lessons;
}

function vocabularyIn(headline: string, terms: Vocabulary[]): Vocabulary[] {
  const found: Vocabulary[] = [], seen = new Set<string>();
  // Prefer a reviewed compound to overlapping fragments, then keep source order.
  for (let cursor = 0; cursor < headline.length && found.length < 5;) {
    const term = terms.find(row => headline.startsWith(row.word, cursor));
    if (term) {
      if (!seen.has(term.word)) {found.push(term); seen.add(term.word);}
      cursor += term.word.length;
    } else cursor += String.fromCodePoint(headline.codePointAt(cursor)!).length;
  }
  return found;
}

export async function sourceNewsLessons(env: Env, articles: SourceArticle[]): Promise<Map<string, unknown>> {
  const [table, reviewed] = await Promise.all([loadReadings(env), loadLessons(env)]);
  return new Map(articles.map(article => {
    const headline = headlineReadings(article.headline, table);
    // Missing dictionary readings or reviewed meanings leave source cards pending.
    if (headline.some(token => KANJI.test(token.t) && !token.r)) return [article.id, {}] as const;
    const summary = reviewed.headlines.get(article.headline);
    const guide = 'এই পাঠে মূল জাপানি শিরোনাম, ফুরিগানা ও নির্বাচিত শব্দের বাংলা অর্থ দেওয়া আছে। বিস্তারিত ও সর্বশেষ খবর নিচের NHK লিংকে পড়ুন।';
    return [article.id, {
      id: article.id, headline_tokens: headline,
      summary_tokens: [{t: '「'}, ...headline, {t: '」というニュースです。'}],
      teaser_bn: summary || 'নতুন NHK সংবাদ—ফুরিগানা ও বাংলা শব্দার্থসহ শিরোনাম পড়ুন।',
      explanation_bn: summary ? [summary, guide] : [guide, 'খবরটির সম্পূর্ণ বাংলা অনুবাদ এখানে দেওয়া হয়নি।'],
      vocabulary: vocabularyIn(article.headline, reviewed.terms)
    }] as const;
  }));
}
