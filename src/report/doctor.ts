import type { WordMarks } from '../settings/words';
import type { QuestionResultEntity, SessionEntity } from './types';
import { knownWords, wordEvidence } from './words';

export interface DoctorStats {
  /** Words understood, by the language of the games that showed it. */
  understood: { total: number; arabic: number; english: number; bothLanguages: number };
  /** Words a parent marked as said in the app. */
  says: number;
  /** Words a parent added that aren't in the app. */
  outsideApp: number;
  /** Different two-word phrases ticked in Two-word time. */
  phrases: number;
}

/**
 * The counts on the doctor's page. A word counts for one language only when every game that showed
 * it was in that language; words seen in games played in both languages can't be split.
 */
export function doctorStats(
  sessions: readonly SessionEntity[],
  questions: readonly QuestionResultEntity[],
  marks: WordMarks,
  isWordPack: (packId: string) => boolean,
): DoctorStats {
  const ids = new Set(sessions.map((s) => s.id));
  const mine = questions.filter((q) => ids.has(q.sessionId));
  const known = knownWords(wordEvidence(sessions, mine, isWordPack));
  const seenIn = (test: (s: SessionEntity) => boolean) =>
    new Set(wordEvidence(sessions.filter(test), mine, isWordPack).map((e) => e.word));
  const arabic = seenIn((s) => s.language === 'ar');
  const english = seenIn((s) => s.language === 'en');
  const both = seenIn((s) => s.language !== 'ar' && s.language !== 'en');
  const understood = { total: known.size, arabic: 0, english: 0, bothLanguages: 0 };
  for (const word of known.keys()) {
    if (arabic.has(word) && !english.has(word) && !both.has(word)) understood.arabic++;
    else if (english.has(word) && !arabic.has(word) && !both.has(word)) understood.english++;
    else understood.bothLanguages++;
  }
  const phraseGames = new Set(sessions.filter((s) => s.game === 'phrases').map((s) => s.id));
  const phrases = new Set(mine.filter((q) => phraseGames.has(q.sessionId)).map((q) => q.itemKey)).size;
  return { understood, says: Object.keys(marks.says).length, outsideApp: marks.extra.length, phrases };
}
