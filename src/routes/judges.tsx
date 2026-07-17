import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Gavel, ListChecks, FileText } from "lucide-react";

export const Route = createFileRoute("/judges")({
  head: () => ({
    meta: [
      { title: "Судьям — критерии оценки и чек-листы | Debate Club UZ" },
      { name: "description", content: "Критерии судейства дебатов, чек-листы и примеры баллотов." },
    ],
  }),
  component: JudgesPage,
});

function JudgesPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16">
      <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
        <Gavel className="h-3.5 w-3.5" /> Judge Training
      </div>
      <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold">{t("judges.title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("judges.subtitle")}</p>

      <Card className="mt-8 p-6 border-border/60 shadow-card">
        <h2 className="font-display text-2xl font-bold">{t("judges.criteria.title")}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Criterion title="Matter" desc="Содержание: логика, глубина, доказательства, качество опровержения." />
          <Criterion title="Manner" desc="Подача: ясность, уверенность, темп, взаимодействие с аудиторией." />
          <Criterion title="Method" desc="Стратегия: приоритизация, роли спикеров, работа с ключевыми столкновениями." />
        </div>
      </Card>

      <Card className="mt-6 p-6 border-border/60 shadow-card">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" /> {t("judges.checklist.title")}
        </h2>
        <ul className="mt-4 space-y-2 text-foreground/90">
          {[
            "Определил ли первый спикер ключевые термины?",
            "Есть ли у каждого аргумента заявление, объяснение и доказательство (AREA)?",
            "Ответила ли каждая команда на основные аргументы оппонентов?",
            "Соответствуют ли спикеры своим ролям (whip не приносит новых аргументов и т.д.)?",
            "Какие 2–3 главных столкновения были в раунде?",
            "В каких столкновениях выиграла каждая сторона и почему?",
            "Совпадает ли ваше решение с ключевыми столкновениями, а не с личным мнением?",
          ].map((it, i) => (
            <li key={i} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6 p-6 border-border/60 shadow-card">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> {t("judges.ballot.title")}
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <th className="px-3 py-2 text-left">Спикер</th>
                <th className="px-3 py-2 text-left">Роль</th>
                <th className="px-3 py-2 text-left">Matter (30)</th>
                <th className="px-3 py-2 text-left">Manner (30)</th>
                <th className="px-3 py-2 text-left">Method (40)</th>
                <th className="px-3 py-2 text-left">Итого</th>
              </tr>
            </thead>
            <tbody>
              {["P1", "P2", "P3", "O1", "O2", "O3"].map((r) => (
                <tr key={r} className="border-t">
                  <td className="px-3 py-2 font-medium">{r}</td>
                  <td className="px-3 py-2 text-muted-foreground">—</td>
                  <td className="px-3 py-2">__ / 30</td>
                  <td className="px-3 py-2">__ / 30</td>
                  <td className="px-3 py-2">__ / 40</td>
                  <td className="px-3 py-2 font-semibold">__ / 100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Решение: победа команды __________. Ключевые столкновения: __________.
        </p>
      </Card>
    </div>
  );
}

function Criterion({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="font-display font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
