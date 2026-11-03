// "Do it with me" (the girl does each action, moving), "Look after the baby" (the things the baby
// needs) and "Our day" (the routine cards), in the whole-child style of Feelings and Body parts.
// Usage: node tools/art/draw-play.mjs   (writes public/assets/packs/{actions,care,routine}/*.svg)
import fs from 'node:fs';
import path from 'node:path';
import { C, E, INK, L, P, PACKS, POSES, R, SK, at, file, frames, heartPath, kid, pivot, sparkle, tile, zee } from './child-lib.mjs';

const GIRL = { skin: 'light', hair: 'bob', hairColor: '#3A2418', band: '#F05A8C', shirt: '#F7A14A', shorts: '#7A4FD1', shoe: '#5B8DEF', expr: 'smile' };
const girl = (o = {}) => kid({ ...GIRL, ...o, hands: { ...(o.hands ?? {}) } });
const SKIN = SK.light.skin;
const place = (body, x = 0, y = 26, sc = 0.9) => at(x + 20, y, sc, body);

const write = (pack, key, svg) => {
  fs.mkdirSync(path.join(PACKS, pack), { recursive: true });
  fs.writeFileSync(path.join(PACKS, pack, `${key}.svg`), svg);
};

/* ------------------------------------------------------------ shared motion */
const M = {
  bounce: `.bounce { animation: bounce .7s ease-in-out infinite; }
    @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-26px) } }
    .shadow { animation: shadow .7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes shadow { 0%,100% { transform: scale(1) } 50% { transform: scale(.7) } }`,
  wave: `.waveArm { animation: waveArm 1s ease-in-out infinite; transform-origin: 0 0; }
    @keyframes waveArm { 0%,100% { transform: rotate(0) } 50% { transform: rotate(-16deg) } }`,
  float: `.floatUp { animation: floatUp 2.2s ease-out infinite; }
    .floatUp.b { animation-delay: 1.1s; }
    @keyframes floatUp { 0% { transform: translate(0,10px); opacity: 0 } 25% { opacity: 1 } 100% { transform: translate(12px,-60px); opacity: 0 } }`,
  zee: `.zee { animation: zee 3s ease-out infinite; }
    .zee.b { animation-delay: 1s; } .zee.c { animation-delay: 2s; }
    @keyframes zee { 0% { transform: translate(0,10px); opacity: 0 } 30% { opacity: 1 } 100% { transform: translate(18px,-34px); opacity: 0 } }`,
  brush: `.brush { animation: brush .35s ease-in-out infinite alternate; }
    @keyframes brush { from { transform: translateX(-7px) } to { transform: translateX(7px) } }`,
  sway: `.sway { animation: sway 2.4s ease-in-out infinite; transform-origin: 0 0; }
    @keyframes sway { 0%,100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }`,
  shake: `.shake { animation: shake .3s ease-in-out infinite alternate; transform-origin: 0 0; }
    @keyframes shake { from { transform: rotate(-2.5deg) } to { transform: rotate(2.5deg) } }`,
  slideIn: `.slideIn { animation: slideIn 1.6s ease-in-out infinite; }
    @keyframes slideIn { 0%,100% { transform: translateX(26px) } 45%,60% { transform: translateX(0) } }
    .spark { animation: spark 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes spark { 0%,40%,70%,100% { transform: scale(0); opacity: 0 } 50%,60% { transform: scale(1); opacity: 1 } }`,
  roll: `.roll { animation: roll 1.8s ease-out infinite; }
    @keyframes roll { 0%,15% { transform: translateX(0) } 100% { transform: translateX(120px); opacity: .2 } }`,
  arc: `.arc { opacity: 0; animation: arc 1.6s linear infinite; }
    @keyframes arc { 0%,49% { opacity: 0; transform: translate(0,0) } 50% { opacity: 1; transform: translate(0,0) } 75% { opacity: 1; transform: translate(30px,-70px) } 100% { opacity: .2; transform: translate(56px,-20px) } }`,
  steam: `.steam { animation: steam 2s ease-out infinite; }
    .steam.b { animation-delay: 1s; }
    @keyframes steam { 0% { transform: translateY(8px); opacity: 0 } 40% { opacity: .9 } 100% { transform: translateY(-26px); opacity: 0 } }`,
  bubbles: `.bub { animation: bub 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .bub.b { animation-delay: .8s; } .bub.c { animation-delay: 1.6s; }
    @keyframes bub { 0%,100% { transform: scale(.85) translateY(0) } 50% { transform: scale(1.1) translateY(-6px) } }`,
  beat: `.beat { animation: beat 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes beat { 0%,100% { transform: scale(1) } 15% { transform: scale(1.18) } 30% { transform: scale(1) } 45% { transform: scale(1.12) } }`,
  sun: `.rise { animation: rise 3s ease-out infinite alternate; }
    @keyframes rise { from { transform: translateY(16px) } to { transform: translateY(0) } }`,
  spin: `.spinLines { animation: spinLines 1s linear infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes spinLines { to { transform: rotate(-360deg) } }`,
};

