import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Mic, Square, Shuffle, Archive, ShieldCheck, ArrowLeft } from "lucide-react";
import { randomPrompt, saveRecording } from "@/lib/freeTalk";

export const Route = createFileRoute("/free-talk")({
  head: () => ({
    meta: [
      { title: "Свободные мысли — Мезон" },
      {
        name: "description",
        content:
          "Приватная запись голоса без темы, таймера и оценки. Ничего не анализируется — только ты слышишь эти записи.",
      },
    ],
  }),
  component: FreeTalkPage,
});

const SOFT_LIMIT_SEC = 15 * 60; // мягкий лимит — 15 минут

function FreeTalkPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const duration = Math.round((Date.now() - startedAtRef.current) / 1000);
        try {
          await saveRecording({
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            durationSec: duration,
            mimeType: blob.type,
            blob,
          });
          toast("Запись сохранена в твой архив");
        } catch {
          toast("Не удалось сохранить запись");
        }
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      rec.start();
      mediaRef.current = rec;
      startedAtRef.current = Date.now();
      setElapsed(0);
      setRecording(true);
      tickRef.current = window.setInterval(() => {
        const s = Math.round((Date.now() - startedAtRef.current) / 1000);
        setElapsed(s);
        if (s >= SOFT_LIMIT_SEC) stop();
      }, 500);
    } catch {
      toast("Нужен доступ к микрофону");
    }
  };

  const stop = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    mediaRef.current?.stop();
    mediaRef.current = null;
    setRecording(false);
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
      <Link
        to="/training"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Тренировка
      </Link>

      <section className="rounded-[18px] bg-[color:var(--color-ink)] p-5 text-white">
        <div className="formula-motif !text-white/50">Свободные мысли</div>
        <h1 className="mt-1 text-[22px] font-semibold leading-tight">
          Говори — без темы, без таймера, без оценки
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
          Барьер снимается голосом, а не структурой. Начни с чего угодно — со своей мысли или с подсказки ниже.
        </p>
      </section>

      <div className="flex items-start gap-3 rounded-[14px] border border-primary/25 bg-primary/5 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[12.5px] leading-snug text-foreground/85">
          Только ты слышишь эти записи. Они не анализируются и не транскрибируются — ни AI, ни человеком.
          Хранятся у тебя в браузере. Мы видим только длительность и дату — для прогресса.
        </p>
      </div>

      <div className="rounded-[16px] hairline bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="formula-motif !text-foreground/70">Подсказка (необязательно)</div>
          <button
            onClick={() => setPrompt(randomPrompt())}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[12px] font-semibold text-foreground hover:bg-accent/80"
          >
            <Shuffle className="h-3.5 w-3.5" /> Дай подсказку
          </button>
        </div>
        <p className="mt-3 min-h-[44px] text-[14px] leading-snug text-foreground/90">
          {prompt || "Своя тема — говори о чём хочешь. Кнопкой справа можно получить лёгкую разговорную подсказку."}
        </p>
      </div>

      <div className="rounded-[16px] hairline bg-white p-5">
        <div className="flex flex-col items-center gap-4">
          <div className="font-mono text-[36px] tabular-nums text-foreground">
            {mm}:{ss}
          </div>
          <div className="text-[11.5px] text-muted-foreground">
            {recording ? "Идёт запись — говори свободно" : `Мягкий лимит ${SOFT_LIMIT_SEC / 60} минут`}
          </div>
          {!recording ? (
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-ink)] px-5 py-3 text-[14px] font-semibold text-white active:scale-[0.99]"
            >
              <Mic className="h-4 w-4" /> Начать запись
            </button>
          ) : (
            <button
              onClick={stop}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground active:scale-[0.99]"
            >
              <Square className="h-4 w-4" /> Остановить и сохранить
            </button>
          )}
        </div>
      </div>

      <Link
        to="/archive"
        className="flex items-center gap-3 rounded-[16px] hairline bg-white p-4 active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent">
          <Archive className="h-5 w-5 text-foreground" />
        </span>
        <span className="flex-1">
          <span className="block text-[14px] font-semibold">Мой архив</span>
          <span className="block text-[12px] text-muted-foreground">Прошлые записи — только для тебя</span>
        </span>
      </Link>
    </div>
  );
}
