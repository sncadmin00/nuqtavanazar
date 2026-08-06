import { supabase } from "@/integrations/supabase/client";

export type ChallengeRow = {
  id: string;
  week_id: string;
  from_user_id: string;
  to_user_id: string;
  from_name: string;
  to_name: string;
  kind: "scheduled" | "instant";
  status: "pending" | "accepted" | "declined" | "cancelled" | "started" | "expired";
  duel_id: string | null;
  expires_at: string | null;
  created_at: string;
};

export type LobbyPeer = {
  user_id: string;
  name: string;
  mastery: number;
  busy: boolean;
};

export const LOBBY_CHANNEL = "duel-lobby";

/** Публичное имя игрока: из рейтинга, иначе из почты */
export async function resolveMyName(userId: string, email?: string | null): Promise<string> {
  const { data } = await supabase
    .from("player_ratings")
    .select("display_name")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.display_name || email?.split("@")[0] || "Спикер";
}

export async function listMyChallenges(userId: string): Promise<ChallengeRow[]> {
  const { data } = await supabase
    .from("duel_challenges")
    .select("*")
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .in("status", ["pending", "accepted", "started"])
    .order("created_at", { ascending: false })
    .limit(30);
  return (data ?? []) as ChallengeRow[];
}

export async function sendChallenge(input: {
  weekId: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  kind?: "scheduled" | "instant";
  ttlMinutes?: number;
}): Promise<ChallengeRow> {
  const kind = input.kind ?? "scheduled";
  const ttl = input.ttlMinutes ?? (kind === "instant" ? 5 : 0);
  const { data, error } = await supabase
    .from("duel_challenges")
    .insert({
      week_id: input.weekId,
      from_user_id: input.fromUserId,
      to_user_id: input.toUserId,
      from_name: input.fromName,
      to_name: input.toName,
      kind,
      expires_at: ttl > 0 ? new Date(Date.now() + ttl * 60_000).toISOString() : null,
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("Вызов этому игроку уже отправлен");
    throw new Error(error.message);
  }
  return data as ChallengeRow;
}

export async function respondToChallenge(id: string, accept: boolean) {
  const { error } = await supabase
    .from("duel_challenges")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}

export async function cancelChallenge(id: string) {
  const { error } = await supabase
    .from("duel_challenges")
    .update({ status: "cancelled", responded_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["pending", "accepted"]);
  if (error) throw new Error(error.message);
}

/** Создаёт батл по принятому вызову (стороны определяет кубик на сервере) */
export async function startChallengeDuel(id: string): Promise<string> {
  const { data, error } = await supabase.rpc("start_challenge_duel", { _challenge_id: id });
  if (error) throw new Error(error.message);
  return data as unknown as string;
}
