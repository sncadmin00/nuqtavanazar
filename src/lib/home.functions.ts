import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DuelWindow } from "@/lib/duel.functions";

function isNewSupabaseApiKey(v: string) {
  return v.startsWith("sb_publishable_") || v.startsWith("sb_secret_");
}

function makeServerPublicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isNewSupabaseApiKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export type HomePhase = "discussion" | "game_day";

export type WeekPublic = {
  id: string;
  week_start: string;
  event_at: string;
  event_ends_at: string | null;
  topic_reveal_at: string;
  pro_percent: number;
  con_percent: number;
  rounds_count: number;
  listeners_total: number;
  topic?: string;
  ai_summary?: string;
};

export type IdeaArgument = {
  id: string;
  side: "pro" | "con";
  text: string;
  author_name: string | null;
  knock_count: number;
};

export type WeekQuote = {
  id: string;
  text: string;
  author_name: string;
  knock_count: number;
};

export type FeaturedSpeaker = {
  id: string;
  kind: "best" | "rising";
  display_name: string;
  avatar_url: string | null;
  badge_note: string | null;
};

export type RatingRow = {
  user_id: string;
  mastery: number;
  mastery_trend_week: number;
  display_name: string | null;
  avatar_url: string | null;
  league: string;
};

export type MatchesStatus = {
  mode: "bookings" | "live";
  one_v_one: number;
  two_v_two: number;
  listeners_one: number;
  listeners_two: number;
};

export type VoiceNote = {
  id: string;
  author_name: string;
  audio_url: string;
  duration_sec: number;
  transcript_preview: string | null;
  knock_count: number;
  created_at: string;
};

export type RoundtableCardState =
  | { state: "live"; roundtable: LiveRT }
  | { state: "upcoming"; roundtable: UpcomingRT }
  | { state: "past"; roundtable: PastRT }
  | { state: "empty" };

type LiveRT = {
  id: string;
  topic: string;
  moderator_name: string | null;
  participants: { full_name: string; pitch?: string }[];
  listeners: number;
  knock_count: number;
};
type UpcomingRT = {
  id: string;
  topic: string;
  starts_at: string;
  moderator_name: string | null;
  participants: { full_name: string; pitch?: string }[];
  capacity: number;
  seats_free: number;
};
type PastRT = {
  id: string;
  topic: string;
  starts_at: string;
  moderator_name: string | null;
  participants: { full_name: string; pitch?: string }[];
  best_speaker_name: string | null;
  opinion_before: number | null;
  opinion_after: number | null;
  listeners: number;
  recording_url: string | null;
};

export type RetroPollStats = { pro: number; con: number; total: number };

export type HomeState = {
  phase: HomePhase;
  now: string;
  current_week: WeekPublic | null;
  previous_week: WeekPublic | null;
  matches: MatchesStatus;
  roundtable: RoundtableCardState;
  discussion?: {
    arguments_pro: IdeaArgument[];
    arguments_con: IdeaArgument[];
    quotes: WeekQuote[];
    featured: FeaturedSpeaker[];
    poll: RetroPollStats;
    ranking: RatingRow[];
    voice_notes: VoiceNote[];
    voice_week_id: string;
  };
};

function stripSecrets(row: any, revealed: boolean, gameOver: boolean): WeekPublic {
  const out: WeekPublic = {
    id: row.id,
    week_start: row.week_start,
    event_at: row.event_at,
    event_ends_at: row.event_ends_at ?? null,
    topic_reveal_at: row.topic_reveal_at,
    pro_percent: row.pro_percent ?? 0,
    con_percent: row.con_percent ?? 0,
    rounds_count: row.rounds_count ?? 0,
    listeners_total: row.listeners_total ?? 0,
  };
  if (revealed && row.topic) out.topic = row.topic;
  if (gameOver && row.ai_summary) out.ai_summary = row.ai_summary;
  return out;
}

