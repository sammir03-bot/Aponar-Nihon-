# Security Policy

## Secret handling

Never commit Supabase service-role keys, Cloudflare API tokens, AI provider keys, private signing keys or other privileged credentials. Browser code may contain only explicitly publishable/public configuration. Server secrets belong in Cloudflare Worker secrets, GitHub Actions secrets or the relevant provider's secret store.

## Browser security

Cloudflare Workers Static Assets applies the repository `_headers` policy to the verified `_site` build. CSP, Permissions-Policy, Referrer-Policy, MIME-sniffing protection and frame restrictions are compatibility-first because the existing site still uses several external CDNs. Tighten external origins gradually after browser tests prove that learning, auth and media flows remain intact.

All generated `target="_blank"` links are hardened at build time with `rel="noopener noreferrer"`. The runtime keeps the same protection for links created dynamically in the browser.

## Database security

Supabase Row Level Security remains enabled for `profiles`, `student_progress` and `activity_events`. Client operations are scoped to the signed-in user, with admin access controlled by `is_admin()` and the existing RLS policies.

`touch_profile_activity()` is executable only by `authenticated`, `service_role` and the database owner; PUBLIC/anonymous execution has been revoked. Administrative SECURITY DEFINER RPCs keep an explicit `is_admin()` authorization check and a fixed `search_path`. Revisit SECURITY DEFINER only together with admin-flow regression tests.

Supabase's leaked-password protection should be enabled in Authentication settings when the project plan supports it. Supabase documents this protection as a Pro-plan-and-above feature.

## Backend API

Cloudflare Worker APIs validate allowed origins and accept the actual request origin for same-origin deployments, so the same code works on the `workers.dev` preview and a future custom domain. Sensitive routes use no-store caching and defensive response headers. Any future privileged endpoint must also validate authentication/authorization, request shape and rate limits.

## CI safety

This architecture PR has two independent content guards:

1. GitHub CI compares every existing source HTML file with `origin/main` and fails if a file disappears or human-visible text changes.
2. The Python build hashes human-visible text before and after build-time enhancement and fails if injected CSS/JS, link repair or security hardening alters visible educational content.

Node.js audit, Playwright and Lighthouse add metadata, browser, accessibility, performance and security regression detection. Broken legacy links are repaired only in generated `_site` markup, leaving source lessons untouched.

## Reporting

For a suspected credential leak, rotate the affected credential immediately before making unrelated code changes. Remove exposed secrets from active configuration even if Git history is later cleaned.
