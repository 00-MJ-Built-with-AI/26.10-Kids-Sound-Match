import type { Lang } from '../content/types';

/**
 * The printed week sheet: one everyday way to use each word, by its picture set. "{w}" is the
 * word. Short enough for a grandparent or a babysitter to read at a glance.
 */
const TIPS: Record<string, Record<Lang, string>> = {
  food: { en: 'At mealtimes, hold it up: "{w}! Do you want {w}?"', ar: 'وقت الأكل ارفعوه: «{w}! بدك {w}؟»' },
  animals: { en: 'Make its sound, and find it in a book or outside.', ar: 'اعملوا صوته، ودوّروا عليه بكتاب أو برّا.' },
  'first-words': { en: 'Say "{w}!" every time you use it.', ar: 'قولوا «{w}!» كل ما تستعملوه.' },
  home: { en: 'Say "{w}!" every time you use it.', ar: 'قولوا «{w}!» كل ما تستعملوه.' },
  toys: { en: 'Play with it together and name it.', ar: 'العبوا فيه مع بعض وسمّوه.' },
  clothes: { en: 'Name it while getting dressed.', ar: 'سمّوه وقت اللبس.' },
  body: { en: 'Touch it at bath time and say its name.', ar: 'المسوه وقت الحمّام وقولوا اسمه.' },
  family: { en: 'Say it when they call or visit, and show a photo.', ar: 'قولوها لما يتصلوا أو يزوروا، وفرجوها صورة.' },
  vehicles: { en: 'Spot it on a walk or from the window.', ar: 'دوّروا عليه بالمشوار أو من الشبّاك.' },
  colors: { en: 'Find three things that are {w}.', ar: 'دوّروا على ثلاث أشياء لونها {w}.' },
  shapes: { en: 'Find a {w} around the house.', ar: 'دوّروا على {w} بالبيت.' },
  weather: { en: 'Look out of the window together and say it.', ar: 'اطّلعوا من الشبّاك مع بعض وقولوه.' },
  instruments: { en: 'Make its sound together with a pot and a spoon.', ar: 'اعملوا صوته مع بعض بطنجرة ومعلقة.' },
};
const ANY: Record<Lang, string> = { en: 'Say it slowly and point to it.', ar: 'قولوه على مهل ودلّوا عليه.' };

export function sheetTip(packId: string, word: string, lang: Lang): string {
  return (TIPS[packId]?.[lang] ?? ANY[lang]).replaceAll('{w}', word);
}
