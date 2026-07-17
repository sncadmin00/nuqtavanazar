## Debate Club Uzbekistan — начальная версия

Создам образовательную платформу на TanStack Start с базой (Lovable Cloud), мультиязычностью и системой регистрации.

### Стек и инфраструктура
- **TanStack Start + React 19 + Tailwind v4** (уже в проекте)
- **Lovable Cloud** — база данных (пользователи, темы, кейсы, события, прогресс) + auth (email/password)
- **i18n** — легковесное решение через React Context + JSON-словари для ru/uz/en, переключатель в шапке, `localStorage` для выбранного языка (читается в `useEffect` во избежание SSR-mismatch). Начинаем с полного русского, uz/en — с ключевыми переводами навигации/UI, остальное — fallback на ru.

### Дизайн-система
- Молодёжная, энергичная палитра: тёплый оранжево-коралловый акцент (`primary`) + глубокий графит (`foreground`), мягкий кремовый фон, вторичный электрик-синий для акцентов. Всё через oklch-токены в `src/styles.css`.
- Крупная типографика (Space Grotesk для заголовков + Inter для текста через `<link>` в `__root.tsx`), скруглённые карточки, тонкие градиенты, чистый минимализм.
- Полностью адаптивный (mobile-first), sticky-хедер с языковым переключателем и CTA.

### Структура маршрутов
```text
src/routes/
  __root.tsx              — шелл + i18n provider + auth provider + хедер/футер
  index.tsx               — главная: hero, миссия, два формата, CTA
  learn.tsx               — layout со списком модулей
  learn.index.tsx         — обзор всех модулей
  learn.$moduleId.tsx     — конкретный урок (контент из локального контент-модуля)
  motions.tsx             — банк тем (список + фильтры + форма добавления для залогиненных)
  glossary.tsx            — глоссарий с поиском
  practice.tsx            — конструктор кейса (заглушка + базовый шаблон)
  judges.tsx              — судьи (заглушка с базовым чек-листом)
  events.tsx              — события (список из БД, заглушка + контактная форма)
  about.tsx               — о клубе
  auth.tsx                — вход/регистрация (табы)
  _authenticated/
    route.tsx             — гейт (integration-managed)
    profile.tsx           — личный кабинет: прогресс, сохранённые кейсы
```

### База данных (миграция при включении Cloud)
- `profiles` (id → auth.users, display_name, city, role: student/school, created_at) + trigger на signup
- `motions` (id, title, category, format: karl_popper/parliamentary/both, language, created_by, created_at) — публичное чтение, insert для authenticated
- `lesson_progress` (user_id, lesson_id, completed_at) — RLS: own only
- `saved_cases` (id, user_id, motion_id nullable, motion_text, thesis, arguments jsonb, conclusion, created_at) — RLS: own only
- `events` (id, title, description, location, starts_at, format) — публичное чтение, запись через сервисную роль (админ вручную в будущем; сейчас публичный insert закрыт)

### Контент (первая партия)
- **Учебные модули** (3 заполненных): «Основы дебатов», «Формат Karl Popper», «Parliamentary/Asian Parliamentary» — оформлены как MDX-подобный контент в TS-константах, разметка через компоненты (H2, параграф, список, callout).
- **Глоссарий**: 15 терминов (Motion, Proposition, Opposition, Rebuttal, POI, Whip, Reply Speech, Case, Clash, Burden of Proof, Karl Popper, BP, AP, Adjudicator, Ballot).
- **Мотивации**: seed 15 стартовых тем через миграцию.

### Технические заметки
- Auth: `supabase` в клиенте, `onAuthStateChange` в `__root.tsx`, `router.invalidate()` + `queryClient.invalidateQueries()` с фильтрацией событий.
- i18n: `useTranslation()` хук, ключи вида `nav.learn`, `home.hero.title`. При отсутствии перевода — fallback на ru.
- SEO: свои `head()` для каждой публичной страницы (title/description/og на всех трёх языках через ключ ru как дефолт).
- Sitemap.xml + robots.txt в конце.

### Что вне scope этой итерации
- Полные переводы всего контента уроков на uz/en (только каркас + русский контент).
- Модерация мотиваций (по требованию — не нужна).
- Календарь-виджет для событий (пока список).
- Публикация Practice-конструктора с полной логикой сохранения черновиков — базовое сохранение будет, продвинутый редактор дошлифуем следующим шагом.

Готов реализовать. После подтверждения начну с включения Lovable Cloud и миграции.