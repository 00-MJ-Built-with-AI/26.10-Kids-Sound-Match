import { useEffect, useState, useSyncExternalStore } from 'react';
import setupSql from '../../../supabase/family.sql?raw';
import { cloud, cloudClient, cloudConfigured } from '../../custom/cloud';
import { familyUrl, notSetUp, parentFamily, type FamilyLink } from '../../family/family';
import { useI18n } from '../../i18n/I18n';
import { Screen } from './components';

/**
 * Family circle: private links for grandparents and family. Each link shows what this phone shares
 * (her week, her words, her books) and lets them send a word in their voice or a message for her.
 * Needs the cloud backup (signed in) and a one-time setup in Supabase (supabase/family.sql).
 */
export function FamilyCircle({
  onPublish,
  onCollect,
  onMyPacks,
  onBack,
}: {
  /** Refreshes what the family sees now. */
  onPublish: () => Promise<void>;
  /** Picks up the family's recordings now; resolves to how many. */
  onCollect: () => Promise<number>;
  /** The cloud backup (to sign in) lives in My packs. */
  onMyPacks: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const cloudState = useSyncExternalStore(cloud.subscribe, () => cloud.state);
  const signedIn = cloud.userId !== null && cloudState.status !== 'signedOut';
  const [links, setLinks] = useState<FamilyLink[] | null>(null);
  const [setup, setSetup] = useState(false);
  const [failed, setFailed] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const api = async () => parentFamily(await cloudClient(), cloud.userId!);
  const load = async () => {
    try {
      setLinks(await (await api()).links());
      setSetup(false);
      setFailed(false);
    } catch (e) {
      if (notSetUp(e as { code?: string; message?: string })) setSetup(true);
      else setFailed(true);
    }
  };
  useEffect(() => {
    if (signedIn) void load();
  }, [signedIn]);

  const share = async (link: FamilyLink) => {
    const url = familyUrl(link.token);
    const text = t('familyShareText', { name: link.name });
    if (navigator.share) {
      await navigator.share({ title: t('familyCircleTitle'), text, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url).catch(() => undefined);
    setCopied(link.token);
  };

  if (!cloudConfigured) {
    return (
      <Screen title={t('familyCircleTitle')} onBack={onBack}>
        <p className="note">{t('familyNoCloud')}</p>
      </Screen>
    );
  }
  return (
    <Screen title={t('familyCircleTitle')} onBack={onBack}>
      <p className="hint">{t('familyIntro')}</p>
      {!signedIn ? (
        <section className="card">
          <p>{t('familySignIn')}</p>
          <button type="button" className="btn primary wide" onClick={onMyPacks}>
            {t('familyToBackup')}
          </button>
        </section>
      ) : setup ? (
        <section className="card">
          <h2>⚙️ {t('familySetupTitle')}</h2>
          <ol className="family-steps">
            <li>{t('familySetup1')}</li>
            <li>{t('familySetup2')}</li>
            <li>{t('familySetup3')}</li>
          </ol>
          <button
            type="button"
            className="btn primary wide"
            onClick={() => {
              void navigator.clipboard?.writeText(setupSql).catch(() => undefined);
              setCopied('sql');
            }}
          >
            📋 {t('familyCopySql')}
          </button>
          {copied === 'sql' && <textarea className="arabic-copied" dir="ltr" readOnly rows={6} value={setupSql} onFocus={(e) => e.currentTarget.select()} />}
          <button type="button" className="btn ghost wide" onClick={() => void load()}>
            {t('familyCheckAgain')}
          </button>
        </section>
      ) : (
        <>
          {failed && <p className="msg error">{t('familyFailed')}</p>}
          <section className="card">
            <h2>👨‍👩‍👧 {t('familyLinks')}</h2>
            {links && !links.length && <p className="hint">{t('familyNoLinks')}</p>}
            <ul className="family-links">
              {links?.map((l) => (
                <li key={l.token} className={l.revoked ? 'off' : ''}>
                  <span>
                    <strong>{l.name || t('familySomeone')}</strong>
                    <small className="hint">{l.revoked ? t('familyOff') : t('familyOn')}</small>
                  </span>
                  {!l.revoked && (
                    <button type="button" className="btn" onClick={() => void share(l)}>
                      {copied === l.token ? `✓ ${t('familyCopied')}` : `📤 ${t('familySend')}`}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={async () => {
                      await (await api()).setRevoked(l.token, !l.revoked);
                      await load();
                    }}
                  >
                    {l.revoked ? t('familyTurnOn') : t('familyTurnOff')}
                  </button>
                </li>
              ))}
            </ul>
            <label className="field">
              <span>{t('familyNewFor')}</span>
              <input value={name} maxLength={60} placeholder={t('voiceFromHint')} onChange={(e) => setName(e.target.value)} />
            </label>
            <button
              type="button"
              className="btn primary wide"
              disabled={!name.trim() || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const link = await (await api()).addLink(name);
                  setName('');
                  await onPublish();
                  await load();
                  await share(link);
                } catch {
                  setFailed(true);
                } finally {
                  setBusy(false);
                }
              }}
            >
              + {t('familyNewLink')}
            </button>
          </section>
          <section className="card">
            <h2>🔄 {t('familyUpdates')}</h2>
            <p className="hint">{t('familyUpdatesHint')}</p>
            <div className="nudge-actions">
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await onPublish();
                    setNote(t('familyPublished'));
                  } catch {
                    setFailed(true);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t('familyPublish')}
              </button>
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    setNote(t('familyCollected', { n: await onCollect() }));
                  } catch {
                    setFailed(true);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t('familyCollect')}
              </button>
            </div>
            {note && (
              <p className="msg" role="status">
                ✓ {note}
              </p>
            )}
          </section>
          <p className="hint small">{t('familyPrivacy')}</p>
        </>
      )}
    </Screen>
  );
}
