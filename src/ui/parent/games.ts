import type { StringKey } from '../../i18n/strings';

/**
 * Every game on Home: its name and line, and the little drawing on its tile. Shared by Home, the
 * favourites picker, the Report's play time and the milestones checklist.
 */
export interface GameInfo {
  label: StringKey;
  sub: StringKey;
  /** 'pack/file.svg' under assets/packs. */
  picture: string;
}

export const GAMES: Record<string, GameInfo> = {
  talk: { label: 'talkGame', sub: 'talkSub', picture: 'actions/laugh.svg' },
  sounds: { label: 'soundsGame', sub: 'soundsSub', picture: 'animals/cow.svg' },
  sing: { label: 'singGame', sub: 'singSub', picture: 'care/music.svg' },
  point: { label: 'pointGame', sub: 'pointSub', picture: 'body/nose.svg' },
  actions: { label: 'actionsGame', sub: 'actionsSub', picture: 'actions/clap.svg' },
  hunt: { label: 'huntGame', sub: 'huntSub', picture: 'colors/color_red.svg' },
  feel: { label: 'feelGame', sub: 'feelSub', picture: 'feelings/happy.svg' },
  book: { label: 'bookGame', sub: 'bookSub', picture: 'routine/story.svg' },
  story: { label: 'storyGame', sub: 'storySub', picture: 'animals/rabbit.svg' },
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

export const gamePicture = (id: string): string | undefined =>
  GAMES[id] ? `${import.meta.env.BASE_URL}assets/packs/${GAMES[id].picture}` : undefined;
