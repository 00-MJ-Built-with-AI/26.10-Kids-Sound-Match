import { describe, expect, it } from 'vitest';
import type { LoadedItem, LoadedPack } from '../content/types';
import { fixesText, fixPacks } from '../i18n/arabicFixes';
import { reviewGroups } from '../i18n/arabicReview';
import { talkPrompt } from '../learn/talkPrompts';
import { weekCheckin } from './checkin';

const DAY = 86_400_000;
const now = new Date(2026, 10, 25, 18).getTime();
const play = (kind: string, daysAgo: number, ms: number) => ({ kind, at: now - daysAgo * DAY, ms });

describe('her week', () => {
  it('finds what she came back to, what she left quickly, and the new words', () => {
    const log = [play('bubbles', 1, 120_000), play('bubbles', 3, 90_000), play('memory', 2, 20_000), play('memory', 2.1, 15_000), play('lesson', 1, 300_000), play('cups', 20, 60_000)];
    const known = new Map([
      ['food/milk', now - 2 * DAY],
      ['animals/cat', now - 30 * DAY],
    ]);
    const week = weekCheckin(log, known, { 'food/milk': now - DAY, 'animals/dog': now - 40 * DAY }, now);
    expect(week.cameBack).toEqual(['bubbles']);
    expect(week.leftQuickly).toEqual(['memory']);
    expect(week.newWords).toEqual(['food/milk']);
    expect(week.saidWords).toEqual(['food/milk']);
    expect(week.days).toBe(3);
    expect(week.minutes).toBe(Math.ceil((120_000 + 90_000 + 20_000 + 15_000 + 300_000) / 60_000));
  });
});

describe('check the Arabic', () => {
  const item = (key: string, ar: string) => ({ key, name: { en: key, ar } }) as unknown as LoadedItem;
  const packs = [{ id: 'rhymes', items: [item('rh_a_1', 'سطر'), item('rh_a_2', 'سطر ثاني')] }, { id: 'learn', items: [item('fe_girl_happy', 'فرحانة'), item('sm_girl_eat', 'x')] }] as unknown as LoadedPack[];
  it('lists the new lines and applies a fix to a name', () => {
    const groups = reviewGroups(packs);
    expect(groups[0].lines.map((l) => l.id)).toEqual(['item:rhymes/rh_a_1', 'item:rhymes/rh_a_2']);
    expect(groups[1].lines.map((l) => l.id)).toEqual(['item:learn/fe_girl_happy']);
    const fixed = fixPacks(packs, { 'item:rhymes/rh_a_2': 'سطر تاني' });
    expect(fixed[0].items[1].name.ar).toBe('سطر تاني');
    expect(fixed[1]).toBe(packs[1]);
    expect(fixesText(groups[0].lines, { 'item:rhymes/rh_a_2': 'سطر تاني' })).toBe('item:rhymes/rh_a_2\n  سطر ثاني\n→ سطر تاني');
  });
});

describe('talk prompts', () => {
  it('take turns page by page, and name the word', () => {
    expect(talkPrompt('book', 3, 'en', 'cat')).toBe("Ask: where's the cat?");
    expect(talkPrompt('daybook', 0, 'en')).toBe("Ask: who's that?");
    expect(talkPrompt('book', 2, 'en')).not.toContain('{word}');
  });
});
