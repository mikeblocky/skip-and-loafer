import { normalizeGalleryPaths } from './normalizeGalleryPaths';

const volumesGalleryPaths = normalizeGalleryPaths(
  import.meta.glob('/public/gallery/volumes/**/*.{jpg,jpeg,png,gif,webp,mp4}', { eager: false }),
);

export default volumesGalleryPaths;
