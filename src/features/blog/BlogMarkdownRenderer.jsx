import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createBlogMarkdownComponents } from './blogMarkdownComponents';

const REMARK_PLUGINS = [remarkGfm];

const BlogMarkdownRenderer = ({
  selectedBlogId,
  markdownChunks,
  visibleChunkCount,
  isMobile,
  readerTheme,
  bodyFontScale,
  headingFontScale,
  paragraphLineHeight,
  listLineHeight,
  openImageBySrc,
}) => {
  const markdownComponents = useMemo(
    () => createBlogMarkdownComponents({
      isMobile,
      readerTheme,
      bodyFontScale,
      headingFontScale,
      paragraphLineHeight,
      listLineHeight,
      openImageBySrc,
    }),
    [
      isMobile,
      readerTheme,
      bodyFontScale,
      headingFontScale,
      paragraphLineHeight,
      listLineHeight,
      openImageBySrc,
    ]
  );

  const allRenderedMarkdownChunks = useMemo(() => {
    if (!selectedBlogId) return null;

    return markdownChunks.map((chunk, index) => (
      <ReactMarkdown
        key={`${selectedBlogId}-chunk-${index}`}
        remarkPlugins={REMARK_PLUGINS}
        components={markdownComponents}
      >
        {chunk}
      </ReactMarkdown>
    ));
  }, [selectedBlogId, markdownChunks, markdownComponents]);

  const renderedMarkdownChunks = useMemo(
    () => allRenderedMarkdownChunks?.slice(0, visibleChunkCount) || null,
    [allRenderedMarkdownChunks, visibleChunkCount],
  );

  return <>{renderedMarkdownChunks}</>;
};

export default memo(BlogMarkdownRenderer);
