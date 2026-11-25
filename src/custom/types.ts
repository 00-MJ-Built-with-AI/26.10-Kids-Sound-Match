import type { Lang, LocalizedText } from '../content/types';

/**
 * Packs parents make themselves (family, toys, food...). Stored on the device first; copied to the
 * parent's private cloud space only if they sign in with Google.
 */
export interface CustomPack {
  id: string;
  name: LocalizedText;
  updatedAt: number;
  /** Deleted packs are kept as markers so other signed-in devices learn about the deletion. */
  deleted: boolean;
  /** The account this pack was backed up to. Never uploaded to a different account. */
  ownerId?: string;
  /** `updatedAt` of the version last saved to the cloud. */
  syncedAt?: number;
}

export type MediaName = 'picture' | 'name_ar' | 'name_en' | 'sound';

export interface CustomItem {
  id: string;
  packId: string;
  name: LocalizedText;
  /** Square JPEG (cropped photo) or PNG (icon). Null only for deleted items. */
  picture: Blob | null;
  pictureKind: 'photo' | 'icon';
  /** The name spoken by the parent, in either or both languages. */
  nameAudio: Partial<Record<Lang, Blob>>;
  /** Optional: with a sound the item plays in every mode; without one, in "name only" and Explore. */
  sound: Blob | null;
  /** Bumped whenever the picture or a recording changes, so sync only re-sends media then. */
  mediaVersion: number;
  updatedAt: number;
  deleted: boolean;
  ownerId?: string;
  syncedAt?: number;
  syncedMediaVersion?: number;
}

/**
 * "Your voice and photos": a parent's own recording or photo for something in a built-in pack
 * (ماما in their voice, a photo of their own cat). Keyed by the file it replaces.
 */
export interface AssetOverride {
  /** The built-in file it replaces, e.g. "packs/animals/cat_name_ar.mp3" or "packs/family/mama.webp". */
  path: string;
  /** Null once removed (kept as a marker so other signed-in devices learn about it). */
  blob: Blob | null;
  updatedAt: number;
  deleted: boolean;
  /** Bumped whenever the recording or photo changes, so sync only re-sends the file then. */
  mediaVersion: number;
  ownerId?: string;
  syncedAt?: number;
  syncedMediaVersion?: number;
}

/**
 * What a parent's pack is: a set of pictures (the matching games), one of her books (a photo and a
 * sentence on each page) or a song (a picture and a sung line each). The kind is kept in the first
 * 8 characters of the pack's id, so the cloud tables (and other phones) need no change.
 */
export type CustomKind = 'words' | 'book' | 'song';
const KIND_MARKS: Record<Exclude<CustomKind, 'words'>, string> = {
  book: 'b00cb00c',
  song: '50a950a9',
};

export function customKind(packId: string): CustomKind {
  const id = packId.startsWith(CUSTOM_PACK_PREFIX) ? packId.slice(CUSTOM_PACK_PREFIX.length) : packId;
  if (id.startsWith(KIND_MARKS.book)) return 'book';
  if (id.startsWith(KIND_MARKS.song)) return 'song';
  return 'words';
}

/** A new pack id of this kind. */
export function newPackId(kind: CustomKind = 'words'): string {
  const id = newId();
  return kind === 'words' ? id : KIND_MARKS[kind] + id.slice(8);
}

/** An id that sorts by when it was made (a UUID v7), so a book's pages keep the order they were added in. */
export function newTimeId(now: number = Date.now()): string {
  const rest = newId().replace(/-/g, '').slice(12);
  const h = now.toString(16).padStart(12, '0').slice(-12) + '7' + rest.slice(1);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

/** Custom pack ids in the game are prefixed so they can't clash with built-in packs. */
export const CUSTOM_PACK_PREFIX = 'custom:';

export function isCustomPackId(packId: string): boolean {
  return packId.startsWith(CUSTOM_PACK_PREFIX);
}

/** Playable: has a picture and at least one spoken name. */
export function itemComplete(item: CustomItem): boolean {
  return !item.deleted && item.picture !== null && Boolean(item.nameAudio.ar || item.nameAudio.en);
}

/** crypto.randomUUID only exists on HTTPS/localhost; phone testing over Wi-Fi uses plain http. */
export function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
