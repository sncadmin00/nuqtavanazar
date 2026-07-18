// IndexedDB helpers for the "Free Talk" private archive.
// Recordings stay in the user's browser only; the content is never uploaded,
// transcribed, or analyzed.

export type FreeTalkRecord = {
  id: string;
  createdAt: number;
  durationSec: number;
  mimeType: string;
  blob: Blob;
};

const DB_NAME = "mezon.freetalk";
const STORE = "recordings";
const REFLECTIONS_STORE = "reflections";
const VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains(REFLECTIONS_STORE)) {
        const store = db.createObjectStore(REFLECTIONS_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export type CaseReflection = {
  id: string;
  createdAt: number;
  topic: string;
  sides: Array<{ side: "affirmation" | "negation"; values: string[] }>;
  opinion: string;
  changed: "strong" | "little" | "no" | null;
};

export async function saveReflection(rec: CaseReflection): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(REFLECTIONS_STORE, "readwrite");
    tx.objectStore(REFLECTIONS_STORE).put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listReflections(): Promise<CaseReflection[]> {
  const db = await openDB();
  const items = await new Promise<CaseReflection[]>((resolve, reject) => {
    const tx = db.transaction(REFLECTIONS_STORE, "readonly");
    const req = tx.objectStore(REFLECTIONS_STORE).getAll();
    req.onsuccess = () => resolve(req.result as CaseReflection[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteReflection(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(REFLECTIONS_STORE, "readwrite");
    tx.objectStore(REFLECTIONS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function saveRecording(rec: FreeTalkRecord): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listRecordings(): Promise<FreeTalkRecord[]> {
  const db = await openDB();
  const items = await new Promise<FreeTalkRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as FreeTalkRecord[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

const PROMPTS = [
  "Какой фильм посмотрел недавно — и что о нём думаешь?",
  "О чём ты думал сегодня по дороге куда-нибудь?",
  "Что тебя в последнее время удивило?",
  "Расскажи про место, где тебе спокойно.",
  "Что бы ты сказал себе год назад?",
  "Какая привычка тебе помогает — и почему?",
  "О чём ты можешь говорить бесконечно?",
  "Что было самым нелепым за эту неделю?",
];

export function randomPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}
