
CREATE OR REPLACE FUNCTION public.leave_team(_team_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  t public.teams%ROWTYPE;
BEGIN
  SELECT * INTO t FROM public.teams WHERE id = _team_id;
  IF t.id IS NULL THEN RAISE EXCEPTION 'Команда не найдена'; END IF;
  IF auth.uid() <> t.partner_id THEN RAISE EXCEPTION 'Вы не второй спикер этой команды'; END IF;

  UPDATE public.teams SET partner_id = NULL, partner_name = NULL WHERE id = _team_id;
  UPDATE public.team_invites SET status = 'cancelled'
    WHERE team_id = _team_id AND to_user_id = t.partner_id AND status = 'pending';
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.leave_team(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.accept_team_invite(uuid) FROM anon;
