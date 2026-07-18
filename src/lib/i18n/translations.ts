export type Lang = "ru" | "uz" | "en";

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: "ru", label: "Русский", short: "RU" },
  { code: "uz", label: "Oʻzbekcha", short: "UZ" },
  { code: "en", label: "English", short: "EN" },
];

type Dict = Record<string, string>;

const ru: Dict = {
  "brand.name": "Мезон",
  "brand.tagline": "Инфраструктура структурированного спора: идея → критерий → аргумент",

  "nav.home": "Главная",
  "nav.learn": "Обучение",
  "nav.motions": "Банк тем",
  "nav.glossary": "Глоссарий",
  "nav.practice": "Тренировка",
  "nav.judges": "Судьям",
  "nav.events": "События",
  "nav.about": "О клубе",
  "nav.profile": "Кабинет",
  "nav.signin": "Войти",
  "nav.signup": "Регистрация",
  "nav.signout": "Выйти",
  "nav.menu": "Меню",

  "home.hero.badge": "Дебаты в Узбекистане · старт в Бухаре",
  "home.hero.title": "Дебаты, которые готовят к жизни",
  "home.hero.subtitle":
    "Онлайн-платформа обучения дебатам для школьников и студентов. Два международных формата, теория, банк тем и практика — на трёх языках.",
  "home.hero.ctaPrimary": "Начать обучение",
  "home.hero.ctaSecondary": "Присоединиться к клубу",

  "home.formats.title": "Два формата — под разный уровень",
  "home.formats.kp.title": "Karl Popper",
  "home.formats.kp.audience": "Для школьников",
  "home.formats.kp.desc":
    "Командный формат «3 на 3» с акцентом на исследовании темы, командной работе и мастерстве опровержения.",
  "home.formats.ap.title": "Parliamentary / Asian",
  "home.formats.ap.audience": "Для студентов",
  "home.formats.ap.desc":
    "Классический университетский формат, вдохновлённый британским парламентом. Развивает риторику, аналитику и импровизацию.",
  "home.formats.learnMore": "Узнать больше",

  "home.mission.title": "Наша миссия",
  "home.mission.body":
    "Мы строим сообщество, где молодые люди Узбекистана учатся аргументировать, критически мыслить и уверенно говорить публично. Стартуем с университетов Бухары и идём к национальным университетским дебатам на ТВ.",

  "home.pillars.learn.title": "Структурированные уроки",
  "home.pillars.learn.body": "От основ аргументации до тонкостей форматов — с прогрессом в личном кабинете.",
  "home.pillars.motions.title": "Банк тем",
  "home.pillars.motions.body": "Десятки актуальных мотиваций для тренировок с фильтрами по формату и категории.",
  "home.pillars.practice.title": "Тренировка кейсов",
  "home.pillars.practice.body": "Конструктор речи по шаблону: тезис, аргументы, примеры, заключение.",
  "home.pillars.judges.title": "Судейство",
  "home.pillars.judges.body": "Критерии, чек-листы и примеры оценочных листов для честного судейства.",

  "home.cta.title": "Готовы начать?",
  "home.cta.body": "Зарегистрируйтесь, чтобы сохранять кейсы, отмечать пройденные уроки и получать приглашения на турниры.",

  "learn.title": "Обучение",
  "learn.subtitle": "Последовательные модули для новичков и опытных спикеров.",
  "learn.module": "Модуль",
  "learn.minutes": "мин",
  "learn.markComplete": "Отметить пройденным",
  "learn.completed": "Пройдено",
  "learn.back": "К списку модулей",

  "motions.title": "Банк тем (Motion Bank)",
  "motions.subtitle": "База мотиваций для тренировок. Фильтруйте по формату и категории.",
  "motions.add": "Добавить тему",
  "motions.addTitle": "Новая тема",
  "motions.form.title": "Формулировка",
  "motions.form.category": "Категория",
  "motions.form.format": "Формат",
  "motions.form.submit": "Добавить",
  "motions.filter.all": "Все",
  "motions.filter.format": "Формат",
  "motions.filter.category": "Категория",
  "motions.empty": "Ничего не найдено",
  "motions.loginToAdd": "Войдите, чтобы добавлять свои темы",

  "glossary.title": "Глоссарий дебатов",
  "glossary.subtitle": "Ключевые термины на трёх языках.",
  "glossary.search": "Поиск термина…",
  "glossary.empty": "Ничего не найдено",

  "practice.title": "Тренировка: конструктор кейса",
  "practice.subtitle": "Выберите тему и заполните шаблон речи. Сохраните черновик в личный кабинет.",
  "practice.motion": "Тема (motion)",
  "practice.side": "Сторона",
  "practice.side.pro": "Утверждение (Pro)",
  "practice.side.con": "Отрицание (Con)",
  "practice.thesis": "Тезис",
  "practice.arguments": "Аргументы",
  "practice.argument": "Аргумент",
  "practice.addArgument": "Добавить аргумент",
  "practice.conclusion": "Заключение",
  "practice.save": "Сохранить в кабинет",
  "practice.saved": "Кейс сохранён",
  "practice.loginRequired": "Войдите, чтобы сохранять кейсы",

  "judges.title": "Судьям (Judge Training)",
  "judges.subtitle": "Критерии оценки, чек-листы, примеры баллотов.",
  "judges.criteria.title": "Основные критерии",
  "judges.checklist.title": "Чек-лист судьи",
  "judges.ballot.title": "Пример баллота",

  "events.title": "События и турниры",
  "events.subtitle": "Расписание встреч клуба и турниров.",
  "events.empty": "Пока нет запланированных событий",
  "events.contact.title": "Хотите присоединиться?",
  "events.contact.body": "Напишите нам — расскажем, как попасть в клуб и на ближайшие тренировки.",

  "about.title": "О клубе",
  "about.subtitle": "Мезон — платформа структурированных дебатов, стартующая в Бухаре.",

  "auth.title": "Вход и регистрация",
  "auth.tab.signin": "Вход",
  "auth.tab.signup": "Регистрация",
  "auth.email": "Email",
  "auth.password": "Пароль",
  "auth.displayName": "Как к вам обращаться",
  "auth.city": "Город",
  "auth.submit.signin": "Войти",
  "auth.submit.signup": "Создать аккаунт",
  "auth.errors.generic": "Что-то пошло не так. Попробуйте ещё раз.",
  "auth.signup.checkEmail": "Проверьте почту, чтобы подтвердить регистрацию.",

  "profile.title": "Личный кабинет",
  "profile.progress": "Прогресс обучения",
  "profile.cases": "Мои кейсы",
  "profile.noCases": "Пока нет сохранённых кейсов",
  "profile.city": "Город",
  "profile.role": "Роль",
  "profile.role.school": "Школьник",
  "profile.role.student": "Студент",
  "profile.role.other": "Другое",
  "profile.save": "Сохранить профиль",
  "profile.saved": "Профиль обновлён",

  "footer.tagline": "Дебатное образование для нового поколения Узбекистана.",
  "footer.rights": "© 2026 Мезон. Все права защищены.",

  "category.politics": "Политика",
  "category.economics": "Экономика",
  "category.ethics": "Этика",
  "category.technology": "Технологии",
  "category.education": "Образование",
  "category.environment": "Экология",
  "category.health": "Здоровье",
  "category.culture": "Культура",
  "category.other": "Другое",

  "format.solo": "Соло",
  "format.duel": "1×1",
  "format.team": "2×2",
  "format.roundtable": "Круглый стол",
  "format.both": "Все форматы",
};

