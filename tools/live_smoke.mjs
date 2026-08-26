#!/usr/bin/env node
import process from 'node:process';

const base = (process.env.ANON_LIVE_BASE_URL || 'https://app.aponar-nihon.workers.dev').replace(/\/$/, '');
const checks = [
  ['/', ['text/html']],
  ['/n5-grammar.html', ['text/html']],
  ['/n4-grammar.html', ['text/html']],
  ['/n3-grammar.html', ['text/html']],
  ['/n3-vocabulary.html', ['text/html']],
  ['/mock-test.html', ['text/html']],
  ['/auth.html', ['text/html']],
  ['/profile.html', ['text/html']],
  ['/robots.txt', ['text/plain']],
  ['/sitemap.xml', ['application/xml', 'text/xml']],
  ['/api/health', ['application/json']],
];

const failures = [];

for (const [pathname, expectedTypes] of checks) {
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
    if (!expectedTypes.some((type) => contentType.toLowerCase().includes(type))) {
      failures.push(`${pathname}: expected ${expectedTypes.join(' or ')}, got ${contentType || 'no content-type'}`);
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
    } else if (pathname === '/robots.txt') {
      if (!body.includes(`Sitemap: ${base}/sitemap.xml`)) {
        failures.push(`${pathname}: production sitemap declaration missing`);
        continue;
      }
    } else if (pathname === '/sitemap.xml') {
      if (!body.includes(`<loc>${base}/</loc>`) || !body.includes('<urlset')) {
        failures.push(`${pathname}: sitemap root URL missing`);
        continue;
      }
    } else if (!/<html\b/i.test(body) || !/<title>[\s\S]*?<\/title>/i.test(body)) {
      failures.push(`${pathname}: HTML shell/title missing`);
      continue;
    } else if (pathname === '/' && !body.includes(`<link rel="canonical" href="${base}/">`)) {
      failures.push(`${pathname}: production canonical missing`);
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
