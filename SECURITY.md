# Security Policy

## Secret handling

Never commit Supabase service-role keys, Cloudflare API tokens, AI provider keys, private signing keys or other privileged credentials. Browser code may contain only explicitly publishable/public configuration. Server secrets belong in Cloudflare Worker secrets, GitHub Actions secrets or the relevant provider's secret store.

## Browser security

Cloudflare Workers Static Assets applies the repository `_headers` policy to the verified `_site` build. HSTS, CSP, Permissions-Policy, Referrer-Policy, MIME-sniffing protection and frame restrictions are compatibility-first because the existing site still uses several external CDNs and inline legacy code. Tighten external origins gradually after browser tests prove that learning, auth and media flows remain intact.

All generated `target="_blank"` links are hardened at build time with `rel="noopener noreferrer"`. The runtime keeps the same protection for links created dynamically in the browser.

## Database security

Supabase Row Level Security remains enabled for `profiles`, `student_progress` and `activity_events`. Client operations are scoped to the signed-in user, with admin access controlled by `is_admin()` and the existing RLS policies.

`touch_profile_activity()` is executable only by `authenticated`, `service_role` and the database owner; PUBLIC/anonymous execution has been revoked by migration `restrict_touch_profile_activity_execution`.

Supabase's database advisor still reports warning-level exposure for authenticated GraphQL table discovery and the intentionally callable administrative SECURITY DEFINER RPCs. These are not being silenced by removing permissions the application relies on: the tables remain protected by RLS, while the admin RPCs use a fixed `search_path` and explicit `is_admin()` authorization. Any redesign of those RPCs should happen together with admin regression tests rather than by blindly revoking access.

Supabase's leaked-password protection is currently disabled. It should be enabled in Authentication settings when the project plan supports it.

## Backend API

The official production origin is `https://app.aponar-nihon.workers.dev`. Cloudflare Worker APIs validate allowed origins and always accept the actual request origin for same-origin deployments. Sensitive routes use no-store caching and defensive response headers. Any future privileged endpoint must also validate authentication/authorization, request shape and rate limits.

Supabase Authentication URL settings must allow `https://app.aponar-nihon.workers.dev/**` for OAuth and email redirects used by the production site.

## CI safety

This architecture PR has two independent content guards:

1. GitHub CI compares every existing source HTML file with `origin/main` and fails if a file disappears or human-visible text changes.
2. The Python build hashes human-visible text before and after build-time enhancement and fails if production-origin migration, injected CSS/JS, link repair or security hardening alters visible educational content.

Node.js audit, Playwright and Lighthouse add metadata, browser, accessibility, performance and security regression detection. Broken legacy links are repaired only in generated `_site` markup, leaving source lessons untouched. A separate live-smoke workflow checks the deployed `https://app.aponar-nihon.workers.dev` site and `/api/health` after deployment.

## Reporting

For a suspected credential leak, rotate the affected credential immediately before making unrelated code changes. Remove exposed secrets from active configuration even if Git history is later cleaned.
