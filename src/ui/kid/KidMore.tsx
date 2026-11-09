import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { findLine, type Clip } from '../../audio/clips';
import type { ArGender, LoadedItem, LoadedPack } from '../../content/types';
import { addFeeling } from '../../settings/plan';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { aliveMotion, Burst } from './OptionGrid';
import { questionDone } from './sitting';
import { ShellFrame, shuffle, sleep, useKidShell } from './useKidShell';

interface GameProps {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}

/* ================================================================ How do you feel? */

/** The faces she chooses from: the clearest feelings for a toddler. */
export const FEEL_CHOICES = ['happy', 'sad', 'angry', 'sleepy', 'scared', 'hungry'];

/**
 * How do you feel?: "كيف حاسّة اليوم؟" and six faces from Feelings. She taps one: it grows, its
 * name and sound play, and the check-in is kept (the Report shows how she felt this week).
 */
export function KidFeel(props: GameProps) {
  const { pack, packs, config } = props;
  const gender: ArGender = config.arGender ?? 'f';
  const faces = useMemo(() => FEEL_CHOICES.map((k) => pack.items.find((i) => i.key === k)).filter((i): i is LoadedItem => !!i), [pack]);
  const pictures = useMemo(() => choosePictures(faces), [faces]);
  const question = useMemo(() => findLine(packs, gender === 'm' ? 'feel_m' : 'feel_f'), [packs, gender]);
  const [chosen, setChosen] = useState<string | null>(null);
  const shell = useKidShell({
    ...props,
    onStart: () => {
      setChosen(null);
      shell.audio.preload(faces);
      if (shell.canPlay()) void shell.audio.askLoop(shell.audio.resolver.line(question));
    },
    onResume: () => {
      if (!chosen) void shell.audio.askLoop(shell.audio.resolver.line(question));
    },
  });
  const pick = (it: LoadedItem) => {
    if (chosen || !shell.canPlay()) return;
    setChosen(it.key);
    addFeeling(config.profileId, it.key);
    void (async () => {
      await Promise.all([shell.audio.say([...shell.audio.resolver.names(it), shell.audio.resolver.sound(it)]), sleep(2200)]);
      if (shell.alive.current && shell.stageRef.current === 'playing') {
        questionDone();
        shell.finish();
      }
    })();
  };
  return (
    <ShellFrame shell={shell} kind="feel" {...props}>
      <div className={`feel-grid${chosen ? ' chosen' : ''}`}>
        {faces.map((it, i) => (
          <button
            type="button"
            key={it.key}
            className={`feel-face${chosen === it.key ? ' on' : chosen ? ' off' : ''}`}
            style={{ animationDelay: `${i * 0.08}s` }}
            tabIndex={-1}
            aria-hidden="true"
            onPointerDown={() => pick(it)}
          >
            <img src={pictures[it.key]} alt="" draggable={false} />
            {chosen === it.key && <Burst size={200} />}
          </button>
        ))}
      </div>
    </ShellFrame>
  );
}

/* ================================================================ Opposites */

/**
 * Opposites: a pair side by side (hot and cold, open and closed, up and down, full and empty, day and
 * night): "وين السخن؟" She taps it; a wrong tap gets the soft tone and the question again.
 */
