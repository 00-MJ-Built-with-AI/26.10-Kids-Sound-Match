import { useMemo, useRef, useState } from 'react';
import type { Lang, LoadedItem, LoadedPack } from '../../content/types';
import { overrideMap, overrideOps } from '../../custom/overrides';
import { customStore } from '../../custom/store';
import type { AssetOverride } from '../../custom/types';
import { useI18n } from '../../i18n/I18n';
import { choosePictures } from '../kid/layout';
import { Screen, Segmented } from './components';
import { SoundEditor } from './SoundEditor';
import { iconToBlob } from '../../custom/imageTools';
import { customOps } from '../../custom/ops';
import { blobUrl, type CustomPackView } from '../../custom/toLoaded';
import { customKind, type CustomItem } from '../../custom/types';
import { local } from '../../settings/storage';
import { makeI18n } from '../../i18n/I18n';
import { ItemEditor } from './ItemEditor';

const ops = overrideOps(customStore);
const packOps = customOps(customStore);
/** Who the last voice note was from ("Teta"), so it's typed once. */
const FROM_KEY = 'ksm.voiceFrom.v1';
type Where = 'word' | 'page' | 'message';
/** Enough for a screenful; the search box finds the rest. */
const SHOWN = 60;

/**
 * A voice note from the family (shared from WhatsApp, or chosen from the phone): trim it and give
 * it to a word, a page of one of her books, or keep it as a message for her (a card on Home). Each
 * word keeps one voice; a new one replaces the old. One note can be cut for several words, so Teta
 * can say five words in one message.
 */
export function VoiceNoteScreen({
  packs,
  views,
  overrides,
  shared,
  onChanged,
  onBack,
}: {
  /** The parent's own packs: her books, and the family messages. */
  views: readonly CustomPackView[];
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
  /** Where the last note went, when it wasn't a word: a book page or a message. */
  const [kept, setKept] = useState<string | null>(null);
  const [where, setWhere] = useState<Where>('word');
  const [from, setFrom] = useState(() => local.get(FROM_KEY) ?? '');
  const [trimFor, setTrimFor] = useState<{ where: 'page'; bookId: string } | { where: 'message' } | null>(null);
  const [page, setPage] = useState<{ bookId: string; item: CustomItem } | null>(null);
  const books = views.filter((v) => customKind(v.pack.id) === 'book');
  const notes = views.find((v) => customKind(v.pack.id) === 'note');
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

  const openBook = page ? books.find((b) => b.pack.id === page.bookId) : undefined;
  if (page && openBook) {
    return (
      <ItemEditor
        pack={openBook.pack}
        item={page.item}
        onCancel={() => setPage(null)}
        onDone={async () => {
          await onChanged();
          setPage(null);
          setSavedName(null);
          setKept(t('voiceKeptPage', { book: openBook.pack.name[uiLang] || openBook.pack.name.en || openBook.pack.name.ar }));
        }}
      />
    );
  }

  /** The trimmed note, kept as a page of a book or as a message. */
  const keep = async (clip: Blob) => {
    const target = trimFor;
    setTrimFor(null);
    if (!target) return;
    const name = from.trim();
    if (name) local.set(FROM_KEY, name);
    if (target.where === 'page') {
      const item = { ...packOps.emptyItem(target.bookId), nameAudio: { [lang]: clip } };
      await packOps.saveItem(item, true);
      await onChanged();
      setPage({ bookId: target.bookId, item: { ...item, mediaVersion: 1 } });
      return;
    }
    const pack =
      notes?.pack ??
      (await packOps.createPack({ ar: makeI18n('ar').t('messagesPack'), en: makeI18n('en').t('messagesPack') }, 'note'));
    const who = name || t('messageSomeone');
    await packOps.saveItem({ ...packOps.emptyItem(pack.id), name: { ar: who, en: who }, picture: await iconToBlob('💌'), pictureKind: 'icon', nameAudio: { [lang]: clip } }, true);
    await onChanged();
    setSavedName(null);
    setKept(t('voiceKeptMessage'));
  };

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
            {kept && (
              <p className="msg" role="status">
                ✓ {kept}
              </p>
            )}
            <button type="button" className="btn ghost wide" onClick={() => file.current?.click()}>
              {t('voiceNoteAnother')}
            </button>
          </section>
          <section className="card">
            <label className="field">
              <span>{t('voiceFrom')}</span>
              <input value={from} placeholder={t('voiceFromHint')} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <Segmented
              label={t('voiceWhere')}
              value={where}
              options={[
                { value: 'word' as const, label: t('voiceToWord') },
                { value: 'page' as const, label: t('voiceToPage') },
                { value: 'message' as const, label: t('voiceToMessage') },
              ]}
              onChange={setWhere}
            />
          </section>
          {where === 'page' && (
            <section className="card">
              <h2>{t('voiceWhichBook')}</h2>
              <p className="hint">{t('voicePageHint')}</p>
              {books.map((b) => (
                <button type="button" key={b.pack.id} className="card pack-card" onClick={() => setTrimFor({ where: 'page', bookId: b.pack.id })}>
                  <span className="pack-thumbs" aria-hidden="true">
                    {b.items
                      .filter((i) => i.picture)
                      .slice(0, 3)
                      .map((i) => (
                        <img key={i.id} src={blobUrl(i.picture!)} alt="" />
                      ))}
                  </span>
                  <span className="pack-text">
                    <strong>{b.pack.name[uiLang] || b.pack.name.en || b.pack.name.ar}</strong>
                    <span className="hint">{t('pagesCount', { n: b.loaded.items.length })}</span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="btn wide"
                onClick={async () => {
                  const book = await packOps.createPack({ ar: makeI18n('ar').t('bookFirstName'), en: makeI18n('en').t('bookFirstName') }, 'book');
                  await onChanged();
                  setTrimFor({ where: 'page', bookId: book.id });
                }}
              >
                + {t('newBook')}
              </button>
            </section>
          )}
          {where === 'message' && (
            <section className="card">
              <h2>💌 {t('voiceToMessage')}</h2>
              <p className="hint">{t('voiceMessageHint')}</p>
              <button type="button" className="btn primary wide" onClick={() => setTrimFor({ where: 'message' })}>
                {t('voiceMessageKeep')}
              </button>
            </section>
          )}
          {where === 'word' && (
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
          )}
        </>
      )}
      {trimFor && note && <SoundEditor title={trimFor.where === 'message' ? t('voiceToMessage') : t('voiceToPage')} existing={note} onClose={() => setTrimFor(null)} onUse={(clip) => void keep(clip)} />}
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
            setKept(null);
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
