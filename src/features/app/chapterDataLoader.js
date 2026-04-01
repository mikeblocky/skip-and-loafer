let chaptersCache = null;
let chaptersRequest = null;

export function getCachedChapterData() {
  return chaptersCache;
}

export async function loadChapterData() {
  if (chaptersCache) return chaptersCache;
  if (chaptersRequest) return chaptersRequest;

  chaptersRequest = import('../../data/chapters')
    .then((module) => {
      chaptersCache = Array.isArray(module?.CHAPTERS) ? module.CHAPTERS : [];
      return chaptersCache;
    })
    .finally(() => {
      chaptersRequest = null;
    });

  return chaptersRequest;
}

export function preloadChapterData() {
  return loadChapterData();
}
