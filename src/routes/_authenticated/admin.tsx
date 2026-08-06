import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, ShieldAlert } from "lucide-react";
import {
  getMyRole,
  listWeeks,
  upsertWeek,
  deleteWeek,
  getCadence,
  updateCadence,
  listWeekContent,
  upsertArgument,
  deleteArgument,
  upsertQuote,
  deleteQuote,
  upsertFeatured,
  deleteFeatured,
  listRoundtablesAdmin,
  upsertRoundtable,
  deleteRoundtable,
  adminStats,
  type AdminWeek,
  type Cadence,
  type AdminArgument,
  type AdminQuote,
  type AdminFeatured,
  type AdminRoundtable,
  type AdminStats,
} from "@/lib/admin.functions";
import { Header } from "@/components/Header";
import { AchievementsTab } from "@/components/admin/AchievementsTab";
import { TournamentsTab } from "@/components/admin/TournamentsTab";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Админ-панель — Nuqta va Nazar" },
      { name: "description", content: "Управление Днями дебатов, темами и контентом." },
    ],
  }),
  component: AdminPage,
});

type Tab = "weeks" | "cadence" | "content" | "roundtables" | "tournaments" | "awards" | "stats";

function AdminPage() {
  const [role, setRole] = useState<"admin" | "user" | "loading">("loading");
  const [tab, setTab] = useState<Tab>("weeks");

  useEffect(() => {
    getMyRole()
      .then((r) => setRole(r))
      .catch(() => setRole("user"));
  }, []);

  if (role === "loading") {
    return (
      <div className="min-h-screen bg-[color:var(--color-cream)]">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          Проверка доступа…
        </div>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-[color:var(--color-cream)]">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-[16px] bg-white hairline p-8 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 font-serif text-2xl">Доступ только для администраторов</h1>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Эта страница доступна только пользователям с ролью администратора.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-full bg-[color:var(--color-ink)] px-5 py-2 text-[13px] font-medium text-white"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-cream)]">
      <Header />
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-4">
        <h1 className="font-serif text-[28px] leading-tight">Админ-панель</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Управление Днями дебатов, темами и контентом недели
        </p>

        {/* Табы */}
        <div className="sticky top-14 z-30 -mx-4 mt-4 flex gap-1 overflow-x-auto bg-[color:var(--color-cream)]/90 px-4 py-2 backdrop-blur-md">
          {([
            ["weeks", "Недели"],
            ["cadence", "Каденс"],
            ["content", "Контент"],
            ["roundtables", "Столы"],
            ["tournaments", "Турниры"],
            ["awards", "Награды"],
            ["stats", "Сводка"],
          ] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                tab === id
                  ? "bg-[color:var(--color-ink)] text-white"
                  : "bg-white hairline text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "weeks" && <WeeksTab />}
          {tab === "cadence" && <CadenceTab />}
          {tab === "content" && <ContentTab />}
          {tab === "roundtables" && <RoundtablesTab />}
          {tab === "tournaments" && <TournamentsTab />}
          {tab === "awards" && <AchievementsTab />}
          {tab === "stats" && <StatsTab />}
        </div>
      </div>
    </div>
  );
}

// ============ Общие компоненты ============
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-[10px] bg-[color:var(--color-cream)] hairline px-3 py-2 text-[14px] outline-none focus:border-primary";

function SaveButton({ saving, children }: { saving: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="rounded-full bg-[color:var(--color-ink)] px-5 py-2 text-[13px] font-medium text-white disabled:opacity-50"
    >
      {saving ? "Сохранение…" : children}
    </button>
  );
}

// ============ Недели ============
function WeeksTab() {
  const [weeks, setWeeks] = useState<AdminWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminWeek | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const data = await listWeeks();
    setWeeks(data);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[20px]">Недели дебатов</h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 rounded-full bg-[color:var(--color-ink)] px-4 py-1.5 text-[13px] font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Неделя
        </button>
      </div>

      {showForm && (
        <WeekForm
          week={editing}
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
      ) : weeks.length === 0 ? (
        <div className="rounded-[12px] bg-white hairline p-6 text-center text-[14px] text-muted-foreground">
          Пока нет ни одной недели
        </div>
      ) : (
        <div className="space-y-2">
          {weeks.map((w) => (
            <div key={w.id} className="rounded-[12px] bg-white hairline p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] text-muted-foreground">
                    Старт: {w.week_start} · Событие: {fmt(w.event_at)}
                  </div>
                  <div className="mt-1 text-[14px] font-medium text-foreground">
                    {w.topic || <span className="text-muted-foreground">Без темы</span>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => {
                      setEditing(w);
                      setShowForm(true);
                    }}
                    className="rounded-lg p-2 hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Удалить неделю?")) {
                        await deleteWeek({ data: { id: w.id } });
                        load();
                      }
                    }}
                    className="rounded-lg p-2 text-primary hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WeekForm({
  week,
  onDone,
  onCancel,
}: {
  week: AdminWeek | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [weekStart, setWeekStart] = useState(week?.week_start ?? "");
  const [eventAt, setEventAt] = useState(week ? toLocalDT(week.event_at) : "");
  const [eventEndsAt, setEventEndsAt] = useState(week ? toLocalDT(week.event_ends_at) : "");
  const [topic, setTopic] = useState(week?.topic ?? "");
  const [aiSummary, setAiSummary] = useState(week?.ai_summary ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertWeek({
        data: {
          id: week?.id,
          week_start: weekStart,
          event_at: fromLocalDT(eventAt),
          event_ends_at: eventEndsAt ? fromLocalDT(eventEndsAt) : null,
          topic: topic || null,
          ai_summary: aiSummary || null,
        },
      });
      onDone();
    } catch (err: any) {
      alert(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-[14px] bg-white hairline p-4">
      <h3 className="font-serif text-[18px]">{week ? "Редактировать неделю" : "Новая неделя"}</h3>
      <Field label="Дата начала недели (YYYY-MM-DD)">
        <input className={inputCls} type="date" required value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
      </Field>
      <Field label="Дата и время Дня дебатов">
        <input className={inputCls} type="datetime-local" required value={eventAt} onChange={(e) => setEventAt(e.target.value)} />
      </Field>
      <Field label="Окончание Дня дебатов (необязательно)">
        <input className={inputCls} type="datetime-local" value={eventEndsAt} onChange={(e) => setEventEndsAt(e.target.value)} />
      </Field>
      <Field label="Тема">
        <input className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Тема недели" />
      </Field>
      <Field label="AI-резюме (появится после события)">
        <textarea className={inputCls} rows={3} value={aiSummary} onChange={(e) => setAiSummary(e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <SaveButton saving={saving}>{week ? "Сохранить" : "Создать"}</SaveButton>
        <button type="button" onClick={onCancel} className="rounded-full hairline bg-white px-5 py-2 text-[13px] font-medium">
          Отмена
        </button>
      </div>
    </form>
  );
}

function toLocalDT(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}
function fromLocalDT(v: string): string {
  return new Date(v).toISOString();
}

// ============ Каденс ============
function CadenceTab() {
  const [c, setC] = useState<Cadence | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCadence()
      .then((data) => setC(data))
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!c) return;
    setSaving(true);
    try {
      const updated = await updateCadence({ data: { ...c } });
      setC(updated);
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  }

  if (loading) return <div className="text-[14px] text-muted-foreground">Загрузка…</div>;

  return (
    <form onSubmit={submit} className="space-y-3 rounded-[14px] bg-white hairline p-4">
      <h2 className="font-serif text-[20px]">Настройки цикла</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Интервал (дней)">
          <input className={inputCls} type="number" min={1} value={c?.interval_days ?? 7} onChange={(e) => setC({ ...c!, interval_days: +e.target.value })} />
        </Field>
        <Field label="День недели (0=вс … 6=сб)">
          <input className={inputCls} type="number" min={0} max={6} value={c?.day_of_week ?? 6} onChange={(e) => setC({ ...c!, day_of_week: +e.target.value })} />
        </Field>
        <Field label="Время события">
          <input className={inputCls} type="time" value={c?.event_time ?? "18:00"} onChange={(e) => setC({ ...c!, event_time: e.target.value })} />
        </Field>
        <Field label="Часовой пояс">
          <input className={inputCls} value={c?.timezone ?? "Asia/Tashkent"} onChange={(e) => setC({ ...c!, timezone: e.target.value })} />
        </Field>
        <Field label="Раскрытие темы за (часов)">
          <input className={inputCls} type="number" min={1} value={c?.reveal_lead_hours ?? 48} onChange={(e) => setC({ ...c!, reveal_lead_hours: +e.target.value })} />
        </Field>
        <Field label="Длительность события (часов)">
          <input className={inputCls} type="number" min={1} value={c?.event_duration_hours ?? 4} onChange={(e) => setC({ ...c!, event_duration_hours: +e.target.value })} />
        </Field>
      </div>
      <SaveButton saving={saving}>Сохранить</SaveButton>
    </form>
  );
}

// ============ Контент недели ============
function ContentTab() {
  const [weeks, setWeeks] = useState<AdminWeek[]>([]);
  const [selWeek, setSelWeek] = useState<string>("");
  const [content, setContent] = useState<{ arguments: AdminArgument[]; quotes: AdminQuote[]; featured: AdminFeatured[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listWeeks().then((w) => {
      setWeeks(w);
      if (w.length) setSelWeek(w[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selWeek) return;
    setLoading(true);
    listWeekContent({ data: { week_id: selWeek } })
      .then(setContent)
      .finally(() => setLoading(false));
  }, [selWeek]);

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-[20px]">Контент недели</h2>
      <Field label="Неделя">
        <select className={inputCls} value={selWeek} onChange={(e) => setSelWeek(e.target.value)}>
          {weeks.map((w) => (
            <option key={w.id} value={w.id}>
              {w.week_start} — {w.topic || "без темы"}
            </option>
          ))}
        </select>
      </Field>

      {loading ? (
        <div className="text-[14px] text-muted-foreground">Загрузка…</div>
      ) : !content ? null : (
        <>
          <ArgumentsSection weekId={selWeek} args={content.arguments} onChanged={() => listWeekContent({ data: { week_id: selWeek } }).then(setContent)} />
          <QuotesSection weekId={selWeek} quotes={content.quotes} onChanged={() => listWeekContent({ data: { week_id: selWeek } }).then(setContent)} />
          <FeaturedSection weekId={selWeek} featured={content.featured} onChanged={() => listWeekContent({ data: { week_id: selWeek } }).then(setContent)} />
        </>
      )}
    </div>
  );
}

function ArgumentsSection({ weekId, args, onChanged }: { weekId: string; args: AdminArgument[]; onChanged: () => void }) {
  const [side, setSide] = useState<"pro" | "con">("pro");
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await upsertArgument({ data: { week_id: weekId, side, text, author_name: author || null } });
      setText("");
      setAuthor("");
      onChanged();
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="rounded-[14px] bg-white hairline p-4">
      <h3 className="font-serif text-[17px]">Аргументы (Столкновение идей)</h3>
      <form onSubmit={add} className="mt-3 space-y-2">
        <div className="flex gap-2">
          <select className={`${inputCls} w-24`} value={side} onChange={(e) => setSide(e.target.value as "pro" | "con")}>
            <option value="pro">ЗА</option>
            <option value="con">ПРОТИВ</option>
          </select>
          <input className={inputCls} placeholder="Автор (необязательно)" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <textarea className={inputCls} rows={2} placeholder="Текст аргумента" value={text} onChange={(e) => setText(e.target.value)} />
        <SaveButton saving={saving}>Добавить</SaveButton>
      </form>
      <div className="mt-3 space-y-1.5">
        {args.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-2 rounded-[10px] bg-[color:var(--color-cream)] p-2">
            <div className="min-w-0">
              <span className={`mr-2 text-[11px] font-bold ${a.side === "pro" ? "text-green-600" : "text-red-600"}`}>
                {a.side === "pro" ? "ЗА" : "ПРОТИВ"}
              </span>
              <span className="text-[13px]">{a.text}</span>
              {a.author_name && <span className="ml-2 text-[12px] text-muted-foreground">— {a.author_name}</span>}
            </div>
            <button onClick={() => deleteArgument({ data: { id: a.id } }).then(onChanged)} className="shrink-0 text-primary">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {args.length === 0 && <div className="text-[12px] text-muted-foreground">Пока нет аргументов</div>}
      </div>
    </div>
  );
}

function QuotesSection({ weekId, quotes, onChanged }: { weekId: string; quotes: AdminQuote[]; onChanged: () => void }) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !author.trim()) return;
    setSaving(true);
    try {
      await upsertQuote({ data: { week_id: weekId, text, author_name: author, order_index: order } });
      setText("");
      setAuthor("");
      onChanged();
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="rounded-[14px] bg-white hairline p-4">
      <h3 className="font-serif text-[17px]">Цитаты</h3>
      <form onSubmit={add} className="mt-3 space-y-2">
        <input className={inputCls} placeholder="Автор" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <textarea className={inputCls} rows={2} placeholder="Текст цитаты" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex items-center gap-2">
          <input className={`${inputCls} w-24`} type="number" placeholder="Порядок" value={order} onChange={(e) => setOrder(+e.target.value)} />
          <SaveButton saving={saving}>Добавить</SaveButton>
        </div>
      </form>
      <div className="mt-3 space-y-1.5">
        {quotes.map((q) => (
          <div key={q.id} className="flex items-start justify-between gap-2 rounded-[10px] bg-[color:var(--color-cream)] p-2">
            <div className="min-w-0">
              <div className="text-[13px]">«{q.text}»</div>
              <div className="text-[12px] text-muted-foreground">— {q.author_name} · порядок {q.order_index}</div>
            </div>
            <button onClick={() => deleteQuote({ data: { id: q.id } }).then(onChanged)} className="shrink-0 text-primary">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {quotes.length === 0 && <div className="text-[12px] text-muted-foreground">Пока нет цитат</div>}
      </div>
    </div>
  );
}

function FeaturedSection({ weekId, featured, onChanged }: { weekId: string; featured: AdminFeatured[]; onChanged: () => void }) {
  const [kind, setKind] = useState<"best" | "rising">("best");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [badge, setBadge] = useState("");
  const [saving, setSaving] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await upsertFeatured({ data: { week_id: weekId, kind, display_name: name, avatar_url: avatar || null, badge_note: badge || null } });
      setName("");
      setAvatar("");
      setBadge("");
      onChanged();
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="rounded-[14px] bg-white hairline p-4">
      <h3 className="font-serif text-[17px]">Спикеры недели</h3>
      <form onSubmit={add} className="mt-3 space-y-2">
        <div className="flex gap-2">
          <select className={`${inputCls} w-32`} value={kind} onChange={(e) => setKind(e.target.value as "best" | "rising")}>
            <option value="best">Лучший</option>
            <option value="rising">Новый голос</option>
          </select>
          <input className={inputCls} placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <input className={inputCls} placeholder="URL аватара (необязательно)" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        <input className={inputCls} placeholder="Заметка/бейдж (необязательно)" value={badge} onChange={(e) => setBadge(e.target.value)} />
        <SaveButton saving={saving}>Добавить</SaveButton>
      </form>
      <div className="mt-3 space-y-1.5">
        {featured.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-2 rounded-[10px] bg-[color:var(--color-cream)] p-2">
            <div>
              <span className="text-[11px] font-bold text-primary">{f.kind === "best" ? "Лучший" : "Новый голос"}</span>{" "}
              <span className="text-[13px]">{f.display_name}</span>
              {f.badge_note && <span className="ml-2 text-[12px] text-muted-foreground">{f.badge_note}</span>}
            </div>
            <button onClick={() => deleteFeatured({ data: { id: f.id } }).then(onChanged)} className="shrink-0 text-primary">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {featured.length === 0 && <div className="text-[12px] text-muted-foreground">Пока нет спикеров</div>}
      </div>
    </div>
  );
}

// ============ Круглые столы ============
function RoundtablesTab() {
  const [rts, setRts] = useState<AdminRoundtable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminRoundtable | null>(null);

  async function load() {
    setLoading(true);
    setRts(await listRoundtablesAdmin());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[20px]">Круглые столы</h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 rounded-full bg-[color:var(--color-ink)] px-4 py-1.5 text-[13px] font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Стол
        </button>
      </div>

      {showForm && (
        <RoundtableForm
          rt={editing}
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
      ) : (
        <div className="space-y-2">
          {rts.map((r) => (
            <div key={r.id} className="rounded-[12px] bg-white hairline p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] text-muted-foreground">{fmt(r.starts_at)} {r.is_live && "· в эфире"}</div>
                  <div className="mt-1 text-[14px] font-medium">{r.topic}</div>
                  {r.moderator_name && <div className="text-[12px] text-muted-foreground">Модератор: {r.moderator_name}</div>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => { setEditing(r); setShowForm(true); }} className="rounded-lg p-2 hover:bg-muted">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Удалить круглый стол?")) {
                        await deleteRoundtable({ data: { id: r.id } });
                        load();
                      }
                    }}
                    className="rounded-lg p-2 text-primary hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rts.length === 0 && <div className="rounded-[12px] bg-white hairline p-6 text-center text-[14px] text-muted-foreground">Пока нет круглых столов</div>}
        </div>
      )}
    </div>
  );
}

function RoundtableForm({
  rt,
  onDone,
  onCancel,
}: {
  rt: AdminRoundtable | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [topic, setTopic] = useState(rt?.topic ?? "");
  const [moderator, setModerator] = useState(rt?.moderator_name ?? "");
  const [startsAt, setStartsAt] = useState(rt ? toLocalDT(rt.starts_at) : "");
  const [isLive, setIsLive] = useState(rt?.is_live ?? false);
  const [capacity, setCapacity] = useState(rt?.capacity ?? 6);
  const [recording, setRecording] = useState(rt?.recording_url ?? "");
  const [participants, setParticipants] = useState(rt ? JSON.stringify(rt.participants ?? [], null, 2) : "[]");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let parts: any = [];
      try {
        parts = JSON.parse(participants);
      } catch {
        parts = [];
      }
      await upsertRoundtable({
        data: {
          id: rt?.id,
          topic,
          moderator_name: moderator || null,
          starts_at: fromLocalDT(startsAt),
          is_live: isLive,
          capacity,
          recording_url: recording || null,
          participants: parts,
        },
      });
      onDone();
    } catch (err: any) {
      alert(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-[14px] bg-white hairline p-4">
      <h3 className="font-serif text-[18px]">{rt ? "Редактировать стол" : "Новый круглый стол"}</h3>
      <Field label="Тема">
        <input className={inputCls} required value={topic} onChange={(e) => setTopic(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Модератор">
          <input className={inputCls} value={moderator} onChange={(e) => setModerator(e.target.value)} />
        </Field>
        <Field label="Дата и время">
          <input className={inputCls} type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </Field>
        <Field label="Вместимость">
          <input className={inputCls} type="number" min={1} value={capacity} onChange={(e) => setCapacity(+e.target.value)} />
        </Field>
        <Field label="Ссылка на запись">
          <input className={inputCls} value={recording} onChange={(e) => setRecording(e.target.value)} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} />
        В эфире сейчас
      </label>
      <Field label="Участники (JSON: [{full_name, pitch}])">
        <textarea className={inputCls} rows={4} value={participants} onChange={(e) => setParticipants(e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <SaveButton saving={saving}>{rt ? "Сохранить" : "Создать"}</SaveButton>
        <button type="button" onClick={onCancel} className="rounded-full hairline bg-white px-5 py-2 text-[13px] font-medium">
          Отмена
        </button>
      </div>
    </form>
  );
}

// ============ Сводка ============
function StatsTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  useEffect(() => {
    adminStats().then(setStats);
  }, []);

  if (!stats) return <div className="text-[14px] text-muted-foreground">Загрузка…</div>;

  const items: [string, number][] = [
    ["Недель", stats.weeks],
    ["Голосов", stats.votes],
    ["Голосовых", stats.voice_notes],
    ["Бронирований", stats.bookings],
    ["Круглых столов", stats.roundtables],
  ];

  return (
    <div className="space-y-3">
      <h2 className="font-serif text-[20px]">Сводка</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map(([label, val]) => (
          <div key={label} className="rounded-[14px] bg-white hairline p-4">
            <div className="font-mono text-[32px] font-semibold tabular-nums">{val}</div>
            <div className="text-[13px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
