-- 1. Ролевая модель
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Безопасная функция проверки роли (security definer, без рекурсии)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 3. Выдаём права на запись администраторам для таблиц, управляемых через админ-панель
GRANT INSERT, UPDATE, DELETE ON public.debate_weeks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.debate_cadence TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.week_arguments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.week_quotes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.week_featured_speakers TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.roundtables TO authenticated;

-- 4. Политики: только администраторы могут писать в эти таблицы
CREATE POLICY "admin_write_debate_weeks"
  ON public.debate_weeks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_write_debate_cadence"
  ON public.debate_cadence FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_write_week_arguments"
  ON public.week_arguments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_write_week_quotes"
  ON public.week_quotes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_write_week_featured_speakers"
  ON public.week_featured_speakers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_write_roundtables"
  ON public.roundtables FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));