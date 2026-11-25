import { useMemo, useRef, useState } from 'react';
import { findLine } from '../../audio/clips';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import { reportStore } from '../../report/db';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { Mascot } from './Mascot';
import { Burst } from './OptionGrid';
import { questionDone } from './sitting';
import { ShellFrame, sleep, useKidShell } from './useKidShell';
import { wordForCoco } from '../../camera/cocoWords';
import { useCamera } from '../../camera/useCamera';

/** Bring me with the camera on: when it's sure it sees the thing asked for, it counts as found. */
function BringCamera({ target, packs, onSpotted }: { target: LoadedItem; packs: readonly LoadedPack[]; onSpotted: () => void }) {
  const { t } = useI18n();
  const { videoRef, state } = useCamera(true, (name) => {
    if (wordForCoco(name, packs)?.item.key === target.key) onSpotted();
  });
  return (
    <div className="bring-camera">
      <video ref={videoRef} playsInline muted />
      {state !== 'ready' && <small>{state === 'denied' ? t('cameraDenied') : state === 'failed' ? t('cameraFailed') : t('cameraLoading')}</small>}
    </div>
  );
}

/** Things asked for in one game. */
export const BRING_ROUNDS = 5;
const CELEBRATE_MS = 1300;

interface Thing {
  item: LoadedItem;
  pack: LoadedPack;
}

/**
 * Bring me: "Can you bring me the… cup?" She goes and fetches the real cup (or points at it); you
 * tick, or skip if she can't find it. Five things from around the home, words she's learning first.
 */
export function KidBring(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { t } = useI18n();
  const { packs, config } = props;
  const things = useMemo<Thing[]>(
    () =>
      config.itemKeys
        .map((id) => {
          const slash = id.indexOf('/');
          const pack = packs.find((p) => p.id === id.slice(0, slash));
          const item = pack?.items.find((i) => i.key === id.slice(slash + 1));
          return pack && item ? { pack, item } : null;
        })
        .filter((x): x is Thing => x !== null)
        .slice(0, BRING_ROUNDS),
    [packs, config.itemKeys],
  );
  const line = useMemo(() => findLine(packs, config.arGender === 'm' ? 'bring_m' : 'bring_f'), [packs, config.arGender]);
  const [round, setRound] = useState(0);
  const [found, setFound] = useState(false);
  // The camera can spot the thing she brings (things the camera knows: a cup, a ball, a book...).
  const [camera, setCamera] = useState(false);
  const busy = useRef(false);
  const results = useRef<
    {
      itemKey: string;
      packId: string;
      firstTryCorrect: boolean;
      attempts: number;
      choiceCount: number;
    }[]
  >([]);
  const roundRef = useRef(0);

  const ask = (r = roundRef.current) => {
    const thing = things[r];
    if (!thing || !shell.canPlay()) return;
    const res = shell.audio.resolver;
    void shell.audio.askLoop(
      res.spoken.flatMap((l) => [...res.line(line, l), res.nameIn(thing.item, l)]),
      2,
    );
  };
  const save = async () => {
    if (!results.current.length) return;
    const list = results.current;
    results.current = [];
    try {
      await reportStore.saveSession(
        {
          packId: list[0].packId,
          startedAt: shell.startedAt.current,
          endedAt: Date.now(),
          questionCount: list.length,
          toddlerMode: false,
          choiceCount: 1,
          language: config.language,
          mode: 'NAME_ONLY',
          completed: true,
          profileId: config.profileId,
          game: 'bring',
        },
        list,
      );
    } catch (e) {
      console.warn('[report] could not save Bring me', e);
    }
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      roundRef.current = 0;
      results.current = [];
      busy.current = false;
      setRound(0);
      setFound(false);
      shell.audio.preload(things.map((x) => x.item));
      ask(0);
    },
    onResume: () => {
      if (!busy.current) ask();
    },
  });

  const next = async (gotIt: boolean) => {
    if (busy.current || !shell.canPlay()) return;
    const thing = things[roundRef.current];
    if (!thing) return;
    busy.current = true;
    if (gotIt) {
      results.current.push({
        itemKey: thing.item.key,
        packId: thing.pack.id,
        firstTryCorrect: true,
        attempts: 1,
        choiceCount: 1,
      });
      setFound(true);
      questionDone();
      await Promise.all([shell.audio.say(shell.audio.resolver.names(thing.item)), sleep(CELEBRATE_MS)]);
    } else shell.audio.stop();
    if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
    const done = roundRef.current + 1;
    if (done >= things.length) {
      void save();
      shell.finish();
      return;
    }
    roundRef.current = done;
    setRound(done);
    setFound(false);
    busy.current = false;
    ask(done);
  };

  const thing = things[round];
  const picture = useMemo(() => (thing ? choosePictures([thing.item], () => 0)[thing.item.key] : ''), [thing]);
  return (
    <ShellFrame shell={shell} kind="bring" {...props}>
      <div className="bring">
        <Mascot mood="think" className="find-real-bunny" />
        {thing && (
          <button
            type="button"
            key={round}
            className={`option point-card find-real-card${found ? ' celebrate alive-bounce' : ''}`}
            tabIndex={-1}
            aria-hidden="true"
            onPointerDown={() => {
              if (!busy.current) ask();
            }}
          >
            <img src={picture} alt="" draggable={false} />
            {found && <Burst size={240} quiet />}
          </button>
        )}
        {camera && thing && !found && <BringCamera key={round} target={thing.item} packs={packs} onSpotted={() => void next(true)} />}
        <div className="point-actions">
          <button type="button" className={camera ? "point-skip bring-camera-btn on" : "point-skip bring-camera-btn"} aria-pressed={camera} aria-label={t("bringCamera")} onClick={() => setCamera((c) => !c)}>
            📷
          </button>
          <button type="button" className="point-skip" aria-label={t('pointSkip')} onClick={() => void next(false)}>
            <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 5.5l8 6.5-8 6.5zM14 5.5l7 6.5-7 6.5z" fill="currentColor" />
            </svg>
          </button>
          <button type="button" className="point-found" aria-label={t('pointFound')} onClick={() => void next(true)}>
            <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="book-dots hide-dots" aria-hidden="true">
          {things.map((x, i) => (
            <span key={x.item.key} className={i < round || (i === round && found) ? 'on' : ''} />
          ))}
        </div>
      </div>
    </ShellFrame>
  );
}
