import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askTutor } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "AI-Тьютор — спроси что угодно о дебатах | Debate Club UZ" },
      { name: "description", content: "AI-тьютор Debate Club Uzbekistan: отвечает на вопросы о теории дебатов, форматах Karl Popper и Parliamentary, аргументации и судействе." },
    ],
  }),
  ssr: false,
  component: TutorPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const TOPICS = [
  { label: "Основы AREA", q: "Объясни структуру AREA и покажи пример на теме 'ЕС должен запретить одноразовый пластик'" },
  { label: "Karl Popper", q: "Как устроены роли в формате Karl Popper и что делает первый спикер?" },
  { label: "Parliamentary", q: "Расскажи, чем Asian Parliamentary отличается от British Parliamentary" },
  { label: "Опровержение", q: "Как построить эффективное опровержение аргумента оппонента?" },
  { label: "Логические ошибки", q: "Приведи 5 самых частых логических ошибок в дебатах с примерами" },
  { label: "Судейство", q: "По каким критериям судят речь в формате Karl Popper?" },
  { label: "Подготовка кейса", q: "Как за 20 минут подготовить командный кейс?" },
  { label: "POI", q: "Что такое POI и как правильно их использовать?" },
];

function TutorPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Здравствуй! Я AI-тьютор Debate Club Uzbekistan. Задай мне любой вопрос о дебатах — от базовой теории до нюансов конкретных форматов. Я объясню, приведу примеры и проверю твоё понимание." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askTutor);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8">
        <Badge variant="secondary" className="rounded-full"><Sparkles className="mr-1 h-3 w-3" /> AI-платформа</Badge>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold">AI-Тьютор</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Персональный AI-помощник по теории дебатов. Задавай вопросы, получай объяснения с примерами, проверяй понимание в диалоге.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <Card className="flex h-[calc(100vh-280px)] min-h-[500px] flex-col overflow-hidden border-border/60 shadow-card">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground",
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="inline h-3 w-3 animate-spin" /> Тьютор печатает...
                </div>
              </div>
            )}
          </div>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                placeholder="Спроси AI-тьютора..."
                className="min-h-[52px] resize-none"
                rows={2}
              />
              <Button onClick={() => send(input)} disabled={loading || !input.trim()} size="lg">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">Быстрые темы</div>
          {TOPICS.map((t) => (
            <button
              key={t.label}
              onClick={() => send(t.q)}
              disabled={loading}
              className="block w-full rounded-lg border bg-card px-3 py-2 text-left text-sm hover:bg-secondary disabled:opacity-50"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
