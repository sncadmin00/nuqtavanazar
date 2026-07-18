import { useEffect, useState } from "react";
import { Swords, Users, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { fetchLiveRooms, fetchActiveRoundtable, type LiveRoom, type Roundtable } from "@/lib/debate-data";

export function LiveNow({ weekTopicRevealed, weekTopic }: { weekTopicRevealed: boolean; weekTopic: string | null }) {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [rt, setRt] = useState<Roundtable | null>(null);

  useEffect(() => {
    fetchLiveRooms().then(setRooms);
    fetchActiveRoundtable().then(setRt);
  }, []);

  const oneV1 = rooms.filter((r) => r.format === "1v1");
  const twoV2 = rooms.filter((r) => r.format === "2v2");
  const oneListeners = oneV1.reduce((a, r) => a + r.listeners, 0);
  const twoListeners = twoV2.reduce((a, r) => a + r.listeners, 0);

  return (
    <section>
      <div className="flex items-center gap-2 px-1">
        <span className="live-dot" />
        <h3 className="text-[15px] font-semibold">Сейчас в эфире</h3>
      </div>
      <p className="mt-1 px-1 text-[12px] text-muted-foreground">
        {weekTopicRevealed && weekTopic ? (
          <>Тема недели: <span className="text-foreground/80">{weekTopic}</span></>
        ) : (
          <>Тема недели · <span className="italic">откроется за 24 часа до старта</span></>
        )}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <FormatCard
          label="1 × 1"
          icon={Swords}
          rooms={oneV1.length}
          listeners={oneListeners}
        />
        <FormatCard
          label="2 × 2"
          icon={Swords}
          rooms={twoV2.length}
          listeners={twoListeners}
        />
      </div>

      <div className="mt-2.5">
        <RoundtableBanner rt={rt} />
      </div>
    </section>
  );
}

function FormatCard({ label, icon: Icon, rooms, listeners }: { label: string; icon: typeof Swords; rooms: number; listeners: number }) {
  return (
    <button
      onClick={() => toast("Лобби скоро откроется")}
      className="rounded-[14px] hairline bg-white p-3.5 text-left active:scale-[0.99]"
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground">{label}</span>
      </div>
      <div className="mt-2 font-mono text-[22px] font-semibold leading-none tabular-nums">{rooms}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">
        {rooms === 1 ? "комната" : "комнат"} · <span className="tabular-nums">{listeners}</span> слушат.
      </div>
    </button>
  );
}

function RoundtableBanner({ rt }: { rt: Roundtable | null }) {
  if (!rt) {
    return (
      <div className="rounded-[16px] bg-[color:var(--color-table)] p-4 text-[13px] text-foreground/70">
        Круглый стол сейчас не идёт. Ближайший — в День дебатов.
      </div>
    );
  }
  const avatars = rt.participants.slice(0, 4);
  return (
    <button
      onClick={() => toast("Круглый стол скоро откроется")}
      className="w-full rounded-[16px] bg-[color:var(--color-table)] p-4 text-left active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {avatars.map((p, i) => (
            <div
              key={i}
              className="grid h-8 w-8 place-items-center rounded-full border-2 border-[color:var(--color-table)] bg-[color:var(--color-ink)] text-[11px] font-semibold text-white"
            >
              {p.name?.slice(0, 1).toUpperCase() ?? "?"}
            </div>
          ))}
          {rt.participants.length > 4 && (
            <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-[color:var(--color-table)] bg-white text-[10px] font-semibold text-foreground">
              +{rt.participants.length - 4}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <MessagesSquare className="h-3.5 w-3.5 text-foreground/70" />
            <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground/80">Круглый стол</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[13.5px] font-medium text-foreground">{rt.topic}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11.5px] text-foreground/70">
        <span>
          <span className="tabular-nums">{rt.participants.length}</span> участников · модератор {rt.moderator_name ?? "—"}
        </span>
        <span className="flex items-center gap-2 font-mono tabular-nums">
          <span>тук {rt.knock_count}</span>
          <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{rt.listeners}</span>
        </span>
      </div>
    </button>
  );
}
