import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TOTAL_TURNS, TURN_SECONDS, MIN_TURN_CHARS, MAX_TURN_CHARS, sideForTurn } from "@/lib/duel-config";

export const findOrCreateDuel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = (input ?? {}) as { motion?: string };
    const motion = (i.motion ?? "").trim();
    if (motion.length < 8) throw new Error("Тема слишком короткая");
    if (motion.length > 300) throw new Error("Тема слишком длинная");
    return { motion };
  })
  .handler(async ({ data, context }): Promise<{ duel_id: string; role: "pro" | "con"; matched: boolean }> => {
    const { supabase, userId } = context;

    const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle();
    const myName = prof?.display_name ?? "Спикер";

    // уже в активной дуэли?
    const { data: mine } = await supabase
      .from("duels")
      .select("id, pro_user_id, status")
      .in("status", ["waiting", "live"])
      .or(`pro_user_id.eq.${userId},con_user_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (mine) {
      return { duel_id: mine.id, role: mine.pro_user_id === userId ? "pro" : "con", matched: mine.status === "live" };
    }

    // ищем ожидающего соперника
    const { data: open } = await supabase
      .from("duels")
      .select("id, motion, pro_user_id")
      .eq("status", "waiting")
      .neq("pro_user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (open) {
      const now = Date.now();
      const { data: joined, error } = await supabase
        .from("duels")
        .update({
          con_user_id: userId,
          con_name: myName,
          status: "live",
          turn_index: 1,
          turn_user_id: open.pro_user_id,
          turn_ends_at: new Date(now + TURN_SECONDS * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", open.id)
        .eq("status", "waiting")
        .select("id")
        .maybeSingle();
      if (!error && joined) return { duel_id: joined.id, role: "con", matched: true };
    }

    const { data: created, error: createErr } = await supabase
      .from("duels")
      .insert({ motion: data.motion, pro_user_id: userId, pro_name: myName, status: "waiting" })
      .select("id")
      .single();
    if (createErr) throw new Error(createErr.message);
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
    const i = (input ?? {}) as { duel_id?: string; text?: string };
    const text = (i.text ?? "").trim();
    if (!i.duel_id) throw new Error("duel_id обязателен");
    if (text.length < MIN_TURN_CHARS) throw new Error(`Реплика слишком короткая (минимум ${MIN_TURN_CHARS} символов)`);
    if (text.length > MAX_TURN_CHARS) throw new Error(`Реплика слишком длинная (максимум ${MAX_TURN_CHARS} символов)`);
    return { duel_id: i.duel_id, text };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: duel, error } = await supabase
      .from("duels")
      .select("id, status, turn_index, turn_user_id, pro_user_id, con_user_id")
      .eq("id", data.duel_id)
      .maybeSingle();
    if (error || !duel) throw new Error("Дуэль не найдена");
    if (duel.status !== "live") throw new Error("Раунд не идёт");
    if (duel.turn_user_id !== userId) throw new Error("Сейчас не ваш ход");

    const idx = duel.turn_index;
    const side = sideForTurn(idx);
    const { error: insErr } = await supabase
      .from("duel_turns")
      .insert({ duel_id: duel.id, idx, user_id: userId, side, text: data.text });
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
              turn_ends_at: new Date(Date.now() + TURN_SECONDS * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            },
      )
      .eq("id", duel.id);

    return { ok: true, finished: isLast };
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
        verdict: verdict as unknown as Record<string, unknown>,
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
