import type { Lang } from '../content/types';

/**
 * Talking milestones: what most children (about 3 in 4) do by each age, from the CDC's "Learn the
 * Signs. Act Early." milestones (2022). Bilingual children reach them at the same ages when words
 * in both languages are counted together.
 */
export interface TalkingStep {
  /** Age in months. */
  months: number;
  text: Record<Lang, string[]>;
}

export const TALKING_STEPS: readonly TalkingStep[] = [
  {
    months: 12,
    text: {
      en: ['Waves bye-bye', 'Calls a parent "mama", "dada" or another special name', 'Understands "no"'],
      ar: ['تلوّح باي باي', 'تنادي «ماما» أو «بابا» أو اسم خاص', 'تفهم «لا»'],
    },
  },
  {
    months: 15,
    text: {
      en: ['Tries to say one or two words besides "mama" or "dada"', 'Looks at a familiar thing when you name it', 'Points to ask for something'],
      ar: ['تحاول تقول كلمة أو كلمتين غير «ماما» و«بابا»', 'بتطّلع على شي بتعرفه لما تسمّوه', 'بتأشّر لتطلب شي'],
    },
  },
  {
    months: 18,
    text: {
      en: ['Tries to say three or more words besides "mama" or "dada"', 'Follows a one-step direction without a gesture, like "Give it to me"'],
      ar: ['تحاول تقول ثلاث كلمات أو أكثر غير «ماما» و«بابا»', 'بتنفّذ طلب من خطوة وحدة بدون إشارة، مثل «أعطيني ياه»'],
    },
  },
  {
    months: 24,
    text: {
      en: ['Says at least two words together, like "More milk"', 'Points to things in a book when you ask', 'Points to at least two body parts'],
      ar: ['تقول كلمتين مع بعض على الأقل، مثل «كمان حليب»', 'بتأشّر على أشياء بالكتاب لما تسألوها', 'بتأشّر على جزأين من جسمها على الأقل'],
    },
  },
  {
    months: 30,
    text: {
      en: ['Says about 50 words', 'Says two or more words with an action word, like "Doggy run"', 'Names things in a book when you point and ask'],
      ar: ['تقول حوالي ٥٠ كلمة', 'تقول كلمتين أو أكثر فيهم فعل، مثل «الكلب بيركض»', 'بتسمّي الأشياء بالكتاب لما تأشّروا وتسألوها'],
    },
  },
  {
    months: 36,
    text: {
      en: [
        'Talks with you, taking at least two turns back and forth',
        'Says her first name when asked',
        'Talks well enough for others to understand most of the time',
      ],
      ar: ['بتحكي معكم وبتردّ مرتين على الأقل', 'بتقول اسمها لما تسألوها', 'بتحكي بشكل يفهمه الغريب أغلب الوقت'],
    },
  },
];

export interface TalkingView {
  /** What most children do by now (the latest step at or before her age); null under a year. */
  now: TalkingStep | null;
  /** What comes next. */
  next: TalkingStep | null;
  /**
   * A gentle note, only from what's marked in the app: past 18 months with one or two words marked
   * as said (none marked usually means the parent doesn't mark them, so nothing is said), or past 2
   * years without "two words together" ticked.
   */
  mention: 'words' | 'two' | null;
}

export function talkingView(ageMonths: number, saysCount: number, twoWordsTicked: boolean): TalkingView {
  const reached = TALKING_STEPS.filter((s) => s.months <= ageMonths);
  const now = reached.length ? reached[reached.length - 1] : null;
  const next = TALKING_STEPS.find((s) => s.months > ageMonths) ?? null;
  const mention = ageMonths >= 24 && !twoWordsTicked ? 'two' : ageMonths >= 18 && saysCount > 0 && saysCount < 3 ? 'words' : null;
  return { now, next, mention };
}
