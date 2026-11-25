import { useMemo, useState } from 'react';
import type { LoadedPack } from '../../content/types';
import { fixesText, loadChecked, loadFixes, saveFix, setChecked } from '../../i18n/arabicFixes';
import { reviewGroups, type ReviewLine } from '../../i18n/arabicReview';
import { useI18n } from '../../i18n/I18n';
import { Screen, Toggle } from './components';

/**
 * Settings > Check the Arabic: every new Arabic line, with ✓ when it's right or ✎ to fix it. A fix
 * is used on this phone straight away (shown and spoken); "Copy my fixes" gives the list to send so
 * they're made permanent for everyone.
 */
export function ArabicCheck({ packs, onChanged, onBack }: { packs: readonly LoadedPack[]; onChanged: () => void; onBack: () => void }) {
  const { t } = useI18n();
  const groups = useMemo(() => reviewGroups(packs), [packs]);
  const all = useMemo(() => groups.flatMap((g) => g.lines), [groups]);
  const [fixes, setFixes] = useState(loadFixes);
  const [checked, setCheckedState] = useState(loadChecked);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const done = all.filter((l) => checked[l.id] || fixes[l.id] !== undefined).length;

  const fix = (line: ReviewLine, text: string | null) => {
    setFixes(saveFix(line.id, text, line.ar));
    setCheckedState(setChecked(line.id, text !== null));
    setEditing(null);
    onChanged();
  };
  const copy = async () => {
    const text = fixesText(all, fixes);
    setCopied(text);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // The text stays on screen to copy by hand.
    }
  };

  return (
    <Screen title={t('arabicCheckTitle')} onBack={onBack}>
      <p className="hint">{t('arabicCheckIntro')}</p>
      <section className="card">
        <p>
          <strong>{t('arabicCheckDone', { n: done, total: all.length })}</strong>
        </p>
        <div className="arabic-progress">
          <i style={{ width: `${(done / Math.max(1, all.length)) * 100}%` }} />
        </div>
        <div className="arabic-toggle">
          <span>{t('arabicCheckOnlyOpen')}</span>
          <Toggle label={t('arabicCheckOnlyOpen')} checked={onlyOpen} onChange={setOnlyOpen} />
        </div>
        <button type="button" className="btn primary wide" disabled={!Object.keys(fixes).length} onClick={() => void copy()}>
          📋 {t('arabicCopy', { n: all.filter((l) => fixes[l.id] !== undefined).length })}
        </button>
        {copied !== null && (
          <>
            <p className="hint">{t('arabicCopied')}</p>
            <textarea className="arabic-copied" dir="auto" readOnly value={copied} rows={6} onFocus={(e) => e.currentTarget.select()} />
          </>
        )}
      </section>
      {groups.map((g) => {
        const lines = g.lines.filter((l) => !onlyOpen || (!checked[l.id] && fixes[l.id] === undefined));
        if (!lines.length) return null;
        return (
          <section key={g.title} className="card arabic-group">
            <h2>{t(g.title)}</h2>
            <ul className="arabic-lines">
              {lines.map((l) => {
                const fixed = fixes[l.id];
                const ok = Boolean(checked[l.id]) && fixed === undefined;
                return (
                  <li key={l.id} className={`arabic-line${ok ? ' ok' : ''}${fixed !== undefined ? ' fixed' : ''}`}>
                    {editing?.id === l.id ? (
                      <div className="arabic-edit">
                        <textarea dir="rtl" lang="ar" rows={2} value={editing.text} onChange={(e) => setEditing({ id: l.id, text: e.target.value })} />
                        <div className="nudge-actions">
                          <button type="button" className="btn primary" onClick={() => fix(l, editing.text)}>
                            {t('save')}
                          </button>
                          <button type="button" className="btn ghost" onClick={() => setEditing(null)}>
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="arabic-text">
                          <b dir="rtl" lang="ar">
                            {fixed ?? l.ar}
                          </b>
                          {fixed !== undefined && (
                            <s dir="rtl" lang="ar">
                              {l.ar}
                            </s>
                          )}
                          <small dir="ltr" lang="en">
                            {l.en}
                          </small>
                        </span>
                        <span className="arabic-actions">
                          <button
                            type="button"
                            className={`btn${ok ? ' primary' : ''}`}
                            aria-pressed={ok}
                            aria-label={t('arabicOk')}
                            onClick={() => setCheckedState(setChecked(l.id, !checked[l.id]))}
                          >
                            ✓
                          </button>
                          <button type="button" className="btn" aria-label={t('arabicFix')} onClick={() => setEditing({ id: l.id, text: fixed ?? l.ar })}>
                            ✎
                          </button>
                          {fixed !== undefined && (
                            <button type="button" className="btn ghost" onClick={() => fix(l, null)}>
                              {t('arabicUndo')}
                            </button>
                          )}
                        </span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </Screen>
  );
}
