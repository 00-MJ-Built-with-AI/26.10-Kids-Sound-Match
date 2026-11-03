// Feelings and Body parts, drawn as one whole child (chosen November 2026: options 1, 2, 3 and 7).
//  - Feelings: a boy (the Arabic feeling words are masculine) acting out the feeling with his whole
//    body, in a little scene that shows why (a dropped ice cream, an empty plate, snow...).
//  - Body parts: a girl, seen whole; everything but the part fades back, the part glows, and a
//    magnifier shows small parts close up.
//  - Each picture moves a little (tears roll, Zzz float up, the glow pulses...). The movement lives in
//    the SVG's own <style>, stops when the phone asks for less motion, and the still picture is
//    complete on its own (the Report and the printed cards draw it still).
// Usage: node tools/art/draw-feelings-body.mjs   (writes public/assets/packs/{feelings,body}/*.svg)
import fs from 'node:fs';
import path from 'node:path';
import { INK, BLUSH, C, E, KID, L, MOTION, P, PACKS, POSES, R, SK, TEAR, at, bow, cloud, drop, face, file, flake, hairBack, hairFront, hand, heartPath, kid, pts, r1, sa, sparkle, tile, tube, zee } from './child-lib.mjs';

/* ------------------------------------------------------------ feelings */
const BOY = { skin: 'medium', hair: 'short', shirt: '#4C9BE8', shorts: '#2F4E9B' };
const boy = (o) => kid({ ...BOY, ...o });
const CSS = {
  bounce: `.bounce { animation: bounce 1.1s ease-in-out infinite; transform-box: view-box; transform-origin: 200px 390px; }
    @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }`,
  sway: `.sway { animation: sway 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
    @keyframes sway { 0%,100% { transform: rotate(-4deg) } 50% { transform: rotate(4deg) } }`,
  twinkle: `.twinkle { animation: twinkle 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .twinkle.b { animation-delay: .8s; }
    @keyframes twinkle { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(.5); opacity: .4 } }`,
  tear: `.tear { animation: tear 2s ease-in infinite; }
    .tear.t2 { animation-delay: 1s; }
    @keyframes tear { 0% { transform: translateY(0); opacity: 0 } 15% { opacity: 1 } 80% { opacity: 1 } 100% { transform: translateY(52px); opacity: 0 } }`,
  puff: `.puff { animation: puff 1.4s ease-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
    .puff.b { animation-delay: .7s; }
    @keyframes puff { 0% { transform: translateY(6px) scale(.7); opacity: .4 } 50% { opacity: 1 } 100% { transform: translateY(-10px) scale(1.1); opacity: .2 } }`,
  stomp: `.stomp { animation: stomp .9s ease-in-out infinite; transform-box: view-box; transform-origin: 200px 390px; }
    @keyframes stomp { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-2deg) } 75% { transform: rotate(2deg) } }`,
  shiver: `.shiver { animation: shiver .18s linear infinite; }
    @keyframes shiver { 0%,100% { transform: translateX(0) } 50% { transform: translateX(3px) } }`,
  flash: `.flash { animation: flash 2.4s steps(1) infinite; }
    @keyframes flash { 0%,55%,75%,100% { opacity: 1 } 60%,70% { opacity: .15 } }`,
  pop: `.pop { animation: pop 1.6s ease-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
    @keyframes pop { 0%,100% { transform: translateY(0) } 20% { transform: translateY(-14px) } 40% { transform: translateY(0) } }
    .confetti { animation: confetti 1.6s ease-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes confetti { 0% { transform: scale(.6); opacity: .3 } 30% { transform: scale(1.15); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }`,
  zee: `.zee { animation: zee 3s ease-out infinite; }
    .zee.b { animation-delay: 1s; } .zee.c { animation-delay: 2s; }
    @keyframes zee { 0% { transform: translate(0,10px); opacity: 0 } 30% { opacity: 1 } 100% { transform: translate(18px,-34px); opacity: 0 } }
    .nod { animation: nod 3s ease-in-out infinite; transform-box: view-box; transform-origin: 200px 175px; }
    @keyframes nod { 0%,100% { transform: rotate(0) } 50% { transform: rotate(-5deg) } }`,
  rumble: `.rumble { animation: rumble .35s ease-in-out infinite alternate; }
    @keyframes rumble { from { transform: translateX(-2px) } to { transform: translateX(2px) } }
    .float { animation: float 2.4s ease-in-out infinite; }
    @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }`,
  sun: `.sun { animation: spin 12s linear infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes spin { to { transform: rotate(360deg) } }
    .sweat { animation: sweat 2s ease-in infinite; }
    @keyframes sweat { 0% { transform: translateY(0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(26px); opacity: 0 } }`,
  breathe: `.breathe { animation: breathe 1s ease-in-out infinite; transform-box: view-box; transform-origin: 200px 380px; }
    @keyframes breathe { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.025) } }`,
  snow: `.snow { animation: snow 4s linear infinite; }
    .snow.b { animation-delay: -2s; }
    @keyframes snow { 0% { transform: translateY(-30px); opacity: 0 } 15% { opacity: 1 } 85% { opacity: 1 } 100% { transform: translateY(40px); opacity: 0 } }`,
  sick: `.temp { animation: temp 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes temp { 0%,100% { transform: scale(1) } 50% { transform: scale(1.35) } }`,
  blush: `.blush { animation: blush 2s ease-in-out infinite; }
    @keyframes blush { 0%,100% { opacity: .55 } 50% { opacity: .95 } }`,
};

