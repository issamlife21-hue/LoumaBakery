# Louma Bakery — Project Memory

You are building/maintaining the Louma Bakery website. Read this every session.

## What this is
A neighborhood bakery on Wilshire (Santa Monica), opening July 2026, with an inclusive-employment mission (many teammates have intellectual or developmental differences; the bakery exists partly to show that done right). Founder: Milla Ghandour; named for her sister Louma. Tone: warm, plain-spoken, proud, never saccharine.

## Stack & rules
- Astro, static output, TypeScript strict. No heavy UI framework.
- All content lives in content collections / config (src/data/*.json), never hardcoded in markup. CMS-editable via Decap (self-hosted bundle in public/admin; /admin-demo is the zero-cred test-repo demo, config generated on prebuild).
- Nav and footer are single shared components used by every page.
- Every visual effect is flag-gated in src/config/features.ts, wired into /review, and respects prefers-reduced-motion + mobile.
- Production URL from one SITE_URL config value. Netlify hosting + Forms. Menu will sync from a Google Sheet (scripts/sync-menu.mjs, inactive until SHEET_CSV_URL is set).

## THE DESIGN SYSTEM ("editorial slab", layoutSystem flag, default 'slab')
- FLAT: no box-shadows, no gradients, no backdrop blur, anywhere. Depth = surface change + 1px hairlines (--hairline tokens). Text on photos sits on flat solid ink/burgundy panels.
- BANDS: every section is one committed slab: cream (--surface-0), burgundy, ink, or full-bleed photo. The band change is the divider. Surface tints (surface-1/2/3) never back a section, small component fills only.
- TYPE SPLIT: one Cormorant .statement per band (clamp(2.75rem,8vw,7rem), weight 300-400, leading ~0.95-1.0). Everything else DM Sans 14-16px. DM Mono is the DATA VOICE: hours, prices, address, phone, labels, form inputs. Deviation note: hero/editorial headlines may use up to 500 only where 300/400 is illegible.
- SHAPES: exactly three radii: 9999px (buttons/tags/chips/inputs), 16px (cards/photo tiles), 0 (full-bleed). No other radius values.
- BUTTONS: ghost pill default (1.5px burgundy border, transparent). MAX ONE filled CTA per page (.btn-primary/.btn-coral render filled burgundy). "Ordering soon" = dashed ghost, intentional.
- LABELS: one stamp treatment: DM Mono uppercase ~12px, 0.1em tracking, burgundy (coral on dark). No dash/rule prefixes. Filler eyebrows deleted.
- NAV: persistent flat bar, always legible: solid ink strip over the hero, solid cream + hairline elsewhere.
- ASYMMETRY: 55/45 or 60/40 splits, one collage moment (2-3 tiles, 1-3deg rotation), no orphan grid rows.

## MOTION WHITELIST (complete; add nothing else)
- Sketch draw-on-scroll: one-shot ~1.1s cubic-bezier(0.22,1,0.36,1), 80ms subpath stagger, sketches <=160px desktop / <=120px mobile, never left invisible (viewport watchdog).
- Entrances: fade + settle DOWNWARD (start ~20px ABOVE, translate down) or fade in place; 500-700ms, same bezier, children staggered 60-100ms, once at ~30% in view. NEVER rise bottom-to-top.
- Image wipes: soft clip inset + 1.04->1 settle. IO must watch the UNCLIPPED parent (Chromium clips intersection geometry).
- Hero only: ken-burns 1->1.05, ~28s alternate, desktop.
- ONE marquee: ghost outline Cormorant on the burgundy band, slow, pause on hover.
- Micro: sketchy link underline, button press scale, brand focus ring.
- Reduced motion: everything visible immediately in final state.

## COPY RULES (bans on sight)
- NO em dashes anywhere in rendered copy (verify dist HTML after building).
- No tricolons ("bread, pastry, and care"), no "not just X, it's Y", no empty superlatives (artisanal/finest/exceptional/premium), no jargon (elevate/journey/crafted/curated/nestled/indulge/savor/delight), no "we are passionate/committed/we believe", no throat-clearing openers.
- Caps: hero = one line (3-8 words) + one sentence. Menu item = ONE concrete line, 8-15 words, ingredient/technique first ("Laminated over three days, baked dark, shatters when you bite it."). Story <= 300 words. Careers = plain sentences; the inclusive mission stated ONCE as plain fact. Visit = scannable mono block + one human line.

## STANDING RULES (never violate)
- The mission page NEVER discloses statistics about team members' disabilities. No replacement stats of that nature.
- Entrance animations never move content upward.
- The wordmark + three pencil sketches (src/assets/brand/) are THE brand; never regenerate or restyle them.
- Palette/fonts exactly as tokenized in src/styles/tokens.css.

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

## Definition of done (every phase)
Responsive to mobile · visible keyboard focus · reduced motion respected · no console errors · astro check clean · zero em dashes in dist · committed with a clear message · deploy verified.

## What remains before handoff (do not attempt without the owner)
DecapBridge site-id + login test; publish the Google Sheet tab + set SHEET_CSV_URL; Netlify Forms detection toggle; real photos/Uber Eats/PayPal/domain; account transfer.
