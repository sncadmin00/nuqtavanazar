import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CountdownHero } from "@/components/home/CountdownHero";
import { LastWeekBanner } from "@/components/home/LastWeekBanner";
import { PrimaryActions } from "@/components/home/PrimaryActions";
import { MyRatingCard } from "@/components/home/MyRatingCard";
import { LiveNow } from "@/components/home/LiveNow";
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

function HomePage() {
  const [current, setCurrent] = useState<DebateWeek | null>(null);
  const [prev, setPrev] = useState<DebateWeek | null>(null);

  useEffect(() => {
    fetchCurrentWeek().then(setCurrent);
    fetchPreviousWeek().then(setPrev);
  }, []);

  const revealed = !!(current?.topic && Date.now() >= new Date(current.topic_reveal_at).getTime());

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <CountdownHero week={current} />
      <LastWeekBanner week={prev} />
      <PrimaryActions />
      <MyRatingCard />
      <LiveNow weekTopicRevealed={revealed} weekTopic={current?.topic ?? null} />
    </div>
  );
}
