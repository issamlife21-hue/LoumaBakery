/**
 * Feature flags. Every visual effect is gated here; each ALSO respects
 * prefers-reduced-motion and mobile at the CSS/JS level. Flip a flag to false
 * to remove that effect everywhere.
 */
export const features = {
  // --- Motion (the complete whitelist; see src/scripts/motion.ts) ---
  /** Slow drift on the hero media (desktop only). */
  kenBurns: true,
  /** Sketches draw themselves once when seen; never left invisible. */
  scrollDraw: true,
  /** Sections fade in and settle downward; children staggered. */
  reveal: true,
  /** Feature images unveil with a soft clip wipe + 1.04->1 settle. */
  imageWipe: true,
  /** One slow ghost ticker on the burgundy band; pauses on hover. */
  marquee: true,

  // --- Micro / functional ---
  /** Hand-drawn wavy underline on body-copy links. */
  sketchyLinks: true,
  /** One warm tone treatment on all photography. */
  imageTone: true,
  /** Menu rows lean the dish name in on hover. */
  menuHover: true,
  /** Hero CTA becomes the newsletter while ordering is inert. */
  heroNewsletterCta: true,
  /** Drag-to-scroll on the ingredient row. */
  ingredientSlider: true,
  /** Transient corner notices (form confirmations). */
  toast: true,
  /** Slim sticky bottom CTA bar on phones (thumb-reach newsletter jump). */
  mobileCtaBar: true,

  // --- Classic-layout-only type treatment ---
  /** Bolder display headline treatment (classic layout only). */
  boldDisplay: true,
} as const;

export type FeatureFlag = keyof typeof features;

/** Layout system.
 *  'slab'    = the editorial-slab system: flat, full-bleed color bands, extreme
 *              type split, pill shape language, ghost buttons (default).
 *  'classic' = the previous layout, exactly as it shipped.
 */
export type LayoutSystem = 'slab' | 'classic';
export const layoutSystem: LayoutSystem = 'slab';

/** Hero variant.
 *  'media'    = full-bleed bakery photo/video, content bottom-left (default).
 *  'editorial'= type-led headline on cream with a framed photo.
 *  'photo'    = the full-bleed photo + panel.
 */
export type HeroStyle = 'media' | 'editorial' | 'photo';
export const heroStyle: HeroStyle = 'media';
