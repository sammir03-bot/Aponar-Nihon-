# Security Policy

## Secret handling

Never commit Supabase service-role keys, Cloudflare API tokens, AI provider keys, private signing keys or other privileged credentials. Browser code may contain only explicitly publishable/public configuration. Server secrets belong in Cloudflare Worker secrets, GitHub Actions secrets or the relevant provider's secret store.

## Browser security

Cloudflare Pages reads `_headers` and applies CSP plus defensive browser headers. The initial CSP is intentionally compatibility-first because the existing site uses several external CDNs. Tighten allowed origins gradually after automated inventory/testing rather than breaking current learning content.

## Database security

Supabase Row Level Security remains enabled for user-facing tables. Client operations must be scoped to the signed-in user. Administrative or service-role operations must run only in trusted server-side code.

## Backend API

Cloudflare Worker APIs must validate origin, authentication/authorization where applicable, request shape and rate limits before performing privileged work. API responses use no-store caching for sensitive routes and defensive security headers.

## CI safety

The build blocks deployment if build-time enhancement changes human-visible HTML text. Node.js, Playwright and Lighthouse checks provide additional metadata, browser, accessibility, performance and security regression detection.

## Reporting

For a suspected credential leak, rotate the affected credential immediately before making unrelated code changes. Remove exposed secrets from active configuration even if Git history is later cleaned.
