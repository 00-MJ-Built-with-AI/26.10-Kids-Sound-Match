// Feelings, body parts and actions added in November 2026, in the same styles as the others.
// Writes only the new files. Usage: node tools/art/draw-more.mjs
import fs from 'node:fs';
import path from 'node:path';
import { BLUSH, HAIR, INK, OW, SKINS, circ, ell, fit, head, line, note, path as p, person, rect, svg, tube } from './people-lib.mjs';

const PACKS = path.join(process.cwd(), 'public', 'assets', 'packs');
const out = (pack, key, s) => fs.writeFileSync(path.join(PACKS, pack, `${key}.svg`), s);

/* ---------------------------------------------------------------- feelings */
const ink = INK;
const face = (id, light, dark, rim) => `
  <defs>
    <radialGradient id="${id}" cx="38%" cy="32%" r="75%">
      <stop offset="0" stop-color="${light}"/>
      <stop offset="1" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  <circle cx="256" cy="276" r="196" fill="url(#${id})"/>
  <circle cx="256" cy="276" r="192" fill="none" stroke="${rim}" stroke-width="8" opacity="0.55"/>
  <ellipse cx="196" cy="170" rx="56" ry="26" fill="#fff" opacity="0.28" transform="rotate(-20 196 170)"/>`;
const cheeks = (color = '#FF7B7B') => `
  <ellipse cx="150" cy="318" rx="34" ry="22" fill="${color}" opacity="0.5"/>
  <ellipse cx="362" cy="318" rx="34" ry="22" fill="${color}" opacity="0.5"/>`;
const roundEyes = (r = 22, y = 246) => `
  <ellipse cx="190" cy="${y}" rx="${r}" ry="${r * 1.2}" fill="${ink}"/>
  <ellipse cx="322" cy="${y}" rx="${r}" ry="${r * 1.2}" fill="${ink}"/>
  <circle cx="197" cy="${y - r * 0.5}" r="${r * 0.35}" fill="#fff"/>
  <circle cx="329" cy="${y - r * 0.5}" r="${r * 0.35}" fill="#fff"/>`;
