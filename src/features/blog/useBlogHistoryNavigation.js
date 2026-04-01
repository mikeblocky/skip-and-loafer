import { useCallback, useEffect, useRef } from 'react';

export const useBlogHistoryNavigation = ({ selectedBlogId, setSelectedBlogId, validBlogIds }) => {
  const blogHistoryPopRef = useRef(false);

  const handleBackToList = useCallback(() => {
    setSelectedBlogId(null);
  }, [setSelectedBlogId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onPopState = (event) => {
      const statePage = event.state?.skipApp ? event.state.page : null;
      const nextPage = statePage || window.location.hash.replace('#', '');
      if (nextPage !== 'blog') return;

      const nextBlogId = event.state?.skipApp ? event.state.blogId : null;

      if (!nextBlogId) {
        if (selectedBlogId) {
          blogHistoryPopRef.current = true;
          setSelectedBlogId(null);
        }
        return;
      }

      if (nextBlogId !== selectedBlogId && validBlogIds.has(nextBlogId)) {
        blogHistoryPopRef.current = true;
        setSelectedBlogId(nextBlogId);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [selectedBlogId, setSelectedBlogId, validBlogIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = '#blog';

    if (blogHistoryPopRef.current) {
      blogHistoryPopRef.current = false;
      return;
    }

    const currentState = window.history.state;

    if (!selectedBlogId) {
      if (currentState?.skipApp && currentState.page === 'blog' && currentState.blogId) {
        window.history.replaceState({ skipApp: true, page: 'blog' }, '', hash);
      }
      return;
    }

    if (currentState?.skipApp && currentState.page === 'blog' && currentState.blogId === selectedBlogId) {
      return;
    }

    window.history.pushState({ skipApp: true, page: 'blog', blogId: selectedBlogId }, '', hash);
  }, [selectedBlogId]);

  return { handleBackToList };
};
