// Pictures for the newer games: the Home tiles (finger painting, make music, hide and seek, the
// sleep light, potty time), the room Bunny hides in, the places he hides (the Hide pack) and the
// Potty pack, in the app's cute style.
// Usage: node tools/art/draw-home-play.mjs
//   (writes public/assets/tiles/*.svg, public/backgrounds/hide-room.svg,
//    public/assets/packs/{hide,potty}/*.svg and their manifests)
import fs from 'node:fs';
import path from 'node:path';
import { BLUSH, C, E, INK, L, P, PACKS, R, file, heartPath, sparkle, tile, zee } from './child-lib.mjs';

const card = (bg, body, css = '') => file(tile(bg) + body, css);
const face = (x, y, s = 1) =>
  C(x - 14 * s, y, 4.5 * s, INK, 0) + C(x + 14 * s, y, 4.5 * s, INK, 0) + L(`M${x - 8 * s} ${y + 9 * s} q${8 * s} ${8 * s} ${16 * s} 0`, INK, 3.5 * s) +
  E(x - 24 * s, y + 10 * s, 6 * s, 4 * s, BLUSH, 0, ' opacity="0.7"') + E(x + 24 * s, y + 10 * s, 6 * s, 4 * s, BLUSH, 0, ' opacity="0.7"');
const star5 = (cx, cy, r, fill, ink = 3) => {
  const p = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  });
  return P(`M${p.join(' L')} Z`, fill, ink);
};
/** Bunny's ears and the top of his head, peeking up from behind something. */
const ears = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})">` +
  E(-16, -40, 11, 32, '#fff', 4.5, ' transform="rotate(-10 -16 -40)"') + E(-16, -40, 5, 22, '#FFC7D6', 0, ' transform="rotate(-10 -16 -40)"') +
  E(16, -40, 11, 32, '#fff', 4.5, ' transform="rotate(10 16 -40)"') + E(16, -40, 5, 22, '#FFC7D6', 0, ' transform="rotate(10 16 -40)"') +
  P('M-36 14 Q-36 -18 0 -18 Q36 -18 36 14 Z', '#fff') + C(-12, 0, 4, INK, 0) + C(12, 0, 4, INK, 0) +
  '</g>';
const MOTION = {
  wiggle: `.wig { animation: wig 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
    @keyframes wig { 0%,70%,100% { transform: rotate(0) } 80% { transform: rotate(-8deg) } 90% { transform: rotate(8deg) } }`,
  bob: `.bob { animation: bob 2.4s ease-in-out infinite; } .bob.b { animation-delay: .8s; }
    @keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }`,
  glow: `.glow { animation: glow 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes glow { 0%,100% { opacity: .5; transform: scale(1) } 50% { opacity: .9; transform: scale(1.08) } }`,
  note: `.note { animation: note 1.6s ease-out infinite; } .note.b { animation-delay: .8s; }
    @keyframes note { 0% { transform: translateY(8px); opacity: 0 } 30% { opacity: 1 } 100% { transform: translate(10px,-40px); opacity: 0 } }`,
  shine: `.shine { animation: shine 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; } .shine.b { animation-delay: 1.1s; }
    @keyframes shine { 0%,100% { transform: scale(.4); opacity: 0 } 50% { transform: scale(1); opacity: 1 } }`,
};
const shines = (list) => list.map(([x, y, s], i) => `<g class="shine${i % 2 ? ' b' : ''}">${sparkle(x, y, s, '#FFC531')}</g>`).join('');
const write = (dir, name, svg) => {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), svg);
};