const ball = (x, y, r = 22) =>
  C(x, y, r, '#fff') + P(`M${x} ${y - r * 0.45} l${r * 0.42} ${r * 0.3} l${-r * 0.16} ${r * 0.5} h${-r * 0.52} l${-r * 0.16} ${-r * 0.5} Z`, INK, 0);
const notes = (x, y, cls = 'floatUp') =>
  `<g class="${cls}">${C(x, y + 22, 7, '#7A6FD8', 3) + L(`M${x + 7} ${y + 22} V${y} l12 5`, '#7A6FD8', 4)}</g>` +
  `<g class="${cls} b">${C(x + 36, y + 6, 6, '#F05A8C', 3) + L(`M${x + 42} ${y + 6} V${y - 14} l10 4`, '#F05A8C', 4)}</g>`;
const ground = (c = '#DCEBC9') => R(4, 352, 392, 44, 0, c, 0);
const marks = (d, c = '#E0906E') => L(d, c, 5);
const legs = {
  stand: { l: [[170, 320], [168, 354], [166, 380]], r: [[230, 320], [232, 354], [234, 380]] },
  liftL: { l: [[170, 320], [150, 340], [160, 362]], r: [[230, 320], [232, 354], [234, 380]] },
  liftR: { l: [[170, 320], [168, 354], [166, 380]], r: [[230, 320], [250, 340], [240, 362]] },
  kick: { l: [[170, 320], [168, 354], [166, 380]], r: [[230, 320], [262, 340], [296, 344]] },
};

