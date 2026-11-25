import { useMemo, useRef, useState } from 'react';
import { findLine } from '../../audio/clips';
import type { LoadedItem, LoadedPack } from '../../content/types';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { Burst } from './OptionGrid';
import { questionDone } from './sitting';
import { ShellFrame, sleep, useKidShell } from './useKidShell';

export const CUPS_ROUNDS = 6;
/** Two cups for the first rounds, then three; from this round one cup slides to swap places. */
const THREE_FROM = 2;
const SWAP_FROM = 4;
/** After this many empty cups, the right one wiggles. */
const HINT_AFTER = 2;
const COLOURS = ['red', 'blue', 'yellow'];

/** How many cups a round has, and whether they swap. */
export function cupsRound(round: number): { cups: number; swap: boolean } {
  return { cups: round < THREE_FROM ? 2 : 3, swap: round >= SWAP_FROM };
}

/**
 * Where did it go?: a toy sits under a cup, the cup comes down (later, it slides to swap places with
 * another), and "Teddy… where did it go?". She lifts a cup: "Not there!" or "There it is!". Things
 * still exist when hidden, and the words under and gone.
 */
export function KidCups(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { packs, config } = props;
  const toys = useMemo(
    () =>
      config.itemKeys
        .map((id) => {
          const slash = id.indexOf('/');
          return packs.find((p) => p.id === id.slice(0, slash))?.items.find((i) => i.key === id.slice(slash + 1));
        })
        .filter((i): i is LoadedItem => !!i),
    [packs, config.itemKeys],
  );
  const pictures = useMemo(() => Object.assign({}, ...toys.map((i) => choosePictures([i], () => 0))) as Record<string, string>, [toys]);
  const lines = useMemo(
    () => ({
      gone: findLine(packs, 'where_gone'),
      goneF: findLine(packs, 'where_gone_f'),
      no: findLine(packs, 'not_here'),
      yes: findLine(packs, 'found_it'),
    }),
    [packs],
  );
  const [round, setRound] = useState(0);
  const [slots, setSlots] = useState<number[]>([0, 1]);
  const [hidden, setHidden] = useState(0);
  const [lifted, setLifted] = useState<number[]>([]);
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState<{ i: number; n: number } | null>(null);
  const ready = useRef(false);
  const run = useRef(0);
  const roundRef = useRef(0);
  const hiddenRef = useRef(0);

  const toy = toys.length ? toys[round % toys.length] : undefined;
  const question = () => {
    const t = toys[roundRef.current % toys.length];
    if (!t) return [];
    const r = shell.audio.resolver;
    return r.spoken.flatMap((l) => [r.nameIn(t, l), ...r.line(t.arFeminine ? lines.goneF : lines.gone, l)]);
  };

  const play = async (r: number) => {
    const my = ++run.current;
    const live = () => run.current === my && shell.alive.current && shell.stageRef.current === 'playing';
    const { cups, swap } = cupsRound(r);
    const under = Math.floor(Math.random() * cups);
    ready.current = false;
    roundRef.current = r;
    hiddenRef.current = under;
    setRound(r);
    setSlots(Array.from({ length: cups }, (_, i) => i));
    setHidden(under);
    setFound(false);
    setWrong(0);
    setLifted([under]);
    const t = toys[r % toys.length];
    if (t) await Promise.all([shell.audio.say(shell.audio.resolver.names(t)), sleep(1400)]);
    if (!live()) return;
    setLifted([]);
    await sleep(800);
    if (!live()) return;
    if (swap) {
      // The cup with the toy slides to swap places with a neighbour, slowly enough to follow.
      const other = under === 0 ? 1 : under - 1;
      setSlots((s) => s.map((slot, i) => (i === under ? s[other] : i === other ? s[under] : slot)));
      await sleep(1300);
      if (!live()) return;
    }
    ready.current = true;
    void shell.audio.askLoop(question(), 2);
  };

  const shell = useKidShell({
    ...props,
    onStart: () => {
      shell.audio.preload(toys);
      void play(0);
    },
    onResume: () => {
      if (ready.current) void shell.audio.askLoop(question(), 2);
    },
  });

  const lift = async (i: number) => {
    if (!ready.current || !shell.canPlay()) return;
    const t = toys[roundRef.current % toys.length];
    if (i !== hiddenRef.current) {
      setShake({ i, n: Date.now() });
      setLifted((l) => [...l, i]);
      setWrong((w) => w + 1);
      void shell.audio.say(shell.audio.resolver.line(lines.no));
      window.setTimeout(() => setLifted((l) => l.filter((x) => x !== i)), 1000);
      return;
    }
    ready.current = false;
    const my = run.current;
    setLifted([i]);
    setFound(true);
    questionDone();
    await Promise.all([shell.audio.say([...shell.audio.resolver.line(lines.yes), ...(t ? shell.audio.resolver.names(t) : [])]), sleep(1600)]);
    if (run.current !== my || !shell.alive.current || shell.stageRef.current !== 'playing') return;
    const next = roundRef.current + 1;
    if (next >= CUPS_ROUNDS) shell.finish();
    else void play(next);
  };

  const count = slots.length;
  return (
    <ShellFrame shell={shell} kind="cups" {...props}>
      <div className="cups">
        <div className="cups-table">
          {slots.map((slot, i) => (
            <button
              type="button"
              key={`${round}-${i}`}
              className={`cup-spot${lifted.includes(i) ? ' up' : ''}${shake?.i === i ? ' no' : ''}${!found && wrong >= HINT_AFTER && i === hidden ? ' hint' : ''}`}
              style={{ left: `${((slot + 0.5) / count) * 100}%` }}
              tabIndex={-1}
              aria-hidden="true"
              onPointerDown={() => void lift(i)}
            >
              {i === hidden && toy && <img className="cup-toy" src={pictures[toy.key]} alt="" draggable={false} />}
              {i === hidden && found && <Burst size={180} quiet />}
              <img className="cup-cup" src={`${import.meta.env.BASE_URL}assets/tiles/cup_${COLOURS[i % COLOURS.length]}.svg`} alt="" draggable={false} />
            </button>
          ))}
        </div>
        <div className="book-dots hide-dots" aria-hidden="true">
          {Array.from({ length: CUPS_ROUNDS }, (_, i) => (
            <span key={i} className={i < round || (i === round && found) ? 'on' : ''} />
          ))}
        </div>
      </div>
    </ShellFrame>
  );
}
