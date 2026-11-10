// Greetings and manners: the girl from Body parts acts out each word, gently moving.
// Usage: node tools/art/draw-manners.mjs   (writes public/assets/packs/manners/*.svg)
import fs from 'node:fs';
import path from 'node:path';
import { C, E, INK, L, P, PACKS, POSES, R, at, file, frames, heartPath, kid, pivot, sparkle, tile, zee } from './child-lib.mjs';

Object.assign(POSES, {
  clasp: { l: [[156, 192], [142, 240], [190, 232]], r: [[244, 192], [258, 240], [210, 232]] },
  more: { l: [[156, 192], [150, 240], [194, 222]], r: [[244, 192], [250, 240], [206, 222]] },
  salam: { l: [[156, 192], [150, 240], [196, 232]], r: [[244, 192], [284, 226], [292, 170]] },
  spoon: { l: [[156, 192], [142, 240], [156, 262]], r: [[244, 192], [258, 238], [216, 244]] },
});

const GIRL = { lashes: true, skin: 'light', hair: 'bob', hairColor: '#3A2418', band: '#F05A8C', shirt: '#F7A14A', shorts: '#7A4FD1', shoe: '#5B8DEF', expr: 'smile' };
const girl = (o = {}) => kid({ ...GIRL, ...o, hands: { ...(o.hands ?? {}) } });
const place = (body, x = 0, y = 26, sc = 0.9) => at(x + 20, y, sc, body);
const card = (bg, body, css = '') => file(tile(bg) + body, css);

const MOVE = {
  wave: `.waveArm { animation: waveArm 1s ease-in-out infinite; transform-origin: 0 0; }
    @keyframes waveArm { 0%,100% { transform: rotate(0) } 50% { transform: rotate(-16deg) } }`,
  float: `.floatUp { animation: floatUp 2.2s ease-out infinite; }
    .floatUp.b { animation-delay: 1.1s; }
    @keyframes floatUp { 0% { transform: translate(0,10px); opacity: 0 } 25% { opacity: 1 } 100% { transform: translate(12px,-60px); opacity: 0 } }`,
  rise: `.rise { animation: rise 3s ease-out infinite alternate; }
    @keyframes rise { from { transform: translateY(16px) } to { transform: translateY(0) } }`,
  zee: `.zee { animation: zee 3s ease-out infinite; }
    .zee.b { animation-delay: 1s; } .zee.c { animation-delay: 2s; }
    @keyframes zee { 0% { transform: translate(0,10px); opacity: 0 } 30% { opacity: 1 } 100% { transform: translate(18px,-34px); opacity: 0 } }`,
  twinkle: `.twinkle { animation: twinkle 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .twinkle.b { animation-delay: .8s; }
    @keyframes twinkle { 0%,100% { transform: scale(.7); opacity: .6 } 50% { transform: scale(1.1); opacity: 1 } }`,
  bob: `.bob { animation: bob 1.4s ease-in-out infinite; }
    @keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }`,
  slideIn: `.slideIn { animation: slideIn 1.8s ease-in-out infinite; }
    @keyframes slideIn { 0%,100% { transform: translateY(-46px); opacity: 0 } 40%,75% { transform: translateY(0); opacity: 1 } }`,
};

const waving = (o = {}) => girl({ pose: 'wave', expr: 'happy', hands: { r: 'open' }, armWrap: { r: (g) => pivot(244, 192, 'waveArm', g) }, ...o });
const ball = (x, y, r = 30) => C(x, y, r, '#fff') + P(`M${x} ${y - r * 0.45} l${r * 0.42} ${r * 0.3} l${-r * 0.16} ${r * 0.5} h${-r * 0.52} l${-r * 0.16} ${-r * 0.5} Z`, INK, 0);
const bowl = (full) => P('M84 246 Q88 286 126 288 Q164 286 168 246 Z', '#5B8DEF') + E(126, 246, 42, 9, full ? '#F4C06A' : '#EAF0FA');
const heart = (x, y, s, cls = 'floatUp', c = '#F05A8C') => `<g class="${cls}">${P(heartPath(x, y, s), c, 3.5)}</g>`;
const cookie = (x, y) => C(x, y, 24, '#E2B06E') + C(x - 8, y - 6, 3.5, INK, 0) + C(x + 8, y - 2, 3.5, INK, 0) + C(x - 1, y + 9, 3.5, INK, 0);
const dove = (x, y) =>
  `<g class="bob">${P(`M${x} ${y} q26 -20 52 -2 l20 -10 l-8 20 q-10 22 -40 20 q-24 -2 -24 -28 Z`, '#fff', 3.5)}${P(`M${x + 22} ${y - 4} q6 -28 34 -26 q-4 24 -22 34 Z`, '#EAF3FF', 3.5)}${C(x + 8, y + 2, 2.6, INK, 0)}</g>`;
const floorLine = R(4, 352, 392, 44, 0, '#E7DCCB', 0);

