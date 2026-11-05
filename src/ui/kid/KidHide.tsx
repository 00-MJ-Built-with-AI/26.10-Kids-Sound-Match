import { useMemo, useRef, useState } from 'react';
import { findLine } from '../../audio/clips';
import type { LoadedPack } from '../../content/types';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { Mascot } from './Mascot';
import { Burst } from './OptionGrid';
import { questionDone } from './sitting';
import { ShellFrame, sleep, useKidShell } from './useKidShell';

/**
 * Where Bunny can hide in the room (public/backgrounds/hide-room.svg, drawn by
 * tools/art/draw-home-play.mjs): the Hide pack's item, and its place in % of the square room.
 * The box comes last so it is tapped before the sofa where they touch.
 */
export const SPOTS: { key: string; x: number; y: number; w: number; h: number }[] = [
  { key: 'hide_curtain', x: 20, y: 26, w: 30, h: 34 },
  { key: 'hide_door', x: 84, y: 40, w: 20, h: 49 },
  { key: 'hide_table', x: 50.5, y: 45, w: 27, h: 30 },
  { key: 'hide_bed', x: 23, y: 74.5, w: 38, h: 29 },
  { key: 'hide_sofa', x: 77, y: 76, w: 46, h: 26 },
  { key: 'hide_box', x: 51, y: 90.5, w: 29, h: 17 },
];
const ROUNDS = 5;
/** After this many wrong places, his ears peek out where he is. */
const HINT_AFTER = 2;

/**
 * Hide and seek: Bunny hides in the room (under the bed, behind the curtain, in the box...). She
 * taps a place and hears it ("Under the bed?"), then "Not there!" or "There he is!" as he pops out.
 * Teaches under, behind and in. Five hides a game.
 */
export function KidHide(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { pack, packs } = props;
  const spots = useMemo(() => SPOTS.filter((s) => pack.items.some((i) => i.key === s.key)), [pack]);
  const lines = useMemo(() => ({ where: findLine(packs, 'where_bunny'), no: findLine(packs, 'not_here'), yes: findLine(packs, 'found_it') }), [packs]);
  const [hidden, setHidden] = useState(0);
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState<{ i: number; n: number } | null>(null);
  const [round, setRound] = useState(0);
  const busy = useRef(false);

  const hide = (avoid: number) => {
    let next = Math.floor(Math.random() * spots.length);
    if (spots.length > 1) while (next === avoid) next = Math.floor(Math.random() * spots.length);
    setHidden(next);
    setFound(false);
    setWrong(0);
    busy.current = false;
    if (shell.canPlay()) void shell.audio.say(shell.audio.resolver.line(lines.where));
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      setRound(0);
      hide(-1);
    },
    onResume: () => {
      if (!found) void shell.audio.say(shell.audio.resolver.line(lines.where));
    },
  });

  const tap = async (i: number) => {
    if (!shell.canPlay() || busy.current) return;
    const item = pack.items.find((x) => x.key === spots[i].key);
    const place = item ? shell.audio.resolver.names(item) : [];
    if (i !== hidden) {
      setShake({ i, n: Date.now() });
      setWrong((w) => w + 1);
      void shell.audio.say([...place, ...shell.audio.resolver.line(lines.no)]);
      return;
    }
    busy.current = true;
    setFound(true);
    await shell.audio.say([...shell.audio.resolver.line(lines.yes), ...place]);
    questionDone();
    await sleep(1400);
    if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
    const done = round + 1;
    setRound(done);
    if (done >= ROUNDS) shell.finish();
    else hide(i);
  };

  const spot = spots[hidden];
  return (
    <ShellFrame shell={shell} kind="hide" {...props}>
      <div className="hide">
        <div className="hide-room" style={{ backgroundImage: `url("${import.meta.env.BASE_URL}backgrounds/hide-room.svg")` }}>
          {spots.map((s, i) => (
            <button
              type="button"
              key={`${s.key}-${shake?.i === i ? shake.n : 0}`}
              className={`hide-spot${shake?.i === i ? ' no' : ''}`}
              style={{ left: `${s.x - s.w / 2}%`, top: `${s.y - s.h / 2}%`, width: `${s.w}%`, height: `${s.h}%` }}
              aria-label={pack.items.find((x) => x.key === s.key)?.name.en}
              onClick={() => void tap(i)}
            />
          ))}
          {spot && !found && wrong >= HINT_AFTER && (
            <span className="hide-ears" style={{ left: `${spot.x}%`, top: `${spot.y - spot.h / 2}%` }} aria-hidden="true">
              <svg viewBox="-40 -80 80 80">
                <ellipse cx="-14" cy="-44" rx="10" ry="30" fill="#fff" stroke="#5A3B2B" strokeWidth="4" transform="rotate(-10 -14 -44)" />
                <ellipse cx="-14" cy="-44" rx="4.5" ry="20" fill="#FFC7D6" transform="rotate(-10 -14 -44)" />
                <ellipse cx="14" cy="-44" rx="10" ry="30" fill="#fff" stroke="#5A3B2B" strokeWidth="4" transform="rotate(10 14 -44)" />
                <ellipse cx="14" cy="-44" rx="4.5" ry="20" fill="#FFC7D6" transform="rotate(10 14 -44)" />
              </svg>
            </span>
          )}
          {spot && found && (
            <span className="hide-bunny" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
              <Burst size={150} quiet />
              <Mascot mood="cheer" />
            </span>
          )}
        </div>
        <div className="book-dots hide-dots" aria-hidden="true">
          {Array.from({ length: ROUNDS }, (_, i) => (
            <span key={i} className={i < round ? 'on' : ''} />
          ))}
        </div>
      </div>
    </ShellFrame>
  );
}
