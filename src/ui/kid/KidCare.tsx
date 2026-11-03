import { useEffect, useMemo, useRef, useState } from 'react';
import { audioEngine } from '../../audio/audioEngine';
import { ClipResolver } from '../../audio/clips';
import { GameAudio } from '../../audio/gameAudio';
import type { ArGender, LoadedItem, LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import { countReplay, replaysLeft } from '../../settings/replays';
import { spokenLanguages } from '../../settings/settings';
import { Baby, type BabyCare, type BabyNeed } from './Baby';
import { EndScreen, type PickerOptions } from './EndScreen';
import { KidFrame, PausedScreen } from './KidFrame';
import { clearKidSnapshot, saveKidSnapshot, type KidConfig, type KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { Burst } from './OptionGrid';
import { IdleScene, SessionEndScene } from './scenes';
import { questionDone } from './sitting';
import { StickerAlbum } from './Stickers';

/** Each thing the baby can be given, and what it fixes. */
const CARE: Record<string, { care: BabyCare; need: BabyNeed }> = {
  baby_food: { care: 'food', need: 'hungry' },
  baby_milk: { care: 'milk', need: 'thirsty' },
  baby_bath: { care: 'bath', need: 'dirty' },
  baby_bed: { care: 'bed', need: 'sleepy' },
  baby_hug: { care: 'hug', need: 'sad' },
};
/** How long the baby is fed, bathed... before it laughs, and the laugh before the next need. */
const DOING_MS = 2600;
const HAPPY_MS = 1200;
const NO_MS = 900;
const SESSION_END_MS = 1800;
const SESSION_END_MAX_MS = 4000;

type Stage = 'paused' | 'playing' | 'ending' | 'idle';
const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function shuffle<T>(list: readonly T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Look after the baby: pretend play for the youngest. The baby is hungry ("البيبي جوعان!", its
 * tummy rumbles), thirsty, dirty, sleepy or sad; she taps what it needs (the bowl, the bottle, the
 * bath, the bed, a hug) and the baby is fed, bathed, tucked in or hugged, then laughs. Anything
 * else she taps is named ("حليب") while the baby shakes its head, and it asks again. Every need
 * once, in a new order each time. Nothing is scored.
 */
export function KidCare({
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
  const tools = useMemo(() => pack.items.filter((i) => CARE[i.key]), [pack]);
  const pictures = useMemo(() => choosePictures(tools, () => 0), [tools]);
  const audio = useMemo(
    () =>
      new GameAudio(audioEngine, new ClipResolver(pack, spokenLanguages(config.language)), {
        mode: config.mode,
        repeatIntervalSec: config.repeatIntervalSec,
        random: Math.random,
      }),
    [pack, config],
  );
  // The baby's laugh: the Feelings pack's "happy" sound.
  const laugh = useMemo(() => {
    const feelings = packs.find((p) => p.id === 'feelings');
    const happy = feelings?.items.find((i) => i.key === 'happy');
    return feelings && happy ? new ClipResolver(feelings, []).sound(happy) : null;
  }, [packs]);

  const [order, setOrder] = useState(() => shuffle(tools.map((i) => i.key)));
  const [index, setIndex] = useState(0);
  const [doing, setDoing] = useState<BabyCare | null>(null);
  const [content, setContent] = useState(false);
  const [no, setNo] = useState<{ key: string; n: number } | null>(null);
  const [stage, setStageState] = useState<Stage>(snapshot ? (snapshot.stage === 'idle' ? 'idle' : 'paused') : 'playing');
  const [albumOpen, setAlbumOpen] = useState(false);
  const [canReplay, setCanReplay] = useState(() => replaysLeft(config.replaysPerDay, config.profileId) > 0);
  const stageRef = useRef(stage);
  const orderRef = useRef(order);
  const indexRef = useRef(0);
  const busy = useRef(false);
  const gateRef = useRef(false);
  const alive = useRef(true);
  const startedAt = useRef(snapshot?.startedAt ?? Date.now());
  const setStage = (s: Stage) => {
    stageRef.current = s;
    setStageState(s);
  };
  const persist = (s: 'playing' | 'idle') => saveKidSnapshot({ v: 1, config, startedAt: startedAt.current, stage: s, session: null });
  const needItem = (): LoadedItem | undefined => tools.find((i) => i.key === orderRef.current[indexRef.current]);
  const canPlay = () => alive.current && stageRef.current === 'playing' && !gateRef.current && document.visibilityState === 'visible';
  /** "البيبي جوعان!" with its tummy rumbling, said again a couple of times. */
  const ask = () => {
    const it = needItem();
    if (it && canPlay()) void audio.talkAsk(it, audio.resolver.pointQuestion(it, gender));
  };

  const present = () => {
    busy.current = false;
    setDoing(null);
    setContent(false);
    setNo(null);
    ask();
  };

  const finish = () => {
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
    questionDone();
    if (indexRef.current + 1 >= orderRef.current.length) {
      finish();
      return;
    }
    indexRef.current++;
    setIndex(indexRef.current);
    present();
  };

  const onTool = (tool: LoadedItem) => {
    if (stageRef.current !== 'playing' || gateRef.current || busy.current) return;
    const it = needItem();
    if (!it) return;
    const names = audio.resolver.names(tool);
    if (tool.key !== it.key) {
      // Not what the baby needs: its name, a shake of the head, and the need again.
      busy.current = true;
      setNo((n) => ({ key: tool.key, n: (n?.n ?? 0) + 1 }));
      void Promise.all([audio.say(names), sleep(NO_MS)]).then(() => {
        if (!alive.current || stageRef.current !== 'playing') return;
        busy.current = false;
        setNo(null);
        ask();
      });
      return;
    }
    busy.current = true;
    setNo(null);
    setDoing(CARE[tool.key].care);
    void audio.say([...names, laugh]);
    void sleep(DOING_MS).then(() => {
      if (!alive.current) return;
      setDoing(null);
      setContent(true);
      void sleep(HAPPY_MS).then(next);
    });
  };

  const start = (fresh: boolean) => {
    if (fresh) {
      const o = shuffle(tools.map((i) => i.key));
      orderRef.current = o;
      setOrder(o);
    }
    indexRef.current = 0;
    setIndex(0);
    startedAt.current = Date.now();
    setStage('playing');
    persist('playing');
    audio.preload(tools, true);
    present();
  };

  const playAgain = () => {
    if (stageRef.current !== 'idle' || gateRef.current || replaysLeft(config.replaysPerDay, config.profileId) <= 0) return;
    countReplay(config.profileId);
    audioEngine.unlock();
    start(true);
  };

  const exit = () => {
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

  const need = order[index];
  const mood: BabyNeed | null = content || !need ? null : CARE[need]?.need ?? null;

  return (
    <KidFrame
      stage={stage === 'playing' ? 'care' : stage}
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
        <div className="care">
          <button
            type="button"
            className="care-baby"
            tabIndex={-1}
            aria-hidden="true"
            onPointerDown={() => {
              if (!busy.current) ask();
            }}
          >
            <Baby mood={mood} doing={doing} no={no !== null} />
            {content && <Burst size={260} />}
          </button>
          <div className="care-tools">
            {tools.map((tool) => (
              <button
                type="button"
                key={tool.key}
                className={`care-tool${no?.key === tool.key ? ` wobble w${no.n % 2}` : ''}${doing === CARE[tool.key].care ? ' used' : ''}`}
                tabIndex={-1}
                aria-hidden="true"
                onPointerDown={() => onTool(tool)}
              >
                <img src={pictures[tool.key]} alt="" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      )}
      {stage === 'paused' && <PausedScreen label={t('resumeGame')} onResume={() => start(false)} />}
      {stage === 'ending' && <SessionEndScene />}
      {stage === 'idle' && <IdleScene />}
      {stage === 'idle' && <EndScreen canReplay={canReplay} onPlayAgain={playAgain} onAlbum={() => setAlbumOpen(true)} picker={picker} />}
      {stage === 'idle' && albumOpen && (
        <StickerAlbum profileId={config.profileId} packs={packs} audio={audio} onClose={() => setAlbumOpen(false)} />
      )}
    </KidFrame>
  );
}
