// Bake the pencil "roughen" (feTurbulence + feDisplacementMap) INTO the path
// geometry of the three sketches, so NO live SVG filter ever runs at render
// time (the filters are expensive on iPhone GPUs and often CPU-fallback).
//
// The originals in src/assets/brand/*.svg are untouched (they are the brand
// source). This writes *-baked.svg siblings that the components render.
// The displacement math is a direct port of the SVG 1.1 spec feTurbulence
// reference implementation, so the baked line lands where the filter drew it.
//
// Re-run after any sketch change:  node scripts/bake-sketches.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BRAND = join(dirname(fileURLToPath(import.meta.url)), '../src/assets/brand');

/* ---------------- SVG spec feTurbulence (reference implementation port) --- */
const BSize = 0x100, BM = 0xff;
function makeNoise(seed) {
  const latticeSelector = new Int32Array(BSize + BSize + 2);
  const gradient = []; // [4][BSize+BSize+2][2]
  for (let k = 0; k < 4; k++) gradient.push(Array.from({ length: BSize + BSize + 2 }, () => [0, 0]));
  const RAND_m = 2147483647, RAND_a = 16807, RAND_q = 127773, RAND_r = 2836;
  let s = seed;
  if (s <= 0) s = -(s % (RAND_m - 1)) + 1;
  if (s > RAND_m - 1) s = RAND_m - 1;
  const rnd = () => { s = RAND_a * (s % RAND_q) - RAND_r * Math.floor(s / RAND_q); if (s <= 0) s += RAND_m; return s; };
  for (let k = 0; k < 4; k++) {
    for (let i = 0; i < BSize; i++) {
      if (k === 0) latticeSelector[i] = i;
      const a = (rnd() % (BSize + BSize)) - BSize;
      const b = (rnd() % (BSize + BSize)) - BSize;
      const len = Math.sqrt(a * a + b * b) || 1;
      gradient[k][i][0] = a / len;
      gradient[k][i][1] = b / len;
    }
  }
  for (let i = BSize - 1; i > 0; i--) {
    const j = rnd() % BSize;
    const t = latticeSelector[i];
    latticeSelector[i] = latticeSelector[j];
    latticeSelector[j] = t;
  }
  for (let i = 0; i < BSize + 2; i++) {
    latticeSelector[BSize + i] = latticeSelector[i];
    for (let k = 0; k < 4; k++) {
      gradient[k][BSize + i][0] = gradient[k][i][0];
      gradient[k][BSize + i][1] = gradient[k][i][1];
    }
  }
  return { latticeSelector, gradient };
}
const sCurve = (t) => t * t * (3 - 2 * t);
const lerp = (t, a, b) => a + t * (b - a);
function noise2(state, channel, vx, vy) {
  const { latticeSelector, gradient } = state;
  const PerlinN = 0x1000;
  let t = vx + PerlinN;
  const bx0 = Math.floor(t) & BM, bx1 = (bx0 + 1) & BM;
  const rx0 = t - Math.floor(t), rx1 = rx0 - 1;
  t = vy + PerlinN;
  const by0 = Math.floor(t) & BM, by1 = (by0 + 1) & BM;
  const ry0 = t - Math.floor(t), ry1 = ry0 - 1;
  const i = latticeSelector[bx0], j = latticeSelector[bx1];
  const b00 = latticeSelector[i + by0], b10 = latticeSelector[j + by0];
  const b01 = latticeSelector[i + by1], b11 = latticeSelector[j + by1];
  const sx = sCurve(rx0), sy = sCurve(ry0);
  let q = gradient[channel][b00]; let u = rx0 * q[0] + ry0 * q[1];
  q = gradient[channel][b10]; let v = rx1 * q[0] + ry0 * q[1];
  const a = lerp(sx, u, v);
  q = gradient[channel][b01]; u = rx0 * q[0] + ry1 * q[1];
  q = gradient[channel][b11]; v = rx1 * q[0] + ry1 * q[1];
  const b = lerp(sx, u, v);
  return lerp(sy, a, b);
}
function turbulence(state, channel, x, y, baseFreq, octaves) {
  // type="fractalNoise", stitch off: sum(noise/f) / 2 + 0.5
  let sum = 0, vx = x * baseFreq, vy = y * baseFreq, ratio = 1;
  for (let o = 0; o < octaves; o++) {
    sum += noise2(state, channel, vx, vy) / ratio;
    vx *= 2; vy *= 2; ratio *= 2;
  }
  return sum / 2 + 0.5;
}

