import { describe, expect, it } from 'vitest';
import type { LoadedItem, LoadedPack } from '../content/types';
import { addToday, dueReviews, EMPTY_PATH, lessonWords, mergePaths, pathView, planToday, practise, sanitizePath, skipWord, type PathState } from './path';
import { buildSteps, showMeStep, variants, wordRefs } from './steps';
import { languageBalance } from '../report/languages';
import type { SessionEntity } from '../report/types';

const empty: PathState = EMPTY_PATH;

describe('the daily word path', () => {
  const candidates = Array.from({ length: 30 }, (_, i) => `first-words/w${i}`);

  it('plans the week: three new words a day, skipping the ones she knows, fixed all week', () => {
    const s = planToday(empty, candidates, new Set(['first-words/w1']), '2026-11-25');
    expect(lessonWords(s, '2026-11-25').fresh).toEqual(['first-words/w0', 'first-words/w2', 'first-words/w3']);
    expect(lessonWords(s, '2026-11-26').fresh).toEqual(['first-words/w4', 'first-words/w5', 'first-words/w6']);
    expect(Object.keys(s.week!.days)).toHaveLength(7);
    expect(planToday(s, candidates, new Set(), '2026-12-01')).toBe(s);
    expect(planToday(s, candidates, new Set(), '2026-12-02').week!.start).toBe('2026-12-02');
  });

  it('brings a word back on day 2, day 4 and day 7', () => {
    let s = practise(empty, 'food/milk', '2026-11-01');
    expect(dueReviews(s, '2026-11-01')).toEqual([]);
    expect(dueReviews(s, '2026-11-02')).toEqual(['food/milk']);
    s = practise(s, 'food/milk', '2026-11-02');
    expect(dueReviews(s, '2026-11-03')).toEqual([]);
    expect(dueReviews(s, '2026-11-04')).toEqual(['food/milk']);
    s = practise(s, 'food/milk', '2026-11-04');
    expect(dueReviews(s, '2026-11-06')).toEqual([]);
    expect(dueReviews(s, '2026-11-07')).toEqual(['food/milk']);
    s = practise(s, 'food/milk', '2026-11-07');
    expect(dueReviews(s, '2026-11-30')).toEqual([]);
    expect(pathView(s, '2026-11-30').learned).toEqual(['food/milk']);
  });

  it('counts a review once a day, and catches up after missed days', () => {
    let s = practise(empty, 'food/milk', '2026-11-01');
    s = practise(s, 'food/milk', '2026-11-05');
    s = practise(s, 'food/milk', '2026-11-05');
    expect(s.words[0].done).toBe(1);
    expect(dueReviews(s, '2026-11-06')).toEqual(['food/milk']);
  });

  it('lets the parent skip a word or add one to today', () => {
    let s = planToday(empty, candidates, new Set(), '2026-11-25');
    s = skipWord(s, 'first-words/w4');
    expect(lessonWords(s, '2026-11-26').fresh).toEqual(['first-words/w3', 'first-words/w5']);
    s = addToday(s, 'animals/cat', '2026-11-25');
    expect(lessonWords(s, '2026-11-25').fresh).toEqual(['first-words/w0', 'first-words/w1', 'first-words/w2', 'animals/cat']);
    expect(pathView(s, '2026-11-25').upcoming[0]).toEqual({ day: '2026-11-26', words: ['first-words/w3', 'first-words/w5'] });
  });

  it('merges two phones: earliest start, furthest progress', () => {
    const a = practise(empty, 'food/milk', '2026-11-01');
    const b = { ...practise(practise(empty, 'food/milk', '2026-11-03'), 'food/milk', '2026-11-05'), skipped: ['animals/cat'] };
    const m = mergePaths(a, b);
    expect(m.words).toEqual([{ word: 'food/milk', introduced: '2026-11-01', done: 1, last: '2026-11-05' }]);
    expect(m.skipped).toEqual(['animals/cat']);
    expect(sanitizePath({ words: [{ word: 1 }], week: 'x' })).toEqual({ words: [], week: null, skipped: [] });
  });
});

describe('Arabic and English balance', () => {
  const now = Date.parse('2026-11-25T12:00:00Z');
  const games = (lang: string, n: number) => Array.from({ length: n }, () => ({ language: lang, startedAt: now - 86_400_000 }) as unknown as SessionEntity);

  it('suggests the language falling behind', () => {
    expect(languageBalance([...games('en', 8), ...games('ar', 1)], now).suggest).toBe('ar');
    expect(languageBalance([...games('ar', 4), ...games('en', 4)], now).suggest).toBeNull();
    expect(languageBalance(games('en', 3), now).suggest).toBeNull();
  });
});

const asset = (url: string, extra = {}) => ({ path: url, url, real: true, ...extra });
const item = (key: string, extra: Partial<LoadedItem> = {}) =>
  ({ key, name: { en: key, ar: key }, images: [asset(`${key}.jpg`, { photo: true, art: { puffy: `${key}-3d.webp` } })], drawings: [asset(`${key}.svg`)], ...extra }) as unknown as LoadedItem;
const pack = (id: string, items: LoadedItem[], extra = {}) => ({ id, kind: 'match', items, groups: [], ...extra }) as unknown as LoadedPack;

describe('the Learn games', () => {
  const packs = [pack('first-words', ['ball', 'cup', 'teddy', 'shoe', 'book'].map((k) => item(k))), pack('animals', ['cat', 'dog'].map((k) => item(k)))];
  const refs = wordRefs(packs);
  const base = { refs, raw: refs, random: () => 0.3 };

  it('finds a photo, a drawing and a 3D picture of one word', () => {
    expect(variants(item('cat'))).toEqual(['cat.jpg', 'cat.svg', 'cat-3d.webp']);
  });

  it('shows the same word twice in different pictures, both right', () => {
    const [step] = buildSteps({ ...base, mode: 'variety', fresh: ['animals/cat'], review: [], known: [] });
    expect(step.kind).toBe('pick');
    if (step.kind !== 'pick') return;
    expect(step.targets).toHaveLength(2);
    const pictures = step.options.filter((o) => step.targets.includes(o.key)).map((o) => o.picture);
    expect(new Set(pictures).size).toBe(2);
  });

  it('builds a lesson: meet each new word, the new one, the reviews, then a check', () => {
    const steps = buildSteps({ ...base, mode: 'lesson', fresh: ['animals/cat', 'animals/dog'], review: ['first-words/ball'], known: ['first-words/cup'] });
    expect(steps.map((s) => s.kind)).toEqual(['meet', 'pick', 'meet', 'pick', 'pick', 'pick', 'pick']);
    const newOne = steps[1];
    if (newOne.kind === 'pick') expect(newOne.options.map((o) => o.item.key).sort()).toEqual(['cat', 'cup']);
  });

  it('asks Show me with the same child doing something else and another child doing the same', () => {
    const sm = ['sm_girl_eat', 'sm_girl_sleep', 'sm_boy_eat', 'sm_boy_sleep'].map((k) => item(k));
    const step = showMeStep(sm[0], sm, pack('learn', sm), () => 0.1);
    expect(step && step.kind === 'pick' && step.options.map((o) => o.key).sort()).toEqual(['sm_boy_eat', 'sm_girl_eat', 'sm_girl_sleep']);
  });
});
