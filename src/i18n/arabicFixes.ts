import type { LoadedPack } from '../content/types';
import { local } from '../settings/storage';

/**
 * Check the Arabic: the parent's corrections to new Arabic lines, on this phone. Each line has an
 * id: `item:<pack>/<key>` (a word or rhyme line), `line:<file>` (a spoken game line), `talk:<months>:<n>`
 * (Talking at her age), `prompt:<book>:<n>` (talk prompts) or `ui:<key>` (a screen's text).
 * A fix is used on this phone straight away; "Copy my fixes" sends them to be made permanent.
 */
const FIXES_KEY = 'ksm.arFixes.v1';
const OK_KEY = 'ksm.arOk.v1';

let fixes: Record<string, string> = read(FIXES_KEY);

function read(key: string): Record<string, string> {
  const r = local.getJson<unknown>(key);
  if (!r || typeof r !== 'object') return {};
  return Object.fromEntries(Object.entries(r as Record<string, unknown>).filter((e): e is [string, string] => typeof e[1] === 'string'));
}

export function loadFixes(): Record<string, string> {
  fixes = read(FIXES_KEY);
  return { ...fixes };
}

/** The corrected text for a line, or the original. */
export function fixedText(id: string, original: string): string {
  return fixes[id] ?? original;
}

/** Saves a fix (or removes it with null or the original text). */
export function saveFix(id: string, text: string | null, original?: string): Record<string, string> {
  const next = { ...fixes };
  const clean = text?.trim();
  if (!clean || clean === original) delete next[id];
  else next[id] = clean;
  fixes = next;
  local.setJson(FIXES_KEY, next);
  return { ...next };
}

/** Lines the parent ticked as fine. */
export function loadChecked(): Record<string, string> {
  return read(OK_KEY);
}
export function setChecked(id: string, on: boolean): Record<string, string> {
  const next = read(OK_KEY);
  if (on) next[id] = new Date().toISOString().slice(0, 10);
  else delete next[id];
  local.setJson(OK_KEY, next);
  return next;
}

/** The packs with the parent's Arabic fixes to word and rhyme names (shown and spoken). */
export function fixPacks(packs: readonly LoadedPack[], current: Readonly<Record<string, string>> = fixes): LoadedPack[] {
  const ids = Object.keys(current).filter((id) => id.startsWith('item:'));
  if (!ids.length) return [...packs];
  return packs.map((p) => {
    if (!p.items.some((i) => current[`item:${p.id}/${i.key}`] !== undefined)) return p;
    return { ...p, items: p.items.map((i) => (current[`item:${p.id}/${i.key}`] !== undefined ? { ...i, name: { ...i.name, ar: current[`item:${p.id}/${i.key}`] } } : i)) };
  });
}

/** The fixes as text to paste in a message: one line each, the id, the old and the new text. */
export function fixesText(list: readonly { id: string; ar: string }[], current: Readonly<Record<string, string>> = fixes): string {
  return list
    .filter((l) => current[l.id] !== undefined)
    .map((l) => `${l.id}\n  ${l.ar}\n→ ${current[l.id]}`)
    .join('\n\n');
}
