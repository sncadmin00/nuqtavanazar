import { Swords } from "lucide-react";
import { toast } from "sonner";
import type { MatchesStatus as MatchesStatusT } from "@/lib/home.functions";

export function MatchesStatus({ matches, revealed }: { matches: MatchesStatusT; revealed: boolean }) {
  const isLive = matches.mode === "live";
  return (
    <section>
      <div className="flex items-center gap-2 px-1">
        {isLive && <span className="live-dot" />}
        <h3 className="text-[15px] font-semibold">
          {isLive ? "Сейчас в эфире" : "Записались на День дебатов"}
        </h3>
      </div>
      <p className="mt-1 px-1 text-[12px] text-muted-foreground">
        {isLive
          ? "Тема недели · живые раунды идут прямо сейчас"
          : revealed
          ? "До старта Дня дебатов — брони уже заявлены"
          : "Тема откроется за 48 часов до старта"}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <FormatCard
          label="1 × 1"
          count={matches.one_v_one}
          listeners={matches.listeners_one}
          live={isLive}
        />
        <FormatCard
          label="2 × 2"
          count={matches.two_v_two}
          listeners={matches.listeners_two}
          live={isLive}
        />
      </div>
    </section>
  );
}

function FormatCard({ label, count, listeners, live }: { label: string; count: number; listeners: number; live: boolean }) {
  return (
    <button
      onClick={() => toast(live ? "Прослушивание скоро откроется" : "Заявки скоро откроются")}
      className="rounded-[14px] hairline bg-white p-3.5 text-left active:scale-[0.99]"
    >
      <div className="flex items-center gap-1.5">
        <Swords className="h-4 w-4 text-primary" />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground">{label}</span>
      </div>
      <div className="mt-2 font-display text-[26px] leading-none tabular-nums">{count}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">
        {live
          ? `${count === 1 ? "комната" : "комнат"} · ${listeners} слушат.`
          : `${count === 1 ? "матч записан" : "матчей записано"}`}
      </div>
    </button>
  );
}
