import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { LoadedItem, LoadedPack } from '../content/types';
import { dueReviews, lessonWords, planToday, practise, type PathState } from './path';
import { buildSteps, showMeStep, variants, wordRefs } from './steps';

const empty: PathState = { words: [], day: '', today: [] };

describe('the daily word path', () => {
  const candidates = ['first-words/ball', 'first-words/cup', 'first-words/teddy', 'food/milk', 'food/water'];

  it('chooses three new words a day, skipping the ones she knows, and keeps them all day', () => {
    const s = planToday(empty, candidates, new Set(['first-words/cup']), '2026-11-25');
    expect(s.today).toEqual(['first-words/ball', 'first-words/teddy', 'food/milk']);
    expect(planToday(s, candidates, new Set(), '2026-11-25')).toBe(s);
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
  });

  it('counts a review once a day, and catches up after missed days', () => {
    let s = practise(empty, 'food/milk', '2026-11-01');
    s = practise(s, 'food/milk', '2026-11-05');
    s = practise(s, 'food/milk', '2026-11-05');
    expect(s.words[0].done).toBe(1);
    expect(dueReviews(s, '2026-11-06')).toEqual(['food/milk']);
  });

  it("doesn't bring today's new words back as reviews", () => {
    const s = practise(planToday(empty, candidates, new Set(), '2026-11-25'), 'first-words/ball', '2026-11-25');
    expect(lessonWords(s, '2026-11-25')).toEqual({ fresh: ['first-words/ball', 'first-words/cup', 'first-words/teddy'], review: [] });
  });

  it('starts from words that exist', () => {
    const packs = ['first-words', 'home', 'food', 'animals'].map((id) => JSON.parse(fs.readFileSync(`public/assets/packs/${id}/manifest.json`, 'utf8')) as { items: { item_key: string }[] });
    expect(packs.every((p) => p.items.length > 10)).toBe(true);
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
