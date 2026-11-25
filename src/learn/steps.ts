import type { LoadedItem, LoadedPack } from '../content/types';
import { wordId } from '../report/words';

/**
 * The Learn games, as a list of steps: meeting a word, or picking the right picture. Built from the
 * packs so the same games teach whatever words the path chooses.
 */
export type LearnMode = 'lesson' | 'variety' | 'newone' | 'verbs' | 'showme' | 'places';

export interface WordRef {
  id: string;
  item: LoadedItem;
  pack: LoadedPack;
}

export interface Option {
  /** Unique on the screen ("cat#0" when the same word shows twice). */
  key: string;
  item: LoadedItem;
  pack: LoadedPack;
  /** A picture chosen for this option, when it must be a particular one (Same word, different pictures). */
  picture?: string;
}

export type Step =
  | { kind: 'meet'; ref: WordRef; pictures: string[] }
  | {
      kind: 'pick';
      /** What the question says: the word's name, "Show me…" and the name, or the item's own question. */
      ask: 'name' | 'showme' | 'question';
      askItem: LoadedItem;
      options: Option[];
      targets: string[];
      /** The word this step practises, for the path and Words I know. */
      word?: WordRef;
      /** Wrong taps say the picture's name (word games) instead of the soft tone. */
      nameWrong: boolean;
    };

export const STEPS_PER_GAME = 6;

/** The words a game can teach: plain picture sets, not the Mixed game or the own-game packs. */
export function wordRefs(packs: readonly LoadedPack[]): Map<string, WordRef> {
  const out = new Map<string, WordRef>();
  for (const pack of packs) {
    if (pack.kind !== 'match' || pack.parts || pack.ownGame) continue;
    for (const item of pack.items) {
      const id = wordId(pack.id, item.key);
      if (!out.has(id)) out.set(id, { id, item, pack });
    }
  }
  return out;
}

/**
 * The different pictures of one word as shipped: its photos, its drawing and its 3D picture. A
 * parent's own photo isn't used, so this works the same for every family.
 */
export function variants(item: LoadedItem | undefined): string[] {
  if (!item) return [];
  const photos = item.images.filter((a) => a.photo && a.real && !a.url.startsWith('blob:')).map((a) => a.url);
  const drawn = [...item.images.filter((a) => a.real && !a.photo).map((a) => a.url), ...(item.drawings ?? []).map((a) => a.url)];
  const three = item.images.map((a) => a.art?.puffy).find((u): u is string => Boolean(u));
  return [...new Set([...photos.slice(0, 2), ...drawn.slice(0, 1), ...(three ? [three] : [])])];
}

