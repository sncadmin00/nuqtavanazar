import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { DebateWeek } from "@/lib/debate-data";

export function LastWeekBanner({ week }: { week: DebateWeek | null }) {
  if (!week || !week.topic) return null;
  const pro = week.pro_percent;
  const con = week.con_percent;
  return (
    <Link
      to="/debate-day"
      className="block rounded-[14px] bg-white hairline px-4 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="formula-motif">Итоги прошлой недели</div>
          <div className="mt-1 truncate text-[13px] font-medium text-foreground">{week.topic}</div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="bg-primary" style={{ width: `${pro}%` }} />
        <div className="bg-[color:var(--color-ink)]/25" style={{ width: `${con}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
        <span>За · {pro}%</span>
        <span>Против · {con}%</span>
      </div>
    </Link>
  );
}
