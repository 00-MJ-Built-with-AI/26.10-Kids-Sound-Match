import type { Look } from '../settings/settings';
import type { LoadedItem, LoadedPack, ResolvedAsset } from './types';

/** A parent's own picture is never redrawn by a look. */
const builtInPhoto = (a: ResolvedAsset) => Boolean(a.photo) && !a.url.startsWith('blob:');

/**
 * The pictures a look uses for each card. Sticker book: the photo cut out as a sticker. Storybook:
 * the card's drawing. Puffy toys: its 3D picture where one exists. The original look and Bunny's
 * show keep the photos. A card with nothing for this look stays as it is.
 */
function itemFor(item: LoadedItem, look: Look): LoadedItem {
  const next = (() => {
    if (look === 'sticker') {
      return { ...item, images: item.images.map((a) => (a.art?.sticker ? { ...a, url: a.art.sticker } : a)) };
    }
    if (look === 'puffy' && item.images.some((a) => a.art?.puffy)) {
      const { drawings: _old, ...rest } = item;
      return { ...rest, images: item.images.map((a) => (a.art?.puffy ? { ...a, url: a.art.puffy, photo: false } : a)) };
    }
    if (look === 'storybook' && item.drawings?.length && item.images.some(builtInPhoto)) {
      const { drawings, ...rest } = item;
      return { ...rest, images: drawings };
    }
    return item;
  })();
  return item.prompts ? { ...next, prompts: item.prompts.map((p) => itemFor(p, look)) } : next;
}

/** The packs with each card's pictures for this look. */
export function applyLook(packs: readonly LoadedPack[], look: Look): LoadedPack[] {
  if (look === 'now' || look === 'bunny') return packs.slice();
  return packs.map((p) => ({ ...p, items: p.items.map((i) => itemFor(i, look)) }));
}