/* ------------------------------------------------------------ Do it with me */
function actions() {
  const out = {};
  const card = (bg, body, css = '') => file(tile(bg) + body, css);

  {
    const [fs_, css] = frames(
      [
        place(girl({ pose: 'clapOpen', expr: 'happy' })),
        place(girl({ pose: 'clapShut', expr: 'happy' })) + place(marks('M182 196 l-12 -12 M200 190 v-16 M218 196 l12 -12')),
      ],
      0.6,
    );
    out.clap = card('#FFF1D6', fs_, css);
  }
  out.jump = card(
    '#E3F2FF',
    E(200, 372, 70, 12, '#BFD6EA', 0, ' class="shadow"') + `<g class="bounce">${place(girl({ pose: 'up', expr: 'happy' }), 0, 4)}</g>` +
      marks('M120 330 l-18 10 M280 330 l18 10', '#8FB3D6'),
    M.bounce,
  );
  out.wave = card('#EAF6EC', place(girl({ pose: 'wave', expr: 'happy', hands: { r: 'open' }, armWrap: { r: (g) => pivot(244, 192, 'waveArm', g) } })), M.wave);
  {
    const [fs_, css] = frames(
      [
        place(girl({ pose: 'danceL', expr: 'happy', tilt: -8, legs: legs.liftR })),
        place(girl({ pose: 'danceR', expr: 'happy', tilt: 8, legs: legs.liftL })),
      ],
      0.9,
    );
    out.dance = card('#F6E8FF', fs_ + notes(300, 70), css + M.float);
  }
  {
    const [fs_, css] = frames([place(girl({ pose: 'out2', expr: 'happy' })), place(girl({ pose: 'out2', back: true }))], 0.8);
    out.spin = card('#FFF4CC', fs_ + `<g transform="translate(200 372)"><g class="spinLines">${L('M-90 0 A90 18 0 0 0 60 14', '#E0A030', 5) + P('M60 14 l-14 -10 l2 16 Z', '#E0A030', 0)}</g></g>`, css + M.spin);
  }
  {
    const [fs_, css] = frames(
      [
        place(girl({ pose: 'hips', expr: 'happy', legs: legs.liftL })) + place(marks('M226 392 l-12 -10 M246 394 l0 -14 M266 392 l12 -10')),
        place(girl({ pose: 'hips', expr: 'happy', legs: legs.liftR })) + place(marks('M134 392 l-12 -10 M154 394 l0 -14 M174 392 l12 -10')),
      ],
      0.7,
    );
    out.stamp = card('#FCE7DF', fs_, css);
  }
  // Eat: spoon from bowl to mouth.
  {
    const bowl = P('M108 246 Q112 286 150 288 Q188 286 192 246 Z', '#5B8DEF') + E(150, 246, 42, 9, '#F4C06A');
    const [fs_, css] = frames(
      [
        place(girl({ pose: 'eatDown' }) + bowl + L('M210 236 L184 244', '#B0B6C0', 6) + E(180, 245, 9, 6, '#C9CED6', 3)),
        place(girl({ pose: 'eatUp', expr: 'shh', armsOver: true }) + bowl + L('M232 176 L212 150', '#B0B6C0', 6) + E(207, 146, 9, 6, '#C9CED6', 3)),
      ],
      1.2,
    );
    out.eat = card('#FFEFE2', fs_, css);
  }
  // Drink: a cup to the mouth.
  {
    const cup = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})">${P(`M${x - 16} ${y - 20} L${x + 16} ${y - 20} L${x + 12} ${y + 20} L${x - 12} ${y + 20} Z`, '#7ED0B5')}${L(`M${x + 16} ${y - 8} q12 4 0 16`, INK, 4)}</g>`;
    const [fs_, css] = frames([place(girl({ pose: 'cupLow' }) + cup(228, 236, 0)), place(girl({ pose: 'cupUp', expr: 'shh', armsOver: true }) + cup(220, 150, -30))], 1.4);
    out.drink = card('#E2F4FB', fs_, css);
  }
  // Sleep: lying in bed, eyes closed.
  out.sleep = card(
    '#E3E6F7',
    R(250, 34, 116, 96, 16, '#2E3560') + P('M326 60 a24 24 0 1 0 14 42 a18 18 0 1 1 -14 -42 Z', '#FFE08A', 0) + R(250, 34, 116, 96, 16, 'none', 5) +
      R(40, 300, 320, 40, 12, '#C98E5A') + R(40, 336, 16, 40, 4, '#A9714A') + R(344, 336, 16, 40, 4, '#A9714A') + E(96, 280, 52, 24, '#fff') +
      `<g transform="translate(38 386) rotate(-90) scale(0.62)">${girl({ expr: 'asleep' })}</g>` +
      P('M150 250 Q260 236 356 252 L356 304 L150 304 Z', '#9A90EE') + L('M170 266 Q260 254 340 268', '#B9B3F2', 5) +
      `<g class="zee">${zee(150, 180, 1.3)}</g><g class="zee b">${zee(170, 160, 1)}</g><g class="zee c">${zee(186, 144, 0.8)}</g>`,
    M.zee,
  );
  // Wash hands: hands rub under the tap, with bubbles.
  {
    const tap = R(226, 170, 84, 18, 9, '#B0B6C0') + R(226, 170, 20, 30, 7, '#B0B6C0') + R(298, 150, 14, 40, 6, '#8E96A3');
    const water = R(231, 200, 10, 24, 5, '#8FD0FF', 0, ' opacity="0.9"');
    const [fs_, css] = frames(
      [
        place(girl({ pose: 'washA' }) + tap + water + C(214, 240, 8, '#fff', 2.5) + C(262, 232, 6, '#fff', 2.5)),
        place(girl({ pose: 'washB' }) + tap + water + C(210, 228, 7, '#fff', 2.5) + C(266, 246, 8, '#fff', 2.5)),
      ],
      0.5,
    );
    out.wash_hands = card('#E6F3FA', fs_, css);
  }
  out.brush_teeth = card(
    '#EAF4FF',
    place(girl({ pose: 'brush', expr: 'teeth', armsOver: true }) + `<g class="brush">${R(204, 140, 74, 10, 5, '#5B8DEF') + R(196, 136, 16, 18, 4, '#fff', 3)}</g>`),
    M.brush,
  );
  out.kiss = card(
    '#FDE9F0',
    place(girl({ pose: 'kiss', expr: 'kiss', armsOver: true })) +
      `<g class="floatUp">${P(heartPath(276, 150, 1.3), '#E8304A', 3.5)}</g><g class="floatUp b">${P(heartPath(300, 120, 0.9), '#F05A8C', 3)}</g>`,
    M.float,
  );
  out.hug = card(
    '#FFF1E6',
    pivot(200, 380, 'sway', place(girl({ pose: 'teddyHug', expr: 'happy', armsOver: true }) + teddy(200, 236, 1))) +
      `<g class="floatUp">${P(heartPath(300, 110, 1.2), '#E8304A', 3.5)}</g>`,
    M.sway + M.float,
  );
  out.high_five = card(
    '#FFF4CC',
    place(girl({ pose: 'five', expr: 'happy', hands: { r: 'open' } })) +
      `<g class="slideIn">${grownHand(360, 132)}</g><g class="spark">${sparkle(318, 112, 1.6)}</g>`,
    M.slideIn,
  );
  out.sit = card('#EAF6EC', R(4, 330, 392, 66, 0, '#DCEBC9', 0) + place(girl({ pose: 'knees', sit: true, expr: 'smile' }), 0, 0), '');
  out.lie_down = card(
    '#E8F4F2',
    R(36, 300, 330, 34, 14, '#7ED0B5') + `<g transform="translate(50 386) rotate(-90) scale(0.62)">${girl({ expr: 'smile' })}</g>` + sparkle(330, 120, 0.8),
    '',
  );
  out.shh = card(
    '#EEF1F6',
    place(girl({ pose: 'shh', expr: 'shh', hands: { r: 'point' }, armsOver: true })) + `<g class="floatUp">${L('M290 120 q14 14 0 28 M306 110 q22 24 0 48', '#9AA8C0', 5)}</g>`,
    M.float,
  );
  out.cover_eyes = card('#F6E8FF', pivot(200, 380, 'sway', place(girl({ pose: 'eyes', expr: 'happy', armsOver: true }))), M.sway);
  {
    const lines = marks('M60 200 h-30 M70 240 h-40 M60 280 h-30', '#8FB3D6');
    const [fs_, css] = frames(
      [place(girl({ pose: 'runA', expr: 'happy', legs: legs.liftL })) + lines, place(girl({ pose: 'runB', expr: 'happy', legs: legs.liftR })) + lines],
      0.4,
    );
    out.run = card('#E3F2FF', fs_, css);
  }
  out.kick = card('#E6F3E2', ground() + place(girl({ pose: 'hips', expr: 'happy', legs: legs.kick }), -30) + `<g class="roll">${ball(296, 330)}</g>`, M.roll);
  {
    const [fs_, css] = frames(
      [place(girl({ pose: 'throwBack', expr: 'happy' }) + ball(294, 108, 18)), place(girl({ pose: 'throwFwd', expr: 'happy' }))],
      1.6,
    );
    out.throw = card('#FFF1D6', fs_ + `<g class="arc">${ball(322, 179, 18)}</g>`, css + M.arc);
  }
  out.crawl = card('#FFF4CC', ground('#F2D79A') + crawler(), crawlCss);
  {
    const water = `<path d="M4 236 q24 -12 48 0 t48 0 t48 0 t48 0 t48 0 t48 0 t48 0 t48 0 V396 H4 Z" fill="#5DB7F5" opacity="0.92"/>`;
    const [fs_, css] = frames(
      [place(girl({ pose: 'swimA', expr: 'happy', shirt: '#F05A8C' }), 0, 70), place(girl({ pose: 'swimB', expr: 'happy', shirt: '#F05A8C' }), 0, 70)],
      0.8,
    );
    out.swim = card('#D8EEFF', fs_ + water + C(120, 300, 6, '#fff', 0, ' opacity="0.7"') + C(300, 320, 8, '#fff', 0, ' opacity="0.7"'), css);
  }
  out.sing = card('#F6E8FF', place(girl({ pose: 'mic', expr: 'sing' }) + R(214, 160, 16, 54, 6, '#3B3F4A') + C(222, 156, 13, '#6B7080')) + notes(290, 90), M.float);
  out.laugh = card(
    '#FFF4CC',
    pivot(200, 380, 'shake', place(girl({ pose: 'belly', expr: 'happy' }))) +
      `<g class="floatUp">${L('M290 110 l10 10 m0 -10 l-10 10 M312 96 l10 10 m0 -10 l-10 10', '#E0A030', 5)}</g>`,
    M.shake + M.float,
  );
  return out;
}

