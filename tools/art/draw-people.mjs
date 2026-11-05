// Family and Jobs in the cute whole-child style (bigger heads, shiny eyes, soft outlines), replacing
// the older circle drawings. Grown-ups have a slightly smaller head and long trousers or a dress.
// Usage: node tools/art/draw-people.mjs   (writes public/assets/packs/{family,jobs}/*.svg)
import fs from 'node:fs';
import path from 'node:path';
import { C, E, INK, L, P, PACKS, R, at, file, heartPath, kid, sparkle, tile } from './child-lib.mjs';

const write = (pack, key, svg) => fs.writeFileSync(path.join(PACKS, pack, `${key}.svg`), svg);
const GREY = '#C9CBD6';
const HAIR = '#3A2418';
const SWAY = `.alive { animation: alive 3.2s ease-in-out infinite; transform-box: view-box; transform-origin: 200px 390px; }
    @keyframes alive { 0%,100% { transform: rotate(-1.4deg) } 50% { transform: rotate(1.4deg) translateY(-4px) } }`;
const WAVE = { r: [[244, 192], [284, 226], [292, 170]] };

/** A grown-up: a smaller head, a little taller. */
const adult = (o) => kid({ headScale: 1.1, skin: 'medium', trousers: '#4A4A5A', shoe: '#3B3F4A', ...o });
/** One person, standing in the middle of the tile, gently swaying. */
const person = (bg, body, extra = '') => file(tile(bg) + `<g class="alive">${at(20, 18, 0.9, body)}</g>` + extra, SWAY);

/* ------------------------------------------------------------ Family */
const family = {
  mama: person('#FFE3EC', adult({ hair: 'long', hairColor: HAIR, skin: 'light', shirt: '#F05A8C', skirt: '#F05A8C', expr: 'smile', lashes: true, pose: 'wave', hands: { r: 'open' } })),
  baba: person('#E0F0FF', adult({ hair: 'short', hairColor: HAIR, beard: HAIR, shirt: '#4C9BE8', expr: 'smile' })),
  grandma: person('#F3E6FF', adult({ hair: 'bun', hairColor: GREY, glasses: true, skin: 'light', shirt: '#B48CF0', skirt: '#8A6BC8', expr: 'smile', lashes: true })),
  grandpa: person(
    '#E2F5DD',
    adult({ hair: 'bald', hairColor: GREY, beard: GREY, glasses: true, shirt: '#7ED0B5', trousers: '#6B6F80', expr: 'smile', pose: 'hug' }) +
      L('M278 220 V380 M278 220 q-2 -26 22 -24', '#A9714A', 10),
  ),
  brother: person('#FFF1C9', kid({ hair: 'short', skin: 'medium', shirt: '#E8504A', expr: 'happy', pose: 'up' }) + `<g transform="translate(200 240)">${sparkle(0, 0, 1.6, '#FFE08A')}</g>`),
  sister: person('#FFE6D5', kid({ hair: 'pigtails', skin: 'light', shirt: '#F7A14A', shorts: '#7A4FD1', expr: 'happy', lashes: true, pose: 'wave', hands: { r: 'open' } })),
  baby: file(
    tile('#E0F0FF') +
      `<g class="alive">${at(70, 60, 0.75, kid({ hair: 'short', skin: 'light', shirt: '#fff', shorts: '#fff', barefoot: true, expr: 'happy', headScale: 1.45, sleeveless: false }))}</g>` +
      `<g transform="rotate(-30 300 300)">${R(282, 250, 40, 80, 14, '#fff') + R(286, 286, 32, 40, 12, '#FFF6E8', 0) + R(284, 236, 36, 18, 6, '#F05A8C') + P('M294 236 Q296 216 302 216 Q308 216 310 236 Z', '#F7D046')}</g>`,
    SWAY,
  ),
  uncle: person('#DDF6F3', adult({ hair: 'curly', hairColor: HAIR, moustache: HAIR, shirt: '#3C9D4C', expr: 'smile' })),
  aunt: person('#FCE4F4', adult({ hair: 'bob', hairColor: '#5A3A28', band: '#F7D046', skin: 'light', shirt: '#7ED0B5', skirt: '#4F9C86', expr: 'smile', lashes: true })),
  aunt_paternal: person('#FFF1C9', adult({ hair: 'long', hairColor: '#2E1B12', glasses: true, shirt: '#F5B82E', skirt: '#F5B82E', expr: 'smile', lashes: true, pose: 'wave', hands: { r: 'open' } })),
  uncle_maternal: person('#FFE6D5', adult({ hair: 'short', hairColor: HAIR, glasses: true, shirt: '#F28C38', expr: 'smile' })),
  cousin_boy: person(
    '#E2F5DD',
    kid({ hair: 'curly', skin: 'medium', shirt: '#3DAA5C', shorts: '#F2B533', expr: 'happy', pose: 'hips' }) +
      `${C(300, 340, 26, '#fff')}${P('M300 326 l12 9 l-5 14 h-14 l-5 -14 Z', INK, 0)}`,
  ),
  cousin_girl: person('#F3E6FF', kid({ hair: 'bob', band: '#F05A8C', skin: 'medium', shirt: '#B48CF0', shorts: '#F05A8C', expr: 'happy', lashes: true, pose: 'up' })),
  friend: file(
    tile('#FFF4CC') +
      `<g class="alive">${at(-36, 40, 0.78, kid({ hair: 'pigtails', skin: 'light', shirt: '#F05A8C', expr: 'happy', lashes: true, pose: 'wave' }))}${at(116, 40, 0.78, kid({ hair: 'short', skin: 'brown', shirt: '#5B8DEF', expr: 'happy', pose: 'wave' }))}</g>` +
      `<g class="alive">${P(heartPath(200, 70, 1.6), '#E8304A', 3.5)}</g>`,
    SWAY,
  ),
};

