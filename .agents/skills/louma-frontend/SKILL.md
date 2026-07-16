---
name: louma-frontend
description: Frontend design discipline for the Louma site — typography, spacing, structure, motion, and the non-negotiable accessibility/performance floor. Use when building or restyling any UI.
---

# Louma Frontend Discipline

## Principles
- Hero is a thesis: lead with the most characteristic thing (the morning bake / the face), not a generic big-number template.
- Typography carries personality. Hold the type scale; intentional weights and tracking. Don't let the page read as a templated default.
- Structure encodes meaning. Numbered markers (01/02/03) only where order is real (menu sections, story chapters, process steps).
- Motion is deliberate. One orchestrated moment (the scroll-draw sketches, the hero rise) beats scattered effects. Every effect is flag-gated and reduced-motion aware.
- Match complexity to vision: this is a refined direction, so precision in spacing/type/detail matters more than more effects. Remove one accessory before shipping.

## Quality floor (every component)
Responsive down to mobile (test ~360px). Visible :focus-visible outlines. Keyboard operable. prefers-reduced-motion disables motion. Meaningful images have alt text; decorative ones alt="". Sufficient text contrast. No layout shift on image load (set width/height). Throttle scroll/pointer handlers.

## CSS hygiene
Watch selector specificity so section/element rules don't cancel paddings/margins. Prefer tokens over literal values. Keep critical nav/hero CSS inlined in the base head to protect first paint.
