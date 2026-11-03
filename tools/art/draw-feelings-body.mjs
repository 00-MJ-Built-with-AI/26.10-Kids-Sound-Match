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
import { INK } from './people-lib.mjs';

const PACKS = path.join(process.cwd(), 'public', 'assets', 'packs');

const SK = {
  light: { skin: '#F6CBA5', shade: '#E2A57C' },
  medium: { skin: '#DDA373', shade: '#C2845A' },
};
const BLUSH = '#F59A92';
const TEAR = '#5DB7F5';
const r1 = (n) => +n.toFixed(1);

/* ------------------------------------------------------------ drawing kit (400 x 400 frame) */
const sa = (w, c = INK) => ` stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const P = (d, fill, ink = 4.5, extra = '') => `<path d="${d}" fill="${fill}"${ink ? sa(ink) : ''}${extra}/>`;
const L = (d, c, w, extra = '') => `<path d="${d}" fill="none"${sa(w, c)}${extra}/>`;
const C = (cx, cy, r, fill, ink = 4.5, extra = '') => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${fill}"${ink ? sa(ink) : ''}${extra}/>`;
const E = (cx, cy, rx, ry, fill, ink = 4.5, extra = '') => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${rx}" ry="${ry}" fill="${fill}"${ink ? sa(ink) : ''}${extra}/>`;
const R = (x, y, w, h, rx, fill, ink = 4.5, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${ink ? sa(ink) : ''}${extra}/>`;
const pts = (p) => 'M' + p.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(' L');
const tube = (p, color, w) => L(pts(p), INK, w + 9) + L(pts(p), color, w);
const drop = (x, y, s = 1) => `<path d="M${x} ${y} q${-8 * s} ${13 * s} 0 ${19 * s} q${8 * s} ${-6 * s} 0 ${-19 * s} Z" fill="${TEAR}"${sa(2.5)}/>`;
const sparkle = (x, y, s = 1, c = '#FFC531') =>
  `<path d="M${x} ${y - 14 * s} L${x + 4 * s} ${y - 4 * s} L${x + 14 * s} ${y} L${x + 4 * s} ${y + 4 * s} L${x} ${y + 14 * s} L${x - 4 * s} ${y + 4 * s} L${x - 14 * s} ${y} L${x - 4 * s} ${y - 4 * s} Z" fill="${c}"/>`;
const heartPath = (x, y, s) =>
  `M${x} ${y + 12 * s} C${x - 22 * s} ${y - 2 * s} ${x - 16 * s} ${y - 20 * s} ${x} ${y - 9 * s} C${x + 16 * s} ${y - 20 * s} ${x + 22 * s} ${y - 2 * s} ${x} ${y + 12 * s} Z`;
const zee = (x, y, s, c = '#5B8DEF') => L(`M${x} ${y} h${14 * s} l${-14 * s} ${16 * s} h${14 * s}`, c, 4.5 * s);
const flake = (x, y, s = 1, c = '#9CC9F2') =>
  L(`M${x - 9 * s} ${y} H${x + 9 * s} M${x} ${y - 9 * s} V${y + 9 * s} M${x - 6 * s} ${y - 6 * s} L${x + 6 * s} ${y + 6 * s} M${x + 6 * s} ${y - 6 * s} L${x - 6 * s} ${y + 6 * s}`, c, 3);
const cloud = (x, y, s, fill = '#fff', ink = 3.5) =>
  P(`M${x} ${y} q${-14 * s} -${16 * s} ${4 * s} -${24 * s} q${4 * s} -${18 * s} ${22 * s} -${8 * s} q${16 * s} -${8 * s} ${18 * s} ${10 * s} q${14 * s} ${6 * s} ${2 * s} ${22 * s} Z`, fill, ink);

/* ------------------------------------------------------------ hands */
// A hand at (x, y), the forearm coming from angle `deg` (pointing from elbow to hand).
function hand(x, y, deg, type, skin) {
  if (type === 'mitt') return C(x, y, 15, skin);
  const a = (deg * Math.PI) / 180;
  const at = (d, len) => {
    const b = a + (d * Math.PI) / 180;
    return [x + len * Math.cos(b), y + len * Math.sin(b)];
  };
  const fingers =
    type === 'point' ? [[0, 34]] : [[-62, 22], [-26, 30], [-6, 32], [14, 30], [36, 25]];
  let s = '';
  const segs = fingers.map(([d, len]) => [at(d, 8), at(d, len)]);
  if (type === 'point') segs.push([at(-80, 4), at(-58, 16)]); // the thumb, folded
  s += segs.map((g) => L(pts(g), INK, 19)).join('') + C(x, y, 17, INK, 0);
  s += segs.map((g) => L(pts(g), skin, 10)).join('') + C(x, y, 12.5, skin, 0);
  if (type === 'nails')
    fingers.forEach(([d, len]) => {
      const [nx, ny] = at(d, len - 3);
      s += E(nx, ny, 3.4, 4.2, '#FFE1EA', 1.8, ` transform="rotate(${r1(deg + d + 90)} ${r1(nx)} ${r1(ny)})"`);
    });
  return s;
}

/* ------------------------------------------------------------ the child */
const POSES = {
  down: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [260, 240], [266, 286]] },
  up: { l: [[156, 192], [124, 150], [112, 104]], r: [[244, 192], [276, 150], [288, 104]] },
  wow: { l: [[156, 192], [118, 182], [100, 140]], r: [[244, 192], [282, 182], [300, 140]] },
  hug: { l: [[156, 192], [146, 242], [188, 258]], r: [[244, 192], [254, 242], [212, 258]] },
  hips: { l: [[156, 192], [124, 232], [150, 272]], r: [[244, 192], [276, 232], [250, 272]] },
  cheeks: { l: [[156, 192], [124, 178], [160, 142]], r: [[244, 192], [276, 178], [240, 142]] },
  wave: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [284, 226], [292, 170]] },
  cross: { l: [[156, 192], [142, 238], [226, 232]], r: [[244, 192], [258, 238], [174, 232]] },
  out: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [296, 196], [348, 200]] },
  heart: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [272, 246], [246, 252]] },
  shirtUp: { l: [[156, 192], [142, 232], [164, 238]], r: [[244, 192], [258, 232], [236, 238]] },
  rub: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [262, 172], [226, 124]] },
  cup: { l: [[156, 192], [140, 240], [134, 286]], r: [[244, 192], [270, 236], [292, 214]] },
  belly: { l: [[156, 192], [146, 242], [190, 262]], r: [[244, 192], [262, 236], [292, 214]] },
  peek: { l: [[156, 192], [130, 180], [168, 150]], r: [[244, 192], [262, 238], [240, 268]] },
  slump: { l: [[156, 192], [138, 244], [126, 290]], r: [[244, 192], [262, 244], [274, 290]] },
};

const KID = {
  skin: 'light', hair: 'short', hairColor: '#3A2418', bow: '#F05A8C', band: null, shirt: '#4C9BE8', shorts: '#2F4E9B', shoe: '#E8504A',
  stripe: null, expr: 'neutral', pose: 'down', tilt: 0, lift: 0, armsOver: false, hands: { l: 'mitt', r: 'mitt' }, scarf: false,
  barefoot: false, sleeveless: false, shirtUp: false, back: false, heart: false, headUp: 0, sit: false, brows: 'soft', tears: true, blush: 1,
  eyesSide: 0, knees: false,
};

function hairBack(o) {
  const c = o.hairColor;
  if (o.hair === 'pigtails') return E(132, 120, 22, 34, c) + E(268, 120, 22, 34, c) + bow(140, 84, o.bow) + bow(260, 84, o.bow);
  if (o.hair === 'bob') return P('M134 118 C128 60 170 46 200 46 C232 46 274 60 266 118 L270 176 Q252 190 236 174 L164 174 Q148 190 130 176 Z', c);
  return '';
}
const bow = (x, y, c) => P(`M${x} ${y} l-16 -10 l0 20 Z`, c, 3) + P(`M${x} ${y} l16 -10 l0 20 Z`, c, 3) + C(x, y, 5, c, 3);
function hairFront(o) {
  const c = o.hairColor;
  switch (o.hair) {
    case 'short':
      return P('M142 118 C136 68 168 52 200 52 C234 52 266 68 258 118 C250 94 230 82 214 80 C196 92 168 96 150 92 C146 100 143 108 142 118 Z', c);
    case 'pigtails':
      return P('M144 112 C140 70 170 54 200 54 C232 54 262 70 256 112 C240 88 220 80 200 84 C180 80 160 88 144 112 Z', c);
    case 'bob':
      return P('M146 106 C150 68 176 58 200 58 C226 58 252 68 256 106 C230 92 170 92 146 106 Z', c) + (o.band ? L('M150 92 Q200 56 252 92', o.band, 9) : '');
    case 'beanie':
      return P('M140 112 C138 60 170 46 200 46 C232 46 262 60 260 112 Z', '#E8504A') + R(136, 102, 128, 20, 8, '#F7F2EE') + C(200, 42, 13, '#F7F2EE');
    case 'nightcap':
      return P('M142 108 C140 62 176 50 204 52 C246 56 280 70 300 112 L284 120 C270 96 250 86 230 84 L258 108 Z', '#7A6FD8') + R(138, 98, 124, 18, 8, '#fff') + C(298, 118, 12, '#fff');
  }
  return '';
}

function face(o) {
  const { shade } = SK[o.skin];
  const x = o.expr;
  const ink = INK;
  let s = '';
  const brows = (l, r, w = 5) => L(l, ink, w) + L(r, ink, w);
  const ex = o.eyesSide;
  const roundEyes = (rx = 6.5, ry = 8.5, dy = 0) =>
    E(180 + ex, 118 + dy, rx, ry, ink, 0) + E(220 + ex, 118 + dy, rx, ry, ink, 0) + C(182 + ex, 115 + dy, 2.4, '#fff', 0) + C(222 + ex, 115 + dy, 2.4, '#fff', 0);
  const lids = (dy = 0) => roundEyes(6.5, 8.5, dy) + E(180, 112 + dy, 9, 6, SK[o.skin].skin, 0) + E(220, 112 + dy, 9, 6, SK[o.skin].skin, 0) + L(`M171 ${116 + dy} h18 M211 ${116 + dy} h18`, ink, 4);
  const blushC = x === 'cold' ? '#9CC9F2' : BLUSH;
  const bs = o.blush;
  s += E(166, 136, 10 * bs, 6 * bs, blushC, 0, ` opacity="${bs > 1 ? 0.8 : 0.55}" class="blush"`) + E(234, 136, 10 * bs, 6 * bs, blushC, 0, ` opacity="${bs > 1 ? 0.8 : 0.55}" class="blush"`);
  s += L('M197 124 q6 5 0 9', shade, 4);
  const softBrows = () => brows('M170 101 q10 -6 20 0', 'M210 101 q10 -6 20 0', 4);
  switch (x) {
    case 'happy':
      s += L('M171 121 q9 -11 18 0', ink, 5) + L('M211 121 q9 -11 18 0', ink, 5);
      s += P('M178 138 Q200 166 222 138 Z', '#8A2B1E', 3.5) + P('M190 152 Q200 145 210 152 Q200 159 190 152 Z', '#F07B7B', 0);
      break;
    case 'smile': // body cards: eyes open, a warm smile
      s += (o.brows === 'bold' ? '' : softBrows()) + roundEyes();
      s += P('M180 138 Q200 160 220 138 Z', '#8A2B1E', 3.5) + P('M191 150 Q200 145 209 150 Q200 156 191 150 Z', '#F07B7B', 0);
      break;
    case 'teeth':
      s += softBrows() + roundEyes();
      s += P('M174 136 Q200 172 226 136 Z', '#8A2B1E', 3.5) + P('M178 138 L222 138 Q220 147 214 148 L186 148 Q180 147 178 138 Z', '#fff', 0);
      s += P('M190 160 Q200 164 210 160 L207 155 L193 155 Z', '#fff', 0) + L('M189 139 V147 M200 139 V148 M211 139 V147', '#D9D2CC', 1.8) + P('M174 136 Q200 172 226 136 Z', 'none', 3.5);
      break;
    case 'tongue':
      s += softBrows() + roundEyes();
      s += P('M184 140 Q200 152 216 140 Q214 148 200 150 Q186 148 184 140 Z', '#8A2B1E', 3.5);
      s += P('M189 144 L211 144 L211 160 Q211 172 200 172 Q189 172 189 160 Z', '#F07B7B', 3.5) + L('M200 150 V164', '#D85C64', 2.5);
      break;
    case 'sad':
      s += brows('M168 106 L190 98', 'M210 98 L232 106') + roundEyes(6, 7.5, 3);
      s += L('M186 152 Q200 140 214 152', ink, 4.5);
      if (o.tears) s += `<g class="tear">${drop(176, 128)}</g><g class="tear t2">${drop(226, 130, 0.8)}</g>`;
      break;
    case 'angry':
      s += brows('M168 98 L190 108', 'M210 108 L232 98', 6) + roundEyes(6, 7, 3);
      s += R(183, 140, 34, 13, 5, '#fff', 3.5) + L('M183 146.5 L217 146.5', ink, 2.5);
      break;
    case 'scared':
      s += brows('M168 100 Q178 92 190 96', 'M210 96 Q222 92 232 100');
      s += E(180, 118, 10, 12, '#fff', 3.5) + E(220, 118, 10, 12, '#fff', 3.5) + C(180, 120, 4, ink, 0) + C(220, 120, 4, ink, 0);
      s += L('M184 148 q4 -5 8 0 q4 5 8 0 q4 -5 8 0 q4 5 8 0', ink, 4);
      break;
    case 'surprised':
      s += brows('M168 96 Q179 86 190 94', 'M210 94 Q221 86 232 96') + roundEyes(7.5, 10);
      s += E(200, 150, 10, 13, '#8A2B1E', 3.5);
      break;
    case 'yawn':
      s += brows('M170 103 q10 -4 20 0', 'M210 103 q10 -4 20 0', 4) + L('M171 120 q9 7 18 0', ink, 5) + L('M211 120 q9 7 18 0', ink, 5);
      s += E(200, 150, 10, 14, '#8A2B1E', 3.5) + E(200, 157, 6, 4, '#F07B7B', 0);
      break;
    case 'hungry':
      s += brows('M168 104 L190 99', 'M210 99 L232 104') + roundEyes(6.5, 8.5, 0);
      s += P('M188 146 Q200 140 212 146 Q200 154 188 146 Z', '#8A2B1E', 3.5);
      break;
    case 'thirsty':
      s += brows('M168 104 L190 100', 'M210 100 L232 104') + lids(2);
      s += E(200, 146, 10, 9, '#8A2B1E', 3.5) + P('M193 148 L207 148 L207 160 Q207 166 200 166 Q193 166 193 160 Z', '#F07B7B', 3);
      break;
    case 'tired':
      s += brows('M168 104 L190 101', 'M210 101 L232 104', 4) + lids(3);
      s += E(200, 148, 9, 8, '#8A2B1E', 3.5);
      break;
    case 'sick':
      s += brows('M168 104 L190 98', 'M210 98 L232 104', 4) + lids(3);
      s += L('M186 150 Q200 144 214 150', ink, 4) + L('M206 148 L250 164', '#fff', 7) + L('M206 148 L250 164', ink, 1.5, ' opacity="0.4"') + C(252, 165, 5, '#E8504A', 2.5);
      break;
    case 'shy':
      s += brows('M170 102 q10 -4 20 0', 'M210 102 q10 -4 20 0', 4) + roundEyes(6, 7.5, 4);
      s += L('M190 146 q5 4 10 0 q5 -4 10 0', ink, 4);
      break;
    case 'cold':
      s += brows('M168 104 L190 100', 'M210 100 L232 104') + roundEyes(6, 7.5, 2);
      s += R(184, 139, 32, 12, 5, '#fff', 3.5) + L('M192 139 V151 M200 139 V151 M208 139 V151', ink, 2);
      break;
    default:
      s += softBrows() + roundEyes() + L('M188 140 Q200 150 212 140', ink, 4.5);
  }
  if (o.brows === 'bold') s += brows('M166 100 Q180 88 192 98', 'M208 98 Q220 88 234 100', 8);
  return s;
}

/** The whole child, front view (or from behind with `back`). */
function kid(opt = {}) {
  const o = { ...KID, ...opt, hands: { ...KID.hands, ...(opt.hands ?? {}) } };
  const { skin, shade } = SK[o.skin];
  const pose = POSES[o.pose];
  const arm = (a, side) => {
    const sleeveEnd = [a[0][0] + (a[1][0] - a[0][0]) * 0.45, a[0][1] + (a[1][1] - a[0][1]) * 0.45];
    const deg = (Math.atan2(a[2][1] - a[1][1], a[2][0] - a[1][0]) * 180) / Math.PI;
    let g = tube(a, skin, 24);
    if (!o.sleeveless) g += tube([a[0], sleeveEnd], o.shirt, 34);
    g += hand(a[2][0], a[2][1], deg, o.hands[side], skin);
    return `<g class="arm-${side}">${g}</g>`;
  };
  let s = `<g transform="translate(0 ${-o.lift})">`;
  // legs and feet
  if (o.sit) {
    s += tube([[172, 322], [134, 352], [104, 368]], skin, 28) + tube([[228, 322], [266, 352], [296, 368]], skin, 28);
    s += P('M78 380 Q74 356 98 352 Q116 352 120 372 Z', o.shoe) + P('M322 380 Q326 356 302 352 Q284 352 280 372 Z', o.shoe);
  } else {
    s += tube([[170, 320], [168, 354], [166, 380]], skin, 28) + tube([[230, 320], [232, 354], [234, 380]], skin, 28);
    if (o.knees) s += L('M158 356 q10 6 20 0 M222 356 q10 6 20 0', shade, 3.5);
    if (o.barefoot) {
      for (const [fx, dir] of [[166, -1], [234, 1]]) {
        s += P(`M${fx - 20} 392 Q${fx - 22} 372 ${fx} 372 Q${fx + 22} 372 ${fx + 20} 392 Z`, skin);
        [-14, -7, 0, 7, 14].forEach((t, i) => (s += C(fx + t * dir * -1, 392 - (i === 0 || i === 4 ? 1 : 0), i === (dir < 0 ? 4 : 0) ? 5.5 : 4.2, skin, 3)));
      }
    } else {
      s += P('M140 392 Q140 370 166 370 Q186 370 188 392 Z', o.shoe) + P('M212 392 Q214 370 234 370 Q260 370 260 392 Z', o.shoe);
    }
  }
  s += P('M142 286 L258 286 L262 326 L210 326 L200 306 L190 326 L138 326 Z', o.shorts);
  // neck, body
  s += R(188, 160 - o.headUp, 24, 30 + o.headUp, 0, skin, 0) + L(`M188 ${160 - o.headUp} V190 M212 ${160 - o.headUp} V190`, INK, 4.5);
  if (o.shirtUp) {
    s += P('M150 230 L250 230 L256 292 L144 292 Z', skin) + L('M194 262 q6 6 12 0', shade, 4) + C(200, 264, 3, shade, 0);
    s += P('M146 196 Q148 180 166 178 L234 178 Q252 180 254 196 L256 236 Q200 246 144 236 Z', o.shirt);
  } else if (o.sleeveless) {
    s += P('M160 196 Q160 180 176 180 Q200 196 224 180 Q240 180 240 196 L258 292 L142 292 Z', o.shirt);
  } else {
    s += P('M146 196 Q148 180 166 178 L234 178 Q252 180 254 196 L258 292 L142 292 Z', o.shirt);
  }
  if (o.sleeveless) s += C(156, 194, 14, skin) + C(244, 194, 14, skin);
  if (o.stripe) s += L('M148 222 H252 M146 252 H254', o.stripe, 9);
  if (o.heart) s += `<g class="beat">${P(heartPath(222, 214, 1.15), '#E8304A', 3.5)}</g>`;
  if (o.scarf) s += P('M160 180 Q200 200 240 180 L240 196 Q200 214 160 196 Z', '#E8504A') + P('M214 196 L230 196 L234 244 L216 246 Z', '#E8504A');
  const arms = arm(pose.l, 'l') + arm(pose.r, 'r');
  if (!o.armsOver) s += arms;
  // head
  s += `<g class="head" transform="translate(0 ${-o.headUp}) rotate(${o.tilt} 200 170)">`;
  s += hairBack(o);
  s += E(142, 122, 11, 15, skin) + E(258, 122, 11, 15, skin) + C(200, 116, 58, skin);
  if (o.back) {
    s += P('M142 128 C134 66 168 52 200 52 C234 52 268 66 258 128 C246 150 154 150 142 128 Z', o.hairColor) + L('M186 80 q14 10 28 0', '#5A3A28', 4);
  } else {
    s += face(o) + hairFront(o);
  }
  s += '</g>';
  if (o.armsOver) s += arms;
  s += '</g>';
  return s;
}

/* ------------------------------------------------------------ files */
const MOTION = `
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;
function file(body, css) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <style>${css}${MOTION}
  </style>
  <defs><clipPath id="tile"><rect x="4" y="4" width="392" height="392" rx="60"/></clipPath></defs>
  <g transform="scale(1.28)"><g clip-path="url(#tile)">${body}</g></g>
</svg>
`;
}
const tile = (c) => R(4, 4, 392, 392, 60, c, 0);
const at = (x, y, sc, body) => `<g transform="translate(${x} ${y}) scale(${sc})">${body}</g>`;

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
