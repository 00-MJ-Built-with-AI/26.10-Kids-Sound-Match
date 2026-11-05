import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n/I18n';
import type { Season } from '../../settings/season';
import { Mascot } from '../kid/Mascot';
import { Burst } from '../kid/OptionGrid';

const pic = (f: string) => `${import.meta.env.BASE_URL}assets/packs/eid/${f}.svg`;

/** On Home in season: "Ramadan Kareem" / "Eid Mubarak" and the Ramadan and Eid words to play. */
export function SeasonCard({ season, onPlay }: { season: Season; onPlay?: (kind: 'game' | 'explore') => void }) {
  const { t } = useI18n();
  const pictures = season === 'ramadan' ? ['lantern', 'crescent', 'dates', 'qatayef'] : ['kaak', 'eidiyye', 'balloons', 'clothes'];
  return (
    <section className={`card season-card ${season}`}>
      <h2>{season === 'ramadan' ? `🌙 ${t('seasonRamadan')}` : `🎉 ${t('seasonEid')}`}</h2>
      <div className="season-pics" aria-hidden="true">
        {pictures.map((p) => (
          <img key={p} src={pic(p)} alt="" loading="lazy" />
        ))}
      </div>
      <p>{season === 'ramadan' ? t('seasonCardRamadan') : t('seasonCardEid')}</p>
      {onPlay && (
        <div className="nudge-actions">
          <button type="button" className="btn primary" onClick={() => onPlay('game')}>
            {t('matchGame')}
          </button>
          <button type="button" className="btn" onClick={() => onPlay('explore')}>
            {t('explore')}
          </button>
        </div>
      )}
    </section>
  );
}

/** Eid Mubarak!: once a day on Eid, a celebration over Home with her character and the bunny. */
export function EidCelebration({ avatar, onClose }: { avatar?: React.ReactNode; onClose: () => void }) {
  const { t } = useI18n();
  // On the page itself: Home's screen fades in with a transform, which would carry a fixed layer.
  return createPortal(
    <div className="eid-celebration" role="dialog" aria-modal="true" aria-label={t('seasonEid')} onClick={onClose}>
      <div className="eid-garland" aria-hidden="true" />
      <div className="eid-burst" aria-hidden="true">
        <Burst size={180} kind="confetti" />
        <Burst size={140} kind="stars" />
      </div>
      <div className="eid-card">
        <p className="eid-ar" lang="ar" dir="rtl">
          عيد مبارك
        </p>
        <p className="eid-en" lang="en" dir="ltr">
          Eid Mubarak!
        </p>
        <div className="eid-friends" aria-hidden="true">
          {avatar && <span className="eid-avatar">{avatar}</span>}
          <Mascot mood="cheer" />
        </div>
        <div className="eid-sweets" aria-hidden="true">
          {['kaak', 'balloons', 'eidiyye', 'gift', 'maamoul'].map((p, i) => (
            <img key={p} src={pic(p)} alt="" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <button type="button" className="btn primary big">
          {t('seasonTapToPlay')}
        </button>
      </div>
    </div>,
    document.body,
  );
}
