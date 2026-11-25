import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lang, LoadedItem, LoadedPack } from '../../content/types';
import { RHYME_ACTIONS, SONGS_PER_GAME } from '../../content/rhymes';
import { customKind, isCustomPackId } from '../../custom/types';
import { spokenLanguages } from '../../settings/settings';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { Burst } from './OptionGrid';
import { questionDone } from './sitting';
import { ShellFrame, sleep, useKidShell } from './useKidShell';

interface Song {
  id: string;
  lines: LoadedItem[];
  /** The parent's own song: sung once, in the voice they recorded. */
  own: boolean;
}

/** A short breath between lines. */
const LINE_GAP_MS = 450;

/**
 * Song time: short rhymes, a picture and an action for each line ("Clap, clap, clap your hands"),
 * sung through in each of her languages, then "again?". The parent's own songs (My packs > New
 * song: a picture and a sung line each) come first, in their voice.
 */
export function KidRhymes(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { pack, packs, config } = props;
  const songs = useMemo<Song[]>(() => {
    const own = packs
      .filter((p) => isCustomPackId(p.id) && customKind(p.id) === 'song' && p.items.length > 0)
      .map((p) => ({ id: p.id, lines: [...p.items], own: true }));
    const starter = pack.groups
      .map((g) => ({
        id: g.id,
        lines: g.items.map((k) => pack.items.find((i) => i.key === k)).filter((i): i is LoadedItem => !!i),
        own: false,
      }))
      .filter((s) => s.lines.length);
    return [...own, ...starter];
  }, [pack, packs]);
  const pictures = useMemo(
    () => Object.assign({}, ...songs.flatMap((s) => s.lines.map((i) => choosePictures([i], () => 0)))) as Record<string, string>,
    [songs],
  );
  const actionsPack = useMemo(() => packs.find((p) => p.id === 'actions'), [packs]);
  const actionPicture = (key: string) => {
    const item = actionsPack?.items.find((i) => i.key === RHYME_ACTIONS[key]);
    return item ? choosePictures([item], () => 0)[item.key] : null;
  };
  const languages = spokenLanguages(config.language);
  const [song, setSong] = useState<number | null>(null);
  const [at, setAt] = useState<{ line: number; lang: Lang } | null>(null);
  const [done, setDone] = useState(false);
  const sung = useRef(0);
  const run = useRef(0);

  /** The languages to sing a song in: the parent's song once if they recorded one voice for both. */
  const singIn = (s: Song): Lang[] => {
    if (!s.own) return [...languages];
    const twoVoices = s.lines.some((l) => l.nameAudio.ar.url !== l.nameAudio.en.url);
    return twoVoices ? [...languages] : [languages[0]];
  };

  const sing = async (i: number) => {
    const my = ++run.current;
    setSong(i);
    setDone(false);
    const live = () => run.current === my && shell.alive.current && shell.stageRef.current === 'playing';
    const s = songs[i];
    shell.audio.preload(s.lines);
    for (const lang of singIn(s)) {
      for (let l = 0; l < s.lines.length; l++) {
        if (!live()) return;
        setAt({ line: l, lang });
        await Promise.all([shell.audio.say([shell.audio.resolver.nameIn(s.lines[l], lang)]), sleep(1600)]);
        if (!live()) return;
        await sleep(LINE_GAP_MS);
      }
    }
    if (!live()) return;
    questionDone();
    sung.current++;
    setAt(null);
    setDone(true);
    if (sung.current >= SONGS_PER_GAME) {
      await sleep(1200);
      if (live()) shell.finish();
    }
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      run.current++;
      sung.current = 0;
      setSong(null);
      setAt(null);
      setDone(false);
    },
  });

  // Behind the gate or in the background: stop, and start again from the song list.
  useEffect(() => {
    if (shell.stage !== 'playing') run.current++;
  }, [shell.stage]);

  const back = () => {
    run.current++;
    shell.audio.stop();
    setSong(null);
    setAt(null);
    setDone(false);
  };
  const line = song !== null && at ? songs[song].lines[at.line] : null;
  const action = line ? actionPicture(line.key) : null;
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
              back();
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
        <div className="sing-pick rhymes-pick">
          {songs.map((s, i) => (
            <button type="button" key={s.id} className={`sing-song${s.own ? ' own' : ''}`} tabIndex={-1} aria-hidden="true" onPointerDown={() => void sing(i)}>
              <img src={pictures[s.lines[0].key]} alt="" draggable={false} />
              <span className="sing-notes" />
            </button>
          ))}
        </div>
      ) : (
        <div className="sing rhymes">
          <div className="sing-stage">
            {line && (
              <div key={`${at!.lang}-${at!.line}`} className="sing-card word rhyme-card">
                <img src={pictures[line.key]} alt="" draggable={false} />
                {action && <img className="rhyme-action" src={action} alt="" draggable={false} />}
              </div>
            )}
            {done && (
              <button type="button" className="rhyme-again" aria-label="⟲" tabIndex={-1} onPointerDown={() => void sing(song)}>
                <img src={pictures[songs[song].lines[0].key]} alt="" draggable={false} />
                <Burst size={200} quiet />
                <svg className="again-mark" width="64" height="64" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" fill="currentColor" />
                </svg>
              </button>
            )}
            <span className="sing-note n1">♪</span>
            <span className="sing-note n2">♫</span>
            <span className="sing-note n3">♪</span>
          </div>
          <div className="sing-dots">
            {songs[song].lines.map((l, i) => (
              <span key={`${l.key}-${i}`} className={at && i === at.line ? 'on' : (at && i < at.line) || done ? 'past' : ''} />
            ))}
          </div>
        </div>
      )}
    </ShellFrame>
  );
}
