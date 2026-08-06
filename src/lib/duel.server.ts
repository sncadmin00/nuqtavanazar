import { turnSpec } from "./duel-config";

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
  format: string = "1v1",
): Promise<DuelVerdict> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const transcript = turns
    .sort((a, b) => a.idx - b.idx)
    .map(
      (t) =>
        `[${turnSpec(format, t.idx).label} — ${t.side === "pro" ? proName : conName}]\n${t.text}`,
    )
    .join("\n\n");

  const prompt = `Ты — судья живого раунда Nuqta va Nazar (${format === "2v2" ? "командный формат 2×2, парламентские правила" : "формат 1×1"}). Оцени полную стенограмму и вынеси решение.
Учитывай перекрёстные вопросы: качество вопросов и ответов влияет на оценку опровержения.

ТЕМА: "${motion}"
СТОРОНА «ЗА»: ${proName}
СТОРОНА «ПРОТИВ»: ${conName}

СТЕНОГРАММА:
"""
${transcript}
"""

${format === "2v2" ? "Оценки pro/con — это оценки команды целиком." : ""}

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
export async function applyDuelElo(
  winnerId: string,
  loserId: string,
  names: Record<string, string>,
  k: number = K,
  countMatch: boolean = true,
) {
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
  const delta = Math.round(k * (1 - expectedW));
  const bump = countMatch ? 1 : 0;

  await supabaseAdmin.from("player_ratings").upsert(
    [
      {
        user_id: winnerId,
        mastery: w.mastery + delta,
        mastery_trend_week: (w.mastery_trend_week ?? 0) + delta,
        matches_played: (w.matches_played ?? 0) + bump,
        display_name: names[winnerId] ?? null,
        updated_at: new Date().toISOString(),
      },
      {
        user_id: loserId,
        mastery: Math.max(100, l.mastery - delta),
        mastery_trend_week: (l.mastery_trend_week ?? 0) - delta,
        matches_played: (l.matches_played ?? 0) + bump,
        display_name: names[loserId] ?? null,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "user_id" },
  );
  return delta;
}

/** Командный Elo считается отдельно от индивидуального */
export async function applyTeamElo(winnerTeamId: string, loserTeamId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("team_ratings")
    .select("team_id, elo, matches_played, wins")
    .in("team_id", [winnerTeamId, loserTeamId]);
  const rows = data ?? [];
  const get = (id: string) =>
    rows.find((r) => r.team_id === id) ?? { team_id: id, elo: 1000, matches_played: 0, wins: 0 };

  const w = get(winnerTeamId);
  const l = get(loserTeamId);
  const expectedW = 1 / (1 + Math.pow(10, (l.elo - w.elo) / 400));
  const delta = Math.round(K * (1 - expectedW));

  await supabaseAdmin.from("team_ratings").upsert(
    [
      {
        team_id: winnerTeamId,
        elo: w.elo + delta,
        matches_played: (w.matches_played ?? 0) + 1,
        wins: (w.wins ?? 0) + 1,
        updated_at: new Date().toISOString(),
      },
      {
        team_id: loserTeamId,
        elo: Math.max(100, l.elo - delta),
        matches_played: (l.matches_played ?? 0) + 1,
        wins: l.wins ?? 0,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "team_id" },
  );
  return delta;
}


const STT_URL = "https://ai.gateway.lovable.dev/v1/audio/transcriptions";
const STT_MODEL = "openai/gpt-4o-mini-transcribe";

/** Скачивает аудио-ход из публичного bucket и возвращает расшифровку. */
export async function transcribeAudioFromStorage(audioPath: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const base = process.env["SUPABASE_URL"];
  if (!base) throw new Error("SUPABASE_URL missing");

  const fileUrl = `${base}/storage/v1/object/public/duel-audio/${audioPath}`;
  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok) throw new Error("Не удалось получить аудио-запись хода");
  const blob = await fileRes.blob();
  if (blob.size < 2048) throw new Error("Запись слишком короткая");

  const form = new FormData();
  form.append("model", STT_MODEL);
  form.append("file", blob, "turn.wav");

  const res = await fetch(STT_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Слишком много запросов. Попробуйте через минуту.");
    if (res.status === 402) throw new Error("Закончились AI-кредиты. Обратитесь к администратору.");
    throw new Error(`Расшифровка недоступна (${res.status}): ${txt.slice(0, 160)}`);
  }
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}
