import type { KidKind } from '../ui/kid/kidSnapshot';
import { profileKey } from './profiles';
import { local } from './storage';
import { today } from './routine';

/**
 * Today's play: three short games a day, one of each kind, so a day mixes talking, playing and
 * thinking. Games not played for longest come first; ties change from day to day.
 */
export const PLAN_GROUPS: readonly (readonly KidKind[])[] = [
  // Talking together: she says or shows, you tick.
  ['talk', 'sounds', 'feel', 'point', 'actions', 'sing', 'hunt'],
  // Playing: she taps, the app answers.
  ['bubbles', 'care', 'peekaboo', 'puzzle', 'shapes', 'tidy', 'count', 'story', 'paint', 'music'],
  // Thinking: matching, opposites, memory.
  ['game', 'big', 'opposites', 'missing', 'memory', 'explore', 'scene', 'hide'],
];

/** A small stable number for a string, so the same day gives the same plan. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * @param day the local date (YYYY-MM-DD)
 * @param available the games that can be played now
 * @param lastPlayed when each game was last played (ms); missing = never
 * @param favourites her favourite games: when chosen, the plan comes from them (one per group where
 *   it can, then her other favourites, then the usual picks if she has fewer than three)
 */
export function planFor(
  day: string,
  available: readonly KidKind[],
  lastPlayed: Partial<Record<KidKind, number>>,
  favourites: readonly string[] = [],
): KidKind[] {
  // A game played today stays in today's plan (shown as played), so judge "last played" before today.
  const startOfDay = new Date(`${day}T00:00:00`).getTime();
  const before = (k: KidKind) => {
    const at = lastPlayed[k] ?? 0;
    return at >= startOfDay ? 0 : at;
  };
  const order = (a: KidKind, b: KidKind) => before(a) - before(b) || hash(day + a) - hash(day + b);
  const fromGroups = (can: ReadonlySet<KidKind>) =>
    PLAN_GROUPS.flatMap((group) => {
      const options = group.filter((k) => can.has(k));
      return options.length ? [[...options].sort(order)[0]] : [];
    });
  const usual = fromGroups(new Set(available));
  const fav = available.filter((k) => favourites.includes(k));
  if (!fav.length) return usual;
  const plan = fromGroups(new Set(fav));
  for (const k of [...fav].sort(order)) if (plan.length < 3 && !plan.includes(k)) plan.push(k);
  for (const k of usual) if (plan.length < 3 && !plan.includes(k)) plan.push(k);
  return plan;
}

const PLAYED_KEY = 'ksm.played.v1';

export function loadPlayed(profileId: string): Partial<Record<KidKind, number>> {
  const r = local.getJson<Record<string, unknown>>(profileKey(PLAYED_KEY, profileId)) ?? {};
  return Object.fromEntries(Object.entries(r).filter(([, v]) => typeof v === 'number')) as Partial<Record<KidKind, number>>;
}

export function markPlayed(profileId: string, kind: KidKind, now = Date.now()): void {
  local.setJson(profileKey(PLAYED_KEY, profileId), { ...loadPlayed(profileId), [kind]: now });
}

export function playedToday(played: Partial<Record<KidKind, number>>, kind: KidKind, day = today()): boolean {
  const at = played[kind];
  return at !== undefined && today(new Date(at)) === day;
}

/* ---------------------------------------------------------------- How do you feel? */

export interface FeelingCheck {
  /** The Feelings item she chose ("happy"). */
  feeling: string;
  at: number;
}

const FEEL_KEY = 'ksm.feelings.v1';
const FEEL_KEEP = 60;

export function loadFeelings(profileId: string): FeelingCheck[] {
  const r = local.getJson<unknown>(profileKey(FEEL_KEY, profileId));
  return Array.isArray(r) ? r.filter((x): x is FeelingCheck => x && typeof x.feeling === 'string' && typeof x.at === 'number') : [];
}

export function addFeeling(profileId: string, feeling: string, now = Date.now()): void {
  local.setJson(profileKey(FEEL_KEY, profileId), [...loadFeelings(profileId), { feeling, at: now }].slice(-FEEL_KEEP));
}

export function saveFeelings(profileId: string, list: readonly FeelingCheck[]): void {
  local.setJson(profileKey(FEEL_KEY, profileId), list.slice(-FEEL_KEEP));
}
