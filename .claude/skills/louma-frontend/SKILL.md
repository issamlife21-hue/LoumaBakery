---
name: louma-frontend
description: Frontend design discipline for the Louma site — flatness, shape language, structure, the motion whitelist, and the non-negotiable accessibility/performance floor. Use when building or restyling any UI.
---

# Louma Frontend Discipline

## Principles
- FLAT: no box-shadows, no CSS gradients, no backdrop blur, anywhere. Depth = surface color change + 1px hairline borders (--hairline / --hairline-strong tokens).
- Shape language, exactly three radii: 9999px pills (every button, tag, chip, input) · 16px (cards, contained photo tiles) · 0 (full-bleed photos). No other radius values.
- Ghost buttons default: 1.5px --burgundy outline pill, transparent fill, ~14x28px padding, DM Sans 500. Max ONE filled CTA per page. Disabled = dashed ghost that reads intentional.
- Controlled asymmetry: 55/45 or 60/40 splits, never 50/50; one collage moment per page max; grids never leave orphan rows.
- Long body text max-width ~640px. Statements may slightly bleed their container.
- Astro gotcha: page-scoped styles neither reach child components nor beat their specificity; use :global(html.sys-slab) prefixes for slab overrides.

## Motion (the COMPLETE whitelist; timings locked)
- Sketch draw-on-scroll: one-shot ~1.1s ease-out cubic-bezier(0.22,1,0.36,1), 80ms subpath stagger; a watchdog guarantees a mark on screen is never left invisible.
- Entrances: fade + settle DOWNWARD (start 16-24px ABOVE final position) or fade in place; 500-700ms, same bezier; one designed entrance per section; children staggered 60-100ms; once, at ~30% in view (IntersectionObserver). NEVER rise bottom-to-top.
- Image reveals: soft clip-path inset wipe + scale 1.04->1, 800ms. IO must observe the UNCLIPPED parent (Chromium factors clip-path into intersection geometry).
- Hero media only: ken-burns scale 1->1.05, ~28s alternate, desktop only.
- ONE marquee: outline-only ghost Cormorant (stroke, no fill) on the burgundy band, slow linear, pause on hover, static under reduced-motion.
- Micro: sketchy underline on link hover, button press scale ~0.98, brand-color focus ring.
- Nothing else. New effects require removing one and updating this list.
- All effects: flag-gated in features.ts + listed on /review; reduced-motion shows composed final states immediately; heavy motion off on mobile.

## Quality floor (every component)
Responsive to ~360px. Visible :focus-visible outlines. Keyboard operable (incl. the menu photo panel via focusin). Meaningful images have alt; decorative alt="". AA contrast. width/height on images (no CLS). IO/rAF-driven handlers, 60fps. Hero image eager + fetchpriority=high; everything below the fold lazy with correct sizes. Zero console errors, astro check clean, no em dashes in rendered output.

## MOBILE / iOS RULES (locked)
- Viewport units: min-height 100vh fallback + 100svh pair. svh, never dvh. Hero-minus-header = calc(100svh - var(--nav-h)).
- Never width:100vw; html,body { overflow-x: clip } stays.
- Safe areas: viewport-fit=cover; pad CONTENT with env(safe-area-inset-*) via max(gutter, inset); band backgrounds reach true edges; nav + body offset grow by the top inset.
- Hover behaviors ONLY behind @media (hover:hover) and (pointer:fine); touch gets tap alternatives (menu rows = button[aria-expanded] tap-to-expand; floating panel display:none + unbound on touch).
- Inputs >=16px computed (iOS zoom); inputmode/autocomplete set; never suppress user zoom; html.kb-open hides fixed bars while a field is focused.
- Tap targets >=44px; -webkit-tap-highlight-color transparent + touch-action manipulation on controls.
- NO live SVG filters anywhere: sketches render the *-baked.svg geometry (scripts/bake-sketches.mjs flattens the roughen); max 2 simultaneous draws, will-change on animating strokes.
- Nav: always-visible slim bar on <=768px (56px + safe-area); hide-on-scroll desktop-only, 8px delta.
- Reveals: one shared IO, fail-safe (hidden states only under JS-set classes; JS off = everything visible).
- Hero image <=150KB on mobile (AVIF, eager, fetchpriority=high). Fonts: latin subsets, used weights only.
- theme-color AND body background both brand cream (Safari tints from either).
- Map iframe: tap-to-load facade on touch, lazy auto-load on desktop.
- mobileCtaBar flag: sticky bottom newsletter pill on phones (parks at footer, hides with keyboard).
