// The family members and jobs added in November 2026, drawn like the others (whole people on a
// coloured circle). Writes only the new files. Usage: node tools/art/draw-people-more.mjs
import fs from 'node:fs';
import path from 'node:path';
import { GREY, HAIR, INK, circ, disc, ell, fit, line, note, path as p, person, rect, star, svg, tube } from './people-lib.mjs';

const PACKS = path.join(process.cwd(), 'public', 'assets', 'packs');
const out = (pack, key, body) => fs.writeFileSync(path.join(PACKS, pack, `${key}.svg`), svg(body));
const adult = (o) => fit(person(o), 68, 476);
const child = (o) => fit(person({ kid: true, ...o }), 128, 476);
const behind = (color, body) =>
  `\n  <defs><clipPath id="disc"><circle cx="256" cy="256" r="240"/></clipPath></defs>` + disc(color) + `\n  <g clip-path="url(#disc)">${body}\n  </g>`;
const WAVE_R = [[346, 248], [372, 192]];
const WAVE_R_KID = [[326, 296], [346, 248]];
const buttons = (x, ys, color = '#fff') => ys.map((y) => circ(x, y, 5, color, true, ' stroke-width="3"')).join('');
const collar = (color = '#fff') => p('M234 236 L256 262 L246 236 Z', color) + p('M278 236 L256 262 L266 236 Z', color);
const ball = (x, y, r) => circ(x, y, r, '#fff') + p(`M${x - r} ${y} Q${x} ${y - r * 0.5} ${x + r} ${y}`, 'none', true, ' stroke-width="5"') + p(`M${x} ${y - r} Q${x - r * 0.5} ${y} ${x} ${y + r}`, 'none', true, ' stroke-width="5"');

/* ---------- Family ---------- */
const family = {
  aunt_paternal: disc('#FFF1C9') + adult({
    hair: { back: 'longBack', front: 'longFront', color: '#2E1B12' },
    face: { glasses: true, brows: '#2E1B12', earrings: true },
    shirt: '#F5B82E', skirt: { color: '#F5B82E' }, legs: 'skin', shoes: '#A0522D',
    overTorso: circ(256, 268, 7, '#fff'),
    arms: { R: WAVE_R },
  }),
  uncle_maternal: disc('#DDF6F8') + adult({
    hair: { front: 'short', color: HAIR },
    face: { glasses: true, brows: HAIR },
    shirt: '#F28C38', legs: 'trousers', trousers: '#4A4A5A', shoes: '#2E2E3A',
    overTorso: collar() + buttons(256, [284, 312, 340]),
  }),
  cousin_boy: disc('#E6F4D8') + child({
    hair: { front: 'curly', color: HAIR },
    face: { brows: HAIR },
    shirt: '#3DAA5C', legs: 'shorts', trousers: '#F2B533', shoes: '#C0392B',
    arms: { R: [[316, 360], [330, 380]] },
    inHands: ball(338, 404, 26),
  }),
  cousin_girl: disc('#FFE4D6') + child({
    hair: { back: 'ponytailBack', front: 'fringe', color: '#5A3522', bow: '#4FB3F6' },
    shirt: '#F28C38', skirt: { color: '#F28C38' }, legs: 'skin', shoes: '#4F8FE0',
    overTorso: circ(244, 350, 6, '#fff', false) + circ(268, 362, 6, '#fff', false),
    arms: { R: WAVE_R_KID },
  }),
  friend: disc('#E4E9FF') + child({
    skin: 'medium',
    hair: { front: 'short', color: HAIR },
    face: { brows: HAIR },
    shirt: '#4F8FE0', legs: 'shorts', trousers: '#3D4A66', shoes: '#F2B533',
    behind: rect(188, 296, 136, 100, 20, '#E2453B'),
    overTorso: line('M222 300 L216 380 M290 300 L296 380', '#B8261B', 10),
    arms: { R: WAVE_R_KID },
  }),
};

