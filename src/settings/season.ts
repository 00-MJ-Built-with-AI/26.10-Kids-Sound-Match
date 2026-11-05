import { local } from './storage';

/**
 * Ramadan and Eid: the app dresses up in season (lanterns over Home and the games, a crescent, the
 * Ramadan and Eid pack offered on Home, "Eid Mubarak!" on Eid). Dates come from the phone's
 * Islamic (Umm al-Qura) calendar, so they move with the moon every year. The parent can turn it
 * off, or show it any time.
 */
export type Season = 'ramadan' | 'eid';
export type SeasonPref = 'auto' | 'off' | Season;

const KEY = 'ksm.season.v1';

let hijri: Intl.DateTimeFormat | null | undefined;
function hijriParts(date: Date): { month: number; day: number } | null {
  if (hijri === undefined) {
    try {
      hijri = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { month: 'numeric', day: 'numeric' });
      // Phones without the Islamic calendar quietly fall back to the Gregorian one.
      if (!hijri.resolvedOptions().calendar.startsWith('islamic')) hijri = null;
    } catch {
      hijri = null;
    }
  }
  if (!hijri) return null;
  const parts = hijri.formatToParts(date);
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const month = n('month');
  const day = n('day');
  return Number.isFinite(month) && Number.isFinite(day) ? { month, day } : null;
}

/** Ramadan is the 9th month; Eid al-Fitr is 1 to 3 Shawwal, Eid al-Adha 10 to 13 Dhu al-Hijja. */
export function seasonOn(date: Date): Season | null {
  const h = hijriParts(date);
  if (!h) return null;
  if (h.month === 9) return 'ramadan';
  if ((h.month === 10 && h.day <= 3) || (h.month === 12 && h.day >= 10 && h.day <= 13)) return 'eid';
  return null;
}

export function loadSeasonPref(): SeasonPref {
  const v = local.get(KEY);
  return v === 'off' || v === 'ramadan' || v === 'eid' ? v : 'auto';
}

export function saveSeasonPref(pref: SeasonPref): void {
  if (pref === 'auto') local.remove(KEY);
  else local.set(KEY, pref);
}

export function currentSeason(pref: SeasonPref, date = new Date()): Season | null {
  if (pref === 'off') return null;
  if (pref === 'auto') return seasonOn(date);
  return pref;
}

const CELEBRATED_KEY = 'ksm.eidCelebrated.v1';

/** "Eid Mubarak!" is shown once a day on Eid. */
export function shouldCelebrate(day: string): boolean {
  return local.get(CELEBRATED_KEY) !== day;
}

export function markCelebrated(day: string): void {
  local.set(CELEBRATED_KEY, day);
}
