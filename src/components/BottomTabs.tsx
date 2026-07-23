import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, CalendarDays, Dumbbell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

type Tab = { to: string; key: string; icon: typeof Home; exact?: boolean };
const TABS: Tab[] = [
  { to: "/", key: "tabs.home", icon: Home, exact: true },
  { to: "/learn", key: "tabs.learn", icon: BookOpen },
  { to: "/debate-day", key: "tabs.debateDay", icon: CalendarDays },
  { to: "/training", key: "tabs.training", icon: Dumbbell },
  { to: "/profile", key: "tabs.profile", icon: User },
];

export function BottomTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-border)] bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label={t("tabs.ariaNav")}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.to : pathname === tab.to || pathname.startsWith(tab.to + "/");
          const Icon = tab.icon;
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to as string}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-[19px] w-[19px]", active && "stroke-[2.2]")} />
                <span className="leading-none">{t(tab.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
