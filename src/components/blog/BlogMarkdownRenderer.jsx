import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const BlogMarkdownRenderer = ({ selectedBlogId, markdownChunks, visibleChunkCount, markdownComponents }) => {
  const renderedMarkdownChunks = useMemo(() => {
    if (!selectedBlogId) return null;

    return markdownChunks.slice(0, visibleChunkCount).map((chunk, index) => (
      <ReactMarkdown
        key={`${selectedBlogId}-chunk-${index}`}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {chunk}
      </ReactMarkdown>
    ));
  }, [selectedBlogId, markdownChunks, visibleChunkCount, markdownComponents]);

  return <>{renderedMarkdownChunks}</>;
};

export default BlogMarkdownRenderer;
