export const IMAGE_LOADED_CACHE = new Set();
export const THUMBNAIL_CACHE = new Map();
export const THUMBNAIL_PROMISE_CACHE = new Map();
export const IMAGE_DIMENSION_CACHE = new Map();

const THUMBNAIL_MAX_WIDTH = 480;
const THUMBNAIL_QUALITY = 0.62;
const THUMBNAIL_MAX_CONCURRENT = 1;
const THUMBNAIL_QUEUE = [];
let thumbnailActiveJobs = 0;

const scheduleThumbnailIdle = (cb) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(cb, { timeout: 180 });
    return;
  }
  setTimeout(() => cb(), 16);
};

const runThumbnailQueue = () => {
  if (thumbnailActiveJobs >= THUMBNAIL_MAX_CONCURRENT) return;
  const task = THUMBNAIL_QUEUE.shift();
  if (!task) return;

  thumbnailActiveJobs += 1;
  scheduleThumbnailIdle(async () => {
    try {
      const image = new Image();
      image.decoding = 'async';
      image.loading = 'eager';

      await new Promise((done, reject) => {
        image.onload = done;
        image.onerror = reject;
        image.src = task.src;
      });

      IMAGE_DIMENSION_CACHE.set(task.src, {
        width: image.naturalWidth,
        height: image.naturalHeight,
      });

      const scale = Math.min(1, THUMBNAIL_MAX_WIDTH / image.naturalWidth);
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: true });

      if (!ctx) {
        THUMBNAIL_CACHE.set(task.src, task.src);
        task.resolve(task.src);
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/webp', THUMBNAIL_QUALITY);
      THUMBNAIL_CACHE.set(task.src, compressed);
      task.resolve(compressed);
    } catch {
      THUMBNAIL_CACHE.set(task.src, task.src);
      task.resolve(task.src);
    } finally {
      THUMBNAIL_PROMISE_CACHE.delete(task.src);
      thumbnailActiveJobs -= 1;
      runThumbnailQueue();
    }
  });
};

export async function createThumbnail(src) {
  if (THUMBNAIL_CACHE.has(src)) return THUMBNAIL_CACHE.get(src);
  if (THUMBNAIL_PROMISE_CACHE.has(src)) return THUMBNAIL_PROMISE_CACHE.get(src);

  const promise = new Promise((resolve) => {
    THUMBNAIL_QUEUE.push({ src, resolve });
    runThumbnailQueue();
  });

  THUMBNAIL_PROMISE_CACHE.set(src, promise);
  return promise;
}
