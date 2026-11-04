// Drawing kit for the whole-child pictures (Feelings, Body parts, Do it with me, Look after the
// baby, Our day): a child in a 400 x 400 frame, outlined like the other drawings, plus the SVG file
// wrapper whose <style> holds each picture's movement (stopped when the phone asks for less motion).
import path from 'node:path';
/** A soft warm brown for every outline: gentler than black, still clear for small eyes. */
export const INK = '#5A3B2B';
/** The head is drawn bigger than life (a big head reads as young and sweet), scaled about the neck. */
export const HEAD_SCALE = 1.3;
export const HEAD_PIVOT = [200, 172];
/** Where a point of the face ends up once the head is scaled (for highlighting a face part). */
export const headPt = (x, y) => [HEAD_PIVOT[0] + (x - HEAD_PIVOT[0]) * HEAD_SCALE, HEAD_PIVOT[1] + (y - HEAD_PIVOT[1]) * HEAD_SCALE];

export const PACKS = path.join(process.cwd(), 'public', 'assets', 'packs');

export const SK = {
  light: { skin: '#F6CBA5', shade: '#E2A57C' },
  medium: { skin: '#DDA373', shade: '#C2845A' },
};
export const BLUSH = '#FF8FA3';
export const TEAR = '#5DB7F5';
export const r1 = (n) => +n.toFixed(1);

