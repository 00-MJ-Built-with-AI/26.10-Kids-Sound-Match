// Pictures for Song time, My books, Bring me, Where did it go? and the Sound garden: their Home
// tiles, and the three cups the teddy hides under. Same cute style as draw-home-play.mjs.
// Usage: node tools/art/draw-new-games.mjs
//   (writes public/assets/tiles/{rhymes,daybook,bring,cups,garden}.svg and public/assets/tiles/cup_*.svg)
import fs from 'node:fs';
import path from 'node:path';
import { BLUSH, C, E, INK, L, P, R, file, sparkle, tile } from './child-lib.mjs';

const card = (bg, body, css = '') => file(tile(bg) + body, css);
const MOTION = {
  bob: `.bob { animation: bob 1.4s ease-in-out infinite; } .bob.b { animation-delay: .7s; }
    @keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }`,
  note: `.note { animation: note 2.4s ease-out infinite; } .note.b { animation-delay: 1.2s; }
    @keyframes note { 0% { transform: translateY(8px); opacity: 0 } 30% { opacity: 1 } 100% { transform: translateY(-26px); opacity: 0 } }`,
};
const face = (x, y, s = 1) =>
  C(x - 12 * s, y, 4 * s, INK, 0) + C(x + 12 * s, y, 4 * s, INK, 0) + L(`M${x - 7 * s} ${y + 8 * s} q${7 * s} ${7 * s} ${14 * s} 0`, INK, 3.2 * s) +
  E(x - 21 * s, y + 9 * s, 5 * s, 3.5 * s, BLUSH, 0, ' opacity="0.7"') + E(x + 21 * s, y + 9 * s, 5 * s, 3.5 * s, BLUSH, 0, ' opacity="0.7"');
const note = (x, y, c = INK) => L(`M${x} ${y} v-34 l20 -6 v30`, c, 4) + C(x - 6, y + 2, 8, c, 0) + C(x + 14, y - 8, 8, c, 0);

/** An upside-down cup, seen from the side, for the hiding game (no background). */
const cup = (fill, dark) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">` +
  P('M52 214 L76 40 Q78 26 92 26 L148 26 Q162 26 164 40 L188 214 Z', fill, 6) +
  R(36, 204, 168, 24, 12, dark, 6) +
  L('M92 52 L80 180', '#fff', 8, ' opacity="0.45"') +
  `<g transform="translate(0 6)">${face(120, 110, 1.2)}</g>` +
  `</svg>\n`;

const teddy = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})">` +
  C(-26, -50, 14, '#B5793F') + C(26, -50, 14, '#B5793F') + C(0, -26, 34, '#C98A4E') + E(0, 30, 34, 38, '#C98A4E') +
  E(0, -16, 14, 10, '#E8C49A', 3) + C(-11, -32, 4, INK, 0) + C(11, -32, 4, INK, 0) + C(0, -20, 4, INK, 0) +
  '</g>';
const smallCup = (x, y, fill, dark, lift = 0) =>
  `<g transform="translate(${x} ${y - lift})">${P('M-46 70 L-26 -60 Q-24 -70 -14 -70 L14 -70 Q24 -70 26 -60 L46 70 Z', fill, 5)}${R(-56, 62, 112, 18, 9, dark, 5)}</g>`;

