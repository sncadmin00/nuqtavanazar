import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { judgeSpeech } from "@/lib/ai.functions";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Gavel, Loader2, Sparkles, ThumbsUp, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/judge")({
  head: () => ({
    meta: [
      { title: "AI-Судья — оценка твоей речи | Debate Club UZ" },
      { name: "description", content: "AI-судья оценивает речь дебатёра по критериям формата: структура, аргументация, доказательства, опровержение, убедительность. Настоящий ballot от AI." },
    ],
  }),
  ssr: false,
  component: JudgePage,
});

type JudgeResult = {
  scores: Record<string, number>;
  overall: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  criteria: { key: string; label: string }[];
};

function JudgePage() {
  const { user } = useAuth();
  const [motion, setMotion] = useState("");
  const [format, setFormat] = useState<"karl_popper" | "parliamentary">("karl_popper");
  const [side, setSide] = useState("pro");
  const [speech, setSpeech] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const judge = useServerFn(judgeSpeech);

  const submit = async () => {
    if (!motion.trim() || speech.trim().length < 50) {
      toast.error("Заполните тему и речь (минимум 50 символов)");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await judge({ data: { motion, format, side, speech } });
      setResult(res as JudgeResult);

      if (user) {
        await supabase.from("judge_evaluations").insert({
          user_id: user.id,
          motion,
          format,
          side,
          speech,
          overall_score: res.overall,
          scores: res.scores,
          feedback: res.feedback,
          strengths: res.strengths,
          improvements: res.improvements,
        });
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8">
        <Badge variant="secondary" className="rounded-full"><Sparkles className="mr-1 h-3 w-3" /> AI-платформа</Badge>
        <h1 className="mt-3 flex items-center gap-3 font-display text-4xl md:text-5xl font-bold">
          <Gavel className="h-8 w-8 text-primary" /> AI-Судья
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Вставь текст своей речи или кейса — AI-судья оценит её по критериям формата и выдаст настоящий ballot с фидбеком.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border-border/60 shadow-card space-y-4">
          <h2 className="font-display text-xl font-bold">Твоя речь</h2>

          <div>
            <Label>Тема (motion)</Label>
            <Input value={motion} onChange={(e) => setMotion(e.target.value)}
              placeholder="Например: Эта палата запретила бы одноразовый пластик" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Формат</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="karl_popper">Karl Popper</SelectItem>
                  <SelectItem value="parliamentary">Asian Parliamentary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Сторона</Label>
              <Select value={side} onValueChange={setSide}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">За (Pro)</SelectItem>
                  <SelectItem value="con">Против (Con)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Текст речи ({speech.length} симв.)</Label>
            <Textarea
              value={speech}
              onChange={(e) => setSpeech(e.target.value)}
              placeholder="Вставь сюда полный текст твоей речи..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <Button onClick={submit} disabled={loading} size="lg" className="w-full">
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Судья оценивает...</>) : (<><Gavel className="mr-2 h-4 w-4" /> Оценить речь</>)}
          </Button>
          {!user && (
            <p className="text-xs text-muted-foreground">Войди в аккаунт, чтобы сохранять оценки и видеть прогресс в кабинете.</p>
          )}
        </Card>

        <Card className="p-6 border-border/60 shadow-card">
          {!result && !loading && (
            <div className="grid h-full min-h-[400px] place-items-center text-center text-muted-foreground">
              <div>
                <Gavel className="mx-auto h-12 w-12 opacity-30" />
                <p className="mt-3">Ballot появится здесь после оценки</p>
              </div>
            </div>
          )}
          {loading && (
            <div className="grid h-full min-h-[400px] place-items-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">AI-судья анализирует речь...</p>
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-5">
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-xl font-bold">Ballot</h2>
                  <div className="text-3xl font-bold text-primary">{result.overall}<span className="text-sm text-muted-foreground">/50</span></div>
                </div>
              </div>

              <div className="space-y-3">
                {result.criteria.map((c) => {
                  const val = result.scores[c.key] ?? 0;
                  return (
                    <div key={c.key}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{c.label}</span>
                        <span className="tabular-nums">{val}/10</span>
                      </div>
                      <Progress value={val * 10} className="mt-1 h-2" />
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Комментарий судьи</div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{result.feedback}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400">
                    <ThumbsUp className="h-4 w-4" /> Сильные стороны
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {result.strengths.map((s, i) => <li key={i} className="flex gap-2"><span>✓</span><span>{s}</span></li>)}
                  </ul>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <TrendingUp className="h-4 w-4" /> Что улучшить
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {result.improvements.map((s, i) => <li key={i} className="flex gap-2"><span>→</span><span>{s}</span></li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
