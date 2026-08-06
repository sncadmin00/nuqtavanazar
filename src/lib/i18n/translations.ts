export type Lang = "ru" | "uz" | "en";

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: "ru", label: "Русский", short: "RU" },
  { code: "uz", label: "Oʻzbekcha", short: "UZ" },
  { code: "en", label: "English", short: "EN" },
];

type Dict = Record<string, string>;

const ru: Dict = {
  // Brand
  "brand.name": "Nuqta va Nazar",

  // Header
  "header.signIn": "Войти",
  "header.brandAria": "Nuqta va Nazar — на главную",

  // Bottom tabs
  "tabs.home": "Главная",
  "tabs.learn": "Обучение",
  "learn.title": "Обучение",
  "learn.subtitle": "Короткие модули: формула спора, критерии, форматы раундов и ораторское мастерство.",
  "learn.module": "Модуль",
  "learn.minutes": "мин",
  "learn.back": "К списку модулей",
  "learn.completed": "Пройдено",
  "learn.markComplete": "Отметить пройденным",

  "tabs.debateDay": "День дебатов",
  "tabs.training": "Тренировка",
  "tabs.profile": "Профиль",
  "tabs.ariaNav": "Основная навигация",

  // Home — banners / streak
  "home.prevWeek.title": "Итоги прошлой недели",
  "home.pro": "За",
  "home.con": "Против",
  "home.training.title": "Тренировка",
  "home.streak.none": "Серии пока нет",
  "home.streak.days.one": "{n} день подряд",
  "home.streak.days.few": "{n} дня подряд",
  "home.streak.days.many": "{n} дней подряд",
  "week.thisWeek": "Эта неделя",
  "week.mon": "Пн", "week.tue": "Вт", "week.wed": "Ср", "week.thu": "Чт",
  "week.fri": "Пт", "week.sat": "Сб", "week.sun": "Вс",



  // Countdown hero
  "hero.eyebrow": "День дебатов",
  "hero.untilNext": "До ближайшего Дня дебатов · {day}",
  "hero.days": "дни",
  "hero.hours": "часы",
  "hero.mins": "мин",
  "hero.announced": "Объявлено",
  "hero.hiddenHint": "Тема появится за 48 часов до старта",

  // Day of week (accusative form used after «в …»)
  "day.0": "воскресенье",
  "day.1": "понедельник",
  "day.2": "вторник",
  "day.3": "среду",
  "day.4": "четверг",
  "day.5": "пятницу",
  "day.6": "субботу",

  // Primary actions
  "actions.findOpponent": "Найти соперника",
  "actions.training": "Тренировка",
  "actions.liveSoon": "Live-поиск скоро откроется",
  "actions.liveSoon.desc": "Матчинг соперника заработает в День дебатов.",

  // My rating card
  "rating.eyebrow": "Ваш рейтинг",
  "rating.signInPrompt": "Войдите, чтобы играть и попадать в рейтинг",
  "rating.signInGo": "Войти →",
  "rating.player": "Игрок",
  "league.zonal": "Зональная лига",
  "league.republic": "Республиканская лига",

  // Idea clash
  "clash.title": "Столкновение идей",
  "clash.topByKnocks": "топ-2 по тук",
  "clash.pro": "ЗА",
  "clash.con": "ПРОТИВ",
  "clash.anon": "аноним",
  "clash.knock": "тук",

  // Retro poll
  "poll.title": "А ты как думаешь?",
  "poll.subtitle": "Голосование по теме прошлой недели — открыто ретроактивно",
  "poll.pro": "За",
  "poll.con": "Против",
  "poll.votes.one": "{n} голос",
  "poll.votes.few": "{n} голоса",
  "poll.votes.many": "{n} голосов",

  // Top quotes
  "quotes.title": "Топ реплик недели",
  "quotes.prev": "Назад",
  "quotes.next": "Вперёд",
  "quotes.knock": "тук",

  // Featured speakers
  "featured.best": "Лучший спикер",
  "featured.rising": "Новый голос",

  // Week ranking
  "ranking.title": "Рейтинг недели",
  "ranking.leagueLink": "Вся лига →",
  "ranking.empty": "Пока пусто. Первые матчи — на этой неделе.",

  // Voice of the week
  "voice.title": "Голос недели",
  "voice.subtitle": "Скажи, что думаешь по теме прошлой недели — до 60 секунд.",
  "voice.signInPrompt": "Войди, чтобы записать голос",
  "voice.uploading": "Загружаем…",
  "voice.stop": "Остановить",
  "voice.start": "Добавь свой голос — 60 сек",
  "voice.needMic": "Нужен доступ к микрофону",
  "voice.uploaded": "Голос добавлен",
  "voice.uploadFail": "Не удалось загрузить",
  "voice.fallbackTitle": "Голосовая реакция",
  "voice.records.one": "{n} запись",
  "voice.records.few": "{n} записи",
  "voice.records.many": "{n} записей",

  // Roundtable
  "rt.emptyDesc": "Круглый стол сейчас не идёт. Ближайший — скоро объявим.",
  "rt.live": "Круглый стол идёт",
  "rt.moderator": "Модератор",
  "rt.listenSoon": "Прослушивание скоро откроется",

  // Matches status (game day)
  "matches.live": "Матчи сейчас",
  "matches.upcoming": "Матчи · сегодня",
  "matches.notReady": "Матчи откроются в День дебатов",
  "matches.watchSoon": "Просмотр скоро откроется",

  // Common
  // Matches (game-day)
  "matches.onAir": "Сейчас в эфире",
  "matches.registered": "Записались на День дебатов",
  "matches.themeWeek": "Тема недели · живые раунды идут прямо сейчас",
  "matches.beforeStart": "До старта Дня дебатов — брони уже заявлены",
  "matches.hiddenHint": "Тема откроется за 48 часов до старта",
  "matches.rooms.one": "комната",
  "matches.rooms.many": "комнат",
  "matches.recorded.one": "матч записан",
  "matches.recorded.many": "матчей записано",
  "matches.listeners": "слушат.",
  "matches.applySoon": "Заявки скоро откроются",

  // Game day cards
  "gameday.duel.title": "Дуэль 1×1",
  "gameday.duel.subtitle": "Тема недели · живой аудио-батл",
  "gameday.duel.queue": "{n} в очереди",
  "gameday.duel.enter": "Войти в очередь",
  "gameday.duel.closed": "Батлы закрыты",
  "gameday.duel.before": "Батлы откроются в День дебатов",
  "gameday.duel.after": "День дебатов завершён",
  "gameday.duel.noTopic": "Тема ещё не объявлена",
  "gameday.team.title": "Командный баттл 2×2",
  "gameday.team.subtitle": "Парламентский формат вдвоём",
  "gameday.team.active": "Команда активна",
  "gameday.team.inactive": "Нужен второй спикер",
  "gameday.team.noTeam": "У вас пока нет команды",
  "gameday.team.enter": "Найти бой",
  "gameday.team.create": "Создать команду",
  "gameday.team.signIn": "Войти",
  "gameday.tournament.title": "Турнирная сетка",
  "gameday.tournament.subtitle": "Активный турнир",
  "gameday.tournament.empty": "Сейчас турниров нет",
  "gameday.tournament.go": "К турнирам",
  "gameday.ai.title": "AI-разминка",
  "gameday.ai.subtitle": "3 минуты спарринга по теме дня",
  "gameday.ai.start": "Разминаться",

  // Roundtable extra
  "rt.upcoming.title": "Ближайший круглый стол",
  "rt.past.title": "Прошедший круглый стол",
  "rt.moderatorShort": "модератор",
  "rt.seatsFree": "{n} свободн. мест из {cap}",
  "rt.noSeats": "мест нет",
  "rt.apply": "Подать заявку →",
  "rt.applySoon": "Заявка на участие скоро откроется",
  "rt.participants.short": "участн.",
  "rt.opinionShift": "Сдвиг мнения · ",
  "rt.listened": "слушали",
  "rt.listen": "Слушать",
  "rt.playerSoon": "Плеер скоро откроется",
  "rt.recordUnavailable": "Запись пока недоступна",

  // Events
  "events.title": "События и турниры",
  "events.subtitle": "Расписание встреч, мастер-классов и турниров Nuqta va Nazar.",
  "events.empty": "Ближайших событий пока нет — следите за обновлениями.",
  "events.contact.title": "Хотите провести турнир или воркшоп?",
  "events.contact.body": "Напишите нам — организуем совместное событие в вашем городе или университете.",

  "common.dash": "—",
};

