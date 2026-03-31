import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, ChevronLeft } from 'lucide-react';
import {
  BLOG_META_DOT_STYLE,
  getBackToListButtonStyle,
  getDetailMetaStyle,
  getLoadMoreStyle,
  getReaderContentWrapStyle,
  getReaderDescriptionStyle,
  getReaderHeadingStyle,
  getReaderPanelStyle,
  getReaderScrollStyle,
} from './blogStyles';
import { formatDate, formatReadMinutes, getReadMinutes } from './blogShared';

const BlogDetailView = ({
  isMobile,
  t,
  locale,
  selectedBlog,
  handleBackToList,
  readerTheme,
  headingFontScale,
  bodyFontScale,
  paragraphLineHeight,
  readerPrefs,
  readScrollRef,
  renderedMarkdownChunks,
  markdownChunksLength,
  visibleChunkCount,
  loadMoreRef,
}) => (
  <>
    <div
      className="sketchbook-border"
      style={{
        display: 'grid',
        gap: '14px',
        background: '#fff7ed',
        border: '3px solid #fdba74',
        borderBottom: '8px solid #f97316',
        borderRadius: '26px',
        padding: isMobile ? '16px 16px 18px' : '20px 22px 22px',
        boxShadow: '0 12px 24px rgba(249, 115, 22, 0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -2, rotate: -2 }}
          whileTap={{ scale: 0.85, y: 8, rotate: 2 }}
          onClick={handleBackToList}
          style={getBackToListButtonStyle(isMobile)}
        >
          <ChevronLeft size={16} strokeWidth={3} /> {t.backToList}
        </motion.button>

        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: '4px' }}>
          <span style={getDetailMetaStyle(isMobile)}>
            <CalendarDays size={14} strokeWidth={3} /> {formatDate(selectedBlog.date, locale)}
            <span style={BLOG_META_DOT_STYLE}>•</span>
            <BookOpen size={14} strokeWidth={3} /> {formatReadMinutes(getReadMinutes(selectedBlog.content), t)}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        <h3 style={getReaderHeadingStyle(readerTheme, headingFontScale, isMobile)}>
          {selectedBlog.title}
        </h3>
        {(selectedBlog.metadata?.description || selectedBlog.description) && (
          <p style={getReaderDescriptionStyle(readerTheme, bodyFontScale, paragraphLineHeight, isMobile)}>
            {selectedBlog.metadata?.description || selectedBlog.description}
          </p>
        )}
      </div>
    </div>

    <div style={getReaderPanelStyle(readerTheme, isMobile)}>
      <div ref={readScrollRef} className="hide-scrollbar" style={getReaderScrollStyle(readerTheme)}>
        <div style={getReaderContentWrapStyle(readerPrefs.focusWidth)}>
          {renderedMarkdownChunks}
          {markdownChunksLength > visibleChunkCount && (
            <div
              ref={loadMoreRef}
              style={getLoadMoreStyle(isMobile, readerTheme)}
            >
              Loading more...
            </div>
          )}
        </div>
      </div>
    </div>
  </>
);

export default BlogDetailView;
