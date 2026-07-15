# Scripts

## sync-menu.mjs — menu from a Google Sheet (NOT ACTIVE YET)

The menu can sync daily from a Google Sheet tab published as CSV. Until the
sheet is published and the variable below is set, the site keeps using the
menu in `src/data/menu.json` (editable in the CMS) and the workflow exits
quietly.

### Sheet format
One tab, first row is the header: `Name | Price | Description | Category | Tags | Image | Active`

- **Name**: required.
- **Price**: `$4.50` or `4.50`. Empty price = the item is kept off the site.
- **Category**: must be exactly one of Breads, Pastries, Sweets, Drinks.
- **Tags**: optional, comma-separated (e.g. `vegan, gf`).
- **Active**: exactly `Active` or `Inactive`. Only Active items appear.

Validation is strict: one bad row and the sync writes nothing, with a plain
list of which rows failed and why.

### To activate
1. In Google Sheets: File → Share → Publish to web → select the menu tab →
   CSV → copy the link.
2. In GitHub: repo Settings → Secrets and variables → Actions → **Variables**
   → add `SHEET_CSV_URL` with that link.
3. Run the "Sync menu from Google Sheet" workflow from the Actions tab
   (it also runs daily on its own).
4. Check the menu page after the Netlify deploy finishes.

### Local dry-run
```bash
SHEET_CSV_URL="https://docs.google.com/.../pub?output=csv" node scripts/sync-menu.mjs
git diff src/data/menu.json   # review, then commit or discard
```

## Other scripts
- `gen-icons.mjs` — favicons/app icons from the face mark.
- `gen-og.mjs` — the social-preview image (og-default.jpg).
- `gen-placeholders.mjs` — placeholder imagery.
- `gen-admin-demo.mjs` — builds /admin-demo's config from /admin's (runs on prebuild).
