import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronUp, ArrowUp, CornerDownLeft } from 'lucide-react';
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
  scrollToTop,
  renderedMarkdownChunks,
  markdownChunksLength,
  visibleChunkCount,
  loadMoreRef,
}) => {
  const [titleExpanded, setTitleExpanded] = useState(false);
  const shouldClampTitle = selectedBlog.title.length > (isMobile ? 72 : 96);

  return (
  <div style={{ display: 'flex', flexDirection: 'column', flex: isMobile ? 'none' : 1, minHeight: 0, gap: '12px', boxSizing: 'border-box' }}>
    <div
      className="sketchbook-border"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#fff7ed',
        border: '2.5px solid #fdba74',
        borderBottom: '4px solid #f97316',
        borderRadius: '16px',
        padding: isMobile ? '6px 10px' : '8px 12px',
        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.04)',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <motion.button
        whileHover={{ scale: 1.05, y: -2, rotate: -2 }}
        whileTap={{ scale: 0.85, y: 8, rotate: 2 }}
        onClick={handleBackToList}
        title={t.backToList}
        style={{
          ...getBackToListButtonStyle(isMobile),
          padding: '6px 10px',
          borderRadius: '10px',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={16} strokeWidth={3.5} />
      </motion.button>

      <h3
        title={shouldClampTitle && !titleExpanded ? selectedBlog.title : undefined}
        style={{
          ...getReaderHeadingStyle(readerTheme, headingFontScale, isMobile),
          margin: 0,
          flex: 1,
          lineHeight: 1.25,
          display: shouldClampTitle && !titleExpanded ? '-webkit-box' : 'block',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: shouldClampTitle && !titleExpanded ? (isMobile ? 2 : 1) : 'unset',
          overflow: shouldClampTitle && !titleExpanded ? 'hidden' : 'visible',
          wordBreak: 'break-word',
        }}
      >
        {selectedBlog.title}
      </h3>

      {shouldClampTitle && (
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.94, y: 3 }}
          onClick={() => setTitleExpanded((expanded) => !expanded)}
          title={titleExpanded ? 'Collapse title' : 'Expand title'}
          aria-label={titleExpanded ? 'Collapse blog title' : 'Expand blog title'}
          aria-expanded={titleExpanded}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? 34 : 38,
            height: isMobile ? 34 : 38,
            flexShrink: 0,
            border: '2.5px solid #fed7aa',
            borderBottom: '5px solid #fb923c',
            borderRadius: '10px',
            background: '#ffffff',
            color: readerTheme.title || readerTheme.heading,
            cursor: 'pointer',
          }}
        >
          {titleExpanded ? <ChevronUp size={16} strokeWidth={3.2} /> : <ChevronDown size={16} strokeWidth={3.2} />}
        </motion.button>
      )}
    </div>

    <div style={getReaderPanelStyle(readerTheme, isMobile)}>
      <div ref={readScrollRef} className="hide-scrollbar" style={getReaderScrollStyle(readerTheme, isMobile)}>
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

          {visibleChunkCount >= markdownChunksLength && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '2.5px dashed rgba(0,0,0,0.08)',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToTop}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '2px solid #93c5fd',
                  borderBottom: '4px solid #3b82f6',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  fontSize: '0.86rem',
                  color: '#1d4ed8',
                  fontFamily: 'var(--font-paper)',
                  cursor: 'pointer',
                }}
              >
                <ArrowUp size={14} strokeWidth={3} />
                Go to top
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToList}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '2px solid #fca5a5',
                  borderBottom: '4px solid #ef4444',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  fontSize: '0.86rem',
                  color: '#b91c1c',
                  fontFamily: 'var(--font-paper)',
                  cursor: 'pointer',
                }}
              >
                <CornerDownLeft size={14} strokeWidth={3} />
                Return to list
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default BlogDetailView;
