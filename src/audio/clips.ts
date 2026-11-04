import type { ArGender, FeedbackLineId, Lang, LoadedItem, LoadedPack, ResolvedAsset } from '../content/types';
import { speechSupported } from './speech';

export type ClipCategory = 'sound' | 'name' | 'feedback';

export type FileClip = { kind: 'file'; url: string; category: ClipCategory; label: string };
/** `fallback` plays when the phone has no voice for the language when the clip is played. */
export type Clip = FileClip | { kind: 'speech'; text: string; lang: Lang; label: string; fallback: FileClip };

/**
 * What the stand-in voice says for each feedback clip until the recordings exist. Mirrors the
 * recording script, with the agreed gender-neutral Arabic lines (جميل! and انتهينا! برافو!).
 */
export const FEEDBACK_SPEECH: Record<string, string> = {
  'feedback/correct_ar_1.mp3': 'جميل!',
  'feedback/correct_ar_2.mp3': 'برافو!',
  'feedback/correct_ar_3.mp3': 'ممتاز!',
  'feedback/correct_ar_4.mp3': 'رائع!',
  'feedback/correct_ar_5.mp3': 'يا سلام!',
  'feedback/correct_en_1.mp3': 'Hooray!',
  'feedback/correct_en_2.mp3': 'Well done!',
  'feedback/correct_en_3.mp3': 'Great job!',
  'feedback/correct_en_4.mp3': 'Yes!',
  'feedback/correct_en_5.mp3': 'Amazing!',
  'feedback/session_end_ar.mp3': 'انتهينا! برافو!',
  'feedback/session_end_en.mp3': 'Well done! You finished the game',
  // "Who eats what?": said after the animal's name. Arabic follows the animal's gender.
  'feedback/eat_question_ar.mp3': 'ماذا يأكل؟',
  'feedback/eat_question_ar_f.mp3': 'ماذا تأكل؟',
  'feedback/eat_question_en.mp3': 'What does it eat?',
  // "Where does it live?"
  'feedback/home_question_ar.mp3': 'أين يعيش؟',
  'feedback/home_question_ar_f.mp3': 'أين تعيش؟',
  'feedback/home_question_en.mp3': 'Where does it live?',
  // "Animal babies"
  'feedback/baby_question_ar.mp3': 'أين صغيره؟',
  'feedback/baby_question_ar_f.mp3': 'أين صغيرها؟',
  'feedback/baby_question_en.mp3': 'Where is its baby?',
  // Odd one out
  'feedback/odd_question_ar.mp3': 'أين المختلف؟',
  'feedback/odd_question_en.mp3': 'Which one is different?',
  // Peekaboo, as the blanket comes off
  'feedback/peekaboo_ar.mp3': 'بَخ!',
  'feedback/peekaboo_en.mp3': 'Peekaboo!',
  'feedback/rest_ar.mp3': 'وقت الراحة',
  'feedback/rest_en.mp3': 'Time to rest',
  // Talk time: the picture, then this, then a quiet wait for the child to say the word.
  'feedback/talk_question_ar.mp3': 'شو هاد؟',
  'feedback/talk_question_en.mp3': "What's this?",
  // The picture book: "ليلة سعيدة يا قطة" on each page, and a last line.
  'feedback/goodnight_ar.mp3': 'ليلة سعيدة',
  'feedback/goodnight_en.mp3': 'Goodnight',
  'feedback/sleep_tight_ar.mp3': 'ليلة سعيدة! نوم الهنا',
  'feedback/sleep_tight_en.mp3': 'Goodnight! Sleep tight',
  // Our day: "وبعدين… حمّام".
  'feedback/then_ar.mp3': 'وبعدين',
  'feedback/then_en.mp3': 'And then',
  // Taking turns in the matching game.
  'feedback/your_turn_ar.mp3': 'دورك!',
  'feedback/your_turn_en.mp3': 'Your turn!',
  'feedback/my_turn_ar.mp3': 'دوري!',
  'feedback/my_turn_en.mp3': 'My turn!',
  // Animal sounds, after the animal's name.
  'feedback/says_ar.mp3': 'شو بيقول؟',
  'feedback/says_f_ar.mp3': 'شو بتقول؟',
  'feedback/says_en.mp3': 'What does it say?',
  'feedback/says_f_en.mp3': 'What does it say?',
  // Big and little, after the name.
  'feedback/where_little_ar.mp3': 'وين الصغير؟',
  'feedback/where_little_f_ar.mp3': 'وين الصغيرة؟',
  'feedback/where_little_en.mp3': "Where's the little one?",
  'feedback/where_little_f_en.mp3': "Where's the little one?",
  'feedback/where_big_ar.mp3': 'وين الكبير؟',
  'feedback/where_big_f_ar.mp3': 'وين الكبيرة؟',
  'feedback/where_big_en.mp3': "Where's the big one?",
  'feedback/where_big_f_en.mp3': "Where's the big one?",
  // Colour hunt, before the colour.
  'feedback/find_f_ar.mp3': 'دوّري على شي',
  'feedback/find_m_ar.mp3': 'دوّر على شي',
  'feedback/find_f_en.mp3': 'Find something',
  'feedback/find_m_en.mp3': 'Find something',
  // What's missing?, after the name.
  'feedback/where_gone_ar.mp3': 'وين راح؟',
  'feedback/where_gone_f_ar.mp3': 'وين راحت؟',
  'feedback/where_gone_en.mp3': 'Where did it go?',
  'feedback/where_gone_f_en.mp3': 'Where did it go?',
  'feedback/count_ar.mp3': 'يلّا نعدّ!',
  'feedback/count_en.mp3': "Let's count!",
  'feedback/tidy_ar.mp3': 'يلّا نرتّب!',
  'feedback/tidy_en.mp3': "Let's tidy up!",
};

