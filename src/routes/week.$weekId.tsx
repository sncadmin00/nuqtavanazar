import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PrevWeekResultCard } from "@/components/home/discussion/PrevWeekResultCard";
import { IdeaClash } from "@/components/home/discussion/IdeaClash";
import { TopQuotesCarousel } from "@/components/home/discussion/TopQuotesCarousel";
import { FeaturedSpeakers } from "@/components/home/discussion/FeaturedSpeakers";
import { RetroPoll } from "@/components/home/discussion/RetroPoll";
import { WeekRankingFull } from "@/components/home/discussion/WeekRankingFull";
import { VoiceOfTheWeek } from "@/components/home/discussion/VoiceOfTheWeek";
import { RoundtableCard } from "@/components/home/RoundtableCard";
import { getArchivedWeek, type ArchivedWeekState } from "@/lib/home.functions";

export const Route = createFileRoute("/week/$weekId")({
  head: ({ loaderData }) => {
    const topic = (loaderData as ArchivedWeekState | undefined)?.week?.topic;
    return {
      meta: [
        { title: topic ? `${topic} — Nuqta va Nazar` : "Итоги недели — Nuqta va Nazar" },
        { name: "description", content: topic ?? "Итоги завершённой недели дебатов." },
      ],
    };
  },
  loader: async ({ params }) => {
    const state = await getArchivedWeek({ data: { week_id: params.weekId } });
    if (!state) throw notFound();
    return state;
  },
  component: WeekPage,
  notFoundComponent: WeekNotFound,
});

function WeekNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-center">
      <p className="text-[14px] text-muted-foreground">Такой недели пока нет в архиве.</p>
      <Link to="/" className="mt-4 inline-block text-[13px] font-semibold text-primary">← На главную</Link>
    </div>
  );
}

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
function fmtWeek(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function WeekPage() {
  const state = Route.useLoaderData() as ArchivedWeekState;
  const router = useRouter();
  const { week, discussion, roundtable, prev_week_id, next_week_id } = state;

  const goPrev = () => prev_week_id && router.navigate({ to: "/week/$weekId", params: { weekId: prev_week_id } });
  const goNext = () => next_week_id && router.navigate({ to: "/week/$weekId", params: { weekId: next_week_id } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={!prev_week_id}
          aria-label="Предыдущая неделя"
          className="grid h-9 w-9 place-items-center rounded-full hairline bg-white text-foreground disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 text-center">
          <div className="formula-motif">Неделя</div>
          <div className="mt-0.5 font-mono text-[12px] tabular-nums text-foreground">
            с {fmtWeek(week.week_start)}
          </div>
        </div>
        <button
          onClick={goNext}
          disabled={!next_week_id}
          aria-label="Следующая неделя"
          className="grid h-9 w-9 place-items-center rounded-full hairline bg-white text-foreground disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <PrevWeekResultCard week={week} />

      <IdeaClash pro={discussion.arguments_pro} con={discussion.arguments_con} />

      <VoiceOfTheWeek weekId={discussion.voice_week_id} initial={discussion.voice_notes} />

      <RetroPoll weekId={week.id} initial={discussion.poll} />

      <TopQuotesCarousel quotes={discussion.quotes} />

      <FeaturedSpeakers items={discussion.featured} />

      {week.ai_summary && (
        <section className="rounded-[16px] hairline bg-white p-4">
          <h3 className="text-[15px] font-semibold">AI-обзор недели</h3>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground/85">
            {week.ai_summary}
          </p>
        </section>
      )}

      <WeekRankingFull rows={discussion.ranking} />

      <RoundtableCard state={roundtable} />
    </div>
  );
}
