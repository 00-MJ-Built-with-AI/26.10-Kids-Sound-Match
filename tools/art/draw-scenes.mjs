// The soft illustrated backgrounds behind the games, one per kind of picture set (a farm for animals,
// a road for vehicles, a kitchen for food...). Pale, with the detail at the edges, so the cards in
// the middle stay the clearest thing on screen. Clouds and stars drift slowly (still when the phone
// asks for less motion). Usage: node tools/art/draw-scenes.mjs   (writes public/backgrounds/*.svg)
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'public', 'backgrounds');
fs.mkdirSync(OUT, { recursive: true });

const W = 1600;
const H = 1000;
const MOTION = `
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
  .drift { animation: drift 60s linear infinite; }
  .drift.b { animation-duration: 90s; animation-direction: reverse; }
  @keyframes drift { from { transform: translateX(-80px) } 50% { transform: translateX(80px) } to { transform: translateX(-80px) } }
  .twinkle { animation: twinkle 3s ease-in-out infinite; }
  .twinkle.b { animation-delay: 1.5s; }
  @keyframes twinkle { 0%,100% { opacity: .9 } 50% { opacity: .3 } }
  .sway { animation: sway 5s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
  @keyframes sway { from { transform: rotate(-2deg) } to { transform: rotate(2deg) } }
  .bob { animation: bob 4s ease-in-out infinite; }
  @keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }`;
