import { describe, expect, it } from 'vitest';
import { herMenu } from './favourites';

describe('her own menu', () => {
  const available = ['game', 'peekaboo', 'bubbles', 'explore', 'paint', 'talk', 'bedtime'];

  it('starts with her favourites, in order', () => {
    expect(herMenu(['paint', 'talk'], available, [])[0]).toBe('paint');
    expect(herMenu(['paint', 'talk'], available, [])[1]).toBe('talk');
  });

  it('tops up from what she plays most, then her games, and stops at four', () => {
    const menu = herMenu([], available, ['bubbles', 'talk']);
    expect(menu[0]).toBe('bubbles');
    expect(menu).toHaveLength(4);
    expect(menu).not.toContain('talk');
  });

  it('never offers bedtime or a game that cannot be played', () => {
    expect(herMenu(['bedtime', 'odd'], available, [])).not.toContain('bedtime');
    expect(herMenu(['odd'], available, [])).not.toContain('odd');
  });
});
