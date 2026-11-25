import { useMemo, useRef, useState } from 'react';
import type { Clip } from '../../audio/clips';
import type { Lang, LoadedPack } from '../../content/types';
import { storyFor, storyWeek } from '../../learn/storyMaker';
import { talkPrompt } from '../../learn/talkPrompts';
import { useI18n } from '../../i18n/I18n';
import { spokenLanguages } from '../../settings/settings';
import type { PickerOptions } from './EndScreen';
import { ArrowIcon } from './icons';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { choosePictures } from './layout';
import { questionDone } from './sitting';
import { ShellFrame, useKidShell } from './useKidShell';

/**
 * Her story: this week's 5-page story made from her family and words she knows (see
 * learn/storyMaker.ts), read by the phone's voice in her languages. An animal's page plays its sound.
 * Tap the picture to hear the page again, the arrow for the next one.
 */
export function KidStoryMaker(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { t, lang } = useI18n();
  const { packs, config } = props;
  const story = useMemo(
    () => storyFor(packs, storyWeek(), new Set(config.itemKeys), (item) => choosePictures([item], () => 0)[item.key]),
    [packs, config.itemKeys],
  );
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  const languages = spokenLanguages(config.language);

  const read = (p = pageRef.current) => {
    const s = story?.pages[p];
    if (!s || !shell.canPlay()) return;
    const r = shell.audio.resolver;
    const clips: (Clip | null)[] = languages.flatMap((l: Lang) => {
      // The phone's voice reads the page; without one, the names of the things on it are said.
      const fallback = s.items[0] ? r.nameIn(s.items[0], l) : null;
      return [
        fallback && fallback.kind === 'file'
          ? ({ kind: 'speech', text: s.text[l], lang: l, label: `story:${p}:${l}`, fallback } as Clip)
          : fallback && fallback.kind === 'speech'
            ? { ...fallback, text: s.text[l] }
            : null,
      ];
    });
    if (s.sound) clips.push(r.sound(s.sound));
    void shell.audio.say(clips);
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      pageRef.current = 0;
      setPage(0);
      if (story) shell.audio.preload(story.pages.flatMap((p) => p.items));
      read(0);
    },
    onResume: () => read(),
  });

  const go = (next: number) => {
    if (!story || next < 0 || !shell.canPlay()) return;
    if (next >= story.pages.length) {
      questionDone();
      shell.finish();
      return;
    }
    pageRef.current = next;
    setPage(next);
    read(next);
  };

  const rtl = lang === 'ar';
  const p = story?.pages[page];
  return (
    <ShellFrame shell={shell} kind="daybook" {...props}>
      {p && (
        <div className="book daybook storymaker" dir="ltr">
          <span className="book-prompt" dir="auto" key={`p${page}`}>
            💬 {talkPrompt('book', page, lang, p.items[p.items.length - 1]?.name[lang])}
          </span>
          <button type="button" className="book-page next" key={page} tabIndex={-1} aria-hidden="true" onPointerDown={() => read()}>
            <span className={`story-pictures n${p.pictures.length}`}>
              {p.pictures.map((src, i) => (
                <img key={i} src={src} alt="" draggable={false} />
              ))}
            </span>
            <span className="daybook-caption" dir="auto">
              {p.text[lang]}
            </span>
          </button>
          <div className="book-dots" aria-hidden="true">
            {story!.pages.map((_, i) => (
              <span key={i} className={i === page ? 'on' : ''} />
            ))}
          </div>
          <button type="button" className={`book-turn ${rtl ? 'left' : 'right'}`} aria-label={t('bookNext')} onClick={() => go(pageRef.current + 1)}>
            <ArrowIcon direction={rtl ? 'left' : 'right'} />
          </button>
          {page > 0 && (
            <button type="button" className={`book-turn back ${rtl ? 'right' : 'left'}`} aria-label={t('bookBack')} onClick={() => go(pageRef.current - 1)}>
              <ArrowIcon direction={rtl ? 'right' : 'left'} />
            </button>
          )}
        </div>
      )}
    </ShellFrame>
  );
}
