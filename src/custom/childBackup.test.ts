import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryVoiceStore } from '../settings/herVoice';
import { loadFeelings } from '../settings/plan';
import { loadWordMarks, saveWordMarks } from '../settings/words';
import { mergeChildData, sanitizeChildData, syncChild, type ChildData, type ChildRemote } from './childBackup';

function fakeStorage() {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
}

function fakeRemote() {
  const files = new Map<string, unknown>();
  const remote: ChildRemote = {
    readJson: async (p) => {
      if (!files.has(p)) throw new Error('not found');
      return JSON.parse(JSON.stringify(files.get(p)));
    },
    writeJson: async (p, v) => void files.set(p, JSON.parse(JSON.stringify(v))),
    upload: async (p, b) => void files.set(p, b),
    download: async (p) => {
      if (!files.has(p)) throw new Error('not found');
      return files.get(p) as Blob;
    },
    remove: async (ps) => ps.forEach((p) => files.delete(p)),
  };
  return { remote, files };
}

const empty = (): ChildData => ({ v: 1, words: { says: {}, extra: [] }, feelings: [], milestones: {}, certificates: {}, playLog: [], favourites: [], potty: [], voice: {} });

describe('backing up her things', () => {
  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: fakeStorage() };
  });

  it('merges two phones: everything either has, the first date, the newer recording', () => {
    const a = { ...empty(), words: { says: { 'animals/cat': 5 }, extra: [{ id: 'x', text: 'bye-bye', at: 1 }] }, voice: { 'animals/cat': 10 } };
    const b = { ...empty(), words: { says: { 'animals/cat': 3, 'animals/dog': 4 }, extra: [{ id: 'y', text: 'Bye-bye', at: 2 }] }, voice: { 'animals/cat': 20 }, feelings: [{ feeling: 'happy', at: 7 }] };
    const m = mergeChildData(a, b);
    expect(m.words.says).toEqual({ 'animals/cat': 3, 'animals/dog': 4 });
    expect(m.words.extra).toHaveLength(1);
    expect(m.voice['animals/cat']).toBe(20);
    expect(m.feelings).toHaveLength(1);
  });

  it('drops anything malformed from the cloud', () => {
    expect(sanitizeChildData({ v: 2 })).toBeNull();
    expect(sanitizeChildData({ v: 1, words: { says: { a: 'x' } }, feelings: [{ nope: 1 }] })?.words.says).toEqual({});
  });

  it('backs up from one phone and restores on another, recordings included', async () => {
    const { remote, files } = fakeRemote();
    const phoneA = new MemoryVoiceStore();
    saveWordMarks('first', { says: { 'animals/cat': 1 }, extra: [] });
    await phoneA.put({ id: 'first|animals/cat', profileId: 'first', word: 'animals/cat', blob: new Blob(['meow']), at: 100 });
    await syncChild(remote, 'first', phoneA);
    expect([...files.keys()].sort()).toEqual(['children/first/data.json', 'children/first/voice/animals%2Fcat']);

    // A new phone: nothing here yet.
    (globalThis as { window?: unknown }).window = { localStorage: fakeStorage() };
    const phoneB = new MemoryVoiceStore();
    const got = await syncChild(remote, 'first', phoneB);
    expect(got).toBe(true);
    expect(loadWordMarks('first').says).toEqual({ 'animals/cat': 1 });
    expect((await phoneB.all('first')).map((c) => c.word)).toEqual(['animals/cat']);
    expect(loadFeelings('first')).toEqual([]);
    // Nothing new the second time.
    expect(await syncChild(remote, 'first', phoneB)).toBe(false);
  });
});
