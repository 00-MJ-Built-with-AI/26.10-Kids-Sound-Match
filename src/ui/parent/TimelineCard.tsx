import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { ageInMonths, loadBirthMonth } from '../../settings/birth';
import { voiceStore } from '../../settings/herVoice';
import { profileKey } from '../../settings/profiles';
import { local } from '../../settings/storage';
import { MONTH_PREFIX, monthKey } from './VoiceTimeline';

const LATER_KEY = 'ksm.timelineLater.v1';

/**
 * Home: once a month, "Record her this month" until there's a recording for the month (or "Later").
 * In her birthday month (from her first birthday), "Make her birthday video" instead.
 */
export function TimelineCard({ profileId, onOpen }: { profileId: string; onOpen: () => void }) {
  const { t } = useI18n();
  const [card, setCard] = useState<'month' | 'birthday' | null>(null);
  const month = monthKey(Date.now());
  const key = profileKey(LATER_KEY, profileId);

  useEffect(() => {
    let live = true;
    void voiceStore.all(profileId).then((clips) => {
      if (!live || local.get(key) === month) return;
      const birth = loadBirthMonth(profileId);
      const age = ageInMonths(birth);
      if (birth && age !== null && age >= 12 && birth.slice(5) === month.slice(5) && clips.length) setCard('birthday');
      else if (!clips.some((c) => c.word.startsWith(`${MONTH_PREFIX}${month}`))) setCard('month');
      else setCard(null);
    });
    return () => {
      live = false;
    };
  }, [profileId, month, key]);

  if (!card) return null;
  return (
    <section className="card nudge-card timeline-card">
      <h2>{card === 'birthday' ? `🎂 ${t('timelineBirthday')}` : `🎙️ ${t('timelineMonthCard')}`}</h2>
      <p>{card === 'birthday' ? t('timelineBirthdayBody') : t('timelineMonthBody')}</p>
      <div className="nudge-actions">
        <button type="button" className="btn primary" onClick={onOpen}>
          {card === 'birthday' ? t('timelineMake') : t('timelineRecord')}
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            local.set(key, month);
            setCard(null);
          }}
        >
          {t('timelineLater')}
        </button>
      </div>
    </section>
  );
}
