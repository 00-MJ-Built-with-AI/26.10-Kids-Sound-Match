import { describe, expect, it } from 'vitest';
import { sureThing, wordForCoco } from '../camera/cocoWords';
import type { LoadedItem, LoadedPack } from '../content/types';
import { familyUrl, newFamilyToken } from '../family/family';
import type { QuestionResultEntity, SessionEntity } from '../report/types';
import { videoLength } from '../report/voiceVideo';
import { brainWeights, buildBrain, dueWords, learningWords, PRIOR, sureness } from './brain';
import { STORY_TEMPLATES, storyFor, storyWeek } from './storyMaker';

const DAY = 86_400_000;
const item = (key: string, extra: Partial<LoadedItem> = {}) => ({ key, name: { en: key[0].toUpperCase() + key.slice(1), ar: key }, images: [], ...extra }) as unknown as LoadedItem;
const pack = (id: string, items: LoadedItem[], extra = {}) => ({ id, kind: 'match', items, groups: [], ...extra }) as unknown as LoadedPack;

describe("What's this? camera", () => {
  it('names only words in her app, and only when sure', () => {
    const packs = [pack('first-words', [item('cup'), item('teddy')])];
    expect(wordForCoco('cup', packs)?.item.key).toBe('cup');
    expect(wordForCoco('teddy bear', packs)?.item.key).toBe('teddy');
    expect(wordForCoco('person', packs)).toBeNull();
    expect(wordForCoco('scissors', packs)).toBeNull();
    const look = (name: string, score: number) => [{ name, score }];
    expect(sureThing([look('cup', 0.9), look('cup', 0.8)])).toBeNull();
    expect(sureThing([look('cup', 0.9), look('cup', 0.8), look('cup', 0.7)])).toBe('cup');
    expect(sureThing([look('cup', 0.9), look('cup', 0.4), look('cup', 0.5), look('cup', 0.7)])).toBeNull();
    expect(sureThing([look('person', 0.99), look('person', 0.99), look('person', 0.99)])).toBeNull();
  });
});

describe('one learning brain', () => {
  const now = Date.parse('2026-11-25T12:00:00Z');
  let id = 0;
  const game = (daysAgo: number, language: string, answers: [string, boolean][]) => {
    const session = { id: ++id, packId: 'animals', startedAt: now - daysAgo * DAY, language, game: 'match', profileId: 'first' } as unknown as SessionEntity;
    const questions = answers.map(([key, right], n) => ({ id: id * 100 + n, sessionId: session.id, itemKey: key, packId: 'animals', firstTryCorrect: right, attempts: right ? 1 : 2, choiceCount: 3 }) as unknown as QuestionResultEntity);
    return { session, questions };
  };
  const games = [game(6, 'ar', [['cat', true], ['dog', false]]), game(4, 'en', [['cat', true], ['dog', true]]), game(1, 'ar', [['cat', true], ['dog', false]])];
  const brain = buildBrain(games.map((g) => g.session), games.flatMap((g) => g.questions), { 'animals/cow': now - DAY });

  it('grows with right answers, shrinks with misses, and counts both languages', () => {
    const cat = brain.get('animals/cat')!;
    expect(sureness(cat, now)).toBeGreaterThan(sureness(brain.get('animals/dog'), now));
    expect(cat.rightDays).toBe(3);
    expect(cat.byLang.ar).toBeDefined();
    expect(cat.byLang.en).toBeDefined();
    expect(sureness(brain.get('animals/cow'), now)).toBeGreaterThan(0.75);
    expect(sureness(undefined, now)).toBe(PRIOR);
  });
  it('fades with time and brings faded words back', () => {
    const cat = brain.get('animals/cat')!;
    expect(sureness(cat, now + 30 * DAY)).toBeLessThan(sureness(cat, now));
    expect(dueWords(brain, now + 30 * DAY)).toContain('animals/cat');
    expect(learningWords(brain, now).has('animals/dog') || sureness(brain.get('animals/dog'), now) < 0.25).toBe(true);
  });
  it('deals unsure words more often in the matching game', () => {
    const w = brainWeights(brain, [pack('animals', [item('cat'), item('dog'), item('lion')])], now);
    expect(w.dog).toBeGreaterThan(w.cat);
    expect(w.lion).toBeUndefined();
  });
});

describe('her story', () => {
  const packs = [
    pack('family', [item('mama'), item('baba')]),
    pack('animals', [item('cat', { sound: { url: 'cat.wav' }, arFeminine: true } as never), item('elephant', { sound: { url: 'e.wav' } } as never)]),
    pack('food', [item('banana', { arFeminine: true } as never)]),
    pack('first-words', [item('ball', { arFeminine: true } as never)]),
  ];
  it('is the same all week, five pages, with no gaps in the words', () => {
    const a = storyFor(packs, '2026-11-23', new Set(), (i) => i.key)!;
    const b = storyFor(packs, '2026-11-23', new Set(), (i) => i.key)!;
    expect(a.id).toBe(b.id);
    expect(a.pages).toHaveLength(5);
    for (const p of a.pages) {
      expect(p.text.en).not.toMatch(/\{|\}|  /);
      expect(p.text.ar).not.toMatch(/\{|\}/);
      expect(p.pictures.length).toBeGreaterThan(0);
    }
  });
  it('uses grammar that follows the person, and "an" before a vowel', () => {
    for (let w = 0; w < 40; w++) {
      const s = storyFor(packs, `w${w}`, new Set(), (i) => i.key)!;
      const text = s.pages.map((p) => p.text.en).join(' ');
      expect(text).not.toMatch(/\ba [aeiou]/);
      if (s.id.includes(':baba')) expect(s.pages.map((p) => p.text.ar).join(' ')).not.toMatch(/راحت|شافت|أكلت|جوعانة|كمان بتقول/);
    }
    expect(STORY_TEMPLATES.every((t) => t.pages.length === 5)).toBe(true);
  });
  it('changes on Mondays', () => {
    expect(storyWeek(new Date(2026, 10, 25))).toBe('2026-11-23');
    expect(storyWeek(new Date(2026, 10, 29))).toBe('2026-11-23');
    expect(storyWeek(new Date(2026, 10, 30))).toBe('2026-11-30');
  });
});

describe('family circle and the voice video', () => {
  it('makes long secret links', () => {
    const a = newFamilyToken();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(newFamilyToken()).not.toBe(a);
    expect(familyUrl(a, 'https://example.test/')).toBe(`https://example.test/?family=${a}`);
  });
  it('knows how long the video is', () => {
    expect(videoLength([1, 2])).toBeCloseTo(2.5 + 1 + 0.7 + 2 + 0.7);
  });
});
