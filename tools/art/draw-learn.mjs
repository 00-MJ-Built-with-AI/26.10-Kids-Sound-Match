// The Learn section: "Show me" (the girl and a boy each doing six things) and "In, on, under" (a ball
// and a toy box on short legs, a teddy and a bed). Same style as Do it with me.
// Usage: node tools/art/draw-learn.mjs   (writes public/assets/packs/learn/*.svg)
import fs from 'node:fs';
import path from 'node:path';
import { C, E, INK, L, P, PACKS, POSES, R, at, file, kid, sparkle, tile, zee } from './child-lib.mjs';

Object.assign(POSES, {
  eatUp: { l: [[156, 192], [146, 236], [152, 258]], r: [[244, 192], [266, 172], [218, 150]] },
  cupUp: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [262, 166], [224, 148]] },
  sink: { l: [[156, 192], [150, 238], [190, 262]], r: [[244, 192], [250, 238], [210, 262]] },
});

const GIRL = { lashes: true, skin: 'light', hair: 'bob', hairColor: '#3A2418', band: '#F05A8C', shirt: '#F7A14A', shorts: '#7A4FD1', shoe: '#5B8DEF', expr: 'smile' };
const BOY = { skin: 'medium', hair: 'short', hairColor: '#2B1A10', shirt: '#4C9BE8', shorts: '#2F4E9B', shoe: '#E8504A', expr: 'smile' };
const who = { girl: GIRL, boy: BOY };
const child = (base, o = {}) => kid({ ...base, ...o, hands: { ...(o.hands ?? {}) } });
const place = (body, x = 0, y = 26, sc = 0.9) => at(x + 20, y, sc, body);
const card = (bg, body, css = '') => file(tile(bg) + body, css);

const MOVE = {
  bob: `.bob { animation: bob 0.7s ease-in-out infinite; }
    @keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-18px) } }`,
  zee: `.zee { animation: zee 3s ease-out infinite; }
    .zee.b { animation-delay: 1.5s; }
    @keyframes zee { 0% { transform: translate(0,10px); opacity: 0 } 30% { opacity: 1 } 100% { transform: translate(18px,-34px); opacity: 0 } }`,
  drip: `.drip { animation: drip 0.9s linear infinite; }
    .drip.b { animation-delay: .45s; }
    @keyframes drip { from { transform: translateY(-10px); opacity: 1 } to { transform: translateY(30px); opacity: 0 } }`,
  wave: `.waveArm { animation: waveArm 1s ease-in-out infinite; transform-origin: 0 0; }
    @keyframes waveArm { 0%,100% { transform: rotate(0) } 50% { transform: rotate(-16deg) } }`,
};

const bowl = P('M114 250 Q118 284 152 286 Q186 284 190 250 Z', '#5B8DEF') + E(152, 250, 38, 8, '#F4C06A');
const spoon = L('M218 152 L242 196', '#B0B6C0', 6) + E(214, 146, 9, 6, '#C9CED6', 3);
const cup = `<g transform="rotate(-28 226 140)">${P('M210 120 L242 120 L238 160 L214 160 Z', '#7ED0B5')}${L('M242 130 q12 4 0 16', INK, 4)}</g>`;

const ACTIONS = {
  eat: ['#FFEFE2', (b) => place(child(b, { pose: 'eatUp', expr: 'shh', armsOver: true }) + bowl + spoon)],
  drink: ['#E2F4FB', (b) => place(child(b, { pose: 'cupUp', expr: 'shh', armsOver: true }) + cup)],
  sleep: [
    '#E3E6F7',
    (b) =>
      R(28, 262, 344, 64, 14, '#B07A52') + R(40, 336, 18, 40, 4, '#8A5A3A') + R(342, 336, 18, 40, 4, '#8A5A3A') + R(28, 236, 344, 40, 14, '#fff') +
      E(92, 230, 50, 22, '#fff') +
      `<g transform="translate(30 330) rotate(-90) scale(0.56)">${child(b, { pose: 'down', expr: 'asleep' })}</g>` +
      R(150, 196, 214, 74, 22, '#9CC9F2') + L('M170 214 q90 -16 180 0', '#fff', 4, ' opacity="0.6"') +
      `<g class="zee">${zee(150, 120, 1)}</g><g class="zee b">${zee(176, 96, 0.8)}</g>`,
    MOVE.zee,
  ],
  jump: [
    '#E3F2FF',
    (b) => E(200, 380, 64, 11, '#BFD6EA', 0) + `<g class="bob">${place(child(b, { pose: 'up', expr: 'happy' }), 0, -2)}</g>` + L('M110 330 l-20 10 M290 330 l20 10', '#8FB3D6', 5),
    MOVE.bob,
  ],
  wave: ['#EAF6EC', (b) => place(child(b, { pose: 'wave', expr: 'happy', hands: { r: 'open' } })) + sparkle(330, 90, 0.7)],
  wash: [
    '#E8F4F8',
    (b) =>
      place(child(b, { pose: 'sink', expr: 'smile' })) + R(96, 286, 208, 30, 12, '#E8EEF4') + R(186, 316, 28, 76, 6, '#D5DDE6', 3) +
      L('M200 210 v-24 h34', '#9AA6B4', 9) + `<g class="drip">${C(200, 232, 5, '#5DB7F5', 0)}</g><g class="drip b">${C(206, 236, 4, '#5DB7F5', 0)}</g>` +
      C(170, 272, 8, '#fff', 2.5) + C(232, 268, 7, '#fff', 2.5) + C(214, 280, 5, '#fff', 2.5),
    MOVE.drip,
  ],
};

