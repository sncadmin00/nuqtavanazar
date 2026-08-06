import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings, LogOut, Flame } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { fetchTopRatings } from "@/lib/debate-data";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getStreak, type StreakInfo } from "@/lib/streak";
import {
  Avatar,
  AchievementsCard,
  BattleHistoryCard,
  TeamHistoryCard,
} from "@/components/profile/ProfileSections";


export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Профиль — Nuqta va Nazar" },
      { name: "description", content: "Ваш рейтинг, лига, результаты и настройки." },
    ],
  }),
  component: ProfilePage,
});

const LEAGUE_LABEL: Record<string, string> = {
  zonal: "Зональная лига",
  republic: "Республиканская лига",
};

type Rating = {
  user_id: string;
  mastery: number;
  mastery_trend_week: number;
  knock: number;
  moderator: number;
  matches_played: number;
  league: string;
  display_name: string | null;
};

function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const [me, setMe] = useState<Rating | null>(null);
  const [top, setTop] = useState<Awaited<ReturnType<typeof fetchTopRatings>>>([]);
  const [tab, setTab] = useState<"mastery" | "knock" | "moderator">("mastery");
  const [streak, setStreak] = useState<StreakInfo>({ current: 0, longest: 0, weekDays: Array(7).fill(false) });

  useEffect(() => {
    fetchTopRatings(20).then(setTop);
    setStreak(getStreak());
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("player_ratings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) {
          const display = user.email?.split("@")[0] ?? "Игрок";
          await supabase.from("player_ratings").insert({ user_id: user.id, display_name: display });
          setMe({
            user_id: user.id,
            mastery: 1000,
            mastery_trend_week: 0,
            knock: 0,
            moderator: 0,
            matches_played: 0,
            league: "zonal",
            display_name: display,
          });
        } else {
          setMe(data as Rating);
        }
      });
  }, [user]);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted-foreground">…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <h1 className="text-xl font-semibold">Войдите, чтобы играть</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Рейтинг, история баттлов, круглые столы — всё в личном кабинете.
        </p>
        <Link to="/auth" className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
          Войти
        </Link>
      </div>
    );
  }

  const name = me?.display_name || (user.email?.split("@")[0] ?? "Игрок");
  const sortedTop = [...top].sort((a, b) => {
    const av = tab === "mastery" ? a.mastery : 0;
    const bv = tab === "mastery" ? b.mastery : 0;
    return bv - av;
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--color-ink)] text-lg font-semibold text-white">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-[17px] font-semibold leading-tight">{name}</div>
            <div className="mt-0.5 text-[12.5px] text-muted-foreground">
              {LEAGUE_LABEL[me?.league ?? "zonal"]}
            </div>
          </div>
        </div>
        <button
          onClick={() => document.getElementById("settings-sheet")?.scrollIntoView({ behavior: "smooth" })}
          className="grid h-9 w-9 place-items-center rounded-full hairline bg-white"
          aria-label="Настройки"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* 3 stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Мастерство" value={me?.mastery ?? 1000} accent />
        <Stat label="Тук" value={me?.knock ?? 0} />
        <Stat label="Модератор" value={me?.moderator ? me.moderator : null} />
      </div>

      {/* Training streak */}
      <section className="flex items-center gap-3 rounded-[16px] hairline bg-white p-4">
        <span className={"grid h-11 w-11 place-items-center rounded-full " + (streak.current > 0 ? "bg-primary/15" : "bg-muted")}>
          <Flame className={"h-5 w-5 " + (streak.current > 0 ? "text-primary" : "text-muted-foreground")} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold leading-tight">
            {streak.current > 0 ? `Серия тренировок: ${streak.current}` : "Серия пока не начата"}
          </div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            Лучшая серия: {streak.longest} · На этой неделе: {streak.weekDays.filter(Boolean).length}/7
          </div>
        </div>
        <Link to="/training" className="text-[12.5px] font-semibold text-primary">
          Тренировка →
        </Link>
      </section>

      <AchievementsCard userId={user.id} teamIds={teamIds} />
      <TeamHistoryCard userId={user.id} onTeams={setTeamIds} />
      <BattleHistoryCard userId={user.id} />


      {/* Tabs */}
      <div className="flex gap-1 rounded-full hairline bg-white p-1">
        {(["mastery", "knock", "moderator"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-1.5 text-[12.5px] font-medium transition-colors ${
              tab === t ? "bg-[color:var(--color-ink)] text-white" : "text-muted-foreground"
            }`}
          >
            {t === "mastery" ? "Мастерство" : t === "knock" ? "Тук" : "Модератор"}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <section className="rounded-[16px] hairline bg-white p-4">
        <div className="formula-motif !text-foreground/70">Лидеры лиги</div>
        <ul className="mt-2 divide-y divide-[color:var(--color-border)]">
          {sortedTop.slice(0, 8).map((p, i) => {
            const isMe = p.user_id === user.id;
            return (
              <li key={p.user_id} className={`flex items-center gap-3 py-2.5 -mx-4 px-4 ${isMe ? "bg-primary/10" : ""}`}>
                <span className="w-5 font-mono text-[12px] tabular-nums text-muted-foreground">{i + 1}</span>
                {isMe ? (
                  <span className="flex flex-1 items-center gap-3 min-w-0">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-ink)] text-[11px] font-semibold text-white">
                      {(p.display_name ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="flex-1 truncate text-[13.5px] font-medium">
                      {p.display_name ?? "Игрок"}
                      <span className="ml-1.5 text-[10.5px] uppercase text-primary">вы</span>
                    </span>
                  </span>
                ) : (
                  <Link
                    to="/profile/$userId"
                    params={{ userId: p.user_id }}
                    className="flex flex-1 items-center gap-3 min-w-0"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-ink)] text-[11px] font-semibold text-white">
                      {(p.display_name ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="flex-1 truncate text-[13.5px] font-medium">
                      {p.display_name ?? "Игрок"}
                    </span>
                  </Link>
                )}
                <span className="font-mono text-[13px] tabular-nums">{p.mastery}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 text-[12.5px] font-medium text-primary">Вся лига →</div>
      </section>

      {/* Settings */}
      <section id="settings-sheet" className="rounded-[16px] hairline bg-white p-4 space-y-3">
        <div className="formula-motif !text-foreground/70">Настройки</div>
        <div className="flex items-center justify-between">
          <span className="text-[13.5px]">Язык интерфейса</span>
          <LanguageSwitcher />
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-full hairline bg-white py-2.5 text-[13.5px] font-medium text-destructive"
        >
          <LogOut className="h-4 w-4" /> Выйти
        </button>
      </section>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number | null; accent?: boolean }) {
  return (
    <div className={`rounded-[14px] p-3 text-center ${accent ? "bg-primary/10" : "hairline bg-white"}`}>
      <div className={`font-display text-[26px] leading-none tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>
        {value == null ? "—" : value}
      </div>
      <div className="mt-1 text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
