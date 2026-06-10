import type { ImageMetadata } from 'astro';

/**
 * Shared bakery-photo resolver. One eager glob of the image folder, reused by
 * every page (was duplicated in index/menu/story). Maps a filename OR a
 * CMS-stored path (e.g. "/src/assets/img/x.jpg") to optimizable metadata for
 * <Img> / getImage. Returns undefined when the file is missing.
 */
const photos = import.meta.glob<ImageMetadata>('../assets/img/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

export const resolveImage = (name?: string): ImageMetadata | undefined => {
  if (!name) return undefined;
  return photos[`../assets/img/${name.split('/').pop()}`];
};
