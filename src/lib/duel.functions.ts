import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  PREP_SECONDS,
  MIN_TURN_CHARS,
  MAX_TURN_CHARS,
  totalTurns,
  turnSpec,
  type TurnSpec,
} from "@/lib/duel-config";

type DuelSeats = {
  format: string;
  pro_user_id: string;
  con_user_id: string | null;
  pro_user2_id: string | null;
  con_user2_id: string | null;
};

/** Кто держит слово на этом ходу */
function userForSpec(duel: DuelSeats, spec: TurnSpec): string | null {
  if (spec.side === "pro") return spec.seat === 2 ? (duel.pro_user2_id ?? duel.pro_user_id) : duel.pro_user_id;
  return spec.seat === 2 ? (duel.con_user2_id ?? duel.con_user_id) : duel.con_user_id;
}


export type DuelWindow = {
  open: boolean;
  week_id: string | null;
  topic: string | null;
  event_at: string | null;
  event_ends_at: string | null;
  reason: "no_week" | "no_topic" | "before" | "after" | "open";
};

type WeekRow = {
  id: string;
  topic: string | null;
  event_at: string;
  event_ends_at: string | null;
};

function endsAt(w: WeekRow) {
  return new Date(w.event_ends_at ?? new Date(new Date(w.event_at).getTime() + 3 * 3600_000).toISOString());
}

async function resolveWindow(supabase: any): Promise<DuelWindow> {
  const now = new Date();
  const { data: rows } = await supabase
    .from("debate_weeks")
    .select("id, topic, event_at, event_ends_at")
    .order("event_at", { ascending: false })
    .limit(12);

  const weeks = (rows ?? []) as WeekRow[];
  if (!weeks.length) {
    return { open: false, week_id: null, topic: null, event_at: null, event_ends_at: null, reason: "no_week" };
  }

  // текущая неделя = ближайшая, чьё событие ещё не закончилось; иначе последняя прошедшая
  const upcoming = [...weeks].reverse().find((w) => endsAt(w) >= now);
  const week = upcoming ?? weeks[0];
  const start = new Date(week.event_at);
  const end = endsAt(week);

  const base = {
    week_id: week.id,
    topic: week.topic,
    event_at: week.event_at,
    event_ends_at: end.toISOString(),
  };

  if (!week.topic) return { ...base, open: false, reason: "no_topic" };
  if (now < start) return { ...base, open: false, reason: "before" };
  if (now > end) return { ...base, open: false, reason: "after" };
  return { ...base, open: true, reason: "open" };
}

/** Публичная проверка: идёт ли сейчас окно баттлов */
export const getDuelWindow = createServerFn({ method: "GET" }).handler(async (): Promise<DuelWindow> => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: any, init: any) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  return resolveWindow(supabase);
});

