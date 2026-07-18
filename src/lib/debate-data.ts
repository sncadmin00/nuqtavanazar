import { supabase } from "@/integrations/supabase/client";

export type DebateWeek = {
  id: string;
  week_start: string;
  topic: string | null;
  topic_reveal_at: string;
  event_at: string;
  pro_percent: number;
  con_percent: number;
  rounds_count: number;
  listeners_total: number;
  ai_summary: string | null;
};

export type LiveRoom = {
  id: string;
  format: "1v1" | "2v2" | "roundtable";
  topic: string | null;
  listeners: number;
  is_live: boolean;
};

export type Roundtable = {
  id: string;
  topic: string;
  moderator_name: string | null;
  participants: { name: string }[];
  listeners: number;
  knock_count: number;
  opinion_before: number | null;
  opinion_after: number | null;
  best_speaker_name: string | null;
  is_live: boolean;
};

export type Highlight = {
  id: string;
  week_id: string;
  title: string;
  participants: string | null;
  format: string | null;
  knock_count: number;
  recording_url: string | null;
};

export async function fetchCurrentWeek(): Promise<DebateWeek | null> {
  const { data } = await supabase
    .from("debate_weeks")
    .select("*")
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as DebateWeek | null;
}

export async function fetchPreviousWeek(): Promise<DebateWeek | null> {
  const { data } = await supabase
    .from("debate_weeks")
    .select("*")
    .order("week_start", { ascending: false })
    .range(1, 1)
    .maybeSingle();
  return data as DebateWeek | null;
}

export async function fetchAllWeeks(): Promise<DebateWeek[]> {
  const { data } = await supabase
    .from("debate_weeks")
    .select("*")
    .order("week_start", { ascending: false });
  return (data as DebateWeek[]) ?? [];
}

export async function fetchLiveRooms(): Promise<LiveRoom[]> {
  const { data } = await supabase
    .from("live_rooms")
    .select("*")
    .eq("is_live", true);
  return (data as LiveRoom[]) ?? [];
}

export async function fetchActiveRoundtable(): Promise<Roundtable | null> {
  const { data } = await supabase
    .from("roundtables")
    .select("*")
    .eq("is_live", true)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Roundtable | null;
}

export async function fetchWeekHighlight(weekId: string): Promise<Highlight | null> {
  const { data } = await supabase
    .from("week_highlights")
    .select("*")
    .eq("week_id", weekId)
    .limit(1)
    .maybeSingle();
  return data as Highlight | null;
}

export async function fetchTopRatings(limit = 20) {
  const { data } = await supabase
    .from("player_ratings")
    .select("user_id, mastery, mastery_trend_week, display_name, avatar_url, league")
    .order("mastery", { ascending: false })
    .limit(limit);
  return data ?? [];
}
