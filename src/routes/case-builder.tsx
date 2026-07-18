import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mic } from "lucide-react";

export const Route = createFileRoute("/case-builder")({
  head: () => ({
    meta: [
      { title: "Собрать кейс — Мезон" },
      { name: "description", content: "Пошаговый конструктор кейса Мезон: идея → критерий → аргумент. Без AI, только вы и формула." },
    ],
  }),
  component: CaseBuilder,
});

type Step = 0 | 1 | 2;
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

const STEPS = [
  {
    label: "Идея",
    caption: "Выбери сторону",
    icon: IdeaIcon,
    example: "Соцсети приносят обществу больше вреда, чем пользы.",
    placeholder: "Мой тезис…",
  },
  {
    label: "Критерий",
    caption: "Что перевешивает?",
    icon: CriteriaIcon,
    example: "Психологическое здоровье подростков важнее удобства коммуникации.",
    placeholder: "Мой критерий…",
  },
  {
    label: "Аргумент",
    caption: "Что это доказывает?",
    icon: ArgumentIcon,
    example:
      "Исследования показывают рост тревожности у подростков с активными соцсетями — значит, по критерию психологического здоровья моя сторона сильнее.",
    placeholder: "Мой аргумент…",
  },
];

function CaseBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [side, setSide] = useState<Side>("affirmation");
  const [values, setValues] = useState<string[]>(["", "", ""]);
  const [done, setDone] = useState(false);

  const SIDE_LABEL: Record<Side, string> = {
    affirmation: "Утверждение",
    negation: "Отрицание",
  };

  const current = STEPS[step];
  const canNext = values[step].trim().length > 0;

  const setValue = (v: string) => {
    const next = [...values];
    next[step] = v;
    setValues(next);
  };

  const goNext = () => {
    if (step < 2) {
      setStep((step + 1) as Step);
    } else {
      setDone(true);
    }
  };

  const goBack = () => {
    if (step > 0) setStep((step - 1) as Step);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-[18px] bg-[color:var(--color-ink)] p-6 text-white">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-[22px] font-semibold leading-tight">
            Кейс собран. Теперь проговори его вслух.
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
            Голос — единственный инструмент в живом раунде. Пройдите тренировку по своему кейсу.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {STEPS.map((s, i) => (
            <div key={s.label} className="rounded-[14px] hairline bg-white p-4">
              <div className="formula-motif !text-foreground/60">{s.label}</div>
              <p className="mt-1 text-[13.5px] leading-snug text-foreground/90">{values[i]}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => navigate({ to: "/training" })}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--color-ink)] px-4 py-3 text-[14px] font-semibold text-white active:scale-[0.99]"
          >
            <Mic className="h-4 w-4" /> Перейти к записи
          </button>
          <button
            onClick={() => {
              setStep(0);
              setSide("affirmation");
              setValues(["", "", ""]);
              setDone(false);
            }}
            className="inline-flex flex-1 items-center justify-center rounded-full hairline bg-white px-4 py-3 text-[14px] font-semibold text-foreground active:scale-[0.99]"
          >
            Собрать ещё один
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        to="/training"
        className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> К тренировке
      </Link>

      {/* progress dots */}
      <div className="mt-3 flex items-center gap-2">
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

      <div className="mt-4 rounded-[18px] hairline bg-white p-5">
        <div className="formula-motif !text-foreground/60">Шаг {step + 1} · {current.label}</div>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-16 w-16 shrink-0">
            <current.icon />
          </div>
          <p className="text-[15px] font-semibold leading-snug text-foreground">{current.caption}</p>
        </div>

        <div className="mt-5 rounded-[12px] bg-accent/40 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Пример</div>
          <p className="mt-1 text-[13px] leading-snug text-foreground/85">«{current.example}»</p>
        </div>

        <textarea
          value={values[step]}
          onChange={(e) => setValue(e.target.value)}
          placeholder={current.placeholder}
          rows={4}
          className="mt-4 w-full resize-none rounded-[12px] hairline bg-white p-3 text-[14px] leading-snug outline-none focus:border-[color:var(--color-ink)]"
        />
      </div>

      <div className="mt-4 flex gap-2">
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
          {step === 2 ? (
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
    </div>
  );
}
