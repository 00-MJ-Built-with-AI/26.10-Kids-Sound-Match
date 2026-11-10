import { describe, expect, it } from 'vitest';
import { wordsToRecord } from './recordQueue';

const item = (key: string, real: { ar?: boolean; en?: boolean } = {}) => ({
  nameAudio: {
    ar: { path: `packs/p/${key}_name_ar.mp3`, real: real.ar ?? false },
    en: { path: `packs/p/${key}_name_en.mp3`, real: real.en ?? false },
  },
});

describe('the recording session', () => {
  it('asks for every Arabic name first, then English, skipping real and recorded ones', () => {
    const packs = [{ items: [item('cat', { en: true }), item('dog')] }, { items: [item('car', { ar: true })] }];
    const mine = new Set(['packs/p/dog_name_en.mp3']);
    expect(wordsToRecord(packs, (path) => mine.has(path))).toEqual([
      { pack: 0, item: 0, lang: 'ar' },
      { pack: 0, item: 1, lang: 'ar' },
      { pack: 1, item: 0, lang: 'en' },
    ]);
  });

  it('asks once for a name two packs share', () => {
    const packs = [{ items: [item('carrot')] }, { items: [item('carrot')] }];
    expect(wordsToRecord(packs, () => false)).toHaveLength(2);
  });

  it('puts the words she plays most first, Arabic before English', () => {
    const asset = (path: string) => ({ path, real: false });
    const item = (n: string) => ({ nameAudio: { ar: asset(n + '_ar'), en: asset(n + '_en') } });
    const packs = [{ items: [item('a'), item('b')] }];
    const queue = wordsToRecord(packs, () => false, (_, i) => (i === 1 ? 5 : 0));
    expect(queue.map((w) => [w.item, w.lang])).toEqual([[1, 'ar'], [0, 'ar'], [1, 'en'], [0, 'en']]);
  });
});
