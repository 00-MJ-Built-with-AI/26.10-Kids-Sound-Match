import type { LoadedPack } from '../content/types';
import type { QuestionResultEntity, SessionEntity } from '../report/types';
import { knownWords, wordEvidence } from '../report/words';
import { today } from '../settings/routine';
import { loadWordMarks } from '../settings/words';
import { lessonWords, loadPath, PATH_PACKS, planToday, savePath } from './path';
import { wordRefs } from './steps';

export interface LessonPlan {
  /** Today's new words, the reviews due, and the words she knows (word ids). */
  fresh: string[];
  review: string[];
  known: string[];
}

/**
 * Today's lesson for one child: her word path's new words (chosen once a day, skipping words she
 * already understands or says) and the reviews due. `sessions` are this child's games.
 */
export function learnToday(profileId: string, packs: readonly LoadedPack[], sessions: readonly SessionEntity[], questions: readonly QuestionResultEntity[]): LessonPlan {
  const refs = wordRefs(packs);
  const ids = new Set(sessions.map((s) => s.id));
  const mine = questions.filter((q) => ids.has(q.sessionId));
  const wordPacks = new Set([...refs.values()].map((r) => r.pack.id));
  const known = new Set([...knownWords(wordEvidence(sessions, mine, (id) => wordPacks.has(id))).keys(), ...Object.keys(loadWordMarks(profileId).says)]);
  const candidates = PATH_PACKS.flatMap((packId) => [...refs.values()].filter((r) => r.pack.id === packId).map((r) => r.id));
  const day = today();
  const before = loadPath(profileId);
  const state = planToday(before, candidates, known, day);
  if (state !== before) savePath(profileId, state);
  const { fresh, review } = lessonWords(state, day);
  return { fresh, review, known: [...known].filter((id) => refs.has(id)).slice(0, 60) };
}
