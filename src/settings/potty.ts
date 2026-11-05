import { profileKey } from './profiles';
import { today } from './routine';
import { local } from './storage';

/** Potty time's sticker chart: every try, and every success, per child, on this phone. */
export interface PottyEntry {
  at: number;
  kind: 'try' | 'done';
}

const KEY = 'ksm.potty.v1';
const KEEP = 400;

export function loadPotty(profileId: string): PottyEntry[] {
  const r = local.getJson<unknown>(profileKey(KEY, profileId));
  return Array.isArray(r) ? r.filter((e): e is PottyEntry => e && typeof e.at === 'number' && (e.kind === 'try' || e.kind === 'done')) : [];
}

export function savePotty(profileId: string, list: readonly PottyEntry[]): void {
  local.setJson(profileKey(KEY, profileId), [...list].sort((a, b) => a.at - b.at).slice(-KEEP));
}

export function addPotty(profileId: string, kind: PottyEntry['kind'], now = Date.now()): PottyEntry[] {
  const list = [...loadPotty(profileId), { at: now, kind }];
  savePotty(profileId, list);
  return list;
}

export function undoPotty(profileId: string): PottyEntry[] {
  const list = loadPotty(profileId).slice(0, -1);
  savePotty(profileId, list);
  return list;
}

export function forgetPotty(profileId: string): void {
  local.remove(profileKey(KEY, profileId));
}

/** The last 7 days, oldest first, with that day's stickers. */
export function pottyWeek(list: readonly PottyEntry[], now = new Date()): { day: string; entries: PottyEntry[] }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const day = today(d);
    return { day, entries: list.filter((e) => today(new Date(e.at)) === day) };
  });
}
