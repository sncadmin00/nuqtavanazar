import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============ Типы ============
export type AdminWeek = {
  id: string;
  week_start: string;
  topic: string | null;
  event_at: string;
  event_ends_at: string | null;
  topic_reveal_at: string;
  pro_percent: number;
  con_percent: number;
  rounds_count: number;
  listeners_total: number;
  ai_summary: string | null;
};

export type Cadence = {
  id: boolean;
  interval_days: number;
  day_of_week: number;
  event_time: string;
  reveal_lead_hours: number;
  event_duration_hours: number;
  timezone: string;
  updated_at: string;
};

export type AdminArgument = {
  id: string;
  week_id: string;
  side: "pro" | "con";
  text: string;
  author_name: string | null;
  knock_count: number;
};

export type AdminQuote = {
  id: string;
  week_id: string;
  text: string;
  author_name: string;
  knock_count: number;
  order_index: number;
};

export type AdminFeatured = {
  id: string;
  week_id: string;
  kind: "best" | "rising";
  display_name: string;
  avatar_url: string | null;
  badge_note: string | null;
};

export type AdminRoundtable = {
  id: string;
  topic: string;
  moderator_name: string | null;
  starts_at: string;
  is_live: boolean;
  capacity: number;
  listeners: number;
  knock_count: number;
  recording_url: string | null;
  participants: any;
};

export type WeekContent = {
  arguments: AdminArgument[];
  quotes: AdminQuote[];
  featured: AdminFeatured[];
};

export type AdminStats = {
  weeks: number;
  votes: number;
  voice_notes: number;
  bookings: number;
  roundtables: number;
};

// ============ Хелпер проверки роли ============
async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Ошибка проверки роли: " + error.message);
  if (!data) throw new Error("Доступ только для администраторов");
}

// ============ Роль текущего пользователя ============
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<"admin" | "user"> => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return data ? "admin" : "user";
  });

// ============ Недели ============
export const listWeeks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminWeek[]> => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("debate_weeks")
      .select("*")
      .order("week_start", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminWeek[];
  });

export const upsertWeek = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id?: string;
    week_start: string;
    event_at: string;
    event_ends_at?: string | null;
    topic?: string | null;
    ai_summary?: string | null;
    pro_percent?: number;
    con_percent?: number;
  }) => input)
  .handler(async ({ data, context }): Promise<AdminWeek> => {
    await requireAdmin(context);
    // topic_reveal_at = event_at - 48h (часовой пояс irrelevant для ISO)
    const eventAt = new Date(data.event_at);
    const reveal = new Date(eventAt.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const payload = {
      week_start: data.week_start,
      topic: data.topic ?? null,
      event_at: data.event_at,
      event_ends_at: data.event_ends_at ?? null,
      topic_reveal_at: reveal,
      ai_summary: data.ai_summary ?? null,
      pro_percent: data.pro_percent ?? 0,
      con_percent: data.con_percent ?? 0,
    } as any;
    let row: AdminWeek | null = null;
    if (data.id) {
      const { data: updated, error } = await context.supabase
        .from("debate_weeks")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = updated as AdminWeek;
    } else {
      const { data: created, error } = await context.supabase
        .from("debate_weeks")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = created as AdminWeek;
    }
    return row!;
  });

export const deleteWeek = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("debate_weeks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ Каденс ============
export const getCadence = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Cadence | null> => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("debate_cadence")
      .select("*")
      .eq("id", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as Cadence | null;
  });

export const updateCadence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    interval_days: number;
    day_of_week: number;
    event_time: string;
    reveal_lead_hours: number;
    event_duration_hours: number;
    timezone: string;
  }) => input)
  .handler(async ({ data, context }): Promise<Cadence> => {
    await requireAdmin(context);
    const payload = {
      id: true,
      interval_days: data.interval_days,
      day_of_week: data.day_of_week,
      event_time: data.event_time,
      reveal_lead_hours: data.reveal_lead_hours,
      event_duration_hours: data.event_duration_hours,
      timezone: data.timezone,
      updated_at: new Date().toISOString(),
    };
    const { data: row, error } = await context.supabase
      .from("debate_cadence")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Cadence;
  });

// ============ Контент недели ============
export const listWeekContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { week_id: string }) => input)
  .handler(async ({ data, context }): Promise<WeekContent> => {
    await requireAdmin(context);
    const [argsRes, quotesRes, featuredRes] = await Promise.all([
      context.supabase
        .from("week_arguments")
        .select("*")
        .eq("week_id", data.week_id)
        .order("side", { ascending: true })
        .order("knock_count", { ascending: false }),
      context.supabase
        .from("week_quotes")
        .select("*")
        .eq("week_id", data.week_id)
        .order("order_index", { ascending: true }),
      context.supabase
        .from("week_featured_speakers")
        .select("*")
        .eq("week_id", data.week_id),
    ]);
    if (argsRes.error) throw new Error(argsRes.error.message);
    if (quotesRes.error) throw new Error(quotesRes.error.message);
    if (featuredRes.error) throw new Error(featuredRes.error.message);
    return {
      arguments: (argsRes.data ?? []) as AdminArgument[],
      quotes: (quotesRes.data ?? []) as AdminQuote[],
      featured: (featuredRes.data ?? []) as AdminFeatured[],
    };
  });

