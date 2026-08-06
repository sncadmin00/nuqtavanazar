CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  format text NOT NULL DEFAULT '2v2',
  status text NOT NULL DEFAULT 'draft',
  day1_at timestamptz NOT NULL,
  day2_at timestamptz NOT NULL,
  day1_topic text,
  day2_topic text,
  slot_minutes integer NOT NULL DEFAULT 45,
  max_entrants integer NOT NULL DEFAULT 16,
  week_id uuid REFERENCES public.debate_weeks(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tournaments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tournaments TO authenticated;
GRANT ALL ON public.tournaments TO service_role;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tournaments_public_read" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "tournaments_admin_write" ON public.tournaments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.tournament_entrants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  kind text NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  seed integer,
  status text NOT NULL DEFAULT 'registered',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tournament_entrants_team_uniq ON public.tournament_entrants (tournament_id, team_id) WHERE team_id IS NOT NULL;
CREATE UNIQUE INDEX tournament_entrants_user_uniq ON public.tournament_entrants (tournament_id, user_id) WHERE user_id IS NOT NULL;

GRANT SELECT ON public.tournament_entrants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tournament_entrants TO authenticated;
GRANT ALL ON public.tournament_entrants TO service_role;
ALTER TABLE public.tournament_entrants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entrants_public_read" ON public.tournament_entrants FOR SELECT USING (true);
CREATE POLICY "entrants_self_insert" ON public.tournament_entrants FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );
CREATE POLICY "entrants_self_update" ON public.tournament_entrants FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );
CREATE POLICY "entrants_self_delete" ON public.tournament_entrants FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );
CREATE POLICY "entrants_admin_all" ON public.tournament_entrants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.tournament_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  stage text NOT NULL,
  round_no integer NOT NULL DEFAULT 1,
  slot integer NOT NULL DEFAULT 1,
  a_entrant_id uuid REFERENCES public.tournament_entrants(id) ON DELETE SET NULL,
  b_entrant_id uuid REFERENCES public.tournament_entrants(id) ON DELETE SET NULL,
  scheduled_at timestamptz,
  duel_id uuid REFERENCES public.duels(id) ON DELETE SET NULL,
  winner_entrant_id uuid REFERENCES public.tournament_entrants(id) ON DELETE SET NULL,
  a_points integer NOT NULL DEFAULT 0,
  b_points integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tournament_matches_tid_idx ON public.tournament_matches (tournament_id, stage, round_no, slot);

GRANT SELECT ON public.tournament_matches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tournament_matches TO authenticated;
GRANT ALL ON public.tournament_matches TO service_role;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_public_read" ON public.tournament_matches FOR SELECT USING (true);
CREATE POLICY "matches_admin_write" ON public.tournament_matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS tournament_match_id uuid REFERENCES public.tournament_matches(id) ON DELETE SET NULL;

CREATE TRIGGER tournaments_set_updated_at BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tournament_entrants_set_updated_at BEFORE UPDATE ON public.tournament_entrants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tournament_matches_set_updated_at BEFORE UPDATE ON public.tournament_matches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_matches;