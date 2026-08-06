create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users upload own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create table public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  team_name text not null,
  role text not null default 'partner',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index team_memberships_user_idx on public.team_memberships(user_id, joined_at desc);
create unique index team_memberships_open_idx on public.team_memberships(team_id, user_id) where left_at is null;

grant select on public.team_memberships to anon;
grant select on public.team_memberships to authenticated;
grant all on public.team_memberships to service_role;

alter table public.team_memberships enable row level security;
create policy "Team history is public" on public.team_memberships for select using (true);

create trigger team_memberships_set_updated_at
  before update on public.team_memberships
  for each row execute function public.set_updated_at();

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  title text not null,
  event_name text,
  place integer,
  kind text not null default 'tournament',
  note text,
  awarded_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index achievements_user_idx on public.achievements(user_id, awarded_at desc);
create index achievements_team_idx on public.achievements(team_id, awarded_at desc);

grant select on public.achievements to anon;
grant select on public.achievements to authenticated;
grant all on public.achievements to service_role;

alter table public.achievements enable row level security;
create policy "Achievements are public" on public.achievements for select using (true);
create policy "Admins insert achievements" on public.achievements for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update achievements" on public.achievements for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete achievements" on public.achievements for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger achievements_set_updated_at
  before update on public.achievements
  for each row execute function public.set_updated_at();

create or replace function public.record_owner_membership()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.team_memberships (team_id, user_id, team_name, role)
  values (NEW.id, NEW.owner_id, NEW.name, 'owner')
  on conflict do nothing;
  return NEW;
end;
$$;

create trigger teams_record_owner_membership
  after insert on public.teams
  for each row execute function public.record_owner_membership();

insert into public.team_memberships (team_id, user_id, team_name, role, joined_at)
select id, owner_id, name, 'owner', created_at from public.teams
on conflict do nothing;

insert into public.team_memberships (team_id, user_id, team_name, role, joined_at)
select id, partner_id, name, 'partner', created_at from public.teams where partner_id is not null
on conflict do nothing;

create or replace function public.accept_team_invite(_invite_id uuid)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
DECLARE
  inv public.team_invites%ROWTYPE;
  tname text;
BEGIN
  SELECT * INTO inv FROM public.team_invites WHERE id = _invite_id;
  IF inv.id IS NULL THEN RAISE EXCEPTION 'Приглашение не найдено'; END IF;
  IF auth.uid() <> inv.to_user_id THEN RAISE EXCEPTION 'Это не ваше приглашение'; END IF;
  IF inv.status <> 'pending' THEN RAISE EXCEPTION 'Приглашение уже обработано'; END IF;

  IF EXISTS (SELECT 1 FROM public.teams WHERE owner_id = inv.to_user_id) THEN
    RAISE EXCEPTION 'Вы уже создали свою команду — сначала удалите её';
  END IF;

  UPDATE public.teams SET partner_id = NULL, partner_name = NULL
    WHERE partner_id = inv.to_user_id AND id <> inv.team_id;

  UPDATE public.team_memberships SET left_at = now()
    WHERE user_id = inv.to_user_id AND left_at IS NULL AND team_id <> inv.team_id;

  UPDATE public.teams
    SET partner_id = inv.to_user_id, partner_name = inv.to_name
    WHERE id = inv.team_id
    RETURNING name INTO tname;

  INSERT INTO public.team_memberships (team_id, user_id, team_name, role)
  VALUES (inv.team_id, inv.to_user_id, COALESCE(tname, inv.team_name), 'partner')
  ON CONFLICT DO NOTHING;

  UPDATE public.team_invites SET status = 'accepted', responded_at = now() WHERE id = _invite_id;
  UPDATE public.team_invites SET status = 'cancelled'
    WHERE team_id = inv.team_id AND status = 'pending' AND id <> _invite_id;

  RETURN inv.team_id;
END;
$function$;

create or replace function public.leave_team(_team_id uuid)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
DECLARE
  t public.teams%ROWTYPE;
BEGIN
  SELECT * INTO t FROM public.teams WHERE id = _team_id;
  IF t.id IS NULL THEN RAISE EXCEPTION 'Команда не найдена'; END IF;
  IF auth.uid() <> t.partner_id THEN RAISE EXCEPTION 'Вы не второй спикер этой команды'; END IF;

  UPDATE public.teams SET partner_id = NULL, partner_name = NULL WHERE id = _team_id;
  UPDATE public.team_memberships SET left_at = now()
    WHERE team_id = _team_id AND user_id = t.partner_id AND left_at IS NULL;
  UPDATE public.team_invites SET status = 'cancelled'
    WHERE team_id = _team_id AND to_user_id = t.partner_id AND status = 'pending';
  RETURN true;
END;
$function$;