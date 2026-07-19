import { Award, Sparkles } from "lucide-react";
import type { FeaturedSpeaker } from "@/lib/home.functions";

export function FeaturedSpeakers({ items }: { items: FeaturedSpeaker[] }) {
  if (items.length === 0) return null;
  const best = items.find((i) => i.kind === "best");
  const rising = items.find((i) => i.kind === "rising");
  return (
    <section className="grid grid-cols-2 gap-2.5">
      {best && <Card sp={best} icon={Award} label="Лучший спикер" tone="primary" />}
      {rising && <Card sp={rising} icon={Sparkles} label="Новый голос" tone="ink" />}
    </section>
  );
}

function Card({
  sp, icon: Icon, label, tone,
}: {
  sp: FeaturedSpeaker;
  icon: typeof Award;
  label: string;
  tone: "primary" | "ink";
}) {
  const badge = tone === "primary" ? "bg-primary text-primary-foreground" : "bg-[color:var(--color-ink)] text-white";
  const initial = sp.display_name.slice(0, 1).toUpperCase();
  return (
    <div className="rounded-[14px] hairline bg-white p-3">
      <span className={`inline-flex items-center gap-1 rounded-full ${badge} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider`}>
        <Icon className="h-3 w-3" /> {label}
      </span>
      <div className="mt-3 flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--color-table)] text-[13px] font-semibold text-foreground">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold">{sp.display_name}</div>
          {sp.badge_note && (
            <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{sp.badge_note}</div>
          )}
        </div>
      </div>
    </div>
  );
}