const pictures = {};
for (const [name, base] of Object.entries(who)) {
  for (const [act, [bg, body, css]] of Object.entries(ACTIONS)) pictures[`${name}_${act}`] = card(bg, body(base), css ?? '');
}

/* ------------------------------------------------------------ feelings: "Show me happy" */
// The same girl and boy, each with six feelings, so she listens to the feeling, not the child.
// Close up (head and shoulders), so a toddler sees the face.
const close = (body) => at(-96, -8, 1.48, body);
const FEELINGS = {
  happy: ['#FFF4CC', (b) => close(child(b, { pose: 'up', expr: 'happy' })) + sparkle(90, 90, 0.8) + sparkle(320, 110, 0.6)],
  sad: ['#E3ECF7', (b) => close(child(b, { pose: 'slump', expr: 'sad' }))],
  angry: ['#FDE2DE', (b) => close(child(b, { pose: 'hips', expr: 'angry' })) + L('M84 92 l16 10 M78 116 l20 2 M318 92 l-16 10 M324 116 l-20 2', '#E8504A', 5)],
  scared: ['#ECE6F7', (b) => close(child(b, { pose: 'cheeks', expr: 'scared' }))],
  sleepy: ['#E3E6F7', (b) => close(child(b, { pose: 'rub', expr: 'yawn' })) + `<g class="zee">${zee(300, 100, 1)}</g><g class="zee b">${zee(326, 76, 0.8)}</g>`, MOVE.zee],
  surprised: ['#E2F4FB', (b) => close(child(b, { pose: 'wow', expr: 'surprised' })) + L('M70 80 l14 14 M60 120 h20 M330 80 l-14 14 M340 120 h-20', '#FFC531', 5)],
};
for (const [name, base] of Object.entries(who)) {
  for (const [feel, [bg, body, css]] of Object.entries(FEELINGS)) pictures[`fe_${name}_${feel}`] = card(bg, body(base), css ?? '');
}

/* ------------------------------------------------------------ in, on, under */
const ball = (x, y, r = 34) =>
  C(x, y, r, '#fff') + P(`M${x} ${y - r * 0.45} l${r * 0.42} ${r * 0.3} l${-r * 0.16} ${r * 0.5} h${-r * 0.52} l${-r * 0.16} ${-r * 0.5} Z`, INK, 0) + L(`M${x - r * 0.9} ${y + r * 0.2} q${r * 0.9} ${r * 0.5} ${r * 1.8} 0`, '#E8504A', 4);
const floor = R(4, 330, 392, 66, 0, '#E7DCCB', 0);
const boxFront = (x, y, w, h) => P(`M${x} ${y} h${w} v${h} h${-w} Z`, '#D9A066') + L(`M${x + w / 2} ${y + 8} v${h - 16}`, '#B57E45', 4);
const boxLid = (x, y, w) => P(`M${x - 6} ${y} h${w + 12} l-14 -26 h${-w + 16} Z`, '#E8B87C');
const teddy = (x, y, s = 1) =>
  at(x, y, s, C(-26, -50, 14, '#B5793F') + C(26, -50, 14, '#B5793F') + C(0, -26, 34, '#C98A4E') + E(0, 30, 34, 38, '#C98A4E') + E(0, -16, 14, 10, '#E8C49A', 3) + C(-11, -32, 4, INK, 0) + C(11, -32, 4, INK, 0) + C(0, -20, 4, INK, 0));
const bedFrame = (legs = true) =>
  (legs ? R(60, 250, 18, 90, 4, '#8A5A3A') + R(322, 250, 18, 90, 4, '#8A5A3A') : '') + R(54, 150, 22, 120, 6, '#A06A44') + R(48, 226, 304, 40, 12, '#B07A52') + R(56, 208, 288, 26, 10, '#fff') + E(110, 204, 40, 16, '#fff');

const PLACES = {
  ball_in: ['#FFF4CC', floor + R(132, 290, 16, 44, 4, '#A06A44') + R(252, 290, 16, 44, 4, '#A06A44') + ball(200, 160, 40) + boxFront(118, 186, 164, 108)],
  ball_on: ['#FFF4CC', floor + R(132, 290, 16, 44, 4, '#A06A44') + R(252, 290, 16, 44, 4, '#A06A44') + boxFront(118, 186, 164, 108) + boxLid(118, 186, 164) + ball(200, 124)],
  ball_under: ['#FFF4CC', floor + R(132, 290, 16, 44, 4, '#A06A44') + R(252, 290, 16, 44, 4, '#A06A44') + boxFront(118, 186, 164, 108) + boxLid(118, 186, 164) + ball(200, 306, 24)],
  teddy_in: ['#F6E8FF', floor + bedFrame() + teddy(116, 196, 0.62) + R(150, 188, 196, 46, 16, '#F7A1C4') + L('M160 200 q90 -12 176 0', '#fff', 4, ' opacity="0.6"')],
  teddy_on: ['#F6E8FF', floor + bedFrame() + R(150, 202, 196, 30, 14, '#F7A1C4') + teddy(240, 150, 0.8)],
  teddy_under: ['#F6E8FF', floor + bedFrame() + R(150, 202, 196, 30, 14, '#F7A1C4') + teddy(200, 318, 0.62)],
};
for (const [name, [bg, body]] of Object.entries(PLACES)) pictures[name] = card(bg, body);

const dir = path.join(PACKS, 'learn');
fs.mkdirSync(dir, { recursive: true });
for (const [name, svg] of Object.entries(pictures)) fs.writeFileSync(path.join(dir, `${name}.svg`), svg);
console.log(`[learn] ${Object.keys(pictures).length} pictures`);