const teddy = (x, y, s) =>
  C(x - 34 * s, y - 50 * s, 14 * s, '#C98E5A') + C(x + 34 * s, y - 50 * s, 14 * s, '#C98E5A') + C(x, y - 26 * s, 34 * s, '#C98E5A') +
  E(x, y + 26 * s, 40 * s, 36 * s, '#C98E5A') + C(x - 12 * s, y - 32 * s, 4 * s, INK, 0) + C(x + 12 * s, y - 32 * s, 4 * s, INK, 0) +
  E(x, y - 18 * s, 11 * s, 8 * s, '#E8C29A', 3);

/** A grown-up's hand coming in from the side for a high five. */
const grownHand = (x, y) =>
  L(`M${x + 60} ${y + 40} L${x} ${y}`, INK, 44) + L(`M${x + 60} ${y + 40} L${x} ${y}`, '#DDA373', 34) +
  [-28, -12, 4, 20].map((dy, i) => L(`M${x - 4} ${y + dy * 0.8} l-30 ${-6 + i * 4}`, INK, 17) + L(`M${x - 4} ${y + dy * 0.8} l-30 ${-6 + i * 4}`, '#DDA373', 9)).join('') +
  C(x - 4, y - 2, 22, '#DDA373', 4.5);

/** Crawling, seen from the side: limbs take turns. */
function crawler() {
  const sk = SKIN;
  const limbs = (a) => {
    const k = a ? 1 : -1;
    return (
      L(`M150 270 L${140 + 12 * k} 320 L${100 + 10 * k} 326`, INK, 37) + L(`M150 270 L${140 + 12 * k} 320 L${100 + 10 * k} 326`, '#7A4FD1', 28) +
      L(`M262 262 L${270 - 12 * k} 322`, INK, 33) + L(`M262 262 L${270 - 12 * k} 322`, sk, 24) + C(270 - 12 * k, 326, 13, sk)
    );
  };
  const body = (a) =>
    limbs(a) +
    E(200, 256, 82, 44, '#F7A14A') + P('M118 256 Q120 296 170 296 L170 230 Q130 226 118 256 Z', '#7A4FD1', 4.5) +
    // head, side view
    C(300, 214, 52, sk) + P('M252 206 C250 160 290 150 314 156 C340 162 356 186 350 206 C330 192 300 186 276 196 C268 200 260 204 252 206 Z', '#3A2418') +
    L('M262 178 Q300 150 340 172', '#F05A8C', 8) + E(282, 220, 10, 13, sk) + C(326, 214, 6, INK, 0) + C(328, 211, 2, '#fff', 0) +
    L('M318 238 q12 8 22 -2', INK, 4) + E(318, 228, 8, 5, '#F59A92', 0, ' opacity="0.6"');
  const [svg] = frames([body(true), body(false)], 0.7, 'cr');
  return svg;
}
const crawlCss = frames(['', ''], 0.7, 'cr')[1];

