import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Family circle: private links for grandparents and family. With a link they see what the parent's
 * phone shares (her week, her words, her books) and send recordings for her: a word in their voice,
 * or a message. See supabase/family.sql for how the cloud keeps it private.
 */
export interface FamilyLink {
  token: string;
  name: string;
  created_at: string;
  revoked: boolean;
}

/** What the family sees. Names and small photos only: no results, no recordings of her. */
export interface FamilySummary {
  v: 1;
  child: { animal: string; color: string; character?: string };
  week: { minutes: number; days: number; newWords: { ar: string; en: string }[] };
  /** Words she understands or says, newest first, with a picture path on the app's site. */
  words: { id: string; ar: string; en: string; says: boolean; picture?: string }[];
  /** Words she's learning now, for the family to record. */
  learning: { id: string; ar: string; en: string; picture?: string }[];
  books: { title: string; pages: { photo: string; text: string }[] }[];
  updatedAt: number;
}

export interface InboxItem {
  id: string;
  token: string;
  kind: 'word' | 'message';
  word: string | null;
  lang: 'ar' | 'en' | null;
  from_name: string;
  path: string;
  created_at: string;
}

export const INBOX_BUCKET = 'family-inbox';
/** How often the parent's phone refreshes what the family sees, at most. */
export const PUBLISH_EVERY_MS = 6 * 60 * 60 * 1000;

/** A new link's secret: 32 random bytes as 64 hex characters. */
export function newFamilyToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** The address to send the family: the app with the link in it. */
export function familyUrl(token: string, base: string = `${location.origin}${location.pathname}`): string {
  return `${base}?family=${token}`;
}

/** The family circle isn't set up in the cloud yet (supabase/family.sql not run). */
export function notSetUp(error: { code?: string; message?: string } | null | undefined): boolean {
  return !!error && (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST202' || /family_/.test(error.message ?? ''));
}

const check = <T>(r: { data: T; error: { code?: string; message?: string } | null }): T => {
  if (r.error) throw r.error;
  return r.data;
};

/** The parent's side (signed in). */
export function parentFamily(sb: SupabaseClient, uid: string) {
  return {
    async links(): Promise<FamilyLink[]> {
      return check(await sb.from('family_links').select('token,name,created_at,revoked').order('created_at')) as FamilyLink[];
    },
    async addLink(name: string): Promise<FamilyLink> {
      const link = { token: newFamilyToken(), name: name.trim().slice(0, 60), user_id: uid };
      check(await sb.from('family_links').insert(link));
      return { token: link.token, name: link.name, created_at: new Date().toISOString(), revoked: false };
    },
    async setRevoked(token: string, revoked: boolean): Promise<void> {
      check(await sb.from('family_links').update({ revoked }).eq('token', token));
    },
    async publish(summary: FamilySummary): Promise<void> {
      check(await sb.from('family_shares').upsert({ user_id: uid, summary, updated_at: new Date().toISOString() }));
    },
    async inbox(): Promise<InboxItem[]> {
      return check(await sb.from('family_inbox').select('id,token,kind,word,lang,from_name,path,created_at').order('created_at')) as InboxItem[];
    },
    async download(path: string): Promise<Blob> {
      const data = check(await sb.storage.from(INBOX_BUCKET).download(path));
      if (!data) throw new Error('missing recording');
      return data;
    },
    /** Picked up: the recording and its note are removed from the cloud. */
    async clear(item: InboxItem): Promise<void> {
      await sb.storage.from(INBOX_BUCKET).remove([item.path]);
      check(await sb.from('family_inbox').delete().eq('id', item.id));
    },
  };
}

/** The family's side: only the link. */
export function familySide(sb: SupabaseClient, token: string) {
  return {
    async view(): Promise<{ name: string; summary: FamilySummary; updated_at: string } | null> {
      const data = check(await sb.rpc('family_view', { p_token: token })) as { name: string; summary: FamilySummary; updated_at: string } | null;
      return data;
    },
    async send(kind: 'word' | 'message', blob: Blob, word: string | null, lang: 'ar' | 'en' | null): Promise<void> {
      const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : blob.type.includes('wav') ? 'wav' : 'webm';
      const path = `${token}/${newFamilyToken().slice(0, 24)}.${ext}`;
      check(await sb.storage.from(INBOX_BUCKET).upload(path, blob, { contentType: blob.type.split(';')[0] || 'audio/webm', upsert: false }));
      check(await sb.rpc('family_send', { p_token: token, p_kind: kind, p_word: word, p_lang: lang, p_path: path }));
    },
  };
}