const plain = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${body}\n</svg>\n`;

const feelings = {
  // Hungry: orange, licking the lips, a drop of drool, a fork.
  hungry: plain(`${face('hungry', '#FFD9A0', '#F39A3B', '#D9781E')}
  ${roundEyes(22, 236)}
  <path d="M170 340 Q256 400 342 340" fill="none" stroke="${ink}" stroke-width="18" stroke-linecap="round"/>
  <path d="M300 352 Q330 352 336 384 Q330 408 306 396 Q296 376 300 352 Z" fill="#F27C8A" stroke="${ink}" stroke-width="7"/>
  <path d="M214 372 Q206 400 214 414 Q224 424 230 410 Q232 392 214 372 Z" fill="#DDF3FF" stroke="#6CC2F5" stroke-width="5"/>
  ${cheeks()}
  <g stroke="#8E96A3" stroke-width="12" stroke-linecap="round" fill="none"><path d="M432 58 L432 178"/><path d="M406 58 L406 112 Q406 134 432 134 Q458 134 458 112 L458 58"/></g>`),
  // Thirsty: sandy yellow, tongue out, a drop of sweat, a glass of water.
  thirsty: plain(`${face('thirsty', '#FFF0B8', '#EDC04A', '#C99A1E')}
  <path d="M156 236 q34 -16 68 0" fill="none" stroke="${ink}" stroke-width="16" stroke-linecap="round"/>
  <path d="M288 236 q34 -16 68 0" fill="none" stroke="${ink}" stroke-width="16" stroke-linecap="round"/>
  <ellipse cx="256" cy="352" rx="62" ry="30" fill="#7A2414"/>
  <path d="M222 356 L290 356 L292 420 Q256 450 220 420 Z" fill="#F27C8A" stroke="${ink}" stroke-width="7"/>
  <path d="M372 170 Q356 200 362 214 Q374 228 386 214 Q392 200 372 170 Z" fill="#DDF3FF" stroke="#6CC2F5" stroke-width="6"/>
  <path d="M40 330 L112 330 L104 450 L48 450 Z" fill="#E6F7FF" stroke="#4FA9E0" stroke-width="7"/><path d="M47 376 L105 376 L100 446 L52 446 Z" fill="#8ED0FA"/>`),
  // Tired: grey-lilac, heavy half-closed eyes with shadows, a big yawn.
  tired: plain(`${face('tired', '#ECE8F6', '#ABA3CB', '#857BAE')}
  <path d="M156 246 q34 -6 68 0" fill="none" stroke="${ink}" stroke-width="16" stroke-linecap="round"/>
  <path d="M288 246 q34 -6 68 0" fill="none" stroke="${ink}" stroke-width="16" stroke-linecap="round"/>
  <path d="M168 250 q22 20 44 0 Z" fill="${ink}"/><path d="M300 250 q22 20 44 0 Z" fill="${ink}"/>
  <path d="M160 288 q30 14 60 0 M292 288 q30 14 60 0" fill="none" stroke="#857BAE" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="256" cy="372" rx="46" ry="58" fill="#6B1A0E"/><ellipse cx="256" cy="402" rx="26" ry="14" fill="#FF7B8F"/>`),
  // Sick: pale green, worried eyebrows, a thermometer in the mouth.
  sick: plain(`${face('sick', '#E4F5C8', '#A9D46E', '#7FAE45')}
  <path d="M150 190 L214 170" stroke="${ink}" stroke-width="14" stroke-linecap="round"/>
  <path d="M298 170 L362 190" stroke="${ink}" stroke-width="14" stroke-linecap="round"/>
  ${roundEyes(18, 244)}
  <path d="M206 364 Q256 340 306 364" fill="none" stroke="${ink}" stroke-width="16" stroke-linecap="round"/>
  <g transform="rotate(-28 300 356)"><rect x="284" y="346" width="170" height="24" rx="12" fill="#fff" stroke="${ink}" stroke-width="7"/><rect x="300" y="353" width="80" height="10" rx="5" fill="#E03B2E"/><circle cx="290" cy="358" r="16" fill="#E03B2E" stroke="${ink}" stroke-width="6"/></g>`),
  // Shy: peach, big pink cheeks, eyes looking aside, a small smile.
  shy: plain(`${face('shy', '#FFE6D6', '#F7AE8E', '#D9866A')}
  <ellipse cx="204" cy="244" rx="20" ry="24" fill="${ink}"/><ellipse cx="336" cy="244" rx="20" ry="24" fill="${ink}"/>
  <circle cx="196" cy="236" r="7" fill="#fff"/><circle cx="328" cy="236" r="7" fill="#fff"/>
  <ellipse cx="156" cy="318" rx="54" ry="34" fill="#F2709A" opacity="0.6"/><ellipse cx="356" cy="318" rx="54" ry="34" fill="#F2709A" opacity="0.6"/>
  <path d="M128 300 l18 24 M150 294 l18 24 M338 294 l18 24 M360 300 l18 24" stroke="#D2557E" stroke-width="6" stroke-linecap="round"/>
  <path d="M226 352 Q256 372 286 352" fill="none" stroke="${ink}" stroke-width="14" stroke-linecap="round"/>`),
  // Cold: icy blue, chattering teeth, snowflakes, a red scarf.
  cold: plain(`${face('cold', '#E6F6FF', '#8FCBF0', '#5AA6D6')}
  ${roundEyes(18, 240)}
  <rect x="196" y="332" width="120" height="40" rx="12" fill="#fff" stroke="#2E5F9E" stroke-width="8"/>
  <path d="M198 352 l15 -12 l15 24 l15 -24 l15 24 l15 -24 l15 24 l15 -24" fill="none" stroke="#2E5F9E" stroke-width="5"/>
  <path d="M112 420 Q256 472 400 420 L410 472 Q256 522 102 472 Z" fill="#E2453B" stroke="${ink}" stroke-width="7"/>
  <path d="M44 250 q-14 26 0 52 M468 250 q14 26 0 52" fill="none" stroke="#5AA6D6" stroke-width="8" stroke-linecap="round"/>
  <g stroke="#5AA6D6" stroke-width="8" stroke-linecap="round"><path d="M80 60 v64 M48 92 h64 M57 69 l46 46 M103 69 l-46 46"/><path d="M430 36 v48 M406 60 h48 M413 43 l34 34 M447 43 l-34 34"/></g>`),
};
for (const [key, body] of Object.entries(feelings)) out('feelings', key, body);

/* ---------------------------------------------------------------- body parts (zoomed) */
const { skin: SKIN, shade: SHADE } = SKINS.light;
const SHIRT = '#4F9BE8';
const window_ = (bg, body) =>
  svg(`\n  <defs><clipPath id="w"><circle cx="256" cy="256" r="236"/></clipPath></defs>` +
    `\n  <circle cx="256" cy="256" r="236" fill="${bg}"/>\n  <g clip-path="url(#w)">${body}\n  </g>` +
    `\n  <circle cx="256" cy="256" r="236" fill="none" stroke="${INK}" stroke-width="10"/>`);
const silhouette = (shapes, fill = SKIN) => shapes.map((s) => s(INK, OW * 2)).join('') + shapes.map((s) => s(fill, 0)).join('');
const sRect = (x, y, w, h, rx) => (c, g) => `\n  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}" stroke="${c}" stroke-width="${g}"/>`;
const sCirc = (cx, cy, r) => (c, g) => `\n  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" stroke="${c}" stroke-width="${g}"/>`;
const sEll = (cx, cy, rx, ry) => (c, g) => `\n  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" stroke="${c}" stroke-width="${g}"/>`;
const sPath = (d) => (c, g) => `\n  <path d="${d}" fill="${c}" stroke="${c}" stroke-width="${g}" stroke-linejoin="round"/>`;
const sTube = (pts, w) => (c, g) => line('M' + pts.map((q) => q.join(' ')).join(' L'), c, w + g);
const skinAll = `\n  <rect width="512" height="512" fill="${SKIN}"/>`;
const cheek = (x, y, s = 1) => ell(x, y, 46 * s, 26 * s, BLUSH, false, ' opacity="0.45"');
const eye = (x, y, r) => ell(x, y, r, r * 1.2, INK, false) + circ(x + r * 0.3, y - r * 0.45, r * 0.35, '#fff', false);
const shine = (x, y) => p(`M${x} ${y} q10 -8 22 -4`, 'none', false, ' stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.6"');

