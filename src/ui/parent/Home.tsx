import type { LoadedPack } from '../../content/types';
import type { ChoiceCount } from '../../engine';
import { useI18n } from '../../i18n/I18n';
import type { MemoryNext } from '../../report/levels';
import type { NextLevel } from '../../report/practice';
import type { ProfileState } from '../../settings/profiles';
import { effectiveMode, enabledItemKeys, type Settings } from '../../settings/settings';
import type { ReactNode } from 'react';
import type { KidKind } from '../kid/kidSnapshot';
import {
  ActionsIcon,
  BigIcon,
  BookIcon,
  BubblesIcon,
  CountIcon,
  HuntIcon,
  MissingIcon,
  SingIcon,
  SoundsIcon,
  TidyIcon,
  FeelIcon,
  PlayIcon,
  MoonIcon,
  PuzzleIcon,
  ShapesIcon,
  OppositesIcon,
  CareIcon,
  DayIcon,
  ExploreIcon,
  MemoryIcon,
  OddIcon,
  PeekabooIcon,
  PointIcon,
  SceneIcon,
  TalkIcon,
  TurnsIcon,
} from '../kid/icons';
import { ChevronIcon } from './components';
import { ProfileRow } from './ProfileRow';

export type HomeLink = 'report' | 'words' | 'settings' | 'myPacks' | 'flashcards' | 'studio' | 'parentsGroup' | 'privacy' | 'about';

