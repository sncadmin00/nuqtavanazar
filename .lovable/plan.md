
## Ядро логики: серверный «фазовый» источник правды

Один серверный источник истины про «где мы сейчас в цикле», чтобы UI не решал это сам и текст темы физически не приходил на клиент раньше времени.

- Новая таблица `debate_cadence` (одна строка): `interval_days` (дефолт 7), `day_of_week` (0-6, дефолт 6 = сб), `event_time` (`time`, дефолт 18:00), `reveal_lead_hours` (дефолт **48**, не 24), `event_duration_hours` (дефолт 4), `timezone` (дефолт `Asia/Tashkent`). Правится SQL-ом, не хардкод.
- В `debate_weeks` добавляем `event_at timestamptz` (точная дата+время Дня дебатов) и `event_ends_at`. `topic_reveal_at` пересчитываем как `event_at - reveal_lead_hours`.
- Серверная функция `getHomeState()` (`createServerFn`, публичная, без auth) возвращает:
  - `phase`: `"discussion"` (после конца прошлого Дня дебатов и до `topic_reveal_at`) | `"game_day"` (от `topic_reveal_at` до `event_ends_at`).
  - `now`, `event_at`, `topic_reveal_at`, `event_ends_at`.
  - `current_week`: только безопасные поля. **`topic` возвращается только если `now >= topic_reveal_at`**, иначе поле отсутствует в ответе. То же для `ai_summary` до `event_ends_at`.
  - `previous_week`: полный (тема уже раскрыта в прошлом).
- Все существующие клиентские вызовы `fetchCurrentWeek` из `debate-data.ts` для главного экрана заменяем на этот единый серверный вызов. `debate-data.ts` для профиля/архива не трогаем.

## Discussion mode — новый контент

Заменяем блок `LiveNow` на набор ретро-компонентов, привязанных к `previous_week`. Все данные — из БД, ничего не выдумываем на клиенте.

Новые таблицы (миграция + GRANT + RLS `TO anon` SELECT там, где публично):

- `week_arguments`: `week_id`, `side` (`pro`/`con`), `text`, `author_id`, `knock_count`. Публично читаемо. Используется для «Столкновения идей».
- `week_quotes`: `week_id`, `text`, `author_id`, `author_name` (denorm), `knock_count`, `order_index`. Публично. Используется в карусели.
- `week_featured_speakers`: `week_id`, `kind` (`best`/`rising`), `user_id`, `display_name`, `avatar_url`, `badge_note`. Публично.
- `week_public_votes`: `week_id`, `voter_id` (nullable для анонимов — используем ip-hash или `visitor_id` cookie), `side`. UNIQUE(week_id, voter_id). INSERT для anon разрешён с валидацией стороны; SELECT только через агрегатную RPC `get_week_vote_stats(week_id)` → `{pro, con, total}`.

Компоненты в `src/components/home/discussion/`:
1. `<PrevWeekResultCard>` — оставляем текущий `LastWeekBanner`, но в «тёмном» варианте по ТЗ.
2. `<IdeaClash>` — два столбца ЗА / ПРОТИВ, по 2 аргумента, тук-счётчик.
3. `<TopQuotesCarousel>` — 3-4 карточки, свайп (touch + horizontal scroll snap, без внешних либ).
4. `<FeaturedSpeakers>` — 2 карточки: «Лучший спикер», «Новый голос».
5. `<RetroPoll>` — 2 кнопки ЗА/ПРОТИВ. После голоса — проценты и общее число. Голос пишется через серверную функцию `castRetroVote({week_id, side})`, идемпотентно по `visitor_id` (localStorage) + серверная проверка. Обновление раз в 15с через `setInterval` + `router.invalidate()`-lite (просто рефетч).
6. `<WeekRankingFull>` — топ-3 (не топ-2) + своя строка (если авторизован).
7. `<RoundtableCard>` — см. отдельный блок ниже.
8. Кнопка «Тренировка» — переиспользуем существующую.

## Game Day mode — правки

Оставляем `CountdownHero`, `WeekTopicReveal`, `PrimaryActions`, `MyRatingCard`. Меняем только блок 1×1/2×2:

