// Generate favicon + app icons from the brand face mark.
// Composes a butter rounded-square with the red face centered, then rasterizes.
//   node scripts/gen-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pub = resolve(root, 'public');

const BG = '#FBF5D4'; // butter
const FG = '#ED2739'; // brand red

// Pull the face's inner markup (drop its outer <svg> wrapper) and force red.
const faceRaw = readFileSync(resolve(root, 'src/assets/brand/face.svg'), 'utf8');
const inner = faceRaw
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replaceAll('currentColor', FG);

// face viewBox is 286x265 — fit it to ~64% of a 512 square, centered.
const VB_W = 286, VB_H = 265, SIZE = 512;
const targetW = SIZE * 0.64;
const scale = targetW / VB_W;
const tx = (SIZE - VB_W * scale) / 2;
const ty = (SIZE - VB_H * scale) / 2;

const master = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" rx="110" fill="${BG}"/>
  <g fill="${FG}" fill-rule="evenodd" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">${inner}</g>
</svg>`;

// Crisp standalone favicon.svg (modern browsers use this first).
writeFileSync(resolve(pub, 'favicon.svg'), master);

const masterBuf = Buffer.from(master);
const png = (size) => sharp(masterBuf, { density: 384 }).resize(size, size).png();

const sizes = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
];

for (const [name, size] of sizes) {
  await png(size).toFile(resolve(pub, name));
  console.log('wrote', name);
}

// favicon.ico from 16/32/48
const icoBufs = await Promise.all([16, 32, 48].map((s) => png(s).toBuffer()));
writeFileSync(resolve(pub, 'favicon.ico'), await pngToIco(icoBufs));
console.log('wrote favicon.ico + favicon.svg');
