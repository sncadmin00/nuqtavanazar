import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Dice5, Gavel, Loader2, Send, Swords, Trophy, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { generateMotion } from "@/lib/ai.functions";
import { findOrCreateDuel, cancelDuel, submitDuelTurn, finishDuel } from "@/lib/duel.functions";
import {
  TOTAL_TURNS,
  TURN_SECONDS,
  MIN_TURN_CHARS,
  MAX_TURN_CHARS,
  TURN_LABELS_RU,
  sideForTurn,
} from "@/lib/duel-config";

export const Route = createFileRoute("/duel")({
  head: () => ({
    meta: [
      { title: "Живой батл 1×1 — Nuqta va Nazar" },
      {
        name: "description",
        content:
          "Найди живого соперника и проведи структурированный раунд 1×1: шесть ходов по очереди, решение AI-судьи и рейтинг Elo.",
      },
      { property: "og:title", content: "Живой батл 1×1 — Nuqta va Nazar" },
      {
        property: "og:description",
        content: "Раунд 1×1 с живым соперником, таймером ходов и решением AI-судьи.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DuelPage,
});

type Duel = {
  id: string;
  motion: string;
  status: string;
  pro_user_id: string;
  con_user_id: string | null;
  pro_name: string;
  con_name: string | null;
  turn_index: number;
  turn_user_id: string | null;
  turn_ends_at: string | null;
  verdict: any;
  winner_user_id: string | null;
};

type Turn = { id: string; idx: number; side: string; text: string; user_id: string };

function DuelPage() {
  const { user, loading } = useAuth();
  const [duelId, setDuelId] = useState<string | null>(null);
  const [duel, setDuel] = useState<Duel | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [motion, setMotion] = useState("");
  const [busy, setBusy] = useState(false);
  const [dicing, setDicing] = useState(false);
  const [text, setText] = useState("");
  const judgingRef = useRef(false);

  const load = useCallback(async (id: string) => {
    const [{ data: d }, { data: t }] = await Promise.all([
      supabase.from("duels").select("*").eq("id", id).maybeSingle(),
      supabase.from("duel_turns").select("id, idx, side, text, user_id").eq("duel_id", id).order("idx"),
    ]);
    if (d) setDuel(d as Duel);
    setTurns((t ?? []) as Turn[]);
  }, []);

  // восстановить активную дуэль
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("duels")
        .select("id")
        .in("status", ["waiting", "live", "judging"])
        .or(`pro_user_id.eq.${user.id},con_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setDuelId(data.id);
        load(data.id);
      }
    })();
  }, [user, load]);

  // realtime
  useEffect(() => {
    if (!duelId) return;
    load(duelId);
    const channel = supabase
      .channel(`duel-${duelId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "duels", filter: `id=eq.${duelId}` }, () =>
        load(duelId),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "duel_turns", filter: `duel_id=eq.${duelId}` },
        () => load(duelId),
      )
      .subscribe();
    const poll = setInterval(() => load(duelId), 5000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [duelId, load]);

  // авто-судейство
  useEffect(() => {
    if (!duel || duel.status !== "judging" || judgingRef.current) return;
    judgingRef.current = true;
    finishDuel({ data: { duel_id: duel.id } })
      .then(() => load(duel.id))
      .catch((e: any) => toast.error(e?.message ?? "Судья недоступен"))
      .finally(() => {
        judgingRef.current = false;
      });
  }, [duel, load]);

  const rollDice = async () => {
    setDicing(true);
    try {
      const res = await generateMotion({ data: { difficulty: "medium" } });
      setMotion(res.motion);
    } catch (e: any) {
      toast.error(e?.message ?? "Не удалось сгенерировать тему");
    } finally {
      setDicing(false);
    }
  };

  const search = async () => {
    setBusy(true);
    try {
      const res = await findOrCreateDuel({ data: { motion: motion.trim() } });
      setDuelId(res.duel_id);
      toast.success(res.matched ? "Соперник найден — раунд начался!" : "Ждём соперника…");
    } catch (e: any) {
      toast.error(e?.message ?? "Не получилось начать поиск");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!duel) return;
    setBusy(true);
    try {
      await cancelDuel({ data: { duel_id: duel.id } });
      setDuelId(null);
      setDuel(null);
      setTurns([]);
    } catch (e: any) {
      toast.error(e?.message ?? "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!duel) return;
    setBusy(true);
    try {
      await submitDuelTurn({ data: { duel_id: duel.id, text: text.trim() } });
      setText("");
      await load(duel.id);
    } catch (e: any) {
      toast.error(e?.message ?? "Не удалось отправить реплику");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Shell><div className="p-6 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div></Shell>;
  }

  if (!user) {
    return (
      <Shell>
        <div className="rounded-[16px] hairline bg-white p-5 text-center">
          <Swords className="mx-auto h-7 w-7 text-primary" />
          <h2 className="mt-2 font-display text-[20px]">Живой батл 1×1</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Чтобы искать соперника и получать рейтинг, войдите в аккаунт.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-flex rounded-[12px] bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground"
          >
            Войти
          </Link>
        </div>
      </Shell>
    );
  }

  // ЛОББИ
  if (!duel || duel.status === "cancelled") {
    return (
      <Shell>
        <div className="rounded-[16px] hairline bg-white p-4">
          <div className="flex items-center gap-2">
            <Swords className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-display text-[19px]">Найти соперника</h2>
          </div>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Шесть ходов по очереди, {TURN_SECONDS} секунд на реплику. В конце — решение AI-судьи и очки Elo.
          </p>
          <textarea
            value={motion}
            onChange={(e) => setMotion(e.target.value)}
            rows={3}
            placeholder="Эта палата…"
            className="mt-3 w-full resize-none rounded-[12px] hairline bg-background p-3 text-[14px] outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={rollDice}
              disabled={dicing}
              className="flex items-center justify-center gap-1.5 rounded-[12px] hairline bg-background px-3 py-2.5 text-[13px] font-semibold"
            >
              {dicing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dice5 className="h-4 w-4" />}
              Кубик
            </button>
            <button
              onClick={search}
              disabled={busy || motion.trim().length < 8}
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-primary py-2.5 text-[14px] font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Искать соперника
            </button>
          </div>
          <p className="mt-2 text-[11.5px] text-muted-foreground">
            Если кто-то уже ждёт — вы попадёте в его раунд стороной «Против». Если нет — ваша тема встанет в очередь, а вы будете «За».
          </p>
        </div>
      </Shell>
    );
  }

  const isPro = duel.pro_user_id === user.id;
  const mySide: "pro" | "con" = isPro ? "pro" : "con";
  const myTurn = duel.status === "live" && duel.turn_user_id === user.id;

  // ОЖИДАНИЕ
  if (duel.status === "waiting") {
    return (
      <Shell>
        <div className="rounded-[16px] hairline bg-white p-5 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <h2 className="mt-3 font-display text-[19px]">Ищем соперника…</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">«{duel.motion}»</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Ваша сторона: За</p>
          <button
            onClick={cancel}
            disabled={busy}
            className="mt-4 rounded-[12px] hairline bg-background px-4 py-2 text-[13px] font-semibold"
          >
            Отменить
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="rounded-[16px] hairline bg-white p-4">
        <div className="flex items-center justify-between text-[11.5px] uppercase tracking-wide text-muted-foreground">
          <span>Раунд 1×1</span>
          <span>
            ход {Math.min(duel.turn_index, TOTAL_TURNS)} / {TOTAL_TURNS}
          </span>
        </div>
        <h2 className="mt-1.5 font-display text-[18px] leading-snug">{duel.motion}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <PlayerChip name={duel.pro_name} label="За" active={duel.turn_user_id === duel.pro_user_id} me={isPro} />
          <PlayerChip
            name={duel.con_name ?? "—"}
            label="Против"
            active={duel.turn_user_id === duel.con_user_id}
            me={!isPro}
          />
        </div>
        {duel.status === "live" && (
          <TurnTimer endsAt={duel.turn_ends_at} myTurn={myTurn} idx={duel.turn_index} />
        )}
      </div>

      <div className="mt-3 space-y-2.5">
        {turns.map((t) => (
          <div
            key={t.id}
            className={`rounded-[14px] hairline p-3.5 ${t.side === mySide ? "bg-white" : "bg-background"}`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              {TURN_LABELS_RU[t.idx - 1] ?? `Ход ${t.idx}`}
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed">{t.text}</p>
          </div>
        ))}
        {turns.length === 0 && (
          <p className="px-1 text-[13px] text-muted-foreground">Раунд начался. Первым говорит сторона «За».</p>
        )}
      </div>

      {duel.status === "live" && (
        <div className="mt-3 rounded-[16px] hairline bg-white p-3.5">
          {myTurn ? (
            <>
              <div className="text-[12px] font-semibold">
                Ваш ход — {TURN_LABELS_RU[duel.turn_index - 1] ?? `ход ${duel.turn_index}`}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_TURN_CHARS))}
                rows={6}
                placeholder="Идея → критерий → аргумент → доказательство"
                className="mt-2 w-full resize-none rounded-[12px] hairline bg-background p-3 text-[14px] outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11.5px] text-muted-foreground">
                  {text.trim().length}/{MAX_TURN_CHARS} · минимум {MIN_TURN_CHARS}
                </span>
                <button
                  onClick={send}
                  disabled={busy || text.trim().length < MIN_TURN_CHARS}
                  className="flex items-center gap-1.5 rounded-[12px] bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Отправить
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-[13px] text-muted-foreground">
              Ход соперника ({sideForTurn(duel.turn_index) === "pro" ? duel.pro_name : duel.con_name}). Ждём…
            </p>
          )}
        </div>
      )}

      {duel.status === "judging" && (
        <div className="mt-3 rounded-[16px] hairline bg-white p-5 text-center">
          <Gavel className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-[14px] font-semibold">AI-судья изучает стенограмму…</p>
        </div>
      )}

      {duel.status === "finished" && duel.verdict && (
        <Verdict verdict={duel.verdict} duel={duel} meWon={duel.winner_user_id === user.id} onExit={() => { setDuelId(null); setDuel(null); setTurns([]); }} />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-4">
      <Link to="/training" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Практика
      </Link>
      {children}
    </div>
  );
}

function PlayerChip({ name, label, active, me }: { name: string; label: string; active: boolean; me: boolean }) {
  return (
    <div
      className={`rounded-[12px] p-2.5 hairline ${active ? "bg-primary/10 ring-1 ring-primary" : "bg-background"}`}
    >
      <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
        {label}
        {me ? " · вы" : ""}
      </div>
      <div className="mt-0.5 truncate text-[14px] font-semibold">{name}</div>
    </div>
  );
}

function TurnTimer({ endsAt, myTurn, idx }: { endsAt: string | null; myTurn: boolean; idx: number }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setLeft(Math.max(0, Math.round((new Date(endsAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, idx]);
  if (!endsAt) return null;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="mt-3 flex items-center justify-between rounded-[12px] bg-background px-3 py-2">
      <span className="text-[12px] text-muted-foreground">{myTurn ? "Ваше время" : "Время соперника"}</span>
      <span className={`font-display text-[20px] tabular-nums ${left <= 20 ? "text-primary" : ""}`}>
        {mm}:{ss}
      </span>
    </div>
  );
}

function Verdict({
  verdict,
  duel,
  meWon,
  onExit,
}: {
  verdict: any;
  duel: Duel;
  meWon: boolean;
  onExit: () => void;
}) {
  const winnerName = verdict.winner === "pro" ? duel.pro_name : duel.con_name;
  const labels: Record<string, string> = {
    structure: "Структура",
    argumentation: "Аргументация",
    evidence: "Доказательства",
    rebuttal: "Опровержение",
    delivery: "Подача",
  };
  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-[16px] hairline bg-white p-5 text-center">
        <Trophy className="mx-auto h-7 w-7 text-primary" />
        <h3 className="mt-2 font-display text-[20px]">{meWon ? "Победа" : "Поражение"}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Судья отдал раунд: {winnerName} ({verdict.winner === "pro" ? "За" : "Против"})
        </p>
        <div className="mt-3 flex justify-center gap-6 font-display text-[22px] tabular-nums">
          <div>
            <div>{verdict.pro?.overall ?? 0}</div>
            <div className="text-[11px] font-sans text-muted-foreground">{duel.pro_name}</div>
          </div>
          <div>
            <div>{verdict.con?.overall ?? 0}</div>
            <div className="text-[11px] font-sans text-muted-foreground">{duel.con_name}</div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] hairline bg-white p-4">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Решение судьи</div>
        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed">{verdict.feedback}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(["pro", "con"] as const).map((s) => (
          <div key={s} className="rounded-[16px] hairline bg-white p-4">
            <div className="text-[12px] font-semibold">
              {s === "pro" ? duel.pro_name : duel.con_name} · {s === "pro" ? "За" : "Против"}
            </div>
            <div className="mt-2 space-y-1.5">
              {Object.entries(verdict[s]?.scores ?? {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">{labels[k] ?? k}</span>
                  <span className="tabular-nums font-semibold">{String(v)}</span>
                </div>
              ))}
            </div>
            <ul className="mt-2.5 list-disc space-y-1 pl-4 text-[12.5px] text-muted-foreground">
              {((s === "pro" ? verdict.pro_notes : verdict.con_notes) ?? []).map((n: string, i: number) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        onClick={onExit}
        className="w-full rounded-[14px] bg-primary py-3 text-[14px] font-semibold text-primary-foreground"
      >
        Новый батл
      </button>
    </div>
  );
}
