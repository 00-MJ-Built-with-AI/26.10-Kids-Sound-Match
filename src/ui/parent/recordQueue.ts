import type { Lang } from '../../content/types';

interface NamedItem {
  readonly nameAudio: Readonly<Record<Lang, { readonly path: string; readonly real: boolean }>>;
}

/** One name to record in the recording session: which pack, which item, which language. */
export interface QueuedName {
  pack: number;
  item: number;
  lang: Lang;
}

/**
 * The names still read by the phone's voice (no real recording, none of the parent's): every
 * Arabic one first (that's where phones most often lack a voice), then the English ones, pack by
 * pack. A name shared by two packs is asked once.
 */
export function wordsToRecord(
  packs: readonly { readonly items: readonly NamedItem[] }[],
  isMine: (path: string) => boolean,
  /** How often she has played a word: within a language, her words come first. */
  plays: (pack: number, item: number) => number = () => 0,
): QueuedName[] {
  const seen = new Set<string>();
  const out: QueuedName[] = [];
  for (const lang of ['ar', 'en'] as const) {
    const list: QueuedName[] = [];
    packs.forEach((p, pack) =>
      p.items.forEach((item, index) => {
        const asset = item.nameAudio[lang];
        if (asset.real || isMine(asset.path) || seen.has(asset.path)) return;
        seen.add(asset.path);
        list.push({ pack, item: index, lang });
      }),
    );
    out.push(...list.map((w, i) => ({ w, i, n: plays(w.pack, w.item) })).sort((a, b) => b.n - a.n || a.i - b.i).map((x) => x.w));
  }
  return out;
}
