# Aponar Nihon Architecture

Aponar Nihon is a static-first full-stack Japanese learning platform. The architecture uses each technology only where it is strongest while protecting every existing lesson, example, explanation and URL.

## Production stack

- **Frontend:** semantic HTML + modern CSS + JavaScript/TypeScript.
- **Web tooling:** Node.js 22 for TypeScript compilation, quality automation and CI commands.
- **Content processing:** Python for static build, content-integrity validation, search-index generation, corpus tools, safe legacy-link repair and internal-link diagnostics.
- **Database/Auth:** Supabase for authentication, profiles, student progress and activity history. Generated TypeScript database types live in `src/types/supabase.ts`.
- **Hosting/CDN:** Cloudflare Workers Static Assets serves the verified `_site` build globally at the edge. The official production origin is `https://app.aponar-nihon.workers.dev`. GitHub Pages remains supported for rollback/fallback.
- **Backend API:** the same Cloudflare Worker handles `/api/*` before static assets. The secure foundation lives in `workers/api/` and keeps server secrets out of browser code.
- **Android:** Java/Kotlin only for native Android code under `android/`.
- **Testing:** Playwright for real-browser mobile/desktop smoke tests and Lighthouse CI for performance, accessibility, best-practices and SEO budgets.
- **Security:** Cloudflare `_headers`, CSP, HSTS, Permissions-Policy, referrer policy, MIME sniffing protection, safe external links, origin checks, Supabase RLS and automated quality checks.

## Zero-content-loss rule

Content protection is deliberately redundant:

1. `tools/compare_visible_content.py` compares every HTML file already present on `origin/main` with the architecture branch. If a source page disappears or its human-visible text changes, CI fails.
2. `tools/build_site.py` computes a SHA-256 digest of human-visible text before and after build-time enhancement. Script and style bodies are excluded. Asset injection, production-origin migration, legacy-link repair and security hardening are therefore allowed only when they leave educational text unchanged.

Existing HTML remains the source of truth while migration is in progress. Content is never moved, removed or rewritten merely to alter GitHub language percentages.

## Build pipeline

`npm run verify` is the main quality command:

1. TypeScript types and Worker code are type-checked.
2. TypeScript browser code is compiled from `src/ts/` into generated JavaScript.
3. Python creates `_site` and safely rewrites legacy absolute-origin references from `https://aponar-nihon.eu.cc` to `https://app.aponar-nihon.workers.dev` without changing visible educational text.
4. Python injects shared professional CSS/JS/TypeScript runtime.
5. Python safely repairs known legacy internal URLs and adds `noopener noreferrer` to generated `_blank` links without changing visible text.
6. Python generates the local search index and reports any internal links that still cannot resolve.
7. Node.js audits the generated site and writes `assets/data/site-audit.json` with warnings, sizes and SHA-256 file hashes.
8. Playwright exercises critical N5/N4/N3, auth/profile, mock-test and mobile-navigation flows; Lighthouse CI enforces performance/accessibility/SEO budgets.
9. Wrangler deploys the Worker plus `_site` static assets to Cloudflare.

Development-only directories and configuration are excluded from the published `_site` output. The legacy root `CNAME` file is also excluded from the Worker artifact because production uses `workers.dev` directly.

## Browser quality

`Browser Quality` CI builds the same verified site and runs Chromium in mobile and desktop modes. It checks critical page rendering, document language, page titles, generated assets, important home links, runtime initialization, duplicate IDs and mobile dock sizing. Lighthouse CI adds measurable performance, accessibility, best-practice and SEO budgets.

Playwright uses the current stable test runner while Lighthouse CI remains pinned to its latest stable release. These CI-only tools are installed transiently and are not shipped in the production browser bundle.

## Cloudflare delivery and backend

`wrangler.toml` configures the Worker name as `app`, with `_site` as the static-asset directory and `workers_dev = true`. With the Cloudflare account subdomain `aponar-nihon`, the canonical production URL is `https://app.aponar-nihon.workers.dev`.

Static pages/assets are served at Cloudflare's edge, while `/api/*` is routed through `workers/api/src/index.ts` first. The Worker accepts secure same-origin requests on the deployed Worker origin and applies CORS, no-store caching for API responses and defensive response headers.

Cloudflare Workers Builds is connected to GitHub and currently uses `professional-refactor-20260825` as its production branch for verification. After final verification and merge, the Cloudflare production branch should be changed to `main`.

`tools/live_smoke.mjs` and the `Live Preview Smoke` GitHub workflow target `https://app.aponar-nihon.workers.dev` and check the deployed homepage, learning pages, auth/profile routes and `/api/health`.

No custom-domain DNS or nameserver configuration is required for the current production strategy. A custom domain can be added later without changing the underlying Worker architecture.

## Supabase

The active database contains `profiles`, `student_progress` and `activity_events` with RLS policies for user-owned data and admin access. Browser code uses only the publishable key. PUBLIC/anonymous execution of `touch_profile_activity()` has been revoked while authenticated use remains available. Service-role credentials must never be shipped to browsers.

Supabase Authentication redirect settings must allow `https://app.aponar-nihon.workers.dev/**` for OAuth/email flows on the production site.

## Design principles

- Preserve all existing user-facing content and URLs.
- Static-first for speed, SEO, reliability and low hosting cost.
- Progressive enhancement: educational content remains readable even when JavaScript fails.
- Mobile-first interaction and accessibility-friendly focus/touch targets.
- Shared components and generated assets instead of repeated page-specific overrides.
- TypeScript for new browser logic; legacy JavaScript can migrate gradually.
- Python for content integrity and generation; Node.js for web engineering and CI.
- Cloudflare Workers only where server-side logic or secret isolation is actually needed.
- Supabase RLS remains the primary protection for per-user database records.
