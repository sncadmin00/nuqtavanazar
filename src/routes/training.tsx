import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dice5,
  Mic,
  Sparkles,
  Lock,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Waves,
  Check,
  X,
  Flame,
  Loader2,
} from "lucide-react";
import { getStreak, type StreakInfo } from "@/lib/streak";
import { getSideAssignment, type SideAssignment } from "@/lib/dice-intel";
import { generateMotion } from "@/lib/ai.functions";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Тренировка — Мезон" },
      { name: "description", content: "Соло-тренировка речи: уровни 30/60/90 секунд, конструктор кейса, подсказки по подаче." },
    ],
  }),
  component: TrainingPage,
});

type Level = 30 | 60 | 90;
const LEVELS: Level[] = [30, 60, 90];
const STORAGE_KEY = "mezon.training.progress.v1";
const UNLOCK_AT = 3; // 3 успешных попытки, чтобы открыть следующий уровень

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
    return { ...defaultProgress, ...parsed, unlocked: { ...defaultProgress.unlocked, ...(parsed.unlocked ?? {}) } };
  } catch {
    return defaultProgress;
  }
}

function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

type Tip = { caption: string; render: () => React.ReactElement };

const BreathingVisual = () => (
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

const Bubble = ({ children, tone }: { children: React.ReactNode; tone: "bad" | "good" }) => (
  <div
    className={
      "relative rounded-2xl px-4 py-3 text-[18px] font-semibold " +
      (tone === "bad"
        ? "bg-red-500/15 text-red-200 line-through decoration-red-300/70"
        : "bg-emerald-500/15 text-emerald-200")
    }
  >
    {children}
    <span
      className={
        "absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 " +
        (tone === "bad" ? "bg-red-500/15" : "bg-emerald-500/15")
      }
    />
  </div>
);

const PauseVisual = () => (
  <div className="flex items-end justify-center gap-4 py-4">
    <Bubble tone="bad">ЭЭЭ</Bubble>
    <Bubble tone="good">· · ·</Bubble>
  </div>
);

const HandsVisual = () => (
  <div className="flex items-center justify-center gap-6 py-4 text-white">
    <div className="flex flex-col items-center gap-2">
      <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-red-500/15">
        <span className="text-[26px]">✊</span>
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white">
          <X className="h-3 w-3" />
        </span>
      </div>
    </div>
    <div className="text-white/40">→</div>
    <div className="flex flex-col items-center gap-2">
      <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/15">
        <span className="text-[26px]">🖐️</span>
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
          <Check className="h-3 w-3" />
        </span>
      </div>
    </div>
  </div>
);

const FocusVisual = () => (
  <div className="grid grid-cols-2 gap-4 py-4">
    <div className="grid place-items-center rounded-2xl bg-emerald-500/10 py-4">
      <div className="relative grid h-16 w-16 place-items-center">
        <div className="absolute inset-0 rounded-full border border-emerald-300/50" />
        <div className="absolute inset-3 rounded-full border border-emerald-300/30" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
      </div>
    </div>
    <div className="relative grid place-items-center rounded-2xl bg-red-500/10 py-4">
      <div className="relative h-16 w-16">
        {[
          { t: 8, l: 20 }, { t: 55, l: 10 }, { t: 30, l: 48 },
          { t: 70, l: 60 }, { t: 12, l: 70 }, { t: 45, l: 30 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-red-300/80"
            style={{ top: `${p.t}%`, left: `${p.l}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const TIPS: Tip[] = [
  { caption: "4 секунды вдох — 4 секунды выдох", render: BreathingVisual },
  { caption: "Тишина — не ошибка", render: PauseVisual },
  { caption: "Руки свободны, не сжаты", render: HandsVisual },
  { caption: "Одна точка в голове — не блуждающий фокус", render: FocusVisual },
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function dayWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return "дней";
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дня";
  return "дней";
}

type DiceState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      motion: string;
      rationale: string;
      assignment: SideAssignment;
    }
  | { status: "error"; message: string };

function TrainingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [level, setLevel] = useState<Level>(30);
  const [showTips, setShowTips] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [streak, setStreak] = useState<StreakInfo>({ current: 0, longest: 0, weekDays: Array(7).fill(false) });
  const [dice, setDice] = useState<DiceState>({ status: "idle" });

  useEffect(() => {
    setProgress(loadProgress());
    setStreak(getStreak());
  }, []);

  const rollDice = async () => {
    setDice({ status: "loading" });
    try {
      const [motion, assignment] = await Promise.all([
        generateMotion({ data: { category: "любая", difficulty: "medium" } }),
        getSideAssignment(),
      ]);
      setDice({
        status: "ready",
        motion: motion.motion,
        rationale: motion.rationale,
        assignment,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось получить тему";
      setDice({ status: "error", message: msg });
      toast(msg);
    }
  };

  const goBuildWithAssignment = () => {
    if (dice.status !== "ready") return;
    navigate({
      to: "/case-builder",
      search: { side: dice.assignment.side, topic: dice.motion },
    });
  };

  const chooseLevel = (l: Level) => {
    if (progress.unlocked[l]) {
      setLevel(l);
      return;
    }
    const ok = window.confirm(
      `Уровень ${l} сек ещё закрыт. Он открывается после ${UNLOCK_AT} успешных попыток на предыдущем уровне.\n\nВсё равно попробовать сейчас?`,
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
    // Заглушка: инкрементируем попытку, чтобы был виден прогресс разблокировки
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
      <section className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="formula-motif !text-white/50">Тренировка</div>
            <h1 className="mt-1 text-[22px] font-semibold leading-tight">
              Проговорите обе стороны — одну идею, два взгляда
            </h1>
          </div>
          <div
            className={
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold " +
              (streak.current > 0
                ? "bg-primary/20 text-primary-foreground text-white"
                : "bg-white/10 text-white/70")
            }
            title={streak.current > 0 ? `Лучшая серия: ${streak.longest}` : "Серия начнётся с первого пройденного цикла"}
          >
            <Flame className={"h-4 w-4 " + (streak.current > 0 ? "text-primary" : "text-white/50")} />
            {streak.current > 0 ? `${streak.current} ${dayWord(streak.current)} подряд` : "Серии пока нет"}
          </div>
        </div>

        <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
          Приватно. Никто не слышит. Голос — единственный инструмент, дыхание — единственная опора.
        </p>

        {/* Week bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10.5px] uppercase tracking-wider text-white/50">
            <span>Эта неделя</span>
            <span>{streak.weekDays.filter(Boolean).length}/7</span>
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-1.5">
            {streak.weekDays.map((done, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={
                    "h-2 w-full rounded-full " +
                    (done ? "bg-primary" : "bg-white/15")
                  }
                />
                <span className="text-[10px] text-white/50">{WEEKDAYS[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-white/50">
            Цикл засчитывается, когда собраны обе стороны и сохранена рефлексия.
          </p>
        </div>
      </section>

      {/* Level selector */}
      <div className="rounded-[16px] hairline bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="formula-motif !text-foreground/70">Длительность</div>
          <div className="text-[11px] text-muted-foreground">
            {progress.attempts[level]}/{UNLOCK_AT} до следующего уровня
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
                  "relative rounded-full px-3 py-2 text-[13px] font-semibold transition " +
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
        <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">
          Уровни открываются автоматически после {UNLOCK_AT} успешных попыток. Можно открыть раньше вручную.
        </p>
      </div>

      {/* Cards row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        <button
          onClick={rollDice}
          disabled={dice.status === "loading"}
          className="flex items-start gap-3 rounded-[16px] hairline bg-white p-4 text-left active:scale-[0.99] disabled:opacity-70"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent">
            {dice.status === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            ) : (
              <Dice5 className="h-5 w-5 text-foreground" />
            )}
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-semibold">Умный кубик</span>
            <span className="mt-0.5 block text-[12px] text-muted-foreground">
              Тема + сторона, специально не та, к которой ты склоняешься
            </span>
          </span>
        </button>

        <Link
          to="/case-builder"
          className="flex items-start gap-3 rounded-[16px] hairline bg-white p-4 text-left active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15">
            <ListChecks className="h-5 w-5 text-primary" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-semibold">Собрать кейс пошагово</span>
            <span className="mt-0.5 block text-[12px] text-muted-foreground">Идея → критерий → аргумент, 3 шага</span>
          </span>
        </Link>

        <Link
          to="/free-talk"
          className="flex items-start gap-3 rounded-[16px] hairline bg-white p-4 text-left active:scale-[0.99] sm:col-span-2 lg:col-span-1"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent">
            <Waves className="h-5 w-5 text-foreground" />
          </span>
          <span className="flex-1">
            <span className="flex items-center gap-2">
              <span className="text-[14px] font-semibold">Свободные мысли</span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Приватно
              </span>
            </span>
            <span className="mt-0.5 block text-[12px] text-muted-foreground">
              Без темы, без таймера, без оценки — никто не слушает
            </span>
          </span>
        </Link>
      </div>

      {/* Smart dice result */}
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
          <p className="mt-2 text-[16px] font-semibold leading-snug">«{dice.motion}»</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">{dice.rationale}</p>

          <div
            className={
              "mt-4 rounded-[12px] p-3 text-[12.5px] leading-snug " +
              (dice.assignment.reason
                ? "bg-primary/20 text-white"
                : "bg-white/5 text-white/80")
            }
          >
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/60">
              Твоя сторона
            </div>
            <div className="mt-1 text-[14px] font-semibold">
              {dice.assignment.side === "affirmation" ? "Утверждение" : "Отрицание"}
            </div>
            <p className="mt-1.5 text-white/80">
              {dice.assignment.reason ??
                `Ещё нет прошлых рефлексий (${dice.assignment.samples}/3) — сторона выпала случайно. Собирай кейсы, и кубик начнёт назначать противоположную твоей.`}
            </p>
          </div>

          <button
            onClick={goBuildWithAssignment}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-white active:scale-[0.99]"
          >
            Собрать эту сторону <ListChecks className="h-4 w-4" />
          </button>
        </section>
      )}



      {/* Record button + tips */}
      {!showTips ? (
        <button
          onClick={beginRecording}
          className="flex w-full items-center gap-3 rounded-[16px] hairline bg-white p-4 text-left active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15">
            <Mic className="h-5 w-5 text-primary" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-semibold">Начать запись — {level} секунд</span>
            <span className="block text-[12px] text-muted-foreground">
              Ворота перед live-баттлами
            </span>
          </span>
        </button>
      ) : (
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
            <div className="mt-1 text-center text-[13.5px] font-semibold text-white">
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


      <div className="rounded-[16px] hairline bg-white p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <div className="formula-motif !text-foreground/70">Как работает</div>
        </div>
        <ol className="mt-3 space-y-2.5 text-[13px] leading-snug text-foreground/85">
          <li><span className="mr-2 font-mono text-primary">1.</span> Выберите длительность и возьмите тему.</li>
          <li><span className="mr-2 font-mono text-primary">2.</span> Сначала — сторона утверждения. Потом отрицания.</li>
          <li><span className="mr-2 font-mono text-primary">3.</span> Прочитайте подсказки по подаче — и начинайте.</li>
        </ol>
      </div>
    </div>
  );
}
