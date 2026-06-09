import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';

/**
 * Content collections. All copy/data lives here (or in the seed JSON under
 * src/data/) — never hardcoded in markup. Image fields are string paths
 * (placeholders) for now; swap to the asset pipeline when real photos land.
 */

const menu = defineCollection({
  loader: file('src/data/menu.json'),
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    items: z.array(
      z.object({
        name: z.string(),
        price: z.string(), // string so "$4.50" / "MP" render verbatim
        description: z.string().default(''),
        tags: z.array(z.string()).default([]),
        image: z.string().optional(), // PLACEHOLDER path until real photos
      }),
    ),
  }),
});

const copy = defineCollection({
  loader: file('src/data/copy.json'),
  // One entry per page (keyed by page slug). Fields are optional so each
  // page uses what it needs; extra keys pass through.
  schema: z
    .object({
      eyebrow: z.string().optional(),
      title: z.string().optional(),
      lede: z.string().optional(),
      body: z.array(z.string()).default([]),
      cta: z.object({ label: z.string(), href: z.string() }).optional(),
      // Home-specific section copy (optional; other pages ignore).
      countdownLabel: z.string().optional(),
      craftLine: z.string().optional(),
      missionLine: z.string().optional(),
      menuTitle: z.string().optional(),
      ovenTitle: z.string().optional(),
      findTitle: z.string().optional(),
      newsletterTitle: z.string().optional(),
      newsletterBody: z.string().optional(),
      // Inner-page structured copy (optional; each page reads what it needs).
      allergenNote: z.string().optional(),
      openingTag: z.string().optional(),
      mapEmbed: z.string().optional(),
      donateTitle: z.string().optional(),
      donateBody: z.string().optional(),
      founder: z
        .object({ name: z.string(), role: z.string(), body: z.array(z.string()).default([]) })
        .optional(),
      values: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
      stats: z
        .array(z.object({ value: z.number(), label: z.string(), prefix: z.string().optional(), suffix: z.string().optional() }))
        .optional(),
      steps: z.array(z.object({ n: z.string().optional(), title: z.string(), body: z.string() })).optional(),
      tiers: z
        .array(z.object({ name: z.string(), price: z.string(), items: z.array(z.string()).default([]), note: z.string().optional() }))
        .optional(),
      roles: z.array(z.object({ title: z.string(), type: z.string().optional(), body: z.string() })).optional(),
    })
    .loose(),
});

const testimonials = defineCollection({
  loader: file('src/data/testimonials.json'),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string().optional(),
  }),
});

const marquee = defineCollection({
  loader: file('src/data/marquee.json'),
  schema: z.object({
    text: z.string(),
    order: z.number().default(0),
  }),
});

const storyChapters = defineCollection({
  loader: file('src/data/story-chapters.json'),
  schema: z.object({
    order: z.number().default(0),
    eyebrow: z.string().optional(),
    title: z.string(),
    body: z.string(),
    image: z.string().optional(), // PLACEHOLDER path
  }),
});

const ingredients = defineCollection({
  loader: file('src/data/ingredients.json'),
  schema: z.object({
    name: z.string(),
    note: z.string().optional(),
    image: z.string().optional(), // PLACEHOLDER path
  }),
});

const instagramTiles = defineCollection({
  loader: file('src/data/instagram-tiles.json'),
  schema: z.object({
    image: z.string(), // PLACEHOLDER path
    alt: z.string(),
    href: z.string().optional(),
  }),
});

export const collections = {
  menu,
  copy,
  testimonials,
  marquee,
  storyChapters,
  ingredients,
  instagramTiles,
};
