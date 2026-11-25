import { useEffect, useRef, useState } from 'react';
import { familyClient } from '../../custom/cloud';
import { startRecording, type ActiveRecording } from '../../custom/recorder';
import { familySide, type FamilySummary } from '../../family/family';
import { I18nProvider, useI18n } from '../../i18n/I18n';
import type { Lang } from '../../content/types';
import { PROFILE_CHARACTERS } from '../../settings/profiles';
import { Overlay } from '../parent/components';

type Word = { id: string; ar: string; en: string; picture?: string };

/**
 * The page a family link opens (…?family=<link>): her week, her words and her books as the parent's
 * phone shared them, and recording a word or a message for her. No sign-in, no app, nothing kept.
 */
export function FamilyApp({ token }: { token: string }) {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en'));
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);
  return (
    <I18nProvider lang={lang}>
      <FamilyPage token={token} lang={lang} onLang={setLang} />
    </I18nProvider>
  );
}

function FamilyPage({ token, lang, onLang }: { token: string; lang: Lang; onLang: (l: Lang) => void }) {
  const { t } = useI18n();
  const [view, setView] = useState<{ name: string; summary: FamilySummary } | null | 'off' | 'error'>(null);
  const [recordFor, setRecordFor] = useState<{ kind: 'word'; word: Word } | { kind: 'message' } | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    void familyClient()
      .then((sb) => familySide(sb, token).view())
      .then((v) => setView(v ?? 'off'))
      .catch(() => setView('error'));
  }, [token]);

  if (view === null) return <div className="parent center-screen">{t('loading')}</div>;
  if (view === 'off' || view === 'error') {
    return (
      <div className="parent family-page">
        <p className="note">{view === 'off' ? t('familyPageOff') : t('familyPageError')}</p>
      </div>
    );
  }
  const s = view.summary;
  const other: Lang = lang === 'ar' ? 'en' : 'ar';
  const character = s.child.character && (PROFILE_CHARACTERS as readonly string[]).includes(s.child.character) ? `${import.meta.env.BASE_URL}avatars/${s.child.character}.svg` : null;
  const words: Word[] = [...s.learning, ...s.words];

  return (
    <div className="parent family-page">
      <header className="family-head">
        <span className="family-avatar" style={{ background: s.child.color }}>
          {character ? <img src={character} alt="" /> : s.child.animal}
        </span>
        <div>
          <h1>{t('familyPageHello', { name: view.name })}</h1>
          <p className="hint">{t('familyPageIntro')}</p>
        </div>
        <button type="button" className="btn ghost" onClick={() => onLang(other)}>
          {other === 'ar' ? 'العربية' : 'English'}
        </button>
      </header>

      {sent && (
        <p className="msg" role="status">
          ✓ {sent}
        </p>
      )}

      <section className="card">
        <h2>📅 {t('checkinTitle')}</h2>
        <p className="hint">{s.week.minutes ? t('checkinTime', { m: s.week.minutes, d: s.week.days }) : t('checkinNone')}</p>
        {s.week.newWords.length > 0 && (
          <p>
            {t('familyPageNew')}: <strong>{s.week.newWords.map((w) => w[lang]).join(lang === 'ar' ? '، ' : ', ')}</strong>
          </p>
        )}
      </section>

      <section className="card">
        <h2>🎙️ {t('familyPageRecord')}</h2>
        <p className="hint">{t('familyPageRecordHint')}</p>
        <button type="button" className="btn primary wide" onClick={() => setRecordFor({ kind: 'message' })}>
          💌 {t('familyPageMessage')}
        </button>
        {words.length > 0 && <h3 className="path-head">{t('familyPageWord')}</h3>}
        <div className="item-grid">
          {words.slice(0, 60).map((w) => (
            <button type="button" key={w.id} className="animal on" onClick={() => setRecordFor({ kind: 'word', word: w })}>
              {w.picture && <img src={w.picture} alt="" />}
              <span className="animal-name">{w[lang]}</span>
            </button>
          ))}
        </div>
      </section>

      {s.books.map((b) => (
        <section key={b.title} className="card">
          <h2>📖 {b.title}</h2>
          <div className="family-book">
            {b.pages.map((p, i) => (
              <figure key={i}>
                <img src={p.photo} alt="" />
                <figcaption dir="auto">{p.text}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      {s.words.length > 0 && (
        <section className="card">
          <h2>🗣️ {t('familyPageWords', { n: s.words.length })}</h2>
          <p className="family-words">{s.words.map((w) => (w.says ? `${w[lang]} 🦋` : w[lang])).join(' · ')}</p>
        </section>
      )}
      <p className="hint small">{t('familyPagePrivate')}</p>

      {recordFor && (
        <Recorder
          title={recordFor.kind === 'word' ? `«${recordFor.word[lang]}»` : t('familyPageMessage')}
          maxMs={recordFor.kind === 'word' ? 10_000 : 60_000}
          wordLangs={recordFor.kind === 'word'}
          onClose={() => setRecordFor(null)}
          onSend={async (blob, l) => {
            const sb = await familyClient();
            await familySide(sb, token).send(recordFor.kind, blob, recordFor.kind === 'word' ? recordFor.word.id : null, l);
            setRecordFor(null);
            setSent(t('familyPageSent'));
          }}
        />
      )}
    </div>
  );
}

function Recorder({
  title,
  maxMs,
  wordLangs,
  onClose,
  onSend,
}: {
  title: string;
  maxMs: number;
  wordLangs: boolean;
  onClose: () => void;
  onSend: (blob: Blob, lang: Lang) => Promise<void>;
}) {
  const { t, lang: ui } = useI18n();
  const [lang, setLang] = useState<Lang>(ui);
  const [phase, setPhase] = useState<'ready' | 'recording' | 'done' | 'sending' | 'failed'>('ready');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [problem, setProblem] = useState(false);
  const rec = useRef<{ active: ActiveRecording; timer: number } | null>(null);
  useEffect(() => () => rec.current?.active.cancel(), []);

  const stop = async () => {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    window.clearTimeout(r.timer);
    setBlob(await r.active.stop());
    setPhase('done');
  };
  const start = async () => {
    try {
      const active = await startRecording();
      rec.current = { active, timer: window.setTimeout(() => void stop(), maxMs) };
      setProblem(false);
      setPhase('recording');
    } catch {
      setProblem(true);
    }
  };
  return (
    <Overlay label={title} onDismiss={onClose}>
        <h2>{title}</h2>
        {wordLangs && (
          <div className="nudge-actions">
            {(['ar', 'en'] as const).map((l) => (
              <button key={l} type="button" className={lang === l ? 'btn primary' : 'btn'} onClick={() => setLang(l)}>
                {l === 'ar' ? 'العربية' : 'English'}
              </button>
            ))}
          </div>
        )}
        {phase === 'ready' && (
          <button type="button" className="btn primary wide big" onClick={() => void start()}>
            ● {t('timelineRecord')}
          </button>
        )}
        {phase === 'recording' && (
          <button type="button" className="btn danger wide big" onClick={() => void stop()}>
            ■ {t('timelineStop')}
          </button>
        )}
        {(phase === 'done' || phase === 'failed') && blob && (
          <>
            <audio controls src={URL.createObjectURL(blob)} />
            <div className="nudge-actions">
              <button
                type="button"
                className="btn primary"
                onClick={async () => {
                  setPhase('sending');
                  try {
                    await onSend(blob, lang);
                  } catch {
                    setPhase('failed');
                  }
                }}
              >
                {t('familyPageSend')}
              </button>
              <button type="button" className="btn" onClick={() => setPhase('ready')}>
                {t('familyPageAgain')}
              </button>
            </div>
          </>
        )}
        {phase === 'sending' && <p className="hint">{t('loading')}</p>}
        {phase === 'failed' && <p className="msg error">{t('familyPageSendFailed')}</p>}
        {problem && <p className="msg error">{t('voiceProblem')}</p>}
        <button type="button" className="btn ghost wide" onClick={onClose}>
          {t('cancel')}
        </button>
    </Overlay>
  );
}
