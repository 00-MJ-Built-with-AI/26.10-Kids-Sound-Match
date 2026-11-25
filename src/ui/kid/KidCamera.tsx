import { useMemo, useRef, useState } from 'react';
import { COCO_WORDS, wordForCoco, type SeenThing } from '../../camera/cocoWords';
import { useCamera } from '../../camera/useCamera';
import type { LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { Mascot } from './Mascot';
import { Burst } from './OptionGrid';
import { questionDone } from './sitting';
import { ShellFrame, useKidShell } from './useKidShell';

/** Things named before the game says well done. */
export const CAMERA_THINGS = 8;
/** The same thing isn't named again within this long. */
const AGAIN_AFTER_MS = 6000;

/**
 * What's this?: she points the phone at things around her and Bunny names them ("كاسة! Cup!"),
 * with the word's picture. It speaks only when sure, and only for words in her app. The model runs
 * on the phone; no picture leaves it.
 */
export function KidCamera(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { t } = useI18n();
  const { packs } = props;
  const [seen, setSeen] = useState<{ thing: SeenThing; n: number } | null>(null);
  const [count, setCount] = useState(0);
  const said = useRef(new Map<string, number>());
  const shell = useKidShell({ ...props, onStart: () => setCount(0) });
  const playing = shell.stage === 'playing';

  const { videoRef, state, boxes } = useCamera(playing, (name) => {
    if (!shell.canPlay()) return;
    const thing = wordForCoco(name, packs);
    if (!thing) return;
    const last = said.current.get(thing.item.key) ?? 0;
    if (Date.now() - last < AGAIN_AFTER_MS) return;
    said.current.set(thing.item.key, Date.now());
    setSeen({ thing, n: Date.now() });
    void shell.audio.say(shell.audio.resolver.names(thing.item));
    questionDone();
    setCount((c) => {
      const next = c + 1;
      if (next >= CAMERA_THINGS) window.setTimeout(() => shell.alive.current && shell.stageRef.current === 'playing' && shell.finish(), 2500);
      return next;
    });
  });
  const picture = useMemo(() => (seen ? choosePictures([seen.thing.item], () => 0)[seen.thing.item.key] : ''), [seen]);

  return (
    <ShellFrame shell={shell} kind="camera" {...props}>
      <div className="camera">
        <div className="camera-view">
          <video ref={videoRef} className="camera-video" playsInline muted />
          {boxes
            .filter((b) => COCO_WORDS[b.name])
            .map((b, i) => (
              <span key={i} className="camera-box" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }} />
            ))}
          {state !== 'ready' && (
            <div className="camera-wait">
              <Mascot mood="think" />
              <p>{state === 'denied' ? t('cameraDenied') : state === 'failed' ? t('cameraFailed') : t('cameraLoading')}</p>
            </div>
          )}
          {seen && (
            <div key={seen.n} className="camera-seen">
              <span className="camera-card">
                <img src={picture} alt="" draggable={false} />
                <Burst size={200} quiet />
              </span>
            </div>
          )}
        </div>
        <div className="book-dots hide-dots" aria-hidden="true">
          {Array.from({ length: CAMERA_THINGS }, (_, i) => (
            <span key={i} className={i < count ? 'on' : ''} />
          ))}
        </div>
      </div>
    </ShellFrame>
  );
}
