import { describe, expect, it } from 'vitest';
import type { LoadedItem, LoadedPack } from '../content/types';
import { bringList, cupToys, gardenThings } from '../content/playThings';
import { customKind, newPackId, newTimeId } from '../custom/types';
import { customToLoaded } from '../custom/toLoaded';
import { talkingView } from '../report/talking';
import { restEnd } from '../settings/rest';
import { cupsRound } from '../ui/kid/KidCups';
import { feelStep } from './steps';

const item = (key: string, extra: Partial<LoadedItem> = {}) => ({ key, name: { en: key, ar: key }, images: [], ...extra }) as unknown as LoadedItem;
const pack = (id: string, items: LoadedItem[], extra = {}) => ({ id, kind: 'match', items, groups: [], ...extra }) as unknown as LoadedPack;

describe('Show me happy', () => {
  const faces = ['girl', 'boy'].flatMap((w) => ['happy', 'sad', 'sleepy', 'angry'].map((f) => item(`fe_${w}_${f}`)));
  it('puts the feeling among two other feelings, one on each child', () => {
    for (let i = 0; i < 20; i++) {
      const step = feelStep(faces[0], faces, pack('learn', faces), Math.random);
      expect(step?.kind).toBe('pick');
      if (step?.kind !== 'pick') return;
      const keys = step.options.map((o) => o.key);
      expect(keys).toContain('fe_girl_happy');
      expect(keys.filter((k) => k.endsWith('_happy'))).toHaveLength(1);
      expect(new Set(keys.map((k) => k.split('_')[2])).size).toBe(3);
      expect(keys.some((k) => k.startsWith('fe_boy_'))).toBe(true);
    }
  });
});

describe('Bring me, the cups and the garden', () => {
  const packs = [
    pack('first-words', ['ball', 'teddy', 'cup', 'spoon', 'scissors', 'book', 'shoe'].map((k) => item(k))),
    pack('animals', ['cow', 'cat', 'lion'].map((k) => item(k, { sound: { url: `${k}.wav` } as never }))),
    pack('instruments', [item('drum', { sound: { url: 'drum.wav' } as never }), item('bell')]),
  ];
  it('asks for safe real things, the words she is learning first', () => {
    const list = bringList(packs, new Set(['first-words/spoon']), new Set(['first-words/cup']));
    expect(list[0]).toBe('first-words/spoon');
    expect(list[1]).toBe('first-words/cup');
    expect(list).not.toContain('first-words/scissors');
    expect(list).toHaveLength(5);
  });
  it('hides toys, and fills the garden with things that make a sound', () => {
    expect(cupToys(packs).sort()).toEqual(['first-words/ball', 'first-words/teddy']);
    expect(gardenThings(packs).sort()).toEqual(['animals/cat', 'animals/cow', 'instruments/drum']);
  });
  it('starts with two cups, then three, then a swap', () => {
    expect(cupsRound(0)).toEqual({ cups: 2, swap: false });
    expect(cupsRound(2)).toEqual({ cups: 3, swap: false });
    expect(cupsRound(5)).toEqual({ cups: 3, swap: true });
  });
});

describe('her books and songs', () => {
  it('keeps the kind in the pack id', () => {
    expect(customKind(newPackId('book'))).toBe('book');
    expect(customKind(`custom:${newPackId('song')}`)).toBe('song');
    expect(customKind(newPackId())).toBe('words');
    expect(newPackId('book')).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
  it('keeps pages in the order they were added, and out of the matching games', () => {
    const ids = [newTimeId(1_000), newTimeId(2_000), newTimeId(3_000)];
    expect([...ids].sort()).toEqual(ids);
    const blob = new Blob(['x']);
    const book = { id: newPackId('book'), name: { en: 'My day', ar: 'يومي' }, updatedAt: 1, deleted: false };
    const page = (id: string) => ({ id, packId: book.id, name: { en: id, ar: '' }, picture: blob, pictureKind: 'photo' as const, nameAudio: { en: blob }, sound: null, mediaVersion: 1, updatedAt: 1, deleted: false });
    const [view] = customToLoaded([book], [page(ids[2]), page(ids[0]), page(ids[1])], {} as never, () => 'blob:x');
    expect(view.loaded.items.map((i) => i.key)).toEqual(ids);
    expect(view.loaded.ownGame).toBe(true);
  });
});

describe('the games rest after Bedtime', () => {
  it('rests from the evening until six', () => {
    const at = (h: number) => new Date(2026, 10, 25, h, 30).getTime();
    expect(restEnd(at(14))).toBeNull();
    expect(new Date(restEnd(at(19))!).toString()).toBe(new Date(2026, 10, 26, 6, 0).toString());
    expect(new Date(restEnd(at(1))!).toString()).toBe(new Date(2026, 10, 25, 6, 0).toString());
  });
});

describe('talking at her age', () => {
  it('shows what most children do by now and next, and mentions the doctor gently', () => {
    const v = talkingView(20, 10, false);
    expect(v.now?.months).toBe(18);
    expect(v.next?.months).toBe(24);
    expect(v.mention).toBeNull();
    expect(talkingView(19, 1, false).mention).toBe('words');
    expect(talkingView(19, 0, false).mention).toBeNull();
    expect(talkingView(25, 30, false).mention).toBe('two');
    expect(talkingView(25, 30, true).mention).toBeNull();
    expect(talkingView(10, 0, false).now).toBeNull();
  });
});

describe('an empty pack', () => {
  it('has no pictures, and nothing breaks', async () => {
    const { choosePictures } = await import('../ui/kid/layout');
    expect(choosePictures([])).toEqual({});
  });
});
