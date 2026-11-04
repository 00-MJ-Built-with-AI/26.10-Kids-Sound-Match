import { useMemo, useRef, useState } from 'react';
import { findLine, type Clip } from '../../audio/clips';
import type { LoadedItem, LoadedPack } from '../../content/types';
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

/** A right answer: confetti for a second. */
const CELEBRATE_MS = 1300;
/** A wrong tap can't be followed by another this fast. */
const WRONG_MS = 700;

/* ================================================================ Big and little */

/**
 * Big and little: the same picture twice, one big and one little. "قطة… وين الصغيرة؟" She taps the
 * little one (or the big one); a wrong tap gets the soft tone and the question again.
 */
export function KidBig(props: GameProps) {
  const { pack, packs, config } = props;
  const items = useMemo(() => pack.items.filter((i) => config.itemKeys.includes(i.key)), [pack, config]);
  const lines = useMemo(
    () => ({
      little: findLine(packs, 'where_little'),
      littleF: findLine(packs, 'where_little_f'),
      big: findLine(packs, 'where_big'),
      bigF: findLine(packs, 'where_big_f'),
    }),
    [packs],
  );
  const rounds = Math.min(config.questionsPerSession, 10);
  const [round, setRound] = useState<{ item: LoadedItem; picture: string; want: 'big' | 'little'; bigLeft: boolean; n: number } | null>(null);
  const [state, setState] = useState<{ right: boolean; wrong: 'big' | 'little' | null }>({ right: false, wrong: null });
  const order = useRef<LoadedItem[]>([]);
  const busy = useRef(false);

  const question = (r = round): Clip[] => {
    if (!r) return [];
    const res = shell.audio.resolver;
    const f = r.item.arFeminine;
    const line = r.want === 'little' ? (f ? lines.littleF : lines.little) : f ? lines.bigF : lines.big;
    return res.spoken.flatMap((l) => [res.nameIn(r.item, l), ...res.line(line, l)]);
  };
  const ask = (r = round) => {
    if (shell.canPlay()) void shell.audio.askLoop(question(r));
  };
  const deal = (n: number) => {
    const item = order.current[n % order.current.length];
    const r = { item, picture: choosePictures([item])[item.key], want: Math.random() < 0.5 ? ('little' as const) : ('big' as const), bigLeft: Math.random() < 0.5, n };
    busy.current = false;
    setState({ right: false, wrong: null });
    setRound(r);
    shell.audio.preload([item]);
    ask(r);
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      order.current = shuffle(items);
      deal(0);
    },
    onResume: () => {
      if (!busy.current) ask();
    },
  });

  const tap = (which: 'big' | 'little') => {
    if (!round || busy.current || !shell.canPlay()) return;
    if (which !== round.want) {
      busy.current = true;
      setState({ right: false, wrong: which });
      void shell.audio.say([shell.audio.resolver.incorrectTone(), ...question()]);
      void sleep(WRONG_MS).then(() => {
        busy.current = false;
        setState({ right: false, wrong: null });
      });
      return;
    }
    busy.current = true;
    setState({ right: true, wrong: null });
    void shell.audio.say(shell.audio.resolver.names(round.item));
    void sleep(CELEBRATE_MS).then(() => {
      if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
      questionDone();
      if (round.n + 1 >= rounds) shell.finish();
      else deal(round.n + 1);
    });
  };

  const card = (which: 'big' | 'little') =>
    round && (
      <button
        type="button"
        key={`${round.n}-${which}`}
        className={`big-card ${which}${state.right && which === round.want ? ` celebrate ${aliveMotion(pack.id)}` : ''}${state.wrong === which ? ' nope' : ''}`}
        tabIndex={-1}
        aria-hidden="true"
        onPointerDown={() => tap(which)}
      >
        <img src={round.picture} alt="" draggable={false} />
        {state.right && which === round.want && <Burst size={220} />}
      </button>
    );

  return (
    <ShellFrame shell={shell} kind="big" {...props}>
      {round && (
        <div className={`big-area${round.bigLeft ? '' : ' flip'}`}>
          {card('big')}
          {card('little')}
        </div>
      )}
    </ShellFrame>
  );
}