const body = {
  // Lots of hair on top of the head, the eyes just below.
  hair: window_('#FFE6CC',
    ell(256, 460, 236, 230, SKIN) + eye(176, 430, 20) + eye(336, 430, 20) + line('M150 390 q26 -12 52 0 M310 390 q26 -12 52 0', HAIR, 10) +
    p('M10 380 C0 140 120 30 256 30 C392 30 512 140 502 380 C470 300 420 262 360 250 C330 296 230 300 160 262 C110 276 50 320 10 380 Z', HAIR) +
    line('M150 110 Q200 70 260 76 M300 90 Q350 96 390 140 M120 180 Q160 140 210 130', '#6B4A36', 10) + shine(180, 96) + shine(330, 120)),
  // Two thick eyebrows above the eyes.
  eyebrows: window_(SKIN, skinAll +
    p('M0 0 L512 0 L512 70 Q420 100 330 80 Q256 104 180 78 Q90 104 0 72 Z', HAIR, false) +
    line('M70 210 Q150 150 226 196', HAIR, 40) + line('M286 196 Q362 150 442 210', HAIR, 40) +
    eye(150, 300, 34) + eye(362, 300, 34) + line('M112 262 q38 -16 76 0 M324 262 q38 -16 76 0', INK, 7) + cheek(110, 420) + cheek(402, 420) +
    line('M246 340 q14 14 -2 24', SHADE, 10)),
  // A round pink cheek, with the nose and an eye beside it.
  cheek: window_(SKIN, skinAll +
    eye(150, 150, 30) + line('M108 102 q40 -20 80 0', HAIR, 16) + line('M60 220 C70 280 40 320 70 340', SHADE, 12) +
    circ(300, 300, 108, '#F59A92', false, ' opacity="0.75"') + circ(268, 268, 22, '#fff', false, ' opacity="0.5"') +
    line('M80 420 Q160 470 230 440', INK, 14) + p('M440 30 C500 120 500 360 430 470 L512 512 L512 0 Z', HAIR, false)),
  // The lower face: a smile, and the chin below it.
  chin: window_('#E3F5E1',
    rect(196, 400, 120, 140, 30, SKIN) + p('M30 -10 C30 260 110 420 256 420 C402 420 482 260 482 -10 Z', SKIN) +
    line('M170 150 Q256 220 342 150', INK, 16) + cheek(110, 150, 0.8) + cheek(402, 150, 0.8) +
    line('M216 330 Q256 352 296 330', SHADE, 10) + ell(256, 372, 40, 18, '#fff', false, ' opacity="0.35"') +
    p('M120 512 L140 470 Q256 500 372 470 L392 512 Z', SHIRT)),
  // The neck between the chin and the shirt collar.
  neck: window_('#E8E4FF',
    p('M20 -10 C40 130 130 190 256 190 C382 190 472 130 492 -10 Z', SKIN) + line('M200 70 Q256 110 312 70', INK, 14) +
    p('M0 512 L0 400 Q100 350 186 340 L326 340 Q412 350 512 400 L512 512 Z', SHIRT) +
    silhouette([sRect(186, 160, 140, 230, 30)]) + p('M0 512 L0 400 Q100 350 186 340 Q256 400 326 340 Q412 350 512 400 L512 512 Z', SHIRT) +
    line('M226 220 Q232 280 226 320 M286 220 Q280 280 286 320', SHADE, 8) + p('M186 340 Q256 400 326 340', 'none')),
  // One shoulder: the neck, the shoulder curve, the T-shirt sleeve.
  shoulder: window_('#DDEFFF',
    silhouette([sRect(80, -20, 110, 230, 40), sPath('M40 512 L40 230 Q60 170 170 170 Q300 170 360 220 Q420 270 430 360 L430 512 Z')]) +
    p('M40 512 L40 300 Q120 250 230 250 Q330 250 380 300 L430 360 L470 470 L380 512 Z', '#F7A14A') +
    line('M180 240 Q300 196 380 250', SHADE, 10) + ell(330, 210, 40, 16, '#fff', false, ' opacity="0.35"') +
    p('M60 -20 L210 -20 Q200 40 150 60 Q110 50 60 -20 Z', HAIR, false)),
  // A bent arm with the elbow in the middle.
  elbow: window_('#FFF3CC',
    silhouette([sTube([[60, 140], [256, 380], [450, 150]], 92), sCirc(462, 120, 46)]) +
    p('M-20 60 L120 150 L60 240 L-20 200 Z', '#F7A14A') + line('M226 390 Q256 410 286 390', SHADE, 10) + ell(256, 350, 24, 14, '#fff', false, ' opacity="0.4"') +
    line('M236 330 Q256 346 276 330', SHADE, 7)),
  // The round tummy with its belly button, the T-shirt pulled up.
  tummy: window_('#FFE3EA',
    p('M0 -10 L512 -10 L512 150 Q256 200 0 150 Z', '#FFD25A') + silhouette([sEll(256, 330, 200, 190)]) +
    p('M0 -10 L512 -10 L512 150 Q256 200 0 150 Z', '#FFD25A') + line('M20 150 Q256 200 492 150', '#E0B03A', 12) +
    p('M244 320 q12 -16 24 0 q-12 18 -24 0 Z', SHADE) + ell(190, 280, 40, 26, '#fff', false, ' opacity="0.35"') +
    p('M0 512 L0 460 Q256 500 512 460 L512 512 Z', '#4F8FE0')),
  // A child seen from behind: the back of the head, the back in a T-shirt.
  back: window_('#E6F5D5',
    p('M60 512 L76 330 Q120 270 256 262 Q392 270 436 330 L452 512 Z', '#F7A14A') + line('M256 300 L256 512', '#D98A3A', 8) +
    line('M170 340 Q256 380 342 340', '#D98A3A', 6) +
    tube([[86, 330], [60, 470]], '#F7A14A', 60) + tube([[426, 330], [452, 470]], '#F7A14A', 60) +
    rect(224, 220, 64, 60, 18, SKIN) + ell(146, 170, 22, 30, SKIN) + ell(366, 170, 22, 30, SKIN) + circ(256, 150, 120, HAIR) +
    line('M200 90 Q256 70 312 90 M180 150 Q256 120 332 150', '#6B4A36', 8)),
  // A bent leg with a round knee.
  knee: window_('#EEE6FF',
    silhouette([sTube([[20, 200], [260, 240], [300, 500]], 110)]) +
    p('M-20 120 L130 150 L120 300 L-20 290 Z', '#4F8FE0') + line('M130 150 L120 300', '#2E5F9E', 8) +
    circ(266, 236, 46, '#F2B990', false) + ell(256, 220, 20, 12, '#fff', false, ' opacity="0.5"') + line('M226 282 Q256 296 290 280', SHADE, 8)),
  // Five toes close up, each with its nail.
  toes: window_('#FFE8D6',
    silhouette([sRect(40, -40, 432, 300, 120), sCirc(120, 300, 66), sCirc(222, 330, 52), sCirc(304, 334, 46), sCirc(376, 322, 40), sCirc(436, 300, 34)]) +
    [[120, 316, 30], [222, 346, 22], [304, 350, 19], [376, 338, 16], [436, 316, 14]].map(([x, y, r]) => ell(x, y, r, r * 0.8, '#FFD9D2', true, ' stroke-width="4"')).join('') +
    line('M100 180 Q256 220 420 180', SHADE, 10)),
  // Fingertips with their nails.
  nails: window_('#FFE0EA',
    silhouette([sTube([[110, 520], [120, 210]], 86), sTube([[214, 520], [216, 150]], 88), sTube([[316, 520], [312, 170]], 86), sTube([[412, 520], [402, 236]], 78)]) +
    [[120, 214], [216, 156], [312, 176], [402, 240]].map(([x, y]) => p(`M${x - 28} ${y + 34} Q${x - 30} ${y - 16} ${x} ${y - 18} Q${x + 30} ${y - 16} ${x + 28} ${y + 34} Z`, '#FFC9D6', true, ' stroke-width="5"') + ell(x - 8, y + 2, 7, 12, '#fff', false, ' opacity="0.7"')).join('') +
    line('M96 330 L144 330 M190 290 L240 290 M290 310 L336 310 M382 350 L424 350', SHADE, 6)),
};
for (const [key, s] of Object.entries(body)) out('body', key, s);

