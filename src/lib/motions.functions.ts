import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type MotionDifficulty = "easy" | "medium" | "hard";
export type MotionScope = "uzbekistan" | "global";

export type MotionBankItem = {
  id: string;
  title: string;
  category: string;
  format: "karl_popper" | "parliamentary" | "both";
  language: string;
  difficulty: MotionDifficulty;
  scope: MotionScope;
};

function createPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Банк тем временно недоступен");

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const listMotions = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await createPublicClient()
    .from("motions")
    .select("id, title, category, format, language, difficulty, scope")
    .eq("language", "ru")
    .order("scope", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Не удалось загрузить банк тем: ${error.message}`);
  return (data ?? []) as MotionBankItem[];
});