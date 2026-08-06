import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/player";

type Row = {
  id: string;
  user_id: string | null;
  team_id: string | null;
  title: string;
  event_name: string | null;
  place: number | null;
  awarded_at: string;
};

type Player = { user_id: string; display_name: string | null };
type Team = { id: string; name: string };

export function AchievementsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [title, setTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [place, setPlace] = useState("");
  const [userId, setUserId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const load = () => {
    supabase
      .from("achievements")
      .select("id, user_id, team_id, title, event_name, place, awarded_at")
      .order("awarded_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Row[]));
  };

  useEffect(() => {
    load();
    supabase
      .from("player_ratings")
      .select("user_id, display_name")
      .order("display_name")
      .then(({ data }) => setPlayers((data ?? []) as Player[]));
    supabase
      .from("teams")
      .select("id, name")
      .order("name")
      .then(({ data }) => setTeams((data ?? []) as Team[]));
  }, []);

  const add = async () => {
    if (!title.trim() || (!userId && !teamId)) {
      toast.error("Укажите название и получателя");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("achievements").insert({
      title: title.trim(),
      event_name: eventName.trim() || null,
      place: place ? Number(place) : null,
      user_id: userId || null,
      team_id: teamId || null,
      awarded_at: date,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitle("");
    setEventName("");
    setPlace("");
    toast.success("Награда добавлена");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const input = "w-full rounded-[10px] hairline bg-white px-3 py-2 text-[13px]";

  return (
    <div className="space-y-4">
      <section className="rounded-[16px] hairline bg-white p-4 space-y-2">
        <div className="formula-motif !text-foreground/70">Новая награда</div>
        <input className={input} placeholder="Название (Победитель турнира)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={input} placeholder="Событие (Кубок Бухары 2026)" value={eventName} onChange={(e) => setEventName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className={input} placeholder="Место (1)" inputMode="numeric" value={place} onChange={(e) => setPlace(e.target.value)} />
          <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <select className={input} value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">— игрок —</option>
          {players.map((p) => (
            <option key={p.user_id} value={p.user_id}>{p.display_name ?? p.user_id.slice(0, 8)}</option>
          ))}
        </select>
        <select className={input} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          <option value="">— команда (необязательно) —</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button
          onClick={add}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </section>

      <section className="rounded-[16px] hairline bg-white p-4">
        <div className="formula-motif !text-foreground/70">Все награды</div>
        {rows.length === 0 ? (
          <p className="mt-2 text-[12.5px] text-muted-foreground">Пока пусто.</p>
        ) : (
          <ul className="mt-2 divide-y divide-[color:var(--color-border)]">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium">
                    {r.place ? `#${r.place} · ` : ""}{r.title}
                  </div>
                  <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                    {[r.event_name, formatDate(r.awarded_at), r.team_id ? "команда" : "игрок"].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive" aria-label="Удалить">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
