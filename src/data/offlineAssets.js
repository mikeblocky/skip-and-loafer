const publicAssetPaths = Object.keys(
  import.meta.glob('/public/**/*.{avif,gif,ico,jpeg,jpg,json,mp4,png,svg,ttf,webm,webp,woff,woff2}', { eager: false })
);

export const OFFLINE_PUBLIC_ASSETS = publicAssetPaths
  .map((path) => path.replace(/^\/public/, '') || '/')
  .filter((path) => path !== '/sw.js')
  .sort();

const startsWithAny = (path, prefixes) => prefixes.some((prefix) => path.startsWith(prefix));

export const OFFLINE_ASSET_GROUPS = [
  {
    key: 'all',
    label: 'Everything',
    detail: 'Prepare all galleries, manga pages, and app media.',
    getAssets: () => OFFLINE_PUBLIC_ASSETS,
  },
  {
    key: 'manga',
    label: 'Manga pages',
    detail: 'Prepare in-app reader pages and volume covers.',
    getAssets: () => OFFLINE_PUBLIC_ASSETS.filter((path) => startsWithAny(path, ['/manga/', '/volumes/', '/covers/'])),
  },
  {
    key: 'galleries',
    label: 'Galleries',
    detail: 'Prepare official, character, portrait, and icon galleries.',
    getAssets: () => OFFLINE_PUBLIC_ASSETS.filter((path) => startsWithAny(path, ['/gallery/', '/characters/', '/portrait/', '/icon/'])),
  },
  {
    key: 'notes',
    label: 'Blog & wiki media',
    detail: 'Prepare lighter reference and article media.',
    getAssets: () => OFFLINE_PUBLIC_ASSETS.filter((path) => startsWithAny(path, ['/blog/'])),
  },
  {
    key: 'app',
    label: 'App basics',
    detail: 'Prepare icons, manifest, and root app media.',
    getAssets: () => OFFLINE_PUBLIC_ASSETS.filter((path) => !path.slice(1).includes('/')),
  },
];

export const getOfflineAssetGroup = (key = 'all') =>
  OFFLINE_ASSET_GROUPS.find((group) => group.key === key) || OFFLINE_ASSET_GROUPS[0];