const svg = (sky, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">
  <style>${MOTION}
  </style>
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${body}
</svg>
`;
const cloud = (x, y, s, o = 0.9) =>
  `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="90" ry="44" fill="#fff"/><ellipse cx="-60" cy="14" rx="60" ry="34" fill="#fff"/><ellipse cx="66" cy="16" rx="66" ry="32" fill="#fff"/></g>`;
const clouds = `<g class="drift">${cloud(220, 140, 1)}${cloud(1240, 110, 1.2)}</g><g class="drift b">${cloud(760, 200, 0.8, 0.7)}${cloud(1500, 260, 0.7, 0.6)}</g>`;
const sun = (x, y) => `<circle cx="${x}" cy="${y}" r="70" fill="#FFE08A"/><circle cx="${x}" cy="${y}" r="110" fill="#FFE08A" opacity="0.25"/>`;
const hills = (c1, c2) =>
  `<path d="M0 760 Q300 640 640 720 T1260 700 T1600 720 V1000 H0 Z" fill="${c1}"/><path d="M0 840 Q420 760 820 830 T1600 810 V1000 H0 Z" fill="${c2}"/>`;
const flowers = (y, n = 12) =>
  Array.from({ length: n }, (_, i) => {
    const x = 60 + i * (W / n);
    const c = ['#FFB3C6', '#FFE08A', '#C9B8FF', '#FFFFFF'][i % 4];
    return `<g transform="translate(${x} ${y + (i % 3) * 18})"><circle r="9" fill="${c}"/><circle r="4" fill="#F7A14A"/></g>`;
  }).join('');
const tree = (x, y, s = 1) =>
  `<g class="sway" transform="translate(${x} ${y}) scale(${s})"><rect x="-14" y="-10" width="28" height="120" rx="10" fill="#C9A27A"/><circle cx="0" cy="-60" r="80" fill="#A8D99A"/><circle cx="-50" cy="-20" r="56" fill="#9DD18E"/><circle cx="54" cy="-26" r="58" fill="#B4E0A6"/></g>`;

const scenes = {
  // Animals: hills, a red barn, a fence, flowers.
  farm: svg(['#DDF1FF', '#FFF6E8'], `${sun(1380, 170)}${clouds}${hills('#CDEBC0', '#B9E2A8')}
    <g transform="translate(80 560)"><path d="M0 200 V80 L110 0 L220 80 V200 Z" fill="#F4A6A0"/><rect x="80" y="110" width="60" height="90" fill="#FFF3EA"/><path d="M80 110 L140 200 M140 110 L80 200" stroke="#F4A6A0" stroke-width="8"/><path d="M-10 86 L110 -6 L230 86" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/></g>
    <g fill="none" stroke="#F3DCC0" stroke-width="12" stroke-linecap="round">${Array.from({ length: 9 }, (_, i) => `<path d="M${1050 + i * 60} 790 V860"/>`).join('')}<path d="M1030 810 H1560 M1030 840 H1560"/></g>
    ${flowers(900)}`),
  // Vehicles: a city skyline and a road with dashes.
  road: svg(['#DDF1FF', '#F6F2FF'], `${sun(260, 160)}${clouds}
    <g fill="#E6E0F5">${[[80, 520, 140, 300], [240, 460, 120, 360], [380, 560, 160, 260], [1100, 500, 130, 320], [1250, 440, 150, 380], [1420, 540, 140, 280]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/>`).join('')}</g>
    <g fill="#fff" opacity="0.8">${Array.from({ length: 18 }, (_, i) => `<rect x="${100 + (i % 6) * 26 + (i > 11 ? 1040 : i > 5 ? 160 : 0)}" y="${560 + Math.floor((i % 12) / 6) * 60}" width="14" height="20" rx="3"/>`).join('')}</g>
    <rect y="820" width="${W}" height="180" fill="#C9CCD8"/><rect y="800" width="${W}" height="24" fill="#B9E2A8"/>
    <g fill="#fff">${Array.from({ length: 10 }, (_, i) => `<rect x="${40 + i * 170}" y="900" width="90" height="14" rx="7"/>`).join('')}</g>`),
  // Food: a kitchen wall with tiles, a shelf with jars, a window.
  kitchen: svg(['#FFF4E6', '#FFEAD6'], `
    <g fill="none" stroke="#FFE2C8" stroke-width="4">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 100} 0 V760"/>`).join('')}${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${i * 100} H1600"/>`).join('')}</g>
    <rect x="1180" y="90" width="300" height="240" rx="24" fill="#DDF1FF" stroke="#fff" stroke-width="14"/>${cloud(1300, 190, 0.6)}
    <rect x="80" y="300" width="380" height="20" rx="10" fill="#E2B88A"/>
    <g><rect x="110" y="220" width="70" height="80" rx="16" fill="#FFB3C6"/><rect x="200" y="200" width="80" height="100" rx="18" fill="#C9E7B4"/><rect x="300" y="230" width="60" height="70" rx="14" fill="#FFE08A"/></g>
    <rect y="760" width="${W}" height="240" fill="#F6D9BC"/><rect y="760" width="${W}" height="26" fill="#EFC9A2"/>`),
  // Things at home, toys, clothes: a playroom with bunting, a rug, shelves.
  playroom: svg(['#FFF0F6', '#FFF7EC'], `
    <path d="M0 80 Q400 180 800 90 T1600 90" fill="none" stroke="#E8C9D8" stroke-width="5"/>
    ${Array.from({ length: 14 }, (_, i) => { const x = 40 + i * 115; const y = 92 + Math.sin(i * 0.9) * 26; return `<path d="M${x} ${y} l40 0 l-20 46 Z" fill="${['#FFB3C6', '#BFE6FF', '#FFE08A', '#C9E7B4'][i % 4]}"/>`; }).join('')}
    <rect x="1240" y="300" width="260" height="20" rx="10" fill="#E2B88A"/><circle cx="1290" cy="276" r="26" fill="#F7A14A"/><rect x="1340" y="246" width="50" height="54" rx="10" fill="#9CC9F2"/><path d="M1420 300 l30 -60 l30 60 Z" fill="#C9B8FF"/>
    <rect y="780" width="${W}" height="220" fill="#F3E3D3"/><ellipse cx="800" cy="900" rx="560" ry="70" fill="#FFD6E2" opacity="0.8"/><ellipse cx="800" cy="900" rx="440" ry="50" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="20 18"/>`),
  // Weather, nature, a mix of everything: a garden with trees and a rainbow.
  garden: svg(['#DDF1FF', '#F3FFF0'], `
    <g fill="none" stroke-width="34" opacity="0.35">${['#FFB3C6', '#FFE08A', '#C9E7B4', '#BFE6FF', '#C9B8FF'].map((c, i) => `<path d="M140 760 A660 560 0 0 1 1460 760" stroke="${c}" transform="translate(0 ${i * 34}) scale(1 ${1 - i * 0.02})"/>`).join('')}</g>
    ${clouds}${hills('#D6F0C8', '#C2E8B2')}${tree(130, 700, 1.1)}${tree(1480, 690, 1)}${flowers(890, 14)}`),
  // People, the body, feelings, jobs: a park with a slide and a bench.
  park: svg(['#E2F2FF', '#FFF7EC'], `${sun(1400, 160)}${clouds}${hills('#D6F0C8', '#C9EBB8')}${tree(200, 690)}
    <g transform="translate(1120 560)"><path d="M0 240 V40 M60 240 V40" stroke="#F4A6A0" stroke-width="16"/><path d="M0 80 H60 M0 140 H60 M0 200 H60" stroke="#F4A6A0" stroke-width="10"/><path d="M60 40 L280 240" stroke="#FFE08A" stroke-width="30" stroke-linecap="round"/></g>
    <g transform="translate(560 830)"><rect width="200" height="22" rx="10" fill="#E2B88A"/><rect x="20" y="22" width="14" height="40" fill="#C9A27A"/><rect x="166" y="22" width="14" height="40" fill="#C9A27A"/></g>${flowers(920, 10)}`),
  // Shapes, colours, counting, letters, opposites: soft space with planets and stars.
  space: svg(['#E9E4FF', '#FDF0FF'], `
    <circle cx="1350" cy="220" r="110" fill="#FFD6E2"/><ellipse cx="1350" cy="220" rx="180" ry="34" fill="none" stroke="#C9B8FF" stroke-width="16" transform="rotate(-18 1350 220)"/>
    <circle cx="230" cy="760" r="150" fill="#D6F0FF"/><circle cx="190" cy="720" r="26" fill="#BFE6FF"/><circle cx="270" cy="800" r="18" fill="#BFE6FF"/>
    <g class="bob"><circle cx="1180" cy="760" r="70" fill="#FFF1C2"/></g>
    ${Array.from({ length: 22 }, (_, i) => { const x = (i * 271) % 1560 + 20; const y = (i * 137) % 640 + 30; return `<path class="twinkle${i % 2 ? ' b' : ''}" d="M${x} ${y - 12} l4 8 l9 4 l-9 4 l-4 8 l-4 -8 l-9 -4 l9 -4 Z" fill="${['#FFE08A', '#fff', '#FFB3C6'][i % 3]}"/>`; }).join('')}`),
  // Instruments, songs: a little stage with curtains and spotlights.
  stage: svg(['#F6E8FF', '#FFF0F6'], `
    <path d="M0 0 H260 Q220 400 260 1000 H0 Z" fill="#F4B8CC"/><path d="M1600 0 H1340 Q1380 400 1340 1000 H1600 Z" fill="#F4B8CC"/>
    <path d="M0 0 H1600 V90 Q1200 150 800 100 Q400 150 0 90 Z" fill="#EDA0BA"/>
    <path d="M560 0 L380 900 H1220 L1040 0 Z" fill="#fff" opacity="0.25"/>
    <rect y="860" width="${W}" height="140" fill="#E8C9A8"/><rect y="850" width="${W}" height="18" fill="#D6B08A"/>
    ${Array.from({ length: 8 }, (_, i) => `<text class="twinkle${i % 2 ? ' b' : ''}" x="${300 + i * 140}" y="${240 + (i % 3) * 90}" font-size="60" fill="#C9B8FF" font-family="sans-serif">♪</text>`).join('')}`),
  // Where does it live?, under the water: the sea with bubbles and seaweed.
  sea: svg(['#DDF4FF', '#BFE6FF'], `
    <path d="M0 160 Q200 130 400 160 T800 160 T1200 160 T1600 160 V0 H0 Z" fill="#E9F8FF"/>
    ${Array.from({ length: 12 }, (_, i) => `<circle class="bob" cx="${120 + i * 130}" cy="${300 + (i * 97) % 400}" r="${8 + (i % 3) * 6}" fill="#fff" opacity="0.6"/>`).join('')}
    <path d="M0 880 Q400 840 800 880 T1600 870 V1000 H0 Z" fill="#F6E3B8"/>
    ${[160, 300, 1300, 1460].map((x) => `<path class="sway" d="M${x} 900 q-30 -80 0 -160 q30 -80 0 -160" fill="none" stroke="#9DD18E" stroke-width="18" stroke-linecap="round"/>`).join('')}`),
};

for (const [name, s] of Object.entries(scenes)) fs.writeFileSync(path.join(OUT, `${name}.svg`), s);
console.log(`draw-scenes: wrote ${Object.keys(scenes).length} backgrounds`);
