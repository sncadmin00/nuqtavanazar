UPDATE public.debate_weeks
SET topic = COALESCE(topic, 'ИИ в школах приносит больше пользы, чем вреда'),
    topic_reveal_at = now() - interval '2 days',
    event_at = now() - interval '30 minutes',
    event_ends_at = now() + interval '3 hours'
WHERE id = 'c1c1500d-fdd8-4840-9516-04b1e8d6cedb';