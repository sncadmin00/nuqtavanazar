export type TournamentFormat = "1v1" | "2v2";
export type TournamentStatus = "draft" | "registration" | "day1" | "day2" | "finished";
export type Stage = "rr" | "qf" | "sf" | "final";

export type Tournament = {
  id: string;
  title: string;
  description: string | null;
  format: string;
  status: string;
  day1_at: string;
  day2_at: string;
  day1_topic: string | null;
  day2_topic: string | null;
  slot_minutes: number;
  max_entrants: number;
  created_at: string;
};

export type Entrant = {
  id: string;
  tournament_id: string;
  kind: string;
  team_id: string | null;
  user_id: string | null;
  display_name: string;
  seed: number | null;
  status: string;
};

export type TMatch = {
  id: string;
  tournament_id: string;
  stage: string;
  round_no: number;
  slot: number;
  a_entrant_id: string | null;
  b_entrant_id: string | null;
  scheduled_at: string | null;
  duel_id: string | null;
  winner_entrant_id: string | null;
  a_points: number;
  b_points: number;
  status: string;
};

export const STAGE_LABEL: Record<string, string> = {
  rr: "Круговой этап",
  qf: "1/4 финала",
  sf: "1/2 финала",
  final: "Финал",
};

export const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  registration: "Идёт регистрация",
  day1: "День 1 — круговой этап",
  day2: "День 2 — плей-офф",
  finished: "Завершён",
};

/** Круговая система (метод круга). Возвращает туры с парами id участников. */
export function roundRobinPairs(ids: string[]): [string, string][][] {
  const list = [...ids];
  if (list.length < 2) return [];
  const bye = list.length % 2 === 1;
  if (bye) list.push("__bye__");
  const n = list.length;
  const rounds: [string, string][][] = [];
  const arr = [...list];
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i]!;
      const b = arr[n - 1 - i]!;
      if (a !== "__bye__" && b !== "__bye__") pairs.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    rounds.push(pairs);
    const fixed = arr[0]!;
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr.splice(0, arr.length, fixed, ...rest);
  }
  return rounds;
}

export type StandingRow = {
  entrant_id: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
};

/** Таблица кругового этапа: победы → личная встреча → баллы AI-судьи. */
export function computeStandings(entrants: Entrant[], matches: TMatch[]): StandingRow[] {
  const rr = matches.filter((m) => m.stage === "rr" && m.status === "finished");
  const base = new Map<string, StandingRow>(
    entrants.map((e) => [e.id, { entrant_id: e.id, played: 0, wins: 0, losses: 0, points: 0 }]),
  );

  for (const m of rr) {
    const a = m.a_entrant_id ? base.get(m.a_entrant_id) : null;
    const b = m.b_entrant_id ? base.get(m.b_entrant_id) : null;
    if (a) {
      a.played++;
      a.points += m.a_points;
      if (m.winner_entrant_id === a.entrant_id) a.wins++;
      else a.losses++;
    }
    if (b) {
      b.played++;
      b.points += m.b_points;
      if (m.winner_entrant_id === b.entrant_id) b.wins++;
      else b.losses++;
    }
  }

  const headToHead = (x: string, y: string) => {
    const m = rr.find(
      (r) =>
        (r.a_entrant_id === x && r.b_entrant_id === y) || (r.a_entrant_id === y && r.b_entrant_id === x),
    );
    if (!m || !m.winner_entrant_id) return 0;
    return m.winner_entrant_id === x ? -1 : 1;
  };

  return [...base.values()].sort(
    (p, q) => q.wins - p.wins || headToHead(p.entrant_id, q.entrant_id) || q.points - p.points,
  );
}

/** Пары четвертьфинала по посеву 1-8 */
export const QF_SEEDS: [number, number][] = [
  [1, 8],
  [4, 5],
  [2, 7],
  [3, 6],
];

export function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
