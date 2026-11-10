import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { packIsLive } from './newWords';
import { PHRASE_WORDS, phraseOrder } from './phrases';
import { REAL_THINGS, pickRealThing } from './realThings';
import type { LoadedPack } from './types';

const manifest = (id: string) => JSON.parse(fs.readFileSync(`public/assets/packs/${id}/manifest.json`, 'utf8')) as { items: { item_key: string }[] };

describe('Two-word time', () => {
  it('puts phrases built from words she knows first', () => {
    const keys = ['ph_lets_play', 'ph_want_milk', 'ph_big_dog'];
    expect(phraseOrder(keys, new Set(['animals/dog']), () => 0.5)[0]).toBe('ph_big_dog');
    expect(phraseOrder(keys, new Set(['food/milk']), () => 0.5)[0]).toBe('ph_want_milk');
  });

  it('only refers to real phrases and real words', () => {
    const phrases = new Set(manifest('phrases').items.map((i) => i.item_key));
    for (const [phrase, words] of Object.entries(PHRASE_WORDS)) {
      expect(phrases.has(phrase), phrase).toBe(true);
      for (const word of words) {
        const [pack, key] = word.split('/');
        expect(manifest(pack).items.some((i) => i.item_key === key), word).toBe(true);
      }
    }
  });

  it('keeps unchecked words out of the live app until they are approved', () => {
    expect(packIsLive('phrases', false)).toBe(false);
    expect(packIsLive('manners', false)).toBe(false);
    expect(packIsLive('animals', false)).toBe(true);
    expect(packIsLive('phrases', true)).toBe(true);
  });
});

describe('Find the real one', () => {
  const ball = { key: 'ball' };
  const lion = { key: 'lion' };
  const packs = [{ id: 'x', kind: 'match', items: [ball, lion] }] as unknown as LoadedPack[];

  it('only asks for safe things she just heard', () => {
    expect(pickRealThing(['lion', 'ball'], packs, () => 0)?.item.key).toBe('ball');
    expect(pickRealThing(['lion'], packs)).toBeNull();
    expect(pickRealThing([], packs)).toBeNull();
  });

  it('never sends her looking for anything sharp or hot', () => {
    for (const key of ['scissors', 'kettle', 'frying_pan', 'hammer', 'microwave', 'lamp']) expect(REAL_THINGS.has(key)).toBe(false);
  });

  it('lists things that exist in the packs', () => {
    const all = new Set(['first-words', 'home', 'clothes', 'toys', 'food'].flatMap((id) => manifest(id).items.map((i) => i.item_key)));
    for (const key of REAL_THINGS) expect(all.has(key), key).toBe(true);
  });
});
