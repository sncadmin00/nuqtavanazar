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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-brand-foreground shadow-glow">
            <MessageSquareQuote className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight hidden sm:inline">
            Debate Club <span className="text-gradient-brand">UZ</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary",
                isActive(item.to) && "text-foreground bg-secondary",
                item.ai && "text-primary hover:text-primary",
              )}
            >
              {item.ai && <Sparkles className="h-3 w-3" />}
              {item.label ?? t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/profile">{t("nav.profile")}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="hidden sm:inline-flex">
                {t("nav.signout")}
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">{t("nav.signin")}</Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("nav.menu")}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display">Debate Club UZ</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                      isActive(item.to) && "bg-secondary text-foreground",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <div className="mt-4 border-t pt-4 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link to="/profile">{t("nav.profile")}</Link>
                      </Button>
                      <Button onClick={() => { signOut(); setOpen(false); }}>{t("nav.signout")}</Button>
                    </>
                  ) : (
                    <Button asChild onClick={() => setOpen(false)}>
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
