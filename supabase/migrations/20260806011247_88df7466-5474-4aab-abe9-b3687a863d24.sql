CREATE POLICY "duel_audio_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'duel-audio');

CREATE POLICY "duel_audio_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'duel-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "duel_audio_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'duel-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "duel_audio_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'duel-audio' AND (storage.foldername(name))[1] = auth.uid()::text);