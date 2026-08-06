/** Подготовка перед раундом (сек) */
export const PREP_SECONDS = 120;

/** Длительность каждого хода в секундах: конструктив 90, опровержение 60, финал 45 */
export const TURN_DURATIONS = [90, 90, 60, 60, 45, 45];

export const TOTAL_TURNS = TURN_DURATIONS.length;

/** Секунды для хода с номером idx (1-based) */
export function secondsForTurn(idx: number): number {
  return TURN_DURATIONS[idx - 1] ?? 60;
}

/** Совместимость: усреднённое значение для старых вызовов */
export const TURN_SECONDS = 90;

export const MIN_TURN_CHARS = 40;
export const MAX_TURN_CHARS = 2500;

/** Минимальная длительность аудио-хода, чтобы он засчитался */
export const MIN_TURN_AUDIO_SEC = 5;

/** Ходы идут по очереди: pro, con, pro, con, pro, con */
export function sideForTurn(idx: number): "pro" | "con" {
  return idx % 2 === 1 ? "pro" : "con";
}

export const TURN_LABELS_RU = [
  "Конструктив «За»",
  "Конструктив «Против»",
  "Опровержение «За»",
  "Опровержение «Против»",
  "Финал «За»",
  "Финал «Против»",
];

export const TURN_HINTS_RU = [
  "Заяви позицию, критерий и 2 аргумента по AREA.",
  "Заяви свою позицию и покажи, почему критерий соперника не работает.",
  "Разбери аргументы соперника: где слабое звено?",
  "Разбери аргументы соперника и защити свои.",
  "Подведи итог: почему твоя сторона выиграла clash.",
  "Подведи итог: почему твоя сторона выиграла clash.",
];
