/**
 * Which update this device has, and getting a newer one. Every build publishes build-info.json,
 * which is never stored for offline use, so asking for it always reaches the live site.
 *
 * Getting an update only ever replaces the app's own files. Cookies, sign-in, settings, her words
 * and every recording are stored elsewhere and are never touched here.
 */
export interface BuildInfo {
  time: string;
  commit: string;
  message: string;
}

/** Long enough for a slow phone to fetch the app's files. */
const INSTALL_TIMEOUT_MS = 120_000;
/** The update tried a moment ago, so a second try knows the gentle way wasn't enough. */
const TRIED_KEY = 'ksm.updateTried.v1';

/** The live build when it is newer than this device's, else null. */
export function newerBuild(currentTime: string, live: unknown): BuildInfo | null {
  const b = live as Partial<BuildInfo> | null;
  if (!b || typeof b.time !== 'string') return null;
  const liveAt = Date.parse(b.time);
  const currentAt = Date.parse(currentTime);
  if (!Number.isFinite(liveAt) || !Number.isFinite(currentAt) || liveAt <= currentAt) return null;
  return { time: b.time, commit: typeof b.commit === 'string' ? b.commit : '', message: typeof b.message === 'string' ? b.message : '' };
}

/** The app's own file caches: not the photos and sounds, and not a voice note waiting to be used. */
export function appCaches(names: readonly string[]): string[] {
  return names.filter((n) => n.startsWith('ksm-') && !n.startsWith('ksm-media-') && n !== 'ksm-shared');
}

/** What the live site is running. Throws when it can't be reached. */
export async function fetchLiveBuild(): Promise<unknown> {
  const res = await fetch(`${import.meta.env.BASE_URL}build-info.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function untilActive(worker: ServiceWorker): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('The update took too long')), INSTALL_TIMEOUT_MS);
    const check = () => {
      if (worker.state === 'activated') {
        window.clearTimeout(timer);
        resolve();
      } else if (worker.state === 'redundant') {
        window.clearTimeout(timer);
        reject(new Error('The update could not be installed'));
      }
    };
    worker.addEventListener('statechange', check);
    check();
  });
}

/**
 * Fetches the new version and opens it. If the same update was already tried and this device is
 * still behind, its stored app files are replaced outright. Rejects, leaving the current version
 * working, when the update can't be fetched.
 */
export async function installUpdate(target: BuildInfo): Promise<void> {
  const stuck = sessionStorage.getItem(TRIED_KEY) === target.time;
  sessionStorage.setItem(TRIED_KEY, target.time);
  const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (stuck) {
    await reg?.unregister();
    await Promise.all(appCaches(await caches.keys()).map((name) => caches.delete(name)));
  } else if (reg) {
    await reg.update();
    const worker = reg.installing ?? reg.waiting;
    if (worker) await untilActive(worker);
  }
  window.location.reload();
}
