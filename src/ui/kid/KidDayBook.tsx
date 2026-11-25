import { useMemo, useRef, useState } from 'react';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { customKind, isCustomPackId } from '../../custom/types';
import { useI18n } from '../../i18n/I18n';
import type { PickerOptions } from './EndScreen';
import { ArrowIcon } from './icons';
import type { KidConfig, KidSnapshot } from './kidSnapshot';
import { questionDone } from './sitting';
import { ShellFrame, useKidShell } from './useKidShell';
import { talkPrompt } from '../../learn/talkPrompts';

/** Her books (My packs > New book), each page a photo and a sentence in the parent's voice. */
export function ownBooks(packs: readonly LoadedPack[]): LoadedPack[] {
  return packs.filter((p) => isCustomPackId(p.id) && customKind(p.id) === 'book' && p.items.length > 0);
}

/**
 * My books: books about her own life ("This is you waking up", "Here's Teta's house"). With more
 * than one she picks a cover; then each page shows its photo and says its sentence. Tap the photo
 * to hear it again, the arrow for the next page.
 */
export function KidDayBook(props: {
  pack: LoadedPack;
  packs: readonly LoadedPack[];
  config: KidConfig;
  snapshot: KidSnapshot | null;
  picker?: PickerOptions;
  onExit: () => void;
}) {
  const { t, lang } = useI18n();
  const books = useMemo(() => ownBooks(props.packs), [props.packs]);
  const [book, setBook] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<'next' | 'back'>('next');
  const pageRef = useRef(0);
  const bookRef = useRef<number | null>(null);

  const read = (b = bookRef.current, p = pageRef.current) => {
    const item: LoadedItem | undefined = b === null ? undefined : books[b]?.items[p];
    if (item && shell.canPlay()) void shell.audio.say(shell.audio.resolver.names(item));
  };
  const open = (b: number) => {
    bookRef.current = b;
    pageRef.current = 0;
    setBook(b);
    setPage(0);
    setTurn('next');
    shell.audio.preload(books[b].items);
    read(b, 0);
  };
  const shell = useKidShell({
    ...props,
    onStart: () => {
      if (books.length === 1) open(0);
      else {
        bookRef.current = null;
        setBook(null);
      }
    },
    onResume: () => read(),
  });

  const go = (next: number) => {
    const b = bookRef.current;
    if (b === null || !shell.canPlay()) return;
    if (next < 0) return;
    if (next >= books[b].items.length) {
      questionDone();
      shell.finish();
      return;
    }
    setTurn(next >= pageRef.current ? 'next' : 'back');
    pageRef.current = next;
    setPage(next);
    read(b, next);
  };

  // Arabic books open the other way: the next page is on the left.
  const rtl = lang === 'ar';
  const item = book !== null ? books[book]?.items[page] : undefined;
  return (
    <ShellFrame shell={shell} kind="daybook" {...props}>
      {book === null ? (
        <div className="sing-pick daybook-pick">
          {books.map((b, i) => (
            <button type="button" key={b.id} className="sing-song daybook-cover" tabIndex={-1} onPointerDown={() => open(i)}>
              <img src={b.items[0].images[0].url} alt="" draggable={false} />
              <span className="daybook-title">{b.name[lang]}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="book daybook" dir="ltr">
          <span className="book-prompt" dir="auto" key={`p${page}`}>
            💬 {talkPrompt('daybook', page, lang)}
          </span>
          <button type="button" className={`book-page ${turn}`} key={`${book}-${page}`} tabIndex={-1} aria-hidden="true" onPointerDown={() => read()}>
            {item && (
              <span className="book-picture daybook-photo">
                <img src={item.images[0].url} alt="" draggable={false} />
              </span>
            )}
            {item && (
              <span className="daybook-caption" dir="auto">
                {item.name[lang]}
              </span>
            )}
          </button>
          <div className="book-dots" aria-hidden="true">
            {books[book].items.map((p, i) => (
              <span key={p.key} className={i === page ? 'on' : ''} />
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
