import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2 } from "lucide-react";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Тренировка кейса — конструктор речи | Debate Club UZ" },
      { name: "description", content: "Соберите структуру речи: тезис, аргументы, примеры, заключение. Сохраните черновик." },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [motion, setMotion] = useState("");
  const [side, setSide] = useState<"pro" | "con">("pro");
  const [thesis, setThesis] = useState("");
  const [args, setArgs] = useState<{ title: string; body: string }[]>([{ title: "", body: "" }]);
  const [conclusion, setConclusion] = useState("");
  const [saving, setSaving] = useState(false);

  const updateArg = (i: number, patch: Partial<{ title: string; body: string }>) => {
    setArgs((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  };
  const addArg = () => setArgs((p) => [...p, { title: "", body: "" }]);
  const removeArg = (i: number) => setArgs((p) => p.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!user) { toast.info(t("practice.loginRequired")); return; }
    if (!motion.trim()) { toast.error("Укажите тему"); return; }
    setSaving(true);
    const { error } = await supabase.from("saved_cases").insert({
      user_id: user.id,
      motion_text: motion.trim(),
      side, thesis, conclusion,
      arguments: args as unknown as never,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("practice.saved"));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">{t("practice.title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("practice.subtitle")}</p>

      <Card className="mt-8 p-6 space-y-5 border-border/60 shadow-card">
        <div>
          <Label>{t("practice.motion")}</Label>
          <Input value={motion} onChange={(e) => setMotion(e.target.value)} placeholder="Этот дом…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t("practice.side")}</Label>
            <Select value={side} onValueChange={(v) => setSide(v as "pro" | "con")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">{t("practice.side.pro")}</SelectItem>
                <SelectItem value="con">{t("practice.side.con")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>{t("practice.thesis")}</Label>
          <Textarea value={thesis} onChange={(e) => setThesis(e.target.value)} rows={3} placeholder="Сформулируйте главный тезис…" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t("practice.arguments")}</Label>
            <Button size="sm" variant="outline" onClick={addArg}>
              <Plus className="mr-1 h-4 w-4" /> {t("practice.addArgument")}
            </Button>
          </div>
          {args.map((a, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-2 bg-secondary/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("practice.argument")} {i + 1}</span>
                {args.length > 1 && (
                  <Button size="icon" variant="ghost" onClick={() => removeArg(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input value={a.title} onChange={(e) => updateArg(i, { title: e.target.value })} placeholder="Заголовок аргумента" />
              <Textarea value={a.body} onChange={(e) => updateArg(i, { body: e.target.value })} rows={3} placeholder="Объяснение, доказательство, вывод (AREA)" />
            </div>
          ))}
        </div>

        <div>
          <Label>{t("practice.conclusion")}</Label>
          <Textarea value={conclusion} onChange={(e) => setConclusion(e.target.value)} rows={3} placeholder="Закройте столкновения и подведите итог…" />
        </div>

        <Button size="lg" className="w-full rounded-full" onClick={save} disabled={saving}>
          <Save className="mr-1.5 h-4 w-4" /> {t("practice.save")}
        </Button>
      </Card>
    </div>
  );
}
