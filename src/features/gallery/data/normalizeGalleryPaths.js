export const normalizeGalleryPaths = (globMap) =>
  Object.keys(globMap).map((path) => path.replace(/^\/public/, ''));

export default normalizeGalleryPaths;
