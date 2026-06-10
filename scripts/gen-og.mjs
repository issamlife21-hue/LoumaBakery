// Generate public/og-default.jpg (1200x630) for social link previews.
// Cream field + the brand face mark + the "Louma Bakery" wordmark, both as
// committed vector outlines (font-independent). Re-run if the marks change:
//   node scripts/gen-og.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;
const CREAM = '#FAF5EA';

// Embed a source SVG as a nested <svg> at x/y/w/h, recolored, with the roughen
// filter + defs stripped (resvg/librsvg need not support the filter for a clean
// static mark).
function embed(file, { x, y, w, h, color }) {
  let svg = readFileSync(join(root, 'src/assets/brand', file), 'utf8');
  svg = svg
    .replace(/<defs>[\s\S]*?<\/defs>/g, '')
    .replace(/\sfilter="url\(#[^)]*\)"/g, '')
    .replace(/currentColor/g, color);
  return svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
}

const face = embed('face.svg', { x: (W - 150) / 2, y: 96, w: 150, h: 139, color: '#ED2739' });
const word = embed('wordmark.svg', { x: (W - 420) / 2, y: 271, w: 420, h: 269, color: '#6E1F2A' });

const composite = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  ${face}
  ${word}
</svg>`;

await sharp(Buffer.from(composite)).jpeg({ quality: 86, progressive: true }).toFile(join(root, 'public/og-default.jpg'));
console.log('Wrote public/og-default.jpg');
