import { normalizeGalleryPaths } from './normalizeGalleryPaths';

const promotionsGalleryPaths = normalizeGalleryPaths(
  import.meta.glob('/public/gallery/promotions/**/*.{jpg,jpeg,png,gif,webp,mp4}', { eager: false }),
);

export default promotionsGalleryPaths;
