import type { WeekPublic } from "@/lib/home.functions";

export function PrevWeekResultCard({ week }: { week: WeekPublic }) {
  return (
    <section className="rounded-[16px] bg-[color:var(--color-ink)] p-5 text-white">
      <div className="formula-motif !text-white/50">Итоги прошлой недели</div>
      <p className="mt-2 text-[15px] font-medium leading-snug text-white">{week.topic ?? "—"}</p>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/10">
        <div className="bg-primary" style={{ width: `${week.pro_percent}%` }} />
        <div className="bg-white/40" style={{ width: `${week.con_percent}%` }} />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11.5px] tabular-nums text-white/70">
        <span>За · {week.pro_percent}%</span>
        <span>Против · {week.con_percent}%</span>
      </div>
    </section>
  );
}
