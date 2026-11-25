import type { Lang, LoadedItem, LoadedPack } from '../content/types';
import { wordId } from '../report/words';
import { fixedText } from '../i18n/arabicFixes';

/**
 * Her story: a short 5-page story made from a tested template, someone from her family (with your
 * photo when you've added one) and words she knows: an animal, a food or a toy. A new one each
 * week. The Arabic grammar follows the person (راح / راحت) and the thing (هيّو / هيّاها).
 */
export type Slot = 'person' | 'animal' | 'food' | 'toy';

interface TemplatePage {
  /** The pictures on the page, side by side. */
  show: Slot[];
  en: string;
  /** Arabic for a man / boy and for a woman / girl in the story. */
  ar_m: string;
  ar_f: string;
  /** Play this slot's own sound after the words (the animal's moo). */
  sound?: Slot;
}
interface Template {
  id: string;
  title: { en: string; ar: string };
  needs: Slot[];
  pages: TemplatePage[];
}

// {P} the person, {A} the animal, {F} the food, {T} the toy. In Arabic {aA}/{aF}/{aT} is the word
// with "ال" ("the"), and {sA} picks بيقول / بتقول for the animal, {hT} هيّو / هيّاها for the toy.
export const STORY_TEMPLATES: Template[] = [
  {
    id: 'park',
    title: { en: 'At the park', ar: 'بالحديقة' },
    needs: ['person', 'animal'],
    pages: [
      { show: ['person'], en: '{P} goes to the park.', ar_m: '{P} راح عالحديقة.', ar_f: '{P} راحت عالحديقة.' },
      { show: ['person', 'animal'], en: '{P} sees a {A}!', ar_m: '{P} شاف {A}!', ar_f: '{P} شافت {A}!' },
      { show: ['animal'], en: 'The {A} says…', ar_m: '{aA} {sA}…', ar_f: '{aA} {sA}…', sound: 'animal' },
      { show: ['animal'], en: 'Bye-bye, {A}!', ar_m: 'باي باي يا {A}!', ar_f: 'باي باي يا {A}!' },
      { show: ['person'], en: '{P} goes home. The end!', ar_m: '{P} رجع عالبيت. خلصت القصة!', ar_f: '{P} رجعت عالبيت. خلصت القصة!' },
    ],
  },
  {
    id: 'hungry',
    title: { en: 'Yum!', ar: 'يمّ!' },
    needs: ['person', 'food'],
    pages: [
      { show: ['person'], en: '{P} is hungry.', ar_m: '{P} جوعان.', ar_f: '{P} جوعانة.' },
      { show: ['food'], en: "Look! There's a {F}!", ar_m: 'شوف! في {F}!', ar_f: 'شوف! في {F}!' },
      { show: ['person', 'food'], en: '{P} eats the {F}. Yum, yum!', ar_m: '{P} أكل {aF}. يمّ يمّ!', ar_f: '{P} أكلت {aF}. يمّ يمّ!' },
      { show: ['food'], en: 'All gone!', ar_m: 'خلص!', ar_f: 'خلص!' },
      { show: ['person'], en: 'Thank you! The end!', ar_m: 'شكراً! خلصت القصة!', ar_f: 'شكراً! خلصت القصة!' },
    ],
  },
  {
    id: 'toy',
    title: { en: 'Where is it?', ar: 'وينه؟' },
    needs: ['person', 'toy'],
    pages: [
      { show: ['person', 'toy'], en: '{P} has a {T}.', ar_m: 'مع {P} {T}.', ar_f: 'مع {P} {T}.' },
      { show: ['person'], en: "Oh no! Where's the {T}?", ar_m: 'أوه! وين {aT}؟', ar_f: 'أوه! وين {aT}؟' },
      { show: ['toy'], en: 'Here it is!', ar_m: '{hT}!', ar_f: '{hT}!' },
      { show: ['person', 'toy'], en: '{P} plays with the {T}.', ar_m: '{P} عم يلعب بـ{aT}.', ar_f: '{P} عم تلعب بـ{aT}.' },
      { show: ['toy'], en: 'Bye-bye, {T}! The end!', ar_m: 'باي باي يا {T}! خلصت القصة!', ar_f: 'باي باي يا {T}! خلصت القصة!' },
    ],
  },
  {
    id: 'night',
    title: { en: 'Goodnight', ar: 'تصبحوا على خير' },
    needs: ['person', 'animal'],
    pages: [
      { show: ['person'], en: "It's night. {P} is sleepy.", ar_m: 'صار الليل. {P} نعسان.', ar_f: 'صار الليل. {P} نعسانة.' },
      { show: ['animal'], en: 'The {A} is sleepy too.', ar_m: '{aA} كمان {nA}.', ar_f: '{aA} كمان {nA}.' },
      { show: ['animal'], en: 'The {A} says goodnight…', ar_m: '{aA} {sA} تصبحوا على خير…', ar_f: '{aA} {sA} تصبحوا على خير…', sound: 'animal' },
      { show: ['person'], en: '{P} says goodnight too.', ar_m: '{P} كمان بيقول تصبحوا على خير.', ar_f: '{P} كمان بتقول تصبحوا على خير.' },
      { show: ['person', 'animal'], en: 'Shh… The end.', ar_m: 'ششش… خلصت القصة.', ar_f: 'ششش… خلصت القصة.' },
    ],
  },
];