export function shuffled<T>(list: readonly T[], random: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pickOne = <T>(list: readonly T[], random: () => number): T => list[Math.floor(random() * list.length)];

/** Same word, different pictures: two looks of the word and one other word. */
export function varietyStep(ref: WordRef, raw: ReadonlyMap<string, WordRef>, others: readonly WordRef[], random: () => number): Step | null {
  // A photo whenever there is one, next to a drawing or the 3D toy: the two looks are as different as can be.
  const all = variants(raw.get(ref.id)?.item);
  const photo = all.find((u) => /\.jpe?g$/i.test(u) && !u.includes('/looks/'));
  const rest = shuffled(all.filter((u) => u !== photo), random);
  const looks = shuffled(photo ? [photo, rest[0]].filter(Boolean) : rest.slice(0, 2), random);
  const other = shuffled(others.filter((o) => o.id !== ref.id && variants(raw.get(o.id)?.item).length), random)[0];
  if (looks.length < 2 || !other) return null;
  const options: Option[] = [
    { key: `${ref.item.key}#0`, item: ref.item, pack: ref.pack, picture: looks[0] },
    { key: `${ref.item.key}#1`, item: ref.item, pack: ref.pack, picture: looks[1] },
    { key: other.item.key, item: other.item, pack: other.pack, picture: pickOne(variants(raw.get(other.id)?.item), random) },
  ];
  return { kind: 'pick', ask: 'name', askItem: ref.item, options: shuffled(options, random), targets: [options[0].key, options[1].key], word: ref, nameWrong: true };
}

/** The new one: a word she knows and one she doesn't, and the question is the new word. */
export function newOneStep(fresh: WordRef, known: WordRef, random: () => number): Step {
  const options: Option[] = shuffled(
    [
      { key: fresh.item.key, item: fresh.item, pack: fresh.pack },
      { key: known.item.key, item: known.item, pack: known.pack },
    ],
    random,
  );
  return { kind: 'pick', ask: 'name', askItem: fresh.item, options, targets: [fresh.item.key], word: fresh, nameWrong: true };
}

/** A plain check: the word among two others. */
export function checkStep(ref: WordRef, others: readonly WordRef[], random: () => number): Step | null {
  const two = shuffled(others.filter((o) => o.id !== ref.id && o.item.key !== ref.item.key), random).slice(0, 2);
  if (two.length < 2) return null;
  const options = shuffled([ref, ...two].map((r) => ({ key: r.item.key, item: r.item, pack: r.pack })), random);
  return { kind: 'pick', ask: 'name', askItem: ref.item, options, targets: [ref.item.key], word: ref, nameWrong: true };
}

/** Action words: "Who's jumping?" and the jumping picture among two other actions. */
export function verbStep(target: LoadedItem, all: readonly LoadedItem[], pack: LoadedPack, random: () => number): Step {
  const others = shuffled(all.filter((i) => i.key !== target.key), random).slice(0, 2);
  const options = shuffled([target, ...others].map((item) => ({ key: item.key, item, pack })), random);
  return { kind: 'pick', ask: 'question', askItem: target, options, targets: [target.key], nameWrong: false };
}

/**
 * Show me: "the girl eating" among "the girl sleeping" (same child, other action) and "the boy
 * eating" (other child, same action), so she has to understand both words.
 */
export function showMeStep(target: LoadedItem, all: readonly LoadedItem[], pack: LoadedPack, random: () => number): Step | null {
  const [, who, act] = target.key.split('_');
  const sameWho = shuffled(all.filter((i) => i.key.startsWith(`sm_${who}_`) && i.key !== target.key), random)[0];
  const sameAct = all.find((i) => i.key.endsWith(`_${act}`) && !i.key.startsWith(`sm_${who}_`));
  if (!sameWho || !sameAct) return null;
  const options = shuffled([target, sameWho, sameAct].map((item) => ({ key: item.key, item, pack })), random);
  return { kind: 'pick', ask: 'showme', askItem: target, options, targets: [target.key], nameWrong: false };
}

/** In, on, under: the same two things three ways. */
export function placeStep(target: LoadedItem, all: readonly LoadedItem[], pack: LoadedPack, random: () => number): Step | null {
  const thing = target.key.split('_')[1];
  const set = all.filter((i) => i.key.startsWith(`pl_${thing}_`));
  if (set.length < 2) return null;
  const options = shuffled(set.map((item) => ({ key: item.key, item, pack })), random);
  return { kind: 'pick', ask: 'showme', askItem: target, options, targets: [target.key], nameWrong: false };
}

/** Words she knows, or everyday words to stand in for them before she knows any. */
const STAND_INS = ['first-words/ball', 'first-words/cup', 'first-words/teddy', 'family/mama', 'animals/cat', 'animals/dog', 'food/banana'];

export interface LearnInput {
  mode: LearnMode;
  /** Today's new words, the reviews due, and the words she knows (word ids). */
  fresh: readonly string[];
  review: readonly string[];
  known: readonly string[];
  /** The words as shown (with this child's look) and as shipped (for their different pictures). */
  refs: ReadonlyMap<string, WordRef>;
  raw: ReadonlyMap<string, WordRef>;
  /** The Learn pack's questions, for the action, Show me and In, on, under games. */
  learnPack?: LoadedPack;
  random: () => number;
}

export function buildSteps(input: LearnInput): Step[] {
  const { mode, refs, raw, random } = input;
  const get = (ids: readonly string[]) => ids.map((id) => refs.get(id)).filter((r): r is WordRef => r !== undefined);
  const fresh = get(input.fresh);
  const review = get(input.review);
  const knownList = get(input.known);
  const known = knownList.length ? knownList : get(STAND_INS);
  const everyday = [...refs.values()].filter((r) => ['first-words', 'home', 'food', 'animals'].includes(r.pack.id));
  const pool = [...known, ...everyday];
  const steps: (Step | null)[] = [];
  const unknown = everyday.filter((r) => !input.known.includes(r.id) && !fresh.includes(r));

  if (mode === 'lesson') {
    for (const f of fresh) {
      const pictures = variants(raw.get(f.id)?.item);
      steps.push({ kind: 'meet', ref: f, pictures: pictures.length ? pictures : [] });
      steps.push(newOneStep(f, pickOne(known.filter((k) => k.id !== f.id), random) ?? pickOne(pool, random), random));
    }
    for (const r of review) steps.push(varietyStep(r, raw, pool, random) ?? checkStep(r, pool, random));
    for (const f of fresh) steps.push(checkStep(f, [...fresh, ...known, ...pool], random));
    // Nothing new and nothing due: a round of the same word in different pictures.
    if (!fresh.length && !review.length) for (const r of shuffled(pool, random).slice(0, STEPS_PER_GAME)) steps.push(varietyStep(r, raw, pool, random));
  } else if (mode === 'variety') {
    const targets = [...fresh, ...review, ...shuffled(pool, random)].filter((r) => variants(raw.get(r.id)?.item).length >= 2);
    for (const r of [...new Set(targets)].slice(0, STEPS_PER_GAME)) steps.push(varietyStep(r, raw, pool, random));
  } else if (mode === 'newone') {
    const news = [...new Set([...fresh, ...shuffled(unknown, random)])].slice(0, STEPS_PER_GAME);
    for (const n of news) steps.push(newOneStep(n, pickOne(known.filter((k) => k.id !== n.id), random), random));
  } else if (input.learnPack) {
    const pack = input.learnPack;
    const group = (id: string) => (pack.groups.find((g) => g.id === id)?.items ?? []).map((k) => pack.items.find((i) => i.key === k)).filter((i): i is LoadedItem => !!i);
    const set = group(mode);
    for (const target of shuffled(set, random).slice(0, STEPS_PER_GAME)) {
      if (mode === 'verbs') steps.push(verbStep(target, set, pack, random));
      else if (mode === 'showme') steps.push(showMeStep(target, set, pack, random));
      else steps.push(placeStep(target, set, pack, random));
    }
  }
  return steps.filter((s): s is Step => s !== null);
}
