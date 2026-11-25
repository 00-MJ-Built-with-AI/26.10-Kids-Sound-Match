import type { LoadedPack } from '../content/types';
import type { QuestionResultEntity, SessionEntity } from '../report/types';
import { wordEvidence, wordId } from '../report/words';

/**
 * One learning brain: for every word, how sure we are that she understands it now, from every game
 * that shows it (the matching game, the Learn games, Find it in the picture, Bring me...) and the
 * words marked as said. Rebuilt from her results whenever it's needed, so nothing is stored and
 * nothing can drift: the results on this phone are the truth.
 *
 * The model, kept simple: each right answer moves her toward knowing the word, each miss halves it
 * (a 2-picture guess is easy, so one right answer is never "known"); between games the word fades
 * back toward the start, more slowly the more different days she got it right (spaced practice).
 */
export interface WordState {
  word: string;
  /** How sure we were right after the last answer (0..1). */
  learned: number;
  seen: number;
  right: number;
  /** Different days she got it right: the more, the slower she forgets. */
  rightDays: number;
  last: number;
  /** Sureness in the games of each language. */
  byLang: Partial<Record<'ar' | 'en' | 'both', number>>;
  /** Marked as said in Words I know. */
  said: boolean;
}

/** Where every word starts: a toddler may already know it. */
export const PRIOR = 0.15;
const LEARN_RATE = 0.35;
const MISS_KEEP = 0.5;
/** Days for her sureness to fade halfway back to the start, by days right (0, 1, 2... 6+). */
const HALF_LIFE_DAYS = [1, 2, 4, 8, 16, 32, 64];
const DAY = 86_400_000;
/** Saying a word shows she knows it. */
const SAID_SURE = 0.9;

const step = (p: number, right: boolean) => (right ? p + (1 - p) * LEARN_RATE : p * MISS_KEEP);
const langOf = (l: string | undefined): 'ar' | 'en' | 'both' => (l === 'ar' ? 'ar' : l === 'en' ? 'en' : 'both');

export function buildBrain(
  sessions: readonly SessionEntity[],
  questions: readonly QuestionResultEntity[],
  says: Readonly<Record<string, number>> = {},
  isWordPack: (packId: string) => boolean = () => true,
): Map<string, WordState> {
  const language = new Map(sessions.map((s) => [s.id, s.language]));
  const brain = new Map<string, WordState>();
  const days = new Map<string, Set<string>>();
  for (const e of wordEvidence(sessions, questions, isWordPack)) {
    const w = brain.get(e.word) ?? { word: e.word, learned: PRIOR, seen: 0, right: 0, rightDays: 0, last: 0, byLang: {}, said: false };
    // Fading between games, then the answer.
    w.learned = step(fade(w, e.at), e.right);
    const l = langOf(e.session === undefined ? undefined : language.get(e.session));
    w.byLang[l] = step(w.byLang[l] ?? PRIOR, e.right);
    w.seen++;
    if (e.right) {
      w.right++;
      const d = new Date(e.at).toDateString();
      const set = days.get(e.word) ?? days.set(e.word, new Set()).get(e.word)!;
      set.add(d);
      w.rightDays = set.size;
    }
    w.last = e.at;
    brain.set(e.word, w);
  }
  for (const [word, at] of Object.entries(says)) {
    const w = brain.get(word) ?? { word, learned: PRIOR, seen: 0, right: 0, rightDays: 0, last: at, byLang: {}, said: false };
    w.said = true;
    w.learned = Math.max(w.learned, SAID_SURE);
    w.last = Math.max(w.last, at);
    w.rightDays = Math.max(w.rightDays, 2);
    brain.set(word, w);
  }
  return brain;
}

function halfLife(w: Pick<WordState, 'rightDays'>): number {
  return HALF_LIFE_DAYS[Math.min(w.rightDays, HALF_LIFE_DAYS.length - 1)] * DAY;
}

/** Her sureness after time away: halfway back to the start every half-life. */
function fade(w: Pick<WordState, 'learned' | 'last' | 'rightDays'>, at: number): number {
  if (!w.last) return w.learned;
  const gone = Math.max(0, at - w.last) / halfLife(w);
  return PRIOR + (w.learned - PRIOR) * Math.pow(0.5, gone);
}

/** How sure we are now that she understands the word (0..1). */
export function sureness(w: WordState | undefined, now: number = Date.now()): number {
  if (!w) return PRIOR;
  // A word she says stays well known.
  return w.said ? Math.max(SAID_SURE * 0.9, fade(w, now)) : fade(w, now);
}

/** When the word is due again: once she's likely to have forgotten half of what she learned. */
export function dueAt(w: WordState): number {
  return w.last + halfLife(w);
}

/** Words to practise today: met before, not certain, and due, the most faded first. */
export function dueWords(brain: ReadonlyMap<string, WordState>, now: number = Date.now(), limit = 5): string[] {
  return [...brain.values()]
    .filter((w) => w.right > 0 && !w.said && dueAt(w) <= now && sureness(w, now) < 0.85)
    .sort((a, b) => sureness(a, now) - sureness(b, now))
    .slice(0, limit)
    .map((w) => w.word);
}

/** Words she's learning: met, somewhere between unsure and sure. */
export function learningWords(brain: ReadonlyMap<string, WordState>, now: number = Date.now()): Set<string> {
  return new Set([...brain.values()].filter((w) => w.seen > 0 && sureness(w, now) >= 0.25 && sureness(w, now) < 0.8).map((w) => w.word));
}

/**
 * The matching game's practice: words she's unsure of come up more, words she's sure of less, new
 * words in between. Keyed by item key, as the game deals them.
 */
export function brainWeights(brain: ReadonlyMap<string, WordState>, packs: readonly LoadedPack[], now: number = Date.now()): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const pack of packs) {
    for (const item of pack.items) {
      const w = brain.get(wordId(pack.id, item.key));
      if (!w) continue;
      const p = sureness(w, now);
      weights[item.key] = Math.round((0.5 + 2 * (1 - p)) * 100) / 100;
    }
  }
  return weights;
}
