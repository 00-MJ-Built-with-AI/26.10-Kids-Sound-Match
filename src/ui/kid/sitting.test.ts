import { describe, expect, it } from 'vitest';
import { pinNeeded, restTime } from './sitting';

describe('the play-time timer', () => {
  it('ends a sitting after its minutes, and never when it is off or no game is on', () => {
    expect(restTime(1_000, 10)).toBe(1_000 + 10 * 60_000);
    expect(restTime(1_000, 0)).toBeNull();
    expect(restTime(null, 10)).toBeNull();
  });
});

describe('leaving soon after starting', () => {
  it('needs no PIN for the first 2 minutes after the game was started from Home', () => {
    expect(pinNeeded(1_000, 1_000 + 60_000)).toBe(false);
    expect(pinNeeded(1_000, 1_000 + 2 * 60_000)).toBe(true);
    expect(pinNeeded(null, 5)).toBe(true);
  });
});
