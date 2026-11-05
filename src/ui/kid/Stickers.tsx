import { useMemo, useRef, useState } from 'react';
import type { GameAudio } from '../../audio/gameAudio';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { loadStickers, pickSticker, saveStickers, type StickerChoice } from '../../settings/stickers';
import { choosePictures } from './layout';
import { sceneUrl } from './sceneMap';
import { local } from '../../settings/storage';
import { profileKey } from '../../settings/profiles';

/** A picture's sticker image: its drawing (or the parent's photo), the same one every time. */
export function stickerPicture(item: LoadedItem): string {
  return choosePictures([item], () => 0, { drawingsFirst: true })[item.key];
}

/** After a finished game: a sticker of a picture the child found, if there's one they don't have yet. */
export function awardSticker(profileId: string, found: readonly StickerChoice[]): StickerChoice | null {
  const owned = loadStickers(profileId);
  const sticker = pickSticker(owned, found);
  if (sticker) saveStickers(profileId, [...owned, { ...sticker, at: Date.now() }]);
  return sticker;
}

/** The new sticker grows in the middle of the screen, then flies down into the album. */
export function StickerReveal({ picture }: { picture: string }) {
  return (
    <div className="sticker-reveal" aria-hidden="true">
      <span className="sticker big">
        <img src={picture} alt="" draggable={false} />
      </span>
    </div>
  );
}

export function AlbumIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <rect x="9" y="7" width="38" height="44" rx="6" fill="#f2894a" />
      <rect x="13" y="7" width="4" height="44" fill="#e0752f" />
      <rect x="21" y="15" width="20" height="16" rx="4" fill="#fff" />
      <path d="M31 18.5l2 4 4.4.6-3.2 3.1.8 4.4-4-2.1-4 2.1.8-4.4-3.2-3.1 4.4-.6z" fill="#ffc94a" />
      <rect x="21" y="35" width="20" height="3" rx="1.5" fill="#fff" opacity="0.7" />
      <rect x="21" y="41" width="13" height="3" rx="1.5" fill="#fff" opacity="0.7" />
    </svg>
  );
}

/**
 * The album, like a sticker book: a page per pack, its scene (the farm, the sea...) with her stickers
 * on it. She can drag them anywhere on the scene (remembered), and tapping one plays its sound and
 * name. The ones still to find wait as faint shapes under the page. No text.
 */
export function StickerAlbum({
  profileId,
  packs,
  audio,
  onClose,
}: {
  profileId: string;
  packs: readonly LoadedPack[];
  audio: GameAudio;
  onClose: () => void;
}) {
  const owned = useMemo(() => new Set(loadStickers(profileId).map((s) => `${s.packId}|${s.key}`)), [profileId]);
  // Only pages the child has started.
  const pages = useMemo(() => packs.filter((p) => p.items.some((i) => owned.has(`${p.id}|${i.key}`))), [packs, owned]);
  const [pageId, setPageId] = useState(pages[0]?.id ?? '');
  const page = pages.find((p) => p.id === pageId) ?? pages[0];
  // Where she put each sticker on its scene (dragged), else a spot of its own.
  const [places, setPlaces] = useState(() => loadStickerPlaces(profileId));
  const [dragging, setDragging] = useState<string | null>(null);
  const drag = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  return (
    <div className="album" onPointerDown={(e) => e.stopPropagation()}>
      <div className="album-top">
        <div className="album-tabs">
          {pages.map((p) => (
            <button
              type="button"
              key={p.id}
              className={p.id === page?.id ? 'album-tab on' : 'album-tab'}
              aria-label={p.name.en}
              onClick={() => setPageId(p.id)}
            >
              <img src={stickerPicture(p.items.find((i) => owned.has(`${p.id}|${i.key}`)) ?? p.items[0])} alt="" />
            </button>
          ))}
        </div>
        <button type="button" className="album-close" aria-label="Close" onClick={onClose}>
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <path d="M8 8l14 14M22 8L8 22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {page && (
        <div className="album-book" key={page.id}>
          <div className="album-scene" ref={sceneRef} style={{ backgroundImage: `url("${sceneUrl(page.id)}")` }}>
            {page.items
              .filter((item) => owned.has(`${page.id}|${item.key}`))
              .map((item) => {
                const id = `${page.id}|${item.key}`;
                const at = places[id] ?? homeSpot(id);
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={dragging === id ? 'sticker on-scene held' : 'sticker on-scene'}
                    style={{ left: `${at.x}%`, top: `${at.y}%` }}
                    tabIndex={-1}
                    aria-hidden="true"
                    onPointerDown={(e) => {
                      try {
                        e.currentTarget.setPointerCapture(e.pointerId);
                      } catch {
                        // A synthetic tap: no capture needed.
                      }
                      drag.current = { id, x: e.clientX, y: e.clientY, moved: false };
                      setDragging(id);
                    }}
                    onPointerMove={(e) => {
                      const d = drag.current;
                      const box = sceneRef.current?.getBoundingClientRect();
                      if (!d || !box) return;
                      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) d.moved = true;
                      if (!d.moved) return;
                      const x = Math.min(92, Math.max(0, ((e.clientX - box.left) / box.width) * 100 - 8));
                      const y = Math.min(84, Math.max(0, ((e.clientY - box.top) / box.height) * 100 - 8));
                      setPlaces((p) => ({ ...p, [id]: { x, y } }));
                    }}
                    onPointerUp={() => {
                      const d = drag.current;
                      drag.current = null;
                      setDragging(null);
                      if (d && !d.moved) void audio.explore(item);
                      else setPlaces((p) => {
                        saveStickerPlaces(profileId, p);
                        return p;
                      });
                    }}
                  >
                    <img src={stickerPicture(item)} alt="" draggable={false} />
                  </button>
                );
              })}
          </div>
          <div className="album-todo">
            {page.items
              .filter((item) => !owned.has(`${page.id}|${item.key}`))
              .map((item) => (
                <span key={item.key} className="sticker missing small" aria-hidden="true">
                  <img src={stickerPicture(item)} alt="" draggable={false} />
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const PLACES_KEY = 'ksm.stickerPlaces.v1';
type Places = Record<string, { x: number; y: number }>;

function loadStickerPlaces(profileId: string): Places {
  const r = local.getJson<Places>(profileKey(PLACES_KEY, profileId));
  return r && typeof r === 'object' ? r : {};
}
function saveStickerPlaces(profileId: string, places: Places): void {
  local.setJson(profileKey(PLACES_KEY, profileId), places);
}

/** A sticker's own spot on its page before she moves it: spread out, the same every time. */
function homeSpot(id: string): { x: number; y: number } {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  h >>>= 0;
  return { x: 4 + (h % 1000) / 1000 * 80, y: 8 + ((h >>> 10) % 1000) / 1000 * 70 };
}
