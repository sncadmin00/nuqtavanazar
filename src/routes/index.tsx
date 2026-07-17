import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  ArrowRight, ArrowUpRight, Bot, Gavel, Shuffle, Swords,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});


const TUTOR_LINES = [
  "Как построить сильный аргумент по AREA?",
  "Дай пример определения (definition) для темы про UBI",
  "Чем отличается Karl Popper от Parliamentary?",
];

function HomePage() {
  const { t } = useI18n();
  const [tutorIdx, setTutorIdx] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const target = TUTOR_LINES[tutorIdx];
    let i = 0;
    setTyped("");
    const tick = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(tick);
        setTimeout(() => setTutorIdx((p) => (p + 1) % TUTOR_LINES.length), 2000);
      }
    }, 45);
    return () => clearInterval(tick);
  }, [tutorIdx]);

  return (
    <div className="relative overflow-hidden bg-background">
      {/* HERO — editorial masthead */}
      <section className="relative border-b border-foreground/15">
        {/* subtle paper texture */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-noise opacity-[0.35] mix-blend-multiply" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* masthead bar */}
          <div className="flex items-center justify-between border-b border-foreground/15 py-3 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/60">
            <span>Vol. I · No. 01</span>
            <span className="hidden sm:inline">Debate Club Uzbekistan · Est. Bukhara 2024</span>
            <span className="tabular-nums">{new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}</span>
          </div>

          <div className="grid grid-cols-12 gap-x-6 gap-y-10 py-14 md:py-20">
            {/* LEFT — headline article */}
            <div className="col-span-12 lg:col-span-8">
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/60">
                <span className="h-px w-8 bg-foreground/40" />
                <span>Дискурс · Риторика · AI</span>
              </div>

              <h1 className="mt-6 font-serif font-normal text-foreground leading-[0.98] tracking-[-0.02em] text-[clamp(3rem,8vw,6.5rem)]">
                Искусство аргумента,
                <br />
                <em className="italic text-foreground/90">выверенное</em> машиной.
              </h1>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 border-t border-foreground/15 pt-8">
                <div className="md:col-span-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/50">Ведущий автор</div>
                  <div className="mt-1 text-sm font-medium">AI-Judge · GPT-класс</div>
                  <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/50">Форматы</div>
                  <div className="mt-1 text-sm font-medium">Karl Popper · Parliamentary</div>
                </div>
                <div className="md:col-span-9">
                  <p className="text-lg md:text-xl leading-[1.55] text-foreground/80 font-normal">
                    <span className="float-left mr-2 mt-1 font-serif text-[3.5rem] leading-[0.8] text-foreground">К</span>
                    лассическая школа дебатов встречает алгоритмический разбор.
                    Задавайте вопрос — тьютор аргументирует. Пишите речь — судья
                    выставляет ballot по пяти критериям и объясняет каждый балл.
                    Спарингуйте — и получайте контраргументы уровня университетского раунда.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <Link
                      to="/judge"
                      className="group inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-medium tracking-wide hover:gap-3 transition-all"
                    >
                      <Gavel className="h-4 w-4" />
                      Получить ballot AI-судьи
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      to="/tutor"
                      className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
                    >
                      <Bot className="h-4 w-4" />
                      Читать с AI-тьютором
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — ballot as journal column */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="lg:border-l lg:border-foreground/15 lg:pl-6">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/60 pb-3 border-b border-foreground/20">
                  <span>Ballot № 0421</span>
                  <span>Case Study</span>
                </div>

                <div className="mt-5">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/50">Motion</div>
                  <h3 className="mt-1 font-serif text-2xl leading-tight">
                    <em className="italic">This House Would</em> ввести всеобщий базовый доход.
                  </h3>
                </div>

                <table className="mt-6 w-full text-sm">
                  <tbody className="divide-y divide-foreground/10">
                    {[
                      { k: "Структура", v: 88 },
                      { k: "Аргументация", v: 82 },
                      { k: "Доказательность", v: 76 },
                      { k: "Опровержение", v: 91 },
                      { k: "Убедительность", v: 84 },
                    ].map((r) => (
                      <tr key={r.k}>
                        <td className="py-2.5 pr-3 text-foreground/75">{r.k}</td>
                        <td className="py-2.5 w-full">
                          <div className="h-px w-full bg-foreground/10 relative">
                            <span className="absolute inset-y-0 left-0 bg-foreground" style={{ width: `${r.v}%`, height: "1px" }} />
                          </div>
                        </td>
                        <td className="py-2.5 pl-3 font-mono tabular-nums text-right">{r.v}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-4 pr-3 font-medium">Итог</td>
                      <td className="pt-4" />
                      <td className="pt-4 pl-3 font-serif text-2xl text-right leading-none">
                        8.4<span className="text-sm text-foreground/50">/10</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <blockquote className="mt-6 border-l-2 border-foreground pl-4 font-serif italic text-[15px] leading-snug text-foreground/80">
                  «Сильная структура AREA, чистое опровержение по второму аргументу.
                  Уточните механизм финансирования.»
                  <footer className="mt-2 not-italic font-sans text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/50">
                    — AI-Судья, комментарий
                  </footer>
                </blockquote>

                <div className="mt-6 pt-4 border-t border-foreground/15 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/60">
                  <Bot className="h-3 w-3" />
                  <span className="truncate">Тьютор: {typed}<span className="animate-caret">|</span></span>
                </div>
              </div>
            </aside>
          </div>

          {/* footer strip of hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 border-t border-foreground/15 py-6 text-sm">
            {[
              { k: "Формат", v: "KP · BP · Asian" },
              { k: "Языки", v: "RU · UZ · EN" },
              { k: "База тем", v: "200+ motions" },
              { k: "Оценка", v: "5 критериев" },
            ].map((s) => (
              <div key={s.k}>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/50">{s.k}</div>
                <div className="mt-0.5 font-serif text-xl">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTIONS — editorial index of AI tools */}
      <section className="border-b border-foreground/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="flex items-baseline justify-between border-b border-foreground/15 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/60">Раздел II</span>
              <span className="h-px w-8 bg-foreground/40" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/60">Инструменты</span>
            </div>
            <span className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/50">Четыре режима</span>
          </div>

          <h2 className="mt-8 font-serif text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] max-w-3xl">
            <em className="italic">Четыре</em> способа тренироваться —
            <br className="hidden md:block" /> один общий стандарт оценки.
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-foreground/15 border-y border-foreground/15">
            {[
              { n: "I",   to: "/judge",    icon: Gavel,   title: "AI-Судья",     desc: "Ballot по пяти критериям и развёрнутый комментарий к речи." },
              { n: "II",  to: "/tutor",    icon: Bot,     title: "AI-Тьютор",    desc: "Диалог по теории, форматам и примерам аргументации." },
              { n: "III", to: "/sparring", icon: Swords,  title: "AI-Спарринг",  desc: "Обмен аргументами и контраргументами в реальном времени." },
              { n: "IV",  to: "/motions",  icon: Shuffle, title: "Генератор тем", desc: "Свежие motion с пояснением сторон и уровня сложности." },
            ].map((s) => (
              <Link
                key={s.n}
                to={s.to}
                className="group relative flex flex-col p-6 lg:p-7 hover:bg-foreground/[0.03] transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/50">
                  <span>№ {s.n}</span>
                  <s.icon className="h-3.5 w-3.5" />
                </div>
                <h3 className="mt-6 font-serif text-2xl leading-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] border-b border-foreground/40 pb-0.5 self-start group-hover:border-foreground">
                  Открыть <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FORMATS — two-column editorial */}
      <section className="border-b border-foreground/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="flex items-baseline justify-between border-b border-foreground/15 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/60">Раздел III</span>
              <span className="h-px w-8 bg-foreground/40" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/60">Форматы</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-10">
            <div className="col-span-12 md:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em]">
                Две школы — <em className="italic">одна</em> сцена.
              </h2>
              <p className="mt-5 text-foreground/70 leading-relaxed">
                Начните со школьного Karl Popper или сразу тренируйтесь в университетском Parliamentary. AI подстраивается под регламент.
              </p>
            </div>

            <div className="col-span-12 md:col-span-8 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-foreground/15 border-y border-foreground/15">
              {[
                { n: "I",  to: "/learn/karl-popper-format",  aud: "Для школьников", title: "Karl Popper",         desc: "Командный формат 3×3 с акцентом на исследовании темы и опровержении." },
                { n: "II", to: "/learn/parliamentary-format", aud: "Для студентов",  title: "Parliamentary / Asian", desc: "Классика университетов: риторика, аналитика, импровизация." },
              ].map((f) => (
                <Link key={f.n} to={f.to} className="group flex flex-col p-6 lg:p-7 hover:bg-foreground/[0.03] transition-colors">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/50">
                    <span>Часть {f.n}</span>
                    <span>{f.aud}</span>
                  </div>
                  <h3 className="mt-5 font-serif text-3xl leading-tight">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/70">{f.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] border-b border-foreground/40 pb-0.5 self-start group-hover:border-foreground">
                    Читать <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS — three column brief */}
      <section className="border-b border-foreground/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="flex items-baseline justify-between border-b border-foreground/15 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/60">Раздел IV</span>
              <span className="h-px w-8 bg-foreground/40" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/60">Метод</span>
            </div>
            <span className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/50">Три шага</span>
          </div>

          <h2 className="mt-8 font-serif text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em]">
            От черновика речи <em className="italic">до</em> ballot.
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-foreground/15 border-y border-foreground/15">
            {[
              { n: "01", title: "Готовите речь",       body: "Пишете сами или используете конструктор AREA. Тьютор подсказывает по ходу." },
              { n: "02", title: "AI-Судья оценивает",  body: "Числовые баллы по пяти критериям, письменный ballot, точечные советы." },
              { n: "03", title: "Растёте в кабинете",  body: "Отслеживаете сильные и слабые стороны, получаете план тренировок." },
            ].map((s) => (
              <div key={s.n} className="p-6 lg:p-7">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">Шаг {s.n}</div>
                <h3 className="mt-4 font-serif text-2xl leading-tight">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — editorial colophon */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-12 gap-x-8 gap-y-8 items-end">
            <div className="col-span-12 md:col-span-8">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/50">Colophon</div>
              <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-[1.02] tracking-[-0.02em]">
                Готовы к <em className="italic">первому</em> ballot?
              </h2>
              <p className="mt-5 max-w-xl text-foreground/70 leading-relaxed">
                Регистрация сохранит оценки AI-судьи, откроет динамику прогресса и подскажет следующий урок.
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 flex flex-col gap-3 md:items-end">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-medium tracking-wide hover:gap-3 transition-all"
              >
                {t("nav.signup")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/judge"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
              >
                Попробовать без регистрации
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="mt-14 pt-6 border-t border-foreground/15 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/50">
            <span>Debate Club Uzbekistan · Bukhara</span>
            <span>Издание I · MMXXIV</span>
          </div>
        </div>
      </section>
    </div>
  );
}

