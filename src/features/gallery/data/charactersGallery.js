import { normalizeGalleryPaths } from './normalizeGalleryPaths';

const charactersGalleryPaths = normalizeGalleryPaths(
  import.meta.glob('/public/gallery/characters/**/*.{jpg,jpeg,png,gif,webp,mp4}', { eager: false }),
);

export default charactersGalleryPaths;
