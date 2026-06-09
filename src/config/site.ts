/**
 * Single source of truth for site-wide metadata, contact details, hours,
 * and external links. Never hardcode any of this in markup — read from here.
 *
 * Every external link below is a PLACEHOLDER until the real account/URL
 * arrives. They are clearly marked; swap the value, touch nothing else.
 */
export const siteConfig = {
  /** Production URL. Currently the Netlify subdomain; swap when the real domain lands. */
  url: 'https://loumabakeryy.netlify.app',

  name: 'Louma Bakery',
  /** Short brand line for <title> suffix and meta description fallback. */
  tagline: 'A neighborhood bakery on Wilshire',

  // --- Contact (PLACEHOLDER values until real ones arrive) ---
  phone: '+1 (310) 000-0000', // PLACEHOLDER phone
  email: 'hello@loumabakery.com', // PLACEHOLDER email

  address: {
    street: '3223 Wilshire Blvd',
    city: 'Santa Monica',
    state: 'CA',
    zip: '90403',
  },

  /** Opening hours. Strings so they render as-is; edit freely. */
  hours: [
    { days: 'Tuesday – Friday', open: '7:00 AM', close: '2:30 PM' },
    { days: 'Saturday – Sunday', open: '7:00 AM', close: '2:30 PM' },
    { days: 'Monday', open: 'Closed', close: '' },
  ],

  /** Opening day. Used by the countdown. */
  openingDateISO: '2026-07-01T08:00:00-07:00',

  // --- External links (ALL PLACEHOLDERS — replace when accounts exist) ---
  links: {
    uberEats: 'https://www.ubereats.com/', // PLACEHOLDER — swap before launch (real Uber Eats store URL)
    paypalDonate: 'https://www.paypal.com/donate', // PLACEHOLDER — swap before launch (real PayPal donate link)
    instagram: 'https://www.instagram.com/', // PLACEHOLDER — swap before launch (@loumabakery handle URL)
    /** Order/contact form endpoint. Netlify Forms by default; swap to a Formspree URL if used. */
    formspreeOrNetlify: '', // PLACEHOLDER — swap before launch (empty = use Netlify Forms)
    /** Hero background video URL. Empty = poster/placeholder only; wire when footage lands. */
    heroVideo: '', // PLACEHOLDER — swap before launch (hero background video MP4/WebM)
  },

  /** Form confirmation / error copy, in the brand voice. Single source. */
  forms: {
    newsletterSuccess: "You're on the list. We'll write when the ovens are warm.",
    cateringSuccess: "Got it — we'll be in touch within two business days.",
    careersSuccess: "Thanks for reaching out — we'll be in touch soon.",
    error: "That didn't send. Try again, or email hello@loumabakery.com.",
  },
} as const;

/** Convenience: the production URL. */
export const SITE_URL = siteConfig.url;

/** Back-compat alias for Phase 1 code that imported `site`. */
export const site = siteConfig;
