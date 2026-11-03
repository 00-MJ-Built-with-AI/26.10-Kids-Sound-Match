import { describe, expect, it } from 'vitest';
import { moveCard, sanitizeRoutine, toggleCard, today } from './routine';

const ALL = ['day_wake_up', 'day_eat', 'day_bath', 'day_sleep'];

describe('Our day', () => {
  it('starts with every card, at the first one', () => {
    expect(sanitizeRoutine(null, ALL, '2026-11-03')).toEqual({ order: ALL, day: '2026-11-03', at: 0 });
  });

  it("keeps today's place, but starts a new day at the first card", () => {
    const saved = { order: ['day_eat', 'day_sleep'], day: '2026-11-03', at: 1 };
    expect(sanitizeRoutine(saved, ALL, '2026-11-03').at).toBe(1);
    expect(sanitizeRoutine(saved, ALL, '2026-11-04')).toEqual({ order: ['day_eat', 'day_sleep'], day: '2026-11-04', at: 0 });
  });

  it('drops cards the app no longer has, and repeats', () => {
    const saved = { order: ['day_eat', 'gone', 'day_eat', 'day_bath'], day: 'x', at: 0 };
    expect(sanitizeRoutine(saved, ALL, 'y').order).toEqual(['day_eat', 'day_bath']);
  });

  it('adds, removes and reorders cards', () => {
    let s = sanitizeRoutine({ order: ['day_eat'], day: 'd', at: 1 }, ALL, 'd');
    s = toggleCard(s, 'day_sleep');
    expect(s.order).toEqual(['day_eat', 'day_sleep']);
    s = moveCard(s, 'day_sleep', -1);
    expect(s.order).toEqual(['day_sleep', 'day_eat']);
    expect(moveCard(s, 'day_sleep', -1)).toBe(s);
    s = toggleCard(s, 'day_eat');
    expect(s).toMatchObject({ order: ['day_sleep'], at: 1 });
  });

  it('writes the local date', () => {
    expect(today(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
