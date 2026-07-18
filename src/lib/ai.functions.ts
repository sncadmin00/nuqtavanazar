import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const CHAT_MODEL = "google/gemini-2.5-flash";
const JUDGE_MODEL = "google/gemini-2.5-pro";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callGateway(
  messages: ChatMessage[],
  opts: { model?: string; jsonMode?: boolean; temperature?: number } = {},
): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const body: Record<string, unknown> = {
    model: opts.model ?? CHAT_MODEL,
    messages,
  };
  if (opts.temperature !== undefined) body.temperature = opts.temperature;
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Слишком много запросов. Попробуйте через минуту.");
    if (res.status === 402) throw new Error("Закончились AI-кредиты. Обратитесь к администратору.");
    throw new Error(`AI недоступен (${res.status}): ${txt.slice(0, 200)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

// ============= AI TUTOR =============

const TUTOR_SYSTEM = `Ты — тьютор платформы Мезон. Помогаешь школьникам, студентам и взрослым осваивать структурированные дебаты.

Твой стиль:
- Отвечай на русском (если пользователь пишет на узбекском/английском — отвечай на том же языке).
- Объясняй просто, приводи конкретные примеры.
- Всё объясняешь через формулу Мезон: идея → критерий → аргумент. Знаешь три формата — 1×1, 2×2, круглый стол — и критерии судейства.
- Если пользователь пассивно читает — задай ему проверочный вопрос.
- Ответы краткие (3-6 абзацев максимум), с bullet-points где уместно.
- Никогда не говори «как большая языковая модель».`;

export const askTutor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const i = input as { messages: ChatMessage[]; context?: string };
    if (!Array.isArray(i.messages)) throw new Error("messages required");
    return { messages: i.messages.slice(-20), context: i.context };
  })
  .handler(async ({ data }) => {
    const system = data.context
      ? `${TUTOR_SYSTEM}\n\nКонтекст текущего урока:\n${data.context}`
      : TUTOR_SYSTEM;
    const reply = await callGateway(
      [{ role: "system", content: system }, ...data.messages],
      { temperature: 0.7 },
    );
    return { reply };
  });

// ============= AI JUDGE =============

const JUDGE_CRITERIA_KP = [
  { key: "structure", label: "Структура речи" },
  { key: "argumentation", label: "Аргументация" },
  { key: "evidence", label: "Доказательства и примеры" },
  { key: "rebuttal", label: "Опровержение оппонента" },
  { key: "delivery", label: "Убедительность и стиль" },
];

export const judgeSpeech = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const i = input as { motion: string; format: "duel" | "team" | "roundtable"; side?: string; speech: string };
    if (!i.motion || !i.speech) throw new Error("motion и speech обязательны");
    if (i.speech.length < 50) throw new Error("Речь слишком короткая (минимум 50 символов)");
    if (i.speech.length > 8000) throw new Error("Речь слишком длинная (максимум 8000 символов)");
    const format: "duel" | "team" | "roundtable" =
      i.format === "team" ? "team" : i.format === "roundtable" ? "roundtable" : "duel";
    return {
      motion: i.motion,
      format,
      side: i.side ?? "",
      speech: i.speech,
    };
  })
  .handler(async ({ data }) => {
    const formatName =
      data.format === "team" ? "Мезон 2×2" : data.format === "roundtable" ? "Мезон · круглый стол" : "Мезон 1×1";
    const prompt = `Ты — опытный судья дебатов формата ${formatName}. Оцени речь дебатёра как настоящий ballot.

ТЕМА (motion): "${data.motion}"
ФОРМАТ: ${formatName}
СТОРОНА: ${data.side || "не указана"}
РЕЧЬ:
"""
${data.speech}
"""

Оцени по 5 критериям каждый от 0 до 10 (можно с половинами, например 7.5):
1. structure — Структура речи (тезис, аргументы, заключение)
2. argumentation — Логика и глубина аргументации
3. evidence — Доказательства, факты, примеры
4. rebuttal — Работа с потенциальными возражениями оппонента
5. delivery — Убедительность, стиль, ясность формулировок

Верни СТРОГО валидный JSON без markdown-блоков в формате:
{
  "scores": { "structure": 7.5, "argumentation": 8, "evidence": 6, "rebuttal": 5.5, "delivery": 7 },
  "overall": 34,
  "feedback": "Развёрнутый комментарий судьи 3-5 абзацев на русском языке",
  "strengths": ["сильная сторона 1", "сильная сторона 2", "сильная сторона 3"],
  "improvements": ["конкретный совет 1", "конкретный совет 2", "конкретный совет 3"]
}

overall = сумма всех 5 оценок (0-50). Будь конструктивным, но честным.`;

    const raw = await callGateway(
      [{ role: "user", content: prompt }],
      { model: JUDGE_MODEL, jsonMode: true, temperature: 0.4 },
    );
    let parsed: {
      scores: Record<string, number>;
      overall: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
    };
    try {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Не удалось разобрать ответ AI-судьи. Попробуйте ещё раз.");
    }
    return {
      ...parsed,
      criteria: JUDGE_CRITERIA_KP,
    };
  });

// ============= AI SPARRING =============

export const sparringReply = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const i = input as {
      motion: string;
      userSide: "pro" | "con";
      messages: ChatMessage[];
    };
    if (!i.motion) throw new Error("motion required");
    return { motion: i.motion, userSide: i.userSide === "con" ? "con" as const : "pro" as const, messages: i.messages.slice(-16) };
  })
  .handler(async ({ data }) => {
    const aiSide = data.userSide === "pro" ? "против (con)" : "за (pro)";
    const userSideLabel = data.userSide === "pro" ? "за (pro)" : "против (con)";
    const system = `Ты — тренированный спарринг-партнёр для дебатов. Тема: "${data.motion}".
Пользователь выступает ${userSideLabel}, ты — ${aiSide}.

Правила:
- Отвечай ОДНИМ раундом на аргумент пользователя: сначала краткое опровержение (2-3 предложения), затем свой контраргумент со структурой AREA (тезис + логика + пример).
- Не более 4-5 предложений всего. Русский язык.
- Стиль дебатёра: уверенно, вежливо, по делу. Никаких "я AI".
- В конце можешь задать острый вопрос оппоненту.`;
    const reply = await callGateway(
      [{ role: "system", content: system }, ...data.messages],
      { temperature: 0.8 },
    );
    return { reply };
  });

// ============= AI MOTION GENERATOR =============

export const generateMotion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const i = input as { category?: string; difficulty?: "easy" | "medium" | "hard" };
    return {
      category: i.category ?? "любая",
      difficulty: i.difficulty ?? "medium",
    };
  })
  .handler(async ({ data }) => {
    const diffMap = { easy: "простой (школьный уровень)", medium: "средний", hard: "сложный (университетский уровень)" };
    const prompt = `Сгенерируй ОДНУ новую дебатную тему (motion) для клуба Debate Club Uzbekistan.

Категория: ${data.category}
Сложность: ${diffMap[data.difficulty]}

Формулировка должна начинаться со слов "Эта палата..." или "This House..." (по-русски).

Верни СТРОГО JSON без markdown:
{
  "motion": "Эта палата ...",
  "category": "politics|economics|ethics|technology|society|education|environment|culture",
  "rationale": "Почему эта тема интересна и что она проверяет у дебатёров (2-3 предложения на русском)",
  "pro_hint": "Одно направление аргументации за",
  "con_hint": "Одно направление аргументации против"
}`;
    const raw = await callGateway([{ role: "user", content: prompt }], {
      jsonMode: true,
      temperature: 0.9,
    });
    try {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      return JSON.parse(cleaned) as {
        motion: string;
        category: string;
        rationale: string;
        pro_hint: string;
        con_hint: string;
      };
    } catch {
      throw new Error("Не удалось разобрать сгенерированную тему. Попробуйте ещё раз.");
    }
  });
