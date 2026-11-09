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
      return { ...item, images: item.images.map((a) => (a.art?.sticker ? { ...a, url: a.art.sticker, square: a.url } : a)) };
    }
    // A screen only shows pictures of one kind (see choosePictures), so everything a look uses counts as
    // that look's kind: a card with no 3D picture keeps its drawing without emptying the screen.
    if (look === 'puffy' && item.images.some(builtInPhoto)) {
      const three = item.images.filter((a) => a.art?.puffy).map((a) => ({ ...a, url: a.art!.puffy! }));
      if (three.length) return { ...item, images: three, drawings: three.map((a) => ({ ...a, photo: false })) };
      if (item.drawings?.length) return { ...item, images: item.drawings.map((a) => ({ ...a, photo: true })) };
    }
    if (look === 'storybook' && item.images.some(builtInPhoto)) {
      if (!item.drawings?.length) return { ...item, images: item.images.map((a) => ({ ...a, photo: false })) };
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
