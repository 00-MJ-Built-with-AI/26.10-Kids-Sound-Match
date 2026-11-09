import { useEffect, useState } from 'react';
import type { LocalizedText } from '../../content/types';
import { Mascot } from './Mascot';

/** What Bunny says in a speech bubble (Bunny's show): the question on screen, or nothing. */
export function bunnySay(text: LocalizedText | null): void {
  window.dispatchEvent(new CustomEvent('ksm-bunny-say', { detail: text }));
}

/**
 * Bunny's show: Bunny is in every game. With `header` it has its own place and a speech bubble; in
 * the other games it watches from a corner. It cheers on a right answer (see cheer()). Styled in
 * looks.css, which hides it in every other look.
 */
export function BunnyHost({ header, languages }: { header: boolean; languages?: readonly ('ar' | 'en')[] }) {
  const [cheering, setCheering] = useState(false);
  const [say, setSay] = useState<LocalizedText | null>(null);
  useEffect(() => {
    let timer: number | undefined;
    const onCheer = () => {
      setCheering(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCheering(false), 1600);
    };
    const onSay = (e: Event) => setSay((e as CustomEvent<LocalizedText | null>).detail);
    window.addEventListener('ksm-cheer', onCheer);
    window.addEventListener('ksm-bunny-say', onSay);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('ksm-cheer', onCheer);
      window.removeEventListener('ksm-bunny-say', onSay);
    };
  }, []);
  const lines = (languages ?? (['en', 'ar'] as const)).filter((l) => say?.[l]);
  return (
    <div className={`bunny-host ${header ? 'header' : 'corner'}`} aria-hidden="true">
      <div className="bunny-pic">
        <Mascot mood={cheering ? 'cheer' : 'wave'} />
      </div>
      {header && say && lines.length > 0 && (
        <div className="bunny-bubble">
          {lines.map((l) => (
            <div key={l} lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'}>
              {say[l]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