async function loadRoundtableCard(
  sb: ReturnType<typeof makeServerPublicClient>,
  phase: HomePhase,
): Promise<RoundtableCardState> {
  const nowIso = new Date().toISOString();

  if (phase === "game_day") {
    // Live first, then upcoming within this cycle
    const { data: live } = await sb
      .from("roundtables")
      .select("id, topic, moderator_name, participants, listeners, knock_count")
      .eq("is_live", true)
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (live) {
      return {
        state: "live",
        roundtable: {
          id: live.id,
          topic: live.topic,
          moderator_name: live.moderator_name,
          participants: (live.participants as any[]) ?? [],
          listeners: live.listeners,
          knock_count: live.knock_count,
        },
      };
    }
    const { data: upcoming } = await sb
      .from("roundtables")
      .select("id, topic, moderator_name, participants, starts_at, capacity")
      .eq("is_live", false)
      .gt("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (upcoming) {
      const parts = ((upcoming.participants as any[]) ?? []).map((p) => ({
        full_name: p.full_name ?? p.name ?? "Участник",
        pitch: p.pitch,
      }));
      const capacity = (upcoming as any).capacity ?? 6;
      return {
        state: "upcoming",
        roundtable: {
          id: upcoming.id,
          topic: upcoming.topic,
          starts_at: upcoming.starts_at,
          moderator_name: upcoming.moderator_name,
          participants: parts,
          capacity,
          seats_free: Math.max(0, capacity - parts.length),
        },
      };
    }
    return { state: "empty" };
  }

  // Discussion mode: last recorded roundtable
  const { data: past } = await sb
    .from("roundtables")
    .select("id, topic, moderator_name, participants, starts_at, best_speaker_name, opinion_before, opinion_after, listeners, recording_url")
    .eq("is_live", false)
    .lte("starts_at", nowIso)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (past) {
    const parts = ((past.participants as any[]) ?? []).map((p) => ({
      full_name: p.full_name ?? p.name ?? "Участник",
      pitch: p.pitch,
    }));
    return {
      state: "past",
      roundtable: {
        id: past.id,
        topic: past.topic,
        starts_at: past.starts_at,
        moderator_name: past.moderator_name,
        participants: parts,
        best_speaker_name: past.best_speaker_name,
        opinion_before: past.opinion_before,
        opinion_after: past.opinion_after,
        listeners: past.listeners,
        recording_url: (past as any).recording_url ?? null,
      },
    };
  }
  return { state: "empty" };
}

async function loadMatches(sb: ReturnType<typeof makeServerPublicClient>, week: any, now: Date, eventAt: Date): Promise<MatchesStatus> {
  const eventStarted = now >= eventAt;
  if (eventStarted) {
    const { data } = await sb.from("live_rooms").select("format, listeners").eq("is_live", true);
    const rows = data ?? [];
    return {
      mode: "live",
      one_v_one: rows.filter((r: any) => r.format === "1v1").length,
      two_v_two: rows.filter((r: any) => r.format === "2v2").length,
      listeners_one: rows.filter((r: any) => r.format === "1v1").reduce((a: number, r: any) => a + (r.listeners ?? 0), 0),
      listeners_two: rows.filter((r: any) => r.format === "2v2").reduce((a: number, r: any) => a + (r.listeners ?? 0), 0),
    };
  }
  if (!week) return { mode: "bookings", one_v_one: 0, two_v_two: 0, listeners_one: 0, listeners_two: 0 };
  const { data } = await sb
    .from("challenge_bookings")
    .select("format")
    .eq("week_id", week.id)
    .eq("status", "confirmed");
  const rows = data ?? [];
  return {
    mode: "bookings",
    one_v_one: rows.filter((r: any) => r.format === "1v1").length,
    two_v_two: rows.filter((r: any) => r.format === "2v2").length,
    listeners_one: 0,
    listeners_two: 0,
  };
}