/* ---------------------------------------------------------------- actions */
const GROUP = { moving: '#FFE8D6', fun: '#FFF4C4' };
const kid = (o = {}) =>
  person({ kid: true, hair: { front: 'fringe', color: HAIR }, shirt: '#FF8A5B', legs: 'shorts', trousers: '#4F8FE0', shoes: '#2C3E66', ...o, face: { brows: HAIR, ...(o.face ?? {}) } });
const kidFit = (b) => `\n  <g transform="translate(256 269) scale(1.25) translate(-256 -302)">${b}\n  </g>`;
const disc = (c) => `\n  <circle cx="256" cy="256" r="240" fill="${c}"/>`;
const marks = (d, color = '#FFB300') => line(d, color, 6);
const ball = (x, y, r) => circ(x, y, r, '#fff') + p(`M${x - r} ${y} Q${x} ${y - r * 0.5} ${x + r} ${y}`, 'none', true, ' stroke-width="5"') + p(`M${x} ${y - r} Q${x - r * 0.5} ${y} ${x} ${y + r}`, 'none', true, ' stroke-width="5"');

const actions = {
  run: disc(GROUP.moving) + kidFit(
    marks('M110 300 L60 300 M120 340 L74 340 M110 380 L70 380', '#F7A14A') +
    kid({ legPts: { L: [[212, 420], [190, 448]], R: [[292, 410], [316, 436]] }, arms: { L: [[186, 350], [172, 376]], R: [[322, 300], [348, 280]] }, face: { mouth: 'wide' } })),
  kick: disc(GROUP.moving) + kidFit(
    kid({ legPts: { L: [[234, 450]], R: [[306, 404], [348, 412]] }, arms: { L: [[180, 316], [154, 300]], R: [[332, 316], [358, 300]] } }) +
    ball(392, 418, 30) + marks('M432 396 L462 384 M436 420 L468 420 M432 444 L462 456', '#4F8FE0')),
  throw: disc(GROUP.moving) + kidFit(
    kid({ arms: { R: [[330, 282], [348, 230]] } }) + ball(362, 196, 24) +
    `\n  <path d="M352 168 Q300 90 200 110" fill="none" stroke="#F7A14A" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>`),
  crawl: disc(GROUP.moving) + '<g transform="translate(256 300) scale(1.18) translate(-262 -340)">' +
    rect(40, 412, 432, 16, 8, '#C9A77C', false) +
    tube([[330, 340], [336, 404], [408, 404]], '#4F8FE0', 34) + tube([[300, 346], [296, 404], [366, 404]], '#4F8FE0', 34) +
    ell(284, 318, 110, 52, '#FF8A5B') + p('M330 290 Q392 286 400 330 Q392 372 330 368 Z', '#4F8FE0') +
    tube([[206, 330], [196, 404]], '#FF8A5B', 28) + circ(194, 406, 16, SKIN) + tube([[236, 336], [234, 404]], '#FF8A5B', 28) + circ(232, 406, 16, SKIN) +
    head({ hair: { front: 'fringe', color: HAIR }, face: { brows: HAIR } }, 150, 268, 70) + '</g>',
  swim: disc('#DDF0FF') + `
  <defs><clipPath id="disc"><circle cx="256" cy="256" r="240"/></clipPath></defs><g clip-path="url(#disc)">` + kidFit(
    kid({ arms: { L: [[186, 292], [160, 252]], R: [[330, 300], [360, 286]] }, face: { mouth: 'wide' } }) +
    p('M60 360 Q110 340 160 360 T260 360 T360 360 T460 360 L460 520 L60 520 Z', '#4FB3F6', true, ' opacity="0.92"') +
    line('M90 392 Q120 380 150 392 M300 410 Q330 398 360 410', '#fff', 6) +
    [[150, 236, 7], [372, 268, 6], [390, 240, 5]].map(([x, y, r]) => circ(x, y, r, '#8ED0FA', false)).join('')) + '</g>',
  sing: disc(GROUP.fun) + kidFit(
    kid({ armsInFront: true, face: { mouth: 'o', happyEyes: true }, arms: { R: [[322, 336], [288, 280]] },
      held: tube([[288, 280], [278, 262]], '#3A3A44', 10) + circ(274, 254, 12, '#9AA6B8') }) +
    note(140, 190, '#E2453B') + note(372, 170, '#9B59D0') + note(392, 250, '#4F8FE0')),
  laugh: disc(GROUP.fun) + kidFit(
    kid({ face: { happyEyes: true, mouth: 'laugh' }, arms: { L: [[220, 350], [238, 356]], R: [[292, 350], [274, 356]] } }) +
    marks('M150 160 L126 140 M140 200 L112 196 M362 160 L386 140 M372 200 L400 196')),
};
for (const [key, b] of Object.entries(actions)) out('actions', key, svg(b));
console.log('feelings', Object.keys(feelings).length, 'body', Object.keys(body).length, 'actions', Object.keys(actions).length);
