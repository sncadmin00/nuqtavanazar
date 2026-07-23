import { Link } from "@tanstack/react-router";
import wordmark from "@/assets/wordmark.svg";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useT } from "@/lib/i18n";

export function Header() {
  const { user } = useAuth();
  const t = useT();
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
        <Link
          to="/"
          aria-label={t("header.brandAria")}
          className="flex items-center gap-2.5 rounded-[12px] pl-2.5 pr-3 py-1.5"
          style={{ background: "#0A0E29" }}
        >
          <svg viewBox="0 0 100 92" width="22" height="20.24" aria-hidden="true">
            <circle cx="14.81" cy="20.33" r="6.98" fill="#BEBBBC"/>
            <circle cx="75.78" cy="9.82" r="5.37" fill="#BEBBBC"/>
            <circle cx="9.25" cy="78.41" r="9.25" fill="#FFFFFF"/>
            <circle cx="85.03" cy="69.16" r="7.88" fill="#FFFFFF"/>
            <circle cx="45.93" cy="42.58" r="10.69" fill="#F66434"/>
          </svg>
          <span aria-hidden="true" style={{ width: 1, height: 20, background: "#FFFFFF", opacity: 0.9 }} />
          <img src={wordmark} alt="nuqta va nazar" style={{ height: 14, width: "auto", display: "block" }} />

        </Link>



        <div className="flex items-center gap-1">
          <LanguageSwitcher />
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
              {t("header.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
