import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, Users, Swords } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getDuelWindow } from "@/lib/duel.functions";
import { resolveMyName, sendChallenge } from "@/lib/challenges";

export const Route = createFileRoute("/ratings")({
  head: () => ({
    meta: [
      { title: "Рейтинг игроков и команд — Nuqta va Nazar" },
      {
        name: "description",
        content:
          "Таблица рейтинга дебатёров Nuqta va Nazar: очки мастерства, лига, динамика недели и вызовы на батл 1×1.",
      },
      { property: "og:title", content: "Рейтинг игроков и команд — Nuqta va Nazar" },
      {
        property: "og:description",
        content: "Кто сильнее на этой неделе: очки мастерства, лиги и тренд по итогам батлов.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RatingsPage,
});

const LEAGUE_LABEL: Record<string, string> = {
  zonal: "Зональная лига",
  republic: "Республиканская лига",
};

type Row = {
  user_id: string;
  display_name: string | null;
  mastery: number;
  mastery_trend_week: number;
  matches_played: number;
  league: string;
};

function RatingsPage() {
  const [tab, setTab] = useState<"players" | "teams">("players");

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <header className="px-1">
        <div className="formula-motif">Рейтинг</div>
        <h1 className="mt-1 font-display text-[26px] leading-tight">Кто сильнее в клубе</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Очки мастерства меняются после каждого батла: победа поднимает, поражение опускает.
        </p>
      </header>

      <div className="flex gap-1 rounded-full bg-muted p-1">
        <TabBtn active={tab === "players"} onClick={() => setTab("players")} icon={Trophy} label="Игроки" />
        <TabBtn active={tab === "teams"} onClick={() => setTab("teams")} icon={Users} label="Команды" />
      </div>

      {tab === "players" ? <PlayersTable /> : <TeamsPlaceholder />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Trophy;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-semibold transition-colors " +
        (active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PlayersTable() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [weekId, setWeekId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("player_ratings")
      .select("user_id, display_name, mastery, mastery_trend_week, matches_played, league")
      .order("mastery", { ascending: false })
      .limit(100)
      .then(({ data }) => setRows((data ?? []) as Row[]));
    getDuelWindow()
      .then((w) => {
        setWeekId(w.week_id);
        setRevealed(!!w.topic);
      })
      .catch(() => {});
  }, []);

  const challenge = async (row: Row) => {
    if (!user || !weekId) return;
    setSending(row.user_id);
    try {
      const myName = await resolveMyName(user.id, user.email);
      await sendChallenge({
        weekId,
        fromUserId: user.id,
        fromName: myName,
        toUserId: row.user_id,
        toName: row.display_name ?? "Спикер",
      });
      setSent((s) => [...s, row.user_id]);
      toast.success("Вызов отправлен");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не получилось");
    } finally {
      setSending(null);
    }
  };

  if (!rows) return <div className="h-40 rounded-[16px] hairline bg-white" />;

  if (rows.length === 0) {
    return (
      <div className="rounded-[16px] hairline bg-white p-5 text-center text-[13px] text-muted-foreground">
        Рейтинг пуст — он заполнится после первых батлов.
      </div>
    );
  }

  return (
    <>
      <ul className="overflow-hidden rounded-[16px] hairline bg-white">
        {rows.map((r, i) => {
          const isMe = user?.id === r.user_id;
          const trend = r.mastery_trend_week;
          const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
          const trendColor =
            trend > 0 ? "text-emerald-600" : trend < 0 ? "text-destructive" : "text-muted-foreground";
          const name = r.display_name ?? "Игрок";
          return (
            <li
              key={r.user_id}
              className={
                "flex items-center gap-3 border-b border-[color:var(--color-border)] px-3.5 py-3 last:border-b-0 " +
                (isMe ? "bg-primary/5" : "")
              }
            >
              <span className="w-6 shrink-0 text-center font-mono text-[12px] tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <Link
                to="/profile/$userId"
                params={{ userId: r.user_id }}
                className="flex min-w-0 flex-1 items-center gap-2.5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--color-ink)] text-[13px] font-semibold text-white">
                  {name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-medium">
                    {name}
                    {isMe && <span className="ml-1 text-[11px] text-primary">· вы</span>}
                  </span>
                  <span className="block text-[11.5px] text-muted-foreground">
                    {LEAGUE_LABEL[r.league] ?? r.league} · {r.matches_played} батлов
                  </span>
                </span>
              </Link>
              <div className="text-right">
                <div className="font-display text-[19px] leading-none tabular-nums">{r.mastery}</div>
                <div className={`flex items-center justify-end gap-0.5 text-[11px] font-medium ${trendColor}`}>
                  <TrendIcon className="h-3 w-3" />
                  <span className="font-mono tabular-nums">
                    {trend > 0 ? "+" : ""}
                    {trend}
                  </span>
                </div>
              </div>
              {user && !isMe && revealed && weekId && (
                <button
                  disabled={sending === r.user_id || sent.includes(r.user_id)}
                  onClick={() => challenge(r)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
                  aria-label={`Вызвать ${name}`}
                >
                  <Swords className="h-4 w-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {!revealed && (
        <p className="px-1 text-[12px] text-muted-foreground">
          Вызовы можно отправлять после объявления темы недели.
        </p>
      )}
    </>
  );
}

function TeamsPlaceholder() {
  return (
    <div className="rounded-[16px] hairline bg-white p-6 text-center">
      <Users className="mx-auto h-6 w-6 text-muted-foreground" />
      <div className="mt-2 text-[14px] font-semibold">Рейтинг команд скоро</div>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Таблица заполнится вместе с запуском батлов 2×2: команда получает общий рейтинг, а каждый спикер — свой.
      </p>
    </div>
  );
}
