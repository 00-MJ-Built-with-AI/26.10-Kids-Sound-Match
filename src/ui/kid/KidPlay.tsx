import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { findLine, type Clip } from '../../audio/clips';
import type { ArGender, Lang, LoadedItem, LoadedPack } from '../../content/types';
import { spokenLanguages } from '../../settings/settings';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { Burst } from './OptionGrid';
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

/* ================================================================ Pop the bubbles */

interface Bubble {
  id: number;
  item: LoadedItem;
  picture: string;
  /** Left edge, in % of the width. */
  x: number;
  /** Seconds to float to the top. */
  rise: number;
  size: number;
  hue: number;
}

const BUBBLE_EVERY_MS = 1300;
const MAX_BUBBLES = 6;

/**
 * Pop the bubbles: big soft bubbles float up, each with a picture inside. A tap pops it (a pop,
 * a burst of drops) and the picture says its name. The game ends after a few dozen pops.
 */
export function KidBubbles(props: GameProps) {
  const { pack, packs, config } = props;
  const items = useMemo(() => pack.items.filter((i) => config.itemKeys.includes(i.key)), [pack, config]);
  const pictures = useMemo(() => choosePictures(items), [items]);
  const pop = useMemo(() => findLine(packs, 'pop'), [packs]);
  const target = Math.max(12, config.questionsPerSession * 2);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const nextId = useRef(1);
  const pops = useRef(0);
  const bag = useRef<LoadedItem[]>([]);

  const blow = () => {
    if (!shell.canPlay()) return;
    if (!bag.current.length) bag.current = shuffle(items);
    const item = bag.current.pop()!;
    const size = 26 + Math.random() * 10;
    const b: Bubble = { id: nextId.current++, item, picture: pictures[item.key], x: 4 + Math.random() * (92 - size), rise: 7 + Math.random() * 3, size, hue: Math.floor(Math.random() * 360) };
    setBubbles((list) => (list.length >= MAX_BUBBLES ? list : [...list, b]));
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      pops.current = 0;
      setBubbles([]);
      bag.current = shuffle(items);
      shell.audio.preload(items.slice(0, 8));
      blow();
    },
  });

  useEffect(() => {
    if (shell.stage !== 'playing') return;
    const timer = window.setInterval(blow, BUBBLE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [shell.stage]);

  const onPop = (b: Bubble, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!shell.canPlay()) return;
    const box = e.currentTarget.getBoundingClientRect();
    const area = e.currentTarget.parentElement!.getBoundingClientRect();
    setBubbles((list) => list.filter((x) => x.id !== b.id));
    setPopped((list) => [...list.slice(-4), { id: b.id, x: box.left - area.left + box.width / 2, y: box.top - area.top + box.height / 2, size: box.width }]);
    const res = shell.audio.resolver;
    void shell.audio.say([...res.line(pop).slice(0, 1), ...res.names(b.item)]);
    pops.current++;
    if (pops.current >= target) {
      void sleep(1600).then(() => {
        if (shell.alive.current && shell.stageRef.current === 'playing') shell.finish();
      });
    } else if (pops.current % 5 === 0) questionDone();
  };

  return (
    <ShellFrame shell={shell} kind="bubbles" {...props}>
      <div className="bubbles">
        {bubbles.map((b) => (
          <button
            type="button"
            key={b.id}
            className="bubble"
            style={{ left: `${b.x}%`, width: `${b.size}vmin`, height: `${b.size}vmin`, animationDuration: `${b.rise}s`, ['--hue' as string]: b.hue }}
            tabIndex={-1}
            aria-hidden="true"
            onPointerDown={(e) => onPop(b, e)}
            onAnimationEnd={() => setBubbles((list) => list.filter((x) => x.id !== b.id))}
          >
            <img src={b.picture} alt="" draggable={false} />
          </button>
        ))}
        {popped.map((p) => (
          <span key={p.id} className="bubble-pop" style={{ left: p.x, top: p.y, width: p.size, height: p.size }}>
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} style={{ transform: `rotate(${i * 45}deg)` }} />
            ))}
          </span>
        ))}
      </div>
    </ShellFrame>
  );
}

/* ================================================================ Tidy up */

type BinId = 'toys' | 'food' | 'clothes';
const BINS: readonly BinId[] = ['toys', 'food', 'clothes'];

