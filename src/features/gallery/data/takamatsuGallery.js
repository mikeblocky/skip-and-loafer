import { normalizeGalleryPaths } from './normalizeGalleryPaths';

const takamatsuGalleryPaths = normalizeGalleryPaths(
  import.meta.glob("/public/gallery/takamatsu-sensei's tweet/**/*.{jpg,jpeg,png,gif,webp,mp4}", { eager: false }),
);

export default takamatsuGalleryPaths;