/* ---------- Jobs ---------- */
const tooth = (x, y, s) => p(`M${x - s} ${y - s * 0.8} Q${x - s * 1.1} ${y + s * 0.3} ${x - s * 0.6} ${y + s * 1.2} Q${x - s * 0.3} ${y + s * 0.4} ${x} ${y + s * 0.3} Q${x + s * 0.3} ${y + s * 0.4} ${x + s * 0.6} ${y + s * 1.2} Q${x + s * 1.1} ${y + s * 0.3} ${x + s} ${y - s * 0.8} Q${x} ${y - s * 1.3} ${x - s} ${y - s * 0.8} Z`, '#fff');
const puppy = (x, y) =>
  ell(x, y + 40, 46, 34, '#D9A066') + ell(x - 30, y - 6, 14, 26, '#8B5A2B', true, ` transform="rotate(20 ${x - 30} ${y - 6})"`) + ell(x + 30, y - 6, 14, 26, '#8B5A2B', true, ` transform="rotate(-20 ${x + 30} ${y - 6})"`) +
  circ(x, y, 34, '#D9A066') + circ(x - 12, y - 6, 5, INK, false) + circ(x + 12, y - 6, 5, INK, false) + ell(x, y + 12, 8, 6, INK, false) + p(`M${x} ${y + 18} q0 10 8 12`, 'none', true, ' stroke-width="3"');
