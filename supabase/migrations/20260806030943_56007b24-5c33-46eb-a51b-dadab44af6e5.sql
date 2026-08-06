
-- TEAMS
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name text,
  partner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_name text,
  is_active boolean NOT NULL DEFAULT false,
  looking_for_partner boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX teams_owner_unique ON public.teams(owner_id);
CREATE INDEX teams_partner_idx ON public.teams(partner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT SELECT ON public.teams TO anon;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_public_read" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_owner_insert" ON public.teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "teams_member_update" ON public.teams FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = partner_id)
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = partner_id);
CREATE POLICY "teams_owner_delete" ON public.teams FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER teams_set_updated_at BEFORE UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TEAM INVITES
CREATE TABLE public.team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  from_name text NOT NULL,
  to_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX team_invites_to_idx ON public.team_invites(to_user_id, status);
CREATE INDEX team_invites_team_idx ON public.team_invites(team_id, status);

GRANT SELECT, INSERT, UPDATE ON public.team_invites TO authenticated;
GRANT ALL ON public.team_invites TO service_role;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_participants_read" ON public.team_invites FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "invites_sender_insert" ON public.team_invites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "invites_participants_update" ON public.team_invites FOR UPDATE TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE TRIGGER team_invites_set_updated_at BEFORE UPDATE ON public.team_invites
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TEAM RATINGS
CREATE TABLE public.team_ratings (
  team_id uuid PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  elo integer NOT NULL DEFAULT 1000,
  matches_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_ratings TO authenticated;
GRANT SELECT ON public.team_ratings TO anon;
GRANT ALL ON public.team_ratings TO service_role;
ALTER TABLE public.team_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_ratings_public_read" ON public.team_ratings FOR SELECT USING (true);

-- DUELS: 2x2 support
ALTER TABLE public.duels
  ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT '1v1',
  ADD COLUMN IF NOT EXISTS pro_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS con_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pro_user2_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS con_user2_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pro_name2 text,
  ADD COLUMN IF NOT EXISTS con_name2 text;

ALTER TABLE public.duel_turns
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'speech';

ALTER TABLE public.duel_challenges
  ADD COLUMN IF NOT EXISTS from_team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS to_team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE;

-- team lifecycle: activate on partner set, deactivate on partner leave
CREATE OR REPLACE FUNCTION public.sync_team_active()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.is_active := NEW.partner_id IS NOT NULL;
  NEW.looking_for_partner := NEW.partner_id IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER teams_sync_active BEFORE INSERT OR UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.sync_team_active();

CREATE OR REPLACE FUNCTION public.ensure_team_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.team_ratings (team_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER teams_ensure_rating AFTER INSERT ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.ensure_team_rating();

-- accept invite atomically
CREATE OR REPLACE FUNCTION public.accept_team_invite(_invite_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inv public.team_invites%ROWTYPE;
BEGIN
  SELECT * INTO inv FROM public.team_invites WHERE id = _invite_id;
  IF inv.id IS NULL THEN RAISE EXCEPTION 'Приглашение не найдено'; END IF;
  IF auth.uid() <> inv.to_user_id THEN RAISE EXCEPTION 'Это не ваше приглашение'; END IF;
  IF inv.status <> 'pending' THEN RAISE EXCEPTION 'Приглашение уже обработано'; END IF;

  IF EXISTS (SELECT 1 FROM public.teams WHERE owner_id = inv.to_user_id) THEN
    RAISE EXCEPTION 'Вы уже создали свою команду — сначала удалите её';
  END IF;

  -- покинуть предыдущую команду
  UPDATE public.teams SET partner_id = NULL, partner_name = NULL
    WHERE partner_id = inv.to_user_id AND id <> inv.team_id;

  UPDATE public.teams
    SET partner_id = inv.to_user_id, partner_name = inv.to_name
    WHERE id = inv.team_id;

  UPDATE public.team_invites SET status = 'accepted', responded_at = now() WHERE id = _invite_id;
  UPDATE public.team_invites SET status = 'cancelled'
    WHERE team_id = inv.team_id AND status = 'pending' AND id <> _invite_id;

  RETURN inv.team_id;
END;
$$;