/* ---------------------------------------------------------------- Home tiles */
const RAINBOW = ['#F05A8C', '#F7A14A', '#F7D046', '#7ED0B5', '#5B8DEF', '#B48CF0', '#F48FB1', '#E8B94A'];
const tiles = {
  paint: card(
    '#FFF1E6',
    // A rainbow squiggle, a palette with blobs, a brush.
    RAINBOW.slice(0, 5).map((c, i) => L(`M60 ${300 - i * 14} Q140 ${210 - i * 14} 200 ${270 - i * 14} T340 ${230 - i * 14}`, c, 12)).join('') +
      P('M120 110 C60 110 50 200 110 220 C140 230 140 200 170 205 C215 212 250 180 240 140 C228 100 170 108 120 110 Z', '#FFF3E0') + C(118, 150, 9, '#F7F2EE') +
      C(150, 132, 14, '#F05A8C', 3) + C(190, 140, 14, '#F7D046', 3) + C(210, 175, 14, '#5B8DEF', 3) + C(170, 190, 13, '#7ED0B5', 3) +
      `<g class="bob">${L('M260 70 L320 170', '#C98E5A', 14)}${P('M312 160 L336 196 Q338 214 322 214 Q306 206 304 180 Z', '#F05A8C', 3.5)}</g>`,
    MOTION.bob,
  ),
  music: card(
    '#E0F0FF',
    R(60, 270, 280, 22, 10, '#C98E5A') +
      RAINBOW.map((c, i) => R(70 + i * 33, 140 + i * 8, 26, 130 - i * 14 + 6, 8, c, 3.5)).join('') +
      `<g class="bob">${L('M90 120 L150 200', '#8A5A2B', 8)}${C(152, 204, 12, '#F05A8C', 3)}</g><g class="bob b">${L('M320 110 L260 190', '#8A5A2B', 8)}${C(258, 194, 12, '#5B8DEF', 3)}</g>` +
      `<g class="note">${L('M110 90 v-36 l22 -6 v32', INK, 4)}${C(104, 92, 8, INK, 0)}${C(126, 84, 8, INK, 0)}</g><g class="note b">${L('M300 80 v-30', INK, 4)}${C(294, 82, 8, INK, 0)}</g>`,
    MOTION.bob + MOTION.note,
  ),
  hide: card(
    '#E2F5DD',
    `<g class="wig">${ears(200, 190, 1.4)}</g>` +
      P('M60 220 Q60 196 90 196 L310 196 Q340 196 340 220 L340 310 L60 310 Z', '#5B8DEF') + R(40, 230, 50, 90, 18, '#4A78D6') + R(310, 230, 50, 90, 18, '#4A78D6') +
      R(80, 250, 240, 60, 14, '#7FA6F2') + L('M200 252 V308', INK, 3.5) + R(70, 310, 20, 26, 5, '#8A5A2B') + R(310, 310, 20, 26, 5, '#8A5A2B'),
    MOTION.wiggle,
  ),
  sleep: card(
    '#2E3560',
    `<g class="glow">${C(200, 200, 120, '#FFE08A', 0, ' opacity="0.25"')}</g>` +
      C(200, 200, 86, '#FFE9A8') + L('M166 196 q14 12 28 0 M206 196 q14 12 28 0', INK, 4.5) + L('M190 228 q10 8 20 0', INK, 4) + E(160, 222, 10, 6, BLUSH, 0, ' opacity="0.7"') + E(240, 222, 10, 6, BLUSH, 0, ' opacity="0.7"') +
      star5(80, 90, 14, '#FFE08A') + star5(320, 110, 11, '#FFE08A') + star5(310, 320, 9, '#fff') + star5(90, 320, 10, '#fff') +
      `<g>${zee(270, 120, 1.3, '#B9B3F2')}</g>`,
    MOTION.glow,
  ),
  potty: card(
    '#FFF4CC',
    E(200, 300, 120, 22, '#E8D6C0', 0) + P('M90 200 L310 200 Q306 300 250 306 L150 306 Q94 300 90 200 Z', '#F48FB1') + E(200, 200, 110, 26, '#FFC7D6') + E(200, 200, 78, 16, '#E87DA0', 0) +
      P('M296 214 Q350 214 344 250 Q338 270 300 262', 'none', 6) + face(200, 256, 1) + `<g class="shine">${star5(318, 96, 34, '#F7D046')}</g>` + shines([[90, 110, 0.5]]),
    MOTION.shine,
  ),
};
for (const [k, svg] of Object.entries(tiles)) write(path.join(process.cwd(), 'public', 'assets', 'tiles'), `${k}.svg`, svg);