/* ------------------------------------------------------------ Look after the baby: what it needs */
function care() {
  const card = (bg, body, css = '') => file(tile(bg) + body, css);
  return {
    food: card(
      '#FFEFE2',
      `<g class="steam">${L('M170 120 q-12 -16 0 -32 q12 -16 0 -32', '#C9B8A8', 6)}</g><g class="steam b">${L('M230 120 q-12 -16 0 -32 q12 -16 0 -32', '#C9B8A8', 6)}</g>` +
        P('M90 170 Q96 300 200 304 Q304 300 310 170 Z', '#5B8DEF') + E(200, 170, 110, 26, '#F4C06A') + C(170, 166, 10, '#F7A14A', 0) + C(222, 172, 9, '#7ED0B5', 0) +
        L('M300 230 L360 120', '#B0B6C0', 12) + E(366, 108, 20, 14, '#C9CED6', 4.5, ' transform="rotate(-60 366 108)"'),
      M.steam,
    ),
    milk: card(
      '#E2F4FB',
      `<g transform="rotate(-12 200 220)">${R(150, 100, 100, 210, 34, '#fff') + R(150, 180, 100, 130, 30, '#FFF6E8', 0) + R(150, 100, 100, 210, 34, 'none')}` +
        L('M168 160 h22 M168 200 h22 M168 240 h22', '#9AA8C0', 4) + R(160, 76, 80, 30, 10, '#F05A8C') + P('M182 76 Q184 30 200 30 Q216 30 218 76 Z', '#F7D046') + '</g>' +
        `<g class="bub">${C(300, 120, 10, '#fff', 3)}</g><g class="bub b">${C(320, 170, 7, '#fff', 3)}</g>`,
      M.bubbles,
    ),
    bath: card(
      '#E6F3FA',
      `<g class="bub">${C(130, 170, 30, '#fff', 3.5)}</g><g class="bub b">${C(186, 150, 38, '#fff', 3.5)}</g><g class="bub c">${C(250, 166, 30, '#fff', 3.5)}</g>` +
        P('M60 200 L340 200 Q336 300 270 306 L130 306 Q64 300 60 200 Z', '#fff') + R(50, 190, 300, 22, 11, '#DDE7F0') +
        R(110, 300, 18, 40, 6, '#B0B6C0') + R(272, 300, 18, 40, 6, '#B0B6C0') +
        // a duck
        E(300, 180, 30, 20, '#F7D046') + C(316, 156, 16, '#F7D046') + P('M330 154 l18 4 l-18 6 Z', '#F7A14A', 3) + C(320, 151, 3, INK, 0),
      M.bubbles,
    ),
    bed: card(
      '#E3E6F7',
      R(60, 210, 280, 70, 16, '#C98E5A') + R(60, 270, 20, 70, 6, '#A9714A') + R(320, 270, 20, 70, 6, '#A9714A') + R(40, 140, 40, 150, 14, '#A9714A') +
        E(130, 196, 54, 26, '#fff') + P('M150 200 Q250 180 330 198 L330 250 L150 250 Z', '#9A90EE') + L('M168 214 Q250 200 316 214', '#B9B3F2', 5) +
        `<g class="zee">${zee(250, 120, 1.4)}</g><g class="zee b">${zee(274, 98, 1.1)}</g><g class="zee c">${zee(292, 80, 0.8)}</g>`,
      M.zee,
    ),
    hug: card('#FDE9F0', teddy(200, 230, 1.9) + `<g class="beat">${P(heartPath(200, 290, 1.4), '#E8304A', 3.5)}</g>`, M.beat),
  };
}

