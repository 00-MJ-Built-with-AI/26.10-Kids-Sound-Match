import { describe, expect, it } from 'vitest';
import { appCaches, newerBuild } from './appUpdate';

describe('app updates', () => {
  const now = '2026-11-10T10:00:00.000Z';

  it('offers a build only when the live one is newer', () => {
    expect(newerBuild(now, { time: '2026-11-10T11:00:00.000Z', commit: 'abc', message: 'New games' })).toEqual({
      time: '2026-11-10T11:00:00.000Z',
      commit: 'abc',
      message: 'New games',
    });
    expect(newerBuild(now, { time: now })).toBeNull();
    expect(newerBuild(now, { time: '2026-11-09T11:00:00.000Z' })).toBeNull();
  });

  it('ignores an answer it cannot read', () => {
    expect(newerBuild(now, null)).toBeNull();
    expect(newerBuild(now, {})).toBeNull();
    expect(newerBuild(now, { time: 'soon' })).toBeNull();
    expect(newerBuild(now, '<!doctype html>')).toBeNull();
  });

  it('only ever replaces the app files, never photos, sounds or a shared voice note', () => {
    expect(appCaches(['ksm-abc123', 'ksm-media-def456', 'ksm-shared', 'other'])).toEqual(['ksm-abc123']);
  });
});
