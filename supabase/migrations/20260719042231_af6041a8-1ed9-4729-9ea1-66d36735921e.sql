
CREATE TABLE public.debate_cadence (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  interval_days integer NOT NULL DEFAULT 7,
  day_of_week integer NOT NULL DEFAULT 6 CHECK (day_of_week BETWEEN 0 AND 6),
  event_time time NOT NULL DEFAULT '18:00',
  reveal_lead_hours integer NOT NULL DEFAULT 48,
  event_duration_hours integer NOT NULL DEFAULT 4,
  timezone text NOT NULL DEFAULT 'Asia/Tashkent',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.debate_cadence TO anon, authenticated;
GRANT ALL ON public.debate_cadence TO service_role;
ALTER TABLE public.debate_cadence ENABLE ROW LEVEL SECURITY;
CREATE POLICY cadence_read_all ON public.debate_cadence FOR SELECT USING (true);
INSERT INTO public.debate_cadence (id) VALUES (true);

ALTER TABLE public.debate_weeks ADD COLUMN IF NOT EXISTS event_ends_at timestamptz;
UPDATE public.debate_weeks SET event_ends_at = event_at + interval '4 hours' WHERE event_ends_at IS NULL;

UPDATE public.debate_weeks
SET event_at = '2026-07-25 15:00:00+00',
    event_ends_at = '2026-07-25 19:00:00+00',
    topic_reveal_at = '2026-07-23 15:00:00+00',
    topic = NULL,
    ai_summary = NULL
WHERE week_start = '2026-07-13';

CREATE TABLE public.week_arguments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.debate_weeks(id) ON DELETE CASCADE,
  side text NOT NULL CHECK (side IN ('pro','con')),
  text text NOT NULL,
  author_name text,
  knock_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX week_arguments_week_side_idx ON public.week_arguments (week_id, side, knock_count DESC);
GRANT SELECT ON public.week_arguments TO anon, authenticated;
GRANT ALL ON public.week_arguments TO service_role;
ALTER TABLE public.week_arguments ENABLE ROW LEVEL SECURITY;
CREATE POLICY week_arguments_read_all ON public.week_arguments FOR SELECT USING (true);

CREATE TABLE public.week_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.debate_weeks(id) ON DELETE CASCADE,
  text text NOT NULL,
  author_name text NOT NULL,
  knock_count integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX week_quotes_week_idx ON public.week_quotes (week_id, order_index);
GRANT SELECT ON public.week_quotes TO anon, authenticated;
GRANT ALL ON public.week_quotes TO service_role;
ALTER TABLE public.week_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY week_quotes_read_all ON public.week_quotes FOR SELECT USING (true);

CREATE TABLE public.week_featured_speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.debate_weeks(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('best','rising')),
  display_name text NOT NULL,
  avatar_url text,
  badge_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_id, kind)
);
GRANT SELECT ON public.week_featured_speakers TO anon, authenticated;
GRANT ALL ON public.week_featured_speakers TO service_role;
ALTER TABLE public.week_featured_speakers ENABLE ROW LEVEL SECURITY;
CREATE POLICY week_featured_read_all ON public.week_featured_speakers FOR SELECT USING (true);

CREATE TABLE public.week_public_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.debate_weeks(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  side text NOT NULL CHECK (side IN ('pro','con')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_id, visitor_id)
);
CREATE INDEX week_public_votes_week_idx ON public.week_public_votes (week_id);
GRANT ALL ON public.week_public_votes TO service_role;
ALTER TABLE public.week_public_votes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_week_vote_stats(_week_id uuid)
RETURNS TABLE (pro integer, con integer, total integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN side = 'pro' THEN 1 ELSE 0 END), 0)::int AS pro,
    COALESCE(SUM(CASE WHEN side = 'con' THEN 1 ELSE 0 END), 0)::int AS con,
    COALESCE(COUNT(*), 0)::int AS total
  FROM public.week_public_votes WHERE week_id = _week_id;
