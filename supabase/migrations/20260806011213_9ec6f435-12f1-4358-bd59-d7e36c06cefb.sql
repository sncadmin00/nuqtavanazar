ALTER TABLE public.duels
  ADD COLUMN IF NOT EXISTS week_id uuid REFERENCES public.debate_weeks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS prep_ends_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS room_name text,
  ADD COLUMN IF NOT EXISTS recording_url text;

ALTER TABLE public.duel_turns
  ADD COLUMN IF NOT EXISTS audio_path text,
  ADD COLUMN IF NOT EXISTS duration_sec integer NOT NULL DEFAULT 0;

ALTER TABLE public.duel_turns ALTER COLUMN text SET DEFAULT '';

CREATE INDEX IF NOT EXISTS duels_week_status_idx ON public.duels (week_id, status, created_at DESC);