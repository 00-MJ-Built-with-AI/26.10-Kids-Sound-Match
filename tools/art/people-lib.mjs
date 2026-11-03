// Drawing kit for the pictures drawn for the app (Family, Jobs, Body parts, Do it with me):
// bold outlines, flat colours, big heads, a pale coloured circle behind each picture.
export const INK = '#4A2C12';
export const OW = 7;
export const SKINS = {
  light: { skin: '#F6CBA5', shade: '#E2A57C' },
  medium: { skin: '#DDA373', shade: '#C2845A' },
  brown: { skin: '#A86F48', shade: '#8C5636' },
};
export const HAIR = '#3A2418';
export const GREY = '#D3D3DA';
export const BLUSH = '#F59A92';

export const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${body}\n</svg>\n`;
export const disc = (color) => `\n  <circle cx="256" cy="256" r="240" fill="${color}"/>`;

// A stroke-width given in `extra` replaces the default one.
const stroke = (on = true, extra = '') =>
  on ? ` stroke="${INK}"${extra.includes('stroke-width') ? '' : ` stroke-width="${OW}"`} stroke-linejoin="round" stroke-linecap="round"` : '';
export const path = (d, fill, line = true, extra = '') => `\n  <path d="${d}" fill="${fill}"${stroke(line, extra)}${extra}/>`;
export const line = (d, color, w, extra = '') =>
  `\n  <path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
export const circ = (cx, cy, r, fill, ln = true, extra = '') => `\n  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke(ln, extra)}${extra}/>`;
export const ell = (cx, cy, rx, ry, fill, ln = true, extra = '') =>
  `\n  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${stroke(ln, extra)}${extra}/>`;
export const rect = (x, y, w, h, rx, fill, ln = true, extra = '') =>
  `\n  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${stroke(ln, extra)}${extra}/>`;
const pts = (p) => 'M' + p.map(([x, y]) => `${x} ${y}`).join(' L');
/** A limb or a hose: an outlined round-ended tube along the points. */
export const tube = (p, color, w) => line(pts(p), INK, w + OW * 2) + line(pts(p), color, w);

/* ---------------------------------------------------------------- people */

const ADULT = { hy: 150, R: 66, top: 236, waist: 368, feet: 462, sw: 64, hw: 50 };
const CHILD = { hy: 206, R: 72, top: 292, waist: 388, feet: 462, sw: 52, hw: 42 };

/** Everything on the head is drawn for a head at (256, 150) with radius 66, then moved and sized. */
const headFrame = (L, body) => `\n  <g transform="translate(256 ${L.hy}) scale(${(L.R / 66).toFixed(3)}) translate(-256 -150)">${body}\n  </g>`;

const HAIRS = {
  short: (c) => path('M190 160 C182 100 216 78 256 78 C298 78 332 100 322 160 C314 136 300 122 284 116 C262 130 232 132 210 118 C198 128 192 142 190 160 Z', c),
  curly: (c) =>
    path('M190 156 C184 100 218 80 256 80 C296 80 330 100 322 156 C300 126 214 126 190 156 Z', c) +
    [196, 214, 232, 250, 268, 286, 304, 322, 340]
      .map((deg) => circ(+(256 + 64 * Math.cos((deg * Math.PI) / 180)).toFixed(1), +(150 + 64 * Math.sin((deg * Math.PI) / 180)).toFixed(1), 15, c))
      .join(''),
  longBack: (c) => path('M184 150 C176 88 216 70 256 70 C298 70 338 88 330 150 L340 290 Q312 304 296 280 L216 280 Q200 304 172 290 Z', c),
  longFront: (c) => path('M190 156 C186 98 220 78 258 78 C298 78 330 100 324 158 C306 126 282 112 260 108 C246 130 218 144 190 156 Z', c),
  bobBack: (c) => path('M180 152 C174 90 216 70 256 70 C298 70 340 90 334 152 L336 212 Q318 228 302 214 L210 214 Q194 228 176 212 Z', c),
  bobFront: (c, band) =>
    path('M190 132 C192 94 222 80 256 80 C292 80 322 94 324 132 C300 118 212 118 190 132 Z', c) + line('M192 120 Q256 84 322 120', band, 12),
  bun: (c) => circ(256, 76, 26, c) + path('M190 150 C186 100 220 82 256 82 C292 82 326 100 322 150 C304 124 284 116 256 116 C228 116 208 124 190 150 Z', c),
  bald: (c) =>
    path('M192 170 C184 140 194 118 214 112 C208 132 206 150 208 172 Z', c) +
    path('M320 170 C328 140 318 118 298 112 C304 132 306 150 304 172 Z', c),
  pigtailsBack: (c, bow) =>
    ell(178, 150, 26, 40, c) + ell(334, 150, 26, 40, c) + bowTie(184, 108, bow) + bowTie(328, 108, bow),
  ponytailBack: (c, bow) => ell(330, 176, 30, 52, c) + bowTie(318, 128, bow),
  fringe: (c) => path('M190 150 C186 98 220 80 256 80 C294 80 326 98 322 150 C306 118 280 108 256 120 C232 108 206 118 190 150 Z', c),
};

