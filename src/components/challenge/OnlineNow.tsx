import { useEffect, useMemo, useState } from "react";
import { Swords, Users, Wifi } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LOBBY_CHANNEL, type LobbyPeer } from "@/lib/challenges";

type Props = {
  me: { id: string; name: string; mastery: number; busy: boolean } | null;
  onChallenge: (peer: LobbyPeer) => void;
  pendingTo: string[];
};

export function OnlineNow({ me, onChallenge, pendingTo }: Props) {
  const [peers, setPeers] = useState<LobbyPeer[]>([]);

  const meKey = me?.id ?? null;
  const meName = me?.name ?? "";
  const meMastery = me?.mastery ?? 0;
  const meBusy = me?.busy ?? false;

  useEffect(() => {
    if (!meKey) return;
    const channel = supabase.channel(LOBBY_CHANNEL, {
      config: { presence: { key: meKey } },
    });

    const sync = () => {
      const state = channel.presenceState() as Record<string, Array<Record<string, unknown>>>;
      const list: LobbyPeer[] = [];
      for (const [key, metas] of Object.entries(state)) {
        const m = metas[metas.length - 1] as unknown as LobbyPeer | undefined;
        if (!m || key === meKey) continue;
        list.push({
          user_id: key,
          name: String(m.name ?? "Спикер"),
          mastery: Number(m.mastery ?? 1000),
          busy: Boolean(m.busy),
        });
      }
      list.sort((a, b) => Number(a.busy) - Number(b.busy) || b.mastery - a.mastery);
      setPeers(list);
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .on("presence", { event: "join" }, sync)
      .on("presence", { event: "leave" }, sync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: meKey, name: meName, mastery: meMastery, busy: meBusy });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meKey, meName, meMastery, meBusy]);

  const count = useMemo(() => peers.length + (meKey ? 1 : 0), [peers.length, meKey]);

  if (!meKey) return null;

  return (
    <div className="rounded-[16px] hairline bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <h3 className="text-[15px] font-semibold">Свободны сейчас</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
          <Wifi className="h-3 w-3" /> {count}
        </span>
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Кто в лобби — тот и соперник. Нажми «Вызвать», чтобы позвать на батл прямо сейчас.
      </p>

      {peers.length === 0 ? (
        <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-muted/60 px-3 py-3 text-[12.5px] text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          Пока никого. Оставайся в лобби — как только кто-то зайдёт, он появится здесь.
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-[color:var(--color-border)]">
          {peers.map((p) => {
            const sent = pendingTo.includes(p.user_id);
            return (
              <li key={p.user_id} className="flex items-center gap-3 py-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--color-ink)] text-[13px] font-semibold text-white">
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium">{p.name}</div>
                  <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {p.mastery} · {p.busy ? "в батле" : "свободен"}
                  </div>
                </div>
                <button
                  disabled={p.busy || sent}
                  onClick={() => {
                    if (p.busy) return toast("Игрок уже в батле");
                    onChallenge(p);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground disabled:opacity-40"
                >
                  <Swords className="h-3.5 w-3.5" />
                  {sent ? "Отправлено" : "Вызвать"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
