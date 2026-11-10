/** The illustrated background behind a game, by its picture set (see tools/art/draw-scenes.mjs). */
const SCENE_OF: Record<string, string> = {
  animals: 'farm',
  'animal-babies': 'farm',
  'who-eats-what': 'farm',
  'where-lives': 'sea',
  vehicles: 'road',
  food: 'kitchen',
  home: 'playroom',
  'first-words': 'playroom',
  toys: 'playroom',
  clothes: 'playroom',
  care: 'playroom',
  weather: 'garden',
  instruments: 'stage',
  songs: 'stage',
  body: 'park',
  feelings: 'park',
  actions: 'park',
  family: 'park',
  jobs: 'park',
  shapes: 'space',
  colors: 'space',
  counting: 'space',
  letters: 'space',
  opposites: 'space',
  eid: 'stage',
  phrases: 'playroom',
  manners: 'park',
};
export function sceneFor(packId: string): string {
  return SCENE_OF[packId] ?? 'garden';
}

/** The scene's picture (public/backgrounds). */
export function sceneUrl(packId: string): string {
  return `${import.meta.env.BASE_URL}backgrounds/${sceneFor(packId)}.svg`;
}
