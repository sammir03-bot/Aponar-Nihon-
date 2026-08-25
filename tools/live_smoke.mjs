#!/usr/bin/env node
import process from 'node:process';

const base = (process.env.ANON_LIVE_BASE_URL || 'https://aponar-nihon-web.sammir160432.workers.dev').replace(/\/$/, '');
const checks = [
  ['/', 'text/html'],
  ['/n5-grammar.html', 'text/html'],
  ['/n4-grammar.html', 'text/html'],
  ['/n3-grammar.html', 'text/html'],
  ['/n3-vocabulary.html', 'text/html'],
  ['/mock-test.html', 'text/html'],
  ['/auth.html', 'text/html'],
  ['/profile.html', 'text/html'],
  ['/api/health', 'application/json'],
];

const failures = [];

for (const [pathname, expectedType] of checks) {
  const url = new URL(pathname, `${base}/`);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Aponar-Nihon-Live-Smoke/1.0' },
    });
    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();

    if (!response.ok) {
      failures.push(`${pathname}: HTTP ${response.status}`);
      continue;
    }
    if (!contentType.toLowerCase().includes(expectedType)) {
      failures.push(`${pathname}: expected ${expectedType}, got ${contentType || 'no content-type'}`);
      continue;
    }
    if (pathname === '/api/health') {
      try {
        const data = JSON.parse(body);
        if (data?.ok !== true || data?.service !== 'aponar-nihon-api') {
          failures.push(`${pathname}: unexpected health payload`);
          continue;
        }
      } catch {
        failures.push(`${pathname}: invalid JSON payload`);
        continue;
      }
    } else if (!/<html\b/i.test(body) || !/<title>[\s\S]*?<\/title>/i.test(body)) {
      failures.push(`${pathname}: HTML shell/title missing`);
      continue;
    }

    console.log(`PASS ${pathname} ${response.status} ${contentType}`);
  } catch (error) {
    failures.push(`${pathname}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}

console.log(`Live smoke passed: ${checks.length} checks against ${base}`);
