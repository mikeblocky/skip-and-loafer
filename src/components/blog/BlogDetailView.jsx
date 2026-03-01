import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, ChevronLeft } from 'lucide-react';
import { TAP_SCALE_DEFAULT } from '../shared/animationPresets';
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
import { formatDate, getReadMinutes } from './blogShared';

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
          {markdownChunksLength > visibleChunkCount && (
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
  </>
);

export default BlogDetailView;