/* ================================================================ What's missing? */

/**
 * What's missing?: three pictures, each named as it pops in. A blanket falls over one of them:
 * "قطة… وين راحت؟" She taps the blanket and it lifts: "بَخ!" and the name. Tapping a picture that
 * is still there says its name.
 */
export function KidMissing(props: GameProps) {
  const { pack, packs, config } = props;
  const items = useMemo(() => pack.items.filter((i) => config.itemKeys.includes(i.key)), [pack, config]);
  const gone = useMemo(() => ({ m: findLine(packs, 'where_gone'), f: findLine(packs, 'where_gone_f') }), [packs]);
  const peekaboo = useMemo(() => pack.feedback.peekaboo ?? packs.find((p) => p.feedback.peekaboo)?.feedback.peekaboo, [pack, packs]);
  const rounds = Math.min(Math.ceil(config.questionsPerSession / 2), 6);
  const [round, setRound] = useState<{ three: LoadedItem[]; pictures: Record<string, string>; hidden: number; n: number } | null>(null);
  const [phase, setPhase] = useState<'show' | 'hidden' | 'found'>('show');
  const [said, setSaid] = useState<number | null>(null);
  const busy = useRef(true);
  const bag = useRef<LoadedItem[]>([]);

  const question = (r = round): Clip[] => {
    if (!r) return [];
    const res = shell.audio.resolver;
    const it = r.three[r.hidden];
    return res.spoken.flatMap((l) => [res.nameIn(it, l), ...res.line(it.arFeminine ? gone.f : gone.m, l)]);
  };
  const deal = async (n: number) => {
    if (bag.current.length < 3) bag.current = shuffle(items);
    const three = bag.current.splice(0, 3);
    const r = { three, pictures: choosePictures(three), hidden: Math.floor(Math.random() * 3), n };
    busy.current = true;
    setPhase('show');
    setRound(r);
    shell.audio.preload(three);
    // Each picture is named as it pops in, then the blanket falls.
    for (let i = 0; i < 3; i++) {
      if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
      setSaid(i);
      await Promise.all([shell.canPlay() ? shell.audio.say(shell.audio.resolver.names(three[i])) : null, sleep(900)]);
    }
    setSaid(null);
    await sleep(600);
    if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
    setPhase('hidden');
    await sleep(900);
    busy.current = false;
    if (shell.canPlay()) void shell.audio.askLoop(question(r));
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      bag.current = shuffle(items);
      void deal(0);
    },
    onResume: () => {
      if (!busy.current && phase === 'hidden') void shell.audio.askLoop(question());
    },
  });

  const tap = (i: number) => {
    if (!round || busy.current || !shell.canPlay() || phase !== 'hidden') return;
    const res = shell.audio.resolver;
    if (i !== round.hidden) {
      setSaid(i);
      void shell.audio.say([...res.names(round.three[i]), ...question()]);
      void sleep(900).then(() => setSaid(null));
      return;
    }
    busy.current = true;
    setPhase('found');
    void shell.audio.say([...res.peekaboo(peekaboo), ...res.names(round.three[i])]);
    void sleep(2200).then(() => {
      if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
      questionDone();
      if (round.n + 1 >= rounds) shell.finish();
      else void deal(round.n + 1);
    });
  };

  return (
    <ShellFrame shell={shell} kind="missing" {...props}>
      {round && (
        <div className="shelf" key={round.n}>
          <div className="shelf-row">
            {round.three.map((it, i) => (
              <button
                type="button"
                key={it.key}
                className={`shelf-spot${said === i ? ' said' : ''}`}
                style={{ animationDelay: `${i * 0.9}s` }}
                tabIndex={-1}
                aria-hidden="true"
                onPointerDown={() => tap(i)}
              >
                <img src={round.pictures[it.key]} alt="" draggable={false} />
                {i === round.hidden && phase !== 'show' && (
                  <span className={`shelf-blanket${phase === 'found' ? ' lift' : ''}`}>
                    <span className="shelf-blanket-dots" />
                  </span>
                )}
                {i === round.hidden && phase === 'found' && <Burst size={160} />}
              </button>
            ))}
          </div>
          <div className="shelf-board" />
        </div>
      )}
    </ShellFrame>
  );
}

