import { useMemo, useRef, useState } from 'react';
import { ClipResolver, findLine } from '../../audio/clips';
import { BIRTHDAY, playNote, SCALE, stepFreq, TWINKLE } from '../../audio/synth';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { spokenLanguages } from '../../settings/settings';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { Burst } from './OptionGrid';
import { questionDone } from './sitting';
import { ShellFrame, useKidShell } from './useKidShell';

/** The xylophone's bars, low to high: a colour each (its name is said now and then). */
const BARS: { key: string; hex: string }[] = [
  { key: 'color_red', hex: '#F0453C' },
  { key: 'color_orange', hex: '#FF9A3C' },
  { key: 'color_yellow', hex: '#FFD23F' },
  { key: 'color_green', hex: '#3CC47C' },
  { key: 'color_blue', hex: '#3D8BFD' },
  { key: 'color_purple', hex: '#9B6BF2' },
  { key: 'color_pink', hex: '#FF7EB6' },
  { key: 'color_gold', hex: '#E8B94A' },
];
/** The animal drums, each with its own pitch. */
const DRUMS = ['cow', 'dog', 'cat', 'duck', 'sheep', 'lion'];
const TUNES = [TWINKLE, BIRTHDAY];
/** A colour's name at most this often (a toddler taps fast). */
const SAY_EVERY_MS = 2500;
/** The game ends after this many taps. */
const TAPS = 120;

type Mode = 'xylo' | 'drums' | 'along';

/** Which bar a scale step sounds on (the tunes go a little below the bars). */
const barOf = (step: number) => (step >= 0 && step <= 7 ? step : ((step % 7) + 7) % 7);

/**
 * Make music: a xylophone of coloured bars, a row of animal drums, and play-along, where any tap
 * plays the next note of a tune she knows (Twinkle, twinkle; Happy birthday) and the next bar glows.
 * The notes are made on the phone; colours say their names now and then, drums make their animal's sound.
 */
