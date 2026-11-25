import type { LoadedItem, LoadedPack } from '../content/types';

/**
 * What's this?: the things the camera's model (COCO-SSD) can see that are also words in her app,
 * by the model's name. Left out on purpose: people, scissors and knives, and names that mean
 * something else in her app (a computer "mouse", a computer "keyboard", a "sink" isn't a tap).
 */
export const COCO_WORDS: Readonly<Record<string, string>> = {
  bicycle: 'bicycle',
  car: 'car',
  motorcycle: 'motorcycle',
  airplane: 'airplane',
  bus: 'bus',
  train: 'train',
  truck: 'truck',
  boat: 'boat',
  bird: 'bird',
  cat: 'cat',
  dog: 'dog',
  horse: 'horse',
  sheep: 'sheep',
  cow: 'cow',
  elephant: 'elephant',
  bear: 'bear',
  zebra: 'zebra',
  giraffe: 'giraffe',
  umbrella: 'umbrella',
  tie: 'tie',
  'sports ball': 'ball',
  kite: 'kite',
  skateboard: 'skateboard',
  bottle: 'bottle',
  cup: 'cup',
  spoon: 'spoon',
  banana: 'banana',
  apple: 'apple',
  orange: 'orange',
  carrot: 'carrot',
  chair: 'chair',
  couch: 'sofa',
  bed: 'bed',
  'dining table': 'table',
  toilet: 'toilet',
  tv: 'tv',
  'cell phone': 'phone',
  microwave: 'microwave',
  refrigerator: 'fridge',
  book: 'book',
  clock: 'clock',
  'teddy bear': 'teddy',
  'hair drier': 'hair_dryer',
  toothbrush: 'toothbrush',
};

export interface SeenThing {
  item: LoadedItem;
  pack: LoadedPack;
}

/** The word in her app for a model's name (the first picture set that has it), or null. */
export function wordForCoco(name: string, packs: readonly LoadedPack[]): SeenThing | null {
  const key = COCO_WORDS[name];
  if (!key) return null;
  for (const pack of packs) {
    if (pack.kind !== 'match' || pack.parts || pack.ownGame) continue;
    const item = pack.items.find((i) => i.key === key);
    if (item) return { item, pack };
  }
  return null;
}

/** How sure before speaking: the model's score, and the same thing in most of the last few looks. */
export const SURE_SCORE = 0.6;
export const SURE_LOOKS = 3;
export const LOOK_WINDOW = 4;

/**
 * Only when sure: the thing seen in at least SURE_LOOKS of the last LOOK_WINDOW looks, each time
 * with a score of SURE_SCORE or more. `looks` is newest last: the names seen in each look.
 */
export function sureThing(looks: readonly (readonly { name: string; score: number }[])[]): string | null {
  const recent = looks.slice(-LOOK_WINDOW);
  const counts = new Map<string, number>();
  for (const look of recent) {
    for (const name of new Set(look.filter((d) => d.score >= SURE_SCORE && COCO_WORDS[d.name]).map((d) => d.name))) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  let best: string | null = null;
  for (const [name, n] of counts) if (n >= SURE_LOOKS && (!best || n > counts.get(best)!)) best = name;
  return best;
}
