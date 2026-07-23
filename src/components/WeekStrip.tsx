import { useT } from "@/lib/i18n";

export function WeekStrip({
  days,
  tone = "dark",
  label,
}: {
  days: boolean[];
  tone?: "dark" | "light";
  label?: string;
}) {
  const t = useT();
  const WEEKDAYS = [
    t("week.mon"), t("week.tue"), t("week.wed"), t("week.thu"),
    t("week.fri"), t("week.sat"), t("week.sun"),
  ];
  const done = days.filter(Boolean).length;
  const isDark = tone === "dark";
  return (
    <div>
      <div
        className={
          "flex items-center justify-between text-[10.5px] uppercase tracking-wider " +
          (isDark ? "text-white/50" : "text-muted-foreground")
        }
      >
        <span>{label ?? t("week.thisWeek")}</span>
        <span>{done}/7</span>
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={
                "h-2 w-full rounded-full " +
                (d ? "bg-primary" : isDark ? "bg-white/15" : "bg-foreground/10")
              }
            />
            <span
              className={
                "text-[10px] " + (isDark ? "text-white/50" : "text-muted-foreground")
              }
            >
              {WEEKDAYS[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
