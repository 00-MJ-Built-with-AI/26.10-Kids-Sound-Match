import { FEEDBACK_SPEECH } from '../audio/clips';
import type { LoadedPack } from '../content/types';
import { TALK_PROMPTS } from '../learn/talkPrompts';
import { TALKING_STEPS } from '../report/talking';
import { ar, en, type StringKey } from './strings';

/**
 * The new Arabic for the parent to check (Settings > Check the Arabic): lines added since the parent
 * last read the Arabic. Ids are the ones arabicFixes.ts uses.
 */
export interface ReviewLine {
  id: string;
  ar: string;
  en: string;
}
export interface ReviewGroup {
  title: StringKey;
  lines: ReviewLine[];
}

/** Screen text added for Song time, her books, the new games, the rest and the check-ins. */
export const REVIEW_UI_KEYS: readonly StringKey[] = [
  'feelingsGame', 'feelingsSub', 'rhymesGame', 'rhymesSub', 'daybookGame', 'daybookSub', 'daybookMake', 'bringGame', 'bringSub',
  'cupsGame', 'cupsSub', 'gardenGame', 'gardenSub', 'gamesRestTitle', 'gamesRestBody', 'gamesRestOpen', 'gamesRestOk',
  'talkingTitle', 'talkingNoAge', 'talkingHers', 'talkingBy', 'talkingNext', 'talkingBoth', 'talkingMentionWords', 'talkingMentionTwo', 'talkingSource',
  'newBook', 'newSong', 'myBooks', 'myBooksHint', 'mySongs', 'mySongsHint', 'bookFirstName', 'addPage', 'addLine', 'newPage', 'newLine',
  'pageWords', 'lineWords', 'recPageAr', 'recPageEn', 'recLineAr', 'recLineEn', 'pageNeeds',
  'herTopTitle', 'herTopSub', 'allGames', 'checkinTitle', 'checkinTime', 'checkinCameBack', 'checkinLeft', 'checkinWords',
  'checkinIdeaStart', 'checkinIdeaLesson', 'checkinIdeaTogether', 'checkinIdeaKeep', 'checkinDone',
  'screenAverage', 'screenGuideUnder2', 'screenGuide2', 'messageTitle', 'messageBody', 'messagePlay', 'messageDone',
  'voiceFrom', 'voiceFromHint', 'voiceToWord', 'voiceToPage', 'voiceToMessage', 'voicePageHint', 'voiceMessageHint', 'voiceMessageKeep',
  'myMessages', 'myMessagesHint', 'messagesPack', 'messagesCount', 'messageSomeone', 'voiceKeptMessage', 'voiceKeptPage', 'voiceNoteCard', 'voiceNoteIntro', 'voiceNoteReady',
  'arabicCheckTitle', 'arabicCheckIntro', 'arabicCheckDone', 'arabicCheckOnlyOpen', 'arabicCopy', 'arabicCopied', 'arabicUndo',
];

/** Spoken lines added with the new games. */
const REVIEW_SPEECH = ['feedback/bring_f_ar.mp3', 'feedback/bring_m_ar.mp3'];

export function reviewGroups(packs: readonly LoadedPack[]): ReviewGroup[] {
  const items = (packId: string, keep: (key: string) => boolean = () => true): ReviewLine[] =>
    (packs.find((p) => p.id === packId)?.items ?? []).filter((i) => keep(i.key)).map((i) => ({ id: `item:${packId}/${i.key}`, ar: i.name.ar, en: i.name.en }));
  return [
    { title: 'rhymesGame', lines: items('rhymes') },
    { title: 'feelingsGame', lines: items('learn', (k) => k.startsWith('fe_')) },
    {
      title: 'arabicSpoken',
      lines: REVIEW_SPEECH.filter((p) => FEEDBACK_SPEECH[p]).map((p) => ({ id: `line:${p}`, ar: FEEDBACK_SPEECH[p], en: FEEDBACK_SPEECH[p.replace('_ar.', '_en.')] ?? '' })),
    },
    { title: 'talkingTitle', lines: TALKING_STEPS.flatMap((s) => s.text.ar.map((x, n) => ({ id: `talk:${s.months}:${n}`, ar: x, en: s.text.en[n] ?? '' }))) },
    {
      title: 'arabicPrompts',
      lines: (['book', 'daybook'] as const).flatMap((b) => TALK_PROMPTS[b].ar.map((x, n) => ({ id: `prompt:${b}:${n}`, ar: x, en: TALK_PROMPTS[b].en[n] ?? '' }))),
    },
    { title: 'arabicScreens', lines: REVIEW_UI_KEYS.map((k) => ({ id: `ui:${k}`, ar: ar[k], en: en[k] })) },
  ].filter((g) => g.lines.length) as ReviewGroup[];
}
