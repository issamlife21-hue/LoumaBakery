/**
 * Feature flags. Every visual effect on the site is gated by a boolean here.
 * Each effect must ADDITIONALLY respect prefers-reduced-motion, coarse-pointer,
 * and mobile at the CSS/JS level — these flags are the master on/off switch,
 * not a substitute for those guards.
 *
 * Flip a flag to false to remove that effect everywhere it is used.
 */
export const features = {
  // --- Ambient / always-on texture ---
  /** Fixed film-grain texture overlay across the whole viewport. */
  grainTexture: true,

  // --- Load / page-level ---
  /** Brief brand preloader on first paint. */
  preloader: true,
  /** Cross-fade/slide between page navigations (view transitions). */
  pageTransition: true,

  // --- Hero ---
  /** Hero headline rise-in on load. */
  headlineRise: true,
  /** Legacy alias kept for Phase 1 styleguide; same intent as headlineRise. */
  heroRise: true,
  /** Slow Ken Burns drift on hero/feature imagery. */
  kenBurns: true,
  /** Subtle variable-font weight "breathing" on the hero wordmark. */
  weightBreath: true,

  // --- Scroll-linked ---
  /** Stroke-draw on the baguette/toast sketches as they enter. */
  scrollDraw: true,
  /** Depth parallax on layered sections. */
  parallax: true,
  /** Generic on-scroll reveal (fade/translate) for sections. */
  reveal: true,
  /** Horizontal pinned story rail. */
  storyRail: true,
  /** Film-strip horizontal scroller. */
  filmStrip: true,
  /** Countdown to openingDateISO. */
  countdown: true,
  /** Count-up animation on stat numbers. */
  countUp: true,
  /** Looping marquee strip. */
  marquee: true,
  /** Typewriter effect on select eyebrows/lines. */
  typewriter: true,

  // --- Components ---
  /** Instagram grid hover/stagger. */
  instagramGrid: true,
  /** Ingredient slider/compare interaction. */
  ingredientSlider: true,
  /** Transient toast notifications. */
  toast: true,

  // --- Pointer / hover (auto-suppressed on coarse pointers) ---
  /** Hover lift on cards/buttons. */
  hoverLift: true,
  /** 3D tilt on cards. */
  cardTilt: true,
  /** 3D tilt on images. */
  imageTilt: true,
  /** Magnetic pull on buttons toward the cursor. */
  magneticButtons: true,
  /** Custom photo cursor over imagery. */
  photoCursor: true,
  /**
   * Flour-dust particle cursor trail.
   * Default OFF on mobile / coarse pointers — gate at runtime with a
   * `(pointer: fine)` + non-reduced-motion check before activating.
   */
  flourDustCursor: true,
} as const;

export type FeatureFlag = keyof typeof features;