export function bowTie(x, y, color) {
  return path(`M${x} ${y} L${x - 22} ${y - 14} L${x - 22} ${y + 14} Z`, color) + path(`M${x} ${y} L${x + 22} ${y - 14} L${x + 22} ${y + 14} Z`, color) + circ(x, y, 7, color);
}

function face({ skin, shade }, o) {
  let s = ell(190, 160, 13, 17, skin) + ell(322, 160, 13, 17, skin) + circ(256, 150, 66, skin);
  // Eyes: closed happy arcs, sleeping arcs, or round eyes.
  if (o.happyEyes) s += line('M222 152 q10 -10 20 0', INK, 6) + line('M270 152 q10 -10 20 0', INK, 6);
  else if (o.sleepEyes) s += line('M222 150 q10 9 20 0', INK, 6) + line('M270 150 q10 9 20 0', INK, 6);
  else s += ell(234, 152, 7.5, 10, INK, false) + ell(278, 152, 7.5, 10, INK, false) + circ(236.5, 148, 2.8, '#fff', false) + circ(280.5, 148, 2.8, '#fff', false);
  if (o.brows) s += line('M222 132 q12 -6 24 0', o.brows, 5) + line('M266 132 q12 -6 24 0', o.brows, 5);
  s += ell(214, 176, 11, 7, BLUSH, false, ' opacity="0.55"') + ell(298, 176, 11, 7, BLUSH, false, ' opacity="0.55"');
  s += line('M253 164 q6 6 -1 9', shade, 4);
  if (o.beard) s += path('M192 160 C194 214 222 228 256 228 C290 228 318 214 320 160 C312 186 300 198 290 200 C276 192 236 192 222 200 C212 198 200 186 192 160 Z', o.beard);
  if (o.mustache) s += path('M230 188 Q243 176 256 184 Q269 176 282 188 Q270 196 256 190 Q242 196 230 188 Z', o.mustache);
  // Mouths: smile (default), "o" (drinking, singing), kiss, wide open (eating, laughing), none.
  const mouth = o.mouth ?? 'smile';
  if (mouth === 'smile') s += path('M241 192 Q256 210 271 192 Z', o.beard ? '#E8837A' : '#8A2B1E', false) + line('M241 192 Q256 210 271 192 Z', INK, 3.5);
  else if (mouth === 'o') s += ell(256, 196, 8, 10, '#8A2B1E', true, ' stroke-width="3.5"');
  else if (mouth === 'kiss') s += path('M250 190 Q262 194 254 198 Q264 202 250 206', 'none', false, ` stroke="#C0392B" stroke-width="5" stroke-linecap="round"`);
  else if (mouth === 'laugh') s += path('M232 184 Q256 230 280 184 Z', '#8A2B1E', true, ' stroke-width="3.5"') + ell(256, 210, 10, 6, '#F27C8A', false);
  else if (mouth === 'wide') s += ell(256, 198, 13, 12, '#8A2B1E', true, ' stroke-width="3.5"') + ell(256, 205, 7, 4, '#F27C8A', false);
  if (o.glasses) s += circ(234, 152, 17, '#fff', true, ' fill-opacity="0.25" stroke-width="5"') + circ(278, 152, 17, '#fff', true, ' fill-opacity="0.25" stroke-width="5"') + line('M251 150 L261 150', INK, 5);
  if (o.goggles) s += rect(208, 136, 96, 34, 14, '#BFE3FF', true, ' fill-opacity="0.6" stroke-width="5"') + line('M196 150 L208 150 M304 150 L316 150', INK, 5);
  if (o.earrings) s += circ(190, 182, 6, '#F5C542') + circ(322, 182, 6, '#F5C542');
  if (o.smudge) s += ell(300, 182, 9, 5, '#5A5A5A', false, ' opacity="0.6"');
  return s;
}

export function star(cx, cy, r, color) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    p.push([+(cx + rr * Math.cos(a)).toFixed(1), +(cy + rr * Math.sin(a)).toFixed(1)]);
  }
  return path(pts(p) + ' Z', color, true, ' stroke-width="3"');
}