const uz: Dict = {
  "brand.name": "Nuqta va Nazar",

  "header.signIn": "Kirish",
  "header.brandAria": "Nuqta va Nazar — bosh sahifa",

  "tabs.home": "Bosh sahifa",
  "tabs.learn": "Oʻqish",
  "learn.title": "Oʻqish",
  "learn.subtitle": "Qisqa modullar: bahs formulasi, mezonlar, raund formatlari va notiqlik sanʼati.",
  "learn.module": "Modul",
  "learn.minutes": "daq",
  "learn.back": "Modullar roʻyxatiga",
  "learn.completed": "Tugallandi",
  "learn.markComplete": "Tugallandi deb belgilash",

  "tabs.debateDay": "Bahs kuni",
  "tabs.training": "Mashq",
  "tabs.profile": "Kabinet",
  "tabs.ariaNav": "Asosiy navigatsiya",

  "home.prevWeek.title": "Oʻtgan hafta natijalari",
  "home.pro": "Roziman",
  "home.con": "Qarshiman",
  "home.training.title": "Mashq",
  "home.streak.none": "Hali seriya yoʻq",
  "home.streak.days.one": "{n} kun ketma-ket",
  "home.streak.days.few": "{n} kun ketma-ket",
  "home.streak.days.many": "{n} kun ketma-ket",
  "week.thisWeek": "Bu hafta",
  "week.mon": "Du", "week.tue": "Se", "week.wed": "Ch", "week.thu": "Pa",
  "week.fri": "Ju", "week.sat": "Sh", "week.sun": "Ya",



  "hero.eyebrow": "Bahs kuni",
  "hero.untilNext": "Yaqin Bahs kunigacha · {day}",
  "hero.days": "kun",
  "hero.hours": "soat",
  "hero.mins": "daqiqa",
  "hero.announced": "Eʼlon qilindi",
  "hero.hiddenHint": "Mavzu boshlanishdan 48 soat oldin paydo boʻladi",

  "day.0": "yakshanba",
  "day.1": "dushanba",
  "day.2": "seshanba",
  "day.3": "chorshanba",
  "day.4": "payshanba",
  "day.5": "juma",
  "day.6": "shanba",

  "actions.findOpponent": "Raqib topish",
  "actions.training": "Mashq",
  "actions.liveSoon": "Live-qidiruv tez orada ochiladi",
  "actions.liveSoon.desc": "Raqib tanlash Bahs kunida ishga tushadi.",

  "rating.eyebrow": "Sizning reytingingiz",
  "rating.signInPrompt": "Reytingga kirish uchun tizimga kiring",
  "rating.signInGo": "Kirish →",
  "rating.player": "Oʻyinchi",
  "league.zonal": "Hududiy liga",
  "league.republic": "Respublika ligasi",

  "clash.title": "Fikrlar toʻqnashuvi",
  "clash.topByKnocks": "eng koʻp tuk boʻyicha top-2",
  "clash.pro": "ROZIMAN",
  "clash.con": "QARSHIMAN",
  "clash.anon": "anonim",
  "clash.knock": "tuk",

  "poll.title": "Sizningcha-chi?",
  "poll.subtitle": "Oʻtgan hafta mavzusi boʻyicha ovoz berish — retroaktiv ochiq",
  "poll.pro": "Roziman",
  "poll.con": "Qarshiman",
  "poll.votes.one": "{n} ovoz",
  "poll.votes.few": "{n} ovoz",
  "poll.votes.many": "{n} ovoz",

  "quotes.title": "Hafta eng yaxshi soʻzlari",
  "quotes.prev": "Orqaga",
  "quotes.next": "Oldinga",
  "quotes.knock": "tuk",

  "featured.best": "Eng yaxshi soʻzlovchi",
  "featured.rising": "Yangi ovoz",

  "ranking.title": "Hafta reytingi",
  "ranking.leagueLink": "Butun liga →",
  "ranking.empty": "Hali boʻsh. Birinchi oʻyinlar — shu haftada.",

  "voice.title": "Hafta ovozi",
  "voice.subtitle": "Oʻtgan hafta mavzusi haqida fikringizni ayting — 60 soniyagacha.",
  "voice.signInPrompt": "Ovoz yozish uchun tizimga kiring",
  "voice.uploading": "Yuklanmoqda…",
  "voice.stop": "Toʻxtatish",
  "voice.start": "Ovoz qoʻshing — 60 soniya",
  "voice.needMic": "Mikrofonga ruxsat kerak",
  "voice.uploaded": "Ovoz qoʻshildi",
  "voice.uploadFail": "Yuklab boʻlmadi",
  "voice.fallbackTitle": "Ovozli reaksiya",
  "voice.records.one": "{n} yozuv",
  "voice.records.few": "{n} yozuv",
  "voice.records.many": "{n} yozuv",

  "rt.emptyDesc": "Davra suhbati hozir yoʻq. Yaqin orada eʼlon qilamiz.",
  "rt.live": "Davra suhbati bormoqda",
  "rt.moderator": "Moderator",
  "rt.listenSoon": "Tinglash tez orada ochiladi",

  "matches.live": "Hozirgi oʻyinlar",
  "matches.upcoming": "Oʻyinlar · bugun",
  "matches.notReady": "Oʻyinlar Bahs kunida ochiladi",
  "matches.watchSoon": "Tomosha tez orada ochiladi",

  "matches.onAir": "Hozir efirda",
  "matches.registered": "Bahs kuniga yozildilar",
  "matches.themeWeek": "Hafta mavzusi · jonli raundlar hozir bormoqda",
  "matches.beforeStart": "Bahs kuniga qadar — bronlar eʼlon qilingan",
  "matches.hiddenHint": "Mavzu boshlanishdan 48 soat oldin ochiladi",
  "matches.rooms.one": "xona",
  "matches.rooms.many": "xona",
  "matches.recorded.one": "oʻyin yozildi",
  "matches.recorded.many": "oʻyin yozildi",
  "matches.listeners": "tinglovchi",
  "matches.applySoon": "Arizalar tez orada ochiladi",

  // Game day cards
  "gameday.duel.title": "Duel 1×1",
  "gameday.duel.subtitle": "Hafta mavzusi · jonli audio-batl",
  "gameday.duel.queue": "{n} navbatda",
  "gameday.duel.enter": "Navbatga kirish",
  "gameday.duel.closed": "Batlar yopiq",
  "gameday.duel.before": "Batlar Bahs kunida ochiladi",
  "gameday.duel.after": "Bahs kuni tugadi",
  "gameday.duel.noTopic": "Mavzu hali eʼlon qilinmagan",
  "gameday.team.title": "Jamoa jangi 2×2",
  "gameday.team.subtitle": "Parlament tarzida juftlikda",
  "gameday.team.active": "Jamoa faol",
  "gameday.team.inactive": "Ikkinchi soʻzlovchi kerak",
  "gameday.team.noTeam": "Sizda hali jamoa yoʻq",
  "gameday.team.enter": "Jang qidirish",
  "gameday.team.create": "Jamoa yaratish",
  "gameday.team.signIn": "Kirish",
  "gameday.tournament.title": "Turnir setkasi",
  "gameday.tournament.subtitle": "Faol turnir",
  "gameday.tournament.empty": "Hozir turnirlar yoʻq",
  "gameday.tournament.go": "Turnirlarga",
  "gameday.ai.title": "AI-razminka",
  "gameday.ai.subtitle": "Kun mavzusi boʻyicha 3 daqiqa sparring",
  "gameday.ai.start": "Razminka",

  "rt.upcoming.title": "Yaqin davra suhbati",
  "rt.past.title": "Oʻtgan davra suhbati",
  "rt.moderatorShort": "moderator",
  "rt.seatsFree": "{cap} tadan {n} joy bor",
  "rt.noSeats": "joy yoʻq",
  "rt.apply": "Ariza berish →",
  "rt.applySoon": "Ishtirok arizasi tez orada ochiladi",
  "rt.participants.short": "ishtirok.",
  "rt.opinionShift": "Fikr oʻzgarishi · ",
  "rt.listened": "tinglashdi",
  "rt.listen": "Tinglash",
  "rt.playerSoon": "Pleyer tez orada ochiladi",
  "rt.recordUnavailable": "Yozuv hozircha mavjud emas",

  // Events
  "events.title": "Tadbirlar va turnirlar",
  "events.subtitle": "Nuqta va Nazar uchrashuvlari, master-klasslari va turnirlar jadvali.",
  "events.empty": "Yaqinda tadbirlar yoʻq — yangilanishlarni kuzatib boring.",
  "events.contact.title": "Turnir yoki vorkshop oʻtkazmoqchimisiz?",
  "events.contact.body": "Bizga yozing — sizning shahringiz yoki universitetingizda hamkorlik tadbirini tashkil qilamiz.",

  "common.dash": "—",
};

