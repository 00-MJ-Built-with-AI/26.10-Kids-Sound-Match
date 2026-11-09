import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { cheer } from './Mascot';
import type { LocalizedText } from '../../content/types';
import { CardNames } from './CardNames';
import { lookBox, lookNow } from '../theme/looks';
import { fitSquares, layoutRows, useBoxSize } from './layout';

interface Props {
  options: readonly string[];
  pictures: Readonly<Record<string, string>>;
  faded: readonly string[];
  celebratedKey: string | null;
  /** Gentle hint: this picture wiggles. The pulse number restarts the wiggle each time. */
  hint: { key: string; pulse: number } | null;
  /** The names to show on each picture; none when the names are switched off. */
  names?: Readonly<Record<string, LocalizedText>>;
  /** How the right answer comes alive (see aliveMotion). */
  aliveFor?: (key: string) => string;
  onTap: (key: string) => void;
}

/**
 * The little moment a right answer comes alive, by the pack its picture comes from: animals hop,
 * vehicles drive off and come back, food is munched, weather floats up, instruments shake, toys
 * bounce, people wave. Stopped when the phone asks for less motion.
 */
export function aliveMotion(packId: string): string {
  switch (packId) {
    case 'animals':
    case 'animal-babies':
    case 'where-lives':
      return 'alive-hop';
    case 'vehicles':
      return 'alive-drive';
    case 'food':
    case 'who-eats-what':
      return 'alive-munch';
    case 'weather':
      return 'alive-float';
    case 'instruments':
      return 'alive-shake';
    case 'toys':
    case 'first-words':
    case 'home':
    case 'clothes':
      return 'alive-bounce';
    case 'family':
    case 'jobs':
    case 'body':
    case 'feelings':
    case 'actions':
      return 'alive-wave';
    default:
      return 'alive-spin';
  }
}

export function OptionGrid({ options, pictures, faded, celebratedKey, hint, names, aliveFor, onTap }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const box = useBoxSize(ref);
  // Puffy toys: up to four pictures are wide bars, one under the other.
  const bars = lookNow() === 'puffy' && options.length <= 4 && box.w <= box.h;
  const rows = bars ? options.map((_, i) => [i]) : layoutRows(options.length, box.w > box.h ? 'landscape' : 'portrait');
  // The new looks keep clear of the screen's edge; the original look stays exactly as it was.
  const { size, gap } = fitSquares(lookBox(box), rows);
  const barHeight = Math.min(Math.floor((box.h - 28 - gap * (rows.length - 1)) / rows.length), Math.round(box.w * 0.42));

  return (
    <div className="kid-grid" ref={ref} style={{ gap }}>
      {size > 0 &&
        rows.map((row, r) => (
          <div className="kid-row" key={r} style={{ gap }}>
            {row.map((i) => {
              const key = options[i];
              let state = '';
              if (celebratedKey === key) state = ` celebrate ${aliveFor?.(key) ?? ''}`;
              else if (faded.includes(key)) state = ' faded';
              else if (celebratedKey) state = ' resting';
              else if (hint?.key === key) state = hint.pulse % 2 ? ' hint-a' : ' hint-b';
              return (
                <button
                  type="button"
                  key={key}
                  className={`option${bars ? ' bar' : ''}${names?.[key] ? ' named' : ''}${state}`}
                  style={bars ? { width: Math.min(box.w - 32, 640), height: barHeight } : { width: size, height: size }}
                  data-key={key}
                  tabIndex={-1}
                  aria-hidden="true"
                  onPointerDown={() => onTap(key)}
                >
                  <img src={pictures[key]} alt="" draggable={false} />
                  {names?.[key] && <CardNames name={names[key]} />}
                  {celebratedKey === key && <Burst size={size} />}
                </button>
              );
            })}
          </div>
        ))}
    </div>
  );
}

const BURST_COLORS = ['#FFB703', '#FB8500', '#8ECAE6', '#219EBC', '#90BE6D', '#F28482', '#CDB4DB'];

/** A little confetti pop around the right picture. No text, no score. */
/** Celebration styles, picked at random so a right answer is a little surprise each time. */
const BURST_KINDS = ['confetti', 'stars', 'hearts', 'bubbles'] as const;
type BurstKind = (typeof BURST_KINDS)[number];
const STAR = 'M12 1.5l3 7 7.5.6-5.7 4.9 1.8 7.4L12 17.5 5.4 21.4l1.8-7.4L1.5 9.1 9 8.5z';
const HEART = 'M12 21C3 15 1 9.5 4.2 6.2 6.6 3.8 10 4.6 12 7.4c2-2.8 5.4-3.6 7.8-1.2C23 9.5 21 15 12 21z';

export function Burst({ size, kind, quiet }: { size: number; kind?: BurstKind; /** No bunny popping in (the game has its own). */ quiet?: boolean }) {
  const style = useMemo(() => kind ?? BURST_KINDS[Math.floor(Math.random() * BURST_KINDS.length)], [kind]);
  // The bunny pops in to cheer (Kid Mode's frame shows it).
  useEffect(() => {
    if (!quiet) cheer();
  }, []);
  const pieces = useMemo(
    () =>
      Array.from({ length: style === 'confetti' ? 16 : 10 }, (_, i) => {
        const angle = (i / (style === 'confetti' ? 16 : 10)) * Math.PI * 2 + Math.random() * 0.35;
        const distance = size * (0.55 + Math.random() * 0.25);
        return {
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance - (style === 'bubbles' ? size * 0.3 : 0),
          rot: Math.round(Math.random() * 540 - 270),
          color: BURST_COLORS[i % BURST_COLORS.length],
          delay: Math.round(Math.random() * 90),
          round: i % 3 === 0,
          scale: 0.8 + Math.random() * 0.6,
        };
      }),
    [size, style],
  );
  return (
    <span className={`burst burst-${style}`} aria-hidden="true">
      {pieces.map((p, i) => {
        const vars = { '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`, '--s': p.scale, animationDelay: `${p.delay}ms` } as CSSProperties;
        if (style === 'confetti') return <i key={i} className={p.round ? 'round' : undefined} style={{ ...vars, background: p.color }} />;
        if (style === 'bubbles') return <i key={i} className="bub" style={vars} />;
        return (
          <svg key={i} className="shape" viewBox="0 0 24 24" style={vars}>
            <path d={style === 'stars' ? STAR : HEART} fill={style === 'hearts' ? (i % 2 ? '#FF8FA3' : '#F05A8C') : i % 2 ? '#FFC531' : '#FFE08A'} />
          </svg>
        );
      })}
    </span>
  );
}
