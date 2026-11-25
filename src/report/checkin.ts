import type { PlayEntry } from '../settings/playLog';
import { profileKey } from '../settings/profiles';
import { local } from '../settings/storage';
import { today } from '../settings/routine';

/**
 * Her week: once a week, what she came back to, what she left quickly, and the words that grew.
 * On Home as a card (until the parent closes it) and always in the Report.
 */
export interface Checkin {
  minutes: number;
  /** Days she played this week. */
  days: number;
  /** Games played on two or more days, most days first. */
  cameBack: string[];
  /** Games she mostly left within a minute (two tries or more). */
  leftQuickly: string[];
  /** Words first understood this week (word ids, newest first). */
  newWords: string[];
  /** Words marked as said this week. */
  saidWords: string[];
}

const DAY = 86_400_000;
const WEEK = 7 * DAY;
/** A game left within this was a try, not a play. */
const QUICK_MS = 60_000;

export function weekCheckin(
  log: readonly PlayEntry[],
  known: ReadonlyMap<string, number>,
  says: Readonly<Record<string, number>>,
  now: number = Date.now(),
): Checkin {
  // The same seven days as the Report's play time: today and the six days before it.
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  const since = start.getTime();
  const week = log.filter((e) => e.at >= since && e.at <= now);
  const daysOf = new Map<string, Set<string>>();
  const tries = new Map<string, { quick: number; all: number }>();
  for (const e of week) {
    const d = today(new Date(e.at));
    (daysOf.get(e.kind) ?? daysOf.set(e.kind, new Set()).get(e.kind)!).add(d);
    const t = tries.get(e.kind) ?? { quick: 0, all: 0 };
    t.all++;
    if (e.ms < QUICK_MS) t.quick++;
    tries.set(e.kind, t);
  }
  const cameBack = [...daysOf.entries()]
    .filter(([, d]) => d.size >= 2)
    .sort((a, b) => b[1].size - a[1].size)
    .map(([k]) => k)
    .slice(0, 4);
  const leftQuickly = [...tries.entries()]
    .filter(([k, t]) => t.all >= 2 && t.quick / t.all > 0.5 && !cameBack.includes(k))
    .sort((a, b) => b[1].quick - a[1].quick)
    .map(([k]) => k)
    .slice(0, 3);
  const newWords = [...known.entries()]
    .filter(([, at]) => at >= since && at <= now)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);
  const saidWords = Object.entries(says)
    .filter(([, at]) => at >= since && at <= now)
    .map(([w]) => w);
  return {
    minutes: Math.ceil(week.reduce((n, e) => n + e.ms, 0) / 60_000),
    days: new Set(week.map((e) => today(new Date(e.at)))).size,
    cameBack,
    leftQuickly,
    newWords,
    saidWords,
  };
}

const SEEN_KEY = 'ksm.checkinSeen.v1';

/** The Home card: once she has played for a week, and a week after it was last closed. */
export function checkinDue(profileId: string, log: readonly PlayEntry[], now: number = Date.now()): boolean {
  if (!log.length || Math.min(...log.map((e) => e.at)) > now - WEEK) return false;
  const seen = Number(local.get(profileKey(SEEN_KEY, profileId)));
  return !(Number.isFinite(seen) && seen > now - WEEK);
}

export function markCheckinSeen(profileId: string, now: number = Date.now()): void {
  local.set(profileKey(SEEN_KEY, profileId), String(now));
}
