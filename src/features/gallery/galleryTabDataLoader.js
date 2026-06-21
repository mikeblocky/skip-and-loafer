const galleryTabLoaders = {
  takamatsu: () => import('./data/takamatsuGallery'),
  official: () => import('./data/officialGallery'),
  anime: () => import('./data/animeGallery'),
  musical: () => import('./data/musicalGallery'),
  volumes: () => import('./data/volumesGallery'),
  stickers: () => import('./data/stickersGallery'),
  websites: () => import('./data/websitesGallery'),
  promotions: () => import('./data/promotionsGallery'),
  characters: () => import('./data/charactersGallery'),
};

const galleryTabCache = new Map();

const normalizeGalleryImages = (module) => {
  if (Array.isArray(module?.default)) {
    return module.default;
  }

  return [];
};

export function loadGalleryTabImages(tabId = '') {
  if (!tabId) {
    return Promise.resolve([]);
  }

  if (galleryTabCache.has(tabId)) {
    return galleryTabCache.get(tabId);
  }

  const loader = galleryTabLoaders[tabId];
  if (!loader) {
    return Promise.resolve([]);
  }

  const request = loader()
    .then(normalizeGalleryImages)
    .catch((error) => {
      galleryTabCache.delete(tabId);
      throw error;
    });
  galleryTabCache.set(tabId, request);
  return request;
}

export const preloadGalleryTabImages = loadGalleryTabImages;
