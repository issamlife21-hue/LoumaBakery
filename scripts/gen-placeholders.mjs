// Generate placeholder SOURCE images for the Astro <Image>/<Picture> pipeline.
// These are warm brand-gradient stand-ins; swap the files (keep names/shapes)
// when real photography lands.  node scripts/gen-placeholders.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '..', 'src/assets/placeholders');
mkdirSync(out, { recursive: true });

const grad = (w, h, a, b, angle = 135) => {
  const rad = (angle * Math.PI) / 180;
  const x2 = (Math.cos(rad) * 0.5 + 0.5).toFixed(3);
  const y2 = (Math.sin(rad) * 0.5 + 0.5).toFixed(3);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <defs><linearGradient id="g" x1="0" y1="0" x2="${x2}" y2="${y2}">
         <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
       </linearGradient></defs>
       <rect width="${w}" height="${h}" fill="url(#g)"/>
     </svg>`,
  );
};

const jobs = [
  ['hero.jpg', 1920, 1280, '#3A2118', '#2A1F18'],
  ['feature.jpg', 1600, 1000, '#B8533F', '#6E1F2A'],
  ['landscape.jpg', 1200, 900, '#F5EDD8', '#E8D4AA'],
  ['portrait.jpg', 900, 1200, '#EFE2C4', '#C8853A'],
  ['square.jpg', 1000, 1000, '#F5EDD8', '#E8D4AA'],
];

for (const [name, w, h, a, b] of jobs) {
  const buf = await sharp(grad(w, h, a, b)).jpeg({ quality: 70, mozjpeg: true }).toBuffer();
  writeFileSync(resolve(out, name), buf);
  console.log('wrote', name, `${(buf.length / 1024).toFixed(1)}kB`);
}
