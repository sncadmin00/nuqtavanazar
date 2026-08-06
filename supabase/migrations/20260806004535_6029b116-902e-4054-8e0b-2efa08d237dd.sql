CREATE TABLE public.duels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  motion text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  pro_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  con_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  pro_name text NOT NULL DEFAULT 'Спикер',
  con_name text,
  turn_index integer NOT NULL DEFAULT 0,
  turn_user_id uuid,
  turn_ends_at timestamptz,
  verdict jsonb,
  winner_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.duel_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id uuid NOT NULL REFERENCES public.duels(id) ON DELETE CASCADE,
  idx integer NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  side text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (duel_id, idx)
);

GRANT SELECT, INSERT, UPDATE ON public.duels TO authenticated;
GRANT SELECT ON public.duels TO anon;
GRANT ALL ON public.duels TO service_role;

GRANT SELECT, INSERT ON public.duel_turns TO authenticated;
GRANT SELECT ON public.duel_turns TO anon;
GRANT ALL ON public.duel_turns TO service_role;

ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_turns ENABLE ROW LEVEL SECURITY;

CREATE POLICY duels_read_all ON public.duels FOR SELECT USING (true);
CREATE POLICY duels_insert_own ON public.duels FOR INSERT TO authenticated WITH CHECK (auth.uid() = pro_user_id);
CREATE POLICY duels_update_participants ON public.duels FOR UPDATE TO authenticated
  USING (auth.uid() = pro_user_id OR con_user_id IS NULL OR auth.uid() = con_user_id)
  WITH CHECK (auth.uid() = pro_user_id OR auth.uid() = con_user_id);

CREATE POLICY duel_turns_read_all ON public.duel_turns FOR SELECT USING (true);
CREATE POLICY duel_turns_insert_own ON public.duel_turns FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.duels d WHERE d.id = duel_id AND (d.pro_user_id = auth.uid() OR d.con_user_id = auth.uid())
  )
);

CREATE INDEX duels_status_idx ON public.duels (status, created_at DESC);
CREATE INDEX duel_turns_duel_idx ON public.duel_turns (duel_id, idx);

ALTER PUBLICATION supabase_realtime ADD TABLE public.duels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_turns;