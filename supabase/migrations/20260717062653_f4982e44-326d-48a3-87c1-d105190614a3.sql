CREATE TABLE public.judge_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motion TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('karl_popper','parliamentary')),
  side TEXT,
  speech TEXT NOT NULL,
  overall_score NUMERIC(4,1) NOT NULL,
  scores JSONB NOT NULL,
  feedback TEXT NOT NULL,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  improvements TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judge_evaluations TO authenticated;
GRANT ALL ON public.judge_evaluations TO service_role;
ALTER TABLE public.judge_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own evaluations" ON public.judge_evaluations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_judge_evaluations_user ON public.judge_evaluations(user_id, created_at DESC);