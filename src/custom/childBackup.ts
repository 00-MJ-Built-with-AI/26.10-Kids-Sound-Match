import { loadFavourites, saveFavourites } from '../settings/favourites';
import type { VoiceClip, VoiceStore } from '../settings/herVoice';
import { voiceId } from '../settings/herVoice';
import { loadCertificates, loadMilestones, saveCertificates, saveMilestones } from '../settings/milestones';
import { loadFeelings, saveFeelings, type FeelingCheck } from '../settings/plan';
import { loadPlayLog, savePlayLog, type PlayEntry } from '../settings/playLog';
import { local } from '../settings/storage';
import { loadWordMarks, saveWordMarks, type WordMarks } from '../settings/words';

/**
 * Optional backup of each child's own things, next to the parent's packs in their private cloud
 * folder: her voice recordings, Words I know marks, feelings check-ins, milestones, certificates,
 * play time and favourite games. Off unless the parent turns it on. Phones are merged, not
 * overwritten: what either phone has is kept (a word marked on one phone counts on both).
 *
 * Files, under the account's folder: children/<child id>/data.json and children/<child id>/voice/<word>.
 * The first child has the same id on every phone, so one child just works across phones.
 */
export interface ChildData {
  v: 1;
  words: WordMarks;
  feelings: FeelingCheck[];
  milestones: Record<string, number>;
  certificates: Record<string, number>;
  playLog: PlayEntry[];
  favourites: string[];
  /** Her recordings: word id -> when recorded (the files are stored separately). */
  voice: Record<string, number>;
}

/** What the backup needs from the cloud's file storage (paths are inside the account's folder). */
export interface ChildRemote {
  readJson(path: string): Promise<unknown>;
  writeJson(path: string, value: unknown): Promise<void>;
  upload(path: string, blob: Blob): Promise<void>;
  download(path: string): Promise<Blob>;
  remove(paths: string[]): Promise<void>;
}

const ENABLED_KEY = 'ksm.childBackup.v1';

export const childBackupEnabled = () => local.get(ENABLED_KEY) === '1';
export function setChildBackup(on: boolean): void {
  if (on) local.set(ENABLED_KEY, '1');
  else local.remove(ENABLED_KEY);
}

const earliest = (a: Record<string, number>, b: Record<string, number>) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) if (out[k] === undefined || v < out[k]) out[k] = v;
  return out;
};

/** Cleans what came from the cloud: anything malformed is dropped. */
export function sanitizeChildData(raw: unknown): ChildData | null {
  if (!raw || typeof raw !== 'object' || (raw as { v?: unknown }).v !== 1) return null;
  const r = raw as Partial<ChildData>;
  const nums = (x: unknown): Record<string, number> =>
    x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).filter(([, v]) => typeof v === 'number')) : {};
  const words = r.words && typeof r.words === 'object' ? r.words : { says: {}, extra: [] };
  return {
    v: 1,
    words: {
      says: nums(words.says),
      extra: (Array.isArray(words.extra) ? words.extra : []).filter((e) => e && typeof e.id === 'string' && typeof e.text === 'string' && typeof e.at === 'number'),
    },
    feelings: (Array.isArray(r.feelings) ? r.feelings : []).filter((f) => f && typeof f.feeling === 'string' && typeof f.at === 'number'),
    milestones: nums(r.milestones),
    certificates: nums(r.certificates),
    playLog: (Array.isArray(r.playLog) ? r.playLog : []).filter((e) => e && typeof e.kind === 'string' && typeof e.at === 'number' && typeof e.ms === 'number'),
    favourites: (Array.isArray(r.favourites) ? r.favourites : []).filter((x): x is string => typeof x === 'string'),
    voice: nums(r.voice),
  };
}

