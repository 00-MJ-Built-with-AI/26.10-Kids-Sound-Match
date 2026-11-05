import { useEffect, useState } from 'react';
import { startAmbient, type Ambient } from '../../audio/synth';
import { letScreenSleep } from '../../lock/kidLock';
import { KidFrame } from './KidFrame';
import type { KidConfig } from './kidSnapshot';
import { clearKidSnapshot } from './kidSnapshot';
import { Mascot } from './Mascot';

/**
 * The sleep light's scene: a softly glowing moon with the bunny asleep on it, twinkling stars, and
 * rain, waves or the lullaby. The screen darkens slowly over the last third of the time; at the
 * end the sound fades out, the screen goes dark and the phone may turn it off.
 */
export function SleepScene({ sound, minutes }: { sound: Ambient; minutes: number }) {
  const [dim, setDim] = useState(0);
  const [over, setOver] = useState(false);
  useEffect(() => {
    const stop = startAmbient(sound);
    const total = minutes * 60_000;
    const began = Date.now();
    const tick = window.setInterval(() => {
      const t = (Date.now() - began) / total;
      // Bright for the first two thirds, then slowly darker.
      setDim(Math.max(0, Math.min(1, (t - 2 / 3) * 3)));
      if (t >= 1) {
        window.clearInterval(tick);
        stop(20);
        setOver(true);
        letScreenSleep();
      }
    }, 5000);
    return () => {
      window.clearInterval(tick);
      stop(1);
    };
  }, [sound, minutes]);
  return (
    <div className="sleep-light" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          className="sleep-star"
          style={{ left: `${(i * 37 + 7) % 96}%`, top: `${(i * 23 + 5) % 60}%`, animationDelay: `${(i % 7) * 0.6}s`, fontSize: `${10 + (i % 3) * 6}px` }}
        >
          ✦
        </span>
      ))}
      <div className="sleep-moon">
        <span className="sleep-glow" />
        <span className="sleep-moon-face">
          <svg viewBox="-60 -60 120 120">
            <circle r="56" fill="#FFE9A8" />
            <path d="M-30 -2 q10 9 20 0 M10 -2 q10 9 20 0" fill="none" stroke="#5A3B2B" strokeWidth="4" strokeLinecap="round" />
            <path d="M-8 20 q8 6 16 0" fill="none" stroke="#5A3B2B" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="-34" cy="14" rx="9" ry="5" fill="#FF8FA3" opacity="0.6" />
            <ellipse cx="34" cy="14" rx="9" ry="5" fill="#FF8FA3" opacity="0.6" />
          </svg>
        </span>
        <span className="sleep-bunny">
          <Mascot mood="sleep" />
        </span>
      </div>
      <span className="sleep-dim" style={{ opacity: over ? 1 : dim * 0.85 }} />
    </div>
  );
}

/** The sleep light on its own, from Home: locked like a game, left with the corner and the PIN. */
export function KidSleep({ config, onExit }: { config: KidConfig; onExit: () => void }) {
  const sleep = config.sleep ?? { sound: 'rain' as const, minutes: 20 };
  return (
    <KidFrame
      stage="sleep"
      onGateOpen={() => undefined}
      onGateCancel={() => undefined}
      onExit={() => {
        clearKidSnapshot();
        onExit();
      }}
    >
      <SleepScene sound={sleep.sound} minutes={sleep.minutes} />
    </KidFrame>
  );
}
