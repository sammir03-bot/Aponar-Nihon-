# Aponar Nihon production cutover

Official production origin: `https://app.aponar-nihon.workers.dev`.

Use this checklist only after Site Quality and Browser Quality are green on the final branch head.

## Cloudflare

1. Keep the Workers account subdomain as `aponar-nihon`.
2. Keep the Worker name as `app` (`name = "app"` in `wrangler.toml`).
3. Keep `workers_dev = true`.
4. Verify `https://app.aponar-nihon.workers.dev/` and `/api/health` after each production deploy.
5. No custom-domain DNS or nameserver change is required for this production setup.

The legacy `aponar-nihon.eu.cc` value may remain in untouched source HTML for content preservation, but the production build rewrites legacy absolute-origin references to the official Workers URL without changing visible educational text. `CNAME` is excluded from the Workers build output.

## Supabase Auth

Authentication URL settings must accept the official origin:

- `https://app.aponar-nihon.workers.dev/**`

Keep localhost redirects only if local development still uses them. Browser code derives OAuth/email redirects from the current origin, so the Supabase allow-list must include the hostname users actually open.

## GitHub

After the official Workers URL passes smoke tests:

1. Merge PR #2 into `main`.
2. Change Cloudflare Workers Builds production branch from `professional-refactor-20260825` to `main`.
3. Confirm the first `main` Cloudflare build is green.
4. Keep the refactor branch briefly as a rollback reference.

## Rollback

If a deployment regresses, restore the last known-good Worker version. The migration keeps the original educational source HTML protected by visible-text integrity checks and does not delete lesson content.
