/**
 * Feature flags. Every visual effect on the site is gated by a boolean here.
 * Each effect must additionally respect prefers-reduced-motion, coarse-pointer,
 * and mobile at the CSS/JS level — these flags are the master on/off switch.
 *
 * Flip a flag to false to remove an effect everywhere it is used.
 */
export const features = {
  /** Fixed film-grain texture overlay across the whole viewport. */
  grainTexture: true,
  /** Scroll-linked stroke-draw on the baguette/toast sketches (Phase 2). */
  scrollDraw: true,
  /** Hero headline/face rise-in on load (Phase 2). */
  heroRise: true,
  /** Subtle hover lift on cards/buttons. */
  hoverLift: true,
} as const;

export type FeatureFlag = keyof typeof features;
