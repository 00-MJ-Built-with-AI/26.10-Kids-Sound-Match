import { useMemo, useRef, useState } from 'react';
import { findLine, type Clip } from '../../audio/clips';
import type { LoadedPack } from '../../content/types';
import { loadPath, practise, savePath } from '../../learn/path';
import { buildSteps, wordRefs, type LearnMode, type Step } from '../../learn/steps';
import { reportStore } from '../../report/db';
import { today } from '../../settings/routine';
import { CardNames } from './CardNames';
import type { PickerOptions } from './EndScreen';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures, useBoxSize } from './layout';
import { aliveMotion, OptionGrid } from './OptionGrid';
import { questionDone } from './sitting';
import { ShellFrame, sleep, useKidShell } from './useKidShell';

/** How long a right answer is celebrated before the next one. */
const CELEBRATION_MS = 1200;
const SAY_MAX_MS = 2800;
/** After this many wrong taps, the right picture wiggles. */
const HINT_AFTER = 2;

interface Props {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  /** The packs as shipped: every picture of a word, whatever this child's look. */
  raw: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}

/**
 * The Learn section: today's lesson, Same word different pictures, The new one, Action words, Show
 * me and In, on, under. One game made of steps: meet a word (its pictures one after another, each
 * named), or find the right picture. Words she practises in the lesson move along her word path.
 */
