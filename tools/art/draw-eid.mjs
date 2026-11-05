// Ramadan and Eid: the Eid pack's pictures (a lantern, the crescent, dates, ka'ak, eidiyye...) in the
// app's cute style, and the garlands hung over the games and Home in season.
// Usage: node tools/art/draw-eid.mjs
//   (writes public/assets/packs/eid/*.svg and public/backgrounds/season-{ramadan,eid}.svg)
import fs from 'node:fs';
import path from 'node:path';
import { BLUSH, C, E, INK, L, P, PACKS, R, file, sparkle, tile } from './child-lib.mjs';

const card = (bg, body, css = '') => file(tile(bg) + body, css);
/** A little happy face (the app's food and things smile). */
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
/** A crescent opening to the right: tips at ±60° on the outer circle, a shallower inner curve. */
const crescent = (cx, cy, r, fill, ink = 4) => {
  const tx = (cx + r * 0.5).toFixed(1);
  const top = (cy - r * 0.866).toFixed(1);
  const bottom = (cy + r * 0.866).toFixed(1);
  return P(`M${tx} ${top} A${r} ${r} 0 1 0 ${tx} ${bottom} A${r * 0.9} ${r * 0.9} 0 0 1 ${tx} ${top} Z`, fill, ink);
};
/** A Ramadan lantern (fanoos): cap, coloured glass, a warm light inside. */
const lantern = (x, y, s, glass = ['#F05A8C', '#7ED0B5', '#F7D046'], cls = 'glow') =>
  `<g transform="translate(${x} ${y}) scale(${s})">` +
  C(0, -112, 10, 'none', 4) +
  P('M-34 -70 L0 -104 L34 -70 Z', '#E8B94A') +
  R(-42, -72, 84, 14, 6, '#D9A238') +
  P('M-40 -58 L-52 20 L-30 70 L30 70 L52 20 L40 -58 Z', '#F6C85F') +
  `<g class="${cls}">` +
  P('M-28 -50 L-38 18 L-22 58 L-6 58 L-6 -50 Z', glass[0], 3) +
  P('M6 -50 L6 58 L22 58 L38 18 L28 -50 Z', glass[1], 3) +
  E(0, 6, 10, 16, '#FFF4C2', 0) +
  '</g>' +
  L('M-46 20 H46', INK, 3.5) +
  R(-34, 66, 68, 14, 6, '#D9A238') +
  P('M-16 80 L0 100 L16 80 Z', '#E8B94A') +
  '</g>';

const MOTION = {
  swing: `.swing { animation: swing 2.6s ease-in-out infinite; transform-origin: 200px 20px; }
    @keyframes swing { 0%,100% { transform: rotate(-5deg) } 50% { transform: rotate(5deg) } }
    .glow { animation: glow 1.4s ease-in-out infinite alternate; }
    @keyframes glow { from { opacity: .75 } to { opacity: 1 } }`,
  twinkle: `.tw { animation: tw 2s ease-in-out infinite; } .tw.b { animation-delay: .7s; } .tw.c { animation-delay: 1.4s; }
    @keyframes tw { 0%,100% { opacity: 1 } 50% { opacity: .25 } }`,
  bob: `.bob { animation: bob 2.4s ease-in-out infinite; } .bob.b { animation-delay: .8s; } .bob.c { animation-delay: 1.6s; }
    @keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }`,
  shine: `.shine { animation: shine 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .shine.b { animation-delay: 1.1s; }
    @keyframes shine { 0%,100% { transform: scale(.4); opacity: 0 } 50% { transform: scale(1); opacity: 1 } }`,
  beat: `.beat { animation: beat 1.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes beat { 0%,100% { transform: scale(1) } 15% { transform: scale(1.12) } 30% { transform: scale(1) } }`,
  tap: `.stick { animation: tap .5s ease-in-out infinite alternate; transform-origin: 300px 120px; }
    @keyframes tap { from { transform: rotate(-8deg) } to { transform: rotate(10deg) } }
    .note { animation: note 1s ease-out infinite; } .note.b { animation-delay: .5s; }
    @keyframes note { 0% { transform: translateY(8px); opacity: 0 } 30% { opacity: 1 } 100% { transform: translate(10px,-40px); opacity: 0 } }`,
};
const shines = (list) => list.map(([x, y, s], i) => `<g class="shine${i % 2 ? ' b' : ''}">${sparkle(x, y, s, '#FFC531')}</g>`).join('');

