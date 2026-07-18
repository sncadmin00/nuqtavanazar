import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mail } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "События и турниры дебатов | Мезон" },
      { name: "description", content: "Расписание встреч и турниров платформы Мезон." },
    ],
  }),
  component: EventsPage,
});

type Ev = { id: string; title: string; description: string | null; location: string | null; starts_at: string; format: string | null };

function EventsPage() {
  const { t } = useI18n();
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("events").select("*").order("starts_at", { ascending: true })
      .then(({ data }) => { setEvents((data as Ev[]) ?? []); setLoading(false); });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">{t("events.title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("events.subtitle")}</p>

      <div className="mt-8 grid gap-4">
        {loading ? (
          <p className="text-muted-foreground">…</p>
        ) : events.length === 0 ? (
          <p className="text-muted-foreground">{t("events.empty")}</p>
        ) : (
          events.map((e) => (
            <Card key={e.id} className="p-6 border-border/60 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">{e.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(e.starts_at).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    {e.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {e.location}
                      </span>
                    )}
                  </div>
                </div>
                {e.format && <Badge variant="outline" className="rounded-full">{e.format}</Badge>}
              </div>
              {e.description && <p className="mt-3 text-foreground/90">{e.description}</p>}
            </Card>
          ))
        )}
      </div>

      <Card className="mt-10 p-6 gradient-ink text-white">
        <h2 className="font-display text-2xl font-bold">{t("events.contact.title")}</h2>
        <p className="mt-2 text-white/80">{t("events.contact.body")}</p>
        <a href="mailto:hello@mezon.uz" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white text-foreground px-4 py-2 text-sm font-medium">
          <Mail className="h-4 w-4" /> hello@mezon.uz
        </a>
      </Card>
    </div>
  );
}
