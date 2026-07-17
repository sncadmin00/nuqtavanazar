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
