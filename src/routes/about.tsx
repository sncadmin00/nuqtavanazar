import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { GraduationCap, Trophy, Users, Tv } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О клубе — Debate Club Uzbekistan" },
      { name: "description", content: "Образовательный дебатный клуб, стартующий в Бухаре с амбицией национального охвата." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">{t("about.title")}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t("about.subtitle")}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Milestone icon={GraduationCap} title="Старт" body="Университеты Бухары — первые тренировки, разбор форматов Karl Popper и Asian Parliamentary." />
        <Milestone icon={Users} title="Сообщество" body="Открытый клуб для школьников и студентов. Тренинги, воркшопы, показательные раунды." />
        <Milestone icon={Trophy} title="Турниры" body="Межвузовские соревнования и первые национальные турниры." />
        <Milestone icon={Tv} title="Национальные дебаты" body="Долгосрочная цель — университетские дебаты на национальном ТВ Узбекистана." />
      </div>

      <Card className="mt-10 p-6 border-border/60 shadow-card">
        <h2 className="font-display text-2xl font-bold">Контакты</h2>
        <p className="mt-2 text-muted-foreground">Пишите нам на <a className="text-primary underline" href="mailto:hello@debateclub.uz">hello@debateclub.uz</a>. Мы отвечаем всем желающим присоединиться.</p>
      </Card>
    </div>
  );
}

function Milestone({ icon: Icon, title, body }: { icon: typeof GraduationCap; title: string; body: string }) {
  return (
    <Card className="p-5 border-border/60 shadow-card">
      <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-brand-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Card>
  );
}
