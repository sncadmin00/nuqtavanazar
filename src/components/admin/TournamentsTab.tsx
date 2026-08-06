import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ListOrdered, GitBranch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateTournamentSchedule, seedTournamentPlayoff } from "@/lib/tournaments.functions";
import { STATUS_LABEL, fmtTime, type Tournament } from "@/lib/tournament-utils";

const inputCls =
  "w-full rounded-[10px] bg-[color:var(--color-cream)] hairline px-3 py-2 text-[14px] outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function toLocalDT(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function TournamentsTab() {
  const [rows, setRows] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("tournaments").select("*").order("day1_at", { ascending: false });
    const list = (data ?? []) as Tournament[];
    setRows(list);
    const { data: ents } = await supabase.from("tournament_entrants").select("tournament_id");
    const map: Record<string, number> = {};
    for (const e of ents ?? []) map[e.tournament_id] = (map[e.tournament_id] ?? 0) + 1;
    setCounts(map);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("tournaments").update({ status }).eq("id", id);
    if (error) alert(error.message);
    load();
  }

  async function run(id: string, fn: "rr" | "playoff") {
    setBusy(id);
    try {
      if (fn === "rr") {
        const r = await generateTournamentSchedule({ data: { tournament_id: id } });
        alert(`Создано матчей: ${r.matches}`);
      } else {
        const r = await seedTournamentPlayoff({ data: { tournament_id: id } });
        alert(`Посеяно участников: ${r.seeded}`);
      }
      load();
    } catch (e: any) {
      alert(e?.message ?? "Ошибка");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[20px]">Турниры</h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 rounded-full bg-[color:var(--color-ink)] px-4 py-1.5 text-[13px] font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Турнир
        </button>
      </div>

      {showForm && (
        <TournamentForm
          t={editing}
          onDone={() => {
            setShowForm(false);
            setEditing(null);
            load();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {loading ? (
        <div className="text-[14px] text-muted-foreground">Загрузка…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-[12px] bg-white hairline p-6 text-center text-[14px] text-muted-foreground">
          Пока нет турниров
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((t) => (
            <div key={t.id} className="rounded-[12px] bg-white hairline p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium">{t.title}</div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">
                    {t.format === "2v2" ? "2×2" : "1×1"} · {STATUS_LABEL[t.status] ?? t.status} · заявок:{" "}
                    {counts[t.id] ?? 0}
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">
                    Д1 {fmtTime(t.day1_at)} · Д2 {fmtTime(t.day2_at)}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => {
                      setEditing(t);
                      setShowForm(true);
                    }}
                    className="rounded-lg p-2 hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Удалить турнир со всеми матчами?")) {
                        await supabase.from("tournaments").delete().eq("id", t.id);
                        load();
                      }
                    }}
                    className="rounded-lg p-2 text-primary hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <select
                  className="rounded-full hairline bg-white px-3 py-1.5 text-[12px]"
                  value={t.status}
                  onChange={(e) => setStatus(t.id, e.target.value)}
                >
                  {["draft", "registration", "day1", "day2", "finished"].map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => run(t.id, "rr")}
                  disabled={busy === t.id}
                  className="inline-flex items-center gap-1 rounded-full hairline bg-white px-3 py-1.5 text-[12px] disabled:opacity-50"
                >
                  <ListOrdered className="h-3.5 w-3.5" /> Круговой этап
                </button>
                <button
                  onClick={() => run(t.id, "playoff")}
                  disabled={busy === t.id}
                  className="inline-flex items-center gap-1 rounded-full hairline bg-white px-3 py-1.5 text-[12px] disabled:opacity-50"
                >
                  <GitBranch className="h-3.5 w-3.5" /> Посев топ-8
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TournamentForm({
  t,
  onDone,
  onCancel,
}: {
  t: Tournament | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(t?.title ?? "");
  const [description, setDescription] = useState(t?.description ?? "");
  const [format, setFormat] = useState(t?.format ?? "1v1");
  const [day1At, setDay1At] = useState(toLocalDT(t?.day1_at ?? null));
  const [day2At, setDay2At] = useState(toLocalDT(t?.day2_at ?? null));
  const [day1Topic, setDay1Topic] = useState(t?.day1_topic ?? "");
  const [day2Topic, setDay2Topic] = useState(t?.day2_topic ?? "");
  const [slot, setSlot] = useState(t?.slot_minutes ?? 45);
  const [maxEntrants, setMaxEntrants] = useState(t?.max_entrants ?? 16);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      format,
      day1_at: new Date(day1At).toISOString(),
      day2_at: new Date(day2At).toISOString(),
      day1_topic: day1Topic.trim() || null,
      day2_topic: day2Topic.trim() || null,
      slot_minutes: slot,
      max_entrants: maxEntrants,
    };
    const { error } = t
      ? await supabase.from("tournaments").update(payload).eq("id", t.id)
      : await supabase.from("tournaments").insert(payload);
    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-[14px] bg-white hairline p-4">
      <h3 className="font-serif text-[18px]">{t ? "Редактировать турнир" : "Новый турнир"}</h3>
      <Field label="Название">
        <input className={inputCls} required value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Описание">
        <textarea className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Формат">
          <select className={inputCls} value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="1v1">Игроки 1×1</option>
            <option value="2v2">Команды 2×2</option>
          </select>
        </Field>
        <Field label="Слот матча (мин)">
          <input className={inputCls} type="number" min={15} value={slot} onChange={(e) => setSlot(+e.target.value)} />
        </Field>
        <Field label="День 1 — старт">
          <input className={inputCls} type="datetime-local" required value={day1At} onChange={(e) => setDay1At(e.target.value)} />
        </Field>
        <Field label="День 2 — старт">
          <input className={inputCls} type="datetime-local" required value={day2At} onChange={(e) => setDay2At(e.target.value)} />
        </Field>
        <Field label="Макс. участников">
          <input
            className={inputCls}
            type="number"
            min={4}
            value={maxEntrants}
            onChange={(e) => setMaxEntrants(+e.target.value)}
          />
        </Field>
      </div>
      <Field label="Тема дня 1 (круговой этап)">
        <input className={inputCls} value={day1Topic} onChange={(e) => setDay1Topic(e.target.value)} />
      </Field>
      <Field label="Тема дня 2 (плей-офф)">
        <input className={inputCls} value={day2Topic} onChange={(e) => setDay2Topic(e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[color:var(--color-ink)] px-5 py-2 text-[13px] font-medium text-white disabled:opacity-50"
        >
          {saving ? "Сохранение…" : t ? "Сохранить" : "Создать"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full hairline bg-white px-5 py-2 text-[13px] font-medium">
          Отмена
        </button>
      </div>
    </form>
  );
}
