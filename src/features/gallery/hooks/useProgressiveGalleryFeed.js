import { useEffect, useMemo, useRef, useState } from 'react';

const INITIAL_VISIBLE_COUNT = {
  mobile: 18,
  desktop: 36,
};

const LOAD_MORE_COUNT = {
  mobile: 12,
  desktop: 24,
};

const getInitialVisibleCount = (isMobile, totalCount) =>
  Math.min(totalCount, isMobile ? INITIAL_VISIBLE_COUNT.mobile : INITIAL_VISIBLE_COUNT.desktop);

const getLoadMoreStep = (isMobile) => (isMobile ? LOAD_MORE_COUNT.mobile : LOAD_MORE_COUNT.desktop);

export function useProgressiveGalleryFeed(images, isActive, isMobile) {
  const totalCount = images.length;
  const loadMoreStep = getLoadMoreStep(isMobile);
  const [visibleCount, setVisibleCount] = useState(() => getInitialVisibleCount(isMobile, totalCount));
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(getInitialVisibleCount(isMobile, totalCount));
  }, [images, isMobile, totalCount]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !isActive || visibleCount >= totalCount) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((current) => Math.min(totalCount, current + loadMoreStep));
      },
      { root: null, rootMargin: '960px 0px 960px 0px', threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isActive, loadMoreStep, totalCount, visibleCount]);

  const visibleImages = useMemo(
    () => images.slice(0, visibleCount),
    [images, visibleCount],
  );

  return {
    sentinelRef,
    visibleImages,
    visibleCount,
    totalCount,
    hasMore: visibleCount < totalCount,
    remainingCount: Math.max(0, totalCount - visibleCount),
  };
}

export default useProgressiveGalleryFeed;
