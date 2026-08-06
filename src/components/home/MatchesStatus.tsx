import { Link } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import { toast } from "sonner";
import type { MatchesStatus as MatchesStatusT } from "@/lib/home.functions";
import { useT, useI18n } from "@/lib/i18n";
import { tPlural } from "@/lib/i18n/translations";

export function MatchesStatus({ matches, revealed }: { matches: MatchesStatusT; revealed: boolean }) {
  const t = useT();
  const isLive = matches.mode === "live";
  return (
    <section>
      <div className="flex items-center gap-2 px-1">
        {isLive && <span className="live-dot" />}
        <h3 className="text-[15px] font-semibold">
          {isLive ? t("matches.onAir") : t("matches.registered")}
        </h3>
      </div>
      <p className="mt-1 px-1 text-[12px] text-muted-foreground">
        {isLive
          ? t("matches.themeWeek")
          : revealed
          ? t("matches.beforeStart")
          : t("matches.hiddenHint")}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <FormatCard label="1 × 1" count={matches.one_v_one} listeners={matches.listeners_one} live={isLive} href="/duel" />
        <FormatCard label="2 × 2" count={matches.two_v_two} listeners={matches.listeners_two} live={isLive} />
      </div>
    </section>
  );
}

function FormatCard({ label, count, listeners, live, href }: { label: string; count: number; listeners: number; live: boolean; href?: "/duel" }) {
  const t = useT();
  const { lang } = useI18n();
  const roomsWord = tPlural(lang, count, "matches.rooms");
  const recordedWord = tPlural(lang, count, "matches.recorded");
  const cls = "block rounded-[14px] hairline bg-white p-3.5 text-left active:scale-[0.99]";
  const inner = (
    <>
      <div className="flex items-center gap-1.5">
        <Swords className="h-4 w-4 text-primary" />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground">{label}</span>
      </div>
      <div className="mt-2 font-display text-[26px] leading-none tabular-nums">{count}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">
        {live ? `${roomsWord} · ${listeners} ${t("matches.listeners")}` : recordedWord}
      </div>
    </>
  );
  if (href) {
    return (
      <Link to={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={() => toast(live ? t("rt.listenSoon") : t("matches.applySoon"))} className={cls}>
      {inner}
    </button>
  );
}

