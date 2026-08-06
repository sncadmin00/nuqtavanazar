import { supabase } from "@/integrations/supabase/client";

export type TeamRow = {
  id: string;
  name: string;
  owner_id: string;
  owner_name: string | null;
  partner_id: string | null;
  partner_name: string | null;
  is_active: boolean;
  looking_for_partner: boolean;
  created_at: string;
};

export type TeamInviteRow = {
  id: string;
  team_id: string;
  from_user_id: string;
  to_user_id: string;
  team_name: string;
  from_name: string;
  to_name: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
};

export type TeamWithRating = TeamRow & { elo: number; matches_played: number; wins: number };

/** Команда, где пользователь админ или второй спикер */
export async function getMyTeam(userId: string): Promise<TeamRow | null> {
  const { data } = await supabase
    .from("teams")
    .select("*")
    .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
    .limit(1)
    .maybeSingle();
  return (data as TeamRow | null) ?? null;
}

export async function getTeamRating(teamId: string) {
  const { data } = await supabase
    .from("team_ratings")
    .select("elo, matches_played, wins")
    .eq("team_id", teamId)
    .maybeSingle();
  return data ?? { elo: 1000, matches_played: 0, wins: 0 };
}

export async function createTeam(name: string, ownerId: string, ownerName: string): Promise<TeamRow> {
  const clean = name.trim().slice(0, 40);
  if (clean.length < 2) throw new Error("Название команды слишком короткое");
  const { data, error } = await supabase
    .from("teams")
    .insert({ name: clean, owner_id: ownerId, owner_name: ownerName })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("У вас уже есть команда");
    throw new Error(error.message);
  }
  return data as TeamRow;
}

export async function renameTeam(teamId: string, name: string) {
  const clean = name.trim().slice(0, 40);
  if (clean.length < 2) throw new Error("Название команды слишком короткое");
  const { error } = await supabase.from("teams").update({ name: clean }).eq("id", teamId);
  if (error) throw new Error(error.message);
}

export async function disbandTeam(teamId: string) {
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) throw new Error(error.message);
}

/** Админ убирает второго спикера — команда становится неактивной */
export async function removePartner(teamId: string) {
  const { error } = await supabase.from("teams").update({ partner_id: null, partner_name: null }).eq("id", teamId);
  if (error) throw new Error(error.message);
}

/** Второй спикер уходит сам */
export async function leaveTeam(teamId: string) {
  const { error } = await supabase.rpc("leave_team", { _team_id: teamId });
  if (error) throw new Error(error.message);
}

export async function inviteToTeam(input: {
  team: TeamRow;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
}) {
  if (input.toUserId === input.fromUserId) throw new Error("Нельзя пригласить самого себя");
  const { error } = await supabase.from("team_invites").insert({
    team_id: input.team.id,
    from_user_id: input.fromUserId,
    to_user_id: input.toUserId,
    team_name: input.team.name,
    from_name: input.fromName,
    to_name: input.toName,
  });
  if (error) throw new Error(error.message);
}

export async function listMyTeamInvites(userId: string): Promise<TeamInviteRow[]> {
  const { data } = await supabase
    .from("team_invites")
    .select("*")
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(30);
  return (data ?? []) as TeamInviteRow[];
}

export async function acceptTeamInvite(id: string): Promise<string> {
  const { data, error } = await supabase.rpc("accept_team_invite", { _invite_id: id });
  if (error) throw new Error(error.message);
  return data as unknown as string;
}

export async function respondTeamInvite(id: string, accept: boolean) {
  if (accept) return acceptTeamInvite(id);
  const { error } = await supabase
    .from("team_invites")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return null;
}

export async function cancelTeamInvite(id: string) {
  const { error } = await supabase
    .from("team_invites")
    .update({ status: "cancelled", responded_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Все команды с рейтингом, активные выше неактивных */
export async function listTeamsWithRatings(): Promise<TeamWithRating[]> {
  const [{ data: teams }, { data: ratings }] = await Promise.all([
    supabase.from("teams").select("*").limit(200),
    supabase.from("team_ratings").select("team_id, elo, matches_played, wins"),
  ]);
  const map = new Map((ratings ?? []).map((r) => [r.team_id, r]));
  return ((teams ?? []) as TeamRow[])
    .map((t) => {
      const r = map.get(t.id);
      return { ...t, elo: r?.elo ?? 1000, matches_played: r?.matches_played ?? 0, wins: r?.wins ?? 0 };
    })
    .sort((a, b) => Number(b.is_active) - Number(a.is_active) || b.elo - a.elo);
}

/** Игроки без команды — кандидаты в напарники */
export async function listFreeAgents(excludeIds: string[]) {
  const { data } = await supabase
    .from("player_ratings")
    .select("user_id, display_name, mastery")
    .order("mastery", { ascending: false })
    .limit(100);
  const { data: taken } = await supabase.from("teams").select("owner_id, partner_id");
  const busy = new Set<string>();
  for (const t of taken ?? []) {
    if (t.owner_id) busy.add(t.owner_id);
    if (t.partner_id) busy.add(t.partner_id);
  }
  for (const id of excludeIds) busy.add(id);
  return (data ?? []).filter((p) => !busy.has(p.user_id));
}