const en: Dict = {
  "brand.name": "Nuqta va Nazar",

  "header.signIn": "Sign in",
  "header.brandAria": "Nuqta va Nazar — home",

  "tabs.home": "Home",
  "tabs.learn": "Learn",
  "learn.title": "Learn",
  "learn.subtitle": "Short modules: the argument formula, criteria, round formats and public speaking.",
  "learn.module": "Module",
  "learn.minutes": "min",
  "learn.back": "Back to modules",
  "learn.completed": "Completed",
  "learn.markComplete": "Mark as complete",

  "tabs.debateDay": "Debate Day",
  "tabs.training": "Practice",
  "tabs.profile": "Profile",
  "tabs.ariaNav": "Primary navigation",

  "home.prevWeek.title": "Last week results",
  "home.pro": "Pro",
  "home.con": "Con",
  "home.training.title": "Practice",
  "home.streak.none": "No streak yet",
  "home.streak.days.one": "{n} day in a row",
  "home.streak.days.few": "{n} days in a row",
  "home.streak.days.many": "{n} days in a row",
  "week.thisWeek": "This week",
  "week.mon": "Mon", "week.tue": "Tue", "week.wed": "Wed", "week.thu": "Thu",
  "week.fri": "Fri", "week.sat": "Sat", "week.sun": "Sun",



  "hero.eyebrow": "Debate Day",
  "hero.untilNext": "Until next Debate Day · {day}",
  "hero.days": "days",
  "hero.hours": "hours",
  "hero.mins": "min",
  "hero.announced": "Announced",
  "hero.hiddenHint": "The motion appears 48 hours before start",

  "day.0": "Sunday",
  "day.1": "Monday",
  "day.2": "Tuesday",
  "day.3": "Wednesday",
  "day.4": "Thursday",
  "day.5": "Friday",
  "day.6": "Saturday",

  "actions.findOpponent": "Find opponent",
  "actions.training": "Practice",
  "actions.liveSoon": "Live match-up opens soon",
  "actions.liveSoon.desc": "Opponent matching activates on Debate Day.",

  "rating.eyebrow": "Your rating",
  "rating.signInPrompt": "Sign in to play and enter the rating",
  "rating.signInGo": "Sign in →",
  "rating.player": "Player",
  "league.zonal": "Zonal league",
  "league.republic": "Republic league",

  "clash.title": "Clash of ideas",
  "clash.topByKnocks": "top-2 by knocks",
  "clash.pro": "PRO",
  "clash.con": "CON",
  "clash.anon": "anon",
  "clash.knock": "knocks",

  "poll.title": "What do you think?",
  "poll.subtitle": "Voting on last week's motion — open retroactively",
  "poll.pro": "Pro",
  "poll.con": "Con",
  "poll.votes.one": "{n} vote",
  "poll.votes.few": "{n} votes",
  "poll.votes.many": "{n} votes",

  "quotes.title": "Top lines of the week",
  "quotes.prev": "Previous",
  "quotes.next": "Next",
  "quotes.knock": "knocks",

  "featured.best": "Best speaker",
  "featured.rising": "New voice",

  "ranking.title": "Weekly ranking",
  "ranking.leagueLink": "Full league →",
  "ranking.empty": "Empty for now. First matches — this week.",

  "voice.title": "Voice of the week",
  "voice.subtitle": "Say what you think about last week's motion — up to 60 seconds.",
  "voice.signInPrompt": "Sign in to record your voice",
  "voice.uploading": "Uploading…",
  "voice.stop": "Stop",
  "voice.start": "Add your voice — 60 s",
  "voice.needMic": "Microphone permission required",
  "voice.uploaded": "Voice added",
  "voice.uploadFail": "Upload failed",
  "voice.fallbackTitle": "Voice reaction",
  "voice.records.one": "{n} clip",
  "voice.records.few": "{n} clips",
  "voice.records.many": "{n} clips",

  "rt.emptyDesc": "No roundtable at the moment. Next one — announced soon.",
  "rt.live": "Roundtable is live",
  "rt.moderator": "Moderator",
  "rt.listenSoon": "Listening opens soon",

  "matches.live": "Matches now",
  "matches.upcoming": "Matches · today",
  "matches.notReady": "Matches open on Debate Day",
  "matches.watchSoon": "Viewing opens soon",

  "matches.onAir": "On air now",
  "matches.registered": "Signed up for Debate Day",
  "matches.themeWeek": "Weekly motion · live rounds going on now",
  "matches.beforeStart": "Before Debate Day — slots already claimed",
  "matches.hiddenHint": "The motion opens 48 hours before start",
  "matches.rooms.one": "room",
  "matches.rooms.many": "rooms",
  "matches.recorded.one": "match booked",
  "matches.recorded.many": "matches booked",
  "matches.listeners": "listen.",
  "matches.applySoon": "Sign-ups open soon",

  // Game day cards
  "gameday.duel.title": "Duel 1×1",
  "gameday.duel.subtitle": "Weekly motion · live audio battle",
  "gameday.duel.queue": "{n} in queue",
  "gameday.duel.enter": "Join queue",
  "gameday.duel.closed": "Battles closed",
  "gameday.duel.before": "Battles open on Debate Day",
  "gameday.duel.after": "Debate Day is over",
  "gameday.duel.noTopic": "Motion not announced yet",
  "gameday.team.title": "Team battle 2×2",
  "gameday.team.subtitle": "Parliamentary format in pairs",
  "gameday.team.active": "Team is active",
  "gameday.team.inactive": "Need a second speaker",
  "gameday.team.noTeam": "You have no team yet",
  "gameday.team.enter": "Find battle",
  "gameday.team.create": "Create team",
  "gameday.team.signIn": "Sign in",
  "gameday.tournament.title": "Tournament bracket",
  "gameday.tournament.subtitle": "Active tournament",
  "gameday.tournament.empty": "No tournaments now",
  "gameday.tournament.go": "To tournaments",
  "gameday.ai.title": "AI warm-up",
  "gameday.ai.subtitle": "3-minute sparring on today's motion",
  "gameday.ai.start": "Warm up",

  "rt.upcoming.title": "Next roundtable",
  "rt.past.title": "Past roundtable",
  "rt.moderatorShort": "moderator",
  "rt.seatsFree": "{n} of {cap} seats free",
  "rt.noSeats": "no seats",
  "rt.apply": "Apply →",
  "rt.applySoon": "Applications open soon",
  "rt.participants.short": "part.",
  "rt.opinionShift": "Opinion shift · ",
  "rt.listened": "listened",
  "rt.listen": "Listen",
  "rt.playerSoon": "Player opens soon",
  "rt.recordUnavailable": "Recording not available yet",

  // Events
  "events.title": "Events & tournaments",
  "events.subtitle": "Schedule of Nuqta va Nazar meetups, workshops and tournaments.",
  "events.empty": "No upcoming events yet — stay tuned.",
  "events.contact.title": "Want to host a tournament or workshop?",
  "events.contact.body": "Email us and we’ll co-organize an event in your city or university.",

  "common.dash": "—",
};

export const translations: Record<Lang, Dict> = { ru, uz, en };

export function translate(lang: Lang, key: string): string {
  return translations[lang][key] ?? translations.ru[key] ?? key;
}

// Russian-style plural selector (one/few/many). For uz/en we still call
// the same helper — the dictionaries above map all three buckets to the
// language-correct single form, so the result is grammatical everywhere.
export function pluralKey(lang: Lang, n: number, base: string): string {
  if (lang === "en") {
    return `${base}.${n === 1 ? "one" : "many"}`;
  }
  if (lang === "uz") {
    return `${base}.many`;
  }
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return `${base}.many`;
  if (mod10 === 1) return `${base}.one`;
  if (mod10 >= 2 && mod10 <= 4) return `${base}.few`;
  return `${base}.many`;
}

export function tPlural(lang: Lang, n: number, base: string): string {
  const key = pluralKey(lang, n, base);
  return translate(lang, key).replace("{n}", String(n));
}