const HATS = {
  chef: () =>
    circ(222, 54, 28, '#fff') + circ(290, 54, 28, '#fff') + circ(256, 40, 34, '#fff') + rect(206, 66, 100, 34, 8, '#fff'),
  hard: (c = '#FFC928') => path('M184 112 C184 50 328 50 328 112 Z', c) + line('M256 58 L256 110', '#E0A400', 10) + ell(256, 114, 96, 14, c),
  police: () =>
    path('M198 104 L184 66 Q256 46 328 66 L314 104 Z', '#26386B') + rect(198, 94, 116, 16, 4, '#141A2B') + path('M204 108 Q256 134 308 108 Z', '#141A2B') + star(256, 78, 12, '#F5C542'),
  postman: () =>
    path('M198 104 L190 70 Q256 54 322 70 L314 104 Z', '#2E5FB8') + rect(198, 94, 116, 16, 4, '#E2453B') + path('M204 108 Q256 134 308 108 Z', '#141A2B'),
  pilot: () =>
    path('M198 104 L180 70 Q256 52 332 70 L314 104 Z', '#fff') + rect(198, 94, 116, 16, 4, '#24345E') + path('M204 108 Q256 134 308 108 Z', '#141A2B') +
    path('M256 80 L228 72 L236 82 L256 86 L276 82 L284 72 Z', '#F5C542'),
  straw: () => ell(256, 104, 122, 22, '#F0D27A') + path('M204 104 C204 54 308 54 308 104 Z', '#E9C46A') + rect(204, 88, 104, 14, 3, '#D64545'),
  fisher: () => ell(256, 106, 112, 18, '#7FA35A') + path('M206 106 C206 62 306 62 306 106 Z', '#94B86C'),
  fire: () =>
    path('M166 118 Q256 138 346 118 L354 132 Q256 158 158 132 Z', '#B8261B') + path('M186 120 C186 46 326 46 326 120 Z', '#E03B2E') + line('M256 52 L256 118', '#B8261B', 9) +
    path('M238 64 L274 64 L274 92 Q256 106 238 92 Z', '#F5C542'),
  mech: (c = '#E2453B') => path('M190 112 C190 58 322 58 322 112 Z', c) + path('M300 110 Q352 104 376 116 Q352 128 300 120 Z', '#B8261B') + circ(256, 60, 6, '#B8261B'),
  beret: (c = '#C0392B') => ell(250, 92, 74, 26, c) + circ(250, 66, 6, c),
  nurse: () => path('M210 96 L222 70 L290 70 L302 96 Z', '#fff') + rect(248, 74, 16, 18, 2, '#E03B2E', false) + rect(242, 80, 28, 6, 2, '#E03B2E', false),
  baker: () => ell(256, 84, 70, 30, '#fff') + rect(200, 84, 112, 22, 6, '#fff'),
  mirror: () => line('M192 108 Q256 86 320 108', '#555', 9) + circ(256, 96, 20, '#D9DEE6') + circ(256, 96, 8, '#7C8696', false),
};

/**
 * A standing person. `o`: kid, skin, hair {front, back, color, band, bow}, face options, shirt,
 * legs ('trousers' | 'shorts' | 'skin'), trousers, legPts {L, R}, shoes, skirt {color, long},
 * coat, sleeve, arms {L, R} (points after the shoulder), armsInFront, hand, hat (+ hatColor), and
 * layers: behind (first), overTorso (on the clothes), held (between the arms and the hands),
 * inHands (after the hands), front (last).
 */
