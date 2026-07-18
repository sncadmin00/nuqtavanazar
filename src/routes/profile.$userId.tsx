import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Swords, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/profile/$userId")({
  head: () => ({
    meta: [{ title: "Профиль игрока — Мезон" }],
  }),
  component: PublicProfilePage,
});

const LEAGUE_LABEL: Record<string, string> = { zonal: "Зональная лига", republic: "Республиканская лига" };

function PublicProfilePage() {
  const { userId } = useParams({ from: "/profile/$userId" });
  const { user } = useAuth();
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("player_ratings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setP(data));
  }, [userId]);

  if (user?.id === userId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-4">
        <Link to="/profile" className="text-[13px] text-primary">Открыть свой профиль →</Link>
      </div>
    );
  }

  if (!p) return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted-foreground">Загрузка…</div>;

  const name = p.display_name ?? "Игрок";

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <Link to="/profile" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> назад
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--color-ink)] text-lg font-semibold text-white">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-[17px] font-semibold leading-tight">{name}</div>
            <div className="mt-0.5 text-[12.5px] text-muted-foreground">
              {LEAGUE_LABEL[p.league] ?? p.league}
            </div>
          </div>
        </div>
        <button
          onClick={() => toast("Challenge отправится, когда матчинг откроется")}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          <Swords className="h-4 w-4" /> Challenge
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Мастерство" value={p.mastery} accent />
        <Stat label="Тук" value={p.knock} />
        <Stat label="Модератор" value={p.moderator || null} />
      </div>

      <div className="rounded-[16px] hairline bg-white p-4 text-[13px] text-muted-foreground">
        Матчей сыграно: <span className="font-mono tabular-nums text-foreground">{p.matches_played}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number | null; accent?: boolean }) {
  return (
    <div className={`rounded-[14px] p-3 text-center ${accent ? "bg-primary/10" : "hairline bg-white"}`}>
      <div className={`font-mono text-[22px] font-semibold leading-none tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>
        {value == null ? "—" : value}
      </div>
      <div className="mt-1 text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
