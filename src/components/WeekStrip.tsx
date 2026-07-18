const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function WeekStrip({
  days,
  tone = "dark",
  label = "Эта неделя",
}: {
  days: boolean[];
  tone?: "dark" | "light";
  label?: string;
}) {
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
        <span>{label}</span>
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
