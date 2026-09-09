import { spawn } from 'node:child_process';

const origin = 'https://app.aponar-nihon.workers.dev';
const tail = spawn('npx', ['--yes', 'wrangler@4', 'tail', '--format=pretty'], { detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
let pending = '';
function inspect(chunk) {
  pending = (pending + chunk.toString()).slice(-20000);
  const lines = pending.split('\n'); pending = lines.pop() || '';
  for (const line of lines) {
    const match = line.match(/\{[^{}]*"event":"i18n_[^{}]*\}/);
    if (!match) continue;
    try {
      const event = JSON.parse(match[0]);
      // Print only localization status; never request headers, addresses or input text.
      console.log(JSON.stringify(Object.fromEntries(['event', 'reason', 'language', 'items', 'model', 'duration_ms'].filter(key => key in event).map(key => [key, event[key]]))));
    } catch { /* Ignore incomplete log frames. */ }
  }
}
tail.stdout.on('data', inspect); tail.stderr.on('data', inspect);
tail.on('error', error => console.log(JSON.stringify({ tail: error.code || 'unavailable' })));
try {
  await new Promise(resolve => setTimeout(resolve, 10000));
  const results = await Promise.all(['ja', 'my', 'si'].map(async targetLanguage => {
    const payload = JSON.stringify({ page: 'language-quality-check', targetLanguage, items: [{ id: 'name', text: 'আপনার নাম লিখুন।' }, { id: 'date', text: '৯ সেপ্টেম্বর ২০২৬' }] });
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const started = Date.now();
      try {
        const reply = await fetch(`${origin}/api/i18n/translate`, {
          method: 'POST', headers: { 'content-type': 'application/json', origin }, signal: AbortSignal.timeout(30000), body: payload
        });
        const body = await reply.json();
        const complete = reply.ok && body.ok === true && body.translations?.length === 2;
        console.log(JSON.stringify({ language: targetLanguage, attempt, status: reply.status, complete, error: body.error || null, duration_ms: Date.now() - started }));
        if (complete) return true;
      } catch (error) {
        console.log(JSON.stringify({ language: targetLanguage, attempt, complete: false, error: error.name, duration_ms: Date.now() - started }));
      }
      if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    }
    return false;
  }));
  if (results.some(complete => !complete)) process.exitCode = 1;
} finally {
  try { if (tail.pid) process.kill(-tail.pid, 'SIGTERM'); } catch { /* Already stopped. */ }
}
