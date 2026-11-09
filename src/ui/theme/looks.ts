import { LOOKS, type Look } from '../../settings/settings';
import './looks.css';

/** The look on screen (the child's choice, set on <html> by App). */
export function lookNow(): Look {
  const look = document.documentElement.dataset.look as Look | undefined;
  return look && LOOKS.includes(look) ? look : 'now';
}

/** The room for a grid of cards: the new looks keep clear of the screen's edge, the original stays as it was. */
export function lookBox(box: { w: number; h: number }): { w: number; h: number } {
  return lookNow() === 'now' ? box : { w: box.w - 32, h: box.h - 28 };
}

/** Offline: fetch this look's pictures and fonts in the background (not on Data Saver). */
export function warmLook(look: Look): void {
  if (look === 'now' || !import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  if ((navigator as { connection?: { saveData?: boolean } }).connection?.saveData) return;
  void navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage({ warmLook: look }));
}
