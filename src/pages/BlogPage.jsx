import { startTransition, useMemo, useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BLOGS, preloadBlogContent } from '../data/blogs';
import {
  UI_TEXT,
  ensureMetaDescriptionTag,
} from '../features/blog/blogShared';
import { useBlogHistoryNavigation } from '../features/blog/useBlogHistoryNavigation';
import usePageTitle from '../hooks/shared/usePageTitle';
import useIdlePreload from '../features/app/hooks/useIdlePreload';
import { CONTENT_SLIDE_COMPACT, TRANSITION_FAST } from '../components/shared/animationPresets';
import {
  getPageRootStyle,
  getScrollablePaneStyle,
} from '../features/blog/blogStyles';
import BlogListView from '../features/blog/BlogListView';
import BlogPageHeader from '../features/blog/BlogPageHeader';
import BlogReaderFallback from '../features/blog/BlogReaderFallback';

const loadBlogReaderPane = () => import('../features/blog/BlogReaderPane');
const BlogReaderPane = lazy(loadBlogReaderPane);

const DEFAULT_READER_PREFS = {
  largeText: false,
  wideSpacing: false,
  focusWidth: false,
  theme: 'paper',
};

const BlogPage = ({ isMobile, uiLanguage = 'en' }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  usePageTitle(t.header || UI_TEXT.en.header);

  const locale = uiLanguage;
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [readerPrefs, setReaderPrefs] = useState(DEFAULT_READER_PREFS);
  const [sortOrder, setSortOrder] = useState('desc');

  const blogs = useMemo(
    () => [...BLOGS].sort((a, b) => (sortOrder === 'asc'
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime())),
    [sortOrder]
  );

  const validBlogIds = useMemo(() => new Set(blogs.map((blog) => blog.id)), [blogs]);

  const { handleBackToList } = useBlogHistoryNavigation({
    selectedBlogId,
    setSelectedBlogId,
    validBlogIds,
  });

  const handleSelectBlog = useCallback((blogId) => {
    void preloadBlogContent(blogId);
    void loadBlogReaderPane();
    startTransition(() => {
      setSelectedBlogId(blogId);
    });
  }, []);

  const handleToggleSortOrder = useCallback(() => {
    startTransition(() => {
      setSortOrder((previous) => (previous === 'desc' ? 'asc' : 'desc'));
    });
  }, []);

  useIdlePreload([loadBlogReaderPane], true, {
    delayMs: 260,
    staggerMs: 180,
    maxPreloadCount: isMobile ? 1 : 2,
  });

  useEffect(() => {
    if (selectedBlogId) {
      return undefined;
    }

    const descriptionTag = ensureMetaDescriptionTag();
    const previousDescription = descriptionTag.getAttribute('content') || '';

    descriptionTag.setAttribute('content', t.listHint || UI_TEXT.en.listHint);

    return () => {
      descriptionTag.setAttribute('content', previousDescription);
    };
  }, [selectedBlogId, t.listHint]);

  const bodyFontScale = readerPrefs.largeText ? 1.2 : 1;

  const totalPosts = blogs.length;
  const totalMinutes = blogs.reduce((sum, blog) => sum + (blog.readMinutes || 0), 0);

  return (
    <div style={getPageRootStyle(isMobile)}>
      <BlogPageHeader
        isMobile={isMobile}
        hasSelectedBlog={Boolean(selectedBlogId)}
        title={t.header}
        totalPosts={totalPosts}
        totalMinutes={totalMinutes}
        t={t}
        sortOrder={sortOrder}
        onToggleSortOrder={handleToggleSortOrder}
        sortOldToNewLabel={t.sortOldToNew || UI_TEXT.en.sortOldToNew}
        sortNewToOldLabel={t.sortNewToOld || UI_TEXT.en.sortNewToOld}
      />

      <AnimatePresence mode="wait">
        {!selectedBlogId ? (
          <motion.div
            key="blog-list"
            initial={CONTENT_SLIDE_COMPACT.initial}
            animate={CONTENT_SLIDE_COMPACT.animate}
            exit={CONTENT_SLIDE_COMPACT.exit}
            transition={TRANSITION_FAST}
            className="hide-scrollbar"
            style={getScrollablePaneStyle(isMobile)}
          >
            <BlogListView
              blogs={blogs}
              isMobile={isMobile}
              t={t}
              locale={locale}
              bodyFontScale={bodyFontScale}
              readerPrefs={readerPrefs}
              sortOrder={sortOrder}
              onSelectBlog={handleSelectBlog}
            />
          </motion.div>
        ) : (
          <motion.div
            key="blog-detail"
            initial={CONTENT_SLIDE_COMPACT.initial}
            animate={CONTENT_SLIDE_COMPACT.animate}
            exit={CONTENT_SLIDE_COMPACT.exit}
            transition={TRANSITION_FAST}
            className="hide-scrollbar"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'visible', minHeight: 0 }}
          >
            <Suspense fallback={<BlogReaderFallback isMobile={isMobile} label={t.openingReader || UI_TEXT.en.openingReader} />}>
              <BlogReaderPane
                blogs={blogs}
                isMobile={isMobile}
                uiLanguage={uiLanguage}
                selectedBlogId={selectedBlogId}
                handleBackToList={handleBackToList}
                readerPrefs={readerPrefs}
                setReaderPrefs={setReaderPrefs}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPage;
