-- Already applied on 2026-10-14 to the connected aponar-nihon Supabase project.
-- Safe to re-run, and no provider secrets are present here.
CREATE TABLE IF NOT EXISTS public.worm_tutor_users (
  owner_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  upstream_user_id text NOT NULL,
  upstream_access_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.worm_tutor_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.worm_tutor_users FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.worm_tutor_users TO service_role;
COMMENT ON TABLE public.worm_tutor_users IS 'WORM GPT credentials per Aponar Nihon account; server/service-role access only.';
