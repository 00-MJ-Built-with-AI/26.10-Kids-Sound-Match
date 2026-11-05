import { useEffect, useMemo, useRef, useState } from 'react';
import { startRecording, type ActiveRecording } from '../../custom/recorder';
import { recentWords, voiceId, voiceStore, type VoiceClip } from '../../settings/herVoice';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { blobUrl } from '../../custom/toLoaded';
import { useI18n } from '../../i18n/I18n';
import { reportStore } from '../../report/db';
import type { QuestionResultEntity, SessionEntity } from '../../report/types';
import { knownWords, wordEvidence, wordId } from '../../report/words';
import { renderWordsImage } from '../../report/wordsImage';
import { forProfile, type ProfileState } from '../../settings/profiles';
import {
  addExtraWord,
  loadWordMarks,
  removeExtraWord,
  saveWordMarks,
  toggleSays,
  type WordMarks,
} from '../../settings/words';
import { choosePictures } from '../kid/layout';
import { Overlay, Screen } from './components';
import { Avatar, ProfileRow } from './ProfileRow';

interface WordInfo {
  id: string;
  item: LoadedItem;
  pack: LoadedPack;
  picture: string;
}

interface ShownWord extends WordInfo {
  /** When it first counted as understood. */
  since?: number;
  /** When the parent marked it as said. */
  says?: number;
}

const SHARE_TILES = 24;

/** Every word in the app, by word id: the plain packs only (not the Mixed game or Who eats what?). */
function wordLookup(packs: readonly LoadedPack[]): Map<string, WordInfo> {
  const map = new Map<string, WordInfo>();
  for (const pack of packs) {
    if (pack.kind !== 'match' || pack.parts) continue;
    const pictures = choosePictures(pack.items, () => 0);
    for (const item of pack.items) {
      const id = wordId(pack.id, item.key);
      if (!map.has(id)) map.set(id, { id, item, pack, picture: pictures[item.key] });
    }
  }
  return map;
}

/**
 * Words I know: the words a child understands (from the games: right first time 3 times on 2
 * days), the words the parent marked as said, and words outside the app. One child at a time;
 * shareable as a picture and printable as a keepsake. Kept on this phone only.
 */