/** Вход в баттл дня: тема берётся из недели, стороны назначает кубик */
export const enterDuel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ duel_id: string; role: "pro" | "con"; matched: boolean }> => {
    const { supabase, userId } = context;

    const win = await resolveWindow(supabase);
    if (!win.open || !win.week_id || !win.topic) {
      throw new Error(
        win.reason === "before"
          ? "Баттлы откроются в день дебатов"
          : win.reason === "after"
            ? "День дебатов уже завершён"
            : "Тема дня ещё не объявлена",
      );
    }

    const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle();
    const myName = prof?.display_name ?? "Спикер";

    // уже в активной дуэли?
    const { data: mine } = await supabase
      .from("duels")
      .select("id, pro_user_id, status")
      .in("status", ["waiting", "live", "judging"])
      .or(`pro_user_id.eq.${userId},con_user_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (mine) {
      return { duel_id: mine.id, role: mine.pro_user_id === userId ? "pro" : "con", matched: mine.status !== "waiting" };
    }

    // ищем ожидающего соперника по теме этой недели
    const { data: open } = await supabase
      .from("duels")
      .select("id, pro_user_id, pro_name, room_name")
      .eq("status", "waiting")
      .eq("week_id", win.week_id)
      .neq("pro_user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (open) {
      // Кубик: кто получает сторону «За»
      const joinerIsPro = Math.random() < 0.5;
      const prepEnds = new Date(Date.now() + PREP_SECONDS * 1000);
      const firstTurnEnds = new Date(prepEnds.getTime() + secondsForTurn(1) * 1000);

      const proId = joinerIsPro ? userId : open.pro_user_id;
      const proName = joinerIsPro ? myName : (open.pro_name ?? "Спикер");
      const conId = joinerIsPro ? open.pro_user_id : userId;
      const conName = joinerIsPro ? (open.pro_name ?? "Спикер") : myName;

      const { data: joined, error } = await supabase
        .from("duels")
        .update({
          pro_user_id: proId,
          pro_name: proName,
          con_user_id: conId,
          con_name: conName,
          status: "live",
          turn_index: 1,
          turn_user_id: proId,
          prep_ends_at: prepEnds.toISOString(),
          turn_ends_at: firstTurnEnds.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", open.id)
        .eq("status", "waiting")
        .select("id")
        .maybeSingle();
      if (!error && joined) {
        return { duel_id: joined.id, role: joinerIsPro ? "pro" : "con", matched: true };
      }
    }

    const { data: created, error: createErr } = await supabase
      .from("duels")
      .insert({
        motion: win.topic,
        week_id: win.week_id,
        pro_user_id: userId,
        pro_name: myName,
        status: "waiting",
      })
      .select("id")
      .single();
    if (createErr) throw new Error(createErr.message);

    await supabase.from("duels").update({ room_name: `duel-${created.id}` }).eq("id", created.id);
    return { duel_id: created.id, role: "pro", matched: false };
  });

export const cancelDuel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = (input ?? {}) as { duel_id?: string };
    if (!i.duel_id) throw new Error("duel_id обязателен");
    return { duel_id: i.duel_id };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("duels")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", data.duel_id)
      .eq("pro_user_id", userId)
      .eq("status", "waiting");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitDuelTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = (input ?? {}) as { duel_id?: string; text?: string; audio_path?: string; duration_sec?: number };
    const text = (i.text ?? "").trim();
    const audio_path = (i.audio_path ?? "").trim() || null;
    if (!i.duel_id) throw new Error("duel_id обязателен");
    if (!audio_path && text.length < MIN_TURN_CHARS) {
      throw new Error(`Реплика слишком короткая (минимум ${MIN_TURN_CHARS} символов)`);
    }
    return {
      duel_id: i.duel_id,
      text: text.slice(0, MAX_TURN_CHARS),
      audio_path,
      duration_sec: Math.max(0, Math.min(600, Math.round(i.duration_sec ?? 0))),
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: duel, error } = await supabase
      .from("duels")
      .select("id, status, turn_index, turn_user_id, pro_user_id, con_user_id, prep_ends_at")
      .eq("id", data.duel_id)
      .maybeSingle();
    if (error || !duel) throw new Error("Дуэль не найдена");
    if (duel.status !== "live") throw new Error("Раунд не идёт");
    if (duel.turn_user_id !== userId) throw new Error("Сейчас не ваш ход");
    if (duel.prep_ends_at && new Date(duel.prep_ends_at) > new Date()) throw new Error("Идёт подготовка");

    const idx = duel.turn_index;
    const side = sideForTurn(idx);
    const { error: insErr } = await supabase.from("duel_turns").insert({
      duel_id: duel.id,
      idx,
      user_id: userId,
      side,
      text: data.text,
      audio_path: data.audio_path,
      duration_sec: data.duration_sec,
    });
    if (insErr) throw new Error(insErr.message);

    const isLast = idx >= TOTAL_TURNS;
    const nextIdx = idx + 1;
    const nextUser = sideForTurn(nextIdx) === "pro" ? duel.pro_user_id : duel.con_user_id;
    await supabase
      .from("duels")
      .update(
        isLast
          ? { status: "judging", turn_user_id: null, turn_ends_at: null, updated_at: new Date().toISOString() }
          : {
              turn_index: nextIdx,
              turn_user_id: nextUser,
              turn_ends_at: new Date(Date.now() + secondsForTurn(nextIdx) * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            },
      )
      .eq("id", duel.id);

    return { ok: true, finished: isLast };
  });

/** Расшифровка аудио-хода: клиент загружает файл в bucket duel-audio и присылает путь */
export const transcribeDuelAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = (input ?? {}) as { audio_path?: string };
    const p = (i.audio_path ?? "").trim();
    if (!p) throw new Error("audio_path обязателен");
    return { audio_path: p };
  })
  .handler(async ({ data }): Promise<{ text: string }> => {
    const { transcribeAudioFromStorage } = await import("@/lib/duel.server");
    return { text: await transcribeAudioFromStorage(data.audio_path) };
  });

export const finishDuel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = (input ?? {}) as { duel_id?: string };
    if (!i.duel_id) throw new Error("duel_id обязателен");
    return { duel_id: i.duel_id };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: duel } = await supabase
      .from("duels")
      .select("id, motion, status, pro_user_id, con_user_id, pro_name, con_name, verdict")
      .eq("id", data.duel_id)
      .maybeSingle();
    if (!duel) throw new Error("Дуэль не найдена");
    if (duel.pro_user_id !== userId && duel.con_user_id !== userId) throw new Error("Вы не участник дуэли");
    if (duel.status === "finished") return { ok: true, already: true };
    if (duel.status !== "judging") throw new Error("Раунд ещё не завершён");

    const { data: turns } = await supabase
      .from("duel_turns")
      .select("idx, side, text")
      .eq("duel_id", duel.id)
      .order("idx", { ascending: true });

    const { judgeDuelTranscript, applyDuelElo } = await import("@/lib/duel.server");
    const verdict = await judgeDuelTranscript(
      duel.motion,
      duel.pro_name ?? "За",
      duel.con_name ?? "Против",
      (turns ?? []) as { idx: number; side: string; text: string }[],
    );

    const winnerId = verdict.winner === "pro" ? duel.pro_user_id : duel.con_user_id;
    const loserId = verdict.winner === "pro" ? duel.con_user_id : duel.pro_user_id;

    await supabase
      .from("duels")
      .update({
        status: "finished",
        verdict: JSON.parse(JSON.stringify(verdict)),
        winner_user_id: winnerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", duel.id);

    if (winnerId && loserId) {
      await applyDuelElo(winnerId, loserId, {
        [duel.pro_user_id]: duel.pro_name ?? "Спикер",
        ...(duel.con_user_id ? { [duel.con_user_id]: duel.con_name ?? "Спикер" } : {}),
      });
    }
    return { ok: true, already: false };
  });

/** Токен для аудио-комнаты LiveKit */
export const getDuelRoomToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = (input ?? {}) as { duel_id?: string };
    if (!i.duel_id) throw new Error("duel_id обязателен");
    return { duel_id: i.duel_id };
  })
  .handler(async ({ data, context }): Promise<{ url: string; token: string; room: string } | { unavailable: true }> => {
    const { supabase, userId } = context;
    const { data: duel } = await supabase
      .from("duels")
      .select("id, room_name, pro_user_id, con_user_id, pro_name, con_name")
      .eq("id", data.duel_id)
      .maybeSingle();
    if (!duel) throw new Error("Дуэль не найдена");
    if (duel.pro_user_id !== userId && duel.con_user_id !== userId) throw new Error("Вы не участник дуэли");

    const { createRoomToken, livekitConfigured, livekitUrl } = await import("@/lib/livekit.server");
    if (!livekitConfigured()) return { unavailable: true };

    const room = duel.room_name ?? `duel-${duel.id}`;
    const name = duel.pro_user_id === userId ? (duel.pro_name ?? "За") : (duel.con_name ?? "Против");
    const token = await createRoomToken(room, userId, name);
    return { url: livekitUrl(), token, room };
  });
