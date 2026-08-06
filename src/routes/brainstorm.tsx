import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Brain, Loader2, Send } from "lucide-react";
import { askTutor } from "@/lib/ai.functions";

export const Route = createFileRoute("/brainstorm")({
  validateSearch: (s: Record<string, unknown>) => ({
    topic: typeof s.topic === "string" ? s.topic : undefined,
  }),
  head: () => ({
    meta: [
      { title: "AI-тьютор — Nuqta va Nazar" },
      {
        name: "description",
        content:
          "Брейншторм с AI-тьютором: критерии, идеи и аргументы. Без готовых речей — только твоя мысль.",
      },
      { property: "og:title", content: "AI-тьютор — Nuqta va Nazar" },
      {
        property: "og:description",
        content: "Обмен идеями, критериями и аргументами с AI-тьютором.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BrainstormPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const BRAINSTORM_CONTEXT = `Режим: БРЕЙНШТОРМ.
Пользователь пришёл обмениваться идеями, критериями и направлениями аргументов — не за текстом.
- Никогда не пиши речь, вступление, заключение или готовый текст выступления. Даже фрагмент.
- Работай короткими тезисами и вопросами: предложи 2-3 возможных критерия, назови направления аргументов одним предложением каждое, спроси, какое пользователь берёт и почему.
- После каждого своего блока задавай пользователю вопрос, чтобы думал он.`;

const SEEDS = [
  "Помоги подобрать критерий для темы…",
  "Какие направления аргументов есть у стороны «за»?",
  "Проверь мою идею: она вообще про тему?",
  "Как отличить критерий от аргумента?",
];

function BrainstormPage() {
  const { topic } = Route.useSearch();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, busy]);

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: value }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await askTutor({
        data: {
          messages: next,
          context: topic ? `${BRAINSTORM_CONTEXT}\nТема пользователя: «${topic}»` : BRAINSTORM_CONTEXT,
        },
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "AI-тьютор недоступен");
    } finally {
      setBusy(false);
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
          <Brain className="h-5 w-5 text-primary" />
          <h1 className="text-[20px] font-semibold leading-tight">AI-тьютор · брейншторм</h1>
        </div>
        <p className="mt-1 text-[13px] text-white/70">
          Обмен идеями, критериями и аргументами. Тексты и речи тьютор не пишет — это твоя часть.
        </p>
      </section>

      {topic && (
        <div className="rounded-[16px] hairline bg-white p-4">
          <div className="formula-motif !text-foreground/70">Тема</div>
          <p className="mt-1 text-[14px] font-semibold leading-snug">«{topic}»</p>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="rounded-full bg-accent px-3 py-1.5 text-[12.5px] text-foreground hover:bg-accent/80"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
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
            <Loader2 className="h-4 w-4 animate-spin" /> Думаю…
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
              void send(input);
            }
          }}
          rows={2}
          placeholder="Идея, критерий, вопрос…"
          className="flex-1 resize-none rounded-[14px] border border-border bg-white px-3 py-2 text-[13.5px] outline-none focus:border-primary"
        />
        <button
          onClick={() => void send(input)}
          disabled={busy || !input.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          aria-label="Отправить"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
