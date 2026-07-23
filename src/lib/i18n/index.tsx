import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translate, tPlural, type Lang } from "./translations";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tp: (n: number, base: string) => string;
};

function fmt(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

const I18nContext = createContext<Ctx>({
  lang: "ru",
  setLang: () => {},
  t: (k) => translate("ru", k),
  tp: (n, base) => tPlural("ru", n, base),
});

const STORAGE_KEY = "dcuz.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved === "ru" || saved === "uz" || saved === "en") setLangState(saved);
    } catch {
      /* noop */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* noop */
    }
  };

  const t = (key: string, vars?: Record<string, string | number>) => fmt(translate(lang, key), vars);
  const tp = (n: number, base: string) => tPlural(lang, n, base);

  return <I18nContext.Provider value={{ lang, setLang, t, tp }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  return useContext(I18nContext).t;
}
