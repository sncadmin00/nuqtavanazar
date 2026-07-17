import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, BookOpen, Gavel, Library, MessagesSquare, Sparkles,
  Swords, Bot, Zap, Shuffle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(1200px 500px at 80% -10%, oklch(0.72 0.19 40 / 0.28), transparent), radial-gradient(800px 400px at 0% 20%, oklch(0.55 0.19 265 / 0.2), transparent)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-16 md:pt-20 md:pb-24">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            <Sparkles className="mr-1.5 h-3 w-3" />
            AI-платформа для тренировки дебатов · Бухара → Узбекистан
          </Badge>
          <h1 className="mt-5 max-w-4xl font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            Тренируй дебаты с{" "}
            <span className="text-gradient-brand">AI-тьютором, AI-судьёй</span>
            {" "}и AI-оппонентом
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Debate Club Uzbekistan — не сайт с теорией. Это интерактивная AI-платформа: спрашивай тьютора, оценивай свою речь у AI-судьи и веди живой спарринг с AI-оппонентом по любой теме.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/judge">
                <Gavel className="mr-1.5 h-4 w-4" />
                Оценить речь у AI-судьи
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/tutor">
                <Bot className="mr-1.5 h-4 w-4" />
                Спросить AI-тьютора
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <AICard
            icon={Bot}
            title="AI-Тьютор"
            desc="Диалог с AI-наставником по любому вопросу о дебатах — теория, форматы, примеры."
            to="/tutor"
            cta="Начать диалог"
          />
          <AICard
            icon={Gavel}
            title="AI-Судья"
            desc="Вставь речь — получи ballot: оценки по 5 критериям и развёрнутый фидбек как от судьи."
            to="/judge"
            cta="Оценить речь"
            highlight
          />
          <AICard
            icon={Swords}
            title="AI-Спарринг"
            desc="Живой обмен аргументами с AI-оппонентом. Выбери сторону — AI возьмёт противоположную."
            to="/sparring"
            cta="Начать спарринг"
          />
          <AICard
            icon={Shuffle}
            title="AI-Генератор тем"
            desc="Свежая тема по любой категории с пояснением, за что зацепиться про и контра."
            to="/motions"
            cta="Сгенерировать"
          />
        </div>
      </section>

      {/* FORMATS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold">{t("home.formats.title")}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <FormatCard
            audience={t("home.formats.kp.audience")}
            title={t("home.formats.kp.title")}
            desc={t("home.formats.kp.desc")}
            to="/learn/karl-popper-format"
            cta={t("home.formats.learnMore")}
            accent="brand"
          />
          <FormatCard
            audience={t("home.formats.ap.audience")}
            title={t("home.formats.ap.title")}
            desc={t("home.formats.ap.desc")}
            to="/learn/parliamentary-format"
            cta={t("home.formats.learnMore")}
            accent="accent"
          />
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="rounded-3xl gradient-ink p-8 md:p-14 text-white shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
            <Zap className="h-3 w-3" /> Активное обучение вместо пассивного чтения
          </div>
          <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold">{t("home.mission.title")}</h2>
          <p className="mt-4 max-w-3xl text-lg text-white/80">{t("home.mission.body")}</p>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Классические инструменты клуба</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PillarCard icon={BookOpen} title={t("home.pillars.learn.title")} body={t("home.pillars.learn.body")} to="/learn" />
          <PillarCard icon={Library} title={t("home.pillars.motions.title")} body={t("home.pillars.motions.body")} to="/motions" />
          <PillarCard icon={MessagesSquare} title={t("home.pillars.practice.title")} body={t("home.pillars.practice.body")} to="/practice" />
          <PillarCard icon={Gavel} title={t("home.pillars.judges.title")} body={t("home.pillars.judges.body")} to="/judges" />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="rounded-3xl border bg-card p-8 md:p-14 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t("home.cta.title")}</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">Зарегистрируйся, чтобы AI-судья сохранял оценки и показывал твой прогресс.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/auth">{t("nav.signup")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/tutor">Спросить AI</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AICard({
  icon: Icon, title, desc, to, cta, highlight,
}: { icon: typeof Bot; title: string; desc: string; to: string; cta: string; highlight?: boolean }) {
  return (
    <Card className={cn_local(
      "group relative overflow-hidden p-6 shadow-card transition-all hover:shadow-glow hover:-translate-y-0.5",
      highlight ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent" : "border-border/60",
    )}>
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-brand-foreground shadow-glow">
          <Icon className="h-5 w-5" />
        </span>
        <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wide">
          <Sparkles className="mr-1 h-2.5 w-2.5" />AI
        </Badge>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
}

function FormatCard({
  audience, title, desc, to, cta, accent,
}: { audience: string; title: string; desc: string; to: string; cta: string; accent: "brand" | "accent" }) {
  return (
    <Card className="relative overflow-hidden p-8 shadow-card border-border/60">
      <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-40 blur-3xl"
        style={{ background: accent === "brand" ? "oklch(0.72 0.19 40 / 0.7)" : "oklch(0.55 0.19 265 / 0.7)" }} />
      <Badge variant="outline" className="rounded-full">{audience}</Badge>
      <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
      <p className="mt-3 text-muted-foreground">{desc}</p>
      <Button asChild variant="link" className="mt-4 px-0">
        <Link to={to}>{cta} <ArrowRight className="ml-1 h-4 w-4" /></Link>
      </Button>
    </Card>
  );
}

function PillarCard({
  icon: Icon, title, body, to,
}: { icon: typeof BookOpen; title: string; body: string; to: string }) {
  return (
    <Link to={to}>
      <Card className="p-6 border-border/60 shadow-card h-full hover:border-primary/40 transition-colors">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      </Card>
    </Link>
  );
}

function cn_local(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
