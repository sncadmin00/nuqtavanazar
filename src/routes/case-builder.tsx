import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Flag, Mic, Save } from "lucide-react";
import { saveReflection, type CaseReflection } from "@/lib/freeTalk";
import { recordCycleCompletion } from "@/lib/streak";

export const Route = createFileRoute("/case-builder")({
  validateSearch: (s: Record<string, unknown>) => ({
    side:
      s.side === "affirmation" || s.side === "negation"
        ? (s.side as "affirmation" | "negation")
        : undefined,
    topic: typeof s.topic === "string" ? s.topic : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Собрать кейс — Мезон" },
      { name: "description", content: "Пошаговый конструктор кейса Мезон: идея → критерий → аргумент." },
    ],
  }),
  component: CaseBuilder,
});

type Step = 0 | 1 | 2 | 3 | 4;
type Side = "affirmation" | "negation";

function IdeaIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="80" height="80" rx="16" fill="#1A1A2E" />
      <path d="M16 56h48" stroke="#E8562D" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 56V28" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 28l18-6v24l-18 6V28z" fill="#E8562D" />
      <circle cx="40" cy="22" r="3" fill="#F7F3EC" />
    </svg>
  );
}

function CriteriaIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="80" height="80" rx="16" fill="#1A1A2E" />
      <path d="M40 18v10" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
      <path d="M22 36h36" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 36l-6 22" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
      <path d="M56 36l6 22" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 62h52" stroke="#E8562D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="62" r="5" fill="#E8562D" />
      <circle cx="56" cy="62" r="5" fill="#F7F3EC" />
    </svg>
  );
}

function ArgumentIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="80" height="80" rx="16" fill="#1A1A2E" />
      <circle cx="24" cy="40" r="10" stroke="#F7F3EC" strokeWidth="4" />
      <circle cx="56" cy="40" r="10" stroke="#E8562D" strokeWidth="4" />
      <path d="M34 40h12" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function ProofIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="80" height="80" rx="16" fill="#1A1A2E" />
      <rect x="20" y="18" width="40" height="48" rx="4" stroke="#F7F3EC" strokeWidth="4" />
      <path d="M28 32h24" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 42h24" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 52h14" stroke="#E8562D" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function ConclusionIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="80" height="80" rx="16" fill="#1A1A2E" />
      <path d="M24 28h32" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 40h24" stroke="#F7F3EC" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 52h18" stroke="#E8562D" strokeWidth="4" strokeLinecap="round" />
      <path d="M56 52l6-6" stroke="#E8562D" strokeWidth="4" strokeLinecap="round" />
      <path d="M56 46l6 6" stroke="#E8562D" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

const STEPS = [
  {
    label: "Позиция",
    question: "Что?",
    placeholder: "Твоя позиция…",
    icon: IdeaIcon,
  },
  {
    label: "Критерий",
    question: "Почему?",
    placeholder: "Твой критерий…",
    icon: CriteriaIcon,
  },
  {
    label: "Аргумент",
    question: "Как?",
    placeholder: "Твой аргумент…",
    icon: ArgumentIcon,
  },
  {
    label: "Доказательство",
    question: "Факты?",
    placeholder: "Твои факты…",
    icon: ProofIcon,
  },
  {
    label: "Вывод",
    question: "Вывод?",
    placeholder: "Твой вывод…",
    icon: ConclusionIcon,
  },
];

type Phase = "building" | "offer" | "reflection" | "saved";

