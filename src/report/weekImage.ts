import { loadAvatar } from './wordsImage';

/**
 * "Her week" as one picture for the grandparents: her character, the week's new words with their
 * pictures, how she felt, a painting, and a few happy numbers (play time, potty stars, a new
 * certificate). Drawn on this device; nothing is uploaded unless the parent sends it.
 */
export interface WeekImageData {
  rtl: boolean;
  title: string;
  subtitle: string;
  avatar: { animal: string; color: string; picture?: string };
  wordsTitle: string;
  words: { picture: string; name: string }[];
  feelingsTitle: string;
  feelings: { picture: string; name: string }[];
  paintingTitle: string;
  painting: string | null;
  /** Short lines with an emoji: "⏱️ 38 minutes of play". */
  chips: string[];
  footer: string;
}

const W = 1080;
const M = 56;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans Arabic', Tahoma, sans-serif";
const EMOJI = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";

function load(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = window.setTimeout(() => resolve(null), 4000);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

export async function renderWeekImage(d: WeekImageData): Promise<Blob> {
  const words = d.words.slice(0, 8);
  const feelings = d.feelings.slice(0, 6);
  const wordRows = Math.ceil(words.length / 4);
  const wordsH = words.length ? 80 + wordRows * 236 + 20 : 0;
  const feelH = feelings.length ? 80 + 190 : 0;
  const bottomH = d.painting || d.chips.length ? 80 + 380 : 0;
  const H = M + 230 + 30 + (wordsH ? wordsH + 30 : 0) + (feelH ? feelH + 30 : 0) + (bottomH ? bottomH + 30 : 0) + 70;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.direction = d.rtl ? 'rtl' : 'ltr';
  const x = (v: number) => (d.rtl ? W - v : v);
  const text = (s: string, at: number, y: number, size: number, color: string, o: { bold?: boolean; align?: CanvasTextAlign; max?: number } = {}) => {
    ctx.font = `${o.bold ? '700 ' : ''}${size}px ${FONT}`;
    ctx.fillStyle = color;
    ctx.textAlign = o.align ?? 'start';
    ctx.textBaseline = 'middle';
    let out = s;
    if (o.max) while (out.length > 1 && ctx.measureText(out).width > o.max) out = out.slice(0, -2) + '…';
    ctx.fillText(out, x(at), y);
  };
  const box = (left: number, top: number, w: number, h: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const at = d.rtl ? W - left - w : left;
    if (ctx.roundRect) ctx.roundRect(at, top, w, h, r);
    else ctx.rect(at, top, w, h);
    ctx.fill();
  };
  const circlePic = (img: HTMLImageElement | null, cx: number, cy: number, r: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x(cx), cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.clip();
    if (img) ctx.drawImage(img, x(cx) - r, cy - r, 2 * r, 2 * r);
    ctx.restore();
  };

  // Paper with soft confetti.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#fff6fb');
  bg.addColorStop(1, '#fff1dc');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const dots = ['#F05A8C', '#5B8DEF', '#7ED0B5', '#F7C948', '#B48CF0'];
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = dots[i % dots.length];
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc((i * 263) % W, (i * 157) % H, 6 + (i % 3) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Header: her character, "My week", the dates.
  box(M, M, W - 2 * M, 230, 40, '#8a5cd6');
  const cx = M + 48 + 75;
  ctx.fillStyle = d.avatar.color;
  ctx.beginPath();
  ctx.arc(x(cx), M + 115, 78, 0, Math.PI * 2);
  ctx.fill();
  const av = d.avatar.picture ? await loadAvatar(d.avatar.picture) : null;
  if (av) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x(cx), M + 115, 78, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(av, x(cx) - 78, M + 37, 156, 156);
    ctx.restore();
  } else {
    ctx.font = `84px ${EMOJI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.avatar.animal, x(cx), M + 120);
  }
  const ts = cx + 78 + 36;
  text(d.title, ts, M + 92, 60, '#fff', { bold: true, max: W - M - ts - 40 });
  text(d.subtitle, ts, M + 155, 32, 'rgba(255,255,255,0.9)', { max: W - M - ts - 40 });
  let y = M + 230 + 30;

  if (words.length) {
    box(M, y, W - 2 * M, wordsH, 32, '#fff');
    text(`🌱 ${d.wordsTitle}`, M + 36, y + 48, 38, '#2b2a33', { bold: true });
    const imgs = await Promise.all(words.map((w) => load(w.picture)));
    const tileW = (W - 2 * M - 48) / 4;
    words.forEach((w, i) => {
      const left = M + 24 + (i % 4) * tileW;
      const top = y + 80 + Math.floor(i / 4) * 236;
      circlePic(imgs[i], left + tileW / 2, top + 85, 80);
      text(w.name, left + tileW / 2, top + 196, 30, '#2b2a33', { bold: true, align: 'center', max: tileW - 16 });
    });
    y += wordsH + 30;
  }

  if (feelings.length) {
    box(M, y, W - 2 * M, feelH, 32, '#fff');
    text(`💛 ${d.feelingsTitle}`, M + 36, y + 48, 38, '#2b2a33', { bold: true });
    const imgs = await Promise.all(feelings.map((f) => load(f.picture)));
    const step = (W - 2 * M - 48) / 6;
    feelings.forEach((f, i) => {
      const c = M + 24 + step * i + step / 2;
      circlePic(imgs[i], c, y + 145, 58);
      text(f.name, c, y + 232, 24, '#6b6874', { align: 'center', max: step - 8 });
    });
    y += feelH + 30;
  }

  if (bottomH) {
    const half = d.painting && d.chips.length ? (W - 2 * M - 30) / 2 : W - 2 * M;
    let left = M;
    if (d.painting) {
      box(left, y, half, bottomH, 32, '#fff');
      text(`🎨 ${d.paintingTitle}`, left + 30, y + 48, 34, '#2b2a33', { bold: true, max: half - 60 });
      const p = await load(d.painting);
      if (p) {
        const maxW = half - 60;
        const maxH = bottomH - 110;
        const s = Math.min(maxW / p.width, maxH / p.height);
        const w = p.width * s;
        const h = p.height * s;
        const px = left + 30 + (maxW - w) / 2;
        ctx.save();
        ctx.beginPath();
        const at = d.rtl ? W - px - w : px;
        if (ctx.roundRect) ctx.roundRect(at, y + 85, w, h, 20);
        else ctx.rect(at, y + 85, w, h);
        ctx.clip();
        ctx.drawImage(p, at, y + 85, w, h);
        ctx.restore();
      }
      left += half + 30;
    }
    if (d.chips.length) {
      const w = d.painting ? half : W - 2 * M;
      box(left, y, w, bottomH, 32, '#fff');
      d.chips.slice(0, 5).forEach((c, i) => {
        box(left + 24, y + 30 + i * 84, w - 48, 66, 33, ['#fde3ec', '#e0ecfb', '#e2f4e2', '#fdf3cf', '#eee6fb'][i % 5]);
        text(c, left + 48, y + 63 + i * 84, 30, '#2b2a33', { bold: true, max: w - 96 });
      });
    }
    y += bottomH + 30;
  }

  text(d.footer, W / 2, H - 40, 26, '#a39d94', { align: 'center' });
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not draw the week'))), 'image/png'));
}
