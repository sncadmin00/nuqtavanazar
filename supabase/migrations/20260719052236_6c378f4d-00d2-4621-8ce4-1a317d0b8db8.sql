
CREATE TABLE public.week_voice_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_id uuid NOT NULL REFERENCES public.debate_weeks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  audio_path text NOT NULL,
  duration_sec integer NOT NULL,
  transcript_preview text,
  knock_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'approved',
  visibility text NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX week_voice_notes_week_idx ON public.week_voice_notes (week_id, knock_count DESC);

GRANT SELECT ON public.week_voice_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.week_voice_notes TO authenticated;
GRANT ALL ON public.week_voice_notes TO service_role;

ALTER TABLE public.week_voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voice_notes_read_public" ON public.week_voice_notes
  FOR SELECT USING (status = 'approved' AND visibility = 'public');
CREATE POLICY "voice_notes_read_own" ON public.week_voice_notes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "voice_notes_insert_own" ON public.week_voice_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "voice_notes_update_own" ON public.week_voice_notes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "voice_notes_delete_own" ON public.week_voice_notes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Anonymous knock tracking (visitor_id like retro poll)
CREATE TABLE public.week_voice_knocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voice_note_id uuid NOT NULL REFERENCES public.week_voice_notes(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (voice_note_id, visitor_id)
);
GRANT SELECT, INSERT ON public.week_voice_knocks TO anon, authenticated;
GRANT ALL ON public.week_voice_knocks TO service_role;
ALTER TABLE public.week_voice_knocks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.knock_week_voice_note(_voice_note_id uuid, _visitor_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF _visitor_id IS NULL OR length(_visitor_id) < 8 OR length(_visitor_id) > 64 THEN
    RAISE EXCEPTION 'invalid visitor_id';
  END IF;
  INSERT INTO public.week_voice_knocks (voice_note_id, visitor_id)
  VALUES (_voice_note_id, _visitor_id)
  ON CONFLICT DO NOTHING;
  UPDATE public.week_voice_notes
    SET knock_count = (SELECT COUNT(*) FROM public.week_voice_knocks WHERE voice_note_id = _voice_note_id)
    WHERE id = _voice_note_id
    RETURNING knock_count INTO new_count;
  RETURN COALESCE(new_count, 0);
END;
$$;

-- Storage policies for week-voice bucket
CREATE POLICY "voice_bucket_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'week-voice');
CREATE POLICY "voice_bucket_insert_own" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'week-voice' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "voice_bucket_delete_own" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'week-voice' AND (storage.foldername(name))[1] = auth.uid()::text
  );
