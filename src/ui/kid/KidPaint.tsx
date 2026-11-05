import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { findLine } from '../../audio/clips';
import type { LoadedPack } from '../../content/types';
import { newId } from '../../custom/types';
import { paintingStore } from '../../settings/paintings';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { Burst } from './OptionGrid';
import { questionDone } from './sitting';
import { ShellFrame, useKidShell } from './useKidShell';

/** The paints: a colour from the Colours pack (so its name is said), and the magic rainbow. */
export const PAINTS: { key: string; hex: string }[] = [
  { key: 'color_red', hex: '#F0453C' },
  { key: 'color_yellow', hex: '#FFD23F' },
  { key: 'color_blue', hex: '#3D8BFD' },
  { key: 'color_green', hex: '#3CC47C' },
  { key: 'color_orange', hex: '#FF9A3C' },
  { key: 'color_purple', hex: '#9B6BF2' },
  { key: 'color_pink', hex: '#FF7EB6' },
  { key: 'color_brown', hex: '#9A6338' },
];
const RAINBOW = 'rainbow';
/** A sparkle every so many pixels of painting. */
const SPARKLE_EVERY = 70;
/** Her colour's name again when she starts painting, at most this often. */
const SAY_AGAIN_MS = 6000;
/** After this many pages the game ends by itself (each page is saved). */
const PAGES = 4;

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
}

/**
 * Finger painting: she paints with her finger on a big white page, in thick soft strokes that
 * sparkle as she goes. Each colour says its name when she picks it ("أحمر! Red!"); the rainbow
 * paint changes colour as she paints. A new page saves the one before; the star saves it and ends.
 * Her paintings are kept on this phone for the parent (the Report, and the week's picture).
 */
