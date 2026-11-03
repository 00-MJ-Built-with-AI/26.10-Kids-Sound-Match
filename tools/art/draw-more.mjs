// Actions added in November 2026, in the same style as the others (Feelings and Body parts moved to
// draw-feelings-body.mjs).
// Writes only the new files. Usage: node tools/art/draw-more.mjs
import fs from 'node:fs';
import path from 'node:path';
import { BLUSH, HAIR, INK, OW, SKINS, circ, ell, fit, head, line, note, path as p, person, rect, svg, tube } from './people-lib.mjs';

const PACKS = path.join(process.cwd(), 'public', 'assets', 'packs');
const out = (pack, key, s) => fs.writeFileSync(path.join(PACKS, pack, `${key}.svg`), s);

// Feelings and Body parts were redrawn as one whole child: see draw-feelings-body.mjs.
const { skin: SKIN } = SKINS.light;

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
console.log('actions', Object.keys(actions).length);
