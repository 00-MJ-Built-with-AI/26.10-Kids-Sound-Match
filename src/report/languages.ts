import type { Lang } from '../content/types';
import type { SessionEntity } from './types';

/** The last two weeks of games. */
export const BALANCE_DAYS = 14;
/** Below this share, a language gets a gentle tip. */
export const LOW_SHARE = 1 / 3;
/** Too few games to say anything. */
const MIN_GAMES = 6;

export interface LanguageBalance {
  arabic: number;
  english: number;
  both: number;
  total: number;
  /** Arabic's share, counting games in both languages as half each (0..1). */
  arabicShare: number;
  /** The language to suggest more of, if one is falling behind. */
  suggest: Lang | null;
}

/** How her games were split between Arabic and English over the last two weeks. */
export function languageBalance(sessions: readonly SessionEntity[], now: number = Date.now()): LanguageBalance {
  const since = now - BALANCE_DAYS * 86_400_000;
  let arabic = 0;
  let english = 0;
  let both = 0;
  for (const s of sessions) {
    if (s.startedAt < since) continue;
    if (s.language === 'ar') arabic++;
    else if (s.language === 'en') english++;
    else both++;
  }
  const total = arabic + english + both;
  const arabicShare = total ? (arabic + both / 2) / total : 0.5;
  const suggest = total < MIN_GAMES ? null : arabicShare < LOW_SHARE ? 'ar' : 1 - arabicShare < LOW_SHARE ? 'en' : null;
  return { arabic, english, both, total, arabicShare, suggest };
}
