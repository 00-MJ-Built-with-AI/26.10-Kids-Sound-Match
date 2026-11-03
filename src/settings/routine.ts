import { profileKey } from './profiles';
import { local } from './storage';

/**
 * Our day: the routine cards the parent chose, in order, and how far through today the child is.
 * Per child, on this phone only. A new day starts at the first card again.
 */
export interface RoutineState {
  /** Card keys in the order of the day. */
  order: string[];
  /** The day `at` belongs to (local date, YYYY-MM-DD). */
  day: string;
  /** The card that is "now" (order.length when the day is done). */
  at: number;
}

const KEY = 'ksm.routine.v1';

export function today(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Cleans what was stored: unknown cards are dropped, and yesterday's progress starts again. */
export function sanitizeRoutine(raw: unknown, allKeys: readonly string[], day: string): RoutineState {
  const r = raw && typeof raw === 'object' ? (raw as Partial<RoutineState>) : {};
  const known = new Set(allKeys);
  const stored = Array.isArray(r.order) ? r.order.filter((k): k is string => typeof k === 'string' && known.has(k)) : [];
  const order = [...new Set(stored)];
  const fresh = !Array.isArray(r.order);
  const sameDay = r.day === day && typeof r.at === 'number';
  return {
    order: fresh ? [...allKeys] : order,
    day,
    at: sameDay ? Math.max(0, Math.min(order.length || allKeys.length, Math.floor(r.at as number))) : 0,
  };
}

export function loadRoutine(profileId: string, allKeys: readonly string[], day = today()): RoutineState {
  return sanitizeRoutine(local.getJson(profileKey(KEY, profileId)), allKeys, day);
}

export function saveRoutine(profileId: string, state: RoutineState): void {
  local.setJson(profileKey(KEY, profileId), state);
}

/** Adds a card at the end, or takes it out. */
export function toggleCard(state: RoutineState, key: string): RoutineState {
  const order = state.order.includes(key) ? state.order.filter((k) => k !== key) : [...state.order, key];
  return { ...state, order, at: Math.min(state.at, order.length) };
}

/** Moves a card earlier (-1) or later (+1) in the day. */
export function moveCard(state: RoutineState, key: string, by: -1 | 1): RoutineState {
  const i = state.order.indexOf(key);
  const j = i + by;
  if (i < 0 || j < 0 || j >= state.order.length) return state;
  const order = [...state.order];
  [order[i], order[j]] = [order[j], order[i]];
  return { ...state, order };
}
