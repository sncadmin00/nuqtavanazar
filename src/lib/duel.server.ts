import { TURN_LABELS_RU } from "./duel-config";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const JUDGE_MODEL = "google/gemini-2.5-pro";

export type DuelTurnRow = { idx: number; side: string; text: string };

export type DuelVerdict = {
  winner: "pro" | "con";
  pro: { scores: Record<string, number>; overall: number };
  con: { scores: Record<string, number>; overall: number };
  feedback: string;
  pro_notes: string[];
  con_notes: string[];
};

export async function judgeDuelTranscript(
  motion: string,
  proName: string,
  conName: string,
  turns: DuelTurnRow[],
): Promise<DuelVerdict> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const transcript = turns
    .sort((a, b) => a.idx - b.idx)
    .map((t) => `[${TURN_LABELS_RU[t.idx - 1] ?? `Ход ${t.idx}`} — ${t.side === "pro" ? proName : conName}]\n${t.text}`)
    .join("\n\n");

  const prompt = `Ты — судья живого раунда Nuqta va Nazar 1×1. Оцени полную стенограмму дуэли и вынеси решение.

ТЕМА: "${motion}"
СТОРОНА «ЗА»: ${proName}
СТОРОНА «ПРОТИВ»: ${conName}

СТЕНОГРАММА:
"""
${transcript}
"""

Оцени каждого спикера по 5 критериям (0-10): structure, argumentation, evidence, rebuttal, delivery.
Верни СТРОГО валидный JSON без markdown:
{
  "winner": "pro" | "con",
  "pro": { "scores": { "structure": 7, "argumentation": 8, "evidence": 6, "rebuttal": 6, "delivery": 7 }, "overall": 34 },
  "con": { "scores": { "structure": 7, "argumentation": 7, "evidence": 6, "rebuttal": 7, "delivery": 7 }, "overall": 34 },
  "feedback": "Решение судьи: 3-4 абзаца на русском — почему победила эта сторона, ключевой clash раунда",
  "pro_notes": ["совет 1", "совет 2"],
  "con_notes": ["совет 1", "совет 2"]
}
overall — сумма пяти оценок (0-50). Победитель определяется по столкновению аргументов, а не по объёму текста.`;

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: JUDGE_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Слишком много запросов. Попробуйте через минуту.");
    if (res.status === 402) throw new Error("Закончились AI-кредиты. Обратитесь к администратору.");
    throw new Error(`AI-судья недоступен (${res.status}): ${txt.slice(0, 160)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  let parsed: DuelVerdict;
  try {
    parsed = JSON.parse(cleaned) as DuelVerdict;
  } catch {
    throw new Error("Не удалось разобрать решение AI-судьи. Попробуйте ещё раз.");
  }
  if (parsed.winner !== "pro" && parsed.winner !== "con") {
    parsed.winner = (parsed.pro?.overall ?? 0) >= (parsed.con?.overall ?? 0) ? "pro" : "con";
  }
  return parsed;
}

const K = 24;

/** Обновляет Elo обоих участников после дуэли. */
export async function applyDuelElo(winnerId: string, loserId: string, names: Record<string, string>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ids = [winnerId, loserId];
  const { data } = await supabaseAdmin
    .from("player_ratings")
    .select("user_id, mastery, mastery_trend_week, matches_played")
    .in("user_id", ids);
  const rows = data ?? [];
  const get = (id: string) =>
    rows.find((r) => r.user_id === id) ?? { user_id: id, mastery: 1000, mastery_trend_week: 0, matches_played: 0 };

  const w = get(winnerId);
  const l = get(loserId);
  const expectedW = 1 / (1 + Math.pow(10, (l.mastery - w.mastery) / 400));
  const delta = Math.round(K * (1 - expectedW));

  await supabaseAdmin.from("player_ratings").upsert(
    [
      {
        user_id: winnerId,
        mastery: w.mastery + delta,
        mastery_trend_week: (w.mastery_trend_week ?? 0) + delta,
        matches_played: (w.matches_played ?? 0) + 1,
        display_name: names[winnerId] ?? null,
        updated_at: new Date().toISOString(),
      },
      {
        user_id: loserId,
        mastery: Math.max(100, l.mastery - delta),
        mastery_trend_week: (l.mastery_trend_week ?? 0) - delta,
        matches_played: (l.matches_played ?? 0) + 1,
        display_name: names[loserId] ?? null,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "user_id" },
  );
  return delta;
}