export function WordsScreen({ packs, profiles, onBack }: { packs: readonly LoadedPack[]; profiles: ProfileState; onBack: () => void }) {
  const { t, lang } = useI18n();
  const [childId, setChildId] = useState(profiles.activeId);
  const child = profiles.profiles.find((p) => p.id === childId) ?? profiles.profiles[0];
  const several = profiles.profiles.length > 1;
  const [data, setData] = useState<{ sessions: SessionEntity[]; questions: QuestionResultEntity[] } | null>(null);
  const [marks, setMarks] = useState<WordMarks>(() => loadWordMarks(child.id));
  const [picking, setPicking] = useState(false);
  const [search, setSearch] = useState('');
  const [typed, setTyped] = useState('');
  const [shared, setShared] = useState<{ blob: Blob; url: string } | null>(null);
  const [shareProblem, setShareProblem] = useState(false);

  useEffect(() => {
    void Promise.all([reportStore.sessions(), reportStore.questions()]).then(([sessions, questions]) => setData({ sessions, questions }));
  }, []);
  useEffect(() => setMarks(loadWordMarks(child.id)), [child.id]);

  // Her voice book: her own recordings of her words.
  const [voices, setVoices] = useState<Map<string, VoiceClip>>(new Map());
  const [recordingWord, setRecordingWord] = useState<string | null>(null);
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [voiceProblem, setVoiceProblem] = useState(false);
  const rec = useRef<{ word: string; active: ActiveRecording; timer: number } | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const stopBook = useRef(false);
  const loadVoices = () => voiceStore.all(child.id).then((all) => setVoices(new Map(all.map((c) => [c.word, c]))));
  useEffect(() => {
    void loadVoices();
    return () => {
      rec.current?.active.cancel();
      player.current?.pause();
    };
  }, [child.id]);

  const play = (word: string) =>
    new Promise<void>((resolve) => {
      const clip = voices.get(word);
      if (!clip) return resolve();
      player.current?.pause();
      const a = new Audio(URL.createObjectURL(clip.blob));
      player.current = a;
      setPlayingWord(word);
      const done = () => {
        URL.revokeObjectURL(a.src);
        setPlayingWord((w) => (w === word ? null : w));
        resolve();
      };
      a.onended = done;
      a.onerror = done;
      void a.play().catch(done);
    });
  /** Plays her whole voice book, oldest first. */
  const playBook = async () => {
    stopBook.current = false;
    const list = [...voices.values()].sort((x, y) => x.at - y.at);
    for (const c of list) {
      if (stopBook.current) break;
      await play(c.word);
      await new Promise((r) => window.setTimeout(r, 400));
    }
  };
  const finishRecording = async () => {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    window.clearTimeout(r.timer);
    setRecordingWord(null);
    const blob = await r.active.stop();
    if (blob.size < 200) return;
    await voiceStore.put({ id: voiceId(child.id, r.word), profileId: child.id, word: r.word, blob, at: Date.now() });
    await loadVoices();
  };
  const record = async (word: string) => {
    if (rec.current) {
      await finishRecording();
      return;
    }
    player.current?.pause();
    try {
      const active = await startRecording();
      // A word is short: stop by itself after 4 seconds.
      rec.current = { word, active, timer: window.setTimeout(() => void finishRecording(), 4000) };
      setVoiceProblem(false);
      setRecordingWord(word);
    } catch {
      setVoiceProblem(true);
    }
  };

  const change = (next: WordMarks) => {
    saveWordMarks(child.id, next);
    setMarks(next);
  };

  const lookup = useMemo(() => wordLookup(packs), [packs]);
  const known = useMemo(() => {
    if (!data) return new Map<string, number>();
    const sessions = forProfile(data.sessions, child.id);
    const ids = new Set(sessions.map((s) => s.id));
    const isWordPack = (packId: string) => [...lookup.values()].some((w) => w.pack.id === packId);
    return knownWords(
      wordEvidence(
        sessions,
        data.questions.filter((q) => ids.has(q.sessionId)),
        isWordPack,
      ),
    );
  }, [data, child.id, lookup]);

  const words: ShownWord[] = useMemo(() => {
    const ids = new Set([...known.keys(), ...Object.keys(marks.says)]);
    return [...ids]
      .map((id) => lookup.get(id))
      .filter((w): w is WordInfo => w !== undefined)
      .map((w) => ({ ...w, since: known.get(w.id), says: marks.says[w.id] }))
      .sort((a, b) => Math.max(b.since ?? 0, b.says ?? 0) - Math.max(a.since ?? 0, a.says ?? 0));
  }, [known, marks, lookup]);

  const understood = words.filter((w) => w.since !== undefined).length;
  const says = words.filter((w) => w.says !== undefined).length + marks.extra.length;
  const date = (at: number) =>
    new Date(at).toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short' });
  const other = lang === 'ar' ? 'en' : 'ar';

  const matches = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    const all = [...lookup.values()];
    return q ? all.filter((w) => w.item.name.ar.includes(q) || w.item.name.en.toLocaleLowerCase().includes(q)) : all;
  }, [lookup, search]);

  /** This week's card: only the words she understood, said or recorded in the last 7 days. */
  const thisWeek = useMemo(() => {
    const at = (w: ShownWord) => Math.max(w.since ?? 0, w.says ?? 0, voices.get(w.id)?.at ?? 0);
    return recentWords(words.map((w) => ({ w, at: at(w) })), 7).map((x) => x.w);
  }, [words, voices]);
  const prepareShare = async (week = false) => {
    const list = week ? thisWeek : words;
    const tiles = list.slice(0, SHARE_TILES).map((w) => ({ picture: w.picture, name: w.item.name[lang], says: w.says !== undefined }));
    const blob = await renderWordsImage({
      rtl: lang === 'ar',
      title: week ? t('weekTitle') : t('wordsTitle'),
      subtitle: new Date().toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      avatar: { animal: child.animal, color: child.color },
      stats: week
        ? [
            { value: String(thisWeek.length), label: t('weekNew') },
            { value: String(understood), label: t('wordsUnderstands') },
            { value: String(says), label: t('wordsSays') },
          ]
        : [
            { value: String(understood), label: t('wordsUnderstands') },
            { value: String(says), label: t('wordsSays') },
          ],
      tiles,
      more: list.length > SHARE_TILES ? t('wordsMore', { n: list.length - SHARE_TILES }) : null,
      extraTitle: t('wordsExtraTitle'),
      extra: (week ? recentWords(marks.extra, 7) : marks.extra).map((e) => e.text),
      footer: t('shareFooter'),
    });
    setShareProblem(false);
    setShared({ blob, url: blobUrl(blob) });
  };
  const file = () => new File([shared!.blob], 'kids-sound-match-words.png', { type: 'image/png' });
  const canShareFiles = () => {
    try {
      return Boolean(shared && navigator.canShare?.({ files: [file()] }));
    } catch {
      return false;
    }
  };
  const share = async () => {
    try {
      await navigator.share({ files: [file()], title: t('wordsTitle') });
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') setShareProblem(true);
    }
  };
  const savePicture = () => {
    const a = document.createElement('a');
    a.href = shared!.url;
    a.download = 'kids-sound-match-words.png';
    a.click();
  };

  // Printed 9 to a page; the first card is the title card.
  const printCards = [null, ...words];
  const pages = Array.from({ length: Math.ceil(printCards.length / 9) }, (_, i) => printCards.slice(i * 9, (i + 1) * 9));

  return (
    <Screen title={t('wordsTitle')} onBack={onBack}>
      {several && <ProfileRow profiles={profiles.profiles} activeId={child.id} onSelect={setChildId} label={t('children')} />}
      <div className="words-stats">
        <div className="words-stat">
          <strong>{understood}</strong>
          <span>{t('wordsUnderstands')}</span>
        </div>
        <div className="words-stat says">
          <strong>{says}</strong>
          <span>{t('wordsSays')}</span>
        </div>
      </div>
      <p className="hint">{t('wordsHow')}</p>

      {data && words.length === 0 && marks.extra.length === 0 && <p className="empty">{t('wordsEmpty')}</p>}
      {words.length > 0 && (
        <ul className="words-grid">
          {words.map((w) => (
            <li key={w.id} className={w.says !== undefined ? 'word-tile says' : 'word-tile'}>
              <img src={w.picture} alt="" />
              <strong>{w.item.name[lang]}</strong>
              <span className="hint">{w.item.name[other]}</span>
              {w.since !== undefined && <span className="word-since">✓ {date(w.since)}</span>}
              <button
                type="button"
                className={w.says !== undefined ? 'says-btn on' : 'says-btn'}
                aria-pressed={w.says !== undefined}
                onClick={() => change(toggleSays(marks, w.id))}
              >
                🗣️ {w.says !== undefined ? t('wordsSaysOn', { d: date(w.says) }) : t('wordsSaysIt')}
              </button>
              <span className="voice-row">
                <button
                  type="button"
                  className={recordingWord === w.id ? 'voice-btn rec' : 'voice-btn'}
                  aria-label={recordingWord === w.id ? t('voiceStop') : t('voiceRecord')}
                  onClick={() => void record(w.id)}
                >
                  {recordingWord === w.id ? '⏹' : '🎙️'}
                </button>
                {voices.has(w.id) && (
                  <button type="button" className={playingWord === w.id ? 'voice-btn on' : 'voice-btn'} aria-label={t('voicePlay')} onClick={() => void play(w.id)}>
                    ▶
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <section className="card">
        <h2>{t('wordsExtraTitle')}</h2>
        <p className="hint">{t('wordsExtraHint')}</p>
        {marks.extra.length > 0 && (
          <ul className="extra-words">
            {marks.extra.map((e) => (
              <li key={e.id} className="extra-word">
                <span dir="auto">{e.text}</span>
                <span className="hint">{date(e.at)}</span>
                <button type="button" className="chip-x" aria-label={t('delete')} onClick={() => change(removeExtraWord(marks, e.id))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <form
          className="extra-form"
          onSubmit={(e) => {
            e.preventDefault();
            change(addExtraWord(marks, typed));
            setTyped('');
          }}
        >
          <input
            type="text"
            dir="auto"
            value={typed}
            maxLength={40}
            placeholder={t('wordsExtraPlaceholder')}
            aria-label={t('wordsExtraPlaceholder')}
            onChange={(e) => setTyped(e.target.value)}
          />
          <button type="submit" className="btn primary" disabled={!typed.trim()}>
            {t('wordsAddButton')}
          </button>
        </form>
      </section>

      <section className="card voice-book">
        <h2>🎙️ {t('voiceTitle')}</h2>
        <p className="hint">{t('voiceHint')}</p>
        {voiceProblem && <p className="note">{t('voiceProblem')}</p>}
        <p>
          <strong>{t('voiceCount', { n: voices.size })}</strong>
        </p>
        {voices.size > 0 && (
          <div className="stack">
            <button type="button" className="btn primary wide" onClick={() => void playBook()}>
              ▶ {t('voicePlayAll')}
            </button>
            <button
              type="button"
              className="btn ghost wide"
              onClick={() => {
                stopBook.current = true;
                player.current?.pause();
                setPlayingWord(null);
              }}
            >
              ⏹ {t('voiceStopAll')}
            </button>
          </div>
        )}
      </section>

      <div className="stack">
        <button type="button" className="btn primary wide" onClick={() => void prepareShare(true)} disabled={!thisWeek.length}>
          📅 {t('weekShare', { n: thisWeek.length })}
        </button>
        <button type="button" className="btn wide" onClick={() => setPicking(true)}>
          🗣️ {t('wordsMarkSaid')}
        </button>
        <button type="button" className="btn primary wide" onClick={() => void prepareShare(false)} disabled={!words.length && !marks.extra.length}>
          📤 {t('wordsShare')}
        </button>
        <button type="button" className="btn wide" onClick={() => window.print()} disabled={!words.length}>
          🖨️ {t('wordsPrint')}
        </button>
      </div>

      <div className="print-area print-only">
        {pages.map((page, i) => (
          <div className="sheet per-9" key={i}>
            {page.map((w) =>
              w === null ? (
                <div className="flashcard title-card" key="title">
                  <Avatar profile={child} size={120} />
                  <strong>{t('wordsTitle')}</strong>
                  <span>{t('wordsPrintCount', { n: words.length })}</span>
                  <span className="card-date">{date(Date.now())}</span>
                </div>
              ) : (
                <div className="flashcard" key={w.id}>
                  <img src={w.picture} alt="" />
                  <div className="card-names">
                    <span lang="ar" dir="rtl">
                      {w.item.name.ar}
                    </span>
                    <span lang="en" dir="ltr">
                      {w.item.name.en}
                    </span>
                  </div>
                  <span className="card-date">
                    {w.since !== undefined ? `✓ ${date(w.since)}` : ''}
                    {w.says !== undefined ? ` 🗣️ ${date(w.says)}` : ''}
                  </span>
                </div>
              ),
            )}
          </div>
        ))}
      </div>

      {picking && (
        <Overlay label={t('wordsMarkSaid')} onDismiss={() => setPicking(false)}>
          <h2>{t('wordsMarkSaid')}</h2>
          <input
            type="search"
            className="words-search"
            dir="auto"
            value={search}
            placeholder={t('wordsSearch')}
            aria-label={t('wordsSearch')}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul className="words-pick">
            {matches.map((w) => {
              const on = marks.says[w.id] !== undefined;
              return (
                <li key={w.id}>
                  <button type="button" className={on ? 'word-pick on' : 'word-pick'} aria-pressed={on} onClick={() => change(toggleSays(marks, w.id))}>
                    <img src={w.picture} alt="" />
                    <span>{w.item.name[lang]}</span>
                    {on && <span className="word-pick-mark">🗣️</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="pin-footer">
            <button type="button" className="btn primary" onClick={() => setPicking(false)}>
              {t('done')}
            </button>
          </div>
        </Overlay>
      )}

      {shared && (
        <Overlay label={t('wordsShare')} onDismiss={() => setShared(null)}>
          <h2>{t('wordsShare')}</h2>
          <img className="share-preview" src={shared.url} alt={t('wordsTitle')} />
          <p className="hint">{t('shareHint')}</p>
          {shareProblem && (
            <p className="msg error" role="alert">
              {t('shareFailed')}
            </p>
          )}
          <div className="pin-footer">
            <button type="button" className="btn ghost" onClick={() => setShared(null)}>
              {t('close')}
            </button>
            <button type="button" className="btn" onClick={savePicture}>
              {t('savePicture')}
            </button>
            {canShareFiles() && (
              <button type="button" className="btn primary" onClick={() => void share()}>
                {t('share')}
              </button>
            )}
          </div>
        </Overlay>
      )}
    </Screen>
  );
}