const feelings = {
  happy: [
    tile('#FFF4D6') + C(66, 64, 30, '#FFD54A', 0) +
      `<g class="sway" style="transform-origin: 300px 172px">${L('M292 172 Q280 206 236 172', INK, 3) + E(300, 120, 40, 48, '#F0524D') + P('M294 166 l6 10 l6 -10 Z', '#F0524D', 3) + E(285, 102, 8, 14, '#fff', 0, ' opacity="0.6"')}</g>` +
      `<g class="bounce">${at(-12, 70, 0.8, boy({ expr: 'happy', pose: 'up', lift: 4 }))}</g>` +
      `<g class="twinkle">${sparkle(350, 252, 0.9)}</g><g class="twinkle b">${sparkle(328, 214, 0.6, '#7ED0B5')}</g><g class="twinkle b">${sparkle(40, 220, 0.7)}</g>`,
    CSS.sway + CSS.bounce + CSS.twinkle,
  ],
  sad: [
    tile('#E9EEF5') + R(4, 340, 392, 56, 0, '#D3DCE8', 0) + R(4, 340, 392, 56, 0, 'none', 0) +
      E(318, 366, 46, 12, '#F7B6CF', 0) + C(318, 348, 25, '#F7B6CF') + P('M302 334 L334 334 L318 280 Z', '#E7B06C') + L('M306 322 L326 298 M312 334 L330 312', '#C98E48', 3) +
      at(-14, 72, 0.8, boy({ expr: 'sad', pose: 'hug', tilt: -6 })),
    CSS.tear,
  ],
  angry: [
    tile('#FCE7DF') +
      // a knocked-over tower of blocks
      R(286, 330, 40, 40, 6, '#F7D046') + `<g transform="rotate(24 340 350)">${R(320, 328, 40, 40, 6, '#5B8DEF')}</g>` + `<g transform="rotate(-18 300 300)">${R(280, 290, 36, 36, 6, '#7ED0B5')}</g>` +
      `<g class="stomp">${at(-14, 72, 0.8, boy({ expr: 'angry', pose: 'hips' }))}` +
      `<g class="puff">${cloud(84, 92, 1.1)}</g><g class="puff b">${cloud(186, 82, 1.1)}</g></g>` +
      L('M70 390 l-10 -12 M246 390 l10 -12', '#E0906E', 5),
    CSS.stomp + CSS.puff,
  ],
  scared: [
    tile('#E7E4F4') + R(228, 34, 140, 130, 16, '#3E4566') + `<g class="flash">${cloud(266, 96, 1.6, '#8C93B5', 0) + P('M306 92 L292 124 L306 124 L296 152 L324 114 L310 114 L320 92 Z', '#FFD54A', 3)}</g>` +
      L('M228 99 H368 M298 34 V164', '#C9C5DE', 6) + R(228, 34, 140, 130, 16, 'none', 6) +
      `<g class="shiver">${at(-14, 72, 0.8, boy({ expr: 'scared', pose: 'cheeks', armsOver: true }))}</g>` +
      L('M58 196 l-12 6 l12 6 l-12 6 M196 196 l12 6 l-12 6 l12 6', '#9C93C4', 4),
    CSS.flash + CSS.shiver,
  ],
  surprised: [
    tile('#FDEBF3') +
      // a gift box that just opened
      R(262, 286, 100, 80, 8, '#7A6FD8') + R(302, 286, 20, 80, 0, '#FFD54A', 0) + R(262, 286, 100, 80, 8, 'none') +
      `<g class="pop">${R(254, 262, 116, 26, 8, '#9A90EE') + R(302, 262, 20, 26, 0, '#FFD54A', 0) + R(254, 262, 116, 26, 8, 'none')}</g>` +
      `<g class="confetti">${sparkle(276, 214, 0.9, '#F0524D') + sparkle(346, 206, 0.8, '#7ED0B5') + sparkle(312, 182, 1, '#FFC531') + C(290, 240, 5, '#5B8DEF', 0) + C(338, 236, 5, '#F05A8C', 0)}</g>` +
      at(-14, 72, 0.8, boy({ expr: 'surprised', pose: 'wow' })),
    CSS.pop,
  ],
  sleepy: [
    tile('#E3E6F7') + R(250, 40, 116, 110, 16, '#2E3560') + P('M326 72 a26 26 0 1 0 14 46 a20 20 0 1 1 -14 -46 Z', '#FFE08A', 0) + sparkle(272, 66, 0.5, '#fff') + sparkle(292, 120, 0.4, '#fff') + R(250, 40, 116, 110, 16, 'none', 5) +
      // a teddy
      C(328, 330, 26, '#C98E5A') + C(310, 298, 9, '#C98E5A', 3.5) + C(346, 298, 9, '#C98E5A', 3.5) + C(328, 300, 20, '#C98E5A') + C(321, 296, 2.5, INK, 0) + C(335, 296, 2.5, INK, 0) + E(328, 306, 6, 4, '#E8C29A', 2.5) +
      `<g class="nod">${at(-14, 72, 0.8, boy({ expr: 'yawn', pose: 'rub', hair: 'nightcap', shirt: '#B9B3F2', stripe: '#fff', shorts: '#8E86E0', barefoot: true }))}</g>` +
      `<g class="zee">${zee(200, 112, 1.3)}</g><g class="zee b">${zee(214, 92, 1)}</g><g class="zee c">${zee(226, 76, 0.8)}</g>`,
    CSS.zee,
  ],
  hungry: [
    tile('#FFEFE2') +
      `<g class="float">${C(234, 186, 7, '#fff', 3) + C(254, 160, 11, '#fff', 3) + E(316, 96, 62, 48, '#fff', 4) +
        C(290, 98, 20, '#F0524D', 3.5) + L('M290 78 q4 -10 12 -12', '#3E8E41', 4) + P('M314 84 L356 84 Q364 84 362 94 L350 118 L320 118 Z', '#F4C06A', 3.5)}</g>` +
      E(318, 352, 58, 15, '#fff') + E(318, 350, 34, 8, '#EDE6E0', 0) + L('M262 312 V336 M268 312 V326 M256 312 V326', '#B0A69E', 4) +
      at(-14, 72, 0.8, boy({ expr: 'hungry', pose: 'hug' })) +
      `<g class="rumble">${L('M110 270 q-12 -6 0 -12 M104 290 q-14 -6 0 -12', '#E0703B', 4) + L('M192 270 q12 -6 0 -12 M198 290 q14 -6 0 -12', '#E0703B', 4)}</g>`,
    CSS.rumble,
  ],
  thirsty: [
    tile('#FFF2CC') +
      `<g class="sun">${C(330, 74, 34, '#FFC531', 0) + [0, 45, 90, 135, 180, 225, 270, 315].map((d) => { const a = (d * Math.PI) / 180; return L(`M${r1(330 + 44 * Math.cos(a))} ${r1(74 + 44 * Math.sin(a))} L${r1(330 + 58 * Math.cos(a))} ${r1(74 + 58 * Math.sin(a))}`, '#FFC531', 7); }).join('')}</g>` +
      R(4, 344, 392, 52, 0, '#F2D79A', 0) +
      // thought: a glass of water
      `<g class="float">${C(232, 170, 6, '#fff', 3) + C(250, 148, 9, '#fff', 3) + E(306, 186, 46, 40, '#fff', 4) + P('M290 166 L322 166 L318 208 L294 208 Z', '#BFE6FF', 3.5) + P('M292 182 L320 182 L318 208 L294 208 Z', TEAR, 0) + P('M290 166 L322 166 L318 208 L294 208 Z', 'none', 3.5)}</g>` +
      at(-14, 72, 0.8, boy({ expr: 'thirsty', pose: 'cup' })) +
      // an empty cup, upside down
      P('M210 252 L238 252 L234 284 L214 284 Z', '#fff', 3.5) +
      `<g class="sweat">${drop(118, 118, 0.8)}</g>`,
    CSS.sun + CSS.sweat + CSS.rumble,
  ],
  tired: [
    tile('#E6F3E2') + R(4, 330, 392, 66, 0, '#BFE0A8', 0) +
      // a football after a long game
      C(334, 340, 26, '#fff') + P('M334 328 l10 7 l-4 12 h-12 l-4 -12 Z', INK, 0) + L('M334 314 V328 M310 336 L324 335 M358 336 L344 335 M322 362 L328 347 M346 362 L340 347', INK, 3) +
      `<g class="breathe">${at(-6, 62, 0.82, boy({ expr: 'tired', pose: 'slump', sit: true, shirt: '#E8504A', stripe: '#fff' }))}</g>` +
      `<g class="sweat">${drop(132, 120, 0.8)}</g><g class="sweat" style="animation-delay: 1s">${drop(206, 116, 0.7)}</g>`,
    CSS.breathe + CSS.sun,
  ],
  sick: [
    tile('#E4F1F1') +
      // in bed: pillow, then the boy, then the blanket over him
      E(200, 196, 150, 52, '#fff') +
      at(14, 40, 0.93, boy({ expr: 'sick', pose: 'down', blush: 1.3, shirt: '#9CD7C9' })) +
      P('M30 262 Q200 236 370 262 L384 404 L16 404 Z', '#7FB8E8') + L('M54 300 Q200 280 346 300', '#5E9CD3', 5) +
      `<g class="temp">${C(14 + 252 * 0.93, 40 + 165 * 0.93, 7, '#E8504A', 0)}</g>` +
      // a cool cloth on the forehead
      R(152, 100, 96, 18, 8, '#fff', 3.5),
    CSS.sick,
  ],
  shy: [
    tile('#FDE9E6') +
      `<g class="sway" style="transform-origin: 200px 390px">${at(10, 72, 0.8, boy({ expr: 'shy', pose: 'peek', tilt: 8, blush: 1.6, eyesSide: 6, armsOver: true }))}</g>` +
      // the door frame he hides behind
      R(-20, 20, 132, 380, 0, '#C98E5A') + L('M96 20 V400', '#A9714A', 6) + C(86, 236, 7, '#FFD54A', 3) + R(-20, 20, 132, 380, 0, 'none'),
    CSS.sway + CSS.blush,
  ],
  cold: [
    tile('#E2F0FB') + `<path d="M4 340 Q120 320 220 342 T396 336 V396 H4 Z" fill="#fff"/>` +
      `<g class="snow">${[[40, 50], [110, 30], [350, 40], [300, 110], [370, 180], [30, 160]].map(([x, y]) => flake(x, y)).join('')}</g>` +
      `<g class="snow b">${[[340, 270], [60, 300], [250, 60], [180, 20], [320, 210], [80, 230]].map(([x, y]) => flake(x, y, 0.8)).join('')}</g>` +
      `<g class="shiver">${at(52, 40, 0.86, boy({ expr: 'cold', pose: 'cross', hair: 'beanie', scarf: true }))}</g>` +
      L('M112 210 l-10 8 l10 8 l-10 8 M300 210 l10 8 l-10 8 l10 8', '#5B8DEF', 4),
    CSS.snow + CSS.shiver,
  ],
};

