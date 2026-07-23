import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import type { RatingRow } from "@/lib/home.functions";
import { useT } from "@/lib/i18n";

export function WeekRankingFull({ rows }: { rows: RatingRow[] }) {
  const { user } = useAuth();
  const t = useT();
  const myId = user?.id;
  const myInTop = rows.some((r) => r.user_id === myId);
  const myRow = !myInTop ? rows.find((r) => r.user_id === myId) : null;

  return (
    <section className="rounded-[16px] hairline bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[14.5px] font-semibold">{t("ranking.title")}</h3>
        <Link to="/profile" className="formula-motif !text-primary">{t("ranking.leagueLink")}</Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-[12px] text-muted-foreground">{t("ranking.empty")}</p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {rows.slice(0, 3).map((r, idx) => (
            <Row key={r.user_id} rank={idx + 1} row={r} highlight={r.user_id === myId} />
          ))}
        </ol>
      )}

      {myRow && (
        <>
          <div className="my-2 border-t border-dashed border-border" />
          <Row rank={rows.findIndex((r) => r.user_id === myId) + 1} row={myRow} highlight />
        </>
      )}
    </section>
  );
}

function Row({ rank, row, highlight }: { rank: number; row: RatingRow; highlight?: boolean }) {
  const trend = row.mastery_trend_week;
  return (
    <li
      className={
        "flex items-center gap-3 rounded-[10px] px-2 py-1.5 " +
        (highlight ? "bg-primary/10 text-foreground" : "")
      }
    >
      <span className="w-5 font-mono text-[12px] tabular-nums text-muted-foreground">{rank}</span>
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--color-table)] text-[11px] font-semibold">
        {(row.display_name ?? "?").slice(0, 1).toUpperCase()}
      </span>
      <span className={"min-w-0 flex-1 truncate text-[13px] " + (highlight ? "font-semibold text-primary" : "")}>
        {row.display_name ?? "—"}
      </span>
      <span className="font-mono text-[12px] tabular-nums text-foreground">{row.mastery}</span>
      {trend !== 0 && (
        <span
          className={
            "font-mono text-[10.5px] tabular-nums " +
            (trend > 0 ? "text-primary" : "text-muted-foreground")
          }
        >
          {trend > 0 ? "+" : ""}
          {trend}
        </span>
      )}
    </li>
  );
}
