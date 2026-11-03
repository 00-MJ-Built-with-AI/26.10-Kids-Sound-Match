/** Her picture book: how many pages of words, at most and at least. */
export const BOOK_MAX_WORDS = 10;
export const BOOK_MIN_WORDS = 6;

/**
 * The words in her goodnight book: the ones she understands or says, the newest first (so the book
 * grows with her), then, if there are only a few yet, words from the pack being played. No word twice.
 *
 * @param known word id -> when it became known (report/words knownWords)
 * @param says word id -> when the parent marked it as said
 * @param fill word ids to top up with, in order
 */
export function bookWords(
  known: ReadonlyMap<string, number>,
  says: Readonly<Record<string, number>>,
  fill: readonly string[],
  isUsable: (id: string) => boolean = () => true,
): string[] {
  const when = new Map<string, number>();
  for (const [id, at] of known) when.set(id, at);
  for (const [id, at] of Object.entries(says)) when.set(id, Math.max(at, when.get(id) ?? 0));
  const theirs = [...when.entries()]
    .filter(([id]) => isUsable(id))
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, BOOK_MAX_WORDS);
  const out = [...theirs];
  for (const id of fill) {
    if (out.length >= BOOK_MIN_WORDS) break;
    if (!out.includes(id) && isUsable(id)) out.push(id);
  }
  return out;
}