export const upsertArgument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id?: string;
    week_id: string;
    side: "pro" | "con";
    text: string;
    author_name?: string | null;
  }) => input)
  .handler(async ({ data, context }): Promise<AdminArgument> => {
    await requireAdmin(context);
    const payload = {
      week_id: data.week_id,
      side: data.side,
      text: data.text,
      author_name: data.author_name ?? null,
    };
    let row: AdminArgument | null = null;
    if (data.id) {
      const { data: u, error } = await context.supabase
        .from("week_arguments")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = u as AdminArgument;
    } else {
      const { data: c, error } = await context.supabase
        .from("week_arguments")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = c as AdminArgument;
    }
    return row!;
  });

export const deleteArgument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("week_arguments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id?: string;
    week_id: string;
    text: string;
    author_name: string;
    order_index?: number;
  }) => input)
  .handler(async ({ data, context }): Promise<AdminQuote> => {
    const payload = {
      week_id: data.week_id,
      text: data.text,
      author_name: data.author_name,
      order_index: data.order_index ?? 0,
    };
    let row: AdminQuote | null = null;
    if (data.id) {
      const { data: u, error } = await context.supabase
        .from("week_quotes")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = u as AdminQuote;
    } else {
      const { data: c, error } = await context.supabase
        .from("week_quotes")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = c as AdminQuote;
    }
    return row!;
  });

export const deleteQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("week_quotes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id?: string;
    week_id: string;
    kind: "best" | "rising";
    display_name: string;
    avatar_url?: string | null;
    badge_note?: string | null;
  }) => input)
  .handler(async ({ data, context }): Promise<AdminFeatured> => {
    const payload = {
      week_id: data.week_id,
      kind: data.kind,
      display_name: data.display_name,
      avatar_url: data.avatar_url ?? null,
      badge_note: data.badge_note ?? null,
    };
    let row: AdminFeatured | null = null;
    if (data.id) {
      const { data: u, error } = await context.supabase
        .from("week_featured_speakers")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = u as AdminFeatured;
    } else {
      const { data: c, error } = await context.supabase
        .from("week_featured_speakers")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = c as AdminFeatured;
    }
    return row!;
  });

export const deleteFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("week_featured_speakers")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ Круглые столы ============
export const listRoundtablesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminRoundtable[]> => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("roundtables")
      .select("id, topic, moderator_name, starts_at, is_live, capacity, listeners, knock_count, recording_url, participants")
      .order("starts_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminRoundtable[];
  });

export const upsertRoundtable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id?: string;
    topic: string;
    moderator_name?: string | null;
    starts_at: string;
    is_live?: boolean;
    capacity?: number;
    listeners?: number;
    knock_count?: number;
    recording_url?: string | null;
    participants?: unknown;
  }) => input)
  .handler(async ({ data, context }): Promise<AdminRoundtable> => {
    await requireAdmin(context);
    const payload = {
      topic: data.topic,
      moderator_name: data.moderator_name ?? null,
      starts_at: data.starts_at,
      is_live: data.is_live ?? false,
      capacity: data.capacity ?? 6,
      listeners: data.listeners ?? 0,
      knock_count: data.knock_count ?? 0,
      recording_url: data.recording_url ?? null,
      participants: (data.participants as any) ?? [],
    } as any;
    let row: AdminRoundtable | null = null;
    if (data.id) {
      const { data: u, error } = await context.supabase
        .from("roundtables")
        .update(payload)
        .eq("id", data.id)
        .select("id, topic, moderator_name, starts_at, is_live, capacity, listeners, knock_count, recording_url, participants")
        .single();
      if (error) throw new Error(error.message);
      row = u as AdminRoundtable;
    } else {
      const { data: c, error } = await context.supabase
        .from("roundtables")
        .insert(payload)
        .select("id, topic, moderator_name, starts_at, is_live, capacity, listeners, knock_count, recording_url, participants")
        .single();
      if (error) throw new Error(error.message);
      row = c as AdminRoundtable;
    }
    return row!;
  });

export const deleteRoundtable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("roundtables").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ Сводка ============
export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminStats> => {
    await requireAdmin(context);
    const sb = context.supabase;
    const [weeks, votes, voice, bookings, rts] = await Promise.all([
      sb.from("debate_weeks").select("id", { count: "exact", head: true }),
      sb.from("week_public_votes").select("id", { count: "exact", head: true }),
      sb.from("week_voice_notes").select("id", { count: "exact", head: true }),
      sb.from("challenge_bookings").select("id", { count: "exact", head: true }),
      sb.from("roundtables").select("id", { count: "exact", head: true }),
    ]);
    return {
      weeks: weeks.count ?? 0,
      votes: votes.count ?? 0,
      voice_notes: voice.count ?? 0,
      bookings: bookings.count ?? 0,
      roundtables: rts.count ?? 0,
    };
  });
