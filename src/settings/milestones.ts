import type { Lang } from '../content/types';
import { profileKey } from './profiles';
import { local } from './storage';

/**
 * Things children often start doing between 18 and 24 months, for the parent to tick when they
 * see them. Gentle: every child grows at her own pace, and nothing here is a test. Each one links to
 * the games that practise it.
 */
export interface Milestone {
  id: string;
  area: 'talk' | 'understand' | 'move' | 'play';
  text: Record<Lang, string>;
  /** Games that help (Home tile ids). */
  games: string[];
}

export const MILESTONES: readonly Milestone[] = [
  { id: 'talk_words', area: 'talk', text: { en: 'Says three or more words besides "mama" and "baba"', ar: 'تقول ثلاث كلمات أو أكثر غير «ماما» و«بابا»' }, games: ['talk', 'sounds'] },
  { id: 'talk_animals', area: 'talk', text: { en: 'Makes animal sounds when you ask ("the cow says…")', ar: 'تقلّد أصوات الحيوانات حين تسألونها («البقرة بتقول…»)' }, games: ['sounds', 'sing'] },
  { id: 'talk_names', area: 'talk', text: { en: 'Names things in a book when you point and ask', ar: 'تسمّي الأشياء في الكتاب حين تشيرون وتسألون' }, games: ['book', 'talk'] },
  { id: 'talk_two', area: 'talk', text: { en: 'Says two words together, like "more milk" (her first sentence!)', ar: 'تقول كلمتين معاً، مثل «بدي حليب» (أول جملة لها!)' }, games: ['talk', 'book'] },
  { id: 'und_body', area: 'understand', text: { en: 'Points to at least two body parts when you ask', ar: 'تشير إلى عضوين من جسمها على الأقل حين تسألون' }, games: ['point'] },
  { id: 'und_follow', area: 'understand', text: { en: 'Follows a simple instruction without a gesture ("give me the ball")', ar: 'تنفّذ تعليمة بسيطة دون إشارة («أعطيني الطابة»)' }, games: ['actions', 'tidy'] },
  { id: 'und_point', area: 'understand', text: { en: 'Points to a picture in a book when you name it', ar: 'تشير إلى صورة في الكتاب حين تسمّونها' }, games: ['scene', 'explore', 'game'] },
  { id: 'und_hidden', area: 'understand', text: { en: 'Looks for things you hide, and notices what\'s missing', ar: 'تبحث عن الأشياء التي تخبّئونها، وتلاحظ ما ينقص' }, games: ['peekaboo', 'missing'] },
  { id: 'move_run', area: 'move', text: { en: 'Runs, and kicks a ball', ar: 'تركض وتركل الطابة' }, games: ['actions'] },
  { id: 'move_spoon', area: 'move', text: { en: 'Eats with a spoon by herself', ar: 'تأكل بالملعقة وحدها' }, games: ['care'] },
  { id: 'move_shapes', area: 'move', text: { en: 'Fits shapes and simple puzzle pieces into place', ar: 'تضع الأشكال وقطع البزل البسيطة في مكانها' }, games: ['shapes', 'puzzle'] },
  { id: 'play_pretend', area: 'play', text: { en: 'Plays pretend, like feeding a doll or talking on a toy phone', ar: 'تلعب لعب التخيّل، مثل إطعام الدمية أو الحكي على تلفون لعبة' }, games: ['care'] },
  { id: 'play_copy', area: 'play', text: { en: 'Copies what you do: sweeping, clapping, waving', ar: 'تقلّد ما تفعلونه: الكنس والتصفيق والتلويح' }, games: ['actions', 'turns'] },
  { id: 'play_help', area: 'play', text: { en: 'Helps a little: puts toys away, brings her shoes', ar: 'تساعد قليلاً: ترتّب ألعابها، تجيب حذاءها' }, games: ['tidy', 'routine'] },
  { id: 'play_feel', area: 'play', text: { en: 'Notices when someone is hurt or sad, and comes to them', ar: 'تلاحظ حين يتألم أحد أو يحزن، وتقترب منه' }, games: ['feel'] },
  { id: 'play_sing', area: 'play', text: { en: 'Joins in songs: the actions, or the last word', ar: 'تشارك في الأغاني: بالحركات أو بالكلمة الأخيرة' }, games: ['sing'] },
];

