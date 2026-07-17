import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getLesson, type LessonBlock } from "@/lib/lessons";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/learn/$moduleId")({
  loader: ({ params }) => {
    const lesson = getLesson(params.moduleId);
    if (!lesson) throw notFound();
    return { lesson };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.lesson.title ?? "Урок";
    return {
      meta: [
        { title: `${title} | Debate Club UZ` },
        { name: "description", content: loaderData?.lesson.summary ?? "Урок по дебатам" },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData?.lesson.summary ?? "" },
      ],
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const { lesson } = Route.useLoaderData();
  const { t } = useI18n();
  const { user } = useAuth();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle()
      .then(({ data }) => setCompleted(!!data));
  }, [user, lesson.id]);

  const markComplete = async () => {
    if (!user) {
      toast.info("Войдите, чтобы сохранять прогресс");
      return;
    }
    const { error } = await supabase
      .from("lesson_progress")
      .upsert({ user_id: user.id, lesson_id: lesson.id });
    if (error) {
      toast.error(error.message);
      return;
    }
    setCompleted(true);
    toast.success(t("learn.completed"));
  };

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/learn">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> {t("learn.back")}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="rounded-full">
          {t("learn.module")} {lesson.order}
        </Badge>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {lesson.minutes} {t("learn.minutes")}
        </span>
      </div>

      <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold leading-tight">{lesson.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{lesson.summary}</p>

      <div className="prose-content mt-10 space-y-6">
        {lesson.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>

      <div className="mt-12 flex items-center gap-3 border-t pt-8">
        <Button size="lg" onClick={markComplete} disabled={completed} className="rounded-full">
          {completed ? (
            <>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> {t("learn.completed")}
            </>
          ) : (
            t("learn.markComplete")
          )}
        </Button>
      </div>
    </article>
  );
}

function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-base leading-7 text-foreground/90">{block.text}</p>;
    case "h2":
      return <h2 className="mt-10 font-display text-2xl font-bold">{block.text}</h2>;
    case "h3":
      return <h3 className="mt-6 font-display text-xl font-semibold">{block.text}</h3>;
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-6 text-foreground/90">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-2 pl-6 text-foreground/90">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ol>
      );
    case "callout":
      return (
        <aside className="rounded-2xl border-l-4 border-primary bg-primary/5 p-5">
          <div className="font-semibold text-foreground">{block.title}</div>
          <div className="mt-1 text-sm text-foreground/80">{block.text}</div>
        </aside>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-t">
                  {r.map((c, j) => (
                    <td key={j} className="px-3 py-2 align-top">{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
