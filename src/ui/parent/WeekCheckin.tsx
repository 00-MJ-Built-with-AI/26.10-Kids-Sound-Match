import { useEffect, useMemo, useState } from 'react';
import type { LoadedPack } from '../../content/types';
import { useI18n } from '../../i18n/I18n';
import { weekCheckin, type Checkin } from '../../report/checkin';
import { reportStore } from '../../report/db';
import { knownWords, wordEvidence } from '../../report/words';
import { loadPlayLog } from '../../settings/playLog';
import { forProfile } from '../../settings/profiles';
import { loadWordMarks } from '../../settings/words';
import { gamePicture, GAMES } from './games';
import { wordLookup } from './WordsScreen';

/**
 * Her week: the games she came back to and the ones she left quickly, the new words and the words
 * she said, with one idea for next week. On Home once a week (`onDone` closes it) and in the Report.
 */
export function WeekCheckin({ childId, packs, onDone }: { childId: string; packs: readonly LoadedPack[]; onDone?: () => void }) {
  const { t, lang } = useI18n();
  const [week, setWeek] = useState<Checkin | null>(null);
  const lookup = useMemo(() => wordLookup(packs), [packs]);

  useEffect(() => {
    let live = true;
    void (async () => {
      let known = new Map<string, number>();
      try {
        const sessions = forProfile(await reportStore.sessions(), childId);
        const ids = new Set(sessions.map((s) => s.id));
        const questions = (await reportStore.questions()).filter((q) => ids.has(q.sessionId));
        known = knownWords(wordEvidence(sessions, questions));
      } catch {
        // No results on this phone: the games and the words she said still count.
      }
      if (live) setWeek(weekCheckin(loadPlayLog(childId), known, loadWordMarks(childId).says));
    })();
    return () => {
      live = false;
    };
  }, [childId]);

  if (!week) return null;
  const game = (kind: string) => (
    <li key={kind}>
      {gamePicture(kind) && <img src={gamePicture(kind)} alt="" />}
      <span>{GAMES[kind] ? t(GAMES[kind].label) : kind}</span>
    </li>
  );
  const words = week.newWords.map((id) => lookup.get(id)).filter((w) => w !== undefined);
  // One idea for next week, from what happened this week.
  const idea = !week.minutes
    ? t('checkinIdeaStart')
    : week.newWords.length < 3
      ? t('checkinIdeaLesson')
      : week.leftQuickly.length
        ? t('checkinIdeaTogether')
        : t('checkinIdeaKeep');
  return (
    <section className="card checkin-card">
      <h2>📅 {t('checkinTitle')}</h2>
      <p className="hint">{week.minutes ? t('checkinTime', { m: week.minutes, d: week.days }) : t('checkinNone')}</p>
      {week.cameBack.length > 0 && (
        <>
          <h3 className="path-head">{t('checkinCameBack')}</h3>
          <ul className="play-top checkin-games">{week.cameBack.map(game)}</ul>
        </>
      )}
      {week.leftQuickly.length > 0 && (
        <>
          <h3 className="path-head">{t('checkinLeft')}</h3>
          <ul className="play-top checkin-games">{week.leftQuickly.map(game)}</ul>
        </>
      )}
      <h3 className="path-head">{t('checkinWords', { n: week.newWords.length, s: week.saidWords.length })}</h3>
      {words.length > 0 && (
        <div className="path-row small">
          {words.slice(0, 10).map((w) => (
            <span key={w.id} className="path-word">
              <img src={w.picture} alt="" />
              <small>{w.item.name[lang]}</small>
            </span>
          ))}
        </div>
      )}
      <p className="checkin-idea">💡 {idea}</p>
      {onDone && (
        <button type="button" className="btn ghost wide" onClick={onDone}>
          {t('checkinDone')}
        </button>
      )}
    </section>
  );
}
