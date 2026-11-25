import { useEffect, useMemo, useRef, useState } from 'react';
import type { LoadedPack } from '../../content/types';
import { startRecording, type ActiveRecording } from '../../custom/recorder';
import { blobUrl, type CustomPackView } from '../../custom/toLoaded';
import { customKind } from '../../custom/types';
import { useI18n } from '../../i18n/I18n';
import { makeVoiceVideo, MAX_SLIDES, videoType } from '../../report/voiceVideo';
import { ageInMonths, loadBirthMonth } from '../../settings/birth';
import { voiceId, voiceStore, type VoiceClip } from '../../settings/herVoice';
import { characterUrl, type Profile } from '../../settings/profiles';
import { Overlay, Screen } from './components';
import { wordLookup } from './WordsScreen';

/** A month's own recording ("her words this month"), kept with her word recordings. */
export const MONTH_PREFIX = 'month:';
export const monthKey = (at: number) => {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
/** A month's recording can be a little longer than a word. */
const MONTH_MAX_MS = 15_000;

/**
 * Her voice timeline: every recording of her, word recordings from Words I know and one free
 * recording a month, by month, to listen back to how she grew. Makes a keepsake video of the year
 * on the phone. Kept on this phone (and in the backup only if the parent turned that on).
 */
export function VoiceTimeline({ child, packs, views, onBack }: { child: Profile; packs: readonly LoadedPack[]; views: readonly CustomPackView[]; onBack: () => void }) {
  const { t, lang } = useI18n();
  const [clips, setClips] = useState<VoiceClip[] | null>(null);
  const [recording, setRecording] = useState(false);
  const [problem, setProblem] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [removing, setRemoving] = useState<VoiceClip | null>(null);
  const [video, setVideo] = useState<{ progress: number; result?: { url: string; blob: Blob; ext: string }; failed?: boolean } | null>(null);
  const rec = useRef<{ active: ActiveRecording; timer: number } | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const lookup = useMemo(() => wordLookup(packs), [packs]);
  const locale = lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB';

  const reload = async () => setClips([...(await voiceStore.all(child.id))].sort((a, b) => a.at - b.at));
  useEffect(() => {
    void reload();
    return () => {
      player.current?.pause();
      rec.current?.active.cancel();
    };
  }, [child.id]);

  const monthName = (key: string) => new Date(`${key}-15T12:00:00`).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const label = (c: VoiceClip) => (c.word.startsWith(MONTH_PREFIX) ? t('timelineFree') : (lookup.get(c.word)?.item.name[lang] ?? c.word));
  const byMonth = useMemo(() => {
    const groups = new Map<string, VoiceClip[]>();
    for (const c of clips ?? []) (groups.get(monthKey(c.at)) ?? groups.set(monthKey(c.at), []).get(monthKey(c.at))!).push(c);
    return [...groups.entries()].reverse();
  }, [clips]);

  const finish = async () => {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    window.clearTimeout(r.timer);
    setRecording(false);
    const blob = await r.active.stop();
    if (blob.size < 2000) return;
    const at = Date.now();
    await voiceStore.put({ id: voiceId(child.id, `${MONTH_PREFIX}${monthKey(at)}:${at}`), profileId: child.id, word: `${MONTH_PREFIX}${monthKey(at)}:${at}`, blob, at });
    await reload();
  };
  const record = async () => {
    if (rec.current) return void finish();
    player.current?.pause();
    try {
      const active = await startRecording();
      rec.current = { active, timer: window.setTimeout(() => void finish(), MONTH_MAX_MS) };
      setProblem(false);
      setRecording(true);
    } catch {
      setProblem(true);
    }
  };
  const play = (c: VoiceClip) => {
    player.current?.pause();
    const audio = new Audio(blobUrl(c.blob));
    player.current = audio;
    setPlaying(c.id);
    audio.onended = () => setPlaying(null);
    void audio.play().catch(() => setPlaying(null));
  };

  const makeVideo = async () => {
    if (!clips?.length) return;
    setVideo({ progress: 0 });
    // Her book pages, in the order they were made, then her character.
    const photos = views
      .filter((v) => customKind(v.pack.id) === 'book')
      .flatMap((v) => v.items.filter((i) => i.picture).map((i) => blobUrl(i.picture!)));
    const age = ageInMonths(loadBirthMonth(child.id));
    try {
      const { blob, ext } = await makeVoiceVideo({
        heading: t('timelineVideoTitle'),
        subheading: age !== null ? t('timelineVideoAge', { n: age }) : new Date().toLocaleDateString(locale, { year: 'numeric' }),
        slides: clips.slice(-MAX_SLIDES).map((c) => ({ title: monthName(monthKey(c.at)), caption: c.word.startsWith(MONTH_PREFIX) ? '' : label(c), audio: c.blob })),
        photos: photos.length ? photos : [characterUrl(child)].filter((u): u is string => Boolean(u)),
        rtl: lang === 'ar',
        onProgress: (p) => setVideo((v) => (v && !v.result ? { ...v, progress: p } : v)),
      });
      setVideo({ progress: 1, result: { url: URL.createObjectURL(blob), blob, ext } });
    } catch (e) {
      console.warn('[timeline] the video could not be made', e);
      setVideo({ progress: 0, failed: true });
    }
  };
  const share = async () => {
    const r = video?.result;
    if (!r) return;
    const file = new File([r.blob], `her-voice.${r.ext}`, { type: r.blob.type });
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: t('timelineVideoTitle') }).catch(() => undefined);
  };

  return (
    <Screen title={t('timelineTitle')} onBack={onBack}>
      <p className="hint">{t('timelineIntro')}</p>
      <section className="card">
        <h2>🎙️ {t('timelineThisMonth', { month: monthName(monthKey(Date.now())) })}</h2>
        <p className="hint">{t('timelineRecordHint')}</p>
        <button type="button" className={recording ? 'btn danger wide big' : 'btn primary wide big'} onClick={() => void record()}>
          {recording ? `■ ${t('timelineStop')}` : `● ${t('timelineRecord')}`}
        </button>
        {problem && <p className="msg error">{t('voiceProblem')}</p>}
      </section>

      {clips && clips.length > 0 && (
        <section className="card">
          <h2>🎞️ {t('timelineVideo')}</h2>
          <p className="hint">{videoType() ? t('timelineVideoHint', { n: Math.min(clips.length, MAX_SLIDES) }) : t('timelineNoVideo')}</p>
          {videoType() && !video && (
            <button type="button" className="btn primary wide" onClick={() => void makeVideo()}>
              {t('timelineMake')}
            </button>
          )}
          {video && !video.result && !video.failed && (
            <div className="arabic-progress">
              <i style={{ width: `${Math.round(video.progress * 100)}%` }} />
            </div>
          )}
          {video?.failed && <p className="msg error">{t('timelineFailed')}</p>}
          {video?.result && (
            <>
              <video className="timeline-video" src={video.result.url} controls playsInline />
              <div className="nudge-actions">
                <button type="button" className="btn primary" onClick={() => void share()}>
                  {t('timelineShare')}
                </button>
                <a className="btn" href={video.result.url} download={`her-voice.${video.result.ext}`}>
                  {t('timelineSave')}
                </a>
              </div>
            </>
          )}
        </section>
      )}

      {clips && !clips.length && <p className="note">{t('timelineEmpty')}</p>}
      {byMonth.map(([month, list]) => (
        <section key={month} className="card timeline-month">
          <h2>{monthName(month)}</h2>
          <ul className="timeline-list">
            {list.map((c) => (
              <li key={c.id}>
                <button type="button" className={playing === c.id ? 'voice-btn on' : 'voice-btn'} aria-label={t('voicePlay')} onClick={() => play(c)}>
                  ▶
                </button>
                <span className="timeline-label">
                  {lookup.get(c.word) && <img src={lookup.get(c.word)!.picture} alt="" />}
                  <strong>{label(c)}</strong>
                  <small className="hint">{new Date(c.at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</small>
                </span>
                <button type="button" className="btn ghost" aria-label={t('delete')} onClick={() => setRemoving(c)}>
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {removing && (
        <Overlay label={t('timelineRemove')} onDismiss={() => setRemoving(null)}>
          <h2>{t('timelineRemove')}</h2>
          <p>{t('timelineRemoveBody')}</p>
          <div className="pin-footer">
            <button type="button" className="btn ghost" onClick={() => setRemoving(null)}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={async () => {
                await voiceStore.remove(removing.id);
                setRemoving(null);
                await reload();
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
