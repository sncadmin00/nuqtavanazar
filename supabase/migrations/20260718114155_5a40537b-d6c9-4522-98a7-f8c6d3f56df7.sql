
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birthdate date,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS parent_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS languages jsonb NOT NULL DEFAULT '["ru"]'::jsonb,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- debate_weeks
CREATE TABLE IF NOT EXISTS public.debate_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  topic text,
  topic_reveal_at timestamptz NOT NULL,
  event_at timestamptz NOT NULL,
  pro_percent int NOT NULL DEFAULT 0,
  con_percent int NOT NULL DEFAULT 0,
  rounds_count int NOT NULL DEFAULT 0,
  listeners_total int NOT NULL DEFAULT 0,
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.debate_weeks TO anon, authenticated;
GRANT ALL ON public.debate_weeks TO service_role;
ALTER TABLE public.debate_weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debate_weeks_read_all" ON public.debate_weeks FOR SELECT USING (true);

-- player_ratings
CREATE TABLE IF NOT EXISTS public.player_ratings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mastery int NOT NULL DEFAULT 1000,
  mastery_trend_week int NOT NULL DEFAULT 0,
  knock int NOT NULL DEFAULT 0,
  moderator int NOT NULL DEFAULT 0,
  matches_played int NOT NULL DEFAULT 0,
  league text NOT NULL DEFAULT 'zonal',
  display_name text,
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.player_ratings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.player_ratings TO authenticated;
GRANT ALL ON public.player_ratings TO service_role;
ALTER TABLE public.player_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ratings_read_all" ON public.player_ratings FOR SELECT USING (true);
CREATE POLICY "ratings_own_write" ON public.player_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_own_update" ON public.player_ratings FOR UPDATE USING (auth.uid() = user_id);

-- live_rooms
CREATE TABLE IF NOT EXISTS public.live_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  format text NOT NULL CHECK (format IN ('1v1','2v2','roundtable')),
  topic text,
  listeners int NOT NULL DEFAULT 0,
  is_live boolean NOT NULL DEFAULT true,
  visibility text NOT NULL DEFAULT 'public',
  started_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.live_rooms TO anon, authenticated;
GRANT ALL ON public.live_rooms TO service_role;
ALTER TABLE public.live_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_read_public" ON public.live_rooms FOR SELECT USING (visibility = 'public');

-- roundtables
CREATE TABLE IF NOT EXISTS public.roundtables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  moderator_id uuid,
  moderator_name text,
  participants jsonb NOT NULL DEFAULT '[]'::jsonb,
  listeners int NOT NULL DEFAULT 0,
  knock_count int NOT NULL DEFAULT 0,
  opinion_before int,
  opinion_after int,
  best_speaker_name text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  is_live boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roundtables TO anon, authenticated;
GRANT ALL ON public.roundtables TO service_role;
ALTER TABLE public.roundtables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roundtables_read_all" ON public.roundtables FOR SELECT USING (true);

-- week_highlights
CREATE TABLE IF NOT EXISTS public.week_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.debate_weeks(id) ON DELETE CASCADE,
  title text NOT NULL,
  participants text,
  format text,
  knock_count int NOT NULL DEFAULT 0,
  recording_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.week_highlights TO anon, authenticated;
GRANT ALL ON public.week_highlights TO service_role;
ALTER TABLE public.week_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "highlights_read_all" ON public.week_highlights FOR SELECT USING (true);

-- Seed data for demo
INSERT INTO public.debate_weeks (week_start, topic, topic_reveal_at, event_at, pro_percent, con_percent, rounds_count, listeners_total, ai_summary)
VALUES
  (date_trunc('week', now())::date, NULL, (date_trunc('week', now()) + interval '5 days 12 hours')::timestamptz, (date_trunc('week', now()) + interval '5 days 15 hours')::timestamptz, 0, 0, 0, 0, NULL),
  ((date_trunc('week', now()) - interval '7 days')::date, 'Социальные сети приносят обществу больше вреда, чем пользы', (date_trunc('week', now()) - interval '2 days')::timestamptz, (date_trunc('week', now()) - interval '1 day 9 hours')::timestamptz, 58, 42, 24, 312, 'На неделе обсуждали влияние соцсетей. Сторона утверждения делала ставку на психическое здоровье подростков и алгоритмическую поляризацию, сторона отрицания — на доступ к информации и экономические возможности. Наиболее сильные раунды строились вокруг критерия «долгосрочный общественный эффект».')
ON CONFLICT (week_start) DO NOTHING;

WITH prev AS (SELECT id FROM public.debate_weeks WHERE week_start = (date_trunc('week', now()) - interval '7 days')::date)
INSERT INTO public.week_highlights (week_id, title, participants, format, knock_count)
SELECT prev.id, 'Финал: критерий важнее примеров', 'Азиз Р. vs Дилноза К.', '1v1', 47 FROM prev
ON CONFLICT DO NOTHING;

INSERT INTO public.live_rooms (format, topic, listeners) VALUES
  ('1v1', 'Тема недели', 12),
  ('1v1', 'Тема недели', 8),
  ('1v1', 'Тема недели', 5),
  ('2v2', 'Тема недели', 21),
  ('2v2', 'Тема недели', 14)
ON CONFLICT DO NOTHING;

INSERT INTO public.roundtables (topic, moderator_name, participants, listeners, knock_count, opinion_before, opinion_after, best_speaker_name)
VALUES ('Нужен ли обязательный госэкзамен по критическому мышлению?', 'Малика И.',
  '[{"name":"Азиз"},{"name":"Дилноза"},{"name":"Санжар"},{"name":"Мадина"},{"name":"Тимур"}]'::jsonb,
  63, 89, 34, 61, 'Санжар Х.');
