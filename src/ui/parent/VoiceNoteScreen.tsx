import { useMemo, useRef, useState } from 'react';
import type { Lang, LoadedItem, LoadedPack } from '../../content/types';
import { overrideMap, overrideOps } from '../../custom/overrides';
import { customStore } from '../../custom/store';
import type { AssetOverride } from '../../custom/types';
import { useI18n } from '../../i18n/I18n';
import { choosePictures } from '../kid/layout';
import { Screen, Segmented } from './components';
import { SoundEditor } from './SoundEditor';

const ops = overrideOps(customStore);
/** Enough for a screenful; the search box finds the rest. */
const SHOWN = 60;

/**
 * A voice note from the family (shared from WhatsApp, or chosen from the phone): trim it and give
 * it to a word. Each word keeps one voice; a new one replaces the old. One note can be cut for
 * several words, so Teta can say five words in one message.
 */
export function VoiceNoteScreen({
  packs,
  overrides,
  shared,
  onChanged,
  onBack,
}: {
  /** The built-in packs as shipped. */
  packs: readonly LoadedPack[];
  overrides: readonly AssetOverride[];
  /** A note that arrived through the phone's Share menu. */
  shared: Blob | null;
  onChanged: () => Promise<void>;
  onBack: () => void;
}) {
  const { t, lang: uiLang } = useI18n();
  const [note, setNote] = useState<Blob | null>(shared);
  const [lang, setLang] = useState<Lang>('ar');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<LoadedItem | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const mine = useMemo(() => overrideMap(overrides), [overrides]);

  const words = useMemo(
    () =>
      packs
        .filter((p) => p.kind === 'match')
        .flatMap((p) => {
          const pictures = choosePictures(p.items, () => 0);
          return p.items.map((item) => ({ item, picture: pictures[item.key] }));
        }),
    [packs],
  );
  const q = query.trim().toLowerCase();
  const found = (q ? words.filter((w) => w.item.name.ar.includes(q) || w.item.name.en.toLowerCase().includes(q)) : words).slice(0, SHOWN);

  return (
    <Screen title={t('voiceNoteTitle')} onBack={onBack}>
      <p className="hint">{t('voiceNoteIntro')}</p>
      <input
        ref={file}
        type="file"
        accept="audio/*,.opus,.ogg,.oga,.m4a,.aac,.mp3,.wav"
        hidden
        onChange={(e) => {
          const chosen = e.target.files?.[0];
          e.target.value = '';
          if (chosen) {
            setNote(chosen);
            setSavedName(null);
          }
        }}
      />
      {!note ? (
        <button type="button" className="btn primary wide big" onClick={() => file.current?.click()}>
          🎧 {t('voiceNoteChoose')}
        </button>
      ) : (
        <>
          <section className="card">
            <p className="session-done">🎧 {t('voiceNoteReady')}</p>
            {savedName && (
              <p className="msg" role="status">
                ✓ {t('voiceNoteSaved', { word: savedName })}
              </p>
            )}
            <button type="button" className="btn ghost wide" onClick={() => file.current?.click()}>
              {t('voiceNoteAnother')}
            </button>
          </section>
          <section className="card">
            <h2>{t('voiceNoteWhich')}</h2>
            <Segmented
              label={t('settingsLanguage')}
              value={lang}
              options={[
                { value: 'ar' as const, label: t('langArabic') },
                { value: 'en' as const, label: t('langEnglish') },
              ]}
              onChange={setLang}
            />
            <input className="voice-note-search" type="search" value={query} placeholder={t('voiceNoteSearch')} onChange={(e) => setQuery(e.target.value)} />
            <div className="item-grid">
              {found.map(({ item, picture }) => (
                <button type="button" key={item.key} className="animal on" onClick={() => setEditing(item)}>
                  <img src={picture} alt="" draggable={false} />
                  <span className="animal-name">{item.name[lang]}</span>
                  {mine.has(item.nameAudio[lang].path) && (
                    <span className="badges" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
      {editing && note && (
        <SoundEditor
          title={`«${editing.name[lang]}»`}
          existing={note}
          onClose={() => setEditing(null)}
          onUse={async (clip) => {
            const item = editing;
            setEditing(null);
            await ops.save(item.nameAudio[lang].path, clip);
            setSavedName(item.name[uiLang]);
            await onChanged();
          }}
        />
      )}
    </Screen>
  );
}

/** Read once: a voice note the service worker kept from the phone's Share menu. */
export async function takeSharedVoiceNote(): Promise<Blob | null> {
  if (!('caches' in window)) return null;
  const cache = await caches.open('ksm-shared');
  const url = new URL('shared-voice-note', document.baseURI).href;
  const res = await cache.match(url);
  if (!res) return null;
  const blob = await res.blob();
  await cache.delete(url);
  return blob;
}
