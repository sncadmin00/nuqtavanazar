import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Swords, Users, Trophy, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import type { HomeState } from "@/lib/home.functions";

type TeamSnap = {
  id: string;
  name: string;
  is_active: boolean;
  partner_id: string | null;
  owner_id: string;
} | null;

export function GameDayCards({ state }: { state: HomeState }) {
  const t = useT();
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamSnap>(null);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTeamLoading(false);
      return;
    }
    let alive = true;
    supabase
      .from("teams")
      .select("id, name, is_active, partner_id, owner_id")
      .or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setTeam(data as TeamSnap);
        setTeamLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const duelWindow: HomeState["duel_window"] = state.duel_window ?? {
    open: false,
    week_id: null,
    topic: null,
    event_at: null,
    event_ends_at: null,
    reason: "no_week",
  };

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <DuelQueueCard window={duelWindow} waiting={state.waiting_duels ?? 0} />
      <TeamBattleCard team={team} loading={teamLoading} />
      <TournamentCard tournaments={state.active_tournaments ?? []} />
      <AIWarmupCard topic={duelWindow.topic} />
    </section>
  );
}

function Card({
  icon: Icon,
  title,
  subtitle,
  children,
  href,
  cta,
  disabled,
  onClick,
  tone = "light",
}: {
  icon: typeof Swords;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  href?: string;
  cta?: string;
  disabled?: boolean;
  onClick?: () => void;
  tone?: "light" | "primary" | "ink";
}) {
  const bg = tone === "ink" ? "bg-[color:var(--color-ink)] text-white" : tone === "primary" ? "bg-primary text-primary-foreground" : "bg-white hairline";
  const titleColor = tone === "ink" || tone === "primary" ? "text-white" : "text-foreground";
  const subColor = tone === "ink" || tone === "primary" ? "text-white/70" : "text-muted-foreground";
  const ctaClass =
    tone === "ink"
      ? "bg-white/10 text-white hover:bg-white/20"
      : tone === "primary"
      ? "bg-white/20 text-white hover:bg-white/30"
      : "bg-primary text-primary-foreground hover:bg-primary/90";

  const body = (
    <div className={`rounded-[16px] p-4 ${bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
              tone === "light" ? "bg-[color:var(--color-table)] text-primary" : "bg-white/15 text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h3 className={`text-[15px] font-semibold ${titleColor}`}>{title}</h3>
            {subtitle && <p className={`text-[12px] ${subColor}`}>{subtitle}</p>}
          </div>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
      {cta && (
        <div className="mt-3">
          {href ? (
            <Link
              to={href}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${ctaClass}`}
            >
              {cta} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <button
              disabled={disabled}
              onClick={onClick}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold disabled:opacity-50 ${ctaClass}`}
            >
              {cta} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (href && !disabled) return body;
  return <div>{body}</div>;
}

function DuelQueueCard({ window, waiting }: { window: HomeState["duel_window"]; waiting: number }) {
  const t = useT();
  const open = window.open;
  const topic = window.topic;

  return (
    <Card
      icon={Swords}
      title={t("gameday.duel.title")}
      subtitle={open && topic ? topic : t("gameday.duel.subtitle")}
      href={open ? "/duel" : undefined}
      cta={open ? t("gameday.duel.enter") : t("gameday.duel.closed")}
      disabled={!open}
      onClick={!open ? () => toast(t(closedReason(window.reason))) : undefined}
    >
      {open && (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span className="live-dot" />
          {t("gameday.duel.queue", { n: waiting })}
        </div>
      )}
    </Card>
  );
}

function closedReason(reason: HomeState["duel_window"]["reason"]) {
  if (reason === "before") return "gameday.duel.before";
  if (reason === "after") return "gameday.duel.after";
  if (reason === "no_topic") return "gameday.duel.noTopic";
  return "gameday.duel.closed";
}

function TeamBattleCard({ team, loading }: { team: TeamSnap; loading: boolean }) {
  const t = useT();
  const { user } = useAuth();

  if (loading) {
    return (
      <Card icon={Users} title={t("gameday.team.title")} subtitle={t("gameday.team.subtitle")} cta={t("gameday.team.enter")} disabled>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!user) {
    return (
      <Card
        icon={Users}
        title={t("gameday.team.title")}
        subtitle={t("gameday.team.subtitle")}
        cta={t("gameday.team.signIn")}
        onClick={() => toast(t("rating.signInPrompt"))}
      />
    );
  }

  if (!team) {
    return (
      <Card
        icon={Users}
        title={t("gameday.team.title")}
        subtitle={t("gameday.team.noTeam")}
        href="/teams"
        cta={t("gameday.team.create")}
      />
    );
  }

  const active = team.is_active && !!team.partner_id;
  return (
    <Card
      icon={Users}
      title={team.name}
      subtitle={active ? t("gameday.team.active") : t("gameday.team.inactive")}
      href={active ? "/duel" : "/teams"}
      cta={active ? t("gameday.team.enter") : t("gameday.team.create")}
      tone={active ? "primary" : "light"}
    />
  );
}

function TournamentCard({ tournaments }: { tournaments: HomeState["active_tournaments"] }) {
  const t = useT();
  const first = tournaments[0];

  if (!first) {
    return (
      <Card
        icon={Trophy}
        title={t("gameday.tournament.title")}
        subtitle={t("gameday.tournament.empty")}
        href="/tournaments"
        cta={t("gameday.tournament.go")}
      />
    );
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <Card
      icon={Trophy}
      title={first.title}
      subtitle={`${t("gameday.tournament.subtitle")} · ${fmt(first.day1_at)} → ${fmt(first.day2_at)}`}
      href="/tournaments"
      cta={t("gameday.tournament.go")}
    />
  );
}

function AIWarmupCard({ topic }: { topic: string | null }) {
  const t = useT();
  const href = topic ? `/sparring?topic=${encodeURIComponent(topic)}` : "/sparring";

  return (
    <Card
      icon={Sparkles}
      title={t("gameday.ai.title")}
      subtitle={t("gameday.ai.subtitle")}
      href={href}
      cta={t("gameday.ai.start")}
      tone="ink"
    />
  );
}
