import { useEffect, useMemo, useRef, useState } from 'react';
import { audioEngine } from '../../audio/audioEngine';
import { ClipResolver, type SharedLine } from '../../audio/clips';
import { GameAudio } from '../../audio/gameAudio';
import type { Lang } from '../../content/types';
import type { RealThing } from '../../content/realThings';
import { useI18n } from '../../i18n/I18n';
import { choosePictures } from './layout';
import { Mascot } from './Mascot';
import { Burst } from './OptionGrid';

/** The picture stays big for a moment after the tick, before the end screen comes back. */
const CELEBRATE_MS = 1100;
const NAME_MAX_MS = 2600;

export interface FindRealAsk {
  thing: RealThing;
  line: SharedLine | undefined;
  languages: readonly Lang[];
}

/**
 * After a game, once a sitting: Bunny asks her to go and find the real thing ("Can you find a real…
 * ball?"). The grown-up ticks when she brings it or points at it, or skips.
 */
export function FindReal({ ask, onDone }: { ask: FindRealAsk; onDone: (found: boolean) => void }) {
  const { t } = useI18n();
  const { thing, line, languages } = ask;
  const [found, setFound] = useState(false);
  const busy = useRef(false);
  const picture = useMemo(() => choosePictures([thing.item], () => 0)[thing.item.key], [thing]);
  const audio = useMemo(
    () => new GameAudio(audioEngine, new ClipResolver(thing.pack, languages), { mode: 'NAME_ONLY', repeatIntervalSec: 6, random: Math.random }),
    [thing, languages],
  );
  const say = () => {
    const r = audio.resolver;
    void audio.askLoop(r.spoken.flatMap((l) => [...r.line(line, l), r.nameIn(thing.item, l)]), 2);
  };

  useEffect(() => {
    say();
    return () => audio.stop();
  }, []);

  const tick = () => {
    if (busy.current) return;
    busy.current = true;
    setFound(true);
    void Promise.all([
      new Promise((resolve) => window.setTimeout(resolve, CELEBRATE_MS)),
      Promise.race([audio.say(audio.resolver.names(thing.item)), new Promise((resolve) => window.setTimeout(resolve, NAME_MAX_MS))]),
    ]).then(() => onDone(true));
  };
  const skip = () => {
    if (busy.current) return;
    busy.current = true;
    audio.stop();
    onDone(false);
  };

  return (
    <div className="find-real" onPointerDown={(e) => e.stopPropagation()}>
      <Mascot mood="think" className="find-real-bunny" />
      <button
        type="button"
        className={`option point-card find-real-card${found ? ' celebrate alive-bounce' : ''}`}
        tabIndex={-1}
        aria-hidden="true"
        onPointerDown={() => {
          if (!busy.current) say();
        }}
      >
        <img src={picture} alt="" draggable={false} />
        {found && <Burst size={240} quiet />}
      </button>
      <div className="point-actions">
        <button type="button" className="point-skip" aria-label={t('pointSkip')} onClick={skip}>
          <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5.5l8 6.5-8 6.5zM14 5.5l7 6.5-7 6.5z" fill="currentColor" />
          </svg>
        </button>
        <button type="button" className="point-found" aria-label={t('pointFound')} onClick={tick}>
          <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
