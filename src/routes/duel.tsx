import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, Gavel, Loader2, Mic, Square, Swords, Trophy, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  getDuelWindow,
  enterDuel,
  cancelDuel,
  submitDuelTurn,
  transcribeDuelAudio,
  finishDuel,
  getDuelRoomToken,
} from "@/lib/duel.functions";
import { startWavRecording, type WavRecorder } from "@/lib/audioRecorder";
import { ChallengeHub } from "@/components/challenge/ChallengeHub";

import {
  TOTAL_TURNS,
  PREP_SECONDS,
  MIN_TURN_AUDIO_SEC,
  TURN_LABELS_RU,
  TURN_HINTS_RU,
  secondsForTurn,
  sideForTurn,
} from "@/lib/duel-config";

export const Route = createFileRoute("/duel")({
  head: () => ({
    meta: [
      { title: "Аудио-батл 1×1 — Nuqta va Nazar" },
      {
        name: "description",
        content:
          "Голосовой раунд 1×1 в день дебатов: тема недели, 120 секунд подготовки, шесть аудио-ходов и решение AI-судьи.",
      },
      { property: "og:title", content: "Аудио-батл 1×1 — Nuqta va Nazar" },
      {
        property: "og:description",
        content: "Живой аудио-раунд по теме дня с расшифровкой речи и решением AI-судьи.",
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
  prep_ends_at: string | null;
  verdict: any;
  winner_user_id: string | null;
};

type Turn = { id: string; idx: number; side: string; text: string; user_id: string; duration_sec: number | null };
type Win = Awaited<ReturnType<typeof getDuelWindow>>;

function DuelPage() {
  const { user, loading } = useAuth();
  const [win, setWin] = useState<Win | null>(null);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [duel, setDuel] = useState<Duel | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const judgingRef = useRef(false);

  useEffect(() => {
    getDuelWindow().then(setWin).catch(() => setWin(null));
    const id = setInterval(() => {
      getDuelWindow().then(setWin).catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async (id: string) => {
    const [{ data: d }, { data: t }] = await Promise.all([
      supabase.from("duels").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("duel_turns")
        .select("id, idx, side, text, user_id, duration_sec")
        .eq("duel_id", id)
        .order("idx"),
    ]);
    if (d) setDuel(d as Duel);
    setTurns((t ?? []) as Turn[]);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("duels")
        .select("id")
        .in("status", ["waiting", "live", "judging"])
        .or(
          `pro_user_id.eq.${user.id},con_user_id.eq.${user.id},pro_user2_id.eq.${user.id},con_user2_id.eq.${user.id}`,
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setDuelId(data.id);
        load(data.id);
      }
    })();
  }, [user, load]);


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

  useEffect(() => {
    if (!duel || duel.status !== "judging" || judgingRef.current) return;
    judgingRef.current = true;
    finishDuel({ data: { duel_id: duel.id } })
      .then(async () => {
        if (duel.tournament_match_id) {
          await syncTournamentMatch({ data: { match_id: duel.tournament_match_id } }).catch(() => {});
        }
        await load(duel.id);
      })
      .catch((e: any) => toast.error(e?.message ?? "Судья недоступен"))
      .finally(() => {
        judgingRef.current = false;
      });
  }, [duel, load]);


  const enter = async () => {
    setBusy(true);
    try {
      const res = await enterDuel();
      setDuelId(res.duel_id);
      toast.success(
        res.matched
          ? `Соперник найден. Ваша сторона: ${res.role === "pro" ? "За" : "Против"}`
          : "Ждём соперника…",
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Не получилось войти в батл");
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

  if (loading) {
    return (
      <Shell>
        <div className="p-6 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="rounded-[16px] hairline bg-white p-5 text-center">
          <Swords className="mx-auto h-7 w-7 text-primary" />
          <h2 className="mt-2 font-display text-[20px]">Аудио-батл 1×1</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Чтобы выйти в раунд дня и получать рейтинг, войдите в аккаунт.
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
  if (!duel || duel.status === "cancelled" || duel.status === "finished") {
    if (duel?.status === "finished" && duel.verdict) {
      return (
        <Shell>
          <Verdict
            verdict={duel.verdict}
            duel={duel}
            meWon={duel.winner_user_id === user.id}
            onExit={() => {
              setDuelId(null);
              setDuel(null);
              setTurns([]);
            }}
          />
        </Shell>
      );
    }
    return (
      <Shell>
        <>
          <Lobby win={win} busy={busy} onEnter={enter} />
          <ChallengeHub />
        </>

      </Shell>
    );
  }

  const isPro = duel.pro_user_id === user.id;
  const mySide: "pro" | "con" = isPro ? "pro" : "con";
  const prepping = Boolean(duel.prep_ends_at && new Date(duel.prep_ends_at) > new Date());
  const myTurn = duel.status === "live" && duel.turn_user_id === user.id && !prepping;

  if (duel.status === "waiting") {
    return (
      <Shell>
        <div className="rounded-[16px] hairline bg-white p-5 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <h2 className="mt-3 font-display text-[19px]">Ищем соперника…</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">«{duel.motion}»</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Сторону назначит кубик, когда соперник войдёт в раунд.
          </p>
          <button
            onClick={cancel}
            disabled={busy}
            className="mt-4 rounded-[12px] hairline bg-background px-4 py-2 text-[13px] font-semibold"
          >
            Выйти из очереди
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="rounded-[16px] hairline bg-white p-4">
        <div className="flex items-center justify-between text-[11.5px] uppercase tracking-wide text-muted-foreground">
          <span>Аудио-раунд дня</span>
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
        {duel.status === "live" && prepping && (
          <Countdown endsAt={duel.prep_ends_at} label={`Подготовка · ${PREP_SECONDS} сек`} />
        )}
        {duel.status === "live" && !prepping && (
          <Countdown endsAt={duel.turn_ends_at} label={myTurn ? "Ваше время" : "Время соперника"} />
        )}
      </div>

      {duel.status === "live" && <AudioRoom duelId={duel.id} muted={!myTurn} />}

      {duel.status === "live" && prepping && (
        <div className="mt-3 rounded-[16px] hairline bg-white p-4">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Что успеть за подготовку
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed">
            Сформулируйте позицию и критерий, наметьте два аргумента по AREA и заранее подумайте, чем ответите
            сопернику. Микрофон включится автоматически на вашем ходу.
          </p>
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {turns.map((t) => (
          <div
            key={t.id}
            className={`rounded-[14px] hairline p-3.5 ${t.side === mySide ? "bg-white" : "bg-background"}`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-primary">
              <span>{TURN_LABELS_RU[t.idx - 1] ?? `Ход ${t.idx}`}</span>
              {t.duration_sec ? <span className="text-muted-foreground">{t.duration_sec} сек</span> : null}
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed">
              {t.text || "— расшифровка недоступна —"}
            </p>
          </div>
        ))}
        {turns.length === 0 && !prepping && (
          <p className="px-1 text-[13px] text-muted-foreground">Раунд начался. Первым говорит сторона «За».</p>
        )}
      </div>

      {duel.status === "live" && !prepping && (
        <TurnRecorder
          key={duel.turn_index}
          duelId={duel.id}
          idx={duel.turn_index}
          myTurn={myTurn}
          waitingFor={sideForTurn(duel.turn_index) === "pro" ? duel.pro_name : (duel.con_name ?? "соперник")}
          onSubmitted={() => load(duel.id)}
        />
      )}

      {duel.status === "judging" && (
        <div className="mt-3 rounded-[16px] hairline bg-white p-5 text-center">
          <Gavel className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-[14px] font-semibold">AI-судья изучает стенограмму…</p>
        </div>
      )}
    </Shell>
  );
}

function Lobby({ win, busy, onEnter }: { win: Win | null; busy: boolean; onEnter: () => void }) {
  if (!win) {
    return (
      <div className="rounded-[16px] hairline bg-white p-6 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </div>
    );
  }
  const when = win.event_at
    ? new Date(win.event_at).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="rounded-[16px] hairline bg-white p-4">
      <div className="flex items-center gap-2">
        <Swords className="h-4.5 w-4.5 text-primary" />
        <h2 className="font-display text-[19px]">Аудио-батл 1×1</h2>
      </div>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Тема одна для всех — её задаёт клуб перед днём дебатов. Сторону назначает кубик. {PREP_SECONDS} секунд на
        подготовку, затем шесть голосовых ходов: {secondsForTurn(1)}/{secondsForTurn(3)}/{secondsForTurn(5)} секунд.
      </p>

      <div className="mt-3 rounded-[12px] bg-background p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Тема дня</div>
        <div className="mt-1 text-[15px] font-semibold leading-snug">
          {win.topic ?? "Тема будет объявлена перед событием"}
        </div>
        {when && (
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            {when}
          </div>
        )}
      </div>

      {win.open ? (
        <button
          onClick={onEnter}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] bg-primary py-3 text-[14px] font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
          Войти в батл дня
        </button>
      ) : (
        <div className="mt-3 rounded-[12px] hairline bg-background p-3 text-center text-[13px] text-muted-foreground">
          {win.reason === "before" && "Батлы откроются в день дебатов, когда начнётся событие."}
          {win.reason === "after" && "День дебатов завершён. Следующий раунд — на новой неделе."}
          {win.reason === "no_topic" && "Тема ещё не объявлена клубом."}
          {win.reason === "no_week" && "Ближайший день дебатов пока не назначен."}
        </div>
      )}
    </div>
  );
}

function TurnRecorder({
  duelId,
  idx,
  myTurn,
  waitingFor,
  onSubmitted,
}: {
  duelId: string;
  idx: number;
  myTurn: boolean;
  waitingFor: string;
  onSubmitted: () => void;
}) {
  const [recorder, setRecorder] = useState<WavRecorder | null>(null);
  const [phase, setPhase] = useState<"idle" | "recording" | "sending">("idle");

  useEffect(() => {
    return () => recorder?.cancel();
  }, [recorder]);

  if (!myTurn) {
    return (
      <div className="mt-3 rounded-[16px] hairline bg-white p-3.5 text-center text-[13px] text-muted-foreground">
        Говорит {waitingFor}. Ваш микрофон выключен.
      </div>
    );
  }

  const start = async () => {
    try {
      const r = await startWavRecording();
      setRecorder(r);
      setPhase("recording");
    } catch {
      toast.error("Нужен доступ к микрофону");
    }
  };

  const stop = async () => {
    if (!recorder) return;
    setPhase("sending");
    try {
      const { blob, durationSec } = await recorder.stop();
      setRecorder(null);
      if (durationSec < MIN_TURN_AUDIO_SEC) {
        toast.error(`Реплика слишком короткая (минимум ${MIN_TURN_AUDIO_SEC} сек)`);
        setPhase("idle");
        return;
      }
      const path = `${duelId}/${idx}-${Date.now()}.wav`;
      const { error: upErr } = await supabase.storage
        .from("duel-audio")
        .upload(path, blob, { contentType: "audio/wav", upsert: true });
      if (upErr) throw new Error(upErr.message);

      let text = "";
      try {
        const res = await transcribeDuelAudio({ data: { audio_path: path } });
        text = res.text;
      } catch (e: any) {
        toast.warning("Расшифровка не удалась, ход засчитан как аудио");
      }

      await submitDuelTurn({ data: { duel_id: duelId, text, audio_path: path, duration_sec: durationSec } });
      onSubmitted();
      toast.success("Реплика записана");
    } catch (e: any) {
      toast.error(e?.message ?? "Не удалось отправить реплику");
    } finally {
      setPhase("idle");
    }
  };

  return (
    <div className="mt-3 rounded-[16px] hairline bg-white p-4">
      <div className="text-[12px] font-semibold">Ваш ход — {TURN_LABELS_RU[idx - 1] ?? `ход ${idx}`}</div>
      <p className="mt-1 text-[12.5px] text-muted-foreground">{TURN_HINTS_RU[idx - 1] ?? ""}</p>
      <button
        onClick={phase === "recording" ? stop : start}
        disabled={phase === "sending"}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] py-3 text-[14px] font-semibold disabled:opacity-50 ${
          phase === "recording"
            ? "bg-foreground text-background"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {phase === "sending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : phase === "recording" ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {phase === "sending" ? "Отправляем…" : phase === "recording" ? "Закончить реплику" : "Говорить"}
      </button>
      <p className="mt-2 text-[11.5px] text-muted-foreground">
        До {secondsForTurn(idx)} секунд. Речь автоматически расшифруется для судьи и стенограммы.
      </p>
    </div>
  );
}

function AudioRoom({ duelId, muted }: { duelId: string; muted: boolean }) {
  const [state, setState] = useState<"connecting" | "live" | "off">("connecting");
  const roomRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let room: any = null;

    (async () => {
      try {
        const res = await getDuelRoomToken({ data: { duel_id: duelId } });
        if (cancelled) return;
        if ("unavailable" in res) {
          setState("off");
          return;
        }
        const { Room, RoomEvent } = await import("livekit-client");
        room = new Room();
        roomRef.current = room;
        room.on(RoomEvent.TrackSubscribed, (track: any) => {
          if (track.kind === "audio") {
            const el = track.attach();
            el.autoplay = true;
            document.body.appendChild(el);
          }
        });
        await room.connect(res.url, res.token);
        if (cancelled) {
          await room.disconnect();
          return;
        }
        setState("live");
      } catch {
        if (!cancelled) setState("off");
      }
    })();

    return () => {
      cancelled = true;
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [duelId]);

  useEffect(() => {
    const room = roomRef.current;
    if (!room || state !== "live") return;
    room.localParticipant.setMicrophoneEnabled(!muted).catch(() => {});
  }, [muted, state]);

  if (state === "off") return null;

  return (
    <div className="mt-3 flex items-center justify-between rounded-[16px] hairline bg-white px-4 py-3">
      <span className="text-[12.5px] text-muted-foreground">
        {state === "connecting" ? "Подключаем аудио-комнату…" : "Аудио-комната активна"}
      </span>
      <span className={`text-[12px] font-semibold ${muted ? "text-muted-foreground" : "text-primary"}`}>
        {muted ? "Микрофон выключен" : "Микрофон включён"}
      </span>
    </div>
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
    <div className={`rounded-[12px] p-2.5 hairline ${active ? "bg-primary/10 ring-1 ring-primary" : "bg-background"}`}>
      <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
        {label}
        {me ? " · вы" : ""}
      </div>
      <div className="mt-0.5 truncate text-[14px] font-semibold">{name}</div>
    </div>
  );
}

function Countdown({ endsAt, label }: { endsAt: string | null; label: string }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setLeft(Math.max(0, Math.round((new Date(endsAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  if (!endsAt) return null;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="mt-3 flex items-center justify-between rounded-[12px] bg-background px-3 py-2">
      <span className="text-[12px] text-muted-foreground">{label}</span>
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
    <div className="space-y-3">
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
        Вернуться в лобби
      </button>
    </div>
  );
}
