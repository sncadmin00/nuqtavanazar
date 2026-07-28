## Зачем

Сейчас темы недель, даты Дней дебатов и весь контент (аргументы, цитаты, спикеры, круглые столы) заносятся в базу только прямым SQL-запросом. Нужна защищённая админ-панель в интерфейсе сайта, чтобы администратор мог управлять этим без доступа к SQL.

## Что строим

### 1. Ролевая модель (миграция)

- `public.app_role` enum: `'admin'`, `'user'`.
- `public.user_roles` таблица: `user_id` → `auth.users(id)`, `role`, UNIQUE(`user_id`, `role`).
- `GRANT SELECT TO authenticated; GRANT ALL TO service_role;` (anon не нужен).
- RLS включён.
- `public.has_role(_user_id, _role)` — SECURITY DEFINER функция, обходит рекурсию RLS.

### 2. Защита таблиц на запись (миграция)

Сейчас `debate_weeks`, `debate_cadence`, `week_arguments`, `week_quotes`, `week_featured_speakers`, `roundtables` доступны публично только на чтение, а запись закрыта всем. Добавляем RLS-политики INSERT/UPDATE/DELETE `TO authenticated` с проверкой `public.has_role(auth.uid(), 'admin')` — только админ может менять эти данные.

### 3. Серверные функции (`src/lib/admin.functions.ts`)

Все — `createServerFn` с `.middleware([requireSupabaseAuth])`, внутри хендлера проверка `has_role`. Операции:

- `listWeeks()` — список всех недель с полными полями (включая topic, ai_summary, даже до раскрытия).
- `upsertWeek({ id?, week_start, event_at, event_ends_at, topic, ai_summary })` — создать/обновить неделю.
- `deleteWeek({ id })` — удалить неделю.
- `getCadence()` / `updateCadence({ interval_days, day_of_week, event_time, reveal_lead_hours, event_duration_hours, timezone })`.
- `listWeekContent({ week_id })` — аргументы, цитаты, featured-спикеры недели.
- `upsertArgument`, `deleteArgument`, `upsertQuote`, `deleteQuote`, `upsertFeatured`, `deleteFeatured`.
- `listRoundtablesAdmin()`, `upsertRoundtable`, `deleteRoundtable`.
- `adminStats()` — краткая сводка (число недель, голосов, голосовых, бронирований).

### 4. Маршрут админки (`src/routes/_authenticated/admin.tsx`)

Под защищённым layout `_authenticated/` (ssr:false, gate через `supabase.auth.getUser()`). Внутри — собственная проверка роли: грузит `getMyRole()` при монтировании; если не admin — показывает «Доступ только для администраторов».

UI — единая страница с табами (вкладки):

1. **Недели** — таблица всех недель: дата старта, дата события, тема, статус. Кнопка «+ Неделя» → форма (week_start, event_at, event_ends_at, topic, ai_summary). Inline-редактирование.
2. **Каденс** — форма настроек цикла (interval_days, day_of_week, event_time, reveal_lead_hours, event_duration_hours, timezone).
3. **Контент недели** — выбор недели из списка → разделы: аргументы (pro/con, текст, автор), цитаты (текст, автор, порядок), featured-спикеры (kind, имя, аватар, бейдж).
4. **Круглые столы** — список + форма (topic, moderator_name, starts_at, capacity, is_live, participants JSON, recording_url).
5. **Сводка** — adminStats.

Стиль — в рамках текущего дизайн-токена (Tailwind v4, `bg-white` карточки, `hairline`), как остальной сайт.

### 5. Доступ к панели

- Ссылка в шапке/таб-баре показывается только если `useAuth().user` есть и `getMyRole()` вернул `admin`.
- Обычные пользователи по `/admin` получают сообщение об отказе.

## Технические детали

- Стек: TanStack Start `createServerFn`, Supabase RLS, Tailwind v4.
- Миграция через `supabase--migration` (роли + политики на запись).
- `admin.functions.ts` лежит в `src/lib/` (client-safe путь), серверные импорты — внутри хендлеров.
- Тексты — русский (админка внутренняя, i18n не обязателен).

## Не входит

- Управление пользователями/ролями из UI (роли назначаются SQL-запросом вручную — одноразовая операция).
- Модерация голосовых записей (таблица `week_voice_notes` уже имеет owner-policies).
- Реальный поток бронирования матчей.