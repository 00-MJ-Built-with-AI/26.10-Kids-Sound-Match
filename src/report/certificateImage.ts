import { loadAvatar } from './wordsImage';

/**
 * A milestone certificate as a picture for the phone's share menu: her drawn character (or animal),
 * a big rosette, what she did and the date. Drawn on this device; nothing is uploaded.
 */
export interface CertificateData {
  rtl: boolean;
  /** "Certificate" */
  heading: string;
  /** Her name, if the parent typed one (never stored in the cloud). */
  name: string;
  /** "knows 10 words!" */
  line: string;
  /** The big number or emoji in the rosette. */
  badge: string;
  date: string;
  footer: string;
  avatar: { animal: string; color: string; picture?: string };
  /** The rosette's colour. */
  color: string;
}

const W = 1080;
const H = 1350;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans Arabic', Tahoma, sans-serif";
const EMOJI = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";

export async function renderCertificate(d: CertificateData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.direction = d.rtl ? 'rtl' : 'ltr';
  const text = (s: string, y: number, size: number, color: string, bold = false, max = W - 220) => {
    ctx.font = `${bold ? '800 ' : ''}${size}px ${FONT}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let out = s;
    while (out.length > 1 && ctx.measureText(out).width > max) out = out.slice(0, -2) + '…';
    ctx.fillText(out, W / 2, y);
  };
  const star = (cx: number, cy: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  };

  // Paper, a soft glow and a double golden frame.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#fffaf0');
  bg.addColorStop(1, '#fff1dc');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#e8b94a';
  ctx.lineWidth = 14;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 4;
  ctx.strokeRect(68, 68, W - 136, H - 136);
  // Confetti stars around the edge.
  const confetti = ['#f05a8c', '#5b8def', '#7ed0b5', '#f7c948', '#b48cf0', '#f2894a'];
  for (let i = 0; i < 26; i++) {
    // Top and sides only: the date and the app's name sit at the bottom.
    const side = [0, 2, 3][i % 3];
    const t = ((i * 37) % 100) / 100;
    const x = side < 2 ? 110 + t * (W - 220) : side === 2 ? 110 : W - 110;
    const y = side === 0 ? 110 : 160 + t * (H - 420);
    star(x, y, 12 + (i % 3) * 5, confetti[i % confetti.length]);
  }

  text(d.heading, 190, 74, '#b07a12', true);

  // Her picture in a circle on her colour.
  const cy = 420;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(W / 2, cy, 170, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = d.avatar.color;
  ctx.beginPath();
  ctx.arc(W / 2, cy, 156, 0, Math.PI * 2);
  ctx.fill();
  const pic = d.avatar.picture ? await loadAvatar(d.avatar.picture) : null;
  if (pic) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, cy, 156, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(pic, W / 2 - 156, cy - 156, 312, 312);
    ctx.restore();
  } else {
    ctx.font = `160px ${EMOJI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.avatar.animal, W / 2, cy + 10);
  }

  if (d.name) text(d.name, 680, 84, '#2b2a33', true);
  text(d.line, d.name ? 780 : 700, 56, '#2b2a33', true);

  // The rosette: ribbons, a scalloped disc, the badge.
  const ry = 950;
  ctx.fillStyle = d.color;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(W / 2 + dir * 30, ry + 40);
    ctx.lineTo(W / 2 + dir * 80, ry + 165);
    ctx.lineTo(W / 2 + dir * 45, ry + 148);
    ctx.lineTo(W / 2 + dir * 18, ry + 175);
    ctx.lineTo(W / 2 + dir * -10, ry + 60);
    ctx.fill();
  }
  ctx.beginPath();
  for (let i = 0; i < 48; i++) {
    const a = (Math.PI * 2 * i) / 48;
    const r = i % 2 ? 112 : 124;
    ctx.lineTo(W / 2 + Math.cos(a) * r, ry + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(W / 2, ry, 92, 0, Math.PI * 2);
  ctx.fill();
  const isNumber = /^\d+$/.test(d.badge);
  ctx.font = isNumber ? `800 92px ${FONT}` : `96px ${EMOJI}`;
  ctx.fillStyle = d.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(d.badge, W / 2, ry + 6);

  text(d.date, 1172, 38, '#6b6874');
  text(d.footer, 1232, 28, '#a39d94');

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not draw the certificate'))), 'image/png'),
  );
}