/** Where things go: the toy box, the fridge, the wardrobe. */
function Bin({ id, open }: { id: BinId; open: boolean }) {
  const ink = '#5A3B2B';
  const o = { stroke: ink, strokeWidth: 5, strokeLinejoin: 'round' } as const;
  if (id === 'toys')
    return (
      <svg viewBox="0 0 200 170" aria-hidden="true">
        <g className="bin-lid" style={{ transform: open ? 'rotate(-28deg)' : undefined }}>
          <rect x="18" y="30" width="164" height="30" rx="12" fill="#F05A8C" {...o} />
        </g>
        <rect x="26" y="56" width="148" height="104" rx="16" fill="#FF8FB1" {...o} />
        <path d="M60 100 l12 -12 l12 12 l-12 12 Z M116 100 l12 -12 l12 12 l-12 12 Z" fill="#FFE08A" {...o} strokeWidth={3} />
        <circle cx="100" cy="132" r="9" fill="#fff" {...o} strokeWidth={3} />
      </svg>
    );
  if (id === 'food')
    return (
      <svg viewBox="0 0 200 170" aria-hidden="true">
        <rect x="44" y="6" width="112" height="158" rx="18" fill="#DDF1FF" {...o} />
        <path d="M44 62 H156" fill="none" {...o} />
        <g className="bin-door" style={{ transform: open ? 'scaleX(0.55)' : undefined }}>
          <rect x="44" y="62" width="112" height="102" rx="0" fill="#BFE6FF" {...o} />
        </g>
        <path d="M134 30 v16 M134 82 v28" fill="none" {...o} strokeWidth={7} strokeLinecap="round" />
        <circle cx="76" cy="34" r="6" fill="#fff" opacity="0.7" />
      </svg>
    );
  return (
    <svg viewBox="0 0 200 170" aria-hidden="true">
      <rect x="30" y="8" width="140" height="156" rx="14" fill="#C98E5A" {...o} />
      <g className="bin-door" style={{ transform: open ? 'scaleX(0.6)' : undefined }}>
        <rect x="38" y="16" width="60" height="140" rx="8" fill="#E2AE7A" {...o} />
      </g>
      <rect x="102" y="16" width="60" height="140" rx="8" fill="#E2AE7A" {...o} />
      <circle cx="90" cy="86" r="5" fill="#FFE08A" {...o} strokeWidth={3} />
      <circle cx="110" cy="86" r="5" fill="#FFE08A" {...o} strokeWidth={3} />
    </svg>
  );
}

interface Thing {
  item: LoadedItem;
  bin: BinId;
  picture: string;
  /** Resting place on the floor, in % of the play area. */
  x: number;
  y: number;
}

/**
 * Tidy up: "يلّا نرتّب!" Six things on the floor (toys, food, clothes). She drags each into the
 * toy box, the fridge or the wardrobe; or taps a thing and then the place. The right place opens and
 * swallows it with its name; a wrong place shakes and the thing floats back. A tap on a thing alone
 * says its name and makes its place glow.
 */