export function person(o) {
  const L = o.kid ? CHILD : ADULT;
  const tone = SKINS[o.skin ?? 'light'];
  const { skin } = tone;
  const cx = 256;
  let s = o.behind ?? '';
  if (o.hair?.back) s += headFrame(L, HAIRS[o.hair.back](o.hair.color, o.hair.bow));

  // Legs and shoes.
  const legTop = L.waist - 14;
  const legColor = o.legs === 'trousers' ? o.trousers : skin;
  const legPts = o.legPts ?? { L: [[cx - 24, L.feet - 12]], R: [[cx + 24, L.feet - 12]] };
  const legL = [[cx - 22, legTop], ...legPts.L];
  const legR = [[cx + 22, legTop], ...legPts.R];
  for (const leg of [legL, legR]) s += tube(leg, legColor, o.kid ? 30 : 34);
  if (o.legs === 'shorts') s += path(`M${cx - L.hw - 4} ${L.waist - 16} L${cx - L.hw - 8} ${L.waist + 34} L${cx - 4} ${L.waist + 34} L${cx} ${L.waist + 10} L${cx + 4} ${L.waist + 34} L${cx + L.hw + 8} ${L.waist + 34} L${cx + L.hw + 4} ${L.waist - 16} Z`, o.trousers);
  for (const [leg, side] of [[legL, -1], [legR, 1]]) {
    const [x, y] = leg[leg.length - 1];
    s += ell(x + side * 6, y + 12, o.kid ? 24 : 28, 13, o.shoes ?? '#5A3A22');
  }

  // Skirt or long coat under the torso.
  if (o.skirt) {
    const bottom = o.skirt.long ? L.feet - 18 : L.waist + 56;
    s += path(`M${cx - L.hw + 2} ${L.waist - 30} L${cx - L.hw - 36} ${bottom} Q${cx} ${bottom + 16} ${cx + L.hw + 36} ${bottom} L${cx + L.hw - 2} ${L.waist - 30} Z`, o.skirt.color);
  }
  if (o.coat) s += path(`M${cx - L.sw} ${L.top + 16} L${cx - L.hw - 22} ${L.waist + 66} Q${cx} ${L.waist + 76} ${cx + L.hw + 22} ${L.waist + 66} L${cx + L.sw} ${L.top + 16} Z`, o.coat);

  // Neck and torso.
  s += rect(cx - 15, L.hy + L.R - 14, 30, L.top - (L.hy + L.R) + 26, 8, skin);
  s += path(`M${cx - L.sw} ${L.top + 16} Q${cx} ${L.top - 6} ${cx + L.sw} ${L.top + 16} L${cx + L.hw + 6} ${L.waist} Q${cx} ${L.waist + 10} ${cx - L.hw - 6} ${L.waist} Z`, o.shirt);
  s += o.overTorso ?? '';

  // Arms (sleeves), what the hands hold, then the hands.
  const sleeve = o.sleeve ?? o.shirt;
  const arms = o.arms ?? {};
  const shoulderY = L.top + 22;
  const left = [[cx - L.sw + 12, shoulderY], ...(arms.L ?? [[cx - L.sw - 14, L.top + 104]])];
  const right = [[cx + L.sw - 12, shoulderY], ...(arms.R ?? [[cx + L.sw + 14, L.top + 104]])];
  const armW = o.kid ? 24 : 28;
  const hand = o.hand ?? skin;
  let armsSvg = tube(left, sleeve, armW) + tube(right, sleeve, armW) + (o.held ?? '');
  for (const a of [left, right]) {
    const [x, y] = a[a.length - 1];
    armsSvg += circ(x, y, o.kid ? 14 : 16, hand);
  }
  armsSvg += o.inHands ?? '';
  if (!o.armsInFront) s += armsSvg;

  // Head, hair, hat.
  let headSvg = face(tone, o.face ?? {});
  if (o.hair?.front) headSvg += HAIRS[o.hair.front](o.hair.color, o.hair.band);
  if (o.hat) headSvg += HATS[o.hat](o.hatColor);
  s += headFrame(L, headSvg);
  if (o.armsInFront) s += armsSvg;
  s += o.front ?? '';
  return s;
}

/** The person's layout, for placing what they hold. */
export const LAYOUT = { adult: ADULT, child: CHILD };

/** A head on its own (a child asleep on a pillow): centre and radius, with the person's face and hair options. */
export function head(o, cx, cy, r) {
  const tone = SKINS[o.skin ?? 'light'];
  let h = '';
  if (o.hair?.back) h += HAIRS[o.hair.back](o.hair.color, o.hair.bow);
  h += face(tone, o.face ?? {});
  if (o.hair?.front) h += HAIRS[o.hair.front](o.hair.color, o.hair.band);
  return `\n  <g transform="translate(${cx} ${cy}) scale(${(r / 66).toFixed(3)}) translate(-256 -150)">${h}\n  </g>`;
}

/** Enlarges a person drawn between `top` and `bottom` to fill the circle. */
export const fit = (body, top, bottom, maxScale = 1.25) => {
  const k = Math.min(440 / (bottom - top), maxScale);
  return `\n  <g transform="translate(256 269) scale(${k.toFixed(3)}) translate(-256 ${-(top + bottom) / 2})">${body}\n  </g>`;
};

/** A heart, for love and kisses. */
export const heart = (cx, cy, s, color = '#E8384F') =>
  path(`M${cx} ${cy + s * 0.9} C${cx - s * 1.4} ${cy + s * 0.1} ${cx - s * 1.1} ${cy - s * 0.9} ${cx} ${cy - s * 0.35} C${cx + s * 1.1} ${cy - s * 0.9} ${cx + s * 1.4} ${cy + s * 0.1} ${cx} ${cy + s * 0.9} Z`, color, true, ' stroke-width="4"');

/** A music note. */
export const note = (x, y, color) => circ(x, y, 9, color, true, ' stroke-width="3"') + line(`M${x + 8} ${y} L${x + 8} ${y - 34} Q${x + 22} ${y - 26} ${x + 26} ${y - 14}`, INK, 4);
