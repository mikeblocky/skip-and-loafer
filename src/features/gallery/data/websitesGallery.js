import { normalizeGalleryPaths } from './normalizeGalleryPaths';

const websitesGalleryPaths = normalizeGalleryPaths(
  import.meta.glob('/public/gallery/websites/**/*.{jpg,jpeg,png,gif,webp,mp4}', { eager: false }),
);

export default websitesGalleryPaths;
