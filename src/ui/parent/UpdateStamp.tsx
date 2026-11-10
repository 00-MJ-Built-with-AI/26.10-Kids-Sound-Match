import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { fetchLiveBuild, installUpdate, newerBuild, type BuildInfo } from '../../settings/appUpdate';

type Status =
  | { kind: 'checking' }
  | { kind: 'latest' }
  | { kind: 'unknown' }
  | { kind: 'new'; build: BuildInfo }
  | { kind: 'installing'; build: BuildInfo }
  | { kind: 'failed'; build: BuildInfo };

/** Home: which update this device has, and a button for a newer one when there is one. */
export function UpdateStamp() {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState<Status>({ kind: 'checking' });

  const check = useCallback(async () => {
    setStatus({ kind: 'checking' });
    try {
      const build = newerBuild(__BUILD_TIME__, await fetchLiveBuild());
      setStatus(build ? { kind: 'new', build } : { kind: 'latest' });
    } catch {
      setStatus({ kind: 'unknown' });
    }
  }, []);

  useEffect(() => {
    void check();
    const onShow = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, [check]);

  const date = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const install = (build: BuildInfo) => {
    setStatus({ kind: 'installing', build });
    installUpdate(build).catch(() => setStatus({ kind: 'failed', build }));
  };
  const available = status.kind === 'new' || status.kind === 'installing' || status.kind === 'failed' ? status.build : null;

  return (
    <section className={available ? 'build-stamp has-update' : 'build-stamp'} aria-label={t('buildTitle')}>
      <span className="build-dot" aria-hidden="true" />
      <div>
        <strong>{t('buildUpdated', { d: date(__BUILD_TIME__) })}</strong>
        <small>
          v{__APP_VERSION__}
          {__BUILD_COMMIT__ ? ` · ${__BUILD_COMMIT__}` : ''}
          {__BUILD_MESSAGE__ ? ` · ${__BUILD_MESSAGE__}` : ''}
        </small>

        {!available && (
          <p className="update-line" role="status">
            <span>{t(status.kind === 'checking' ? 'updateChecking' : status.kind === 'latest' ? 'updateLatest' : 'updateUnknown')}</span>
            {status.kind !== 'checking' && (
              <button type="button" className="update-again" onClick={() => void check()}>
                {t('updateCheckAgain')}
              </button>
            )}
          </p>
        )}

        {available && (
          <div className="update-new" role="status">
            <strong>🎁 {t('updateAvailable', { d: date(available.time) })}</strong>
            {available.message && <small>{available.message}</small>}
            <button type="button" className="btn primary wide" disabled={status.kind === 'installing'} onClick={() => install(available)}>
              {t(status.kind === 'installing' ? 'updateInstalling' : status.kind === 'failed' ? 'updateTryAgain' : 'updateGet')}
            </button>
            {status.kind === 'failed' && (
              <p className="msg error" role="alert">
                {t('updateFailed')}
              </p>
            )}
            <small>{t('updateKept')}</small>
          </div>
        )}
      </div>
    </section>
  );
}
