import { describe, expect, it } from 'vitest';
import { PLAN_GROUPS, planFor, playedToday } from './plan';
import type { KidKind } from '../ui/kid/kidSnapshot';

const ALL = PLAN_GROUPS.flat() as KidKind[];

describe("today's play", () => {
  it('picks one game from each group, the same all day', () => {
    const plan = planFor('2026-11-05', ALL, {});
    expect(plan).toHaveLength(3);
    PLAN_GROUPS.forEach((g, i) => expect(g).toContain(plan[i]));
    expect(planFor('2026-11-05', ALL, {})).toEqual(plan);
  });

  it('prefers games not played for a while, and keeps a game played today', () => {
    const day = '2026-11-05';
    const yesterday = new Date('2026-11-04T10:00:00').getTime();
    const played: Partial<Record<KidKind, number>> = Object.fromEntries(PLAN_GROUPS[0].map((k) => [k, yesterday]));
    played.sing = new Date('2026-10-01T10:00:00').getTime();
    expect(planFor(day, ALL, played)[0]).toBe('sing');
    // Played this morning: still today's pick.
    played.sing = new Date('2026-11-05T09:00:00').getTime();
    expect(planFor(day, ALL, played)[0]).toBe('sing');
    expect(playedToday(played, 'sing', day)).toBe(true);
  });

  it('only suggests games that can be played', () => {
    expect(planFor('2026-11-05', ['talk', 'bubbles'], {})).toEqual(['talk', 'bubbles']);
  });
});

describe("today's play from her favourites", () => {
  it('suggests only favourites when there are three or more', () => {
    const fav = ['bubbles', 'book', 'talk', 'puzzle'];
    const plan = planFor('2026-11-05', [...ALL, 'book'], {}, fav);
    expect(plan).toHaveLength(3);
    plan.forEach((k) => expect(fav).toContain(k));
  });

  it('tops up from the usual picks when she has fewer than three favourites', () => {
    const plan = planFor('2026-11-05', ALL, {}, ['bubbles']);
    expect(plan).toHaveLength(3);
    expect(plan).toContain('bubbles');
  });

  it('ignores favourites that cannot be played', () => {
    expect(planFor('2026-11-05', ALL, {}, ['routine'])).toEqual(planFor('2026-11-05', ALL, {}));
  });
});
