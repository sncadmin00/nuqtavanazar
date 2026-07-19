import type { IdeaArgument } from "@/lib/home.functions";

export function IdeaClash({ pro, con }: { pro: IdeaArgument[]; con: IdeaArgument[] }) {
  if (pro.length === 0 && con.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[15px] font-semibold">Столкновение идей</h3>
        <span className="formula-motif !text-muted-foreground">топ-2 по тук</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Column label="ЗА" tone="pro" items={pro} />
        <Column label="ПРОТИВ" tone="con" items={con} />
      </div>
    </section>
  );
}

function Column({ label, tone, items }: { label: string; tone: "pro" | "con"; items: IdeaArgument[] }) {
  const dot = tone === "pro" ? "bg-primary" : "bg-[color:var(--color-ink)]/60";
  return (
    <div className="rounded-[14px] hairline bg-white p-3">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/70">{label}</span>
      </div>
      <div className="mt-2.5 space-y-3">
        {items.length === 0 && <div className="text-[12px] text-muted-foreground">—</div>}
        {items.map((a) => (
          <div key={a.id}>
            <p className="text-[12.5px] leading-snug text-foreground">{a.text}</p>
            <div className="mt-1 flex items-center gap-2 font-mono text-[10.5px] tabular-nums text-muted-foreground">
              <span>{a.author_name ?? "аноним"}</span>
              <span>· тук {a.knock_count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