export function KidTidy(props: GameProps) {
  const { packs, config } = props;
  const sources = useMemo(
    () => BINS.map((bin) => ({ bin, pack: packs.find((p) => p.id === bin) })).filter((s): s is { bin: BinId; pack: LoadedPack } => !!s.pack),
    [packs],
  );
  const tidy = useMemo(() => findLine(packs, 'tidy'), [packs]);
  const rounds = Math.min(Math.ceil(config.questionsPerSession / 5), 3);
  const [things, setThings] = useState<Thing[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [held, setHeld] = useState<{ key: string; dx: number; dy: number } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [glow, setGlow] = useState<BinId | null>(null);
  const [shake, setShake] = useState<BinId | null>(null);
  const [opened, setOpened] = useState<BinId | null>(null);
  const [round, setRound] = useState(0);
  const area = useRef<HTMLDivElement>(null);
  const binRefs = useRef<Partial<Record<BinId, HTMLDivElement | null>>>({});
  const drag = useRef<{ key: string; startX: number; startY: number; moved: boolean } | null>(null);

  const deal = (n: number) => {
    const chosen = sources.flatMap(({ bin, pack }) => shuffle(pack.items).slice(0, 2).map((item) => ({ item, bin })));
    const pics = choosePictures(chosen.map((c) => c.item));
    const spots = shuffle([
      [8, 8], [38, 4], [68, 8], [12, 34], [42, 30], [72, 34],
    ]);
    setThings(chosen.map((c, i) => ({ ...c, picture: pics[c.item.key], x: spots[i][0], y: spots[i][1] })));
    setPlaced([]);
    setRound(n);
    shell.audio.preload(chosen.map((c) => c.item));
    if (shell.canPlay()) void shell.audio.say(shell.audio.resolver.line(tidy));
  };
  const shell = useKidShell({ ...props, onStart: () => deal(0) });

  const binAt = (x: number, y: number): BinId | null => {
    for (const bin of BINS) {
      const el = binRefs.current[bin];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const pad = 40;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return bin;
    }
    return null;
  };

  const put = (key: string, bin: BinId) => {
    const thing = things.find((t) => t.item.key === key);
    if (!thing) return;
    const res = shell.audio.resolver;
    if (thing.bin !== bin) {
      setShake(bin);
      void shell.audio.say([res.incorrectTone()]);
      window.setTimeout(() => setShake(null), 600);
      return;
    }
    const now = [...placed, key];
    setPlaced(now);
    setOpened(bin);
    window.setTimeout(() => setOpened(null), 900);
    if (now.length >= things.length) {
      void (async () => {
        await shell.audio.say(res.names(thing.item));
        await sleep(400);
        if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
        questionDone();
        if (round + 1 >= rounds) shell.finish();
        else deal(round + 1);
      })();
    } else void shell.audio.say(res.names(thing.item));
  };

  const down = (t: Thing, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!shell.canPlay() || placed.includes(t.item.key)) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // No live pointer (a synthetic tap): the drag still works without capture.
    }
    drag.current = { key: t.item.key, startX: e.clientX, startY: e.clientY, moved: false };
    setHeld({ key: t.item.key, dx: 0, dy: 0 });
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.hypot(dx, dy) > 12) d.moved = true;
    setHeld({ key: d.key, dx, dy });
  };
  const up = (t: Thing, e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    setHeld(null);
    if (!d || !shell.canPlay()) return;
    if (!d.moved) {
      // A tap: say its name, light up where it goes, and wait for a tap on a place.
      setPicked(t.item.key);
      setGlow(t.bin);
      window.setTimeout(() => setGlow(null), 1400);
      void shell.audio.say(shell.audio.resolver.names(t.item));
      return;
    }
    setPicked(null);
    const bin = binAt(e.clientX, e.clientY);
    if (bin) put(t.item.key, bin);
  };
  const tapBin = (bin: BinId) => {
    if (!picked || !shell.canPlay()) return;
    const key = picked;
    setPicked(null);
    put(key, bin);
  };

  return (
    <ShellFrame shell={shell} kind="tidy" {...props}>
      <div className="tidy" ref={area} key={round}>
        <div className="tidy-floor">
          {things.map((t) => {
            const isHeld = held?.key === t.item.key;
            const done = placed.includes(t.item.key);
            return (
              <button
                type="button"
                key={t.item.key}
                className={`tidy-thing${isHeld ? ' held' : ''}${picked === t.item.key ? ' picked' : ''}${done ? ' gone' : ''}`}
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  transform: isHeld ? `translate(${held.dx}px, ${held.dy}px) scale(1.12)` : undefined,
                }}
                tabIndex={-1}
                aria-hidden="true"
                onPointerDown={(e) => down(t, e)}
                onPointerMove={move}
                onPointerUp={(e) => up(t, e)}
                onPointerCancel={() => {
                  drag.current = null;
                  setHeld(null);
                }}
              >
                <img src={t.picture} alt="" draggable={false} />
              </button>
            );
          })}
        </div>
        <div className="tidy-bins">
          {sources.map(({ bin }) => (
            <div
              key={bin}
              ref={(el) => {
                binRefs.current[bin] = el;
              }}
              className={`tidy-bin${glow === bin ? ' glow' : ''}${shake === bin ? ' shake' : ''}`}
              onPointerDown={() => tapBin(bin)}
            >
              <Bin id={bin} open={opened === bin} />
              {opened === bin && <Burst size={140} />}
            </div>
          ))}
        </div>
      </div>
    </ShellFrame>
  );
}

/* ================================================================ Sing with me */

/** The gap left for her to fill in the last word, before the app sings it. */
const GAP_MS = 2600;

