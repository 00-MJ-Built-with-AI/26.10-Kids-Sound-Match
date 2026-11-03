// Gives the drawn people of Family and Jobs a little life: each one sways gently on the spot, as if
// breathing and saying hello. The coloured circle behind stays still. Safe to run again: a picture
// that already moves is left alone. Usage: node tools/art/add-motion.mjs
import fs from 'node:fs';
import path from 'node:path';

const PACKS = path.join(process.cwd(), 'public', 'assets', 'packs');
const STYLE = `
  <style>
    .alive { animation: alive 3.2s ease-in-out infinite; transform-origin: 0 0; }
    @keyframes alive { 0%,100% { transform: rotate(-1.6deg) translateY(0) } 50% { transform: rotate(1.6deg) translateY(-6px) } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
  </style>`;
// The circle every drawing starts with (see people-lib.mjs disc()).
const DISC = /<circle cx="256" cy="256" r="2(?:36|40)" fill="[^"]+"\/>/;

let changed = 0;
for (const pack of ['family', 'jobs']) {
  const dir = path.join(PACKS, pack);
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.svg'))) {
    const file = path.join(dir, name);
    const svg = fs.readFileSync(file, 'utf8');
    if (svg.includes('class="alive"')) continue;
    const disc = DISC.exec(svg);
    const close = svg.lastIndexOf('</svg>');
    if (!disc || close < 0) {
      console.warn(`add-motion: skipped ${pack}/${name} (no background circle)`);
      continue;
    }
    const open = svg.indexOf('>', svg.indexOf('<svg')) + 1;
    const afterDisc = disc.index + disc[0].length;
    // Sway about the feet (256, 480).
    const out =
      svg.slice(0, open) + STYLE + svg.slice(open, afterDisc) +
      `\n  <g transform="translate(256 480)"><g class="alive"><g transform="translate(-256 -480)">` +
      svg.slice(afterDisc, close) + `</g></g></g>\n` + svg.slice(close);
    fs.writeFileSync(file, out);
    changed++;
  }
}
console.log(`add-motion: ${changed} pictures now move`);