const items = {
  lantern: card('#FFF1D6', L('M200 0 V30', INK, 4) + `<g class="swing">${L('M200 20 V96', INK, 4)}${lantern(200, 214, 1.55)}</g>` + face(200, 222, 0.9) + shines([[90, 120, 0.5], [312, 300, 0.45]]), MOTION.swing + MOTION.shine),
  crescent: card(
    '#2E3560',
    `<g class="tw">${star5(96, 96, 14, '#FFE08A')}</g><g class="tw b">${star5(320, 300, 12, '#FFE08A')}</g><g class="tw c">${star5(300, 84, 9, '#fff')}</g><g class="tw b">${star5(84, 300, 8, '#fff')}</g>` +
      crescent(190, 200, 120, '#FFE08A') + face(120, 214, 0.8) + star5(282, 160, 26, '#FFE08A'),
    MOTION.twinkle,
  ),
  dates: card(
    '#FDF0E2',
    P('M70 236 Q76 330 200 334 Q324 330 330 236 Z', '#7ED0B5') + E(200, 236, 130, 30, '#5FBF9F') +
      [[140, 210], [200, 196], [260, 210], [170, 236], [232, 236]].map(([x, y], i) => E(x, y, 34, 22, i % 2 ? '#8A4B2A' : '#9C5632', 4, ` transform="rotate(${i % 2 ? 20 : -20} ${x} ${y})"`) + E(x - 10, y - 8, 10, 4, '#fff', 0, ' opacity="0.4"')).join('') +
      face(200, 290, 0.9) + shines([[330, 110, 0.5], [70, 130, 0.4]]),
    MOTION.shine,
  ),
  clothes: card(
    '#FDE9F0',
    L('M200 52 q0 -22 18 -22 q18 0 18 18 q0 14 -18 20 v14', INK, 5) + P('M110 112 L200 82 L290 112 Z', '#C9CED6') +
      P('M150 100 Q200 128 250 100 L262 170 L330 340 Q200 372 70 340 L138 170 Z', '#B48CF0') +
      P('M150 100 Q200 128 250 100 L256 140 Q200 162 144 140 Z', '#F05A8C') + C(200, 150, 10, '#F7D046', 3) +
      [[120, 300], [170, 320], [230, 322], [280, 302], [200, 260], [150, 230], [250, 232]].map(([x, y]) => C(x, y, 7, '#fff', 0)).join('') +
      R(288, 160, 50, 34, 8, '#F7D046', 3.5, ' transform="rotate(14 313 177)"') + shines([[90, 90, 0.5], [330, 250, 0.5], [70, 220, 0.35]]),
    MOTION.shine,
  ),
  eidiyye: card(
    '#E2F5DD',
    `<g class="bob">${R(130, 90, 140, 70, 10, '#7ED0B5', 4)}${L('M150 125 h100', '#3C9D4C', 4)}${C(200, 125, 16, '#B6E8D4', 3)}</g>` +
      R(80, 150, 240, 170, 22, '#F05A8C') + P('M80 160 L200 250 L320 160', 'none', 4.5) + C(200, 248, 26, '#F7D046') + `<g class="beat">${P('M200 262 c-14 -10 -20 -16 -20 -24 a10 10 0 0 1 20 -4 a10 10 0 0 1 20 4 c0 8 -6 14 -20 24 Z', '#E8304A', 2.5)}</g>` +
      `<g class="bob b">${E(310, 330, 30, 30, '#F7D046')}${E(310, 330, 18, 18, '#FFE58A', 0)}</g><g class="bob c">${E(88, 330, 26, 26, '#F7D046')}${E(88, 330, 15, 15, '#FFE58A', 0)}</g>`,
    MOTION.bob + MOTION.beat,
  ),
  kaak: card(
    '#FFF4CC',
    E(200, 280, 150, 40, '#fff') + E(200, 272, 150, 36, '#F4EEE6') +
      [[130, 236, 50], [270, 236, 50], [200, 196, 56]].map(([x, y, r]) =>
        C(x, y, r, '#E9B872') + C(x, y, r * 0.42, '#F4EEE6', 4) +
        Array.from({ length: 10 }, (_, i) => { const a = (Math.PI * 2 * i) / 10; return C(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72, 3.5, '#FFF8EC', 0); }).join(''),
      ).join('') + shines([[330, 110, 0.5], [70, 120, 0.45]]),
    MOTION.shine,
  ),
  maamoul: card(
    '#F3E6FF',
    E(200, 300, 150, 38, '#fff') +
      [[124, 250], [276, 250], [200, 218]].map(([x, y]) =>
        P(`M${x - 56} ${y + 30} Q${x - 56} ${y - 44} ${x} ${y - 46} Q${x + 56} ${y - 44} ${x + 56} ${y + 30} Z`, '#E7B979') +
        L(`M${x - 34} ${y + 26} Q${x - 30} ${y - 20} ${x} ${y - 34} M${x} ${y + 28} V${y - 38} M${x + 34} ${y + 26} Q${x + 30} ${y - 20} ${x} ${y - 34}`, '#B8833F', 4) +
        [[x - 20, y - 20], [x + 18, y - 6], [x - 8, y + 8], [x + 30, y - 28]].map(([a, b]) => C(a, b, 4, '#fff', 0, ' opacity="0.9"')).join(''),
      ).join('') + face(200, 236, 0.8) + shines([[330, 100, 0.5], [70, 110, 0.4]]),
    MOTION.shine,
  ),
  balloons: card(
    '#E0F0FF',
    [[140, 150, '#F05A8C', ''], [210, 120, '#F7D046', ' b'], [270, 160, '#7ED0B5', ' c']].map(([x, y, c, b]) =>
      `<g class="bob${b}">${L(`M${x} ${y + 70} q-14 60 10 150`, INK, 3)}${E(x, y, 52, 64, c)}${P(`M${x - 8} ${y + 62} l8 12 l8 -12 Z`, c, 3)}${E(x - 18, y - 24, 10, 16, '#fff', 0, ' opacity="0.5"')}</g>`,
    ).join('') + face(210, 128, 0.8),
    MOTION.bob,
  ),
  gift: card(
    '#FFE6D5',
    R(90, 170, 220, 170, 18, '#5B8DEF') + R(76, 136, 248, 52, 14, '#7FA6F2') + R(182, 136, 36, 204, 0, '#F05A8C', 4) +
      `<g class="beat">${P('M200 136 C150 70 110 110 150 136 Z', '#F05A8C')}${P('M200 136 C250 70 290 110 250 136 Z', '#F05A8C')}${C(200, 134, 14, '#E8304A')}</g>` +
      face(136, 262, 0.8) + shines([[340, 100, 0.55], [60, 120, 0.45], [344, 300, 0.4]]),
    MOTION.beat + MOTION.shine,
  ),
  mosque: card(
    '#DDF6F3',
    `<g class="tw">${star5(90, 90, 12, '#FFC531')}</g><g class="tw b">${star5(300, 70, 10, '#FFC531')}</g>` +
      R(300, 120, 40, 230, 8, '#fff') + P('M296 120 L320 74 L344 120 Z', '#7ED0B5') + crescent(320, 56, 12, '#F7D046', 3) +
      R(100, 220, 200, 130, 10, '#fff') + P('M110 224 Q110 120 200 110 Q290 120 290 224 Z', '#7ED0B5') + L('M200 110 V86', INK, 4) + crescent(200, 74, 12, '#F7D046', 3) +
      P('M176 350 V300 Q200 270 224 300 V350 Z', '#5FBF9F') + P('M124 290 Q140 266 156 290 V320 H124 Z', '#B6E8D4', 3.5) + P('M244 290 Q260 266 276 290 V320 H244 Z', '#B6E8D4', 3.5) +
      R(60, 344, 300, 16, 6, '#C9EBB8'),
    MOTION.twinkle,
  ),
  drum: card(
    '#FCE4F4',
    E(190, 300, 110, 30, '#C98E5A') + R(80, 200, 220, 100, 0, '#E8504A', 0) + L('M80 200 V300 M300 200 V300', INK, 4.5) +
      L('M90 210 L130 290 L170 210 L210 290 L250 210 L290 290', '#F7D046', 6) + E(190, 200, 110, 30, '#FFF3E0') +
      `<g class="stick">${L('M300 120 L220 196', '#8A5A2B', 12)}${C(216, 200, 14, '#F05A8C')}</g>` +
      `<g class="note">${L('M90 150 v-40 l24 -8 v36', INK, 4)}${C(84, 152, 8, INK, 0)}${C(108, 142, 8, INK, 0)}</g><g class="note b">${L('M330 210 v-30', INK, 4)}${C(324, 212, 8, INK, 0)}</g>` +
      face(190, 254, 0.8),
    MOTION.tap,
  ),
  qatayef: card(
    '#E2F4E2',
    E(200, 300, 150, 36, '#fff') +
      [[130, 250, -10], [270, 250, 10], [200, 214, 0]].map(([x, y, r]) =>
        `<g transform="rotate(${r} ${x} ${y})">${E(x, y - 6, 48, 20, '#FFF8EC', 4)}${C(x, y - 14, 8, '#7FB85A', 0)}${C(x - 14, y - 10, 5, '#7FB85A', 0)}${P(`M${x - 62} ${y} Q${x} ${y - 30} ${x + 62} ${y} Q${x + 60} ${y + 52} ${x} ${y + 54} Q${x - 60} ${y + 52} ${x - 62} ${y} Z`, '#E9B872')}${L(`M${x - 40} ${y + 30} q40 14 80 0`, '#C98E3F', 3)}</g>`,
      ).join('') + face(200, 244, 0.8) + shines([[332, 110, 0.5], [70, 120, 0.4]]),
    MOTION.shine,
  ),
};