/* ---------------- path sampling (M/L/C/Z absolute, the sketch vocabulary) -- */
function parsePath(d) {
  const tokens = d.match(/[MLCZmlcz]|-?\d*\.?\d+(?:e-?\d+)?/g);
  const subpaths = [];
  let pts = [], cx = 0, cy = 0, i = 0, closed = false;
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M' || cmd === 'm') {
      if (pts.length) { subpaths.push({ pts, closed }); pts = []; closed = false; }
      const x = num(), y = num();
      cx = cmd === 'm' ? cx + x : x; cy = cmd === 'm' ? cy + y : y;
      pts.push([cx, cy]);
    } else if (cmd === 'L' || cmd === 'l') {
      const x = num(), y = num();
      const nx = cmd === 'l' ? cx + x : x, ny = cmd === 'l' ? cy + y : y;
      sampleLine(pts, cx, cy, nx, ny); cx = nx; cy = ny;
    } else if (cmd === 'C' || cmd === 'c') {
      const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x = num(), y = num();
      const [a1, b1, a2, b2, nx, ny] = cmd === 'c'
        ? [cx + x1, cy + y1, cx + x2, cy + y2, cx + x, cy + y]
        : [x1, y1, x2, y2, x, y];
      sampleCubic(pts, cx, cy, a1, b1, a2, b2, nx, ny); cx = nx; cy = ny;
    } else if (cmd === 'Z' || cmd === 'z') {
      closed = true;
    } else {
      // A number where a command was expected: repeat implicit L
      i--; const x = num(), y = num();
      sampleLine(pts, cx, cy, x, y); cx = x; cy = y;
    }
  }
  if (pts.length) subpaths.push({ pts, closed });
  return subpaths;
}
let STEP = 2.0; // sample density in user units (set per file below)
function sampleLine(pts, x0, y0, x1, y1) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(1, Math.ceil(len / STEP));
  for (let k = 1; k <= n; k++) pts.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
}
function sampleCubic(pts, x0, y0, x1, y1, x2, y2, x3, y3) {
  const chord = Math.hypot(x3 - x0, y3 - y0) + Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
  const n = Math.max(2, Math.ceil(chord / STEP));
  for (let k = 1; k <= n; k++) {
    const t = k / n, mt = 1 - t;
    const x = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
    const y = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
    pts.push([x, y]);
  }
}

/* ---------------- bake one file --------------------------------------- */
function bake(file, out, step = 2.0) {
  STEP = step;
  const svg = readFileSync(join(BRAND, file), 'utf8');
  const bf = parseFloat((svg.match(/baseFrequency="([^"]+)"/) || [])[1]);
  const oct = parseInt((svg.match(/numOctaves="([^"]+)"/) || [])[1], 10);
  const seed = parseInt((svg.match(/seed="([^"]+)"/) || [])[1], 10);
  const scale = parseFloat((svg.match(/scale="([^"]+)"/) || [])[1]);
  const d = (svg.match(/\sd="([^"]*)"/) || [])[1];
  if (!d || !bf) throw new Error(`${file}: missing filter params or path`);
  const state = makeNoise(seed);
  const displace = ([x, y]) => {
    // feDisplacementMap: P' = P + scale * (XC(P) - 0.5, YC(P) - 0.5); XC=R(0), YC=G(1)
    const dx = scale * (turbulence(state, 0, x, y, bf, oct) - 0.5);
    const dy = scale * (turbulence(state, 1, x, y, bf, oct) - 0.5);
    return [x + dx, y + dy];
  };
  const subpaths = parsePath(d);
  const baked = subpaths.map(({ pts, closed }) => {
    const moved = pts.map(displace).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`);
    return `M ${moved[0]} L ${moved.slice(1).join(' ')}${closed ? ' Z' : ''}`;
  }).join(' ');
  const cleaned = svg
    .replace(/<defs>[\s\S]*?<\/defs>/, '')
    .replace(/\sfilter="url\(#[^)]*\)"/g, '')
    .replace(/\sd="[^"]*"/, ` d="${baked}"`);
  writeFileSync(join(BRAND, out), cleaned);
  console.log(`${out}: ${subpaths.length} subpaths, ${subpaths.reduce((n, s) => n + s.pts.length, 0)} pts`);
}

bake('baguette.svg', 'baguette-baked.svg', 2.0);
bake('toast.svg', 'toast-baked.svg', 2.0);
// The face renders small (<=104px), so coarser sampling is invisible there.
bake('face.svg', 'face-baked.svg', 3.2);