export function KidMusic(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { pack, packs, config } = props;
  const line = useMemo(() => findLine(packs, 'music'), [packs]);
  const animals = useMemo(() => packs.find((p) => p.id === 'animals'), [packs]);
  const drums = useMemo(
    () => DRUMS.map((k) => animals?.items.find((i) => i.key === k)).filter((i): i is LoadedItem => !!i && !!i.sound),
    [animals],
  );
  const drumPictures = useMemo(() => Object.assign({}, ...drums.map((d) => choosePictures([d]))) as Record<string, string>, [drums]);
  const animalVoice = useMemo(() => (animals ? new ClipResolver(animals, spokenLanguages(config.language)) : null), [animals, config]);
  const [mode, setMode] = useState<Mode>('xylo');
  const [hit, setHit] = useState<{ i: number; n: number } | null>(null);
  const [notes, setNotes] = useState<{ id: number; x: number; color: string }[]>([]);
  const [tune, setTune] = useState(0);
  const [pos, setPos] = useState(0);
  const [cheer, setCheer] = useState(0);
  const taps = useRef(0);
  const lastSaid = useRef(0);
  const noteId = useRef(1);

  const shell = useKidShell({
    ...props,
    onStart: () => {
      taps.current = 0;
      setPos(0);
      if (line) void shell.audio.say(shell.audio.resolver.line(line));
    },
  });

  const counted = () => {
    taps.current++;
    if (taps.current % 20 === 0) questionDone();
    if (taps.current >= TAPS) {
      window.setTimeout(() => {
        if (shell.alive.current && shell.stageRef.current === 'playing') shell.finish();
      }, 1200);
    }
  };
  const float = (x: number, color: string) => {
    const id = noteId.current++;
    setNotes((list) => [...list.slice(-8), { id, x, color }]);
    window.setTimeout(() => setNotes((list) => list.filter((n) => n.id !== id)), 1200);
  };
  const sayColour = (key: string) => {
    if (Date.now() - lastSaid.current < SAY_EVERY_MS) return;
    const item = pack.items.find((i) => i.key === key);
    if (!item) return;
    lastSaid.current = Date.now();
    void shell.audio.say(shell.audio.resolver.names(item));
  };

  const bar = (i: number) => {
    if (!shell.canPlay()) return;
    if (mode === 'along') {
      // Any bar plays the tune's next note: she always makes the song.
      const notesOf = TUNES[tune];
      let p = pos;
      while (notesOf[p % notesOf.length] === null) p++;
      const step = notesOf[p % notesOf.length]!;
      playNote(stepFreq(step), 'xylo');
      const b = barOf(step);
      setHit({ i: b, n: Date.now() });
      float(((b + 0.5) / BARS.length) * 100, BARS[b].hex);
      let next = p + 1;
      if (next >= notesOf.length || notesOf.slice(next).every((s) => s === null)) {
        setCheer((n) => n + 1);
        setTune((t) => (t + 1) % TUNES.length);
        next = 0;
        questionDone();
      }
      setPos(next);
    } else {
      playNote(SCALE[i], 'xylo');
      setHit({ i, n: Date.now() });
      float(((i + 0.5) / BARS.length) * 100, BARS[i].hex);
      sayColour(BARS[i].key);
    }
    counted();
  };
  const drum = (i: number) => {
    if (!shell.canPlay()) return;
    playNote(110 + i * 26, 'drum');
    setHit({ i, n: Date.now() });
    const clip = animalVoice?.sound(drums[i]);
    if (clip) void shell.audio.say([clip]);
    counted();
  };

  // In play-along, the bar to tap next glows.
  const glow = (() => {
    if (mode !== 'along') return -1;
    const list = TUNES[tune];
    let p = pos;
    while (list[p % list.length] === null) p++;
    return barOf(list[p % list.length]!);
  })();

  const modeButton = (m: Mode, icon: string) => (
    <button type="button" key={m} className={`music-mode${mode === m ? ' on' : ''}`} aria-label={m} onClick={() => setMode(m)}>
      {icon}
    </button>
  );

  return (
    <ShellFrame shell={shell} kind="music" {...props} left={<span className="music-modes">{[modeButton('xylo', '🎹'), modeButton('drums', '🥁'), modeButton('along', '🎵')]}</span>}>
      <div className={`music mode-${mode}`}>
        {mode !== 'drums' ? (
          <div className="xylo">
            <div className="xylo-rails" aria-hidden="true" />
            {BARS.map((b, i) => (
              <button
                type="button"
                key={b.key}
                className={`xylo-bar${glow === i ? ' glow' : ''}`}
                style={{ '--bar': b.hex, '--len': `${100 - i * 6}%` } as React.CSSProperties}
                aria-label={b.key}
                onPointerDown={() => bar(i)}
              >
                {/* Remounted on every hit, so the bar rings again even when tapped twice. */}
                <span className={`xylo-face${hit?.i === i ? ' rang' : ''}`} key={hit?.i === i ? hit.n : 0}>
                  <span className="xylo-pin" />
                  <span className="xylo-pin" />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="drums">
            {drums.map((d, i) => (
              <button type="button" key={d.key} className="drum" aria-label={d.name.en} onPointerDown={() => drum(i)}>
                <span className={`drum-head${hit?.i === i ? ' rang' : ''}`} key={hit?.i === i ? hit.n : 0}>
                  <img src={drumPictures[d.key]} alt="" draggable={false} />
                </span>
                <span className="drum-body" />
              </button>
            ))}
          </div>
        )}
        {notes.map((n) => (
          <span key={n.id} className="music-note" style={{ left: `${n.x}%`, color: n.color }} aria-hidden="true">
            ♪
          </span>
        ))}
        {cheer > 0 && (
          <span className="music-cheer" key={cheer}>
            <Burst size={180} kind="stars" />
          </span>
        )}
      </div>
    </ShellFrame>
  );
}
