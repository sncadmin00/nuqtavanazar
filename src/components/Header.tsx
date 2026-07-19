import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!user) { setRating(null); setName(""); return; }
    supabase
      .from("player_ratings")
      .select("mastery, display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRating(data?.mastery ?? 1000);
        setName(data?.display_name ?? (user.email?.split("@")[0] ?? ""));
      });
  }, [user]);

  const initial = (name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[color:var(--color-cream)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Nuqta va Nazar — на главную">
          <svg viewBox="0 0 100 100" width="26" height="26" aria-hidden="true">
            <circle cx="32" cy="34" r="3.2" fill="#1A1A2E" opacity="0.55"/>
            <circle cx="71" cy="23" r="3.0" fill="#1A1A2E" opacity="0.45"/>
            <circle cx="26" cy="71" r="4.6" fill="#1A1A2E"/>
            <circle cx="75" cy="64" r="4.3" fill="#1A1A2E"/>
            <circle cx="50" cy="50" r="7.0" fill="#E8562D"/>
          </svg>
          <span
            className="text-[16px] leading-none text-[color:var(--color-ink)]"
            style={{ fontFamily: "'Federo', serif" }}
          >
            nuqta <span style={{ color: "#E8562D" }}>va</span> nazar
          </span>
        </Link>

        {user ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-full hairline bg-white pl-1 pr-3 py-1"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--color-ink)] text-[11px] font-semibold text-white">
              {initial}
            </span>
            <span className="font-mono text-[13px] font-medium tabular-nums text-foreground">
              {rating ?? "—"}
            </span>
          </Link>
        ) : (
          <Link
            to="/auth"
            className="rounded-full bg-[color:var(--color-ink)] px-4 py-1.5 text-[13px] font-medium text-white"
          >
            Войти
          </Link>
        )}
      </div>
    </header>
  );
}
