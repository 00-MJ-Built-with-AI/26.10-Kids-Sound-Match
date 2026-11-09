import { describe, expect, it } from 'vitest';
import { sanitizeSettings, defaultSettings } from '../settings/settings';
import { applyLook } from './looks';
import type { LoadedItem, LoadedPack, ResolvedAsset } from './types';

const photo: ResolvedAsset = {
  path: 'packs/animals/cat.jpg',
  url: '/assets/packs/animals/cat.jpg',
  real: true,
  photo: true,
  art: { sticker: '/assets/looks/sticker/animals/cat.webp', puffy: '/assets/looks/puffy/animals/cat.webp' },
};
const drawing: ResolvedAsset = { path: 'packs/animals/cat.svg', url: '/assets/packs/animals/cat.svg', real: true };
const cat = { key: 'cat', images: [photo], drawings: [drawing] } as unknown as LoadedItem;
const pack = (item: LoadedItem) => [{ id: 'animals', items: [item] }] as unknown as LoadedPack[];
const urls = (packs: LoadedPack[]) => packs[0].items[0].images.map((a) => a.url);

describe('the looks', () => {
  it('leave the pictures alone in the original look and in Bunny\'s show', () => {
    expect(urls(applyLook(pack(cat), 'now'))).toEqual([photo.url]);
    expect(urls(applyLook(pack(cat), 'bunny'))).toEqual([photo.url]);
  });

  it('swap in the sticker, the drawing or the 3D picture', () => {
    expect(urls(applyLook(pack(cat), 'sticker'))).toEqual([photo.art!.sticker]);
    expect(urls(applyLook(pack(cat), 'storybook'))).toEqual([drawing.url]);
    const puffy = applyLook(pack(cat), 'puffy')[0].items[0];
    expect(puffy.images.map((a) => a.url)).toEqual([photo.art!.puffy]);
    expect(puffy.images[0].photo).toBe(false);
  });

  it('keep the photo when a look has nothing for it', () => {
    const plain = { ...cat, images: [{ ...photo, art: undefined }] };
    expect(urls(applyLook(pack(plain), 'puffy'))).toEqual([photo.url]);
    expect(urls(applyLook(pack(plain), 'sticker'))).toEqual([photo.url]);
  });

  it("never replace a parent's own photo", () => {
    const own: ResolvedAsset = { path: photo.path, url: 'blob:abc', real: true, photo: true };
    const item = { ...cat, images: [own], drawings: [photo] };
    for (const look of ['sticker', 'storybook', 'puffy'] as const) expect(urls(applyLook(pack(item), look))).toEqual(['blob:abc']);
  });

  it('start on the original look, and survive a damaged value', () => {
    expect(defaultSettings('en').look).toBe('now');
    expect(sanitizeSettings({ look: 'sticker' }, 'en').look).toBe('sticker');
    expect(sanitizeSettings({ look: 'spotlight' }, 'en').look).toBe('now');
  });
});
