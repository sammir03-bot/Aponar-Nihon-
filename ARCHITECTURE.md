# Aponar Nihon Architecture

Aponar Nihon is a static-first full-stack Japanese learning platform. The architecture uses each technology only where it is strongest while protecting every existing lesson, example, explanation and URL.

## Production stack

- **Frontend:** semantic HTML + modern CSS + JavaScript/TypeScript.
- **Web tooling:** Node.js 22 for TypeScript compilation, quality automation and CI commands.
- **Content processing:** Python for static build, content-integrity validation, search-index generation, corpus tools and internal-link diagnostics.
- **Database/Auth:** Supabase for authentication, profiles, student progress and activity history. Generated TypeScript database types live in `src/types/supabase.ts`.
- **Hosting/CDN target:** Cloudflare Pages for the static site and global edge delivery. GitHub Pages remains supported during migration.
- **Backend API:** Cloudflare Workers. The secure foundation lives in `workers/api/` and exposes health/config routes without putting server secrets in browser code.
- **Android:** Java/Kotlin only for native Android code under `android/`.
- **Testing:** Playwright for real-browser mobile/desktop smoke tests and Lighthouse CI for performance, accessibility, best-practices and SEO budgets.
- **Security:** Cloudflare `_headers`, CSP, Permissions-Policy, referrer policy, MIME sniffing protection, safe external links, origin checks and automated quality checks.

## Zero-content-loss rule

`tools/build_site.py` computes a SHA-256 digest of the human-visible text of every HTML page before and after build-time enhancement. Script and style bodies are excluded. If build-time work changes visible educational text, the build stops instead of deploying.

Existing HTML remains the source of truth while migration is in progress. Content is never moved or rewritten merely to alter GitHub language percentages.

## Build pipeline

`npm run verify` is the main quality command:

1. TypeScript is compiled from `src/ts/` into generated browser JavaScript.
2. Python creates `_site`, injects shared professional CSS/JS/TypeScript runtime and validates visible-text integrity.
3. Python generates the local search index and reports broken internal links.
4. Node.js audits the generated site and writes a machine-readable quality report.
5. CI verifies critical generated assets before deployment.

Development-only directories and configuration are excluded from the published `_site` output.

## Browser quality

`Browser Quality` CI builds the same verified site, then runs Playwright on Chromium in mobile and desktop modes. Critical pages are checked for successful rendering, document language, page title, runtime initialization and duplicate IDs. Lighthouse CI adds measurable performance, accessibility, best-practice and SEO budgets.

## Cloudflare backend

`wrangler.toml` configures the `aponar-nihon-api` Worker. `workers/api/src/index.ts` applies an origin allow-list, CORS policy, no-store caching and defensive response headers. Sensitive API keys must be stored as Cloudflare Worker secrets, never in HTML, CSS, browser JavaScript or the repository.

## Supabase

The active database currently contains the platform tables `profiles`, `student_progress` and `activity_events`, with authenticated-user policies already present. Frontend code should use the publishable client key only. Service-role credentials must never be shipped to browsers.

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