export function KidPaint(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { pack, packs, config } = props;
  const paints = useMemo(() => PAINTS.filter((p) => pack.items.some((i) => i.key === p.key)), [pack]);
  const line = useMemo(() => findLine(packs, 'paint'), [packs]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const [paint, setPaint] = useState<string>(paints[0]?.key ?? RAINBOW);
  const paintRef = useRef(paint);
  paintRef.current = paint;
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [wipe, setWipe] = useState(0);
  const [burst, setBurst] = useState(0);
  const strokes = useRef(0);
  const pages = useRef(0);
  const hue = useRef(0);
  const lastSaid = useRef(0);
  const nextSparkle = useRef(1);
  const pointers = useRef(new Map<number, { x: number; y: number; travelled: number }>());

  const say = (key: string) => {
    const item = pack.items.find((i) => i.key === key);
    if (!item || !shell.canPlay()) return;
    lastSaid.current = Date.now();
    void shell.audio.say(shell.audio.resolver.names(item));
  };
  const clear = () => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    strokes.current = 0;
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      pages.current = 0;
      clear();
      if (line) void shell.audio.say(shell.audio.resolver.line(line));
    },
  });

  // The page fills its area, sharp on any screen; a turned phone keeps what was painted.
  useEffect(() => {
    const c = canvas.current;
    const box = area.current;
    if (!c || !box) return;
    const fit = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(box.clientWidth * ratio);
      const h = Math.round(box.clientHeight * ratio);
      if (!w || !h || (c.width === w && c.height === h)) return;
      const old = document.createElement('canvas');
      old.width = c.width;
      old.height = c.height;
      if (c.width && c.height) old.getContext('2d')!.drawImage(c, 0, 0);
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      if (old.width) ctx.drawImage(old, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [shell.stage]);

  const colourNow = () => {
    if (paintRef.current !== RAINBOW) return PAINTS.find((p) => p.key === paintRef.current)!.hex;
    hue.current = (hue.current + 4) % 360;
    return `hsl(${hue.current} 90% 58%)`;
  };
  const at = (e: ReactPointerEvent) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height, sx: e.clientX - r.left, sy: e.clientY - r.top };
  };
  const brush = () => Math.max(14, Math.min(canvas.current!.width, canvas.current!.height) * 0.04);

  const down = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!shell.canPlay()) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic taps */
    }
    const p = at(e);
    const ctx = canvas.current!.getContext('2d')!;
    ctx.fillStyle = colourNow();
    ctx.beginPath();
    ctx.arc(p.x, p.y, brush() / 2, 0, Math.PI * 2);
    ctx.fill();
    pointers.current.set(e.pointerId, { x: p.x, y: p.y, travelled: 0 });
    strokes.current++;
    if (paintRef.current !== RAINBOW && Date.now() - lastSaid.current > SAY_AGAIN_MS) say(paintRef.current);
  };
  const move = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const last = pointers.current.get(e.pointerId);
    if (!last || !shell.canPlay()) return;
    const p = at(e);
    const ctx = canvas.current!.getContext('2d')!;
    const colour = colourNow();
    ctx.strokeStyle = colour;
    ctx.lineWidth = brush();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    const travelled = last.travelled + Math.hypot(p.x - last.x, p.y - last.y);
    if (travelled > SPARKLE_EVERY * (window.devicePixelRatio || 1)) {
      const id = nextSparkle.current++;
      setSparkles((list) => [...list.slice(-12), { id, x: p.sx, y: p.sy, color: colour }]);
      window.setTimeout(() => setSparkles((list) => list.filter((s) => s.id !== id)), 800);
      pointers.current.set(e.pointerId, { x: p.x, y: p.y, travelled: 0 });
    } else pointers.current.set(e.pointerId, { x: p.x, y: p.y, travelled });
  };
  const up = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
  };

  /** Keeps the page in her paintings, if she painted on it (a picture at most 900 px wide). */
  const save = async () => {
    const c = canvas.current;
    if (!c || strokes.current < 2) return;
    const scale = Math.min(1, 900 / c.width);
    const out = document.createElement('canvas');
    out.width = Math.round(c.width * scale);
    out.height = Math.round(c.height * scale);
    out.getContext('2d')!.drawImage(c, 0, 0, out.width, out.height);
    const blob = await new Promise<Blob | null>((r) => out.toBlob(r, 'image/jpeg', 0.85));
    if (blob) await paintingStore.add({ id: newId(), profileId: config.profileId, blob, at: Date.now() });
  };
  const newPage = () => {
    if (!shell.canPlay()) return;
    void save();
    pages.current++;
    questionDone();
    setWipe((n) => n + 1);
    window.setTimeout(clear, 250);
    if (pages.current >= PAGES) finish();
  };
  const finish = () => {
    if (!shell.canPlay()) return;
    void save();
    setBurst((n) => n + 1);
    questionDone();
    window.setTimeout(() => {
      if (shell.alive.current && shell.stageRef.current === 'playing') shell.finish();
    }, 1400);
  };

  return (
    <ShellFrame
      shell={shell}
      kind="paint"
      {...props}
      left={
        <button type="button" className="paint-new" aria-label="new page" onClick={newPage}>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M10 5h14l8 8v22H10z" fill="#fff" stroke="#5A3B2B" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M24 5v8h8" fill="none" stroke="#5A3B2B" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M21 19v10M16 24h10" stroke="#F05A8C" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
      }
    >
      <div className="paint">
        <div className="paint-page" ref={area}>
          <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
          {wipe > 0 && <span key={wipe} className="paint-wipe" aria-hidden="true" />}
          {sparkles.map((s) => (
            <span key={s.id} className="paint-sparkle" style={{ left: s.x, top: s.y, color: s.color }} aria-hidden="true">
              ✦
            </span>
          ))}
          {burst > 0 && (
            <span className="paint-burst" key={burst}>
              <Burst size={160} kind="stars" />
            </span>
          )}
        </div>
        <div className="paint-palette">
          {paints.map((p) => (
            <button
              type="button"
              key={p.key}
              className={`paint-swatch${paint === p.key ? ' on' : ''}`}
              style={{ background: p.hex }}
              aria-label={pack.items.find((i) => i.key === p.key)?.name.en}
              onClick={() => {
                setPaint(p.key);
                say(p.key);
              }}
            />
          ))}
          <button
            type="button"
            className={`paint-swatch rainbow${paint === RAINBOW ? ' on' : ''}`}
            aria-label="rainbow"
            onClick={() => setPaint(RAINBOW)}
          />
          <button type="button" className="paint-done" aria-label="finished" onClick={finish}>
            ★
          </button>
        </div>
      </div>
    </ShellFrame>
  );
}
