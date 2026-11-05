import { useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { addPotty, loadPotty, pottyWeek, undoPotty, type PottyEntry } from '../../settings/potty';
import { type ProfileState } from '../../settings/profiles';
import { today } from '../../settings/routine';
import { Mascot } from '../kid/Mascot';
import { Burst } from '../kid/OptionGrid';
import { Overlay, Screen } from './components';
import { ProfileRow } from './ProfileRow';

const pic = (f: string) => `${import.meta.env.BASE_URL}assets/packs/potty/${f}.svg`;

/**
 * Potty time: the potty story to read together, and a sticker chart for the week. A star for every
 * try, a big one when she does it (with a celebration to show her). Gentle: no pressure, no
 * counting of accidents.
 */
export function PottyScreen({ profiles, onStory, onBack }: { profiles: ProfileState; onStory: () => void; onBack: () => void }) {
  const { t, lang } = useI18n();
  const [childId, setChildId] = useState(profiles.activeId);
  const [list, setList] = useState<PottyEntry[]>(() => loadPotty(childId));
  const [hooray, setHooray] = useState(0);
  const week = pottyWeek(list);
  const tries = week.reduce((n, d) => n + d.entries.filter((e) => e.kind === 'try').length, 0);
  const done = week.reduce((n, d) => n + d.entries.filter((e) => e.kind === 'done').length, 0);
  const todayCount = week[6].entries.length;
  const add = (kind: PottyEntry['kind']) => {
    setList(addPotty(childId, kind));
    if (kind === 'done') setHooray((n) => n + 1);
  };

  return (
    <Screen title={t('pottyTitle')} onBack={onBack}>
      {profiles.profiles.length > 1 && (
        <ProfileRow
          profiles={profiles.profiles}
          activeId={childId}
          onSelect={(id) => {
            setChildId(id);
            setList(loadPotty(id));
          }}
          label={t('children')}
        />
      )}
      <section className="card potty-intro">
        <img src={pic('potty')} alt="" />
        <p>{t('pottyIntro')}</p>
        <button type="button" className="btn wide" onClick={onStory}>
          📖 {t('pottyStory')}
        </button>
      </section>

      <section className="card potty-chart">
        <div className="potty-buttons">
          <button type="button" className="potty-btn try" onClick={() => add('try')}>
            <img src={pic('potty')} alt="" />
            <span>{t('pottyTried')}</span>
          </button>
          <button type="button" className="potty-btn done" onClick={() => add('done')}>
            <img src={pic('sticker')} alt="" />
            <span>{t('pottyDid')}</span>
          </button>
        </div>
        <h2>
          {t('pottyWeek')} <small className="hint">{t('pottyToday', { n: todayCount })}</small>
        </h2>
        <div className="potty-week">
          {week.map((d) => (
            <div key={d.day} className={`potty-day${d.day === today() ? ' today' : ''}`}>
              <small>{new Date(`${d.day}T12:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { weekday: 'short' })}</small>
              <div className="potty-stickers">
                {d.entries.map((e) => (
                  <span key={e.at} className={`potty-sticker ${e.kind}`} aria-label={e.kind === 'done' ? t('pottyDid') : t('pottyTried')}>
                    {e.kind === 'done' ? '🌟' : '⭐'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="hint">{t('pottyTotal', { t: tries, d: done })}</p>
        {list.length > 0 && (
          <button type="button" className="btn ghost small" onClick={() => setList(undoPotty(childId))}>
            ↶ {t('pottyUndo')}
          </button>
        )}
      </section>

      {hooray > 0 && (
        <Overlay label={t('pottyHooray')} onDismiss={() => setHooray(0)}>
          <div className="potty-hooray" key={hooray} onClick={() => setHooray(0)}>
            <span className="potty-hooray-burst">
              <Burst size={170} kind="stars" quiet />
            </span>
            <img src={pic('sticker')} alt="" />
            <Mascot mood="cheer" />
            <h2>🎉 {t('pottyHooray')}</h2>
          </div>
        </Overlay>
      )}
    </Screen>
  );
}
