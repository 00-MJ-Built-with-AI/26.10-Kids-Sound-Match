import type { LoadedPack } from '../content/types';
import type { WordMarks } from '../settings/words';
import type { QuestionResultEntity, SessionEntity } from './types';
import { knownWords, wordEvidence, wordId } from './words';

/**
 * How many words she knows or says, counted as Words I know counts them: the words understood in
 * the games or marked as said (plain packs only), plus the words added outside the app.
 */
export function countWords(
  packs: readonly LoadedPack[],
  sessions: readonly SessionEntity[],
  questions: readonly QuestionResultEntity[],
  marks: WordMarks,
): number {
  const valid = new Set<string>();
  const wordPacks = new Set<string>();
  for (const p of packs) {
    if (p.kind !== 'match' || p.parts) continue;
    wordPacks.add(p.id);
    for (const i of p.items) valid.add(wordId(p.id, i.key));
  }
  const ids = new Set(sessions.map((s) => s.id));
  const known = knownWords(wordEvidence(sessions, questions.filter((q) => ids.has(q.sessionId)), (id) => wordPacks.has(id)));
  const all = new Set([...known.keys(), ...Object.keys(marks.says)].filter((id) => valid.has(id)));
  return all.size + marks.extra.length;
}
