import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, CalendarDays, Dumbbell, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = { to: string; label: string; icon: typeof Home; exact?: boolean };
const TABS: Tab[] = [
  { to: "/", label: "Главная", icon: Home, exact: true },
  { to: "/learn", label: "Обучение", icon: BookOpen },
  { to: "/debate-day", label: "День дебатов", icon: CalendarDays },
  { to: "/training", label: "Тренировка", icon: Dumbbell },
  { to: "/profile", label: "Профиль", icon: User },
];

export function BottomTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-border)] bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label="Основная навигация"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
          const Icon = t.icon;
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-[19px] w-[19px]", active && "stroke-[2.2]")} />
                <span className="leading-none">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
