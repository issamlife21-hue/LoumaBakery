/**
 * Single source of truth for the production URL and global site metadata.
 * Everything else derives from these — never hardcode the domain in markup.
 */
export const site = {
  /** Production URL. Currently the Netlify subdomain; swap when the real domain lands. */
  url: 'https://loumabakeryy.netlify.app',
  name: 'Louma Bakery',
  /** Short brand line for <title> suffix and meta. */
  tagline: 'A neighborhood bakery on Wilshire',
} as const;

export const SITE_URL = site.url;
