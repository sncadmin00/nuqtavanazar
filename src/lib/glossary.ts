export type Term = {
  term: string;
  ru: string;
  uz?: string;
  en?: string;
};

export const GLOSSARY: Term[] = [
  { term: "Формат Nuqta va Nazar", ru: "Собственный формат структурированного спора платформы. Работает в режимах соло, 1×1, 2×2 и круглый стол.", en: "The platform's own structured-debate format with solo, 1×1, 2×2 and roundtable modes." },
  { term: "Идея", ru: "Тезис стороны — одно предложение, которое сторона защищает или опровергает.", en: "The one-sentence thesis a side defends or opposes." },
  { term: "Критерий", ru: "Линейка, по которой сравниваются кейсы сторон. Ядро формулы Nuqta va Nazar.", en: "The yardstick used to compare the two sides' cases. The core of the Nuqta va Nazar formula." },
  { term: "Аргумент", ru: "Обоснованное утверждение: заявление + объяснение + пример + вывод, привязанный к критерию.", en: "A claim backed by reasoning, evidence and a link back to the criterion." },
  { term: "Тема (motion)", ru: "Утверждение, вокруг которого идёт раунд.", en: "The statement being debated." },
  { term: "Pro / Con", ru: "Сторона «за» и сторона «против» темы.", en: "The proposition and opposition sides of the motion." },
  { term: "Кейс", ru: "Общая позиция стороны: идея + критерий + основные аргументы.", en: "A side's overall stance: idea, criterion and main arguments." },
  { term: "Опровержение", ru: "Атака на аргумент оппонента через критерий, логику или пример.", en: "Attack on the opponent's argument via criterion, logic or example." },
  { term: "Столкновение (clash)", ru: "Точка, где кейсы сторон прямо противоречат друг другу.", en: "A point where the two sides' cases directly conflict." },
  { term: "Сжатие", ru: "Финальная речь: сравнение сторон по критерию без новых аргументов.", en: "The final speech: side-by-side comparison via the criterion, no new arguments." },
  { term: "Бремя доказательства", ru: "Обязательство стороны обосновать своё утверждение, а не требовать этого от оппонента.", en: "The obligation of a side to prove its own claim." },
  { term: "Режим 1×1", ru: "Формат Nuqta va Nazar на двух спикеров: 3 → 3 → 2 → 2 → 1 → 1 минут.", en: "The Nuqta va Nazar two-speaker format: 3 → 3 → 2 → 2 → 1 → 1 minutes." },
  { term: "Режим 2×2", ru: "Командный формат Nuqta va Nazar: две команды по два спикера, единый критерий на команду.", en: "The Nuqta va Nazar team format: two teams of two speakers sharing a criterion." },
  { term: "Круглый стол", ru: "Модерируемое обсуждение на 3–6 участников с единым критерием, заданным модератором.", en: "A moderated 3–6 person discussion with a single shared criterion." },
  { term: "Модератор", ru: "Ведёт круглый стол: фиксирует критерий, распределяет слово, возвращает к теме.", en: "Leads a roundtable: sets the criterion, gives the floor, keeps the discussion on track." },
  { term: "Судья", ru: "Оценивает раунд по единой рубрике: содержание, подача, стратегия.", en: "Evaluates a round using a shared rubric: matter, manner, method." },
  { term: "Баллот", ru: "Оценочный лист судьи с решением, комментарием и баллами спикеров.", en: "The judge's decision sheet with a verdict, comment and speaker scores." },
  { term: "День дебатов", ru: "Недельный ритм Nuqta va Nazar: субботние раунды. Тема объявляется за 24 часа.", en: "The Nuqta va Nazar weekly rhythm: Saturday rounds. The motion is announced 24 hours in advance." },
];
