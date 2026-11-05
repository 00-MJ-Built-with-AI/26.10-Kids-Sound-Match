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

export function forgetFavourites(profileId: string): void {
  local.remove(profileKey(KEY, profileId));
}
