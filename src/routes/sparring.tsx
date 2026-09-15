import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Dice5,
  Gavel,
  Loader2,
  Send,
  Swords,
} from "lucide-react";
import { generateMotion, sparringReply, judgeSpeech } from "@/lib/ai.functions";

export const Route = createFileRoute("/sparring")({
  validateSearch: (s: Record<string, unknown>) => ({
    topic: typeof s.topic === "string" ? s.topic : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Батл с AI — Nuqta va Nazar" },
      {
        name: "description",
        content:
          "Текстовый дебатный батл с AI-оппонентом и разбором раунда от AI-судьи по пяти критериям.",
      },
      { property: "og:title", content: "Батл с AI — Nuqta va Nazar" },
      {
        property: "og:description",
        content: "Спарринг с AI-оппонентом и дополнительные оценки AI-судьи.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SparringPage,
});

type Msg = { role: "user" | "assistant"; content: string };
type Side = "pro" | "con";

type Verdict = {
  scores: Record<string, number>;
  overall: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  criteria: { key: string; label: string }[];
};

function SparringPage() {
  const { topic } = Route.useSearch();
  const [motion, setMotion] = useState(topic ?? "");
  const [side, setSide] = useState<Side>("pro");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [judging, setJudging] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, busy]);

  const roll = async () => {
    setRolling(true);
    try {
      const m = await generateMotion({ data: { category: "Узбекистан и мировые тренды", difficulty: "medium" } });
      setMotion(m.motion);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Не удалось получить тему");
    } finally {
      setRolling(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await sparringReply({
        data: { motion, userSide: side, messages: next },
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "AI-оппонент недоступен");
    } finally {
      setBusy(false);
    }
  };

  const userTurns = messages.filter((m) => m.role === "user");

  const callJudge = async () => {
    if (judging) return;
    setJudging(true);
    try {
      const speech = userTurns.map((m, i) => `Реплика ${i + 1}: ${m.content}`).join("\n\n");
      const res = await judgeSpeech({
        data: {
          motion,
          format: "duel",
          side: side === "pro" ? "за (pro)" : "против (con)",
          speech,
        },
      });
      setVerdict(res as Verdict);
    } catch (e) {
      toast(e instanceof Error ? e.message : "AI-судья недоступен");
    } finally {
      setJudging(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <Link
        to="/training"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Практика
      </Link>

      <section className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          <h1 className="text-[20px] font-semibold leading-tight">Батл с AI</h1>
        </div>
        <p className="mt-1 text-[13px] text-white/70">
          Один раунд — один аргумент. AI держит противоположную сторону и не пишет за тебя.
        </p>
      </section>

      {!started ? (
        <div className="rounded-[16px] hairline bg-white p-4 space-y-4">
          <div>
            <div className="formula-motif !text-foreground/70">Тема</div>
            <textarea
              value={motion}
              onChange={(e) => setMotion(e.target.value)}
              rows={2}
              placeholder="Эта палата..."
              className="mt-2 w-full resize-none rounded-[12px] border border-border bg-background px-3 py-2 text-[13.5px] outline-none focus:border-primary"
            />
            <button
              onClick={roll}
              disabled={rolling}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[12.5px] font-semibold disabled:opacity-60"
            >
              {rolling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Dice5 className="h-3.5 w-3.5" />
              )}
              Умный кубик
            </button>
          </div>

          <div>
            <div className="formula-motif !text-foreground/70">Твоя сторона</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["pro", "con"] as Side[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={
                    "rounded-full px-3 py-2 text-[13px] font-semibold transition " +
                    (side === s
                      ? "bg-[color:var(--color-ink)] text-white"
                      : "bg-accent text-foreground hover:bg-accent/80")
                  }
                >
                  {s === "pro" ? "За" : "Против"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (motion.trim().length < 8) {
                toast("Сначала выбери или впиши тему");
                return;
              }
              setStarted(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground active:scale-[0.99]"
          >
            <Swords className="h-4 w-4" /> Начать батл
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-[16px] hairline bg-white p-4">
            <div className="formula-motif !text-foreground/70">Тема раунда</div>
            <p className="mt-1 text-[14px] font-semibold leading-snug">«{motion}»</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Ты — {side === "pro" ? "за" : "против"}, AI — {side === "pro" ? "против" : "за"}.
            </p>
          </div>

          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="rounded-[14px] hairline bg-white p-4 text-[13px] text-muted-foreground">
                Начни с первого аргумента: идея → критерий → аргумент → пример.
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  "max-w-[88%] rounded-[14px] px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap " +
                  (m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "hairline bg-white text-foreground")
                }
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="inline-flex items-center gap-2 rounded-[14px] hairline bg-white px-4 py-3 text-[13px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Оппонент готовит ответ…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={2}
              placeholder="Твой аргумент…"
              className="flex-1 resize-none rounded-[14px] border border-border bg-white px-3 py-2 text-[13.5px] outline-none focus:border-primary"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
              aria-label="Отправить"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-primary" />
              <div className="formula-motif !text-white/50">AI-судья · доп. оценки</div>
            </div>
            <p className="mt-2 text-[12.5px] text-white/70">
              Судья разбирает твои реплики раунда по пяти критериям. Это дополнительная оценка,
              она не заменяет живых судей.
            </p>
            <button
              onClick={callJudge}
              disabled={judging || userTurns.length < 1}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-50"
            >
              {judging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
              Позвать AI-судью
            </button>

            {verdict && (
              <div className="mt-4 space-y-3">
                <div className="text-[28px] font-semibold">
                  {verdict.overall}
                  <span className="text-[14px] text-white/50"> / 50</span>
                </div>
                <div className="space-y-2">
                  {verdict.criteria.map((c) => {
                    const v = verdict.scores[c.key] ?? 0;
                    return (
                      <div key={c.key}>
                        <div className="flex items-center justify-between text-[12px] text-white/70">
                          <span>{c.label}</span>
                          <span>{v}/10</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/15">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.max(0, Math.min(100, (v / 10) * 100))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-white/80">
                  {verdict.feedback}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[12px] bg-white/5 p-3">
                    <div className="formula-motif !text-white/50">Сильное</div>
                    <ul className="mt-1 space-y-1 text-[12.5px] text-white/80">
                      {verdict.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[12px] bg-white/5 p-3">
                    <div className="formula-motif !text-white/50">Доработать</div>
                    <ul className="mt-1 space-y-1 text-[12.5px] text-white/80">
                      {verdict.improvements.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
