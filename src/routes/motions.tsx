import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { generateMotion } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Loader2, Shuffle } from "lucide-react";

export const Route = createFileRoute("/motions")({
  head: () => ({
    meta: [
      { title: "Банк тем — мотивации для дебатов | Debate Club UZ" },
      { name: "description", content: "База дебатных тем (motions) для тренировок. Фильтр по формату и категории." },
    ],
  }),
  component: MotionsPage,
});

type Motion = {
  id: string;
  title: string;
  category: string;
  format: "karl_popper" | "parliamentary" | "both";
  language: string;
  created_at: string;
};

const CATEGORIES = ["politics","economics","ethics","technology","education","environment","health","culture","other"];
const FORMATS: Motion["format"][] = ["karl_popper", "parliamentary", "both"];

function MotionsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [motions, setMotions] = useState<Motion[]>([]);
  const [loading, setLoading] = useState(true);
  const [fFormat, setFFormat] = useState<string>("all");
  const [fCategory, setFCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("motions")
      .select("*")
      .order("created_at", { ascending: false });
    setMotions((data as Motion[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = motions.filter(
    (m) =>
      (fFormat === "all" || m.format === fFormat) &&
      (fCategory === "all" || m.category === fCategory),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">{t("motions.title")}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("motions.subtitle")}</p>
        </div>
        {user ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="mr-1 h-4 w-4" /> {t("motions.add")}
              </Button>
            </DialogTrigger>
            <AddMotionDialog onClose={() => { setOpen(false); load(); }} />
          </Dialog>
        ) : (
          <Badge variant="secondary" className="rounded-full">{t("motions.loginToAdd")}</Badge>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Label className="text-xs text-muted-foreground">{t("motions.filter.format")}</Label>
          <Select value={fFormat} onValueChange={setFFormat}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("motions.filter.all")}</SelectItem>
              {FORMATS.map((f) => (
                <SelectItem key={f} value={f}>{t(`format.${f}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Label className="text-xs text-muted-foreground">{t("motions.filter.category")}</Label>
          <Select value={fCategory} onValueChange={setFCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("motions.filter.all")}</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{t(`category.${c}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {loading ? (
          <p className="text-muted-foreground">…</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">{t("motions.empty")}</p>
        ) : (
          filtered.map((m) => (
            <Card key={m.id} className="p-6 border-border/60 shadow-card">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary" className="rounded-full">{t(`category.${m.category}`) ?? m.category}</Badge>
                <Badge variant="outline" className="rounded-full">{t(`format.${m.format}`)}</Badge>
              </div>
              <p className="mt-3 font-display text-lg font-semibold leading-snug">{m.title}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function AddMotionDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("politics");
  const [format, setFormat] = useState<Motion["format"]>("both");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user || !title.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("motions").insert({
      title: title.trim(), category, format, created_by: user.id, language: "ru",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Тема добавлена");
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("motions.addTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>{t("motions.form.title")}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Этот дом…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("motions.form.category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{t(`category.${c}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("motions.form.format")}</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as Motion["format"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>{t(`format.${f}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={submit} disabled={submitting || !title.trim()} className="w-full">
          {t("motions.form.submit")}
        </Button>
      </div>
    </DialogContent>
  );
}
