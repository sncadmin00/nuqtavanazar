export type Term = {
  term: string;
  ru: string;
  uz?: string;
  en?: string;
};

export const GLOSSARY: Term[] = [
  { term: "Motion", ru: "Тема (мотивация) раунда — утверждение, вокруг которого идёт спор.", en: "The statement being debated." },
  { term: "Proposition (Government)", ru: "Сторона, защищающая мотивацию.", en: "The side that supports the motion." },
  { term: "Opposition", ru: "Сторона, опровергающая мотивацию.", en: "The side that opposes the motion." },
  { term: "Case", ru: "Общая позиция команды: тезис плюс основные аргументы.", en: "A team's overall stance: thesis plus main arguments." },
  { term: "Argument", ru: "Обоснованное утверждение: заявление + объяснение + доказательство + вывод.", en: "A claim supported by reasoning and evidence." },
  { term: "Rebuttal", ru: "Опровержение — атака на аргументы оппонента.", en: "Attack on the opponent's arguments." },
  { term: "Clash", ru: "Столкновение — точка, где кейсы сторон прямо противоречат друг другу.", en: "Direct conflict between the two sides' arguments." },
  { term: "Burden of Proof", ru: "Бремя доказательства — обязательство стороны обосновать своё утверждение.", en: "The obligation to prove one's claim." },
  { term: "POI (Point of Information)", ru: "Короткое вмешательство оппонента во время речи (до 15 сек.) в парламентском формате.", en: "A short interruption by an opponent during a speech in parliamentary formats." },
  { term: "Whip Speech", ru: "Последняя речь команды в парламентских дебатах: опровержение и кристаллизация без новых аргументов.", en: "The team's final speech: rebuttal and crystallisation, no new arguments." },
  { term: "Reply Speech", ru: "Финальная сравнительная речь в Asian Parliamentary (4 минуты).", en: "The final comparative speech in Asian Parliamentary (4 min)." },
  { term: "Cross-Examination", ru: "Перекрёстный вопрос — блок вопросов после речи в формате Karl Popper.", en: "Cross-examination block after a speech in Karl Popper format." },
  { term: "Karl Popper (KPDF)", ru: "Школьный командный формат «3 на 3» с перекрёстными вопросами.", en: "School-level 3-vs-3 debate format with cross-examinations." },
  { term: "British Parliamentary (BP)", ru: "Университетский формат с 4 командами по 2 спикера.", en: "University format with 4 teams of 2 speakers." },
  { term: "Asian Parliamentary (AP)", ru: "Университетский формат с 2 командами по 3 спикера плюс Reply Speech.", en: "University format with 2 teams of 3 speakers plus Reply Speech." },
  { term: "Adjudicator", ru: "Судья дебатного раунда.", en: "A debate judge." },
  { term: "Ballot", ru: "Оценочный лист судьи с решением и баллами спикеров.", en: "The judge's decision sheet with speaker scores." },
  { term: "Extension", ru: "Новый угол аргументации, приносимый «закрывающей» командой в British Parliamentary.", en: "A new angle of argumentation brought by the closing team in BP." },
];
