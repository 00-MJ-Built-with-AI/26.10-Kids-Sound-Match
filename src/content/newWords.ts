/**
 * Two-word time and Hello and thank you hold new Arabic and English written for this family. The
 * parent asked to check the list first: until this is true they exist only on the development server.
 */
export const NEW_WORDS_APPROVED = true;

const PENDING_PACKS: readonly string[] = ['phrases', 'manners'];

export function packIsLive(packId: string, approved: boolean = NEW_WORDS_APPROVED || import.meta.env.DEV): boolean {
  return approved || !PENDING_PACKS.includes(packId);
}
