import { useState } from 'react';
import { blobUrl } from '../../custom/toLoaded';
import { useI18n } from '../../i18n/I18n';
import { renderCertificate } from '../../report/certificateImage';
import { CERTIFICATES, type Certificate } from '../../settings/milestones';
import { characterUrl, profileKey, type Profile } from '../../settings/profiles';
import { local } from '../../settings/storage';
import { Overlay } from './components';

const NAME_KEY = 'ksm.certificateName.v1';
const COLORS: Record<string, string> = { words10: '#3c9d4c', words25: '#e0527d', words50: '#2f78d0', sentence: '#8a5cd6' };

/**
 * Her certificates: earned at 10, 25 and 50 words and for her first sentence. An earned one opens
 * as a picture to share, with her drawn character and (if the parent types it) her name.
 */
export function Certificates({ profile, earned }: { profile: Profile; earned: Record<string, number> }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState<Certificate | null>(null);
  const [name, setName] = useState(() => local.get(profileKey(NAME_KEY, profile.id)) ?? '');
  const [picture, setPicture] = useState<{ blob: Blob; url: string } | null>(null);
  const [problem, setProblem] = useState(false);
  const date = (at: number) =>
    new Date(at).toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const line = (c: Certificate) => (c.words ? t('certWordsLine', { n: c.words }) : t('certSentenceLine'));

  const make = async (c: Certificate) => {
    local.set(profileKey(NAME_KEY, profile.id), name.trim());
    const blob = await renderCertificate({
      rtl: lang === 'ar',
      heading: t('certHeading'),
      name: name.trim(),
      line: line(c),
      badge: c.words ? String(c.words) : c.emoji,
      date: date(earned[c.id]),
      footer: t('appName'),
      avatar: { animal: profile.animal, color: profile.color, picture: characterUrl(profile) },
      color: COLORS[c.id] ?? '#e8b94a',
    });
    setProblem(false);
    setPicture({ blob, url: blobUrl(blob) });
  };
  const file = () => new File([picture!.blob], `certificate-${open?.id}.png`, { type: 'image/png' });
  const canShare = () => {
    try {
      return Boolean(picture && navigator.canShare?.({ files: [file()] }));
    } catch {
      return false;
    }
  };
  const close = () => {
    setOpen(null);
    setPicture(null);
  };

  return (
    <section className="card certificates">
      <h2>🎓 {t('certTitle')}</h2>
      <p className="hint">{t('certHint')}</p>
      <div className="cert-row">
        {CERTIFICATES.map((c) => {
          const at = earned[c.id];
          return (
            <button
              type="button"
              key={c.id}
              className={`cert-badge${at ? ' on' : ''}`}
              style={{ '--cert': COLORS[c.id] } as React.CSSProperties}
              disabled={!at}
              onClick={() => setOpen(c)}
            >
              <span className="cert-rosette" aria-hidden="true">
                {c.words ?? c.emoji}
              </span>
              <strong>{at ? line(c) : c.words ? t('certLocked', { n: c.words }) : t('certLockedSentence')}</strong>
              {at && <small>{date(at)}</small>}
            </button>
          );
        })}
      </div>

      {open && (
        <Overlay label={t('certHeading')} onDismiss={close}>
          <h2>
            {open.emoji} {line(open)}
          </h2>
          {!picture ? (
            <>
              <label className="field">
                <span>{t('certName')}</span>
                <input type="text" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
              </label>
              <div className="pin-footer">
                <button type="button" className="btn ghost" onClick={close}>
                  {t('close')}
                </button>
                <button type="button" className="btn primary" onClick={() => void make(open)}>
                  {t('certMake')}
                </button>
              </div>
            </>
          ) : (
            <>
              <img className="share-preview" src={picture.url} alt={line(open)} />
              {problem && (
                <p className="msg error" role="alert">
                  {t('shareFailed')}
                </p>
              )}
              <div className="pin-footer">
                <button type="button" className="btn ghost" onClick={close}>
                  {t('close')}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = picture.url;
                    a.download = `certificate-${open.id}.png`;
                    a.click();
                  }}
                >
                  {t('savePicture')}
                </button>
                {canShare() && (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() =>
                      void navigator.share({ files: [file()], title: t('certHeading') }).catch((e: DOMException) => {
                        if (e.name !== 'AbortError') setProblem(true);
                      })
                    }
                  >
                    {t('share')}
                  </button>
                )}
              </div>
            </>
          )}
        </Overlay>
      )}
    </section>
  );
}
