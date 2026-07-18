import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dice5,
  Mic,
  Lock,
  ListChecks,
  Waves,
  Flame,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getStreak, type StreakInfo } from "@/lib/streak";
import { getSideAssignment, type SideAssignment } from "@/lib/dice-intel";
import { generateMotion } from "@/lib/ai.functions";
import { WeekStrip } from "@/components/WeekStrip";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Тренировка — Мезон" },
      {
        name: "description",
        content: "Соло-тренировка речи: 30/60/90 секунд, конструктор кейса, свободные мысли.",
      },
    ],
  }),
  component: TrainingPage,
});

type Level = 30 | 60 | 90;
const LEVELS: Level[] = [30, 60, 90];
const STORAGE_KEY = "mezon.training.progress.v1";
const UNLOCK_AT = 3;

type Progress = { attempts: Record<Level, number>; unlocked: Record<Level, boolean> };

const defaultProgress: Progress = {
  attempts: { 30: 0, 60: 0, 90: 0 },
  unlocked: { 30: true, 60: false, 90: false },
};

function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw);
    return {
      ...defaultProgress,
      ...parsed,
      unlocked: { ...defaultProgress.unlocked, ...(parsed.unlocked ?? {}) },
    };
  } catch {
    return defaultProgress;
  }
}

function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function dayWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return "дней";
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дня";
  return "дней";
}

type TipVisual = () => React.ReactElement;
const BreathingVisual: TipVisual = () => (
  <div className="relative grid place-items-center py-3">
    <div className="relative h-32 w-32">
      <div className="absolute inset-0 rounded-full border border-white/25" />
      <div
        className="absolute inset-4 rounded-full bg-primary/70"
        style={{ animation: "mezon-breathe 8s ease-in-out infinite" }}
      />
    </div>
    <style>{`@keyframes mezon-breathe { 0%,100% { transform: scale(0.55); opacity: .55 } 50% { transform: scale(1); opacity: 1 } }`}</style>
  </div>
);
const TIPS: { caption: string; render: TipVisual }[] = [
  { caption: "4 сек вдох — 4 сек выдох", render: BreathingVisual },
  {
    caption: "Тишина — не ошибка",
    render: () => (
      <div className="grid place-items-center py-6 text-[28px] font-semibold text-white/80">
        · · ·
      </div>
    ),
  },
  {
    caption: "Руки свободны",
    render: () => <div className="grid place-items-center py-6 text-[40px]">🖐️</div>,
  },
  {
    caption: "Одна точка в голове",
    render: () => (
      <div className="grid place-items-center py-6">
        <div className="h-3 w-3 rounded-full bg-primary" />
      </div>
    ),
  },
];

type DiceState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      motion: string;
      rationale: string;
    }
  | { status: "error"; message: string };

function TrainingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [level, setLevel] = useState<Level>(30);
  const [streak, setStreak] = useState<StreakInfo>({
    current: 0,
    longest: 0,
    weekDays: Array(7).fill(false),
  });
  const [dice, setDice] = useState<DiceState>({ status: "idle" });
  const [showTips, setShowTips] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [caseStarted, setCaseStarted] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setStreak(getStreak());
  }, []);

  const rollDice = async () => {
    setDice({ status: "loading" });
    try {
      const motion = await generateMotion({ data: { category: "любая", difficulty: "medium" } });
      setDice({
        status: "ready",
        motion: motion.motion,
        rationale: motion.rationale,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось получить тему";
      setDice({ status: "error", message: msg });
      toast(msg);
    }
  };

  const goBuildFromDice = () => {
    if (dice.status !== "ready") return;
    navigate({
      to: "/case-builder",
      search: { topic: dice.motion },
    });
  };

  const chooseLevel = (l: Level) => {
    if (progress.unlocked[l]) {
      setLevel(l);
      return;
    }
    const ok = window.confirm(
      `Уровень ${l} сек ещё закрыт. Он открывается после ${UNLOCK_AT} успешных попыток на предыдущем уровне.\n\nВсё равно попробовать?`,
    );
    if (!ok) return;
    const next: Progress = { ...progress, unlocked: { ...progress.unlocked, [l]: true } };
    setProgress(next);
    saveProgress(next);
    setLevel(l);
  };

  const beginRecording = () => {
    setTipIdx(0);
    setShowTips(true);
  };

  const startAfterTips = () => {
    setShowTips(false);
    const attempts = { ...progress.attempts, [level]: progress.attempts[level] + 1 };
    const unlocked = { ...progress.unlocked };
    const nextIdx = LEVELS.indexOf(level) + 1;
    if (nextIdx < LEVELS.length && attempts[level] >= UNLOCK_AT) {
      unlocked[LEVELS[nextIdx]] = true;
    }
    const next: Progress = { attempts, unlocked };
    setProgress(next);
    saveProgress(next);
    toast(`Запись на ${level} секунд скоро запустится`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      {/* 1. Header row */}
      <div className="flex items-center justify-between">
        <div className="text-[18px] font-semibold tracking-tight">
          Ме<span className="text-primary">з</span>он
        </div>
        <div
          className={
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold " +
            (streak.current > 0
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground")
          }
        >
          <Flame className="h-4 w-4" />
          {streak.current > 0
            ? `${streak.current} ${dayWord(streak.current)} подряд`
            : "Серии пока нет"}
        </div>
      </div>

      {/* 2. Hero */}
      <section className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
        <h1 className="text-[20px] font-semibold leading-tight">
          Одна идея — два взгляда
        </h1>
        <p className="mt-1 text-[13px] text-white/70">
          Приватно. Голос — единственный инструмент.
        </p>
        <div className="mt-4">
          <WeekStrip days={streak.weekDays} tone="dark" />
        </div>
      </section>

      {/* 3. Level selector */}
      <div className="rounded-[16px] hairline bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="formula-motif !text-foreground/70">Длительность</div>
          <div className="text-[11px] text-muted-foreground">
            {progress.attempts[level]}/{UNLOCK_AT} до следующего
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {LEVELS.map((l) => {
            const active = l === level;
            const locked = !progress.unlocked[l];
            return (
              <button
                key={l}
                onClick={() => chooseLevel(l)}
                className={
                  "rounded-full px-3 py-2 text-[13px] font-semibold transition " +
                  (active
                    ? "bg-[color:var(--color-ink)] text-white"
                    : locked
                      ? "bg-muted text-muted-foreground hover:bg-muted/80"
                      : "bg-accent text-foreground hover:bg-accent/80")
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  {locked && <Lock className="h-3 w-3" />}
                  {l} сек
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Твой путь сегодня — timeline stepper */}
      {(() => {
        const step1Done = dice.status === "ready";
        const step2Done = caseStarted;
        const stepUnlocked = [true, step1Done, step2Done];
        const activeIdx = step2Done ? 2 : step1Done ? 1 : 0;

        const Dot = ({ n, state }: { n: number; state: "done" | "active" | "future" }) => (
          <span
            className={
              "relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold " +
              (state === "active"
                ? "bg-primary text-white"
                : state === "done"
                  ? "bg-primary/25 text-primary"
                  : "bg-muted text-muted-foreground")
            }
          >
            {n}
          </span>
        );

        const stateOf = (i: number): "done" | "active" | "future" =>
          i < activeIdx ? "done" : i === activeIdx ? "active" : "future";

        return (
          <div className="rounded-[18px] hairline bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="formula-motif !text-foreground/70">Твой путь сегодня</div>
              <div className="text-[11px] text-muted-foreground">
                {activeIdx + 1}/3
              </div>
            </div>

            <ol className="relative mt-3 space-y-3">
              <span
                aria-hidden
                className="absolute left-[13px] top-4 bottom-4 w-px bg-border"
              />

              {/* Step 1 */}
              <li className="relative flex items-start gap-3">
                <Dot n={1} state={stateOf(0)} />
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-[13.5px] font-semibold">Тема</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={rollDice}
                      disabled={dice.status === "loading"}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-ink)] px-3 py-1.5 text-[12.5px] font-semibold text-white disabled:opacity-70"
                    >
                      {dice.status === "loading" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Dice5 className="h-3.5 w-3.5" />
                      )}
                      Умный кубик
                    </button>
                    <Link
                      to="/case-builder"
                      className="text-[11.5px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      или впиши свою тему
                    </Link>
                  </div>
                </div>
              </li>

              {/* Step 2 */}
              <li className="relative flex items-start gap-3">
                <Dot n={2} state={stateOf(1)} />
                <div className="flex-1 min-w-0 pt-0.5">
                  {stepUnlocked[1] ? (
                    <Link
                      to="/case-builder"
                      search={
                        dice.status === "ready" ? { topic: dice.motion } : undefined
                      }
                      onClick={() => setCaseStarted(true)}
                      className="group inline-flex items-center gap-2"
                    >
                      <span className="text-[13.5px] font-semibold group-hover:underline underline-offset-2">
                        Собрать кейс
                      </span>
                      <ListChecks className="h-4 w-4 text-primary" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-[13.5px] font-semibold">Собрать кейс</span>
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Идея → критерий → аргумент
                  </div>
                </div>
              </li>

              {/* Step 3 */}
              <li className="relative flex items-start gap-3">
                <Dot n={3} state={stateOf(2)} />
                <div className="flex-1 min-w-0 pt-0.5">
                  {stepUnlocked[2] ? (
                    <button
                      onClick={beginRecording}
                      className="inline-flex items-center gap-2"
                    >
                      <span className="text-[13.5px] font-semibold hover:underline underline-offset-2">
                        Запись — {level} сек
                      </span>
                      <Mic className="h-4 w-4 text-primary" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-[13.5px] font-semibold">
                        Запись — {level} сек
                      </span>
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Подсказки и таймер
                  </div>
                </div>
              </li>
            </ol>
          </div>
        );
      })()}

      {/* Dice result */}
      {dice.status === "ready" && (
        <section className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="formula-motif !text-white/50">Кубик выбрал</div>
            <button
              onClick={rollDice}
              className="text-[11px] text-white/60 underline underline-offset-2 hover:text-white"
            >
              Ещё раз
            </button>
          </div>
          <p className="mt-2 text-[18px] font-semibold leading-snug">«{dice.motion}»</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">
            {dice.rationale}
          </p>

          <button
            onClick={() => {
              setCaseStarted(true);
              goBuildFromDice();
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-white active:scale-[0.99]"
          >
            Собрать кейс <ListChecks className="h-4 w-4" />
          </button>
        </section>
      )}

      {/* Tips carousel before recording */}
      {showTips && (
        <div className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="formula-motif !text-white/50">Перед стартом</div>
            <button
              onClick={() => setShowTips(false)}
              className="text-[11px] text-white/60 hover:text-white"
            >
              Закрыть
            </button>
          </div>
          <div className="mt-3 rounded-[14px] bg-white/5 px-4 pt-2 pb-4">
            {TIPS[tipIdx].render()}
            <div className="mt-1 text-center text-[13.5px] font-semibold">
              {TIPS[tipIdx].caption}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setTipIdx((i) => Math.max(0, i - 1))}
              disabled={tipIdx === 0}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/20 disabled:opacity-30"
              aria-label="Назад"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {TIPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTipIdx(i)}
                  className={
                    "h-1.5 rounded-full transition " +
                    (i === tipIdx ? "w-5 bg-white" : "w-1.5 bg-white/30")
                  }
                  aria-label={`Подсказка ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setTipIdx((i) => Math.min(TIPS.length - 1, i + 1))}
              disabled={tipIdx === TIPS.length - 1}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/20 disabled:opacity-30"
              aria-label="Дальше"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={startAfterTips}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-white active:scale-[0.99]"
          >
            <Mic className="h-4 w-4" /> Записать {level} секунд
          </button>
        </div>
      )}

      {/* "или" divider */}
      <div className="py-1 text-center text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
        или
      </div>

      {/* Free-talk — visually distinct parallel mode */}
      <Link
        to="/free-talk"
        className="flex items-start gap-3 rounded-[16px] p-4 text-left active:scale-[0.99] bg-[#EEEDFE] hover:bg-[#E6E4FB] transition"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70">
          <Waves className="h-5 w-5 text-foreground" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-[14px] font-semibold">Свободные мысли</span>
            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Приватно
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-foreground/60">
            Без темы, без таймера, без оценки
          </span>
        </span>
      </Link>

      {/* Quiet link to Learn */}
      <div className="pt-1 text-center">
        <Link
          to="/learn"
          className="text-[12.5px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Быстрые советы →
        </Link>
      </div>
    </div>
  );
}
