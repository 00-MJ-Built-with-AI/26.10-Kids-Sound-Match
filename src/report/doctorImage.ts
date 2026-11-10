/**
 * One page for a check-up or a speech therapist: plain counts and the milestones, drawn on this
 * device. Facts only: it never says "on track" or "behind".
 */
export interface DoctorPageData {
  rtl: boolean;
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  /** Short notes under the counts ("of these: 12 in Arabic games..."). */
  notes: string[];
  milestonesTitle: string;
  milestones: { text: string; date: string | null }[];
  footer: string;
}

const W = 1240;
const M = 70;
const ROW = 50;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans Arabic', Tahoma, sans-serif";

export async function renderDoctorImage(d: DoctorPageData): Promise<Blob> {
  const H = Math.max(1754, M + 150 + 190 + d.notes.length * 42 + 110 + d.milestones.length * ROW + 170);
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

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  text(d.title, M, M + 34, 54, '#20242c', { bold: true, max: W - 2 * M });
  text(d.subtitle, M, M + 104, 30, '#5b6270', { max: W - 2 * M });
  ctx.fillStyle = '#20242c';
  ctx.fillRect(M, M + 148, W - 2 * M, 3);

  // The counts: one box each.
  let y = M + 180;
  const gap = 20;
  const boxW = (W - 2 * M - gap * (d.stats.length - 1)) / d.stats.length;
  d.stats.forEach((s, i) => {
    const left = M + i * (boxW + gap);
    ctx.fillStyle = '#f2f4f7';
    ctx.beginPath();
    const at = d.rtl ? W - left - boxW : left;
    if (ctx.roundRect) ctx.roundRect(at, y, boxW, 160, 18);
    else ctx.rect(at, y, boxW, 160);
    ctx.fill();
    text(s.value, left + boxW / 2, y + 60, 68, '#20242c', { bold: true, align: 'center' });
    text(s.label, left + boxW / 2, y + 128, 25, '#5b6270', { align: 'center', max: boxW - 20 });
  });
  y += 190;
  for (const note of d.notes) {
    text(note, M, y + 14, 27, '#3a404b', { max: W - 2 * M });
    y += 42;
  }

  y += 30;
  text(d.milestonesTitle, M, y + 20, 36, '#20242c', { bold: true });
  y += 66;
  for (const m of d.milestones) {
    const box = x(M + 16);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#20242c';
    ctx.strokeRect(box - 15, y + 8, 30, 30);
    if (m.date) {
      ctx.beginPath();
      ctx.moveTo(box - 9, y + 23);
      ctx.lineTo(box - 2, y + 31);
      ctx.lineTo(box + 10, y + 14);
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    text(m.text, M + 50, y + 23, 26, '#20242c', { max: W - 2 * M - 230 });
    if (m.date) text(m.date, W - M, y + 23, 24, '#5b6270', { align: 'end' });
    y += ROW;
  }

  text(d.footer, W / 2, H - 56, 24, '#5b6270', { align: 'center', max: W - 2 * M });
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not draw the page'))), 'image/png'));
}
