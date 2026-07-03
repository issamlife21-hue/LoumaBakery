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
  /** The face mark draws itself on hover (footer / 404 ornaments). */
  faceDraw: true,
  /** Depth parallax on layered sections. */
  parallax: true,
  /** Generic on-scroll reveal (fade/translate) for sections. */
  reveal: true,
  /** Horizontal pinned story rail. */
  storyRail: true,
  /** Count-up animation on stat numbers. */
  countUp: true,
  /** Looping marquee strip. */
  marquee: true,
  /** Typewriter effect on select eyebrows/lines. */
  typewriter: true,

  // --- Wow pass: choreography + set-pieces ---
  /** Oversized baguette that draws itself, scroll-linked, across a home break. */
  setPiece: true,
  /** Bolder display headline treatment (heavier Cormorant + scale). Type only. */
  boldDisplay: true,
  /** Hero CTA becomes the newsletter ("Get word when we open") while ordering is inert. */
  heroNewsletterCta: true,
  /** Hand-drawn sketchy underline that wipes in on link hover. */
  sketchyLinks: true,
  /** One warm tone treatment on all photography so mixed stock reads as one brand. */
  imageTone: true,
  /** Menu rows reveal the dish photo inline on hover (desktop). */
  menuHover: true,

  // --- Components ---
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

/** Hero variant.
 *  'media'    = full-bleed bakery photo/video, scrim, content bottom-left (default).
 *  'editorial'= type-led headline on cream with a self-drawing baguette + framed photo.
 *  'photo'    = the full-bleed photo + glass panel.
 *  Flip this to switch; each restores exactly its own hero. */
export type HeroStyle = 'media' | 'editorial' | 'photo';
export const heroStyle: HeroStyle = 'media';
