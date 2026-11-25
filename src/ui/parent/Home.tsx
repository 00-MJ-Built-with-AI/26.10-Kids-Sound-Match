import type { LoadedPack } from '../../content/types';
import type { ChoiceCount } from '../../engine';
import { useI18n } from '../../i18n/I18n';
import type { MemoryNext } from '../../report/levels';
import type { NextLevel } from '../../report/practice';
import type { ProfileState } from '../../settings/profiles';
import { effectiveMode, enabledItemKeys, type Settings } from '../../settings/settings';
import { useState, type ReactNode } from 'react';
import type { KidKind } from '../kid/kidSnapshot';
import type { Certificate } from '../../settings/milestones';
import type { Season } from '../../settings/season';
import { EidCelebration, SeasonCard } from './Season';
import { SLEEP_MINUTES, type SleepPrefs } from '../../settings/sleepLight';
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
  PaintIcon,
  MusicIcon,
  HideIcon,
  SleepIcon,
  PottyIcon,
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
import { ChevronIcon, Overlay, Segmented, Toggle } from './components';
import { forLater, GAME_AGES, gamePicture } from './games';
import { TIPS } from './tips';
import { HomeHeader } from './HomeHeader';
import { WeekCheckin } from './WeekCheckin';
import { TimelineCard } from './TimelineCard';
import { UpdateStamp } from './UpdateStamp';
import { Avatar, ProfileRow } from './ProfileRow';

import { local } from '../../settings/storage';

const WEEK_CARD_KEY = 'ksm.weekCard.v1';
/** "All games" on Home: open or folded, as the parent last left it. */
const ALL_GAMES_KEY = 'ksm.allGamesOpen.v1';

