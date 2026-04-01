import { normalizeGalleryPaths } from './normalizeGalleryPaths';

const officialGalleryPaths = normalizeGalleryPaths(
  import.meta.glob("/public/gallery/official account's tweet/**/*.{jpg,jpeg,png,gif,webp,mp4}", { eager: false }),
);

export default officialGalleryPaths;
