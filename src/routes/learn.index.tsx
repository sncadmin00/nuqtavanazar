import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LESSONS, type LessonCategory } from "@/lib/lessons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Обучение дебатам — формат Мезон | Мезон" },
      { name: "description", content: "Уроки Мезон: как собрать кейс (идея → критерий → аргумент) и как говорить уверенно в аудио-раунде." },
      { property: "og:title", content: "Обучение — Мезон" },
      { property: "og:description", content: "Структурированные уроки по дебатам и ораторскому искусству." },
    ],
  }),
  component: LearnIndex,
});

const trackLabels: Record<string, string> = {
  basics: "Основы",
  solo: "Соло",
  duel: "1×1",
  team: "2×2",
  roundtable: "Круглый стол",
  judging: "Судейство",
  speaking: "Речь",
};

const categoryMeta: Record<LessonCategory, { title: string; subtitle: string }> = {
  case: {
    title: "Как составить кейс",
    subtitle: "Формула Мезон: идея → критерий → аргумент.",
  },
  speaking: {
    title: "Ораторское искусство",
    subtitle: "Как говорить уверенно, когда вас только слышат.",
  },
};

function LearnIndex() {
  const { t } = useI18n();
  const categories: LessonCategory[] = ["case", "speaking"];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">{t("learn.title")}</h1>
      <p className="mt-3 text-lg text-muted-foreground max-w-2xl">{t("learn.subtitle")}</p>

      {categories.map((cat) => {
        const lessons = LESSONS.filter((l) => l.category === cat);
        if (!lessons.length) return null;
        const hasNew = lessons.some((l) => l.isNew);
        const meta = categoryMeta[cat];
        return (
          <section key={cat} className="mt-12">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl md:text-3xl font-semibold">{meta.title}</h2>
              {hasNew && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3 w-3" /> Новое
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{meta.subtitle}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {lessons.map((lesson) => (
                <Link key={lesson.id} to="/learn/$moduleId" params={{ moduleId: lesson.id }}>
                  <Card className="group h-full p-6 border-border/60 shadow-card transition hover:border-primary/50 hover:shadow-glow">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="rounded-full">
                        {t("learn.module")} {lesson.order}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">{trackLabels[lesson.track]}</Badge>
                      {lesson.isNew && (
                        <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/20">Новое</Badge>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {lesson.minutes} {t("learn.minutes")}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold">{lesson.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{lesson.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Открыть <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
