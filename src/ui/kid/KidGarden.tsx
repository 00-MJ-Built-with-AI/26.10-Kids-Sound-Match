import { useMemo, useRef, useState } from 'react';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { playNote, SCALE } from '../../audio/synth';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { questionDone } from './sitting';
import { ShellFrame, useKidShell } from './useKidShell';

/** Taps before the garden says goodbye (about two minutes of tapping). */
export const GARDEN_TAPS = 60;
/** Where the things sit, in % of the garden (a loose scatter, not a grid). */
const SPOTS: [number, number][] = [
  [18, 20],
  [50, 14],
  [82, 22],
  [30, 46],
  [70, 44],
  [14, 74],
  [48, 76],
  [84, 72],
];
const NOTE_COLOURS = ['#F05A8C', '#FFC531', '#5B8DEF', '#7CC67A', '#7A4FD1', '#F7A14A'];

/**
 * Sound garden: tap anything and it makes its sound (a cow moos, a drum booms, the rain patters).
 * No question and no wrong answer: cause and effect, for a tired or very young player. Tapping the
 * grass between them plays a soft note. Every few taps a thing also says its name.
 */
export function KidGarden(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { packs, config } = props;
  const things = useMemo(
    () =>
      config.itemKeys
        .map((id) => {
          const slash = id.indexOf('/');
          return packs.find((p) => p.id === id.slice(0, slash))?.items.find((i) => i.key === id.slice(slash + 1));
        })
        .filter((i): i is LoadedItem => !!i && !!i.sound)
        .slice(0, SPOTS.length),
    [packs, config.itemKeys],
  );
  const pictures = useMemo(() => Object.assign({}, ...things.map((i) => choosePictures([i], () => 0))) as Record<string, string>, [things]);
  const [hit, setHit] = useState<{ i: number; n: number } | null>(null);
  const [notes, setNotes] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const taps = useRef(0);
  const noteId = useRef(1);
  const shell = useKidShell({
    ...props,
    onStart: () => {
      taps.current = 0;
      shell.audio.preload(things);
    },
  });

  const float = (x: number, y: number) => {
    const id = noteId.current++;
    setNotes((list) => [...list.slice(-10), { id, x, y, color: NOTE_COLOURS[id % NOTE_COLOURS.length] }]);
    window.setTimeout(() => setNotes((list) => list.filter((n) => n.id !== id)), 1300);
  };
  const counted = () => {
    taps.current++;
    if (taps.current % 15 === 0) questionDone();
    if (taps.current === GARDEN_TAPS) {
      window.setTimeout(() => {
        if (shell.alive.current && shell.stageRef.current === 'playing') shell.finish();
      }, 1500);
    }
  };
  const tapThing = (i: number) => {
    if (!shell.canPlay()) return;
    const item = things[i];
    const r = shell.audio.resolver;
    // The sound; every fourth tap, its name after it.
    void shell.audio.say(taps.current % 4 === 3 ? [r.sound(item), ...r.names(item)] : [r.sound(item)]);
    setHit({ i, n: Date.now() });
    float(SPOTS[i][0], SPOTS[i][1] - 8);
    counted();
  };
  const tapGrass = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!shell.canPlay() || e.target !== e.currentTarget) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    // Higher notes towards the top of the garden.
    playNote(SCALE[Math.max(0, Math.min(SCALE.length - 1, Math.floor(((100 - y) / 100) * SCALE.length)))], 'xylo', 0.25);
    float(x, y);
    counted();
  };

  return (
    <ShellFrame shell={shell} kind="garden" {...props}>
      <div className="garden" onPointerDown={tapGrass}>
        {things.map((item, i) => (
          <button
            type="button"
            key={`${item.key}-${hit?.i === i ? hit.n : 0}`}
            className={`garden-thing${hit?.i === i ? ' hit' : ''}`}
            style={{
              left: `${SPOTS[i][0]}%`,
              top: `${SPOTS[i][1]}%`,
              animationDelay: `${(i * 0.37) % 2}s`,
            }}
            tabIndex={-1}
            aria-hidden="true"
            onPointerDown={(e) => {
              e.stopPropagation();
              tapThing(i);
            }}
          >
            <img src={pictures[item.key]} alt="" draggable={false} />
          </button>
        ))}
        {notes.map((n) => (
          <span key={n.id} className="garden-note" style={{ left: `${n.x}%`, top: `${n.y}%`, color: n.color }} aria-hidden="true">
            ♪
          </span>
        ))}
      </div>
    </ShellFrame>
  );
}
