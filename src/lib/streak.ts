// Local streak tracking for the training habit.
// A "cycle" = both sides in the case builder + saved reflection.
// Storage is per-browser; the profile displays the same count.

const KEY = "mezon.streak.v1";

type StreakData = { days: string[] }; // YYYY-MM-DD, sorted ASC, unique

function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function load(): StreakData {
  if (typeof window === "undefined") return { days: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { days: [] };
    const parsed = JSON.parse(raw) as StreakData;
    return { days: Array.isArray(parsed.days) ? parsed.days : [] };
  } catch {
    return { days: [] };
  }
}

function save(data: StreakData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function recordCycleCompletion(): void {
  const data = load();
  const iso = todayISO();
  if (!data.days.includes(iso)) {
    data.days = [...data.days, iso].sort();
    save(data);
  }
}

function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + "T00:00:00");
  const b = new Date(bISO + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export type StreakInfo = {
  current: number;
  longest: number;
  weekDays: boolean[]; // Mon..Sun of the current ISO week
};

export function getStreak(): StreakInfo {
  const { days } = load();
  const set = new Set(days);

  // current streak: count back from today (or yesterday if not done today)
  const today = todayISO();
  let cursor = today;
  if (!set.has(cursor)) {
    // allow yesterday so a streak isn't broken until the day ends
    const d = new Date();
    d.setDate(d.getDate() - 1);
    cursor = todayISO(d);
  }
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 1);
    cursor = todayISO(d);
  }

  // longest streak overall
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    if (prev && daysBetween(prev, d) === 1) run += 1;
    else run = 1;
    if (run > longest) longest = run;
    prev = d;
  }

  // week bar: Monday..Sunday of the current week
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - dow);
  const weekDays: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(set.has(todayISO(d)));
  }

  return { current, longest, weekDays };
}
