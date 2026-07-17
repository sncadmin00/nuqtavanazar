import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { sparringReply, generateMotion } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, Sparkles, Swords, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sparring")({
  head: () => ({
    meta: [
      { title: "AI-Спарринг — тренируй полемику с AI | Debate Club UZ" },
      { name: "description", content: "Дебатируй с AI: выбери тему и сторону, AI возьмёт противоположную позицию и будет отвечать на твои аргументы." },
    ],
  }),
  ssr: false,
  component: SparringPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function SparringPage() {
  const [setup, setSetup] = useState(true);
  const [motion, setMotion] = useState("");
  const [side, setSide] = useState<"pro" | "con">("pro");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reply = useServerFn(sparringReply);
  const genMotion = useServerFn(generateMotion);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const start = () => {
    if (!motion.trim()) { toast.error("Введите или сгенерируйте тему"); return; }
    setMessages([{
      role: "assistant",
      content: `Начинаем спарринг!\n\nТема: «${motion}»\nТы: ${side === "pro" ? "за (Pro)" : "против (Con)"}\nЯ: ${side === "pro" ? "против (Con)" : "за (Pro)"}\n\nТвой ход — открывай речь первым аргументом.`,
    }]);
    setSetup(false);
  };

  const suggestMotion = async () => {
    setGenerating(true);
    try {
      const res = await genMotion({ data: { difficulty: "medium" } });
      setMotion(res.motion);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setLoading(true);
    try {
      const { reply: r } = await reply({ data: { motion, userSide: side, messages: next.filter((_, i) => i > 0) } });
      setMessages([...next, { role: "assistant", content: r }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSetup(true); setMessages([]); setInput("");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8">
        <Badge variant="secondary" className="rounded-full"><Sparkles className="mr-1 h-3 w-3" /> AI-платформа</Badge>
        <h1 className="mt-3 flex items-center gap-3 font-display text-4xl md:text-5xl font-bold">
          <Swords className="h-8 w-8 text-primary" /> AI-Спарринг
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Живая полемика с AI: ты пишешь аргумент — AI отвечает контраргументом. Тренируй скорость мышления и работу с возражениями.
        </p>
      </div>

      {setup ? (
        <Card className="p-6 border-border/60 shadow-card space-y-4">
          <div>
            <Label>Тема (motion)</Label>
            <div className="flex gap-2">
              <Input value={motion} onChange={(e) => setMotion(e.target.value)}
                placeholder="Введи тему или сгенерируй" />
              <Button variant="outline" onClick={suggestMotion} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label>Ты выступаешь</Label>
            <Select value={side} onValueChange={(v) => setSide(v as typeof side)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">За (Pro)</SelectItem>
                <SelectItem value="con">Против (Con)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={start} size="lg" className="w-full">
            <Swords className="mr-2 h-4 w-4" /> Начать спарринг
          </Button>
        </Card>
      ) : (
        <Card className="flex h-[calc(100vh-320px)] min-h-[500px] flex-col overflow-hidden border-border/60 shadow-card">
          <div className="flex items-center justify-between border-b bg-secondary/50 px-4 py-3">
            <div className="text-sm">
              <span className="font-semibold">«{motion}»</span>
              <span className="ml-2 text-muted-foreground">Ты: {side === "pro" ? "Pro" : "Con"}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>Новый спарринг</Button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary",
                )}>
                  {m.role === "assistant" && i > 0 && <div className="mb-1 text-xs font-semibold text-muted-foreground">AI-Оппонент</div>}
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="inline h-3 w-3 animate-spin" /> Оппонент готовит контраргумент...
                </div>
              </div>
            )}
          </div>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Твой аргумент..." className="min-h-[60px] resize-none" rows={2} />
              <Button onClick={send} disabled={loading || !input.trim()} size="lg">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
