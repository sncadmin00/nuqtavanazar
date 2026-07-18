import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { GraduationCap, Trophy, Users, Tv } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О платформе — Мезон" },
      { name: "description", content: "Образовательный дебатный клуб, стартующий в Бухаре с амбицией национального охвата." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">О платформе Мезон</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        «Мезон» — от слова «весы»: умение увидеть обе стороны вопроса. И одновременно — название фундаментальной частицы, из которой строится большее. Мы делаем инфраструктуру структурированного спора для всей страны и разрабатываем собственный формат дебатов вместо чужих брендов.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Milestone icon={GraduationCap} title="Старт" body="Первые тренировки в Бухаре — единый формат Мезон с режимами соло, 1×1, 2×2 и круглый стол." />
        <Milestone icon={Users} title="Сообщество" body="Открытая платформа для школьников, студентов и взрослых. Тренинги, воркшопы, показательные раунды." />
        <Milestone icon={Trophy} title="Лиги и турниры" body="Elo-рейтинг, зональная и республиканская лиги, регулярный «День дебатов» по субботам." />
        <Milestone icon={Tv} title="Национальные дебаты" body="Долгосрочная цель — университетские дебаты на национальном ТВ Узбекистана." />
      </div>

      <Card className="mt-10 p-6 border-border/60 shadow-card">
        <h2 className="font-display text-2xl font-bold">Контакты</h2>
        <p className="mt-2 text-muted-foreground">Пишите нам на <a className="text-primary underline" href="mailto:hello@mezon.uz">hello@mezon.uz</a>. Мы отвечаем всем желающим присоединиться.</p>
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