/** A shared line in both languages (see FeedbackLineId). */
export type SharedLine = Readonly<Record<Lang, ResolvedAsset | null>>;

/** A shared line ("What's this?", "Goodnight"...) from whichever pack holds it (the Animals pack). */
export function findLine(packs: readonly LoadedPack[], id: FeedbackLineId): SharedLine | undefined {
  return packs.find((p) => p.feedback.lines?.[id])?.feedback.lines?.[id];
}

/** Peekaboo's "بَخ!" lines, which live with the shared game lines (the Animals pack). */
export type PeekabooLines = Readonly<Record<Lang, ResolvedAsset | null>>;

/**
 * Picks what to play for each moment: a real recording, else (development only) the device
 * voice, else a tone. `languages` is the spoken order: ['ar'], ['en'] or ['ar', 'en'] for Both.
 */
export class ClipResolver {
  constructor(
    private readonly pack: LoadedPack,
    private readonly languages: readonly Lang[],
  ) {}

  /** Null for things without a sound. */
  sound(item: LoadedItem): Clip | null {
    return item.sound ? file(item.sound, 'sound', `sound:${item.key}`) : null;
  }

  /** The name in each spoken language, in order ("قطة… Cat" for Both). */
  names(item: LoadedItem): Clip[] {
    const clips = this.languages.map((lang) => this.voiced(item.nameAudio[lang], item.name[lang], lang, 'name', `name:${item.key}:${lang}`));
    // A parent's item recorded in one language uses that recording for both: say it once.
    return clips.filter((c, i) => c.kind !== 'file' || clips.findIndex((o) => o.kind === 'file' && o.url === c.url) === i);
  }

  /**
   * Association games: the question after the prompt item's name, in one language
   * ("ماذا تأكل؟" for a cow, "ماذا يأكل؟" for a horse, "What does it eat?").
   */
  question(about: LoadedItem, lang: Lang): Clip | null {
    const assoc = this.pack.association;
    if (!assoc) return null;
    const asset = (about.arFeminine && assoc.questionFeminine[lang]) || assoc.question[lang];
    return asset ? this.voiced(asset, FEEDBACK_SPEECH[asset.path], lang, 'feedback', `question:${asset.path}`) : null;
  }

  /** Association games: the prompt item's name, then the question, in each spoken language. */
  askAbout(about: LoadedItem): Clip[] {
    const names = this.names(about);
    // A name recorded once for both languages (parents' own items) is said once, before the questions.
    if (names.length < this.languages.length) return [...names, ...this.languages.map((l) => this.question(about, l)).filter(isClip)];
    return this.languages.flatMap((lang, i) => [names[i], this.question(about, lang)]).filter(isClip);
  }

  /** Odd one out: "Which one is different?" in each spoken language. */
  oddQuestion(): Clip[] {
    const lines = this.pack.feedback.oddQuestion;
    if (!lines) return [];
    return this.languages.flatMap((lang) => {
      const asset = lines[lang];
      return asset ? [this.voiced(asset, FEEDBACK_SPEECH[asset.path], lang, 'feedback', `odd:${lang}`)] : [];
    });
  }

  /** Peekaboo: "بَخ!" / "Peekaboo!" in each spoken language. */
  peekaboo(lines: PeekabooLines | undefined = this.pack.feedback.peekaboo): Clip[] {
    if (!lines) return [];
    return this.languages.flatMap((lang) => {
      const asset = lines[lang];
      return asset ? [this.voiced(asset, FEEDBACK_SPEECH[asset.path], lang, 'feedback', `peekaboo:${lang}`)] : [];
    });
  }

