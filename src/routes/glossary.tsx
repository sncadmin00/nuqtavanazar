import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { GLOSSARY } from "@/lib/glossary";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "Глоссарий дебатов — термины и определения | Debate Club UZ" },
      { name: "description", content: "Ключевые термины дебатов: motion, rebuttal, POI, whip и другие с определениями." },
    ],
  }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return GLOSSARY;
    return GLOSSARY.filter(
      (x) =>
        x.term.toLowerCase().includes(s) ||
        x.ru.toLowerCase().includes(s) ||
        (x.en ?? "").toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">{t("glossary.title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("glossary.subtitle")}</p>

      <div className="mt-8 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("glossary.search")}
          className="pl-9 h-11"
        />
      </div>

      <div className="mt-8 grid gap-3">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground">{t("glossary.empty")}</p>
        ) : (
          filtered.map((x) => (
            <Card key={x.term} className="p-5 border-border/60 shadow-card">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-display text-lg font-semibold">{x.term}</span>
                {x.en && <span className="text-sm text-muted-foreground">/ {x.en.split(".")[0]}</span>}
              </div>
              <p className="mt-2 text-sm text-foreground/90">{x.ru}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
