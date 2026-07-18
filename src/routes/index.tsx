import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { CountdownHero } from "@/components/home/CountdownHero";
import { LastWeekBanner } from "@/components/home/LastWeekBanner";
import { PrimaryActions } from "@/components/home/PrimaryActions";
import { MyRatingCard } from "@/components/home/MyRatingCard";
import { LiveNow } from "@/components/home/LiveNow";
import { WeekStrip } from "@/components/WeekStrip";
import { getStreak, type StreakInfo } from "@/lib/streak";
import { fetchCurrentWeek, fetchPreviousWeek, type DebateWeek } from "@/lib/debate-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Мезон — живые дебаты по правилам" },
      { name: "description", content: "Живые структурированные дебаты по правилам: 1×1, 2×2, круглый стол. Один День дебатов в неделю." },
    ],
  }),
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
  const [current, setCurrent] = useState<DebateWeek | null>(null);
  const [prev, setPrev] = useState<DebateWeek | null>(null);
  const [streak, setStreak] = useState<StreakInfo>({
    current: 0,
    longest: 0,
    weekDays: Array(7).fill(false),
  });

  useEffect(() => {
    fetchCurrentWeek().then(setCurrent);
    fetchPreviousWeek().then(setPrev);
    setStreak(getStreak());
  }, []);

  const revealed = !!(current?.topic && Date.now() >= new Date(current.topic_reveal_at).getTime());

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <CountdownHero week={current} />
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
      <LastWeekBanner week={prev} />
      <PrimaryActions />
      <MyRatingCard />
      <LiveNow weekTopicRevealed={revealed} weekTopic={current?.topic ?? null} />
    </div>
  );
}
