import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Newspaper, ChevronLeft, CalendarDays, BookOpen, ALargeSmall, Space, Focus, Sun, Moon, FileText as FileTextIcon, ChevronUp } from 'lucide-react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { BLOGS } from '../data/blogs';
import ImageLightbox from './shared/ImageLightbox';
import {
  UI_TEXT,
  NOTE_PALETTES,
  formatDate,
  getReadMinutes,
  getPreview,
  ensureMetaDescriptionTag,
  readBlogReaderState,
  writeBlogReaderState,
  chunkMarkdownContent,
} from './blog/blogShared';
import { getReaderTheme } from './blog/blogReaderTheme';
import { createBlogMarkdownComponents } from './blog/blogMarkdownComponents';
import { useBlogHistoryNavigation } from './blog/useBlogHistoryNavigation';
import { useBlogReaderBehavior } from './blog/useBlogReaderBehavior';
import { CONTENT_SLIDE_COMPACT, TRANSITION_FAST, TAP_SCALE_DEFAULT, TAP_SCALE_SOFT } from './shared/animationPresets';
import {
  getBlogListItemInitial,
  BLOG_LIST_ITEM_ANIMATE,
  getBlogListItemTransition,
} from './blog/blogAnimations';
import {
  getPageRootStyle,
  getHeaderRowStyle,
  getHeaderTitleWrapStyle,
  getHeaderTitleStyle,
  getSortButtonStyle,
  getScrollablePaneStyle,
  EMPTY_BLOGS_STYLE,
  getBlogCardStyle,
  BLOG_CARD_TITLE_STYLE,
  getBlogMetaStyle,
  BLOG_META_DOT_STYLE,
  getReadPostButtonStyle,
  getBackToListButtonStyle,
  getDetailMetaStyle,
  getReaderPanelStyle,
  getReaderHeadingStyle,
  getReaderDescriptionStyle,
  getReaderScrollStyle,
  getReaderContentWrapStyle,
  getLoadMoreStyle,
  PROGRESS_TRACK_STYLE,
  PROGRESS_FILL_STYLE,
  getBackFabStyle,
  getTopFabStyle,
} from './blog/blogStyles';
import ReaderControls from './blog/ReaderControls';

