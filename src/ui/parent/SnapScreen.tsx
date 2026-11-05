import { useMemo, useRef, useState } from 'react';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { MIN_ITEMS_PER_PACK } from '../../content/validate';
import { loadImage, releaseImage } from '../../custom/imageTools';
import { customOps } from '../../custom/ops';
import { overrideMap, overrideOps } from '../../custom/overrides';
import { customStore } from '../../custom/store';
import { blobUrl, type CustomPackView } from '../../custom/toLoaded';
import type { AssetOverride } from '../../custom/types';
import { useI18n } from '../../i18n/I18n';
import { local } from '../../settings/storage';
import type { KidKind } from '../kid/kidSnapshot';
import { choosePictures } from '../kid/layout';
import { Screen } from './components';
import { ItemEditor } from './ItemEditor';
import { PictureCropper } from './PictureCropper';

const ops = customOps(customStore);
const photos = overrideOps(customStore);
/** The pack Snap a word adds to (one of My packs), for the whole phone. */
const PACK_KEY = 'ksm.herWorldPack.v1';
/** The family the stories and her book can show in a photo, in this order. */
const FAMILY = ['mama', 'baba', 'grandma', 'grandpa', 'brother', 'sister', 'baby', 'aunt', 'uncle', 'aunt_paternal', 'uncle_maternal', 'cousin_girl', 'cousin_boy', 'friend'];

/**
 * Snap a word: a photo of something from her world, named, becomes a card at once (in the pack
 * "Her world", one of My packs). And her family in a photo: Teta's photo replaces the drawing of
 * Grandma everywhere (the stories, her book, the Family games), like "Your voice and photos".
 */
export function SnapScreen({
  views,
  familyPack,
  overrides,
  onChanged,
  onPlay,
  onBack,
}: {
  views: readonly CustomPackView[];
  /** The Family pack, with the parent's photos already in. */
  familyPack: LoadedPack | undefined;
  overrides: readonly AssetOverride[];
  onChanged: () => Promise<void>;
  onPlay: (kind: KidKind, packId: string) => void;
  onBack: () => void;
}) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState<{ itemId: string | null } | null>(null);
  const [cropping, setCropping] = useState<{ image: HTMLImageElement; item: LoadedItem } | null>(null);
  const [problem, setProblem] = useState(false);
  const camera = useRef<HTMLInputElement>(null);
  const forItem = useRef<LoadedItem | null>(null);
  const packId = local.get(PACK_KEY);
  const view = views.find((v) => v.pack.id === packId && !v.pack.deleted);
  const mine = useMemo(() => overrideMap(overrides), [overrides]);
  const family = useMemo(
    () => FAMILY.map((k) => familyPack?.items.find((i) => i.key === k)).filter((i): i is LoadedItem => !!i && !!i.picturePath),
    [familyPack],
  );

  const snap = async () => {
    if (!view) {
      const pack = await ops.createPack({ en: 'Her world', ar: 'عالمها' });
      local.set(PACK_KEY, pack.id);
      await onChanged();
    }
    setEditing({ itemId: null });
  };

  if (editing) {
    const pack = view?.pack ?? views.find((v) => v.pack.id === local.get(PACK_KEY))?.pack;
    if (pack) {
      const item = editing.itemId ? (view?.items.find((i) => i.id === editing.itemId) ?? null) : null;
      return (
        <ItemEditor
          pack={pack}
          item={item}
          autoCamera
          onCancel={() => setEditing(null)}
          onDone={async () => {
            await onChanged();
            setEditing(null);
          }}
        />
      );
    }
  }

  const words = (view?.items ?? []).filter((i) => !i.deleted);
  const ready = view?.loaded.items.length ?? 0;
  return (
    <Screen title={t('snapTitle')} onBack={onBack}>
      <section className="card snap-card">
        <p>{t('snapIntro')}</p>
        <button type="button" className="btn primary big wide" onClick={() => void snap()}>
          {t('snapTake')}
        </button>
        {words.length > 0 && (
          <>
            <h3 className="tip-label">
              {t('snapPack')} · {t('snapCount', { n: words.length })}
            </h3>
            <div className="snap-grid">
              {words.map((w) => (
                <button type="button" key={w.id} className="snap-word" onClick={() => setEditing({ itemId: w.id })}>
                  {w.picture ? <img src={blobUrl(w.picture)} alt="" /> : <span className="snap-empty">?</span>}
                  <span>{w.name[lang] || w.name[lang === 'ar' ? 'en' : 'ar'] || '…'}</span>
                </button>
              ))}
            </div>
            {view && ready > 0 && (
              <button type="button" className="btn wide" onClick={() => onPlay(ready >= MIN_ITEMS_PER_PACK ? 'game' : 'explore', view.loaded.id)}>
                ▶ {t('snapPlay')}
              </button>
            )}
          </>
        )}
      </section>

      {family.length > 0 && (
        <section className="card family-card">
          <h2>👨‍👩‍👧 {t('familyTitle')}</h2>
          <p className="hint">{t('familyHint')}</p>
          <div className="family-grid">
            {family.map((item) => {
              const hasPhoto = mine.has(item.picturePath!);
              const picture = choosePictures([item])[item.key];
              return (
                <div key={item.key} className={`family-person${hasPhoto ? ' photo' : ''}`}>
                  <img src={picture} alt="" />
                  <strong>{item.name[lang]}</strong>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => {
                      forItem.current = item;
                      camera.current?.click();
                    }}
                  >
                    📷 {hasPhoto ? t('familyChange') : t('familyAdd')}
                  </button>
                  {hasPhoto && (
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={async () => {
                        await photos.remove(item.picturePath!);
                        await onChanged();
                      }}
                    >
                      {t('familyReset')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {problem && (
            <p className="msg error" role="alert">
              {t('pictureUnreadable')}
            </p>
          )}
          <input
            ref={camera}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file || !forItem.current) return;
              try {
                setCropping({ image: await loadImage(file), item: forItem.current });
                setProblem(false);
              } catch {
                setProblem(true);
              }
            }}
          />
        </section>
      )}

      {cropping && (
        <PictureCropper
          image={cropping.image}
          onClose={() => {
            releaseImage(cropping.image);
            setCropping(null);
          }}
          onUse={async (photo) => {
            releaseImage(cropping.image);
            const path = cropping.item.picturePath!;
            setCropping(null);
            await photos.save(path, photo);
            await onChanged();
          }}
        />
      )}
    </Screen>
  );
}
