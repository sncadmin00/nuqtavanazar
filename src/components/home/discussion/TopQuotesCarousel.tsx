import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WeekQuote } from "@/lib/home.functions";

export function TopQuotesCarousel({ quotes }: { quotes: WeekQuote[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  if (quotes.length === 0) return null;

  const scrollTo = (idx: number) => {
    const el = ref.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(quotes.length - 1, idx));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    setI(clamped);
  };

  return (
    <section>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[15px] font-semibold">Топ реплик недели</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scrollTo(i - 1)}
            className="grid h-7 w-7 place-items-center rounded-full hairline bg-white"
            aria-label="Назад"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollTo(i + 1)}
            className="grid h-7 w-7 place-items-center rounded-full hairline bg-white"
            aria-label="Вперёд"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.round(el.scrollLeft / (el.clientWidth * 0.85));
          if (idx !== i) setI(idx);
        }}
        className="mt-3 flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
      >
        {quotes.map((q) => (
          <article
            key={q.id}
            className="min-w-[85%] snap-start rounded-[14px] hairline bg-white p-4"
          >
            <p className="text-[14px] italic leading-snug text-foreground">«{q.text}»</p>
            <div className="mt-3 flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-foreground">{q.author_name}</span>
              <span className="font-mono tabular-nums text-muted-foreground">тук {q.knock_count}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1">
        {quotes.map((_, idx) => (
          <span
            key={idx}
            className={`h-1 w-4 rounded-full ${idx === i ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
    </section>
  );
}
