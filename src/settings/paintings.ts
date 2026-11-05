/**
 * Her paintings (Finger painting): each finished page, as a picture, per child, in this browser's
 * IndexedDB. The newest 40 are kept. Falls back to memory where IndexedDB isn't available.
 */
export interface Painting {
  id: string;
  profileId: string;
  blob: Blob;
  at: number;
}

const DB = 'ksm-paintings';
const STORE = 'paintings';
export const KEEP_PAINTINGS = 40;

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let db: Promise<IDBDatabase> | null = null;
const memory = new Map<string, Painting>();
const useMemory = () => typeof indexedDB === 'undefined';

function open(): Promise<IDBDatabase> {
  db ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' }).createIndex('byChild', 'profileId');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return db;
}

export const paintingStore = {
  async all(profileId: string): Promise<Painting[]> {
    let list: Painting[];
    if (useMemory()) list = [...memory.values()].filter((p) => p.profileId === profileId);
    else {
      try {
        list = (await request((await open()).transaction(STORE).objectStore(STORE).index('byChild').getAll(profileId))) as Painting[];
      } catch {
        list = [...memory.values()].filter((p) => p.profileId === profileId);
      }
    }
    return list.sort((a, b) => b.at - a.at);
  },
  async add(p: Painting): Promise<void> {
    if (useMemory()) memory.set(p.id, p);
    else {
      try {
        await request((await open()).transaction(STORE, 'readwrite').objectStore(STORE).put(p));
      } catch {
        memory.set(p.id, p);
      }
    }
    const all = await paintingStore.all(p.profileId);
    for (const old of all.slice(KEEP_PAINTINGS)) await paintingStore.remove(old.id);
  },
  async remove(id: string): Promise<void> {
    memory.delete(id);
    if (useMemory()) return;
    try {
      await request((await open()).transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
    } catch {
      /* nothing stored */
    }
  },
  async forgetChild(profileId: string): Promise<void> {
    for (const p of await paintingStore.all(profileId)) await paintingStore.remove(p.id);
  },
};
