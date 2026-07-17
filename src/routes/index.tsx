import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Gavel,
  Library,
  MessagesSquare,
  Sparkles,
  Users,
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
        <div className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(1200px 500px at 80% -10%, oklch(0.72 0.19 40 / 0.25), transparent), radial-gradient(800px 400px at 0% 20%, oklch(0.55 0.19 265 / 0.18), transparent)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            <Sparkles className="mr-1.5 h-3 w-3" />
            {t("home.hero.badge")}
          </Badge>
          <h1 className="mt-5 max-w-3xl font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            {t("home.hero.title")}{" "}
            <span className="text-gradient-brand">Debate Club UZ</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t("home.hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/learn">
                {t("home.hero.ctaPrimary")}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/events">{t("home.hero.ctaSecondary")}</Link>
            </Button>
          </div>
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
          <h2 className="font-display text-3xl md:text-4xl font-bold">{t("home.mission.title")}</h2>
          <p className="mt-4 max-w-3xl text-lg text-white/80">{t("home.mission.body")}</p>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PillarCard icon={BookOpen} title={t("home.pillars.learn.title")} body={t("home.pillars.learn.body")} />
          <PillarCard icon={Library} title={t("home.pillars.motions.title")} body={t("home.pillars.motions.body")} />
          <PillarCard icon={MessagesSquare} title={t("home.pillars.practice.title")} body={t("home.pillars.practice.body")} />
          <PillarCard icon={Gavel} title={t("home.pillars.judges.title")} body={t("home.pillars.judges.body")} />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="rounded-3xl border bg-card p-8 md:p-14 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Debate Club Uzbekistan
            </div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">{t("home.cta.title")}</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">{t("home.cta.body")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/auth">{t("nav.signup")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/motions">{t("nav.motions")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FormatCard({
  audience, title, desc, to, cta, accent,
}: { audience: string; title: string; desc: string; to: string; cta: string; accent: "brand" | "accent" }) {
  return (
    <Card className="relative overflow-hidden p-8 shadow-card border-border/60">
      <div
        className="absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            accent === "brand"
              ? "oklch(0.72 0.19 40 / 0.7)"
              : "oklch(0.55 0.19 265 / 0.7)",
        }}
      />
      <Badge variant="outline" className="rounded-full">{audience}</Badge>
      <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
      <p className="mt-3 text-muted-foreground">{desc}</p>
      <Button asChild variant="link" className="mt-4 px-0">
        <Link to={to}>
          {cta} <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}

function PillarCard({
  icon: Icon, title, body,
}: { icon: typeof BookOpen; title: string; body: string }) {
  return (
    <Card className="p-6 border-border/60 shadow-card">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </Card>
  );
}