/* ------------------------------------------------------------ Our day: the routine cards that are new */
function routine() {
  const card = (bg, body, css = '') => file(tile(bg) + body, css);
  return {
    wake_up: card(
      '#FFF4CC',
      `<g class="rise">${C(316, 92, 40, '#FFC531', 0)}</g>` + R(30, 290, 340, 46, 12, '#C98E5A') + R(30, 330, 16, 46, 4, '#A9714A') + R(354, 330, 16, 46, 4, '#A9714A') +
        place(girl({ pose: 'up', expr: 'yawn' }), -10, 0) + P('M30 270 Q200 252 370 270 L370 300 L30 300 Z', '#9A90EE'),
      M.sun,
    ),
    get_dressed: card(
      '#E8F4F2',
      place(girl({ pose: 'up', expr: 'happy', shirt: '#FFFFFF' }) + P('M86 70 L130 50 L150 60 Q170 72 190 60 L210 50 L254 70 L240 110 L222 104 L222 170 L118 170 L118 104 L100 110 Z', '#F05A8C'), 0, 46) +
        sparkle(330, 90, 0.9),
      '',
    ),
    shoes: card('#EAF4FF', R(4, 330, 392, 66, 0, '#DDE7F0', 0) + place(girl({ pose: 'shoe', sit: true, expr: 'smile', barefoot: false }), 0, 0) + E(284, 286, 24, 12, '#5B8DEF') + sparkle(330, 120, 0.8), ''),
    go_out: card(
      '#E6F3E2',
      R(34, 60, 150, 300, 10, '#C98E5A') + R(46, 72, 126, 288, 6, '#BFE6FF') + C(110, 230, 46, '#7ED0B5', 0) + R(104, 260, 12, 90, 4, '#A9714A', 0) +
        place(girl({ pose: 'wave', expr: 'happy', hands: { r: 'open' }, armWrap: { r: (g) => pivot(244, 192, 'waveArm', g) } }), 80, 30),
      M.wave,
    ),
    park: card(
      '#E3F2FF',
      ground() + L('M60 352 L60 140 M120 352 L120 140', '#E8504A', 10) + L('M60 180 h60 M60 230 h60 M60 280 h60', '#E8504A', 8) + P('M120 140 L330 340 L310 352 L112 160 Z', '#F7D046') +
        `<g class="slide">${place(girl({ pose: 'up', expr: 'happy' }), 70, 10, 0.55)}</g>`,
      `.slide { animation: slide 2.4s ease-in infinite; }
    @keyframes slide { 0%,20% { transform: translate(0,0) } 80% { transform: translate(150px,150px) } 100% { transform: translate(150px,150px); opacity: 0 } }`,
    ),
    play: card(
      '#FFF1D6',
      R(4, 330, 392, 66, 0, '#F2D79A', 0) + place(girl({ pose: 'knees', sit: true, expr: 'happy' }), -40, 0) +
        R(276, 300, 48, 48, 8, '#5B8DEF') + R(282, 252, 48, 48, 8, '#F7D046') + R(278, 204, 48, 48, 8, '#E8504A') + sparkle(350, 170, 0.8),
      '',
    ),
    bath: card(
      '#E6F3FA',
      place(girl({ pose: 'up', expr: 'happy', shirt: SKIN }), 0, 70) +
        `<g class="bub">${C(110, 260, 26, '#fff', 3.5)}</g><g class="bub b">${C(290, 256, 30, '#fff', 3.5)}</g><g class="bub c">${C(200, 268, 22, '#fff', 3.5)}</g>` +
        P('M40 270 L360 270 Q356 370 290 376 L110 376 Q44 370 40 270 Z', '#fff') + R(30, 260, 340, 22, 11, '#DDE7F0'),
      M.bubbles,
    ),
    story: card(
      '#F6E8FF',
      place(girl({ pose: 'book', sit: true, expr: 'smile' }), 0, 0) +
        `<g transform="translate(0 26) scale(0.9) translate(20 0)">${P('M140 230 Q170 214 200 226 L200 290 Q170 278 140 294 Z', '#fff') + P('M260 230 Q230 214 200 226 L200 290 Q230 278 260 294 Z', '#fff') + L('M154 244 q20 -8 36 -2 M154 258 q20 -8 36 -2 M210 242 q20 -8 36 0', '#9AA8C0', 3)}</g>` +
        sparkle(320, 100, 0.8, '#FFE08A'),
      '',
    ),
  };
}

