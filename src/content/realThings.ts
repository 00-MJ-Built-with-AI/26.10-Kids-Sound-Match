import type { LoadedItem, LoadedPack } from './types';

/**
 * Find the real one: things found in most homes, safe to send a toddler looking for. Nothing sharp,
 * hot or electric (no scissors, kettle or lamp), and no lions or rockets.
 */
export const REAL_THINGS: ReadonlySet<string> = new Set([
  'ball', 'teddy', 'book', 'shoe', 'socks', 'hat', 'cup', 'spoon', 'bottle', 'bed', 'chair', 'pillow', 'blanket', 'soap', 'sofa', 'towel', 'table', 'window', 'plate', 'nappy',
  'door', 'clock', 'toothbrush', 'fridge', 'tv',
  'tshirt', 'trousers', 'jumper', 'pyjamas', 'coat', 'slippers', 'cap',
  'doll', 'blocks', 'rubber_duck', 'crayon',
  'apple', 'banana', 'bread', 'milk', 'water', 'cheese', 'orange',
]);

export interface RealThing {
  item: LoadedItem;
  pack: LoadedPack;
}

/** One real thing among the words she just heard, or null. Item keys are unique across packs. */
export function pickRealThing(heard: readonly string[], packs: readonly LoadedPack[], random: () => number = Math.random): RealThing | null {
  const found = heard.filter((key) => REAL_THINGS.has(key)).flatMap((key): RealThing[] => {
    const pack = packs.find((p) => p.kind === 'match' && !p.parts && p.items.some((i) => i.key === key));
    return pack ? [{ pack, item: pack.items.find((i) => i.key === key)! }] : [];
  });
  return found.length ? found[Math.floor(random() * found.length)] : null;
}