const BlogPage = ({ isMobile, uiLanguage = 'en' }) => {
  const CHUNK_STEP = isMobile ? 5 : 4;
  const initialReaderState = readBlogReaderState();
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const locale = uiLanguage === 'vi' ? 'vi-VN' : uiLanguage;
  const [selectedBlogId, setSelectedBlogId] = useState(initialReaderState?.blogId || null);
  const hasHydratedSelectionRef = useRef(false);
  const previousSelectedBlogIdRef = useRef(initialReaderState?.blogId || null);
  const [readerPrefs, setReaderPrefs] = useState({
    largeText: false,
    wideSpacing: false,
    focusWidth: false,
    theme: 'paper',
  });
  const progressTarget = useMotionValue(0);
  const progressSpring = useSpring(progressTarget, { stiffness: 170, damping: 30, mass: 0.4 });
  const [activeImageSrc, setActiveImageSrc] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  const blogs = useMemo(
    () => [...BLOGS].sort((a, b) => (sortOrder === 'asc'
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime())),
    [sortOrder]
  );

  const selectedBlog = useMemo(
    () => blogs.find((entry) => entry.id === selectedBlogId) || null,
    [blogs, selectedBlogId]
  );

  const validBlogIds = useMemo(() => new Set(blogs.map((blog) => blog.id)), [blogs]);

  const { handleBackToList } = useBlogHistoryNavigation({
    selectedBlogId,
    setSelectedBlogId,
    validBlogIds,
  });

  const markdownChunks = useMemo(
    () => chunkMarkdownContent(selectedBlog?.content || '', isMobile ? 2200 : 2800),
    [selectedBlog?.content, isMobile]
  );

  const blogImageSources = useMemo(() => {
    if (!selectedBlog?.content) return [];
    const found = [];
    const seen = new Set();

    const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let markdownMatch;
    while ((markdownMatch = markdownImageRegex.exec(selectedBlog.content)) !== null) {
      const raw = (markdownMatch[1] || '').trim();
      const src = raw.split(/\s+/)[0]?.replace(/^<|>$/g, '');
      if (!src || seen.has(src)) continue;
      seen.add(src);
      found.push(src);
    }

    const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let htmlMatch;
    while ((htmlMatch = htmlImageRegex.exec(selectedBlog.content)) !== null) {
      const src = (htmlMatch[1] || '').trim();
      if (!src || seen.has(src)) continue;
      seen.add(src);
      found.push(src);
    }

    return found;
  }, [selectedBlog?.content]);

  const closeImageViewer = useCallback(() => setActiveImageSrc(null), []);

  const openImageBySrc = useCallback((src) => {
    if (blogImageSources.includes(src)) setActiveImageSrc(src);
  }, [blogImageSources]);

  const navigateImage = useCallback((src) => {
    if (!src) return;
    setActiveImageSrc(src);
  }, []);

  const {
    listScrollRef,
    readScrollRef,
    staticControlsRef,
    loadMoreRef,
    showFloatingControls,
    showBackToTop,
    visibleChunkCount,
    scrollActivePaneToTop,
  } = useBlogReaderBehavior({
    isMobile,
    selectedBlog,
    selectedBlogId,
    markdownChunksLength: markdownChunks.length,
    chunkStep: CHUNK_STEP,
    progressTarget,
    activeImageSrc,
    handleBackToList,
  });

  useEffect(() => {
    if (!hasHydratedSelectionRef.current) {
      hasHydratedSelectionRef.current = true;
      previousSelectedBlogIdRef.current = selectedBlogId;
      return;
    }

    if (previousSelectedBlogIdRef.current === selectedBlogId) return;
    previousSelectedBlogIdRef.current = selectedBlogId;

    writeBlogReaderState({
      blogId: selectedBlogId,
      scrollTop: 0,
      progress: 0,
    });
  }, [selectedBlogId]);

  useEffect(() => {
    setActiveImageSrc(null);
  }, [selectedBlogId]);

  const readerTheme = useMemo(() => getReaderTheme(readerPrefs.theme), [readerPrefs.theme]);

  const defaultReadingScale = selectedBlog ? 1.24 : 1;
  const bodyFontScale = defaultReadingScale * (readerPrefs.largeText ? 1.2 : 1);
  const headingFontScale = (selectedBlog ? 1.18 : 1) * (readerPrefs.largeText ? 1.12 : 1);
  const paragraphLineHeight = readerPrefs.wideSpacing ? 1.75 : 1.5;
  const listLineHeight = readerPrefs.wideSpacing ? 1.65 : 1.45;

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = ensureMetaDescriptionTag();
    const previousDescription = descriptionTag.getAttribute('content') || '';

    if (selectedBlog?.metadata?.title) {
      document.title = selectedBlog.metadata.title;
    } else if (selectedBlog?.title) {
      document.title = `${selectedBlog.title} | skip-and-loafer`;
    } else {
      document.title = 'Blog | skip-and-loafer';
    }

    const nextDescription = selectedBlog?.metadata?.description || selectedBlog?.description || 'Read the latest blogs and transcripts.';
    descriptionTag.setAttribute('content', nextDescription);

    return () => {
      document.title = previousTitle;
      descriptionTag.setAttribute('content', previousDescription);
    };
  }, [selectedBlog]);


  const markdownComponents = useMemo(() => createBlogMarkdownComponents({
    isMobile,
    readerTheme,
    bodyFontScale,
    headingFontScale,
    paragraphLineHeight,
    listLineHeight,
    openImageBySrc,
  }), [isMobile, readerTheme, bodyFontScale, headingFontScale, paragraphLineHeight, listLineHeight, openImageBySrc]);

  const TOGGLE_CONTROLS = [
    { key: 'largeText', label: t.largeTextMode || UI_TEXT.en.largeTextMode, Icon: ALargeSmall },
    { key: 'wideSpacing', label: t.widerSpacingMode || UI_TEXT.en.widerSpacingMode, Icon: Space },
    { key: 'focusWidth', label: t.focusWidthMode || UI_TEXT.en.focusWidthMode, Icon: Focus },
  ];

  const THEME_CONTROLS = [
    { key: 'paper', label: t.themePaper || UI_TEXT.en.themePaper, Icon: FileTextIcon },
    { key: 'sepia', label: t.themeSepia || UI_TEXT.en.themeSepia, Icon: Sun },
    { key: 'night', label: t.themeNight || UI_TEXT.en.themeNight, Icon: Moon },
  ];

  const renderedMarkdownChunks = useMemo(() => {
    if (!selectedBlog) return null;
    return markdownChunks.slice(0, visibleChunkCount).map((chunk, index) => (
      <ReactMarkdown
        key={`${selectedBlog.id}-chunk-${index}`}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {chunk}
      </ReactMarkdown>
    ));
  }, [selectedBlog, markdownChunks, visibleChunkCount, markdownComponents]);

  const showFloatingFabStack = showFloatingControls || showBackToTop;

  return (
    <div style={getPageRootStyle(isMobile)}>
      <div style={getHeaderRowStyle(isMobile)}>
        <div style={getHeaderTitleWrapStyle(isMobile)}>
          <Newspaper size={isMobile ? 24 : 22} style={{ color: '#f97316' }} />
          <span style={getHeaderTitleStyle(isMobile)}>{t.header}</span>
        </div>
        {!selectedBlog && (
          <motion.button
            whileTap={TAP_SCALE_SOFT}
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            style={getSortButtonStyle(isMobile)}
          >
            {sortOrder === 'asc'
              ? (t.sortOldToNew || UI_TEXT.en.sortOldToNew)
              : (t.sortNewToOld || UI_TEXT.en.sortNewToOld)}
          </motion.button>
        )}
      </div>

      <div ref={staticControlsRef}>
        <ReaderControls
          floating={false}
          isMobile={isMobile}
          showFloatingControls={showFloatingControls}
          readerPrefs={readerPrefs}
          setReaderPrefs={setReaderPrefs}
          toggleControls={TOGGLE_CONTROLS}
          themeControls={THEME_CONTROLS}
          label={t.readerControls || UI_TEXT.en.readerControls}
        />
      </div>

      <AnimatePresence mode="wait">
        {!selectedBlog ? (
          <motion.div
            key="blog-list"
            initial={CONTENT_SLIDE_COMPACT.initial}
            animate={CONTENT_SLIDE_COMPACT.animate}
            exit={CONTENT_SLIDE_COMPACT.exit}
            transition={TRANSITION_FAST}
            className="hide-scrollbar"
            ref={listScrollRef}
            style={getScrollablePaneStyle(isMobile)}
          >
            {blogs.length === 0 && (
              <div style={EMPTY_BLOGS_STYLE}>
                {t.noBlogs}
              </div>
            )}

            {blogs.map((blog, index) => {
              const note = NOTE_PALETTES[index % NOTE_PALETTES.length];
              const preview = blog.description || getPreview(blog.content);
              const readMinutes = getReadMinutes(blog.content);

              return (
                <motion.div
                  key={blog.id}
                  initial={getBlogListItemInitial(index)}
                  animate={BLOG_LIST_ITEM_ANIMATE}
                  transition={getBlogListItemTransition(index)}
                  style={getBlogCardStyle(note, isMobile)}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px', marginBottom: '6px' }}>
                      <span style={{ ...BLOG_CARD_TITLE_STYLE, fontSize: isMobile ? '0.95rem' : '1rem' }}>{blog.title}</span>
                      <span style={getBlogMetaStyle(note, isMobile)}>
                        <CalendarDays size={12} /> {formatDate(blog.date, locale)}
                        <span style={BLOG_META_DOT_STYLE}>•</span>
                        <BookOpen size={12} /> {readMinutes} {t.minutesRead}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#4b5563', fontFamily: 'var(--font-hand)', fontSize: isMobile ? `${0.78 * bodyFontScale}rem` : `${0.84 * bodyFontScale}rem`, lineHeight: readerPrefs.wideSpacing ? 1.55 : 1.35 }}>
                      {preview || t.empty}
                    </p>
                  </div>

                  <motion.button
                    whileTap={TAP_SCALE_DEFAULT}
                    onClick={() => setSelectedBlogId(blog.id)}
                    style={getReadPostButtonStyle(note, isMobile)}
                  >
                    {t.readPost}
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="blog-detail"
            initial={CONTENT_SLIDE_COMPACT.initial}
            animate={CONTENT_SLIDE_COMPACT.animate}
            exit={CONTENT_SLIDE_COMPACT.exit}
            transition={TRANSITION_FAST}
            className="hide-scrollbar"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden', minHeight: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <motion.button
                whileTap={TAP_SCALE_DEFAULT}
                onClick={handleBackToList}
                style={getBackToListButtonStyle(isMobile)}
              >
                <ChevronLeft size={14} /> {t.backToList}
              </motion.button>
              <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: '4px' }}>
                <span style={getDetailMetaStyle(isMobile)}>
                  <CalendarDays size={12} /> {formatDate(selectedBlog.date, locale)}
                  <span style={BLOG_META_DOT_STYLE}>•</span>
                  <BookOpen size={12} /> {getReadMinutes(selectedBlog.content)} {t.minutesRead}
                </span>
              </div>
            </div>

            <div style={getReaderPanelStyle(readerTheme, isMobile)}>
              <h3 style={getReaderHeadingStyle(readerTheme, headingFontScale, isMobile)}>
                {selectedBlog.title}
              </h3>
              {(selectedBlog.metadata?.description || selectedBlog.description) && (
                <p style={getReaderDescriptionStyle(readerTheme, bodyFontScale, paragraphLineHeight, isMobile)}>
                  {selectedBlog.metadata?.description || selectedBlog.description}
                </p>
              )}
              <div ref={readScrollRef} className="hide-scrollbar" style={getReaderScrollStyle(readerTheme)}>
                <div style={getReaderContentWrapStyle(readerPrefs.focusWidth)}>
                  {renderedMarkdownChunks}
                  {markdownChunks.length > visibleChunkCount && (
                    <div
                      ref={loadMoreRef}
                      style={getLoadMoreStyle(isMobile, readerTheme)}
                    >
                      Loading more…
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fixed progress bar at very top of viewport ── */}
      {selectedBlog && createPortal(
        <div style={PROGRESS_TRACK_STYLE}>
          <motion.div
            style={{ ...PROGRESS_FILL_STYLE, scaleX: progressSpring }}
          />
        </div>
      , document.body)}

      {/* ── Back-to-top button ── */}
      {showBackToTop && createPortal(
        <>
          {selectedBlog && (
            <button
              onClick={handleBackToList}
              style={getBackFabStyle(isMobile, showFloatingFabStack)}
            >
              <ChevronLeft size={isMobile ? 16 : 18} /> {t.backToList}
            </button>
          )}

          <button
            onClick={scrollActivePaneToTop}
            style={getTopFabStyle(isMobile, showFloatingFabStack)}
          >
            <ChevronUp size={isMobile ? 18 : 20} /> Top
          </button>
        </>
      , document.body)}

      <AnimatePresence>
        {activeImageSrc && (
          <ImageLightbox
            src={activeImageSrc}
            images={blogImageSources}
            onClose={closeImageViewer}
            onNavigate={navigateImage}
            isMobile={isMobile}
            altText="Blog artwork"
          />
        )}
      </AnimatePresence>

      {selectedBlog && createPortal(
        <ReaderControls
          floating
          isMobile={isMobile}
          showFloatingControls={showFloatingControls}
          readerPrefs={readerPrefs}
          setReaderPrefs={setReaderPrefs}
          toggleControls={TOGGLE_CONTROLS}
          themeControls={THEME_CONTROLS}
          label={t.readerControls || UI_TEXT.en.readerControls}
        />,
        document.body
      )}
    </div>
  );
};

export default BlogPage;
