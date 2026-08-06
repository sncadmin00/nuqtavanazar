import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, CalendarDays, Users, User } from "lucide-react";
import { listTournaments } from "@/lib/tournaments";
import { STATUS_LABEL, fmtTime, type Tournament } from "@/lib/tournament-utils";

export const Route = createFileRoute("/tournaments")({
  head: () => ({
    meta: [
      { title: "Турниры дебатов — Nuqta va Nazar" },
      {
        name: "description",
        content:
          "Двухдневные турниры Nuqta va Nazar: круговой этап в первый день и плей-офф топ-8 во второй. Регистрация игроков и команд.",
      },
      { property: "og:title", content: "Турниры дебатов — Nuqta va Nazar" },
      {
        property: "og:description",
        content: "Круговой этап, топ-8 и сетка на выбывание: 1/4, 1/2 и финал.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TournamentsPage,
});

function TournamentsPage() {
  const [rows, setRows] = useState<Tournament[] | null>(null);

  useEffect(() => {
    listTournaments().then(setRows).catch(() => setRows([]));
  }, []);

  const live = (rows ?? []).filter((t) => t.status !== "finished");
  const past = (rows ?? []).filter((t) => t.status === "finished");

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-5">
      <header className="px-1">
        <div className="formula-motif">Турниры</div>
        <h1 className="mt-1 font-display text-[26px] leading-tight">Два дня, одна корона</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          День 1 — круговой этап со своей темой. День 2 — плей-офф топ-8: четвертьфиналы, полуфиналы и финал.
        </p>
      </header>

      {rows === null ? (
        <p className="px-1 text-sm text-muted-foreground">Загружаем…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-border/60 p-6 text-sm text-muted-foreground">
          Пока нет объявленных турниров. Следите за днём дебатов.
        </p>
      ) : (
        <div className="space-y-4">
          {live.length > 0 && <Section title="Актуальные" items={live} />}
          {past.length > 0 && <Section title="Архив" items={past} />}
        </div>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: Tournament[] }) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[12px] uppercase tracking-wide text-muted-foreground">{title}</h2>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t.id}>
            <Link
              to="/tournament/$tid"
              params={{ tid: t.id }}
              className="block rounded-2xl border border-border/60 p-4 transition-colors hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-[17px] leading-snug">{t.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {t.format === "2v2" ? <Users className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      {t.format === "2v2" ? "Команды 2×2" : "Игроки 1×1"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {fmtTime(t.day1_at)} → {fmtTime(t.day2_at)}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </div>
              {t.status === "finished" && (
                <div className="mt-2 inline-flex items-center gap-1 text-[12px] text-primary">
                  <Trophy className="h-3.5 w-3.5" /> Смотреть сетку
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
