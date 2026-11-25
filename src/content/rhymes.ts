/**
 * Song time: the action that goes with a rhyme line (an item of the Actions pack), shown small and
 * bouncing next to the line's picture so she does it with you. Lines whose picture is already the
 * action (clap, stamp, wash) have none.
 */
export const RHYME_ACTIONS: Readonly<Record<string, string>> = {
  rh_cars_2: 'spin',
  rh_cars_4: 'jump',
  rh_morning_1: 'wave',
  rh_morning_2: 'wave',
  rh_morning_3: 'jump',
  rh_morning_4: 'clap',
  rh_wash_3: 'swim',
  rh_animals_1: 'jump',
  rh_animals_2: 'dance',
  rh_animals_3: 'swim',
  rh_animals_4: 'stamp',
  rh_night_2: 'sleep',
  rh_night_3: 'hug',
  rh_night_4: 'sleep',
};

/** Songs sung before the game ends (she can always sing one again). */
export const SONGS_PER_GAME = 4;