const tiles = {
  rhymes: card(
    '#FFF0F6',
    // Two clapping hands with music notes rising.
    `<g class="bob">${E(150, 220, 46, 62, '#F7C6A3', 5, ' transform="rotate(-18 150 220)"')}${L('M128 182 l-6 -40 M146 176 l-2 -44 M164 178 l4 -40', INK, 4)}</g>` +
      `<g class="bob b">${E(250, 220, 46, 62, '#F7C6A3', 5, ' transform="rotate(18 250 220)"')}${L('M272 182 l6 -40 M254 176 l2 -44 M236 178 l-4 -40', INK, 4)}</g>` +
      L('M200 150 l0 -26 M180 156 l-14 -18 M220 156 l14 -18', '#FFC531', 6) +
      `<g class="note">${note(90, 120, '#F05A8C')}</g><g class="note b">${note(300, 110, '#5B8DEF')}</g>` +
      sparkle(330, 300, 0.7),
    MOTION.bob + MOTION.note,
  ),
  daybook: card(
    '#E8F4FF',
    // An open book: a photo of a little sun-lit scene on the left, lines and a heart on the right.
    P('M200 110 Q140 86 60 100 L60 300 Q140 288 200 310 Z', '#fff') +
      P('M200 110 Q260 86 340 100 L340 300 Q260 288 200 310 Z', '#fff') +
      R(82, 128, 100, 100, 10, '#9CD3F5', 4) + C(152, 156, 14, '#FFD35A', 3) + P('M82 228 L120 182 L150 210 L182 176 L182 228 Z', '#7CC67A', 4) +
      L('M222 140 h92 M222 168 h92 M222 196 h70', '#B9C6D6', 6) +
      P('M268 250 c-16 -22 -40 -2 -18 18 l18 14 l18 -14 c22 -20 -2 -40 -18 -18 Z', '#F05A8C', 3.5) +
      L('M200 110 V310', INK, 4) + L('M90 250 h80', '#B9C6D6', 6),
  ),
  bring: card(
    '#FFF4E0',
    // A cup held out in two little hands, with "come here" motion lines.
    P('M150 140 L250 140 L238 260 Q236 274 222 274 L178 274 Q164 274 162 260 Z', '#7ED0B5') +
      L('M250 166 q34 6 26 40 q-6 22 -32 18', INK, 5) +
      E(150, 252, 30, 22, '#F7C6A3') + E(250, 252, 30, 22, '#F7C6A3') +
      `<g class="bob">${L('M86 160 q-20 40 0 80 M60 140 q-30 60 0 120', '#F7A14A', 6)}${L('M314 160 q20 40 0 80 M340 140 q30 60 0 120', '#F7A14A', 6)}</g>` +
      sparkle(200, 96, 0.8),
    MOTION.bob,
  ),
  cups: card(
    '#EAF6EC',
    // The teddy peeking from under a lifted cup, between two others.
    teddy(200, 268, 0.72) + smallCup(90, 250, '#5B8DEF', '#4A78D6') + `<g class="bob">${smallCup(200, 250, '#F05A8C', '#D84679', 64)}</g>` + smallCup(310, 250, '#FFC531', '#E8A91C') +
      E(200, 340, 150, 10, '#C9DFC4', 0),
    MOTION.bob,
  ),
  garden: card(
    '#E6F7E4',
    // Flowers, a frog and a bell, with notes: tap anything and it sings.
    L('M100 330 V230 M200 330 V200 M300 330 V240', '#4FA35A', 7) +
      ['#F05A8C', '#FFC531', '#7A4FD1'].map((c, i) => [100, 200, 300][i]).map((x, i) => {
        const y = [230, 200, 240][i];
        const c = ['#F05A8C', '#FFC531', '#7A4FD1'][i];
        return [0, 72, 144, 216, 288].map((a) => E(x + Math.cos((a * Math.PI) / 180) * 22, y + Math.sin((a * Math.PI) / 180) * 22, 16, 12, c, 3.5, ` transform="rotate(${a} ${x + Math.cos((a * Math.PI) / 180) * 22} ${y + Math.sin((a * Math.PI) / 180) * 22})"`)).join('') + C(x, y, 12, '#FFE9A8', 3.5);
      }).join('') +
      `<g class="bob">${E(150, 330, 40, 26, '#7CC67A')}${C(132, 306, 12, '#fff')}${C(168, 306, 12, '#fff')}${C(132, 307, 5, INK, 0)}${C(168, 307, 5, INK, 0)}${L('M138 336 q12 8 24 0', INK, 4)}</g>` +
      `<g class="note">${note(260, 130, '#5B8DEF')}</g><g class="note b">${note(90, 120, '#F05A8C')}</g>`,
    MOTION.bob + MOTION.note,
  ),
  camera: card(
    '#E8F1FF',
    // A phone looking at a cup, with the viewfinder corners and a speech bubble naming it.
    R(70, 90, 180, 250, 26, '#3a3f4a') + R(84, 112, 152, 196, 12, '#CFE6FF', 0) +
      P('M128 236 L192 236 L188 288 Q187 296 179 296 L141 296 Q133 296 132 288 Z', '#7ED0B5', 3.5) + L('M192 248 q18 4 12 22 q-4 10 -14 9', INK, 3.5) +
      L('M96 128 v-10 h14 M224 128 v-10 h-14 M96 292 v10 h14 M224 292 v10 h-14', '#fff', 4) +
      C(160, 322, 8, '#5d6470', 0) +
      P('M250 110 Q250 80 280 80 L330 80 Q360 80 360 110 L360 140 Q360 170 330 170 L300 170 L276 196 L282 170 Q250 168 250 140 Z', '#fff') +
      '<g class="bob">' + face(305, 122, 1.1) + '</g>' + sparkle(320, 300, 0.8),
    MOTION.bob,
  ),
  mystory: card(
    '#FFF1E6',
    // An open storybook with a little family on one page and a cat on the other, and a star.
    P('M200 120 Q140 96 60 110 L60 300 Q140 288 200 310 Z', '#fff') + P('M200 120 Q260 96 340 110 L340 300 Q260 288 200 310 Z', '#fff') + L('M200 120 V310', INK, 4) +
      C(110, 190, 20, '#F7C6A3') + R(92, 210, 36, 50, 12, '#F05A8C', 3.5) + C(150, 206, 14, '#E8B48C') + R(138, 220, 26, 38, 10, '#5B8DEF', 3.5) +
      E(268, 230, 40, 30, '#F7A14A') + C(268, 186, 24, '#F7A14A') + P('M250 170 l-6 -22 l18 12 Z M286 170 l6 -22 l-18 12 Z', '#F7A14A', 3.5) + C(260, 184, 3.5, INK, 0) + C(276, 184, 3.5, INK, 0) +
      '<g class="bob">' + P('M200 40 l12 24 l26 4 l-19 18 l5 26 l-24 -13 l-24 13 l5 -26 l-19 -18 l26 -4 Z', '#FFC531', 3.5) + '</g>',
    MOTION.bob,
  ),
};

const dir = path.join(process.cwd(), 'public', 'assets', 'tiles');
fs.mkdirSync(dir, { recursive: true });
for (const [k, svg] of Object.entries(tiles)) fs.writeFileSync(path.join(dir, `${k}.svg`), svg);
const cups = { red: ['#F05A8C', '#D84679'], blue: ['#5B8DEF', '#4A78D6'], yellow: ['#FFC531', '#E8A91C'] };
for (const [k, [a, b]] of Object.entries(cups)) fs.writeFileSync(path.join(dir, `cup_${k}.svg`), cup(a, b));
console.log(`draw-new-games: ${Object.keys(tiles).length} tiles and ${Object.keys(cups).length} cups`);
