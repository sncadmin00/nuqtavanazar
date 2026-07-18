// "Smart dice" — figure out which side to assign to the user
// based on their reflection history so they stop always defending
// the position they already agree with.

import { listReflections, type CaseReflection } from "@/lib/freeTalk";

export type Side = "affirmation" | "negation";

export type SideAssignment = {
  side: Side;
  // null when we don't yet have enough data to make an informed pick
  reason: string | null;
  samples: number;
};

const MIN_SAMPLES = 3;

// Heuristic: the side a user builds FIRST tends to be the one
// they instinctively agree with — especially when they later
// answer "no" ("мнение не изменилось") on that reflection.
// We count leaning signals and assign the OPPOSITE side.
function inferLeaning(
  reflections: CaseReflection[],
): { leaning: Side | null; score: number; samples: number } {
  let aff = 0;
  let neg = 0;

  for (const r of reflections) {
    const first = r.sides[0]?.side;
    if (!first) continue;
    // A "no change" answer is a stronger signal than "little" / "strong"
    const weight = r.changed === "no" ? 2 : r.changed === "little" ? 1 : 0.5;
    if (first === "affirmation") aff += weight;
    else neg += weight;
  }

  const total = aff + neg;
  if (total <= 0) return { leaning: null, score: 0, samples: reflections.length };
  const leaning: Side = aff >= neg ? "affirmation" : "negation";
  const score = Math.max(aff, neg) / total; // 0.5..1
  return { leaning, score, samples: reflections.length };
}

export async function getSideAssignment(): Promise<SideAssignment> {
  let reflections: CaseReflection[] = [];
  try {
    reflections = await listReflections();
  } catch {
    reflections = [];
  }

  if (reflections.length < MIN_SAMPLES) {
    // fall back to fair coin flip; user will see it as a plain random pick
    const side: Side = Math.random() < 0.5 ? "affirmation" : "negation";
    return { side, reason: null, samples: reflections.length };
  }

  const { leaning, score } = inferLeaning(reflections);
  if (!leaning || score < 0.6) {
    const side: Side = Math.random() < 0.5 ? "affirmation" : "negation";
    return {
      side,
      reason: "По твоим ответам сложно понять, к какой стороне ты склоняешься — выпало случайно.",
      samples: reflections.length,
    };
  }

  const assigned: Side = leaning === "affirmation" ? "negation" : "affirmation";
  const leaningLabel = leaning === "affirmation" ? "ЗА" : "ПРОТИВ";
  const assignedLabel = assigned === "affirmation" ? "«Утверждение»" : "«Отрицание»";
  return {
    side: assigned,
    reason: `Кубик назначил тебе ${assignedLabel} — по твоим прошлым ответам ты, скорее, ${leaningLabel}.`,
    samples: reflections.length,
  };
}
