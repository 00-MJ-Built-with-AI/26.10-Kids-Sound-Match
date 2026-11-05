import type { Ambient } from '../audio/synth';
import { local } from './storage';

/** The sleep light's settings, for the whole phone: its sound, how long, and whether it follows Bedtime. */
export interface SleepPrefs {
  sound: Ambient;
  minutes: number;
  afterBedtime: boolean;
}

export const SLEEP_MINUTES = [10, 20, 30, 45] as const;
const KEY = 'ksm.sleepLight.v1';
const SOUNDS: readonly Ambient[] = ['rain', 'waves', 'lullaby', 'none'];

export function loadSleepPrefs(): SleepPrefs {
  const r = local.getJson<Partial<SleepPrefs>>(KEY) ?? {};
  return {
    sound: SOUNDS.includes(r.sound as Ambient) ? (r.sound as Ambient) : 'rain',
    minutes: SLEEP_MINUTES.includes(r.minutes as (typeof SLEEP_MINUTES)[number]) ? (r.minutes as number) : 20,
    afterBedtime: r.afterBedtime === true,
  };
}

export function saveSleepPrefs(p: SleepPrefs): void {
  local.setJson(KEY, p);
}
