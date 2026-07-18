import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dices, Mic, Sparkles, Lock, ChevronLeft, ChevronRight, ListChecks, Mic2, ArrowRight, Waves } from "lucide-react";
import { LESSONS } from "@/lib/lessons";

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

const TIPS: { title: string; body: string }[] = [
  { title: "Пауза сильнее «эээ»", body: "Пауза звучит увереннее, чем «эээ». Молчи, а не тяни звук." },
  { title: "Медленнее, чем кажется", body: "Говори медленнее, чем кажется нужным — нервный темп читается как неуверенность." },
  { title: "Досказывай до конца", body: "Заверши мысль коротко, но до конца — не обрывай на середине." },
  { title: "Спина держит голос", body: "Прямая спина меняет звучание голоса, даже если тебя не видно." },
];

function TrainingPage() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [level, setLevel] = useState<Level>(30);
  const [showTips, setShowTips] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

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
        <div className="formula-motif !text-white/50">Тренировка</div>
        <h1 className="mt-1 text-[22px] font-semibold leading-tight">
          Проговорите обе стороны — одну идею, два взгляда
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
          Приватно. Никто не слышит. Голос — единственный инструмент, дыхание — единственная опора.
        </p>
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
          onClick={() => toast("Генератор тем скоро запустится")}
          className="flex items-start gap-3 rounded-[16px] hairline bg-white p-4 text-left active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent">
            <Dices className="h-5 w-5 text-foreground" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-semibold">Кубик — случайная тема</span>
            <span className="mt-0.5 block text-[12px] text-muted-foreground">Одна кнопка, готовая формулировка</span>
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
        <div className="rounded-[16px] hairline bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="formula-motif !text-foreground/70">Перед стартом</div>
            <button
              onClick={() => setShowTips(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Закрыть
            </button>
          </div>

          <div className="mt-3 rounded-[12px] bg-accent/40 p-4">
            <div className="text-[13px] font-semibold">{TIPS[tipIdx].title}</div>
            <p className="mt-1 text-[13px] leading-snug text-foreground/85">{TIPS[tipIdx].body}</p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setTipIdx((i) => Math.max(0, i - 1))}
              disabled={tipIdx === 0}
              className="grid h-8 w-8 place-items-center rounded-full hairline disabled:opacity-40"
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
                    (i === tipIdx ? "w-5 bg-[color:var(--color-ink)]" : "w-1.5 bg-foreground/25")
                  }
                  aria-label={`Подсказка ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setTipIdx((i) => Math.min(TIPS.length - 1, i + 1))}
              disabled={tipIdx === TIPS.length - 1}
              className="grid h-8 w-8 place-items-center rounded-full hairline disabled:opacity-40"
              aria-label="Дальше"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={startAfterTips}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-ink)] px-4 py-2.5 text-[13.5px] font-semibold text-white active:scale-[0.99]"
          >
            <Mic className="h-4 w-4" /> Записать {level} секунд
          </button>
        </div>
      )}

      {/* Speaking technique bridge */}
      <div className="rounded-[16px] hairline bg-white p-4">
        <div className="flex items-center gap-2">
          <Mic2 className="h-3.5 w-3.5 text-primary" />
          <div className="formula-motif !text-foreground/70">Ораторская техника</div>
          <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            Новое
          </span>
        </div>
        <p className="mt-2 text-[12.5px] leading-snug text-muted-foreground">
          Голос — единственный инструмент. Короткие статьи о дыхании, паузах и темпе для аудио-раундов.
        </p>
        <ul className="mt-3 divide-y divide-border/60">
          {LESSONS.filter((l) => l.category === "speaking").map((l) => (
            <li key={l.id}>
              <Link
                to="/learn/$moduleId"
                params={{ moduleId: l.id }}
                className="flex items-center gap-3 py-2.5 text-[13px] active:scale-[0.99]"
              >
                <span className="flex-1 truncate text-foreground/90">{l.title}</span>
                <span className="text-[11px] text-muted-foreground">{l.minutes} мин</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

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
