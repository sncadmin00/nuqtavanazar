import { createFileRoute } from "@tanstack/react-router";
import { Dices, Mic, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Тренировка — Debate Club UZ" },
      { name: "description", content: "Соло-тренировка речи: обе стороны одной темы, разовый AI-фидбек по содержанию и подаче." },
    ],
  }),
  component: TrainingPage,
});

function TrainingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <section className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
        <div className="formula-motif !text-white/50">Тренировка</div>
        <h1 className="mt-1 text-[22px] font-semibold leading-tight">
          Проговорите обе стороны — одну идею, два взгляда
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
          Приватно. Никто не слышит. AI даст разовый фидбек: содержание (идея → критерий → аргумент)
          и подача (темп, паузы, уверенность).
        </p>
      </section>

      <button
        onClick={() => toast("Генератор тем скоро запустится")}
        className="flex w-full items-center gap-3 rounded-[16px] hairline bg-white p-4 text-left active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent">
          <Dices className="h-5 w-5 text-foreground" />
        </span>
        <span className="flex-1">
          <span className="block text-[14px] font-semibold">Кубик — случайная тема</span>
          <span className="block text-[12px] text-muted-foreground">Одна кнопка, готовая формулировка</span>
        </span>
      </button>

      <button
        onClick={() => toast("Голосовая тренировка скоро откроется")}
        className="flex w-full items-center gap-3 rounded-[16px] hairline bg-white p-4 text-left active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15">
          <Mic className="h-5 w-5 text-primary" />
        </span>
        <span className="flex-1">
          <span className="block text-[14px] font-semibold">Начать запись — 20–30 секунд</span>
          <span className="block text-[12px] text-muted-foreground">Ворота перед live-баттлами</span>
        </span>
      </button>

      <div className="rounded-[16px] hairline bg-white p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <div className="formula-motif !text-foreground/70">Как работает</div>
        </div>
        <ol className="mt-3 space-y-2.5 text-[13px] leading-snug text-foreground/85">
          <li><span className="mr-2 font-mono text-primary">1.</span> Возьмите тему кубиком.</li>
          <li><span className="mr-2 font-mono text-primary">2.</span> Сначала — сторона утверждения. Потом отрицания.</li>
          <li><span className="mr-2 font-mono text-primary">3.</span> Получите разовый фидбек: где логика провисает, где темп сорван.</li>
        </ol>
      </div>
    </div>
  );
}
