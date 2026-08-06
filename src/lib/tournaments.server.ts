import { PREP_SECONDS, turnSpec } from "@/lib/duel-config";

type Sides = {
  team_id: string | null;
  first: { id: string; name: string };
  second: { id: string | null; name: string | null };
};

export async function loadEntrantSide(admin: any, entrantId: string, format: string): Promise<Sides> {
  const { data: e } = await admin
    .from("tournament_entrants")
    .select("id, kind, team_id, user_id, display_name")
    .eq("id", entrantId)
    .maybeSingle();
  if (!e) throw new Error("Участник турнира не найден");

  if (format === "2v2") {
    if (!e.team_id) throw new Error("Участник не является командой");
    const { data: t } = await admin
      .from("teams")
      .select("id, owner_id, owner_name, partner_id, partner_name, is_active")
      .eq("id", e.team_id)
      .maybeSingle();
    if (!t) throw new Error("Команда не найдена");
    if (!t.partner_id) throw new Error(`Команда «${e.display_name}» не активна: нет второго спикера`);
    return {
      team_id: t.id,
      first: { id: t.owner_id, name: t.owner_name ?? "Спикер" },
      second: { id: t.partner_id, name: t.partner_name ?? "Спикер" },
    };
  }

  if (!e.user_id) throw new Error("Участник не является игроком");
  return { team_id: null, first: { id: e.user_id, name: e.display_name }, second: { id: null, name: null } };
}

/** Создаёт live-дуэль для турнирного матча и связывает её с матчем. */
export async function createTournamentDuel(
  admin: any,
  match: { id: string; a_entrant_id: string; b_entrant_id: string; stage: string; tournament_id: string },
  tournament: { format: string; day1_topic: string | null; day2_topic: string | null },
): Promise<string> {
  const format = tournament.format === "2v2" ? "2v2" : "1v1";
  const topic = (match.stage === "rr" ? tournament.day1_topic : tournament.day2_topic)?.trim();
  if (!topic) throw new Error("Тема этого дня турнира ещё не объявлена");

  const a = await loadEntrantSide(admin, match.a_entrant_id, format);
  const b = await loadEntrantSide(admin, match.b_entrant_id, format);

  // Кубик назначает стороны
  const aIsPro = Math.random() < 0.5;
  const pro = aIsPro ? a : b;
  const con = aIsPro ? b : a;

  const prepEnds = new Date(Date.now() + PREP_SECONDS * 1000);
  const firstTurnEnds = new Date(prepEnds.getTime() + turnSpec(format, 1).seconds * 1000);

  const { data: created, error } = await admin
    .from("duels")
    .insert({
      motion: topic,
      format,
      status: "live",
      tournament_match_id: match.id,
      pro_team_id: pro.team_id,
      pro_user_id: pro.first.id,
      pro_name: pro.first.name,
      pro_user2_id: pro.second.id,
      pro_name2: pro.second.name,
      con_team_id: con.team_id,
      con_user_id: con.first.id,
      con_name: con.first.name,
      con_user2_id: con.second.id,
      con_name2: con.second.name,
      turn_index: 1,
      turn_user_id: pro.first.id,
      prep_ends_at: prepEnds.toISOString(),
      turn_ends_at: firstTurnEnds.toISOString(),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await admin.from("duels").update({ room_name: `duel-${created.id}` }).eq("id", created.id);
  await admin
    .from("tournament_matches")
    .update({ duel_id: created.id, status: "live" })
    .eq("id", match.id);

  return created.id as string;
}

/** Переносит итог завершённой дуэли в турнирный матч и достраивает сетку. */
export async function syncMatchResult(admin: any, matchId: string) {
  const { data: m } = await admin
    .from("tournament_matches")
    .select("*")
    .eq("id", matchId)
    .maybeSingle();
  if (!m || !m.duel_id || m.status === "finished") return;

  const { data: d } = await admin
    .from("duels")
    .select("id, status, verdict, pro_user_id, pro_team_id")
    .eq("id", m.duel_id)
    .maybeSingle();
  if (!d || d.status !== "finished" || !d.verdict) return;

  const verdict = d.verdict as { winner: string; pro?: { overall?: number }; con?: { overall?: number } };
  const { data: t } = await admin.from("tournaments").select("format").eq("id", m.tournament_id).maybeSingle();
  const format = t?.format === "2v2" ? "2v2" : "1v1";

  const a = await loadEntrantSide(admin, m.a_entrant_id, format);
  const aIsPro = format === "2v2" ? a.team_id === d.pro_team_id : a.first.id === d.pro_user_id;

  const proPts = Math.round(verdict.pro?.overall ?? 0);
  const conPts = Math.round(verdict.con?.overall ?? 0);
  const aWon = (verdict.winner === "pro") === aIsPro;

  await admin
    .from("tournament_matches")
    .update({
      status: "finished",
      winner_entrant_id: aWon ? m.a_entrant_id : m.b_entrant_id,
      a_points: aIsPro ? proPts : conPts,
      b_points: aIsPro ? conPts : proPts,
    })
    .eq("id", matchId);

  if (m.stage !== "rr") await advanceBracket(admin, m.tournament_id, m.stage, m.slot, aWon ? m.a_entrant_id : m.b_entrant_id);
}

/** Победитель падает в следующую стадию сетки */
async function advanceBracket(admin: any, tournamentId: string, stage: string, slot: number, winnerId: string) {
  const next = stage === "qf" ? "sf" : stage === "sf" ? "final" : null;
  if (!next) {
    await admin.from("tournaments").update({ status: "finished" }).eq("id", tournamentId);
    return;
  }
  const nextSlot = Math.ceil(slot / 2);
  const field = slot % 2 === 1 ? "a_entrant_id" : "b_entrant_id";

  const { data: existing } = await admin
    .from("tournament_matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("stage", next)
    .eq("slot", nextSlot)
    .maybeSingle();

  if (existing) {
    await admin.from("tournament_matches").update({ [field]: winnerId }).eq("id", existing.id);
  } else {
    await admin.from("tournament_matches").insert({
      tournament_id: tournamentId,
      stage: next,
      round_no: 1,
      slot: nextSlot,
      [field]: winnerId,
      status: "pending",
    });
  }
}
