/**
 * Her voice book: recordings of the child saying her words, one per word, per child. Kept in this
 * browser's IndexedDB only (never backed up or sent), so a keepsake of how she said "قطة" at 20
 * months stays on this phone. Falls back to memory where IndexedDB isn't available.
 */
export interface VoiceClip {
  /** profileId + '|' + word id. */
  id: string;
  profileId: string;
  /** Word id (report/words wordId). */
  word: string;
  blob: Blob;
  at: number;
}

export interface VoiceStore {
  all(profileId: string): Promise<VoiceClip[]>;
  put(clip: VoiceClip): Promise<void>;
  remove(id: string): Promise<void>;
  forgetChild(profileId: string): Promise<void>;
}

export const voiceId = (profileId: string, word: string) => `${profileId}|${word}`;

const DB = 'ksm-her-voice';
const STORE = 'clips';

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

class IdbVoiceStore implements VoiceStore {
  private db: Promise<IDBDatabase> | null = null;
  private open(): Promise<IDBDatabase> {
    this.db ??= new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' }).createIndex('byChild', 'profileId');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.db;
  }
  async all(profileId: string) {
    const db = await this.open();
    return request(db.transaction(STORE).objectStore(STORE).index('byChild').getAll(profileId)) as Promise<VoiceClip[]>;
  }
  async put(clip: VoiceClip) {
    const db = await this.open();
    await request(db.transaction(STORE, 'readwrite').objectStore(STORE).put(clip));
  }
  async remove(id: string) {
    const db = await this.open();
    await request(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
  }
  async forgetChild(profileId: string) {
    for (const c of await this.all(profileId)) await this.remove(c.id);
  }
}

export class MemoryVoiceStore implements VoiceStore {
  private clips = new Map<string, VoiceClip>();
  async all(profileId: string) {
    return [...this.clips.values()].filter((c) => c.profileId === profileId);
  }
  async put(clip: VoiceClip) {
    this.clips.set(clip.id, clip);
  }
  async remove(id: string) {
    this.clips.delete(id);
  }
  async forgetChild(profileId: string) {
    for (const c of await this.all(profileId)) this.clips.delete(c.id);
  }
}

class FallbackVoiceStore implements VoiceStore {
  private inner: VoiceStore = typeof indexedDB === 'undefined' ? new MemoryVoiceStore() : new IdbVoiceStore();
  private async run<T>(f: (s: VoiceStore) => Promise<T>): Promise<T> {
    try {
      return await f(this.inner);
    } catch {
      this.inner = new MemoryVoiceStore();
      return f(this.inner);
    }
  }
  all(p: string) {
    return this.run((s) => s.all(p));
  }
  put(c: VoiceClip) {
    return this.run((s) => s.put(c));
  }
  remove(id: string) {
    return this.run((s) => s.remove(id));
  }
  forgetChild(p: string) {
    return this.run((s) => s.forgetChild(p));
  }
}

export const voiceStore: VoiceStore = new FallbackVoiceStore();

/** Words recorded in the last `days` days (for "this week"). */
export function recentWords<T extends { at: number }>(list: readonly T[], days: number, now = Date.now()): T[] {
  const from = now - days * 24 * 60 * 60 * 1000;
  return list.filter((x) => x.at >= from);
}
