import { supabase } from "@/integrations/supabase/client";
import type { Entrant, TMatch, Tournament } from "@/lib/tournament-utils";

export async function listTournaments(): Promise<Tournament[]> {
  const { data } = await supabase
    .from("tournaments")
    .select("*")
    .neq("status", "draft")
    .order("day1_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Tournament[];
}

export async function getTournamentBundle(id: string): Promise<{
  tournament: Tournament | null;
  entrants: Entrant[];
  matches: TMatch[];
}> {
  const [{ data: t }, { data: e }, { data: m }] = await Promise.all([
    supabase.from("tournaments").select("*").eq("id", id).maybeSingle(),
    supabase.from("tournament_entrants").select("*").eq("tournament_id", id).order("created_at"),
    supabase.from("tournament_matches").select("*").eq("tournament_id", id).order("round_no").order("slot"),
  ]);
  return {
    tournament: (t as Tournament | null) ?? null,
    entrants: (e ?? []) as Entrant[],
    matches: (m ?? []) as TMatch[],
  };
}

/** Заявка игрока (1×1) или команды (2×2) */
export async function registerForTournament(t: Tournament, userId: string, displayName: string) {
  if (t.status !== "registration") throw new Error("Регистрация закрыта");

  if (t.format === "2v2") {
    const { data: team } = await supabase
      .from("teams")
      .select("id, name, partner_id, owner_id")
      .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
      .limit(1)
      .maybeSingle();
    if (!team) throw new Error("Сначала создайте команду");
    if (team.owner_id !== userId) throw new Error("Заявку подаёт админ команды");
    if (!team.partner_id) throw new Error("Команда не активна: нет второго спикера");
    const { error } = await supabase
      .from("tournament_entrants")
      .insert({ tournament_id: t.id, kind: "team", team_id: team.id, display_name: team.name });
    if (error) throw new Error(error.code === "23505" ? "Команда уже заявлена" : error.message);
    return;
  }

  const { error } = await supabase
    .from("tournament_entrants")
    .insert({ tournament_id: t.id, kind: "player", user_id: userId, display_name: displayName });
  if (error) throw new Error(error.code === "23505" ? "Вы уже заявлены" : error.message);
}

export async function withdrawFromTournament(entrantId: string) {
  const { error } = await supabase.from("tournament_entrants").delete().eq("id", entrantId);
  if (error) throw new Error(error.message);
}

/** Мои сущности: id пользователя + id команды (если есть) */
export async function myEntityIds(userId: string): Promise<{ userId: string; teamId: string | null }> {
  const { data } = await supabase
    .from("teams")
    .select("id")
    .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
    .limit(1)
    .maybeSingle();
  return { userId, teamId: data?.id ?? null };
}