/* ------------------------------------------------------------ Jobs */
const man = (o) => adult({ hair: 'short', hairColor: HAIR, expr: 'smile', ...o });
const jobs = {
  doctor: person('#E0F0FF', man({ coat: '#fff', shirt: '#9CC9F2', hat: 'mirror' }) + L('M176 196 Q170 250 200 262 Q230 250 224 196', INK, 5) + C(200, 270, 10, '#C9CED6', 3)),
  police: person('#E0F0FF', man({ shirt: '#2F4E9B', trousers: '#1F2F5E', hat: 'cap', hatColor: '#1F2F5E', hatBadge: true, badge: true, pose: 'wave', hands: { r: 'open' } })),
  firefighter: person(
    '#FFE6D5',
    man({ shirt: '#F7C948', trousers: '#F7C948', hat: 'helmet', hatColor: '#E8304A', stripe: '#C9CBD6', pose: 'cup' }) +
      L('M290 220 Q340 160 370 120', '#5B8DEF', 8, ' stroke-dasharray="4 10"') + C(372, 116, 10, '#9CC9F2', 0),
  ),
  cook: person('#FFF1C9', man({ shirt: '#fff', apron: '#F7F2EE', hat: 'chef', pose: 'cup' }) + E(312, 220, 46, 12, '#3B3F4A') + L('M268 222 H230', '#3B3F4A', 10) + E(312, 216, 16, 10, '#fff', 0) + C(312, 216, 6, '#F7C948', 0)),
  farmer: person('#E2F5DD', man({ shirt: '#F28C38', trousers: '#5B8DEF', hat: 'straw', pose: 'hug' }) + P('M150 250 Q200 290 250 250 L240 300 H160 Z', '#C98E5A') + L('M176 250 l-6 -24 M200 254 v-26 M224 250 l6 -24', '#3E8E41', 6) + C(176, 262, 0, 'none', 0)),
  pilot: person(
    '#E0F0FF',
    man({ shirt: '#fff', trousers: '#1F2F5E', hat: 'cap', hatColor: '#1F2F5E', badge: true }) +
      `<g transform="translate(310 90) rotate(-20)">${E(0, 0, 50, 12, '#fff') + P('M-10 0 L-30 -36 H-14 L10 0 Z', '#E8504A', 3) + P('M30 0 L40 -16 H48 L44 0 Z', '#E8504A', 3)}</g>`,
  ),
  builder: person('#FFF1C9', man({ shirt: '#F7A14A', trousers: '#5B8DEF', hat: 'hardhat', pose: 'wave' }) + R(300, 150, 16, 70, 4, '#A9714A') + R(284, 136, 48, 22, 4, '#7A8496') + R(40, 320, 60, 30, 4, '#E8504A') + R(40, 290, 60, 30, 4, '#E8504A')),
  teacher: person(
    '#E2F5DD',
    R(240, 60, 150, 110, 10, '#3E6E4A') + `<text x="315" y="130" text-anchor="middle" font-size="46" font-family="sans-serif" font-weight="700" fill="#fff">A B</text>` +
      man({ shirt: '#B48CF0', glasses: true, pose: 'wave', hands: { r: 'point' } }),
  ),
  astronaut: person('#E3E6FA', man({ shirt: '#fff', trousers: '#fff', shoe: '#C9CBD6', hat: 'space', badge: true }) + sparkle(60, 80, 1, '#FFE08A') + sparkle(350, 300, 0.8, '#FFE08A')),
  mechanic: person('#E0F0FF', man({ shirt: '#5B8DEF', trousers: '#5B8DEF', pose: 'cup' }) + L('M270 220 L330 160', '#B0B6C0', 10) + C(332, 156, 14, 'none', 6) + C(60, 330, 40, '#3B3F4A') + C(60, 330, 18, '#B0B6C0')),
  dentist: person('#DDF6F3', man({ coat: '#fff', shirt: '#7ED0B5', hat: 'mirror', pose: 'wave' }) + P('M60 280 C40 230 60 200 90 210 C110 216 120 216 140 210 C170 200 190 230 170 280 C160 320 140 330 130 290 C126 274 104 274 100 290 C90 330 70 320 60 280 Z', '#fff')),
  nurse: person('#FFE3EC', adult({ hair: 'bun', hairColor: HAIR, skin: 'light', shirt: '#9CC9F2', skirt: '#9CC9F2', lashes: true, expr: 'smile', hat: 'nurse', pose: 'wave' })),
  vet: person('#E2F5DD', man({ coat: '#fff', shirt: '#7ED0B5', pose: 'hug' }) + C(200, 248, 30, '#F7A14A') + C(186, 220, 10, '#F7A14A', 3) + C(214, 220, 10, '#F7A14A', 3) + C(192, 246, 3, INK, 0) + C(208, 246, 3, INK, 0)),
  baker: person('#FFF1C9', man({ shirt: '#fff', apron: '#F7F2EE', hat: 'chef', pose: 'cup' }) + E(318, 210, 50, 24, '#E7B06C') + L('M296 200 l8 16 M318 196 l8 16 M340 200 l8 16', '#C98E48', 4)),
  postman: person('#FFF1C9', man({ shirt: '#E8504A', trousers: '#2F4E9B', hat: 'cap', hatColor: '#E8504A', pose: 'cup' }) + R(284, 196, 70, 48, 6, '#fff') + P('M284 196 L319 222 L354 196', 'none', 4)),
  driver: person('#E0F0FF', man({ shirt: '#4C9BE8', hat: 'cap', hatColor: '#2F4E9B', pose: 'hug' }) + C(200, 262, 46, 'none', 12) + L('M200 216 V308 M154 262 H246', INK, 6)),
  fisherman: person('#DDF4FF', man({ shirt: '#F7C948', trousers: '#3E8E41', hat: 'straw', pose: 'cup' }) + L('M290 216 L370 80 L370 230', INK, 4) + P('M352 236 q18 -14 36 0 q-18 14 -36 0 Z M388 236 l10 -8 v16 Z', '#5DB7F5', 3)),
  barber: person('#FCE4F4', man({ shirt: '#fff', stripe: '#F05A8C', pose: 'wave', hands: { r: 'open' } }) + L('M300 100 l30 30 M330 100 l-30 30', '#7A8496', 6) + C(296, 96, 8, 'none', 4) + C(334, 96, 8, 'none', 4)),
  singer: person('#F3E6FF', man({ shirt: '#B48CF0', expr: 'sing', pose: 'cup' }) + R(274, 180, 14, 60, 6, '#3B3F4A') + C(281, 176, 14, '#6B7080') + `<text x="330" y="110" font-size="60" fill="#B48CF0" font-family="sans-serif">♪</text>`),
  carpenter: person('#FFE6D5', man({ shirt: '#3C9D4C', trousers: '#7A5A3A', pose: 'cup' }) + R(40, 300, 140, 26, 6, '#E2AE7A') + P('M260 200 L360 160 L370 180 L270 220 Z', '#B0B6C0') + R(250, 206, 30, 26, 8, '#A9714A')),
  electrician: person('#FFF4CC', man({ shirt: '#F7C948', trousers: '#2F4E9B', hat: 'hardhat', pose: 'wave' }) + C(80, 110, 34, '#FFE08A') + R(68, 140, 24, 20, 4, '#B0B6C0') + L('M80 70 v-20 M44 110 h-16 M116 110 h16', '#FFC531', 6)),
  plumber: person('#E0F0FF', man({ shirt: '#E8504A', trousers: '#2F4E9B', hat: 'cap', hatColor: '#E8504A', pose: 'cup' }) + L('M40 330 H120 V260', '#7A8496', 18) + L('M270 220 L330 160', '#7A8496', 10) + C(334, 154, 14, 'none', 6)),
  gardener: person('#E2F5DD', man({ shirt: '#7ED0B5', trousers: '#3E8E41', hat: 'straw', pose: 'cup' }) + P('M276 200 h56 l-6 50 h-44 Z', '#5B8DEF') + L('M332 210 l30 -20', '#5B8DEF', 8) + C(60, 330, 12, '#F05A8C') + C(90, 340, 12, '#FFE08A') + L('M60 342 v40 M90 352 v30', '#3E8E41', 5)),
  artist: person('#FCE4F4', man({ shirt: '#5B8DEF', apron: '#fff', pose: 'cup' }) + E(310, 210, 46, 32, '#F2D58A') + C(296, 200, 7, '#E8504A', 0) + C(316, 196, 7, '#5B8DEF', 0) + C(332, 210, 7, '#3E8E41', 0) + L('M60 120 L120 60', '#A9714A', 8) + C(124, 56, 8, '#E8504A', 0)),
  scientist: person('#EFE6FF', man({ coat: '#fff', shirt: '#B48CF0', glasses: true, pose: 'cup' }) + P('M296 160 h28 v40 l26 50 q4 12 -10 12 h-60 q-14 0 -10 -12 l26 -50 Z', '#fff') + P('M284 236 h72 l6 12 q4 12 -10 12 h-64 q-14 0 -10 -12 Z', '#7ED0B5', 0) + C(310, 140, 6, '#7ED0B5', 0) + C(324, 120, 5, '#7ED0B5', 0)),
};

let n = 0;
for (const [pack, set] of [['family', family], ['jobs', jobs]]) {
  for (const [key, svg] of Object.entries(set)) {
    write(pack, key, svg);
    n++;
  }
}
console.log(`draw-people: wrote ${n} pictures`);
