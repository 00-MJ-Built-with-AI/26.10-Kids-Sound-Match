import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { audioEngine } from '../../audio/audioEngine';
import { ClipResolver } from '../../audio/clips';
import { GameAudio } from '../../audio/gameAudio';
import type { LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import { countReplay, replaysLeft } from '../../settings/replays';
import { spokenLanguages } from '../../settings/settings';
import { EndScreen, type PickerOptions } from './EndScreen';
import { KidFrame, PausedScreen } from './KidFrame';
import { clearKidSnapshot, saveKidSnapshot, type KidConfig, type KidSnapshot } from './kidSnapshot';
import { IdleScene, SessionEndScene } from './scenes';
import { StickerAlbum } from './Stickers';

export type ShellStage = 'paused' | 'playing' | 'ending' | 'idle';

const SESSION_END_MS = 1800;
const SESSION_END_MAX_MS = 4000;
export const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export function shuffle<T>(list: readonly T[], random: () => number = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * What the newer small games share: the stages (paused after a reload, playing, the end
 * celebration, the end screen), the audio, the parent's gate, play again and leaving.
 * `onStart` sets up a fresh game; `onPause` stops whatever the game was saying or doing;
 * `onResume` asks again after the gate is cancelled or the app comes back.
 */
export function useKidShell({
  pack,
  config,
  snapshot,
  onStart,
  onResume,
}: {
  pack: LoadedPack;
  config: KidConfig;
  snapshot: KidSnapshot | null;
  onStart: () => void;
  onResume?: () => void;
}) {
  const audio = useMemo(
    () =>
      new GameAudio(audioEngine, new ClipResolver(pack, spokenLanguages(config.language)), {
        mode: config.mode,
        repeatIntervalSec: config.repeatIntervalSec,
        random: Math.random,
      }),
    [pack, config],
  );
  const [stage, setStageState] = useState<ShellStage>(snapshot ? (snapshot.stage === 'idle' ? 'idle' : 'paused') : 'playing');
  const [canReplay, setCanReplay] = useState(() => replaysLeft(config.replaysPerDay, config.profileId) > 0);
  const [albumOpen, setAlbumOpen] = useState(false);
  const stageRef = useRef(stage);
  const gate = useRef(false);
  const alive = useRef(true);
  const startedAt = useRef(snapshot?.startedAt ?? Date.now());
  const latest = useRef({ onStart, onResume });
  latest.current = { onStart, onResume };

  const setStage = (s: ShellStage) => {
    stageRef.current = s;
    setStageState(s);
  };
  const persist = (s: 'playing' | 'idle') => saveKidSnapshot({ v: 1, config, startedAt: startedAt.current, stage: s, session: null });
  /** True while the child can play: not behind the gate, not in the background, the game on. */
  const canPlay = () => alive.current && stageRef.current === 'playing' && !gate.current && document.visibilityState === 'visible';

  const start = () => {
    startedAt.current = Date.now();
    setStage('playing');
    persist('playing');
    audio.preload([], true);
    latest.current.onStart();
  };

  /** The game is over: praise, "well done", then the end screen. */
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

  /** Asks again (after the gate was cancelled). */
  const resume = () => {
    if (canPlay()) latest.current.onResume?.();
  };

  const playAgain = () => {
    if (stageRef.current !== 'idle' || gate.current || replaysLeft(config.replaysPerDay, config.profileId) <= 0) return;
    countReplay(config.profileId);
    audioEngine.unlock();
    start();
  };

  useEffect(() => {
    alive.current = true;
    if (stageRef.current === 'playing') start();
    const onVisibility = () => {
      if (!canPlay()) audio.stop();
      else latest.current.onResume?.();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      alive.current = false;
      document.removeEventListener('visibilitychange', onVisibility);
      audio.stop();
    };
  }, []);

  return { audio, stage, stageRef, alive, gate, canPlay, finish, start, setStage, startedAt, canReplay, playAgain, resume, albumOpen, setAlbumOpen };
}

export type KidShell = ReturnType<typeof useKidShell>;

/** The frame around a small game, with its paused, ending and end screens. */
export function ShellFrame({
  shell,
  kind,
  packs,
  config,
  picker,
  onExit,
  left,
  children,
}: {
  shell: KidShell;
  /** The stage name while playing (the frame's background: stage-<kind>). */
  kind: string;
  packs: readonly LoadedPack[];
  config: KidConfig;
  picker?: PickerOptions;
  onExit: () => void;
  left?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const { stage, audio } = shell;
  return (
    <KidFrame
      stage={stage === 'playing' ? kind : stage}
      left={stage === 'playing' ? left : undefined}
      onGateOpen={() => {
        shell.gate.current = true;
        audio.stop();
      }}
      onGateCancel={() => {
        shell.gate.current = false;
        shell.resume();
      }}
      onExit={() => {
        audio.stop();
        clearKidSnapshot();
        onExit();
      }}
    >
      {stage === 'playing' && children}
      {stage === 'paused' && <PausedScreen label={t('resumeGame')} onResume={shell.start} />}
      {stage === 'ending' && <SessionEndScene />}
      {stage === 'idle' && <IdleScene />}
      {stage === 'idle' && (
        <EndScreen canReplay={shell.canReplay} onPlayAgain={shell.playAgain} onAlbum={() => shell.setAlbumOpen(true)} picker={picker} />
      )}
      {stage === 'idle' && shell.albumOpen && (
        <StickerAlbum profileId={config.profileId} packs={packs} audio={audio} onClose={() => shell.setAlbumOpen(false)} />
      )}
    </KidFrame>
  );
}