export function KidLearn(props: Props) {
  const { pack, packs, raw, config } = props;
  const mode = config.kind as LearnMode;
  const refs = useMemo(() => wordRefs(packs), [packs]);
  const rawRefs = useMemo(() => wordRefs(raw), [raw]);
  const lines = useMemo(() => ({ thisIs: findLine(packs, 'this_is'), thisIsF: findLine(packs, 'this_is_f'), showMe: findLine(packs, 'show_me') }), [packs]);

  const steps = useRef<Step[]>([]);
  const index = useRef(0);
  const [at, setAt] = useState<{ i: number; run: number }>({ i: 0, run: 0 });
  const [meetPicture, setMeetPicture] = useState(0);
  const [celebrated, setCelebrated] = useState<string[]>([]);
  const [hint, setHint] = useState<{ key: string; pulse: number } | null>(null);
  const busy = useRef(false);
  const wrongs = useRef(0);
  const token = useRef(0);
  const results = useRef<{ itemKey: string; packId: string; firstTryCorrect: boolean; attempts: number; choiceCount: number }[]>([]);

  const step: Step | undefined = steps.current[at.i];
  const pictures = useMemo(() => {
    if (!step || step.kind !== 'pick') return {};
    const chosen = choosePictures(step.options.map((o) => o.item));
    return Object.fromEntries(step.options.map((o) => [o.key, o.picture ?? chosen[o.item.key]]));
  }, [step, at]);

  const question = (s: Step | undefined = steps.current[index.current]): Clip[] => {
    if (!s || s.kind !== 'pick') return [];
    const r = shell.audio.resolver;
    if (s.ask === 'showme') return r.spoken.flatMap((l) => [...r.line(lines.showMe, l), r.nameIn(s.askItem, l)]);
    return r.names(s.askItem);
  };
  const ask = () => {
    if (shell.canPlay() && !busy.current) void shell.audio.askLoop(question(), 3);
  };
  const remember = (word: string) => {
    if (mode === 'lesson') savePath(config.profileId, practise(loadPath(config.profileId), word, today()));
  };

  const save = async () => {
    if (!results.current.length) return;
    try {
      await reportStore.saveSession(
        {
          packId: pack.id,
          startedAt: shell.startedAt.current,
          endedAt: Date.now(),
          questionCount: results.current.length,
          toddlerMode: false,
          choiceCount: 3,
          language: config.language,
          mode: 'NAME_ONLY',
          completed: true,
          profileId: config.profileId,
          game: 'learn',
          variant: mode,
        },
        results.current,
      );
    } catch (e) {
      console.warn('[report] could not save the lesson', e);
    }
    results.current = [];
  };

  /** Meeting a word: each of its pictures in turn, "هاد… قطة". */
  const meet = async (s: Extract<Step, { kind: 'meet' }>, mine: number) => {
    const r = shell.audio.resolver;
    const line = s.ref.item.arFeminine ? lines.thisIsF : lines.thisIs;
    const count = Math.max(1, s.pictures.length);
    for (let v = 0; v < count; v++) {
      while (!shell.canPlay()) {
        await sleep(300);
        if (token.current !== mine || !shell.alive.current) return;
      }
      if (token.current !== mine) return;
      setMeetPicture(v);
      await Promise.race([shell.audio.say(r.spoken.flatMap((l) => [...r.line(line, l), r.nameIn(s.ref.item, l)])), sleep(5000)]);
      await sleep(900);
    }
    if (token.current !== mine) return;
    remember(s.ref.id);
    questionDone();
    go(index.current + 1);
  };

  const go = (i: number) => {
    token.current++;
    if (i >= steps.current.length) {
      void save();
      shell.finish();
      return;
    }
    index.current = i;
    busy.current = false;
    wrongs.current = 0;
    setCelebrated([]);
    setHint(null);
    setMeetPicture(0);
    setAt((a) => ({ i, run: a.run + 1 }));
    const s = steps.current[i];
    shell.audio.preload(s.kind === 'meet' ? [s.ref.item] : s.options.map((o) => o.item));
    if (s.kind === 'meet') void meet(s, token.current);
    else if (shell.canPlay()) void shell.audio.askLoop(question(s), 3);
  };

  const shell = useKidShell({
    pack,
    config,
    snapshot: props.snapshot,
    onStart: () => {
      steps.current = buildSteps({
        mode,
        fresh: config.learn?.fresh ?? [],
        review: config.learn?.review ?? [],
        known: config.learn?.known ?? [],
        refs,
        raw: rawRefs,
        learnPack: pack,
        random: Math.random,
      });
      results.current = [];
      go(0);
    },
    onResume: () => {
      const s = steps.current[index.current];
      if (s?.kind === 'pick') ask();
    },
  });

  const tap = (key: string) => {
    const s = steps.current[index.current];
    if (!s || s.kind !== 'pick' || busy.current || !shell.canPlay()) return;
    const option = s.options.find((o) => o.key === key);
    if (!option) return;
    busy.current = true;
    const r = shell.audio.resolver;
    if (s.targets.includes(key)) {
      const target = s.options.find((o) => o.key === s.targets[0])!;
      results.current.push({
        itemKey: target.item.key,
        packId: s.word?.pack.id ?? pack.id,
        firstTryCorrect: wrongs.current === 0,
        attempts: wrongs.current + 1,
        choiceCount: s.options.length,
      });
      setCelebrated(s.targets);
      setHint(null);
      const said = s.nameWrong ? r.names(s.askItem) : [r.correct(Math.random)];
      const mine = token.current;
      void Promise.all([sleep(CELEBRATION_MS), Promise.race([shell.audio.say(said), sleep(SAY_MAX_MS)])]).then(() => {
        if (token.current !== mine || !shell.alive.current || shell.stageRef.current !== 'playing') return;
        if (s.word) remember(s.word.id);
        questionDone();
        go(index.current + 1);
      });
      return;
    }
    // Not this one: say what it is (or the soft tone), then the question again.
    wrongs.current++;
    if (wrongs.current >= HINT_AFTER) setHint((h) => ({ key: s.targets[0], pulse: (h?.pulse ?? 0) + 1 }));
    void shell.audio.say([...(s.nameWrong ? r.names(option.item) : [r.incorrectTone()])]).then(() => {
      busy.current = false;
      ask();
    });
  };

  const area = useRef<HTMLDivElement>(null);
  const box = useBoxSize(area);
  const size = Math.floor(Math.min(box.w * 0.8, box.h * 0.8, 520));
  const packOf = (key: string) => (step?.kind === 'pick' ? (step.options.find((o) => o.key === key)?.pack.id ?? pack.id) : pack.id);
  const names =
    config.cardNames && step?.kind === 'pick' && step.nameWrong ? Object.fromEntries(step.options.map((o) => [o.key, o.item.name])) : undefined;

  return (
    <ShellFrame shell={shell} kind={`learn-${mode}`} {...props}>
      {step?.kind === 'meet' && (
        <div className="point-area" ref={area} key={at.run}>
          {size > 0 && (
            <div className={`option point-card learn-meet${config.cardNames ? ' named' : ''}`} style={{ width: size, height: size }} aria-hidden="true">
              <img key={meetPicture} src={step.pictures[meetPicture] ?? choosePictures([step.ref.item])[step.ref.item.key]} alt="" draggable={false} />
              {config.cardNames && <CardNames name={step.ref.item.name} />}
            </div>
          )}
        </div>
      )}
      {step?.kind === 'pick' && (
        <OptionGrid
          key={at.run}
          options={step.options.map((o) => o.key)}
          pictures={pictures}
          faded={[]}
          celebratedKey={celebrated.length ? celebrated : null}
          hint={hint}
          names={names}
          aliveFor={(key) => aliveMotion(packOf(key))}
          onTap={tap}
        />
      )}
    </ShellFrame>
  );
}
