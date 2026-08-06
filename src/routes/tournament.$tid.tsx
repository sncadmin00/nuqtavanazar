import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, Loader2, Swords, Trophy, Users, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { resolveMyName } from "@/lib/challenges";
import {
  getTournamentBundle,
  myEntityIds,
  registerForTournament,
  withdrawFromTournament,
} from "@/lib/tournaments";
import { startTournamentMatch } from "@/lib/tournaments.functions";
import {
  STAGE_LABEL,
  STATUS_LABEL,
  computeStandings,
  fmtTime,
  type Entrant,
  type TMatch,
  type Tournament,
} from "@/lib/tournament-utils";

export const Route = createFileRoute("/tournament/$tid")({
  head: () => ({
    meta: [
      { title: "Турнир — Nuqta va Nazar" },
      {
        name: "description",
        content: "Расписание, таблица кругового этапа и сетка плей-офф турнира Nuqta va Nazar.",
      },
      { property: "og:title", content: "Турнир — Nuqta va Nazar" },
      { property: "og:description", content: "Круговой этап, топ-8 и сетка на выбывание." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TournamentPage,
});

function TournamentPage() {
  const { tid } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [t, setT] = useState<Tournament | null>(null);
  const [entrants, setEntrants] = useState<Entrant[]>([]);
  const [matches, setMatches] = useState<TMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState<{ userId: string; teamId: string | null } | null>(null);
  const [tab, setTab] = useState<"schedule" | "table" | "bracket">("schedule");

  const load = useCallback(async () => {
    const b = await getTournamentBundle(tid);
    setT(b.tournament);
    setEntrants(b.entrants);
    setMatches(b.matches);
    setLoading(false);
  }, [tid]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`tournament-${tid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournament_matches", filter: `tournament_id=eq.${tid}` },
        () => load(),
      )
      .subscribe();
    const poll = setInterval(load, 15000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
    };
  }, [tid, load]);

  useEffect(() => {
    if (user) myEntityIds(user.id).then(setMine);
  }, [user]);

  const nameOf = useCallback(
    (id: string | null) => (id ? entrants.find((e) => e.id === id)?.display_name ?? "—" : "—"),
    [entrants],
  );

  const myEntrant = useMemo(() => {
    if (!mine || !t) return null;
    return (
      entrants.find((e) =>
        t.format === "2v2" ? e.team_id && e.team_id === mine.teamId : e.user_id === mine.userId,
      ) ?? null
    );
  }, [entrants, mine, t]);

  const standings = useMemo(() => computeStandings(entrants, matches), [entrants, matches]);
  const rr = matches.filter((m) => m.stage === "rr");
  const bracket = matches.filter((m) => m.stage !== "rr");

  const register = async () => {
    if (!user || !t) return;
    setBusy(true);
    try {
      const name = await resolveMyName(user.id, user.email);
      await registerForTournament(t, user.id, name);
      toast.success("Заявка принята");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Не удалось подать заявку");
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!myEntrant) return;
    setBusy(true);
    try {
      await withdrawFromTournament(myEntrant.id);
      toast.success("Заявка снята");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Не удалось снять заявку");
    } finally {
      setBusy(false);
    }
  };

  const enterMatch = async (m: TMatch) => {
    setBusy(true);
    try {
      await startTournamentMatch({ data: { match_id: m.id } });
      navigate({ to: "/duel" });
    } catch (e: any) {
      toast.error(e?.message ?? "Матч недоступен");
    } finally {
      setBusy(false);
    }
  };

  const isMyMatch = (m: TMatch) =>
    Boolean(myEntrant && (m.a_entrant_id === myEntrant.id || m.b_entrant_id === myEntrant.id));

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Загружаем…</div>;
  if (!t)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Турнир не найден.</p>
        <Link to="/tournaments" className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" /> Все турниры
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-5">
      <Link to="/tournaments" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Все турниры
      </Link>

      <header className="rounded-2xl border border-border/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="font-display text-[24px] leading-tight">{t.title}</h1>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
            {STATUS_LABEL[t.status] ?? t.status}
          </span>
        </div>
        {t.description && <p className="mt-2 text-[13px] text-muted-foreground">{t.description}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {t.format === "2v2" ? <Users className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            {t.format === "2v2" ? "Команды 2×2" : "Игроки 1×1"}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> День 1: {fmtTime(t.day1_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> День 2: {fmtTime(t.day2_at)}
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <TopicCard label="Тема дня 1 (круг)" topic={t.day1_topic} />
          <TopicCard label="Тема дня 2 (плей-офф)" topic={t.day2_topic} />
        </div>

        {user && (
          <div className="mt-4">
            {myEntrant ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px]">
                  Вы в списке: <strong>{myEntrant.display_name}</strong>
                </span>
                {t.status === "registration" && (
                  <button
                    onClick={withdraw}
                    disabled={busy}
                    className="rounded-full border border-border px-3 py-1.5 text-[12px]"
                  >
                    Снять заявку
                  </button>
                )}
              </div>
            ) : t.status === "registration" ? (
              <button
                onClick={register}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
                {t.format === "2v2" ? "Заявить команду" : "Участвовать"}
              </button>
            ) : (
              <p className="text-[12px] text-muted-foreground">Регистрация закрыта.</p>
            )}
          </div>
        )}
      </header>

      <div className="flex gap-1 rounded-full bg-muted p-1">
        <Tab active={tab === "schedule"} onClick={() => setTab("schedule")} label="Расписание" />
        <Tab active={tab === "table"} onClick={() => setTab("table")} label="Таблица" />
        <Tab active={tab === "bracket"} onClick={() => setTab("bracket")} label="Плей-офф" />
      </div>

      {tab === "schedule" && (
        <section className="space-y-3">
          {rr.length === 0 ? (
            <Empty text="Расписание кругового этапа появится после закрытия регистрации." />
          ) : (
            groupBy(rr, (m) => m.round_no).map(([round, list]) => (
              <div key={round} className="space-y-2">
                <h3 className="px-1 text-[12px] uppercase tracking-wide text-muted-foreground">Тур {round}</h3>
                {list.map((m) => (
                  <MatchRow
                    key={m.id}
                    m={m}
                    nameOf={nameOf}
                    mine={isMyMatch(m)}
                    busy={busy}
                    onEnter={() => enterMatch(m)}
                  />
                ))}
              </div>
            ))
          )}
          <div className="rounded-2xl border border-border/60 p-4">
            <h3 className="text-[12px] uppercase tracking-wide text-muted-foreground">Участники ({entrants.length})</h3>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {entrants.map((e) => (
                <li key={e.id} className="text-[13px]">
                  {e.seed ? <span className="text-muted-foreground">#{e.seed} </span> : null}
                  {e.display_name}
                </li>
              ))}
              {entrants.length === 0 && <li className="text-[13px] text-muted-foreground">Пока никого.</li>}
            </ul>
          </div>
        </section>
      )}

      {tab === "table" && (
        <section className="overflow-hidden rounded-2xl border border-border/60">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/60 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Участник</th>
                <th className="px-2 py-2">И</th>
                <th className="px-2 py-2">В</th>
                <th className="px-2 py-2">П</th>
                <th className="px-3 py-2 text-right">Баллы</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((r, i) => (
                <tr key={r.entrant_id} className={i < 8 ? "bg-primary/5" : ""}>
                  <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2">{nameOf(r.entrant_id)}</td>
                  <td className="px-2 py-2 text-center">{r.played}</td>
                  <td className="px-2 py-2 text-center font-medium">{r.wins}</td>
                  <td className="px-2 py-2 text-center">{r.losses}</td>
                  <td className="px-3 py-2 text-right">{r.points}</td>
                </tr>
              ))}
              {standings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    Пока нет данных.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
            Тайбрейк: победы → личная встреча → баллы AI-судьи. Топ-8 выделены и проходят в плей-офф.
          </p>
        </section>
      )}

      {tab === "bracket" && (
        <section className="space-y-3">
          {bracket.length === 0 ? (
            <Empty text="Сетка появится после завершения кругового этапа." />
          ) : (
            (["qf", "sf", "final"] as const).map((stage) => {
              const list = bracket.filter((m) => m.stage === stage);
              if (!list.length) return null;
              return (
                <div key={stage} className="space-y-2">
                  <h3 className="px-1 text-[12px] uppercase tracking-wide text-muted-foreground">
                    {STAGE_LABEL[stage]}
                  </h3>
                  {list.map((m) => (
                    <MatchRow
                      key={m.id}
                      m={m}
                      nameOf={nameOf}
                      mine={isMyMatch(m)}
                      busy={busy}
                      onEnter={() => enterMatch(m)}
                    />
                  ))}
                </div>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}

function TopicCard({ label, topic }: { label: string; topic: string | null }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-[13px]">{topic?.trim() || "Будет объявлена"}</div>
    </div>
  );
}

function MatchRow({
  m,
  nameOf,
  mine,
  busy,
  onEnter,
}: {
  m: TMatch;
  nameOf: (id: string | null) => string;
  mine: boolean;
  busy: boolean;
  onEnter: () => void;
}) {
  const finished = m.status === "finished";
  const ready = Boolean(m.a_entrant_id && m.b_entrant_id);
  const open = ready && !finished && (!m.scheduled_at || new Date(m.scheduled_at) <= new Date());

  return (
    <div className={`rounded-2xl border p-3 ${mine ? "border-primary/60" : "border-border/60"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[14px]">
            <span className={finished && m.winner_entrant_id === m.a_entrant_id ? "font-semibold" : ""}>
              {nameOf(m.a_entrant_id)}
            </span>
            <span className="mx-2 text-muted-foreground">vs</span>
            <span className={finished && m.winner_entrant_id === m.b_entrant_id ? "font-semibold" : ""}>
              {nameOf(m.b_entrant_id)}
            </span>
          </div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            {fmtTime(m.scheduled_at)}
            {finished && ` · ${m.a_points} : ${m.b_points}`}
          </div>
        </div>
        {finished ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" /> Сыгран
          </span>
        ) : mine && open ? (
          <button
            onClick={onEnter}
            disabled={busy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Swords className="h-3.5 w-3.5" />}
            В батл
          </button>
        ) : (
          <span className="shrink-0 text-[11.5px] text-muted-foreground">
            {ready ? "Ожидание" : "Соперники TBD"}
          </span>
        )}
      </div>
    </div>
  );
}

function Tab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active ? "bg-white shadow-sm" : "text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-border/60 p-6 text-[13px] text-muted-foreground">{text}</p>;
}

function groupBy<T>(items: T[], key: (i: T) => number): [number, T[]][] {
  const map = new Map<number, T[]>();
  for (const i of items) {
    const k = key(i);
    map.set(k, [...(map.get(k) ?? []), i]);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}