/* ================================================================ Count with me */

/**
 * Count with me: "يلّا نعدّ!" and 1 to 3 animals. She taps each one: it hops, makes its sound, and
 * the number is said (واحد، اثنين، ثلاثة). When all are counted, the last number again, and confetti.
 */
export function KidCount(props: GameProps) {
  const { pack, packs, config } = props;
  const animals = useMemo(() => pack.items.filter((i) => config.itemKeys.includes(i.key) && i.sound), [pack, config]);
  const counting = useMemo(() => packs.find((p) => p.id === 'counting'), [packs]);
  const countLine = useMemo(() => findLine(packs, 'count'), [packs]);
  const rounds = Math.min(Math.ceil(config.questionsPerSession / 2), 6);
  const [round, setRound] = useState<{ animal: LoadedItem; picture: string; n: number; how: number } | null>(null);
  const [counted, setCounted] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const busy = useRef(false);

  const number = (k: number): Clip[] => {
    const item = counting?.items.find((i) => i.key === `count_${k}`);
    return item ? shell.audio.resolver.names(item) : [];
  };
  const deal = (n: number) => {
    const animal = animals[Math.floor(Math.random() * animals.length)];
    // Mostly 2 or 3; sometimes 1.
    const how = [1, 2, 2, 3, 3, 3][Math.floor(Math.random() * 6)];
    setRound({ animal, picture: choosePictures([animal])[animal.key], n, how });
    setCounted([]);
    setDone(false);
    busy.current = false;
    shell.audio.preload([animal]);
    if (shell.canPlay()) void shell.audio.say(n === 0 ? [...shell.audio.resolver.line(countLine), ...shell.audio.resolver.names(animal)] : shell.audio.resolver.names(animal));
  };
  const shell = useKidShell({ ...props, onStart: () => deal(0) });

  const tap = (i: number) => {
    if (!round || busy.current || !shell.canPlay() || counted.includes(i)) return;
    const next = [...counted, i];
    setCounted(next);
    const k = next.length;
    if (k < round.how) {
      void shell.audio.say(number(k));
      return;
    }
    busy.current = true;
    void (async () => {
      await shell.audio.say(number(k));
      if (!shell.alive.current) return;
      setDone(true);
      await Promise.all([shell.audio.say([...number(k), shell.audio.resolver.sound(round.animal)]), sleep(1600)]);
      if (!shell.alive.current || shell.stageRef.current !== 'playing') return;
      questionDone();
      if (round.n + 1 >= rounds) shell.finish();
      else deal(round.n + 1);
    })();
  };

  return (
    <ShellFrame shell={shell} kind="count" {...props}>
      {round && (
        <div className={`count-area${done ? ' done' : ''}`} key={round.n}>
          <div className={`count-row n${round.how}`}>
            {Array.from({ length: round.how }, (_, i) => {
              const at = counted.indexOf(i);
              return (
                <button
                  type="button"
                  key={i}
                  className={`count-thing${at >= 0 ? ' counted' : ''}`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                  tabIndex={-1}
                  aria-hidden="true"
                  onPointerDown={() => tap(i)}
                >
                  <img src={round.picture} alt="" draggable={false} />
                  {at >= 0 && <span className="count-badge">{at + 1}</span>}
                </button>
              );
            })}
          </div>
          {done && (
            <div className="count-total">
              <span className="count-num">{round.how}</span>
              <Burst size={240} />
            </div>
          )}
        </div>
      )}
    </ShellFrame>
  );
}
