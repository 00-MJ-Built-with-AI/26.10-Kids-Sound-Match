import { describe, expect, it } from 'vitest';
import { doctorStats } from './doctor';
import { ageInMonths } from '../settings/birth';
import type { QuestionResultEntity, SessionEntity } from './types';

const day = 86_400_000;
const session = (id: number, language: string, at: number, game?: string) => ({ id, language, startedAt: at, toddlerMode: false, game }) as unknown as SessionEntity;
const right = (sessionId: number, itemKey: string, packId = 'food') => ({ sessionId, itemKey, packId, firstTryCorrect: true, attempts: 1 }) as unknown as QuestionResultEntity;
const marks = { says: { 'food/milk': 1, 'food/water': 2 }, extra: [{ id: 'a', text: 'x', at: 1 }] } as never;

describe('the doctor page', () => {
  it('splits understood words by the language of the games', () => {
    const sessions = [session(1, 'ar', 0), session(2, 'ar', day), session(3, 'ar', 2 * day), session(4, 'both', 3 * day)];
    const questions = [1, 2, 3].map((id) => right(id, 'milk')).concat([1, 2, 3].map((id) => right(id, 'water')), [right(4, 'water')]);
    const s = doctorStats(sessions, questions, marks, () => true);
    expect(s.understood).toEqual({ total: 2, arabic: 1, english: 0, bothLanguages: 1 });
    expect(s.says).toBe(2);
    expect(s.outsideApp).toBe(1);
  });

  it('counts each two-word phrase once', () => {
    const sessions = [session(1, 'ar', 0, 'phrases'), session(2, 'ar', day, 'phrases')];
    const questions = [right(1, 'ph_a', 'phrases'), right(2, 'ph_a', 'phrases'), right(2, 'ph_b', 'phrases')];
    expect(doctorStats(sessions, questions, marks, () => true).phrases).toBe(2);
  });

  it('works out her age in months', () => {
    expect(ageInMonths('2025-03', new Date(2026, 10, 10))).toBe(20);
    expect(ageInMonths('', new Date())).toBeNull();
    expect(ageInMonths('2030-01', new Date(2026, 10, 10))).toBeNull();
  });
});
