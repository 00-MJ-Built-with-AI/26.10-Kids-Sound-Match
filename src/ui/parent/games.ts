import type { StringKey } from '../../i18n/strings';

/**
 * Every game on Home: its name and line, and the little drawing on its tile. Shared by Home, the
 * favourites picker, the Report's play time and the milestones checklist.
 */
export interface GameInfo {
  label: StringKey;
  sub: StringKey;
  /** 'pack/file.svg' under assets/packs, or 'tiles/x.svg' under assets (drawn for the tile). */
  picture: string;
  /** From this age (months), the game suits her best; before it, Home folds it away for later. */
  minAge?: number;
}

/** Age, in months, for each game that suits older children. */
export const GAME_AGES: Readonly<Record<string, number>> = {
  places: 24,
  memory: 24,
  missing: 24,
  puzzle: 24,
  scene: 24,
  turns: 24,
  shapes: 24,
  big: 24,
  count: 30,
  opposites: 30,
  odd: 30,
};

/** Too early for her? Unknown age: every game is shown as before. */
export const forLater = (id: string, ageMonths: number | null) => ageMonths !== null && (GAME_AGES[id] ?? 0) > ageMonths;

export const GAMES: Record<string, GameInfo> = {
  talk: { label: 'talkGame', sub: 'talkSub', picture: 'actions/laugh.svg' },
  lesson: { label: 'lessonGame', sub: 'lessonSub', picture: 'first-words/book.svg' },
  variety: { label: 'varietyGame', sub: 'varietySub', picture: 'first-words/teddy.svg' },
  newone: { label: 'newoneGame', sub: 'newoneSub', picture: 'home/kettle.svg' },
  verbs: { label: 'verbsGame', sub: 'verbsSub', picture: 'actions/jump.svg' },
  showme: { label: 'showmeGame', sub: 'showmeSub', picture: 'learn/boy_eat.svg' },
  places: { label: 'placesGame', sub: 'placesSub', picture: 'learn/teddy_under.svg' },
  feelings: { label: 'feelingsGame', sub: 'feelingsSub', picture: 'learn/fe_girl_happy.svg' },
  rhymes: { label: 'rhymesGame', sub: 'rhymesSub', picture: 'tiles/rhymes.svg' },
  daybook: { label: 'daybookGame', sub: 'daybookSub', picture: 'tiles/daybook.svg' },
  bring: { label: 'bringGame', sub: 'bringSub', picture: 'tiles/bring.svg' },
  cups: { label: 'cupsGame', sub: 'cupsSub', picture: 'tiles/cups.svg' },
  garden: { label: 'gardenGame', sub: 'gardenSub', picture: 'tiles/garden.svg' },
  instructions: { label: 'instructionsGame', sub: 'instructionsSub', picture: 'first-words/shoe.svg' },
  phrases: { label: 'phrasesGame', sub: 'phrasesSub', picture: 'actions/kiss.svg' },
  manners: { label: 'mannersGame', sub: 'mannersSub', picture: 'manners/hello.svg' },
  sounds: { label: 'soundsGame', sub: 'soundsSub', picture: 'animals/cow.svg' },
  sing: { label: 'singGame', sub: 'singSub', picture: 'care/music.svg' },
  point: { label: 'pointGame', sub: 'pointSub', picture: 'body/nose.svg' },
  actions: { label: 'actionsGame', sub: 'actionsSub', picture: 'actions/clap.svg' },
  hunt: { label: 'huntGame', sub: 'huntSub', picture: 'colors/color_red.svg' },
  feel: { label: 'feelGame', sub: 'feelSub', picture: 'feelings/happy.svg' },
  book: { label: 'bookGame', sub: 'bookSub', picture: 'routine/story.svg' },
  paint: { label: 'paintGame', sub: 'paintSub', picture: 'tiles/paint.svg' },
  music: { label: 'musicGame', sub: 'musicSub', picture: 'tiles/music.svg' },
  hide: { label: 'hideGame', sub: 'hideSub', picture: 'tiles/hide.svg' },
  story: { label: 'storyGame', sub: 'storySub', picture: 'animals/rabbit.svg' },
  sleep: { label: 'sleepGame', sub: 'sleepSub', picture: 'tiles/sleep.svg' },
  potty: { label: 'pottyTitle', sub: 'pottySub', picture: 'tiles/potty.svg' },
  bedtime: { label: 'bedtimeGame', sub: 'bedtimeSub', picture: 'feelings/sleepy.svg' },
  turns: { label: 'turnsGame', sub: 'turnsSub', picture: 'family/friend.svg' },
  routine: { label: 'routineTitle', sub: 'routineSub', picture: 'routine/wake_up.svg' },
  peekaboo: { label: 'peekaboo', sub: 'peekabooSub', picture: 'animals/cat.svg' },
  bubbles: { label: 'bubblesGame', sub: 'bubblesSub', picture: 'animals/fish.svg' },
  care: { label: 'careGame', sub: 'careSub', picture: 'family/baby.svg' },
  explore: { label: 'explore', sub: 'exploreSub', picture: 'animals/dog.svg' },
  puzzle: { label: 'puzzleGame', sub: 'puzzleSub', picture: 'animals/lion.svg' },
  shapes: { label: 'shapesGame', sub: 'shapesSub', picture: 'shapes/shape_star.svg' },
  big: { label: 'bigGame', sub: 'bigSub', picture: 'animals/elephant.svg' },
  opposites: { label: 'oppositesGame', sub: 'oppositesSub', picture: 'opposites/hot.svg' },
  count: { label: 'countGame', sub: 'countSub', picture: 'animals/duck.svg' },
  missing: { label: 'missingGame', sub: 'missingSub', picture: 'care/hat.svg' },
  tidy: { label: 'tidyGame', sub: 'tidySub', picture: 'care/clothes.svg' },
  scene: { label: 'sceneGame', sub: 'sceneSub', picture: 'animals/horse.svg' },
  memory: { label: 'memoryGame', sub: 'memorySub', picture: 'animals/rabbit.svg' },
  odd: { label: 'oddOneOut', sub: 'oddSub', picture: 'shapes/shape_heart.svg' },
  game: { label: 'matchGame', sub: 'matchSub', picture: 'animals/lion.svg' },
};

/** A pack's picture ('animals/cow.svg'), or one drawn for its tile ('tiles/paint.svg'). */
export const gamePicture = (id: string): string | undefined => {
  const pic = GAMES[id]?.picture;
  if (!pic) return undefined;
  return `${import.meta.env.BASE_URL}assets/${pic.startsWith('tiles/') ? '' : 'packs/'}${pic}`;
};
