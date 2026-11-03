import { useEffect, useMemo, useState } from 'react';
import { audioEngine } from '../../audio/audioEngine';
import { ClipResolver, findLine, type Clip } from '../../audio/clips';
import { GameAudio } from '../../audio/gameAudio';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import { loadRoutine, moveCard, saveRoutine, toggleCard, type RoutineState } from '../../settings/routine';
import { spokenLanguages, type GameLanguage } from '../../settings/settings';
import { choosePictures } from '../kid/layout';
import { Screen } from './components';

/**
 * Our day: routine cards to show her what comes next ("first shoes, then the park"). A big "Now"
 * card and a smaller "Next" one; "Done!" moves on and says the new "now… and then…". Tap a card to
 * hear its name. The parent chooses the cards and their order. Saved per child, for today.
 */
export function RoutineScreen({
  pack,
  packs,
  profileId,
  language,
  onBack,
}: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  profileId: string;
  language: GameLanguage;
  onBack: () => void;
}) {
  const { t, lang } = useI18n();
  const allKeys = useMemo(() => pack.items.map((i) => i.key), [pack]);
  const [state, setState] = useState<RoutineState>(() => loadRoutine(profileId, allKeys));
  const [editing, setEditing] = useState(false);
  const [cheer, setCheer] = useState(0);
  const pictures = useMemo(() => choosePictures(pack.items, () => 0), [pack]);
  const audio = useMemo(
    () =>
      new GameAudio(audioEngine, new ClipResolver(pack, spokenLanguages(language)), {
        mode: 'NAME_ONLY',
        repeatIntervalSec: 2,
        random: Math.random,
      }),
    [pack, language],
  );
  const then = useMemo(() => findLine(packs, 'then'), [packs]);
  const praise = useMemo(() => {
    const withPraise = packs.find((p) => p.feedback.correct.ar.length || p.feedback.correct.en.length);
    return withPraise ? new ClipResolver(withPraise, spokenLanguages(language)) : null;
  }, [packs, language]);
  useEffect(() => () => audio.stop(), [audio]);

  const item = (key: string | undefined): LoadedItem | undefined => pack.items.find((i) => i.key === key);
  const now = item(state.order[state.at]);
  const next = item(state.order[state.at + 1]);
  const done = state.at >= state.order.length;

  const change = (s: RoutineState) => {
    saveRoutine(profileId, s);
    setState(s);
  };
  /** "حمّام… وبعدين قصة". */
  const announce = (s: RoutineState, first: Clip[] = []) => {
    const n = item(s.order[s.at]);
    const nx = item(s.order[s.at + 1]);
    if (!n) {
      void audio.say(first);
      return;
    }
    const r = audio.resolver;
    void audio.say([...first, ...r.names(n), ...(nx ? r.spoken.flatMap((l) => [...r.line(then, l), r.nameIn(nx, l)]) : [])]);
  };
  const say = (it: LoadedItem | undefined) => {
    audioEngine.unlock();
    if (it) void audio.say(audio.resolver.names(it));
  };

  const markDone = () => {
    if (done) return;
    audioEngine.unlock();
    const s = { ...state, at: state.at + 1 };
    change(s);
    setCheer((c) => c + 1);
    announce(s, [praise?.correct(Math.random) ?? null].filter((c): c is Clip => c !== null));
  };
  const backOne = () => {
    if (state.at === 0) return;
    audioEngine.unlock();
    const s = { ...state, at: state.at - 1 };
    change(s);
    announce(s);
  };
  const startOver = () => {
    audioEngine.unlock();
    const s = { ...state, at: 0 };
    change(s);
    announce(s);
  };

  if (editing) {
    const inDay = state.order.map(item).filter((i): i is LoadedItem => i !== undefined);
    const outOfDay = pack.items.filter((i) => !state.order.includes(i.key));
    return (
      <Screen title={t('routineEdit')} onBack={() => setEditing(false)}>
        <p className="hint">{t('routineEditHint')}</p>
        <ol className="routine-list">
          {inDay.map((it, i) => (
            <li key={it.key} className="routine-row">
              <button type="button" className="routine-pick on" aria-pressed="true" onClick={() => change(toggleCard(state, it.key))}>
                <img src={pictures[it.key]} alt="" />
                <span>{it.name[lang]}</span>
              </button>
              <button type="button" className="btn ghost small" aria-label={t('routineMoveUp')} disabled={i === 0} onClick={() => change(moveCard(state, it.key, -1))}>
                ↑
              </button>
              <button
                type="button"
                className="btn ghost small"
                aria-label={t('routineMoveDown')}
                disabled={i === inDay.length - 1}
                onClick={() => change(moveCard(state, it.key, 1))}
              >
                ↓
              </button>
            </li>
          ))}
        </ol>
        {outOfDay.length > 0 && (
          <ul className="routine-list out">
            {outOfDay.map((it) => (
              <li key={it.key} className="routine-row">
                <button type="button" className="routine-pick" aria-pressed="false" onClick={() => change(toggleCard(state, it.key))}>
                  <img src={pictures[it.key]} alt="" />
                  <span>{it.name[lang]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn primary wide" onClick={() => setEditing(false)}>
          {t('routineSave')}
        </button>
      </Screen>
    );
  }

  return (
    <Screen title={t('routineTitle')} onBack={onBack}>
      <div className="routine">
        {done || !now ? (
          <div className="routine-finished">
            <span className="routine-moon" aria-hidden="true">
              🌙
            </span>
            <p>{t('routineFinished')}</p>
            <button type="button" className="btn primary wide" onClick={startOver}>
              {t('routineStartOver')}
            </button>
          </div>
        ) : (
          <>
            <div className="routine-cards">
              <button type="button" className="routine-card now" key={`now-${state.at}-${cheer}`} onClick={() => say(now)}>
                <span className="routine-label">{t('routineNow')}</span>
                <img src={pictures[now.key]} alt="" />
                <strong>{now.name[lang]}</strong>
              </button>
              {next && (
                <button type="button" className="routine-card next" key={`next-${state.at}`} onClick={() => say(next)}>
                  <span className="routine-label">{t('routineNext')}</span>
                  <img src={pictures[next.key]} alt="" />
                  <strong>{next.name[lang]}</strong>
                </button>
              )}
            </div>
            <div className="routine-strip" aria-hidden="true">
              {state.order.map((k, i) => (
                <img key={k} src={pictures[k]} alt="" className={i < state.at ? 'past' : i === state.at ? 'current' : ''} />
              ))}
            </div>
            <button type="button" className="btn primary wide big routine-done" onClick={markDone}>
              ✓ {t('routineDoneBtn')}
            </button>
            {state.at > 0 && (
              <button type="button" className="btn ghost wide" onClick={backOne}>
                {t('routineBack')}
              </button>
            )}
          </>
        )}
        <button type="button" className="btn ghost wide" onClick={() => setEditing(true)}>
          {t('routineEdit')}
        </button>
      </div>
    </Screen>
  );
}
