import { useCallback, useEffect, useMemo, useState } from 'react';
import { recentWords } from '../../settings/herVoice';
import { loadFeelings } from '../../settings/plan';
import { loadPlayLog, topGames, weekMinutes } from '../../settings/playLog';
import { GAMES, gamePicture } from './games';
import { wordLookup } from './WordsScreen';
import { knownWords, wordEvidence } from '../../report/words';
import { loadWordMarks } from '../../settings/words';
import { paintingStore } from '../../settings/paintings';
import { loadPotty, pottyWeek } from '../../settings/potty';
import { CERTIFICATES, loadCertificates } from '../../settings/milestones';
import { renderWeekImage } from '../../report/weekImage';
import { choosePictures } from '../kid/layout';
import { MIXED_PACK_ID, MIXED_PACK_NAME } from '../../content/mixed';
import { ODD_PACK_ID, ODD_PACK_NAME } from '../../content/odd';
import type { LoadedPack } from '../../content/types';
import { blobUrl } from '../../custom/toLoaded';
import { isCustomPackId } from '../../custom/types';
import { formatDateTime, makeI18n, useI18n } from '../../i18n/I18n';
import { reportStore } from '../../report/db';
import { renderReportImage, type ReportImageRow } from '../../report/reportImage';
import { renderDoctorImage } from '../../report/doctorImage';
import { doctorStats } from '../../report/doctor';
import { ageInMonths, loadBirthMonth, saveBirthMonth } from '../../settings/birth';
import { loadMilestones, MILESTONES } from '../../settings/milestones';
import type { Lang } from '../../content/types';
import { shareSummary } from '../../report/share';
import { firstTryPercent, itemSummary, type ItemSummaryRow } from '../../report/summary';
import { resultPack, type QuestionResultEntity, type SessionEntity } from '../../report/types';
import { characterUrl, forProfile, type ProfileState } from '../../settings/profiles';
import { Overlay, Screen, Segmented } from './components';
import { ProfileRow } from './ProfileRow';

/**
 * Spec 8.1: per-item summary (names only, never pictures) grouped by pack, game list with details,
 * clear history. One child at a time; shareable as a picture.
 */
