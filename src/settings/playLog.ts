import { profileKey } from './profiles';
import { today } from './routine';
import { local } from './storage';

/**
 * Play time: one entry per game played (which game, when, how long). Per child, on this phone.
 * The Report shows minutes per day this week and her most-chosen games.
 */
export interface PlayEntry {
  kind: string;
  at: number;
  ms: number;
}

const KEY = 'ksm.playLog.v1';
const KEEP = 600;
const KEEP_DAYS = 60;
/** A game left open (the phone put down) counts at most this long. */
export const MAX_GAME_MS = 30 * 60_000;
/** Shorter than this was a peek, not a game. */
const MIN_GAME_MS = 3_000;
const DAY = 86_400_000;

export function loadPlayLog(profileId: string): PlayEntry[] {
  const r = local.getJson<unknown>(profileKey(KEY, profileId));
  return Array.isArray(r)
    ? r.filter((e): e is PlayEntry => e && typeof e.kind === 'string' && typeof e.at === 'number' && typeof e.ms === 'number')
    : [];
}

export function addPlay(log: readonly PlayEntry[], kind: string, start: number, end: number): PlayEntry[] {
  const ms = Math.min(MAX_GAME_MS, end - start);
  if (ms < MIN_GAME_MS) return [...log];
  return [...log, { kind, at: start, ms }].filter((e) => e.at > end - KEEP_DAYS * DAY).slice(-KEEP);
}

export function logPlay(profileId: string, kind: string, start: number, end = Date.now()): void {
  local.setJson(profileKey(KEY, profileId), addPlay(loadPlayLog(profileId), kind, start, end));
}

export function forgetPlayLog(profileId: string): void {
  local.remove(profileKey(KEY, profileId));
}

/** The last 7 days, oldest first: the local date and the minutes played (rounded up). */
export function weekMinutes(log: readonly PlayEntry[], now = new Date()): { day: string; minutes: number }[] {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return today(d);
  });
  const ms = new Map(days.map((d) => [d, 0]));
  for (const e of log) {
    const d = today(new Date(e.at));
    if (ms.has(d)) ms.set(d, ms.get(d)! + e.ms);
  }
  return days.map((day) => ({ day, minutes: Math.ceil(ms.get(day)! / 60_000) }));
}

/** Her most-chosen games since `since`: most played first, then most minutes. */
export function topGames(log: readonly PlayEntry[], since: number, n = 3): { kind: string; count: number; minutes: number }[] {
  const by = new Map<string, { count: number; ms: number }>();
  for (const e of log) {
    if (e.at < since) continue;
    const g = by.get(e.kind) ?? { count: 0, ms: 0 };
    g.count++;
    g.ms += e.ms;
    by.set(e.kind, g);
  }
  return [...by.entries()]
    .sort((a, b) => b[1].count - a[1].count || b[1].ms - a[1].ms)
    .slice(0, n)
    .map(([kind, g]) => ({ kind, count: g.count, minutes: Math.ceil(g.ms / 60_000) }));
}