export function KidOpposites(props: GameProps) {
  const { pack, config } = props;
  const gender: ArGender = config.arGender ?? 'f';
  const pairs = useMemo(
    () =>
      pack.groups
        .map((g) => g.items.map((k) => pack.items.find((i) => i.key === k)).filter((i): i is LoadedItem => !!i))
        .filter((p) => p.length === 2),
    [pack],
  );
  const pictures = useMemo(() => choosePictures(pack.items), [pack]);
  const rounds = Math.min(config.questionsPerSession, 10);
  const [round, setRound] = useState<{ pair: LoadedItem[]; want: number; n: number } | null>(null);
  const [state, setState] = useState<{ right: boolean; wrong: number | null }>({ right: false, wrong: null });
  const busy = useRef(false);
  const bag = useRef<LoadedItem[][]>([]);

  const question = (r = round): Clip[] => {
    if (!r) return [];
    const res = shell.audio.resolver;
    return res.spoken.map((l) => res.pointIn(r.pair[r.want], l, gender)).filter((c): c is Clip => c !== null);
  };
  const deal = (n: number) => {
    if (!bag.current.length) bag.current = shuffle(pairs);
    const pair = shuffle(bag.current.pop()!);
    const r = { pair, want: Math.random() < 0.5 ? 0 : 1, n };
    busy.current = false;
    setState({ right: false, wrong: null });
    setRound(r);
    shell.audio.preload(pair);
    if (shell.canPlay()) void shell.audio.askLoop(question(r));
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      bag.current = shuffle(pairs);
      deal(0);
    },
    onResume: () => {
      if (!busy.current) void shell.audio.askLoop(question());
    },
  });
  const tap = (i: number) => {
    if (!round || busy.current || !shell.canPlay()) return;
    busy.current = true;
    if (i !== round.want) {
      setState({ right: false, wrong: i });
      void shell.audio.say([shell.audio.resolver.incorrectTone(), ...question()]);
      void sleep(700).then(() => {
        busy.current = false;
        setState({ right: false, wrong: null });
      });
      return;
    }
    setState({ right: true, wrong: null });
    void shell.audio.say(shell.audio.resolver.names(round.pair[i]));
    void sleep(1400).then(() => {
      if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
      questionDone();
      if (round.n + 1 >= rounds) shell.finish();
      else deal(round.n + 1);
    });
  };
  return (
    <ShellFrame shell={shell} kind="opposites" {...props}>
      {round && (
        <div className="opp-area" key={round.n}>
          {round.pair.map((it, i) => (
            <button
              type="button"
              key={it.key}
              className={`opp-card${state.right && i === round.want ? ' celebrate alive-bounce' : ''}${state.wrong === i ? ' nope' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
              tabIndex={-1}
              aria-hidden="true"
              onPointerDown={() => tap(i)}
            >
              <img src={pictures[it.key]} alt="" draggable={false} />
              {state.right && i === round.want && <Burst size={220} />}
            </button>
          ))}
        </div>
      )}
    </ShellFrame>
  );
}

/* ================================================================ Puzzles */

interface Piece {
  /** Which part of the picture: its slot. */
  slot: number;
  /** Where it waits under the board, in % of the tray. */
  x: number;
}

/** Board layouts: how many columns and rows. 2 pieces side by side, then 3 strips, then 2 x 2. */
const LAYOUTS = [
  { cols: 2, rows: 1 },
  { cols: 3, rows: 1 },
  { cols: 2, rows: 2 },
];

/**
 * Puzzles: a picture cut into 2, then 3, then 4 pieces. The board shows the picture faintly; she drags
 * each piece onto its place (or taps a piece, then its place). A piece dropped near its place snaps in;
 * anywhere else it slides back. The finished picture comes alive and says its name.
 */
export function KidPuzzle(props: GameProps) {
  const { pack, packs, config } = props;
  const items = useMemo(() => pack.items.filter((i) => config.itemKeys.includes(i.key)), [pack, config]);
  const popLine = useMemo(() => findLine(packs, 'pop'), [packs]);
  const [round, setRound] = useState<{ item: LoadedItem; picture: string; n: number; pieces: Piece[] } | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [held, setHeld] = useState<{ slot: number; dx: number; dy: number } | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const drag = useRef<{ slot: number; x: number; y: number; moved: boolean } | null>(null);
  const bag = useRef<LoadedItem[]>([]);

  const deal = (n: number) => {
    if (!bag.current.length) bag.current = shuffle(items);
    const item = bag.current.pop()!;
    const { cols, rows } = LAYOUTS[n % LAYOUTS.length];
    const count = cols * rows;
    const xs = shuffle(Array.from({ length: count }, (_, i) => i));
    const chosen = choosePictures([item])[item.key];
    setRound({
      item,
      picture: item.images.find((a) => a.url === chosen)?.square ?? chosen,
      n,
      pieces: xs.map((slot, i) => ({ slot, x: (100 / count) * i + 50 / count })),
    });
    setPlaced([]);
    setDone(false);
    setPicked(null);
    shell.audio.preload([item]);
  };
  const shell = useKidShell({ ...props, onStart: () => deal(0) });

  const layout = round ? LAYOUTS[round.n % LAYOUTS.length] : LAYOUTS[0];
  const slotRect = (slot: number) => {
    const b = board.current!.getBoundingClientRect();
    const w = b.width / layout.cols;
    const h = b.height / layout.rows;
    const c = slot % layout.cols;
    const r = Math.floor(slot / layout.cols);
    return { left: b.left + c * w, top: b.top + r * h, w, h };
  };
  const place = (slot: number) => {
    if (!round) return;
    const now = [...placed, slot];
    setPlaced(now);
    setPicked(null);
    if (now.length < round.pieces.length) {
      void shell.audio.say(shell.audio.resolver.line(popLine).slice(0, 1));
      return;
    }
    setDone(true);
    void (async () => {
      await Promise.all([shell.audio.say(shell.audio.resolver.names(round.item)), sleep(1800)]);
      if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
      questionDone();
      if (round.n + 1 >= LAYOUTS.length) shell.finish();
      else deal(round.n + 1);
    })();
  };
  /** Dropped at (x, y): in its own place (or near enough)? */
  const fits = (slot: number, x: number, y: number) => {
    const r = slotRect(slot);
    const pad = Math.min(r.w, r.h) * 0.45;
    return x >= r.left - pad && x <= r.left + r.w + pad && y >= r.top - pad && y <= r.top + r.h + pad;
  };
  const wobble = () => void shell.audio.say([shell.audio.resolver.incorrectTone()]);

  const down = (p: Piece, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!shell.canPlay() || placed.includes(p.slot) || done) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // No live pointer (a synthetic tap): the drag still works without capture.
    }
    drag.current = { slot: p.slot, x: e.clientX, y: e.clientY, moved: false };
    setHeld({ slot: p.slot, dx: 0, dy: 0 });
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) > 12) d.moved = true;
    setHeld({ slot: d.slot, dx, dy });
  };
  const up = (p: Piece, e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    setHeld(null);
    if (!d || !shell.canPlay()) return;
    if (!d.moved) {
      setPicked(p.slot);
      return;
    }
    if (fits(p.slot, e.clientX, e.clientY)) place(p.slot);
    else wobble();
  };
  const tapBoard = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (picked === null || !shell.canPlay()) return;
    if (fits(picked, e.clientX, e.clientY)) place(picked);
    else {
      setPicked(null);
      wobble();
    }
  };

  const pieceStyle = (slot: number) => {
    const c = slot % layout.cols;
    const r = Math.floor(slot / layout.cols);
    return {
      backgroundImage: `url("${round!.picture}")`,
      backgroundSize: `${layout.cols * 100}% ${layout.rows * 100}%`,
      backgroundPosition: `${layout.cols > 1 ? (c / (layout.cols - 1)) * 100 : 0}% ${layout.rows > 1 ? (r / (layout.rows - 1)) * 100 : 0}%`,
    };
  };

  return (
    <ShellFrame shell={shell} kind="puzzle" {...props}>
      {round && (
        <div className="puzzle" key={round.n}>
          <div
            ref={board}
            className={`puzzle-board${done ? ` done ${aliveMotion(pack.id)}` : ''}`}
            style={{ gridTemplateColumns: `repeat(${layout.cols}, 1fr)`, gridTemplateRows: `repeat(${layout.rows}, 1fr)` }}
            onPointerDown={tapBoard}
          >
            <img className="puzzle-ghost" src={round.picture} alt="" draggable={false} />
            {Array.from({ length: layout.cols * layout.rows }, (_, slot) => (
              <span key={slot} className={`puzzle-slot${placed.includes(slot) ? ' filled' : ''}`} style={placed.includes(slot) ? pieceStyle(slot) : undefined} />
            ))}
            {done && <Burst size={300} />}
          </div>
          <div className="puzzle-tray">
            {round.pieces.map((p) => {
              const isHeld = held?.slot === p.slot;
              return (
                <button
                  type="button"
                  key={p.slot}
                  className={`puzzle-piece cols${layout.cols} rows${layout.rows}${isHeld ? ' held' : ''}${picked === p.slot ? ' picked' : ''}${placed.includes(p.slot) ? ' gone' : ''}`}
                  style={{ left: `${p.x}%`, ...pieceStyle(p.slot), transform: isHeld ? `translate(${held.dx}px, ${held.dy}px) scale(1.06)` : undefined }}
                  tabIndex={-1}
                  aria-hidden="true"
                  onPointerDown={(e) => down(p, e)}
                  onPointerMove={move}
                  onPointerUp={(e) => up(p, e)}
                  onPointerCancel={() => {
                    drag.current = null;
                    setHeld(null);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </ShellFrame>
  );
}

/* ================================================================ Shape sorter */

type ShapeId = 'circle' | 'square' | 'triangle' | 'star' | 'heart';
const SHAPE_PATHS: Record<ShapeId, string> = {
  circle: 'M50 8 A42 42 0 1 1 49.9 8 Z',
  square: 'M12 12 H88 V88 H12 Z',
  triangle: 'M50 8 L92 88 H8 Z',
  star: 'M50 6 L61 37 L94 38 L68 58 L77 90 L50 71 L23 90 L32 58 L6 38 L39 37 Z',
  heart: 'M50 88 C10 62 6 30 28 18 C40 12 50 22 50 30 C50 22 60 12 72 18 C94 30 90 62 50 88 Z',
};
const SHAPE_COLOURS: Record<ShapeId, string> = { circle: '#F05A8C', square: '#5B8DEF', triangle: '#F7C948', star: '#7ED0B5', heart: '#B48CF0' };
const SHAPE_ROUNDS: ShapeId[][] = [
  ['circle', 'square', 'triangle'],
  ['circle', 'star', 'heart'],
  ['square', 'triangle', 'star', 'heart'],
];

function Shape({ id, hole }: { id: ShapeId; hole?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path
        d={SHAPE_PATHS[id]}
        fill={hole ? '#5A3B2B' : SHAPE_COLOURS[id]}
        opacity={hole ? 0.75 : 1}
        stroke={hole ? 'none' : '#5A3B2B'}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {!hole && <circle cx="38" cy="34" r="6" fill="#fff" opacity="0.5" />}
    </svg>
  );
}

/**
 * Shape sorter: a box with holes, and shapes beside it. She drags each shape into its hole (or taps
 * the shape, then the hole); the shape drops in with its name. A wrong hole shakes. 3 rounds.
 */
export function KidShapes(props: GameProps) {
  const { pack } = props;
  const names = useMemo(() => new Map(pack.items.map((i) => [i.key.replace('shape_', ''), i])), [pack]);
  const [n, setN] = useState(0);
  const [order, setOrder] = useState<{ holes: ShapeId[]; pieces: ShapeId[] }>({ holes: [], pieces: [] });
  const [placed, setPlaced] = useState<ShapeId[]>([]);
  const [held, setHeld] = useState<{ id: ShapeId; dx: number; dy: number } | null>(null);
  const [picked, setPicked] = useState<ShapeId | null>(null);
  const [shake, setShake] = useState<ShapeId | null>(null);
  const holes = useRef<Partial<Record<ShapeId, HTMLDivElement | null>>>({});
  const drag = useRef<{ id: ShapeId; x: number; y: number; moved: boolean } | null>(null);

  const deal = (k: number) => {
    const set = SHAPE_ROUNDS[k % SHAPE_ROUNDS.length];
    setN(k);
    setOrder({ holes: shuffle(set), pieces: shuffle(set) });
    setPlaced([]);
    setPicked(null);
  };
  const shell = useKidShell({ ...props, onStart: () => deal(0) });
  const sayName = (id: ShapeId) => {
    const it = names.get(id);
    if (it) void shell.audio.say(shell.audio.resolver.names(it));
  };
  const holeAt = (x: number, y: number): ShapeId | null => {
    for (const id of order.holes) {
      const el = holes.current[id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const pad = r.width * 0.4;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return id;
    }
    return null;
  };
  const drop = (id: ShapeId, hole: ShapeId) => {
    if (hole !== id) {
      setShake(hole);
      void shell.audio.say([shell.audio.resolver.incorrectTone()]);
      window.setTimeout(() => setShake(null), 600);
      return;
    }
    const now = [...placed, id];
    setPlaced(now);
    setPicked(null);
    sayName(id);
    if (now.length >= order.pieces.length) {
      void sleep(1600).then(() => {
        if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
        questionDone();
        if (n + 1 >= SHAPE_ROUNDS.length) shell.finish();
        else deal(n + 1);
      });
    }
  };
  const down = (id: ShapeId, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!shell.canPlay() || placed.includes(id)) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // No live pointer (a synthetic tap): the drag still works without capture.
    }
    drag.current = { id, x: e.clientX, y: e.clientY, moved: false };
    setHeld({ id, dx: 0, dy: 0 });
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) > 12) d.moved = true;
    setHeld({ id: d.id, dx, dy });
  };
  const up = (id: ShapeId, e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    setHeld(null);
    if (!d || !shell.canPlay()) return;
    if (!d.moved) {
      setPicked(id);
      sayName(id);
      return;
    }
    const hole = holeAt(e.clientX, e.clientY);
    if (hole) drop(id, hole);
  };

  const allIn = placed.length >= order.pieces.length && order.pieces.length > 0;
  return (
    <ShellFrame shell={shell} kind="shapes" {...props}>
      <div className="sorter" key={n}>
        <div className={`sorter-box${allIn ? ' full' : ''}`}>
          {order.holes.map((id) => (
            <div
              key={id}
              ref={(el) => {
                holes.current[id] = el;
              }}
              className={`sorter-hole${shake === id ? ' nope' : ''}${picked === id ? ' hint' : ''}`}
              onPointerDown={() => picked && shell.canPlay() && drop(picked, id)}
            >
              <Shape id={id} hole />
              {placed.includes(id) && (
                <span className="sorter-in">
                  <Shape id={id} />
                </span>
              )}
            </div>
          ))}
          {allIn && <Burst size={260} />}
        </div>
        <div className="sorter-tray">
          {order.pieces.map((id) => {
            const isHeld = held?.id === id;
            return (
              <button
                type="button"
                key={id}
                className={`sorter-piece${isHeld ? ' held' : ''}${picked === id ? ' picked' : ''}${placed.includes(id) ? ' gone' : ''}`}
                style={isHeld ? { transform: `translate(${held.dx}px, ${held.dy}px) scale(1.1)` } : undefined}
                tabIndex={-1}
                aria-hidden="true"
                onPointerDown={(e) => down(id, e)}
                onPointerMove={move}
                onPointerUp={(e) => up(id, e)}
                onPointerCancel={() => {
                  drag.current = null;
                  setHeld(null);
                }}
              >
                <Shape id={id} />
              </button>
            );
          })}
        </div>
      </div>
    </ShellFrame>
  );
}
