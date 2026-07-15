// Generate /admin-demo/config.yml from /admin/config.yml (single source, no
// drift): identical collections, but backend swapped to test-repo (in-memory,
// no auth) so the owner can try the editor with zero credentials. Runs on
// prebuild; the output is generated, never hand-edited.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'public/admin/config.yml'), 'utf8');

// Replace the whole backend block (up to the first top-level key after it)
// with the in-memory test backend.
const demoBackend = `# GENERATED FILE — built from /admin/config.yml by scripts/gen-admin-demo.mjs.
# Demo mode: in-memory test backend, no auth, nothing is saved.
backend:
  name: test-repo
`;
const out = src.replace(/^# =[\s\S]*?^backend:\n(?:^[ \t].*\n)+/m, demoBackend);
if (out === src) {
  console.error('gen-admin-demo: could not find the backend block to replace.');
  process.exit(1);
}

mkdirSync(join(root, 'public/admin-demo'), { recursive: true });
writeFileSync(join(root, 'public/admin-demo/config.yml'), out);
console.log('Wrote public/admin-demo/config.yml');
