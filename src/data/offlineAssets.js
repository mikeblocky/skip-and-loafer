const publicAssetPaths = Object.keys(
  import.meta.glob('/public/**/*.{avif,gif,ico,jpeg,jpg,json,mp4,png,svg,webm,webp,woff,woff2}', { eager: false })
);

export const OFFLINE_PUBLIC_ASSETS = publicAssetPaths
  .map((path) => path.replace(/^\/public/, '') || '/')
  .filter((path) => path !== '/sw.js')
  .sort();
