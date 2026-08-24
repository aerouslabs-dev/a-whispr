ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS team_messages_opt_out boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_words text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS pause_link boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS viewer_mode text DEFAULT 'cartoon',
  ADD COLUMN IF NOT EXISTS viewer_palette text DEFAULT 'awhispr';

ALTER TABLE public.profiles
  ALTER COLUMN age_verified SET DEFAULT false,
  ALTER COLUMN team_messages_opt_out SET DEFAULT false,
  ALTER COLUMN pause_link SET DEFAULT false,
  ALTER COLUMN viewer_mode SET DEFAULT 'cartoon',
  ALTER COLUMN viewer_palette SET DEFAULT 'awhispr';

CREATE INDEX IF NOT EXISTS profiles_team_messages_opt_out_idx ON public.profiles (team_messages_opt_out);
CREATE INDEX IF NOT EXISTS profiles_pause_link_idx ON public.profiles (pause_link);