const NAMES = {
  lantern: ['Lantern', 'فانوس'],
  crescent: ['Crescent moon', 'هلال'],
  dates: ['Dates', 'تمر'],
  clothes: ['New clothes', 'أواعي العيد'],
  eidiyye: ['Eid money', 'عيدية'],
  kaak: ["Ka'ak", 'كعك'],
  maamoul: ["Ma'amoul", 'معمول'],
  balloons: ['Balloons', 'بالونات'],
  gift: ['Present', 'هدية'],
  mosque: ['Mosque', 'جامع'],
  drum: ['Drum', 'طبل'],
  qatayef: ['Qatayef', 'قطايف'],
};

const dir = path.join(PACKS, 'eid');
fs.mkdirSync(dir, { recursive: true });
for (const [k, svg] of Object.entries(items)) fs.writeFileSync(path.join(dir, `${k}.svg`), svg);

// The manifest: names and pictures (the phone reads the names until they're recorded).
const manifest = path.join(dir, 'manifest.json');
const old = fs.existsSync(manifest) ? JSON.parse(fs.readFileSync(manifest, 'utf8')) : {};
fs.writeFileSync(
  manifest,
  JSON.stringify(
    {
      pack_id: 'eid',
      pack_version: 1,
      schema_version: 1,
      order: old.order ?? 15,
      name: { en: 'Ramadan and Eid', ar: 'رمضان والعيد' },
      in_mix: false,
      items: Object.entries(NAMES).map(([k, [en, ar]]) => ({
        item_key: `eid_${k}`,
        name: { en, ar },
        image: `eid/${k}.svg`,
        name_audio: { en: `eid/eid_${k}_name_en.mp3`, ar: `eid/eid_${k}_name_ar.mp3` },
      })),
    },
    null,
    2,
  ) + '\n',
);

