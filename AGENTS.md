# Louma Bakery — Project Memory

You are building/maintaining the Louma Bakery website. Read this every session.

## What this is
A neighborhood bakery on Wilshire (Santa Monica), opening July 2026, with an inclusive-employment mission (many teammates have intellectual or developmental differences; the bakery exists partly to show that done right). Founder: Milla Ghandour; named for her sister Louma. Tone: warm, plain-spoken, proud, never saccharine.

## Stack & rules
- Astro, static output, TypeScript strict. No heavy UI framework.
- All content lives in content collections / config — NEVER hardcode copy, prices, links, or hours in markup. Everything is a swappable placeholder until real assets arrive.
- Nav and footer are single shared components used by every page. Never duplicate them per page.
- Every visual effect is gated by a boolean in src/config/features.ts and must respect prefers-reduced-motion, coarse-pointer, and mobile.
- Production URL comes from one SITE_URL config value (currently the Netlify subdomain).
- Use Netlify Forms for forms, Netlify for hosting, Sveltia CMS for editing.

## Skills
- Use the `louma-brand` skill for all visual/brand/voice decisions.
- Use the `louma-frontend` skill for layout, type, motion, and the accessibility floor.
- Use `/code-review` during QA.

## Definition of done (every phase)
Responsive to mobile · visible keyboard focus · reduced motion respected · no console errors · `astro check` clean · committed with a clear message · a Netlify deploy preview link handed to the user.

## Decisions locked
Hybrid aesthetic (refined type + hand-drawn sketches + face). Face = favicon + footer/404 logo; elegant serif wordmark = nav. Most features on, all toggleable, shown on a hidden /review page.
