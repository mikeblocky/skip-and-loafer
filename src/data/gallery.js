// Auto-populate from the filesystem at build time using Vite's import.meta.glob
// Each key is a category id matching the TABS in GalleryPage
const FOLDER_MAP = {
  "takamatsu": "takamatsu-sensei's tweet",
  "official": "official account's tweet",
  "anime": "anime",
  "volumes": "volumes",
  "stickers": "stickers",
  "websites": "websites",
  "promotions": "promotions",
  "characters": "characters",
};

// Glob to discover image paths at build time. We only use the keys (paths), not the imports.
// Files in public/ are served as-is, so /public/gallery/X/Y.jpg → /gallery/X/Y.jpg
const allGalleryPaths = Object.keys(
  import.meta.glob('/public/gallery/**/*.{jpg,jpeg,png,gif,webp}', { eager: false })
);

// Build categories by matching discovered paths to folders
function buildCategories() {
  const categories = {};
  for (const [id, folder] of Object.entries(FOLDER_MAP)) {
    const prefix = `/public/gallery/${folder}/`;
    const images = allGalleryPaths
      .filter(path => path.startsWith(prefix))
      .map(path => path.replace(/^\/public/, '')); // → /gallery/folder/file.jpg
    categories[id] = images;
  }
  return categories;
}

export const GALLERY_CATEGORIES = buildCategories();