$$;
GRANT EXECUTE ON FUNCTION public.get_week_vote_stats(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.cast_retro_vote(_week_id uuid, _visitor_id text, _side text)
RETURNS TABLE (pro integer, con integer, total integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _side NOT IN ('pro','con') THEN RAISE EXCEPTION 'invalid side'; END IF;
  IF _visitor_id IS NULL OR length(_visitor_id) < 8 OR length(_visitor_id) > 64 THEN
    RAISE EXCEPTION 'invalid visitor_id';
  END IF;
  INSERT INTO public.week_public_votes (week_id, visitor_id, side)
  VALUES (_week_id, _visitor_id, _side)
  ON CONFLICT (week_id, visitor_id) DO UPDATE SET side = EXCLUDED.side, created_at = now();
  RETURN QUERY SELECT * FROM public.get_week_vote_stats(_week_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.cast_retro_vote(uuid, text, text) TO anon, authenticated;

CREATE TABLE public.challenge_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.debate_weeks(id) ON DELETE CASCADE,
  format text NOT NULL CHECK (format IN ('1v1','2v2')),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','cancelled')),
  challenger_id uuid,
  opponent_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX challenge_bookings_week_format_idx ON public.challenge_bookings (week_id, format, status);
GRANT SELECT ON public.challenge_bookings TO anon, authenticated;
GRANT ALL ON public.challenge_bookings TO service_role;
ALTER TABLE public.challenge_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY bookings_read_all ON public.challenge_bookings FOR SELECT USING (true);

CREATE TABLE public.roundtable_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roundtable_id uuid NOT NULL REFERENCES public.roundtables(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  pitch text NOT NULL CHECK (length(pitch) BETWEEN 20 AND 280),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (roundtable_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.roundtable_applications TO authenticated;
GRANT ALL ON public.roundtable_applications TO service_role;
ALTER TABLE public.roundtable_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY apps_own_read ON public.roundtable_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY apps_own_insert ON public.roundtable_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY apps_own_update ON public.roundtable_applications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.roundtables
  ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS recording_url text;

UPDATE public.roundtables
SET is_live = false,
    starts_at = '2026-07-24 15:00:00+00',
    capacity = 5,
    participants = jsonb_build_array(
      jsonb_build_object('full_name', 'Малика Юсупова', 'pitch', 'Экзамен по критическому мышлению превратит навык в зубрёжку — школа отбьёт вкус к вопросам.'),
      jsonb_build_object('full_name', 'Тимур Абдуллаев', 'pitch', 'Без обязательной планки взрослые уходят с курсов, а работодатель просит корочку — критерий даст рамку.'),
      jsonb_build_object('full_name', 'Айгуль Насырова', 'pitch', 'Госэкзамен вообще не может измерять мышление — только имитацию мышления по шаблону.')
    ),
    moderator_name = 'Сарвар Каримов'
WHERE id = 'ff1b43a8-9a4a-4564-bd2c-a4f9bddd9a96';

INSERT INTO public.roundtables (topic, moderator_name, participants, listeners, knock_count, opinion_before, opinion_after, best_speaker_name, starts_at, is_live, capacity, recording_url)
VALUES (
  'Стоит ли ограничивать смартфоны в школах Узбекистана?',
  'Дилшод Рахимов',
  jsonb_build_array(
    jsonb_build_object('full_name','Азиза Салимова','pitch','Смартфон — не отвлекающий гаджет, а рабочий инструмент; запрет создаст цифровую пропасть.'),
    jsonb_build_object('full_name','Бекзод Юлдашев','pitch','Три года наблюдал классы без телефонов — внимание другое, споры живые.'),
    jsonb_build_object('full_name','Мадина Хожиева','pitch','Проблема не в устройстве, а в отсутствии медиаграмотности у учителя.')
  ),
  84, 41, 62, 48, 'Бекзод Юлдашев',
  '2026-07-04 15:00:00+00', false, 6,
  'https://example.com/roundtable/2026-07-04'
);

INSERT INTO public.week_arguments (week_id, side, text, author_name, knock_count) VALUES
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','pro','Алгоритмы вознаграждают эмоцию, а не аргумент — среднее качество разговора в обществе падает.', 'Малика Ю.', 47),
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','pro','Молодёжь оценивает себя через метрики платформы — тревожность растёт быстрее, чем полезные связи.', 'Тимур А.', 39),
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','con','Без соцсетей у активистов и малых бизнесов не осталось бы дешёвого доступа к аудитории.', 'Айгуль Н.', 44),
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','con','Вред создают конкретные механики, а не сам факт связи людей — регулируйте механики, а не запрещайте инструмент.', 'Дилшод Р.', 31);

INSERT INTO public.week_quotes (week_id, text, author_name, knock_count, order_index) VALUES
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','Считать соцсети виновными в поляризации — как ругать зеркало за морщины.','Айгуль Насырова', 58, 1),
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','Когда лента решает, что тебе интересно, ты перестаёшь замечать, что тебе интересно.','Малика Юсупова', 52, 2),
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','Дешёвый доступ к аудитории — единственное, что уравнивает бухарского мастера и московского бренда.','Тимур Абдуллаев', 46, 3),
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','Проблема не в соцсетях, а в том, что мы разучились закрывать вкладку.','Дилшод Рахимов', 37, 4);

INSERT INTO public.week_featured_speakers (week_id, kind, display_name, badge_note) VALUES
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','best','Айгуль Насырова','Лучший спикер круглого стола'),
  ('af9846b2-e29e-4697-8b93-46023cc79ccb','rising','Тимур Абдуллаев','Дебют недели · +рейтинг за один вечер');

INSERT INTO public.challenge_bookings (week_id, format) VALUES
  ('c1c1500d-fdd8-4840-9516-04b1e8d6cedb','1v1'),
  ('c1c1500d-fdd8-4840-9516-04b1e8d6cedb','1v1'),
  ('c1c1500d-fdd8-4840-9516-04b1e8d6cedb','1v1'),
  ('c1c1500d-fdd8-4840-9516-04b1e8d6cedb','1v1'),
  ('c1c1500d-fdd8-4840-9516-04b1e8d6cedb','2v2'),
  ('c1c1500d-fdd8-4840-9516-04b1e8d6cedb','2v2');

INSERT INTO public.week_public_votes (week_id, visitor_id, side)
SELECT 'af9846b2-e29e-4697-8b93-46023cc79ccb', 'seed-visitor-' || i, CASE WHEN i % 5 < 3 THEN 'pro' ELSE 'con' END
FROM generate_series(1, 47) i;
