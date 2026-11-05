import { beforeEach, describe, expect, it } from 'vitest';
import { CERTIFICATES, markCertificatesSeen, MILESTONES, reached, toggleMilestone, unseenCertificate, updateCertificates } from './milestones';
import { TIPS } from '../ui/parent/tips';

function fakeStorage() {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
}

describe('milestones and certificates', () => {
  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: fakeStorage() };
  });

  it('links every milestone to games that have a tip', () => {
    for (const m of MILESTONES) for (const g of m.games) expect(TIPS[g], `${m.id} → ${g}`).toBeDefined();
    expect(new Set(MILESTONES.map((m) => m.id)).size).toBe(MILESTONES.length);
  });

  it('earns word certificates at 10, 25 and 50 words, and the sentence from the checklist', () => {
    expect(reached(9, {}).map((c) => c.id)).toEqual([]);
    expect(reached(25, {}).map((c) => c.id)).toEqual(['words10', 'words25']);
    expect(reached(0, { talk_two: 5 }).map((c) => c.id)).toEqual(['sentence']);
    expect(CERTIFICATES).toHaveLength(4);
  });

  it('keeps the first date, keeps a certificate earned, and shows each new one once', () => {
    let earned = updateCertificates('first', 12, {}, 1000);
    expect(earned).toEqual({ words10: 1000 });
    earned = updateCertificates('first', 3, {}, 2000);
    expect(earned).toEqual({ words10: 1000 });
    expect(unseenCertificate('first', earned)?.id).toBe('words10');
    markCertificatesSeen('first', ['words10']);
    expect(unseenCertificate('first', earned)).toBeNull();
    const ticks = toggleMilestone('first', 'talk_two', 3000);
    earned = updateCertificates('first', 12, ticks, 4000);
    expect(earned.sentence).toBe(3000);
    expect(unseenCertificate('first', earned)?.id).toBe('sentence');
  });
});