/**
 * Sing with me: pick a song by its picture. Each line is sung with its picture on screen, the last
 * word left out ("راس، كتاف، رُكَب و…"); the picture wiggles while she fills it in, then the word comes
 * ("أصابع!") with the picture popping (and the animal's sound on the farm). With both languages, the
 * song is sung in one, then the other. The ✓ is for the parent when she says the word.
 */
export function KidSing(props: GameProps) {
  const { pack, config } = props;
  const gender: ArGender = config.arGender ?? 'f';
  const songs = useMemo(
    () =>
      pack.groups
        .map((g) => ({ id: g.id, lines: g.items.map((k) => pack.items.find((i) => i.key === k)).filter((i): i is LoadedItem => !!i) }))
        .filter((s) => s.lines.length),
    [pack],
  );
  // Each line on its own: a song mixes photos (the farm animals) and drawings (body parts).
  const pictures = useMemo(() => Object.assign({}, ...pack.items.map((i) => choosePictures([i]))) as Record<string, string>, [pack]);
  const languages = spokenLanguages(config.language);
  const [song, setSong] = useState<number | null>(null);
  const [at, setAt] = useState<{ line: number; lang: Lang; part: 'line' | 'gap' | 'word' } | null>(null);
  const [cheer, setCheer] = useState(0);
  const run = useRef(0);

  const sing = async (s: number) => {
    const my = ++run.current;
    setSong(s);
    const live = () => run.current === my && shell.alive.current && shell.stageRef.current === 'playing';
    const res = shell.audio.resolver;
    shell.audio.preload(songs[s].lines);
    for (const lang of languages) {
      for (let i = 0; i < songs[s].lines.length; i++) {
        if (!live()) return;
        const item = songs[s].lines[i];
        setAt({ line: i, lang, part: 'line' });
        await shell.audio.say([res.nameIn(item, lang)]);
        if (!live()) return;
        setAt({ line: i, lang, part: 'gap' });
        await sleep(GAP_MS);
        if (!live()) return;
        setAt({ line: i, lang, part: 'word' });
        const word: (Clip | null)[] = [res.pointIn(item, lang, gender)];
        if (item.sound) word.push(res.sound(item));
        await Promise.all([shell.audio.say(word), sleep(900)]);
        questionDone();
      }
    }
    if (live()) shell.finish();
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      run.current++;
      setSong(null);
      setAt(null);
    },
  });

  // Behind the gate or in the background: stop the song, and start it again from the song list.
  useEffect(() => {
    if (shell.stage !== 'playing') run.current++;
  }, [shell.stage]);

  const line = song !== null && at ? songs[song].lines[at.line] : null;
  return (
    <ShellFrame
      shell={shell}
      kind="sing"
      {...props}
      left={
        song !== null ? (
          <button
            type="button"
            className="sing-back"
            aria-label="⟲"
            onPointerDown={(e) => {
              e.stopPropagation();
              run.current++;
              shell.audio.stop();
              setSong(null);
              setAt(null);
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z" fill="currentColor" />
            </svg>
          </button>
        ) : undefined
      }
    >
      {song === null ? (
        <div className="sing-pick">
          {songs.map((s, i) => (
            <button type="button" key={s.id} className="sing-song" tabIndex={-1} aria-hidden="true" onPointerDown={() => void sing(i)}>
              <img src={pictures[s.lines[0].key]} alt="" draggable={false} />
              <span className="sing-notes" />
            </button>
          ))}
        </div>
      ) : (
        <div className="sing">
          <div className="sing-stage">
            {line && (
              <div key={`${at!.lang}-${at!.line}`} className={`sing-card ${at!.part}`}>
                <img src={pictures[line.key]} alt="" draggable={false} />
                {at!.part === 'gap' && <span className="sing-gap">?</span>}
                {at!.part === 'word' && <Burst size={220} key={cheer} />}
              </div>
            )}
            <span className="sing-note n1">♪</span>
            <span className="sing-note n2">♫</span>
            <span className="sing-note n3">♪</span>
          </div>
          <div className="sing-dots">
            {songs[song].lines.map((l, i) => (
              <span key={`${l.key}-${i}`} className={at && i === at.line ? 'on' : at && i < at.line ? 'past' : ''} />
            ))}
          </div>
          <button type="button" className="point-found sing-found" aria-label="✓" onClick={() => setCheer((c) => c + 1)}>
            <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {cheer > 0 && <span className="sing-cheer" key={cheer} />}
        </div>
      )}
    </ShellFrame>
  );
}
