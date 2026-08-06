import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const idInput = (input: unknown) => {
  const i = (input ?? {}) as { match_id?: string };
  if (!i.match_id) throw new Error("match_id обязателен");
  return { match_id: i.match_id };
};

const tidInput = (input: unknown) => {
  const i = (input ?? {}) as { tournament_id?: string };
  if (!i.tournament_id) throw new Error("tournament_id обязателен");
  return { tournament_id: i.tournament_id };
};

/** Участник (или админ) открывает турнирный матч по расписанию */
export const startTournamentMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(idInput)
  .handler(async ({ data, context }): Promise<{ duel_id: string }> => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createTournamentDuel, loadEntrantSide } = await import("@/lib/tournaments.server");

    const { data: m } = await supabaseAdmin
      .from("tournament_matches")
      .select("*")
      .eq("id", data.match_id)
      .maybeSingle();
    if (!m) throw new Error("Матч не найден");
    if (m.duel_id) return { duel_id: m.duel_id };
    if (!m.a_entrant_id || !m.b_entrant_id) throw new Error("Соперники ещё не определены");
    if (m.scheduled_at && new Date(m.scheduled_at) > new Date()) {
      throw new Error("Матч ещё не начался по расписанию");
    }

    const { data: t } = await supabaseAdmin
      .from("tournaments")
      .select("format, day1_topic, day2_topic")
      .eq("id", m.tournament_id)
      .maybeSingle();
    if (!t) throw new Error("Турнир не найден");

    const format = t.format === "2v2" ? "2v2" : "1v1";
    const [a, b] = await Promise.all([
      loadEntrantSide(supabaseAdmin, m.a_entrant_id, format),
      loadEntrantSide(supabaseAdmin, m.b_entrant_id, format),
    ]);
    const roster = [a.first.id, a.second.id, b.first.id, b.second.id].filter(Boolean);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!roster.includes(userId) && !isAdmin) throw new Error("Вы не участник этого матча");

    const duelId = await createTournamentDuel(
      supabaseAdmin,
      { ...m, a_entrant_id: m.a_entrant_id, b_entrant_id: m.b_entrant_id },
      t,
    );
    return { duel_id: duelId };
  });

/** Переносит вердикт AI-судьи в турнирную таблицу/сетку */
export const syncTournamentMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(idInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { syncMatchResult } = await import("@/lib/tournaments.server");
    await syncMatchResult(supabaseAdmin, data.match_id);
    return { ok: true };
  });

/** Админ: сгенерировать круговой этап первого дня */
export const generateTournamentSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(tidInput)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Только для администратора");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateRoundRobin } = await import("@/lib/tournaments.server");
    const count = await generateRoundRobin(supabaseAdmin, data.tournament_id);
    await supabaseAdmin.from("tournaments").update({ status: "day1" }).eq("id", data.tournament_id);
    return { matches: count };
  });

/** Админ: посеять топ-8 и построить сетку второго дня */
export const seedTournamentPlayoff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(tidInput)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Только для администратора");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { seedPlayoff } = await import("@/lib/tournaments.server");
    const seeded = await seedPlayoff(supabaseAdmin, data.tournament_id);
    return { seeded };
  });
