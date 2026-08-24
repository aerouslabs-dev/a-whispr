CREATE TABLE IF NOT EXISTS public.whispers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  vibe_tag text,
  ai_reply text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.whispers TO authenticated;
GRANT INSERT ON public.whispers TO anon;
GRANT ALL ON public.whispers TO service_role;

ALTER TABLE public.whispers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a whisper" ON public.whispers
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Recipients read own whispers" ON public.whispers
  FOR SELECT TO authenticated USING (recipient_id = (SELECT auth.uid()));

CREATE POLICY "Recipients delete own whispers" ON public.whispers
  FOR DELETE TO authenticated USING (recipient_id = (SELECT auth.uid()) OR public.is_admin());

CREATE INDEX IF NOT EXISTS whispers_recipient_idx ON public.whispers (recipient_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (lower(username));

CREATE OR REPLACE FUNCTION public.handle_new_whisper_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET username = COALESCE(username, 'whisprer' || substr(replace(NEW.id::text, '-', ''), 1, 8))
  WHERE id = NEW.id AND username IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_whispr ON auth.users;
