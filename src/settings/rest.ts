import { profileKey } from './profiles';
import { local } from './storage';

/**
 * Games rest until morning: Bedtime started in the evening means the games are done for the day.
 * Until 6 in the morning her games show a sleeping moon; the parent's PIN opens them early.
 */
const REST_KEY = 'ksm.restUntil.v1';
/** Bedtime from this hour (or before WAKE_HOUR, after midnight) starts the rest. */
export const REST_FROM_HOUR = 17;
export const WAKE_HOUR = 6;

/** When a rest starting now would end (6 tomorrow, or 6 today after midnight); null in the daytime. */
export function restEnd(now: number): number | null {
  const d = new Date(now);
  const h = d.getHours();
  if (h >= WAKE_HOUR && h < REST_FROM_HOUR) return null;
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), WAKE_HOUR, 0, 0, 0);
  if (h >= REST_FROM_HOUR) end.setDate(end.getDate() + 1);
  return end.getTime();
}

/** Called when Bedtime starts: in the evening, her games rest until morning. */
export function startRest(profileId: string, now: number = Date.now()): void {
  const end = restEnd(now);
  if (end !== null) local.set(profileKey(REST_KEY, profileId), String(end));
}

/** When her games wake up, if they are resting now. */
export function restingUntil(profileId: string, now: number = Date.now()): number | null {
  const end = Number(local.get(profileKey(REST_KEY, profileId)));
  return Number.isFinite(end) && end > now ? end : null;
}

/** The parent opened the games early (with the PIN): no rest for the rest of tonight. */
export function endRest(profileId: string): void {
  local.remove(profileKey(REST_KEY, profileId));
}

/** Games a resting child can still open: Bedtime again, and the sleep light. */
export const REST_ALLOWED: readonly string[] = ['bedtime', 'sleep'];
