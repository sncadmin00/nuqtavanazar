import { MessagesSquare, Users, Play, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import type { RoundtableCardState } from "@/lib/home.functions";

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function RoundtableCard({ state }: { state: RoundtableCardState }) {
  if (state.state === "empty") {
    return (
      <div className="rounded-[16px] bg-[color:var(--color-table)] p-4 text-[13px] text-foreground/70">
        Круглый стол сейчас не идёт. Ближайший — скоро объявим.
      </div>
    );
  }
  if (state.state === "live") return <LiveState rt={state.roundtable} />;
  if (state.state === "upcoming") return <UpcomingState rt={state.roundtable} />;
  return <PastState rt={state.roundtable} />;
}

function LiveState({ rt }: { rt: Extract<RoundtableCardState, { state: "live" }>["roundtable"] }) {
  return (
    <button
      onClick={() => toast("Прослушивание скоро откроется")}
      className="w-full rounded-[16px] bg-[color:var(--color-table)] p-4 text-left active:scale-[0.99]"
    >
      <div className="flex items-center gap-2">
        <span className="live-dot" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">Круглый стол идёт</span>
      </div>
      <p className="mt-2 line-clamp-2 text-[14px] font-medium text-foreground">{rt.topic}</p>
      <div className="mt-2 text-[12px] text-foreground/70">
        Модератор · <span className="text-foreground">{rt.moderator_name ?? "—"}</span>
      </div>
      <div className="mt-3 space-y-1.5">
        {rt.participants.slice(0, 3).map((p, i) => (
          <div key={i} className="text-[12.5px]">
            <span className="font-semibold text-foreground">{p.full_name}</span>
            {p.pitch && <span className="text-foreground/70"> — «{p.pitch}»</span>}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11.5px] text-foreground/70">
        <span className="tabular-nums">{rt.participants.length} участн.</span>
        <span className="flex items-center gap-2 font-mono tabular-nums">
          <span>тук {rt.knock_count}</span>
          <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{rt.listeners}</span>
        </span>
      </div>
    </button>
  );
}

function UpcomingState({ rt }: { rt: Extract<RoundtableCardState, { state: "upcoming" }>["roundtable"] }) {
  return (
    <button
      onClick={() => toast("Заявка на участие скоро откроется")}
      className="w-full rounded-[16px] bg-[color:var(--color-table)] p-4 text-left active:scale-[0.99]"
    >
      <div className="flex items-center gap-1.5">
        <MessagesSquare className="h-3.5 w-3.5 text-foreground/70" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">Ближайший круглый стол</span>
      </div>
      <p className="mt-2 line-clamp-2 text-[14.5px] font-medium text-foreground">{rt.topic}</p>
      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-foreground/70">
        <Clock className="h-3 w-3" />
        <span className="tabular-nums">{formatDate(rt.starts_at)}</span>
        <span>· модератор <span className="text-foreground">{rt.moderator_name ?? "—"}</span></span>
      </div>
      <div className="mt-3 space-y-1.5">
        {rt.participants.slice(0, 4).map((p, i) => (
          <div key={i} className="text-[12.5px] leading-snug">
            <span className="font-semibold text-foreground">{p.full_name}</span>
            {p.pitch && <span className="text-foreground/70"> — «{p.pitch}»</span>}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11.5px]">
        <span className="text-foreground/70 tabular-nums">
          {rt.seats_free > 0 ? `${rt.seats_free} свободн. мест из ${rt.capacity}` : "мест нет"}
        </span>
        <span className="font-semibold text-primary">Подать заявку →</span>
      </div>
    </button>
  );
}

function PastState({ rt }: { rt: Extract<RoundtableCardState, { state: "past" }>["roundtable"] }) {
  const shift = rt.opinion_before != null && rt.opinion_after != null
    ? `${rt.opinion_before}% → ${rt.opinion_after}%`
    : null;
  return (
    <div className="rounded-[16px] bg-[color:var(--color-table)] p-4">
      <div className="flex items-center gap-1.5">
        <MessagesSquare className="h-3.5 w-3.5 text-foreground/70" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">Прошедший круглый стол</span>
      </div>
      <p className="mt-2 line-clamp-2 text-[14.5px] font-medium text-foreground">{rt.topic}</p>
      <div className="mt-1 text-[12px] text-foreground/70">
        Модератор · <span className="text-foreground">{rt.moderator_name ?? "—"}</span>
      </div>
      {shift && (
        <div className="mt-3 rounded-[10px] bg-white/60 px-3 py-2 text-[12px]">
          <span className="text-foreground/60">Сдвиг мнения · </span>
          <span className="font-mono font-semibold tabular-nums">{shift}</span>
        </div>
      )}
      <div className="mt-3 space-y-1.5">
        {rt.participants.map((p, i) => (
          <div key={i} className="flex items-start gap-1.5 text-[12.5px] leading-snug">
            {rt.best_speaker_name === p.full_name && (
              <Star className="mt-0.5 h-3 w-3 shrink-0 fill-primary text-primary" />
            )}
            <div>
              <span className="font-semibold text-foreground">{p.full_name}</span>
              {p.pitch && <span className="text-foreground/70"> — «{p.pitch}»</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11.5px] text-foreground/70">
        <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{rt.listeners} слушали</span>
        <button
          onClick={() => toast(rt.recording_url ? "Плеер скоро откроется" : "Запись пока недоступна")}
          className="flex items-center gap-1 font-semibold text-primary"
        >
          <Play className="h-3.5 w-3.5" /> Слушать
        </button>
      </div>
    </div>
  );
}
