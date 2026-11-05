import { useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { StringKey } from '../../i18n/strings';
import { loadCertificates, loadMilestones, MILESTONES, toggleMilestone, updateCertificates, type Milestone } from '../../settings/milestones';
import type { ProfileState } from '../../settings/profiles';
import { Certificates } from './Certificates';
import { Screen } from './components';
import { GAMES, gamePicture } from './games';
import { ProfileRow } from './ProfileRow';

const AREAS: { id: Milestone['area']; label: StringKey; emoji: string }[] = [
  { id: 'talk', label: 'areaTalk', emoji: '🗣️' },
  { id: 'understand', label: 'areaUnderstand', emoji: '👂' },
  { id: 'move', label: 'areaMove', emoji: '🏃‍♀️' },
  { id: 'play', label: 'areaPlay', emoji: '🧸' },
];

/**
 * A gentle checklist of things children often start doing at 18 to 24 months. The parent ticks
 * what they've seen (dated, per child); each links to the games that practise it. Ticking "two
 * words together" earns the first-sentence certificate.
 */
export function MilestonesScreen({
  profiles,
  onBack,
  onGame,
}: {
  profiles: ProfileState;
  onBack: () => void;
  onGame: (id: string) => void;
}) {
  const { t, lang } = useI18n();
  const [childId, setChildId] = useState(profiles.activeId);
  const child = profiles.profiles.find((p) => p.id === childId) ?? profiles.profiles[0];
  const [ticks, setTicks] = useState(() => loadMilestones(child.id));
  const [earned, setEarned] = useState(() => loadCertificates(child.id));
  const select = (id: string) => {
    setChildId(id);
    setTicks(loadMilestones(id));
    setEarned(loadCertificates(id));
  };
  const toggle = (id: string) => {
    const next = toggleMilestone(child.id, id);
    setTicks(next);
    // Word certificates are earned in Words I know; here only the first sentence can be.
    setEarned(updateCertificates(child.id, 0, next));
  };
  const date = (at: number) =>
    new Date(at).toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const seen = MILESTONES.filter((m) => ticks[m.id] !== undefined).length;

  return (
    <Screen title={t('milestonesTitle')} onBack={onBack}>
      {profiles.profiles.length > 1 && (
        <ProfileRow profiles={profiles.profiles} activeId={child.id} onSelect={select} label={t('children')} />
      )}
      <section className="card milestones-intro">
        <p>{t('milestonesIntro')}</p>
        <div className="milestones-progress" aria-hidden="true">
          <i style={{ width: `${(seen / MILESTONES.length) * 100}%` }} />
        </div>
        <p className="hint">{t('milestonesCount', { n: seen, m: MILESTONES.length })}</p>
      </section>

      {AREAS.map((area) => (
        <section key={area.id} className={`card milestone-area area-${area.id}`}>
          <h2>
            {area.emoji} {t(area.label)}
          </h2>
          <ul className="milestone-list">
            {MILESTONES.filter((m) => m.area === area.id).map((m) => {
              const at = ticks[m.id];
              return (
                <li key={m.id} className={at !== undefined ? 'seen' : ''}>
                  <button type="button" className="milestone-tick" aria-pressed={at !== undefined} onClick={() => toggle(m.id)}>
                    <span className="tick-box" aria-hidden="true">
                      {at !== undefined ? '✓' : ''}
                    </span>
                    <span className="milestone-text">
                      {m.text[lang]}
                      {at !== undefined && <small>{t('milestoneSeen', { d: date(at) })}</small>}
                    </span>
                  </button>
                  <div className="milestone-games">
                    <span className="hint">{t('milestoneHelps')}</span>
                    {m.games.map((g) => (
                      <button type="button" key={g} className="milestone-game" onClick={() => onGame(g)}>
                        {gamePicture(g) && <img src={gamePicture(g)} alt="" />}
                        {GAMES[g] ? t(GAMES[g].label) : g}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <Certificates profile={child} earned={earned} />
      <p className="hint milestones-doctor">{t('milestonesDoctor')}</p>
    </Screen>
  );
}
