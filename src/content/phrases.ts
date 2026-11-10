/**
 * Two-word time: the words each phrase is made of (word ids, see report/words), so phrases built
 * from words she already understands or says come first. Phrases about nothing she can picture
 * ("Let's play") have none and simply take their turn at the end.
 */
export const PHRASE_WORDS: Readonly<Record<string, readonly string[]>> = {
  ph_want_water: ['food/water'],
  ph_want_milk: ['food/milk'],
  ph_want_banana: ['food/banana'],
  ph_want_ball: ['first-words/ball'],
  ph_want_teddy: ['first-words/teddy'],
  ph_want_mama: ['family/mama'],
  ph_more_milk: ['food/milk'],
  ph_more_water: ['food/water'],
  ph_more_banana: ['food/banana'],
  ph_where_mama: ['family/mama'],
  ph_where_baba: ['family/baba'],
  ph_where_ball: ['first-words/ball'],
  ph_where_cat: ['animals/cat'],
  ph_where_shoe: ['first-words/shoe'],
  ph_bye_baba: ['family/baba'],
  ph_bye_mama: ['family/mama'],
  ph_bye_teta: ['family/grandma'],
  ph_hi_jiddo: ['family/grandpa'],
  ph_hi_mama: ['family/mama'],
  ph_mama_come: ['family/mama'],
  ph_baba_come: ['family/baba'],
  ph_big_dog: ['animals/dog'],
  ph_big_car: ['vehicles/car'],
  ph_little_cat: ['animals/cat'],
  ph_open_door: ['home/door'],
  ph_kiss_mama: ['family/mama'],
};

/** At most this many phrases in one game: it is hard work at her age. */
export const PHRASES_PER_GAME = 8;

/** The phrases, those built from words she knows first; among equals, a new order each game. */
export function phraseOrder(keys: readonly string[], known: ReadonlySet<string>, random: () => number = Math.random): string[] {
  const score = (key: string) => {
    const words = PHRASE_WORDS[key] ?? [];
    return words.length ? words.filter((w) => known.has(w)).length / words.length : 0;
  };
  return keys
    .map((key) => ({ key, s: score(key), r: random() }))
    .sort((a, b) => b.s - a.s || a.r - b.r)
    .map((x) => x.key);
}
