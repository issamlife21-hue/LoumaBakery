/**
 * Brand asset barrel. Import the marks from here, not by deep path.
 *
 *   import { Face, Wordmark, Baguette, Toast } from "../lib/brand";
 *   <Face class="mark" width={80} height={74} />
 *
 * Each is an Astro SVG component: attributes (class, width, height,
 * aria-label, style…) are spread onto the root <svg>. The art uses
 * `currentColor`, so set CSS `color` on the element (or any parent) to
 * recolor — e.g. `color: var(--butter)` for cream-on-dark.
 *
 * Roles (keep these stable if a designer later swaps the files):
 *  - Face     286×265  filled line-art · favicon / footer / 404 / ornament (static)
 *  - Wordmark 374×240  filled line-art · playful logo / footer lockup
 *  - Baguette 280×100  single-stroke   · scroll-draw sketch
 *  - Toast    200×232  single-stroke   · scroll-draw sketch
 */
export { default as Face } from "../assets/brand/face.svg";
export { default as Wordmark } from "../assets/brand/wordmark.svg";
export { default as Baguette } from "../assets/brand/baguette.svg";
export { default as Toast } from "../assets/brand/toast.svg";

/** Intrinsic aspect ratios, for reserving layout space without shift. */
export const brandRatios = {
  face: 286 / 265,
  wordmark: 374 / 240,
  baguette: 280 / 100,
  toast: 200 / 232,
} as const;
