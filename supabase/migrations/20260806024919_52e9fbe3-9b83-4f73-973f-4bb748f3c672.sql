CREATE TABLE public.duel_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.debate_weeks(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_name text NOT NULL DEFAULT 'Спикер',
  to_name text NOT NULL DEFAULT 'Спикер',
  kind text NOT NULL DEFAULT 'scheduled',
  status text NOT NULL DEFAULT 'pending',
  duel_id uuid REFERENCES public.duels(id) ON DELETE SET NULL,
  expires_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT duel_challenges_kind_check CHECK (kind IN ('scheduled','instant')),
  CONSTRAINT duel_challenges_status_check CHECK (status IN ('pending','accepted','declined','cancelled','started','expired')),
  CONSTRAINT duel_challenges_distinct_users CHECK (from_user_id <> to_user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.duel_challenges TO authenticated;
GRANT ALL ON public.duel_challenges TO service_role;

ALTER TABLE public.duel_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select_participants" ON public.duel_challenges
  FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "challenges_insert_own" ON public.duel_challenges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "challenges_update_participants" ON public.duel_challenges
  FOR UPDATE TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE UNIQUE INDEX duel_challenges_pending_unique
  ON public.duel_challenges (week_id, from_user_id, to_user_id)
  WHERE status = 'pending';

CREATE INDEX duel_challenges_to_user_idx ON public.duel_challenges (to_user_id, status, created_at DESC);
CREATE INDEX duel_challenges_from_user_idx ON public.duel_challenges (from_user_id, status, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$;

CREATE TRIGGER update_duel_challenges_updated_at
  BEFORE UPDATE ON public.duel_challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_challenges;

CREATE OR REPLACE FUNCTION public.start_challenge_duel(_challenge_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ch public.duel_challenges%ROWTYPE;
  wk public.debate_weeks%ROWTYPE;
  ends_at timestamptz;
  pro_id uuid; con_id uuid; pro_nm text; con_nm text;
  new_id uuid;
  joiner_is_pro boolean;
  prep_ends timestamptz;
BEGIN
  SELECT * INTO ch FROM public.duel_challenges WHERE id = _challenge_id;
  IF ch.id IS NULL THEN RAISE EXCEPTION 'Вызов не найден'; END IF;
  IF auth.uid() <> ch.from_user_id AND auth.uid() <> ch.to_user_id THEN
    RAISE EXCEPTION 'Вы не участник вызова';
  END IF;
  IF ch.status = 'started' AND ch.duel_id IS NOT NULL THEN
    RETURN ch.duel_id;
  END IF;
  IF ch.status <> 'accepted' THEN RAISE EXCEPTION 'Вызов ещё не принят'; END IF;

  SELECT * INTO wk FROM public.debate_weeks WHERE id = ch.week_id;
  IF wk.id IS NULL OR wk.topic IS NULL THEN RAISE EXCEPTION 'Тема недели не объявлена'; END IF;
  ends_at := COALESCE(wk.event_ends_at, wk.event_at + interval '3 hours');
  IF now() < wk.event_at THEN RAISE EXCEPTION 'Батлы откроются в День дебатов'; END IF;
  IF now() > ends_at THEN RAISE EXCEPTION 'День дебатов уже завершён'; END IF;

  joiner_is_pro := random() < 0.5;
  IF joiner_is_pro THEN
    pro_id := ch.from_user_id; pro_nm := ch.from_name; con_id := ch.to_user_id; con_nm := ch.to_name;
  ELSE
    pro_id := ch.to_user_id; pro_nm := ch.to_name; con_id := ch.from_user_id; con_nm := ch.from_name;
  END IF;

  prep_ends := now() + interval '120 seconds';

  INSERT INTO public.duels (motion, week_id, pro_user_id, pro_name, con_user_id, con_name,
                            status, turn_index, turn_user_id, prep_ends_at, turn_ends_at)
  VALUES (wk.topic, wk.id, pro_id, pro_nm, con_id, con_nm,
          'live', 1, pro_id, prep_ends, prep_ends + interval '90 seconds')
  RETURNING id INTO new_id;

  UPDATE public.duels SET room_name = 'duel-' || new_id::text WHERE id = new_id;
  UPDATE public.duel_challenges SET status = 'started', duel_id = new_id WHERE id = _challenge_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_challenge_duel(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.start_challenge_duel(uuid) TO authenticated;