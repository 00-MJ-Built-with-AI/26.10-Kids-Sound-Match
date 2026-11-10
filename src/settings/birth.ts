import { profileKey } from './profiles';
import { local } from './storage';

/** Her birth month (YYYY-MM), only used to print her age on the doctor's page. On this phone only. */
const KEY = 'ksm.birthMonth.v1';

export function loadBirthMonth(profileId: string): string {
  const saved = local.get(profileKey(KEY, profileId)) ?? '';
  return /^\d{4}-\d{2}$/.test(saved) ? saved : '';
}

export function saveBirthMonth(profileId: string, month: string): void {
  if (month) local.set(profileKey(KEY, profileId), month);
  else local.remove(profileKey(KEY, profileId));
}

export function forgetBirthMonth(profileId: string): void {
  local.remove(profileKey(KEY, profileId));
}

/** Whole months between a birth month and now; null when unknown or in the future. */
export function ageInMonths(birth: string, now: Date = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})$/.exec(birth);
  if (!match) return null;
  const months = (now.getFullYear() - Number(match[1])) * 12 + now.getMonth() + 1 - Number(match[2]);
  return months >= 0 ? months : null;
}
