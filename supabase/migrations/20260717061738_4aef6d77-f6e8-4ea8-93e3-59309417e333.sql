
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  city TEXT,
  role TEXT CHECK (role IN ('school','student','other')) DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Motions
CREATE TABLE public.motions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('karl_popper','parliamentary','both')),
  language TEXT NOT NULL DEFAULT 'ru',
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.motions TO anon;
GRANT SELECT, INSERT ON public.motions TO authenticated;
GRANT ALL ON public.motions TO service_role;
ALTER TABLE public.motions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "motions_select_all" ON public.motions FOR SELECT USING (true);
CREATE POLICY "motions_insert_auth" ON public.motions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Lesson progress
CREATE TABLE public.lesson_progress (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
GRANT SELECT, INSERT, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lp_own" ON public.lesson_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved cases
CREATE TABLE public.saved_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  motion_text TEXT NOT NULL,
  side TEXT CHECK (side IN ('pro','con')) DEFAULT 'pro',
  thesis TEXT,
  arguments JSONB DEFAULT '[]'::jsonb,
  conclusion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_cases TO authenticated;
GRANT ALL ON public.saved_cases TO service_role;
ALTER TABLE public.saved_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sc_own" ON public.saved_cases FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  format TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_all" ON public.events FOR SELECT USING (true);

-- Seed motions
INSERT INTO public.motions (title, category, format, language) VALUES
('Этот дом запретил бы социальные сети для подростков младше 16 лет', 'technology', 'both', 'ru'),
('Этот дом ввёл бы всеобщий базовый доход', 'economics', 'both', 'ru'),
('Этот дом считает, что ядерная энергия — лучший путь к декарбонизации', 'environment', 'parliamentary', 'ru'),
('Этот дом обязал бы школы преподавать критическое мышление отдельным предметом', 'education', 'karl_popper', 'ru'),
('Этот дом легализовал бы генетическое редактирование эмбрионов', 'ethics', 'parliamentary', 'ru'),
('Этот дом отменил бы домашние задания в начальной школе', 'education', 'karl_popper', 'ru'),
('Этот дом считает, что искусственный интеллект должен иметь юридические права', 'ethics', 'parliamentary', 'ru'),
('Этот дом запретил бы рекламу фастфуда для детей', 'health', 'karl_popper', 'ru'),
('Этот дом ввёл бы обязательное голосование', 'politics', 'both', 'ru'),
('Этот дом отменил бы школьную форму', 'education', 'karl_popper', 'ru'),
('Этот дом обложил бы налогом роботов, заменяющих рабочих', 'economics', 'parliamentary', 'ru'),
('Этот дом считает, что стриминговые сервисы уничтожают кинематограф', 'culture', 'both', 'ru'),
('Этот дом отменил бы экзамены как форму оценки в школе', 'education', 'karl_popper', 'ru'),
('Этот дом легализовал бы все виды наркотиков', 'politics', 'parliamentary', 'ru'),
('Этот дом обязал бы соцсети верифицировать реальную личность пользователей', 'technology', 'both', 'ru');

-- Seed events
INSERT INTO public.events (title, description, location, starts_at, format) VALUES
('Открытие Debate Club Uzbekistan в Бухаре', 'Первая встреча клуба: знакомство, презентация форматов Karl Popper и Parliamentary, показательный раунд.', 'Бухарский государственный университет', now() + interval '14 days', 'meetup'),
('Мастер-класс: Опровержение и клэш', 'Практический воркшоп по искусству контраргументации.', 'Бухара, коворкинг TUMARIS', now() + interval '28 days', 'workshop'),
('Первый межвузовский турнир', 'Пилотный турнир в формате Asian Parliamentary для студентов Бухары.', 'Бухарский государственный университет', now() + interval '60 days', 'tournament');
