import { wordId } from '../report/words';
import { REAL_THINGS } from './realThings';
import type { LoadedPack } from './types';

/** The word ids of every picture-set word whose key passes `keep`, in pack order. */
function wordsWhere(packs: readonly LoadedPack[], keep: (key: string, packId: string) => boolean): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of packs) {
    if (p.kind !== 'match' || p.parts || p.ownGame) continue;
    for (const i of p.items) {
      if (seen.has(i.key) || !keep(i.key, p.id)) continue;
      seen.add(i.key);
      out.push(wordId(p.id, i.key));
    }
  }
  return out;
}

function shuffled<T>(list: readonly T[], random: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Bring me: five real things from home (safe to fetch: see REAL_THINGS). Words she's learning come
 * first, then words she knows, then the rest, each shuffled.
 */
export function bringList(
  packs: readonly LoadedPack[],
  learning: ReadonlySet<string>,
  known: ReadonlySet<string>,
  count = 5,
  random: () => number = Math.random,
): string[] {
  const all = wordsWhere(packs, (key) => REAL_THINGS.has(key));
  const first = shuffled(
    all.filter((id) => learning.has(id)),
    random,
  );
  const second = shuffled(
    all.filter((id) => !learning.has(id) && known.has(id)),
    random,
  );
  const rest = shuffled(
    all.filter((id) => !learning.has(id) && !known.has(id)),
    random,
  );
  return [...first, ...second, ...rest].slice(0, count);
}

/** Where did it go?: the toys that hide under the cups. */
const CUP_TOYS = ['teddy', 'ball', 'rubber_duck', 'doll', 'car', 'blocks', 'dinosaur', 'balloon'];
export function cupToys(packs: readonly LoadedPack[], random: () => number = Math.random): string[] {
  return shuffled(
    wordsWhere(packs, (key) => CUP_TOYS.includes(key)),
    random,
  );
}

/** The Sound garden: animals, two instruments, a train and the rain (things with a sound). */
const GARDEN = ['cow', 'cat', 'duck', 'frog', 'drum', 'bell', 'train', 'rain'];
const GARDEN_MORE = ['dog', 'sheep', 'rooster', 'horse', 'guitar', 'car', 'thunder', 'bird'];
export function gardenThings(packs: readonly LoadedPack[], random: () => number = Math.random): string[] {
  const hasSound = (key: string, packId: string) => Boolean(packs.find((p) => p.id === packId)?.items.find((i) => i.key === key)?.sound);
  const main = wordsWhere(packs, (key, packId) => GARDEN.includes(key) && hasSound(key, packId));
  const more = wordsWhere(packs, (key, packId) => GARDEN_MORE.includes(key) && hasSound(key, packId));
  return shuffled([...main, ...more].slice(0, 8), random);
}