const uz: Dict = {
  "brand.tagline": "Dunyoni yaxshilash uchun bahslashishni oʻrganamiz",

  "nav.home": "Bosh sahifa",
  "nav.learn": "Oʻqish",
  "nav.motions": "Mavzular",
  "nav.glossary": "Lugʻat",
  "nav.practice": "Mashq",
  "nav.judges": "Hakamlar",
  "nav.events": "Tadbirlar",
  "nav.about": "Klub haqida",
  "nav.profile": "Kabinet",
  "nav.signin": "Kirish",
  "nav.signup": "Roʻyxatdan oʻtish",
  "nav.signout": "Chiqish",
  "nav.menu": "Menyu",

  "home.hero.badge": "Oʻzbekistonda bahslar · Buxorodan boshlaymiz",
  "home.hero.title": "Hayotga tayyorlaydigan bahslar",
  "home.hero.subtitle":
    "Maktab oʻquvchilari va talabalar uchun bahs oʻrganish onlayn platformasi. Ikkita xalqaro format, nazariya, mavzular banki va amaliyot — uch tilda.",
  "home.hero.ctaPrimary": "Oʻqishni boshlash",
  "home.hero.ctaSecondary": "Klubga qoʻshilish",

  "home.formats.title": "Ikki format — turli darajalar uchun",
  "home.formats.kp.audience": "Maktab oʻquvchilari uchun",
  "home.formats.ap.audience": "Talabalar uchun",
  "home.formats.learnMore": "Batafsil",

  "home.mission.title": "Missiyamiz",
  "home.cta.title": "Boshlashga tayyormisiz?",

  "footer.tagline": "Oʻzbekistonning yangi avlodi uchun bahs taʼlimi.",
  "footer.rights": "© 2026 Mezon. Barcha huquqlar himoyalangan.",
};

const en: Dict = {
  "brand.tagline": "Learning to argue in order to change the world for the better",

  "nav.home": "Home",
  "nav.learn": "Learn",
  "nav.motions": "Motion Bank",
  "nav.glossary": "Glossary",
  "nav.practice": "Practice",
  "nav.judges": "Judges",
  "nav.events": "Events",
  "nav.about": "About",
  "nav.profile": "Profile",
  "nav.signin": "Sign in",
  "nav.signup": "Sign up",
  "nav.signout": "Sign out",
  "nav.menu": "Menu",

  "home.hero.badge": "Debate in Uzbekistan · launching in Bukhara",
  "home.hero.title": "Debate skills that prepare you for life",
  "home.hero.subtitle":
    "An online debate-education platform for high-school and university students. Two international formats, theory, a motion bank and practice — in three languages.",
  "home.hero.ctaPrimary": "Start learning",
  "home.hero.ctaSecondary": "Join the club",

  "home.formats.title": "Two formats — for different levels",
  "home.formats.kp.audience": "For high-school students",
  "home.formats.ap.audience": "For university students",
  "home.formats.learnMore": "Learn more",

  "home.mission.title": "Our mission",
  "home.cta.title": "Ready to start?",

  "learn.title": "Learn",
  "motions.title": "Motion Bank",
  "glossary.title": "Debate Glossary",
  "practice.title": "Practice: case builder",
  "judges.title": "Judge Training",
  "events.title": "Events & tournaments",
  "about.title": "About the club",
  "auth.title": "Sign in / Sign up",
  "profile.title": "Profile",

  "footer.tagline": "Debate education for a new generation of Uzbekistan.",
  "footer.rights": "© 2026 Mezon. All rights reserved.",
};

export const translations: Record<Lang, Dict> = { ru, uz, en };

export function translate(lang: Lang, key: string): string {
  return translations[lang][key] ?? translations.ru[key] ?? key;
}
