// New colours, shapes and counting pictures, in the same style as the existing ones.
// Usage: node draw-basics.mjs <kids-app folder>
import fs from 'node:fs';
import path from 'node:path';

const P = path.join(process.argv[2], 'public', 'assets', 'packs');
const read = (f) => fs.readFileSync(path.join(P, f), 'utf8');
const write = (f, s) => fs.writeFileSync(path.join(P, f), s);
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// Colours: the same paint splash as Red, in each new colour (white and grey get an outline so they
// show on the white cards; gold gets a shine).
const splash = read('colors/color_red.svg');
const COLORS = { pink: '#FF7EB6', brown: '#8D5A3B', black: '#2B2B2B', white: '#FFFFFF', grey: '#9AA0A6', gold: '#E0A800' };
for (const [name, fill] of Object.entries(COLORS)) {
  let s = splash.replaceAll('fill="#e63946"', `fill="${fill}"`);
  if (name === 'white') s = s.replace(/<(polygon|circle|ellipse)(?![^>]*fill="#fff")/g, '<$1 stroke="#C9CED6" stroke-width="6"');
  if (name === 'gold') s = s.replace('</svg>', '<path d="M190 210 l14 -30 l14 30 l30 14 l-30 14 l-14 30 l-14 -30 l-30 -14 Z" fill="#FFF3B0"/><path d="M330 300 l9 -19 l9 19 l19 9 l-19 9 l-9 19 l-9 -19 l-19 -9 Z" fill="#FFF3B0"/></svg>');
  write(`colors/color_${name}.svg`, s);
}

// Shapes: one slate shape, like the others.
const shape = (el) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${el}</svg>\n`;
const S = 'fill="#4b5d73" stroke="#4b5d73" stroke-width="16" stroke-linejoin="round"';
const hex = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 2; return `${(256 + 200 * Math.cos(a)).toFixed(1)},${(256 + 200 * Math.sin(a)).toFixed(1)}`; }).join(' ');
const SHAPES = {
  rectangle: `<rect x="56" y="146" width="400" height="220" rx="6" ${S}/>`,
  oval: `<ellipse cx="256" cy="256" rx="210" ry="140" ${S}/>`,
  diamond: `<polygon points="256,46 416,256 256,466 96,256" ${S}/>`,
  hexagon: `<polygon points="${hex}" ${S}/>`,
  plus: `<polygon points="196,66 316,66 316,196 446,196 446,316 316,316 316,446 196,446 196,316 66,316 66,196 196,196" ${S}/>`,
  arrow: `<polygon points="56,196 286,196 286,96 456,256 286,416 286,316 56,316" ${S}/>`,
};
for (const [name, el] of Object.entries(SHAPES)) write(`shapes/shape_${name}.svg`, shape(el));

// Counting 6 to 10: the one-item picture of each series, repeated in rows.
const ROWS = { 6: [3, 3], 7: [4, 3], 8: [4, 4], 9: [3, 3, 3], 10: [4, 3, 3] };
for (const series of ['dots', 'apples', 'stars', 'balloons', 'fish']) {
  const one = inner(read(`counting/count_1_${series}.svg`));
  for (const [n, rows] of Object.entries(ROWS)) {
    const cols = Math.max(...rows);
    const cell = Math.min(492 / cols, 492 / rows.length);
    const top = 256 - (cell * rows.length) / 2;
    let body = '';
    rows.forEach((count, r) => {
      const left = 256 - (cell * count) / 2;
      for (let c = 0; c < count; c++) {
        body += `<svg x="${(left + c * cell).toFixed(1)}" y="${(top + r * cell).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" viewBox="92 92 328 328">${one}</svg>`;
      }
    });
    write(`counting/count_${n}_${series}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${body}</svg>\n`);
  }
}
console.log('colours, shapes, counting drawn');
