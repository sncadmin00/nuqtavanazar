import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Play, TrendingUp } from "lucide-react";
import { fetchAllWeeks, fetchWeekHighlight, type DebateWeek, type Highlight, fetchActiveRoundtable, type Roundtable, fetchTopRatings } from "@/lib/debate-data";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/debate-day")({
  head: () => ({
    meta: [
      { title: "День дебатов — Мезон" },
      { name: "description", content: "Итоги и расписание Дня дебатов: тема недели, лучшие раунды, рейтинг." },
    ],
  }),
  component: DebateDayPage,
});

function fmt(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function DebateDayPage() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<DebateWeek[]>([]);
  const [idx, setIdx] = useState(0);
  const [hi, setHi] = useState<Highlight | null>(null);
  const [rt, setRt] = useState<Roundtable | null>(null);
  const [top, setTop] = useState<Awaited<ReturnType<typeof fetchTopRatings>>>([]);

  useEffect(() => {
    fetchAllWeeks().then((w) => {
      setWeeks(w);
      // default to most recent completed week (index 1 if current is upcoming)
      setIdx(w.length > 1 ? 1 : 0);
    });
    fetchActiveRoundtable().then(setRt);
    fetchTopRatings(10).then(setTop);
  }, []);

  const week = weeks[idx];
  useEffect(() => {
    if (week?.id) fetchWeekHighlight(week.id).then(setHi);
  }, [week?.id]);

  if (!week) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-muted-foreground text-sm">Загрузка…</div>;
  }

  const isUpcoming = new Date(week.event_at).getTime() > Date.now();
  const meInTop = top.find((t) => t.user_id === user?.id);
  const displayed = top.slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-3.5">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIdx(Math.min(weeks.length - 1, idx + 1))}
          disabled={idx >= weeks.length - 1}
          className="p-2 -ml-2 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="formula-motif">{isUpcoming ? "Предстоит" : "Итоги"}</div>
          <div className="text-[14px] font-medium">Неделя от {fmt(week.week_start)}</div>
        </div>
        <button
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
          className="p-2 -mr-2 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Topic card */}
      <section className="rounded-[16px] bg-[color:var(--color-ink)] p-5 text-white">
        <div className="formula-motif !text-white/50">Тема дня</div>
        {week.topic ? (
          <p className="mt-1.5 text-[16px] font-medium leading-snug">{week.topic}</p>
        ) : (
          <p className="mt-1.5 text-[13.5px] italic text-white/60">Откроется за 24 часа до старта</p>
        )}
        {!isUpcoming && week.topic && (
          <>
            <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="bg-primary" style={{ width: `${week.pro_percent}%` }} />
              <div className="bg-white/30" style={{ width: `${week.con_percent}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-white/70">
              <span>За · {week.pro_percent}%</span>
              <span>Против · {week.con_percent}%</span>
            </div>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-wider text-white/50">
              <span className="tabular-nums">{week.rounds_count}</span> раундов · <span className="tabular-nums">{week.listeners_total}</span> слушателей
            </div>
          </>
        )}
      </section>

      {!isUpcoming && hi && (
        <section className="rounded-[16px] hairline bg-white p-4">
          <div className="formula-motif">Лучший раунд дня</div>
          <div className="mt-1.5 text-[15px] font-medium">{hi.title}</div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">{hi.participants} · {hi.format}</div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[13px] tabular-nums text-foreground/80">тук · {hi.knock_count}</span>
            <button
              onClick={() => toast("Записи скоро откроются")}
              className="flex items-center gap-1.5 rounded-full bg-[color:var(--color-ink)] px-3.5 py-1.5 text-[12.5px] font-medium text-white"
            >
              <Play className="h-3.5 w-3.5" />
              Слушать
            </button>
          </div>
        </section>
      )}

      {!isUpcoming && rt && rt.opinion_before != null && rt.opinion_after != null && (
        <section className="rounded-[16px] bg-[color:var(--color-table)] p-4">
          <div className="formula-motif">Круглый стол</div>
          <p className="mt-1.5 line-clamp-2 text-[14px] font-medium">{rt.topic}</p>
          <div className="mt-3 flex items-center gap-4">
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-foreground/60">Сдвиг «за»</div>
              <div className="mt-0.5 flex items-baseline gap-1.5 font-mono tabular-nums">
                <span className="text-[18px]">{rt.opinion_before}%</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-[22px] font-semibold text-primary">{rt.opinion_after}%</span>
              </div>
            </div>
            {rt.best_speaker_name && (
              <div className="ml-auto text-right">
                <div className="text-[10.5px] uppercase tracking-wider text-foreground/60">Лучший спикер</div>
                <div className="mt-0.5 text-[13.5px] font-medium">{rt.best_speaker_name}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {!isUpcoming && (
        <section className="rounded-[16px] hairline bg-white p-4">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <div className="formula-motif !text-foreground/70">Рейтинг недели</div>
          </div>
          <ul className="mt-2 divide-y divide-[color:var(--color-border)]">
            {displayed.map((p, i) => (
              <RatingRow key={p.user_id} rank={i + 1} p={p} />
            ))}
            {meInTop && !displayed.find((d) => d.user_id === meInTop.user_id) && (
              <RatingRow rank={top.findIndex((t) => t.user_id === meInTop.user_id) + 1} p={meInTop} me />
            )}
          </ul>
          <Link to="/profile" className="mt-3 inline-block text-[12.5px] font-medium text-primary">
            Вся лига →
          </Link>
        </section>
      )}

      {!isUpcoming && week.ai_summary && (
        <section className="rounded-[16px] hairline bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="formula-motif !text-foreground/70">Обзор недели</div>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-foreground/70">
              <Sparkles className="h-2.5 w-2.5" /> AI-обзор
            </span>
          </div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/85">{week.ai_summary}</p>
        </section>
      )}

      {!isUpcoming && (
        <button
          onClick={() => toast("Архив записей скоро откроется")}
          className="w-full rounded-[14px] hairline bg-white py-3 text-[13.5px] font-medium"
        >
          Смотреть все записи →
        </button>
      )}

      {isUpcoming && (
        <section className="rounded-[16px] hairline bg-white p-4 text-[13.5px] text-foreground/75">
          <div className="formula-motif">Что дальше</div>
          <p className="mt-2 leading-relaxed">
            До Дня дебатов ({fmt(week.event_at)}) идёт подготовка. Договоритесь на Challenge-матч или
            заявитесь в открытую очередь — расписание блоков появится ближе к дате.
          </p>
        </section>
      )}
    </div>
  );
}

function RatingRow({ rank, p, me = false }: { rank: number; p: { user_id: string; display_name: string | null; mastery: number; mastery_trend_week: number }; me?: boolean }) {
  return (
    <li className={`flex items-center gap-3 py-2.5 -mx-4 px-4 ${me ? "bg-primary/10" : ""}`}>
      <span className="w-5 font-mono text-[12px] tabular-nums text-muted-foreground">{rank}</span>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-ink)] text-[11px] font-semibold text-white">
        {(p.display_name ?? "?").slice(0, 1).toUpperCase()}
      </span>
      <span className="flex-1 truncate text-[13.5px] font-medium">{p.display_name ?? "Игрок"}</span>
      <span className="font-mono text-[13px] tabular-nums">{p.mastery}</span>
      <span className={`font-mono text-[11px] tabular-nums ${p.mastery_trend_week > 0 ? "text-emerald-600" : p.mastery_trend_week < 0 ? "text-destructive" : "text-muted-foreground"}`}>
        {p.mastery_trend_week > 0 ? "+" : ""}{p.mastery_trend_week}
      </span>
    </li>
  );
}
