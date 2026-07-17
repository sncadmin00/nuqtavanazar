import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { MessageSquareQuote } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-brand-foreground">
              <MessageSquareQuote className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">Debate Club UZ</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{t("footer.tagline")}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link to="/learn" className="text-muted-foreground hover:text-foreground">{t("nav.learn")}</Link>
          <Link to="/motions" className="text-muted-foreground hover:text-foreground">{t("nav.motions")}</Link>
          <Link to="/glossary" className="text-muted-foreground hover:text-foreground">{t("nav.glossary")}</Link>
          <Link to="/practice" className="text-muted-foreground hover:text-foreground">{t("nav.practice")}</Link>
          <Link to="/judges" className="text-muted-foreground hover:text-foreground">{t("nav.judges")}</Link>
          <Link to="/events" className="text-muted-foreground hover:text-foreground">{t("nav.events")}</Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">{t("nav.about")}</Link>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          <p>Bukhara · Uzbekistan</p>
          <p className="mt-2">hello@debateclub.uz</p>
          <p className="mt-6 text-xs">{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
