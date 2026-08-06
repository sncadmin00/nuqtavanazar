export const TURN_SECONDS = 150;
export const TOTAL_TURNS = 6;
export const MIN_TURN_CHARS = 80;
export const MAX_TURN_CHARS = 2500;

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
