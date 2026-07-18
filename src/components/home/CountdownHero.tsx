import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import type { DebateWeek } from "@/lib/debate-data";

const DAYS = ["воскресенье", "понедельник", "вторник", "среду", "четверг", "пятницу", "субботу"];

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  return { days, hours, minutes };
}

export function CountdownHero({ week }: { week: DebateWeek | null }) {
  const eventAt = week ? new Date(week.event_at) : nextSaturday();
  const revealAt = week ? new Date(week.topic_reveal_at) : new Date(eventAt.getTime() - 24 * 3600 * 1000);

  const [t, setT] = useState(() => diff(eventAt));
  useEffect(() => {
    const id = setInterval(() => setT(diff(eventAt)), 30_000);
    return () => clearInterval(id);
  }, [eventAt]);

  const revealed = Date.now() >= revealAt.getTime() && !!week?.topic;
  const dayLabel = DAYS[eventAt.getDay()];

  return (
    <section className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
      <div className="flex items-baseline justify-between">
        <div className="formula-motif !text-white/50">День дебатов</div>
        <div className="formula-motif !text-white/50">идея → критерий → аргумент</div>
      </div>
      <h2 className="mt-1 text-[15px] font-medium text-white/80">
        До ближайшего Дня дебатов · {dayLabel}
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <TimeBlock value={t.days} label="дни" />
        <TimeBlock value={t.hours} label="часы" />
        <TimeBlock value={t.minutes} label="мин" />
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        {revealed ? (
          <div>
            <span className="inline-block rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              Объявлено
            </span>
            <p className="mt-2 text-[15px] leading-snug text-white">{week!.topic}</p>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 text-white/60">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="text-[13px] font-medium text-white/85">Тема появится за 24 часа до старта</div>
              <div className="mt-0.5 text-[12px] text-white/50">
                Никто не готовит заученные речи заранее
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[12px] bg-primary/15 py-3 text-center">
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-primary">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-white/60">{label}</div>
    </div>
  );
}

function nextSaturday() {
  const d = new Date();
  const day = d.getDay();
  const add = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + add);
  d.setHours(15, 0, 0, 0);
  return d;
}