/* ---------------------------------------------------------------- The room Bunny hides in */
// 1000 x 1000. The places he hides are in src/ui/kid/KidHide.tsx (keep both in step).
const room = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4EA"/><stop offset="1" stop-color="#FDE6EE"/></linearGradient></defs>
  <rect width="1000" height="640" fill="url(#wall)"/>
  ${Array.from({ length: 10 }, (_, i) => `<circle cx="${60 + i * 100}" cy="${80 + (i % 2) * 40}" r="6" fill="#F9CFE0"/>`).join('')}
  <rect y="640" width="1000" height="360" fill="#F1D9BF"/>
  ${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${680 + i * 44} H1000" stroke="#E6C9A8" stroke-width="3"/>`).join('')}
  <ellipse cx="500" cy="830" rx="380" ry="110" fill="#FFD9E6"/><ellipse cx="500" cy="830" rx="320" ry="80" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="20 18"/>
  <!-- window with a curtain (left top) -->
  ${R(80, 120, 240, 260, 20, '#BFE6FF', 6)}${L('M200 120 V380 M80 250 H320', '#fff', 10)}${C(260, 190, 26, '#FFE08A', 0)}
  ${P('M70 100 L190 100 Q170 260 196 420 L70 420 Z', '#F05A8C', 6)}${P('M330 100 L250 100 Q262 220 240 300 Q300 360 330 420 Z', '#F05A8C', 6)}${R(56, 88, 290, 22, 11, '#C98E5A', 5)}
  ${L('M100 160 Q120 280 96 400 M140 150 Q154 290 130 410', '#D9487C', 5)}
  <!-- door (right top) -->
  ${R(740, 150, 200, 490, 18, '#C98E5A', 6)}${R(765, 180, 150, 180, 12, '#B47A48', 5)}${R(765, 390, 150, 220, 12, '#B47A48', 5)}${C(905, 420, 14, '#F7D046', 5)}
  <!-- table with a long cloth (middle) -->
  ${P('M410 380 L600 380 L640 600 L370 600 Z', '#7ED0B5', 6)}${R(395, 360, 220, 30, 12, '#5FBF9F', 6)}${L('M380 560 L630 560', '#fff', 6, ' stroke-dasharray="14 12"')}
  ${E(505, 330, 44, 30, '#fff', 5)}${C(505, 300, 16, '#F05A8C', 4)}${L('M505 284 V262', '#3C9D4C', 5)}
  <!-- bed (left bottom) -->
  ${R(40, 600, 40, 260, 14, '#B48CF0', 6)}${R(60, 700, 360, 120, 24, '#fff', 6)}${P('M150 700 Q300 670 420 700 L420 800 L150 800 Z', '#F7D046', 6)}${E(110, 700, 52, 30, '#fff', 6)}
  ${R(70, 820, 20, 70, 6, '#8A5A2B', 5)}${R(392, 820, 20, 70, 6, '#8A5A2B', 5)}${L('M180 730 Q290 714 400 732', '#F7A14A', 5)}
  <!-- sofa (right) -->
  ${R(560, 640, 420, 170, 40, '#5B8DEF', 6)}${R(540, 700, 70, 150, 26, '#4A78D6', 6)}${R(930, 700, 70, 150, 26, '#4A78D6', 6)}${R(600, 740, 340, 90, 22, '#7FA6F2', 6)}
  ${L('M770 744 V826', INK, 5)}${R(600, 850, 26, 50, 8, '#8A5A2B', 5)}${R(914, 850, 26, 50, 8, '#8A5A2B', 5)}${E(640, 700, 40, 32, '#F7D046', 5)}
  <!-- toy box (front middle) -->
  ${R(380, 870, 260, 120, 18, '#F7A14A', 6)}${R(366, 850, 288, 36, 14, '#F05A8C', 6)}${star5(510, 940, 26, '#F7D046', 5)}
  ${C(420, 850, 22, '#7ED0B5', 5)}${R(560, 822, 40, 40, 8, '#5B8DEF', 5)}
</svg>
`;
write(path.join(process.cwd(), 'public', 'backgrounds'), 'hide-room.svg', room);

/* ---------------------------------------------------------------- The Hide pack: the places */
const spots = {
  bed: ['Under the bed', 'تحت التخت', card('#F3E6FF', R(60, 220, 280, 80, 20, '#fff') + P('M130 220 Q240 196 340 220 L340 290 L130 290 Z', '#F7D046') + E(100, 220, 44, 26, '#fff') + R(40, 160, 34, 190, 12, '#B48CF0') + R(60, 300, 16, 50, 5, '#8A5A2B') + R(320, 300, 16, 50, 5, '#8A5A2B') + `<g class="wig">${ears(200, 350, 0.95)}</g>`, MOTION.wiggle)],
  curtain: ['Behind the curtain', 'ورا البرداية', card('#E0F0FF', R(80, 70, 240, 230, 18, '#BFE6FF') + P('M70 60 L190 60 Q170 210 196 340 L70 340 Z', '#F05A8C') + P('M330 60 L240 60 Q258 200 236 260 Q290 300 330 340 Z', '#F05A8C') + R(56, 48, 290, 20, 10, '#C98E5A') + `<g class="wig">${ears(132, 362, 0.9)}</g>`, MOTION.wiggle)],
  door: ['Behind the door', 'ورا الباب', card('#FFF1E6', R(110, 50, 180, 320, 16, '#C98E5A') + R(132, 76, 136, 120, 10, '#B47A48') + R(132, 216, 136, 130, 10, '#B47A48') + C(262, 220, 12, '#F7D046') + `<g class="wig">${ears(330, 180, 0.95)}</g>`, MOTION.wiggle)],
  sofa: ['Behind the sofa', 'ورا الكنباية', tiles.hide],
  box: ['In the box', 'جوّا الصندوق', card('#FFF4CC', `<g class="wig">${ears(200, 190, 0.9)}</g>` + R(80, 190, 240, 140, 18, '#F7A14A') + R(66, 170, 268, 36, 14, '#F05A8C') + star5(200, 266, 30, '#F7D046'), MOTION.wiggle)],
  table: ['Under the table', 'تحت الطاولة', card('#DDF6F3', R(70, 120, 260, 26, 10, '#5FBF9F') + P('M90 140 L310 140 L340 320 L60 320 Z', '#7ED0B5') + L('M70 290 L330 290', '#fff', 6, ' stroke-dasharray="14 12"') + `<g class="wig">${ears(200, 352, 0.9)}</g>`, MOTION.wiggle)],
};
const hideDir = path.join(PACKS, 'hide');
for (const [k, [, , svg]] of Object.entries(spots)) write(hideDir, `${k}.svg`, svg);
write(
  hideDir,
  'manifest.json',
  JSON.stringify(
    {
      pack_id: 'hide',
      pack_version: 1,
      schema_version: 1,
      order: 6.87,
      name: { en: 'Hide and seek', ar: 'الغمّيضة' },
      own_game: true,
      in_mix: false,
      items: Object.entries(spots).map(([k, [en, ar]]) => ({
        item_key: `hide_${k}`,
        name: { en, ar },
        image: `hide/${k}.svg`,
        name_audio: { en: `hide/hide_${k}_name_en.mp3`, ar: `hide/hide_${k}_name_ar.mp3` },
      })),
    },
    null,
    2,
  ) + '\n',
);

/* ---------------------------------------------------------------- The Potty pack */
const potty = {
  potty: ['Potty', 'نونيّة', tiles.potty],
  pants: [
    'Big girl pants',
    'كلسون',
    card('#FDE9F0', P('M90 120 L310 120 L300 200 Q260 300 200 260 Q140 300 100 200 Z', '#fff') + R(90, 112, 220, 24, 10, '#F48FB1') + [[150, 180], [220, 170], [250, 220], [180, 220]].map(([x, y]) => P(heartPath(x, y, 0.6), '#F05A8C', 2.5)).join('') + shines([[330, 90, 0.5], [70, 280, 0.45]]), MOTION.shine),
  ],
  paper: [
    'Toilet paper',
    'ورق تواليت',
    card('#E0F0FF', E(200, 130, 90, 40, '#fff') + P('M110 130 L110 270 Q200 300 290 270 L290 130', '#fff') + E(200, 130, 30, 14, '#C9CED6') + P('M290 200 L330 200 L330 350 L290 330 Z', '#fff', 4.5) + face(200, 210, 1), ''),
  ],
  flush: [
    'Flush',
    'شطف',
    card('#DDF6F3', R(120, 60, 160, 100, 16, '#fff') + R(240, 76, 40, 14, 7, '#C9CED6') + P('M110 170 L290 170 Q300 280 240 300 L240 340 L160 340 L160 300 Q100 280 110 170 Z', '#fff') + E(200, 172, 92, 20, '#BFE6FF') + `<g class="bob">${P('M160 160 q20 -30 40 0 q20 -30 40 0', 'none', 5)}</g>` + face(200, 250, 0.9), MOTION.bob),
  ],
  sticker: ['Star sticker', 'نجمة', card('#FFF4CC', `<g class="shine">${star5(200, 200, 130, '#F7D046', 6)}</g>` + face(200, 214, 1.3) + shines([[80, 90, 0.6], [330, 320, 0.5], [320, 90, 0.4]]), MOTION.shine)],
};
const pottyDir = path.join(PACKS, 'potty');
for (const [k, [, , svg]] of Object.entries(potty)) write(pottyDir, `${k}.svg`, svg);
write(
  pottyDir,
  'manifest.json',
  JSON.stringify(
    {
      pack_id: 'potty',
      pack_version: 1,
      schema_version: 1,
      order: 6.88,
      name: { en: 'Potty time', ar: 'وقت النونيّة' },
      own_game: true,
      in_mix: false,
      items: Object.entries(potty).map(([k, [en, ar]]) => ({
        item_key: `potty_${k}`,
        name: { en, ar },
        image: `potty/${k}.svg`,
        name_audio: { en: `potty/potty_${k}_name_en.mp3`, ar: `potty/potty_${k}_name_ar.mp3` },
      })),
    },
    null,
    2,
  ) + '\n',
);
console.log('draw-home-play: wrote 5 tiles, the room, 6 hiding places and 5 potty pictures');
