import { useI18n } from "@/lib/i18n";
import { LANGUAGES, type Lang } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center rounded-full hairline bg-white p-0.5 text-[11px] font-medium">
      {LANGUAGES.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code as Lang)}
            aria-pressed={active}
            className={
              "px-2 py-1 rounded-full transition-colors " +
              (active
                ? "bg-[color:var(--color-ink)] text-white"
                : "text-foreground/70 hover:text-foreground")
            }
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
