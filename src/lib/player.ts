import { supabase } from "@/integrations/supabase/client";

export type BattleRow = {
  id: string;
  motion: string;
  format: string;
  status: string;
  created_at: string;
  winner_user_id: string | null;
  pro_user_id: string;
  con_user_id: string | null;
  pro_user2_id: string | null;
  con_user2_id: string | null;
  pro_name: string;
  con_name: string | null;
  pro_name2: string | null;
  con_name2: string | null;
};

export type BattleHistoryItem = {
  id: string;
  motion: string;
  format: string;
  date: string;
  side: "pro" | "con";
  opponents: string;
  result: "win" | "loss" | "unknown";
};

export type TeamHistoryItem = {
  id: string;
  team_id: string;
  team_name: string;
  role: string;
  joined_at: string;
  left_at: string | null;
};

export type AchievementItem = {
  id: string;
  title: string;
  event_name: string | null;
  place: number | null;
  kind: string;
  note: string | null;
  awarded_at: string;
  team_id: string | null;
};

export async function fetchBattleHistory(userId: string, limit = 20): Promise<BattleHistoryItem[]> {
  const { data } = await supabase
    .from("duels")
    .select(
      "id, motion, format, status, created_at, winner_user_id, pro_user_id, con_user_id, pro_user2_id, con_user2_id, pro_name, con_name, pro_name2, con_name2",
    )
    .or(
      `pro_user_id.eq.${userId},con_user_id.eq.${userId},pro_user2_id.eq.${userId},con_user2_id.eq.${userId}`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((d) => {
    const row = d as BattleRow;
    const isPro = row.pro_user_id === userId || row.pro_user2_id === userId;
    const oppNames = isPro
      ? [row.con_name, row.con_name2]
      : [row.pro_name, row.pro_name2];
    const mates = isPro ? [row.pro_user_id, row.pro_user2_id] : [row.con_user_id, row.con_user2_id];
    let result: BattleHistoryItem["result"] = "unknown";
    if (row.status === "finished" && row.winner_user_id) {
      result = mates.includes(row.winner_user_id) ? "win" : "loss";
    }
    return {
      id: row.id,
      motion: row.motion,
      format: row.format ?? "1v1",
      date: row.created_at,
      side: isPro ? "pro" : "con",
      opponents: oppNames.filter(Boolean).join(" и ") || "—",
      result,
    };
  });
}

export async function fetchTeamHistory(userId: string): Promise<TeamHistoryItem[]> {
  const { data } = await supabase
    .from("team_memberships")
    .select("id, team_id, team_name, role, joined_at, left_at")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });
  return (data ?? []) as TeamHistoryItem[];
}

export async function fetchAchievements(userId: string, teamIds: string[] = []): Promise<AchievementItem[]> {
  const filters = [`user_id.eq.${userId}`];
  if (teamIds.length) filters.push(`team_id.in.(${teamIds.join(",")})`);
  const { data } = await supabase
    .from("achievements")
    .select("id, title, event_name, place, kind, note, awarded_at, team_id")
    .or(filters.join(","))
    .order("awarded_at", { ascending: false });
  return (data ?? []) as AchievementItem[];
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = data.publicUrl;
  await supabase.from("player_ratings").update({ avatar_url: url }).eq("user_id", userId);
  await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
  return url;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}