export const getHomeState = createServerFn({ method: "GET" }).handler(async (): Promise<HomeState> => {
  const sb = makeServerPublicClient();
  const now = new Date();
  const nowIso = now.toISOString();

  const { data: weeks } = await sb
    .from("debate_weeks")
    .select("*")
    .order("week_start", { ascending: false })
    .limit(5);

  const list = weeks ?? [];
  // current = the upcoming/ongoing week (event_ends_at in future OR event_at closest to now going forward)
  let current: any = null;
  let previous: any = null;
  for (const w of list) {
    const ends = new Date(w.event_ends_at ?? w.event_at);
    if (ends >= now && !current) {
      current = w;
    } else if (ends < now && !previous) {
      previous = w;
      break;
    }
  }
  if (!current) current = list[0] ?? null;
  if (!previous) previous = list.find((w: any) => w.id !== current?.id) ?? null;

  const eventAt = current ? new Date(current.event_at) : null;
  const eventEnds = current ? new Date(current.event_ends_at ?? current.event_at) : null;
  // Reveal window is derived from event_at (48h before), so it always stays
  // in sync if the debate day is rescheduled — the DB column is a fallback.
  const derivedReveal = eventAt ? new Date(eventAt.getTime() - 48 * 60 * 60 * 1000) : null;
  const columnReveal = current?.topic_reveal_at ? new Date(current.topic_reveal_at) : null;
  const revealAt = derivedReveal ?? columnReveal;

  const revealed = !!(revealAt && now >= revealAt);
  const eventOver = !!(eventEnds && now >= eventEnds);

  const phase: HomePhase = revealed && !eventOver ? "game_day" : "discussion";

  const currentPub = current ? stripSecrets(current, revealed, eventOver) : null;
  const previousPub = previous ? stripSecrets(previous, true, true) : null;

  const [matches, roundtable] = await Promise.all([
    current && eventAt ? loadMatches(sb, current, now, eventAt) : Promise.resolve<MatchesStatus>({ mode: "bookings", one_v_one: 0, two_v_two: 0, listeners_one: 0, listeners_two: 0 }),
    loadRoundtableCard(sb, phase),
  ]);

  let discussion: HomeState["discussion"];
  if (phase === "discussion" && previous) {
    const [argsRes, quotesRes, featuredRes, pollRes, ratingsRes, voiceRes] = await Promise.all([
      sb.from("week_arguments").select("*").eq("week_id", previous.id).order("knock_count", { ascending: false }),
      sb.from("week_quotes").select("*").eq("week_id", previous.id).order("order_index", { ascending: true }).limit(4),
      sb.from("week_featured_speakers").select("*").eq("week_id", previous.id),
      sb.rpc("get_week_vote_stats", { _week_id: previous.id }),
      sb.from("player_ratings").select("user_id, mastery, mastery_trend_week, display_name, avatar_url, league").order("mastery", { ascending: false }).limit(10),
      sb.from("week_voice_notes")
        .select("id, author_name, audio_path, duration_sec, transcript_preview, knock_count, created_at")
        .eq("week_id", previous.id)
        .eq("status", "approved")
        .eq("visibility", "public")
        .order("knock_count", { ascending: false })
        .limit(50),
    ]);
    const args = (argsRes.data ?? []) as IdeaArgument[];
    const pollData = Array.isArray(pollRes.data) ? pollRes.data[0] : pollRes.data;
    const supaUrl = process.env.SUPABASE_URL!;
    const voice_notes: VoiceNote[] = ((voiceRes.data ?? []) as any[]).map((v) => ({
      id: v.id,
      author_name: v.author_name,
      audio_url: `${supaUrl}/storage/v1/object/public/week-voice/${v.audio_path}`,
      duration_sec: v.duration_sec,
      transcript_preview: v.transcript_preview,
      knock_count: v.knock_count,
      created_at: v.created_at,
    }));
    discussion = {
      arguments_pro: args.filter((a) => a.side === "pro").slice(0, 2),
      arguments_con: args.filter((a) => a.side === "con").slice(0, 2),
      quotes: (quotesRes.data ?? []) as WeekQuote[],
      featured: (featuredRes.data ?? []) as FeaturedSpeaker[],
      poll: (pollData as RetroPollStats) ?? { pro: 0, con: 0, total: 0 },
      ranking: (ratingsRes.data ?? []) as RatingRow[],
      voice_notes,
      voice_week_id: previous.id,
    };
  }

  return {
    phase,
    now: nowIso,
    current_week: currentPub,
    previous_week: previousPub,
    matches,
    roundtable,
    discussion,
  };
});

