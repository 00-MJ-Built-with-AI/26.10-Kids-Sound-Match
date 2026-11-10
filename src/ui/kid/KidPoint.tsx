import { useEffect, useMemo, useRef, useState } from 'react';
import { audioEngine } from '../../audio/audioEngine';
import { ClipResolver, findLine } from '../../audio/clips';
import { GameAudio } from '../../audio/gameAudio';
import { sourcePacks } from '../../content/mixed';
import { sceneQuestionOrder } from '../../content/scenes';
import type { ArGender, Lang, LoadedItem, LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import { reportStore } from '../../report/db';
import { wordId } from '../../report/words';
import { countReplay, replaysLeft } from '../../settings/replays';
import { spokenLanguages } from '../../settings/settings';
import { loadWordMarks, saveWordMarks } from '../../settings/words';
import { CardNames } from './CardNames';
import { KidFrame, PausedScreen } from './KidFrame';
import { clearKidSnapshot, saveKidSnapshot, type KidConfig, type KidSnapshot } from './kidSnapshot';
import { questionDone } from './sitting';
import { choosePictures, useBoxSize } from './layout';
import { aliveMotion, Burst } from './OptionGrid';
import { bunnySay } from './BunnyHost';
import { lookNow } from '../theme/looks';
import { BUNNY_ASKS_TALK, bunnyAsksSound, LOOK_WORDS_APPROVED, SOUND_WORDS } from '../../content/lookWords';
import { PHRASES_PER_GAME } from '../../content/phrases';
import { IdleScene, SessionEndScene } from './scenes';
import { EndScreen, type PickerOptions } from './EndScreen';
import { awardSticker, StickerAlbum, stickerPicture, StickerReveal } from './Stickers';

/** Found it: a second of confetti, no words, then the next one. */
const CELEBRATION_MS = 1000;
/** Talk time: the most we wait for the name to be said back before moving on. */
const NAME_MAX_MS = 2600;
const SESSION_END_MS = 1800;
const SESSION_END_MAX_MS = 4000;
/** A body part can't be marked found the moment it appears (an excited double tap). */
const INPUT_GUARD_MS = 600;

type Stage = 'paused' | 'playing' | 'ending' | 'idle';

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** The body parts that can be asked about in these languages, for this child. */
export function pointItems(pack: LoadedPack | undefined, languages: readonly Lang[], gender: ArGender): LoadedItem[] {
  return (pack?.items ?? []).filter((i) =>
    languages.every((lang) => (lang === 'en' ? i.point?.en : i.point?.[gender === 'm' ? 'ar_m' : 'ar_f'])),
  );
}

/**
 * Where's your nose? Played together, away from the screen: the app shows a nose and asks
 * "أين أنفُكِ؟"; the child points at her own nose and the parent taps the big tick (or skips).
 * Tapping the picture asks again. Each tick counts towards "Words I know".
 *
 * Do it with me is the same game with actions: the app shows clapping and says "سقّفي!"; she
 * claps, the parent ticks.
 *
 * Talk time is the same game for saying words: the app shows a cat and asks "شو هاد؟", then waits.
 * When she says it (or tries), the parent ticks: the name is said back, the word is marked as said
 * in Words I know, and it counts as understood. Skipping says the name too, so she always hears it.
 */
export function KidPoint({
  pack,
  packs,
  config,
  snapshot,
  picker,
  onExit,
}: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { t } = useI18n();
  const gender: ArGender = config.arGender ?? 'f';
  const actions = config.kind === 'actions';
  const talk = config.kind === 'talk';
  // Mixed game: which pack each picture came from (for Words I know).
  const sources = useMemo(() => sourcePacks(pack), [pack]);
  const talkLine = useMemo(() => findLine(packs, 'talk'), [packs]);
  // Animal sounds ("بقرة… شو بتقول؟") and Colour hunt ("دوّري على شي… أحمر"): the same game.
  const sounds = config.kind === 'sounds';
  const hunt = config.kind === 'hunt';
  // Two-word time and Hello and thank you: the phrase is said twice with a quiet wait to try it.
  const phrases = config.kind === 'phrases';
  const manners = config.kind === 'manners';
  const sayAfter = phrases || manners;
  const lines = useMemo(
    () => ({
      says: findLine(packs, 'says'),
      saysF: findLine(packs, 'says_f'),
      find: findLine(packs, gender === 'm' ? 'find_m' : 'find_f'),
    }),
    [packs, gender],
  );
  /** Said when the parent ticks or skips: the answer (the animal's sound, or the colour's name). */
  const answer = (it: LoadedItem) => (sounds ? [audio.resolver.sound(it)] : audio.resolver.names(it));
  /** On an action's picture, what to do ("Clap your hands!", "سقّفي!") rather than its name. */
  const cardName = (item: LoadedItem) => {
    if (!actions || talk || sounds || hunt) return item.name;
    const en = item.point?.en?.text ?? item.name.en;
    const ar = item.point?.[gender === 'm' ? 'ar_m' : 'ar_f']?.text ?? item.name.ar;
    return { en, ar };
  };
  const items = useMemo(() => {
    const allowed = new Set(config.itemKeys);
    if (talk || sounds || hunt || sayAfter) return pack.items.filter((i) => allowed.has(i.key));
    return pointItems(pack, spokenLanguages(config.language), gender).filter((i) => allowed.has(i.key));
  }, [pack, config, gender]);
  const pictures = useMemo(() => choosePictures(items), [items]);
  const deal = () => {
    // Two-word time: the first ones are built from words she knows (see phraseOrder), once each.
    if (sayAfter) {
      const count = Math.min(config.questionsPerSession, PHRASES_PER_GAME);
      const chosen = phrases ? config.itemKeys.slice(0, count) : items.map((i) => i.key);
      return sceneQuestionOrder(chosen, Math.min(count, chosen.length), Math.random);
    }
    return sceneQuestionOrder(
      items.map((i) => i.key),
      Math.min(config.questionsPerSession, Math.max(items.length, 1) * 2),
      Math.random,
    );
  };

  const [order, setOrder] = useState(deal);
  const [index, setIndex] = useState(0);
  const [found, setFound] = useState(false);
  const [stage, setStageState] = useState<Stage>(snapshot ? (snapshot.stage === 'idle' ? 'idle' : 'paused') : 'playing');
  const [newSticker, setNewSticker] = useState<string | null>(null);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [canReplay, setCanReplay] = useState(() => replaysLeft(config.replaysPerDay, config.profileId) > 0);

  const stageRef = useRef(stage);
  const orderRef = useRef(order);
  const indexRef = useRef(0);
  const busy = useRef(false);
  const readyAt = useRef(0);
  const foundKeys = useRef<string[]>([]);
  const gateRef = useRef(false);
  const alive = useRef(true);
  const startedAt = useRef(Date.now());

  const setStage = (s: Stage) => {
    stageRef.current = s;
    setStageState(s);
  };

  const audio = useMemo(
    () =>
      new GameAudio(audioEngine, new ClipResolver(pack, spokenLanguages(config.language)), {
        mode: config.mode,
        repeatIntervalSec: config.repeatIntervalSec,
        random: Math.random,
      }),
    [pack, config],
  );

  const item = (i = indexRef.current) => items.find((it) => it.key === orderRef.current[i]);
  const canPlay = () => alive.current && stageRef.current === 'playing' && !gateRef.current && document.visibilityState === 'visible';
  const persist = (s: 'playing' | 'idle') => saveKidSnapshot({ v: 1, config, startedAt: startedAt.current, stage: s, session: null });
  const ask = () => {
    const it = item();
    if (!it || !canPlay()) return;
    const r = audio.resolver;
    if (sayAfter) void audio.askLoop(r.names(it), 2);
    else if (sounds) void audio.askLoop(r.spoken.flatMap((l) => [r.nameIn(it, l), ...r.line(it.arFeminine ? lines.saysF : lines.says, l)]));
    else if (hunt) void audio.askLoop(r.spoken.flatMap((l) => [...r.line(lines.find, l), r.nameIn(it, l)]));
    else if (talk) void audio.talkAsk(it, r.line(talkLine));
    else void audio.pointAsk(it, gender);
  };

  const present = () => {
    busy.current = false;
    setFound(false);
    readyAt.current = performance.now() + INPUT_GUARD_MS;
    ask();
    const it = item();
    const next = item(indexRef.current + 1);
    audio.preload([...(it ? [it] : []), ...(next ? [next] : [])]);
  };

  const save = async () => {
    if (!foundKeys.current.length) return;
    try {
      await reportStore.saveSession(
        {
          packId: pack.id,
          startedAt: startedAt.current,
          endedAt: Date.now(),
          questionCount: foundKeys.current.length,
          toddlerMode: false,
          choiceCount: 1,
          language: config.language,
          mode: config.mode,
          completed: true,
          profileId: config.profileId,
          game: phrases ? 'phrases' : manners ? 'manners' : sounds ? 'sounds' : hunt ? 'hunt' : talk ? 'talk' : actions ? 'actions' : 'point',
        },
        foundKeys.current.map((key) => ({ itemKey: key, packId: sources.get(key) ?? pack.id, firstTryCorrect: true, attempts: 1, choiceCount: 1 })),
      );
    } catch (e) {
      console.warn('[report] could not save the game', e);
    }
  };

  const finish = () => {
    void save();
    const sticker = sayAfter
      ? null
      : awardSticker(
          config.profileId,
          foundKeys.current.map((key) => ({ key, packId: pack.id })),
        );
    const stickerItem = sticker ? items.find((i) => i.key === sticker.key) : undefined;
    setNewSticker(stickerItem ? stickerPicture(stickerItem) : null);
    foundKeys.current = [];
    persist('idle');
    setStage('ending');
    const began = performance.now();
    void Promise.race([audio.sessionEnd(), sleep(SESSION_END_MAX_MS)]).then(() => {
      window.setTimeout(
        () => {
          if (!alive.current) return;
          setCanReplay(replaysLeft(config.replaysPerDay, config.profileId) > 0);
          setStage('idle');
        },
        Math.max(0, SESSION_END_MS - (performance.now() - began)),
      );
    });
  };

  const next = () => {
    if (!alive.current) return;
    if (indexRef.current + 1 >= orderRef.current.length) {
      finish();
      return;
    }
    indexRef.current++;
    setIndex(indexRef.current);
    present();
    questionDone();
  };

  /** The parent's tick: she found it on herself. */
  const onFound = () => {
    if (stageRef.current !== 'playing' || gateRef.current || busy.current || performance.now() < readyAt.current) return;
    const it = item();
    if (!it) return;
    busy.current = true;
    setFound(true);
    foundKeys.current.push(it.key);
    if (sounds || hunt) {
      void Promise.all([sleep(CELEBRATION_MS), Promise.race([audio.say(answer(it)), sleep(NAME_MAX_MS + 1000)])]).then(next);
      return;
    }
    if (talk || sayAfter) {
      // She said it: mark it in Words I know (a mark stays; only the parent takes one away).
      // A phrase isn't a word: Two-word time only goes in the Report.
      const id = wordId(sources.get(it.key) ?? pack.id, it.key);
      const marks = loadWordMarks(config.profileId);
      if (!phrases && marks.says[id] === undefined) saveWordMarks(config.profileId, { ...marks, says: { ...marks.says, [id]: Date.now() } });
      void Promise.all([sleep(CELEBRATION_MS), Promise.race([audio.say(audio.resolver.names(it)), sleep(NAME_MAX_MS)])]).then(next);
      return;
    }
    audio.stop();
    void sleep(CELEBRATION_MS).then(next);
  };

  const onSkip = () => {
    if (stageRef.current !== 'playing' || gateRef.current || busy.current) return;
    const it = item();
    if ((talk || sounds || hunt || sayAfter) && it) {
      // Not this time: she still hears the word before the next picture.
      busy.current = true;
      void Promise.race([audio.say(talk || sayAfter ? audio.resolver.names(it) : answer(it)), sleep(NAME_MAX_MS + 1000)]).then(next);
      return;
    }
    audio.stop();
    next();
  };

  const start = (fresh: boolean) => {
    if (fresh) {
      const o = deal();
      orderRef.current = o;
      setOrder(o);
    }
    indexRef.current = 0;
    setIndex(0);
    foundKeys.current = [];
    startedAt.current = Date.now();
    setStage('playing');
    persist('playing');
    audio.preload([], true);
    present();
  };

  const playAgain = () => {
    if (stageRef.current !== 'idle' || gateRef.current || replaysLeft(config.replaysPerDay, config.profileId) <= 0) return;
    countReplay(config.profileId);
    audioEngine.unlock();
    start(true);
  };

  const exit = () => {
    if (stageRef.current === 'playing') void save();
    audio.stop();
    clearKidSnapshot();
    onExit();
  };

  useEffect(() => {
    alive.current = true;
    if (stageRef.current === 'playing') start(false);
    const onVisibility = () => {
      if (!canPlay()) audio.stop();
      else if (!busy.current) ask();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      alive.current = false;
      document.removeEventListener('visibilitychange', onVisibility);
      audio.stop();
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const box = useBoxSize(ref);
  const size = Math.floor(Math.min(box.w * 0.8, box.h * 0.8, 520));
  const key = order[index];
  const soundWord = sounds && LOOK_WORDS_APPROVED ? SOUND_WORDS[key] : undefined;

  // Bunny's show: Bunny asks in a speech bubble.
  useEffect(() => {
    if (!LOOK_WORDS_APPROVED || lookNow() !== 'bunny') return;
    const it = items.find((i) => i.key === key);
    bunnySay(!it ? null : talk ? BUNNY_ASKS_TALK : sounds ? bunnyAsksSound(it, sources.get(key) ?? pack.id) : null);
  }, [key]);

  return (
    <KidFrame
      stage={stage === 'playing' ? config.kind : stage}
      bunnyHeader
      bunnyBelow
      bunnyLanguages={spokenLanguages(config.language)}
      onGateOpen={() => {
        gateRef.current = true;
        audio.stop();
      }}
      onGateCancel={() => {
        gateRef.current = false;
        if (!busy.current) ask();
      }}
      onExit={exit}
    >
      {stage === 'playing' && (
        <>
          {soundWord && (
            <div className="sound-word" aria-hidden="true">
              {spokenLanguages(config.language).map((l) => (
                <div key={l} lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'}>
                  {soundWord[l]}
                </div>
              ))}
            </div>
          )}
          <div className="point-area" ref={ref}>
            {size > 0 && key && (
              <button
                type="button"
                key={index}
                className={`option point-card${config.cardNames ? ' named' : ''}${found ? ` celebrate ${aliveMotion(sources.get(key) ?? pack.id)}` : ''}`}
                style={{ width: size, height: size }}
                tabIndex={-1}
                aria-hidden="true"
                onPointerDown={() => {
                  if (!busy.current) ask();
                }}
              >
                <img src={pictures[key]} alt="" draggable={false} />
                {config.cardNames && <CardNames name={cardName(items.find((i) => i.key === key)!)} />}
                {found && <Burst size={size} />}
              </button>
            )}
          </div>
          <div className="point-actions">
            <button type="button" className="point-skip" aria-label={t('pointSkip')} onClick={onSkip}>
              <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5.5l8 6.5-8 6.5zM14 5.5l7 6.5-7 6.5z" fill="currentColor" />
              </svg>
            </button>
            <button type="button" className="point-found" aria-label={t('pointFound')} onClick={onFound}>
              <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </>
      )}
      {stage === 'paused' && <PausedScreen label={t('resumeGame')} onResume={() => start(false)} />}
      {stage === 'ending' && <SessionEndScene />}
      {stage === 'ending' && newSticker && <StickerReveal picture={newSticker} />}
      {stage === 'idle' && <IdleScene />}
      {stage === 'idle' && <EndScreen canReplay={canReplay} onPlayAgain={playAgain} onAlbum={() => setAlbumOpen(true)} picker={picker} />}
      {stage === 'idle' && albumOpen && (
        <StickerAlbum profileId={config.profileId} packs={packs} audio={audio} onClose={() => setAlbumOpen(false)} />
      )}
    </KidFrame>
  );
}
