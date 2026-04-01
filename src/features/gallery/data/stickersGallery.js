import { normalizeGalleryPaths } from './normalizeGalleryPaths';

const stickersGalleryPaths = normalizeGalleryPaths(
  import.meta.glob('/public/gallery/stickers/**/*.{jpg,jpeg,png,gif,webp,mp4}', { eager: false }),
);

export default stickersGalleryPaths;
