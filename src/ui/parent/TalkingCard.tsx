import { useI18n } from '../../i18n/I18n';
import { talkingView } from '../../report/talking';

/**
 * Words I know > Talking at her age: what most children do by now and next, her own numbers, and a
 * calm "mention it at the check-up" only when what's marked in the app suggests it. No scores.
 */
export function TalkingCard({ ageMonths, says, understood, twoWords }: { ageMonths: number | null; says: number; understood: number; twoWords: boolean }) {
  const { t, lang } = useI18n();
  if (ageMonths === null) {
    return (
      <section className="card talking-card">
        <h2>🌱 {t('talkingTitle')}</h2>
        <p className="hint">{t('talkingNoAge')}</p>
      </section>
    );
  }
  const view = talkingView(ageMonths, says, twoWords);
  const age = (months: number) => (months % 12 ? t('talkingMonths', { n: months }) : t('talkingYears', { n: months / 12 }));
  return (
    <section className="card talking-card">
      <h2>🌱 {t('talkingTitle')}</h2>
      <p className="hint">{t('talkingHers', { says, understood })}</p>
      {view.now && (
        <>
          <h3 className="path-head">{t('talkingBy', { age: age(view.now.months) })}</h3>
          <ul className="talking-list">
            {view.now.text[lang].map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </>
      )}
      {view.next && (
        <>
          <h3 className="path-head">{t('talkingNext', { age: age(view.next.months) })}</h3>
          <ul className="talking-list next">
            {view.next.text[lang].map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </>
      )}
      <p className="hint">{t('talkingBoth')}</p>
      {view.mention && <p className="talking-mention">{t(view.mention === 'two' ? 'talkingMentionTwo' : 'talkingMentionWords', { n: says })}</p>}
      <p className="hint small">{t('talkingSource')}</p>
    </section>
  );
}