/* ------------------------------------------------------------ poses only these pictures use */
Object.assign(POSES, {
  clapOpen: { l: [[156, 192], [146, 238], [172, 214]], r: [[244, 192], [254, 238], [228, 214]] },
  clapShut: { l: [[156, 192], [150, 238], [190, 212]], r: [[244, 192], [250, 238], [210, 212]] },
  danceL: { l: [[156, 192], [120, 170], [96, 126]], r: [[244, 192], [266, 160], [236, 126]] },
  danceR: { l: [[156, 192], [134, 160], [164, 126]], r: [[244, 192], [280, 170], [304, 126]] },
  out2: { l: [[156, 192], [104, 196], [56, 200]], r: [[244, 192], [296, 196], [344, 200]] },
  eatDown: { l: [[156, 192], [140, 240], [150, 262]], r: [[244, 192], [258, 242], [214, 236]] },
  eatUp: { l: [[156, 192], [140, 240], [150, 262]], r: [[244, 192], [268, 214], [236, 176]] },
  cupLow: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [262, 248], [232, 244]] },
  cupUp: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [266, 208], [232, 162]] },
  washA: { l: [[156, 192], [176, 246], [228, 232]], r: [[244, 192], [270, 246], [254, 232]] },
  washB: { l: [[156, 192], [176, 246], [222, 240]], r: [[244, 192], [270, 246], [260, 226]] },
  brush: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [278, 200], [274, 156]] },
  kiss: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [264, 196], [222, 150]] },
  teddyHug: { l: [[156, 192], [150, 240], [222, 236]], r: [[244, 192], [250, 240], [178, 236]] },
  five: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [284, 178], [300, 132]] },
  knees: { l: [[156, 192], [140, 240], [126, 296]], r: [[244, 192], [262, 240], [274, 296]] },
  shh: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [262, 196], [214, 150]] },
  eyes: { l: [[156, 192], [130, 170], [178, 120]], r: [[244, 192], [270, 170], [222, 120]] },
  runA: { l: [[156, 192], [134, 224], [150, 260]], r: [[244, 192], [268, 172], [278, 140]] },
  runB: { l: [[156, 192], [132, 172], [122, 140]], r: [[244, 192], [266, 224], [250, 260]] },
  throwBack: { l: [[156, 192], [130, 230], [134, 270]], r: [[244, 192], [278, 150], [294, 108]] },
  throwFwd: { l: [[156, 192], [130, 230], [134, 270]], r: [[244, 192], [292, 176], [336, 170]] },
  swimA: { l: [[156, 192], [120, 140], [126, 92]], r: [[244, 192], [272, 226], [292, 250]] },
  swimB: { l: [[156, 192], [128, 226], [108, 250]], r: [[244, 192], [280, 140], [274, 92]] },
  mic: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [256, 236], [224, 210]] },
  belly: { l: [[156, 192], [146, 242], [188, 262]], r: [[244, 192], [254, 242], [212, 262]] },
  shoe: { l: [[156, 192], [144, 240], [128, 290]], r: [[244, 192], [272, 236], [270, 280]] },
  book: { l: [[156, 192], [140, 236], [150, 262]], r: [[244, 192], [260, 236], [250, 262]] },
});

/* ------------------------------------------------------------ write */
let n = 0;
for (const [pack, set] of [['actions', actions()], ['care', care()], ['routine', routine()]]) {
  for (const [key, svg] of Object.entries(set)) {
    write(pack, key, svg);
    n++;
  }
}
console.log(`draw-play: wrote ${n} pictures`);
