const BLOG_ENTRY_DEFINITIONS = [
  {
    id: 'skip-and-loafer-musical-space-translation',
    title: 'Skip and Loafer - the Musical review - translation  (Spoilers alert)',
    date: '2026-04-01',
    description: 'Takamatsu-sensei reviews the Skip and Loafer - the Musical with cast members and fans in a live space.',
    readMinutes: 30,
    metadata: {
      title: 'Skip and Loafer - the Musical review - translation  (Spoilers alert)',
      description: 'Takamatsu-sensei reviews the Skip and Loafer - the Musical with cast members and fans in a live space.',
      openGraph: {
        title: 'Skip and Loafer - the Musical review - translation  (Spoilers alert)',
        description: 'Takamatsu-sensei reviews the Skip and Loafer - the Musical with cast members and fans in a live space.',
        type: 'article',
        publishedTime: '2026-04-01T00:00:00.000Z',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Skip and Loafer - the Musical review - translation  (Spoilers alert)',
        description: 'Takamatsu-sensei reviews the Skip and Loafer - the Musical with cast members and fans in a live space.',
      },
    },
    loader: () => import('./blogs/posts/skip-and-loafer-musical-space/content.mdx?raw'),
  },
  {
    id: 'takamatsu-space-january-13-translation',
    title: "Takamatsu-sensei's January 13th space - translation",
    date: '2025-01-31',
    description: 'An updated translation of the space that Takamatsu-sensei did on January 13th.',
    readMinutes: 53,
    metadata: {
      title: "Takamatsu-sensei's January 13th space - translation",
      description: 'An updated translation of the space that Takamatsu-sensei did on January 13th.',
      openGraph: {
        title: "Takamatsu-sensei's January 13th space - translation",
        description: 'An updated translation of the space that Takamatsu-sensei did on January 13th.',
        type: 'article',
        publishedTime: '2025-01-31T00:00:00.000Z',
      },
      twitter: {
        card: 'summary_large_image',
        title: "Takamatsu-sensei's January 13th space - translation",
        description: 'An updated translation of the space that Takamatsu-sensei did on January 13th.',
      },
    },
    loader: () => import('./blogs/posts/takamatsu-space-january-13/content.mdx?raw'),
  },
  {
    id: 'takamatsu-serialization-journey-translation',
    title: 'Misaki Takamatsu speaks about her long-term serialization journey in Skip and Loafer (Translation)',
    date: '2025-01-31',
    description: 'A translation of the space that Takamatsu-sensei did on an interview, which released on January 2025.',
    readMinutes: 15,
    metadata: {
      title: 'Misaki Takamatsu speaks about her long-term serialization journey in Skip and Loafer (Translation)',
      description: 'A translation of the space that Takamatsu-sensei did on an interview, which released on January 2025.',
      openGraph: {
        title: 'Misaki Takamatsu speaks about her long-term serialization journey in Skip and Loafer (Translation)',
        description: 'A translation of the space that Takamatsu-sensei did on an interview, which released on January 2025.',
        type: 'article',
        publishedTime: '2025-01-31T00:00:00.000Z',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Misaki Takamatsu speaks about her long-term serialization journey in Skip and Loafer (Translation)',
        description: 'A translation of the space that Takamatsu-sensei did on an interview, which released on January 2025.',
      },
    },
    loader: () => import('./blogs/posts/takamatsu-serialization-journey/content.mdx?raw'),
  },
  {
    id: 'takamatsu-taiwan-autograph-session-translation',
    title: 'Autograph session of Takamatsu-sensei in Taiwan - translation',
    date: '2025-02-26',
    description: 'About the autograph session which she was invited in two days: February 9th - February 10th.',
    readMinutes: 8,
    metadata: {
      title: 'Autograph session of Takamatsu-sensei in Taiwan - translation',
      description: 'About the autograph session which she was invited in two days: February 9th - February 10th.',
      openGraph: {
        title: 'Autograph session of Takamatsu-sensei in Taiwan - translation',
        description: 'About the autograph session which she was invited  in two days: February 9th - February 10th.',
        type: 'article',
        publishedTime: '2025-02-26T00:00:00.000Z',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Autograph session of Takamatsu-sensei in Taiwan - translation',
        description: 'About the autograph session which she was invited on two days: February 9th - February 10th.',
      },
    },
    loader: () => import('./blogs/posts/takamatsu-taiwan-autograph/content.mdx?raw'),
  },
];

const BLOG_CONTENT_CACHE = new Map();
const BLOG_CONTENT_REQUESTS = new Map();
const BLOG_CONTENT_LOADERS = new Map(BLOG_ENTRY_DEFINITIONS.map((entry) => [entry.id, entry.loader]));

export const BLOGS = BLOG_ENTRY_DEFINITIONS.map(({ loader, ...entry }) => entry);

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