export type HomeLink = 'report' | 'words' | 'milestones' | 'snap' | 'settings' | 'myPacks' | 'flashcards' | 'studio' | 'parentsGroup' | 'privacy' | 'about' | 'timeline' | 'familyCircle';

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
  canStory,
  canPaint,
  canHide,
  onGame,
  plan,
  topPlayed,
  allPacks,
  checkin,
  onCheckinDone,
  message,
  onMessagePlay,
  onMessageDone,
  favourites,
  onFavourites,
  newCert,
  onCertSeen,
  season,
  onSeasonPlay,
  sleepPrefs,
  onSleep,
  onPotty,
  canPhrases,
  canManners,
  canLearn,
  canInstructions,
  canRhymes,
  hasBooks,
  canCups,
  canGarden,
  lesson,
  ageMonths,
  askBirth,
  onBirth,
  canMenu,
  recordLeft,
  onRecordToday,
  onRecordLater,
  twoWordsCard,
  onTwoWords,
  celebrate,
  onCelebrated,
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
  /** Stories: its pack is ready. */
  canStory: boolean;
  /** Finger painting and Make music: the Colours pack is ready. */
  canPaint: boolean;
  canHide: boolean;
  /** The newer games, by kind. */
  onGame: (kind: KidKind) => void;
  /** Today's play: three games, and whether each was played today. */
  plan: { kind: KidKind; done: boolean }[];
  /** The games she plays most (last 30 days), for "Her games" at the top. */
  topPlayed: readonly string[];
  /** Every pack, for the pictures of her new words in the week card. */
  allPacks: readonly LoadedPack[];
  /** Her week: the check-in card is due. */
  checkin: boolean;
  onCheckinDone: () => void;
  /** The newest voice message from the family she hasn't heard yet. */
  message: { id: string; from: string } | null;
  onMessagePlay: () => void;
  onMessageDone: () => void;
  /** Her favourite games (tile ids), shown first; empty = not chosen yet. */
  favourites: readonly string[];
  onFavourites: (ids: string[]) => void;
  /** A certificate she just earned, celebrated once. */
  newCert: Certificate | null;
  /** Seen: `open` goes to where her certificates are. */
  onCertSeen: (open: boolean) => void;
  /** The sleep light: its last settings, and turning it on with these. */
  sleepPrefs: SleepPrefs;
  onSleep: (prefs: SleepPrefs) => void;
  onPotty: () => void;
  canPhrases: boolean;
  canManners: boolean;
  /** The Learn section's games. */
  canLearn: boolean;
  canInstructions: boolean;
  /** Song time: the starter rhymes or a song of the parent's own. */
  canRhymes: boolean;
  /** At least one of her books (My packs > New book) has a finished page. */
  hasBooks: boolean;
  canCups: boolean;
  canGarden: boolean;
  /** Her age in months, from her birth month; null when it isn't set. */
  ageMonths: number | null;
  /** Ask for her birth month (it isn't set, and the parent hasn't said "not now"). */
  askBirth: boolean;
  /** A birth month (YYYY-MM), or null for "not now". */
  onBirth: (month: string | null) => void;
  /** Today's lesson: the new words, and how many to review; null before it's worked out. */
  lesson: { words: { picture: string; name: { en: string; ar: string } }[]; review: number } | null;
  /** Her own menu: there are enough games to choose from. */
  canMenu: boolean;
  /** Words still to record; 0 hides the card (done for today, or put off). */
  recordLeft: number;
  onRecordToday: () => void;
  onRecordLater: () => void;
  /** She said a phrase and "two words together" isn't ticked yet. */
  twoWordsCard: boolean;
  onTwoWords: (tick: boolean) => void;
  /** Ramadan or Eid (lanterns on the header, a card with the Ramadan and Eid words). */
  season: Season | null;
  onSeasonPlay?: (kind: 'game' | 'explore') => void;
  /** Eid Mubarak!: the once-a-day celebration. */
  celebrate: boolean;
  onCelebrated: () => void;
  onOpen: (link: HomeLink) => void;
  onNudgeAccept: (to: ChoiceCount) => void;
  onNudgeDismiss: (nudge: NextLevel) => void;
  onMemoryNudgeAccept: (to: number) => void;
  onMemoryNudgeDismiss: (nudge: MemoryNext) => void;
}) {
  const { t, lang } = useI18n();
  const [tipFor, setTipFor] = useState<string | null>(null);
  const [picking, setPicking] = useState<string[] | null>(null);
  const [sleeping, setSleeping] = useState<SleepPrefs | null>(null);
  // Fridays: her week is ready to share with the family (until the parent opens or closes it).
  const day = new Date().toDateString();
  const [weekCard, setWeekCard] = useState(() => new Date().getDay() === 5 && local.get(WEEK_CARD_KEY) !== day);
  const closeWeekCard = () => {
    local.set(WEEK_CARD_KEY, day);
    setWeekCard(false);
  };
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
    { id: 'milestones', label: t('milestonesTitle'), icon: '🌱' },
    { id: 'snap', label: t('snapTitle'), icon: '📷' },
    { id: 'settings', label: t('settings'), icon: '⚙️' },
    { id: 'myPacks', label: t('myPacks'), icon: '🎨' },
    { id: 'flashcards', label: t('flashcards'), icon: '🖨️' },
    { id: 'timeline', label: t('timelineTitle'), icon: '🎞️' },
    { id: 'familyCircle', label: t('familyCircleTitle'), icon: '👨‍👩‍👧' },
    // The recording studio saves into the app's files, so it only exists on the PC's dev server.
    ...(import.meta.env.DEV ? [{ id: 'studio' as const, label: t('studio'), icon: '🎙️' }] : []),
    ...(showParentsGroup ? [{ id: 'parentsGroup' as const, label: t('parentsGroup'), icon: '💬' }] : []),
    { id: 'privacy', label: t('privacyPolicy'), icon: '🔒' },
    { id: 'about', label: t('about'), icon: 'ℹ️' },
  ];

  type Tile = { id: string; icon: ReactNode; label: string; sub: string; on: () => void; ok: boolean };
  const activeProfile = profiles.profiles.find((p) => p.id === profiles.activeId);
  const together: Tile[] = [
    { id: 'talk', icon: <TalkIcon />, label: t('talkGame'), sub: t('talkSub'), on: onTalk, ok: canExplore },
    ...(canPhrases ? [{ id: 'phrases', icon: <TalkIcon />, label: t('phrasesGame'), sub: t('phrasesSub'), on: () => onGame('phrases'), ok: true }] : []),
    ...(canManners ? [{ id: 'manners', icon: <TalkIcon />, label: t('mannersGame'), sub: t('mannersSub'), on: () => onGame('manners'), ok: true }] : []),
    { id: 'sounds', icon: <SoundsIcon />, label: t('soundsGame'), sub: t('soundsSub'), on: () => onGame('sounds'), ok: canSounds },
    { id: 'rhymes', icon: <SingIcon />, label: t('rhymesGame'), sub: t('rhymesSub'), on: () => onGame('rhymes'), ok: canRhymes },
    { id: 'sing', icon: <SingIcon />, label: t('singGame'), sub: t('singSub'), on: () => onGame('sing'), ok: canSing },
    // With no book yet, the tile opens My packs to make one.
    { id: 'daybook', icon: <BookIcon />, label: t('daybookGame'), sub: hasBooks ? t('daybookSub') : t('daybookMake'), on: () => (hasBooks ? onGame('daybook') : onOpen('myPacks')), ok: true },
    { id: 'bring', icon: <HuntIcon />, label: t('bringGame'), sub: t('bringSub'), on: () => onGame('bring'), ok: true },
    { id: 'camera', icon: <HuntIcon />, label: t('cameraGame'), sub: t('cameraSub'), on: () => onGame('camera'), ok: true },
    { id: 'mystory', icon: <BookIcon />, label: t('mystoryGame'), sub: t('mystorySub'), on: () => onGame('mystory'), ok: true },
    { id: 'point', icon: <PointIcon />, label: t('pointGame'), sub: t('pointSub'), on: onPoint, ok: canPoint },
    { id: 'actions', icon: <ActionsIcon />, label: t('actionsGame'), sub: t('actionsSub'), on: onActions, ok: canActions },
    { id: 'hunt', icon: <HuntIcon />, label: t('huntGame'), sub: t('huntSub'), on: () => onGame('hunt'), ok: canHunt },
    { id: 'feel', icon: <FeelIcon />, label: t('feelGame'), sub: t('feelSub'), on: () => onGame('feel'), ok: true },
    { id: 'book', icon: <BookIcon />, label: t('bookGame'), sub: t('bookSub'), on: onBook, ok: canExplore },
    { id: 'story', icon: <BookIcon />, label: t('storyGame'), sub: t('storySub'), on: () => onGame('story'), ok: canStory },
    { id: 'sleep', icon: <SleepIcon />, label: t('sleepGame'), sub: t('sleepSub'), on: () => setSleeping({ ...sleepPrefs }), ok: true },
    { id: 'potty', icon: <PottyIcon />, label: t('pottyTitle'), sub: t('pottySub'), on: onPotty, ok: true },
    { id: 'bedtime', icon: <MoonIcon />, label: t('bedtimeGame'), sub: t('bedtimeSub'), on: () => onGame('bedtime'), ok: canExplore },
    { id: 'turns', icon: <TurnsIcon />, label: t('turnsGame'), sub: t('turnsSub'), on: onTurns, ok: canStart },
    { id: 'routine', icon: <DayIcon />, label: t('routineTitle'), sub: t('routineSub'), on: onRoutine, ok: canRoutine },
  ];
  const hers: Tile[] = [
    { id: 'peekaboo', icon: <PeekabooIcon />, label: t('peekaboo'), sub: t('peekabooSub'), on: onPeekaboo, ok: canExplore },
    { id: 'paint', icon: <PaintIcon />, label: t('paintGame'), sub: t('paintSub'), on: () => onGame('paint'), ok: canPaint },
    { id: 'music', icon: <MusicIcon />, label: t('musicGame'), sub: t('musicSub'), on: () => onGame('music'), ok: canPaint },
    { id: 'hide', icon: <HideIcon />, label: t('hideGame'), sub: t('hideSub'), on: () => onGame('hide'), ok: canHide },
    { id: 'cups', icon: <HideIcon />, label: t('cupsGame'), sub: t('cupsSub'), on: () => onGame('cups'), ok: canCups },
    { id: 'garden', icon: <MusicIcon />, label: t('gardenGame'), sub: t('gardenSub'), on: () => onGame('garden'), ok: canGarden },
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

  const learn: Tile[] = canLearn
    ? [
        { id: 'lesson', icon: <BookIcon />, label: t('lessonGame'), sub: t('lessonSub'), on: () => onGame('lesson'), ok: true },
        { id: 'variety', icon: <PlayIcon />, label: t('varietyGame'), sub: t('varietySub'), on: () => onGame('variety'), ok: true },
        { id: 'newone', icon: <PlayIcon />, label: t('newoneGame'), sub: t('newoneSub'), on: () => onGame('newone'), ok: true },
        { id: 'verbs', icon: <ActionsIcon />, label: t('verbsGame'), sub: t('verbsSub'), on: () => onGame('verbs'), ok: true },
        { id: 'showme', icon: <PointIcon />, label: t('showmeGame'), sub: t('showmeSub'), on: () => onGame('showme'), ok: true },
        { id: 'instructions', icon: <ActionsIcon />, label: t('instructionsGame'), sub: t('instructionsSub'), on: () => onGame('instructions'), ok: canInstructions },
        { id: 'places', icon: <HideIcon />, label: t('placesGame'), sub: t('placesSub'), on: () => onGame('places'), ok: true },
        { id: 'feelings', icon: <FeelIcon />, label: t('feelingsGame'), sub: t('feelingsSub'), on: () => onGame('feelings'), ok: true },
      ]
    : [];
  const allTiles = [...learn, ...together, ...hers];
  const favTiles = favourites.map((id) => allTiles.find((x) => x.id === id)).filter((x): x is Tile => x !== undefined);
  const ageLabel = (months: number) => t('ageFrom', { age: months % 12 ? `${Math.floor(months / 12)}½` : String(months / 12) });
  const renderTile = (g: Tile) => (
    <div key={g.id} className="tile-wrap">
      <button type="button" className={`game-tile tile-${g.id}`} onClick={g.on} disabled={!g.ok}>
        <TilePicture id={g.id} icon={g.icon} />
        <strong>{g.label}</strong>
        <small>{g.sub}</small>
        {forLater(g.id, ageMonths) && <span className="tile-age">{ageLabel(GAME_AGES[g.id])}</span>}
      </button>
      {TIPS[g.id] && (
        <button type="button" className="tile-info" aria-label={t('tipFor', { game: g.label })} onClick={() => setTipFor(g.id)}>
          i
        </button>
      )}
    </div>
  );
  const groups = (skip: readonly string[]) =>
    [
      { title: t('homeLearn'), sub: t('homeLearnSub'), tiles: learn },
      { title: t('homeTogether'), sub: t('homeTogetherSub'), tiles: together },
      { title: t('homeHer'), sub: t('homeHerSub'), tiles: hers },
    ].map((group) => {
      const tiles = group.tiles.filter((g) => !skip.includes(g.id) && !forLater(g.id, ageMonths));
      return (
        tiles.length > 0 && (
          <section key={group.title} className="games-group">
            <h2 className="games-title">
              {group.title}
              <small>{group.sub}</small>
            </h2>
            <div className="games-row">{tiles.map(renderTile)}</div>
          </section>
        )
      );
    });
  // Games for when she's older, folded away at the end (her favourites always stay at the top).
  const laterTiles = allTiles.filter((g) => forLater(g.id, ageMonths) && !favourites.includes(g.id)).sort((a, b) => GAME_AGES[a.id] - GAME_AGES[b.id]);
  const later = laterTiles.length > 0 && (
    <details className="more-games later-games">
      <summary>🌱 {t('laterGames', { n: laterTiles.length })}</summary>
      <p className="hint">{t('laterGamesHint')}</p>
      <div className="games-row">{laterTiles.map(renderTile)}</div>
    </details>
  );
  // A simpler Home: her favourites, today's three games and the 6 she plays most come first; every
  // other game folds under "All games" (open or closed as the parent last left it).
  const topIds = [...new Set([...favourites, ...plan.map((p) => p.kind as string), ...topPlayed])];
  const topTiles = topIds
    .map((id) => allTiles.find((x) => x.id === id))
    .filter((x): x is Tile => x !== undefined && x.ok && (favourites.includes(x.id) || !forLater(x.id, ageMonths)));
  const simple = topTiles.length >= 4;
  const [allOpen, setAllOpen] = useState(() => local.get(ALL_GAMES_KEY) === '1');
  const [birthInput, setBirthInput] = useState('');
  const tipTile = tipFor ? allTiles.find((x) => x.id === tipFor) : undefined;
  const tip = tipFor ? TIPS[tipFor]?.[lang] : undefined;

  return (
    <div className="parent home">
      <div className="home-col home-col-a">
        <HomeHeader
          title={t('appName')}
          tagline={t('appTagline')}
          avatar={activeProfile ? <Avatar profile={activeProfile} size={54} /> : undefined}
          season={season}
          seasonLine={season === 'ramadan' ? `🌙 ${t('seasonRamadan')}` : season === 'eid' ? `🎉 ${t('seasonEid')}` : undefined}
        />

        {/* Which update is open: always shown, so the parent can check a new one has arrived. */}
        <UpdateStamp />

        {profiles.profiles.length > 1 && (
          <div className="who-plays">
            <span className="muted">{t('whoIsPlaying')}</span>
            <ProfileRow profiles={profiles.profiles} activeId={profiles.activeId} onSelect={onProfile} />
          </div>
        )}

        <button type="button" className="start-btn" onClick={onStart} disabled={!canStart}>
          {t('start')}
        </button>
        {canMenu && (
          <button type="button" className="her-menu-btn" onClick={() => onGame('menu')}>
            <span aria-hidden="true">👆</span>
            <span>
              <strong>{t('herMenu')}</strong>
              <small>{t('herMenuSub')}</small>
            </span>
          </button>
        )}
      </div>
      <div className="home-col home-col-notices">
        {/* A message from the family and her week come first among the notices. */}
        {message && (
          <section className="card message-card" role="status">
            <h2>💌 {t('messageTitle', { from: message.from })}</h2>
            <p className="hint">{t('messageBody')}</p>
            <div className="nudge-actions">
              <button type="button" className="btn primary" onClick={onMessagePlay}>
                ▶ {t('messagePlay')}
              </button>
              <button type="button" className="btn ghost" onClick={onMessageDone}>
                {t('messageDone')}
              </button>
            </div>
          </section>
        )}
        {checkin && activeProfile && <WeekCheckin childId={activeProfile.id} packs={allPacks} onDone={onCheckinDone} />}
        {activeProfile && <TimelineCard profileId={activeProfile.id} onOpen={() => onOpen('timeline')} />}
        {askBirth && (
          <section className="card nudge-card birth-card">
            <h2>🎂 {t('birthCardTitle')}</h2>
            <p>{t('birthCardBody')}</p>
            <input type="month" className="birth-input" value={birthInput} max={new Date().toISOString().slice(0, 7)} onChange={(e) => setBirthInput(e.target.value)} aria-label={t('birthCardTitle')} />
            <div className="nudge-actions">
              <button type="button" className="btn primary" disabled={!birthInput} onClick={() => onBirth(birthInput)}>
                {t('save')}
              </button>
              <button type="button" className="btn ghost" onClick={() => onBirth(null)}>
                {t('recordCardLater')}
              </button>
            </div>
          </section>
        )}
        {twoWordsCard && (
          <section className="card nudge-card" role="status">
            <h2>💬 {t('twoWordsTitle')}</h2>
            <p>{t('twoWordsBody')}</p>
            <div className="nudge-actions">
              <button type="button" className="btn primary" onClick={() => onTwoWords(true)}>
                {t('twoWordsYes')}
              </button>
              <button type="button" className="btn ghost" onClick={() => onTwoWords(false)}>
                {t('twoWordsNo')}
              </button>
            </div>
          </section>
        )}
        {recordLeft > 0 && (
          <section className="card week-card record-card">
            <h2>🎙️ {t('recordCardTitle')}</h2>
            <p className="hint">{t('recordCardHint', { n: recordLeft })}</p>
            <div className="nudge-actions">
              <button type="button" className="btn primary" onClick={onRecordToday}>
                {t('recordCardGo')}
              </button>
              <button type="button" className="btn ghost" onClick={onRecordLater}>
                {t('recordCardLater')}
              </button>
            </div>
          </section>
        )}
        {weekCard && (
          <section className="card week-card">
            <h2>💌 {t('weekShareCard')}</h2>
            <div className="nudge-actions">
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  closeWeekCard();
                  onOpen('report');
                }}
              >
                {t('weekShareMake')}
              </button>
              <button type="button" className="btn ghost" onClick={closeWeekCard}>
                {t('close')}
              </button>
            </div>
          </section>
        )}
        {season && <SeasonCard season={season} onPlay={onSeasonPlay} />}
        {newCert && (
          <section className="card cert-card" role="status">
            <h2>
              🎓 {t('certNew')} {newCert.emoji}
            </h2>
            <p>{newCert.words ? t('certWordsLine', { n: newCert.words }) : t('certSentenceLine')}</p>
            <div className="nudge-actions">
              <button type="button" className="btn primary" onClick={() => onCertSeen(true)}>
                {t('certSee')}
              </button>
              <button type="button" className="btn ghost" onClick={() => onCertSeen(false)}>
                {t('close')}
              </button>
            </div>
          </section>
        )}
      </div>
      <div className="home-col home-col-plan">
        {/* Today's lesson: the word path's new words. */}
        {canLearn && lesson && (
          <section className="card lesson-card">
            <h2>📚 {t('lessonCardTitle')}</h2>
            {lesson.words.length > 0 ? (
              <div className="lesson-words">
                {lesson.words.map((w) => (
                  <span key={w.picture} className="lesson-word">
                    <img src={w.picture} alt="" />
                    <small>{w.name[lang]}</small>
                  </span>
                ))}
              </div>
            ) : (
              <p className="hint">{lesson.review ? t('lessonCardOnlyReview') : t('lessonCardDone')}</p>
            )}
            {lesson.review > 0 && <p className="hint">{t('lessonCardReview', { n: lesson.review })}</p>}
            <button type="button" className="btn primary wide" onClick={() => onGame('lesson')}>
              {t('lessonCardStart')}
            </button>
          </section>
        )}
        {/* Today's play: three games for today, ticked once played. */}
        {plan.length > 0 && (
          <section className="card plan-card">
            <h2>☀️ {t('planTitle')}</h2>
            <p className="hint">{t('planHint')}</p>
            <div className="plan-row">
              {plan.map(({ kind, done }) => {
                const tile = [
                  ...learn,
                  ...together,
                  ...hers,
                  { id: 'game', icon: <PlayIcon />, label: t('matchGame'), sub: '', on: onStart, ok: canStart },
                ].find((x) => x.id === kind);
                if (!tile) return null;
                return (
                  <button type="button" key={kind} className={`plan-tile tile-${kind}${done ? ' done' : ''}`} onClick={tile.on} disabled={!tile.ok}>
                    <TilePicture id={kind} icon={tile.icon} />
                    <strong>{tile.label}</strong>
                    {done && <span className="plan-done">✓ {t('planDone')}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
      <div className="home-col home-col-b">
        {/* Her favourites first (when chosen), then the games played together (the parent ticks) and
            the ones she plays herself; with favourites, those two are folded under "More games". */}
        {simple ? (
          <>
            <section className="games-group fav-group">
              <h2 className="games-title">
                ⭐ {t('herTopTitle')}
                <small>{t('herTopSub')}</small>
                <button type="button" className="fav-edit" onClick={() => setPicking([...favourites])}>
                  {favourites.length ? t('favEdit') : t('favChoose')}
                </button>
              </h2>
              <div className="games-row">{topTiles.map(renderTile)}</div>
            </section>
            <details
              className="more-games all-games"
              open={allOpen}
              onToggle={(e) => {
                const open = (e.currentTarget as HTMLDetailsElement).open;
                setAllOpen(open);
                local.set(ALL_GAMES_KEY, open ? '1' : '0');
              }}
            >
              <summary>{t('allGames', { n: allTiles.filter((x) => !topTiles.includes(x) && !forLater(x.id, ageMonths)).length })}</summary>
              {groups(topTiles.map((x) => x.id))}
            </details>
            {later}
          </>
        ) : favTiles.length > 0 ? (
          <>
            <section className="games-group fav-group">
              <h2 className="games-title">
                ⭐ {t('favTitle')}
                <small>{t('favSub')}</small>
                <button type="button" className="fav-edit" onClick={() => setPicking([...favourites])}>
                  {t('favEdit')}
                </button>
              </h2>
              <div className="games-row">{favTiles.map(renderTile)}</div>
            </section>
            <details className="more-games">
              <summary>{t('moreGames', { n: together.length + hers.length - favTiles.length })}</summary>
              {groups(favourites)}
            </details>
            {later}
          </>
        ) : (
          <>
            <button type="button" className="fav-choose" onClick={() => setPicking([])}>
              <span aria-hidden="true">⭐</span> {t('favChoose')}
            </button>
            {groups([])}
            {later}
          </>
        )}
        {!pack ? (
          <p className="note">{t('noPackReady')}</p>
        ) : (
          !canStart && <p className="note">{t('needMoreItems')}</p>
        )}

      </div>
      <div className="home-col home-col-c">
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
      {tip && tipTile && (
        <Overlay label={t('tipFor', { game: tipTile.label })} onDismiss={() => setTipFor(null)}>
          <div className={`tip-head tile-${tipTile.id}`}>
            <TilePicture id={tipTile.id} icon={tipTile.icon} />
            <h2>{tipTile.label}</h2>
          </div>
          <h3 className="tip-label">🤝 {t('tipHow')}</h3>
          <p>{tip.how}</p>
          <h3 className="tip-label">🌱 {t('tipLearns')}</h3>
          <p>{tip.learns}</p>
          <div className="nudge-actions">
            {tipTile.ok && (
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  setTipFor(null);
                  tipTile.on();
                }}
              >
                {t('playNow')}
              </button>
            )}
            <button type="button" className="btn ghost" onClick={() => setTipFor(null)}>
              {t('close')}
            </button>
          </div>
        </Overlay>
      )}

      {sleeping && (
        <Overlay label={t('sleepTitle')} onDismiss={() => setSleeping(null)}>
          <h2>🌙 {t('sleepTitle')}</h2>
          <p className="hint">{t('sleepHint')}</p>
          <h3 className="tip-label">{t('sleepSound')}</h3>
          <Segmented
            label={t('sleepSound')}
            value={sleeping.sound}
            options={[
              { value: 'rain' as const, label: `🌧️ ${t('sleepRain')}` },
              { value: 'waves' as const, label: `🌊 ${t('sleepWaves')}` },
              { value: 'lullaby' as const, label: `🎵 ${t('sleepLullaby')}` },
              { value: 'none' as const, label: t('sleepQuiet') },
            ]}
            onChange={(sound) => setSleeping({ ...sleeping, sound })}
          />
          <h3 className="tip-label">{t('sleepFor')}</h3>
          <Segmented
            label={t('sleepFor')}
            value={sleeping.minutes}
            options={SLEEP_MINUTES.map((m) => ({ value: m as number, label: t('minutesShort', { n: m }) }))}
            onChange={(minutes) => setSleeping({ ...sleeping, minutes })}
          />
          <div className="sleep-after">
            <span>
              <strong>{t('sleepAfterBedtime')}</strong>
              <small className="hint">{t('sleepAfterBedtimeHint')}</small>
            </span>
            <Toggle label={t('sleepAfterBedtime')} checked={sleeping.afterBedtime} onChange={(afterBedtime) => setSleeping({ ...sleeping, afterBedtime })} />
          </div>
          <div className="nudge-actions">
            <button
              type="button"
              className="btn primary wide"
              onClick={() => {
                const prefs = sleeping;
                setSleeping(null);
                onSleep(prefs);
              }}
            >
              🌙 {t('sleepStart')}
            </button>
          </div>
        </Overlay>
      )}

      {celebrate && (
        <EidCelebration avatar={activeProfile ? <Avatar profile={activeProfile} size={96} /> : undefined} onClose={onCelebrated} />
      )}

      {picking && (
        <Overlay label={t('favPickerTitle')} onDismiss={() => setPicking(null)}>
          <h2>⭐ {t('favPickerTitle')}</h2>
          <p className="hint">{t('favPickerHint')}</p>
          <div className="fav-picker">
            {allTiles.map((g) => {
              const on = picking.includes(g.id);
              return (
                <button
                  type="button"
                  key={g.id}
                  className={`fav-option tile-${g.id}${on ? ' on' : ''}`}
                  aria-pressed={on}
                  onClick={() => setPicking(on ? picking.filter((x) => x !== g.id) : [...picking, g.id])}
                >
                  <TilePicture id={g.id} icon={g.icon} />
                  <span>{g.label}</span>
                  {on && <b className="fav-star" aria-hidden="true">★</b>}
                </button>
              );
            })}
          </div>
          <p className="hint fav-count">{t('favCount', { n: picking.length })}</p>
          <div className="nudge-actions">
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                onFavourites(picking);
                setPicking(null);
              }}
            >
              {t('save')}
            </button>
            <button type="button" className="btn ghost" onClick={() => setPicking(null)}>
              {t('cancel')}
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

/** A little picture for each game tile (a drawing from the game's own pictures). */
function TilePicture({ id, icon }: { id: string; icon: ReactNode }) {
  const src = gamePicture(id);
  if (!src) return <>{icon}</>;
  return (
    <span className={`tile-pic${id === 'bubbles' ? ' in-bubble' : ''}`} aria-hidden="true">
      <img src={src} alt="" loading="lazy" />
    </span>
  );
}