export function ReportScreen({
  packs,
  profiles,
  onBack,
  onWords,
}: {
  packs: readonly LoadedPack[];
  profiles: ProfileState;
  onBack: () => void;
  /** Opens Words I know. */
  onWords?: () => void;
}) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<{ sessions: SessionEntity[]; questions: QuestionResultEntity[] } | null>(null);
  const [childId, setChildId] = useState(profiles.activeId);
  const [tab, setTab] = useState<'items' | 'games'>('items');
  const [detail, setDetail] = useState<SessionEntity | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [shared, setShared] = useState<{ blob: Blob; url: string; name?: string; title?: string; print?: boolean } | null>(null);
  const [doctorLang, setDoctorLang] = useState<Lang>(lang);
  const [shareProblem, setShareProblem] = useState(false);
  const child = profiles.profiles.find((p) => p.id === childId) ?? profiles.profiles[0];
  // How do you feel?: her last week of check-ins, newest first.
  const feelPack = packs.find((p) => p.id === 'feelings');
  const feelPictures = useMemo(() => (feelPack ? choosePictures(feelPack.items, () => 0) : {}), [feelPack]);
  const feelings = useMemo(() => recentWords(loadFeelings(child.id), 7).reverse(), [child.id]);
  const several = profiles.profiles.length > 1;
  const [birth, setBirth] = useState(() => loadBirthMonth(child.id));
  useEffect(() => setBirth(loadBirthMonth(child.id)), [child.id]);
  // Play time: minutes per day this week, and her most-chosen games.
  const playLog = useMemo(() => loadPlayLog(child.id), [child.id]);
  const week = useMemo(() => weekMinutes(playLog), [playLog]);
  const weekTotal = week.reduce((n, d) => n + d.minutes, 0);
  const weekMax = Math.max(1, ...week.map((d) => d.minutes));
  const favouriteGames = useMemo(() => topGames(playLog, new Date(`${week[0].day}T00:00:00`).getTime()), [playLog, week]);

  const load = useCallback(async () => {
    const [sessions, questions] = await Promise.all([reportStore.sessions(), reportStore.questions()]);
    setData({ sessions, questions });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Only this child's games.
  const mine = useMemo(() => {
    if (!data) return null;
    const sessions = forProfile(data.sessions, child.id);
    const ids = new Set(sessions.map((s) => s.id));
    return { sessions, questions: data.questions.filter((q) => ids.has(q.sessionId)) };
  }, [data, child.id]);

  // Names per pack; the animals of "Who eats what?" are found through any pack.
  const names = useMemo(() => {
    const byPack = new Map<string, Map<string, string>>();
    const any = new Map<string, string>();
    for (const p of packs) {
      const own = new Map<string, string>();
      for (const i of p.items) {
        own.set(i.key, i.name[lang]);
        any.set(i.key, i.name[lang]);
        for (const about of i.prompts ?? []) any.set(about.key, about.name[lang]);
      }
      byPack.set(p.id, own);
    }
    return { byPack, any };
  }, [packs, lang]);
  // Items from a pack the parent has since deleted have no name any more.
  const name = (packId: string, key: string) =>
    names.byPack.get(packId)?.get(key) ?? names.any.get(key) ?? (/^[0-9a-f-]{36}$/.test(key) ? t('deletedItem') : key);
  const packName = (id: string) =>
    packs.find((p) => p.id === id)?.name[lang] ??
    (id === MIXED_PACK_ID
      ? MIXED_PACK_NAME[lang]
      : id === ODD_PACK_ID
        ? ODD_PACK_NAME[lang]
        : isCustomPackId(id)
          ? t('deletedPack')
          : id);
  /** What a game was: the pack, or Memory / Odd one out with how it went. */
  const gameLine = (g: SessionEntity, pct: number | null) => {
    if (g.game === 'peekaboo') return `${t('peekaboo')} · ${packName(g.packId)} · ${t('peekabooRow', { n: g.questionCount })}`;
    if (g.game === 'point') return `${t('pointGame')} · ${t('pointRow', { n: g.questionCount })}`;
    if (g.game === 'actions') return `${t('actionsGame')} · ${t('actionsRow', { n: g.questionCount })}`;
    if (g.game === 'sounds') return `${t('soundsGame')} · ${t('soundsRow', { n: g.questionCount })}`;
    if (g.game === 'hunt') return `${t('huntGame')} · ${t('huntRow', { n: g.questionCount })}`;
    if (g.game === 'phrases') return `${t('phrasesGame')} · ${t('talkRow', { n: g.questionCount })}`;
    if (g.game === 'manners') return `${t('mannersGame')} · ${t('talkRow', { n: g.questionCount })}`;
    if (g.game === 'real') return `${t('realGame')} · ${packName(g.packId)}`;
    if (g.game === 'talk') return `${t('talkGame')} · ${packName(g.packId)} · ${t('talkRow', { n: g.questionCount })}`;
    if (g.game === 'scene') {
      const where = g.variant === 'house' ? t('sceneHouse') : t('sceneFarm');
      return `${t('sceneGame')} · ${where} · ${t('gameQuestions', { n: g.questionCount })} · ${pct === null ? '—' : t('gameFirstTry', { p: pct })}`;
    }
    if (g.game === 'memory') {
      return `${t('memoryGame')} · ${packName(g.packId)} · ${t('memoryRow', { n: g.variant ?? g.questionCount, turns: g.turns ?? 0 })}`;
    }
    const firstTry = g.toddlerMode ? t('toddlerMode') : pct === null ? '—' : t('gameFirstTry', { p: pct });
    const what = g.game === 'odd' ? `${t('oddOneOut')} · ${g.variant === 'hard' ? t('oddHard') : t('oddEasy')}` : packName(g.packId);
    return `${what} · ${t('gameQuestions', { n: g.questionCount })} · ${firstTry}`;
  };

  const summary = mine ? itemSummary(mine.sessions, mine.questions) : [];
  // One section per pack, in the order the packs are listed in Settings.
  const sections = useMemo(() => {
    const order = new Map(packs.map((p, i) => [p.id, i]));
    const groups = new Map<string, ItemSummaryRow[]>();
    for (const row of summary) groups.set(row.packId, [...(groups.get(row.packId) ?? []), row]);
    return [...groups].sort(([a], [b]) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity));
  }, [summary, packs]);
  const games = mine ? [...mine.sessions].sort((a, b) => b.startedAt - a.startedAt) : [];
  const questionsOf = (id: number) => mine?.questions.filter((q) => q.sessionId === id) ?? [];
  const empty = mine !== null && mine.sessions.length === 0;
  const arrow = lang === 'ar' ? '←' : '→';

  // Her paintings (Finger painting), newest first.
  const [paintings, setPaintings] = useState<{ id: string; url: string; at: number; blob: Blob }[]>([]);
  useEffect(() => {
    void paintingStore.all(child.id).then((list) => setPaintings(list.map((p) => ({ id: p.id, url: blobUrl(p.blob), at: p.at, blob: p.blob }))));
  }, [child.id]);

  /** Her week, for the family: new words, feelings, a painting and a few happy numbers. */
  const prepareWeek = async () => {
    const since = Date.now() - 7 * 86_400_000;
    const lookup = wordLookup(packs);
    const marks = loadWordMarks(child.id);
    const known = mine ? knownWords(wordEvidence(mine.sessions, mine.questions, (id) => [...lookup.values()].some((w) => w.pack.id === id))) : new Map<string, number>();
    const fresh = [...new Set([...known.keys(), ...Object.keys(marks.says)])]
      .map((id) => ({ id, at: Math.max(known.get(id) ?? 0, marks.says[id] ?? 0) }))
      .filter((w) => w.at >= since && lookup.has(w.id))
      .sort((a, b) => b.at - a.at)
      .map((w) => lookup.get(w.id)!);
    const potty = pottyWeek(loadPotty(child.id)).reduce((n, d) => n + d.entries.length, 0);
    const earned = loadCertificates(child.id);
    const newCerts = CERTIFICATES.filter((c) => (earned[c.id] ?? 0) >= since);
    const from = new Date(since + 86_400_000).toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short' });
    const to = new Date().toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short' });
    const blob = await renderWeekImage({
      rtl: lang === 'ar',
      title: t('weekImgTitle'),
      subtitle: `${from} – ${to}`,
      avatar: { animal: child.animal, color: child.color, picture: characterUrl(child) },
      wordsTitle: t('weekImgWords'),
      words: fresh.map((w) => ({ picture: w.picture, name: w.item.name[lang] })),
      feelingsTitle: t('weekImgFeelings'),
      feelings: feelings.map((f) => ({ picture: feelPictures[f.feeling] ?? '', name: feelPack?.items.find((i) => i.key === f.feeling)?.name[lang] ?? f.feeling })),
      paintingTitle: t('weekImgPainting'),
      painting: paintings.find((p) => p.at >= since)?.url ?? null,
      chips: [
        ...(weekTotal ? [`⏱️ ${t('weekImgPlay', { n: weekTotal })}`] : []),
        ...(fresh.length ? [`🌱 ${fresh.length} ${t('weekImgWords')}`] : []),
        ...(potty ? [`⭐ ${t('weekImgPotty', { n: potty })}`] : []),
        ...newCerts.map((c) => `🎓 ${c.words ? t('certWordsLine', { n: c.words }) : t('certSentenceLine')}`),
      ],
      footer: t('appName'),
    });
    setShareProblem(false);
    setShared({ blob, url: blobUrl(blob), name: 'her-week.png', title: t('weekShareTitle') });
  };

  /** One plain page for a check-up, in the language the parent picks. */
  const prepareDoctor = async () => {
    if (!mine) return;
    const { t: d } = makeI18n(doctorLang);
    const locale = doctorLang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB';
    const dateOf = (at: number) => new Date(at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    const wordPacks = new Set([...wordLookup(packs).values()].map((w) => w.pack.id));
    const s = doctorStats(mine.sessions, mine.questions, loadWordMarks(child.id), (id) => wordPacks.has(id));
    const ticks = loadMilestones(child.id);
    const age = ageInMonths(birth);
    const blob = await renderDoctorImage({
      rtl: doctorLang === 'ar',
      title: d('doctorPageTitle'),
      subtitle: [dateOf(Date.now()), ...(age === null ? [] : [d('doctorAge', { n: age })])].join(' · '),
      stats: [
        { value: String(s.understood.total), label: d('doctorUnderstood') },
        { value: String(s.says), label: d('doctorSays') },
        ...(packs.some((p) => p.id === 'phrases') ? [{ value: String(s.phrases), label: d('doctorPhrases') }] : []),
      ],
      notes: [
        d('doctorByLanguage', { ar: s.understood.arabic, en: s.understood.english, both: s.understood.bothLanguages }),
        ...(s.outsideApp ? [d('doctorOutside', { n: s.outsideApp })] : []),
      ],
      milestonesTitle: d('doctorMilestones'),
      milestones: [...MILESTONES]
        .sort((a, b) => Number(ticks[b.id] !== undefined) - Number(ticks[a.id] !== undefined))
        .map((m) => ({ text: m.text[doctorLang], date: ticks[m.id] !== undefined ? dateOf(ticks[m.id]) : null })),
      footer: d('doctorFooter'),
    });
    setShareProblem(false);
    setShared({ blob, url: blobUrl(blob), name: 'for-the-doctor.png', title: t('doctorTitle'), print: true });
  };

  /** Draws the picture first, so the share sheet opens straight from the next tap. */
  const prepareShare = async () => {
    if (!mine) return;
    const s = shareSummary(mine.sessions, mine.questions);
    const rows = (list: ItemSummaryRow[]): ReportImageRow[] =>
      list.map((r) => ({ name: name(r.packId, r.itemKey), detail: packName(r.packId), percent: r.percent }));
    const blob = await renderReportImage({
      rtl: lang === 'ar',
      title: t('appName'),
      subtitle: `${t('report')} · ${new Date().toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      avatar: child ? { animal: child.animal, color: child.color, picture: characterUrl(child) } : null,
      stats: [
        { value: String(s.games), label: t('shareGames') },
        { value: String(s.answers), label: t('shareAnswers') },
        { value: s.firstTryPercent === null ? '—' : `${s.firstTryPercent}%`, label: t('shareFirstTry') },
      ],
      sections: [
        {
          title: t('shareByPack'),
          style: 'bars',
          rows: s.packs.slice(0, 6).map((p) => ({ name: packName(p.packId), percent: p.percent })),
          empty: t('shareNothingYet'),
        },
        { title: t('shareStrong'), style: 'good', rows: rows(s.strong), empty: t('shareNothingYet') },
        { title: t('shareLearning'), style: 'learn', rows: rows(s.learning), empty: t('shareNothingYet') },
      ],
      footer: t('shareFooter'),
    });
    setShareProblem(false);
    setShared({ blob, url: blobUrl(blob) });
  };

  const file = () => new File([shared!.blob], shared!.name ?? 'kids-sound-match-report.png', { type: shared!.blob.type || 'image/png' });
  const canShareFiles = () => {
    try {
      return Boolean(shared && navigator.canShare?.({ files: [file()] }));
    } catch {
      return false;
    }
  };
  const share = async () => {
    try {
      await navigator.share({ files: [file()], title: t('report') });
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') setShareProblem(true);
    }
  };
  const save = () => {
    const a = document.createElement('a');
    a.href = shared!.url;
    a.download = shared!.name ?? 'kids-sound-match-report.png';
    a.click();
  };

  return (
    <Screen title={t('report')} onBack={onBack}>
      {several && <ProfileRow profiles={profiles.profiles} activeId={child.id} onSelect={setChildId} label={t('children')} />}
      <Segmented
        label={t('report')}
        value={tab}
        options={[
          { value: 'items', label: t('reportByItem') },
          { value: 'games', label: t('reportGames') },
        ]}
        onChange={setTab}
      />

      <section className="card play-time">
        <h2>⏱️ {t('playTimeTitle')}</h2>
        {weekTotal === 0 ? (
          <p className="hint">{t('playTimeNone')}</p>
        ) : (
          <>
            <p className="hint">{t('playTimeTotal', { n: weekTotal })}</p>
            <div className="week-bars" role="img" aria-label={week.map((d) => `${d.day}: ${d.minutes}`).join(', ')}>
              {week.map((d, i) => (
                <div key={d.day} className={`week-bar${i === 6 ? ' today' : ''}`}>
                  <span className="week-min">{d.minutes > 0 ? d.minutes : ''}</span>
                  <i style={{ height: `${Math.max(d.minutes ? 6 : 2, (d.minutes / weekMax) * 100)}%` }} />
                  <small>
                    {new Date(`${d.day}T12:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { weekday: 'short' })}
                  </small>
                </div>
              ))}
            </div>
            {favouriteGames.length > 0 && (
              <>
                <h3 className="play-top-title">{t('playTimeTop')}</h3>
                <ul className="play-top">
                  {favouriteGames.map((g) => (
                    <li key={g.kind}>
                      {gamePicture(g.kind) && <img src={gamePicture(g.kind)} alt="" />}
                      <span>{GAMES[g.kind] ? t(GAMES[g.kind].label) : g.kind}</span>
                      <small className="hint">{t('playTimeTimes', { n: g.count, m: g.minutes })}</small>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </section>

      <section className="card week-share">
        <h2>💌 {t('weekShareTitle')}</h2>
        <p className="hint">{t('weekShareHint')}</p>
        <button type="button" className="btn primary wide" onClick={() => void prepareWeek()}>
          {t('weekShareMake')}
        </button>
      </section>

      <section className="card doctor-card">
        <h2>🩺 {t('doctorTitle')}</h2>
        <p className="hint">{t('doctorHint')}</p>
        <label className="doctor-birth">
          <span>{t('doctorBirth')}</span>
          <input
            type="month"
            value={birth}
            max={new Date().toISOString().slice(0, 7)}
            onChange={(e) => {
              setBirth(e.target.value);
              saveBirthMonth(child.id, e.target.value);
            }}
          />
        </label>
        <Segmented
          label={t('doctorLanguage')}
          value={doctorLang}
          options={[
            { value: 'ar' as const, label: t('langArabic') },
            { value: 'en' as const, label: t('langEnglish') },
          ]}
          onChange={setDoctorLang}
        />
        <button type="button" className="btn primary wide" onClick={() => void prepareDoctor()} disabled={!mine}>
          {t('doctorMake')}
        </button>
      </section>

      {paintings.length > 0 && (
        <section className="card paintings">
          <h2>🎨 {t('paintingsTitle')}</h2>
          <p className="hint">{t('paintingsHint')}</p>
          <div className="painting-grid">
            {paintings.slice(0, 12).map((p) => (
              <button type="button" key={p.id} className="painting" onClick={() => setShared({ blob: p.blob, url: p.url, name: 'her-painting.jpg', title: t('paintingsTitle') })}>
                <img src={p.url} alt="" />
              </button>
            ))}
          </div>
        </section>
      )}

      {feelings.length > 0 && (
        <section className="card feel-report">
          <h2>{t('feelReport')}</h2>
          <ul className="feel-list">
            {feelings.map((f) => (
              <li key={f.at}>
                {feelPictures[f.feeling] && <img src={feelPictures[f.feeling]} alt="" />}
                <span>{feelPack?.items.find((i) => i.key === f.feeling)?.name[lang] ?? f.feeling}</span>
                <small className="hint">
                  {new Date(f.at).toLocaleDateString(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </small>
              </li>
            ))}
          </ul>
        </section>
      )}

      {empty && <p className="empty">{t('reportEmpty')}</p>}

      {tab === 'items' && !empty && mine && (
        <section className="card">
          <p className="hint">{t('reportExplain')}</p>
          {sections.length === 0 ? (
            <p className="empty">{t('reportEmpty')}</p>
          ) : (
            sections.map(([packId, rows]) => (
              <div key={packId} className="report-pack">
                {sections.length > 1 && <h3>{packName(packId)}</h3>}
                <ul className="report-list">
                  {rows.map((row) => (
                    <li key={row.itemKey} className="report-row">
                      <div className="report-line">
                        <span className="report-name">{name(packId, row.itemKey)}</span>
                        <span className="report-value">{row.percent === null ? '—' : `${row.percent}%`}</span>
                      </div>
                      <div className="bar" aria-hidden="true">
                        <i style={{ width: `${row.percent ?? 0}%` }} />
                      </div>
                      <span className="hint">
                        {t('nOfM', { n: row.firstTry, m: row.tries })}
                        {row.percent === null ? ` · ${t('notEnoughTries')}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      )}

      {tab === 'games' && !empty && (
        <section className="card">
          <ul className="report-list">
            {games.map((g) => {
              const pct = firstTryPercent(questionsOf(g.id));
              return (
                <li key={g.id}>
                  <button type="button" className="game-row" onClick={() => setDetail(g)}>
                    <span className="report-name">{formatDateTime(g.startedAt, lang)}</span>
                    <span className="hint">
                      {gameLine(g, pct)}
                      {g.completed ? '' : ` · ${t('unfinishedGame')}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {onWords && (
        <button type="button" className="card pack-card" onClick={onWords}>
          <span className="link-icon big" aria-hidden="true">
            🗣️
          </span>
          <span className="pack-text">
            <strong>{t('wordsTitle')}</strong>
            <span className="hint">{t('wordsReportHint')}</span>
          </span>
        </button>
      )}

      {!empty && mine && (
        <div className="stack">
          <button type="button" className="btn primary wide" onClick={() => void prepareShare()}>
            📤 {t('shareReport')}
          </button>
          <button type="button" className="btn danger-outline wide" onClick={() => setConfirmClear(true)}>
            {several ? t('clearChildHistory') : t('clearHistory')}
          </button>
        </div>
      )}

      {shared?.print && (
        <div className="print-area print-only doctor-print">
          <img src={shared.url} alt="" />
        </div>
      )}

      {shared && (
        <Overlay label={shared.title ?? t('shareReport')} onDismiss={() => setShared(null)}>
          <h2>{shared.title ?? t('shareReport')}</h2>
          <img className="share-preview" src={shared.url} alt={t('report')} />
          <p className="hint">{t('shareHint')}</p>
          {shareProblem && (
            <p className="msg error" role="alert">
              {t('shareFailed')}
            </p>
          )}
          <div className="pin-footer">
            <button type="button" className="btn ghost" onClick={() => setShared(null)}>
              {t('close')}
            </button>
            <button type="button" className="btn" onClick={save}>
              {t('savePicture')}
            </button>
            {shared.print && (
              <button type="button" className="btn" onClick={() => window.print()}>
                🖨️ {t('doctorPrint')}
              </button>
            )}
            {canShareFiles() && (
              <button type="button" className="btn primary" onClick={() => void share()}>
                {t('share')}
              </button>
            )}
          </div>
        </Overlay>
      )}

      {detail && (
        <Overlay label={t('gameDetails')} onDismiss={() => setDetail(null)}>
          <h2>{t('gameDetails')}</h2>
          <p className="hint">
            {packName(detail.packId)} · {formatDateTime(detail.startedAt, lang)}
          </p>
          <ol className="detail-list">
            {questionsOf(detail.id).map((q) => {
              const item = name(resultPack(q, detail), q.itemKey);
              return (
                <li key={q.id}>
                  <span>{q.promptKey ? `${names.any.get(q.promptKey) ?? q.promptKey} ${arrow} ${item}` : item}</span>
                  <span className={q.firstTryCorrect ? 'first-try yes' : 'first-try'}>
                    {q.firstTryCorrect ? `✓ ${t('firstTry')}` : q.attempts === 1 ? t('oneTap') : t('taps', { n: q.attempts })}
                    {q.hinted ? ` · ${t('withHint')}` : ''}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="pin-footer">
            <button type="button" className="btn primary" onClick={() => setDetail(null)}>
              {t('close')}
            </button>
          </div>
        </Overlay>
      )}

      {confirmClear && (
        <Overlay label={t('clearHistoryTitle')} onDismiss={() => setConfirmClear(false)}>
          <h2>{several ? t('clearChildHistoryTitle') : t('clearHistoryTitle')}</h2>
          <p>{several ? t('clearChildHistoryBody') : t('clearHistoryBody')}</p>
          <div className="pin-footer">
            <button type="button" className="btn ghost" onClick={() => setConfirmClear(false)}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={async () => {
                await reportStore.deleteSessions(mine?.sessions.map((s) => s.id) ?? []);
                setConfirmClear(false);
                await load();
              }}
            >
              {t('delete')}
            </button>
          </div>
        </Overlay>
      )}
    </Screen>
  );
}
