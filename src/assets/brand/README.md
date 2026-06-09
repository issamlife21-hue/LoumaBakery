# Louma brand assets

Drop this `brand/` folder into `src/assets/brand/` in the Astro project.

## Files
- **face.svg** — the scribble-hair smiling face (vectorized from the packaging art).
  Filled line art, `fill="currentColor"`, `fill-rule="evenodd"`. Use as the favicon,
  the footer/404 logo mark, and a hero ornament. Static (do NOT put on the draw animation).
- **wordmark.svg** — hand-lettered "LOUMA BAKERY" lockup (vectorized). Filled line art,
  same recolor behavior. Use for playful logo moments / footer; the nav uses the serif wordmark.
- **baguette.svg** — single-stroke baguette with three heart scores. `stroke="currentColor"`,
  `fill="none"`, one `<path>`. Wire to the scroll-linked stroke-draw animation (it draws itself).
- **toast.svg** — single-stroke bread slice with a heart. Same single-path stroke setup; draw-ready.

## Recoloring
Every file defaults to brand red via `color="#ED2739"` + `currentColor`.
- Inlined in HTML: set CSS `color` on the SVG (or a parent) to recolor — e.g. `color: var(--butter)`
  for cream-on-dark, `color: var(--burgundy)`, etc.
- As `<img>`: the default red applies; for other colors, inline the SVG instead.

## Notes
- These are placeholders-quality vectors of the real art; if a designer later supplies
  master SVGs, swap the files — no markup changes needed (keep the same filenames + viewBox roles).
- baguette/toast viewBoxes: 280x100 and 200x232. face: 286x265. wordmark: 374x240.
