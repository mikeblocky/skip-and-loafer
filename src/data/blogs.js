import skipAndLoaferMusicalSpace from './blogs/entries/skip-and-loafer-musical-space';
import takamatsuInterviewTranslation2 from './blogs/entries/takamatsu-interview-2';
import takamatsuSerializationJourney from './blogs/entries/takamatsu-serialization-journey';
import takamatsuSpaceJanuary13 from './blogs/entries/takamatsu-space-january-13';
import takamatsuTaiwanAutograph from './blogs/entries/takamatsu-taiwan-autograph';
import { estimateReadMinutes } from '../features/blog/blogShared';

const BLOG_ENTRY_DEFINITIONS = [
  skipAndLoaferMusicalSpace,
  takamatsuInterviewTranslation2,
  takamatsuSpaceJanuary13,
  takamatsuSerializationJourney,
  takamatsuTaiwanAutograph,
];

const BLOG_CONTENT_CACHE = new Map();
const BLOG_CONTENT_REQUESTS = new Map();
const BLOG_CONTENT_LOADERS = new Map(
  BLOG_ENTRY_DEFINITIONS.map((entry) => [
    entry.id,
    () => Promise.resolve({ default: entry.content || '' }),
  ]),
);

export const BLOGS = BLOG_ENTRY_DEFINITIONS.map(({ content, ...entry }) => ({
  ...entry,
  readMinutes: Number.isFinite(entry.readMinutes) && entry.readMinutes > 0
    ? entry.readMinutes
    : estimateReadMinutes(content),
}));

export function getCachedBlogContent(blogId) {
  return BLOG_CONTENT_CACHE.get(blogId) || '';
}

export function getBlogContentLoader(blogId) {
  return BLOG_CONTENT_LOADERS.get(blogId) || null;
}

export async function loadBlogContent(blogId) {
  if (!blogId) return '';

  const cachedContent = getCachedBlogContent(blogId);
  if (cachedContent) return cachedContent;

  if (BLOG_CONTENT_REQUESTS.has(blogId)) {
    return BLOG_CONTENT_REQUESTS.get(blogId);
  }

  const loader = getBlogContentLoader(blogId);
  if (!loader) return '';

  const request = loader()
    .then((module) => {
      const content = typeof module?.default === 'string' ? module.default : '';
      BLOG_CONTENT_CACHE.set(blogId, content);
      return content;
    })
    .finally(() => {
      BLOG_CONTENT_REQUESTS.delete(blogId);
    });

  BLOG_CONTENT_REQUESTS.set(blogId, request);
  return request;
}

export function preloadBlogContent(blogId) {
  return loadBlogContent(blogId);
}
