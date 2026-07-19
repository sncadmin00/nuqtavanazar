import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { castRetroVote, type RetroPollStats } from "@/lib/home.functions";
import { getVisitorId } from "@/lib/visitor";

export function RetroPoll({ weekId, initial }: { weekId: string; initial: RetroPollStats }) {
  const [stats, setStats] = useState(initial);
  const [voted, setVoted] = useState<"pro" | "con" | null>(null);
  const [busy, setBusy] = useState(false);
  const vote = useServerFn(castRetroVote);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `mezon.poll.${weekId}`;
    const v = localStorage.getItem(key);
    if (v === "pro" || v === "con") setVoted(v);
  }, [weekId]);

  const cast = async (side: "pro" | "con") => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await vote({ data: { week_id: weekId, visitor_id: getVisitorId(), side } });
      setStats(res);
      setVoted(side);
      localStorage.setItem(`mezon.poll.${weekId}`, side);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const total = Math.max(1, stats.total);
  const proPct = Math.round((stats.pro / total) * 100);
  const conPct = 100 - proPct;

  return (
    <section className="rounded-[16px] hairline bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[14.5px] font-semibold">А ты как думаешь?</h3>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {stats.total} голос{stats.total % 10 === 1 && stats.total % 100 !== 11 ? "" : stats.total % 10 >= 2 && stats.total % 10 <= 4 && (stats.total % 100 < 10 || stats.total % 100 >= 20) ? "а" : "ов"}
        </span>
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">Голосование по теме прошлой недели — открыто ретроактивно</p>

      {voted ? (
        <div className="mt-3 space-y-2">
          <Bar label="За" pct={proPct} tone="pro" mine={voted === "pro"} />
          <Bar label="Против" pct={conPct} tone="con" mine={voted === "con"} />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            disabled={busy}
            onClick={() => cast("pro")}
            className="rounded-[10px] bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground active:scale-[0.98] disabled:opacity-60"
          >
            За
          </button>
          <button
            disabled={busy}
            onClick={() => cast("con")}
            className="rounded-[10px] bg-[color:var(--color-ink)] py-2.5 text-[13px] font-semibold text-white active:scale-[0.98] disabled:opacity-60"
          >
            Против
          </button>
        </div>
      )}
    </section>
  );
}

function Bar({ label, pct, tone, mine }: { label: string; pct: number; tone: "pro" | "con"; mine: boolean }) {
  const bg = tone === "pro" ? "bg-primary" : "bg-[color:var(--color-ink)]/70";
  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span className={mine ? "font-semibold text-foreground" : "text-foreground/70"}>
          {label}{mine ? " · твой" : ""}
        </span>
        <span className="font-mono tabular-nums text-foreground/70">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={bg} style={{ width: `${pct}%`, height: "100%" }} />
      </div>
    </div>
  );
}
