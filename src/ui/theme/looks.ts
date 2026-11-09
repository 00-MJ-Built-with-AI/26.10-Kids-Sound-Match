import { LOOKS, type Look } from '../../settings/settings';
import './looks.css';

/** The look on screen (the child's choice, set on <html> by App). */
export function lookNow(): Look {
  const look = document.documentElement.dataset.look as Look | undefined;
  return look && LOOKS.includes(look) ? look : 'now';
}

/** Offline: fetch this look's pictures and fonts in the background (not on Data Saver). */
export function warmLook(look: Look): void {
  if (look === 'now' || look === 'bunny' || !import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  if ((navigator as { connection?: { saveData?: boolean } }).connection?.saveData) return;
  void navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage({ warmLook: look }));
}
