import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, MessageSquareQuote, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; key: string; ai?: boolean; label?: string };

const NAV: NavItem[] = [
  { to: "/tutor", key: "nav.tutor", label: "AI-Тьютор", ai: true },
  { to: "/judge", key: "nav.judge", label: "AI-Судья", ai: true },
  { to: "/sparring", key: "nav.sparring", label: "AI-Спарринг", ai: true },
  { to: "/learn", key: "nav.learn" },
  { to: "/motions", key: "nav.motions" },
  { to: "/practice", key: "nav.practice" },
  { to: "/glossary", key: "nav.glossary" },
  { to: "/events", key: "nav.events" },
];

export function Header() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px gradient-sunset opacity-70" />
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="relative grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl gradient-brand text-brand-foreground shadow-glow transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
            <MessageSquareQuote className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-sunset-magenta ring-2 ring-background animate-pulse" />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-base sm:text-xl font-bold tracking-tight leading-none">
              Debate <span className="text-gradient-brand">UZ</span>
            </span>
            <span className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold inline-flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-sunset-orange" />
              AI Debate Platform
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
          {NAV.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-1.5 text-sm font-medium transition-colors duration-200",
                  item.ai
                    ? "font-display text-foreground/90 hover:text-foreground nav-glow"
                    : "text-muted-foreground hover:text-foreground",
                  active && item.ai && "text-gradient-brand nav-glow-active",
                  active && !item.ai && "text-foreground",
                  active && "after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:gradient-sunset",
                )}
              >
                {item.ai && (
                  <Sparkles
                    className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      active ? "text-sunset-magenta" : "text-sunset-orange",
                    )}
                  />
                )}
                {item.label ?? t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex font-medium">
                <Link to="/profile">{t("nav.profile")}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="hidden sm:inline-flex font-medium">
                {t("nav.signout")}
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex gradient-sunset text-primary-foreground hover:opacity-90 font-medium">
              <Link to="/auth">{t("nav.signin")}</Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("nav.menu")}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-border/40">
              <SheetTitle className="font-display text-xl">
                Debate Club <span className="text-gradient-brand">UZ</span>
              </SheetTitle>
              <nav className="mt-8 flex flex-col gap-1">
                {NAV.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        item.ai
                          ? "font-display text-foreground hover:bg-secondary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        active && item.ai && "bg-secondary text-gradient-brand",
                        active && !item.ai && "bg-secondary text-foreground",
                      )}
                    >
                      {item.ai && <Sparkles className="h-4 w-4 text-sunset-magenta" />}
                      {item.label ?? t(item.key)}
                    </Link>
                  );
                })}
                <div className="mt-6 border-t pt-6 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link to="/profile">{t("nav.profile")}</Link>
                      </Button>
                      <Button onClick={() => { signOut(); setOpen(false); }}>{t("nav.signout")}</Button>
                    </>
                  ) : (
                    <Button asChild onClick={() => setOpen(false)} className="gradient-sunset text-primary-foreground">
                      <Link to="/auth">{t("nav.signin")}</Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