export const castRetroVote = createServerFn({ method: "POST" })
  .inputValidator((input: { week_id: string; visitor_id: string; side: "pro" | "con" }) => input)
  .handler(async ({ data }): Promise<RetroPollStats> => {
    const sb = makeServerPublicClient();
    const { data: rows, error } = await sb.rpc("cast_retro_vote", {
      _week_id: data.week_id,
      _visitor_id: data.visitor_id,
      _side: data.side,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(rows) ? rows[0] : rows;
    return (row as RetroPollStats) ?? { pro: 0, con: 0, total: 0 };
  });

export const fetchRetroPollStats = createServerFn({ method: "GET" })
  .inputValidator((input: { week_id: string }) => input)
  .handler(async ({ data }): Promise<RetroPollStats> => {
    const sb = makeServerPublicClient();
    const { data: rows } = await sb.rpc("get_week_vote_stats", { _week_id: data.week_id });
    const row = Array.isArray(rows) ? rows[0] : rows;
    return (row as RetroPollStats) ?? { pro: 0, con: 0, total: 0 };
  });



export const createVoiceNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    week_id: string;
    audio_path: string;
    duration_sec: number;
    transcript_preview?: string;
  }) => input)
  .handler(async ({ data, context }): Promise<VoiceNote> => {
    if (data.duration_sec <= 0 || data.duration_sec > 65) {
      throw new Error("Длительность записи должна быть от 1 до 60 секунд");
    }
    if (!data.audio_path.startsWith(`${context.userId}/`)) {
      throw new Error("Неверный путь к файлу");
    }
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("display_name")
      .eq("id", context.userId)
      .maybeSingle();
    const author_name = profile?.display_name ?? "Автор";
    const { data: row, error } = await context.supabase
      .from("week_voice_notes")
      .insert({
        week_id: data.week_id,
        user_id: context.userId,
        author_name,
        audio_path: data.audio_path,
        duration_sec: Math.round(data.duration_sec),
        transcript_preview: data.transcript_preview?.slice(0, 140) ?? null,
      })
      .select("id, author_name, audio_path, duration_sec, transcript_preview, knock_count, created_at")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: row.id,
      author_name: row.author_name,
      audio_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/week-voice/${row.audio_path}`,
      duration_sec: row.duration_sec,
      transcript_preview: row.transcript_preview,
      knock_count: row.knock_count,
      created_at: row.created_at,
    };
  });

export const knockVoiceNote = createServerFn({ method: "POST" })
  .inputValidator((input: { voice_note_id: string; visitor_id: string }) => input)
  .handler(async ({ data }): Promise<number> => {
    const sb = makeServerPublicClient();
    const { data: count, error } = await sb.rpc("knock_week_voice_note", {
      _voice_note_id: data.voice_note_id,
      _visitor_id: data.visitor_id,
    });
    if (error) throw new Error(error.message);
    return (count as number) ?? 0;
  });

export type ArchivedWeekState = {
  week: WeekPublic;
  discussion: NonNullable<HomeState["discussion"]>;
  roundtable: RoundtableCardState;
  prev_week_id: string | null;
  next_week_id: string | null;
};

async function loadPastRoundtableForWeek(
  sb: ReturnType<typeof makeServerPublicClient>,
  weekStartIso: string,
): Promise<RoundtableCardState> {
  const start = new Date(weekStartIso);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { data: past } = await sb
    .from("roundtables")
    .select("id, topic, moderator_name, participants, starts_at, best_speaker_name, opinion_before, opinion_after, listeners, recording_url")
    .eq("is_live", false)
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString())
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!past) return { state: "empty" };
  const parts = ((past.participants as any[]) ?? []).map((p) => ({
    full_name: p.full_name ?? p.name ?? "Участник",
    pitch: p.pitch,
  }));
  return {
    state: "past",
    roundtable: {
      id: past.id,
      topic: past.topic,
      starts_at: past.starts_at,
      moderator_name: past.moderator_name,
      participants: parts,
      best_speaker_name: past.best_speaker_name,
      opinion_before: past.opinion_before,
      opinion_after: past.opinion_after,
      listeners: past.listeners,
      recording_url: (past as any).recording_url ?? null,
    },
  };
}

export const getArchivedWeek = createServerFn({ method: "GET" })
  .inputValidator((input: { week_id?: string }) => input)
  .handler(async ({ data }): Promise<ArchivedWeekState | null> => {
    const sb = makeServerPublicClient();
    const now = new Date();

    let target: any = null;
    if (data.week_id) {
      const { data: row } = await sb.from("debate_weeks").select("*").eq("id", data.week_id).maybeSingle();
      target = row;
    } else {
      const { data: rows } = await sb
        .from("debate_weeks")
        .select("*")
        .order("week_start", { ascending: false })
        .limit(10);
      target = (rows ?? []).find((w: any) => new Date(w.event_ends_at ?? w.event_at) < now) ?? null;
    }
    if (!target) return null;

    const targetEnds = new Date(target.event_ends_at ?? target.event_at);
    if (targetEnds >= now) return null;

    const [{ data: olderRows }, { data: newerRows }] = await Promise.all([
      sb.from("debate_weeks").select("id, week_start, event_at, event_ends_at").lt("week_start", target.week_start).order("week_start", { ascending: false }).limit(1),
      sb.from("debate_weeks").select("id, week_start, event_at, event_ends_at").gt("week_start", target.week_start).order("week_start", { ascending: true }).limit(10),
    ]);
    const prev_week_id = (olderRows?.[0]?.id as string | undefined) ?? null;
    const nextCompleted = (newerRows ?? []).find(
      (w: any) => new Date(w.event_ends_at ?? w.event_at) < now,
    );
    const next_week_id = (nextCompleted?.id as string | undefined) ?? null;

    const weekPub = stripSecrets(target, true, true);

    const [argsRes, quotesRes, featuredRes, pollRes, ratingsRes, voiceRes, roundtable] = await Promise.all([
      sb.from("week_arguments").select("*").eq("week_id", target.id).order("knock_count", { ascending: false }),
      sb.from("week_quotes").select("*").eq("week_id", target.id).order("order_index", { ascending: true }).limit(4),
      sb.from("week_featured_speakers").select("*").eq("week_id", target.id),
      sb.rpc("get_week_vote_stats", { _week_id: target.id }),
      sb.from("player_ratings").select("user_id, mastery, mastery_trend_week, display_name, avatar_url, league").order("mastery", { ascending: false }).limit(10),
      sb.from("week_voice_notes")
        .select("id, author_name, audio_path, duration_sec, transcript_preview, knock_count, created_at")
        .eq("week_id", target.id)
        .eq("status", "approved")
        .eq("visibility", "public")
        .order("knock_count", { ascending: false })
        .limit(50),
      loadPastRoundtableForWeek(sb, target.week_start),
    ]);

    const args = (argsRes.data ?? []) as IdeaArgument[];
    const pollData = Array.isArray(pollRes.data) ? pollRes.data[0] : pollRes.data;
    const supaUrl = process.env.SUPABASE_URL!;
    const voice_notes: VoiceNote[] = ((voiceRes.data ?? []) as any[]).map((v) => ({
      id: v.id,
      author_name: v.author_name,
      audio_url: `${supaUrl}/storage/v1/object/public/week-voice/${v.audio_path}`,
      duration_sec: v.duration_sec,
      transcript_preview: v.transcript_preview,
      knock_count: v.knock_count,
      created_at: v.created_at,
    }));

    return {
      week: weekPub,
      discussion: {
        arguments_pro: args.filter((a) => a.side === "pro").slice(0, 2),
        arguments_con: args.filter((a) => a.side === "con").slice(0, 2),
        quotes: (quotesRes.data ?? []) as WeekQuote[],
        featured: (featuredRes.data ?? []) as FeaturedSpeaker[],
        poll: (pollData as RetroPollStats) ?? { pro: 0, con: 0, total: 0 },
        ranking: (ratingsRes.data ?? []) as RatingRow[],
        voice_notes,
        voice_week_id: target.id,
      },
      roundtable,
      prev_week_id,
      next_week_id,
    };
  });


