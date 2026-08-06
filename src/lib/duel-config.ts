/** Подготовка перед раундом (сек) */
export const PREP_SECONDS = 120;

export type DuelFormat = "1v1" | "2v2";
export type TurnKind = "speech" | "cx";
export type Side = "pro" | "con";

export type TurnSpec = {
  /** Сторона, которая держит слово (в перекрёстных вопросах — сторона спрашивающего) */
  side: Side;
  /** Номер спикера внутри команды: 1 — первый, 2 — второй */
  seat: 1 | 2;
  kind: TurnKind;
  seconds: number;
  label: string;
  hint: string;
};

/** 1×1: конструктивы + перекрёстные вопросы + опровержения + финалы */
export const SCRIPT_1V1: TurnSpec[] = [
  {
    side: "pro",
    seat: 1,
    kind: "speech",
    seconds: 90,
    label: "Конструктив «За»",
    hint: "Заяви позицию, критерий и 2 аргумента по AREA.",
  },
  {
    side: "con",
    seat: 1,
    kind: "cx",
    seconds: 60,
    label: "Перекрёстные вопросы · спрашивает «Против»",
    hint: "Задавай короткие закрытые вопросы: ищи слабое звено в критерии и доказательствах.",
  },
  {
    side: "con",
    seat: 1,
    kind: "speech",
    seconds: 90,
    label: "Конструктив «Против»",
    hint: "Заяви свою позицию и покажи, почему критерий соперника не работает.",
  },
  {
    side: "pro",
    seat: 1,
    kind: "cx",
    seconds: 60,
    label: "Перекрёстные вопросы · спрашивает «За»",
    hint: "Вытащи из соперника признание: где нет доказательства, где подмена критерия.",
  },
  {
    side: "pro",
    seat: 1,
    kind: "speech",
    seconds: 60,
    label: "Опровержение «За»",
    hint: "Разбери аргументы соперника: где слабое звено?",
  },
  {
    side: "con",
    seat: 1,
    kind: "speech",
    seconds: 60,
    label: "Опровержение «Против»",
    hint: "Разбери аргументы соперника и защити свои.",
  },
  {
    side: "pro",
    seat: 1,
    kind: "speech",
    seconds: 45,
    label: "Финал «За»",
    hint: "Подведи итог: почему твоя сторона выиграла clash.",
  },
  {
    side: "con",
    seat: 1,
    kind: "speech",
    seconds: 45,
    label: "Финал «Против»",
    hint: "Подведи итог: почему твоя сторона выиграла clash.",
  },
];

/** 2×2: парламентский порядок с перекрёстными вопросами между речами */
export const SCRIPT_2V2: TurnSpec[] = [
  {
    side: "pro",
    seat: 1,
    kind: "speech",
    seconds: 90,
    label: "Первый спикер «За» — конструктив",
    hint: "Определения, критерий и линия команды: два аргумента по AREA.",
  },
  {
    side: "con",
    seat: 2,
    kind: "cx",
    seconds: 60,
    label: "Перекрёстные · спрашивает второй спикер «Против»",
    hint: "Проверь определения и критерий соперника короткими вопросами.",
  },
  {
    side: "con",
    seat: 1,
    kind: "speech",
    seconds: 90,
    label: "Первый спикер «Против» — конструктив",
    hint: "Оппозиционная линия: контр-критерий и два своих аргумента.",
  },
  {
    side: "pro",
    seat: 2,
    kind: "cx",
    seconds: 60,
    label: "Перекрёстные · спрашивает второй спикер «За»",
    hint: "Найди дыры в кейсе оппозиции до своей речи.",
  },
  {
    side: "pro",
    seat: 2,
    kind: "speech",
    seconds: 90,
    label: "Второй спикер «За» — развитие",
    hint: "Опровергни оппозицию и углуби линию команды новым доказательством.",
  },
  {
    side: "con",
    seat: 1,
    kind: "cx",
    seconds: 60,
    label: "Перекрёстные · спрашивает первый спикер «Против»",
    hint: "Атакуй новые доказательства второго спикера.",
  },
  {
    side: "con",
    seat: 2,
    kind: "speech",
    seconds: 90,
    label: "Второй спикер «Против» — развитие",
    hint: "Опровергни линию «За» и достройте свой кейс.",
  },
  {
    side: "pro",
    seat: 1,
    kind: "cx",
    seconds: 60,
    label: "Перекрёстные · спрашивает первый спикер «За»",
    hint: "Закрепи clash перед финалами.",
  },
  {
    side: "con",
    seat: 1,
    kind: "speech",
    seconds: 45,
    label: "Финальная речь «Против»",
    hint: "Без новых аргументов: почему по критерию выигрывает оппозиция.",
  },
  {
    side: "pro",
    seat: 1,
    kind: "speech",
    seconds: 45,
    label: "Финальная речь «За»",
    hint: "Без новых аргументов: сведи раунд к главному столкновению.",
  },
];

export function scriptFor(format: DuelFormat | string | null | undefined): TurnSpec[] {
  return format === "2v2" ? SCRIPT_2V2 : SCRIPT_1V1;
}

export function totalTurns(format: DuelFormat | string | null | undefined): number {
  return scriptFor(format).length;
}

/** Спецификация хода idx (1-based) */
export function turnSpec(format: DuelFormat | string | null | undefined, idx: number): TurnSpec {
  const s = scriptFor(format);
  return s[idx - 1] ?? s[s.length - 1]!;
}

/* ---- совместимость со старым API (формат 1×1) ---- */

export const TOTAL_TURNS = SCRIPT_1V1.length;
export const TURN_DURATIONS = SCRIPT_1V1.map((t) => t.seconds);
export const TURN_LABELS_RU = SCRIPT_1V1.map((t) => t.label);
export const TURN_HINTS_RU = SCRIPT_1V1.map((t) => t.hint);
export const TURN_SECONDS = 90;

export function secondsForTurn(idx: number): number {
  return SCRIPT_1V1[idx - 1]?.seconds ?? 60;
}

export function sideForTurn(idx: number): Side {
  return SCRIPT_1V1[idx - 1]?.side ?? "pro";
}

export const MIN_TURN_CHARS = 40;
export const MAX_TURN_CHARS = 2500;

/** Минимальная длительность аудио-хода, чтобы он засчитался */
export const MIN_TURN_AUDIO_SEC = 5;
