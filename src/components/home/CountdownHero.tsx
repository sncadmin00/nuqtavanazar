import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import type { WeekPublic } from "@/lib/home.functions";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { useT } from "@/lib/i18n";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  return { days, hours, minutes };
}

export function CountdownHero({ week }: { week: WeekPublic | null }) {
  const t = useT();
  const eventAt = week ? new Date(week.event_at) : nextSaturday();

  const [tm, setTm] = useState(() => diff(eventAt));
  useEffect(() => {
    const id = setInterval(() => setTm(diff(eventAt)), 30_000);
    return () => clearInterval(id);
  }, [eventAt]);

  const revealed = !!week?.topic;
  const dayLabel = t(`day.${eventAt.getDay()}`);

  const prevRevealed = useRef(revealed);
  const [revealTick, setRevealTick] = useState(0);
  useEffect(() => {
    if (revealed && !prevRevealed.current) setRevealTick((n) => n + 1);
    prevRevealed.current = revealed;
  }, [revealed]);

  return (
    <section className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
      <div className="formula-motif !text-white/50">{t("hero.eyebrow")}</div>
      <h2 className="mt-1 text-[15px] font-medium text-white/80">
        {t("hero.untilNext", { day: dayLabel })}
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <TimeBlock value={tm.days} label={t("hero.days")} />
        <TimeBlock value={tm.hours} label={t("hero.hours")} />
        <TimeBlock value={tm.minutes} label={t("hero.mins")} />
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        {revealed ? (
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <AnimatedLogo size={40} mode="reveal" trigger={revealTick} />
            </div>
            <div>
              <span className="inline-block rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                {t("hero.announced")}
              </span>
              <p className="mt-2 text-[15px] leading-snug text-white">{week!.topic}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 text-white/60">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="text-[13px] font-medium text-white/85">{t("hero.hiddenHint")}</div>
          </div>
        )}
      </div>
    </section>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[12px] bg-primary/15 py-3 text-center">
      <div className="font-display text-[32px] leading-none tabular-nums text-primary">
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
