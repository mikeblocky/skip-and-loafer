import { normalizeGalleryPaths } from './normalizeGalleryPaths';

const animeGalleryPaths = normalizeGalleryPaths(
  import.meta.glob('/public/gallery/anime/**/*.{jpg,jpeg,png,gif,webp,mp4}', { eager: false }),
);

export default animeGalleryPaths;
