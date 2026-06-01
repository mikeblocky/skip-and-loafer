import { useMemo, useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { ChevronLeft, ALargeSmall, Space, Focus, Sun, Moon, FileText as FileTextIcon, ChevronUp } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
  UI_TEXT,
  ensureMetaDescriptionTag,
  writeBlogReaderState,
  chunkMarkdownContent,
} from './blogShared';
import { getReaderTheme } from './blogReaderTheme';
import { useBlogReaderBehavior } from './useBlogReaderBehavior';
import useIdlePreload from '../app/hooks/useIdlePreload';
import {
  PROGRESS_TRACK_STYLE,
  PROGRESS_FILL_STYLE,
  getBackFabStyle,
  getTopFabStyle,
} from './blogStyles';
import BlogReaderFallback from './BlogReaderFallback';
import { useSelectedBlogArticle } from './useSelectedBlogArticle';

const loadBlogMarkdownRenderer = () => import('./BlogMarkdownRenderer');
const loadBlogDetailView = () => import('./BlogDetailView');
const loadReaderControls = () => import('./ReaderControls');
const loadImageLightbox = () => import('../../components/shared/ImageLightbox');

const BlogMarkdownRenderer = lazy(loadBlogMarkdownRenderer);
const BlogDetailView = lazy(loadBlogDetailView);
const ReaderControls = lazy(loadReaderControls);
const ImageLightbox = lazy(loadImageLightbox);

const BlogReaderPane = ({
  blogs,
  isMobile,
  uiLanguage = 'en',
  selectedBlogId,
  handleBackToList,
  readerPrefs,
  setReaderPrefs,
}) => {
  const CHUNK_STEP = isMobile ? 5 : 4;
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const locale = uiLanguage;
  const hasHydratedSelectionRef = useRef(false);
  const previousSelectedBlogIdRef = useRef(selectedBlogId);
  const progressTarget = useMotionValue(0);
  const progressSpring = useSpring(progressTarget, { stiffness: 170, damping: 30, mass: 0.4 });
  const [activeImageSrc, setActiveImageSrc] = useState(null);
  const readerPreloaders = useMemo(() => [loadReaderControls, loadBlogDetailView], []);

  const {
    selectedBlog,
    isLoadingContent,
  } = useSelectedBlogArticle({
    blogs,
    selectedBlogId,
  });

  const activeReaderPreloaders = useMemo(
    () => (selectedBlog ? [loadBlogMarkdownRenderer, loadImageLightbox] : []),
    [selectedBlog],
  );

  const markdownChunks = useMemo(
    () => chunkMarkdownContent(selectedBlog?.content || '', isMobile ? 2200 : 2800),
    [selectedBlog?.content, isMobile],
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

  const navigateImage = useCallback((src) => {
    if (!src) return;
    setActiveImageSrc(src);
  }, []);

  const openImageBySrc = useCallback((src) => {
    if (blogImageSources.includes(src)) setActiveImageSrc(src);
  }, [blogImageSources]);

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
  const toggleControls = useMemo(() => ([
    { key: 'largeText', label: t.largeTextMode || UI_TEXT.en.largeTextMode, Icon: ALargeSmall },
    { key: 'wideSpacing', label: t.widerSpacingMode || UI_TEXT.en.widerSpacingMode, Icon: Space },
    { key: 'focusWidth', label: t.focusWidthMode || UI_TEXT.en.focusWidthMode, Icon: Focus },
  ]), [t.focusWidthMode, t.largeTextMode, t.widerSpacingMode]);
  const themeControls = useMemo(() => ([
    { key: 'paper', label: t.themePaper || UI_TEXT.en.themePaper, Icon: FileTextIcon },
    { key: 'sepia', label: t.themeSepia || UI_TEXT.en.themeSepia, Icon: Sun },
    { key: 'night', label: t.themeNight || UI_TEXT.en.themeNight, Icon: Moon },
  ]), [t.themeNight, t.themePaper, t.themeSepia]);

  useIdlePreload(readerPreloaders, true, {
    delayMs: 120,
    staggerMs: 120,
    maxPreloadCount: isMobile ? 1 : 2,
  });
  useIdlePreload(activeReaderPreloaders, Boolean(selectedBlog), {
    delayMs: 60,
    staggerMs: 120,
    maxPreloadCount: isMobile ? 1 : 2,
  });

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

  const showFloatingFabStack = showFloatingControls || showBackToTop;
  const renderedMarkdownChunks = selectedBlog?.content ? (
    <Suspense fallback={<BlogReaderFallback isMobile={isMobile} label={t.openingReader || 'Opening article...'} />}>
      <BlogMarkdownRenderer
        selectedBlogId={selectedBlog?.id || null}
        markdownChunks={markdownChunks}
        visibleChunkCount={visibleChunkCount}
        isMobile={isMobile}
        readerTheme={readerTheme}
        bodyFontScale={bodyFontScale}
        headingFontScale={headingFontScale}
        paragraphLineHeight={paragraphLineHeight}
        listLineHeight={listLineHeight}
        openImageBySrc={openImageBySrc}
      />
    </Suspense>
  ) : (
    <BlogReaderFallback
      isMobile={isMobile}
      label={isLoadingContent
        ? (t.openingReader || 'Opening article...')
        : (t.empty || UI_TEXT.en.empty)}
    />
  );

  if (!selectedBlog) {
    return <BlogReaderFallback isMobile={isMobile} label={t.empty || UI_TEXT.en.empty} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: isMobile ? 'none' : 1, minHeight: 0, gap: '10px', boxSizing: 'border-box' }}>
      <Suspense fallback={<BlogReaderFallback isMobile={isMobile} label={t.readerControls || UI_TEXT.en.readerControls} />}>
        <BlogDetailView
          isMobile={isMobile}
          t={t}
          locale={locale}
          selectedBlog={selectedBlog}
          handleBackToList={handleBackToList}
          readerTheme={readerTheme}
          headingFontScale={headingFontScale}
          bodyFontScale={bodyFontScale}
          paragraphLineHeight={paragraphLineHeight}
          readerPrefs={readerPrefs}
          readScrollRef={readScrollRef}
          renderedMarkdownChunks={renderedMarkdownChunks}
          markdownChunksLength={markdownChunks.length}
          visibleChunkCount={visibleChunkCount}
          loadMoreRef={loadMoreRef}
        />
      </Suspense>

      {selectedBlog && createPortal(
        <div style={PROGRESS_TRACK_STYLE}>
          <motion.div
            style={{ ...PROGRESS_FILL_STYLE, scaleX: progressSpring }}
          />
        </div>,
        document.body,
      )}

      {showBackToTop && createPortal(
        <>
          {selectedBlog && isMobile && (
            <button
              onClick={handleBackToList}
              style={getBackFabStyle(isMobile, showFloatingFabStack)}
            >
              <ChevronLeft size={isMobile ? 18 : 18} /> {!isMobile && t.backToList}
            </button>
          )}

          <button
            onClick={scrollActivePaneToTop}
            style={getTopFabStyle(isMobile, showFloatingFabStack)}
          >
            <ChevronUp size={isMobile ? 20 : 20} /> {!isMobile && (t.returnToTop || UI_TEXT.en.returnToTop)}
          </button>
        </>,
        document.body,
      )}

      <AnimatePresence>
        {activeImageSrc && (
          <Suspense fallback={null}>
            <ImageLightbox
              src={activeImageSrc}
              images={blogImageSources}
              onClose={closeImageViewer}
              onNavigate={navigateImage}
              isMobile={isMobile}
              altText="Blog artwork"
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogReaderPane;
