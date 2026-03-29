import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { createBlogMarkdownComponents } from './blogMarkdownComponents';

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

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

  const renderedMarkdownChunks = useMemo(() => {
    if (!selectedBlogId) return null;

    return markdownChunks.slice(0, visibleChunkCount).map((chunk, index) => (
      <ReactMarkdown
        key={`${selectedBlogId}-chunk-${index}`}
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={markdownComponents}
      >
        {chunk}
      </ReactMarkdown>
    ));
  }, [selectedBlogId, markdownChunks, visibleChunkCount, markdownComponents]);

  return <>{renderedMarkdownChunks}</>;
};

export default BlogMarkdownRenderer;