/* ---------------------------------------------------------------- garlands */
// One 800 × 260 piece, repeated across the top: a string with lanterns, crescents and stars
// (Ramadan) or lanterns and little flags (Eid).
const BG = path.join(process.cwd(), 'public', 'backgrounds');
const garland = (eid) => {
  const sag = (x) => 14 + 60 * Math.sin((Math.PI * x) / 800);
  const flags = eid
    ? Array.from({ length: 12 }, (_, i) => {
        const x = 30 + i * 64;
        const y = sag(x);
        const c = ['#F05A8C', '#F7D046', '#7ED0B5', '#5B8DEF', '#B48CF0'][i % 5];
        return i % 4 === 1 ? '' : P(`M${x - 18} ${y - 2} L${x + 18} ${y + 2} L${x} ${y + 40} Z`, c, 3);
      }).join('')
    : '';
  const hangers = [130, 400, 670]
    .map((x, i) => {
      const y = sag(x);
      const len = [30, 40, 30][i];
      const thing =
        i === 1 || eid
          ? lantern(x, y + len + 62, 0.55, i === 1 ? ['#F05A8C', '#7ED0B5'] : ['#5B8DEF', '#F7D046'])
          : i === 0
            ? crescent(x, y + len + 30, 26, '#FFE08A', 3)
            : star5(x, y + len + 26, 22, '#FFE08A', 3);
      return `<g class="sway s${i}">${L(`M${x} ${y} V${y + len + (i === 1 || eid ? 6 : 4)}`, INK, 3)}${thing}</g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 260">
  <style>
  .sway { animation: sway 3s ease-in-out infinite; transform-box: view-box; }
  .s0 { transform-origin: 130px 40px; } .s1 { transform-origin: 400px 74px; animation-delay: .8s; } .s2 { transform-origin: 670px 40px; animation-delay: 1.6s; }
  @keyframes sway { 0%,100% { transform: rotate(-4deg) } 50% { transform: rotate(4deg) } }
  .glow { animation: glow 1.4s ease-in-out infinite alternate; }
  @keyframes glow { from { opacity: .75 } to { opacity: 1 } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
  </style>
  ${L(`M0 14 Q400 134 800 14`, '#C99A5B', 4)}${flags}${hangers}
</svg>
`;
};
fs.writeFileSync(path.join(BG, 'season-ramadan.svg'), garland(false));
fs.writeFileSync(path.join(BG, 'season-eid.svg'), garland(true));
console.log(`draw-eid: wrote ${Object.keys(items).length} pictures and 2 garlands`);
