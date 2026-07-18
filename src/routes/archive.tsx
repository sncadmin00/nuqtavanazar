import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Trash2, Mic, NotebookPen } from "lucide-react";
import {
  deleteRecording,
  listRecordings,
  deleteReflection,
  listReflections,
  type FreeTalkRecord,
  type CaseReflection,
} from "@/lib/freeTalk";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "Мой архив — Мезон" },
      { name: "description", content: "Приватный архив свободных записей и личных рефлексий. Только для тебя, без анализа." },
    ],
  }),
  component: ArchivePage,
});

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function Row({ rec, onDelete }: { rec: FreeTalkRecord; onDelete: (id: string) => void }) {
  const url = useMemo(() => URL.createObjectURL(rec.blob), [rec.blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold">{formatDate(rec.createdAt)}</div>
          <div className="text-[11.5px] text-muted-foreground">Длительность {formatDuration(rec.durationSec)}</div>
        </div>
        <button
          onClick={() => {
            if (!window.confirm("Удалить эту запись?")) return;
            onDelete(rec.id);
          }}
          className="grid h-8 w-8 place-items-center rounded-full hairline text-muted-foreground hover:text-foreground"
          aria-label="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <audio controls src={url} className="mt-2 w-full" />
    </li>
  );
}

function ArchivePage() {
  const [items, setItems] = useState<FreeTalkRecord[] | null>(null);

  const refresh = () => {
    listRecordings().then(setItems).catch(() => setItems([]));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteRecording(id);
    toast("Запись удалена");
    refresh();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <Link
        to="/training"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Тренировка
      </Link>

      <section className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
        <div className="formula-motif !text-white/50">Мой архив</div>
        <h1 className="mt-1 text-[22px] font-semibold leading-tight">Только ты слышишь эти записи</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
          Не анализируются, не оцениваются. Хранятся у тебя в браузере.
        </p>
      </section>

      <div className="flex items-start gap-3 rounded-[14px] border border-primary/25 bg-primary/5 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[12.5px] leading-snug text-foreground/85">
          Мы видим только длительность и дату — для прогресса. Содержание никто и ничто не обрабатывает.
        </p>
      </div>

      <div className="rounded-[16px] hairline bg-white p-4">
        {items === null ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">Загружаю…</p>
        ) : items.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-[13px] text-muted-foreground">В архиве пока пусто.</p>
            <Link
              to="/free-talk"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-ink)] px-4 py-2 text-[13px] font-semibold text-white"
            >
              <Mic className="h-4 w-4" /> Записать первую
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((rec) => (
              <Row key={rec.id} rec={rec} onDelete={handleDelete} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