  /**
   * "Where's your nose?" in each spoken language; the Arabic follows the child (أين أنفُكِ؟ for a
   * girl, أين أنفُكَ؟ for a boy). A language without a line is left out.
   */
  pointQuestion(item: LoadedItem, gender: ArGender): Clip[] {
    const lines = item.point;
    if (!lines) return [];
    return this.languages.flatMap((lang) => {
      const line = lang === 'en' ? lines.en : lines[gender === 'm' ? 'ar_m' : 'ar_f'];
      return line ? [this.voiced(line.audio, line.text, lang, 'feedback', `point:${item.key}:${lang}`)] : [];
    });
  }

  /** A shared line in each spoken language, or only in `only`. */
  line(line: SharedLine | undefined, only?: Lang): Clip[] {
    if (!line) return [];
    return (only ? [only] : this.languages).flatMap((lang) => {
      const asset = line[lang];
      return asset ? [this.voiced(asset, FEEDBACK_SPEECH[asset.path], lang, 'feedback', `line:${asset.path}`)] : [];
    });
  }

  /** A "Where's your nose?"-style line (on body parts, actions, the baby's needs, songs) in one language. */
  pointIn(item: LoadedItem, lang: Lang, gender: ArGender): Clip | null {
    const line = lang === 'en' ? item.point?.en : item.point?.[gender === 'm' ? 'ar_m' : 'ar_f'];
    return line ? this.voiced(line.audio, line.text, lang, 'feedback', `point:${item.key}:${lang}`) : null;
  }

  /** The name in one language. */
  nameIn(item: LoadedItem, lang: Lang): Clip {
    return this.voiced(item.nameAudio[lang], item.name[lang], lang, 'name', `name:${item.key}:${lang}`);
  }

  /** The spoken languages, in order. */
  get spoken(): readonly Lang[] {
    return this.languages;
  }

  /** Association games: a happy "yum" after a right answer. */
  reward(): Clip | null {
    const asset = this.pack.association?.reward;
    return asset ? file(asset, 'feedback', 'reward') : null;
  }

  /** One praise line, in a random spoken language. */
  correct(random: () => number): Clip | null {
    const lang = this.languages[Math.floor(random() * this.languages.length)];
    const options = this.pack.feedback.correct[lang];
    if (!options.length) return null;
    const asset = options[Math.floor(random() * options.length)];
    return this.voiced(asset, FEEDBACK_SPEECH[asset.path], lang, 'feedback', `praise:${asset.path}`);
  }

  incorrectTone(): Clip | null {
    const asset = this.pack.feedback.incorrectTone;
    return asset ? file(asset, 'feedback', 'incorrect') : null;
  }

  sessionEnd(): Clip[] {
    return this.languages.flatMap((lang) => {
      const asset = this.pack.feedback.sessionEnd[lang];
      return asset ? [this.voiced(asset, FEEDBACK_SPEECH[asset.path], lang, 'feedback', `session-end:${lang}`)] : [];
    });
  }

  /** Every clip a set of animals might need, for preloading. */
  clipsFor(items: readonly LoadedItem[]): Clip[] {
    return items.flatMap((i) => [this.sound(i), ...this.names(i)]).filter(isClip);
  }

  feedbackClips(): Clip[] {
    const praise = this.languages.flatMap((lang) =>
      this.pack.feedback.correct[lang].map((a) => this.voiced(a, FEEDBACK_SPEECH[a.path], lang, 'feedback', a.path)),
    );
    const assoc = this.pack.association;
    const questions = assoc
      ? this.languages.flatMap((lang) =>
          [assoc.question[lang], assoc.questionFeminine[lang]]
            .filter((a): a is ResolvedAsset => a !== null)
            .map((a) => this.voiced(a, FEEDBACK_SPEECH[a.path], lang, 'feedback', `question:${a.path}`)),
        )
      : [];
    return [this.incorrectTone(), ...this.sessionEnd(), ...praise, ...questions, ...this.oddQuestion(), this.reward()].filter(isClip);
  }

  private voiced(asset: ResolvedAsset, text: string | undefined, lang: Lang, category: ClipCategory, label: string): Clip {
    return voicedClip(asset, text, lang, category, label);
  }
}

/** A recording, or (development only) the device voice reading `text` while the recording is a placeholder. */
export function voicedClip(asset: ResolvedAsset, text: string | undefined, lang: Lang, category: ClipCategory, label: string): Clip {
  // Placeholders only resolve in development/test builds, so release builds never reach speech.
  // Whether the phone has a voice is decided when the clip plays: phones list their voices late.
  if (!asset.real && text && speechSupported()) return { kind: 'speech', text, lang, label, fallback: file(asset, category, label) };
  return file(asset, category, label);
}

function file(asset: ResolvedAsset, category: ClipCategory, label: string): FileClip {
  return { kind: 'file', url: asset.url, category, label };
}

function isClip(c: Clip | null): c is Clip {
  return c !== null;
}
