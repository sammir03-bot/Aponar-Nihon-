# Aponar Nihon production cutover

Use this checklist only after Site Quality and Browser Quality are green on the final branch head.

## Cloudflare

1. Open Workers & Pages → `aponar-nihon-web` → Domains.
2. Add the canonical custom domain `aponar-nihon.eu.cc` to the Worker.
3. Let Cloudflare create/verify the DNS target and TLS certificate.
4. Keep the `workers.dev` hostname enabled until the custom domain is verified.
5. Open the custom domain in a private browser and verify `/`, `/n5-grammar.html`, `/n4-grammar.html`, `/n3-grammar.html`, `/auth.html`, `/profile.html`, and `/api/health`.

Do not add a guessed `routes` entry to `wrangler.toml` before Cloudflare confirms the zone/domain binding in the dashboard.

## Supabase Auth

Before testing OAuth/email redirects on the custom domain, ensure the Supabase Authentication URL configuration accepts:

- `https://aponar-nihon.eu.cc/**`
- the current `workers.dev` preview URL while preview testing is still needed

Keep localhost redirect URLs only if local development still uses them. Browser code derives OAuth redirects from the current origin, so the allowed redirect list must match the hostname users are testing.

## GitHub

After the custom-domain smoke test is green:

1. Merge PR #2 into `main`.
2. Change Cloudflare Workers Builds production branch from `professional-refactor-20260825` to `main`.
3. Confirm the first `main` Cloudflare build is green.
4. Keep the branch/Workers preview available briefly as a rollback reference.

## Rollback

If the custom-domain deployment has a regression, switch the Cloudflare deployment/version back to the last known-good Worker version or temporarily restore the previous domain target. The architecture keeps GitHub Pages as a fallback path and never removes the original educational source HTML during the migration.
