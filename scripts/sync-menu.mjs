// Sync the menu from a Google Sheet tab published as CSV.
// NOT ACTIVE until the SHEET_CSV_URL env/repo variable is set (see scripts/README.md).
//
// Contract: validate EVERYTHING before writing ANYTHING. Any bad row aborts the
// whole run (non-zero exit, clear per-row reasons, menu.json untouched).
//
// Expected sheet columns (header row, case-insensitive):
//   Name | Price | Description | Category | Tags | Image | Active
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MENU_PATH = join(root, 'src/data/menu.json');

/** The site's category set. A sheet row outside this list is a hard error so a
 *  typo can never invent a new section. Keep in sync with src/data/menu.json. */
export const ALLOWED_CATEGORIES = ['Breads', 'Pastries', 'Sweets', 'Drinks'];

const PRICE_RE = /^\$?\d+(\.\d{2})?$/;

const Row = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  price: z.string().trim().refine((v) => v === '' || PRICE_RE.test(v), 'Price must look like $4.50 or 4.50 (or be empty)'),
  description: z.string().trim().default(''),
  category: z.string().trim().refine((v) => ALLOWED_CATEGORIES.includes(v), `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`),
  tags: z.string().trim().default(''),
  image: z.string().trim().default(''),
  active: z.string().trim().refine((v) => v === 'Active' || v === 'Inactive', 'Active must be exactly "Active" or "Inactive"'),
});

const url = process.env.SHEET_CSV_URL;
if (!url) {
  console.error('SHEET_CSV_URL is not set. Nothing to do (see scripts/README.md to activate).');
  process.exit(1);
}

const res = await fetch(url);
if (!res.ok) {
  console.error(`Fetch failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const csv = await res.text();

let records;
try {
  records = parse(csv, { columns: (h) => h.map((c) => String(c).trim().toLowerCase()), skip_empty_lines: true, trim: true });
} catch (e) {
  console.error('CSV parse failed:', e.message);
  process.exit(1);
}

if (records.length < 5 || records.length > 200) {
  console.error(`Row count ${records.length} outside the sane range (5-200). Refusing to write.`);
  process.exit(1);
}

const errors = [];
const rows = [];
records.forEach((r, i) => {
  const parsed = Row.safeParse(r);
  if (!parsed.success) {
    const reasons = parsed.error.issues.map((iss) => `${iss.path.join('.')}: ${iss.message}`).join('; ');
    errors.push(`  row ${i + 2} (${r.name || 'unnamed'}): ${reasons}`); // +2 = header + 1-index
  } else {
    rows.push(parsed.data);
  }
});

if (errors.length) {
  console.error(`Validation failed for ${errors.length} row(s). NOTHING was written.\n${errors.join('\n')}`);
  process.exit(1);
}

// Transform: only Active rows with a non-empty price make the site.
// Category order follows ALLOWED_CATEGORIES; the CMS/current file shape is kept
// ({ categories: [{ id, title, order, items: [...] }] }).
const current = JSON.parse(readFileSync(MENU_PATH, 'utf8'));
const idFor = (title) => {
  const existing = current.categories.find((c) => c.title === title);
  return existing ? existing.id : title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

const categories = ALLOWED_CATEGORIES.map((title, i) => ({
  id: idFor(title),
  title,
  order: i + 1,
  items: rows
    .filter((r) => r.category === title && r.active === 'Active' && r.price !== '')
    .map((r) => ({
      name: r.name,
      price: r.price.startsWith('$') ? r.price : `$${r.price}`,
      description: r.description,
      tags: r.tags ? r.tags.split(/[;,]/).map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
      ...(r.image ? { image: r.image } : {}),
    })),
})).filter((c) => c.items.length > 0);

writeFileSync(MENU_PATH, JSON.stringify({ categories }, null, 2) + '\n');
console.log(`Wrote ${MENU_PATH}: ${categories.length} categories, ${categories.reduce((n, c) => n + c.items.length, 0)} items.`);
