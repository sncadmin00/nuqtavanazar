import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy, Users, Swords, Camera } from "lucide-react";
import { toast } from "sonner";
import {
  fetchAchievements,
  fetchBattleHistory,
  fetchTeamHistory,
  formatDate,
  uploadAvatar,
  type AchievementItem,
  type BattleHistoryItem,
  type TeamHistoryItem,
} from "@/lib/player";

export function Avatar({
  name,
  url,
  size = 56,
  editable = false,
  userId,
  onChange,
}: {
  name: string;
  url?: string | null;
  size?: number;
  editable?: boolean;
  userId?: string;
  onChange?: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const px = { width: size, height: size };
  return (
    <div className="relative shrink-0" style={px}>
      {url ? (
        <img
          src={url}
          alt={`Аватар ${name}`}
          className="h-full w-full rounded-full object-cover"
          style={px}
        />
      ) : (
        <div
          className="grid place-items-center rounded-full bg-[color:var(--color-ink)] font-semibold text-white"
          style={{ ...px, fontSize: size / 2.9 }}
        >
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      {editable && userId && (
        <label className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground">
          <Camera className="h-3.5 w-3.5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              try {
                const next = await uploadAvatar(userId, file);
                onChange?.(next);
                toast.success("Аватар обновлён");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Не удалось загрузить");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      )}
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[16px] hairline bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <div className="formula-motif !text-foreground/70">{title}</div>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

const EMPTY = (t: string) => <p className="text-[12.5px] text-muted-foreground">{t}</p>;

export function AchievementsCard({ userId, teamIds }: { userId: string; teamIds: string[] }) {
  const [items, setItems] = useState<AchievementItem[]>([]);
  useEffect(() => {
    fetchAchievements(userId, teamIds).then(setItems).catch(() => {});
  }, [userId, teamIds.join(",")]);

  return (
    <Card icon={<Trophy className="h-4 w-4" />} title="Достижения">
      {items.length === 0
        ? EMPTY("Пока нет наград. Победы в турнирах появятся здесь.")
        : (
          <ul className="space-y-2">
            {items.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-[12px] bg-muted/50 p-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-[12px] font-semibold text-primary">
                  {a.place ? `#${a.place}` : "★"}
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold leading-tight">{a.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {[a.event_name, formatDate(a.awarded_at)].filter(Boolean).join(" · ")}
                    {a.team_id ? " · командное" : ""}
                  </div>
                  {a.note && <div className="mt-1 text-[11.5px] text-muted-foreground">{a.note}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
    </Card>
  );
}

export function TeamHistoryCard({
  userId,
  onTeams,
}: {
  userId: string;
  onTeams?: (ids: string[]) => void;
}) {
  const [items, setItems] = useState<TeamHistoryItem[]>([]);
  useEffect(() => {
    fetchTeamHistory(userId).then((rows) => {
      setItems(rows);
      onTeams?.(rows.map((r) => r.team_id));
    }).catch(() => {});
  }, [userId]);

  return (
    <Card icon={<Users className="h-4 w-4" />} title="Команды">
      {items.length === 0
        ? EMPTY("Игрок пока не состоял в командах.")
        : (
          <ul className="divide-y divide-[color:var(--color-border)]">
            {items.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium">{t.team_name}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {t.role === "owner" ? "капитан" : "второй спикер"} · с {formatDate(t.joined_at)}
                    {t.left_at ? ` по ${formatDate(t.left_at)}` : ""}
                  </div>
                </div>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-wide " +
                    (t.left_at ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary")
                  }
                >
                  {t.left_at ? "в прошлом" : "сейчас"}
                </span>
              </li>
            ))}
          </ul>
        )}
      <Link to="/teams" className="mt-3 inline-block text-[12.5px] font-semibold text-primary">
        Команды →
      </Link>
    </Card>
  );
}

export function BattleHistoryCard({ userId }: { userId: string }) {
  const [items, setItems] = useState<BattleHistoryItem[]>([]);
  useEffect(() => {
    fetchBattleHistory(userId).then(setItems).catch(() => {});
  }, [userId]);

  const wins = items.filter((b) => b.result === "win").length;
  const losses = items.filter((b) => b.result === "loss").length;

  return (
    <Card icon={<Swords className="h-4 w-4" />} title="История баттлов">
      {items.length === 0
        ? EMPTY("Баттлов пока не было.")
        : (
          <>
            <div className="mb-2 font-mono text-[12px] tabular-nums text-muted-foreground">
              {wins} побед · {losses} поражений
            </div>
            <ul className="divide-y divide-[color:var(--color-border)]">
              {items.map((b) => (
                <li key={b.id} className="flex items-start gap-3 py-2.5">
                  <span
                    className={
                      "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold " +
                      (b.result === "win"
                        ? "bg-primary/15 text-primary"
                        : b.result === "loss"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground")
                    }
                  >
                    {b.result === "win" ? "W" : b.result === "loss" ? "L" : "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-[13px] font-medium leading-snug">{b.motion}</div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {b.format} · {b.side === "pro" ? "За" : "Против"} · vs {b.opponents} · {formatDate(b.date)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
    </Card>
  );
}
