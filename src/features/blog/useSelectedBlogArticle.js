import { useEffect, useMemo, useState } from 'react';
import { getCachedBlogContent, loadBlogContent } from '../../data/blogs';

export const useSelectedBlogArticle = ({ blogs, selectedBlogId }) => {
  const selectedBlogMeta = useMemo(
    () => blogs.find((entry) => entry.id === selectedBlogId) || null,
    [blogs, selectedBlogId],
  );

  const [contentState, setContentState] = useState(() => ({
    blogId: selectedBlogId,
    content: getCachedBlogContent(selectedBlogId),
  }));
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (!selectedBlogMeta) {
      setContentState({ blogId: null, content: '' });
      setIsLoadingContent(false);
      return undefined;
    }

    const cachedContent = getCachedBlogContent(selectedBlogMeta.id);
    setContentState({ blogId: selectedBlogMeta.id, content: cachedContent });

    if (cachedContent) {
      setIsLoadingContent(false);
      return undefined;
    }

    let active = true;
    setIsLoadingContent(true);

    loadBlogContent(selectedBlogMeta.id)
      .then((content) => {
        if (!active) return;
        setContentState({ blogId: selectedBlogMeta.id, content });
      })
      .catch(() => {
        if (!active) return;
        setContentState({ blogId: selectedBlogMeta.id, content: '' });
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingContent(false);
      });

    return () => {
      active = false;
    };
  }, [selectedBlogMeta]);

  const selectedBlog = useMemo(() => {
    if (!selectedBlogMeta) return null;

    const content = contentState.blogId === selectedBlogMeta.id
      ? contentState.content
      : '';

    return {
      ...selectedBlogMeta,
      content,
    };
  }, [contentState, selectedBlogMeta]);

  return {
    selectedBlog,
    isLoadingContent,
  };
};

export default useSelectedBlogArticle;
