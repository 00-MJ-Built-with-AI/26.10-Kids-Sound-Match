import { profileKey } from '../settings/profiles';
import { local } from '../settings/storage';

/**
 * The daily word path: three new words a day, each coming back two, four and seven days after she
 * first met it. Spreading practice out like this helps toddlers remember words far better than
 * many repeats in one go. Per child, on this phone.
 */
export const NEW_PER_DAY = 3;
/** Days after the first meeting when a word comes back: day 2, day 4 and day 7. */
export const REVIEW_AFTER = [1, 3, 6] as const;
/** At most this many words to review in one lesson, so it stays about five minutes. */
export const MAX_REVIEWS = 4;
/** Everyday words first. */
export const PATH_PACKS = ['first-words', 'home', 'food', 'animals', 'clothes', 'body', 'toys', 'family', 'vehicles', 'colors', 'shapes', 'weather', 'instruments'];

export interface PathWord {
  /** Word id ("animals/cat"). */
  word: string;
  /** The day she first met it (YYYY-MM-DD). */
  introduced: string;
  /** How many of the reviews are done. */
  done: number;
  /** The last day it was practised. */
  last: string;
}

export interface PathState {
  words: PathWord[];
  /** The day `today` was chosen for. */
  day: string;
  /** Today's new words. */
  today: string[];
}

const KEY = 'ksm.learnPath.v1';
const EMPTY: PathState = { words: [], day: '', today: [] };

const dayNumber = (day: string) => Math.round(Date.parse(`${day}T12:00:00Z`) / 86_400_000);

/** Words due for review today (and any whose review was missed). */
export function dueReviews(state: PathState, today: string): string[] {
  return state.words
    .filter((w) => w.done < REVIEW_AFTER.length && w.last !== today && dayNumber(today) - dayNumber(w.introduced) >= REVIEW_AFTER[w.done])
    .sort((a, b) => a.introduced.localeCompare(b.introduced))
    .map((w) => w.word);
}

/** Chooses today's new words once a day: the next everyday words she doesn't know yet. */
export function planToday(state: PathState, candidates: readonly string[], known: ReadonlySet<string>, today: string): PathState {
  if (state.day === today) return state;
  const met = new Set(state.words.map((w) => w.word));
  const fresh = candidates.filter((w) => !met.has(w) && !known.has(w)).slice(0, NEW_PER_DAY);
  return { ...state, day: today, today: fresh };
}

/** She practised a word: the first time it joins the path; on a due day it moves to its next review. */
export function practise(state: PathState, word: string, today: string): PathState {
  const found = state.words.find((w) => w.word === word);
  if (!found) return { ...state, words: [...state.words, { word, introduced: today, done: 0, last: today }] };
  const due = found.done < REVIEW_AFTER.length && found.last !== today && dayNumber(today) - dayNumber(found.introduced) >= REVIEW_AFTER[found.done];
  return { ...state, words: state.words.map((w) => (w === found ? { ...w, done: due ? w.done + 1 : w.done, last: today } : w)) };
}

/** Today's lesson: the new words and the reviews due. */
export function lessonWords(state: PathState, today: string): { fresh: string[]; review: string[] } {
  return { fresh: state.day === today ? state.today : [], review: dueReviews(state, today).slice(0, MAX_REVIEWS) };
}

export function loadPath(profileId: string): PathState {
  const raw = local.getJson<Partial<PathState>>(profileKey(KEY, profileId));
  if (!raw || !Array.isArray(raw.words)) return EMPTY;
  return {
    words: raw.words.filter((w): w is PathWord => typeof w?.word === 'string' && typeof w.introduced === 'string' && typeof w.done === 'number'),
    day: typeof raw.day === 'string' ? raw.day : '',
    today: Array.isArray(raw.today) ? raw.today.filter((w): w is string => typeof w === 'string') : [],
  };
}

export function savePath(profileId: string, state: PathState): void {
  local.setJson(profileKey(KEY, profileId), state);
}

export function forgetPath(profileId: string): void {
  local.remove(profileKey(KEY, profileId));
}
