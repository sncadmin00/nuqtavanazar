import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LESSONS } from "@/lib/lessons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Обучение дебатам — формат Мезон | Мезон" },
      { name: "description", content: "Структурированные уроки по формуле «идея → критерий → аргумент»: основы дебатов, формат Мезон, критерии судейства." },
      { property: "og:title", content: "Обучение — Мезон" },
      { property: "og:description", content: "Структурированные уроки по дебатам для школьников, студентов и взрослых." },
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
};

function LearnIndex() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">{t("learn.title")}</h1>
      <p className="mt-3 text-lg text-muted-foreground max-w-2xl">{t("learn.subtitle")}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {LESSONS.map((lesson) => (
          <Link key={lesson.id} to="/learn/$moduleId" params={{ moduleId: lesson.id }}>
            <Card className="group h-full p-6 border-border/60 shadow-card transition hover:border-primary/50 hover:shadow-glow">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="rounded-full">
                  {t("learn.module")} {lesson.order}
                </Badge>
                <Badge variant="outline" className="rounded-full">{trackLabels[lesson.track]}</Badge>
                <span className="ml-auto inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {lesson.minutes} {t("learn.minutes")}
                </span>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold">{lesson.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{lesson.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Открыть <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