/* ------------------------------------------------------------ body parts */
const GIRL = { skin: 'light', hair: 'bob', hairColor: '#3A2418', band: '#F05A8C', shirt: '#F7A14A', shorts: '#7A4FD1', shoe: '#5B8DEF', expr: 'smile' };
const BODY_CSS = `
    .ring { animation: ring 1.6s ease-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes ring { 0% { transform: scale(1); opacity: .9 } 100% { transform: scale(1.6); opacity: 0 } }
    .glow { animation: glow 1.6s ease-in-out infinite; }
    @keyframes glow { 0%,100% { opacity: .55 } 50% { opacity: .95 } }
    .beat { animation: beat 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes beat { 0%,100% { transform: scale(1) } 15% { transform: scale(1.18) } 30% { transform: scale(1) } 45% { transform: scale(1.12) } }`;

/**
 * spot: [cx, cy, rx, ry, rotate] in the child's own coordinates; zoom: magnifier scale (0 = none).
 * The child stands a little left so the magnifier fits top right (or top left: `left`).
 */
function bodyCard({ kid: k, spot, zoom = 1.8, left = false, dx = -26, dy = 6, bg = '#EAF4FF' }) {
  const [sx0, sy0, rx, ry = rx, rot = 0] = spot;
  const kx = left ? -dx : dx;
  const sx = sx0 + kx, sy = sy0 + dy;
  const zx = left ? 84 : 316, zy = 86, zr = 70;
  const ell = (fill, extra = '') => `<ellipse cx="${r1(sx)}" cy="${r1(sy)}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${r1(sx)} ${r1(sy)})" fill="${fill}"${extra}/>`;
  let s = `<defs><g id="kid"><g transform="translate(${kx} ${dy})">${kid({ ...GIRL, ...k })}</g></g>
    <mask id="hole"><rect width="400" height="400" fill="#fff"/>${ell('#000')}</mask>
    <clipPath id="lens"><circle cx="${zx}" cy="${zy}" r="${zr}"/></clipPath>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter></defs>`;
  s += tile(bg) + `<use href="#kid"/>`;
  s += `<rect x="4" y="4" width="392" height="392" rx="60" fill="${bg}" opacity="0.62" mask="url(#hole)"/>`;
  s += `<g class="glow">${ell('none', ` stroke="#FFC531" stroke-width="16" filter="url(#soft)"`)}</g>`;
  s += `<g class="ring">${ell('none', ` stroke="#FFB300" stroke-width="5"`)}</g>`;
  s += ell('none', ` stroke="#FFB300" stroke-width="6"`);
  if (zoom) {
    const ang = Math.atan2(zy - sy, zx - sx);
    const ex = sx + Math.cos(ang) * (Math.max(rx, ry) + 6), ey = sy + Math.sin(ang) * (Math.max(rx, ry) + 6);
    const bx = zx - Math.cos(ang) * (zr + 4), by = zy - Math.sin(ang) * (zr + 4);
    s += L(`M${r1(ex)} ${r1(ey)} L${r1(bx)} ${r1(by)}`, '#FFB300', 5, ' stroke-dasharray="2 10"');
    s += C(zx, zy, zr, '#fff', 0);
    s += `<g clip-path="url(#lens)"><use href="#kid" transform="translate(${zx} ${zy}) scale(${zoom}) translate(${r1(-sx)} ${r1(-sy)})"/></g>`;
    s += C(zx, zy, zr, 'none', 0, ` stroke="#FFB300" stroke-width="8"`) + C(zx, zy, zr - 9, 'none', 0, ` stroke="#fff" stroke-width="3" opacity="0.6"`);
  }
  return file(s, BODY_CSS);
}

