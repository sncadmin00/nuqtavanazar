import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Search, SlidersHorizontal } from "lucide-react";
import { listMotions, type MotionBankItem } from "@/lib/motions.functions";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/motions")({
  head: () => ({
    meta: [
      { title: "Банк тем об Узбекистане — Nuqta va Nazar" },
      {
        name: "description",
        content: "Темы для дебатов об истории, обществе, экономике и будущем Узбекистана, а также о мировых трендах.",
      },
      { property: "og:title", content: "Банк тем об Узбекистане — Nuqta va Nazar" },
      { property: "og:description", content: "Дебатные темы с узбекским контекстом и отдельным блоком мировых трендов." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => listMotions(),
  errorComponent: MotionBankError,
  notFoundComponent: MotionBankEmpty,
  component: MotionBankPage,
});

const COPY = {
  ru: {
    eyebrow: "Узбекистан · мир",
    title: "Банк тем",
    intro: "История, общество и будущее Узбекистана — рядом с мировыми вопросами, которые влияют на нас.",
    search: "Поиск по темам",
    all: "Все направления",
    allLevels: "Любая сложность",
    allFormats: "Все форматы",
    easy: "Лёгкая",
    medium: "Средняя",
    hard: "Сложная",
    both: "Любой формат",
    karl_popper: "Karl Popper",
    parliamentary: "Парламентский",
    uzbekistan: "Узбекистан",
    global: "Мировые тренды",
    found: "тем найдено",
    prepare: "Собрать кейс",
    none: "По этим фильтрам тем пока нет.",
  },
  uz: {
    eyebrow: "Oʻzbekiston · dunyo",
    title: "Mavzular banki",
    intro: "Oʻzbekiston tarixi, jamiyati va kelajagi — bizga taʼsir qiladigan jahon masalalari bilan birga.",
    search: "Mavzularni qidirish",
    all: "Barcha yoʻnalishlar",
    allLevels: "Har qanday daraja",
    allFormats: "Barcha formatlar",
    easy: "Oson",
    medium: "Oʻrta",
    hard: "Murakkab",
    both: "Har qanday format",
    karl_popper: "Karl Popper",
    parliamentary: "Parlament",
    uzbekistan: "Oʻzbekiston",
    global: "Jahon tendensiyalari",
    found: "ta mavzu topildi",
    prepare: "Keys tuzish",
    none: "Bu filtrlarga mos mavzu hozircha yoʻq.",
  },
  en: {
    eyebrow: "Uzbekistan · world",
    title: "Motion bank",
    intro: "Uzbekistan’s history, society and future alongside global questions that shape our lives.",
    search: "Search motions",
    all: "All themes",
    allLevels: "Any difficulty",
    allFormats: "All formats",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    both: "Any format",
    karl_popper: "Karl Popper",
    parliamentary: "Parliamentary",
    uzbekistan: "Uzbekistan",
    global: "Global trends",
    found: "motions found",
    prepare: "Build a case",
    none: "No motions match these filters yet.",
  },
} as const;

const CATEGORY_LABELS: Record<string, { ru: string; uz: string; en: string }> = {
  heritage: { ru: "Наследие", uz: "Meros", en: "Heritage" },
  history: { ru: "История", uz: "Tarix", en: "History" },
  culture: { ru: "Культура", uz: "Madaniyat", en: "Culture" },
  education: { ru: "Образование", uz: "Taʼlim", en: "Education" },
  regions: { ru: "Развитие регионов", uz: "Hududlar", en: "Regions" },
  society: { ru: "Общество", uz: "Jamiyat", en: "Society" },
  economics: { ru: "Экономика", uz: "Iqtisodiyot", en: "Economy" },
  technology: { ru: "Технологии", uz: "Texnologiya", en: "Technology" },
  environment: { ru: "Экология и вода", uz: "Ekologiya va suv", en: "Environment & water" },
  global: { ru: "Мировые тренды", uz: "Jahon tendensiyalari", en: "Global trends" },
  ethics: { ru: "Этика", uz: "Etika", en: "Ethics" },
  politics: { ru: "Управление", uz: "Boshqaruv", en: "Governance" },
  health: { ru: "Здоровье", uz: "Sogʻliq", en: "Health" },
};

function MotionBankPage() {
  const motions = Route.useLoaderData() as MotionBankItem[];
  const { lang } = useI18n();
  const c = COPY[lang];
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [format, setFormat] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(motions.map((motion) => motion.category))).sort(),
    [motions],
  );
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(lang);
    return motions.filter((motion) =>
      (!needle || motion.title.toLocaleLowerCase(lang).includes(needle)) &&
      (scope === "all" || motion.scope === scope) &&
      (category === "all" || motion.category === category) &&
      (difficulty === "all" || motion.difficulty === difficulty) &&
      (format === "all" || motion.format === format || motion.format === "both"),
    );
  }, [category, difficulty, format, lang, motions, query, scope]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <section className="border-b border-border pb-6">
        <div className="formula-motif text-primary">{c.eyebrow}</div>
        <h1 className="mt-2 text-[38px] leading-none sm:text-[48px]">{c.title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{c.intro}</p>
      </section>

      <section className="py-5" aria-label="Фильтры тем">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c.search} className="h-11 bg-card pl-10" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <FilterSelect value={scope} onChange={setScope} placeholder={c.uzbekistan} options={[
            ["all", c.all], ["uzbekistan", c.uzbekistan], ["global", c.global],
          ]} />
          <FilterSelect value={category} onChange={setCategory} placeholder={c.all} options={[
            ["all", c.all], ...categories.map((item) => [item, CATEGORY_LABELS[item]?.[lang] ?? item] as [string, string]),
          ]} />
          <FilterSelect value={difficulty} onChange={setDifficulty} placeholder={c.allLevels} options={[
            ["all", c.allLevels], ["easy", c.easy], ["medium", c.medium], ["hard", c.hard],
          ]} />
          <FilterSelect value={format} onChange={setFormat} placeholder={c.allFormats} options={[
            ["all", c.allFormats], ["karl_popper", c.karl_popper], ["parliamentary", c.parliamentary],
          ]} />
        </div>
        <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" /> {visible.length} {c.found}
        </div>
      </section>

      {visible.length === 0 ? (
        <MotionBankEmpty />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((motion) => (
            <article key={motion.id} className="flex min-h-52 flex-col rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase text-muted-foreground">
                <span className={motion.scope === "uzbekistan" ? "text-primary" : "text-foreground"}>
                  {motion.scope === "uzbekistan" ? c.uzbekistan : c.global}
                </span>
                <span aria-hidden>·</span>
                <span>{CATEGORY_LABELS[motion.category]?.[lang] ?? motion.category}</span>
              </div>
              <h2 className="mt-3 text-[19px] leading-snug">{motion.title}</h2>
              <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                <div className="text-[11px] text-muted-foreground">
                  <div>{c[motion.difficulty]}</div>
                  <div>{c[motion.format]}</div>
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <Link to="/case-builder" search={{ topic: motion.title, side: undefined }}>
                    {c.prepare}<ArrowRight />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-card"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{options.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function MotionBankEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
      Темы не найдены. Измените фильтры или поисковый запрос.
    </div>
  );
}

function MotionBankError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <BookOpen className="mx-auto h-8 w-8 text-primary" />
      <h1 className="mt-4 text-2xl">Банк тем не загрузился</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Button className="mt-5" onClick={reset}>Попробовать снова</Button>
    </div>
  );
}