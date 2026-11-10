import { profileKey } from './profiles';
import { local } from './storage';

/**
 * Her favourite games: the parent picks a handful, shown first on Home (the rest behind "More
 * games"), and Today's play suggests from them. Per child. Null = never chosen (Home shows all).
 */
const KEY = 'ksm.favourites.v1';

export function loadFavourites(profileId: string): string[] {
  const r = local.getJson<unknown>(profileKey(KEY, profileId));
  return Array.isArray(r) ? r.filter((x): x is string => typeof x === 'string') : [];
}

export function saveFavourites(profileId: string, ids: readonly string[]): void {
  local.setJson(profileKey(KEY, profileId), [...new Set(ids)]);
}

/** Games a toddler can play alone: her menu tops up from these. */
const HER_OWN: readonly string[] = ['peekaboo', 'bubbles', 'explore', 'game', 'puzzle', 'paint', 'music', 'hide', 'care', 'shapes', 'big', 'tidy', 'scene', 'memory'];

/** Her own menu: her favourites, then what she plays most, then her games. Never the bedtime book. */
export function herMenu<K extends string>(favourites: readonly string[], available: readonly K[], mostPlayed: readonly string[], size = 4): K[] {
  const can = (id: string) => (available as readonly string[]).includes(id) && id !== 'bedtime';
  return [...new Set([...favourites.filter(can), ...mostPlayed.filter((id) => can(id) && HER_OWN.includes(id)), ...HER_OWN.filter(can)])].slice(0, size) as K[];
}

export function forgetFavourites(profileId: string): void {
  local.remove(profileKey(KEY, profileId));
}
