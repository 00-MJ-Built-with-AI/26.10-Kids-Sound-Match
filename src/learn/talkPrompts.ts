import type { Lang } from '../content/types';
import { fixedText } from '../i18n/arabicFixes';

/**
 * Talk prompts while reading together: one small line for the grown-up on each page ("Ask: who's
 * that?", "Wait, let her point"). This back-and-forth reading (asking, waiting, adding a word) grows
 * a toddler's words more than reading straight through. `{word}` is the page's word.
 */
export type PromptBook = 'book' | 'daybook';

export const TALK_PROMPTS: Record<PromptBook, Record<Lang, string[]>> = {
  book: {
    en: [
      "Ask: what's this?",
      'Point, then wait: give her time to say it',
      'Say "{word}" slowly, then pause',
      "Ask: where's the {word}?",
      'Make its sound or its action together',
      'Copy what she says and add one word',
    ],
    ar: ['اسألوها: شو هاد؟', 'أشّروا واستنّوا: اعطوها وقت تقولها', 'قولوا «{word}» على مهل، واستنّوا', 'اسألوها: وين الـ{word}؟', 'اعملوا صوته أو حركته مع بعض', 'ردّدوا اللي بتقوله وزيدوا كلمة'],
  },
  daybook: {
    en: [
      "Ask: who's that?",
      'Wait, let her point first',
      'Ask: what are you doing here?',
      'Name what she points at, then wait',
      'Talk about what happens next',
      'Copy what she says and add one word',
    ],
    ar: ['اسألوها: مين هاي؟', 'استنّوا، خلّوها تأشّر هي أوّل', 'اسألوها: شو عم تعملي هون؟', 'سمّوا الشي اللي بتأشّر عليه، واستنّوا', 'احكوا عن شو صار بعدها', 'ردّدوا اللي بتقوله وزيدوا كلمة'],
  },
};

/** The prompt for a page: they take turns, so each page asks something different. */
export function talkPrompt(book: PromptBook, page: number, lang: Lang, word?: string): string {
  const list = TALK_PROMPTS[book][lang];
  // Prompts with the word only on pages that have one.
  const usable = list.map((text, i) => ({ text, i })).filter((p) => word || !p.text.includes('{word}'));
  const pick = usable[page % usable.length];
  const text = lang === 'ar' ? fixedText(`prompt:${book}:${pick.i}`, pick.text) : pick.text;
  return text.replace(/\{word\}/g, word ?? '');
}
