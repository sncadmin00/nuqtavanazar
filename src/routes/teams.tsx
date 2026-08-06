import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, Crown, Loader2, LogOut, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { resolveMyName } from "@/lib/challenges";
import {
  cancelTeamInvite,
  createTeam,
  disbandTeam,
  getMyTeam,
  getTeamRating,
  inviteToTeam,
  leaveTeam,
  listFreeAgents,
  listMyTeamInvites,
  removePartner,
  renameTeam,
  respondTeamInvite,
  type TeamInviteRow,
  type TeamRow,
} from "@/lib/teams";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Моя команда 2×2 — Nuqta va Nazar" },
      {
        name: "description",
        content:
          "Создайте постоянную команду для батлов 2×2: пригласите второго спикера, меняйте состав и следите за командным рейтингом Elo.",
      },
      { property: "og:title", content: "Моя команда 2×2 — Nuqta va Nazar" },
      {
        property: "og:description",
        content: "Постоянные команды с админом и вторым спикером, приглашения и отдельный командный рейтинг.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeamsPage,
});

type Agent = { user_id: string; display_name: string | null; mastery: number };

function TeamsPage() {
  const { user, loading } = useAuth();
  const [team, setTeam] = useState<TeamRow | null>(null);
  const [rating, setRating] = useState({ elo: 1000, matches_played: 0, wins: 0 });
  const [invites, setInvites] = useState<TeamInviteRow[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [myName, setMyName] = useState("Спикер");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    const [t, inv, nm] = await Promise.all([
      getMyTeam(user.id),
      listMyTeamInvites(user.id),
      resolveMyName(user.id, user.email),
    ]);
    setTeam(t);
    setInvites(inv);
    setMyName(nm);
    if (t) setRating(await getTeamRating(t.id));
    if (t && t.owner_id === user.id && !t.partner_id) {
      setAgents((await listFreeAgents([user.id])) as Agent[]);
    } else {
      setAgents([]);
    }
    setReady(true);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setReady(true);
      return;
    }
    refresh();
  }, [user, refresh]);

  const guarded = async (id: string, fn: () => Promise<unknown>) => {
    setBusy(id);
    try {
      await fn();
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не получилось");
    } finally {
      setBusy(null);
    }
  };

  if (loading || !ready) {
    return (
      <Shell>
        <div className="p-6 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="rounded-[16px] hairline bg-white p-5 text-center">
          <Users className="mx-auto h-7 w-7 text-primary" />
          <h2 className="mt-2 font-display text-[20px]">Команды 2×2</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Войдите, чтобы создать команду или принять приглашение.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-flex rounded-[12px] bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground"
          >
            Войти
          </Link>
        </div>
      </Shell>
    );
  }

  const incoming = invites.filter((i) => i.to_user_id === user.id);
  const outgoing = invites.filter((i) => i.from_user_id === user.id);
  const isOwner = team?.owner_id === user.id;

  return (
    <Shell>
      <header className="mb-3 px-1">
        <div className="formula-motif">Команды</div>
        <h1 className="mt-1 font-display text-[24px] leading-tight">Постоянная пара для 2×2</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Команду создаёт админ и приглашает второго спикера. Состав можно менять: если игрок уходит, команда
          становится неактивной, но рейтинг сохраняется.
        </p>
      </header>

      {incoming.length > 0 && (
        <section className="mb-3 space-y-2">
          <div className="px-1 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Приглашения вам
          </div>
          {incoming.map((i) => (
            <div key={i.id} className="flex items-center gap-3 rounded-[14px] hairline bg-white px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium">{i.team_name}</div>
                <div className="text-[11.5px] text-muted-foreground">{i.from_name} зовёт вас вторым спикером</div>
              </div>
              <button
                disabled={busy === i.id}
                onClick={() =>
                  guarded(i.id, async () => {
                    await respondTeamInvite(i.id, true);
                    toast.success("Вы в команде");
                  })
                }
                className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
                aria-label="Принять"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                disabled={busy === i.id}
                onClick={() => guarded(i.id, () => respondTeamInvite(i.id, false))}
                className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground disabled:opacity-40"
                aria-label="Отклонить"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>
      )}

      {!team ? (
        <section className="rounded-[16px] hairline bg-white p-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="text-[15px] font-semibold">Создать команду</h2>
          </div>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Вы станете админом команды: сможете приглашать и менять второго спикера.
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название команды"
            maxLength={40}
            className="mt-3 w-full rounded-[12px] hairline bg-background px-3.5 py-2.5 text-[14px] outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            disabled={busy === "create"}
            onClick={() =>
              guarded("create", async () => {
                await createTeam(name, user.id, myName);
                setName("");
                toast.success("Команда создана — пригласите второго спикера");
              })
            }
            className="mt-3 w-full rounded-[12px] bg-primary py-3 text-[14px] font-semibold text-primary-foreground disabled:opacity-50"
          >
            Создать
          </button>
        </section>
      ) : (
        <section className="rounded-[16px] hairline bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-display text-[20px] leading-tight">{team.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge active={team.is_active} />
                <span className="text-[12px] text-muted-foreground">
                  Elo {rating.elo} · {rating.matches_played} батлов
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <MemberRow name={team.owner_name ?? "Админ"} role="Админ команды" owner />
            {team.partner_id ? (
              <MemberRow
                name={team.partner_name ?? "Спикер"}
                role="Второй спикер"
                action={
                  isOwner ? (
                    <button
                      disabled={busy === "remove"}
                      onClick={() =>
                        guarded("remove", async () => {
                          await removePartner(team.id);
                          toast.success("Спикер удалён из состава");
                        })
                      }
                      className="rounded-full bg-muted px-3 py-1.5 text-[12px] font-medium text-muted-foreground disabled:opacity-40"
                    >
                      Убрать
                    </button>
                  ) : (
                    <button
                      disabled={busy === "leave"}
                      onClick={() =>
                        guarded("leave", async () => {
                          await leaveTeam(team.id);
                          toast.success("Вы покинули команду");
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[12px] font-medium text-muted-foreground disabled:opacity-40"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Выйти
                    </button>
                  )
                }
              />
            ) : (
              <div className="rounded-[12px] border border-dashed border-[color:var(--color-border)] px-3.5 py-3 text-[12.5px] text-muted-foreground">
                Место второго спикера свободно — команда не может выходить на батлы.
              </div>
            )}
          </div>

          {isOwner && (
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={team.name}
                  maxLength={40}
                  className="min-w-0 flex-1 rounded-[12px] hairline bg-background px-3.5 py-2 text-[13.5px] outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  disabled={busy === "rename" || name.trim().length < 2}
                  onClick={() =>
                    guarded("rename", async () => {
                      await renameTeam(team.id, name);
                      setName("");
                      toast.success("Название обновлено");
                    })
                  }
                  className="shrink-0 rounded-[12px] hairline bg-background px-3 text-[13px] font-semibold disabled:opacity-40"
                >
                  Переименовать
                </button>
              </div>
              <button
                disabled={busy === "disband"}
                onClick={() =>
                  guarded("disband", async () => {
                    await disbandTeam(team.id);
                    toast.success("Команда распущена");
                  })
                }
                className="inline-flex items-center gap-1.5 text-[12.5px] text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Распустить команду
              </button>
            </div>
          )}
        </section>
      )}

      {outgoing.length > 0 && (
        <section className="mt-3 space-y-2">
          <div className="px-1 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Отправленные приглашения
          </div>
          {outgoing.map((i) => (
            <div key={i.id} className="flex items-center gap-3 rounded-[14px] hairline bg-white px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium">{i.to_name}</div>
                <div className="text-[11.5px] text-muted-foreground">Ждём ответа</div>
              </div>
              <button
                disabled={busy === i.id}
                onClick={() => guarded(i.id, () => cancelTeamInvite(i.id))}
                className="rounded-full bg-muted px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground disabled:opacity-40"
              >
                Отменить
              </button>
            </div>
          ))}
        </section>
      )}

      {team && team.owner_id === user.id && !team.partner_id && (
        <section className="mt-3 rounded-[16px] hairline bg-white p-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="text-[15px] font-semibold">Пригласить второго спикера</h3>
          </div>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Игроки без команды:</p>
          {agents.length === 0 ? (
            <p className="mt-3 text-[13px] text-muted-foreground">Свободных игроков пока нет.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {agents.slice(0, 30).map((a) => {
                const invited = outgoing.some((o) => o.to_user_id === a.user_id);
                return (
                  <li key={a.user_id} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--color-ink)] text-[13px] font-semibold text-white">
                      {(a.display_name ?? "И").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{a.display_name ?? "Игрок"}</span>
                      <span className="block text-[11.5px] text-muted-foreground">Мастерство {a.mastery}</span>
                    </span>
                    <button
                      disabled={busy === a.user_id || invited}
                      onClick={() =>
                        guarded(a.user_id, async () => {
                          await inviteToTeam({
                            team,
                            fromUserId: user.id,
                            fromName: myName,
                            toUserId: a.user_id,
                            toName: a.display_name ?? "Спикер",
                          });
                          toast.success("Приглашение отправлено");
                        })
                      }
                      className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground disabled:opacity-40"
                    >
                      {invited ? "Отправлено" : "Пригласить"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <Link
        to="/ratings"
        className="mt-3 block rounded-[14px] hairline bg-white px-4 py-3 text-[13px] font-medium text-muted-foreground"
      >
        Рейтинг команд →
      </Link>
    </Shell>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold " +
        (active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")
      }
    >
      <span className={"h-1.5 w-1.5 rounded-full " + (active ? "bg-primary" : "bg-muted-foreground")} />
      {active ? "Активна" : "Не активна"}
    </span>
  );
}

function MemberRow({
  name,
  role,
  owner,
  action,
}: {
  name: string;
  role: string;
  owner?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] bg-background px-3.5 py-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--color-ink)] text-[13px] font-semibold text-white">
        {name.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 truncate text-[13.5px] font-medium">
          {name}
          {owner && <Crown className="h-3.5 w-3.5 text-primary" />}
        </span>
        <span className="block text-[11.5px] text-muted-foreground">{role}</span>
      </span>
      {action}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-4">
      <Link to="/" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Главная
      </Link>
      {children}
    </div>
  );
}
