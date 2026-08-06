import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";

export function MyRatingCard() {
  const { user } = useAuth();
  const t = useT();
  const [data, setData] = useState<{
    mastery: number;
    mastery_trend_week: number;
    display_name: string | null;
    league: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("player_ratings")
      .select("mastery, mastery_trend_week, display_name, league")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setData(data ?? {
          mastery: 1000,
          mastery_trend_week: 0,
          display_name: user.email?.split("@")[0] ?? t("rating.player"),
          league: "zonal",
        });
      });
  }, [user, t]);

  if (!user) {
    return (
      <Link to="/auth" className="block rounded-[16px] hairline bg-white p-4">
        <div className="formula-motif">{t("rating.eyebrow")}</div>
        <div className="mt-1.5 text-[15px] font-medium">{t("rating.signInPrompt")}</div>
        <div className="mt-2 text-[13px] text-primary font-medium">{t("rating.signInGo")}</div>
      </Link>
    );
  }

  if (!data) {
    return <div className="h-[76px] rounded-[16px] hairline bg-white" />;
  }

  const trend = data.mastery_trend_week;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-emerald-600" : trend < 0 ? "text-destructive" : "text-muted-foreground";
  const name = data.display_name || (user.email?.split("@")[0] ?? t("rating.player"));
  const leagueLabel = t(`league.${data.league}`);

  return (
    <div className="rounded-[16px] hairline bg-white">
      <Link to="/profile" className="flex items-center gap-3 p-4">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--color-ink)] text-sm font-semibold text-white">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium">{name}</div>
          <div className="text-[12px] text-muted-foreground">{leagueLabel}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-[24px] leading-none tabular-nums">{data.mastery}</div>
          <div className={`flex items-center justify-end gap-0.5 text-[11px] font-medium ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span className="font-mono tabular-nums">{trend > 0 ? "+" : ""}{trend}</span>
          </div>
        </div>
      </Link>
      <div className="grid grid-cols-2 border-t border-[color:var(--color-border)]">
        <Link to="/ratings" className="px-4 py-2.5 text-[12.5px] font-medium text-primary">
          Таблица рейтинга →
        </Link>
        <Link
          to="/tournaments"
          className="border-l border-[color:var(--color-border)] px-4 py-2.5 text-[12.5px] font-medium text-primary"
        >
          Турниры →
        </Link>
      </div>

    </div>
  );
}

