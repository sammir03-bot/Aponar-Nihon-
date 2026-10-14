# WORM GPT integration for Aponar Nihon

Adds an authenticated WORM GPT provider to the existing AI Tutor without exposing any provider secret in the frontend.

## Implemented

- Supabase Edge Function worm-tutor deployed on project xgudgxnkolpqfovfmijl, with JWT verification enabled.
- Per-user upstream credentials stored in public.worm_tutor_users (created and RLS locked down).
- Automatically calls create-user only when no upstream identity has been saved for a signed-in Aponar Nihon user.
- Uses new-chat, send-message (SSE), list-chats, and get-history endpoints.
- The existing N5/N4/N3 levels and teaching modes are retained.
- The original /api/tutor fallback remains available for guests or while WORM is not configured.
- A chat history button appears when the authenticated WORM integration is configured.

## To activate

1. Rotate the previously shared WORM API key before production use.
2. Open Supabase dashboard, project aponar-nihon, Edge Function Secrets. Add name WORM_API_KEY and set its value to the newly rotated API key. Save. It is available immediately; no Edge Function redeploy is needed for secret updates.
3. Merge this branch after review. Redeploy the website files to Cloudflare Workers at app.aponar-nihon.workers.dev. GitHub changes alone do not establish a Cloudflare production deployment.
4. Sign into Aponar Nihon and open /tutor-section.html. Test Bengali-Japanese grammar, streaming output, New chat, and chat history.
5. Test without signing in: the existing /api/tutor fallback should still run.

## Endpoint summary

Client calls https://xgudgxnkolpqfovfmijl.supabase.co/functions/v1/worm-tutor with Supabase Auth bearer token, public apikey header, and JSON Content-Type.
- GET returns whether WORM_API_KEY is configured.
- POST action=new-chat creates a conversation.
- POST action=send-message accepts message, conversation_id, level, mode and depth and streams SSE response.
- POST action=list-chats lists conversations for this signed-in user.
- POST action=get-history accepts conversation_id and returns that chat's messages.

## Security and limitations

- Never put the WORM API key, user_id, or access_key in HTML, browser JS or GitHub source.
- The per-user mapping table has RLS enabled, anon/authenticated SQL grants revoked, and only service_role may access it.
- WORM data is processed by a third-party API, whose privacy and retention rules apply.
- The supplied upstream API does not document a delete-chat or delete-user endpoint.
- No unlimited usage can be guaranteed; the external provider and Supabase may impose their own quotas.
- The old 20/day cap remains on the original API fallback; it is bypassed only when the WORM connection is active.
- Full end-to-end tests require adding the WORM_API_KEY secret and deploying the frontend after review.