const TICKS_KEY = 'ksm.milestones.v1';

/** Milestone id -> when the parent ticked it. */
export function loadMilestones(profileId: string): Record<string, number> {
  const r = local.getJson<Record<string, unknown>>(profileKey(TICKS_KEY, profileId)) ?? {};
  return Object.fromEntries(Object.entries(r).filter(([, v]) => typeof v === 'number')) as Record<string, number>;
}

export function toggleMilestone(profileId: string, id: string, now = Date.now()): Record<string, number> {
  const ticks = { ...loadMilestones(profileId) };
  if (ticks[id] !== undefined) delete ticks[id];
  else ticks[id] = now;
  local.setJson(profileKey(TICKS_KEY, profileId), ticks);
  return ticks;
}

/* ---------------------------------------------------------------- Certificates */

export interface Certificate {
  id: string;
  /** Words she knows or says, or a ticked milestone. */
  words?: number;
  milestone?: string;
  emoji: string;
}

export const CERTIFICATES: readonly Certificate[] = [
  { id: 'words10', words: 10, emoji: '🌱' },
  { id: 'words25', words: 25, emoji: '🌷' },
  { id: 'words50', words: 50, emoji: '🌳' },
  { id: 'sentence', milestone: 'talk_two', emoji: '💬' },
];

const CERTS_KEY = 'ksm.certificates.v1';
const SEEN_KEY = 'ksm.certificatesSeen.v1';

/** The certificates reached now. */
export function reached(totalWords: number, ticks: Record<string, number>): Certificate[] {
  return CERTIFICATES.filter((c) => (c.words !== undefined ? totalWords >= c.words : c.milestone ? ticks[c.milestone] !== undefined : false));
}

/**
 * Remembers when each certificate was first reached (the date printed on it). A certificate stays
 * earned even if a word is later unmarked.
 */
export function updateCertificates(profileId: string, totalWords: number, ticks: Record<string, number>, now = Date.now()): Record<string, number> {
  const earned = { ...loadCertificates(profileId) };
  let changed = false;
  for (const c of reached(totalWords, ticks)) {
    if (earned[c.id] === undefined) {
      earned[c.id] = c.milestone ? (ticks[c.milestone] ?? now) : now;
      changed = true;
    }
  }
  if (changed) local.setJson(profileKey(CERTS_KEY, profileId), earned);
  return earned;
}

export function loadCertificates(profileId: string): Record<string, number> {
  const r = local.getJson<Record<string, unknown>>(profileKey(CERTS_KEY, profileId)) ?? {};
  return Object.fromEntries(Object.entries(r).filter(([, v]) => typeof v === 'number')) as Record<string, number>;
}

/** The newest earned certificate the parent hasn't seen yet (shown on Home). */
export function unseenCertificate(profileId: string, earned: Record<string, number>): Certificate | null {
  const seen = new Set(local.getJson<string[]>(profileKey(SEEN_KEY, profileId)) ?? []);
  const fresh = CERTIFICATES.filter((c) => earned[c.id] !== undefined && !seen.has(c.id));
  return fresh.sort((a, b) => earned[b.id] - earned[a.id])[0] ?? null;
}

export function markCertificatesSeen(profileId: string, ids: readonly string[]): void {
  const seen = new Set(local.getJson<string[]>(profileKey(SEEN_KEY, profileId)) ?? []);
  ids.forEach((id) => seen.add(id));
  local.setJson(profileKey(SEEN_KEY, profileId), [...seen]);
}

export function forgetMilestones(profileId: string): void {
  for (const k of [TICKS_KEY, CERTS_KEY, SEEN_KEY]) local.remove(profileKey(k, profileId));
}

export function saveMilestones(profileId: string, ticks: Record<string, number>): void {
  local.setJson(profileKey(TICKS_KEY, profileId), ticks);
}

export function saveCertificates(profileId: string, earned: Record<string, number>): void {
  local.setJson(profileKey(CERTS_KEY, profileId), earned);
}