- Новый компонент `<MatchesStatus>` показывает **бронирования** до `event_at` и **живые комнаты** после.
- Источник до старта: новая таблица `challenge_bookings` (`week_id`, `format` `1v1`/`2v2`, `status` `pending`/`confirmed`). Считаем `count` по формату.
- Источник после старта: существующий `live_rooms` (тот же запрос, что сейчас).
- Переключение делается по `now >= event_at` в `getHomeState`.

## Карточка круглого стола — 3 состояния

Круглый стол не привязан к теме недели — берём из `roundtables` независимо от фазы.

Новая серверная функция `getRoundtableCardState()` возвращает один из:
- `live` → текущая карточка (уже реализована).
- `upcoming` → ближайший `starts_at > now`, `is_live=false`. Отдаёт: дату/время, `moderator_name`, массив participants с **полным именем** и цитатой `pitch` (см. форма заявки), `seats_free` = `capacity - participants.length`.
- `past` → последний прошедший стол. Отдаёт: модератор, `opinion_before`/`opinion_after`, участников полными именами + `best_speaker_id` со звездой, `listeners`, `recording_url`.

Правки таблиц:
- `roundtables`: добавляем `capacity int default 6`, `recording_url text`.
- `roundtable_applications` (создаём, если ещё нет — по описанию она уже подразумевается формой заявки): поля `roundtable_id`, `user_id`, `pitch text` (1-2 предложения, длина 20-280), `status` (`pending`/`accepted`/`rejected`). **Убираем поле `stance`/`side`** если оно было.
- `roundtables.participants` (jsonb) теперь хранит `{ user_id, full_name, pitch }` — денормализованно после того как модератор принял заявку. Никакого `for`/`against` тега.

Обновляем компонент подачи заявки (если он есть; если нет — задел на будущее без нового UI сейчас, только миграция схемы).

`RoundtableBanner` из `LiveNow.tsx` расширяем в самостоятельный компонент `<RoundtableCard>` с тремя ветками рендера. Полные имена (не инициалы) в аватарной строке, цитата под каждым участником для `upcoming`.

## Что удаляется/переписывается

- `LiveNow.tsx` — удаляется, разбивается на `<MatchesStatus>` + `<RoundtableCard>` + Discussion-компоненты.
- `LastWeekBanner.tsx` — переезжает в discussion-набор в тёмном варианте.
- `src/routes/index.tsx` — становится роутером двух режимов на базе `phase` из `getHomeState()`. Загружает данные в лоадере через `createServerFn` (публичный, без auth).

## Технические детали

- Стек как есть: TanStack Start + Supabase + Tailwind v4.
- Все новые серверные функции — `createServerFn({ method: "GET" })` без `requireSupabaseAuth`, читают через server publishable client (см. проектную инструкцию про opaque `sb_` keys и `fetch` shim). Приватные записи голосов — тоже через серверную функцию, чтобы `visitor_id` валидация была на сервере.
- Публичные таблицы получают узкие `TO anon SELECT` политики; на `week_public_votes` `TO anon INSERT` с check-констрейнтом `side in ('pro','con')`.
- В миграции — сидим 1 «прошлую» неделю с 2 аргументами ЗА, 2 ПРОТИВ, 3-4 цитатами, 2 featured-спикерами, +1 будущий roundtable в состоянии `upcoming` с 2-3 участниками с pitch — чтобы UI сразу был живым.
- Часовой пояс `Asia/Tashkent` считаем на сервере через `date-fns-tz` (уже в проекте либо ставим), UI показывает локально.
- Тексты — русский, как сейчас на сайте.

## Что не входит в этот проход

- Реальный ввод/модерация pitch-заявок (только миграция схемы + денормализация в `participants` — форма подачи заявки — отдельная итерация).
- Реальный поток бронирования Challenge-матчей (пишем только чтение агрегата).
- Стилометрия/POI/тайм-пресс механики раунда — про них ТЗ упоминает философски, не требует UI.
- Push-обновления голосов (используем polling 15с, не realtime-канал).
