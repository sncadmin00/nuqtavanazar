import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { LESSONS } from "@/lib/lessons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Trash2, Gavel, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({ meta: [{ title: "Личный кабинет | Debate Club UZ" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

type SavedCase = {
  id: string; motion_text: string; side: "pro" | "con" | null;
  thesis: string | null; conclusion: string | null; created_at: string;
};

type Evaluation = {
  id: string; motion: string; format: string; overall_score: number;
  scores: Record<string, number>; strengths: string[]; improvements: string[];
  created_at: string;
};

function ProfilePage() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("student");
  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [cases, setCases] = useState<SavedCase[]>([]);
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name ?? "");
          setCity(data.city ?? "");
          setRole(data.role ?? "student");
        }
      });
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id)
      .then(({ data }) => setProgress(new Set((data ?? []).map((r) => r.lesson_id))));
    supabase.from("saved_cases").select("id, motion_text, side, thesis, conclusion, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setCases((data as SavedCase[]) ?? []));
    supabase.from("judge_evaluations")
      .select("id, motion, format, overall_score, scores, strengths, improvements, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setEvals((data as Evaluation[]) ?? []));
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, display_name: displayName, city, role,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("profile.saved"));
  };

  const deleteCase = async (id: string) => {
    await supabase.from("saved_cases").delete().eq("id", id);
    setCases((prev) => prev.filter((c) => c.id !== id));
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">{t("profile.title")}</h1>
      <p className="mt-2 text-muted-foreground">{user.email}</p>

      <Card className="mt-8 p-6 border-border/60 shadow-card space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>{t("auth.displayName")}</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <Label>{t("profile.city")}</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Бухара" />
          </div>
          <div>
            <Label>{t("profile.role")}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="school">{t("profile.role.school")}</SelectItem>
                <SelectItem value="student">{t("profile.role.student")}</SelectItem>
                <SelectItem value="other">{t("profile.role.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={saveProfile} disabled={saving}>{t("profile.save")}</Button>
      </Card>

      <Card className="mt-6 p-6 border-border/60 shadow-card">
        <h2 className="font-display text-2xl font-bold">{t("profile.progress")}</h2>
        <div className="mt-4 space-y-2">
          {LESSONS.map((l) => {
            const done = progress.has(l.id);
            return (
              <div key={l.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs text-muted-foreground">{l.minutes} {t("learn.minutes")}</div>
                </div>
                {done ? (
                  <Badge className="rounded-full"><CheckCircle2 className="mr-1 h-3 w-3" /> {t("learn.completed")}</Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full">—</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <JudgeStatsCard evals={evals} />



      <Card className="mt-6 p-6 border-border/60 shadow-card">
        <h2 className="font-display text-2xl font-bold">{t("profile.cases")}</h2>
        <div className="mt-4 space-y-3">
          {cases.length === 0 ? (
            <p className="text-muted-foreground">{t("profile.noCases")}</p>
          ) : (
            cases.map((c) => (
              <div key={c.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.motion_text}</p>
                    {c.thesis && <p className="mt-1 text-sm text-muted-foreground">{c.thesis}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {c.side && <Badge variant="outline" className="rounded-full uppercase">{c.side}</Badge>}
                    <Button size="icon" variant="ghost" onClick={() => deleteCase(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function JudgeStatsCard({ evals }: { evals: Evaluation[] }) {
  if (evals.length === 0) {
    return (
      <Card className="mt-6 p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-brand-foreground">
            <Gavel className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold">AI-Инсайты</h2>
            <p className="text-sm text-muted-foreground">Пока нет оценок от AI-судьи</p>
          </div>
        </div>
        <Button asChild className="mt-4"><Link to="/judge">Оценить речь</Link></Button>
      </Card>
    );
  }

  const avg = evals.reduce((s, e) => s + (e.overall_score ?? 0), 0) / evals.length;
  const criteria: Record<string, number[]> = {};
  evals.forEach((e) => {
    Object.entries(e.scores ?? {}).forEach(([k, v]) => {
      (criteria[k] ??= []).push(Number(v) || 0);
    });
  });
  const avgByCrit = Object.entries(criteria).map(([k, arr]) => ({
    key: k, avg: arr.reduce((a, b) => a + b, 0) / arr.length,
  })).sort((a, b) => a.avg - b.avg);
  const weakest = avgByCrit[0];
  const strongest = avgByCrit[avgByCrit.length - 1];
  const recentImprovements = evals.slice(0, 3).flatMap((e) => e.improvements ?? []).slice(0, 4);

  return (
    <Card className="mt-6 p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-brand-foreground">
          <Gavel className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold">AI-Инсайты</h2>
          <p className="text-sm text-muted-foreground">На основе {evals.length} оценок AI-судьи</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs uppercase text-muted-foreground">Средний балл</div>
          <div className="mt-1 font-display text-3xl font-bold">{avg.toFixed(1)}<span className="text-base text-muted-foreground">/10</span></div>
        </div>
        {strongest && (
          <div className="rounded-xl border bg-green-500/10 p-4">
            <div className="text-xs uppercase text-green-700 dark:text-green-400">Сильная сторона</div>
            <div className="mt-1 font-semibold capitalize">{strongest.key}</div>
            <div className="text-sm text-muted-foreground">{strongest.avg.toFixed(1)}/10</div>
          </div>
        )}
        {weakest && weakest !== strongest && (
          <div className="rounded-xl border bg-red-500/10 p-4">
            <div className="text-xs uppercase text-red-700 dark:text-red-400">Зона роста</div>
            <div className="mt-1 font-semibold capitalize">{weakest.key}</div>
            <div className="text-sm text-muted-foreground">{weakest.avg.toFixed(1)}/10</div>
          </div>
        )}
      </div>

      {recentImprovements.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4" /> Рекомендации AI
          </div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {recentImprovements.map((t, i) => <li key={i}>• {t}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Button asChild size="sm"><Link to="/judge">Новая оценка</Link></Button>
        <Button asChild size="sm" variant="outline"><Link to="/learn">Открыть уроки</Link></Button>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold mb-2">Последние оценки</div>
        <div className="space-y-2">
          {evals.slice(0, 5).map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{e.motion}</div>
                <div className="text-xs text-muted-foreground uppercase">{e.format}</div>
              </div>
              <Badge className="rounded-full">{e.overall_score}/10</Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

