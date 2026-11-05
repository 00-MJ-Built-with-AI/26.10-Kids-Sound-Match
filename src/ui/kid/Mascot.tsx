import { useEffect, useState } from 'react';

/** What the bunny is doing. */
export type MascotMood = 'wave' | 'cheer' | 'sleep' | 'think';

const INK = '#5A3B2B';
const FUR = '#FFF8F2';
const PINK = '#FFB3C6';
const o = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

/**
 * Bunny, the app's little friend: waves on Home, jumps and cheers on a right answer, holds a star
 * at the end of a game, and sleeps in a nightcap at bedtime. Drawn here so it can move.
 */
export function Mascot({ mood = 'wave', className = '' }: { mood?: MascotMood; className?: string }) {
  const sleep = mood === 'sleep';
  const cheer = mood === 'cheer';
  return (
    <svg className={`mascot mascot-${mood} ${className}`} viewBox="0 0 200 220" aria-hidden="true">
      <ellipse cx="100" cy="212" rx="54" ry="8" fill="#000" opacity="0.08" className="mascot-shadow" />
      <g className="mascot-body">
        {/* ears */}
        <g className="mascot-ears">
          <path d="M70 70 C52 10 66 -4 80 4 C94 12 92 44 88 70 Z" fill={FUR} {...o} />
          <path d="M74 60 C66 26 72 16 79 20 C86 24 85 44 83 60 Z" fill={PINK} />
          <path d="M130 70 C148 10 134 -4 120 4 C106 12 108 44 112 70 Z" fill={FUR} {...o} className="mascot-ear-r" />
          <path d="M126 60 C134 26 128 16 121 20 C114 24 115 44 117 60 Z" fill={PINK} className="mascot-ear-r" />
        </g>
        {/* body and feet */}
        <path d="M58 176 C52 130 70 112 100 112 C130 112 148 130 142 176 C138 200 62 200 58 176 Z" fill={FUR} {...o} />
        <ellipse cx="100" cy="166" rx="26" ry="22" fill="#FFE6EE" />
        <ellipse cx="74" cy="198" rx="20" ry="11" fill={FUR} {...o} />
        <ellipse cx="126" cy="198" rx="20" ry="11" fill={FUR} {...o} />
        {/* arms */}
        {cheer ? (
          <>
            <path d="M64 138 L40 100" {...o} strokeWidth="22" />
            <path d="M64 138 L40 100" stroke={FUR} strokeWidth="13" strokeLinecap="round" />
            <path d="M136 138 L160 100" {...o} strokeWidth="22" />
            <path d="M136 138 L160 100" stroke={FUR} strokeWidth="13" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M66 140 L56 168" {...o} strokeWidth="22" />
            <path d="M66 140 L56 168" stroke={FUR} strokeWidth="13" strokeLinecap="round" />
            <g className={mood === 'wave' ? 'mascot-wave' : undefined}>
              <path d={mood === 'wave' ? 'M134 140 L160 112' : 'M134 140 L144 168'} {...o} strokeWidth="22" />
              <path d={mood === 'wave' ? 'M134 140 L160 112' : 'M134 140 L144 168'} stroke={FUR} strokeWidth="13" strokeLinecap="round" />
            </g>
          </>
        )}
        {/* head */}
        <g className="mascot-head">
          <ellipse cx="100" cy="92" rx="52" ry="46" fill={FUR} {...o} />
          <ellipse cx="72" cy="104" rx="11" ry="7" fill={PINK} opacity="0.8" />
          <ellipse cx="128" cy="104" rx="11" ry="7" fill={PINK} opacity="0.8" />
          {sleep ? (
            <path d="M74 90 q8 7 16 0 M110 90 q8 7 16 0" fill="none" {...o} strokeWidth="4" />
          ) : cheer ? (
            <path d="M74 92 q8 -9 16 0 M110 92 q8 -9 16 0" fill="none" {...o} strokeWidth="4" />
          ) : (
            <g className="mascot-eyes">
              <ellipse cx="82" cy="88" rx="8" ry="10" fill="#3A2418" />
              <ellipse cx="118" cy="88" rx="8" ry="10" fill="#3A2418" />
              <circle cx="85" cy="84" r="3.4" fill="#fff" />
              <circle cx="121" cy="84" r="3.4" fill="#fff" />
              <circle cx="80" cy="92" r="1.6" fill="#fff" />
              <circle cx="116" cy="92" r="1.6" fill="#fff" />
            </g>
          )}
          <path d="M96 100 q4 4 8 0 q-4 -3 -8 0 Z" fill="#F07B95" stroke={INK} strokeWidth="2.5" />
          {cheer ? (
            <path d="M88 108 Q100 124 112 108 Z" fill="#8A2B1E" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          ) : (
            <path d="M92 108 q8 6 16 0" fill="none" {...o} strokeWidth="3.5" />
          )}
          {sleep && (
            <g>
              <path d="M54 66 C60 30 120 22 150 52 L168 40 L150 72 C120 54 80 56 54 66 Z" fill="#7A6FD8" {...o} />
              <circle cx="170" cy="38" r="10" fill="#fff" {...o} strokeWidth="3" />
            </g>
          )}
        </g>
        {cheer && (
          <g className="mascot-stars">
            <path d="M34 80 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" fill="#FFC531" />
            <path d="M168 80 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" fill="#FF8FA3" />
          </g>
        )}
      </g>
      {sleep && (
        <g className="mascot-zzz" fill="none" stroke="#7A86C8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M160 70 h14 l-14 16 h14" />
          <path d="M176 44 h10 l-10 12 h10" />
        </g>
      )}
    </svg>
  );
}

/** Ask the bunny to pop up and cheer (on a right answer). */
export function cheer(): void {
  window.dispatchEvent(new Event('ksm-cheer'));
}

/**
 * The bunny peeking in from a bottom corner to cheer for a moment whenever `cheer()` is called. Lives in
 * Kid Mode's frame, so every game gets it.
 */
export function MascotCheer() {
  const [n, setN] = useState(0);
  const [side, setSide] = useState<'left' | 'right'>('right');
  useEffect(() => {
    let last = 0;
    const on = () => {
      // Not on every single tap in a fast game: at most every 1.5 s.
      const now = performance.now();
      if (now - last < 1500) return;
      last = now;
      setSide(Math.random() < 0.5 ? 'left' : 'right');
      setN((x) => x + 1);
    };
    window.addEventListener('ksm-cheer', on);
    return () => window.removeEventListener('ksm-cheer', on);
  }, []);
  if (!n) return null;
  return (
    <div key={n} className={`mascot-cheer ${side}`} aria-hidden="true">
      <Mascot mood="cheer" />
    </div>
  );
}
