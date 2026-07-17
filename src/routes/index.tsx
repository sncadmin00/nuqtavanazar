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



      {/* MARQUEE */}
      <section aria-hidden className="border-y border-foreground/10 bg-ink text-background py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-10 font-display text-2xl font-semibold">
          {Array.from({ length: 2 }).map((_, r) => (
            <div key={r} className="flex items-center gap-10">
              {["AI-Тьютор", "AI-Судья", "AI-Спарринг", "AI-Генератор", "Karl Popper", "Parliamentary", "Бухара → Узбекистан"].map((w, i) => (
                <span key={i} className="flex items-center gap-10">
                  <span className={cn(i % 2 === 0 ? "text-background" : "text-gradient-sunset")}>{w}</span>
                  <Flame className="h-5 w-5 text-sunset-orange" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* AI BENTO — broken grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sunset-orange/10 text-sunset-orange px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3 w-3" /> Четыре AI-режима
            </div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
              Всё, что нужно, чтобы <span className="text-gradient-sunset">выиграть раунд</span>
            </h2>
          </div>
          <Link to="/tutor" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground">
            Начать с тьютора <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-12 gap-4 md:gap-5">
          {/* Judge — big */}
          <BentoCard
            to="/judge"
            className="col-span-12 md:col-span-8 md:row-span-2 min-h-[320px] md:min-h-[420px] bg-ink text-background border-transparent"
            hue="magenta"
            big
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-sunset-orange animate-pulse-dot" /> Ключевая фича
              </span>
              <Gavel className="h-6 w-6 text-sunset-orange" />
            </div>
            <div className="mt-auto">
              <h3 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                AI-Судья <span className="text-gradient-sunset">ставит баллы</span> и пишет фидбек
              </h3>
              <p className="mt-3 max-w-md text-background/70">
                Вставь речь — получи ballot по 5 критериям и развёрнутый комментарий как от настоящего судьи турнира.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sunset-orange">
                Оценить речь <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </BentoCard>

          {/* Tutor */}
          <BentoCard to="/tutor" className="col-span-12 md:col-span-4 min-h-[200px]" hue="violet">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sunset-violet/15 text-sunset-violet"><Bot className="h-5 w-5" /></span>
              <span className="text-[10px] font-mono text-foreground/40">01</span>
            </div>
            <div className="mt-6">
              <h3 className="font-display text-xl font-bold">AI-Тьютор</h3>
              <p className="mt-1.5 text-sm text-foreground/60">Диалог по теории, форматам и примерам.</p>
            </div>
          </BentoCard>

          {/* Sparring */}
          <BentoCard to="/sparring" className="col-span-6 md:col-span-4 min-h-[200px]" hue="orange">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sunset-orange/15 text-sunset-orange"><Swords className="h-5 w-5" /></span>
              <span className="text-[10px] font-mono text-foreground/40">02</span>
            </div>
            <div className="mt-6">
              <h3 className="font-display text-xl font-bold">AI-Спарринг</h3>
              <p className="mt-1.5 text-sm text-foreground/60">Живой обмен аргументами с оппонентом.</p>
            </div>
          </BentoCard>

          {/* Generator */}
          <BentoCard to="/motions" className="col-span-6 md:col-span-4 min-h-[200px]" hue="amber">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sunset-amber/15 text-sunset-amber"><Shuffle className="h-5 w-5" /></span>
              <span className="text-[10px] font-mono text-foreground/40">03</span>
            </div>
            <div className="mt-6">
              <h3 className="font-display text-xl font-bold">Генератор тем</h3>
              <p className="mt-1.5 text-sm text-foreground/60">Свежая motion + пояснение сторон.</p>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* FORMATS — asymmetric */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-sunset-orange font-semibold">Форматы</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
              Два мира <br /> одной сцены.
            </h2>
            <p className="mt-4 text-foreground/70">
              Начни со школьного Karl Popper или сразу тренируйся в университетском Parliamentary. AI подстраивается под формат.
            </p>
          </div>
          <div className="col-span-12 md:col-span-7 grid gap-4">
            <FormatRow
              n="01"
              audience="Для школьников"
              title="Karl Popper"
              desc="Командный формат 3×3 с акцентом на исследовании темы и мастерстве опровержения."
              to="/learn/karl-popper-format"
              hue="orange"
            />
            <FormatRow
              n="02"
              audience="Для студентов"
              title="Parliamentary / Asian"
              desc="Классический университетский формат: риторика, аналитика, импровизация."
              to="/learn/parliamentary-format"
              hue="violet"
            />
          </div>
        </div>
      </section>

      {/* MISSION — dark broken card */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="relative overflow-hidden rounded-[2rem] gradient-ink text-background p-8 md:p-16 shadow-glow">
          <div aria-hidden className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-sunset-orange/40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 -left-16 h-[360px] w-[360px] rounded-full bg-sunset-magenta/30 blur-3xl" />
          <div aria-hidden className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />

          <div className="relative grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                <Zap className="h-3 w-3" /> Активное обучение вместо пассивного чтения
              </div>
              <h2 className="mt-5 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
                Голос — <span className="text-gradient-sunset">оружие</span>.<br />
                Мы даём тренажёр.
              </h2>
              <p className="mt-5 max-w-xl text-lg text-background/75">
                Мы строим сообщество, где молодые люди Узбекистана учатся аргументировать, критически мыслить и уверенно говорить публично. Стартуем с университетов Бухары и идём к национальным дебатам на ТВ.
              </p>
            </div>
            <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-3 self-end">
              {[
                { n: "500+", l: "тренировок в неделю" },
                { n: "24/7", l: "AI-доступ" },
                { n: "3", l: "языка UI" },
                { n: "∞", l: "тем от AI" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="font-display text-3xl font-bold text-gradient-sunset">{s.n}</div>
                  <div className="mt-1 text-xs text-background/70">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — numbered broken grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-[11px] uppercase tracking-[0.2em] text-sunset-orange font-semibold">Как это работает</div>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">Три шага до первой победы.</h2>
        <div className="mt-12 grid grid-cols-12 gap-6">
          {[
            { n: "01", icon: Mic, title: "Готовишь речь", body: "Пиши сам или используй конструктор кейса AREA. AI-тьютор подскажет по ходу." },
            { n: "02", icon: Gavel, title: "AI-Судья оценивает", body: "Числовые баллы по 5 критериям, письменный ballot, точечные советы." },
            { n: "03", icon: Trophy, title: "Растёшь в кабинете", body: "Отслеживай сильные/слабые стороны и получай рекомендации, что тренировать дальше." },
          ].map((s, i) => (
            <div
              key={s.n}
              className={cn(
                "col-span-12 md:col-span-4 relative rounded-3xl border border-foreground/10 bg-card p-6 md:p-8 shadow-card transition-transform hover:-translate-y-1",
                i === 1 && "md:mt-10",
                i === 2 && "md:-mt-4",
              )}
            >
              <div className="absolute -top-4 -right-2 font-display text-[80px] font-bold leading-none text-transparent" style={{ WebkitTextStroke: "1.5px #ff6b3540" }}>
                {s.n}
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-sunset text-white shadow-glow">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-foreground/65">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-white p-8 md:p-14 shadow-card">
          <div aria-hidden className="absolute -top-40 -right-20 h-[420px] w-[420px] rounded-full gradient-sunset opacity-30 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                Готов к <span className="text-gradient-sunset">первому ballot?</span>
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                Зарегистрируйся — AI-судья сохранит оценки, покажет прогресс и подскажет следующий урок.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full h-12 px-6 gradient-sunset border-0 text-white shadow-glow">
                <Link to="/auth">{t("nav.signup")} <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6 border-foreground/20">
                <Link to="/judge">Попробовать без регистрации</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BentoCard({
  to, className, children, hue, big,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
  hue: "orange" | "magenta" | "violet" | "amber";
  big?: boolean;
}) {
  const glowMap = {
    orange: "hover:shadow-[0_20px_60px_-20px_#ff6b3555]",
    magenta: "hover:shadow-[0_20px_60px_-20px_#e8439355]",
    violet: "hover:shadow-[0_20px_60px_-20px_#6c5ce755]",
    amber: "hover:shadow-[0_20px_60px_-20px_#f7931e55]",
  };
  return (
    <Link
      to={to}
      className={cn(
        "group relative flex flex-col rounded-3xl border border-foreground/10 bg-card p-6 md:p-8 shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1",
        glowMap[hue],
        className,
      )}
    >
      {big && (
        <div aria-hidden className="absolute -bottom-24 -left-16 h-[300px] w-[300px] rounded-full bg-sunset-magenta/30 blur-3xl transition-opacity group-hover:opacity-80" />
      )}
      <div className="relative flex h-full flex-col">{children}</div>
    </Link>
  );
}

function FormatRow({
  n, audience, title, desc, to, hue,
}: { n: string; audience: string; title: string; desc: string; to: string; hue: "orange" | "violet" }) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative flex items-center gap-4 md:gap-6 rounded-3xl border border-foreground/10 bg-card p-5 md:p-7 shadow-card transition hover:-translate-y-0.5",
        hue === "orange" ? "hover:border-sunset-orange/40" : "hover:border-sunset-violet/40",
      )}
    >
      <div className={cn(
        "font-display text-4xl md:text-5xl font-bold leading-none",
        hue === "orange" ? "text-sunset-orange" : "text-sunset-violet",
      )}>{n}</div>
      <div className="flex-1 min-w-0">
        <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider">{audience}</Badge>
        <div className="mt-1.5 font-display text-xl md:text-2xl font-bold">{title}</div>
        <p className="mt-1 text-sm text-foreground/60 line-clamp-2">{desc}</p>
      </div>
      <ArrowUpRight className="h-6 w-6 shrink-0 text-foreground/40 transition group-hover:text-foreground group-hover:rotate-45" />
    </Link>
  );
}
