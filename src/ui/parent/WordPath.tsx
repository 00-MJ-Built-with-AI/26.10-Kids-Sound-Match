import { useEffect, useMemo, useState } from 'react';
import type { LoadedItem, LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import { addDays, addToday, loadPath, pathView, savePath, skipWord, WEEK_DAYS, type PathState } from '../../learn/path';
import { sheetTip } from '../../learn/sheetTips';
import { learnToday } from '../../learn/today';
import type { QuestionResultEntity, SessionEntity } from '../../report/types';
import { forProfile, type Profile } from '../../settings/profiles';
import { today } from '../../settings/routine';
import { Overlay } from './components';
import { Avatar } from './ProfileRow';

export interface PathWordInfo {
  id: string;
  item: LoadedItem;
  pack: LoadedPack;
  picture: string;
}

/**
 * Words I know > Her word path: today's words, the rest of the week, words coming back for review,
 * and words learned. The parent can skip a word she already knows or put any word in today's
 * lesson, and print the week's words for the fridge.
 */
export function WordPath({
  packs,
  lookup,
  child,
  data,
}: {
  packs: readonly LoadedPack[];
  lookup: ReadonlyMap<string, PathWordInfo>;
  child: Profile;
  data: { sessions: SessionEntity[]; questions: QuestionResultEntity[] } | null;
}) {
  const { t, lang } = useI18n();
  const [path, setPath] = useState<PathState | null>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [printing, setPrinting] = useState(false);
  const day = today();

  // Plans the week if it isn't planned yet (the same as Home does), then shows it.
  useEffect(() => {
    if (!data) return;
    learnToday(child.id, packs, forProfile(data.sessions, child.id), data.questions);
    setPath(loadPath(child.id));
  }, [child.id, data, packs]);

  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener('afterprint', done);
    const timer = window.setTimeout(() => window.print(), 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', done);
    };
  }, [printing]);

  const change = (next: PathState) => {
    savePath(child.id, next);
    setPath(next);
  };
  const view = useMemo(() => (path ? pathView(path, day) : null), [path, day]);
  const found = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...lookup.values()];
    return (q ? list.filter((w) => w.item.name.ar.includes(q) || w.item.name.en.toLowerCase().includes(q)) : list).slice(0, 60);
  }, [lookup, search]);
  if (!path || !view) return null;

  const locale = lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB';
  const weekday = (d: string, long = false) => new Date(`${d}T12:00:00`).toLocaleDateString(locale, long ? { weekday: 'long', day: 'numeric', month: 'short' } : { weekday: 'short' });
  const chip = (id: string, extra?: string, skippable = false) => {
    const w = lookup.get(id);
    if (!w) return null;
    return (
      <span key={id} className="path-word">
        <img src={w.picture} alt="" />
        <small>{w.item.name[lang]}</small>
        {extra && <small className="hint">{extra}</small>}
        {skippable && (
          <button type="button" className="path-skip" aria-label={t('pathSkip', { word: w.item.name[lang] })} onClick={() => change(skipWord(path, id))}>
            ✕
          </button>
        )}
      </span>
    );
  };
  const weekDays = Array.from({ length: WEEK_DAYS }, (_, i) => addDays(view.weekStart, i));

  return (
    <>
      <section className="card word-path">
        <h2>🛤️ {t('pathTitle')}</h2>
        <p className="hint">{t('pathHint')}</p>
        <h3 className="path-head">{t('pathToday')}</h3>
        <div className="path-row">{view.today.length ? view.today.map((id) => chip(id, undefined, true)) : <p className="hint">{t('pathTodayNone')}</p>}</div>
        <button type="button" className="btn ghost" onClick={() => setAdding(true)}>
          + {t('pathAdd')}
        </button>
        {view.upcoming.length > 0 && (
          <>
            <h3 className="path-head">{t('pathWeek')}</h3>
            {view.upcoming.map((d) => (
              <div key={d.day} className="path-day">
                <strong>{weekday(d.day)}</strong>
                <div className="path-row">{d.words.map((id) => chip(id, undefined, true))}</div>
              </div>
            ))}
          </>
        )}
        {view.reviewing.length > 0 && (
          <>
            <h3 className="path-head">{t('pathReviewing')}</h3>
            <div className="path-row">{view.reviewing.map((r) => chip(r.word, r.next === day ? t('pathToday') : weekday(r.next)))}</div>
          </>
        )}
        <h3 className="path-head">{t('pathLearned', { n: view.learned.length })}</h3>
        {view.learned.length > 0 && <div className="path-row small">{view.learned.map((id) => chip(id))}</div>}
        <button type="button" className="btn primary wide" onClick={() => setPrinting(true)}>
          🖨️ {t('pathPrint')}
        </button>
      </section>

      {printing && path.week && (
        <div className="print-area print-only week-print">
          <div className="week-sheet">
            <header>
              <Avatar profile={child} size={70} />
              <div>
                <h1>{t('sheetTitle')}</h1>
                <p>
                  {new Date(`${weekDays[0]}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'long' })} –{' '}
                  {new Date(`${weekDays[6]}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </header>
            {weekDays.map((d) => (
              <div key={d} className="sheet-day">
                <strong className="sheet-weekday">{weekday(d, true)}</strong>
                <div className="sheet-words">
                  {(path.week!.days[d] ?? []).map((id) => {
                    const w = lookup.get(id);
                    if (!w) return null;
                    return (
                      <div key={id} className="sheet-word">
                        <img src={w.picture} alt="" />
                        <div>
                          <b lang="ar" dir="rtl">
                            {w.item.name.ar}
                          </b>
                          <b lang="en" dir="ltr">
                            {w.item.name.en}
                          </b>
                          <small>{sheetTip(w.pack.id, w.item.name[lang], lang)}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <footer>{t('sheetFooter')}</footer>
          </div>
        </div>
      )}

      {adding && (
        <Overlay label={t('pathAdd')} onDismiss={() => setAdding(false)}>
          <h2>{t('pathAdd')}</h2>
          <input type="search" className="words-search" dir="auto" value={search} placeholder={t('wordsSearch')} aria-label={t('wordsSearch')} onChange={(e) => setSearch(e.target.value)} />
          <ul className="words-pick">
            {found.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  className="word-pick"
                  onClick={() => {
                    change(addToday(path, w.id, day));
                    setAdding(false);
                  }}
                >
                  <img src={w.picture} alt="" />
                  <span>{w.item.name[lang]}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="pin-footer">
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>
              {t('cancel')}
            </button>
          </div>
        </Overlay>
      )}
    </>
  );
}