const body = {
  eye: bodyCard({ kid: {}, spot: [220, 118, 17], zoom: 2.4 }),
  nose: bodyCard({ kid: {}, spot: [200, 128, 16], zoom: 2.4 }),
  mouth: bodyCard({ kid: {}, spot: [200, 146, 26, 17], zoom: 2.2 }),
  ear: bodyCard({ kid: {}, spot: [142, 122, 18, 22], zoom: 2.2 }),
  hand: bodyCard({ kid: { pose: 'wave', hands: { r: 'open' } }, spot: [294, 162, 34], zoom: 1.7, left: true }),
  finger: bodyCard({ kid: { pose: 'wave', hands: { r: 'point' } }, spot: [292, 152, 12, 24, -10], zoom: 2, left: true }),
  arm: bodyCard({ kid: { pose: 'out', sleeveless: true }, spot: [294, 198, 64, 22, 3], zoom: 0, dx: -36 }),
  foot: bodyCard({ kid: { barefoot: true }, spot: [166, 384, 30, 18], zoom: 2 }),
  leg: bodyCard({ kid: { barefoot: true }, spot: [168, 352, 22, 46], zoom: 0, dx: 0 }),
  teeth: bodyCard({ kid: { expr: 'teeth' }, spot: [200, 150, 30, 20], zoom: 2.3 }),
  tongue: bodyCard({ kid: { expr: 'tongue' }, spot: [200, 158, 18, 22], zoom: 2.3 }),
  face: bodyCard({ kid: {}, spot: [200, 120, 70, 66], zoom: 0, dx: 0 }),
  heart: bodyCard({ kid: { heart: true, pose: 'heart' }, spot: [222, 214, 30], zoom: 1.8 }),
  hair: bodyCard({ kid: { hair: 'bob' }, spot: [200, 92, 78, 50], zoom: 0, dx: 0 }),
  eyebrows: bodyCard({ kid: { brows: 'bold' }, spot: [200, 96, 44, 14], zoom: 2.2 }),
  cheek: bodyCard({ kid: { blush: 1.4 }, spot: [166, 138, 20], zoom: 2.3 }),
  chin: bodyCard({ kid: {}, spot: [200, 166, 24, 13], zoom: 2.3 }),
  neck: bodyCard({ kid: { headUp: 14 }, spot: [200, 172, 22, 16], zoom: 2.2 }),
  shoulder: bodyCard({ kid: { sleeveless: true }, spot: [156, 192, 22], zoom: 2 }),
  elbow: bodyCard({ kid: { pose: 'wave', sleeveless: true }, spot: [284, 226, 20], zoom: 2, left: true }),
  tummy: bodyCard({ kid: { shirtUp: true, pose: 'shirtUp' }, spot: [200, 262, 40, 30], zoom: 1.7 }),
  back: bodyCard({ kid: { back: true, expr: 'neutral' }, spot: [200, 236, 48, 52], zoom: 0, dx: 0 }),
  knee: bodyCard({ kid: { knees: true, barefoot: true }, spot: [168, 354, 18], zoom: 2.4 }),
  toes: bodyCard({ kid: { barefoot: true }, spot: [166, 390, 26, 12], zoom: 2.6 }),
  nails: bodyCard({ kid: { pose: 'wave', hands: { r: 'nails' } }, spot: [292, 150, 30, 18], zoom: 2.2, left: true }),
};

/* ------------------------------------------------------------ write */
let n = 0;
for (const [key, [b, css]] of Object.entries(feelings)) {
  fs.writeFileSync(path.join(PACKS, 'feelings', `${key}.svg`), file(b, css));
  n++;
}
for (const [key, s] of Object.entries(body)) {
  fs.writeFileSync(path.join(PACKS, 'body', `${key}.svg`), s);
  n++;
}
console.log(`draw-feelings-body: wrote ${n} pictures`);