/* ------------------------------------------------------------ drawing kit (400 x 400 frame) */
export const sa = (w, c = INK) => ` stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
export const P = (d, fill, ink = 4.5, extra = '') => `<path d="${d}" fill="${fill}"${ink ? sa(ink) : ''}${extra}/>`;
export const L = (d, c, w, extra = '') => `<path d="${d}" fill="none"${sa(w, c)}${extra}/>`;
export const C = (cx, cy, r, fill, ink = 4.5, extra = '') => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${fill}"${ink ? sa(ink) : ''}${extra}/>`;
export const E = (cx, cy, rx, ry, fill, ink = 4.5, extra = '') => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${rx}" ry="${ry}" fill="${fill}"${ink ? sa(ink) : ''}${extra}/>`;
export const R = (x, y, w, h, rx, fill, ink = 4.5, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${ink ? sa(ink) : ''}${extra}/>`;
export const pts = (p) => 'M' + p.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(' L');
export const tube = (p, color, w) => L(pts(p), INK, w + 8) + L(pts(p), color, w);
export const drop = (x, y, s = 1) => `<path d="M${x} ${y} q${-8 * s} ${13 * s} 0 ${19 * s} q${8 * s} ${-6 * s} 0 ${-19 * s} Z" fill="${TEAR}"${sa(2.5)}/>`;
export const sparkle = (x, y, s = 1, c = '#FFC531') =>
  `<path d="M${x} ${y - 14 * s} L${x + 4 * s} ${y - 4 * s} L${x + 14 * s} ${y} L${x + 4 * s} ${y + 4 * s} L${x} ${y + 14 * s} L${x - 4 * s} ${y + 4 * s} L${x - 14 * s} ${y} L${x - 4 * s} ${y - 4 * s} Z" fill="${c}"/>`;
export const heartPath = (x, y, s) =>
  `M${x} ${y + 12 * s} C${x - 22 * s} ${y - 2 * s} ${x - 16 * s} ${y - 20 * s} ${x} ${y - 9 * s} C${x + 16 * s} ${y - 20 * s} ${x + 22 * s} ${y - 2 * s} ${x} ${y + 12 * s} Z`;
export const zee = (x, y, s, c = '#5B8DEF') => L(`M${x} ${y} h${14 * s} l${-14 * s} ${16 * s} h${14 * s}`, c, 4.5 * s);
export const flake = (x, y, s = 1, c = '#9CC9F2') =>
  L(`M${x - 9 * s} ${y} H${x + 9 * s} M${x} ${y - 9 * s} V${y + 9 * s} M${x - 6 * s} ${y - 6 * s} L${x + 6 * s} ${y + 6 * s} M${x + 6 * s} ${y - 6 * s} L${x - 6 * s} ${y + 6 * s}`, c, 3);
export const cloud = (x, y, s, fill = '#fff', ink = 3.5) =>
  P(`M${x} ${y} q${-14 * s} -${16 * s} ${4 * s} -${24 * s} q${4 * s} -${18 * s} ${22 * s} -${8 * s} q${16 * s} -${8 * s} ${18 * s} ${10 * s} q${14 * s} ${6 * s} ${2 * s} ${22 * s} Z`, fill, ink);

/* ------------------------------------------------------------ hands */
// A hand at (x, y), the forearm coming from angle `deg` (pointing from elbow to hand).
export function hand(x, y, deg, type, skin) {
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
export const POSES = {
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

export const KID = {
  skin: 'light', hair: 'short', hairColor: '#3A2418', bow: '#F05A8C', band: null, shirt: '#4C9BE8', shorts: '#2F4E9B', shoe: '#E8504A',
  stripe: null, expr: 'neutral', pose: 'down', tilt: 0, lift: 0, armsOver: false, hands: { l: 'mitt', r: 'mitt' }, scarf: false,
  barefoot: false, sleeveless: false, shirtUp: false, back: false, heart: false, headUp: 0, sit: false, brows: 'soft', tears: true, blush: 1,
  eyesSide: 0, knees: false, legs: null, armWrap: null,
};

/** Rotates `content` about (x, y) with the CSS class `cls` (its keyframes use plain rotate()). */
export const pivot = (x, y, cls, content) =>
  `<g transform="translate(${x} ${y})"><g class="${cls}"><g transform="translate(${-x} ${-y})">${content}</g></g></g>`;

/**
 * A flip-book: the frames take turns, each shown for an equal share of \`sec\` seconds. With less
 * motion (and in still copies) only the first frame shows. Returns [svg, css].
 */
export function frames(list, sec, name = 'fr') {
  const n = list.length;
  const share = (100 / n).toFixed(2);
  const svg = list.map((f, i) => `<g class="${name} ${name}${i}">${f}</g>`).join('');
  let css = `
    .${name} { animation: ${name} ${sec}s steps(1) infinite; }
    .${name}:not(.${name}0) { opacity: 0; }
    @keyframes ${name} { 0% { opacity: 1 } ${share}% { opacity: 0 } 100% { opacity: 0 } }`;
  for (let i = 1; i < n; i++) css += `\n    .${name}${i} { animation-delay: ${((sec * i) / n).toFixed(2)}s; }`;
  return [svg, css];
}

export function hairBack(o) {
  const c = o.hairColor;
  if (o.hair === 'pigtails') return E(132, 120, 22, 34, c) + E(268, 120, 22, 34, c) + bow(140, 84, o.bow) + bow(260, 84, o.bow);
  if (o.hair === 'bob') return P('M134 118 C128 60 170 46 200 46 C232 46 274 60 266 118 L270 176 Q252 190 236 174 L164 174 Q148 190 130 176 Z', c);
  return '';
}
export const bow = (x, y, c) => P(`M${x} ${y} l-16 -10 l0 20 Z`, c, 3) + P(`M${x} ${y} l16 -10 l0 20 Z`, c, 3) + C(x, y, 5, c, 3);
/** A soft white shine on the hair. */
export function hairShine(o) {
  if (!['short', 'bob', 'pigtails'].includes(o.hair)) return '';
  return L('M160 84 Q176 66 198 62', '#fff', 5, ' opacity="0.35"');
}

export function hairFront(o) {
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

export function face(o) {
  const { shade } = SK[o.skin];
  const x = o.expr;
  const ink = INK;
  let s = '';
  const brows = (l, r, w = 5) => L(l, ink, w) + L(r, ink, w);
  const ex = o.eyesSide;
  // Big shiny eyes: a dark iris with a large sparkle and a small one, and lashes for the girl.
  const roundEyes = (rx0 = 6.5, ry0 = 8.5, dy = 0) => {
    const rx = rx0 * 1.3, ry = ry0 * 1.3;
    let e = '';
    for (const cx of [180 + ex, 220 + ex]) {
      const cy = 118 + dy;
      e += E(cx, cy, rx, ry, '#3A2418', 0) + E(cx, cy + ry * 0.35, rx * 0.7, ry * 0.45, '#6B4A3A', 0, ' opacity="0.6"');
      e += C(cx + rx * 0.32, cy - ry * 0.36, rx * 0.42, '#fff', 0) + C(cx - rx * 0.38, cy + ry * 0.38, rx * 0.2, '#fff', 0, ' opacity="0.9"');
      if (o.lashes) e += L(`M${cx + (cx < 200 ? -rx : rx) * 0.9} ${cy - ry * 0.55} l${cx < 200 ? -6 : 6} -5`, ink, 3);
    }
    return e;
  };
  const lids = (dy = 0) => roundEyes(6.5, 8.5, dy) + E(180, 112 + dy, 9, 6, SK[o.skin].skin, 0) + E(220, 112 + dy, 9, 6, SK[o.skin].skin, 0) + L(`M171 ${116 + dy} h18 M211 ${116 + dy} h18`, ink, 4);
  const blushC = x === 'cold' ? '#9CC9F2' : BLUSH;
  const bs = o.blush;
  s += E(164, 138, 12 * bs, 8 * bs, blushC, 0, ` opacity="${bs > 1 ? 0.85 : 0.6}" class="blush"`) + E(236, 138, 12 * bs, 8 * bs, blushC, 0, ` opacity="${bs > 1 ? 0.85 : 0.6}" class="blush"`);
  s += C(160, 135, 2.2, '#fff', 0, ' opacity="0.8"') + C(232, 135, 2.2, '#fff', 0, ' opacity="0.8"');
  s += L('M198 127 q4 3 0 6', shade, 3.5);
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
    case 'kiss':
      s += L('M171 121 q9 -11 18 0', ink, 5) + L('M211 121 q9 -11 18 0', ink, 5) + E(202, 146, 6, 7, '#E8506A', 3.5) + L('M202 143 v6', '#B83A50', 2);
      break;
    case 'sing':
      s += softBrows() + L('M171 121 q9 -11 18 0', ink, 5) + L('M211 121 q9 -11 18 0', ink, 5) + E(200, 148, 10, 13, '#8A2B1E', 3.5) + E(200, 155, 6, 4, '#F07B7B', 0);
      break;
    case 'asleep':
      s += L('M171 119 q9 8 18 0', ink, 5) + L('M211 119 q9 8 18 0', ink, 5) + L('M192 144 Q200 150 208 144', ink, 4);
      break;
    case 'shh':
      s += softBrows() + roundEyes() + E(200, 145, 6, 5, '#8A2B1E', 3);
      break;
    default:
      s += softBrows() + roundEyes() + L('M188 140 Q200 150 212 140', ink, 4.5);
  }
  if (o.brows === 'bold') s += brows('M166 100 Q180 88 192 98', 'M208 98 Q220 88 234 100', 8);
  return s;
}

/** The whole child, front view (or from behind with `back`). */
export function kid(opt = {}) {
  const o = { ...KID, ...opt, hands: { ...KID.hands, ...(opt.hands ?? {}) } };
  const { skin, shade } = SK[o.skin];
  const pose = POSES[o.pose];
  const arm = (a, side) => {
    const sleeveEnd = [a[0][0] + (a[1][0] - a[0][0]) * 0.45, a[0][1] + (a[1][1] - a[0][1]) * 0.45];
    const deg = (Math.atan2(a[2][1] - a[1][1], a[2][0] - a[1][0]) * 180) / Math.PI;
    let g = tube(a, skin, 24);
    if (!o.sleeveless) g += tube([a[0], sleeveEnd], o.shirt, 34);
    g += hand(a[2][0], a[2][1], deg, o.hands[side], skin);
    const wrapped = `<g class="arm-${side}">${g}</g>`;
    return o.armWrap?.[side] ? o.armWrap[side](wrapped) : wrapped;
  };
  let s = `<g transform="translate(0 ${-o.lift})">`;
  // legs and feet
  if (o.legs) {
    for (const side of ['l', 'r']) {
      const lg = o.legs[side];
      s += tube(lg, skin, 28);
      const [fx, fy] = lg[lg.length - 1];
      s += o.barefoot ? C(fx, fy + 4, 15, skin) : E(fx + (side === 'l' ? -6 : 6), fy + 8, 24, 12, o.shoe);
    }
  } else if (o.sit) {
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
    s += P('M150 196 Q150 178 172 178 L228 178 Q250 178 250 196 Q262 246 262 290 Q200 302 138 290 Q138 246 150 196 Z', o.shirt);
  }
  if (o.sleeveless) s += C(156, 194, 14, skin) + C(244, 194, 14, skin);
  if (o.stripe) s += L('M148 222 H252 M146 252 H254', o.stripe, 9);
  if (o.heart) s += `<g class="beat">${P(heartPath(222, 214, 1.15), '#E8304A', 3.5)}</g>`;
  if (o.scarf) s += P('M160 180 Q200 200 240 180 L240 196 Q200 214 160 196 Z', '#E8504A') + P('M214 196 L230 196 L234 244 L216 246 Z', '#E8504A');
  const arms = arm(pose.l, 'l') + arm(pose.r, 'r');
  if (!o.armsOver) s += arms;
  // head
  s += `<g class="head" transform="translate(0 ${-o.headUp}) rotate(${o.tilt} 200 170)"><g transform="translate(${HEAD_PIVOT[0]} ${HEAD_PIVOT[1]}) scale(${HEAD_SCALE}) translate(${-HEAD_PIVOT[0]} ${-HEAD_PIVOT[1]})">`;
  s += hairBack(o);
  s += E(142, 122, 11, 15, skin) + E(258, 122, 11, 15, skin) + C(200, 116, 58, skin);
  if (o.back) {
    s += P('M142 128 C134 66 168 52 200 52 C234 52 268 66 258 128 C246 150 154 150 142 128 Z', o.hairColor) + L('M186 80 q14 10 28 0', '#5A3A28', 4);
  } else {
    s += face(o) + hairFront(o) + hairShine(o);
  }
  s += '</g></g>';
  if (o.armsOver) s += arms;
  s += '</g>';
  return s;
}

/* ------------------------------------------------------------ files */
export const MOTION = `
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;
export function file(body, css) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <style>${css}${MOTION}
  </style>
  <defs><clipPath id="tile"><rect x="4" y="4" width="392" height="392" rx="60"/></clipPath></defs>
  <g transform="scale(1.28)"><g clip-path="url(#tile)">${body}</g></g>
</svg>
`;
}
/** The picture's background: its colour, a soft glow, and a few tiny sparkles and dots. */
export const tile = (c) =>
  R(4, 4, 392, 392, 60, c, 0) +
  `<circle cx="200" cy="150" r="190" fill="#fff" opacity="0.35"/>` +
  [[40, 60, 4], [360, 52, 3], [34, 300, 3], [366, 320, 4], [70, 180, 2.5], [330, 196, 2.5]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.8"/>`)
    .join('') +
  sparkle(352, 104, 0.45, '#fff') + sparkle(52, 120, 0.35, '#fff');
export const at = (x, y, sc, body) => `<g transform="translate(${x} ${y}) scale(${sc})">${body}</g>`;

