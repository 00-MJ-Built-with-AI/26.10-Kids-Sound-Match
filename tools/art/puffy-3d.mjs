// The 3D pictures for the Puffy toys look: Microsoft Fluent Emoji (MIT), matched to every photo card
// that has one. Cards with no 3D version keep their drawing.
// Usage: node puffy-3d.mjs <kids-app folder> <fluent tree.json> <download folder>
//   tree.json: gh api "repos/microsoft/fluentui-emoji/git/trees/main?recursive=1"
// Then turn the PNGs into WebP (see the note at the end).
import fs from 'node:fs';
import path from 'node:path';

const [repo, treeFile, outDir] = process.argv.slice(2);
const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/';
const EMOJI = JSON.parse(fs.readFileSync(path.join(repo, 'src/content/placeholder-emoji.json'), 'utf8'));

// Cards added after the emoji list: the Fluent folder that shows the same thing.
const FOLDER = {
  bunny: 'Rabbit face', caterpillar: 'Bug',
  tshirt: 'T-shirt', dress: 'Dress', trousers: 'Jeans', shorts: 'Shorts', coat: 'Coat', scarf: 'Scarf', gloves: 'Gloves',
  glasses: 'Glasses', boot: "Woman's boot", sandals: "Woman's sandal", slippers: 'Thong sandal', trainers: 'Running shoe',
  cap: 'Billed cap', tie: 'Necktie', sunglasses: 'Sunglasses', school_bag: 'Backpack', umbrella: 'Umbrella', watch: 'Watch',
  ball: 'Soccer ball', teddy: 'Teddy bear', balloon: 'Balloon', bubbles: 'Bubbles', book: 'Closed book', shoe: "Man's shoe",
  socks: 'Socks', hat: "Woman's hat", cup: 'Cup with straw', spoon: 'Spoon', bottle: 'Baby bottle', bed: 'Bed', chair: 'Chair',
  bath: 'Bathtub', soap: 'Soap', sofa: 'Couch and lamp', window: 'Window', plate: 'Fork and knife with plate',
  toilet: 'Toilet', tv: 'Television',
  flute: 'Flute', maracas: 'Maracas', keyboard: 'Musical keyboard',
  kite: 'Kite', puzzle: 'Puzzle piece', doll: 'Nesting dolls', robot: 'Robot', crayon: 'Crayon', slide: 'Playground slide',
  scooter: 'Kick scooter', skateboard: 'Skateboard', dice: 'Game die', yoyo: 'Yo-yo', rocking_horse: 'Carousel horse',
  bucket_spade: 'Bucket', dinosaur: 'Sauropod', paints: 'Artist palette',
  taxi: 'Taxi', van: 'Minibus', boat: 'Sailboat', tram: 'Tram',
  sun: 'Sun', moon: 'Crescent moon', star: 'Star', cloud: 'Cloud', rain: 'Cloud with rain', thunder: 'High voltage',
  wind: 'Wind face', snowflake: 'Snowflake', rainbow: 'Rainbow', waves: 'Water wave', fire: 'Fire', tree: 'Deciduous tree',
  snowman: 'Snowman', mountain: 'Mountain', leaf: 'Leaf fluttering in wind', stone: 'Rock', volcano: 'Volcano',
  mushroom: 'Mushroom', cactus: 'Cactus', palm_tree: 'Palm tree', sunflower: 'Sunflower', earth: 'Globe showing Europe-Africa',
  shell: 'Spiral shell',
  hay: 'Sheaf of rice', corn: 'Ear of corn', worm: 'Worm', fly: 'Fly', peanuts: 'Peanuts', nuts: 'Chestnut', cabbage: 'Leafy green',
};

const tree = JSON.parse(fs.readFileSync(treeFile, 'utf8')).tree.map((t) => t.path);
const png3d = new Map();
for (const p of tree) {
  const m = p.match(/^assets\/([^/]+)\/(?:(Default)\/)?3D\/[^/]+\.png$/);
  if (m) png3d.set(m[1], p);
}
const folders = [...new Set(tree.filter((p) => /^assets\/[^/]+\/metadata\.json$/.test(p)).map((p) => p.split('/')[1]))];

const pool = async (list, n, job) => {
  const out = [];
  let at = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (at < list.length) {
      const i = at++;
      out[i] = await job(list[i]);
    }
  }));
  return out;
};
const clean = (s) => s.replace(/️/g, '');
const glyphs = new Map();
await pool(folders, 24, async (name) => {
  try {
    const meta = await (await fetch(`${CDN}assets/${encodeURIComponent(name)}/metadata.json`)).json();
    if (meta.glyph) glyphs.set(clean(meta.glyph), name);
  } catch {
    // A folder that can't be read just can't be matched.
  }
});
console.log('glyphs', glyphs.size, 'of', folders.length);

const packsDir = path.join(repo, 'public/assets/packs');
const wanted = [];
const none = [];
for (const pack of fs.readdirSync(packsDir)) {
  const file = path.join(packsDir, pack, 'manifest.json');
  if (!fs.existsSync(file)) continue;
  for (const item of JSON.parse(fs.readFileSync(file, 'utf8')).items) {
    const image = item.image ?? item.images?.[0];
    if (!image || !/\.jpe?g$/i.test(image)) continue;
    const folder = FOLDER[item.item_key] ?? glyphs.get(clean(EMOJI[item.item_key] ?? ''));
    if (folder && png3d.has(folder)) wanted.push({ image, folder });
    else none.push(`${pack}/${item.item_key}`);
  }
}
fs.mkdirSync(outDir, { recursive: true });
const seen = new Set();
const unique = wanted.filter((w) => !seen.has(w.image) && seen.add(w.image));
let saved = 0;
await pool(unique, 12, async ({ image, folder }) => {
  const res = await fetch(CDN + png3d.get(folder).split('/').map(encodeURIComponent).join('/'));
  if (!res.ok) return none.push(image);
  const name = image.replace(/\.jpe?g$/i, '.png').replace('/', '__');
  fs.writeFileSync(path.join(outDir, name), Buffer.from(await res.arrayBuffer()));
  saved++;
});
console.log('saved', saved, 'no 3D version:', none.length);
console.log(none.join(' '));
// Then: for each <pack>__<name>.png, save public/assets/looks/puffy/<pack>/<name>.webp (quality 85).
