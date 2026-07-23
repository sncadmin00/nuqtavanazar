import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mic, Play, Pause, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getVisitorId } from "@/lib/visitor";
import { createVoiceNote, knockVoiceNote, type VoiceNote } from "@/lib/home.functions";
import { useI18n } from "@/lib/i18n";
import { tPlural } from "@/lib/i18n/translations";

const MAX_SEC = 60;

export function VoiceOfTheWeek({
  weekId,
  initial,
}: {
  weekId: string;
  initial: VoiceNote[];
}) {
  const { t, lang } = useI18n();
  const [notes, setNotes] = useState<VoiceNote[]>(initial);
  const [knocked, setKnocked] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  const handleKnock = async (id: string) => {
    if (knocked[id]) return;
    setKnocked((k) => ({ ...k, [id]: true }));
    try {
      const next = await knockVoiceNote({ data: { voice_note_id: id, visitor_id: getVisitorId() } });
      setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, knock_count: next } : n)));
    } catch (e: any) {
      setKnocked((k) => ({ ...k, [id]: false }));
      toast.error(e?.message ?? "—");
    }
  };

  const handleUploaded = (note: VoiceNote) => {
    setNotes((ns) => [note, ...ns.filter((n) => n.id !== note.id)]);
  };

  return (
    <section className="rounded-[16px] bg-white hairline p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-foreground">{t("voice.title")}</h3>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {tPlural(lang, notes.length, "voice.records")}
        </span>
      </div>
      <p className="mt-1 text-[12.5px] text-foreground/70">{t("voice.subtitle")}</p>

      <div className="mt-3">
        {user ? (
          <Recorder weekId={weekId} onUploaded={handleUploaded} />
        ) : (
          <Link
            to="/auth"
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[13.5px] font-semibold text-white active:scale-[0.99]"
          >
            <Mic className="h-4 w-4" /> {t("voice.signInPrompt")}
          </Link>
        )}
      </div>

      {notes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-[12px] bg-[color:var(--color-table)] p-3">
              <div className="flex items-center gap-2.5">
                <AudioPlayer url={n.audio_url} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-foreground">
                    {n.transcript_preview ?? t("voice.fallbackTitle")}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                    <span className="font-sans font-medium text-foreground/80">{n.author_name}</span>
                    <span>·</span>
                    <span>{formatDur(n.duration_sec)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleKnock(n.id)}
                  disabled={knocked[n.id]}
                  className={
                    "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11.5px] tabular-nums transition " +
                    (knocked[n.id]
                      ? "bg-primary/15 text-primary"
                      : "bg-white text-foreground/80 hairline active:scale-95")
                  }
                >
                  👊 {n.knock_count}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AudioPlayer({ url }: { url: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onEnd = () => setPlaying(false);
    a.addEventListener("ended", onEnd);
    return () => a.removeEventListener("ended", onEnd);
  }, []);
  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };
  return (
    <>
      <audio ref={ref} src={url} preload="none" />
      <button
        onClick={toggle}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-white active:scale-95"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
      </button>
    </>
  );
}

function Recorder({
  weekId,
  onUploaded,
}: {
  weekId: string;
  onUploaded: (n: VoiceNote) => void;
}) {
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => stopTimer, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        stopTimer();
        const duration = Math.min(MAX_SEC, Math.max(1, (Date.now() - startedAtRef.current) / 1000));
        const blob = new Blob(chunksRef.current, { type: mime });
        await upload(blob, duration, mime);
      };
      mediaRef.current = mr;
      startedAtRef.current = Date.now();
      setElapsed(0);
      mr.start();
      setRecording(true);
      timerRef.current = window.setInterval(() => {
        const s = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setElapsed(s);
        if (s >= MAX_SEC) stop();
      }, 200);
    } catch {
      toast.error(t("voice.needMic"));
    }
  };

  const stop = () => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    setRecording(false);
  };

  const upload = async (blob: Blob, duration: number, mime: string) => {
    setUploading(true);
    try {
      const { data: sess } = await supabase.auth.getUser();
      const userId = sess.user?.id;
      if (!userId) throw new Error("auth required");
      const ext = mime.includes("mp4") ? "m4a" : "webm";
      const path = `${userId}/${weekId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("week-voice").upload(path, blob, {
        contentType: mime,
        upsert: false,
      });
      if (upErr) throw upErr;
      const note = await createVoiceNote({
        data: { week_id: weekId, audio_path: path, duration_sec: duration },
      });
      onUploaded(note);
      toast.success(t("voice.uploaded"));
    } catch (e: any) {
      toast.error(e?.message ?? t("voice.uploadFail"));
    } finally {
      setUploading(false);
      setElapsed(0);
    }
  };

  if (uploading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-3 text-[13.5px] font-semibold text-foreground/70">
        <Loader2 className="h-4 w-4 animate-spin" /> {t("voice.uploading")}
      </div>
    );
  }

  if (recording) {
    return (
      <button
        onClick={stop}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-ink)] px-4 py-3 text-[13.5px] font-semibold text-white active:scale-[0.99]"
      >
        <Square className="h-4 w-4 fill-white" />
        {t("voice.stop")} · <span className="font-mono tabular-nums">{elapsed}s / {MAX_SEC}s</span>
      </button>
    );
  }

  return (
    <button
      onClick={start}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[13.5px] font-semibold text-white active:scale-[0.99]"
    >
      <Mic className="h-4 w-4" /> {t("voice.start")}
    </button>
  );
}

function formatDur(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}
