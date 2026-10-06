type Obj = Record<string, unknown>;
type Token = {t: string; r?: string};
type Translator = (text: string) => Promise<string>;
type SourceArticle = {id: string; headline: string};
type Lexicon = Map<string, string>;
const KANJI = /[\u3400-\u9fff]/;
const TABLE_SHA = '7985075cafbd7fbfc43808c7491787661a868312e96825b827f008acfa48b8d3';
let dictionary: Promise<Lexicon> | undefined;
const record = (v: unknown): Obj => v && typeof v === 'object' && !Array.isArray(v) ? v as Obj : {};

async function boundedBytes(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader(), chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8 * 1024 * 1024) {await reader.cancel(); throw new Error('news_learning_readings_too_large');}
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

function bengaliTranslator(env: Env): Translator {
  const cache = new Map<string, Promise<string>>(), waiting: (() => void)[] = [];
  let active = 0;
  return (text: string) => {
    if (cache.has(text)) return cache.get(text)!;
    const promise = (async () => {
      if (active < 4) active++; else await new Promise<void>(resolve => waiting.push(resolve));
      try {
        const output = record(await env.AI.run('@cf/meta/m2m100-1.2b', {text, source_lang: 'ja', target_lang: 'bn'}, {signal: AbortSignal.timeout(15000)}));
        const translated = typeof output.translated_text === 'string' ? output.translated_text.replace(/<[^>]*>/g, '').trim().slice(0, 500) : '';
        return /[\u0980-\u09ff]/.test(translated) ? translated : '';
      } catch {return '';}
      finally {const next = waiting.shift(); if (next) next(); else active--;}
    })();
    cache.set(text, promise);
    return promise;
  };
}

export async function sourceNewsLessons(env: Env, articles: SourceArticle[]): Promise<Map<string, unknown>> {
  const table = await loadReadings(env), translate = bengaliTranslator(env);
  const rows = await Promise.all(articles.map(async article => {
    const headline = headlineReadings(article.headline, table);
    // Missing dictionary readings remain pending rather than guessing a name.
    if (headline.some(token => KANJI.test(token.t) && !token.r)) return [article.id, {}] as const;
    const words = [...new Map(headline.filter(token => token.r && token.t.length > 1).map(token => [token.t, token])).values()].slice(0, 5);
    const [translation, meanings] = await Promise.all([translate(article.headline), Promise.all(words.map(token => translate(token.t)))]);
    return [article.id, {
      id: article.id, headline_tokens: headline,
      summary_tokens: [{t: '「'}, ...headline, {t: '」というニュースです。'}],
      teaser_bn: translation, explanation_bn: [translation, 'পাঠটি মূল সংবাদ শিরোনামের অনুবাদ। বিস্তারিত ও সর্বশেষ তথ্য নিচের NHK লিংকে পড়ুন।'],
      vocabulary: words.map((token, index) => ({word: token.t, reading: token.r, meaning_bn: meanings[index]}))
    }] as const;
  }));
  return new Map(rows);
}
