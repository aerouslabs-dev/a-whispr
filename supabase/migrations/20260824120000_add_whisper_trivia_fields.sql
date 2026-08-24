ALTER TABLE public.whispers
  ADD COLUMN IF NOT EXISTS trivia_question text,
  ADD COLUMN IF NOT EXISTS trivia_options text[] NULL,
  ADD COLUMN IF NOT EXISTS trivia_correct_index integer NULL,
  ADD COLUMN IF NOT EXISTS hint_letter text NULL;

ALTER TABLE public.whispers
  ADD CONSTRAINT whispers_trivia_correct_index_check
  CHECK (
    trivia_correct_index IS NULL OR trivia_correct_index >= 0
  );

ALTER TABLE public.whispers
  ADD CONSTRAINT whispers_hint_letter_check
  CHECK (
    hint_letter IS NULL OR length(trim(hint_letter)) = 1
  );
