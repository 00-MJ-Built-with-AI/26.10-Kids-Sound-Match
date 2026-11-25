import type { LoadedPack } from '../content/types';
import { iconToBlob } from '../custom/imageTools';
import { customOps } from '../custom/ops';
import { overrideOps } from '../custom/overrides';
import { customStore } from '../custom/store';
import type { CustomPackView } from '../custom/toLoaded';
import { customKind } from '../custom/types';
import { learningWords, buildBrain } from '../learn/brain';
import { makeI18n } from '../i18n/I18n';
import { weekCheckin } from '../report/checkin';
import type { QuestionResultEntity, SessionEntity } from '../report/types';
import { knownWords, wordEvidence } from '../report/words';
import type { PlayEntry } from '../settings/playLog';
import type { Profile } from '../settings/profiles';
import { wordLookup } from '../ui/parent/WordsScreen';
import type { FamilySummary, InboxItem, parentFamily } from './family';

const MAX_WORDS = 150;
const MAX_LEARNING = 24;
const MAX_BOOKS = 3;
const MAX_PAGES = 12;
const THUMB = 320;

/** A small JPEG of a page's photo, kept inside the summary (no files to share separately). */
async function thumbnail(blob: Blob): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(blob);
    const s = Math.min(1, THUMB / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * s);
    canvas.height = Math.round(bitmap.height * s);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.72);
  } catch {
    return null;
  }
}

/**
 * What the family sees for one child: her week, the words she understands or says (with the app's
 * own pictures, never a photo), the words she's learning, and her books' pages as small photos.
 */
export async function buildSummary(input: {
  child: Profile;
  log: readonly PlayEntry[];
  sessions: readonly SessionEntity[];
  questions: readonly QuestionResultEntity[];
  says: Readonly<Record<string, number>>;
  /** The packs as shipped, for the app's own pictures. */
  builtin: readonly LoadedPack[];
  views: readonly CustomPackView[];
  lang: 'ar' | 'en';
  now?: number;
}): Promise<FamilySummary> {
  const now = input.now ?? Date.now();
  const lookup = wordLookup(input.builtin);
  const known = knownWords(wordEvidence(input.sessions, input.questions, (id) => [...lookup.values()].some((w) => w.pack.id === id)));
  const week = weekCheckin(input.log, known, input.says, now);
  const name = (id: string) => lookup.get(id)?.item.name;
  const picture = (id: string) => lookup.get(id)?.picture;
  const ids = [...new Set([...Object.keys(input.says), ...known.keys()])]
    .filter((id) => name(id))
    .sort((a, b) => Math.max(known.get(b) ?? 0, input.says[b] ?? 0) - Math.max(known.get(a) ?? 0, input.says[a] ?? 0))
    .slice(0, MAX_WORDS);
  const learning = [...learningWords(buildBrain(input.sessions, input.questions, input.says), now)].filter((id) => name(id) && !ids.includes(id)).slice(0, MAX_LEARNING);
  const books: FamilySummary['books'] = [];
  for (const v of input.views.filter((x) => customKind(x.pack.id) === 'book').slice(0, MAX_BOOKS)) {
    const pages: { photo: string; text: string }[] = [];
    for (const item of v.items.filter((i) => i.picture && !i.deleted).slice(0, MAX_PAGES)) {
      const photo = await thumbnail(item.picture!);
      if (photo) pages.push({ photo, text: item.name[input.lang] || item.name.ar || item.name.en });
    }
    if (pages.length) books.push({ title: v.pack.name[input.lang] || v.pack.name.ar || v.pack.name.en, pages });
  }
  return {
    v: 1,
    child: { animal: input.child.animal, color: input.child.color, ...(input.child.character ? { character: input.child.character } : {}) },
    week: { minutes: week.minutes, days: week.days, newWords: week.newWords.map(name).filter((n) => n !== undefined).map((n) => ({ ar: n.ar, en: n.en })) },
    words: ids.map((id) => ({ id, ar: name(id)!.ar, en: name(id)!.en, says: input.says[id] !== undefined, picture: picture(id) })),
    learning: learning.map((id) => ({ id, ar: name(id)!.ar, en: name(id)!.en, picture: picture(id) })),
    books,
    updatedAt: now,
  };
}

/**
 * The family's recordings, picked up on the parent's phone: a word in their voice becomes that
 * word's recording (like a shared voice note), a message goes to Family messages on Home. Each is
 * removed from the cloud once it's safely on the phone.
 */
export async function collectInbox(api: ReturnType<typeof parentFamily>, builtin: readonly LoadedPack[], views: readonly CustomPackView[]): Promise<number> {
  const items: InboxItem[] = await api.inbox();
  if (!items.length) return 0;
  const lookup = wordLookup(builtin);
  const overrides = overrideOps(customStore);
  const ops = customOps(customStore);
  let notes = views.find((v) => customKind(v.pack.id) === 'note')?.pack ?? null;
  let taken = 0;
  for (const item of items) {
    try {
      const blob = await api.download(item.path);
      if (item.kind === 'word') {
        const word = item.word ? lookup.get(item.word) : undefined;
        if (word) await overrides.save(word.item.nameAudio[item.lang ?? 'ar'].path, blob);
      } else {
        notes ??= await ops.createPack({ ar: makeI18n('ar').t('messagesPack'), en: makeI18n('en').t('messagesPack') }, 'note');
        const from = item.from_name || makeI18n('en').t('messageSomeone');
        await ops.saveItem(
          { ...ops.emptyItem(notes.id), name: { ar: from, en: from }, picture: await iconToBlob('💌'), pictureKind: 'icon', nameAudio: { [item.lang ?? 'ar']: blob } },
          true,
        );
      }
      await api.clear(item);
      taken++;
    } catch (e) {
      console.warn('[family] could not pick up a recording', e);
    }
  }
  return taken;
}
