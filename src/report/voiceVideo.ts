/**
 * Her voice timeline as a keepsake video, made on the phone: a title card, then each recording in
 * order with a photo (from her books, in turn) and the month, while her voice plays. The canvas and
 * the sound are recorded together with the browser's MediaRecorder: MP4 where the phone can make
 * it (shares best on WhatsApp), WebM otherwise. Nothing is uploaded.
 */
export interface VideoSlide {
  /** "November 2026". */
  title: string;
  /** The word she says, or empty for a free recording. */
  caption: string;
  audio: Blob;
}

export interface VideoInput {
  heading: string;
  subheading: string;
  slides: VideoSlide[];
  /** Photos to show, used in turn (her book pages); her character when there are none. */
  photos: string[];
  rtl: boolean;
  onProgress?: (done: number) => void;
}

const SIZE = 720;
const FPS = 30;
const TITLE_SEC = 2.5;
const GAP_SEC = 0.7;
/** At most this many recordings, so the video stays short enough to share. */
export const MAX_SLIDES = 40;

export function videoType(): { mime: string; ext: 'mp4' | 'webm' } | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const [mime, ext] of [
    ['video/mp4;codecs=avc1,mp4a.40.2', 'mp4'],
    ['video/mp4', 'mp4'],
    ['video/webm;codecs=vp9,opus', 'webm'],
    ['video/webm;codecs=vp8,opus', 'webm'],
    ['video/webm', 'webm'],
  ] as const) {
    if (MediaRecorder.isTypeSupported(mime)) return { mime, ext };
  }
  return null;
}

/** How long the video will be, in seconds (the slides' recordings are measured first). */
export function videoLength(durations: readonly number[]): number {
  return TITLE_SEC + durations.reduce((n, d) => n + d + GAP_SEC, 0);
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function makeVoiceVideo(input: VideoInput): Promise<{ blob: Blob; ext: 'mp4' | 'webm' }> {
  const type = videoType();
  if (!type) throw new Error('This phone cannot make videos');
  const slides = input.slides.slice(0, MAX_SLIDES);
  const ctx = new AudioContext();
  const buffers: (AudioBuffer | null)[] = [];
  for (const s of slides) {
    try {
      buffers.push(await ctx.decodeAudioData(await s.audio.arrayBuffer()));
    } catch {
      buffers.push(null);
    }
  }
  const photos = (await Promise.all(input.photos.map(loadImage))).filter((i): i is HTMLImageElement => i !== null);

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const g = canvas.getContext('2d')!;
  const out = ctx.createMediaStreamDestination();
  const stream = new MediaStream([...canvas.captureStream(FPS).getVideoTracks(), ...out.stream.getAudioTracks()]);
  const recorder = new MediaRecorder(stream, { mimeType: type.mime, videoBitsPerSecond: 2_500_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const finished = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));

  // When each slide starts, on the audio clock.
  const starts: number[] = [];
  let t = TITLE_SEC;
  for (const b of buffers) {
    starts.push(t);
    t += (b?.duration ?? 1) + GAP_SEC;
  }
  const total = t;

  const cover = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
    const s = Math.max(w / img.width, h / img.height);
    const sw = w / s;
    const sh = h / s;
    g.save();
    g.beginPath();
    g.roundRect(x, y, w, h, 36);
    g.clip();
    g.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
    g.restore();
  };
  const text = (s: string, y: number, size: number, color: string, weight = 800) => {
    g.font = `${weight} ${size}px system-ui, sans-serif`;
    g.fillStyle = color;
    g.textAlign = 'center';
    g.direction = input.rtl ? 'rtl' : 'ltr';
    g.fillText(s, SIZE / 2, y, SIZE - 60);
  };
  const draw = (now: number) => {
    const bg = g.createLinearGradient(0, 0, 0, SIZE);
    bg.addColorStop(0, '#fff3e4');
    bg.addColorStop(1, '#f3ecff');
    g.fillStyle = bg;
    g.fillRect(0, 0, SIZE, SIZE);
    if (now < TITLE_SEC) {
      if (photos[0]) cover(photos[0], 160, 90, 400, 400);
      text(input.heading, 570, 52, '#3a2c55');
      text(input.subheading, 630, 32, '#6b5c8a', 600);
      return;
    }
    let i = starts.length - 1;
    while (i > 0 && starts[i] > now) i--;
    const photo = photos.length ? photos[i % photos.length] : null;
    if (photo) cover(photo, 110, 70, 500, 500);
    text(slides[i]?.title ?? '', 620, 44, '#3a2c55');
    if (slides[i]?.caption) text(`«${slides[i].caption}»`, 676, 34, '#7a4fd1', 700);
    // A soft bar showing how far through her year.
    g.fillStyle = 'rgba(122, 79, 209, 0.2)';
    g.fillRect(60, 700, SIZE - 120, 6);
    g.fillStyle = '#7a4fd1';
    g.fillRect(60, 700, ((SIZE - 120) * now) / total, 6);
  };

  draw(0);
  recorder.start(1000);
  const t0 = ctx.currentTime + 0.1;
  buffers.forEach((b, i) => {
    if (!b) return;
    const src = ctx.createBufferSource();
    src.buffer = b;
    src.connect(out);
    src.start(t0 + starts[i]);
  });
  // Drawn on a timer (not animation frames), so it keeps going if the screen dims.
  await new Promise<void>((resolve) => {
    const timer = window.setInterval(() => {
      const now = ctx.currentTime - t0;
      draw(Math.max(0, now));
      input.onProgress?.(Math.min(1, now / total));
      if (now >= total) {
        window.clearInterval(timer);
        resolve();
      }
    }, 1000 / FPS);
  });
  recorder.stop();
  await finished;
  await ctx.close();
  return { blob: new Blob(chunks, { type: type.mime.split(';')[0] }), ext: type.ext };
}
