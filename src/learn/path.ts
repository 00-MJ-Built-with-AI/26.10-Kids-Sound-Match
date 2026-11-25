import { profileKey } from '../settings/profiles';
import { local } from '../settings/storage';

/**
 * The daily word path: three new words a day, planned a week ahead so the printed sheet on the
 * fridge matches the lessons. Each word comes back two, four and seven days after she first met it:
 * practice spread out like this helps toddlers remember words far better than many repeats at once.
 * Per child, on this phone (and in the cloud backup of her things, if it's on).
 */
export const NEW_PER_DAY = 3;
export const WEEK_DAYS = 7;
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

/** The week's plan: the new words for each of seven days, from `start`. */
export interface PathWeek {
  start: string;
  days: Record<string, string[]>;
}

export interface PathState {
  words: PathWord[];
  week: PathWeek | null;
  /** Words the parent took off the path (she knows them already). */
  skipped: string[];
}

const KEY = 'ksm.learnPath.v1';
export const EMPTY_PATH: PathState = { words: [], week: null, skipped: [] };

const dayNumber = (day: string) => Math.round(Date.parse(`${day}T12:00:00Z`) / 86_400_000);

/** The day `n` days after `day` (YYYY-MM-DD). */
export function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

const inWeek = (week: PathWeek | null, day: string): week is PathWeek => Boolean(week && day >= week.start && day < addDays(week.start, WEEK_DAYS));
const nextReview = (w: PathWord) => (w.done < REVIEW_AFTER.length ? addDays(w.introduced, REVIEW_AFTER[w.done]) : null);
const isDue = (w: PathWord, today: string) => w.done < REVIEW_AFTER.length && w.last !== today && dayNumber(today) - dayNumber(w.introduced) >= REVIEW_AFTER[w.done];

/** Words due for review today (and any whose review was missed). */
export function dueReviews(state: PathState, today: string): string[] {
  return state.words
    .filter((w) => isDue(w, today))
    .sort((a, b) => a.introduced.localeCompare(b.introduced))
    .map((w) => w.word);
}

/** Plans the week once: the next everyday words she doesn't know yet, three for each day. */
export function planToday(state: PathState, candidates: readonly string[], known: ReadonlySet<string>, today: string): PathState {
  if (inWeek(state.week, today)) return state;
  const met = new Set([...state.words.map((w) => w.word), ...state.skipped]);
  const fresh = candidates.filter((w) => !met.has(w) && !known.has(w)).slice(0, NEW_PER_DAY * WEEK_DAYS);
  const days: Record<string, string[]> = {};
  for (let i = 0; i < WEEK_DAYS; i++) days[addDays(today, i)] = fresh.slice(i * NEW_PER_DAY, (i + 1) * NEW_PER_DAY);
  return { ...state, week: { start: today, days } };
}

/** She practised a word: the first time it joins the path; on a due day it moves to its next review. */
export function practise(state: PathState, word: string, today: string): PathState {
  const found = state.words.find((w) => w.word === word);
  if (!found) return { ...state, words: [...state.words, { word, introduced: today, done: 0, last: today }] };
  const due = isDue(found, today);
  return { ...state, words: state.words.map((w) => (w === found ? { ...w, done: due ? w.done + 1 : w.done, last: today } : w)) };
}

/** Takes a word off the path: no lesson, no reviews. */
export function skipWord(state: PathState, word: string): PathState {
  const days = state.week ? Object.fromEntries(Object.entries(state.week.days).map(([d, list]) => [d, list.filter((w) => w !== word)])) : null;
  return {
    words: state.words.filter((w) => w.word !== word),
    week: state.week && days ? { ...state.week, days } : state.week,
    skipped: [...new Set([...state.skipped, word])],
  };
}

/** Puts a word in today's lesson, at the front of the path. */
export function addToday(state: PathState, word: string, today: string): PathState {
  const week: PathWeek = inWeek(state.week, today) ? state.week : { start: today, days: {} };
  const days = Object.fromEntries(Object.entries(week.days).map(([d, list]) => [d, list.filter((w) => w !== word)]));
  days[today] = [...(days[today] ?? []), word];
  return { ...state, week: { ...week, days }, skipped: state.skipped.filter((w) => w !== word) };
}

/** Today's lesson: the new words and the reviews due. */
export function lessonWords(state: PathState, today: string): { fresh: string[]; review: string[] } {
  const met = new Map(state.words.map((w) => [w.word, w]));
  // A word of today's that she met on an earlier day is a review, not a new word.
  const fresh = (inWeek(state.week, today) ? (state.week.days[today] ?? []) : []).filter((w) => !state.skipped.includes(w) && (met.get(w)?.introduced ?? today) === today);
  return { fresh, review: dueReviews(state, today).filter((w) => !fresh.includes(w)).slice(0, MAX_REVIEWS) };
}

/** Everything on the path, for Words I know. */
export function pathView(state: PathState, today: string) {
  const { fresh } = lessonWords(state, today);
  const upcoming = inWeek(state.week, today)
    ? Object.entries(state.week.days)
        .filter(([d, list]) => d > today && list.length)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, words]) => ({ day, words }))
    : [];
  const reviewing = state.words
    .filter((w) => w.done < REVIEW_AFTER.length && !fresh.includes(w.word))
    .map((w) => ({ word: w.word, next: isDue(w, today) ? today : nextReview(w)! }))
    .sort((a, b) => a.next.localeCompare(b.next));
  const learned = state.words.filter((w) => w.done >= REVIEW_AFTER.length).map((w) => w.word);
  return { today: fresh, upcoming, reviewing, learned, weekStart: state.week?.start ?? today };
}

/** Both phones' paths together: each word keeps its earliest start and its furthest progress. */
export function mergePaths(a: PathState, b: PathState): PathState {
  const words = new Map(a.words.map((w) => [w.word, w]));
  for (const w of b.words) {
    const mine = words.get(w.word);
    words.set(
      w.word,
      mine
        ? { word: w.word, introduced: mine.introduced < w.introduced ? mine.introduced : w.introduced, done: Math.max(mine.done, w.done), last: mine.last > w.last ? mine.last : w.last }
        : w,
    );
  }
  const week = !a.week ? b.week : !b.week ? a.week : a.week.start >= b.week.start ? a.week : b.week;
  return { words: [...words.values()], week, skipped: [...new Set([...a.skipped, ...b.skipped])] };
}

/** Cleans a path read from storage or the cloud. */
export function sanitizePath(raw: unknown): PathState {
  const r = raw as Partial<PathState> | null;
  if (!r || typeof r !== 'object' || !Array.isArray(r.words)) return EMPTY_PATH;
  const strings = (x: unknown) => (Array.isArray(x) ? x.filter((w): w is string => typeof w === 'string') : []);
  const week =
    r.week && typeof r.week === 'object' && typeof r.week.start === 'string' && r.week.days && typeof r.week.days === 'object'
      ? { start: r.week.start, days: Object.fromEntries(Object.entries(r.week.days).map(([d, list]) => [d, strings(list)])) }
      : null;
  return {
    words: r.words.filter(
      (w): w is PathWord => typeof w?.word === 'string' && typeof w.introduced === 'string' && typeof w.done === 'number' && typeof w.last === 'string',
    ),
    week,
    skipped: strings(r.skipped),
  };
}

export function loadPath(profileId: string): PathState {
  return sanitizePath(local.getJson<unknown>(profileKey(KEY, profileId)));
}

export function savePath(profileId: string, state: PathState): void {
  local.setJson(profileKey(KEY, profileId), state);
}

export function forgetPath(profileId: string): void {
  local.remove(profileKey(KEY, profileId));
}
