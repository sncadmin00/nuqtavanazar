import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { CountdownHero } from "@/components/home/CountdownHero";
import { PrimaryActions } from "@/components/home/PrimaryActions";
import { MyRatingCard } from "@/components/home/MyRatingCard";
import { MatchesStatus } from "@/components/home/MatchesStatus";
import { RoundtableCard } from "@/components/home/RoundtableCard";
import { PrevWeekResultCard } from "@/components/home/discussion/PrevWeekResultCard";
import { IdeaClash } from "@/components/home/discussion/IdeaClash";
import { TopQuotesCarousel } from "@/components/home/discussion/TopQuotesCarousel";
import { FeaturedSpeakers } from "@/components/home/discussion/FeaturedSpeakers";
import { RetroPoll } from "@/components/home/discussion/RetroPoll";
import { WeekRankingFull } from "@/components/home/discussion/WeekRankingFull";
import { WeekStrip } from "@/components/WeekStrip";
import { getStreak, type StreakInfo } from "@/lib/streak";
import { getHomeState, type HomeState } from "@/lib/home.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Мезон — живые дебаты по правилам" },
      { name: "description", content: "Живые структурированные дебаты по правилам: 1×1, 2×2, круглый стол. Один День дебатов в неделю." },
    ],
  }),
  loader: () => getHomeState(),
  component: HomePage,
});

function dayWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return "дней";
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дня";
  return "дней";
}

function HomePage() {
  const state = Route.useLoaderData() as HomeState;
  const [streak, setStreak] = useState<StreakInfo>({
    current: 0,
    longest: 0,
    weekDays: Array(7).fill(false),
  });
  useEffect(() => {
    setStreak(getStreak());
  }, []);

  const revealed = !!state.current_week?.topic;

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <CountdownHero week={state.current_week} />

      <Link
        to="/training"
        className="block rounded-[16px] hairline bg-white p-4 active:scale-[0.99]"
      >
        <div className="flex items-center justify-between">
          <div className="formula-motif !text-foreground/70">Тренировка</div>
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold " +
              (streak.current > 0
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground")
            }
          >
            <Flame className="h-3.5 w-3.5" />
            {streak.current > 0
              ? `${streak.current} ${dayWord(streak.current)} подряд`
              : "Серии пока нет"}
          </span>
        </div>
        <div className="mt-3">
          <WeekStrip days={streak.weekDays} tone="light" />
        </div>
      </Link>

      <PrimaryActions />
      <MyRatingCard />

      {state.phase === "game_day" ? (
        <>
          <MatchesStatus matches={state.matches} revealed={revealed} />
          <RoundtableCard state={state.roundtable} />
        </>
      ) : (
        <DiscussionMode state={state} />
      )}
    </div>
  );
}

function DiscussionMode({ state }: { state: HomeState }) {
  const prev = state.previous_week;
  const d = state.discussion;
  return (
    <>
      {prev && <PrevWeekResultCard week={prev} />}
      {d && <IdeaClash pro={d.arguments_pro} con={d.arguments_con} />}
      {d && <TopQuotesCarousel quotes={d.quotes} />}
      {d && <FeaturedSpeakers items={d.featured} />}
      {d && prev && <RetroPoll weekId={prev.id} initial={d.poll} />}
      <RoundtableCard state={state.roundtable} />
      {d && <WeekRankingFull rows={d.ranking} />}
      <MatchesStatus matches={state.matches} revealed={!!state.current_week?.topic} />
    </>
  );
}
