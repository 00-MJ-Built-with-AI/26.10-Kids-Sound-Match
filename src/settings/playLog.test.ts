import { describe, expect, it } from 'vitest';
import { addPlay, MAX_GAME_MS, topGames, weekMinutes, type PlayEntry } from './playLog';

const at = (s: string) => new Date(s).getTime();

describe('play time', () => {
  it('logs a game, caps one left open and skips a peek', () => {
    let log: PlayEntry[] = [];
    log = addPlay(log, 'bubbles', at('2026-11-05T10:00:00'), at('2026-11-05T10:04:00'));
    log = addPlay(log, 'talk', at('2026-11-05T11:00:00'), at('2026-11-05T13:00:00'));
    log = addPlay(log, 'book', at('2026-11-05T14:00:00'), at('2026-11-05T14:00:01'));
    expect(log.map((e) => e.kind)).toEqual(['bubbles', 'talk']);
    expect(log[1].ms).toBe(MAX_GAME_MS);
  });

  it('adds up minutes per day for the last 7 days', () => {
    const log: PlayEntry[] = [
      { kind: 'talk', at: at('2026-11-05T10:00:00'), ms: 90_000 },
      { kind: 'talk', at: at('2026-11-05T18:00:00'), ms: 60_000 },
      { kind: 'book', at: at('2026-11-02T10:00:00'), ms: 300_000 },
      { kind: 'book', at: at('2026-10-20T10:00:00'), ms: 300_000 },
    ];
    const week = weekMinutes(log, new Date('2026-11-05T20:00:00'));
    expect(week).toHaveLength(7);
    expect(week[6]).toEqual({ day: '2026-11-05', minutes: 3 });
    expect(week[3]).toEqual({ day: '2026-11-02', minutes: 5 });
    expect(week.reduce((n, d) => n + d.minutes, 0)).toBe(8);
  });

  it('finds her most-chosen games', () => {
    const log: PlayEntry[] = [
      { kind: 'bubbles', at: 10, ms: 60_000 },
      { kind: 'talk', at: 11, ms: 60_000 },
      { kind: 'bubbles', at: 12, ms: 60_000 },
      { kind: 'book', at: 1, ms: 60_000 },
    ];
    expect(topGames(log, 5).map((g) => g.kind)).toEqual(['bubbles', 'talk']);
    expect(topGames(log, 5)[0]).toEqual({ kind: 'bubbles', count: 2, minutes: 2 });
  });
});