/** Who can be in a story, and whether Arabic speaks of them as a man or a woman. */
const PEOPLE: Readonly<Record<string, 'm' | 'f'>> = {
  mama: 'f',
  baba: 'm',
  grandma: 'f',
  grandpa: 'm',
  brother: 'm',
  sister: 'f',
  uncle: 'm',
  aunt: 'f',
  aunt_paternal: 'f',
  uncle_maternal: 'm',
};
const ANIMALS = ['cat', 'dog', 'cow', 'sheep', 'duck', 'hen', 'horse', 'goat', 'bird', 'frog', 'lion', 'monkey', 'elephant', 'donkey'];
const FOODS = ['banana', 'apple', 'bread', 'orange', 'grapes', 'cheese', 'egg', 'strawberry', 'cookie', 'watermelon', 'carrot', 'cucumber'];
const TOYS = ['ball', 'teddy', 'balloon', 'book', 'doll', 'blocks', 'car', 'rubber_duck', 'kite'];

export interface StoryPage {
  pictures: string[];
  text: Record<Lang, string>;
  /** Items on the page, to say their names if the phone has no voice. */
  items: LoadedItem[];
  sound: LoadedItem | null;
}
export interface Story {
  id: string;
  title: Record<Lang, string>;
  pages: StoryPage[];
}

const withAl = (noun: string) => (noun.startsWith('ال') ? noun : `ال${noun}`);

/** A number from a text, the same each time: the week's story stays the same all week. */
function seed(text: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h >>>= 0) % 10000) / 10000;
  };
}

/**
 * This week's story. `week` is any text that changes weekly (e.g. the Monday's date) and `known`
 * her known word ids, used first. `picture` chooses the picture to show for an item.
 */
export function storyFor(packs: readonly LoadedPack[], week: string, known: ReadonlySet<string>, picture: (item: LoadedItem) => string): Story | null {
  const random = seed(week);
  const find = (packId: string, keys: readonly string[], needSound = false) => {
    const pack = packs.find((p) => p.id === packId);
    if (!pack) return [];
    const all = pack.items.filter((i) => keys.includes(i.key) && (!needSound || i.sound));
    const knownFirst = all.filter((i) => known.has(wordId(packId, i.key)));
    return knownFirst.length ? knownFirst : all;
  };
  const pick = <T>(list: readonly T[]) => (list.length ? list[Math.floor(random() * list.length)] : null);
  const choices: Record<Slot, LoadedItem[]> = {
    person: find('family', Object.keys(PEOPLE)),
    animal: find('animals', ANIMALS, true),
    food: find('food', FOODS),
    toy: [...find('first-words', TOYS), ...find('toys', TOYS)],
  };
  const usable = STORY_TEMPLATES.filter((t) => t.needs.every((s) => choices[s].length));
  if (!usable.length) return null;
  const template = usable[Math.floor(random() * usable.length)];
  const cast = Object.fromEntries((['person', 'animal', 'food', 'toy'] as const).map((s) => [s, pick(choices[s])])) as Record<Slot, LoadedItem | null>;
  const person = cast.person!;
  const he = PEOPLE[person.key] ?? 'f';

  const fill = (text: string, lang: Lang) =>
    text.replace(/\{(a|s|h|n)?([PAFT])\}/g, (_, mod: string | undefined, slot: string) => {
      const item = { P: cast.person, A: cast.animal, F: cast.food, T: cast.toy }[slot];
      if (!item) return '';
      const name = item.name[lang];
      if (mod === 'a') return withAl(name);
      if (mod === 's') return item.arFeminine ? 'بتقول' : 'بيقول';
      if (mod === 'h') return item.arFeminine ? 'هيّاها' : 'هيّو';
      if (mod === 'n') return item.arFeminine ? 'نعسانة' : 'نعسان';
      // English: things in lower case mid-sentence (people keep their capital: Mama, Grandpa).
      return lang === 'en' && slot !== 'P' ? name.toLowerCase() : name;
    })
      // 'a elephant' -> 'an elephant'
      .replace(/\ba ([aeiou])/g, 'an $1');
  const pages = template.pages.map((p, n) => {
    const items = p.show.map((s) => cast[s]).filter((i): i is LoadedItem => i !== null);
    return {
      pictures: items.map(picture),
      items,
      // The Arabic as written, or as the parent corrected it in Check the Arabic.
      text: { en: fill(p.en, 'en'), ar: fill(fixedText(`story:${template.id}:${n}:${he === 'f' && p.ar_f !== p.ar_m ? 'f' : 'm'}`, he === 'm' ? p.ar_m : p.ar_f), 'ar') },
      sound: p.sound ? cast[p.sound] : null,
    };
  });
  return { id: `${week}:${template.id}:${person.key}`, title: template.title, pages };
}

/** The Monday of this week (YYYY-MM-DD), so the story changes once a week. */
export function storyWeek(now: Date = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
