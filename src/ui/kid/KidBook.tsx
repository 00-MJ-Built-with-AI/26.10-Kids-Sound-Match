import { useEffect, useMemo, useRef, useState } from 'react';
import { audioEngine } from '../../audio/audioEngine';
import { ClipResolver, findLine, type Clip } from '../../audio/clips';
import { GameAudio } from '../../audio/gameAudio';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import { countReplay, replaysLeft } from '../../settings/replays';
import { spokenLanguages } from '../../settings/settings';
import { CardNames } from './CardNames';
import { EndScreen, type PickerOptions } from './EndScreen';
import { ArrowIcon } from './icons';
import { KidFrame, PausedScreen } from './KidFrame';
import { clearKidSnapshot, saveKidSnapshot, type KidConfig, type KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { IdleScene } from './scenes';
import { questionDone } from './sitting';
import { StickerAlbum } from './Stickers';

type Stage = 'paused' | 'reading' | 'idle';

interface Word {
  id: string;
  pack: LoadedPack;
  item: LoadedItem;
}

/**
 * Her picture book: a goodnight book made from the words she knows. The cover, then one page per
 * word ("ليلة سعيدة يا قطة"), then "نوم الهنا". Turn the pages together with the big arrows (the
 * book reads right to left in Arabic); tapping the picture reads the page again. Nothing is scored.
 */
export function KidBook({
  packs,
  config,
  snapshot,
  picker,
  onExit,
}: {
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { t, lang } = useI18n();
  const languages = spokenLanguages(config.language);
  const words = useMemo(() => {
    const out: Word[] = [];
    for (const id of config.itemKeys) {
      const slash = id.indexOf('/');
      const pack = packs.find((p) => p.id === id.slice(0, slash));
      const item = pack?.items.find((i) => i.key === id.slice(slash + 1));
      if (pack && item) out.push({ id, pack, item });
    }
    return out;
  }, [packs, config]);
  const pictures = useMemo(() => choosePictures(words.map((w) => w.item)), [words]);
  const goodnight = useMemo(() => findLine(packs, 'goodnight'), [packs]);
  const sleepTight = useMemo(() => findLine(packs, 'sleep_tight'), [packs]);
  const resolvers = useMemo(() => new Map(packs.map((p) => [p.id, new ClipResolver(p, languages)])), [packs]);
  const audio = useMemo(
    () =>
      new GameAudio(audioEngine, resolvers.get(words[0]?.pack.id ?? packs[0].id) ?? new ClipResolver(packs[0], languages), {
        mode: 'NAME_ONLY',
        repeatIntervalSec: config.repeatIntervalSec,
        random: Math.random,
      }),
    [resolvers],
  );

  // Pages: 0 the cover, 1..n the words, n + 1 the last page.
  const last = words.length + 1;
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<'next' | 'back'>('next');
  const [stage, setStageState] = useState<Stage>(snapshot ? (snapshot.stage === 'idle' ? 'idle' : 'paused') : 'reading');
  const [albumOpen, setAlbumOpen] = useState(false);
  const [canReplay, setCanReplay] = useState(() => replaysLeft(config.replaysPerDay, config.profileId) > 0);
  const stageRef = useRef(stage);
  const pageRef = useRef(0);
  const gateRef = useRef(false);
  const startedAt = useRef(snapshot?.startedAt ?? Date.now());
  const setStage = (s: Stage) => {
    stageRef.current = s;
    setStageState(s);
  };
  const persist = (s: 'playing' | 'idle') => saveKidSnapshot({ v: 1, config, startedAt: startedAt.current, stage: s, session: null });

  /** What a page says: "ليلة سعيدة" and the word, in each spoken language. */
  const pageClips = (p: number): Clip[] => {
    const r = resolvers.get(words[0]?.pack.id ?? packs[0].id)!;
    if (p === 0) return r.line(goodnight);
    if (p >= last) return r.line(sleepTight);
    const w = words[p - 1];
    const wr = resolvers.get(w.pack.id)!;
    return languages.flatMap((l) => [...r.line(goodnight, l), wr.nameIn(w.item, l)]);
  };
  const read = (p = pageRef.current) => {
    if (stageRef.current !== 'reading' || gateRef.current || document.visibilityState !== 'visible') return;
    void audio.say(pageClips(p));
  };
  const go = (p: number) => {
    const next = Math.max(0, Math.min(last + 1, p));
    if (next > last) {
      audio.stop();
      persist('idle');
      setCanReplay(replaysLeft(config.replaysPerDay, config.profileId) > 0);
      setStage('idle');
      questionDone();
      return;
    }
    setTurn(next >= pageRef.current ? 'next' : 'back');
    pageRef.current = next;
    setPage(next);
    read(next);
    questionDone();
  };

  const start = () => {
    pageRef.current = 0;
    setPage(0);
    startedAt.current = Date.now();
    setStage('reading');
    persist('playing');
    audio.preload(words.map((w) => w.item));
    read(0);
  };

  useEffect(() => {
    if (stageRef.current === 'reading') start();
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') audio.stop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      audio.stop();
    };
  }, []);

  const exit = () => {
    audio.stop();
    clearKidSnapshot();
    onExit();
  };
  const readAgain = () => {
    if (stageRef.current !== 'idle' || replaysLeft(config.replaysPerDay, config.profileId) <= 0) return;
    countReplay(config.profileId);
    audioEngine.unlock();
    start();
  };

  // Arabic books open the other way: the next page is on the left.
  const rtl = lang === 'ar';
  const word = page >= 1 && page < last ? words[page - 1] : null;
  const avatar = config.avatar;

  return (
    <KidFrame
      stage={stage === 'reading' ? 'book' : stage}
      onGateOpen={() => {
        gateRef.current = true;
        audio.stop();
      }}
      onGateCancel={() => {
        gateRef.current = false;
      }}
      onExit={exit}
    >
      {stage === 'reading' && (
        <div className="book" dir="ltr">
          <div className="book-sky" aria-hidden="true">
            <span className="book-moon" />
            {[12, 28, 46, 64, 80, 90].map((x, i) => (
              <span key={x} className="book-star" style={{ left: `${x}%`, top: `${8 + ((i * 37) % 30)}%`, animationDelay: `${i * 0.4}s` }} />
            ))}
          </div>
          <button
            type="button"
            className={`book-page ${turn}`}
            key={page}
            tabIndex={-1}
            aria-hidden="true"
            onPointerDown={() => read()}
          >
            {page === 0 && (
              <span className="book-cover" style={avatar ? { background: avatar.color } : undefined}>
                <span className="book-cover-face">{avatar?.animal ?? '🌙'}</span>
              </span>
            )}
            {word && (
              <span className="book-picture">
                <img src={pictures[word.item.key]} alt="" draggable={false} />
                {config.cardNames && <CardNames name={word.item.name} />}
              </span>
            )}
            {page === last && (
              <span className="book-end">
                <span className="book-end-moon" />
                <span className="book-zzz">z z z</span>
              </span>
            )}
          </button>
          <div className="book-dots" aria-hidden="true">
            {Array.from({ length: last + 1 }, (_, i) => (
              <span key={i} className={i === page ? 'on' : ''} />
            ))}
          </div>
          <button
            type="button"
            className={`book-turn ${rtl ? 'left' : 'right'}`}
            aria-label={t('bookNext')}
            onClick={() => go(pageRef.current + 1)}
          >
            <ArrowIcon direction={rtl ? 'left' : 'right'} />
          </button>
          {page > 0 && (
            <button
              type="button"
              className={`book-turn back ${rtl ? 'right' : 'left'}`}
              aria-label={t('bookBack')}
              onClick={() => go(pageRef.current - 1)}
            >
              <ArrowIcon direction={rtl ? 'right' : 'left'} />
            </button>
          )}
        </div>
      )}
      {stage === 'paused' && <PausedScreen label={t('resumeGame')} onResume={start} />}
      {stage === 'idle' && <IdleScene />}
      {stage === 'idle' && <EndScreen canReplay={canReplay} onPlayAgain={readAgain} onAlbum={() => setAlbumOpen(true)} picker={picker} />}
      {stage === 'idle' && albumOpen && (
        <StickerAlbum profileId={config.profileId} packs={packs} audio={audio} onClose={() => setAlbumOpen(false)} />
      )}
    </KidFrame>
  );
}