/** Both phones' things together. Recordings: the newer one of each word wins. */
export function mergeChildData(a: ChildData, b: ChildData): ChildData {
  const extra = [...a.words.extra];
  for (const e of b.words.extra) if (!extra.some((x) => x.id === e.id || x.text.toLocaleLowerCase() === e.text.toLocaleLowerCase())) extra.push(e);
  const byAt = <T extends { at: number }>(list: T[], key: (x: T) => string) => {
    const seen = new Map<string, T>();
    for (const x of list) seen.set(key(x), x);
    return [...seen.values()].sort((x, y) => x.at - y.at);
  };
  const voice = { ...a.voice };
  for (const [w, at] of Object.entries(b.voice)) if (voice[w] === undefined || at > voice[w]) voice[w] = at;
  return {
    v: 1,
    words: { says: earliest(a.words.says, b.words.says), extra: extra.sort((x, y) => x.at - y.at) },
    feelings: byAt([...a.feelings, ...b.feelings], (f) => `${f.at}|${f.feeling}`).slice(-60),
    milestones: earliest(a.milestones, b.milestones),
    certificates: earliest(a.certificates, b.certificates),
    playLog: byAt([...a.playLog, ...b.playLog], (e) => `${e.at}|${e.kind}`).slice(-600),
    favourites: a.favourites.length ? a.favourites : b.favourites,
    voice,
  };
}

/** A word id ("animals/cat") as a file name. */
export const voiceFile = (word: string) => encodeURIComponent(word);

/** This phone's copy of a child's things. */
export function readLocal(profileId: string, clips: readonly VoiceClip[]): ChildData {
  return {
    v: 1,
    words: loadWordMarks(profileId),
    feelings: loadFeelings(profileId),
    milestones: loadMilestones(profileId),
    certificates: loadCertificates(profileId),
    playLog: loadPlayLog(profileId),
    favourites: loadFavourites(profileId),
    voice: Object.fromEntries(clips.map((c) => [c.word, c.at])),
  };
}

function writeLocal(profileId: string, d: ChildData): void {
  saveWordMarks(profileId, d.words);
  saveFeelings(profileId, d.feelings);
  saveMilestones(profileId, d.milestones);
  saveCertificates(profileId, d.certificates);
  savePlayLog(profileId, d.playLog);
  if (d.favourites.length) saveFavourites(profileId, d.favourites);
}

/**
 * Backs up one child and brings in what another phone backed up. Returns true when this phone
 * received something new.
 */
export async function syncChild(remote: ChildRemote, profileId: string, voices: VoiceStore): Promise<boolean> {
  const dir = `children/${encodeURIComponent(profileId)}`;
  const clips = await voices.all(profileId);
  const mine = readLocal(profileId, clips);
  let theirs: ChildData | null = null;
  try {
    theirs = sanitizeChildData(await remote.readJson(`${dir}/data.json`));
  } catch {
    theirs = null; // nothing backed up yet
  }
  const merged = theirs ? mergeChildData(mine, theirs) : mine;
  writeLocal(profileId, merged);

  // Recordings: upload this phone's newer ones, download the other phone's newer ones.
  const have = new Map(clips.map((c) => [c.word, c]));
  let received = false;
  for (const [word, at] of Object.entries(merged.voice)) {
    const path = `${dir}/voice/${voiceFile(word)}`;
    const here = have.get(word);
    if (here && here.at === at) {
      if (theirs?.voice[word] !== at) await remote.upload(path, here.blob);
    } else if (!here || at > here.at) {
      try {
        const blob = await remote.download(path);
        await voices.put({ id: voiceId(profileId, word), profileId, word, blob, at });
        received = true;
      } catch {
        // Listed but not uploaded (the other phone stopped mid-way): keep what this phone has.
        if (here) merged.voice[word] = here.at;
        else delete merged.voice[word];
      }
    }
  }
  await remote.writeJson(`${dir}/data.json`, merged);
  const withoutVoice = (d: ChildData) => JSON.stringify({ ...d, voice: {} });
  return received || withoutVoice(merged) !== withoutVoice(mine);
}

/** Removes a child's backup (Delete my cloud data). */
export async function removeChild(remote: ChildRemote, profileId: string): Promise<void> {
  const dir = `children/${encodeURIComponent(profileId)}`;
  let data: ChildData | null = null;
  try {
    data = sanitizeChildData(await remote.readJson(`${dir}/data.json`));
  } catch {
    return;
  }
  const paths = [`${dir}/data.json`, ...Object.keys(data?.voice ?? {}).map((w) => `${dir}/voice/${voiceFile(w)}`)];
  for (let i = 0; i < paths.length; i += 100) await remote.remove(paths.slice(i, i + 100));
}
