import { describe, expect, it } from 'vitest';
import { currentSeason, seasonOn } from './season';

const at = (d: string) => new Date(`${d}T12:00:00`);

describe('Ramadan and Eid', () => {
  it('follows the Islamic calendar', () => {
    expect(seasonOn(at('2026-11-05'))).toBeNull();
    expect(seasonOn(at('2027-02-20'))).toBe('ramadan');
    expect(seasonOn(at('2027-03-10'))).toBe('eid'); // Eid al-Fitr 1448
    expect(seasonOn(at('2027-05-17'))).toBe('eid'); // Eid al-Adha 1448
    expect(seasonOn(at('2027-04-15'))).toBeNull();
  });

  it('can be turned off or shown any time', () => {
    expect(currentSeason('off', at('2027-02-20'))).toBeNull();
    expect(currentSeason('eid', at('2026-11-05'))).toBe('eid');
    expect(currentSeason('auto', at('2027-02-20'))).toBe('ramadan');
  });
});
