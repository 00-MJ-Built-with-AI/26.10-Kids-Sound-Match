// The children's own drawn characters (an alternative to an animal on a colour): head-and-shoulders
// portraits in the game style, on a transparent background (the app puts them on the child's colour).
// Usage: node tools/art/draw-avatars.mjs   (writes public/avatars/*.svg)
import fs from 'node:fs';
import path from 'node:path';
import { kid } from './child-lib.mjs';

const OUT = path.join(process.cwd(), 'public', 'avatars');
fs.mkdirSync(OUT, { recursive: true });

/** The ids are kept in src/settings/profiles.ts PROFILE_CHARACTERS: change both together. */
export const AVATARS = {
  g1: { hair: 'bob', band: '#F05A8C', skin: 'light', shirt: '#F7A14A', lashes: true },
  g2: { hair: 'bob', band: '#F7D046', skin: 'medium', shirt: '#B48CF0', lashes: true },
  g3: { hair: 'pigtails', bow: '#F05A8C', skin: 'light', shirt: '#7ED0B5', lashes: true },
  g4: { hair: 'pigtails', bow: '#5B8DEF', skin: 'brown', shirt: '#F05A8C', lashes: true },
  g5: { hair: 'long', hairColor: '#2E1B12', skin: 'medium', shirt: '#5B8DEF', lashes: true },
  g6: { hair: 'long', hairColor: '#8A5A2B', band: '#7ED0B5', skin: 'light', shirt: '#F7D046', lashes: true },
  b1: { hair: 'short', skin: 'light', shirt: '#4C9BE8' },
  b2: { hair: 'short', skin: 'medium', shirt: '#E8504A' },
  b3: { hair: 'curly', skin: 'brown', shirt: '#F7C948' },
  b4: { hair: 'curly', hairColor: '#5A3A28', skin: 'medium', shirt: '#3C9D4C' },
  b5: { hair: 'short', hairColor: '#8A5A2B', skin: 'light', shirt: '#B48CF0' },
  b6: { hair: 'short', skin: 'brown', shirt: '#7ED0B5' },
};

for (const [id, o] of Object.entries(AVATARS)) {
  const body = kid({ hairColor: '#3A2418', expr: 'happy', ...o });
  fs.writeFileSync(path.join(OUT, `${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="70 0 260 260">${body}</svg>\n`);
}
console.log(`draw-avatars: wrote ${Object.keys(AVATARS).length} portraits`);