const jobs = {
  dentist: disc('#E1F6F4') + adult({
    hair: { front: 'short', color: HAIR }, face: { brows: HAIR },
    coat: '#FFFFFF', shirt: '#FFFFFF', sleeve: '#FFFFFF', legs: 'trousers', trousers: '#5EC4B6', shoes: '#3A3A44',
    overTorso: p('M236 236 L256 292 L276 236 Z', '#5EC4B6') + line('M256 292 L256 430', INK, 4),
    arms: { L: [[172, 318]], R: [[352, 232], [366, 196]] },
    held: tube([[360, 214], [390, 104]], '#4FB3F6', 16) + rect(374, 70, 34, 40, 8, '#fff') + tooth(150, 298, 30),
  }),
  nurse: disc('#E3EEFF') + adult({
    skin: 'brown', hair: { front: 'short', color: HAIR }, face: { brows: HAIR }, hat: 'nurse',
    shirt: '#8EC5F0', legs: 'trousers', trousers: '#8EC5F0', shoes: '#fff',
    overTorso: collar('#8EC5F0'),
    arms: { L: [[214, 334]], R: [[298, 334]] },
    held: rect(208, 296, 96, 112, 8, '#A0662E') + rect(218, 310, 76, 92, 4, '#fff', false) + rect(250, 322, 12, 36, 2, '#E03B2E', false) + rect(238, 334, 36, 12, 2, '#E03B2E', false) + rect(240, 290, 32, 14, 4, '#9AA6B8'),
  }),
  vet: disc('#E8F6DD') + adult({
    hair: { front: 'curly', color: HAIR }, face: { brows: HAIR },
    shirt: '#6DBE7A', legs: 'trousers', trousers: '#6DBE7A', shoes: '#3A3A44',
    arms: { L: [[212, 336], [236, 346]], R: [[300, 336], [276, 346]] },
    held: puppy(256, 318),
  }),
  baker: disc('#FFF3DE') + adult({
    skin: 'medium', hair: { front: 'short', color: HAIR }, face: { brows: HAIR, mustache: HAIR }, hat: 'baker',
    shirt: '#FFFFFF', legs: 'trousers', trousers: '#5A5A66', shoes: '#141414',
    overTorso: p('M220 262 L292 262 L300 372 L212 372 Z', '#F3E1C2') + buttons(256, [290, 320]),
    arms: { L: [[200, 344]], R: [[312, 344]] },
    held: rect(170, 334, 172, 14, 5, '#9AA6B8') + ell(256, 316, 64, 26, '#D9893B') + line('M224 306 L236 326 M252 304 L264 326 M280 306 L292 326', '#A65E1E', 5),
  }),
  postman: disc('#E0EAFF') + adult({
    skin: 'brown', hair: { front: 'short', color: HAIR }, face: { brows: HAIR }, hat: 'postman',
    shirt: '#2E5FB8', legs: 'trousers', trousers: '#24345E', shoes: '#141414',
    overTorso: line('M214 250 L306 350', '#7A4A20', 12) + rect(284, 330, 70, 58, 10, '#A0662E'),
    arms: { L: [[180, 282], [166, 240]] },
    held: rect(116, 192, 84, 58, 6, '#fff') + p('M116 192 L158 226 L200 192', 'none', true, ' stroke-width="5"'),
  }),
  driver: disc('#FFF0C2') + adult({
    hair: { front: 'short', color: HAIR }, face: { brows: HAIR }, hat: 'mech', hatColor: '#2E6FD8',
    shirt: '#8E9AAD', legs: 'trousers', trousers: '#3D4A66', shoes: '#141414',
    arms: { L: [[200, 318], [208, 334]], R: [[312, 318], [304, 334]] },
    held: circ(256, 340, 60, 'none', true, ' stroke-width="16"') + circ(256, 340, 60, 'none', false, ' stroke="#3A3A44" stroke-width="10"') + circ(256, 340, 14, '#3A3A44') + line('M256 340 L210 312 M256 340 L302 312 M256 340 L256 396', '#3A3A44', 8),
  }),
  fisherman: behind('#DFF2FF', p('M16 430 Q128 410 256 432 Q384 454 496 430 L496 512 L16 512 Z', '#8ED0FA', false)) + adult({
    skin: 'medium', hair: { front: 'short', color: HAIR }, face: { brows: HAIR, beard: HAIR }, hat: 'fisher',
    shirt: '#D9473B', legs: 'trousers', trousers: '#3F78C9', shoes: '#3D5A3A',
    overTorso: p('M200 252 L242 246 L240 368 L204 368 Z', '#94B86C') + p('M312 252 L270 246 L272 368 L308 368 Z', '#94B86C'),
    arms: { R: [[342, 300], [352, 290]] },
    held: line('M350 296 L452 92', '#7A4A20', 8) + line('M452 92 L446 212', INK, 3) +
      p('M408 226 Q446 196 478 226 Q446 256 408 226 Z', '#F28C28') + p('M478 226 L498 210 L498 242 Z', '#F28C28') + circ(422, 222, 4, INK, false),
  }),
  barber: behind('#F6E6FF', rect(40, 150, 46, 260, 20, '#fff') + [0, 1, 2, 3, 4].map((i) => p(`M40 ${170 + i * 50} L86 ${150 + i * 50} L86 ${176 + i * 50} L40 ${196 + i * 50} Z`, '#E03B2E', false)).join('') + rect(40, 150, 46, 260, 20, 'none')) + adult({
    hair: { front: 'curly', color: HAIR }, face: { brows: HAIR, mustache: HAIR },
    shirt: '#2E2E3A', legs: 'trousers', trousers: '#2E2E3A', shoes: '#141414',
    overTorso: p('M216 262 L296 262 L304 380 L208 380 Z', '#fff'),
    arms: { L: [[172, 300], [160, 270]], R: [[344, 272], [358, 236]] },
    held: circ(370, 236, 14, 'none', true, ' stroke-width="7"') + circ(392, 228, 14, 'none', true, ' stroke-width="7"') + line('M380 214 L404 160 M384 222 L430 186', '#C9CED6', 9) +
      rect(132, 226, 60, 22, 4, '#3A3A44') + line('M138 248 L138 262 M150 248 L150 262 M162 248 L162 262 M174 248 L174 262 M186 248 L186 262', '#3A3A44', 4),
  }),
  singer: disc('#FFE3EF') + adult({
    skin: 'brown', hair: { front: 'curly', color: HAIR }, face: { brows: HAIR, mouth: 'o' },
    shirt: '#9B59D0', legs: 'trousers', trousers: '#2E2E3A', shoes: '#141414',
    overTorso: star(232, 300, 10, '#FFD54A') + star(282, 326, 8, '#FFD54A') + star(250, 350, 7, '#FFD54A'),
    armsInFront: true,
    arms: { L: [[162, 280], [140, 244]], R: [[320, 316], [292, 232]] },
    held: tube([[292, 232], [280, 208]], '#3A3A44', 12) + circ(276, 198, 15, '#9AA6B8'),
    front: note(380, 160, '#E2453B') + note(418, 236, '#4F8FE0') + note(100, 170, '#3DAA5C'),
  }),
  carpenter: behind('#FDEBD6', rect(30, 380, 220, 34, 6, '#D9A066') + line('M60 388 L60 406 M120 388 L120 406', '#A65E1E', 4)) + adult({
    hair: { front: 'short', color: HAIR }, face: { brows: HAIR, beard: HAIR },
    shirt: '#C0392B', legs: 'trousers', trousers: '#3F78C9', shoes: '#6B4423',
    overTorso: line('M216 280 L296 280 M216 312 L296 312 M240 252 L240 368 M272 252 L272 368', '#8E2C24', 4) + rect(206, 348, 100, 18, 4, '#7A4A20') + rect(286, 346, 14, 40, 3, '#9AA6B8'),
    arms: { R: [[344, 330], [356, 334]] },
    held: p('M362 318 L478 312 L478 352 L362 356 Z', '#C9CED6') + line('M372 356 L380 364 L388 356 L396 364 L404 356 L412 364 L420 356 L428 364 L436 356 L444 364 L452 356 L460 364 L468 356', INK, 3) + rect(338, 316, 30, 42, 10, '#A0662E'),
  }),
  electrician: disc('#FFF7D1') + adult({
    skin: 'medium', hair: { front: 'short', color: HAIR }, face: { brows: HAIR }, hat: 'hard', hatColor: '#FFFFFF',
    shirt: '#2E5FB8', legs: 'trousers', trousers: '#2E5FB8', shoes: '#141414',
    overTorso: p('M266 290 L254 318 L266 318 L252 346 L280 310 L266 310 L276 290 Z', '#FFD54A', true, ' stroke-width="3"'),
    arms: { L: [[172, 320], [162, 300]], R: [[352, 232], [366, 196]] },
    held: line('M386 124 L410 100 M400 160 L436 160 M386 196 L410 220 M366 110 L366 76', '#FFC928', 7) + circ(368, 158, 32, '#FFE27A') + rect(354, 186, 28, 20, 4, '#9AA6B8') +
      tube([[162, 300], [150, 252]], '#E2453B', 12) + line('M150 252 L146 226', '#9AA6B8', 5),
  }),
  plumber: behind('#E3F1FF', p('M20 210 L160 210 Q180 210 180 230 L180 300 L156 300 L156 236 L20 236 Z', '#9AA6B8') + p('M168 312 Q158 330 162 340 Q170 350 178 340 Q182 330 168 312 Z', '#4FB3F6')) + adult({
    hair: { front: 'short', color: HAIR }, face: { brows: HAIR, mustache: HAIR }, hat: 'mech', hatColor: '#E2453B',
    shirt: '#8E9AAD', legs: 'trousers', trousers: '#2F4C8A', shoes: '#141414',
    overTorso: rect(222, 284, 68, 70, 8, '#2F4C8A') + line('M226 288 L206 252', '#2F4C8A', 12) + line('M286 288 L306 252', '#2F4C8A', 12),
    arms: { R: [[344, 322], [354, 304]] },
    held: line('M356 306 L366 432', '#A0662E', 10) + p('M330 432 Q366 404 402 432 L402 446 L330 446 Z', '#E2453B'),
  }),
  gardener: behind('#E2F5D6',
    [[350, 444, '#E8384F'], [400, 432, '#FFC928'], [450, 446, '#9B59D0']].map(([x, y, c]) => line(`M${x} ${y + 40} L${x} ${y}`, '#3DA35D', 6) + circ(x, y, 14, c) + circ(x, y, 5, '#FFE27A', false)).join('') +
    [[388, 330], [404, 352], [420, 336], [396, 374]].map(([x, y]) => circ(x, y, 5, '#4FB3F6', false)).join('')) + adult({
    skin: 'brown', hair: { front: 'short', color: HAIR }, face: { brows: HAIR },
    shirt: '#F5D76E', legs: 'trousers', trousers: '#7A5A3A', shoes: '#5A3A22',
    overTorso: p('M216 262 L296 262 L304 380 L208 380 Z', '#3DA35D'),
    arms: { R: [[332, 330], [338, 300]] },
    held: ell(330, 312, 40, 30, '#3DAA5C') + line('M366 304 L402 278', '#3DAA5C', 12) + p('M300 290 Q330 262 360 290', 'none', true, ' stroke-width="8"'),
  }),
  artist: behind('#FFF0E6', rect(360, 150, 120, 150, 6, '#fff') + line('M380 300 L360 470 M460 300 L480 470 M420 300 L420 470', '#A0662E', 9) +
    circ(400, 200, 20, '#FFC928', false) + p('M372 280 Q410 236 470 282 Z', '#3DAA5C', false)) + adult({
    hair: { front: 'short', color: HAIR }, face: { brows: HAIR }, hat: 'beret',
    shirt: '#4F8FE0', legs: 'trousers', trousers: '#3D4A66', shoes: '#141414',
    overTorso: p('M210 262 L302 262 L310 384 L202 384 Z', '#F4F1EA') + circ(232, 312, 7, '#E8384F', false) + circ(272, 340, 6, '#4FB3F6', false),
    arms: { L: [[170, 330], [158, 318]], R: [[340, 270], [346, 236]] },
    held: p('M90 300 Q100 262 150 262 Q200 266 196 304 Q190 340 150 336 Q132 334 128 346 Q110 360 96 340 Q84 324 90 300 Z', '#E9C88E') +
      circ(118, 292, 9, '#E8384F', false) + circ(146, 280, 9, '#FFC928', false) + circ(174, 292, 9, '#4FB3F6', false) + circ(170, 318, 9, '#3DAA5C', false) +
      line('M346 236 L370 150', '#A0662E', 7) + ell(372, 142, 6, 12, '#E8384F', false),
  }),
  scientist: disc('#E6F7EE') + adult({
    skin: 'medium', hair: { front: 'curly', color: GREY }, face: { brows: HAIR, goggles: true },
    coat: '#FFFFFF', shirt: '#FFFFFF', sleeve: '#FFFFFF', legs: 'trousers', trousers: '#4A4A5A', shoes: '#141414',
    overTorso: p('M236 236 L256 292 L276 236 Z', '#9B59D0') + line('M256 292 L256 430', INK, 4),
    arms: { R: [[352, 232], [362, 200]] },
    held: p('M352 190 L352 150 L374 150 L374 190 L404 250 Q408 262 396 262 L330 262 Q318 262 322 250 Z', '#E6F7FF') + p('M334 232 L392 232 L404 250 Q408 262 396 262 L330 262 Q318 262 322 250 Z', '#5DE08A', false) +
      circ(352, 128, 8, '#5DE08A', false) + circ(370, 104, 6, '#5DE08A', false) + circ(346, 84, 5, '#5DE08A', false),
  }),
};

for (const [key, body] of Object.entries(family)) out('family', key, body);
for (const [key, body] of Object.entries(jobs)) out('jobs', key, body);
console.log('family', Object.keys(family).length, 'jobs', Object.keys(jobs).length);
