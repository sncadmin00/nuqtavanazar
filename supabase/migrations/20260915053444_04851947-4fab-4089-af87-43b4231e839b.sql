ALTER TABLE public.motions
  ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'global';

ALTER TABLE public.motions
  ADD CONSTRAINT motions_difficulty_check CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ADD CONSTRAINT motions_scope_check CHECK (scope IN ('uzbekistan', 'global'));