const pictures = {
  hello: card('#FFF1D6', place(waving()) + sparkle(70, 120, 0.9) + sparkle(96, 72, 0.55, '#F05A8C'), MOVE.wave),
  bye: card(
    '#E3F2FF',
    R(24, 66, 118, 300, 10, '#C98B5B') + R(40, 86, 86, 104, 6, '#D9A274', 3.5) + R(40, 204, 86, 130, 6, '#D9A274', 3.5) + C(124, 210, 7, '#F5C542', 3) + place(waving({ expr: 'smile' }), 44),
    MOVE.wave,
  ),
  good_morning: card(
    '#FFF4CC',
    `<g class="rise">${C(322, 112, 44, '#FFC531')}${L('M322 44 v-22 M390 112 h-20 M274 64 l-14 -14 M370 64 l14 -14', '#F0A81E', 6)}</g>` + place(girl({ pose: 'up', expr: 'happy', hands: { l: 'open', r: 'open' } })),
    MOVE.rise,
  ),
  good_night: card(
    '#34407E',
    C(322, 92, 44, '#FFE27A') + C(342, 78, 38, '#34407E', 0) + sparkle(62, 72, 0.8, '#FFE27A').replace('<path', '<path class="twinkle"') + sparkle(124, 42, 0.5, '#fff').replace('<path', '<path class="twinkle b"') +
      place(girl({ pose: 'hug', expr: 'asleep', hair: 'nightcap', shirt: '#9CC9F2', shorts: '#6C8FD6' })) +
      `<g class="zee">${zee(286, 150, 1, '#fff')}</g><g class="zee b">${zee(306, 130, 0.8, '#fff')}</g>`,
    MOVE.twinkle + MOVE.zee,
  ),
  thank_you: card('#FDE3EC', place(girl({ pose: 'heart', expr: 'happy', hands: { r: 'open' } })) + heart(92, 190, 1.2) + heart(312, 180, 1, 'floatUp b', '#FF8FA3'), MOVE.float),
  please: card('#EAF6EC', place(girl({ pose: 'clasp', expr: 'shy', tilt: -7 })) + sparkle(84, 140, 0.8) + sparkle(322, 118, 0.6, '#7ED0B5')),
  sorry: card(
    '#E3E6F7',
    floorLine + place(girl({ pose: 'clasp', expr: 'sad', tears: false, tilt: 8 })) +
      `<g transform="rotate(78 74 330)">${P('M50 302 L98 302 L92 358 L56 358 Z', '#7ED0B5')}</g>` + E(114, 372, 46, 12, '#fff', 3.5),
  ),
  welcome: card(
    '#F6E8FF',
    place(
      girl({ pose: 'out', expr: 'happy', hands: { r: 'open' } }) +
        L('M348 196 q2 -30 -4 -58', '#5FA863', 7) +
        [[0, -22], [21, -7], [13, 18], [-13, 18], [-21, -7]].map(([dx, dy]) => C(344 + dx, 116 + dy, 15, '#F58FB5')).join('') + C(344, 116, 12, '#FFC531'),
    ),
  ),
  salam: card('#E2F4FB', place(girl({ pose: 'salam', expr: 'smile', hands: { r: 'open' } })) + dove(44, 112) + sparkle(346, 72, 0.6)),
  bismillah: card('#FFF4CC', place(girl({ pose: 'spoon', expr: 'smile' }) + L('M216 244 L176 232', '#B0B6C0', 6) + E(172, 230, 9, 6, '#C9CED6', 3)) + at(-6, 24, 1, bowl(true)) + sparkle(322, 104, 0.8) + sparkle(74, 96, 0.55, '#F05A8C')),
  alhamdulillah: card('#FFEFE2', floorLine + place(girl({ pose: 'hug', expr: 'happy' })) + at(-46, 96, 1, bowl(false)) + sparkle(330, 112, 0.8) + heart(324, 214, 0.9)),
  inshallah: card(
    '#EDE7FB',
    place(girl({ pose: 'wow', expr: 'smile', hands: { l: 'open', r: 'open' }, tilt: -5 })) +
      sparkle(200, 40, 1.3).replace('<path', '<path class="twinkle"') + sparkle(106, 58, 0.6, '#B48CF0').replace('<path', '<path class="twinkle b"') + sparkle(296, 58, 0.6, '#B48CF0').replace('<path', '<path class="twinkle b"'),
    MOVE.twinkle,
  ),
  want: card('#FFF1D6', place(girl({ pose: 'out', expr: 'smile', hands: { r: 'open' } }), -30) + `<g class="bob">${ball(330, 128, 42)}</g>`, MOVE.bob),
  more: card('#FCE7DF', place(girl({ pose: 'more', expr: 'happy' }), -36) + cookie(330, 310) + cookie(330, 262) + `<g class="slideIn">${cookie(330, 214)}</g>`, MOVE.slideIn),
  all_done: card('#E3F2FF', floorLine + place(girl({ pose: 'wow', expr: 'smile', hands: { l: 'open', r: 'open' } })) + E(200, 370, 62, 15, '#fff', 3.5) + E(200, 368, 38, 8, '#EAF0FA', 2.5)),
};

const nod = (o) => place(girl(o));
{
  const [f, css] = frames([nod({ pose: 'down', expr: 'neutral', tilt: -11, hands: { l: 'open', r: 'open' } }), nod({ pose: 'down', expr: 'neutral', tilt: 11, hands: { l: 'open', r: 'open' } })], 0.9);
  pictures.no = card('#F7E7E0', f, css);
}
{
  const [f, css] = frames([nod({ pose: 'down', expr: 'happy' }), nod({ pose: 'down', expr: 'happy', headUp: -12 })], 0.8);
  pictures.yes = card('#E8F5DC', f + sparkle(78, 110, 0.8) + sparkle(322, 92, 0.65, '#7ED0B5'), css);
}

const dir = path.join(PACKS, 'manners');
fs.mkdirSync(dir, { recursive: true });
for (const [name, svg] of Object.entries(pictures)) fs.writeFileSync(path.join(dir, `${name}.svg`), svg);
console.log(`[manners] ${Object.keys(pictures).length} pictures`);
