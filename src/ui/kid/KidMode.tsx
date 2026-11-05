import { useEffect } from 'react';
import type { LoadedPack } from '../../content/types';
import type { PickerOptions } from './EndScreen';
import { sceneFor } from './sceneMap';
import { KidBook } from './KidBook';
import { KidStory } from './KidStory';
import { KidPaint } from './KidPaint';
import { KidMusic } from './KidMusic';
import { KidHide } from './KidHide';
import { KidSleep } from './KidSleep';
import { KidCare } from './KidCare';
import { KidExplore } from './KidExplore';
import { KidGame } from './KidGame';
import { KidMemory } from './KidMemory';
import { KidPeekaboo } from './KidPeekaboo';
import { KidPoint } from './KidPoint';
import { KidBubbles, KidSing, KidTidy } from './KidPlay';
import { KidFeel, KidOpposites, KidPuzzle, KidShapes } from './KidMore';
import { KidScene } from './KidScene';
import { KidBig, KidCount, KidMissing } from './KidSmall';
import type { KidConfig, KidSnapshot } from './kidSnapshot';

interface Props {
  pack: LoadedPack;
  /** Every pack, for the sticker album (and the scenes, which take things from several). */
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  telemetryEnabled: boolean;
  /** The end screen's quick picker (another pack, group or game). */
  picker?: PickerOptions;
  onExit: () => void;
}

/**
 * Kid Mode: the question game (also Odd one out, and taking turns), Explore, Memory, Peekaboo, a
 * scene, Where's your nose?, Do it with me, Talk time, her picture book or Look after the baby.
 */
export function KidMode(props: Props) {
  const { pack, packs, config, snapshot, picker, onExit } = props;
  // The game's scene, as a CSS variable the frame's background uses.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--scene', `url("${import.meta.env.BASE_URL}backgrounds/${sceneFor(config.packId)}.svg")`);
    root.setAttribute('data-scene', sceneFor(config.packId));
    return () => {
      root.style.removeProperty('--scene');
      root.removeAttribute('data-scene');
    };
  }, [config.packId]);
  switch (config.kind) {
    case 'explore':
      return <KidExplore pack={pack} config={config} snapshot={snapshot} onExit={onExit} />;
    case 'memory':
      return <KidMemory pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'peekaboo':
      return (
        <KidPeekaboo
          pack={pack}
          packs={packs}
          config={config}
          snapshot={snapshot}
          // "بَخ!" lives with the shared game lines, whichever pack is being played.
          lines={pack.feedback.peekaboo ?? packs.find((p) => p.feedback.peekaboo)?.feedback.peekaboo}
          picker={picker}
          onExit={onExit}
        />
      );
    case 'scene':
      return <KidScene pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'feel':
      return <KidFeel pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'opposites':
      return <KidOpposites pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'puzzle':
      return <KidPuzzle pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'shapes':
      return <KidShapes pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'book':
    case 'bedtime':
      return <KidBook packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'care':
      return <KidCare pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'big':
      return <KidBig pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'missing':
      return <KidMissing pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'count':
      return <KidCount pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'paint':
      return <KidPaint pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'music':
      return <KidMusic pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'hide':
      return <KidHide pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'sleep':
      return <KidSleep config={config} onExit={onExit} />;
    case 'story':
      return <KidStory pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'bubbles':
      return <KidBubbles pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'tidy':
      return <KidTidy pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'sing':
      return <KidSing pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    case 'point':
    case 'actions':
    case 'talk':
    case 'sounds':
    case 'hunt':
      return <KidPoint pack={pack} packs={packs} config={config} snapshot={snapshot} picker={picker} onExit={onExit} />;
    default:
      return <KidGame {...props} />;
  }
}
