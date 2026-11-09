import type { LoadedItem, LocalizedText } from './types';

/** The words the looks add on screen: Animal sounds' sound words, and Bunny's questions in Bunny's show. */
export const LOOK_WORDS_APPROVED = true;

/** What each animal says, as a child would say it. */
export const SOUND_WORDS: Readonly<Record<string, LocalizedText>> = {
  cat: { en: 'Meow!', ar: 'مياو!' },
  dog: { en: 'Woof woof!', ar: 'هو هو!' },
  cow: { en: 'Moo!', ar: 'موو!' },
  sheep: { en: 'Baa!', ar: 'ماع!' },
  goat: { en: 'Maa!', ar: 'ماع ماع!' },
  horse: { en: 'Neigh!', ar: 'هيييه!' },
  donkey: { en: 'Hee-haw!', ar: 'هي هاو!' },
  camel: { en: 'Hrrr!', ar: 'هررر!' },
  hen: { en: 'Cluck cluck!', ar: 'كاك كاك!' },
  rooster: { en: 'Cock-a-doodle-doo!', ar: 'كوكو كوكو!' },
  duck: { en: 'Quack quack!', ar: 'واك واك!' },
  lion: { en: 'Roar!', ar: 'رااار!' },
  tiger: { en: 'Grrr!', ar: 'غررر!' },
  elephant: { en: 'Pawoo!', ar: 'بااوو!' },
  monkey: { en: 'Ooh ooh aah aah!', ar: 'أو أو آ آ!' },
  bird: { en: 'Tweet tweet!', ar: 'زقزق!' },
  pigeon: { en: 'Coo coo!', ar: 'كو كو!' },
  owl: { en: 'Hoot hoot!', ar: 'هوو هوو!' },
  frog: { en: 'Ribbit!', ar: 'نق نق!' },
  bee: { en: 'Bzzz!', ar: 'زززز!' },
  snake: { en: 'Hiss!', ar: 'سسسس!' },
  wolf: { en: 'Awoo!', ar: 'عووو!' },
  bear: { en: 'Grrr!', ar: 'غرر!' },
  mouse: { en: 'Squeak!', ar: 'زيك زيك!' },
  chick: { en: 'Peep peep!', ar: 'صو صو!' },
  turkey: { en: 'Gobble gobble!', ar: 'غل غل غل!' },
  goose: { en: 'Honk honk!', ar: 'هونك هونك!' },
  parrot: { en: 'Squawk!', ar: 'كراا كراا!' },
  peacock: { en: 'Mee-ow!', ar: 'مي آو!' },
  eagle: { en: 'Screech!', ar: 'إييي!' },
  seal: { en: 'Arf arf!', ar: 'أرف أرف!' },
  dolphin: { en: 'Eee eee!', ar: 'إي إي إي!' },
  whale: { en: 'Oooooh!', ar: 'أووووه!' },
  fox: { en: 'Yip yip!', ar: 'ياب ياب!' },
  zebra: { en: 'Hee hee!', ar: 'هي هي!' },
  deer: { en: 'Bleat!', ar: 'ميع!' },
  hippo: { en: 'Honk!', ar: 'هونغ!' },
  gorilla: { en: 'Ooh ooh!', ar: 'هو هو هو!' },
  crocodile: { en: 'Snap snap!', ar: 'طق طق!' },
  cricket: { en: 'Chirp chirp!', ar: 'صر صر!' },
  mosquito: { en: 'Bzzzeee!', ar: 'زززيي!' },
  bat: { en: 'Eek eek!', ar: 'إيك إيك!' },
  penguin: { en: 'Honk!', ar: 'هاو هاو!' },
  leopard: { en: 'Grrr!', ar: 'غررر!' },
};

/** The word with "the", for Bunny's questions. Family words and names don't take it. */
const definiteAr = (item: LoadedItem, packId: string): string =>
  packId === 'family' || item.name.ar.startsWith('ال') ? item.name.ar : `ال${item.name.ar}`;
const lowerEn = (item: LoadedItem): string => item.name.en.toLowerCase();

/** Bunny's question in the Matching game. Hearing only a sound: Bunny doesn't give the name away. */
export function bunnyAsksMatch(item: LoadedItem, packId: string, soundOnly: boolean): LocalizedText {
  if (soundOnly) return { en: 'Who makes this sound?', ar: 'مين بيعمل هالصوت؟' };
  return { en: `Where is the ${lowerEn(item)}?`, ar: `وين ${definiteAr(item, packId)}؟` };
}

export const BUNNY_ASKS_TALK: LocalizedText = { en: "What's this?", ar: 'شو هاد؟' };

/** Bunny's question in Animal sounds. */
export function bunnyAsksSound(item: LoadedItem, packId: string): LocalizedText {
  return {
    en: `What does the ${lowerEn(item)} say?`,
    ar: `شو ${item.arFeminine ? 'بتقول' : 'بيقول'} ${definiteAr(item, packId)}؟`,
  };
}