function CaseBuilder() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [phase, setPhase] = useState<Phase>("building");
  const [step, setStep] = useState<Step>(0);
  const [side, setSide] = useState<Side>(search.side ?? "affirmation");
  const [topic, setTopic] = useState<string>(search.topic ?? "");
  const [values, setValues] = useState<string[]>(["", "", "", "", ""]);
  const [completedSides, setCompletedSides] = useState<
    Array<{ side: Side; values: string[] }>
  >([]);
  const [opinion, setOpinion] = useState("");
  const [changed, setChanged] = useState<CaseReflection["changed"]>(null);
  const [saving, setSaving] = useState(false);

  const SIDE_LABEL: Record<Side, string> = {
    affirmation: "Утверждение",
    negation: "Отрицание",
  };

  const current = STEPS[step];
  const canNext = values[step].trim().length > 0 && topic.trim().length > 0;

  const setValue = (v: string) => {
    const next = [...values];
    next[step] = v;
    setValues(next);
  };

  const finishCurrentSide = () => {
    const all = [...completedSides, { side, values: [...values] }];
    setCompletedSides(all);
    if (all.length >= 2) {
      setPhase("reflection");
    } else {
      setPhase("offer");
    }
  };

  const goNext = () => {
    if (step < 4) {
      setStep((step + 1) as Step);
    } else {
      finishCurrentSide();
    }
  };

  const goBack = () => {
    if (step > 0) setStep((step - 1) as Step);
  };

  const startSecondSide = () => {
    const done = completedSides[0];
    setSide(done.side === "affirmation" ? "negation" : "affirmation");
    setValues(["", "", "", ""]);
    setStep(0);
    setPhase("building");
  };

  const resetAll = () => {
    setStep(0);
    setSide("affirmation");
    setTopic("");
    setValues(["", "", "", ""]);
    setCompletedSides([]);
    setOpinion("");
    setChanged(null);
    setPhase("building");
  };

  const handleSaveReflection = async () => {
    setSaving(true);
    try {
      const rec: CaseReflection = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        topic: topic.trim(),
        sides: completedSides,
        opinion: opinion.trim(),
        changed,
      };
      await saveReflection(rec);
      if (completedSides.length >= 2) recordCycleCompletion();
      toast("Сохранено в архив");
      setPhase("saved");
    } catch {
      toast("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  // ---------- OFFER: second side ----------
  if (phase === "offer") {
    const doneSide = completedSides[0].side;
    const nextSide = doneSide === "affirmation" ? "negation" : "affirmation";
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-[18px] bg-[color:var(--color-ink)] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="h-px w-6 bg-white/25" />
            <div className="grid h-10 w-10 place-items-center rounded-full border border-dashed border-white/40 text-white/60">
              <Flag className="h-4 w-4" />
            </div>
          </div>

          <div className="formula-motif mt-4 !text-white/50">Готово · {SIDE_LABEL[doneSide]}</div>
          <h1 className="mt-1 text-[22px] font-semibold leading-tight">
            {SIDE_LABEL[doneSide]} готово
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-white/85">
            Попробуешь собрать и {SIDE_LABEL[nextSide]} по той же теме?
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
            Это заставит посмотреть на вопрос с другой стороны — в этом весь смысл тренировки.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={startSecondSide}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-white active:scale-[0.99]"
          >
            Собрать вторую сторону
          </button>
          <button
            onClick={() => setPhase("reflection")}
            className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[13.5px] font-semibold text-foreground/70 hover:text-foreground"
          >
            Пропустить
          </button>
        </div>
      </div>
    );
  }

  // ---------- REFLECTION ----------
  if (phase === "reflection") {
    const bothDone = completedSides.length >= 2;
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="rounded-[18px] bg-[color:var(--color-ink)] p-6 text-white">
          <div className="formula-motif !text-white/50">Личное · не оценивается</div>
          <h1 className="mt-1 text-[22px] font-semibold leading-tight">
            {bothDone ? "Обе стороны собраны" : "Сторона собрана"}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
            Теперь — только для тебя. Никто не увидит и не проанализирует.
          </p>
        </div>

        <div className="rounded-[16px] hairline bg-white p-4">
          <div className="formula-motif !text-foreground/60">А что думаешь ты?</div>
          <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">
            Не кейс для баттла — просто твоё личное мнение, никто не оценивает.
          </p>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder="Своими словами…"
            rows={5}
            className="mt-3 w-full resize-none rounded-[12px] hairline bg-white p-3 text-[14px] leading-snug outline-none focus:border-[color:var(--color-ink)]"
          />
        </div>

        <div className="rounded-[16px] hairline bg-white p-4">
          <div className="formula-motif !text-foreground/60">Мнение изменилось после этого?</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(
              [
                { key: "strong", label: "Да, сильно" },
                { key: "little", label: "Немного" },
                { key: "no", label: "Нет" },
              ] as const
            ).map((opt) => {
              const active = changed === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setChanged(opt.key)}
                  className={
                    "rounded-full px-2 py-2 text-[12.5px] font-semibold transition " +
                    (active
                      ? "bg-[color:var(--color-ink)] text-white"
                      : "bg-accent text-foreground hover:bg-accent/80")
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSaveReflection}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-white disabled:opacity-50 active:scale-[0.99]"
        >
          <Save className="h-4 w-4" /> {saving ? "Сохраняю…" : "Сохранить в архив"}
        </button>
      </div>
    );
  }

  // ---------- SAVED ----------
  if (phase === "saved") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-[18px] bg-[color:var(--color-ink)] p-6 text-white">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-[22px] font-semibold leading-tight">Сохранено</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
            Твоя рефлексия лежит в приватном архиве — только у тебя в браузере.
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => navigate({ to: "/archive" })}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--color-ink)] px-4 py-3 text-[14px] font-semibold text-white active:scale-[0.99]"
          >
            Открыть архив
          </button>
          <button
            onClick={resetAll}
            className="inline-flex flex-1 items-center justify-center rounded-full hairline bg-white px-4 py-3 text-[14px] font-semibold text-foreground active:scale-[0.99]"
          >
            Собрать ещё один
          </button>
        </div>
      </div>
    );
  }

  // ---------- BUILDING ----------
  const isSecondSide = completedSides.length === 1;
  const topicMissing = topic.trim().length === 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <Link
        to="/training"
        className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> К тренировке
      </Link>

      {/* Topic plaque — shown on every step */}
      <div className="rounded-[18px] bg-[color:var(--color-ink)] p-4 text-white">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Тема</div>
        {topicMissing ? (
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            placeholder="Впиши тему мотива…"
            className="mt-2 w-full bg-transparent text-[16px] font-semibold leading-snug placeholder:text-white/40 outline-none"
            autoFocus
          />
        ) : (
          <p className="mt-2 text-[16px] font-semibold leading-snug">«{topic}»</p>
        )}
      </div>

      {isSecondSide && (
        <div className="rounded-[12px] hairline bg-accent/40 p-3 text-[12.5px] text-foreground/80">
          Собираем <b>{SIDE_LABEL[side]}</b> — вторая сторона той же темы.
        </div>
      )}

      {/* progress dots */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center gap-2">
            <div
              className={
                "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold transition " +
                (i < step
                  ? "bg-primary text-white"
                  : i === step
                    ? "bg-[color:var(--color-ink)] text-white"
                    : "bg-muted text-muted-foreground")
              }
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={
                  "h-[2px] flex-1 rounded-full " +
                  (i < step ? "bg-primary" : "bg-muted")
                }
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-[18px] hairline bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0">
            <current.icon />
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              Шаг {step + 1} · {current.label}
            </div>
            <p className="text-[17px] font-semibold leading-snug text-foreground">
              {current.question}
            </p>
          </div>
        </div>

        {step === 0 && (
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-2">
              {(["affirmation", "negation"] as Side[]).map((s) => {
                const active = side === s;
                const disabled = isSecondSide;
                return (
                  <button
                    key={s}
                    onClick={() => !disabled && setSide(s)}
                    disabled={disabled}
                    className={
                      "rounded-full px-3 py-2 text-[13px] font-semibold transition " +
                      (active
                        ? "bg-[color:var(--color-ink)] text-white"
                        : "bg-accent text-foreground hover:bg-accent/80") +
                      (disabled ? " opacity-70 cursor-not-allowed" : "")
                    }
                  >
                    {SIDE_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <textarea
          value={values[step]}
          onChange={(e) => setValue(e.target.value)}
          placeholder={current.placeholder}
          rows={4}
          disabled={topicMissing}
          className="mt-5 w-full resize-none rounded-[12px] hairline bg-white p-3 text-[14px] leading-snug outline-none focus:border-[color:var(--color-ink)] disabled:opacity-50"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={goBack}
          disabled={step === 0}
          className="inline-flex items-center justify-center gap-1.5 rounded-full hairline bg-white px-4 py-2.5 text-[13.5px] font-semibold text-foreground disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <button
          onClick={goNext}
          disabled={!canNext}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-ink)] px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-40 active:scale-[0.99]"
        >
          {step === 3 ? (
            <>
              Готово <CheckCircle2 className="h-4 w-4" />
            </>
          ) : (
            <>
              Дальше <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {step === 3 && canNext && (
        <button
          onClick={() => navigate({ to: "/training" })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full hairline bg-white px-4 py-2.5 text-[12.5px] font-semibold text-foreground/80 hover:text-foreground"
        >
          <Mic className="h-3.5 w-3.5" /> Записать эту сторону вслух
        </button>
      )}
    </div>
  );
}
