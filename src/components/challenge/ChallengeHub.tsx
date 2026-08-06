import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Swords, Clock, Check, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getDuelWindow } from "@/lib/duel.functions";
import {
  cancelChallenge,
  listMyChallenges,
  resolveMyName,
  respondToChallenge,
  sendChallenge,
  startChallengeDuel,
  type ChallengeRow,
  type LobbyPeer,
} from "@/lib/challenges";
import { OnlineNow } from "./OnlineNow";

type Win = Awaited<ReturnType<typeof getDuelWindow>>;

export function ChallengeHub({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [win, setWin] = useState<Win | null>(null);
  const [me, setMe] = useState<{ id: string; name: string; mastery: number; busy: boolean } | null>(null);
  const [rows, setRows] = useState<ChallengeRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    getDuelWindow().then(setWin).catch(() => setWin(null));
    const id = setInterval(() => {
      getDuelWindow().then(setWin).catch(() => {});
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    setRows(await listMyChallenges(user.id));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const [name, rating, duel] = await Promise.all([
        resolveMyName(user.id, user.email),
        supabase.from("player_ratings").select("mastery").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("duels")
          .select("id")
          .in("status", ["waiting", "live", "judging"])
          .or(`pro_user_id.eq.${user.id},con_user_id.eq.${user.id}`)
          .limit(1)
          .maybeSingle(),
      ]);
      if (!alive) return;
      setMe({ id: user.id, name, mastery: rating.data?.mastery ?? 1000, busy: !!duel.data });
    })();
    refresh();
    const channel = supabase
      .channel(`challenges-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "duel_challenges" }, () => refresh())
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  if (!user) return null;

  const weekId = win?.week_id ?? null;
  const revealed = !!win?.topic;
  const windowOpen = !!win?.open;

  const incoming = rows.filter((r) => r.to_user_id === user.id && r.status === "pending");
  const outgoing = rows.filter((r) => r.from_user_id === user.id && r.status === "pending");
  const accepted = rows.filter((r) => r.status === "accepted");
  const started = rows.filter((r) => r.status === "started");
  const pendingTo = outgoing.map((r) => r.to_user_id);

  const guarded = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    try {
      await fn();
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не получилось");
    } finally {
      setBusyId(null);
    }
  };

  const challenge = (peer: LobbyPeer) => {
    if (!weekId || !me) return;
    guarded(peer.user_id, async () => {
      await sendChallenge({
        weekId,
        fromUserId: me.id,
        fromName: me.name,
        toUserId: peer.user_id,
        toName: peer.name,
        kind: windowOpen ? "instant" : "scheduled",
      });
      toast.success(`Вызов отправлен: ${peer.name}`);
    });
  };

  const start = (row: ChallengeRow) =>
    guarded(row.id, async () => {
      const duelId = await startChallengeDuel(row.id);
      if (duelId) navigate({ to: "/duel" });
    });

  return (
    <section className="space-y-3">
      {!compact && (
        <div className="flex items-center gap-2 px-1">
          <Swords className="h-4 w-4 text-primary" />
          <h3 className="text-[15px] font-semibold">Вызовы</h3>
        </div>
      )}

      {!revealed && (
        <div className="rounded-[14px] hairline bg-white px-4 py-3 text-[12.5px] text-muted-foreground">
          Вызовы откроются, как только объявят тему недели.
        </div>
      )}

      {revealed && (incoming.length > 0 || outgoing.length > 0 || accepted.length > 0 || started.length > 0) && (
        <ul className="space-y-2">
          {started.map((r) => (
            <Row key={r.id} title={other(r, user.id)} note="Батл начался">
              <button
                onClick={() => navigate({ to: "/duel" })}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground"
              >
                В батл <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Row>
          ))}

          {incoming.map((r) => (
            <Row key={r.id} title={r.from_name} note="Бросил вам вызов">
              <button
                disabled={busyId === r.id}
                onClick={() => guarded(r.id, () => respondToChallenge(r.id, true))}
                className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
                aria-label="Принять"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => guarded(r.id, () => respondToChallenge(r.id, false))}
                className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground disabled:opacity-40"
                aria-label="Отклонить"
              >
                <X className="h-4 w-4" />
              </button>
            </Row>
          ))}

          {accepted.map((r) => (
            <Row
              key={r.id}
              title={other(r, user.id)}
              note={windowOpen ? "Вызов принят — можно начинать" : "Вызов принят · старт в День дебатов"}
            >
              {windowOpen ? (
                <button
                  disabled={busyId === r.id}
                  onClick={() => start(r)}
                  className="rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground disabled:opacity-40"
                >
                  Начать батл
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> ждём
                </span>
              )}
            </Row>
          ))}

          {outgoing.map((r) => (
            <Row key={r.id} title={r.to_name} note="Ждём ответа">
              <button
                disabled={busyId === r.id}
                onClick={() => guarded(r.id, () => cancelChallenge(r.id))}
                className="rounded-full bg-muted px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground disabled:opacity-40"
              >
                Отменить
              </button>
            </Row>
          ))}
        </ul>
      )}

      {revealed && windowOpen && (
        <OnlineNow me={me} onChallenge={challenge} pendingTo={pendingTo} />
      )}

      {revealed && !windowOpen && (
        <div className="rounded-[14px] hairline bg-white px-4 py-3 text-[12.5px] text-muted-foreground">
          Лобби «Свободны сейчас» откроется во время Дня дебатов. Сейчас можно бросить вызов через профиль игрока
          или таблицу рейтинга.
        </div>
      )}
    </section>
  );
}

function other(r: ChallengeRow, myId: string) {
  return r.from_user_id === myId ? r.to_name : r.from_name;
}

function Row({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-[14px] hairline bg-white px-3.5 py-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--color-ink)] text-[13px] font-semibold text-white">
        {title.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium">{title}</div>
        <div className="text-[11.5px] text-muted-foreground">{note}</div>
      </div>
      <div className="flex items-center gap-1.5">{children}</div>
    </li>
  );
}