/** Spec 5.2: title, settings summary, a large START button, and the parent links. */
export function Home({
  pack,
  settings,
  canStart,
  canExplore,
  showParentsGroup,
  profiles,
  onProfile,
  nudge,
  memoryNudge,
  canOdd,
  canScene,
  canPoint,
  canActions,
  onStart,
  onExplore,
  onMemory,
  onOdd,
  onPeekaboo,
  onScene,
  onPoint,
  onActions,
  canCare,
  canRoutine,
  onTalk,
  onBook,
  onCare,
  onTurns,
  onRoutine,
  canSounds,
  canHunt,
  canSing,
  canTidy,
  onGame,
  plan,
  onOpen,
  onNudgeAccept,
  onNudgeDismiss,
  onMemoryNudgeAccept,
  onMemoryNudgeDismiss,
}: {
  /** Undefined when no pack is ready to play yet (the parent can still make one in My packs). */
  pack: LoadedPack | undefined;
  settings: Settings;
  canStart: boolean;
  canExplore: boolean;
  showParentsGroup: boolean;
  profiles: ProfileState;
  onProfile: (id: string) => void;
  nudge: NextLevel | null;
  /** "Ready for more memory cards?" */
  memoryNudge: MemoryNext | null;
  canOdd: boolean;
  /** Find it in the picture: at least one scene has enough things to find. */
  canScene: boolean;
  /** Where's your nose?: the body-part questions exist in the game's language. */
  canPoint: boolean;
  canActions: boolean;
  onStart: () => void;
  onExplore: () => void;
  onMemory: () => void;
  onOdd: () => void;
  onPeekaboo: () => void;
  onScene: () => void;
  onPoint: () => void;
  onActions: () => void;
  /** Look after the baby: its pack is ready. */
  canCare: boolean;
  /** Our day: its cards are ready. */
  canRoutine: boolean;
  onTalk: () => void;
  onBook: () => void;
  onCare: () => void;
  onTurns: () => void;
  onRoutine: () => void;
  canSounds: boolean;
  canHunt: boolean;
  canSing: boolean;
  canTidy: boolean;
  /** The newer games, by kind. */
  onGame: (kind: KidKind) => void;
  /** Today's play: three games, and whether each was played today. */
  plan: { kind: KidKind; done: boolean }[];
  onOpen: (link: HomeLink) => void;
  onNudgeAccept: (to: ChoiceCount) => void;
  onNudgeDismiss: (nudge: NextLevel) => void;
  onMemoryNudgeAccept: (to: number) => void;
  onMemoryNudgeDismiss: (nudge: MemoryNext) => void;
}) {
  const { t, lang } = useI18n();
  const modeLabel = { SOUND_AND_NAME: t('modeSoundAndName'), SOUND_ONLY: t('modeSoundOnly'), NAME_ONLY: t('modeNameOnly') }[
    pack ? effectiveMode(pack, settings.mode) : settings.mode
  ];
  const languageLabel = { ar: 'العربية', en: 'English', both: 'العربية + English', both_en: 'English + العربية' }[settings.language];
  // "Who eats what?" always asks about the animal, and has no Toddler mode.
  const association = pack?.kind === 'association';
  const summary = pack
    ? [
        pack.name[lang],
        ...(association ? [] : [modeLabel]),
        languageLabel,
        t('summaryPictures', { n: settings.choiceCount }),
        t('summaryQuestions', { n: settings.questionsPerSession }),
        t(pack.id === 'animals' ? 'summaryAnimals' : 'summaryItems', { n: enabledItemKeys(pack, settings).length }),
        ...(settings.toddlerMode && !association ? [t('toddlerMode')] : []),
      ]
    : [];
  const links: { id: HomeLink; label: string; icon: string }[] = [
    { id: 'report', label: t('report'), icon: '📊' },
    { id: 'words', label: t('wordsTitle'), icon: '🗣️' },
    { id: 'settings', label: t('settings'), icon: '⚙️' },
    { id: 'myPacks', label: t('myPacks'), icon: '🎨' },
    { id: 'flashcards', label: t('flashcards'), icon: '🖨️' },
    // The recording studio saves into the app's files, so it only exists on the PC's dev server.
    ...(import.meta.env.DEV ? [{ id: 'studio' as const, label: t('studio'), icon: '🎙️' }] : []),
    ...(showParentsGroup ? [{ id: 'parentsGroup' as const, label: t('parentsGroup'), icon: '💬' }] : []),
    { id: 'privacy', label: t('privacyPolicy'), icon: '🔒' },
    { id: 'about', label: t('about'), icon: 'ℹ️' },
  ];

  type Tile = { id: string; icon: ReactNode; label: string; sub: string; on: () => void; ok: boolean };
  const together: Tile[] = [
    { id: 'talk', icon: <TalkIcon />, label: t('talkGame'), sub: t('talkSub'), on: onTalk, ok: canExplore },
    { id: 'sounds', icon: <SoundsIcon />, label: t('soundsGame'), sub: t('soundsSub'), on: () => onGame('sounds'), ok: canSounds },
    { id: 'sing', icon: <SingIcon />, label: t('singGame'), sub: t('singSub'), on: () => onGame('sing'), ok: canSing },
    { id: 'point', icon: <PointIcon />, label: t('pointGame'), sub: t('pointSub'), on: onPoint, ok: canPoint },
    { id: 'actions', icon: <ActionsIcon />, label: t('actionsGame'), sub: t('actionsSub'), on: onActions, ok: canActions },
    { id: 'hunt', icon: <HuntIcon />, label: t('huntGame'), sub: t('huntSub'), on: () => onGame('hunt'), ok: canHunt },
    { id: 'feel', icon: <FeelIcon />, label: t('feelGame'), sub: t('feelSub'), on: () => onGame('feel'), ok: true },
    { id: 'book', icon: <BookIcon />, label: t('bookGame'), sub: t('bookSub'), on: onBook, ok: canExplore },
    { id: 'bedtime', icon: <MoonIcon />, label: t('bedtimeGame'), sub: t('bedtimeSub'), on: () => onGame('bedtime'), ok: canExplore },
    { id: 'turns', icon: <TurnsIcon />, label: t('turnsGame'), sub: t('turnsSub'), on: onTurns, ok: canStart },
    { id: 'routine', icon: <DayIcon />, label: t('routineTitle'), sub: t('routineSub'), on: onRoutine, ok: canRoutine },
  ];
  const hers: Tile[] = [
    { id: 'peekaboo', icon: <PeekabooIcon />, label: t('peekaboo'), sub: t('peekabooSub'), on: onPeekaboo, ok: canExplore },
    { id: 'bubbles', icon: <BubblesIcon />, label: t('bubblesGame'), sub: t('bubblesSub'), on: () => onGame('bubbles'), ok: canExplore },
    { id: 'care', icon: <CareIcon />, label: t('careGame'), sub: t('careSub'), on: onCare, ok: canCare },
    { id: 'explore', icon: <ExploreIcon />, label: t('explore'), sub: t('exploreSub'), on: onExplore, ok: canExplore },
    { id: 'puzzle', icon: <PuzzleIcon />, label: t('puzzleGame'), sub: t('puzzleSub'), on: () => onGame('puzzle'), ok: canExplore },
    { id: 'shapes', icon: <ShapesIcon />, label: t('shapesGame'), sub: t('shapesSub'), on: () => onGame('shapes'), ok: true },
    { id: 'big', icon: <BigIcon />, label: t('bigGame'), sub: t('bigSub'), on: () => onGame('big'), ok: canExplore },
    { id: 'opposites', icon: <OppositesIcon />, label: t('oppositesGame'), sub: t('oppositesSub'), on: () => onGame('opposites'), ok: true },
    { id: 'count', icon: <CountIcon />, label: t('countGame'), sub: t('countSub'), on: () => onGame('count'), ok: canSounds },
    { id: 'missing', icon: <MissingIcon />, label: t('missingGame'), sub: t('missingSub'), on: () => onGame('missing'), ok: canStart },
    { id: 'tidy', icon: <TidyIcon />, label: t('tidyGame'), sub: t('tidySub'), on: () => onGame('tidy'), ok: canTidy },
    { id: 'scene', icon: <SceneIcon />, label: t('sceneGame'), sub: t('sceneSub'), on: onScene, ok: canScene },
    { id: 'memory', icon: <MemoryIcon />, label: t('memoryGame'), sub: t('memorySub', { n: settings.memoryPairs }), on: onMemory, ok: canExplore },
    { id: 'odd', icon: <OddIcon />, label: t('oddOneOut'), sub: t('oddSub'), on: onOdd, ok: canOdd },
  ];

  return (
    <div className="parent home">
      <header className="home-header">
        <img src="icon.svg" alt="" className="home-logo" />
        <h1>{t('appName')}</h1>
        <p className="tagline">{t('appTagline')}</p>
      </header>

      {profiles.profiles.length > 1 && (
        <div className="who-plays">
          <span className="muted">{t('whoIsPlaying')}</span>
          <ProfileRow profiles={profiles.profiles} activeId={profiles.activeId} onSelect={onProfile} />
        </div>
      )}

      <button type="button" className="start-btn" onClick={onStart} disabled={!canStart}>
        {t('start')}
      </button>
      {/* Today's play: three games for today, ticked once played. */}
      {plan.length > 0 && (
        <section className="card plan-card">
          <h2>☀️ {t('planTitle')}</h2>
          <p className="hint">{t('planHint')}</p>
          <div className="plan-row">
            {plan.map(({ kind, done }) => {
              const tile = [
                ...together,
                ...hers,
                { id: 'game', icon: <PlayIcon />, label: t('matchGame'), sub: '', on: onStart, ok: canStart },
              ].find((x) => x.id === kind);
              if (!tile) return null;
              return (
                <button type="button" key={kind} className={`plan-tile tile-${kind}${done ? ' done' : ''}`} onClick={tile.on} disabled={!tile.ok}>
                  {tile.icon}
                  <strong>{tile.label}</strong>
                  {done && <span className="plan-done">✓ {t('planDone')}</span>}
                </button>
              );
            })}
          </div>
        </section>
      )}
      {/* Games played together (the parent ticks), then the ones she plays herself. */}
      {[
        { title: t('homeTogether'), sub: t('homeTogetherSub'), tiles: together },
        { title: t('homeHer'), sub: t('homeHerSub'), tiles: hers },
      ].map((group) => (
        <section key={group.title} className="games-group">
          <h2 className="games-title">
            {group.title}
            <small>{group.sub}</small>
          </h2>
          <div className="games-row">
            {group.tiles.map((g) => (
              <button type="button" key={g.id} className={`game-tile tile-${g.id}`} onClick={g.on} disabled={!g.ok}>
                {g.icon}
                <strong>{g.label}</strong>
                <small>{g.sub}</small>
              </button>
            ))}
          </div>
        </section>
      ))}
      {!pack ? (
        <p className="note">{t('noPackReady')}</p>
      ) : (
        !canStart && <p className="note">{t('needMoreItems')}</p>
      )}

      {nudge && (
        <section className="card nudge-card" role="status">
          <h2>{t('nudgeTitle')}</h2>
          <p>{t('nudgeBody', { p: nudge.percent, from: nudge.from, to: nudge.to })}</p>
          <div className="nudge-actions">
            <button type="button" className="btn primary" onClick={() => onNudgeAccept(nudge.to as ChoiceCount)}>
              {t('nudgeAccept', { to: nudge.to })}
            </button>
            <button type="button" className="btn ghost" onClick={() => onNudgeDismiss(nudge)}>
              {t('nudgeDismiss')}
            </button>
          </div>
        </section>
      )}

      {memoryNudge && (
        <section className="card nudge-card" role="status">
          <h2>{t('memoryNudgeTitle')}</h2>
          <p>{t('memoryNudgeBody', { from: memoryNudge.from, to: memoryNudge.to })}</p>
          <div className="nudge-actions">
            <button type="button" className="btn primary" onClick={() => onMemoryNudgeAccept(memoryNudge.to)}>
              {t('memoryNudgeAccept', { to: memoryNudge.to })}
            </button>
            <button type="button" className="btn ghost" onClick={() => onMemoryNudgeDismiss(memoryNudge)}>
              {t('nudgeDismiss')}
            </button>
          </div>
        </section>
      )}

      {summary.length > 0 && (
        <ul className="summary" aria-label={t('settings')}>
          {summary.map((s) => (
            <li key={s} className="pill">
              {s}
            </li>
          ))}
        </ul>
      )}

      {__ALLOW_PLACEHOLDERS__ && <p className="note">{t('testBuildNote')}</p>}

      <nav className="links" aria-label={t('forParents')}>
        <h2>{t('forParents')}</h2>
        {links.map((l) => (
          <button type="button" key={l.id} className="link-row" onClick={() => onOpen(l.id)}>
            <span className="link-icon" aria-hidden="true">
              {l.icon}
            </span>
            <span className="link-label">{l.label}</span>
            <ChevronIcon />
          </button>
        ))}
      </nav>
    </div>
  );
}
